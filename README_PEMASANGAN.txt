PENDAMPING AKADEMIK – PAKET PREDIKSI CPNS 2.000 SOAL
=================================================

STRUKTUR:
cpns/index.html           : dashboard CPNS
cpns/skd/index.html       : simulasi SKD 110 butir 100 menit
cpns/twk/index.html       : latihan TWK dari 500 entri
cpns/tiu/index.html       : latihan TIU dari 500 entri
cpns/tkp/index.html       : latihan TKP dari 500 entri
cpns/skb/index.html       : latihan SKB lintas jabatan dari 500 entri
cpns/bank-soal/*.json     : empat bank terpisah; perbaiki soal di sini
cpns/assets/figural/*.png : 50 set penalaran gambar TIU (diagram PNG)
cpns/assets/foto-persiapan-cpns.jpg : foto realistis AI
cpns/assets/app.js        : logika ujian, timer, koreksi dan rekap
cpns/assets/app.css       : tampilan responsive
cpns/blogger/             : enam kode iframe untuk Blogger

CARA PAKAI:
1. Upload folder cpns utuh ke repository GitHub (pertahankan nama folder dan subfolder).
2. Aktifkan GitHub Pages pada root branch main atau sesuai konfigurasi.
3. Contoh URL: https://USERNAME.github.io/REPO/cpns/ dan /cpns/skd/.
4. Salin HTML iframe dari cpns/blogger; ubah USERNAME dan NAMA-REPOSITORI.
5. Tempel iframe ke halaman Blogger pada Tampilan HTML.
6. Bila revisi satu soal, perbarui hanya JSON terkait di GitHub dan commit.
7. Bila revisi satu gambar, gantikan PNG/JPG dengan nama file sama dan commit.
8. Jika dibuka langsung lewat file://, browser mungkin menolak pembacaan JSON. Uji melalui GitHub Pages atau jalankan python -m http.server pada direktori induk.

CATATAN CAKUPAN:
- 500 entri TWK, 500 TIU, 500 TKP, 500 SKB; total 2.000.
- 750 entri SKD awal dipertahankan dan 750 entri tambahan dibuat.
- Banyak soal adalah varian kontekstual dari keluarga konsep yang sama; BUKAN 2.000 naskah asli CAT 2021–2026.
- Format skor SKD reguler mengacu KepmenPANRB 321 Tahun 2024; TWK 65, TIU 80, TKP 166; total 110 soal, 100 menit.
- TKP memakai bobot 1–5 simulatif untuk masing-masing pilihan, bukan bobot empiris resmi BKN.
- SKB umum lintas jabatan tidak mewakili materi spesifik seluruh jabatan; jumlah dan skor latihan bukan aturan resmi SKB.
- Kunci, bobot, pembahasan, materi figural perlu telaah pakar dan uji empiris sebelum komersialisasi.
- Bank dan kunci dalam JSON dapat dilihat publik pada GitHub Pages. Untuk produk berbayar memerlukan backend dan kontrol akses.

RUJUKAN RESMI:
https://jdih.menpan.go.id/dokumen-hukum/keputusan-menteri-pendayagunaan-aparatur-negara-dan-reformasi-birokrasi-nomor-321-tahun-2024-tentang-1851
https://peraturan.bpk.go.id/Details/294203/permen-panrb-no-6-tahun-2024
