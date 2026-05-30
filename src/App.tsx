/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import PreviewDoc from './components/PreviewDoc';
import { IdentitasMadrasah, KaldikData, FullMerdekaResponse } from './types';
import { PRESETS_MAPEL } from './data/presets';
import { 
  Sparkles, BookOpen, AlertCircle, HelpCircle, ShieldCheck, 
  Layers, Hammer, Printer, BookOpenCheck, Settings, 
  ArrowRight, Check, RotateCcw, FileDown, HelpCircle as HelpIcon,
  BookOpen as BookIcon, CheckCircle2
} from 'lucide-react';

export type StepId = 'setup' | 'cp' | 'tp' | 'atp' | 'prota' | 'promes' | 'bukukerja' | 'done';

export default function App() {
  const [identitas, setIdentitas] = useState<IdentitasMadrasah>({
    namaMadrasah: 'MI Negeri 8 Ciamis',
    mataPelajaran: 'Fikih',
    fase: 'C',
    kelas: 'V',
    semester: 'Satu Tahun',
    tahunPelajaran: '2026/2027',
    guruNama: 'Ahmad Fauzi, S.Pd.I.',
    kepalaNama: 'Drs. H. Maimun, M.Pd.',
    nipGuru: '198503122010011005',
    nipKepala: '197208151998031002',
  });

  const [kaldik, setKaldik] = useState<KaldikData>({
    mingguGanjil: 18,
    mingguGenap: 16,
    jpPerMinggu: 2,
  });

  const [teksCP, setTeksCP] = useState<string>(
    PRESETS_MAPEL.find((p) => p.id === 'fikih-fase-c')?.teksCP || ''
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [generatedData, setGeneratedData] = useState<FullMerdekaResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('cp');

  // Progressive Step-by-Step tracking
  const [currentStep, setCurrentStep] = useState<StepId>('setup');

  const stepTexts = [
    'Menyelaraskan dengan rujukan regulasi KMA Nomor 1503 Tahun 2025 (Kurikulum Berbasis Cinta)...',
    'Mendiagnosis kompetensi utama & materi pokok dari teks CP...',
    'Mengintegrasikan Pembelajaran Mendalam (Berkesadaran, Bermakna, Menggembirakan)...',
    'Menyusun kerangka pembelajaran interaktif Madrasah...',
    'Melakukan finalisasi dokumen administrasi mengajar siap pakai...',
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let currentIdx = 0;
      setCurrentStepText(stepTexts[0]);
      interval = setInterval(() => {
        currentIdx = (currentIdx + 1) % stepTexts.length;
        setCurrentStepText(stepTexts[currentIdx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleResetProgress = () => {
    if (window.confirm('Apakah Anda yakin ingin mengulang proses administrasi dari awal? Semua draf yang sudah dibuat akan di-reset.')) {
      setGeneratedData(null);
      setCurrentStep('setup');
      setErrorMsg(null);
      setActiveTab('cp');
    }
  };

  const handleGenerateStep = async (stepKey: 'cp' | 'tp' | 'atp' | 'prota' | 'promes' | 'bukukerja') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-merdeka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: stepKey,
          identitas,
          kaldik,
          teksCP,
          previousData: generatedData,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Terjadi kesalahan internal.';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            errorMsg = `Server error (Status ${response.status})`;
          }
        } else {
          try {
            const textMsg = await response.text();
            errorMsg = textMsg.length < 200 ? textMsg : `Server error (Status ${response.status})`;
          } catch (e) {
            errorMsg = `Server error (Status ${response.status})`;
          }
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server tidak mengembalikan format JSON yang valid. Silakan coba lagi.');
      }

      const stepData = await response.json();

      setGeneratedData((prev) => {
        const merged = prev ? { ...prev, ...stepData } : stepData;
        return merged;
      });

      // Advance Steps
      if (stepKey === 'cp') {
        setCurrentStep('tp');
        setActiveTab('cp');
      } else if (stepKey === 'tp') {
        setCurrentStep('atp');
        setActiveTab('cp');
      } else if (stepKey === 'atp') {
        setCurrentStep('prota');
        setActiveTab('atp');
      } else if (stepKey === 'prota') {
        setCurrentStep('promes');
        setActiveTab('prota');
      } else if (stepKey === 'promes') {
        setCurrentStep('bukukerja');
        setActiveTab('promes');
      } else if (stepKey === 'bukukerja') {
        setCurrentStep('done');
        setActiveTab('bk1');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Koneksi ke server gagal atau response AI terputus. Silakan klik coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compile and trigger Word Document download (.doc format)
  const downloadCompleteWordDoc = () => {
    if (!generatedData) return;

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Perangkat Administrasi Kurikulum Merdeka Madrasah</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #000; padding: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; margin-bottom: 20px; }
          th, td { border: 1px solid #111; padding: 10px; text-align: left; font-size: 11pt; }
          th { background-color: #f3f4f6; font-weight: bold; }
          h1, h2, h3, h4 { color: #111; font-family: 'Arial', sans-serif; }
          h1 { font-size: 18pt; margin-top: 25px; border-bottom: 2px solid #333; padding-bottom: 5px; }
          h2 { font-size: 14pt; margin-top: 20px; color: #065f46; }
          h3 { font-size: 12pt; margin-top: 15px; }
          .kop-surat { text-align: center; border-bottom: 4px double #111; padding-bottom: 15px; margin-bottom: 25px; }
          .page-break { page-break-before: always; }
          .signature-table { border: none !important; width: 100%; margin-top: 50px; }
          .signature-table td { border: none !important; text-align: center; width: 50%; font-size: 11pt; }
        </style>
      </head>
      <body>
    `;

    // Kop Surat
    html += `
      <div class="kop-surat">
        <h2 style="margin: 0; font-size: 14pt; font-weight: bold; text-transform: uppercase;">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
        <h3 style="margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase;">KANTOR KEMENTERIAN AGAMA KABUPATEN / KOTA</h3>
        <h1 style="margin: 5px 0 10px 0; font-size: 18pt; font-weight: 800; color: #065f46; border: none; text-transform: uppercase;">${identitas.namaMadrasah.toUpperCase()}</h1>
        <p style="margin: 0; font-style: italic; font-size: 10pt; color: #4b5563;">Jalan Pendidikan Nomor 1503, TP. ${identitas.tahunPelajaran} — Terakreditasi Unggul</p>
      </div>
    `;

    // Identitas Table
    html += `
      <h2 style="text-align: center; font-size: 14pt; margin-bottom: 25px; text-transform: uppercase;">DOKUMEN ADMINISTRASI PERANGKAT PEMBELAJARAN LENGKAP</h2>
      <table style="width: 100%; border: none; margin-bottom: 40px;">
        <tr style="border: none;"><td style="border: none; width: 35%; font-weight: bold;">Mata Pelajaran</td><td style="border: none; width: 3%;">:</td><td style="border: none;">${identitas.mataPelajaran}</td></tr>
        <tr style="border: none;"><td style="border: none; font-weight: bold;">Fase / Kelas</td><td style="border: none;">:</td><td style="border: none;">${identitas.fase} / ${identitas.kelas}</td></tr>
        <tr style="border: none;"><td style="border: none; font-weight: bold;">Tahun Pelajaran</td><td style="border: none;">:</td><td style="border: none;">${identitas.tahunPelajaran}</td></tr>
        <tr style="border: none;"><td style="border: none; font-weight: bold;">Guru Pengampu</td><td style="border: none;">:</td><td style="border: none;">${identitas.guruNama}</td></tr>
        <tr style="border: none;"><td style="border: none; font-weight: bold;">NIP Guru</td><td style="border: none;">:</td><td style="border: none;">${identitas.nipGuru}</td></tr>
        <tr style="border: none;"><td style="border: none; font-weight: bold;">Kepala Madrasah</td><td style="border: none;">:</td><td style="border: none;">${identitas.kepalaNama}</td></tr>
        <tr style="border: none;"><td style="border: none; font-weight: bold;">NIP Kepala</td><td style="border: none;">:</td><td style="border: none;">${identitas.nipKepala}</td></tr>
      </table>
    `;

    // CP & TP Analysis
    if (generatedData.analisisCP) {
      html += `
        <div class="page-break"></div>
        <h1>1. KELAYAKAN ANALISIS CP & PEMETAAN TP (KMA 1503/2025)</h1>
        <h2>A. Kompetensi Kelayakan Utama</h2>
        <ul>
          ${generatedData.analisisCP.kompetensi?.map((k) => `<li>${k}</li>`).join('') || ''}
        </ul>
        <h2>B. Lingkup Materi Pokok</h2>
        <ul>
          ${generatedData.analisisCP.lingkupMateri?.map((m) => `<li>${m}</li>`).join('') || ''}
        </ul>
        <h2>C. Pesan Kekhasan Madrasah (Kurikulum Berbasis Cinta)</h2>
        <p style="text-align: justify; line-height: 1.6;">${generatedData.analisisCP.pesanKekhasanMadrasah || ''}</p>
      `;
    }

    // TPs
    if (generatedData.tujuanPembelajaran) {
      html += `
        <h2>D. Daftar Tujuan Pembelajaran (TP) Terstruktur</h2>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 15%;">Kode TP</th>
              <th style="width: 55%;">Rumusan TP Lengkap Berbasis Madrasah</th>
              <th style="width: 15%; text-align: center;">Alokasi JP</th>
              <th style="width: 15%; text-align: center;">Semester</th>
            </tr>
          </thead>
          <tbody>
            ${generatedData.tujuanPembelajaran.map((tp) => `
              <tr>
                <td><strong>${tp.id}</strong></td>
                <td>${tp.rumusanTP}</td>
                <td style="text-align: center;">${tp.jp} JP</td>
                <td style="text-align: center;">${tp.semester}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // ATP
    if (generatedData.alurTujuanPembelajaran) {
      html += `
        <div class="page-break"></div>
        <h1>2. ALUR TUJUAN PEMBELAJARAN (ATP) MERDEKA</h1>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 8%; text-align: center;">No</th>
              <th style="width: 15%;">Kode TP</th>
              <th style="width: 42%;">Rumusan TP</th>
              <th style="width: 15%;">Materi Pokok</th>
              <th style="width: 10%; text-align: center;">JP</th>
              <th style="width: 20%;">P5-PPRA Sasar</th>
            </tr>
          </thead>
          <tbody>
            ${generatedData.alurTujuanPembelajaran.map((atp) => `
              <tr>
                <td style="text-align: center;">${atp.no}</td>
                <td><strong>${atp.tpId}</strong></td>
                <td>${atp.rumusanTP}</td>
                <td>${atp.materiPokok}</td>
                <td style="text-align: center;">${atp.alokasiWaktu} JP</td>
                <td>${atp.dimensiP5PPRA}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // PROTA
    if (generatedData.programTahunan) {
      html += `
        <div class="page-break"></div>
        <h1>3. PROGRAM TAHUNAN (PROTA)</h1>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 8%; text-align: center;">No</th>
              <th style="width: 15%;">Semester</th>
              <th style="width: 15%;">Kode TP</th>
              <th style="width: 37%;">Rumusan TP</th>
              <th style="width: 15%;">Materi Pokok</th>
              <th style="width: 10%; text-align: center;">JP</th>
            </tr>
          </thead>
          <tbody>
            ${generatedData.programTahunan.map((pt) => `
              <tr>
                <td style="text-align: center;">${pt.no}</td>
                <td>Semester ${pt.semester}</td>
                <td><strong>${pt.tpId}</strong></td>
                <td>${pt.rumusanTP}</td>
                <td>${pt.materiPokok}</td>
                <td style="text-align: center;">${pt.alokasiWaktu} JP</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // PROMES
    if (generatedData.programSemesterGanjil && generatedData.programSemesterGenap) {
      const composePromesHTML = (title: string, promes: any) => {
        let headRow = `<tr><th style="width: 10%;">ID TP</th><th style="width: 35%;">Rumusan TP</th><th style="width: 10%; text-align: center;">Total JP</th>`;
        promes.bulanList.forEach((b: string) => {
          for (let w = 1; w <= 4; w++) {
            headRow += `<th style="font-size: 7.5pt; width: 20px; text-align: center;">${b.substring(0,3)}<br/>W${w}</th>`;
          }
        });
        headRow += `</tr>`;

        let bodyRows = promes.items.map((item: any) => {
          let row = `<tr><td><strong>${item.tpId}</strong></td><td style="font-size: 9.5pt;">${item.rumusanTP}</td><td style="text-align: center;">${item.alokasiWaktu} JP</td>`;
          promes.bulanList.forEach((b: string) => {
            for (let w = 1; w <= 4; w++) {
              const key = `${b}-W${w}`;
              row += `<td style="font-size: 8pt; text-align: center; background-color: ${item.distribusi?.[key] ? '#ecfdf5' : '#fff'};">${item.distribusi?.[key] || ''}</td>`;
            }
          });
          row += `</tr>`;
          return row;
        }).join('');

        return `
          <h2>${title}</h2>
          <table style="width: 100%;">
            <thead>${headRow}</thead>
            <tbody>${bodyRows}</tbody>
          </table>
        `;
      };

      html += `
        <div class="page-break"></div>
        <h1>4. PROGRAM SEMESTER (PROMES)</h1>
        ${composePromesHTML('A. Semester Ganjil (Gasal)', generatedData.programSemesterGanjil)}
        <br />
        ${composePromesHTML('B. Semester Genap', generatedData.programSemesterGenap)}
      `;
    }

    // Buku Kerja 1-4
    if (generatedData.bukuKerja1?.rancanganModulAjar) {
      const ma = generatedData.bukuKerja1.rancanganModulAjar;
      html += `
        <div class="page-break"></div>
        <h1>5. BUKU KERJA 1: RPP MODUL AJAR INDUK</h1>
        <p><strong>A. Target / Tujuan Umum Pembelajaran:</strong> ${ma.tujuan || ''}</p>
        
        <h3>B. Langkah Kegiatan Pembelajaran Berbasis Cinta</h3>
        <p><strong>1. Pendahuluan (Pengkondisian Spiritual & Cinta):</strong></p>
        <ul>
          ${ma.langkahKegiatan?.pendahuluan?.map((item: string) => `<li>${item}</li>`).join('') || ''}
        </ul>
        <p><strong>2. Kegiatan Inti (Deep & Joyful Learning):</strong></p>
        <ul>
          ${ma.langkahKegiatan?.inti?.map((item: string) => `<li>${item}</li>`).join('') || ''}
        </ul>
        <p><strong>3. Penutup (Evaluasi Kasih & Doa Kafarotul Majlis):</strong></p>
        <ul>
          ${ma.langkahKegiatan?.penutup?.map((item: string) => `<li>${item}</li>`).join('') || ''}
        </ul>

        <h3>C. Rencana Asesmen Autentik</h3>
        <p><strong>Asesmen Formatif:</strong> ${ma.rencanaAsesmen?.formatif || ''}</p>
        <p><strong>Asesmen Sumatif:</strong> ${ma.rencanaAsesmen?.sumatif || ''}</p>
      `;
    }

    if (generatedData.bukuKerja2) {
      const bk2 = generatedData.bukuKerja2;
      html += `
        <div class="page-break"></div>
        <h1>6. BUKU KERJA 2: KODE ETIK & JURNAL MENGAJAR</h1>
        <h2>A. Kode Etik Pendidik Madrasah Profesional</h2>
        <ul>
          ${bk2.kodeEtikGuru?.map((line: string) => `<li>${line}</li>`).join('') || ''}
        </ul>
        
        <h2>B. Rincian Analisis Minggu Efektif (RME)</h2>
        <h3>1. Semester Ganjil</h3>
        <ul>
          <li>Total Minggu Kalender: ${bk2.analisisMingguEfektif?.ganjil?.totalMinggu} minggu</li>
          <li>Minggu Tidak Efektif: ${bk2.analisisMingguEfektif?.ganjil?.mingguTidakEfektif} minggu</li>
          <li>Minggu Efektif Riil: ${bk2.analisisMingguEfektif?.ganjil?.mingguEfektif} minggu</li>
          <li>Total Jam Pelajaran Riil: ${bk2.analisisMingguEfektif?.ganjil?.totalJP} JP</li>
          <li>Keterangan Tidak Efektif: ${bk2.analisisMingguEfektif?.ganjil?.rincianTidakEfektif}</li>
        </ul>
        <h3>2. Semester Genap</h3>
        <ul>
          <li>Total Minggu Kalender: ${bk2.analisisMingguEfektif?.genap?.totalMinggu} minggu</li>
          <li>Minggu Tidak Efektif: ${bk2.analisisMingguEfektif?.genap?.mingguTidakEfektif} minggu</li>
          <li>Minggu Efektif Riil: ${bk2.analisisMingguEfektif?.genap?.mingguEfektif} minggu</li>
          <li>Total Jam Pelajaran Riil: ${bk2.analisisMingguEfektif?.genap?.totalJP} JP</li>
          <li>Keterangan Tidak Efektif: ${bk2.analisisMingguEfektif?.genap?.rincianTidakEfektif}</li>
        </ul>

        <h2>C. Jurnal Agenda Mengajar Guru Harian</h2>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Hari/Tanggal</th>
              <th>Kelas</th>
              <th>Jam Ke</th>
              <th>TP ID</th>
              <th>Materi Pokok</th>
              <th>Target Pencapaian</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${bk2.jurnalAgendaMengajar?.map((j: any) => `
              <tr>
                <td>${j.hariTanggal}</td>
                <td>${j.kelas}</td>
                <td style="text-align: center;">${j.jamKe}</td>
                <td><strong>${j.tpId}</strong></td>
                <td>${j.materiPokok}</td>
                <td>${j.pencapaian}</td>
                <td>${j.keterangan}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
      `;
    }

    if (generatedData.bukuKerja3) {
      const bk3 = generatedData.bukuKerja3;
      html += `
        <div class="page-break"></div>
        <h1>7. BUKU KERJA 3: KISI ASESMEN & REMEDIAL/PENGAYAAN</h1>
        <h2>A. Kisi-Kisi Asesmen Kelayakan</h2>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">No</th>
              <th style="width: 12%;">TP ID</th>
              <th style="width: 25%;">Materi Pokok</th>
              <th style="width: 37%;">Indikator Pembahasan Soal</th>
              <th style="width: 10%;">Bentuk</th>
              <th style="width: 10%; text-align: center;">Kognitif</th>
            </tr>
          </thead>
          <tbody>
            ${bk3.kisikisiAsesmen?.map((k: any) => `
              <tr>
                <td style="text-align: center;">${k.no}</td>
                <td><strong>${k.tpId}</strong></td>
                <td>${k.materi}</td>
                <td>${k.indikatorSoal}</td>
                <td>${k.bentukSoal}</td>
                <td style="text-align: center;">${k.levelKognitif}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <h2>B. Rencana Tindak Remedial & Pengayaan</h2>
        <h3>1. Program Remedial Teaching</h3>
        <p><strong>Metode & Penguatan:</strong> ${bk3.programRemedial?.metode || ''}</p>
        <p><strong>Contoh Soal Remedial:</strong></p>
        <ol>
          ${bk3.programRemedial?.soalRemedial?.map((s: string) => `<li>${s}</li>`).join('') || ''}
        </ol>

        <h3>2. Program Pengayaan (HOTS)</h3>
        <p><strong>Metode & Pelatihan:</strong> ${bk3.programPengayaan?.aktivitas || ''}</p>
        <p><strong>Contoh Soal Pengayaan:</strong></p>
        <ol>
          ${bk3.programPengayaan?.soalPengayaan?.map((s: string) => `<li>${s}</li>`).join('') || ''}
        </ol>
      `;
    }

    if (generatedData.bukuKerja4) {
      const bk4 = generatedData.bukuKerja4;
      html += `
        <div class="page-break"></div>
        <h1>8. BUKU KERJA 4: LEMBAR REFLEKSI GURU & TIMBAL BALIK</h1>
        <h2>A. Lembar Refleksi Diri Guru Berkala</h2>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 25%;">Aspek Refleksi</th>
              <th style="width: 40%;">Pertanyaan Refleksi</th>
              <th style="width: 35%;">Jawaban / Penemuan Guru</th>
            </tr>
          </thead>
          <tbody>
            ${bk4.lembarRefleksiGuru?.map((r: any) => `
              <tr>
                <td><strong>${r.aspek}</strong></td>
                <td>${r.pertanyaanRefleksi}</td>
                <td>${r.jawabanRefleksiGuru}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <h2>B. Rencana Tindak Lanjut (RTL) Kinerja Mengajar</h2>
        <ol>
          ${bk4.rencanaTindakLanjut?.map((rtl: string) => `<li>${rtl}</li>`).join('') || ''}
        </ol>
      `;
    }

    // Signatures
    html += `
      <table class="signature-table">
        <tr>
          <td>
            Mengetahui,<br />
            <strong>Kepala Madrasah</strong>
            <br /><br /><br /><br /><br />
            <span style="font-weight: bold; text-decoration: underline;">${identitas.kepalaNama}</span><br />
            NIP. ${identitas.nipKepala}
          </td>
          <td>
            Dibuat di Sleman, 30 Mei 2026<br />
            <strong>Pendidik Mapel ${identitas.mataPelajaran}</strong>
            <br /><br /><br /><br /><br />
            <span style="font-weight: bold; text-decoration: underline;">${identitas.guruNama}</span><br />
            NIP. ${identitas.nipGuru}
          </td>
        </tr>
      </table>
    `;

    html += `</body></html>`;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Perangkat_Lengkap_KMA_1503_${identitas.mataPelajaran.replace(/\s+/g, '_')}_Fase_${identitas.fase}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* Sleek Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 no-print">
        <div className="p-5 flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Logo Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/25">
                <BookOpenCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-white font-bold text-sm leading-snug">
                Admin<br />
                <span className="text-emerald-400 font-semibold">Madrasah</span>
              </h1>
            </div>

            <div className="mb-6">
              <span className="bg-emerald-600/10 text-[10.5px] font-bold tracking-wider px-2.5 py-1 rounded-md text-emerald-400 border border-emerald-500/10 block text-center uppercase">
                🏁 KMA 1503/2025
              </span>
            </div>

            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2.5 px-1">Laporan & Berkas</p>

            {/* Sidebar Navigation items */}
            <nav className="space-y-1">
              {[
                { id: 'cp', label: '1. Analisis CP/TP', ready: !!generatedData?.analisisCP },
                { id: 'atp', label: '2. ATP Merdeka', ready: !!generatedData?.alurTujuanPembelajaran },
                { id: 'prota', label: '3. PROTA Tahunan', ready: !!generatedData?.programTahunan },
                { id: 'promes', label: '4. PROMES Kaldik', ready: !!generatedData?.programSemesterGanjil },
                { id: 'bk1', label: 'Buku Kerja 1', ready: !!generatedData?.bukuKerja1 },
                { id: 'bk2', label: 'Buku Kerja 2', ready: !!generatedData?.bukuKerja2 },
                { id: 'bk3', label: 'Buku Kerja 3', ready: !!generatedData?.bukuKerja3 },
                { id: 'bk4', label: 'Buku Kerja 4', ready: !!generatedData?.bukuKerja4 },
                { id: 'cetak', label: '🖨️ Cetak Berkas', ready: !!generatedData?.bukuKerja4 },
              ].map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => setActiveTab(tabItem.id)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 shadow-sm'
                        : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <span>{tabItem.label}</span>
                    {tabItem.ready ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[9px] text-slate-600 px-1">pending</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Sticky Card */}
          <div className="mt-8">
            <div className="bg-slate-800/45 rounded-2xl p-4 border border-slate-800/60">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Regulasi Terkait</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Keputusan KMA No. 1503 Tahun 2025 tentang Kurikulum madrasah secara bertahap & interaktif.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area Wrapper */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Workspace Bar */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 no-print">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-0.5">Penilai & Pembuat Perangkat Kurikulum</h2>
            <p className="text-xs text-slate-500 font-normal">
              {identitas.namaMadrasah || 'MAN 1' } • {identitas.mataPelajaran || 'Fikih'} • Fase {identitas.fase} / Kelas {identitas.kelas}
            </p>
          </div>
          <div className="flex gap-2.5">
            {generatedData && (
              <button
                onClick={handleResetProgress}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset & Ulangi
              </button>
            )}
            {generatedData?.bukuKerja4 && (
              <button
                onClick={downloadCompleteWordDoc}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-lg shadow-sky-600/20 transition duration-150 cursor-pointer inline-flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download berkas lengkap (Word)
              </button>
            )}
          </div>
        </header>

        {/* Content Viewport scrollable */}
        <div className="flex-1 p-5 md:p-6 bg-slate-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Form parameters (Sleek cards) */}
            <div className="xl:col-span-5 space-y-6 no-print">
              <InputForm
                identitas={identitas}
                setIdentitas={setIdentitas}
                kaldik={kaldik}
                setKaldik={setKaldik}
                teksCP={teksCP}
                setTeksCP={setTeksCP}
                onGenerate={() => {
                  setGeneratedData(null);
                  handleGenerateStep('cp');
                }}
                isLoading={isLoading}
              />
            </div>

            {/* Right Box: Output document/progress viewport */}
            <div className="xl:col-span-7 flex flex-col h-full min-h-[500px]">
              
              {/* INTERACTIVE PROGRESS WIZARD INDICATOR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm space-y-4 no-print">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
                    Progress Pembentukan Berkas Dokumen (Bertahap)
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {currentStep === 'setup' && 'TAHAP 0 / 6'}
                    {currentStep === 'cp' && 'TAHAP 1 / 6'}
                    {currentStep === 'tp' && 'TAHAP 2 / 6'}
                    {currentStep === 'atp' && 'TAHAP 3 / 6'}
                    {currentStep === 'prota' && 'TAHAP 4 / 6'}
                    {currentStep === 'promes' && 'TAHAP 5 / 6'}
                    {currentStep === 'bukukerja' && 'TAHAP 6 / 6'}
                    {currentStep === 'done' && 'SELESAI (100%)'}
                  </span>
                </div>

                {/* Horizontal flow badges */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                  {[
                    { id: 'cp', label: 'CP' },
                    { id: 'tp', label: 'TP' },
                    { id: 'atp', label: 'ATP' },
                    { id: 'prota', label: 'PROTA' },
                    { id: 'promes', label: 'PROMES' },
                    { id: 'bukukerja', label: 'Buku Kerja' },
                  ].map((s, idx) => {
                    const stepOrder = ['setup', 'cp', 'tp', 'atp', 'prota', 'promes', 'bukukerja', 'done'];
                    const isDoneIndex = stepOrder.indexOf(currentStep) > stepOrder.indexOf(s.id);
                    const isCurrent = currentStep === s.id;
                    return (
                      <div key={s.id} className="flex items-center gap-1 shrink-0">
                        <div className={`px-2.5 py-1.5 rounded-lg text-xxs font-bold uppercase transition flex items-center gap-1 border ${
                          isDoneIndex 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : isCurrent
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-600/10'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {isDoneIndex ? <Check className="w-3 h-3 text-emerald-800" /> : `${idx + 1}. `}
                          {s.label}
                        </div>
                        {idx < 5 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                      </div>
                    );
                  })}
                </div>

                {/* Step Description & Dynamic Action Call Container */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest">
                      {currentStep === 'setup' && 'PANDUAN LANGKAH 1'}
                      {currentStep === 'cp' && 'PANDUAN LANGKAH 2'}
                      {currentStep === 'tp' && 'PANDUAN LANGKAH 3'}
                      {currentStep === 'atp' && 'PANDUAN LANGKAH 4'}
                      {currentStep === 'prota' && 'PANDUAN LANGKAH 5'}
                      {currentStep === 'promes' && 'PANDUAN LANGKAH 6'}
                      {currentStep === 'bukukerja' && 'PANDUAN TERAKHIR (DOKUMEN DINAS)'}
                      {currentStep === 'done' && 'BERKAS SIAP UNDUH'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">
                      {currentStep === 'setup' && '1. Sempurnakan Identitas & Klik Generate CP'}
                      {currentStep === 'cp' && '2. Rumuskan 3 Tujuan Pembelajaran Utama (TP)'}
                      {currentStep === 'tp' && '3. Tentukan Alur Tujuan Pembelajaran (ATP)'}
                      {currentStep === 'atp' && '4. Buat Program Tahunan (PROTA)'}
                      {currentStep === 'prota' && '5. Susun Program Semester (PROMES)'}
                      {currentStep === 'promes' && '6. Hasilkan 4 Buku Kerja Administrasi Lengkap'}
                      {currentStep === 'bukukerja' && '7. Buku Kerja Selesai Disusun! Berkas Siap'}
                      {currentStep === 'done' && '🎉 Semua Dokumen Berhasil Disusun!'}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg">
                      {currentStep === 'setup' && 'Kami akan mendownload & menganalisis teks capaian pelajaran untuk mengambil kata kerja operasional dan pilar pendaftaran KMA 1503.'}
                      {currentStep === 'cp' && 'Menghasilkan TP dari Kompetensi & Kekhasan Madrasah hasil analisis CP sebelumnya dengan pembagian JP realitis.'}
                      {currentStep === 'tp' && 'Merinci alur pengerjaan TP bersesuaian dengan dimensi P5-PPRA khas Kemenag.'}
                      {currentStep === 'atp' && 'Menyebarkan target TP menjadi rencana mengajar guru dalam satu tahun akademik.'}
                      {currentStep === 'prota' && 'Menyusun kalender ajar mingguan siswa di setiap bulan gasal/genap secara rincian logis.'}
                      {currentStep === 'promes' && 'Menyusun RPP/Modul Ajar, Kode Etik Profesional, Jurnal Agenda Mengajar, Program Remedial / Pengayaan, & Refleksi Guru.'}
                      {currentStep === 'bukukerja' && 'Sistem sekarang membuat analisis, Kisi, dan Asesmen akhir di tab Buku Kerja. Anda siap mencetak atau langsung mendownload Word.'}
                      {currentStep === 'done' && 'Perangkat kurikulum MI KMA 1503 kini lengkap. Silakan print halaman ini secara detail atau unduh berkas (.doc) untuk Microsoft Word Anda.'}
                    </p>
                  </div>

                  {/* Primary Trigger Button for each steps */}
                  <div className="shrink-0 flex items-center md:justify-end">
                    {currentStep === 'setup' && (
                      <button
                        onClick={() => handleGenerateStep('cp')}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Analisis CP
                      </button>
                    )}
                    {currentStep === 'cp' && (
                      <button
                        onClick={() => handleGenerateStep('tp')}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Generate List TP
                      </button>
                    )}
                    {currentStep === 'tp' && (
                      <button
                        onClick={() => handleGenerateStep('atp')}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Generate ATP
                      </button>
                    )}
                    {currentStep === 'atp' && (
                      <button
                        onClick={() => handleGenerateStep('prota')}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Generate PROTA
                      </button>
                    )}
                    {currentStep === 'prota' && (
                      <button
                        onClick={() => handleGenerateStep('promes')}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Generate PROMES
                      </button>
                    )}
                    {currentStep === 'promes' && (
                      <button
                        onClick={() => handleGenerateStep('bukukerja')}
                        disabled={isLoading}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 active:scale-95 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />
                        Generate Berkas Lengkap (Buku 1-4)
                      </button>
                    )}
                    {(currentStep === 'bukukerja' || currentStep === 'done') && (
                      <button
                        onClick={downloadCompleteWordDoc}
                        className="px-5 py-3 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer"
                      >
                        <FileDown className="w-4 h-4 text-white" />
                        Download File Word Lengkap (.doc)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Loading State */}
              {isLoading && (
                <div className="flex-1 min-h-[480px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="text-center space-y-4">
                    <div className="relative inline-flex items-center justify-center p-0.5 rounded-full overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full animate-spin w-16 h-16" />
                      <div className="bg-white rounded-full p-4 w-15 h-15 flex items-center justify-center relative">
                        <Sparkles className="w-7 h-7 text-emerald-600 animate-pulse" />
                      </div>
                    </div>
                    <h2 className="text-sm font-black text-slate-800 tracking-tight">KONTROL AI SEDANG MEMPROSES...</h2>
                    <h3 className="text-xs font-bold text-emerald-600">MENYUSUN FORMULASI TAHAP AKTIF</h3>
                    <div className="max-w-md mx-auto">
                      <p className="text-xs text-slate-500 font-medium italic min-h-[40px] leading-relaxed select-none animate-pulse">
                        &ldquo;{currentStepText}&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="w-full max-w-sm bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full animate-indeterminate rounded" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-center max-w-xs leading-relaxed">
                    *Membentuk data secara bertahap menjaga kestabilan respon AI dan menjamin kelengkapan isi tanpa cutoff!
                  </div>
                </div>
              )}

              {/* 2. Error State */}
              {!isLoading && errorMsg && (
                <div className="flex-1 min-h-[480px] flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-650 text-red-600 animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-red-800">Pembuatan Administrasi Gagal</h3>
                    <p className="text-xs text-red-655 text-red-600 max-w-md leading-relaxed">{errorMsg}</p>
                  </div>
                  <button
                    onClick={() => {
                      const stepOrder: Record<string, 'cp' | 'tp' | 'atp' | 'prota' | 'promes' | 'bukukerja'> = {
                        setup: 'cp',
                        cp: 'tp',
                        tp: 'atp',
                        atp: 'prota',
                        prota: 'promes',
                        promes: 'bukukerja',
                        bukukerja: 'bukukerja',
                      };
                      handleGenerateStep(stepOrder[currentStep] || 'cp');
                    }}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
                  >
                    Minta AI Coba Lagi Langkah Ini
                  </button>
                </div>
              )}

              {/* 3. Empty / Initial State */}
              {!isLoading && !errorMsg && !generatedData && (
                <div className="flex-grow flex flex-col justify-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Mulai Pembuatan Administrasi Mengajar</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Sempurnakan isian kepala instansi, kode guru, & data kaldik di formulir parameter sebelah kiri. Setelah itu, klik tombol <strong>Generate Analisis CP</strong> di widget atas untuk mengawali alur pengerjaan.
                    </p>
                  </div>

                  {/* Progressive visual checklists */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alur Pengerjaan Buku Kerja (Step-by-Step)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 1 & 2: CP & TP</p>
                          <p className="text-[11px] text-slate-400 leading-snug">Menelaah secara jeli capaian pembelajaran & alokasi JP efektif.</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-slate-600">
                          <span className="text-slate-400">Status</span>
                          <span className="bg-slate-250 text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Antrian</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 3 & 4: ATP & PROTA</p>
                          <p className="text-[11px] text-slate-400 leading-snug">Penyusunan urutan Alur Tujuan Pembelajaran disangkutkan PPRA & P5.</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-slate-600">
                          <span className="text-slate-400">Status</span>
                          <span className="bg-slate-250 text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Antrian</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 5: PROMES Kaldik</p>
                          <p className="text-[11px] text-slate-400 leading-snug">Distribusi pemetaan JP mingguan di Gasal & Genap secara presisi.</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-slate-600">
                          <span className="text-slate-400">Status</span>
                          <span className="bg-slate-250 text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Antrian</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tahap 6: Berkas Administrasi Lengkap</p>
                          <p className="text-[11px] text-slate-400 leading-snug">Menyusun RPP Modul, Jurnal Mengajar, Kode Etik Pendidik, Kisi Evaluasi, Remedial, dan Refleksi Guru.</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-slate-600">
                          <span className="text-slate-400">Status</span>
                          <span className="bg-slate-250 text-slate-500 bg-slate-200 px-2 py-0.5 rounded text-xs">Unlock di akhir</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kemenag Guidelines card */}
                  <div className="border border-slate-150 rounded-xl p-3.5 bg-sky-50/25 border-sky-500/10 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide">Mendukung PPRA & Profil Kemenag KMA 1503</span>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        Penyusunan ini menyuntikkan pilar Moderasi Beragama secara tuntas, mencakup Tasamuh (Toleransi), Ta’addub (Adab), & Qudwah (Keteladanan) sebagai karakter madrasah dan Panca Cinta.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Display Generated Documents Preview */}
              {!isLoading && !errorMsg && generatedData && (
                <div className="flex-1 flex flex-col h-full">
                  <PreviewDoc
                    data={generatedData}
                    identitas={identitas}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Status / Metadata Bar at bottom */}
        <footer className="h-10 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-[10px] font-medium text-slate-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Server AI Aktif
            </span>
            <span className="text-[10px] text-slate-400 font-medium">TA {identitas.tahunPelajaran} • Kurikulum Madrasah KMA 1503/2025</span>
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Sistem Administrasi Guru Profesional ({identitas.mataPelajaran})
          </div>
        </footer>
      </main>

      {/* Styled inline helper styles for loading states */}
      <style>{`
        @keyframes indeterminate {
          0% { left: -35%; right: 100%; }
          60% { left: 100%; right: -90%; }
          100% { left: 100%; right: -90%; }
        }
        .animate-indeterminate {
          position: relative;
          animation: indeterminate 1.8s infinite linear;
        }
        .text-emerald-450 {
          color: #10b981;
        }
        .text-xxs {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
