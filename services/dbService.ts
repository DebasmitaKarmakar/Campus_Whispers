import { MenuItem, Order, LFItem, OpportunityPost, QuestionPaper, HelpRequest, AdminLog, CampusOrg } from '../types';

const DB_PREFIX = 'cw_db_';
const DB_VERSION = '2.0';

const INITIAL_CAMPUS_ORGS: CampusOrg[] = [
  {
    id: 'ORG-001',
    name: 'Coding Club',
    type: 'club',
    description: 'Competitive programming, hackathons, open-source contributions, and software development workshops for students across all departments.',
    website: 'https://codingclub.nfsu.ac.in',
    email: 'coding@nfsu.ac.in',
    status: 'active',
    facultyAdvisor: 'Dr. R. Sharma',
    socialLinks: { instagram: 'https://instagram.com', github: 'https://github.com' },
  },
  {
    id: 'ORG-002',
    name: 'E-Cell',
    type: 'cell',
    description: 'Entrepreneurship Cell fostering innovation, startup culture, and business ideation. Organizes pitch competitions and mentorship programs.',
    email: 'ecell@nfsu.ac.in',
    status: 'active',
    facultyAdvisor: 'Prof. M. Joshi',
    socialLinks: { instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
  },
  {
    id: 'ORG-003',
    name: 'Central Library',
    type: 'library',
    description: 'University central library providing access to academic resources, journals, digital repositories, and reference services.',
    website: 'https://library.nfsu.ac.in',
    email: 'library@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-004',
    name: 'Anti-Ragging Committee',
    type: 'committee',
    description: 'Statutory committee established to prevent and address ragging in all its forms within campus premises.',
    email: 'antiragging@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-005',
    name: 'Student Welfare Cell',
    type: 'cell',
    description: 'Provides support services including counseling, academic guidance, scholarship assistance, and student grievance redressal.',
    email: 'welfare@nfsu.ac.in',
    status: 'active',
    facultyAdvisor: 'Dr. P. Mehta',
  },
  {
    id: 'ORG-006',
    name: 'Cyber Forensics Society',
    type: 'club',
    description: 'Focused on digital forensics, cybersecurity research, CTF competitions, and awareness programs on digital crime prevention.',
    email: 'cyberforensics@nfsu.ac.in',
    status: 'active',
    socialLinks: { instagram: 'https://instagram.com', twitter: 'https://twitter.com' },
  },
  {
    id: 'ORG-007',
    name: 'Internal Complaints Committee',
    type: 'committee',
    description: 'Statutory body for addressing complaints related to sexual harassment at workplace as per POSH Act 2013.',
    email: 'icc@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-008',
    name: 'Cultural Committee',
    type: 'committee',
    description: 'Organizes cultural festivals, annual day celebrations, talent shows, and inter-university cultural exchanges.',
    email: 'cultural@nfsu.ac.in',
    status: 'active',
    facultyAdvisor: 'Dr. S. Iyer',
  },
  {
    id: 'ORG-009',
    name: 'Sports Committee',
    type: 'committee',
    description: 'Oversees all sports activities, inter-college tournaments, campus sports facilities, and student athletic development.',
    email: 'sports@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-010',
    name: 'Health Center',
    type: 'service',
    description: 'Campus medical facility providing primary healthcare, first aid, medical consultations, and health awareness programs.',
    email: 'healthcenter@nfsu.ac.in',
    status: 'active',
  },
  {
    id: 'ORG-011',
    name: 'Placement Cell',
    type: 'cell',
    description: 'Manages campus recruitment, industry connections, placement drives, and career counseling for graduating students.',
    website: 'https://placements.nfsu.ac.in',
    email: 'placements@nfsu.ac.in',
    status: 'active',
    facultyAdvisor: 'Dr. A. Kumar',
    socialLinks: { linkedin: 'https://linkedin.com' },
  },
  {
    id: 'ORG-012',
    name: 'NSS Unit',
    type: 'committee',
    description: 'National Service Scheme unit conducting community service, social outreach, and voluntary programs for students.',
    email: 'nss@nfsu.ac.in',
    status: 'active',
  },
];

export const dbService = {
  init: () => {
    const currentVersion = localStorage.getItem(`${DB_PREFIX}version`);

    if (currentVersion !== DB_VERSION) {
      console.log('CampusWhispers DB: Initializing v' + DB_VERSION);

      const menu = dbService.getTable<MenuItem>('canteen_menu');
      if (menu.length === 0) {
        const initialMenu: MenuItem[] = [
          { id: 'MENU-01', name: 'Masala Dosa',    price: 40,  category: 'Breakfast', available: true, createdBy: 'ADM-2000' },
          { id: 'MENU-02', name: 'Idli Vada',       price: 35,  category: 'Breakfast', available: true, createdBy: 'ADM-2000' },
          { id: 'MENU-03', name: 'Veg Thali',       price: 60,  category: 'Lunch',     available: true, createdBy: 'ADM-2000' },
          { id: 'MENU-04', name: 'Chicken Biryani', price: 120, category: 'Lunch',     available: true, createdBy: 'ADM-2000' },
          { id: 'MENU-05', name: 'Paneer Rice',     price: 80,  category: 'Dinner',    available: true, createdBy: 'ADM-2000' },
          { id: 'MENU-06', name: 'Egg Fried Rice',  price: 70,  category: 'Dinner',    available: true, createdBy: 'ADM-2000' },
        ];
        dbService.saveTable('canteen_menu', initialMenu);
      }

      const orgs = dbService.getTable<CampusOrg>('campus_orgs');
      if (orgs.length === 0) {
        dbService.saveTable('campus_orgs', INITIAL_CAMPUS_ORGS);
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
};
