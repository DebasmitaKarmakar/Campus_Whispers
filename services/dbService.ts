
import { StudentMaster, MenuItem, Order, LFItem, OpportunityPost, QuestionPaper, HelpRequest } from '../types';

const DB_PREFIX = 'cw_db_';

export const dbService = {
  // Initialize Database with Seed Data
  init: () => {
    // 1. Students Table
    if (!localStorage.getItem(`${DB_PREFIX}students`)) {
      const initialStudents: StudentMaster[] = [
        { id: 'STU-4028', email: 'class@gmail.com', enrollment: '4000', fullName: 'Student', department: 'Cyber Security', role: 'student', status: 'Active', createdAt: Date.now() },
        { id: 'ADM-1001', email: 'ad@gmail.com', enrollment: '1001', fullName: 'System Admin', department: 'IT Services', role: 'admin', status: 'Active', createdAt: Date.now() },
        { id: 'STA-0002', email: 'staff@gmail.com', enrollment: '0002', fullName: 'Canteen Staff', department: 'Canteen Management', role: 'staff', status: 'Active', createdAt: Date.now() }
      ];
      dbService.saveTable('students', initialStudents);
    }

    // 2. Canteen Menu Table
    if (!localStorage.getItem(`${DB_PREFIX}canteen_menu`)) {
      const initialMenu: MenuItem[] = [
        { id: 'MENU-01', name: 'Masala Dosa', price: 40, category: 'Breakfast', available: true, createdBy: 'ADM-1001' },
        { id: 'MENU-02', name: 'Veg Thali', price: 60, category: 'Lunch', available: true, createdBy: 'ADM-1001' },
        { id: 'MENU-03', name: 'Paneer Rice', price: 80, category: 'Dinner', available: true, createdBy: 'ADM-1001' }
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
          posterId: 'ADM-1001',
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
