/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PresetMapel {
  id: string;
  mataPelajaran: string;
  fase: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  kelas: string;
  jpPerMinggu: number;
  teksCP: string;
  namaMadrasahDefault: string;
}

export const PRESETS_MAPEL: PresetMapel[] = [
  {
    id: "pancasila-mi-b",
    mataPelajaran: "Pendidikan Pancasila",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 4,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Pancasila:\nPeserta didik mampu mengidentifikasi dan mempraktikkan nilai-nilai luhur Pancasila dalam kehidupan sehari-hari (gotong royong, keadilan, kebersamaan). Melalui pilar cinta tanah air, menumbuhkan rasa bangga dan nasionalisme islami yang damai.\n\nElemen NKRI:\nPeserta didik mampu menjelaskan identitas diri, keluarga, dan lingkungan sekitar dalam bingkai kebhinekaan serta melatih kepedulian sosial berkesadaran tinggi."
  },
  {
    id: "indo-mi-b",
    mataPelajaran: "Bahasa Indonesia",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 4,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Membaca & Memirsa:\nPeserta didik memahami gagasan utama dan penjelas dari teks deskripsi dan narasi. Mampu membaca lancar dengan lafal dan intonasi tepat, menyerap pesan moral welas asih dan empati sosial.\n\nElemen Menulis:\nPeserta didik terampil mengekspresikan ide, perasaan, dan imajinasinya dalam paragraf sederhana terstruktur dengan penuh kegembiraan dan berkesadaran."
  },
  {
    id: "matematika-mi-b",
    mataPelajaran: "Matematika",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 4,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Bilangan:\nPeserta didik memahami nilai tempat bilangan cacah hingga 10.000, melakukan operasi penjumlahan, pengurangan, perkalian, pecahan sederhana dengan metode konkret yang fungsional dan bermakna.\n\nElemen Geometri & Pengukuran:\nPeserta didik mampu membandingkan panjang, berat, derajat sudut benda nyata di lingkungan madrasah secara interaktif."
  },
  {
    id: "ipas-mi-b",
    mataPelajaran: "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 4,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Sains (IPA):\nPeserta didik mengamati dan melestarikan bagian tubuh tumbuhan serta hewan di lingkungan sekolah. Menumbuhkan kesadaran ekoteologi cinta alam ciptaan Allah SWT.\n\nElemen Sosial (IPS):\nPeserta didik mengapresiasi keragaman sosial budaya di wilayah kabupaten/kita dalam bingkai moderasi beragama."
  },
  {
    id: "inggris-mi-b",
    mataPelajaran: "Bahasa Inggris",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Listening & Speaking:\nPeserta didik mampu berinteraksi menggunakan ungkapan santun sederhana (perkenalan, menyapa, berterima kasih) guna membangun kepercayaan diri sosial global.\n\nElemen Reading & Writing:\nPeserta didik mengenali kosakata tentang hobi, keluarga, dan benda kelas melalui nyanyian dan permainan komunikatif yang menggembirakan."
  },
  {
    id: "pjok-mi-b",
    mataPelajaran: "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 3,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Keterampilan Gerak:\nPeserta didik mempraktikkan variasi gerak lokomotor, non-lokomotor, dan manipulatif dalam olahraga tradisional maupun modern secara bugar dan sportif.\n\nElemen Perilaku Sehat:\nPeserta didik membiasakan menjaga kebersihan diri, merawat tubuh, serta gizi seimbang sebagai bentuk bersyukur atas nikmat kesehatan dari Allah SWT."
  },
  {
    id: "senibudaya-mi-b",
    mataPelajaran: "Seni dan Budaya",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 3,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Apresiasi Seni:\nPeserta didik mampu mengeksplorasi garis, warna, bentuk dasar dalam membuat prakarya atau seni rupa sederhana yang bermakna estetis islami.\n\nElemen Ekspresi:\nPeserta didik dapat menyanyikan lagu nasional, daerah, maupun lagu religi madrasah dengan intonasi harmonis penuh kegembiraan batin (Joyful Learning)."
  },
  {
    id: "qurdis-mi-b",
    mataPelajaran: "Al-Qur'an Hadis",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Al-Qur'an:\nPeserta didik mampu membaca Al-Qur'an secara tartil khususnya surah-surah pendek pilihan (Ad-Duha sampai Al-Humazah), memahami hukum tajwid dasar (alif lam syamsiyah dan qamariyah, idzhar, ikhfa) dengan rasa cinta mendalam.\n\nElemen Hadis:\nPeserta didik menghafal hadis tentang niat dan hadis persahabatan guna membangun karakter berwelas asih (KBC)."
  },
  {
    id: "akidah-mi-b",
    mataPelajaran: "Akidah Akhlak",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Akidah:\nPeserta didik meyakini rukun iman, asmaul husna (As-Sami', Al-Bashir), sifat mulia malaikat Allah untuk membangun rasa bersyukur (Teologi Cinta).\n\nElemen Akhlak:\nPeserta didik membiasakan akhlak terpuji (hormat, patuh, kasih sayang kepada orang tua, guru, teman) dan menjauhi perundungan (anti-bullying)."
  },
  {
    id: "fikih-mi-b",
    mataPelajaran: "Fikih",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Ibadah:\nPeserta didik memahami ketentuan shalat berjamaah, shalat jamak qashar, serta hikmah berpuasa Ramadhan sebagai bentuk ekspresi pengabdian penuh kerinduan kepada Allah.\n\nElemen Akhlak Ibadah:\nPeserta didik senang mengamalkan dzikir dan doa sesudah shalat secara khusyuk bersandarkan cinta ilahi."
  },
  {
    id: "ski-mi-b",
    mataPelajaran: "Sejarah Kebudayaan Islam (SKI)",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Jazirah Arab:\nPeserta didik mengenal keadaan alam dan sosial masyarakatArab sebelum Islam sebagai hikmah dan pelajaran sejarah masa lampau.\n\nElemen Dakwah Rasulullah:\nPeserta didik keteladanan akhlak mulia Nabi Muhammad SAW dalam menyebarkan perdamaian, persaudaraan, dan sifat pemaaf di awal dakwah beliau."
  },
  {
    id: "arabic-mi-b",
    mataPelajaran: "Bahasa Arab",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Istima' & Kalam:\nPeserta didik melafalkan kosakata bahasa Arab tentang peralatan sekolah, nama pelajaran, dan keluarga dekat secara komunikatif.\n\nElemen Qira'ah & Kitabah:\nPeserta didik mengenali dan menyalin kalimat sederhana secara estetis penuh kesadaran pembelajaran bermakna."
  },
  {
    id: "koding-mi-b",
    mataPelajaran: "Koding",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Logika & Algoritma:\nPeserta didik memahami konsep runutan logika sederhana, arah, langkah terstruktur melalui permainan visual blok kode (Scratch Jr) yang menyenangkan.\n\nElemen Pemecahan Masalah:\nPeserta didik mengasah ketekunan secara kolaboratif memecahkan tantangan game petualangan, memperteguh pilar cinta ilmu dan kreativitas digital."
  },
  {
    id: "sunda-mi-b",
    mataPelajaran: "Bahasa Sunda",
    fase: "B",
    kelas: "III & IV (MI)",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Regepan & Nyarita:\nPeserta didik mahir ngaregepkeun carita pondok atawa dongéng Sunda nu ngandung papatah asih, sarta nyarita ngagunakeun basa lemes ka kolot jeung guru dina kahirupan sapopoé.\n\nElemen Maca & Nulis:\nPeserta didik mikawanoh istilah sabudeureun kulawarga, pakakas dapur, jeung ngajaga kaséhatan salaku bukti cinta diri jeung sasama."
  }
];
