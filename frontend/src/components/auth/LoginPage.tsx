import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  ArrowRight,
  User as UserIcon,
  X,
  Building2,
  ChevronDown,
  KeyRound,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { User, UserRole } from '../../types';
import { Logo } from '../layout/Logo';

export interface LoginPageProps {
  onLoginSuccess?: (user: User) => void;
  onCancel?: () => void;
  initialRole?: UserRole;
  className?: string;
  isModal?: boolean;
}

interface FormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  initialRole,
  className = '',
  isModal = false,
}) => {
  const { currentUser, setCurrentUser, users } = useHortiFlow();

  // Form Field State
  const [identifier, setIdentifier] = useState<string>('budi.sanjaya@hortiflow.local');
  const [password, setPassword] = useState<string>('HortiFlow@2026');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [capsLockActive, setCapsLockActive] = useState<boolean>(false);

  // Field Validation & Touched State
  const [touched, setTouched] = useState<{ identifier?: boolean; password?: boolean }>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Submission & UI Lifecycle State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);

  // Quick Role Demo Dropdown/Accordion
  const [showQuickRoles, setShowQuickRoles] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Pre-fill if initialRole is provided
  useEffect(() => {
    if (initialRole) {
      const found = users.find((u) => u.role === initialRole);
      if (found) {
        setIdentifier(found.email);
        setPassword('HortiFlow@2026');
      }
    }
  }, [initialRole, users]);

  // Field Validation Logic
  const validateField = (field: 'identifier' | 'password', value: string): string | undefined => {
    const trimmed = value.trim();

    if (field === 'identifier') {
      if (!trimmed) {
        return 'Email atau username wajib diisi';
      }
      if (trimmed.length < 3) {
        return 'Minimal 3 karakter';
      }
      if (trimmed.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          return 'Format email tidak valid';
        }
      }
    }

    if (field === 'password') {
      if (!value) {
        return 'Kata sandi wajib diisi';
      }
      if (value.length < 6) {
        return 'Kata sandi minimal 6 karakter';
      }
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const identifierErr = validateField('identifier', identifier);
    const passwordErr = validateField('password', password);

    const newErrors: FormErrors = {};
    if (identifierErr) newErrors.identifier = identifierErr;
    if (passwordErr) newErrors.password = passwordErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIdentifier(val);
    if (touched.identifier) {
      const err = validateField('identifier', val);
      setErrors((prev) => ({ ...prev, identifier: err, general: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      const err = validateField('password', val);
      setErrors((prev) => ({ ...prev, password: err, general: undefined }));
    }
  };

  const handleBlur = (field: 'identifier' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, field === 'identifier' ? identifier : password);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCaps = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockActive(!!isCaps);
  };

  // Perform Authentication
  const handlePerformLogin = (targetUser?: User) => {
    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      let matchedUser: User | undefined;

      if (targetUser) {
        matchedUser = targetUser;
      } else {
        const query = identifier.trim().toLowerCase();
        matchedUser = users.find(
          (u) =>
            u.email.toLowerCase() === query ||
            u.username.toLowerCase() === query ||
            u.fullName.toLowerCase().includes(query)
        );

        if (!matchedUser && query.length >= 3) {
          if (password === 'HortiFlow@2026' || password.length >= 6) {
            matchedUser = users[1]; // default fallback to Planner
          }
        }
      }

      if (!matchedUser) {
        setIsSubmitting(false);
        setErrors({
          general: 'Email/username atau kata sandi tidak sesuai.',
        });
        return;
      }

      if (!matchedUser.isActive) {
        setIsSubmitting(false);
        setErrors({
          general: 'Akun ini berstatus non-aktif. Hubungi Administrator.',
        });
        return;
      }

      setCurrentUser(matchedUser);
      setAuthenticatedUser(matchedUser);
      setLoginSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(matchedUser);
        }
      }, 600);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });

    if (!validateForm()) {
      return;
    }

    handlePerformLogin();
  };

  const handleSelectQuickUser = (user: User) => {
    setIdentifier(user.email);
    setPassword('HortiFlow@2026');
    setErrors({});
    setTouched({});
    setShowQuickRoles(false);
    handlePerformLogin(user);
  };

  return (
    <div
      id="hortiflow-login-page"
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 ${className}`}
    >
      {/* Central Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand & Heading Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Logo size="md" showSubtitle={false} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
              Masuk ke HortiFlow
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Sistem Tata Kelola Konten Ditjen Hortikultura
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errors.general && (
          <div
            id="login-error-banner"
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {loginSuccess && authenticatedUser && (
          <div
            id="login-success-banner"
            className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-150"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Berhasil masuk!</span> Mengalihkan sebagai{' '}
              <span className="font-bold">{authenticatedUser.fullName}</span>...
            </div>
            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
          </div>
        )}

        {/* Main Login Form */}
        <form id="form-login" onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-login-identifier"
              className="text-xs font-semibold text-slate-700 flex items-center justify-between"
            >
              <span>Email / Username</span>
              {errors.identifier && (
                <span className="text-red-600 font-normal text-[11px]">
                  {errors.identifier}
                </span>
              )}
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>

              <input
                id="input-login-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={handleIdentifierChange}
                onBlur={() => handleBlur('identifier')}
                disabled={isSubmitting || loginSuccess}
                placeholder="nama@hortiflow.local"
                className={`w-full pl-9 pr-8 py-2 bg-white rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  errors.identifier
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                }`}
                aria-invalid={!!errors.identifier}
              />

              {identifier && !isSubmitting && !loginSuccess && (
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('');
                    setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  title="Hapus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-login-password"
                className="text-xs font-semibold text-slate-700"
              >
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Lupa sandi?
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>

              <input
                id="input-login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password')}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyDown}
                disabled={isSubmitting || loginSuccess}
                placeholder="••••••••"
                className={`w-full pl-9 pr-9 py-2 bg-white rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                }`}
                aria-invalid={!!errors.password}
              />

              <button
                id="btn-toggle-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Caps Lock Alert */}
            {capsLockActive && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Caps Lock aktif</span>
              </div>
            )}

            {errors.password && (
              <p className="text-[11px] text-red-600 mt-0.5">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Security Status */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                id="checkbox-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting || loginSuccess}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
              />
              <span>Ingat sesi saya</span>
            </label>

            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS Terenkripsi</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            id="btn-submit-login"
            type="submit"
            disabled={isSubmitting || loginSuccess}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : loginSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Berhasil Masuk</span>
              </>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Switcher Accordion */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowQuickRoles(!showQuickRoles)}
            className="w-full flex items-center justify-between py-1.5 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilih Akun Cepat (Mode Demo)</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                showQuickRoles ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showQuickRoles && (
            <div className="mt-2 grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50/80 rounded-xl border border-slate-200/80 animate-in fade-in duration-100">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectQuickUser(u)}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-colors text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-slate-900 truncate">
                      {u.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {u.position}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-1">
          Kementerian Pertanian Republik Indonesia © 2026
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div
          id="modal-login-help"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Bantuan Masuk Sistem
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-800">Kata Sandi Default Demo:</span>
                <code className="block font-mono font-bold bg-white p-1 rounded border border-slate-200 text-emerald-800 text-center">
                  HortiFlow@2026
                </code>
              </div>

              <p className="text-slate-500 text-[11px]">
                Untuk pemulihan kata sandi pegawai dinas, silakan hubungi Administrator Biro Komunikasi Ditjen Hortikultura di Gedung D Kementan.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
