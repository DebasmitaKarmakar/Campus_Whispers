
import { StudentMaster, MenuItem, Order, LFItem, OpportunityPost, QuestionPaper, HelpRequest } from '../types';

const DB_PREFIX = 'cw_db_';
const DB_VERSION = '1.2'; // Incrementing this forces a re-seed

export const dbService = {
  init: () => {
    const currentVersion = localStorage.getItem(`${DB_PREFIX}version`);
    
    // Force clear and re-seed if version mismatch or empty students table
    const students = dbService.getTable<StudentMaster>('students');
    if (currentVersion !== DB_VERSION || students.length === 0) {
      console.log('Institutional Database: Syncing Whitelist v' + DB_VERSION);
      
      const initialStudents: StudentMaster[] = [
        { id: 'STU-4000', email: 'stu@gmail.com', institutionalId: '4000', fullName: 'Student User', department: 'Cyber Security', role: 'student', status: 'Active', createdAt: Date.now() },
        { id: 'STU-4001', email: 'test@gmail.com', institutionalId: '4001', fullName: 'Test Student', department: 'Digital Forensics', role: 'student', status: 'Active', createdAt: Date.now() },
        { id: 'ADM-1000', email: 'ad@gmail.com', institutionalId: '1000', fullName: 'System Admin', department: 'IT Services', role: 'admin', status: 'Active', createdAt: Date.now() },
        { id: 'STA-3000', email: 'ct@gmail.com', institutionalId: '3000', fullName: 'Canteen Staff', department: 'Canteen Management', role: 'staff', status: 'Active', createdAt: Date.now() },
        { id: 'STA-3001', email: 'staff@gmail.com', institutionalId: '3001', fullName: 'Operational Staff', department: 'Facilities', role: 'staff', status: 'Active', createdAt: Date.now() }
      ];
      dbService.saveTable('students', initialStudents);
      localStorage.setItem(`${DB_PREFIX}version`, DB_VERSION);
    }

    const menu = dbService.getTable<MenuItem>('canteen_menu');
    if (menu.length === 0) {
      const initialMenu: MenuItem[] = [
        { id: 'MENU-01', name: 'Masala Dosa', price: 40, category: 'Breakfast', available: true, createdBy: 'ADM-1000' },
        { id: 'MENU-02', name: 'Idli Vada', price: 35, category: 'Breakfast', available: true, createdBy: 'ADM-1000' },
        { id: 'MENU-03', name: 'Veg Thali', price: 60, category: 'Lunch', available: true, createdBy: 'ADM-1000' },
        { id: 'MENU-04', name: 'Chicken Biryani', price: 120, category: 'Lunch', available: true, createdBy: 'ADM-1000' },
        { id: 'MENU-05', name: 'Paneer Rice', price: 80, category: 'Dinner', available: true, createdBy: 'ADM-1000' },
        { id: 'MENU-06', name: 'Egg Fried Rice', price: 70, category: 'Dinner', available: true, createdBy: 'ADM-1000' }
      ];
      dbService.saveTable('canteen_menu', initialMenu);
    }
  },

  clearData: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(DB_PREFIX) || key.startsWith('cw_user') || key.startsWith('profile_data_')) {
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
    // Dispatch events for real-time reactivity
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
  }
};
