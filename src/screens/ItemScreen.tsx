// src/screens/ItemScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Card, Button, FormInput, Badge, Chip, EmptyState } from '../components/UI';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, ITEM_CATEGORIES, ITEM_CAT_ICONS } from '../utils/theme';
import {
  getAllItems, insertItem, updateItem, deleteItem, Item,
} from '../utils/database';
import { formatRupiah, calcMarginPct } from '../utils/format';

export default function ItemScreen() {
  const [items, setItems]               = useState<Item[]>([]);
  const [filter, setFilter]             = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]           = useState<Item | null>(null);

  // Form
  const [name, setName]         = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice]       = useState('');
  const [cost, setCost]         = useState('');
  const [stock, setStock]       = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [saving, setSaving]     = useState(false);

  const loadData = useCallback(async () => {
    setItems(await getAllItems());
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openModal = (item?: Item) => {
    if (item) {
      setEditing(item);
      setName(item.name);
      setCategory(item.category);
      setPrice(String(item.price));
      setCost(String(item.cost));
      setStock(String(item.stock));
      setItemDesc(item.description);
    } else {
      setEditing(null);
      setName(''); setCategory(''); setPrice('');
      setCost(''); setStock(''); setItemDesc('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim())    return Alert.alert('', 'Masukkan nama barang');
    if (!category)       return Alert.alert('', 'Pilih kategori barang');
    if (!price || parseFloat(price) <= 0) return Alert.alert('', 'Masukkan harga jual yang valid');

    setSaving(true);
    const payload = {
      name: name.trim(),
      category,
      price: parseFloat(price),
      cost: parseFloat(cost) || 0,
      stock: parseInt(stock) || 0,
      description: itemDesc.trim(),
      icon: ITEM_CAT_ICONS[category] ?? '📦',
    };
    if (editing) {
      await updateItem(editing.id, payload);
    } else {
      await insertItem(payload);
    }
    setSaving(false);
    setModalVisible(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Hapus Barang', 'Yakin ingin menghapus barang ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => { await deleteItem(id); loadData(); } },
    ]);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const filters = ['all', ...ITEM_CATEGORIES];

  return (
    <View style={styles.container}>
      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {filters.map(f => (
          <Chip
            key={f}
            label={f === 'all' ? 'Semua' : f}
            active={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Item</Text>
          <Text style={styles.summaryVal}>{filtered.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Stok</Text>
          <Text style={styles.summaryVal}>{filtered.reduce((s, i) => s + i.stock, 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Est. Nilai Jual</Text>
          <Text style={[styles.summaryVal, { fontSize: 11 }]}>
            {formatRupiah(filtered.reduce((s, i) => s + i.price * i.stock, 0))}
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="📦" title="Belum ada barang" subtitle="Tekan + untuk menambah barang baru" />
        }
        renderItem={({ item }) => (
          <ItemCard item={item} onEdit={() => openModal(item)} onDelete={() => handleDelete(item.id)} />
        )}
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
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editing ? 'Edit Barang' : 'Tambah Barang'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <FormInput label="Nama Barang" value={name} onChangeText={setName} placeholder="Nama produk/barang..." />

              {/* Category picker */}
              <Text style={styles.pickerLabel}>KATEGORI</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={category}
                  onValueChange={setCategory}
                  style={{ color: COLORS.white }}
                  dropdownIconColor={COLORS.cyanSoft}
                >
                  <Picker.Item label="Pilih kategori..." value="" color={COLORS.muted} />
                  {ITEM_CATEGORIES.map(c => (
                    <Picker.Item key={c} label={`${ITEM_CAT_ICONS[c]} ${c}`} value={c} color={COLORS.white} />
                  ))}
                </Picker>
              </View>

              {/* Category quick chips */}
              <View style={styles.catChips}>
                {ITEM_CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.catChip, category === c && styles.catChipActive]}
                  >
                    <Text style={[styles.catChipText, category === c && { color: '#000' }]}>
                      {ITEM_CAT_ICONS[c]} {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormInput label="Harga Jual (Rp)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" />
              <FormInput label="Harga Modal (Rp)" value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="0" />

              {/* Margin preview */}
              {price && cost && (
                <View style={styles.marginPreview}>
                  <Text style={styles.marginLabel}>Margin:</Text>
                  <Text style={[styles.marginVal, { color: calcMarginPct(parseFloat(price), parseFloat(cost)) >= 0 ? COLORS.lime : COLORS.danger }]}>
                    {calcMarginPct(parseFloat(price), parseFloat(cost))}%
                    {'  '}(Untung {formatRupiah(parseFloat(price) - parseFloat(cost))})
                  </Text>
                </View>
              )}

              <FormInput label="Stok" value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />
              <FormInput label="Deskripsi Barang" value={itemDesc} onChangeText={setItemDesc} placeholder="Keterangan tambahan..." />

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

function ItemCard({ item, onEdit, onDelete }: { item: Item; onEdit: () => void; onDelete: () => void }) {
  const margin = calcMarginPct(item.price, item.cost);
  return (
    <Card>
      <View style={styles.itemRow}>
        <View style={styles.itemBadge}>
          <Text style={{ fontSize: 26 }}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginTop: 4 }}>
            <Badge label={item.category} color="cyan" />
            <Text style={styles.stockText}>Stok: {item.stock}</Text>
          </View>
          <Text style={styles.itemPrice}>{formatRupiah(item.price)}</Text>
          <Text style={styles.itemCost}>
            Modal: {formatRupiah(item.cost)}
            {'  '}·{'  '}
            <Text style={{ color: margin >= 0 ? COLORS.lime : COLORS.danger }}>
              Margin {margin}%
            </Text>
          </Text>
          {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
        </View>
      </View>
      <View style={styles.itemFooter}>
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
  container:     { flex: 1, backgroundColor: COLORS.background },
  filterScroll:  { maxHeight: 56 },
  filterRow:     { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2 },
  summaryStrip: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceContainer, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SPACING.md,
  },
  summaryItem:   { flex: 1, alignItems: 'center' },
  summaryLabel:  { ...TYPOGRAPHY.labelSm, color: COLORS.muted },
  summaryVal:    { ...TYPOGRAPHY.titleLg, color: COLORS.cyanSoft, fontWeight: '800', marginTop: 2 },
  fab: {
    position: 'absolute', bottom: SPACING.xl, right: SPACING.lg,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.magenta,
    alignItems: 'center', justifyContent: 'center', elevation: 8,
    shadowColor: COLORS.magenta, shadowOpacity: 0.5, shadowRadius: 12,
  },
  modal:       { flex: 1, backgroundColor: COLORS.surfaceContainerLow, padding: SPACING.lg },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg },
  modalTitle:  { ...TYPOGRAPHY.headlineMobile, color: COLORS.white, marginBottom: SPACING.lg },
  pickerLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  pickerWrap:  { backgroundColor: COLORS.surfaceContainerLow, borderWidth: 1, borderColor: COLORS.outlineVariant, borderRadius: RADIUS.sm + 2, marginBottom: SPACING.sm },
  catChips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.lg },
  catChip:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.outlineVariant },
  catChipActive:{ backgroundColor: COLORS.cyanSoft, borderColor: COLORS.cyanSoft },
  catChipText: { ...TYPOGRAPHY.labelMd, color: COLORS.muted },
  marginPreview:{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md, padding: SPACING.sm, backgroundColor: COLORS.surfaceContainer, borderRadius: RADIUS.sm },
  marginLabel: { ...TYPOGRAPHY.labelLg, color: COLORS.muted },
  marginVal:   { ...TYPOGRAPHY.labelLg, fontWeight: '700' },
  modalBtns:   { flexDirection: 'row', marginTop: SPACING.md, marginBottom: SPACING.xxl },
  itemRow:     { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  itemBadge:   { width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: 'rgba(171,214,0,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemName:    { ...TYPOGRAPHY.labelLg, color: COLORS.white, fontWeight: '700' },
  stockText:   { ...TYPOGRAPHY.labelSm, color: COLORS.muted },
  itemPrice:   { ...TYPOGRAPHY.titleLg, color: COLORS.lime, fontWeight: '800', marginTop: 4 },
  itemCost:    { ...TYPOGRAPHY.labelSm, color: COLORS.muted, marginTop: 2 },
  itemDesc:    { ...TYPOGRAPHY.labelSm, color: COLORS.muted, marginTop: 4, fontStyle: 'italic' },
  itemFooter:  { flexDirection: 'row', gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  footerBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerBtnText:{ ...TYPOGRAPHY.labelSm },
});
