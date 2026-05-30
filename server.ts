/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Gemini Client is initialized safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // POST: Generate Madrasah Curriculum breakdown (KMA 450 Tahun 2024)
  app.post('/api/generate-merdeka', async (req, res) => {
    try {
      const { identitas, teksCP, kaldik } = req.body;

      if (!teksCP) {
        return res.status(400).json({ error: 'Teks Capaian Pembelajaran (CP) diperlukan.' });
      }

      const {
        namaMadrasah = 'Madrasah',
        mataPelajaran = 'Umum',
        fase = 'D',
        kelas = 'VII',
        semester = 'Satu Tahun',
        tahunPelajaran = '2026/2027',
        guruNama = 'Guru',
        kepalaNama = 'Kepala Madrasah',
        nipGuru = '-',
        nipKepala = '-',
      } = identitas || {};

      const {
        mingguGanjil = 18,
        mingguGenap = 16,
        jpPerMinggu = 2,
      } = kaldik || {};

      const client = getGeminiClient();

      const systemInstruction = `Anda adalah Pakar Kurikulum Merdeka Madrasah (Kemenag RI) dan ahli administrasi guru profesional tingkat nasional.
Tugas Anda adalah mem-breakdown Capaian Pembelajaran (CP) yang diberikan oleh guru sesuai dengan regulasi KMA Nomor 450 Tahun 2024 dan Panduan Pembelajaran & Asesmen (PPA) Kemenag.
Hasilkan dokumen perangkat administrasi mengajar lengkap (TP, ATP, Prota, Promes, serta Buku Kerja 1, 2, 3, 4) dalam satu objek JSON terstruktur yang mematuhi skema yang ditentukan.

Integrasikan KEKHASAN MADRASAH dan nilai-nilai Moderasi Beragama, Akhlakul Karimah, serta Profil Pelajar Rahmatan lil Alamin (PPRA) ke dalam TP, Modul Ajar, dan Buku Kerja.
Penting untuk menghitung alokasi JP secara realistis:
- Alokasi JP per minggu adalah ${jpPerMinggu} JP.
- Jumlah minggu efektif semester ganjil adalah ${mingguGanjil} minggu (Total JP Ganjil = ${mingguGanjil * jpPerMinggu} JP).
- Jumlah minggu efektif semester genap adalah ${mingguGenap} minggu (Total JP Genap = ${mingguGenap * jpPerMinggu} JP).
- Hasilkan sekitar 3-5 Tujuan Pembelajaran (TP) yang logis, distribusikan secara merata antara Semester Ganjil dan Genap. Jumlahkan total JP dari tiap TP agar tepat sesuai dengan jumlah JP efektif per semester!
- Di Program Semester (Promes), buatlah daftar bulan-bulan yang sesuai (misal ganjil: Juli, Agustus, September, Oktober, November, Desember; genap: Januari, Februari, Maret, April, Mei, Juni). Untuk kolom distribusi Promes, petakan secara logis berapa JP yang diberikan tiap minggu efektif (misal, "2"), dan di minggu tertentu masukkan status seperti "UH" (Ulangan Harian), "STS" (Sumatif Tengah Semester), atau "SAS" (Sumatif Akhir Semester).`;

      const promptUser = `
Silakan proses data berikut untuk membuat Dokumen Administrasi Kurikulum Merdeka Madrasah Lengkap:

IDENTITAS MADRASAH & MATA PELAJARAN:
- Nama Madrasah: ${namaMadrasah}
- Mata Pelajaran: ${mataPelajaran}
- Fase: ${fase} / Kelas: ${kelas}
- Semester: ${semester}
- Tahun Pelajaran: ${tahunPelajaran}
- Guru Pengampu: ${guruNama} (NIP: ${nipGuru})
- Kepala Madrasah: ${kepalaNama} (NIP: ${nipKepala})

DATA KALENDER PENDIDIKAN (KALDIK):
- JP per Minggu: ${jpPerMinggu} JP
- Minggu Efektif Ganjil: ${mingguGanjil} minggu (Total JP Efektif Ganjil: ${mingguGanjil * jpPerMinggu} JP)
- Minggu Efektif Genap: ${mingguGenap} minggu (Total JP Efektif Genap: ${mingguGenap * jpPerMinggu} JP)

TEKS CAPAIAN PEMBELAJARAN (CP):
${teksCP}

Hasilkan data JSON dengan skema yang diberikan. Berikan uraian yang profesional, rinci, bebas dari placeholder [W1] dan sejenisnya jika kemungkinan, tulislah dengan konten lengkap yang berkualitas tinggi siap pakai oleh pengawas madrasah.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptUser,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1, // more deterministic for curriculum building
          responseSchema: {
            type: Type.OBJECT,
            required: [
              'analisisCP',
              'tujuanPembelajaran',
              'alurTujuanPembelajaran',
              'programTahunan',
              'programSemesterGanjil',
              'programSemesterGenap',
              'bukuKerja1',
              'bukuKerja2',
              'bukuKerja3',
              'bukuKerja4',
            ],
            properties: {
              analisisCP: {
                type: Type.OBJECT,
                required: ['kompetensi', 'lingkupMateri', 'pesanKekhasanMadrasah'],
                properties: {
                  kompetensi: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Daftar kata kerja kompetensi hasil analisis CP.',
                  },
                  lingkupMateri: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Daftar lingkup materi hasil analisis CP.',
                  },
                  pesanKekhasanMadrasah: {
                    type: Type.STRING,
                    description: 'Narasi integrasi nilai moderasi beragama, akhlakul karimah, atau PPRA yang relevan dengan materi ini.',
                  },
                },
              },
              tujuanPembelajaran: {
                type: Type.ARRAY,
                description: 'Daftar Tujuan Pembelajaran yang dikembangkan dari CP.',
                items: {
                  type: Type.OBJECT,
                  required: ['id', 'kompetensi', 'materi', 'rumusanTP', 'jp', 'semester'],
                  properties: {
                    id: { type: Type.STRING, description: 'Kode TP, misal: TP-1, TP-2, dst.' },
                    kompetensi: { type: Type.STRING, description: 'Kompetensi utama dalam TP.' },
                    materi: { type: Type.STRING, description: 'Materi pokok dalam TP.' },
                    rumusanTP: { type: Type.STRING, description: 'Rumusan TP lengkap yang berkarakter madrasah.' },
                    jp: { type: Type.INTEGER, description: 'Alokasi waktu dalam JP.' },
                    semester: { type: Type.STRING, description: 'Ganjil atau Genap' },
                  },
                },
              },
              alurTujuanPembelajaran: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ['no', 'tpId', 'rumusanTP', 'materiPokok', 'alokasiWaktu', 'dimensiP5PPRA'],
                  properties: {
                    no: { type: Type.INTEGER },
                    tpId: { type: Type.STRING },
                    rumusanTP: { type: Type.STRING },
                    materiPokok: { type: Type.STRING },
                    alokasiWaktu: { type: Type.INTEGER },
                    dimensiP5PPRA: { type: Type.STRING, description: 'Dimensi P5-PPRA yang disasar, misalnya Berkeadaban (Ta’addub), Keteladanan (Qudwah), dst.' },
                  },
                },
              },
              programTahunan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ['no', 'semester', 'tpId', 'rumusanTP', 'materiPokok', 'alokasiWaktu'],
                  properties: {
                    no: { type: Type.INTEGER },
                    semester: { type: Type.STRING },
                    tpId: { type: Type.STRING },
                    rumusanTP: { type: Type.STRING },
                    materiPokok: { type: Type.STRING },
                    alokasiWaktu: { type: Type.INTEGER },
                  },
                },
              },
              programSemesterGanjil: {
                type: Type.OBJECT,
                required: ['bulanList', 'items'],
                properties: {
                  bulanList: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '6 nama bulan semester ganjil (biasanya Juli s.d. Desember).',
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ['tpId', 'rumusanTP', 'alokasiWaktu', 'distribusi'],
                      properties: {
                        tpId: { type: Type.STRING },
                        rumusanTP: { type: Type.STRING },
                        alokasiWaktu: { type: Type.INTEGER },
                        distribusi: {
                          type: Type.OBJECT,
                          description: 'Pemetaan JP per minggu. Contoh key: "Bulan-W1": "2", "Bulan-W2": "UH", "Bulan-W3": "STS", "Bulan-W4": "" (kosong jika tidak ada JP).',
                        },
                      },
                    },
                  },
                },
              },
              programSemesterGenap: {
                type: Type.OBJECT,
                required: ['bulanList', 'items'],
                properties: {
                  bulanList: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '6 nama bulan semester genap (biasanya Januari s.d. Juni).',
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ['tpId', 'rumusanTP', 'alokasiWaktu', 'distribusi'],
                      properties: {
                        tpId: { type: Type.STRING },
                        rumusanTP: { type: Type.STRING },
                        alokasiWaktu: { type: Type.INTEGER },
                        distribusi: {
                          type: Type.OBJECT,
                          description: 'Pemetaan JP per minggu. Contoh key: "Bulan-W1": "2", "Bulan-W2": "UH", "Bulan-W3": "SAS", "Bulan-W4": "" (kosong jika tidak ada JP).',
                        },
                      },
                    },
                  },
                },
              },
              bukuKerja1: {
                type: Type.OBJECT,
                required: ['rancanganModulAjar'],
                properties: {
                  rancanganModulAjar: {
                    type: Type.OBJECT,
                    required: ['tujuan', 'langkahKegiatan', 'rencanaAsesmen'],
                    properties: {
                      tujuan: { type: Type.STRING, description: 'Deskripsi tujuan pembelajaran modul ajar' },
                      langkahKegiatan: {
                        type: Type.OBJECT,
                        required: ['pendahuluan', 'inti', 'penutup'],
                        properties: {
                          pendahuluan: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Langkah pendahuluan dengan ciri khas Madrasah (Doa, Tadarus Al-Quran, dll).',
                          },
                          inti: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Langkah pengajaran inti yang interaktif dan bermakna.',
                          },
                          penutup: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Langkah penutup termasuk refleksi dan doa penutup kafarotul majlis.',
                          },
                        },
                      },
                      rencanaAsesmen: {
                        type: Type.OBJECT,
                        required: ['formatif', 'sumatif'],
                        properties: {
                          formatif: { type: Type.STRING, description: 'Penjelasan/instrumen penilaian formatif.' },
                          sumatif: { type: Type.STRING, description: 'Penjelasan/instrumen penilaian sumatif.' },
                      },
                    },
                  },
                },
              },
            },
            bukuKerja2: {
              type: Type.OBJECT,
              required: ['kodeEtikGuru', 'analisisMingguEfektif', 'jurnalAgendaMengajar'],
              properties: {
                kodeEtikGuru: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Rambu-rambu kode etik guru madrasah yang profesional dan islami.',
                },
                analisisMingguEfektif: {
                  type: Type.OBJECT,
                  required: ['ganjil', 'genap'],
                  properties: {
                    ganjil: {
                      type: Type.OBJECT,
                      required: ['totalMinggu', 'mingguTidakEfektif', 'mingguEfektif', 'totalJP', 'rincianTidakEfektif'],
                      properties: {
                        totalMinggu: { type: Type.INTEGER, description: 'Biasanya minggu kalender dalam semester, misal 26.' },
                        mingguTidakEfektif: { type: Type.INTEGER, description: 'Minggu libur/kegiatan lain, misal 8.' },
                        mingguEfektif: { type: Type.INTEGER, description: 'Harus sama dengan input guru: ' + mingguGanjil },
                        totalJP: { type: Type.INTEGER, description: 'Sama dengan mingguEfektif * jpPerMinggu: ' + (mingguGanjil * jpPerMinggu) },
                        rincianTidakEfektif: { type: Type.STRING, description: 'Penjelasan minggu tidak efektif, misal: Libur Semester, STS, SAS, Class Meeting.' },
                      },
                    },
                    genap: {
                      type: Type.OBJECT,
                      required: ['totalMinggu', 'mingguTidakEfektif', 'mingguEfektif', 'totalJP', 'rincianTidakEfektif'],
                      properties: {
                        totalMinggu: { type: Type.INTEGER, description: 'Biasanya minggu kalender dalam semester, misal 26.' },
                        mingguTidakEfektif: { type: Type.INTEGER, description: 'Kira-kira jumlah minggu tidak efektif.' },
                        mingguEfektif: { type: Type.INTEGER, description: 'Harus sama dengan input guru: ' + mingguGenap },
                        totalJP: { type: Type.INTEGER, description: 'Sama dengan mingguEfektif * jpPerMinggu: ' + (mingguGenap * jpPerMinggu) },
                        rincianTidakEfektif: { type: Type.STRING, description: 'Penjelasan minggu tidak efektif, misal: Libur Ramadhan, Asesmen Madrasah, SAS.' },
                      },
                    },
                  },
                },
                jurnalAgendaMengajar: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['hariTanggal', 'kelas', 'jamKe', 'tpId', 'materiPokok', 'pencapaian', 'keterangan'],
                    properties: {
                      hariTanggal: { type: Type.STRING },
                      kelas: { type: Type.STRING },
                      jamKe: { type: Type.STRING },
                      tpId: { type: Type.STRING },
                      materiPokok: { type: Type.STRING },
                      pencapaian: { type: Type.STRING },
                      keterangan: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            bukuKerja3: {
              type: Type.OBJECT,
              required: ['kisikisiAsesmen', 'programRemedial', 'programPengayaan'],
              properties: {
                kisikisiAsesmen: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['no', 'tpId', 'materi', 'indikatorSoal', 'bentukSoal', 'levelKognitif'],
                    properties: {
                      no: { type: Type.INTEGER },
                      tpId: { type: Type.STRING },
                      materi: { type: Type.STRING },
                      indikatorSoal: { type: Type.STRING },
                      bentukSoal: { type: Type.STRING, description: 'Misal: Pilihan Ganda, Uraian, Penugasan.' },
                      levelKognitif: { type: Type.STRING, description: 'Misal: L1, L2, L3 atau C2, C3, C4.' },
                    },
                  },
                },
                programRemedial: {
                  type: Type.OBJECT,
                  required: ['metode', 'soalRemedial'],
                  properties: {
                    metode: { type: Type.STRING, description: 'Penjelasan metode remedial teaching / tutor sebaya.' },
                    soalRemedial: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Daftar 2-3 contoh soal remedial.' },
                  },
                },
                programPengayaan: {
                  type: Type.OBJECT,
                  required: ['aktivitas', 'soalPengayaan'],
                  properties: {
                    aktivitas: { type: Type.STRING, description: 'Penjelasan bentuk aktivitas pengayaan (tutor sebaya, pendalaman materi).' },
                    soalPengayaan: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Daftar 2-3 contoh soal pengayaan tingkat tinggi (HOTS).' },
                  },
                },
              },
            },
            bukuKerja4: {
              type: Type.OBJECT,
              required: ['lembarRefleksiGuru', 'rencanaTindakLanjut'],
              properties: {
                lembarRefleksiGuru: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['aspek', 'pertanyaanRefleksi', 'jawabanRefleksiGuru'],
                    properties: {
                      aspek: { type: Type.STRING },
                      pertanyaanRefleksi: { type: Type.STRING },
                      jawabanRefleksiGuru: { type: Type.STRING },
                    },
                  },
                },
                rencanaTindakLanjut: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar rencana konkret pengembangan diri guru ke depan.',
                },
              },
            },
          },
        },
      },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini did not return any text.');
      }

      // Parse the response text as JSON
      const parsedData = JSON.parse(text.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error('Error in /api/generate-merdeka:', error);
      res.status(500).json({ error: error.message || 'Terjadi kesalahan pada AI saat memproses dokumen.' });
    }
  });

  // Vite middleware development setup or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 and PORT 3000 as required
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Madrasah Merdeka Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
