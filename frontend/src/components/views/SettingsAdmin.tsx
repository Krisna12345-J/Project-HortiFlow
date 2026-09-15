import React, { useState } from 'react';
import {
  Settings,
  Users,
  Building,
  Radio,
  Tags,
  ShieldCheck,
  Database,
  Plus,
  CheckCircle,
  RefreshCw,
  Download,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { UserRole } from '../../types';

interface SettingsAdminProps {
  setActiveView: (view: ActiveView) => void;
}

export const SettingsAdmin: React.FC<SettingsAdminProps> = ({ setActiveView }) => {
  const {
    users,
    units,
    campaigns,
    channels,
    currentUser,
    setCurrentUserId,
    resetToSeedData,
  } = useHortiFlow();

  const [activeSection, setActiveSection] = useState<'users' | 'units' | 'channels' | 'system'>('users');

  const handleExportFullDatabase = () => {
    const fullState = {
      exportedAt: new Date().toISOString(),
      system: 'HORTIFLOW Standalone Content Management System',
      data: {
        users,
        units,
        campaigns,
        channels,
      },
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hortiflow_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang (reset) data aplikasi ke konfigurasi data contoh bawaan?')) {
      resetToSeedData();
      alert('Data sistem HORTIFLOW berhasil direset ke kondisi awal.');
    }
  };

  return (
    <div className="space-y-6 text-xs" id="settings-admin-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Pengaturan & Konfigurasi Sistem Mandiri
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Konfigurasi pengguna lokal, peran hak akses (RBAC), unit kerja, kanal siar resmi, dan manajemen pencadangan data tanpa dependensi eksternal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullDatabase}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cadangkan Data (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset ke Data Awal</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs for settings */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveSection('users')}
          className={`pb-3 flex items-center gap-2 ${
            activeSection === 'users'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengguna & Hak Akses (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveSection('units')}
          className={`pb-3 flex items-center gap-2 ${
            activeSection === 'units'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Direktorat & Unit Kerja</span>
        </button>

        <button
          onClick={() => setActiveSection('channels')}
          className={`pb-3 flex items-center gap-2 ${
            activeSection === 'channels'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'hover:text-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Kanal Publikasi Resmi</span>
        </button>

        <button
          onClick={() => setActiveSection('system')}
          className={`pb-3 flex items-center gap-2 ${
            activeSection === 'system'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Integritas & Keamanan</span>
        </button>
      </div>

      {/* Section Content */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Daftar Akun Pengguna Lokal & Penugasan Peran
              </h3>
              <p className="text-slate-500 text-xs">
                Sistem mengelola autentikasi lokal independen dengan pemisahan tugas ketat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Nama Lengkap & NIP</th>
                  <th className="p-3">Username & Email</th>
                  <th className="p-3">Peran (Role)</th>
                  <th className="p-3">Unit Kerja</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                              AKUN ANDA
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">NIP: {u.nip || '-'}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-slate-700">{u.username}</div>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            u.role === 'ADMINISTRATOR'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'APPROVER'
                              ? 'bg-amber-100 text-amber-800'
                              : u.role === 'REVIEWER'
                              ? 'bg-blue-100 text-blue-800'
                              : u.role === 'PLANNER'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{u.unitName}</td>
                      <td className="p-3">
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => setCurrentUserId(u.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                          >
                            Beralih Pengguna
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'units' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Struktur Organisasi & Direktorat Lingkup Hortikultura
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {unit.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">ESELON {unit.echelonLevel}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{unit.name}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'channels' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Kanal Distribusi Resmi & Parameter Teknis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{ch.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    AKTIF
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{ch.handleOrUrl}</div>
                <div className="text-[10px] text-slate-400">
                  Batasan Karakter: <b>{ch.characterLimit || 'Tak Terbatas'}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'system' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Aturan Integritas & Pemisahan Wewenang (Separation of Duties)
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">
                  Separation of Duties (SoD) Aktif
                </h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Pembuat materi dilarang menyetujui materi berisiko sedang, tinggi, atau kritis. Administrator sistem dilarang menyetujui konten editorial.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">
                  Quality Gate Strict Enforcement
                </h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Setiap temuan bertingkat BLOCKING secara otomatis mengunci transisi menuju Approval Pending dan Publication.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">
                  Append-Only Audit Logging
                </h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Setiap tindakan dicatat secara tidak dapat diubah (immutable) lengkap dengan stempel waktu dan ID korelasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
