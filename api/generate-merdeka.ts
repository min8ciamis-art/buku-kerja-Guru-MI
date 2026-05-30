import { GoogleGenAI, Type } from '@google/genai';

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

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak didukung. Gunakan POST.' });
  }

  try {
    const { step, identitas, teksCP, kaldik, previousData } = req.body;

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

    // Common foundational instructions for Madrasah KMA 1503/2025
    const baseInstruction = `Anda adalah Pakar Kurikulum Merdeka Madrasah (Kemenag RI) tingkat nasional sesuai dengan regulasi KMA Nomor 1503 Tahun 2025.
Pilar Pokok KMA 1503/2025:
1. Kurikulum Berbasis Cinta (KBC): Teologi Cinta, Ibadah sebagai Ekspresi Cinta, Ekoteologi, Pandangan Holistik.
2. Panca Cinta: Cinta Allah & Rasul, Cinta Ilmu, Cinta Lingkungan, Cinta Diri & Sesama, Cinta Tanah Air.
3. Pembelajaran Mendalam (Deep Learning): Berkesadaran (Conscious/Mindful), Bermakna (Meaningful), Menggembirakan (Joyful).`;

    const ganjilProperties: Record<string, any> = {};
    const ganjilMonths = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    ganjilMonths.forEach((m) => {
      for (let w = 1; w <= 4; w++) {
        ganjilProperties[`${m}-W${w}`] = {
          type: Type.STRING,
          description: `Alokasi JP atau UH/STS/SAS pada ${m} Minggu ke-${w}.`,
        };
      }
    });

    const genapProperties: Record<string, any> = {};
    const genapMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];
    genapMonths.forEach((m) => {
      for (let w = 1; w <= 4; w++) {
        genapProperties[`${m}-W${w}`] = {
          type: Type.STRING,
          description: `Alokasi JP atau UH/STS/SAS pada ${m} Minggu ke-${w}.`,
        };
      }
    });

    // Let's decide which schema to use based on the step requested
    let currentInstruction = '';
    let currentPrompt = '';
    let responseSchema: any = null;

    if (step === 'cp') {
      currentInstruction = `${baseInstruction}\nTugas Anda: Lakukan analisis Capaian Pembelajaran (CP) untuk memperoleh kompetensi (kata kerjaoperasional) dan lingkup materi pokok. Integrasikan nilai moderasi beragama, akhlak, atau pilar panca cinta.`;
      currentPrompt = `Analisis Teks CP berikut:\n"${teksCP}"\nuntuk Madrasah: ${namaMadrasah}, Mapel: ${mataPelajaran}, Fase: ${fase}.`;
      responseSchema = {
        type: Type.OBJECT,
        required: ['analisisCP'],
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
                description: 'Narasi integrasi nilai moderasi beragama, akhlak mulia, atau PPRA.',
              },
            },
          },
        },
      };
    } else if (step === 'tp') {
      currentInstruction = `${baseInstruction}\nTugas Anda: Hasilkan tepat 3 Tujuan Pembelajaran (TP) yang logis dan berkualitas tinggi yang dikembangkan dari analisis CP. Distribusikan secara proporsional antara Semester Ganjil dan Genap (misalkan 2 Ganjil dan 1 Genap). Jumlahkan alokasi JP dari tiap TP agar sama persis dengan total JP efektif masing-masing semester (Ganjil: ${mingguGanjil * jpPerMinggu} JP, Genap: ${mingguGenap * jpPerMinggu} JP).`;
      currentPrompt = `Kembangkan TP dari data berikut:\nCP: "${teksCP}"\nAnalisis CP: ${JSON.stringify(previousData?.analisisCP)}\nJP/Minggu: ${jpPerMinggu}, Minggu Efektif Ganjil: ${mingguGanjil}, Minggu Efektif Genap: ${mingguGenap}.`;
      responseSchema = {
        type: Type.OBJECT,
        required: ['tujuanPembelajaran'],
        properties: {
          tujuanPembelajaran: {
            type: Type.ARRAY,
            description: 'Daftar Tujuan Pembelajaran yang dikembangkan dari CP.',
            items: {
              type: Type.OBJECT,
              required: ['id', 'kompetensi', 'materi', 'rumusanTP', 'jp', 'semester'],
              properties: {
                id: { type: Type.STRING, description: 'Kode TP, misal: TP-1, TP-2, dst.' },
                kompetensi: { type: Type.STRING },
                materi: { type: Type.STRING },
                rumusanTP: { type: Type.STRING, description: 'Rumusan TP lengkap berkarakter madrasah berbasis cinta.' },
                jp: { type: Type.INTEGER, description: 'Alokasi waktu dalam JP.' },
                semester: { type: Type.STRING, description: 'Ganjil atau Genap' },
              },
            },
          },
        },
      };
    } else if (step === 'atp') {
      currentInstruction = `${baseInstruction}\nTugas Anda: Buatlah urutan Alur Tujuan Pembelajaran (ATP) dari daftar Tujuan Pembelajaran (TP) yang sudah dirumuskan. Setiap ATP wajib diselaraskan dengan dimensi Profil Pelajar Pancasila & Rahmatan lil Alamin (P5-PPRA) khas Madrasah (misalnya Berkeadaban/Ta’addub, Keteladanan/Qudwah, Toleransi/Tasamuh).`;
      currentPrompt = `Susunlah ATP berdasarkan TP berikut:\n${JSON.stringify(previousData?.tujuanPembelajaran)}`;
      responseSchema = {
        type: Type.OBJECT,
        required: ['alurTujuanPembelajaran'],
        properties: {
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
                dimensiP5PPRA: { type: Type.STRING, description: 'Dimensi P5-PPRA khas KMA 1503/2025.' },
              },
            },
          },
        },
      };
    } else if (step === 'prota') {
      currentInstruction = `${baseInstruction}\nTugas Anda: Susun Program Tahunan (PROTA) yang memisahkan pembagian Jam Pelajaran (JP) secara terstruktur antara Semester Ganjil dan Genap menggunakan TP dan ATP.`;
      currentPrompt = `Buatlah PROTA berdasarkan TP & ATP berikut:\nTP: ${JSON.stringify(previousData?.tujuanPembelajaran)}\nATP: ${JSON.stringify(previousData?.alurTujuanPembelajaran)}`;
      responseSchema = {
        type: Type.OBJECT,
        required: ['programTahunan'],
        properties: {
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
        },
      };
    } else if (step === 'promes') {
      currentInstruction = `${baseInstruction}\nTugas Anda: Susun Program Semester (PROMES) ganjil dan genap. Petakan alokasi JP per minggu efektif (biasanya "${jpPerMinggu}") atau status asesmen/kegiatan (UH, STS, SAS) di setiap minggu ke-1 s.d ke-4 secara logis dan berkelanjutan di masing-masing bulan.`;
      currentPrompt = `Susunlah PROMES berdasarkan PROTA berikut:\n${JSON.stringify(previousData?.programTahunan)}\nAlokasi JP/Minggu: ${jpPerMinggu}, Minggu Ganjil: ${mingguGanjil}, Minggu Genap: ${mingguGenap}.`;
      responseSchema = {
        type: Type.OBJECT,
        required: ['programSemesterGanjil', 'programSemesterGenap'],
        properties: {
          programSemesterGanjil: {
            type: Type.OBJECT,
            required: ['bulanList', 'items'],
            properties: {
              bulanList: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '6 nama bulan semester ganjil (Juli s.d. Desember).',
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
                      properties: ganjilProperties,
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
                description: '6 nama bulan semester genap (Januari s.d. Juni).',
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
                      properties: genapProperties,
                    },
                  },
                },
              },
            },
          },
        },
      };
    } else if (step === 'bukukerja') {
      currentInstruction = `${baseInstruction}\nTugas Anda: Susun Buku Kerja Administrasi Lengkap 1, 2, 3, dan 4 secara ringkas, padat, profesional, dan langsung menuju inti sasaran materi. Batasi jumlah item di list langkahKegiatan, jurnalAgendaMengajar, kisikisiAsesmen, dll maksimal 3-4 item berkualitas prima tanpa mengorbankan kualitas akademis.`;
      currentPrompt = `Buatlah Buku Kerja 1-4 untuk:
Madrasah: ${namaMadrasah}, Mapel: ${mataPelajaran}, Guru: ${guruNama}
TP: ${JSON.stringify(previousData?.tujuanPembelajaran)}
ATP: ${JSON.stringify(previousData?.alurTujuanPembelajaran)}
PROTA: ${JSON.stringify(previousData?.programTahunan)}`;
      responseSchema = {
        type: Type.OBJECT,
        required: ['bukuKerja1', 'bukuKerja2', 'bukuKerja3', 'bukuKerja4'],
        properties: {
          bukuKerja1: {
            type: Type.OBJECT,
            required: ['rancanganModulAjar'],
            properties: {
              rancanganModulAjar: {
                type: Type.OBJECT,
                required: ['tujuan', 'langkahKegiatan', 'rencanaAsesmen'],
                properties: {
                  tujuan: { type: Type.STRING },
                  langkahKegiatan: {
                    type: Type.OBJECT,
                    required: ['pendahuluan', 'inti', 'penutup'],
                    properties: {
                      pendahuluan: { type: Type.ARRAY, items: { type: Type.STRING } },
                      inti: { type: Type.ARRAY, items: { type: Type.STRING } },
                      penutup: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                  rencanaAsesmen: {
                    type: Type.OBJECT,
                    required: ['formatif', 'sumatif'],
                    properties: {
                      formatif: { type: Type.STRING },
                      sumatif: { type: Type.STRING },
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
              kodeEtikGuru: { type: Type.ARRAY, items: { type: Type.STRING } },
              analisisMingguEfektif: {
                type: Type.OBJECT,
                required: ['ganjil', 'genap'],
                properties: {
                  ganjil: {
                    type: Type.OBJECT,
                    required: ['totalMinggu', 'mingguTidakEfektif', 'mingguEfektif', 'totalJP', 'rincianTidakEfektif'],
                    properties: {
                      totalMinggu: { type: Type.INTEGER },
                      mingguTidakEfektif: { type: Type.INTEGER },
                      mingguEfektif: { type: Type.INTEGER },
                      totalJP: { type: Type.INTEGER },
                      rincianTidakEfektif: { type: Type.STRING },
                    },
                  },
                  genap: {
                    type: Type.OBJECT,
                    required: ['totalMinggu', 'mingguTidakEfektif', 'mingguEfektif', 'totalJP', 'rincianTidakEfektif'],
                    properties: {
                      totalMinggu: { type: Type.INTEGER },
                      mingguTidakEfektif: { type: Type.INTEGER },
                      mingguEfektif: { type: Type.INTEGER },
                      totalJP: { type: Type.INTEGER },
                      rincianTidakEfektif: { type: Type.STRING },
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
                    text: { type: Type.STRING }, // fallback
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
                    bentukSoal: { type: Type.STRING },
                    levelKognitif: { type: Type.STRING },
                  },
                },
              },
              programRemedial: {
                type: Type.OBJECT,
                required: ['metode', 'soalRemedial'],
                properties: {
                  metode: { type: Type.STRING },
                  soalRemedial: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
              programPengayaan: {
                type: Type.OBJECT,
                required: ['aktivitas', 'soalPengayaan'],
                properties: {
                  aktivitas: { type: Type.STRING },
                  soalPengayaan: { type: Type.ARRAY, items: { type: Type.STRING } },
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
              },
            },
          },
        },
      };
    } else {
      // Fallback for full simultaneous generation
      currentInstruction = `${baseInstruction}\nHasilkan dokumen perangkat administrasi mengajar lengkap (TP, ATP, Prota, Promes, serta Buku Kerja 1, 2, 3, 4) dalam satu objek JSON terstruktur yang mematuhi skema yang ditentukan. Hasilkan tepat 3 TP (misal: 2 ganjil, 1 genap atau sebaliknya) secara ringkas dan padat.`;
      currentPrompt = `Silakan proses data berikut untuk membuat Dokumen Administrasi Kurikulum Merdeka Madrasah Lengkap:\nNama Madrasah: ${namaMadrasah}, Mapel: ${mataPelajaran}, Fase: ${fase}, Kelas: ${kelas}, Guru: ${guruNama}\nJP/Minggu: ${jpPerMinggu}, Ganjil: ${mingguGanjil}, Genap: ${mingguGenap}\nCP: ${teksCP}`;
      responseSchema = {
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
              kompetensi: { type: Type.ARRAY, items: { type: Type.STRING } },
              lingkupMateri: { type: Type.ARRAY, items: { type: Type.STRING } },
              pesanKekhasanMadrasah: { type: Type.STRING },
            },
          },
          tujuanPembelajaran: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ['id', 'kompetensi', 'materi', 'rumusanTP', 'jp', 'semester'],
              properties: {
                id: { type: Type.STRING },
                kompetensi: { type: Type.STRING },
                materi: { type: Type.STRING },
                rumusanTP: { type: Type.STRING },
                jp: { type: Type.INTEGER },
                semester: { type: Type.STRING },
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
                dimensiP5PPRA: { type: Type.STRING },
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
              bulanList: { type: Type.ARRAY, items: { type: Type.STRING } },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ['tpId', 'rumusanTP', 'alokasiWaktu', 'distribusi'],
                  properties: {
                    tpId: { type: Type.STRING },
                    rumusanTP: { type: Type.STRING },
                    alokasiWaktu: { type: Type.INTEGER },
                    distribusi: { type: Type.OBJECT, properties: ganjilProperties },
                  },
                },
              },
            },
          },
          programSemesterGenap: {
            type: Type.OBJECT,
            required: ['bulanList', 'items'],
            properties: {
              bulanList: { type: Type.ARRAY, items: { type: Type.STRING } },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ['tpId', 'rumusanTP', 'alokasiWaktu', 'distribusi'],
                  properties: {
                    tpId: { type: Type.STRING },
                    rumusanTP: { type: Type.STRING },
                    alokasiWaktu: { type: Type.INTEGER },
                    distribusi: { type: Type.OBJECT, properties: genapProperties },
                  },
                },
              },
            },
          },
          bukuKerja1: { type: Type.OBJECT, required: ['rancanganModulAjar'] },
          bukuKerja2: { type: Type.OBJECT, required: ['kodeEtikGuru', 'analisisMingguEfektif', 'jurnalAgendaMengajar'] },
          bukuKerja3: { type: Type.OBJECT, required: ['kisikisiAsesmen', 'programRemedial', 'programPengayaan'] },
          bukuKerja4: { type: Type.OBJECT, required: ['lembarRefleksiGuru', 'rencanaTindakLanjut'] },
        },
      };
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: currentPrompt,
      config: {
        systemInstruction: currentInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini did not return any text.');
    }

    const parsedData = JSON.parse(text.trim());
    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Error in Vercel API handler:', error);
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada AI saat memproses dokumen.' });
  }
}
