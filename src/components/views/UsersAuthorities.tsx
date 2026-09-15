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
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { User as UserType, UserRole } from '../../types';

interface UsersAuthoritiesProps {
  setActiveView: (view: ActiveView) => void;
}

export const UsersAuthorities: React.FC<UsersAuthoritiesProps> = ({ setActiveView }) => {
  const {
    users,
    units,
    delegations,
    currentUser,
    setCurrentUserId,
    addDelegation,
    revokeDelegation,
    updateUserRole,
    updateUserStatus,
  } = useHortiFlow();

  const [activeTab, setActiveTab] = useState<'pengguna' | 'roles' | 'units' | 'delegasi' | 'sesi'>('pengguna');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showAddDelegationModal, setShowAddDelegationModal] = useState(false);

  // New delegation form state
  const [delegateeId, setDelegateeId] = useState(users[1]?.id || '');
  const [delegationScope, setDelegationScope] = useState<'ALL' | 'CAMPAIGN' | 'UNIT'>('CAMPAIGN');
  const [delegationRiskCeiling, setDelegationRiskCeiling] = useState<'LOW' | 'MEDIUM'>('MEDIUM');
  const [delegationReason, setDelegationReason] = useState('');

  // RBAC Audit & State Modals
  const [rbacFeedback, setRbacFeedback] = useState<{
    message: string;
    correlationId: string;
    timestamp: string;
  } | null>(null);
  const [copiedFeedbackCorr, setCopiedFeedbackCorr] = useState(false);

  // Edit Role Modal State
  const [editRoleUser, setEditRoleUser] = useState<UserType | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('EDITOR');
  const [roleReason, setRoleReason] = useState('');

  // Status Change Modal State
  const [statusUser, setStatusUser] = useState<UserType | null>(null);
  const [statusReason, setStatusReason] = useState('');

  // Revoke Delegation Modal State
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null);
  const [revokeReasonText, setRevokeReasonText] = useState('');

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

  const handleRoleChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleUser) return;
    const res = updateUserRole(editRoleUser.id, selectedNewRole, roleReason);
    if (res.success) {
      setRbacFeedback({
        message: `Hak akses peran ${editRoleUser.fullName} dialihkan menjadi [${selectedNewRole}]. Log audit ISO/IEC 27001 append-only telah dibuat.`,
        correlationId: res.correlationId || '',
        timestamp: new Date().toISOString(),
      });
      setEditRoleUser(null);
      setRoleReason('');
      if (selectedUser?.id === editRoleUser.id) {
        setSelectedUser((prev) => (prev ? { ...prev, role: selectedNewRole } : null));
      }
    } else {
      alert(res.error || 'Gagal memperbarui peran.');
    }
  };

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUser) return;
    const targetStatus = !statusUser.isActive;
    const res = updateUserStatus(statusUser.id, targetStatus, statusReason);
    if (res.success) {
      setRbacFeedback({
        message: `Status otorisasi akun ${statusUser.fullName} diubah menjadi [${targetStatus ? 'AKTIF' : 'DINONAKTIFKAN (SUSPENDED)'}]. Rekaman audit integritas ISO tercatat secara append-only.`,
        correlationId: res.correlationId || '',
        timestamp: new Date().toISOString(),
      });
      setStatusUser(null);
      setStatusReason('');
      if (selectedUser?.id === statusUser.id) {
        setSelectedUser((prev) => (prev ? { ...prev, isActive: targetStatus } : null));
      }
    } else {
      alert(res.error || 'Gagal mengubah status.');
    }
  };

  const handleRevokeDelegationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeTarget) return;
    const res = revokeDelegation(revokeTarget.id, revokeReasonText);
    if (res.success) {
      setRbacFeedback({
        message: `Wewenang delegasi persetujuan untuk ${revokeTarget.name} berhasil dicabut seketika. Rekaman audit append-only tersimpan.`,
        correlationId: res.correlationId || '',
        timestamp: new Date().toISOString(),
      });
      setRevokeTarget(null);
      setRevokeReasonText('');
    } else {
      alert(res.error || 'Gagal mencabut wewenang delegasi.');
    }
  };

  const copyFeedbackCorrelationId = (corrId: string) => {
    navigator.clipboard.writeText(corrId);
    setCopiedFeedbackCorr(true);
    setTimeout(() => setCopiedFeedbackCorr(false), 2000);
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

      {/* ISO/IEC 27001 RBAC Audit Notification Banner */}
      {rbacFeedback && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AUDIT TRAIL APPEND-ONLY
              </span>
              <span className="text-xs text-slate-200">{rbacFeedback.message}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>Correlation ID:</span>
              <span className="text-emerald-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 select-all">
                {rbacFeedback.correlationId}
              </span>
              <button
                type="button"
                onClick={() => copyFeedbackCorrelationId(rbacFeedback.correlationId)}
                className="px-2 py-0.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Salin Correlation ID"
              >
                {copiedFeedbackCorr ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span className="text-[10px]">{copiedFeedbackCorr ? 'Tersalin' : 'Salin UUID'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView('audit')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Audit Log</span>
            </button>
            <button
              onClick={() => setRbacFeedback(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Aktif' : 'Ditangguhkan'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">11 Sep 2026, 09:12</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditRoleUser(u);
                            setSelectedNewRole(u.role);
                            setRoleReason('');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                          title="Ubah peran RBAC & hak akses"
                        >
                          Ubah Role
                        </button>
                        <button
                          onClick={() => {
                            setStatusUser(u);
                            setStatusReason('');
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Profil
                        </button>
                      </div>
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
                  <th className="p-3.5 text-right">Aksi</th>
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
                      {d.isRevoked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Dicabut (Revoked)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {!d.isRevoked && (
                        <button
                          onClick={() => {
                            setRevokeTarget({ id: d.id, name: d.delegateeName });
                            setRevokeReasonText('');
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Cabut Wewenang
                        </button>
                      )}
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

      {/* 11. Edit User Role Modal (RBAC Mutation) */}
      {editRoleUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleRoleChangeSubmit}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Ubah Peran Pengguna (RBAC)</h3>
                <p className="text-[11px] text-slate-500">Mutasi wewenang operasional pengguna dalam sistem</p>
              </div>
              <button
                type="button"
                onClick={() => setEditRoleUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">{editRoleUser.fullName}</span>
              <span className="text-[11px] text-slate-500 font-mono block">{editRoleUser.email}</span>
              <span className="text-[11px] text-slate-600 block">Unit: {editRoleUser.unitName}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran Baru (Target Role) *</label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                >
                  <option value="PENGUSUL">PENGUSUL - Usulan & Draft Ide Konten</option>
                  <option value="PLANNER">PLANNER - Triase, Briefing & Alokasi PIC</option>
                  <option value="EDITOR">EDITOR - Penyusunan Narasi & Desain Aset</option>
                  <option value="REVIEWER">REVIEWER - Verifikasi Fakta & Pemeriksaan Mutu</option>
                  <option value="APPROVER">APPROVER - Pengesahan Bersegel Digital</option>
                  <option value="PUBLISHER">PUBLISHER - Penyiaran & Bukti Siar Resmi</option>
                  <option value="ARCHIVIST">ARCHIVIST - Pengarsipan Permanen</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR - Otoritas Penuh & RBAC</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor SK / Dasar Administratif Mutasi (Audit Trail Wajib) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  placeholder="Contoh: SK Dirjen Hortikultura No. 142/KPTS/2026 tentang Penugasan Redaktur Pelaksana..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  * Aksi ini akan dicatat ke Audit Log ISO/IEC 27001 dengan Correlation ID unik.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditRoleUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Simpan Mutasi RBAC
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 12. Toggle Account Status Modal */}
      {statusUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleStatusChangeSubmit}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {statusUser.isActive ? 'Tangguhkan (Suspend) Akun' : 'Aktifkan Kembali Akun'}
              </h3>
              <button
                type="button"
                onClick={() => setStatusUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 space-y-1">
              <span className="font-bold block">Peringatan Tindakan Kritis:</span>
              <p className="text-[11px] leading-relaxed">
                {statusUser.isActive
                  ? `Menangguhkan akun ${statusUser.fullName} akan mencabut hak login dan memblokir seluruh tindakan editorial yang sedang berjalan.`
                  : `Mengaktifkan kembali akun ${statusUser.fullName} akan memulihkan otorisasi akses sesuai peran aktif.`}
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Alasan Administratif Perubahan Status *
              </label>
              <textarea
                required
                rows={3}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Contoh: Cuti besar luar tanggungan negara / Rotasi staf antar kementerian..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg font-bold shadow-xs cursor-pointer ${
                  statusUser.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusUser.isActive ? 'Tangguhkan Akun Sekarang' : 'Aktifkan Akun'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 13. Revoke Delegation Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleRevokeDelegationSubmit}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Cabut Delegasi Wewenang</h3>
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Anda akan mencabut hak delegasi wewenang persetujuan yang diberikan kepada{' '}
              <span className="font-bold text-slate-900">{revokeTarget.name}</span>.
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Alasan Pencabutan Delegasi *
              </label>
              <textarea
                required
                rows={3}
                value={revokeReasonText}
                onChange={(e) => setRevokeReasonText(e.target.value)}
                placeholder="Contoh: Pejabat definitif telah kembali berdinas / Pergantian agenda mendesak..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Cabut Wewenang Sekarang
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
