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
    id: "qurdis-fase-d",
    mataPelajaran: "Al-Qur'an Hadis",
    fase: "D",
    kelas: "VII / Ganjil & Genap",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MTs Negeri 1 Model",
    teksCP: "Elemen Al-Qur'an:\nPeserta didik mampu membaca, menghafal, menganalisis, dan melafalkan ayat Al-Qur'an tentang pentingnya menjaga kelestarian lingkungan hidup dan hubungannya dengan kehidupan sehari-hari secara tartil dan fasih. Peserta didik juga mampu memahami hukum bacaan Qalqalah, Mad Thabi'i, dan Mad Far'i agar dapat membaca Al-Qur'an dengan benar.\n\nElemen Hadis:\nPeserta didik mampu memahami, menghafal, dan mengamalkan hadis riwayat Muslim tentang keutamaan menuntut ilmu dan hadis riwayat Bukhari tentang pentingnya menjaga hubungan silaturahmi dengan sesama manusia dalam kehidupan berbangsa dan bernegara."
  },
  {
    id: "akidah-fase-d",
    mataPelajaran: "Akidah Akhlak",
    fase: "D",
    kelas: "VIII / Ganjil & Genap",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MTs Darul Ulum",
    teksCP: "Elemen Akidah:\nPeserta didik mampu menganalisis sifat-sifat wajib, mustahil, dan jaiz bagi Allah SWT beserta dalil naqli dan aqli. Melalui pemahaman asmaul husna (Al-Ghaffar, Al-Afuw, Al-Hakim), peserta didik mampu memperteguh keyakinan akan kebesaran Allah SWT dalam kehidupan kontekstual.\n\nElemen Akhlak:\nPeserta didik mampu mengidentifikasi dan menghindari akhlak tercela (riya, nifak, khianat) serta membiasakan akhlak terpuji (ikhlas, tawakal, ikhtiar, sabar, syukur) dalam interaksi sosial sehari-hari dengan menjunjung tinggi nilai moderasi beragama."
  },
  {
    id: "fikih-fase-c",
    mataPelajaran: "Fikih",
    fase: "C",
    kelas: "V / Ganjil & Genap",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Negeri 8 Ciamis",
    teksCP: "Elemen Ibadah:\nPeserta didik mampu memahami dan menganalisis ketentuan bersuci dari hadas besar (mandi wajib), hukum khitan bagi laki-laki dan perempuan, serta syarat dan rukun ibadah puasa Ramadhan maupun puasa sunnah. Peserta didik dapat mempraktikkan ibadah tersebut dengan benar sesuai tuntunan syariat.\n\nElemen Muamalah:\nPeserta didik memahami konsep dasar kepemilikan, jual beli dalam Islam, serta ketentuan sedekah, hibah, dan hadiah sebagai wujud kepedulian sosial terhadap sesama umat manusia."
  },
  {
    id: "ski-fase-d",
    mataPelajaran: "Sejarah Kebudayaan Islam (SKI)",
    fase: "D",
    kelas: "IX / Ganjil & Genap",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MTs Nurul Huda",
    teksCP: "Elemen Kebudayaan Islam Klasik:\nPeserta didik mampu menganalisis sejarah perkembangan dakwah Rasulullah SAW pada periode Makkah dan Madinah, serta kepemimpinan Khulafaur Rasyidin yang mencerminkan keteguhan iman dan moderasi beragama.\n\nElemen Nusantara:\nPeserta didik mampu menganalisis sejarah masuknya Islam di Nusantara melalui perdagangan, perkawinan, pengajaran, dan akulturasi budaya lokal serta peran Walisongo dalam menyebarkan Islam yang damai dan inklusif."
  },
  {
    id: "arabic-fase-a",
    mataPelajaran: "Bahasa Arab",
    fase: "A",
    kelas: "II / Ganjil & Genap",
    jpPerMinggu: 2,
    namaMadrasahDefault: "MI Al-Hikmah",
    teksCP: "Elemen Istima' (Mendengar):\nPeserta didik mampu mendengarkan, mengenali, dan membedakan bunyi kosakata bahasa Arab sederhana terkait topik perkenalan (al-ta'aruf) dan peralatan madrasah (al-adawat al-madrasasiah) dengan makhraj yang fasih.\n\nElemen Kalam (Berbicara):\nPeserta didik mampu mengucapkan dialek ungkapan harian sederhana, menyapa, mengenalkan diri, serta bertanya-jawab secara lisan mengenai benda-benda di sekitar kelas dengan rasa percaya diri."
  }
];
