/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRESETS_MAPEL, PresetMapel } from '../data/presets';
import { IdentitasMadrasah, KaldikData } from '../types';
import { BookOpen, Calendar, Calculator, Sparkles, FileText, UserCheck } from 'lucide-react';

interface InputFormProps {
  identitas: IdentitasMadrasah;
  setIdentitas: React.Dispatch<React.SetStateAction<IdentitasMadrasah>>;
  kaldik: KaldikData;
  setKaldik: React.Dispatch<React.SetStateAction<KaldikData>>;
  teksCP: string;
  setTeksCP: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function InputForm({
  identitas,
  setIdentitas,
  kaldik,
  setKaldik,
  teksCP,
  setTeksCP,
  onGenerate,
  isLoading,
}: InputFormProps) {
  
  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    if (!presetId) return;
    
    const preset = PRESETS_MAPEL.find((p) => p.id === presetId);
    if (preset) {
      setIdentitas((prev) => ({
        ...prev,
        mataPelajaran: preset.mataPelajaran,
        fase: preset.fase,
        kelas: preset.kelas.split(' / ')[0],
        namaMadrasah: preset.namaMadrasahDefault,
      }));
      setKaldik((prev) => ({
        ...prev,
        jpPerMinggu: preset.jpPerMinggu,
      }));
      setTeksCP(preset.teksCP);
    }
  };

