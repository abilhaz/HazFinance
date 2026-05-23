// src/screens/TransaksiScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Alert, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  Card, Button, FormInput, SectionHeader, Badge,
  Chip, EmptyState,
} from '../components/UI';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, TX_CATEGORIES } from '../utils/theme';
import {
  getAllTransactions, insertTransaction, updateTransaction,
  deleteTransaction, Transaction,
} from '../utils/database';
import { formatRupiah, formatDateShort, getTodayISO } from '../utils/format';

type TxFilter = 'all' | 'income' | 'expense';

export default function TransaksiScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter]             = useState<TxFilter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]           = useState<Transaction | null>(null);

  // Form state
  const [txType, setTxType]     = useState<'income' | 'expense'>('expense');
  const [amount, setAmount]     = useState('');
  const [desc, setDesc]         = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate]         = useState(getTodayISO());
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);

  const loadData = useCallback(async () => {
    setTransactions(await getAllTransactions());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openModal = (tx?: Transaction) => {
    if (tx) {
      setEditing(tx);
      setTxType(tx.type);
      setAmount(String(tx.amount));
      setDesc(tx.description);
      setCategory(tx.category);
      setDate(tx.date);
      setNote(tx.note);
    } else {
      setEditing(null);
      setTxType('expense');
      setAmount('');
      setDesc('');
      setCategory('');
      setDate(getTodayISO());
      setNote('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return Alert.alert('', 'Masukkan nominal yang valid');
    if (!desc.trim())                  return Alert.alert('', 'Masukkan deskripsi transaksi');
    if (!category)                     return Alert.alert('', 'Pilih kategori terlebih dahulu');

    setSaving(true);
    const payload = { type: txType, amount: numAmount, description: desc.trim(), category, date, note };
    if (editing) {
      await updateTransaction(editing.id, payload);
    } else {
      await insertTransaction(payload);
    }
    setSaving(false);
    setModalVisible(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Hapus Transaksi', 'Yakin ingin menghapus?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteTransaction(id); loadData(); } },
    ]);
  };

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as TxFilter[]).map(f => (
          <Chip
            key={f}
            label={f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={t => String(t.id)}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="💳" title="Tidak ada transaksi" subtitle="Tekan + untuk menambah transaksi baru" />
        }
        renderItem={({ item }) => <TxCard tx={item} onEdit={() => openModal(item)} onDelete={() => handleDelete(item.id)} />}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()} activeOpacity={0.85}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modal}>
            {/* Handle */}
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editing ? 'Edit Transaksi' : 'Transaksi Baru'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Toggle */}
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeBtn, txType === 'expense' && styles.typeBtnExpenseActive]}
                  onPress={() => setTxType('expense')}
                >
                  <Text style={[styles.typeBtnText, txType === 'expense' && { color: '#000' }]}>💸 Pengeluaran</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, txType === 'income' && styles.typeBtnIncomeActive]}
                  onPress={() => setTxType('income')}
                >
                  <Text style={[styles.typeBtnText, txType === 'income' && { color: '#000' }]}>💰 Pemasukan</Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={styles.amountRow}>
                <Text style={styles.amountPrefix}>Rp</Text>
                <FormInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  style={styles.amountInput as any}
                  containerStyle={{ flex: 1, marginBottom: 0 }}
                />
              </View>
              <View style={{ height: 2, backgroundColor: COLORS.outlineVariant, marginBottom: SPACING.lg }} />

              <FormInput label="Deskripsi" value={desc} onChangeText={setDesc} placeholder="Nama transaksi..." />

              {/* Category Grid */}
              <Text style={styles.catLabel}>KATEGORI</Text>
              <View style={styles.catGrid}>
                {TX_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.catBtn}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.catIconBox, category === cat.id && { borderColor: COLORS.cyanSoft, backgroundColor: 'rgba(0,251,251,0.1)' }]}>
                      <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    </View>
                    <Text style={[styles.catBtnLabel, category === cat.id && { color: COLORS.cyanSoft }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormInput label="Tanggal" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
              <FormInput label="Catatan (opsional)" value={note} onChangeText={setNote} placeholder="Catatan tambahan..." />

              <View style={styles.modalBtns}>
                <Button label="Batal" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: SPACING.sm }} />
                <Button label="Simpan" onPress={handleSave} loading={saving} style={{ flex: 2 }} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function TxCard({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: () => void; onDelete: () => void }) {
  const cat = TX_CATEGORIES.find(c => c.id === tx.category);
  const isIncome = tx.type === 'income';
  return (
    <Card>
      <View style={styles.txCardRow}>
        <View style={[styles.txIcon, { backgroundColor: (cat?.color ?? '#a4899d') + '22' }]}>
          <Text style={{ fontSize: 22 }}>{cat?.icon ?? '💰'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.txName} numberOfLines={1}>{tx.description}</Text>
          <Badge label={cat?.label ?? tx.category} color="cyan" />
          {tx.note ? <Text style={styles.txNote}>{tx.note}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.txAmount, { color: isIncome ? COLORS.lime : COLORS.magentaSoft }]}>
            {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
          </Text>
          <Text style={styles.txDate}>{formatDateShort(tx.date)}</Text>
        </View>
      </View>
      <View style={styles.txCardFooter}>
        <TouchableOpacity style={styles.footerBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={14} color={COLORS.cyanSoft} />
          <Text style={[styles.footerBtnText, { color: COLORS.cyanSoft }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
          <Text style={[styles.footerBtnText, { color: COLORS.danger }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  filterRow:    { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.lg, paddingBottom: SPACING.sm },
  fab: {
    position: 'absolute', bottom: SPACING.xl, right: SPACING.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.magenta,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.magenta, shadowOpacity: 0.5, shadowRadius: 12,
  },
  modal:       { flex: 1, backgroundColor: COLORS.surfaceContainerLow, padding: SPACING.lg },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  modalTitle:  { ...TYPOGRAPHY.headlineMobile, color: COLORS.white, marginBottom: SPACING.lg },
  typeToggle:  { flexDirection: 'row', backgroundColor: COLORS.navy2, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.cardBorder },
  typeBtn:     { flex: 1, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.sm, alignItems: 'center' },
  typeBtnExpenseActive: { backgroundColor: COLORS.magenta },
  typeBtnIncomeActive:  { backgroundColor: COLORS.lime },
  typeBtnText: { ...TYPOGRAPHY.labelLg, color: COLORS.muted, fontWeight: '700' },
  amountRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  amountPrefix:{ fontSize: 28, fontWeight: '700', color: COLORS.magentaSoft, marginRight: 6 },
  amountInput: { fontSize: 40, fontWeight: '800', color: COLORS.white, backgroundColor: 'transparent', borderWidth: 0 } as any,
  catLabel:    { ...TYPOGRAPHY.labelSm, color: COLORS.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: SPACING.sm },
  catGrid:     { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg },
  catBtn:      { width: '25%', alignItems: 'center', paddingVertical: 8 },
  catIconBox:  { width: 54, height: 54, borderRadius: 14, backgroundColor: COLORS.surfaceContainer, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  catBtnLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.muted, textAlign: 'center' },
  modalBtns:   { flexDirection: 'row', marginTop: SPACING.md, marginBottom: SPACING.xxl },
  txCardRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  txIcon:      { width: 44, height: 44, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txName:      { ...TYPOGRAPHY.labelLg, color: COLORS.white, marginBottom: 4 },
  txNote:      { ...TYPOGRAPHY.labelSm, color: COLORS.muted, marginTop: 3 },
  txAmount:    { ...TYPOGRAPHY.labelLg, fontWeight: '700' },
  txDate:      { ...TYPOGRAPHY.labelSm, color: COLORS.muted, marginTop: 2 },
  txCardFooter:{ flexDirection: 'row', gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  footerBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerBtnText:{ ...TYPOGRAPHY.labelSm },
});
