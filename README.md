<div align="center">
  <h1>📱 Kickoff — Appium E2E Testing</h1>
  <p><em>End-to-End UI automation tests untuk aplikasi mobile Kickoff (React Native / Expo) menggunakan Appium 2 + WebdriverIO</em></p>

  <img src="https://img.shields.io/badge/Appium-2.17.1-blue" />
  <img src="https://img.shields.io/badge/WebdriverIO-9.x-orange" />
  <img src="https://img.shields.io/badge/Platform-Android-green?logo=android" />
  <img src="https://img.shields.io/badge/Language-JavaScript-yellow?logo=javascript" />
  <img src="https://img.shields.io/badge/Test%20Framework-Mocha-brown" />
</div>

---

## 📖 Overview

Folder ini berisi kumpulan test **End-to-End (E2E)** yang mensimulasikan interaksi user nyata di aplikasi **Kickoff**. Test dijalankan menggunakan **Appium 2** sebagai driver automasi dan **WebdriverIO** sebagai test runner, dengan Mocha sebagai framework dan Chai sebagai assertion library.

Test suite yang tersedia mencakup:
- 🔐 **Auth** — Register, Login, OTP
- 🏠 **Home** — Navigasi dan tampilan Home Screen
- 💬 **Forum** — Membuat post, komentar, dan voting
- 👤 **Profile** — Melihat dan mengedit profil
- ⚠️ **Report** — Membuat laporan, komentar + upload foto bukti (Base64), voting

> ℹ️ Testing saat ini difokuskan untuk platform **Android** (Emulator atau Real Device).

---

## 🖥️ Tech Stack

| Komponen | Versi / Keterangan |
|---|---|
| **Appium Server** | `2.17.1` |
| **WebdriverIO** | `9.x` |
| **Test Framework** | Mocha (via `@wdio/mocha-framework`) |
| **Assertion** | Chai `4.4.1` |
| **Appium Driver** | `appium-uiautomator2-driver 3.9.7` (Android) |
| **HTTP Client** | Axios (untuk API helper setup data) |
| **Language** | JavaScript (Node.js) |

---

## ✅ Minimum Requirements

Sebelum menjalankan test, pastikan seluruh kebutuhan berikut sudah terpenuhi:

### Software yang Wajib Terinstal

| Software | Versi Minimum | Keterangan |
|---|---|---|
| **Node.js** | `>= 18.0.0` | Cek dengan `node -v` |
| **npm** | Bawaan Node.js | Cek dengan `npm -v` |
| **Java JDK** | 11 atau 17 | Dibutuhkan oleh Appium/UiAutomator2 |
| **Android Studio** | Versi terbaru | Untuk AVD Manager dan Android SDK |
| **Android SDK** | API Level 30+ | Diinstal via Android Studio |
| **`adb`** | Bawaan Android SDK | Cek dengan `adb version` |

### Environment Variables OS (Wajib)

Tambahkan variabel ini ke **System Environment Variables** OS kamu:

