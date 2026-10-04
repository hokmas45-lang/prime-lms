import { AppUser } from '../types';

export const GRADES = [
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

export const SECTIONS = [
  'Section A',
  'Section B',
  'Section C',
];

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English Literature',
  'World History',
  'Economics',
];

export const MASTER_ADMIN_USERNAME = 'admin';
export const MASTER_ADMIN_PASSWORD = 'Admin@Prime2026!';

export const MASTER_ADMIN_USER: AppUser = {
  id: 'master_admin',
  name: 'Prime Administrator',
  username: MASTER_ADMIN_USERNAME,
  role: 'admin',
  email: 'admin@primelms.edu',
  createdAt: '2026-10-01',
};
