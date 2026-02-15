
import { User, StudentMaster } from '../types';
import { dbService } from './dbService';

export const authenticateUser = async (email: string, enrollment: string): Promise<User | null> => {
  // Simulate institutional server latency
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const students = dbService.getTable<StudentMaster>('students');
  const found = students.find(s => 
    s.email.toLowerCase() === email.toLowerCase() && 
    s.enrollment === enrollment
  );

  if (!found || found.status === 'Disabled') return null;

  // Consistent key usage across services
  const profileKey = `profile_data_${found.email.toLowerCase()}`;
  const settings = JSON.parse(localStorage.getItem(profileKey) || '{}');

  return {
    ...found,
    ...settings,
    lastLogin: Date.now()
  };
};
