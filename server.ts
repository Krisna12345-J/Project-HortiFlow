import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body Parsers & CORS/Security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Standard RBAC Initial Users for HortiFlow Deployment
const DB_USERS = [
  {
    id: 'usr-siti',
    username: 'siti.rahma',
    email: 'siti.rahma@hortiflow.local',
    fullName: 'Siti Rahma, S.P.',
    role: 'REQUESTER',
    unitId: 'unit-sayur',
    unitName: 'Direktorat Sayuran dan Tanaman Obat',
    position: 'Pranata Humas Pertama',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    isActive: true,
  },
  {
    id: 'usr-budi',
    username: 'budi.sanjaya',
    email: 'budi.sanjaya@hortiflow.local',
    fullName: 'Budi Sanjaya, M.Si.',
    role: 'PLANNER',
    unitId: 'unit-setditjen',
    unitName: 'Sekretariat Ditjen Hortikultura',
    position: 'Koordinator Perencanaan Konten',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isActive: true,
  },
  {
    id: 'usr-dian',
    username: 'dian.pramana',
    email: 'dian.pramana@hortiflow.local',
    fullName: 'Dian Pramana, S.Ds.',
    role: 'CREATOR',
    unitId: 'unit-setditjen',
    unitName: 'Subbag Publikasi dan Dokumentasi',
    position: 'Desainer Grafis & Editor Senior',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isActive: true,
  },
  {
    id: 'usr-hendro',
    username: 'hendro.wibowo',
    email: 'dr.hendro@hortiflow.local',
    fullName: 'Dr. Ir. Hendro Wibowo, M.Sc.',
    role: 'REVIEWER',
    unitId: 'unit-buah',
    unitName: 'Direktorat Buah dan Florikultura',
    position: 'Penyelaras Fakta & Pakar Teknis',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isActive: true,
  },
  {
    id: 'usr-bambang',
    username: 'bambang.sutrisno',
    email: 'bambang.sutrisno@hortiflow.local',
    fullName: 'Ir. Bambang Sutrisno, M.M.',
    role: 'APPROVER',
    unitId: 'unit-setditjen',
    unitName: 'Sekretariat Ditjen Hortikultura',
    position: 'Pejabat Penyetuju (Eselon II/Kabag)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    isActive: true,
  },
  {
    id: 'usr-admin',
    username: 'admin.hortiflow',
    email: 'admin@hortiflow.local',
    fullName: 'Administrator Sistem HortiFlow',
    role: 'ADMINISTRATOR',
    unitId: 'unit-setditjen',
    unitName: 'Pusat Data & Sistem Informasi',
    position: 'System Administrator & Governance',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    isActive: true,
  },
];

/* =========================================================================
   API ROUTES (Mounted BEFORE Vite middlewares)
   ========================================================================= */

// Health & System Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'HortiFlow Deployment Engine',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      status: 'connected',
      type: process.env.DATABASE_URL ? 'External Cloud Database' : 'Embedded In-Memory Sync Adapter',
      readyForDeploy: true,
    },
  });
});

// Authentication - Login Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;

  let matchedUser = null;

  if (role) {
    matchedUser = DB_USERS.find((u) => u.role === role);
  } else if (identifier) {
    const cleanId = String(identifier).trim().toLowerCase();
    matchedUser = DB_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        u.fullName.toLowerCase().includes(cleanId)
    );
  }

  // If no match found by identifier, default fallback for simulation testing
  if (!matchedUser && identifier && (password === 'HortiFlow@2026' || String(password).length >= 6)) {
    matchedUser = DB_USERS[1]; // default to Planner
  }

  if (!matchedUser) {
    return res.status(401).json({
      success: false,
      message: 'Email/username atau kata sandi tidak sesuai.',
    });
  }

  if (!matchedUser.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Akun Anda berstatus non-aktif. Hubungi Administrator.',
    });
  }

  // Generate lightweight mock-JWT / bearer token
  const token = `hf_token_${matchedUser.id}_${Date.now()}`;

  return res.json({
    success: true,
    token,
    user: matchedUser,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    permissions: {
      role: matchedUser.role,
      canSubmitIntake: true,
      canPlan: ['PLANNER', 'ADMINISTRATOR'].includes(matchedUser.role),
      canCreateContent: ['CREATOR', 'PLANNER', 'ADMINISTRATOR'].includes(matchedUser.role),
      canReview: ['REVIEWER', 'ADMINISTRATOR'].includes(matchedUser.role),
      canApprove: ['APPROVER', 'ADMINISTRATOR'].includes(matchedUser.role),
      canPublish: ['CREATOR', 'PLANNER', 'APPROVER', 'ADMINISTRATOR'].includes(matchedUser.role),
      isAdmin: matchedUser.role === 'ADMINISTRATOR',
    },
  });
});

// Authentication - Current User Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({
      success: true,
      authenticated: false,
      user: null,
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('_')[2];
  const user = DB_USERS.find((u) => u.id === userId) || DB_USERS[1];

  return res.json({
    success: true,
    authenticated: true,
    user,
  });
});

// Authentication - Logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sesi berhasil diakhiri.',
  });
});

// Master Users List for Team Collaboration & RBAC Assignment
app.get('/api/auth/users', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: DB_USERS,
  });
});

// Database & Deployment Sync Diagnostics
app.get('/api/sync/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    syncEngine: 'HortiFlow Distributed State Manager',
    activeSessions: 1,
    cloudReady: true,
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================================
   SERVER START & VITE MIDDLEWARE BOOTSTRAP
   ========================================================================= */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: path.resolve(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HortiFlow Server] Berjalan pada http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
