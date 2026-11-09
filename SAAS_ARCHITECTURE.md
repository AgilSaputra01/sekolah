# EDUCORE — MULTI-TENANT SAAS SCHOOL MANAGEMENT PLATFORM
## Technical Architecture & Implementation Documentation

---

### 1. Executive Summary & Architecture Overview

**EduCore** telah dikembangkan dari aplikasi manajemen sekolah tunggal menjadi platform **Multi-Tenant Software-as-a-Service (SaaS)** skala komersial berbasis **React 19**, **TypeScript**, dan **Vite**, dengan arsitektur data terisolasi, provisioning otomatis, manajemen langganan (billing engine), serta dashboard kontrol terpusat (SaaS Controller).

Platform terbagi menjadi tiga pilar utama yang saling terintegrasi:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EDUCORE MULTI-TENANT SAAS                             │
├─────────────────────────┬───────────────────────────┬───────────────────────────┤
│    A. PUBLIC PORTAL     │   B. SAAS CONTROLLER      │    C. SCHOOL APPLICATION  │
│  - Marketing Website    │  - Tenant & School Ops    │  - Dashboard & Analytics  │
│  - Dynamic Pricing      │  - Product & Plan Mgmt    │  - Student & Teacher Data │
│  - 5-Step Registration  │  - Subscriptions & Billing│  - Rombel & Academic Tree │
│  - Multi-Payment Check  │  - Domain & SSL Control   │  - e-Rapor & Kurikulum    │
│  - Tenant Provisioning  │  - Audit Logs & Gateway   │  - 7-Tier RBAC Matrix     │
└─────────────────────────┴───────────────────────────┴───────────────────────────┘
```

---

### 2. User Journey & Alur Pengguna End-to-End

```mermaid
flowchart TD
    A["Pengunjung Membuka Website EduCore"] --> B["Eksplorasi Fitur & Produk SaaS"]
    B --> C["Pilih Paket (Free Trial / Basic / Pro / Enterprise)"]
    C --> D["Registrasi Multi-Step: Info Sekolah & Subdomain"]
    D --> E["Registrasi Akun Administrator Sekolah"]
    E --> F["Checkout & Pilihan Metode Pembayaran (VA/QRIS)"]
    F --> G["Verifikasi Pembayaran / Instant Free Trial"]
    G --> H["Idempotent Tenant Provisioning Engine"]
    H --> I["Pembuatan Database Tenant, Subdomain, & RBAC"]
    I --> J["Aktivasi Lisensi & Redirect ke Dashboard Sekolah"]
    J --> K["Sekolah Mengelola Siswa, Guru, & Kurikulum"]
