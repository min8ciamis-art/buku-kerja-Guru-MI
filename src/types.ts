/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IdentitasMadrasah {
  namaMadrasah: string;
  mataPelajaran: string;
  fase: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  kelas: string;
  semester: 'Ganjil' | 'Genap' | 'Satu Tahun';
  tahunPelajaran: string;
  guruNama: string;
  kepalaNama: string;
  nipGuru: string;
  nipKepala: string;
}

export interface KaldikData {
  mingguGanjil: number;
  mingguGenap: number;
  jpPerMinggu: number;
}

export interface TPItem {
  id: string;
  kompetensi: string;
  materi: string;
  rumusanTP: string;
  jp: number;
  semester: 'Ganjil' | 'Genap';
}

export interface ATPItem {
  no: number;
  tpId: string;
  rumusanTP: string;
  materiPokok: string;
  alokasiWaktu: number;
  dimensiP5PPRA: string; // Profil Pelajar Pancasila & Rahmatan lil Alamin (PPRA is characteristic of Madrasah Merdeka)
}

export interface ProtaItem {
  no: number;
  semester: 'Ganjil' | 'Genap';
  tpId: string;
  rumusanTP: string;
  materiPokok: string;
  alokasiWaktu: number;
}

export interface PromesWeek {
  bulan: string;  // e.g. "Juli"
  mingguIndex: number; // 1, 2, 3, 4, 5
  status: 'JP' | 'L' | 'UH' | 'STS' | 'SAS' | null; // JP = Jam Pelajaran, L = Libur, UH = Ulangan Harian, STS = Sumatif Tengah Semester, SAS = Sumatif Akhir Semester
  jpCount?: number;
}

export interface PromesItem {
  tpId: string;
  rumusanTP: string;
  alokasiWaktu: number;
  distribusi: { [key: string]: string }; // key is "Bulan-W(index)" e.g. "Juli-W1": "4", "Agustus-W2": "UH"
}

export interface ModulAjarBrief {
  tujuan: string;
  langkahKegiatan: {
    pendahuluan: string[];
    inti: string[];
    penutup: string[];
  };
  rencanaAsesmen: {
    formatif: string;
    sumatif: string;
  };
}

export interface BukuKerja1Data {
  rancanganModulAjar: ModulAjarBrief;
}

export interface BukuKerja2Data {
  kodeEtikGuru: string[];
  analisisMingguEfektif: {
    ganjil: {
      totalMinggu: number;
      mingguTidakEfektif: number;
      mingguEfektif: number;
      totalJP: number;
      rincianTidakEfektif: string;
    };
    genap: {
      totalMinggu: number;
      mingguTidakEfektif: number;
      mingguEfektif: number;
      totalJP: number;
      rincianTidakEfektif: string;
    };
  };
  jurnalAgendaMengajar: Array<{
    hariTanggal: string;
    kelas: string;
    jamKe: string;
    tpId: string;
    materiPokok: string;
    pencapaian: string;
    keterangan: string;
  }>;
}

export interface BukuKerja3Data {
  kisikisiAsesmen: Array<{
    no: number;
    tpId: string;
    materi: string;
    indikatorSoal: string;
    bentukSoal: string;
    levelKognitif: string;
  }>;
  programRemedial: {
    metode: string;
    soalRemedial: string[];
  };
  programPengayaan: {
    aktivitas: string;
    soalPengayaan: string[];
  };
}

export interface BukuKerja4Data {
  lembarRefleksiGuru: Array<{
    aspek: string;
    pertanyaanRefleksi: string;
    jawabanRefleksiGuru: string;
  }>;
  rencanaTindakLanjut: string[];
}

export interface FullMerdekaResponse {
  analisisCP: {
    kompetensi: string[];
    lingkupMateri: string[];
    pesanKekhasanMadrasah: string;
  };
  tujuanPembelajaran: TPItem[];
  alurTujuanPembelajaran: ATPItem[];
  programTahunan: ProtaItem[];
  programSemesterGanjil: {
    bulanList: string[];
    items: PromesItem[];
  };
  programSemesterGenap: {
    bulanList: string[];
    items: PromesItem[];
  };
  bukuKerja1: BukuKerja1Data;
  bukuKerja2: BukuKerja2Data;
  bukuKerja3: BukuKerja3Data;
  bukuKerja4: BukuKerja4Data;
}
