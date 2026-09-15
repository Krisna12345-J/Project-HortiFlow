import { useState, useMemo, useCallback, type FormEvent } from 'react';
import { useHortiFlow } from '../context/HortiFlowContext';
import { ContentType, RiskLevel, ChannelType, ContentRequest, ContentPackage } from '../types';

export interface IntakePreset {
  name: string;
  unit: string;
  title: string;
  contentType: ContentType;
  goal: string;
  audience: string;
  topics: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  riskLevel: RiskLevel;
  sources: string;
  channels: ChannelType[];
  resources: string[];
}

export const INTAKE_PRESETS: IntakePreset[] = [
  {
    name: 'Bawang Merah TSS',
    unit: 'Dit. Sayuran & Tanaman Obat',
    title: 'Akselerasi Diseminasi Benih Bawang Merah TSS untuk Stabilisasi Pasokan',
    contentType: 'INFOGRAPHIC',
    goal: 'Meningkatkan adopsi teknologi benih True Shallot Seed (TSS) di kalangan petani sentra Brebes dan Nganjuk guna menekan biaya produksi hingga 40%.',
    audience: 'Kelompok Tani Bawang Merah, Dinas Pertanian Daerah, Penyuluh Lapangan',
    topics: 'Bawang Merah, Benih TSS, Efisiensi Biaya, Stabilisasi Pangan',
    urgency: 'HIGH',
    riskLevel: 'MEDIUM',
    sources: 'Data Neraca Komoditas Ditjen Hortikultura Agustus 2026, SK Mentan No. 214/2025',
    channels: ['INSTAGRAM', 'WEBSITE', 'FACEBOOK'],
    resources: ['Naskah & Riset Data', 'Desain Infografis Visual', 'Verifikasi Ahli Peneliti'],
  },
  {
    name: 'Krisis Hama Lalat Buah',
    unit: 'Dit. Perlindungan Hortikultura',
    title: 'Kesiapsiagaan Darurat Pengendalian Hama Lalat Buah pada Sentra Mangga & Cabai',
    contentType: 'PRESS_RELEASE',
    goal: 'Memberikan panduan cepat penanganan serangan OPT lalat buah Bactrocera dorsalis di musim peralihan untuk mencegah gagal panen dan penolakan ekspor.',
    audience: 'Petani Mangga & Cabai, Eksportir Buah, Petugas POPT',
    topics: 'Perlindungan Hortikultura, OPT Lalat Buah, Sanitasi Lahan, Standar Karantina',
    urgency: 'URGENT',
    riskLevel: 'HIGH',
    sources: 'Laporan Monitoring Balai Proteksi Tanaman Wilayah II, Standar ISPM No. 26',
    channels: ['INTERNAL_PORTAL', 'WEBSITE', 'INSTAGRAM'],
    resources: ['Naskah Siaran Pers', 'Liputan Foto Lapangan', 'Verifikasi Ahli Peneliti'],
  },
  {
    name: 'Sertifikasi Benih Cabai',
    unit: 'Balai Standarisasi Benih Hortikultura',
    title: 'Sosialisasi Standar Sertifikasi & Pengawasan Mutu Benih Cabai Rawit Unggul',
    contentType: 'SHORT_VIDEO',
    goal: 'Edukasi visual kepada petani dan produsen benih lokal mengenai tata cara permohonan sertifikasi benih cabai bersertifikat bebas virus kuning.',
    audience: 'Penangkar Benih Lokal, Petani Cabai, Asosiasi Agribisnis Cabai',
    topics: 'Sertifikasi Benih, Cabai Rawit Unggul, Bebas Virus, Mutu Benih',
    urgency: 'MEDIUM',
    riskLevel: 'LOW',
    sources: 'Permentan No. 12/2024 tentang Sertifikasi Benih Hortikultura',
    channels: ['TIKTOK', 'INSTAGRAM', 'WEBSITE'],
    resources: ['Naskah & Riset Data', 'Produksi Video Pendek / Reels', 'Desain Infografis Visual'],
  },
  {
    name: 'Ekspor Manggis & Durian',
    unit: 'Dit. Pengolahan & Pemasaran Hasil Hortikultura',
    title: 'Panduan Protokol Fitosanitari Akses Pasar Ekspor Manggis dan Durian ke Tiongkok',
    contentType: 'ARTICLE',
    goal: 'Mendorong perluasan ekspor hortikultura segar dengan memberikan kepastian informasi terkait registrasi kebun (GAP) dan packing house tersertifikasi.',
    audience: 'Eksportir Hortikultura, GAPOKTAN Binaan, Atase Perdagangan',
    topics: 'Ekspor Buah Tropis, Registrasi Kebun, Protokol Fitosanitari, Pasar Tiongkok',
    urgency: 'HIGH',
    riskLevel: 'HIGH',
    sources: 'Protokol Ekspor Bilateral GACC - Kementan RI 2025/2026',
    channels: ['WEBSITE', 'INTERNAL_PORTAL', 'INSTAGRAM'],
    resources: ['Naskah & Riset Data', 'Desain Infografis Visual', 'Verifikasi Ahli Peneliti'],
  },
];

