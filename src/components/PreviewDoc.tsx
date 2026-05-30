/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { FullMerdekaResponse, IdentitasMadrasah, PromesItem } from '../types';
import { 
  FileText, Calendar, Printer, Copy, Check, Info, ShieldAlert,
  Award, RefreshCw, Send, CheckSquare, Settings, BookOpen
} from 'lucide-react';

interface PreviewDocProps {
  data: FullMerdekaResponse;
  identitas: IdentitasMadrasah;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PreviewDoc({ data, identitas, activeTab, setActiveTab }: PreviewDocProps) {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(identifier);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Convert tables to Markdown text for easy copy
  const getTPMarkdown = () => {
    let md = `### ANALISIS CP & PEMETAAN TUJUAN PEMBELAJARAN (TP)\n`;
    md += `**Madrasah:** ${identitas.namaMadrasah}\n`;
    md += `**Mata Pelajaran:** ${identitas.mataPelajaran}\n`;
    md += `**Fase / Kelas:** ${identitas.fase} / ${identitas.kelas}\n\n`;
    md += `#### 1. Kompetensi Utama:\n` + (data?.analisisCP?.kompetensi?.map(k => `- ${k}`).join('\n') || '') + `\n\n`;
    md += `#### 2. Lingkup Materi:\n` + (data?.analisisCP?.lingkupMateri?.map(m => `- ${m}`).join('\n') || '') + `\n\n`;
    md += `#### 3. Nilai Kekhasan Madrasah / Moderasi Beragama:\n${data?.analisisCP?.pesanKekhasanMadrasah || ''}\n\n`;
    md += `#### 4. Tabel Pemetaan TP:\n`;
    md += `| Kode TP | Kompetensi | Materi | Rumusan Tujuan Pembelajaran | JP | Semester |\n`;
    md += `|---------|------------|--------|-----------------------------|----|----------|\n`;
    data?.tujuanPembelajaran?.forEach(tp => {
      md += `| ${tp.id} | ${tp.kompetensi} | ${tp.materi} | ${tp.rumusanTP} | ${tp.jp} | ${tp.semester} |\n`;
    });
    return md;
  };

  const getATPMarkdown = () => {
    let md = `### ALUR TUJUAN PEMBELAJARAN (ATP)\n`;
    md += `**Madrasah:** ${identitas.namaMadrasah}\n\n`;
    md += `| No | Kode TP | Rumusan Tujuan Pembelajaran | Materi Pokok | Alokasi Waktu | Dimensi P5-PPRA |\n`;
    md += `|----|---------|-----------------------------|--------------|---------------|-----------------|\n`;
    data?.alurTujuanPembelajaran?.forEach(atp => {
      md += `| ${atp.no} | ${atp.tpId} | ${atp.rumusanTP} | ${atp.materiPokok} | ${atp.alokasiWaktu} JP | ${atp.dimensiP5PPRA} |\n`;
    });
    return md;
  };

  const getProtaMarkdown = () => {
    let md = `### PROGRAM TAHUNAN (PROTA)\n`;
    md += `**Lembaga:** ${identitas.namaMadrasah}\n\n`;
    md += `| No | Semester | Kode TP | Rumusan Tujuan Pembelajaran / Materi Pokok | Alokasi Waktu |\n`;
    md += `|----|----------|---------|--------------------------------------------|---------------|\n`;
    data?.programTahunan?.forEach(entry => {
      md += `| ${entry.no} | ${entry.semester} | ${entry.tpId} | ${entry.rumusanTP} (${entry.materiPokok}) | ${entry.alokasiWaktu} JP |\n`;
    });
    return md;
  };

  // Official Madrasah Header rendering
  const renderKopSurat = () => (
    <div className="text-center border-b-[3px] border-double border-black pb-4 mb-6 print:flex print:flex-col print:items-center">
      <h1 className="font-sans font-extrabold text-lg tracking-tight uppercase text-slate-800 print:text-black">
        KEMENTERIAN AGAMA REPUBLIK INDONESIA
      </h1>
      <h2 className="font-sans font-bold text-base tracking-normal uppercase text-slate-700 print:text-black">
        KANTOR KEMENTERIAN AGAMA KABUPATEN / KOTA
      </h2>
      <h3 className="font-sans font-black text-xl tracking-wide uppercase text-emerald-800 print:text-black">
        {identitas.namaMadrasah.toUpperCase()}
      </h3>
      <p className="font-sans text-xs italic text-slate-500 print:text-black print:not-italic mt-1">
        Jalan Madrasah No. 1503, Tahun Pelajaran {identitas.tahunPelajaran} — Terakreditasi Unggul
      </p>
    </div>
  );

  // Official Signature sign off rendering at the bottom
  const renderSignatures = (documentTitle: string) => (
    <div className="mt-12 grid grid-cols-2 gap-8 text-sm print:text-xs">
      <div className="text-center">
        <p className="mb-14">Mengetahui,<br /><strong className="font-semibold">Kepala Madrasah</strong></p>
        <p className="font-bold underline">{identitas.kepalaNama}</p>
        <p className="text-xs text-slate-500 print:text-black">NIP. {identitas.nipKepala}</p>
      </div>
      <div className="text-center">
        <p className="mb-14">Ciamis, 30 Mei 2026<br /><strong className="font-semibold">Guru Pengampu {identitas.mataPelajaran}</strong></p>
        <p className="font-bold underline">{identitas.guruNama}</p>
        <p className="text-xs text-slate-500 print:text-black">NIP. {identitas.nipGuru}</p>
      </div>
    </div>
  );

  return (
    <div id="preview-container" className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2 overflow-x-auto no-print">
        <div className="flex gap-1.5 min-w-max">
          {[
            { id: 'cp', label: '1. Analisis CP & TP' },
            { id: 'atp', label: '2. ATP Merdeka' },
            { id: 'prota', label: '3. PROTA Tahunan' },
            { id: 'promes', label: '4. PROMES Ganjil / Genap' },
            { id: 'bk1', label: 'Buku Kerja 1 (Modul RPP)' },
            { id: 'bk2', label: 'Buku Kerja 2 (RME & Kode Etik)' },
            { id: 'bk3', label: 'Buku Kerja 3 (Kisi & Remedial)' },
            { id: 'bk4', label: 'Buku Kerja 4 (Refleksi Diri)' },
            { id: 'cetak', label: '🖨️ Cetak Berkas Dinas' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Screen */}
      <div ref={printAreaRef} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm print:shadow-none print:border-none print-styled-card">
        
        {/* Printable headers only when in cetak mode OR inside current window print */}
        {(activeTab === 'cetak') && renderKopSurat()}

        {/* TAB 1: Analisis CP & TP */}
        {activeTab === 'cp' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Analisis Capaian Pembelajaran & Pemetaan TP
              </h2>
              <button
                onClick={() => handleCopyText(getTPMarkdown(), 'cp')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer"
              >
                {copiedSection === 'cp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'cp' ? 'Tersalin!' : 'Salin Markdown'}
              </button>
            </div>

            {/* CP Analysis summary boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Kompetensi Utama (Kata Kerja)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data?.analisisCP?.kompetensi?.map((k, idx) => (
                    <span key={idx} className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-md border border-emerald-100 font-medium">
                      {k}
                    </span>
                  )) || <span className="text-xs text-slate-400 italic">Belum ada data</span>}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Lingkup Materi Hasil Kupas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data?.analisisCP?.lingkupMateri?.map((m, idx) => (
                    <span key={idx} className="bg-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-md border border-slate-300 font-medium">
                      {m}
                    </span>
                  )) || <span className="text-xs text-slate-400 italic">Belum ada data</span>}
                </div>
              </div>
            </div>

            {/* Characteristic information banner */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700 animate-pulse" />
                Integrasi Nilai Madrasah & Moderasi Beragama
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed font-normal">
                {data?.analisisCP?.pesanKekhasanMadrasah || 'Menunggu analisis CP disusun...'}
              </p>
            </div>

            {/* TP Mapping Table */}
            {data?.tujuanPembelajaran ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="p-3 w-16">Kode</th>
                      <th className="p-3 w-32">Kompetensi</th>
                      <th className="p-3 w-32">Materi</th>
                      <th className="p-3">Rumusan Tujuan Pembelajaran (TP)</th>
                      <th className="p-3 w-16 text-center">JP</th>
                      <th className="p-3 w-24">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.tujuanPembelajaran.map((tp) => (
                      <tr key={tp.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono text-xs font-bold text-emerald-700">{tp.id}</td>
                        <td className="p-3 font-medium text-slate-800">{tp.kompetensi}</td>
                        <td className="p-3 text-slate-600">{tp.materi}</td>
                        <td className="p-3 font-normal text-slate-900 leading-relaxed">{tp.rumusanTP}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{tp.jp}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tp.semester === 'Ganjil' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {tp.semester}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Tujuan Pembelajaran (TP) belum digenerate. Silakan selesaikan langkah <strong>Generate TP</strong> terlebih dahulu.
              </div>
            )}
            
            {renderSignatures('Analisis CP')}
          </div>
        )}

        {/* TAB 2: Alur Tujuan Pembelajaran (ATP) */}
        {activeTab === 'atp' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Alur Tujuan Pembelajaran (ATP) Kronologis
              </h2>
              <button
                onClick={() => handleCopyText(getATPMarkdown(), 'atp')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer"
              >
                {copiedSection === 'atp' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'atp' ? 'Tersalin!' : 'Salin Markdown'}
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 leading-relaxed flex gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Prinsip ATP:</strong> Materi disusun secara berurutan dan logis dari konkret ke abstrak, serta dilengkapi dengan penguatan karakter Profil Pelajar Pancasila Rahmatan lil Alamin (P5-PPRA) khas Madrasah KMA 1503/2025 yang menekankan Pembelajaran Mendalam dan Kurikulum Berbasis Cinta.
              </span>
            </div>

            {data?.alurTujuanPembelajaran ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="p-3 w-12 text-center">Urutan</th>
                      <th className="p-3 w-20">Kode TP</th>
                      <th className="p-3">Alur & Rumusan TP (Komponen Ciri Khas Madrasah)</th>
                      <th className="p-3 w-40">Materi Pokok</th>
                      <th className="p-3 w-20 text-center">JP</th>
                      <th className="p-3">Dimensi P5 / Profil Rahmatan Lil Alamin (PPRA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.alurTujuanPembelajaran.map((atp) => (
                      <tr key={atp.no} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-center font-bold text-slate-400">{atp.no}</td>
                        <td className="p-3 font-mono text-xs font-bold text-emerald-700">{atp.tpId}</td>
                        <td className="p-3 font-normal text-slate-900 leading-relaxed">{atp.rumusanTP}</td>
                        <td className="p-3 font-medium text-slate-700">{atp.materiPokok}</td>
                        <td className="p-3 text-center font-bold text-emerald-800">{atp.alokasiWaktu} JP</td>
                        <td className="p-3 text-xs text-emerald-900 font-medium">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-1 rounded block leading-normal">
                            {atp.dimensiP5PPRA}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Alur Tujuan Pembelajaran (ATP) belum digenerate. Silakan selesaikan langkah <strong>Generate ATP</strong> terlebih dahulu.
              </div>
            )}

            {renderSignatures('Alur Tujuan Pembelajaran')}
          </div>
        )}

        {/* TAB 3: Program Tahunan (PROTA) */}
        {activeTab === 'prota' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Program Tahunan (PROTA) Merdeka
              </h2>
              <button
                onClick={() => handleCopyText(getProtaMarkdown(), 'prota')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer"
              >
                {copiedSection === 'prota' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'prota' ? 'Tersalin!' : 'Salin Markdown'}
              </button>
            </div>

            {data?.programTahunan ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <th className="p-3 w-16 text-center">No</th>
                      <th className="p-3 w-32">Semester</th>
                      <th className="p-3 w-24">Kode TP</th>
                      <th className="p-3">Materi Pokok & Rumusan TP Utama</th>
                      <th className="p-3 w-28 text-center">Alokasi Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.programTahunan.map((item) => (
                      <tr key={item.no} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-center">{item.no}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.semester === 'Ganjil' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.semester}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs font-bold text-emerald-700">{item.tpId}</td>
                        <td className="p-3">
                          <strong className="text-slate-800 block text-xs">{item.materiPokok}</strong>
                          <span className="text-slate-600 text-[11px] leading-tight block mt-0.5">{item.rumusanTP}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-800">{item.alokasiWaktu} JP</td>
                      </tr>
                    ))}
                    {/* Total calculation row */}
                    <tr className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                      <td colSpan={4} className="p-3 text-right">TOTAL ALOKASI WAKTU 1 TAHUN:</td>
                      <td className="p-3 text-center text-emerald-800">
                        {data.programTahunan.reduce((acc, curr) => acc + curr.alokasiWaktu, 0)} JP
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Program Tahunan (PROTA) belum digenerate. Silakan selesaikan langkah <strong>Generate PROTA</strong> terlebih dahulu.
              </div>
            )}

            {renderSignatures('Program Tahunan')}
          </div>
        )}

        {/* TAB 4: Program Semester (PROMES) */}
        {activeTab === 'promes' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 no-print">
              <Calendar className="w-5 h-5 text-sky-600" />
              Program Semester (PROMES) Ganjil & Genap
            </h2>

            {data?.programSemesterGanjil && data?.programSemesterGenap ? (
              <>
                {/* GANJIL PROMES SECTOR */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg inline-block border border-sky-100">
                    PROMES SEMESTER GANJIL
                  </h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-slate-200 text-slate-600">
                          <th className="p-2 w-16" rowSpan={2}>Kode</th>
                          <th className="p-2 min-w-[200px]" rowSpan={2}>Materi Pokok / Rumusan TP</th>
                          <th className="p-2 w-14 text-center" rowSpan={2}>JP</th>
                          {data.programSemesterGanjil.bulanList.map((bln, bIdx) => (
                            <th key={bIdx} className="p-1 border border-slate-200 text-center uppercase" colSpan={4}>
                              {bln}
                            </th>
                          ))}
                        </tr>
                        <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                          {data.programSemesterGanjil.bulanList.map((_, idx) => (
                            <React.Fragment key={idx}>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W1</th>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W2</th>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W3</th>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W4</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {data.programSemesterGanjil.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-emerald-800">{item.tpId}</td>
                            <td className="p-2 leading-tight">
                              <strong className="text-slate-800 font-bold">{item.rumusanTP.split(' — ')[0] || item.rumusanTP}</strong>
                            </td>
                            <td className="p-2 text-center font-bold text-slate-700">{item.alokasiWaktu}</td>
                            {data.programSemesterGanjil.bulanList.map((bln) => (
                              <React.Fragment key={bln}>
                                {[1, 2, 3, 4].map((w) => {
                                  const key = `${bln}-W${w}`;
                                  const val = item.distribusi[key] || '';
                                  const isSpecial = val === 'UH' || val === 'STS' || val === 'SAS' || val === 'L';
                                  return (
                                    <td
                                      key={w}
                                      className={`p-1 border border-slate-100 text-center font-bold ${
                                        isSpecial ? 'bg-amber-100 text-amber-700' : val ? 'bg-sky-50 text-sky-800' : ''
                                      }`}
                                    >
                                      {val}
                                    </td>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GENAP PROMES SECTOR */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg inline-block border border-amber-100">
                    PROMES SEMESTER GENAP
                  </h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-slate-200 text-slate-600">
                          <th className="p-2 w-16" rowSpan={2}>Kode</th>
                          <th className="p-2 min-w-[200px]" rowSpan={2}>Materi Pokok / Rumusan TP</th>
                          <th className="p-2 w-14 text-center" rowSpan={2}>JP</th>
                          {data.programSemesterGenap.bulanList.map((bln, bIdx) => (
                            <th key={bIdx} className="p-1 border border-slate-200 text-center uppercase" colSpan={4}>
                              {bln}
                            </th>
                          ))}
                        </tr>
                        <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-500">
                          {data.programSemesterGenap.bulanList.map((_, idx) => (
                            <React.Fragment key={idx}>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W1</th>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W2</th>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W3</th>
                              <th className="p-1 border border-slate-200 text-[10px] text-center w-6">W4</th>
                            </React.Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {data.programSemesterGenap.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-emerald-800">{item.tpId}</td>
                            <td className="p-2 leading-tight">
                              <strong className="text-slate-800 font-bold">{item.rumusanTP.split(' — ')[0] || item.rumusanTP}</strong>
                            </td>
                            <td className="p-2 text-center font-bold text-slate-700">{item.alokasiWaktu}</td>
                            {data.programSemesterGenap.bulanList.map((bln) => (
                              <React.Fragment key={bln}>
                                {[1, 2, 3, 4].map((w) => {
                                  const key = `${bln}-W${w}`;
                                  const val = item.distribusi[key] || '';
                                  const isSpecial = val === 'UH' || val === 'STS' || val === 'SAS' || val === 'L';
                                  return (
                                    <td
                                      key={w}
                                      className={`p-1 border border-slate-100 text-center font-bold ${
                                        isSpecial ? 'bg-amber-100 text-amber-700' : val ? 'bg-amber-50 text-amber-800' : ''
                                      }`}
                                    >
                                      {val}
                                    </td>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {renderSignatures('Program Semester')}
              </>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Program Semester (PROMES) belum digenerate. Silakan selesaikan langkah <strong>Generate PROMES</strong> terlebih dahulu.
              </div>
            )}
          </div>
        )}

        {/* BUKU KERJA 1 (Modul RPP Singkat) */}
        {activeTab === 'bk1' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Buku Kerja 1: Rancangan Modul Ajar Singkat (Merdeka Madrasah)
            </h2>

            {data?.bukuKerja1?.rancanganModulAjar ? (
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">1. TUJUAN PEMBELAJARAN</h3>
                  <p className="text-sm text-slate-600 mt-1">{data.bukuKerja1.rancanganModulAjar.tujuan}</p>
                </div>

                <div className="border-b border-slate-200 pb-3 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">2. LANGKAH-LANGKAH KEGIATAN</h3>
                  
                  <div className="space-y-2 pl-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700" />
                      A. Pendahuluan (Pembuka Qur'ani)
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-3">
                      {data.bukuKerja1.rancanganModulAjar.langkahKegiatan.pendahuluan.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pl-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600" />
                      B. Kegiatan Inti (Pembelajaran Aktif & Bermakna)
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-3">
                      {data.bukuKerja1.rancanganModulAjar.langkahKegiatan.inti.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pl-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      C. Penutup (Evaluasi & Doa Kafarotul Majlis)
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-3">
                      {data.bukuKerja1.rancanganModulAjar.langkahKegiatan.penutup.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">3. RENCANA ASESMEN</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <strong className="text-xs text-emerald-700 block mb-1">Asesmen Formatif</strong>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{data.bukuKerja1.rancanganModulAjar.rencanaAsesmen.formatif}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <strong className="text-xs text-amber-700 block mb-1">Asesmen Sumatif</strong>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{data.bukuKerja1.rancanganModulAjar.rencanaAsesmen.sumatif}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Buku Kerja 1 belum digenerate. Silakan selesaikan seluruh proses generate sampai akhir.
              </div>
            )}

            {renderSignatures('Rancangan Modul')}
          </div>
        )}

        {/* BUKU KERJA 2 (RME & Kode Etik) */}
        {activeTab === 'bk2' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Buku Kerja 2: RME, Kode Etik Guru, & Jurnal Mengajar
            </h2>

            {data?.bukuKerja2 ? (
              <>
                {/* Kode Etik */}
                <div className="space-y-2 bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Rambu-rambu Kode Etik Guru Madrasah
                  </h3>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5">
                    {data.bukuKerja2.kodeEtikGuru.map((kt, i) => (
                      <li key={i}>{kt}</li>
                    ))}
                  </ul>
                </div>

                {/* Kaldik Analysis / RME */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">Analisis Rincian Minggu Efektif (RME)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ganjil */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <div className="bg-sky-50 px-3 py-2 border-b border-slate-200 font-bold text-sky-800">
                        Semester Ganjil
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-600">
                          <span>Total Minggu Kalender:</span>
                          <strong className="text-slate-800">{data.bukuKerja2.analisisMingguEfektif.ganjil.totalMinggu} Minggu</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-600">
                          <span>Sebab Tidak Efektif:</span>
                          <strong className="text-slate-800 text-[10px] max-w-[200px] text-right">{data.bukuKerja2.analisisMingguEfektif.ganjil.rincianTidakEfektif}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 text-sky-700">
                          <span>Minggu Efektif Pembelajaran:</span>
                          <strong>{data.bukuKerja2.analisisMingguEfektif.ganjil.mingguEfektif} Minggu</strong>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-800 pt-1">
                          <span>Total Jam Pelajaran Efektif:</span>
                          <span>{data.bukuKerja2.analisisMingguEfektif.ganjil.totalJP} JP</span>
                        </div>
                      </div>
                    </div>

                    {/* Genap */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <div className="bg-amber-50 px-3 py-2 border-b border-slate-200 font-bold text-amber-800">
                        Semester Genap
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-600">
                          <span>Total Minggu Kalender:</span>
                          <strong className="text-slate-800">{data.bukuKerja2.analisisMingguEfektif.genap.totalMinggu} Minggu</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 text-slate-600">
                          <span>Sebab Tidak Efektif:</span>
                          <strong className="text-slate-800 text-[10px] max-w-[200px] text-right">{data.bukuKerja2.analisisMingguEfektif.genap.rincianTidakEfektif}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5 text-amber-700">
                          <span>Minggu Efektif Pembelajaran:</span>
                          <strong>{data.bukuKerja2.analisisMingguEfektif.genap.mingguEfektif} Minggu</strong>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-800 pt-1">
                          <span>Total Jam Pelajaran Efektif:</span>
                          <span>{data.bukuKerja2.analisisMingguEfektif.genap.totalJP} JP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jurnal Harian */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">Template Jurnal Agenda Mengajar Guru</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-600">
                          <th className="p-2.5 w-28">Hari, Tanggal</th>
                          <th className="p-2.5 w-16 text-center">Kelas</th>
                          <th className="p-2.5 w-16 text-center">Jam Ke</th>
                          <th className="p-2.5 w-16">Kode TP</th>
                          <th className="p-2.5">Materi Pokok Kegiatan Pembelajaran</th>
                          <th className="p-2.5">Pencapaian Target</th>
                          <th className="p-2.5">Catatan / Hambatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {data.bukuKerja2.jurnalAgendaMengajar.map((journal, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-800">{journal.hariTanggal}</td>
                            <td className="p-2.5 text-center">{journal.kelas}</td>
                            <td className="p-2.5 text-center font-bold text-emerald-800">{journal.jamKe}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">{journal.tpId}</td>
                            <td className="p-2.5 leading-normal">{journal.materiPokok}</td>
                            <td className="p-2.5">{journal.pencapaian}</td>
                            <td className="p-2.5">{journal.keterangan}</td>
                          </tr>
                        ))}
                        {/* Empty block rows for real writing */}
                        {[1, 2].map((x) => (
                          <tr key={`empty-${x}`} className="bg-slate-50/20 h-10">
                            <td className="p-2.5 border border-slate-100 italic text-slate-400">... / ...</td>
                            <td className="p-2.5 border border-slate-100"></td>
                            <td className="p-2.5 border border-slate-100"></td>
                            <td className="p-2.5 border border-slate-100"></td>
                            <td className="p-2.5 border border-slate-100 italic text-slate-300">(Isian Harian Guru)</td>
                            <td className="p-2.5 border border-slate-100"></td>
                            <td className="p-2.5 border border-slate-100"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Buku Kerja 2 belum digenerate. Silakan selesaikan seluruh proses generate sampai akhir.
              </div>
            )}

            {renderSignatures('Buku Kerja 2')}
          </div>
        )}
         {/* BUKU KERJA 3 (Kisi, Remedial, Pengayaan) */}
        {activeTab === 'bk3' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Buku Kerja 3: Kisi-kisi Asesmen, Remedial, & Pengayaan
            </h2>

            {data?.bukuKerja3 ? (
              <>
                {/* Kisi-kisi */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">Kisi-kisi Penilaian Formatif / Sumatif</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-600">
                          <th className="p-2.5 w-12 text-center">No</th>
                          <th className="p-2.5 w-16">Kode TP</th>
                          <th className="p-2.5 w-48">Materi Dasar</th>
                          <th className="p-2.5">Indikator Pencapaian Soal (HOTS)</th>
                          <th className="p-2.5 w-24">Bentuk Soal</th>
                          <th className="p-2.5 w-24 text-center">Lvl Kognitif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {data.bukuKerja3.kisikisiAsesmen.map((kisi) => (
                          <tr key={kisi.no} className="hover:bg-slate-50">
                            <td className="p-2.5 text-center">{kisi.no}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">{kisi.tpId}</td>
                            <td className="p-2.5 font-bold">{kisi.materi}</td>
                            <td className="p-2.5 leading-normal">{kisi.indikatorSoal}</td>
                            <td className="p-2.5">{kisi.bentukSoal}</td>
                            <td className="p-2.5 text-center font-bold text-emerald-800">{kisi.levelKognitif}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Remedial & Pengayaan Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Remedial */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      Program Tindak Lanjut: Remedial
                    </h4>
                    <div className="text-xs text-slate-700 space-y-2">
                      <p><strong>Metode & Pendekatan:</strong> {data.bukuKerja3.programRemedial.metode}</p>
                      <div>
                        <strong className="block mb-1 text-amber-900 font-bold">Butir Soal Remedial Khas:</strong>
                        <ol className="list-decimal list-inside pl-1.5 space-y-1">
                          {data.bukuKerja3.programRemedial.soalRemedial.map((soal, i) => (
                            <li key={i} className="leading-relaxed font-normal">{soal}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Pengayaan */}
                  <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-700 font-semibold" />
                      Program Tindak Lanjut: Pengayaan (HOTS)
                    </h4>
                    <div className="text-xs text-slate-700 space-y-2">
                      <p><strong>Metode & Aktivitas:</strong> {data.bukuKerja3.programPengayaan.aktivitas}</p>
                      <div>
                        <strong className="block mb-1 text-emerald-900 font-bold">BUTIR Soal Pengayaan Penguatan:</strong>
                        <ol className="list-decimal list-inside pl-1.5 space-y-1">
                          {data.bukuKerja3.programPengayaan.soalPengayaan.map((soal, i) => (
                            <li key={i} className="leading-relaxed font-normal">{soal}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Buku Kerja 3 belum digenerate. Silakan selesaikan seluruh proses generate sampai akhir.
              </div>
            )}

            {renderSignatures('Buku Kerja 3')}
          </div>
        )}

        {/* BUKU KERJA 4 (Refleksi Diri & RTL) */}
        {activeTab === 'bk4' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Buku Kerja 4: Lembar Refleksi Diri Guru & RTL
            </h2>

            {data?.bukuKerja4 ? (
              <>
                {/* Refleksi Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">Instrumen Evaluasi Diri Pengajaran Guru</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-600">
                          <th className="p-3 w-1/4">Aspek Penilaian</th>
                          <th className="p-3 w-2/5">Pertanyaan Panduan Refleksi</th>
                          <th className="p-3">Catatan / Jawaban Refleksi Diri Guru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {data.bukuKerja4.lembarRefleksiGuru.map((ref, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{ref.aspek}</td>
                            <td className="p-3 leading-relaxed font-normal text-slate-600">{ref.pertanyaanRefleksi}</td>
                            <td className="p-3 font-normal italic text-slate-800 bg-emerald-50/10 leading-relaxed">{ref.jawabanRefleksiGuru}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RTL */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                    Rencana Tindak Lanjut Kontinu (RTL) Guru Profesional
                  </h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    Tindakan lanjut dari hasil penilaian refleksi di atas guna peningkatan performa mengajar dalam rumpun mata pelajaran {identitas.mataPelajaran}:
                  </p>
                  <ul className="list-decimal list-inside text-xs text-slate-700 space-y-2">
                    {data.bukuKerja4.rencanaTindakLanjut.map((rtl, idx) => (
                      <li key={idx} className="leading-relaxed pl-1">{rtl}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Buku Kerja 4 belum digenerate. Silakan selesaikan seluruh proses generate sampai akhir.
              </div>
            )}

            {renderSignatures('Buku Kerja 4')}
          </div>
        )}

        {/* TAB 9: Cetak Berkas Lengkap */}
        {activeTab === 'cetak' && (
          <div className="space-y-12">
            <div className="no-print bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-800">
                  Mode Cetak Dinas Siap Diaktifkan
                </h4>
                <p className="text-xs text-emerald-700">
                  Seluruh berkas administrasi telah digabungkan dengan format Kop Surat resmi dan baris tanda tangan. Gunakan tombol di samping atau tekan <strong>Ctrl + P</strong>.
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                Hubungkan ke Printer / Simpan PDF
              </button>
            </div>

            {/* Sequential documents with page break in printing */}
            <div className="space-y-12 text-slate-900 print:text-black font-sans leading-relaxed">
              
              {/* DOC 1: CP & TP */}
              <div>
                <h2 className="text-center font-bold text-base underline uppercase mb-4">
                  LAPORAN PORTAL ANALISIS CP & PEMETAAN TUJUAN PEMBELAJARAN
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 print:text-black mb-4">
                  <div>Madrasah: {identitas.namaMadrasah}</div>
                  <div>Tahun Pelajaran: {identitas.tahunPelajaran}</div>
                  <div>Mata Pelajaran: {identitas.mataPelajaran}</div>
                  <div>Fase / Kelas: {identitas.fase} / {identitas.kelas}</div>
                </div>

                <div className="text-xs leading-relaxed space-y-3 mb-6">
                  <p><strong>Kompetensi Utama CP:</strong> {data.analisisCP.kompetensi.join(', ')}</p>
                  <p><strong>Lingkup Materi Kupasan:</strong> {data.analisisCP.lingkupMateri.join(', ')}</p>
                  <p><strong>Integrasi Nilai Madrasah:</strong> {data.analisisCP.pesanKekhasanMadrasah}</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-black mb-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="p-2">Kode</th>
                        <th className="p-2">Kompetensi</th>
                        <th className="p-2">Materi</th>
                        <th className="p-2">Rumusan TP Karakter Madrasah</th>
                        <th className="p-2 text-center">JP</th>
                        <th className="p-2">Semester</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.tujuanPembelajaran.map((tp) => (
                        <tr key={tp.id}>
                          <td className="p-2 font-mono font-bold text-emerald-800">{tp.id}</td>
                          <td className="p-2">{tp.kompetensi}</td>
                          <td className="p-2">{tp.materi}</td>
                          <td className="p-2">{tp.rumusanTP}</td>
                          <td className="p-2 text-center font-bold">{tp.jp}</td>
                          <td className="p-2">{tp.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderSignatures('Analisis CP')}
              </div>

              <div className="print-page-break border-t border-slate-200 pt-8" />

              {/* DOC 2: ATP */}
              <div>
                <h2 className="text-center font-bold text-base underline uppercase mb-6">
                  ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM MERDEKA
                </h2>

                <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-black mb-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="p-2 text-center">No</th>
                        <th className="p-2">Kode TP</th>
                        <th className="p-2">Rumusan Tujuan Pembelajaran (ATP)</th>
                        <th className="p-2">Materi Pokok</th>
                        <th className="p-2 text-center">JP</th>
                        <th className="p-2">Dimensi Karakter P5-PPRA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.alurTujuanPembelajaran.map((atp) => (
                        <tr key={atp.no}>
                          <td className="p-2 text-center">{atp.no}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">{atp.tpId}</td>
                          <td className="p-2">{atp.rumusanTP}</td>
                          <td className="p-2">{atp.materiPokok}</td>
                          <td className="p-2 text-center font-bold">{atp.alokasiWaktu} JP</td>
                          <td className="p-2 text-[10px]">{atp.dimensiP5PPRA}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderSignatures('ATP')}
              </div>

              <div className="print-page-break border-t border-slate-200 pt-8" />

              {/* DOC 3: PROTA */}
              <div>
                <h2 className="text-center font-bold text-base underline uppercase mb-6">
                  PROGRAM TAHUNAN (PROTA) MADRASAH
                </h2>

                <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-black mb-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="p-2 text-center">No</th>
                        <th className="p-2">Semester</th>
                        <th className="p-2">Kode TP</th>
                        <th className="p-2">Rumusan Tujuan Pembelajaran / Materi Pokok</th>
                        <th className="p-2 text-center">Alokasi Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.programTahunan.map((item) => (
                        <tr key={item.no}>
                          <td className="p-2 text-center">{item.no}</td>
                          <td className="p-2">{item.semester}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">{item.tpId}</td>
                          <td className="p-2">{item.rumusanTP} ({item.materiPokok})</td>
                          <td className="p-2 text-center font-bold">{item.alokasiWaktu} JP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderSignatures('Prota')}
              </div>

              <div className="print-page-break border-t border-slate-200 pt-8" />

              {/* DOC 4: RPP MODUL */}
              <div>
                <h2 className="text-center font-bold text-base underline uppercase mb-6">
                  LAMPIRAN BUKU KERJA 1: MODUL AJAR SINGKAT (RPP METODE PRAKTIS)
                </h2>

                <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-4">
                  <p><strong>A. Sasaran / Tujuan:</strong> {data.bukuKerja1.rancanganModulAjar.tujuan}</p>
                  <div>
                    <strong>B. Skenario Pembelajaran:</strong>
                    <div className="pl-3 mt-1.5 space-y-2">
                      <p><strong>1. Pendahuluan:</strong></p>
                      <ul className="list-disc list-inside text-slate-600 pl-2">
                        {data.bukuKerja1.rancanganModulAjar.langkahKegiatan.pendahuluan.map((l, i) => <li key={i}>{l}</li>)}
                      </ul>
                      <p><strong>2. Kegiatan Inti:</strong></p>
                      <ul className="list-disc list-inside text-slate-600 pl-2">
                        {data.bukuKerja1.rancanganModulAjar.langkahKegiatan.inti.map((l, i) => <li key={i}>{l}</li>)}
                      </ul>
                      <p><strong>3. Kegiatan Penutup:</strong></p>
                      <ul className="list-disc list-inside text-slate-600 pl-2">
                        {data.bukuKerja1.rancanganModulAjar.langkahKegiatan.penutup.map((l, i) => <li key={i}>{l}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <strong>C. Pola Asesmen:</strong>
                    <p className="mt-1">Formatif: {data.bukuKerja1.rancanganModulAjar.rencanaAsesmen.formatif}</p>
                    <p className="mt-1">Sumatif: {data.bukuKerja1.rancanganModulAjar.rencanaAsesmen.sumatif}</p>
                  </div>
                </div>

                {renderSignatures('Buku Kerja 1')}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
