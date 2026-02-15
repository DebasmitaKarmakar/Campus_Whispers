
import { StudentMaster, MenuItem, Order, LFItem, OpportunityPost, QuestionPaper, HelpRequest } from '../types';

const DB_PREFIX = 'cw_db_';

export const dbService = {
  // Initialize Database with Seed Data
  init: () => {
    // 1. Students Table
    if (!localStorage.getItem(`${DB_PREFIX}students`)) {
      const initialStudents: StudentMaster[] = [
        { id: 'STU-4000', email: 'stu@gmail.com', institutionalId: '4000', fullName: 'Student User', department: 'Cyber Security', role: 'student', status: 'Active', createdAt: Date.now() },
        { id: 'STU-4001', email: 'test@gmail.com', institutionalId: '4001', fullName: 'Test Student', department: 'Digital Forensics', role: 'student', status: 'Active', createdAt: Date.now() },
        { id: 'ADM-1000', email: 'ad@gmail.com', institutionalId: '1000', fullName: 'System Admin', department: 'IT Services', role: 'admin', status: 'Active', createdAt: Date.now() },
        { id: 'STA-3000', email: 'ct@gmail.com', institutionalId: '3000', fullName: 'Canteen Staff', department: 'Canteen Management', role: 'staff', status: 'Active', createdAt: Date.now() },
        { id: 'STA-3001', email: 'staff@gmail.com', institutionalId: '3001', fullName: 'Operational Staff', department: 'Facilities', role: 'staff', status: 'Active', createdAt: Date.now() }
      ];
      dbService.saveTable('students', initialStudents);
    }

    // 2. Canteen Menu Table
    if (!localStorage.getItem(`${DB_PREFIX}canteen_menu`)) {
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

    // 3. Opportunities Table
    if (!localStorage.getItem(`${DB_PREFIX}opportunities`)) {
      const initialOpps: OpportunityPost[] = [
        {
          id: 'OP-1001',
          title: 'Google Cloud Winter Internship',
          mode: 'Hybrid',
          deadline: '2025-12-31',
          description: '3-month program focusing on infrastructure security.',
          status: 'Active',
          posterId: 'ADM-1000',
          posterEmail: 'ad@gmail.com',
          posterRole: 'admin',
          createdAt: Date.now()
        },
        {
          id: 'OP-1002',
          title: 'Cyber Security Workshop - Phase I',
          mode: 'Offline',
          deadline: '2025-06-15',
          description: 'Hands-on workshop on penetration testing techniques.',
          status: 'Active',
          posterId: 'ADM-1000',
          posterEmail: 'ad@gmail.com',
          posterRole: 'admin',
          createdAt: Date.now()
        }
      ];
      dbService.saveTable('opportunities', initialOpps);
    }
  },

  getTable: <T>(tableName: string): T[] => {
    const data = localStorage.getItem(`${DB_PREFIX}${tableName}`);
    return data ? JSON.parse(data) : [];
  },

  saveTable: <T>(tableName: string, data: T[]) => {
    localStorage.setItem(`${DB_PREFIX}${tableName}`, JSON.stringify(data));
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