  const handleIdentitasChange = (field: keyof IdentitasMadrasah, value: string) => {
    setIdentitas((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKaldikChange = (field: keyof KaldikData, value: number) => {
    setKaldik((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div id="form-container" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Subject Preset Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          PILIH TEMPLATE MATA PELAJARAN MADRASAH
        </label>
        <div className="relative">
          <select
            id="preset-select"
            onChange={handleSelectPreset}
            defaultValue=""
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-sm cursor-pointer"
          >
            <option value="" disabled>-- Pilih mata pelajaran (Opsional untuk Autocomplete) --</option>
            {PRESETS_MAPEL.map((p) => (
              <option key={p.id} value={p.id}>
                {p.mataPelajaran} - Fase {p.fase} ({p.kelas})
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3 pointer-events-none">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
          *Memilih template akan otomatis mengisi Identitas, Alokasi JP, dan rumusan Capaian Pembelajaran standar Kemenag.
        </p>
      </div>

      <div className="border-t border-slate-100 my-4" />

      {/* Identitas Madrasah */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Identitas Madrasah
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nama Madrasah</label>
            <input
              id="nama-madrasah"
              type="text"
              value={identitas.namaMadrasah}
              onChange={(e) => handleIdentitasChange('namaMadrasah', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
              placeholder="e.g. MI Negeri 8 Ciamis"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mata Pelajaran</label>
            <input
              id="mata-pelajaran"
              type="text"
              value={identitas.mataPelajaran}
              onChange={(e) => handleIdentitasChange('mataPelajaran', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
              placeholder="e.g. Fikih"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Fase</label>
            <select
              id="fase"
              value={identitas.fase}
              onChange={(e) => handleIdentitasChange('fase', e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
            >
              <option value="A">A (Kl. 1-2)</option>
              <option value="B">B (Kl. 3-4)</option>
              <option value="C">C (Kl. 5-6)</option>
              <option value="D">D (Kl. 7-9)</option>
              <option value="E">E (Kl. 10)</option>
              <option value="F">F (Kl. 11-12)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Kelas</label>
            <input
              id="kelas"
              type="text"
              value={identitas.kelas}
              onChange={(e) => handleIdentitasChange('kelas', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
              placeholder="e.g. V (Lima)"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Semester</label>
            <select
              id="semester"
              value={identitas.semester}
              onChange={(e) => handleIdentitasChange('semester', e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition cursor-pointer"
            >
              <option value="Satu Tahun">1 Tahun</option>
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tahun Pelajaran</label>
            <input
              id="tahun-pelajaran"
              type="text"
              value={identitas.tahunPelajaran}
              onChange={(e) => handleIdentitasChange('tahunPelajaran', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
              placeholder="e.g. 2026/2027"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3 h-3 text-slate-400" /> Guru Pengampu
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <input
                id="guru-nama"
                type="text"
                value={identitas.guruNama}
                onChange={(e) => handleIdentitasChange('guruNama', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                placeholder="Nama Guru beserta Gelar"
              />
              <input
                id="nip-guru"
                type="text"
                value={identitas.nipGuru}
                onChange={(e) => handleIdentitasChange('nipGuru', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                placeholder="NIP Guru (Masukkan '-' jika tidak ada)"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3 h-3 text-slate-400" /> Kepala Madrasah
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <input
                id="kepala-nama"
                type="text"
                value={identitas.kepalaNama}
                onChange={(e) => handleIdentitasChange('kepalaNama', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                placeholder="Nama Kepala Madrasah & Gelar"
              />
              <input
                id="nip-kepala"
                type="text"
                value={identitas.nipKepala}
                onChange={(e) => handleIdentitasChange('nipKepala', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
                placeholder="NIP Kepala Madrasah"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 my-4" />

      {/* Kalender Pendidikan */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-600" />
          Kalender Pendidikan (Kaldik)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              Minggu Efektif Ganjil
              <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 rounded-full border border-sky-100 font-bold">Ganjil</span>
            </label>
            <input
              id="minggu-ganjil"
              type="number"
              min={1}
              max={30}
              value={kaldik.mingguGanjil}
              onChange={(e) => handleKaldikChange('mingguGanjil', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              Minggu Efektif Genap
              <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 rounded-full border border-amber-100 font-bold">Genap</span>
            </label>
            <input
              id="minggu-genap"
              type="number"
              min={1}
              max={30}
              value={kaldik.mingguGenap}
              onChange={(e) => handleKaldikChange('mingguGenap', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Calculator className="w-3 h-3 text-slate-400" />
              Alokasi JP per Minggu
            </label>
            <input
              id="jp-per-minggu"
              type="number"
              min={1}
              max={10}
              value={kaldik.jpPerMinggu}
              onChange={(e) => handleKaldikChange('jpPerMinggu', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
        </div>

        {/* Calculation summary info */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-wrap justify-around gap-4 text-xs font-medium text-slate-600 text-center">
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL JP GANJIL</span>
            <span className="text-sky-700 font-bold text-sm leading-tight">{kaldik.mingguGanjil * kaldik.jpPerMinggu} JP</span>
          </div>
          <div className="border-r border-slate-200 self-stretch my-1 hidden sm:block" />
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL JP GENAP</span>
            <span className="text-amber-700 font-bold text-sm leading-tight">{kaldik.mingguGenap * kaldik.jpPerMinggu} JP</span>
          </div>
          <div className="border-r border-slate-200 self-stretch my-1 hidden sm:block" />
          <div>
            <span className="text-slate-400 block text-[10px]">TOTAL JP 1 TAHUN</span>
            <span className="text-emerald-700 font-bold text-sm leading-tight">{(kaldik.mingguGanjil + kaldik.mingguGenap) * kaldik.jpPerMinggu} JP</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 my-4" />

      {/* Capaian Pembelajaran Text Box */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Teks Capaian Pembelajaran (CP) Elemen / Fase
          </label>
          <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
        </div>
        <textarea
          id="teks-cp-editor"
          value={teksCP}
          onChange={(e) => setTeksCP(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none font-sans leading-relaxed text-slate-700 resize-y transition"
          placeholder="Tempelkan atau ketik teks CP per elemen/fase di sini..."
        />
        <div className="flex items-start gap-1 p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-[11px] leading-relaxed">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Rekomendasi Pintar:</strong> Anda bisa menyalin teks CP dari Panduan Kemenag/KMA 450 Tahun 2024 atau menggunakan template mata pelajaran di bagian atas.
          </span>
        </div>
      </div>

      {/* Execute Button */}
      <button
        id="btn-generate-administrasi"
        onClick={onGenerate}
        disabled={isLoading || !teksCP.trim()}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition outline-none cursor-pointer ${
          isLoading || !teksCP.trim()
            ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 hover:-translate-y-0.5'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Sedang Mem-breakdown CP...' : 'Generate Dokumen Administrasi (KMA 450/2024)'}
      </button>
    </div>
  );
}
