# 💸 Haz Finance — Android App

Aplikasi keuangan pribadi & manajemen barang untuk Android, dibangun dengan **React Native + Expo**.  
Desain mengikuti sistem **Vibrant Neo-Finance** (Deep Navy + Magenta + Cyan + Lime).

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 📊 **Dashboard** | Saldo bulan ini, pemasukan/pengeluaran, transaksi terbaru, pie chart kategori |
| 💳 **Transaksi** | Tambah/edit/hapus transaksi (pemasukan & pengeluaran), filter, kategori lengkap |
| 📦 **Manajemen Barang** | CRUD item dengan harga jual, harga modal, margin otomatis, stok, kategori |
| 📈 **Rekap Laporan** | Ringkasan bulanan/semua waktu, breakdown per kategori, bar chart proporsi |
| 📊 **Export Excel** | Export 3 sheet (Transaksi, Rekap, Daftar Barang) ke file `.xlsx` dan share |
| 🗄️ **SQLite** | Data tersimpan lokal di perangkat via `expo-sqlite` |

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat
- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) + AVD (emulator) **atau** HP Android dengan Expo Go

### 1. Install dependencies

```bash
cd HazFinance
npm install
```

### 2. Jalankan di Expo Go (HP Android)

```bash
npx expo start
```

Scan QR code dengan **Expo Go** app (download dari Play Store).

### 3. Jalankan di Android Emulator

```bash
npx expo start --android
```

---

## 📦 Build APK (Production)

### Menggunakan EAS Build (Direkomendasikan)

#### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

#### Build APK (untuk distribusi internal / sideload)
```bash
eas build --platform android --profile preview
```
> Ini menghasilkan file `.apk` yang bisa langsung di-install ke HP Android.

#### Build AAB (untuk Google Play Store)
```bash
eas build --platform android --profile production
```

### Menggunakan Expo Classic Build (Alternatif)
```bash
npx expo build:android -t apk
```

---

## 📁 Struktur Proyek

```
HazFinance/
├── App.tsx                          # Root: Navigation + DB init
├── app.json                         # Expo config
├── eas.json                         # EAS Build config
├── package.json
├── tsconfig.json
└── src/
    ├── screens/
    │   ├── DashboardScreen.tsx      # Dashboard utama
    │   ├── TransaksiScreen.tsx      # Manajemen transaksi
    │   ├── ItemScreen.tsx           # Manajemen barang/item
    │   └── RekapScreen.tsx          # Rekap & export
    ├── components/
    │   └── UI.tsx                   # Card, Button, Input, Badge, Chip, dll
    └── utils/
        ├── theme.ts                 # Warna, tipografi, kategori
        ├── database.ts              # SQLite CRUD (expo-sqlite)
        ├── format.ts                # Format Rupiah, tanggal, margin
        └── exportExcel.ts           # Export ke .xlsx (xlsx + expo-sharing)
```

---

## 🎨 Design System: Vibrant Neo-Finance

| Token | Nilai |
|---|---|
| Background | `#040054` Deep Navy |
| Primary Accent | `#FF00FF` Magenta |
| Secondary Accent | `#00FFFF` Cyan |
| Positive / Income | `#ABD600` Lime |
| Font | Inter |
| Border Radius | 8–20dp (M3 Rounded) |

---

## 🔧 Konfigurasi

Edit `app.json` untuk mengganti:
- `name` — nama app
- `android.package` — package ID (contoh: `com.namaanda.hazfinance`)
- `android.versionCode` — nomor versi build

Edit `eas.json` dan jalankan `eas init` untuk mendaftarkan project ke EAS.

---

## 📋 Kategori Transaksi

Shopping · Makan · Transport · Rumah · Tagihan · Kesehatan · Hiburan · Gaji · Transfer · Lainnya

## 📋 Kategori Barang

Makanan · Minuman · Elektronik · Pakaian · Kesehatan · Rumah Tangga · Kecantikan · Olahraga · Lainnya

---

## 📄 Lisensi

MIT — Bebas digunakan dan dimodifikasi.