```

---

### 3. Modul & Implementasi Komponen

#### A. Modul Marketing Website (`MarketingLandingView.tsx`)
- **Navbar Publik**: Logo EduCore, Menu (Beranda, Fitur, Produk, Harga, Testimoni, FAQ), tombol akses login aplikasi, dan tombol aksi "Daftar Sekolah".
- **Hero Section**: Headline modern digitalisasi sekolah, ringkasan produk, CTA button, metrik kepercayaan (120+ sekolah, 45.000+ siswa, 99.9% uptime SLA), dan mockup dashboard aplikasi interaktif dengan glassmorphic styling.
- **Section Keunggulan**: 6 pilar manajemen: data sekolah, manajemen siswa & guru, struktur rombel & wali kelas, RBAC 7 role, otomasi SPP online, dan e-rapor siap cetak.
- **Section Produk**: Showcase produk SaaS: *EduCore School Core*, *Academic & e-Rapor*, *Smart Finance & SPP*, *Attendance & RFID*, dan *Parent Mobile App*.
- **Section Pricing Dinamis**: 4 paket langganan (*Free Trial 14 hari, Basic, Professional, Enterprise*) dengan toggle tagihan Bulanan / Tahunan (hemat 16% + 2 bulan gratis). **Harga dan fitur dikelola secara real-time melalui SaaS Controller**.
- **FAQ Accordion**: 5 pertanyaan umum mencakup keamanan isolasi data, integrasi domain .sch.id, masa percobaan, dan migrasi data.
- **Testimonial**: Ulasan riil kepala sekolah dan ketua yayasan dengan foto, rating bintang, dan profil sekolah.
- **Footer**: Identitas platform, tautan cepat, sertifikasi keamanan (ISO 27001 Ready, SSL 256-bit, Server Indonesia), dan kontak support.

#### B. Modul Registrasi Sekolah 5 Langkah (`SchoolRegistrationView.tsx`)
- **Step 1 — Info Sekolah**: Nama sekolah, NPSN resmi, jenjang (PAUD, TK, SD, SMP, SMA, SMK, MA, MTs), status (Negeri/Swasta), alamat lengkap, provinsi, kota, kecamatan, telepon, email, serta **live subdomain availability checker** (`nama-sekolah.educore.id`).
- **Step 2 — Info Administrator**: Nama lengkap admin, jabatan (Kepala Sekolah/IT), email login, nomor WhatsApp, password, dan konfirmasi password.
- **Step 3 — Pemilihan Paket**: Pemilihan tier paket dan siklus penagihan dengan kartu interaktif dan ringkasan kuota siswa & staf.
- **Step 4 — Checkout & Pembayaran**: Ringkasan invoice (Subtotal, PPN 11%, Biaya Transaksi Sistem, Total), pilihan metode pembayaran (Virtual Account BCA, Mandiri, BRI, QRIS, Transfer Bank, atau Free Trial), dan persetujuan ToS/SLA.
- **Step 5 — Provisioning Progress & Konfirmasi**: Animasi status provisioning 5 tahap (Verifikasi data, alokasi subdomain DNS, isolasi database, pembuatan akun admin, struktur akademik awal), tampilan kredensial akses resmi, dan tombol satu klik masuk ke Dashboard Sekolah.

#### C. Modul SaaS Controller (`SaaSControllerView.tsx`)
- **Overview**: 8 KPI card statistik (Total sekolah, sekolah aktif, sekolah trial, sekolah suspended, total pendapatan terbayar, total pengguna, subscription aktif, jatuh tempo segera), grafik visual pertumbuhan tenant bulanan, dan grafik distribusi paket langganan.
- **School / Tenant Management**: Tabel seluruh sekolah dengan pencarian dan filter status; modal detail sekolah; aktivasi kembali; penangguhan (suspend) dengan catatan alasan; penghapusan permanen dengan double confirmation; serta tombol **"Buka Tenant" (direct tenant impersonation)**.
- **Product Management**: Manajemen modul/produk SaaS (tambah, edit, hapus, atur harga dasar, status, dan fitur utama).
- **Subscription Plans**: Manajemen tier paket (Free, Basic, Professional, Enterprise); pengaturan harga bulanan & tahunan, limit kuota siswa, kuota staf, masa trial, dan daftar fitur yang langsung tersinkronisasi ke halaman pricing publik.
- **Subscription Management**: Pemantauan masa aktif lisensi seluruh sekolah, modal perpanjangan masa aktif (extend 1, 3, 6, 12 bulan), dan upgrade paket tenant.
- **Transaction & Payment**: Log transaksi invoice (`INV/2026/...`), status *Paid, Pending, Failed, Refunded*, verifikasi manual invoice, dan modal pratinjau invoice resmi.
- **Domain Management**: Tabel routing subdomain resmi (`.educore.id`), status verifikasi SSL Let's Encrypt, status DNS, widget cek ketersediaan subdomain, dan modal integrasi Custom Domain (`portal.sekolah.sch.id`).
- **System Settings**: Pengaturan metadata platform, pilihan gateway pembayaran aktif (*Midtrans, Xendit, Manual*), konfigurasi SMTP email notifikasi, tarif PPN, dan tabel riwayat **Audit Log Platform**.

#### D. Tenant Provisioning Engine (`provisioningService.ts`)
- **Idempotency Guard**: Memeriksa duplikasi NPSN dan ketersediaan subdomain sebelum eksekusi.
- **Tenant Entity Generator**: Mengalokasikan Tenant ID unik (`sch-XXXXXX`), menghubungkan relasi sekolah, membuat akun Admin Sekolah dengan role RBAC level tertinggi di tenant tersebut.
- **Academic Structure Bootstrapping**: Otomatis menginisialisasi Tahun Ajaran aktif default (2026/2027), Semester 1 & 2, serta jenjang awal sekolah.
- **Billing & DNS Binding**: Menerbitkan invoice transaksi, membuat rekaman langganan aktif sesuai kuota paket, dan mendaftarkan subdomain resmi.

#### E. School Management Application (Integrasi Halaman Existing)
- Seluruh 8 halaman existing dipertahankan 100%:
  1. `DashboardView` (ditambahkan kartu indikator kuota siswa & paket aktif tenant).
  2. `SchoolManagementView` (profil & master sekolah).
  3. `UserManagementView` (pengelolaan pengguna tenant).
  4. `RolePermissionView` (matriks hak akses 7 role).
  5. `StudentManagementView` (biodata siswa, NIS, NISN, orang tua).
  6. `TeacherStaffManagementView` (guru dan staf tata usaha).
  7. `AcademicStructureView` (tahun ajaran, semester, jenjang, kelas, rombel, wali kelas).
  8. `SettingsView` (pengaturan profil dan data).
- **Tenant Guard**: Sekolah dengan status `Suspended` secara otomatis dibatasi aksesnya dengan tampilan pemberitahuan penangguhan yang aman dan santun.

---

### 4. Relational Database Schema Specification (`src/database/schema.sql`)

Database relasional dirancang menggunakan standar PostgreSQL 15+ dengan 13 entitas utama:

| Entitas | Deskripsi |
| :--- | :--- |
| `platform_users` | Akun Super Admin SaaS dan operator penagihan platform global. |
| `tenants` | Wadah isolasi logis tenant dengan subdomain unik dan isolasi RLS. |
| `schools` | Data profil sekolah, NPSN unik, jenjang, alamat, dan kontak resmi. |
| `products` | Katalog modul SaaS (Core, Akademik, Keuangan, Absensi, Mobile). |
| `plans` | Master paket langganan (Free, Basic, Professional, Enterprise). |
| `plan_features` | Pemetaan relasi fitur dan kuota tiap paket berlangganan. |
| `subscriptions` | Rekaman lisensi tenant sekolah dengan start_date, end_date, dan auto-renew. |
| `transactions` | Transaksi penagihan, kode invoice, rincian pajak, dan status pembayaran. |
| `invoices` | Entitas invoice resmi PDF dengan tanggal jatuh tempo dan rincian kontak. |
| `domains` | Pemetaan subdomain resmi (`.educore.id`), custom domain, SSL, dan DNS. |
| `tenant_settings` | Kustomisasi tampilan, kuota batas siswa/staf, dan integrasi WhatsApp. |
| `roles` & `permissions` | Role-based access control per tenant (Admin, Kepala Sekolah, Guru, Siswa, dll). |
| `users` | Akun pengguna terikat `tenant_id` dan `school_id`. |
| `audit_logs` | Jejak audit keamanan platform untuk setiap aksi krusial sistem. |
| `sp_provision_tenant` | Stored procedure transaksi ACID untuk provisioning tenant idempotent. |

---

### 5. Service Adapter Layer (`paymentGatewayAdapter.ts`)

Untuk kesiapan produksi komersial, integrasi pembayaran eksternal diimplementasikan menggunakan **Adapter Pattern**:

```typescript
export interface IPaymentGatewayAdapter {
  name: string;
  createTransaction(payload: PaymentRequestPayload): Promise<PaymentResponseResult>;
  verifyPaymentStatus(transactionId: string): Promise<PaymentResponseResult>;
  cancelTransaction(transactionId: string): Promise<boolean>;
}
```

Implementasi yang disediakan:
1. `MidtransAdapter`: Integrasi Snap & Core API (Virtual Account Bank BCA, Mandiri, BRI, BNI & QRIS).
2. `XenditAdapter`: Integrasi Xendit Invoice & Virtual Account.
3. `ManualBankTransferAdapter`: Verifikasi rekening giro escrow perusahaan via transfer manual.

---

### 6. Hasil Verifikasi & Build Status

- **TypeScript Compilation**: `tsc -b` lulus tanpa error (0 errors).
- **Vite Production Build**: `vite build` selesai dalam 1.04 detik dengan chunk output teroptimasi.
- **Linter Check**: `oxlint` lulus dengan 0 errors pada 32 file sumber.
- **Backward Compatibility**: Seluruh 8 modul manajemen sekolah existing berfungsi normal tanpa gangguan.

