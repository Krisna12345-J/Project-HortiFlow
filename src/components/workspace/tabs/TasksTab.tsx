import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, User, Check, X, AlertTriangle } from 'lucide-react';
import { ContentPackage, ProductionTask } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface TasksTabProps {
  pkg: ContentPackage;
}

export const TasksTab: React.FC<TasksTabProps> = ({ pkg }) => {
  const { getTasksForPackage, addProductionTask, updateTaskStatus, users } = useHortiFlow();
  const tasks = getTasksForPackage(pkg.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || '');
  const [priority, setPriority] = useState<ProductionTask['priority']>('MEDIUM');
  const [dueDate, setDueDate] = useState('2026-09-25T17:00');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = users.find((u) => u.id === assigneeId) || users[0] || { id: 'USR-01', fullName: 'Tim Produksi' };

    addProductionTask(pkg.id, {
      title,
      description,
      assigneeId: assignee.id,
      assigneeName: assignee.fullName,
      priority,
      dueDate: new Date(dueDate).toISOString(),
    });

    setShowAddForm(false);
    setTitle('');
    setDescription('');
  };

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-tasks">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Tugas Kolaborasi & Rincian Kerja ({completedCount}/{tasks.length} Selesai)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Pembagian tanggung jawab penulisan naskah, desain visual, riset fakta, dan adaptasi format kanal.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Add Task Modal/Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="bg-white rounded-xl border border-emerald-300 p-6 space-y-4 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">Buat Tugas Produksi Baru</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Judul Tugas *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan layout infografis ukuran 1:1 untuk feed Instagram..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Deskripsi Petunjuk Teknis</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail yang perlu diperhatikan..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pelaksana Tugas (Assignee)</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="LOW">Rendah (Low)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HIGH">Tinggi (High)</option>
                <option value="URGENT">Mendesak (Urgent)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Batas Tenggat</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Belum ada tugas untuk paket ini. Klik "Tambah Tugas Baru" di atas.
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === 'DONE';
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-emerald-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => updateTaskStatus(task.id, isDone ? 'TODO' : 'DONE')}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <h4
                      className={`text-xs font-bold leading-snug ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[11px] text-slate-500">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>PIC: <b className="text-slate-700">{task.assigneeName}</b></span>
                      <span>•</span>
                      <span>
                        Tenggat:{' '}
                        {new Date(task.dueDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800'
                        : task.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                    className="p-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