```bash
# Contoh untuk Linux/Mac (~/.bashrc atau ~/.zshrc)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

```powershell
# Untuk Windows — set via System Properties → Environment Variables
JAVA_HOME    = C:\Program Files\Java\jdk-17
ANDROID_HOME = C:\Users\<kamu>\AppData\Local\Android\Sdk
```

### Emulator / Real Device

- **Emulator**: Buat AVD di Android Studio (API 30+). Pastikan sudah dalam keadaan **Running** sebelum menjalankan test.
- **Real Device**: Aktifkan **Developer Options** → **USB Debugging** di HP, lalu hubungkan via kabel USB.

Cek koneksi device:
```bash
adb devices
# Output:
# List of devices attached
# emulator-5554  device      ← emulator siap
# R5CRA1JXXXXX  device      ← real device siap
```

---

## 🗂️ Struktur Folder

```text
appium-tests/
├── config/
│   └── capabilities.js      # Konfigurasi capabilities Android (device name, apk, dll.)
├── fixtures/
│   ├── test-data.js          # Data test (credentials user, data forum, timeouts)
│   └── test_photo.jpg        # Foto dummy untuk test upload (baca catatan di bawah ⬇️)
├── helpers/
│   ├── api.helper.js         # HTTP helper — setup data via API sebelum test (login, buat user, dll.)
│   ├── photo.helper.js       # Helper push foto ke emulator & set mock GPS
│   └── logger.js             # Winston logger untuk output yang rapi
├── logs/                     # (Gitignored) Output log berjalannya test
├── page-objects/             # Implementasi Page Object Model (POM)
│   ├── BasePage.js           # Base class dengan helper umum (tap, waitFor, screenshot, dll.)
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── VerifyOtpPage.js
│   ├── HomePage.js
│   ├── ForumPage.js
│   ├── ProfilePage.js
│   ├── EditProfilePage.js
│   ├── SettingsPage.js
│   └── ReportPage.js         # Page Object untuk Report screen
├── recordings/               # (Gitignored) Video rekaman (MP4) saat test GAGAL
├── screenshots/              # (Gitignored) Screenshot (PNG) saat test GAGAL
├── tests/
│   ├── auth/                 # Test suite: Login, Register, OTP
│   ├── forum/                # Test suite: Forum (post, komentar, vote)
│   ├── home/                 # Test suite: Home Screen
│   ├── profile/              # Test suite: Profile & Edit Profile
│   └── report/
│       └── report.test.js    # Test suite: Report Screen
├── .env                      # (Gitignored) Konfigurasi lokal kamu
├── .env.example              # Template environment variable
├── wdio.conf.js              # Konfigurasi utama WebdriverIO
└── package.json              # Dependencies dan scripts
```

---

## ⚙️ Konfigurasi Environment (`.env`)

Salin file contoh terlebih dahulu:

```bash
cp .env.example .env
```

Lalu sesuaikan isi `.env` dengan setup lokal kamu:

| Variabel | Contoh | Keterangan |
|---|---|---|
| `APPIUM_HOST` | `127.0.0.1` | IP Appium server (biasanya localhost) |
| `APPIUM_PORT` | `4723` | Port Appium server |
| `DEVICE_NAME` | `emulator-5554` | Nama device dari output `adb devices` |
| `DEVICE_UDID` | `emulator-5554` | UDID device (sama dengan DEVICE_NAME untuk emulator) |
| `ANDROID_VERSION` | `14` | Versi Android OS target |
| `API_BASE_URL` | `http://10.0.2.2:3000` | URL API Gateway Backend |
| `EXPO_DEEPLINK` | `exp://10.0.2.2:8081` | Deeplink untuk membuka app Expo Go |
| `TEST_USER_EMAIL` | `testuser@kickoff.test` | Email akun yang sudah terdaftar untuk test login |
| `TEST_USER_PASSWORD` | `password123` | Password akun tersebut |
| `TEST_REGISTER_EMAIL` | `newuser@kickoff.test` | Email untuk test registrasi (pastikan belum terdaftar) |
| `TEST_REGISTER_PASSWORD` | `AutoTest@123` | Password untuk registrasi |
| `LOG_LEVEL` | `info` | Level log (`trace`, `debug`, `info`, `warn`, `error`, `silent`) |

> ⚠️ **Perbedaan Emulator vs Real Device untuk IP:**
> - **Emulator AVD**: Gunakan `10.0.2.2` untuk mengakses `localhost` PC → `API_BASE_URL=http://10.0.2.2:3000`
> - **Real Device**: Gunakan IP LAN PC kamu → `API_BASE_URL=http://192.168.1.x:3000`

---

## 🚀 Installation & Setup

### Langkah 1 — Install Dependencies dan Appium Driver

```bash
# Install semua dependency (termasuk appium & webdriverio)
npm install

# Install Appium Driver untuk Android (UiAutomator2)
npm run driver:install
```

Atau cukup jalankan satu perintah:
```bash
npm run setup
```

### Langkah 2 — Verifikasi Environment

```bash
npm run appium:doctor
```

Pastikan semua item berlabel **necessary** berwarna ✅ hijau. Item *optional* tidak wajib.

### Langkah 3 — Siapkan `.env`

```bash
cp .env.example .env
# Edit file .env dengan nilai yang sesuai
```

### Langkah 4 — Pastikan Emulator / Device Berjalan

```bash
adb devices
# Harus muncul minimal satu device dengan status "device"
```

### Langkah 5 — Pastikan Backend Berjalan

Test ini membutuhkan Backend API Gateway aktif di port `3000`. Jalankan via Docker Compose dari repositori backend:

```bash
docker-compose up -d
```

### Langkah 6 — Pastikan Expo Dev Server Berjalan

App Kickoff harus sudah berjalan di Expo Go atau melalui Docker. Port default adalah `8081`.

---

## ▶️ Cara Menjalankan Test

### Terminal 1 — Start Appium Server

Buka terminal baru dan biarkan berjalan di background:

