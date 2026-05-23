// src/utils/format.ts

export function formatRupiah(amount: number, showSign = false): string {
  const formatted = Math.abs(amount).toLocaleString('id-ID');
  if (showSign) {
    return amount >= 0 ? `+Rp ${formatted}` : `-Rp ${formatted}`;
  }
  return `Rp ${formatted}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function calcMarginPct(price: number, cost: number): number {
  if (cost <= 0) return 0;
  return Math.round(((price - cost) / cost) * 100);
}
