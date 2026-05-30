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
  Layers, Hammer, Printer, BookOpenCheck, Settings
} from 'lucide-react';

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

  // Step names for animated progress loader
  const stepTexts = [
    'Mendiagnosis kompetensi utama & materi pokok dari teks CP...',
    'Menyelaraskan dengan rujukan regulasi KMA Nomor 450 Tahun 2024...',
    'Mengintegrasikan nilai-nilai Moderasi Beragama & Rahmatan Lil Alamin (PPRA)...',
    'Membuat pemetaan Program Tahunan (PROTA) berdasarkan alokasi minggu efektif...',
    'Menyebarkan Jam Pelajaran (JP) ke dalam template kalender Program Semester (PROMES)...',
    'Menyusun kerangka pembelajaran interaktif Madrasah di Buku Kerja 1...',
    'Menyusun Kisi-Kisi Asesmen, Analisis RME, & Remedial di Buku Kerja 2 s.d 4...',
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
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/generate-merdeka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identitas,
          kaldik,
          teksCP,
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
        try {
          const textMsg = await response.text();
          console.error('Non-JSON response:', textMsg);
        } catch (e) {}
        throw new Error('Server tidak mengembalikan format JSON yang valid. Silakan coba lagi.');
      }

      const data: FullMerdekaResponse = await response.json();
      setGeneratedData(data);
      setActiveTab('cp'); // reset to first tab on success
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Koneksi ke server gagal atau response AI lambat. Coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
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
                🏁 KMA 450/2024
              </span>
            </div>

            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2.5 px-1">Laporan & Berkas</p>

            {/* Sidebar Navigation items */}
            <nav className="space-y-1">
              {[
                { id: 'cp', label: '1. Analisis CP/TP' },
                { id: 'atp', label: '2. ATP Merdeka' },
                { id: 'prota', label: '3. PROTA Tahunan' },
                { id: 'promes', label: '4. PROMES Kaldik' },
                { id: 'bk1', label: 'Buku Kerja 1' },
                { id: 'bk2', label: 'Buku Kerja 2' },
                { id: 'bk3', label: 'Buku Kerja 3' },
                { id: 'bk4', label: 'Buku Kerja 4' },
                { id: 'cetak', label: '🖨️ Cetak Berkas' },
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
                    {!generatedData && tabItem.id !== 'cp' && (
                      <span className="text-[9px] text-slate-600 px-1 hover:text-slate-400">ready</span>
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
                Sesuai Keputusan KMA No. 450 Tahun 2024 & Panduan (PPA) Kemenag RI terbaru.
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
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-650/20 transition duration-150 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {isLoading ? 'Menghubungkan AI...' : 'Generate Ulang'}
            </button>
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
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>

            {/* Right Box: Output document/progress viewport */}
            <div className="xl:col-span-7 flex flex-col h-full min-h-[500px]">
              
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
                    <h3 className="text-base font-bold text-slate-800">Menyusun Perangkat Kurikulum...</h3>
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
                    *Pembuatan 4 Buku Kerja simultan secara mendalam memerlukan waktu kurang lebih 30-40 detik. Terima kasih telah menunggu.
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
                    onClick={handleGenerate}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
                  >
                    Minta AI Coba Lagi
                  </button>
                </div>
              )}

              {/* 3. Empty State with Modern Progress Tracker matching 'Sleek Interface' mockup */}
              {!isLoading && !errorMsg && !generatedData && (
                <div className="flex-grow flex flex-col justify-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="text-center space-y-2 py-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Menunggu Inisialisasi Perangkat AI</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Sempurnakan isian kelayakan instansi & target jam ajar kalender pengajaran di menu parameter, lalu klik <strong>Generate Dokumen</strong> untuk melengkapi otomatis via AI.
                    </p>
                  </div>

                  {/* Progress Tracker Cards */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alur Pengerjaan Buku Kerja</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Buku Kerja 1</p>
                          <p className="text-[11px] text-slate-500 leading-snug">Menyertai modul ajar, target TP & ATP bermutu tinggi.</p>
                        </div>
                        <div className="mt-3">
                          <div className="h-1.5 w-full bg-emerald-100 rounded-full">
                            <div className="h-full w-full bg-emerald-600 rounded-full"></div>
                          </div>
                          <p className="text-[9px] mt-2 font-semibold text-emerald-800">Ready to Print</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Buku Kerja 2</p>
                          <p className="text-[11px] text-slate-500 leading-snug">Minggu Efektif, Program Semester, Jurnal Agenda & Etik Guru.</p>
                        </div>
                        <div className="mt-3">
                          <div className="h-1.5 w-full bg-slate-200 rounded-full">
                            <div className="h-full w-1/3 bg-slate-400 rounded-full animate-pulse"></div>
                          </div>
                          <p className="text-[9px] mt-2 font-semibold text-slate-600">Drafting 30%</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 opacity-60 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Buku Kerja 3</p>
                          <p className="text-[11px] text-slate-400 leading-snug">Kriteria Ketercapaian, Kisi Evaluasi, Program remedial & pengayaan.</p>
                        </div>
                        <div className="mt-3">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                          <p className="text-[9px] mt-2 text-slate-500">Antrian Penyusunan</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 opacity-60 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Buku Kerja 4</p>
                          <p className="text-[11px] text-slate-400 leading-snug">Refleksi Kinerja Guru, lembar instrumen balikan, dan tindak lanjut.</p>
                        </div>
                        <div className="mt-3">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                          <p className="text-[9px] mt-2 text-slate-500">Antrian Penyusunan</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kemenag Guidelines card */}
                  <div className="border border-slate-150 rounded-xl p-3.5 bg-sky-50/20 border-sky-500/10 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide">Mendukung PPRA & Profil Kemenag</span>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed">
                        Penyusunan ini menyuntikkan pilar Moderasi Beragama secara tuntas, mencakup Tasamuh (Toleransi), Ta’addub (Adab), & Qudwah (Keteladanan) sebagai karakter madrasah.
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
            <span className="text-[10px] text-slate-400 font-medium">TA {identitas.tahunPelajaran} • Versi Kurikulum 1.4.2</span>
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
      `}</style>
    </div>
  );
}
