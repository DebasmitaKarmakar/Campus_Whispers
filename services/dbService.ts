import { MenuItem, Order, LFItem, OpportunityPost, QuestionPaper, HelpRequest, AdminLog, CampusOrg, AppNotification, NotificationCategory, MicroHelpPost } from '../types';

const DB_PREFIX = 'cw_db_';
const DB_VERSION = '3.0';

// Five static campus directory entries — directory is read-only; no add/edit via UI
const INITIAL_CAMPUS_ORGS: CampusOrg[] = [
  {
    id: 'ORG-001',
    name: 'E-Cell NFSU',
    type: 'cell',
    description: 'Entrepreneurship cell fostering startup culture, business ideation, and innovation among NFSU students.',
    website: 'https://ecell.nfsu.ac.in',
    email: 'ecell@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-002',
    name: 'Central Library',
    type: 'library',
    description: 'University central library providing access to academic journals, digital repositories, and reference services.',
    website: 'https://library.nfsu.ac.in',
    email: 'library@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-003',
    name: 'NSS Unit',
    type: 'service',
    description: 'National Service Scheme unit coordinating community service, social outreach, and volunteer programmes at NFSU.',
    website: 'https://nss.nfsu.ac.in',
    email: 'nss@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-004',
    name: 'Coding Club',
    type: 'club',
    description: 'Student-run club for competitive programming, hackathons, open-source contributions, and software development workshops.',
    website: 'https://codingclub.nfsu.ac.in',
    email: 'coding@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-005',
    name: 'Literary Society',
    type: 'committee',
    description: 'Campus literary body organising debates, creative writing workshops, poetry events, and publication of the student journal.',
    website: 'https://literary.nfsu.ac.in',
    email: 'literary@nfsu.ac.in',
    status: 'active',
  },
];