```bash
npm run appium:start
```

Server akan berjalan di `http://127.0.0.1:4723`. Log disimpan ke `appium.log`.

### Terminal 2 — Jalankan Test

Setelah Appium server berjalan, buka terminal lain:

```bash
# Jalankan SEMUA test suite
npm run test

# Hanya test Auth (Login & Register)
npm run test:auth

# Hanya test Login
npm run test:login

# Hanya test Register
npm run test:register

# Hanya test Home screen
npm run test:home

# Hanya test Forum
npm run test:forum

# Hanya test Profile
npm run test:profile

# Hanya test Report ⬇️
npm run test:report

# Atau jalankan file spesifik secara manual
npx wdio run wdio.conf.js --spec tests/report/report.test.js
```

---

## ⚠️ Test Suite: Report Screen

Test ini berada di `tests/report/report.test.js`. Berikut skenario yang dicakup:

| Test Case | ID | Deskripsi |
|---|---|---|
| Tampil setelah navigasi | `TC-REPORT-01` | Report Screen muncul setelah navigasi dari Home |
| Berpindah tab | `TC-REPORT-02` | Tab "Semua Laporan" ↔ "Laporanku" |
| Pencarian | `TC-REPORT-03` | Mencari laporan berdasarkan kata kunci |
| Sorting | `TC-REPORT-04` | Mengubah urutan tampilan laporan |
| Validasi form | `TC-REPORT-05` | Form wajib diisi (judul & deskripsi) |
| E2E buat laporan + komentar foto | `TC-REPORT-06` | Buat laporan → user lain kirim bukti foto via API |

### 📸 TC-REPORT-06: Upload Foto & Penggunaan Base64

Test case ini menguji alur lengkap: membuat laporan baru dengan foto dan GPS, kemudian user lain mengirim komentar beserta **foto bukti**.

Karena endpoint report menggunakan **Base64** (bukan multipart/form-data), foto dikirim sebagai string Base64 langsung di body JSON.

#### Bagaimana Cara Kerjanya

1. **Setup** — `photo.helper.js` mem-push file `fixtures/test_photo.jpg` ke emulator menggunakan `adb push`, sehingga tersedia di galeri device.
2. **Buat Laporan (UI)** — `ReportPage.fillAndSubmitReport()` mengisi form: judul, deskripsi, memilih foto dari galeri, dan GPS mock.
3. **Kirim Komentar + Foto Bukti (API)** — Dilakukan via `ApiHelper.commentOnReport()` dengan payload berisi string Base64.

#### Mengganti Foto untuk Test

File foto dummy ada di `fixtures/test_photo.jpg`. Foto ini di-push ke emulator dan dipakai saat pengujian UI.

**Untuk mengganti foto:**
1. Ganti file `fixtures/test_photo.jpg` dengan foto yang kamu inginkan (format JPG/PNG, ukuran kecil ± < 500KB).
2. Pastikan nama file tetap `test_photo.jpg` (atau sesuaikan path di `photo.helper.js`).

**Untuk mengganti foto Base64 di komentar (TC-REPORT-06 — Step 3):**

Pada kode di `report.test.js`, ada variabel `dummyJpegB64` yang berisi string Base64 dari foto dummy. Jika ingin menggunakan foto lain:

```js
// Konversi foto ke Base64 (Node.js)
const fs = require('fs')
const base64 = fs.readFileSync('path/ke/foto.jpg').toString('base64')
const dummyJpegB64 = `data:image/jpeg;base64,${base64}`
```