export const AVAILABLE_CHANNELS: { id: ChannelType; name: string }[] = [
  { id: 'WEBSITE', name: 'Portal Web Hortikultura' },
  { id: 'INSTAGRAM', name: 'Instagram & Reels (@ditjenhorti)' },
  { id: 'TIKTOK', name: 'TikTok Edukasi (@hortikultura.id)' },
  { id: 'INTERNAL_PORTAL', name: 'Portal Berita & Siaran Pers Internal' },
  { id: 'FACEBOOK', name: 'Komunitas Facebook & Petani' },
];

export const AVAILABLE_RESOURCES = [
  'Naskah & Riset Data',
  'Desain Infografis Visual',
  'Produksi Video Pendek / Reels',
  'Liputan Foto Lapangan',
  'Verifikasi Ahli Peneliti',
];

export interface FormErrors {
  title?: string;
  communicationGoal?: string;
  general?: string;
}

export interface SubmittedTicketResult {
  ticketNumber: string;
  id: string;
  duplicateScore?: number;
  duplicatePkgNum?: string;
}

export interface UseIntakeFormOptions {
  onSuccess?: (result: { request: ContentRequest; duplicates: { package: ContentPackage; score: number }[] }) => void;
  defaultDeadline?: string;
}

export function useIntakeForm(options: UseIntakeFormOptions = {}) {
  const {
    currentUser,
    units,
    campaigns,
    submitContentRequest,
    findDuplicates,
    setSelectedPackageId,
  } = useHortiFlow();

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('ARTICLE');
  const [communicationGoal, setCommunicationGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [requestedDeadline, setRequestedDeadline] = useState(
    options.defaultDeadline || '2026-09-30T17:00'
  );
  const [initialSources, setInitialSources] = useState('');
  const [unitId, setUnitId] = useState(currentUser.unitId);
  const [campaignId, setCampaignId] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([
    'WEBSITE',
    'INSTAGRAM',
  ]);
  const [selectedResources, setSelectedResources] = useState<string[]>([
    'Naskah & Riset Data',
    'Desain Infografis Visual',
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedTicket, setSubmittedTicket] = useState<SubmittedTicketResult | null>(null);

  // Parse topics list from comma-separated string
  const currentTopics = useMemo(
    () => topicsInput.split(',').map((t) => t.trim()).filter(Boolean),
    [topicsInput]
  );

  // Real-time duplicate detection
  const detectedDuplicates = useMemo(() => {
    return title.trim().length > 6 ? findDuplicates(title, currentTopics) : [];
  }, [title, currentTopics, findDuplicates]);

  // Real-time Readiness & Quality Index Calculation (0 - 100%)
  const readinessIndex = useMemo(() => {
    let score = 0;
    if (title.trim().length >= 15) score += 20;
    else if (title.trim().length > 0) score += 10;

    if (communicationGoal.trim().length >= 25) score += 25;
    else if (communicationGoal.trim().length > 0) score += 10;

    if (targetAudience.trim().length > 0) score += 15;
    if (currentTopics.length >= 1) score += 10;
    if (initialSources.trim().length >= 10) score += 15;
    if (selectedChannels.length > 0) score += 10;
    if (selectedResources.length > 0) score += 5;

    return Math.min(score, 100);
  }, [
    title,
    communicationGoal,
    targetAudience,
    currentTopics,
    initialSources,
    selectedChannels,
    selectedResources,
  ]);

  const readinessStatus = useMemo(() => {
    if (readinessIndex >= 80) return { label: 'Sangat Lengkap', color: 'emerald' as const };
    if (readinessIndex >= 50) return { label: 'Cukup Lengkap', color: 'amber' as const };
    return { label: 'Perlu Detail', color: 'slate' as const };
  }, [readinessIndex]);

  // Channel toggling
  const toggleChannel = useCallback((chId: ChannelType) => {
    setSelectedChannels((prev) =>
      prev.includes(chId) ? prev.filter((c) => c !== chId) : [...prev, chId]
    );
  }, []);

  // Resource toggling
  const toggleResource = useCallback((resName: string) => {
    setSelectedResources((prev) =>
      prev.includes(resName) ? prev.filter((r) => r !== resName) : [...prev, resName]
    );
  }, []);

  // Quick preset autofill handler
  const handleApplyPreset = useCallback(
    (preset: IntakePreset) => {
      setTitle(preset.title);
      setContentType(preset.contentType);
      setCommunicationGoal(preset.goal);
      setTargetAudience(preset.audience);
      setTopicsInput(preset.topics);
      setUrgency(preset.urgency);
      setRiskLevel(preset.riskLevel);
      setInitialSources(preset.sources);
      setSelectedChannels(preset.channels);
      setSelectedResources(preset.resources);

      const matchingUnit = units.find((u) => u.name.includes(preset.unit.split(' ')[1] || ''));
      if (matchingUnit) {
        setUnitId(matchingUnit.id);
      }
      // Clear previous field errors on preset selection
      setErrors({});
    },
    [units]
  );

  // Form validation function
  const validateForm = useCallback((): boolean => {
    const nextErrors: FormErrors = {};
    if (!title.trim()) {
      nextErrors.title = 'Judul atau topik usulan wajib diisi.';
    } else if (title.trim().length < 5) {
      nextErrors.title = 'Judul minimal 5 karakter untuk identifikasi yang jelas.';
    }

    if (!communicationGoal.trim()) {
      nextErrors.communicationGoal = 'Tujuan komunikasi wajib dijelaskan.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [title, communicationGoal]);

  // Reset form to default states
  const handleResetForm = useCallback(() => {
    setTitle('');
    setCommunicationGoal('');
    setTargetAudience('');
    setTopicsInput('');
    setInitialSources('');
    setContentType('ARTICLE');
    setUrgency('MEDIUM');
    setRiskLevel('LOW');
    setSelectedChannels(['WEBSITE', 'INSTAGRAM']);
    setSelectedResources(['Naskah & Riset Data', 'Desain Infografis Visual']);
    setCampaignId('');
    setUnitId(currentUser.unitId);
    setErrors({});
    setSubmittedTicket(null);
  }, [currentUser.unitId]);

  // Submit handler
  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault();

      if (!validateForm()) {
        return { success: false, error: 'Validasi formulir gagal. Periksa kolom yang wajib diisi.' };
      }

      const selectedUnit =
        units.find((u) => u.id === unitId) || units[0] || { id: 'UN-01', name: 'Ditjen Hortikultura' };
      const selectedCampaign = campaigns.find((c) => c.id === campaignId);

      const { request, duplicates } = submitContentRequest({
        title,
        contentType,
        communicationGoal,
        targetAudience,
        topics: currentTopics.length > 0 ? currentTopics : ['Hortikultura'],
        urgency,
        riskLevel,
        requestedDeadline: new Date(requestedDeadline).toISOString(),
        initialSources,
        unitId: selectedUnit.id,
        unitName: selectedUnit.name,
        requesterId: currentUser?.id || 'USR-01',
        requesterName: currentUser?.fullName || 'Pengguna',
        campaignId: selectedCampaign?.id,
        campaignName: selectedCampaign?.name,
        targetChannels: selectedChannels,
        resourceNeeds: selectedResources,
        readinessScore: readinessIndex,
      });

      const ticketResult: SubmittedTicketResult = {
        ticketNumber: request.ticketNumber,
        id: request.id,
        duplicateScore:
          duplicates && duplicates.length > 0 && duplicates[0] ? duplicates[0].score : undefined,
        duplicatePkgNum:
          duplicates && duplicates.length > 0 && duplicates[0]?.package
            ? duplicates[0].package.packageNumber
            : undefined,
      };

      setSubmittedTicket(ticketResult);
      options.onSuccess?.({ request, duplicates });

      return { success: true, request, duplicates, ticketResult };
    },
    [
      validateForm,
      units,
      unitId,
      campaigns,
      campaignId,
      submitContentRequest,
      title,
      contentType,
      communicationGoal,
      targetAudience,
      currentTopics,
      urgency,
      riskLevel,
      requestedDeadline,
      initialSources,
      currentUser,
      selectedChannels,
      selectedResources,
      readinessIndex,
      options,
    ]
  );

  return {
    // Form fields
    title,
    setTitle,
    contentType,
    setContentType,
    communicationGoal,
    setCommunicationGoal,
    targetAudience,
    setTargetAudience,
    topicsInput,
    setTopicsInput,
    urgency,
    setUrgency,
    riskLevel,
    setRiskLevel,
    requestedDeadline,
    setRequestedDeadline,
    initialSources,
    setInitialSources,
    unitId,
    setUnitId,
    campaignId,
    setCampaignId,
    selectedChannels,
    setSelectedChannels,
    selectedResources,
    setSelectedResources,

    // Derived values & Analysis
    currentTopics,
    detectedDuplicates,
    readinessIndex,
    readinessStatus,
    errors,
    setErrors,
    submittedTicket,
    setSubmittedTicket,

    // Actions & Handlers
    toggleChannel,
    toggleResource,
    handleApplyPreset,
    validateForm,
    handleResetForm,
    handleSubmit,
    setSelectedPackageId,

    // Context entities
    units,
    campaigns,
    currentUser,
    presets: INTAKE_PRESETS,
    availableChannels: AVAILABLE_CHANNELS,
    availableResources: AVAILABLE_RESOURCES,
  };
}