const MICRO_HELP_SEED_POSTS: MicroHelpPost[] = [
  {
    id: 'MH-SEED-001',
    posterEmail: 'student.seed@nfsu.ac.in',
    posterName: 'A Fellow Student',
    isAnonymous: true,
    title: 'Need old BCA/B.Tech textbooks — sem 1 to 4',
    description:
      'Hi, I am looking for old textbooks for Semester 1 to 4 (BCA/B.Tech programs). ' +
      'Subjects like Data Structures, OS, DBMS, Maths, C Programming etc. ' +
      'Would be very helpful if someone can lend or donate them. Happy to pay a small amount too.',
    category: 'Textbooks',
    contactInfo: 'Please connect via the offer button or ask admin to relay your contact.',
    status: 'Approved',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    reviewedBy: 'admin@nfsu.ac.in',
    reviewNote: 'Verified seed post — genuine need.',
    reviewedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'MH-SEED-002',
    posterEmail: 'student.seed2@nfsu.ac.in',
    posterName: 'A Fellow Student',
    isAnonymous: true,
    title: 'Need ₹1200 for ATKT Form Fillup — urgent',
    description:
      'I have an ATKT in one subject and the form fillup deadline is approaching. ' +
      'I am unable to arrange ₹1200 right now due to family financial issues. ' +
      'Any kind help — loan, donation, or guidance on fee waiver — would mean a lot. ' +
      'I can repay once I receive my scholarship amount next month.',
    category: 'ATKT / Exam Fee',
    contactInfo: 'I will share contact privately via admin to maintain privacy.',
    status: 'Approved',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    reviewedBy: 'admin@nfsu.ac.in',
    reviewNote: 'Verified seed post — genuine need.',
    reviewedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

export const dbService = {
  init: () => {
    const currentVersion = localStorage.getItem(`${DB_PREFIX}version`);

    if (currentVersion !== DB_VERSION) {
      console.log('CampusWhispers DB: Initializing v' + DB_VERSION);

      const menu = dbService.getTable<MenuItem>('canteen_menu');
      if (menu.length === 0) {
        // Two example menu items — add more via the Canteen Admin panel
        const initialMenu: MenuItem[] = [
          { id: 'MENU-01', name: 'Masala Dosa',    price: 40,  category: 'Breakfast', available: true, createdBy: 'ADM-2000' },
          { id: 'MENU-02', name: 'Veg Thali',       price: 60,  category: 'Lunch',     available: true, createdBy: 'ADM-2000' },
        ];
        dbService.saveTable('canteen_menu', initialMenu);
      }

      const orgs = dbService.getTable<CampusOrg>('campus_orgs');
      if (orgs.length === 0) {
        dbService.saveTable('campus_orgs', INITIAL_CAMPUS_ORGS);
      }

      // Seed MicroHelp posts if empty
      const microHelpPosts = dbService.getTable('microhelp_posts');
      if (microHelpPosts.length === 0) {
        dbService.saveTable('microhelp_posts', MICRO_HELP_SEED_POSTS);
      }

      dbService.saveTable('admin_logs', []);
      localStorage.setItem(`${DB_PREFIX}version`, DB_VERSION);
    }

    // Always seed orgs if missing
    const orgs = dbService.getTable<CampusOrg>('campus_orgs');
    if (orgs.length === 0) {
      dbService.saveTable('campus_orgs', INITIAL_CAMPUS_ORGS);
    }
  },

  clearData: () => {
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith(DB_PREFIX) ||
        key.startsWith('cw_user') ||
        key.startsWith('profile_data_') ||
        key.startsWith('cw_device_trust') ||
        key.startsWith('cw_device_id')
      ) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  },

  getTable: <T>(tableName: string): T[] => {
    const data = localStorage.getItem(`${DB_PREFIX}${tableName}`);
    return data ? JSON.parse(data) : [];
  },

  saveTable: <T>(tableName: string, data: T[]) => {
    localStorage.setItem(`${DB_PREFIX}${tableName}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('cw_db_update', { detail: { table: tableName } }));
  },

  addRow: <T>(tableName: string, row: T) => {
    const table = dbService.getTable<T>(tableName);
    dbService.saveTable(tableName, [row, ...table]);
  },

  updateRow: <T extends { id: string }>(tableName: string, id: string, updates: Partial<T>) => {
    const table = dbService.getTable<T>(tableName);
    const updated = table.map(row => row.id === id ? { ...row, ...updates } : row);
    dbService.saveTable(tableName, updated);
  },

  deleteRow: (tableName: string, id: string) => {
    const table = dbService.getTable<{ id: string }>(tableName);
    dbService.saveTable(tableName, table.filter(row => row.id !== id));
  },

  // Notification helpers
  pushNotification: (
    recipientEmail: string,
    category: NotificationCategory,
    title: string,
    message: string,
    refId?: string
  ) => {
    const note: AppNotification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category,
      title,
      message,
      recipientEmail,
      isRead: false,
      createdAt: Date.now(),
      refId,
    };
    dbService.addRow<AppNotification>('notifications', note);
  },

  broadcastNotification: (
    recipientEmails: string[],
    category: NotificationCategory,
    title: string,
    message: string,
    refId?: string
  ) => {
    for (const email of recipientEmails) {
      dbService.pushNotification(email, category, title, message, refId);
    }
  },

  getNotificationsForUser: (email: string): AppNotification[] => {
    return dbService
      .getTable<AppNotification>('notifications')
      .filter(n => n.recipientEmail === email || n.recipientEmail === '__all__')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  markNotificationRead: (id: string) => {
    dbService.updateRow<AppNotification>('notifications', id, { isRead: true });
    // Also handle broadcast notifications via a read-set
    const readSet: string[] = JSON.parse(localStorage.getItem('cw_notif_read_set') ?? '[]');
    if (!readSet.includes(id)) {
      readSet.push(id);
      localStorage.setItem('cw_notif_read_set', JSON.stringify(readSet));
    }
  },

  markAllNotificationsRead: (email: string) => {
    const all = dbService.getTable<AppNotification>('notifications');
    // Mark personal notifications
    const updated = all.map(n => n.recipientEmail === email ? { ...n, isRead: true } : n);
    dbService.saveTable('notifications', updated);
    // Mark broadcast notifications as read for this user
    const readSet: string[] = JSON.parse(localStorage.getItem('cw_notif_read_set') ?? '[]');
    const broadcastIds = all.filter(n => n.recipientEmail === '__all__').map(n => n.id);
    const newSet = Array.from(new Set([...readSet, ...broadcastIds]));
    localStorage.setItem('cw_notif_read_set', JSON.stringify(newSet));
    window.dispatchEvent(new CustomEvent('cw_db_update', { detail: { table: 'notifications' } }));
  },

  isBroadcastRead: (id: string): boolean => {
    const readSet: string[] = JSON.parse(localStorage.getItem('cw_notif_read_set') ?? '[]');
    return readSet.includes(id);
  },
};
