// src/screens/DashboardScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { Card, SectionHeader, Badge, EmptyState } from '../components/UI';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TX_CATEGORIES } from '../utils/theme';
import { getAllTransactions, getAllItems, Transaction } from '../utils/database';
import { formatRupiah, formatDateShort, getCurrentMonthLabel } from '../utils/format';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [itemCount, setItemCount]       = useState(0);
  const [refreshing, setRefreshing]     = useState(false);

  const loadData = useCallback(async () => {
    const [txs, itms] = await Promise.all([getAllTransactions(), getAllItems()]);
    setTransactions(txs);
    setItemCount(itms.length);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  // This-month stats
  const now = new Date();
  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalIncome  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;
  const recent       = transactions.slice(0, 5);

  // Pie chart data (expense by category)
  const catTotals: Record<string, number> = {};
  monthTx.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
  });
  const chartData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => {
      const cat = TX_CATEGORIES.find(c => c.id === key);
      return { name: cat?.label ?? key, population: value, color: cat?.color ?? '#a4899d', legendFontColor: COLORS.muted, legendFontSize: 11 };
    });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyanSoft} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceCardGlow} />
        <Text style={styles.balanceLabel}>SALDO BULAN INI</Text>
        <Text style={[styles.balanceAmount, { color: balance >= 0 ? COLORS.white : COLORS.magentaSoft }]}>
          {formatRupiah(balance, true)}
        </Text>
        <Text style={styles.balanceMonth}>{getCurrentMonthLabel()}</Text>

        <View style={styles.balanceRow}>
          <View style={styles.balanceMini}>
            <Text style={styles.miniLabel}>💰 Pemasukan</Text>
            <Text style={[styles.miniValue, { color: COLORS.lime }]}>{formatRupiah(totalIncome)}</Text>
          </View>
          <View style={[styles.balanceMini, { marginLeft: SPACING.sm }]}>
            <Text style={styles.miniLabel}>💸 Pengeluaran</Text>
            <Text style={[styles.miniValue, { color: COLORS.magentaSoft }]}>{formatRupiah(totalExpense)}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.statRow}>
          <Card style={[styles.statCard, { borderTopWidth: 2, borderTopColor: COLORS.cyanSoft }]}>
            <Text style={styles.statLabel}>TOTAL TRANSAKSI</Text>
            <Text style={[styles.statValue, { color: COLORS.cyanSoft }]}>{transactions.length}</Text>
          </Card>
          <Card style={[styles.statCard, { marginLeft: SPACING.sm, borderTopWidth: 2, borderTopColor: COLORS.lime }]}>
            <Text style={styles.statLabel}>TOTAL BARANG</Text>
            <Text style={[styles.statValue, { color: COLORS.lime }]}>{itemCount}</Text>
          </Card>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <SectionHeader
          title="Transaksi Terbaru"
          action="Lihat Semua →"
          onAction={() => navigation.navigate('Transaksi')}
        />
        <Card>
          {recent.length === 0
            ? <EmptyState icon="📋" title="Belum ada transaksi" subtitle="Tap + untuk menambah" />
            : recent.map(t => <TxRow key={t.id} tx={t} />)
          }
        </Card>
      </View>

      {/* Category Pie Chart */}
      {chartData.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Pengeluaran per Kategori" />
          <Card>
            <PieChart
              data={chartData}
              width={width - SPACING.lg * 4}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(225, 224, 255, ${opacity})`,
                backgroundColor: 'transparent',
                backgroundGradientFrom: COLORS.surfaceContainer,
                backgroundGradientTo: COLORS.surfaceContainer,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute={false}
            />
          </Card>
        </View>
      )}

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const cat = TX_CATEGORIES.find(c => c.id === tx.category);
  const isIncome = tx.type === 'income';
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: (cat?.color ?? '#a4899d') + '22' }]}>
        <Text style={{ fontSize: 20 }}>{cat?.icon ?? '💰'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txName} numberOfLines={1}>{tx.description}</Text>
        <Badge label={cat?.label ?? tx.category} color="cyan" />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.txAmount, { color: isIncome ? COLORS.lime : COLORS.magentaSoft }]}>
          {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
        </Text>
        <Text style={styles.txDate}>{formatDateShort(tx.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  balanceCard: {
    margin: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.navy5,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceCardGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,0,255,0.07)',
  },
  balanceLabel:  { ...TYPOGRAPHY.labelSm, color: COLORS.muted, letterSpacing: 1.5, textTransform: 'uppercase' },
  balanceAmount: { ...TYPOGRAPHY.headlineLg, fontWeight: '800', marginTop: 4, letterSpacing: -1 },
  balanceMonth:  { ...TYPOGRAPHY.labelMd, color: COLORS.muted, marginTop: 2 },
  balanceRow:    { flexDirection: 'row', marginTop: SPACING.md },
  balanceMini:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: RADIUS.sm, padding: SPACING.sm + 2 },
  miniLabel:     { ...TYPOGRAPHY.labelSm, color: COLORS.muted },
  miniValue:     { ...TYPOGRAPHY.titleLg, fontWeight: '800', marginTop: 2 },
  section:       { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  statRow:       { flexDirection: 'row' },
  statCard:      { flex: 1, padding: SPACING.md },
  statLabel:     { ...TYPOGRAPHY.labelSm, color: COLORS.muted, letterSpacing: 1 },
  statValue:     { fontSize: 28, fontWeight: '800', marginTop: 4 },
  txRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  txIcon:   { width: 44, height: 44, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  txName:   { ...TYPOGRAPHY.bodyMd, color: COLORS.white, fontWeight: '600', marginBottom: 3 },
  txAmount: { ...TYPOGRAPHY.labelLg, fontWeight: '700' },
  txDate:   { ...TYPOGRAPHY.labelSm, color: COLORS.muted, marginTop: 2 },
});