Atau bisa menggunakan tool online seperti [base64.guru](https://base64.guru/converter/encode/image) untuk mengkonversi gambar ke Base64, lalu paste hasilnya (dengan prefix `data:image/jpeg;base64,...`) ke variabel tersebut.

#### Mock GPS (Emulator Only)

Sebelum test dimulai, GPS emulator di-mock ke koordinat Jakarta (`-6.2088, 106.8456`) melalui:
```js
PhotoHelper.setMockLocation(-6.2088, 106.8456)
```

Jika menggunakan **real device**, GPS tidak perlu di-mock — test akan menggunakan lokasi GPS aktual device.

---

## 📊 Hasil Test

Setelah test selesai:

- **Output konsol**: Log rapi dari `spec` reporter langsung di terminal.
- **Screenshots** (jika test GAGAL): Otomatis tersimpan di folder `screenshots/` (format: `<nama_tc>.png`).
- **Recordings** (jika test GAGAL): Video rekaman tersimpan di folder `recordings/` (format `.mp4`).

> 💡 Folder `screenshots/`, `recordings/`, dan `logs/` sudah di-ignore oleh `.gitignore` sehingga tidak ikut ter-push ke GitHub.

---

## 📱 Menjalankan di Real Device

Jika menggunakan HP Android fisik:

1. Aktifkan **Developer Options** dan **USB Debugging** di HP.
2. Hubungkan HP ke PC via kabel USB, izinkan akses debug jika ada popup.
3. Cek koneksi:
   ```bash
   adb devices
   # Contoh output: R9RX901HXXJ  device
   ```
4. Masukkan ID device ke `.env`:
   ```env
   DEVICE_NAME=R9RX901HXXJ
   DEVICE_UDID=R9RX901HXXJ
   ANDROID_VERSION=13
   ```
5. Ganti IP di `.env` dari `10.0.2.2` ke **IP LAN komputer kamu**:
   ```env
   API_BASE_URL=http://192.168.1.4:3000
   EXPO_DEEPLINK=exp://192.168.1.4:8081
   ```

> ⚠️ Untuk beberapa HP (Xiaomi, OPPO, dll.), aktifkan juga opsi **Install via USB** dan **USB debugging (Security settings)** di Developer Options.

---

## 🛠️ Cara Menambah Test Baru

Ikuti panduan berikut untuk menambah skenario pengujian baru:

1. **Buat Page Object** (jika diperlukan):
   - Tambahkan file baru di `page-objects/` (contoh: `SettingsPage.js`).
   - Extend dari `BasePage.js` untuk inherit fungsi umum (`tap`, `waitForDisplayed`, `screenshot`, dll.).

2. **Buat File Test**:
   - Buat file baru di dalam folder `tests/<nama-fitur>/` (contoh: `tests/settings/settings.test.js`).
   - Penamaan file harus berakhiran `.test.js` (sesuai pattern di `wdio.conf.js`).

3. **Tambahkan Script di `package.json`** (opsional):
   ```json
   "test:settings": "wdio run wdio.conf.js --spec tests/settings/*.test.js"
   ```

4. **Gunakan Hooks Mocha** untuk setup/teardown:
   ```js
   before(async () => { /* setup sebelum suite */ })
   beforeEach(async () => { /* setup sebelum tiap test */ })
   afterEach(async () => { /* cleanup setelah tiap test */ })
   after(async () => { /* cleanup setelah suite */ })
   ```

---

## ❓ Troubleshooting

**`Error: Appium server port is already in use (4723)`**
> Ada proses Appium yang masih berjalan. Matikan dengan:
> - Linux/Mac: `kill -9 $(lsof -t -i:4723)`
> - Windows: Buka Task Manager → cari `node.exe` → End Task

**`Could not find a connected Android device`**
> Emulator belum berjalan atau device belum terdeteksi. Jalankan `adb devices` untuk cek. Jika hasilnya `unauthorized`, izinkan pop-up USB Debugging di layar HP.

**`Session not created / UiAutomator2 failed to start`**
> Coba uninstall `Appium Settings` dan `UiAutomator2 Server` dari HP/emulator (Settings → Apps), lalu jalankan test lagi agar Appium menginstall ulang.

**`Element not found / Timeout`**
> Cek `screenshots/` untuk melihat tampilan terakhir saat test gagal. Kemungkinan locator di `page-objects/` sudah tidak sesuai dengan UI terbaru — update accessibility ID di file Page Object yang bersangkutan.

**`Network Error` saat ApiHelper memanggil Backend**
> Pastikan Backend sudah berjalan (`docker-compose up -d`) dan `API_BASE_URL` di `.env` menunjuk ke IP yang benar (`10.0.2.2:3000` untuk emulator, IP LAN untuk real device).

**`base64` foto tidak diterima API**
> Pastikan string Base64 menggunakan format lengkap dengan prefix MIME type:
> ```
> data:image/jpeg;base64,/9j/4AAQSkZJRgAB...
> ```
> Jangan kirim raw Base64 tanpa prefix tersebut.

---

## 🔗 Hubungan dengan Repositori Lain

| Repositori | Peran |
|---|---|
| `football-community-be` | Repositori UTAMA — berisi `docker-compose.yml` untuk menjalankan semua service |
| `kickoff` | Source code aplikasi mobile yang diuji di sini |
| `api-gateway` | Entry point API yang diakses `API_BASE_URL` |
| `appium-tests` ← *Kamu di sini* | Folder E2E automation test ini |
