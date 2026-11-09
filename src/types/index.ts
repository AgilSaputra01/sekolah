// Core TypeScript Definitions for EduCore Multi-Tenant SaaS School Management

export type SchoolLevel = 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'MA' | 'MTs';

export type SchoolStatus = 'Trial' | 'Aktif' | 'Nonaktif' | 'Suspended';

export type UserRole =
  | 'Super Admin'
  | 'Admin Sekolah'
  | 'Kepala Sekolah'
  | 'Guru'
  | 'Staff'
  | 'Siswa'
  | 'Orang Tua/Wali';

export type UserStatus = 'Aktif' | 'Nonaktif';

export type StudentStatus = 'Aktif' | 'Lulus' | 'Pindah' | 'Nonaktif';

export type StaffType = 'Guru' | 'Staff';

export type AcademicYearStatus = 'Aktif' | 'Nonaktif';

export type SemesterName = 'Semester 1' | 'Semester 2';

export type ModuleType =
  | 'School'
  | 'Users'
  | 'Roles'
  | 'Students'
  | 'Teachers'
  | 'Staff'
  | 'Academic Year'
  | 'Levels'
  | 'Classes'
  | 'Rombel'
  | 'Homeroom Teacher';

export type ActionType = 'View' | 'Create' | 'Edit' | 'Delete' | 'Approve';

export type PermissionMatrix = Record<ModuleType, Record<ActionType, boolean>>;

export interface RoleDefinition {
  id: string;
  name: UserRole | string;
  description: string;
  isSystem: boolean;
  permissions: PermissionMatrix;
  userCount?: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface School {
  id: string;
  npsn: string;
  name: string;
  address: string;
  logo: string;
  level: SchoolLevel;
  academicYear: string;
  status: SchoolStatus;
  createdAt: string;
  phone?: string;
  email?: string;
  principalName?: string;
  subdomain?: string;
  planId?: string;
  planName?: string;
  subscriptionExpiresAt?: string;
  subscriptionStatus?: 'Aktif' | 'Trial' | 'Expiring' | 'Expired' | 'Suspended';
  maxStudents?: number;
  maxUsers?: number;
  province?: string;
  city?: string;
  district?: string;
  schoolType?: 'Negeri' | 'Swasta';
  suspendedReason?: string;
}

export * from './saas';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  school_id: string | null; // null for Super Admin
  status: UserStatus;
  createdAt: string;
  avatar?: string;
}

export interface Student {
  id: string;
  school_id: string;
  // Identity Data
  fullName: string;
  nik: string;
  nis: string;
  nisn: string;
  pob: string; // Tempat Lahir
  dob: string; // Tanggal Lahir
  gender: 'Laki-laki' | 'Perempuan';
  address: string;
  phone: string;
  // Academic Data
  nomorInduk: string;
  classId: string;
  rombelId: string;
  tahunMasuk: string;
  academicYear: string;
  status: StudentStatus;
  // Parent/Guardian Data
  fatherName: string;
  motherName: string;
  guardianName?: string;
  guardianRelation?: string;
  parentPhone: string;
  parentAddress: string;
  avatar?: string;
}

export interface TeacherStaff {
  id: string;
  school_id: string;
  type: StaffType;
  fullName: string;
  nik: string;
  nip: string;
  email: string;
  phone: string;
  address: string;
  position: string; // Jabatan (e.g. Guru Matematika, Tata Usaha, Kepala Lab)
  subjects?: string[]; // Mata Pelajaran (for Guru)
  status: 'Aktif' | 'Nonaktif';
  joinDate: string;
  avatar?: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  year: string; // e.g., '2026/2027'
  status: AcademicYearStatus;
  activeSemester: SemesterName;
  createdAt: string;
}

export interface Semester {
  id: string;
  school_id: string;
  name: SemesterName;
  academicYearId: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface AcademicLevel {
  id: string;
  school_id: string;
  name: string; // e.g. SMA, SMP, SD
  code: string; // e.g. SMA-01
  status: 'Aktif' | 'Nonaktif';
}

export interface AcademicClass {
  id: string;
  school_id: string;
  name: string; // e.g. "Kelas 10" or "Kelas 1"
  levelId: string;
  gradeLevel: number; // e.g. 10 or 1
  status: 'Aktif' | 'Nonaktif';
}

export interface Rombel {
  id: string;
  school_id: string;
  name: string; // e.g. "10-MIPA-1", "1A"
  classId: string;
  academicYearId: string;
  semester: SemesterName;
  homeroomTeacherId: string | null;
  capacity: number;
  status: 'Aktif' | 'Nonaktif';
}

export interface HomeroomAssignment {
  rombelId: string;
  rombelName: string;
  className: string;
  teacherId: string | null;
  teacherName: string | null;
  teacherNip: string | null;
  teacherSubject: string | null;
  studentCount: number;
  capacity: number;
}
