import { User, WhitelistEntry, TrustedDevice, Role } from '../types';
import { sendTOTPEmail, isEmailServiceConfigured } from './emailService';

// ============================================================
// WHITELIST — Strict email-to-role-to-id mapping
// Privilege order for conflict resolution: admin > faculty > canteen > student
// ============================================================

const PRIVILEGE_ORDER: Record<Role, number> = {
  admin: 4,
  faculty: 3,
  canteen: 2,
  student: 1,
};

const RAW_WHITELIST: WhitelistEntry[] = [
  // Students
  { email: 'stu@gmail.com',                          role: 'student', id: 4000, fullName: 'Student User',         department: 'Cyber Security'       },
  { email: 'dbsmita06@gmail.com',                    role: 'student', id: 4001, fullName: 'Debasmita Deb',         department: 'Digital Forensics'    },

  // Faculty
  { email: 'fac@gmail.com',                          role: 'faculty', id: 3000, fullName: 'Faculty Member',        department: 'Forensic Science'     },
  { email: 'debasmitak10@gmail.com',                 role: 'faculty', id: 2001, fullName: 'Debasmita Karmakar',    department: 'Computer Science'     },

  // Canteen
  { email: 'ct@gmail.com',                           role: 'canteen', id: 1000, fullName: 'Canteen Operator',      department: 'Canteen Management'   },
  { email: 'debasmita.btmtcs4242928@nfsu.ac.in',     role: 'canteen', id: 1001, fullName: 'Debasmita NFSU',        department: 'Canteen Management'   },

  // Admin
  { email: 'ad@gmail.com',                           role: 'admin',   id: 2000, fullName: 'System Administrator', department: 'IT Services'          },
  // debasmitak10@gmail.com also admin — highest privilege (admin > faculty) wins
  { email: 'debasmitak10@gmail.com',                 role: 'admin',   id: 2001, fullName: 'Debasmita Karmakar',    department: 'Computer Science'     },
];

// Resolve conflicts: if same email has multiple roles, keep highest privilege
const resolveWhitelist = (): Map<string, WhitelistEntry> => {
  const map = new Map<string, WhitelistEntry>();
  for (const entry of RAW_WHITELIST) {
    const key = entry.email.toLowerCase();
    const existing = map.get(key);
    if (!existing || PRIVILEGE_ORDER[entry.role] > PRIVILEGE_ORDER[existing.role]) {
      map.set(key, entry);
    }
  }
  return map;
};

export const WHITELIST = resolveWhitelist();

// ============================================================
// DEVICE TRUST
// ============================================================

const TRUST_VALIDITY_MS: Record<Role, number> = {
  admin:   7  * 24 * 60 * 60 * 1000,
  faculty: 30 * 24 * 60 * 60 * 1000,
  canteen: 30 * 24 * 60 * 60 * 1000,
  student: 30 * 24 * 60 * 60 * 1000,
};

const DEVICE_TRUST_KEY = 'cw_device_trust';

const getOrCreateDeviceId = (): string => {
  let id = localStorage.getItem('cw_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cw_device_id', id);
  }
  return id;
};

