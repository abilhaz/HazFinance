// src/utils/exportExcel.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { utils, write } from 'xlsx';
import type { Transaction, Item } from './database';
import { TX_CATEGORIES } from './theme';

function getCatLabel(id: string): string {
  return TX_CATEGORIES.find(c => c.id === id)?.label ?? id;
}

export async function exportToExcel(
  transactions: Transaction[],
  items: Item[]
): Promise<void> {
  const wb = utils.book_new();

  // ── Sheet 1: Semua Transaksi ──
  const txHeaders = ['No', 'Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Nominal (Rp)', 'Catatan'];
  const txRows = transactions.map((t, i) => [
    i + 1,
    t.date,
    t.description,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    getCatLabel(t.category),
    t.amount,
    t.note || '',
  ]);
  const ws1 = utils.aoa_to_sheet([txHeaders, ...txRows]);
  ws1['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 28 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 22 },
  ];
  utils.book_append_sheet(wb, ws1, 'Transaksi');

  // ── Sheet 2: Rekap Keuangan ──
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net     = income - expense;

  const catTotals: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
  });

  const rekData: (string | number)[][] = [
    ['HAZ FINANCE — REKAP LAPORAN'],
    ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
    [],
    ['RINGKASAN', ''],
    ['Total Pemasukan',  income],
    ['Total Pengeluaran', expense],
    ['Saldo Bersih',     net],
    [],
    ['PENGELUARAN PER KATEGORI', 'Total (Rp)', '% dari Total'],
    ...Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => [getCatLabel(k), v, expense > 0 ? `${Math.round(v / expense * 100)}%` : '0%']),
  ];
  const ws2 = utils.aoa_to_sheet(rekData);
  ws2['!cols'] = [{ wch: 26 }, { wch: 16 }, { wch: 14 }];
  utils.book_append_sheet(wb, ws2, 'Rekap Keuangan');

  // ── Sheet 3: Daftar Barang ──
  const itemHeaders = ['No', 'Nama Barang', 'Kategori', 'Harga Jual (Rp)', 'Harga Modal (Rp)', 'Margin (%)', 'Stok', 'Deskripsi'];
  const itemRows = items.map((item, i) => {
    const margin = item.cost > 0 ? Math.round((item.price - item.cost) / item.cost * 100) : 0;
    return [i + 1, item.name, item.category, item.price, item.cost, `${margin}%`, item.stock, item.description || ''];
  });
  const ws3 = utils.aoa_to_sheet([itemHeaders, ...itemRows]);
  ws3['!cols'] = [
    { wch: 5 }, { wch: 24 }, { wch: 14 }, { wch: 16 },
    { wch: 16 }, { wch: 12 }, { wch: 8 }, { wch: 24 },
  ];
  utils.book_append_sheet(wb, ws3, 'Daftar Barang');

  // ── Write & Share ──
  const wbout = write(wb, { type: 'base64', bookType: 'xlsx' });
  const fileName = `HazFinance_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Simpan Laporan Haz Finance',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}
