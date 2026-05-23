// src/screens/RekapScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionHeader, Badge, Chip, Button, EmptyState } from '../components/UI';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TX_CATEGORIES } from '../utils/theme';
import { getAllTransactions, getAllItems, Transaction } from '../utils/database';
import { formatRupiah, formatDateShort } from '../utils/format';
import { exportToExcel } from '../utils/exportExcel';

type Period = 'month' | 'all';

export default function RekapScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems]   = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting]   = useState(false);

  const loadData = useCallback(async () => {
    const [txs, its] = await Promise.all([getAllTransactions(), getAllItems()]);
    setTransactions(txs);
    setItems(its);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  // Filter by period
  const now = new Date();
  const filtered = period === 'month'
    ? transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
    : transactions;

  const income  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net     = income - expense;

  // Category breakdown
  const catTotals: Record<string, number> = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
  });
  const catEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxCatVal  = Math.max(...catEntries.map(([, v]) => v), 1);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel(transactions, items);
    } catch (e) {
      Alert.alert('Export Gagal', 'Tidak dapat mengekspor file. Pastikan aplikasi memiliki izin yang diperlukan.');
    }
    setExporting(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyanSoft} />}
    >
      {/* Period Filter */}
      <View style={styles.filterRow}>
        <Chip label="Bulan Ini" active={period === 'month'} onPress={() => setPeriod('month')} />
        <Chip label="Semua Waktu" active={period === 'all'} onPress={() => setPeriod('all')} />
      </View>

      {/* Export Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting} activeOpacity={0.85}>
          <Ionicons name="download-outline" size={18} color="#000" />
          <Text style={styles.exportBtnText}>{exporting ? 'Mengekspor...' : 'Export ke Excel (.xlsx)'}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.section}>
        <Card accent="lime">
          <Text style={styles.cardTitle}>Ringkasan {period === 'month' ? 'Bulan Ini' : 'Semua Waktu'}</Text>
          <View style={styles.summaryGrid}>
            <View>
              <Text style={styles.summaryLabel}>💰 PEMASUKAN</Text>
              <Text style={[styles.summaryVal, { color: COLORS.lime }]}>{formatRupiah(income)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>💸 PENGELUARAN</Text>
              <Text style={[styles.summaryVal, { color: COLORS.magentaSoft }]}>{formatRupiah(expense)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>SALDO BERSIH</Text>
            <Text style={[styles.netVal, { color: net >= 0 ? COLORS.lime : COLORS.magentaSoft }]}>
              {formatRupiah(net, true)}
            </Text>
          </View>
        </Card>
      </View>

      {/* Income vs Expense Bar */}
      <View style={styles.section}>
        <Card>
          <Text style={[styles.cardTitle, { marginBottom: SPACING.md }]}>Perbandingan</Text>
          {income > 0 || expense > 0 ? (
            <>
              <RatioBar label="Pemasukan" value={income} total={income + expense} color={COLORS.lime} />
              <RatioBar label="Pengeluaran" value={expense} total={income + expense} color={COLORS.magentaSoft} />
              {expense > 0 && income > 0 && (
                <View style={styles.savingsRow}>
                  <Text style={styles.savingsLabel}>Rasio Tabungan</Text>
                  <Text style={[styles.savingsVal, { color: net >= 0 ? COLORS.lime : COLORS.danger }]}>
                    {income > 0 ? Math.round((net / income) * 100) : 0}%
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={{ color: COLORS.muted, fontSize: 13, textAlign: 'center', paddingVertical: 12 }}>Belum ada data</Text>
          )}
        </Card>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <SectionHeader title="Pengeluaran per Kategori" />
        <Card>
          {catEntries.length === 0
            ? <EmptyState icon="📊" title="Belum ada pengeluaran" />
            : catEntries.map(([key, value]) => {
                const cat = TX_CATEGORIES.find(c => c.id === key);
                const pct = Math.round(value / maxCatVal * 100);
                const totalPct = expense > 0 ? Math.round(value / expense * 100) : 0;
                return (
                  <View key={key} style={styles.catRow}>
                    <View style={styles.catRowHeader}>
                      <Text style={styles.catIcon}>{cat?.icon ?? '💰'}</Text>
                      <Text style={styles.catName}>{cat?.label ?? key}</Text>
                      <Text style={[styles.catTotal, { color: COLORS.magentaSoft }]}>{formatRupiah(value)}</Text>
                      <Badge label={`${totalPct}%`} color="magenta" />
                    </View>
                    <View style={styles.bar}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: cat?.color ?? '#a4899d' }]} />
                    </View>
                  </View>
                );
              })
          }
        </Card>
      </View>

      {/* Item Summary */}
      <View style={styles.section}>
        <SectionHeader title="Ringkasan Barang" />
        <Card>
          <View style={styles.itemSummaryRow}>
            <View style={styles.itemSummaryCell}>
              <Text style={styles.summaryLabel}>TOTAL BARANG</Text>
              <Text style={[styles.summaryVal, { color: COLORS.cyanSoft }]}>{items.length}</Text>
            </View>
            <View style={styles.itemSummaryCell}>
              <Text style={styles.summaryLabel}>TOTAL STOK</Text>
              <Text style={[styles.summaryVal, { color: COLORS.cyanSoft }]}>{items.reduce((s: number, i: any) => s + i.stock, 0)}</Text>
            </View>
            <View style={styles.itemSummaryCell}>
              <Text style={styles.summaryLabel}>NILAI JUAL</Text>
              <Text style={[styles.summaryVal, { color: COLORS.lime, fontSize: 13 }]}>
                {formatRupiah(items.reduce((s: number, i: any) => s + i.price * i.stock, 0))}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Transaction List */}
      <View style={styles.section}>
        <SectionHeader title={`Transaksi (${filtered.length})`} />
        <Card>
          {filtered.length === 0
            ? <EmptyState icon="📋" title="Tidak ada transaksi" />
            : filtered.slice(0, 20).map(t => {
                const cat = TX_CATEGORIES.find(c => c.id === t.category);
                const isIncome = t.type === 'income';
                return (
                  <View key={t.id} style={styles.txRow}>
                    <Text style={{ fontSize: 18 }}>{cat?.icon ?? '💰'}</Text>
                    <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                      <Text style={styles.txName} numberOfLines={1}>{t.description}</Text>
                      <Text style={styles.txDate}>{formatDateShort(t.date)} · {cat?.label}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: isIncome ? COLORS.lime : COLORS.magentaSoft }]}>
                      {isIncome ? '+' : '-'}{formatRupiah(t.amount)}
                    </Text>
                  </View>
                );
              })
          }
          {filtered.length > 20 && (
            <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: 'center', paddingTop: SPACING.sm }}>
              +{filtered.length - 20} transaksi lainnya • Export Excel untuk data lengkap
            </Text>
          )}
        </Card>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

function RatioBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round(value / total * 100) : 0;
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ ...TYPOGRAPHY.labelMd, color: COLORS.muted }}>{label}</Text>
        <Text style={{ ...TYPOGRAPHY.labelLg, color, fontWeight: '700' }}>{pct}%</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  filterRow:   { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.lg, paddingBottom: SPACING.sm },
  section:     { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: COLORS.lime, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  exportBtnText: { ...TYPOGRAPHY.labelLg, color: '#000', fontWeight: '800' },
  cardTitle:   { ...TYPOGRAPHY.labelLg, color: COLORS.white, fontWeight: '700', marginBottom: SPACING.md },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  summaryLabel:{ ...TYPOGRAPHY.labelSm, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  summaryVal:  { ...TYPOGRAPHY.titleLg, fontWeight: '800', marginTop: 4 },
  divider:     { height: 1, backgroundColor: COLORS.cardBorder, marginBottom: SPACING.sm },
  netRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  netLabel:    { ...TYPOGRAPHY.labelSm, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  netVal:      { fontSize: 22, fontWeight: '800' },
  savingsRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  savingsLabel:{ ...TYPOGRAPHY.labelMd, color: COLORS.muted },
  savingsVal:  { ...TYPOGRAPHY.titleLg, fontWeight: '800' },
  catRow:      { marginBottom: SPACING.md },
  catRowHeader:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 6 },
  catIcon:     { fontSize: 16 },
  catName:     { ...TYPOGRAPHY.labelLg, color: COLORS.white, flex: 1 },
  catTotal:    { ...TYPOGRAPHY.labelLg, fontWeight: '700' },
  bar:         { height: 8, borderRadius: 4, backgroundColor: COLORS.navy4, overflow: 'hidden' },
  barFill:     { height: '100%', borderRadius: 4 },
  itemSummaryRow: { flexDirection: 'row' },
  itemSummaryCell:{ flex: 1, alignItems: 'center' },
  txRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  txName:      { ...TYPOGRAPHY.labelLg, color: COLORS.white },
  txDate:      { ...TYPOGRAPHY.labelSm, color: COLORS.muted, marginTop: 2 },
  txAmount:    { ...TYPOGRAPHY.labelLg, fontWeight: '700' },
});