const loadTrustedDevices = (): TrustedDevice[] => {
  try {
    const raw = localStorage.getItem(DEVICE_TRUST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveTrustedDevices = (devices: TrustedDevice[]): void => {
  localStorage.setItem(DEVICE_TRUST_KEY, JSON.stringify(devices));
};

export const isDeviceTrusted = (email: string, role: Role): boolean => {
  const deviceId = getOrCreateDeviceId();
  const devices = loadTrustedDevices();
  const now = Date.now();
  const record = devices.find(
    d => d.deviceId === deviceId && d.email.toLowerCase() === email.toLowerCase()
  );
  if (!record) return false;
  if (record.expiresAt < now) return false;
  if (record.role !== role) return false; // role change invalidates trust
  return true;
};

export const trustCurrentDevice = (email: string, role: Role): void => {
  const deviceId = getOrCreateDeviceId();
  const devices = loadTrustedDevices().filter(
    d => !(d.deviceId === deviceId && d.email.toLowerCase() === email.toLowerCase())
  );
  const validityMs = TRUST_VALIDITY_MS[role];
  const now = Date.now();
  devices.push({ deviceId, email: email.toLowerCase(), role, trustedAt: now, expiresAt: now + validityMs });
  saveTrustedDevices(devices);
};

export const revokeDeviceTrust = (email: string): void => {
  const devices = loadTrustedDevices().filter(
    d => d.email.toLowerCase() !== email.toLowerCase()
  );
  saveTrustedDevices(devices);
};

// ============================================================
// TOTP — Generated here, sent via EmailJS to the whitelisted email
// A real deployment should use a TOTP library (e.g. otpauth) server-side.
// This implementation generates a 6-digit numeric code, stores it in
// sessionStorage (never exposed in the UI), and sends it to the user's email.
// ============================================================

const TOTP_PAYLOAD_KEY = 'cw_totp_payload';
const TOTP_WINDOW_MS   = 5 * 60 * 1000; // 5 minutes

interface TOTPPayload {
  code: string;
  generatedAt: number;
  email: string;
}

const generateCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export interface TOTPSendResult {
  success: boolean;
  error?: string;
  /** true when EmailJS is not yet configured — dev/demo fallback */
  unconfigured?: boolean;
}

/**
 * Generates a TOTP code and sends it to the whitelisted email.
 * The code is stored in sessionStorage and never shown in the UI.
 * Returns success/failure so the Login component can show appropriate UI.
 */
export const generateAndSendTOTP = async (email: string): Promise<TOTPSendResult> => {
  const code = generateCode();
  const payload: TOTPPayload = { code, generatedAt: Date.now(), email: email.toLowerCase() };
  sessionStorage.setItem(TOTP_PAYLOAD_KEY, JSON.stringify(payload));

  // If EmailJS is not yet configured, return a special flag so the Login
  // component can display a setup instructions banner instead of silently failing.
  if (!isEmailServiceConfigured()) {
    console.warn('[authService] EmailJS not configured — TOTP code not sent. Configure .env.local to enable email delivery.');
    return { success: false, unconfigured: true };
  }

  return sendTOTPEmail(email, code);
};

/**
 * Validates user-entered TOTP code against the stored payload.
 * The payload is bound to the email used to generate it as an extra check.
 */
export const validateTOTP = (inputCode: string, email: string): boolean => {
  try {
    const raw = sessionStorage.getItem(TOTP_PAYLOAD_KEY);
    if (!raw) return false;

    const payload: TOTPPayload = JSON.parse(raw);

    if (payload.email !== email.toLowerCase()) return false;
    if (Date.now() - payload.generatedAt > TOTP_WINDOW_MS) return false;
    if (payload.code !== inputCode.trim()) return false;

    // Consume the code — one-time use
    sessionStorage.removeItem(TOTP_PAYLOAD_KEY);
    return true;
  } catch {
    return false;
  }
};

export const clearTOTPSession = (): void => {
  sessionStorage.removeItem(TOTP_PAYLOAD_KEY);
};

// ============================================================
// GOOGLE OAUTH SIMULATION
// In production this uses the Google Identity Services SDK.
// ============================================================

export interface GoogleAuthResult {
  email: string;
  verified: boolean;
}

export const simulateGoogleOAuth = async (email: string): Promise<GoogleAuthResult> => {
  await new Promise(r => setTimeout(r, 1200));
  return { email: email.trim().toLowerCase(), verified: true };
};

// ============================================================
// WHITELIST HELPERS
// ============================================================

export const lookupWhitelist = (email: string): WhitelistEntry | null =>
  WHITELIST.get(email.trim().toLowerCase()) ?? null;

export const buildUserFromEntry = (entry: WhitelistEntry): User => ({
  id:         String(entry.id),
  numericId:  entry.id,
  email:      entry.email,
  fullName:   entry.fullName,
  department: entry.department,
  role:       entry.role,
  status:     'Active',
  createdAt:  Date.now(),
  lastLogin:  Date.now(),
});
