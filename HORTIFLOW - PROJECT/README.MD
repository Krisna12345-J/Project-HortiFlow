# HORTIFLOW

**Sistem Manajemen Operasional & Kanban Board**

HORTIFLOW adalah aplikasi web yang dirancang khusus untuk manajemen alur kerja (*workflow*) operasional. Sistem ini mengelola siklus pekerjaan mulai dari tahap pengumpulan data awal (Intake), pemantauan progres melalui papan Kanban interaktif, hingga pencatatan riwayat aktivitas (Audit Log) secara otomatis untuk mendukung efisiensi pada unit Data & Modernisasi Pertanian di BRMP Hortikultura.

---

## Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS (Vite)
*   **Backend:** Laravel (PHP) / Node.js *(Disesuaikan dengan implementasi final)*
*   **Database:** MySQL / PostgreSQL

---

## Struktur Repositori

Proyek ini menggunakan pendekatan *monorepo*, memisahkan lingkungan *frontend* dan *backend* di dalam satu repositori:

```text
hortiflow-project/
│
├── backend/          # API, Routing, Model, dan Migrasi Database
├── frontend/         # UI React, Komponen Kanban, dan Halaman Dashboard
├── .gitignore        # Pengecualian file dari Git
└── README.md         # Dokumentasi proyek