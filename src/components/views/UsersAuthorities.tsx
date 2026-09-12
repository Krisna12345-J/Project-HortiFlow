import React, { useState } from 'react';
import {
  Users,
  Shield,
  Building,
  KeyRound,
  History,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Lock,
  ChevronRight,
  ShieldAlert,
  User,
  Clock,
  X,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { User as UserType, UserRole } from '../../types';

interface UsersAuthoritiesProps {
  setActiveView: (view: ActiveView) => void;
}

export const UsersAuthorities: React.FC<UsersAuthoritiesProps> = ({ setActiveView }) => {
  const { users, units, delegations, currentUser, setCurrentUserId, addDelegation } = useHortiFlow();

  const [activeTab, setActiveTab] = useState<'pengguna' | 'roles' | 'units' | 'delegasi' | 'sesi'>('pengguna');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showAddDelegationModal, setShowAddDelegationModal] = useState(false);

  // New delegation form state
  const [delegateeId, setDelegateeId] = useState(users[1]?.id || '');
  const [delegationScope, setDelegationScope] = useState<'ALL' | 'CAMPAIGN' | 'UNIT'>('CAMPAIGN');
  const [delegationRiskCeiling, setDelegationRiskCeiling] = useState<'LOW' | 'MEDIUM'>('MEDIUM');
  const [delegationReason, setDelegationReason] = useState('');

  // Filtering users
  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.unitName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Summary counts matching Section 22
  const totalUsers = users.length;
  const uniqueRolesCount = 8;
  const unitCount = units.length;
  const activeDelegationsCount = delegations.filter((d) => !d.isRevoked).length;
  const suspendedCount = users.filter((u) => !u.isActive).length;

  // Granular Permissions Matrix from Section 24
  const permissionsMatrix = [
    { perm: 'content.view', desc: 'Melihat paket konten & arsip', roles: ['PENGUSUL', 'PLANNER', 'EDITOR', 'REVIEWER', 'APPROVER', 'PUBLISHER', 'ARCHIVIST', 'ADMINISTRATOR'] },
    { perm: 'content.create', desc: 'Membuat paket konten & mengajukan usulan', roles: ['PENGUSUL', 'PLANNER', 'EDITOR'] },
    { perm: 'content.edit', desc: 'Menulis naskah narasi & mengunggah aset', roles: ['PLANNER', 'EDITOR'] },
    { perm: 'content.assign', desc: 'Menugaskan tugas & PIC produksi', roles: ['PLANNER'] },
    { perm: 'content.review', desc: 'Melakukan pemeriksaan fakta & temuan review', roles: ['REVIEWER'] },
    { perm: 'content.approve', desc: 'Mengesahkan manifest persetujuan final', roles: ['APPROVER'] },
    { perm: 'content.publish', desc: 'Menerbitkan ke kanal resmi & bukti siar', roles: ['PUBLISHER'] },
    { perm: 'content.archive', desc: 'Mengunci paket ke repositori permanen', roles: ['ARCHIVIST', 'ADMINISTRATOR'] },
    { perm: 'campaign.manage', desc: 'Merencanakan target & kalender kampanye', roles: ['PLANNER', 'ADMINISTRATOR'] },
    { perm: 'user.manage', desc: 'Mengelola pengguna, otoritas & audit trail', roles: ['ADMINISTRATOR'] },
  ];

  // Mock sessions matching Section 22
  const activeSessions = [
    { id: 'sess-1', user: 'Budi Sanjaya, M.Si.', ip: '10.24.12.8', device: 'Chrome on macOS Sonoma', lastActive: 'Aktif saat ini', current: true },
    { id: 'sess-2', user: 'Rina Amelia', ip: '10.24.12.15', device: 'Firefox on Windows 11', lastActive: '12 menit lalu', current: false },
    { id: 'sess-3', user: 'Ahmad Fauzi, S.P.', ip: '10.24.13.44', device: 'Safari on iPad Pro', lastActive: '45 menit lalu', current: false },
    { id: 'sess-4', user: 'Sari Dewi, M.Sc.', ip: '10.24.11.2', device: 'Edge on macOS', lastActive: '2 jam lalu', current: false },
  ];

  const handleCreateDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    const delegatee = users.find((u) => u.id === delegateeId);
    if (!delegatee) return;

    addDelegation({
      delegatorId: currentUser.id,
      delegatorName: currentUser.fullName,
      delegateeId: delegatee.id,
      delegateeName: delegatee.fullName,
      scope: delegationScope,
      riskCeiling: delegationRiskCeiling,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-09-30',
      reason: delegationReason || 'Pemberian wewenang persetujuan terbatas saat dinas luar',
    });

    setShowAddDelegationModal(false);
    setDelegationReason('');
    alert('Delegasi wewenang berhasil diaktifkan dengan batas risiko terkontrol!');
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12" id="users-authorities-view">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manajemen Akses & Pemisahan Wewenang (SoD)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Pengguna & Otoritas
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Kelola pengguna organisasi, peran hirarkis, hak akses granular, delegasi wewenang sementara, dan sesi aktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Persona Switcher for demonstration */}
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sesi Login:</span>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards matching Section 22 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Total Pengguna</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{totalUsers}</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Terdaftar resmi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Peran Hirarkis</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{uniqueRolesCount}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Sesuai RBAC</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Unit Kerja</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{unitCount}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Direktorat Teknis</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Delegasi Aktif</span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">{activeDelegationsCount}</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Batas risiko terkontrol</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Akun Ditangguhkan</span>
          <div className="text-2xl font-black text-slate-400 font-mono tabular-nums">{suspendedCount}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Nol pelanggaran</span>
        </div>
      </div>

      {/* 3. Navigation Tabs matching Section 22 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          {[
            { id: 'pengguna', label: `Daftar Pengguna (${users.length})` },
            { id: 'roles', label: 'Role & Permission' },
            { id: 'units', label: `Unit Kerja (${units.length})` },
            { id: 'delegasi', label: `Delegasi Wewenang (${activeDelegationsCount})` },
            { id: 'sesi', label: 'Sesi Login Aktif' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pengguna' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengguna, role, unit..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500 focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* 4. Tab Content: PENGGUNA TABLE */}
      {activeTab === 'pengguna' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-3.5">Nama & Identitas</th>
                  <th className="p-3.5">Peran (Role)</th>
                  <th className="p-3.5">Unit Kerja</th>
                  <th className="p-3.5">Jabatan</th>
                  <th className="p-3.5">Status Akun</th>
                  <th className="p-3.5">Login Terakhir</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.fullName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{u.unitName}</td>
                    <td className="p-3.5 text-slate-600">{u.position}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">11 Sep 2026, 09:12</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Detail Profil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab Content: ROLE & PERMISSION MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1 text-slate-700">
            <span className="font-bold text-slate-900 block">
              Prinsip Pemisahan Wewenang (Separation of Duties - SoD):
            </span>
            <p className="leading-relaxed">
              Creator/Editor berwenang menyusun narasi dan aset, namun dilarang keras mengesahkan persetujuan final (final approve) atas paket buatannya sendiri. Reviewer berfokus pada verifikasi fakta dan temuan editorial, Approver mengesahkan manifest bernomor segel, dan Publisher bertugas menyiarkan ke kanal resmi.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-3.5">Hak Akses Granular (Permission Key)</th>
                    <th className="p-3.5">Deskripsi Tindakan</th>
                    <th className="p-3.5">Peran yang Diberikan (Authorized Roles)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissionsMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-emerald-800">{item.perm}</td>
                      <td className="p-3.5 text-slate-600">{item.desc}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {item.roles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content: UNIT KERJA */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => {
            const memberCount = users.filter((u) => u.unitId === unit.id).length;
            return (
              <div key={unit.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{unit.code}</span>
                  <Building className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">{unit.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{unit.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Anggota Terdaftar:</span>
                  <span className="font-mono font-bold text-slate-900">{memberCount} Pengguna</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Tab Content: DELEGASI WEWENANG */}
      {activeTab === 'delegasi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Delegasi wewenang memungkinkan pelimpahan hak persetujuan dengan batas risiko dan masa berlaku ketat.
            </span>
            <button
              onClick={() => setShowAddDelegationModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Delegasi Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-3.5">Pemberi Kuasa (Giver)</th>
                  <th className="p-3.5">Penerima Kuasa (Receiver)</th>
                  <th className="p-3.5">Lingkup Kuasa (Scope)</th>
                  <th className="p-3.5">Batas Risiko (Risk Ceiling)</th>
                  <th className="p-3.5">Masa Berlaku</th>
                  <th className="p-3.5">Alasan Pelimpahan</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delegations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{d.delegatorName}</td>
                    <td className="p-3.5 font-bold text-emerald-800">{d.delegateeName}</td>
                    <td className="p-3.5 font-mono">{d.scope}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Max: {d.riskCeiling}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 text-[11px]">
                      {d.startDate} s/d {d.endDate}
                    </td>
                    <td className="p-3.5 text-slate-600">{d.reason}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Tab Content: SESI LOGIN AKTIF */}
      {activeTab === 'sesi' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center">
            <span>Sesi Otentikasi HORTIFLOW Aktif (HttpOnly + Secure Session Cookie)</span>
            <span className="text-slate-500 font-normal">Proteksi SameSite & Anti-CSRF Aktif</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeSessions.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.user}</span>
                    {s.current && (
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sesi Ini
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>IP: {s.ip}</span>
                    <span>•</span>
                    <span>{s.device}</span>
                    <span>•</span>
                    <span>{s.lastActive}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Sesi ${s.id} berhasil dicabut (revoked)!`)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cabut Sesi (Revoke)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. User Profile Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedUser.fullName}</h3>
                  <span className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Peran Sistem:</span>
                <span className="font-bold text-slate-900">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Unit Kerja:</span>
                <span className="font-semibold text-slate-800">{selectedUser.unitName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Jabatan Fungsional:</span>
                <span className="font-semibold text-slate-800">{selectedUser.position}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status Otorisasi:</span>
                <span className="font-bold text-emerald-700">Aktif & Terverifikasi</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-bold text-slate-800 block mb-1">Kewenangan Spesifik:</span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Pengguna memiliki kewenangan operasional penuh sesuai matriks RBAC untuk peran {selectedUser.role} dalam lingkungan {selectedUser.unitName}.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Add Delegation Modal */}
      {showAddDelegationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateDelegation}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Buat Delegasi Wewenang Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddDelegationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Penerima Wewenang (Delegatee) *</label>
                <select
                  value={delegateeId}
                  onChange={(e) => setDelegateeId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role}) - {u.unitName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lingkup Kuasa (Scope) *</label>
                <select
                  value={delegationScope}
                  onChange={(e) => setDelegationScope(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="CAMPAIGN">Per Kampanye Tertentu</option>
                  <option value="UNIT">Seluruh Unit Kerja</option>
                  <option value="ALL">Semua Paket Konten Terjadwal</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Batas Maksimum Risiko (Risk Ceiling) *</label>
                <select
                  value={delegationRiskCeiling}
                  onChange={(e) => setDelegationRiskCeiling(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="LOW">LOW (Hanya Risiko Rendah)</option>
                  <option value="MEDIUM">MEDIUM (Risiko Rendah & Sedang)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Pelimpahan *</label>
                <textarea
                  required
                  rows={2}
                  value={delegationReason}
                  onChange={(e) => setDelegationReason(e.target.value)}
                  placeholder="Contoh: Menghadiri rapat koordinasi pangan nasional di luar kota..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddDelegationModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-xs hover:bg-emerald-700"
              >
                Aktifkan Delegasi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
