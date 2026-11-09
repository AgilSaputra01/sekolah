import {
  School,
  User,
  Student,
  TeacherStaff,
  AcademicYear,
  Semester,
  AcademicLevel,
  AcademicClass,
  Rombel,
  RoleDefinition,
  ModuleType,
  ActionType,
  PermissionMatrix,
} from '../types';

export const ALL_MODULES: ModuleType[] = [
  'School',
  'Users',
  'Roles',
  'Students',
  'Teachers',
  'Staff',
  'Academic Year',
  'Levels',
  'Classes',
  'Rombel',
  'Homeroom Teacher',
];

export const ALL_ACTIONS: ActionType[] = ['View', 'Create', 'Edit', 'Delete', 'Approve'];

// Helper to create empty matrix
export const createEmptyPermissionMatrix = (): PermissionMatrix => {
  const matrix = {} as PermissionMatrix;
  ALL_MODULES.forEach((mod) => {
    matrix[mod] = {
      View: false,
      Create: false,
      Edit: false,
      Delete: false,
      Approve: false,
    };
  });
  return matrix;
};

// Super Admin: All permissions checked
export const createSuperAdminMatrix = (): PermissionMatrix => {
  const matrix = {} as PermissionMatrix;
  ALL_MODULES.forEach((mod) => {
    matrix[mod] = {
      View: true,
      Create: true,
      Edit: true,
      Delete: true,
      Approve: true,
    };
  });
  return matrix;
};

// Admin Sekolah: School (View/Edit), Users, Roles, Students, Teachers, Staff, Academic Structure
export const createSchoolAdminMatrix = (): PermissionMatrix => {
  const matrix = createEmptyPermissionMatrix();
  // School
  matrix['School'] = { View: true, Create: false, Edit: true, Delete: false, Approve: false };
  // Users & Roles
  matrix['Users'] = { View: true, Create: true, Edit: true, Delete: true, Approve: false };
  matrix['Roles'] = { View: true, Create: false, Edit: true, Delete: false, Approve: false };
  // Students, Teachers, Staff
  matrix['Students'] = { View: true, Create: true, Edit: true, Delete: true, Approve: true };
  matrix['Teachers'] = { View: true, Create: true, Edit: true, Delete: true, Approve: true };
  matrix['Staff'] = { View: true, Create: true, Edit: true, Delete: true, Approve: true };
  // Academic Structure
  matrix['Academic Year'] = { View: true, Create: true, Edit: true, Delete: false, Approve: true };
  matrix['Levels'] = { View: true, Create: true, Edit: true, Delete: true, Approve: false };
  matrix['Classes'] = { View: true, Create: true, Edit: true, Delete: true, Approve: false };
  matrix['Rombel'] = { View: true, Create: true, Edit: true, Delete: true, Approve: false };
  matrix['Homeroom Teacher'] = { View: true, Create: true, Edit: true, Delete: true, Approve: true };
  return matrix;
};

// Kepala Sekolah: View Focus + Approvals
export const createPrincipalMatrix = (): PermissionMatrix => {
  const matrix = createEmptyPermissionMatrix();
  matrix['School'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Users'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Roles'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Students'] = { View: true, Create: false, Edit: false, Delete: false, Approve: true };
  matrix['Teachers'] = { View: true, Create: false, Edit: false, Delete: false, Approve: true };
  matrix['Staff'] = { View: true, Create: false, Edit: false, Delete: false, Approve: true };
  matrix['Academic Year'] = { View: true, Create: false, Edit: false, Delete: false, Approve: true };
  matrix['Levels'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Classes'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Rombel'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Homeroom Teacher'] = { View: true, Create: false, Edit: false, Delete: false, Approve: true };
  return matrix;
};

// Guru: View Students, View Academic Structure, Edit assigned
export const createTeacherMatrix = (): PermissionMatrix => {
  const matrix = createEmptyPermissionMatrix();
  matrix['Students'] = { View: true, Create: false, Edit: true, Delete: false, Approve: false };
  matrix['Teachers'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Academic Year'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Levels'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Classes'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Rombel'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Homeroom Teacher'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  return matrix;
};

// Staff: Limited to Staff and Students
export const createStaffMatrix = (): PermissionMatrix => {
  const matrix = createEmptyPermissionMatrix();
  matrix['Students'] = { View: true, Create: true, Edit: true, Delete: false, Approve: false };
  matrix['Staff'] = { View: true, Create: false, Edit: true, Delete: false, Approve: false };
  matrix['Academic Year'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Classes'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Rombel'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  return matrix;
};

// Siswa: Strictly View
export const createStudentMatrix = (): PermissionMatrix => {
  const matrix = createEmptyPermissionMatrix();
  matrix['Students'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Academic Year'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Classes'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Rombel'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Homeroom Teacher'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  return matrix;
};

// Orang Tua: Strictly View
export const createParentMatrix = (): PermissionMatrix => {
  const matrix = createEmptyPermissionMatrix();
  matrix['Students'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Academic Year'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  matrix['Homeroom Teacher'] = { View: true, Create: false, Edit: false, Delete: false, Approve: false };
  return matrix;
};

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Akses penuh dan tidak terbatas ke seluruh sistem dan seluruh tenant sekolah.',
    isSystem: true,
    permissions: createSuperAdminMatrix(),
    status: 'Aktif',
    userCount: 1,
  },
  {
    id: 'role-admin-sekolah',
    name: 'Admin Sekolah',
    description: 'Mengelola data sekolah, pengguna, siswa, guru, staff, dan struktur akademik tenant.',
    isSystem: true,
    permissions: createSchoolAdminMatrix(),
    status: 'Aktif',
    userCount: 3,
  },
  {
    id: 'role-kepala-sekolah',
    name: 'Kepala Sekolah',
    description: 'Memantau seluruh aktivitas akademik dan menyetujui (approve) data penting.',
    isSystem: true,
    permissions: createPrincipalMatrix(),
    status: 'Aktif',
    userCount: 2,
  },
  {
    id: 'role-guru',
    name: 'Guru',
    description: 'Melihat profil siswa dan mengakses struktur rombel serta tugas mengajar/wali kelas.',
    isSystem: true,
    permissions: createTeacherMatrix(),
    status: 'Aktif',
    userCount: 6,
  },
  {
    id: 'role-staff',
    name: 'Staff',
    description: 'Membantu operasional administrasi sekolah sesuai wewenang bagian TU.',
    isSystem: true,
    permissions: createStaffMatrix(),
    status: 'Aktif',
    userCount: 3,
  },
  {
    id: 'role-siswa',
    name: 'Siswa',
    description: 'Melihat profil sendiri dan rombel kelas.',
    isSystem: true,
    permissions: createStudentMatrix(),
    status: 'Aktif',
    userCount: 12,
  },
  {
    id: 'role-orang-tua',
    name: 'Orang Tua/Wali',
    description: 'Melihat perkembangan profil dan informasi wali kelas anak terkait.',
    isSystem: true,
    permissions: createParentMatrix(),
    status: 'Aktif',
    userCount: 8,
  },
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-001',
    npsn: '20103456',
    name: 'SMA Garuda Nusantara',
    address: 'Jl. Merdeka Raya No. 45, Kebayoran Baru, Jakarta Selatan',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    level: 'SMA',
    academicYear: '2026/2027',
    status: 'Aktif',
    phone: '021-72890123',
    email: 'info@smagarudanusantara.sch.id',
    principalName: 'Dr. H. Bambang Soeprapto, M.Pd.',
    createdAt: '2025-06-15T08:00:00Z',
  },
  {
    id: 'sch-002',
    npsn: '20108765',
    name: 'SMP Harapan Bangsa',
    address: 'Jl. Pemuda No. 12, Menteng, Jakarta Pusat',
    logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=160&auto=format&fit=crop&q=80',
    level: 'SMP',
    academicYear: '2026/2027',
    status: 'Aktif',
    phone: '021-3145678',
    email: 'kontak@smpharapanbangsa.sch.id',
    principalName: 'Dra. Hj. Siti Aminah, M.M.',
    createdAt: '2025-07-01T09:30:00Z',
  },
  {
    id: 'sch-003',
    npsn: '20109988',
    name: 'SD Cendekia Mandiri',
    address: 'Jl. Flamboyan Indah No. 8, Bandung',
    logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
    level: 'SD',
    academicYear: '2026/2027',
    status: 'Trial',
    phone: '022-8765432',
    email: 'admin@sdcendekiamandiri.sch.id',
    principalName: 'Rudi Hartono, S.Pd.',
    createdAt: '2026-01-10T11:15:00Z',
  },
];

export const INITIAL_USERS: User[] = [
  // Super Admin (Global - school_id is null)
  {
    id: 'usr-001',
    name: 'Ahmad Fauzi (Platform Admin)',
    email: 'superadmin@educore.id',
    phone: '081298765432',
    role: 'Super Admin',
    school_id: null,
    status: 'Aktif',
    createdAt: '2025-01-01T00:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  // SMA Garuda Nusantara Users
  {
    id: 'usr-002',
    name: 'Deni Kurniawan, S.Kom.',
    email: 'admin.sma@smagarudanusantara.sch.id',
    phone: '081311223344',
    role: 'Admin Sekolah',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-06-20T10:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-003',
    name: 'Dr. H. Bambang Soeprapto, M.Pd.',
    email: 'kepsek@smagarudanusantara.sch.id',
    phone: '081233445566',
    role: 'Kepala Sekolah',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-06-20T10:30:00Z',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-004',
    name: 'Siti Rahmawati, M.Pd.',
    email: 'siti.rahma@smagarudanusantara.sch.id',
    phone: '081388776655',
    role: 'Guru',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-07-01T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-005',
    name: 'Budi Santoso, S.Si.',
    email: 'budi.santoso@smagarudanusantara.sch.id',
    phone: '081255443322',
    role: 'Guru',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-07-01T08:15:00Z',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-006',
    name: 'Maya Indriani',
    email: 'tu.maya@smagarudanusantara.sch.id',
    phone: '081599887766',
    role: 'Staff',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-07-05T09:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-007',
    name: 'Muhammad Rizky Pratama',
    email: 'rizky.pratama@student.sch.id',
    phone: '082199887711',
    role: 'Siswa',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-07-10T14:00:00Z',
  },
  {
    id: 'usr-008',
    name: 'Hendra Pratama (Wali Rizky)',
    email: 'hendra.pratama@gmail.com',
    phone: '081122339900',
    role: 'Orang Tua/Wali',
    school_id: 'sch-001',
    status: 'Aktif',
    createdAt: '2025-07-10T14:30:00Z',
  },

  // SMP Harapan Bangsa Users
  {
    id: 'usr-009',
    name: 'Aris Wicaksono, S.T.',
    email: 'admin@smpharapanbangsa.sch.id',
    phone: '081822334455',
    role: 'Admin Sekolah',
    school_id: 'sch-002',
    status: 'Aktif',
    createdAt: '2025-07-02T10:00:00Z',
  },
  {
    id: 'usr-010',
    name: 'Dra. Hj. Siti Aminah, M.M.',
    email: 'kepsek@smpharapanbangsa.sch.id',
    phone: '081933445566',
    role: 'Kepala Sekolah',
    school_id: 'sch-002',
    status: 'Aktif',
    createdAt: '2025-07-02T10:30:00Z',
  },
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  // SMA Garuda Nusantara
  {
    id: 'ay-001',
    school_id: 'sch-001',
    year: '2026/2027',
    status: 'Aktif',
    activeSemester: 'Semester 1',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'ay-002',
    school_id: 'sch-001',
    year: '2025/2026',
    status: 'Nonaktif',
    activeSemester: 'Semester 2',
    createdAt: '2025-06-01T00:00:00Z',
  },
  // SMP Harapan Bangsa
  {
    id: 'ay-003',
    school_id: 'sch-002',
    year: '2026/2027',
    status: 'Aktif',
    activeSemester: 'Semester 1',
    createdAt: '2026-06-01T00:00:00Z',
  },
  // SD Cendekia Mandiri
  {
    id: 'ay-004',
    school_id: 'sch-003',
    year: '2026/2027',
    status: 'Aktif',
    activeSemester: 'Semester 1',
    createdAt: '2026-06-01T00:00:00Z',
  },
];

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-001', school_id: 'sch-001', name: 'Semester 1', academicYearId: 'ay-001', status: 'Aktif' },
  { id: 'sem-002', school_id: 'sch-001', name: 'Semester 2', academicYearId: 'ay-001', status: 'Nonaktif' },
  { id: 'sem-003', school_id: 'sch-002', name: 'Semester 1', academicYearId: 'ay-003', status: 'Aktif' },
  { id: 'sem-004', school_id: 'sch-002', name: 'Semester 2', academicYearId: 'ay-003', status: 'Nonaktif' },
  { id: 'sem-005', school_id: 'sch-003', name: 'Semester 1', academicYearId: 'ay-004', status: 'Aktif' },
];

export const INITIAL_LEVELS: AcademicLevel[] = [
  { id: 'lvl-001', school_id: 'sch-001', name: 'SMA', code: 'SMA', status: 'Aktif' },
  { id: 'lvl-002', school_id: 'sch-002', name: 'SMP', code: 'SMP', status: 'Aktif' },
  { id: 'lvl-003', school_id: 'sch-003', name: 'SD', code: 'SD', status: 'Aktif' },
];

export const INITIAL_CLASSES: AcademicClass[] = [
  // SMA Garuda Nusantara
  { id: 'cls-001', school_id: 'sch-001', name: 'Kelas 10', levelId: 'lvl-001', gradeLevel: 10, status: 'Aktif' },
  { id: 'cls-002', school_id: 'sch-001', name: 'Kelas 11', levelId: 'lvl-001', gradeLevel: 11, status: 'Aktif' },
  { id: 'cls-003', school_id: 'sch-001', name: 'Kelas 12', levelId: 'lvl-001', gradeLevel: 12, status: 'Aktif' },

  // SMP Harapan Bangsa
  { id: 'cls-004', school_id: 'sch-002', name: 'Kelas 7', levelId: 'lvl-002', gradeLevel: 7, status: 'Aktif' },
  { id: 'cls-005', school_id: 'sch-002', name: 'Kelas 8', levelId: 'lvl-002', gradeLevel: 8, status: 'Aktif' },
  { id: 'cls-006', school_id: 'sch-002', name: 'Kelas 9', levelId: 'lvl-002', gradeLevel: 9, status: 'Aktif' },

  // SD Cendekia Mandiri
  { id: 'cls-007', school_id: 'sch-003', name: 'Kelas 1', levelId: 'lvl-003', gradeLevel: 1, status: 'Aktif' },
  { id: 'cls-008', school_id: 'sch-003', name: 'Kelas 2', levelId: 'lvl-003', gradeLevel: 2, status: 'Aktif' },
];

export const INITIAL_TEACHERS_STAFF: TeacherStaff[] = [
  // SMA Garuda Nusantara Teachers
  {
    id: 'tch-001',
    school_id: 'sch-001',
    type: 'Guru',
    fullName: 'Siti Rahmawati, M.Pd.',
    nik: '3171015504820001',
    nip: '198204152006042003',
    email: 'siti.rahma@smagarudanusantara.sch.id',
    phone: '081388776655',
    address: 'Jl. Cempaka Putih Timur No. 14, Jakarta',
    position: 'Guru Matematika Senior',
    subjects: ['Matematika Wajib', 'Matematika Peminatan'],
    status: 'Aktif',
    joinDate: '2015-07-15',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'tch-002',
    school_id: 'sch-001',
    type: 'Guru',
    fullName: 'Budi Santoso, S.Si.',
    nik: '3171021208850002',
    nip: '198508122010011012',
    email: 'budi.santoso@smagarudanusantara.sch.id',
    phone: '081255443322',
    address: 'Jl. Tebet Barat Dalam No. 88, Jakarta Selatan',
    position: 'Guru Fisika',
    subjects: ['Fisika'],
    status: 'Aktif',
    joinDate: '2018-08-01',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'tch-003',
    school_id: 'sch-001',
    type: 'Guru',
    fullName: 'Dewi Lestari, S.Pd.',
    nik: '3171036409900003',
    nip: '199009242015032001',
    email: 'dewi.lestari@smagarudanusantara.sch.id',
    phone: '081733221100',
    address: 'Jl. Margonda Raya No. 200, Depok',
    position: 'Guru Bahasa Inggris',
    subjects: ['Bahasa Inggris'],
    status: 'Aktif',
    joinDate: '2019-01-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  // SMA Garuda Nusantara Staff
  {
    id: 'stf-001',
    school_id: 'sch-001',
    type: 'Staff',
    fullName: 'Maya Indriani',
    nik: '3171044501920004',
    nip: '199201052016022002',
    email: 'tu.maya@smagarudanusantara.sch.id',
    phone: '081599887766',
    address: 'Jl. Kalibata Tengah No. 15, Jakarta Selatan',
    position: 'Kepala Tata Usaha',
    subjects: [],
    status: 'Aktif',
    joinDate: '2016-03-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'stf-002',
    school_id: 'sch-001',
    type: 'Staff',
    fullName: 'Joko Susilo',
    nik: '3171051806890005',
    nip: '198906182018041003',
    email: 'joko.lab@smagarudanusantara.sch.id',
    phone: '081299112233',
    address: 'Jl. Pasar Minggu No. 42, Jakarta Selatan',
    position: 'Pranata Laboratorium Komputer',
    subjects: [],
    status: 'Aktif',
    joinDate: '2018-05-15',
  },

  // SMP Harapan Bangsa Teacher & Staff
  {
    id: 'tch-004',
    school_id: 'sch-002',
    type: 'Guru',
    fullName: 'Anisa Wardani, S.Pd.',
    nik: '3172015003920001',
    nip: '199203102018022004',
    email: 'anisa@smpharapanbangsa.sch.id',
    phone: '081244556677',
    address: 'Jl. Salemba Tengah No. 25, Jakarta Pusat',
    position: 'Guru IPA Terpadu',
    subjects: ['IPA Terpadu'],
    status: 'Aktif',
    joinDate: '2018-07-01',
  },
  {
    id: 'stf-003',
    school_id: 'sch-002',
    type: 'Staff',
    fullName: 'Hendra Wijaya',
    nik: '3172021105880002',
    nip: '198805112015031005',
    email: 'hendra.tu@smpharapanbangsa.sch.id',
    phone: '081377889900',
    address: 'Jl. Kramat Raya No. 80, Jakarta Pusat',
    position: 'Staff Keuangan & TU',
    subjects: [],
    status: 'Aktif',
    joinDate: '2015-08-01',
  },
];

export const INITIAL_ROMBELS: Rombel[] = [
  // SMA Garuda Nusantara
  {
    id: 'rmb-001',
    school_id: 'sch-001',
    name: '10-MIPA-1',
    classId: 'cls-001',
    academicYearId: 'ay-001',
    semester: 'Semester 1',
    homeroomTeacherId: 'tch-001', // Bu Siti Rahmawati
    capacity: 36,
    status: 'Aktif',
  },
  {
    id: 'rmb-002',
    school_id: 'sch-001',
    name: '10-MIPA-2',
    classId: 'cls-001',
    academicYearId: 'ay-001',
    semester: 'Semester 1',
    homeroomTeacherId: 'tch-002', // Pak Budi Santoso
    capacity: 36,
    status: 'Aktif',
  },
  {
    id: 'rmb-003',
    school_id: 'sch-001',
    name: '11-MIPA-1',
    classId: 'cls-002',
    academicYearId: 'ay-001',
    semester: 'Semester 1',
    homeroomTeacherId: 'tch-003', // Bu Dewi Lestari
    capacity: 36,
    status: 'Aktif',
  },
  {
    id: 'rmb-004',
    school_id: 'sch-001',
    name: '12-MIPA-1',
    classId: 'cls-003',
    academicYearId: 'ay-001',
    semester: 'Semester 1',
    homeroomTeacherId: null, // Unassigned for testing
    capacity: 36,
    status: 'Aktif',
  },

  // SMP Harapan Bangsa
  {
    id: 'rmb-005',
    school_id: 'sch-002',
    name: '7A',
    classId: 'cls-004',
    academicYearId: 'ay-003',
    semester: 'Semester 1',
    homeroomTeacherId: 'tch-004',
    capacity: 32,
    status: 'Aktif',
  },
  {
    id: 'rmb-006',
    school_id: 'sch-002',
    name: '7B',
    classId: 'cls-004',
    academicYearId: 'ay-003',
    semester: 'Semester 1',
    homeroomTeacherId: null,
    capacity: 32,
    status: 'Aktif',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // SMA Garuda Nusantara Students
  {
    id: 'std-001',
    school_id: 'sch-001',
    fullName: 'Muhammad Rizky Pratama',
    nik: '3171011503080001',
    nis: '23241001',
    nisn: '0087654321',
    pob: 'Jakarta',
    dob: '2008-03-15',
    gender: 'Laki-laki',
    address: 'Jl. Gandaria I No. 23, Kebayoran Baru, Jakarta Selatan',
    phone: '082199887711',
    nomorInduk: 'SMA-GN-2024-001',
    classId: 'cls-001',
    rombelId: 'rmb-001',
    tahunMasuk: '2024',
    academicYear: '2026/2027',
    status: 'Aktif',
    fatherName: 'Hendra Pratama',
    motherName: 'Ratna Sari',
    guardianName: 'Hendra Pratama',
    guardianRelation: 'Ayah Kandung',
    parentPhone: '081122339900',
    parentAddress: 'Jl. Gandaria I No. 23, Kebayoran Baru, Jakarta Selatan',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'std-002',
    school_id: 'sch-001',
    fullName: 'Alya Putri Maharani',
    nik: '3171026005080002',
    nis: '23241002',
    nisn: '0087654322',
    pob: 'Bandung',
    dob: '2008-05-20',
    gender: 'Perempuan',
    address: 'Jl. Fatmawati Raya No. 45, Cilandak, Jakarta Selatan',
    phone: '081233445577',
    nomorInduk: 'SMA-GN-2024-002',
    classId: 'cls-001',
    rombelId: 'rmb-001',
    tahunMasuk: '2024',
    academicYear: '2026/2027',
    status: 'Aktif',
    fatherName: 'Bambang Kusumo',
    motherName: 'Sri Wahyuni',
    parentPhone: '081399887722',
    parentAddress: 'Jl. Fatmawati Raya No. 45, Cilandak, Jakarta Selatan',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'std-003',
    school_id: 'sch-001',
    fullName: 'Dimas Aditya Nugraha',
    nik: '3171031207080003',
    nis: '23241003',
    nisn: '0087654323',
    pob: 'Surabaya',
    dob: '2008-07-12',
    gender: 'Laki-laki',
    address: 'Jl. Panglima Polim IX No. 12, Jakarta Selatan',
    phone: '085611223344',
    nomorInduk: 'SMA-GN-2024-003',
    classId: 'cls-001',
    rombelId: 'rmb-002',
    tahunMasuk: '2024',
    academicYear: '2026/2027',
    status: 'Aktif',
    fatherName: 'Agus Nugraha',
    motherName: 'Dewi Kartika',
    parentPhone: '081288776633',
    parentAddress: 'Jl. Panglima Polim IX No. 12, Jakarta Selatan',
  },
  {
    id: 'std-004',
    school_id: 'sch-001',
    fullName: 'Nabila Zahra Syahrani',
    nik: '3171045109070004',
    nis: '22231015',
    nisn: '0076543210',
    pob: 'Yogyakarta',
    dob: '2007-09-11',
    gender: 'Perempuan',
    address: 'Jl. Antasari No. 78, Jakarta Selatan',
    phone: '087811223355',
    nomorInduk: 'SMA-GN-2023-015',
    classId: 'cls-002',
    rombelId: 'rmb-003',
    tahunMasuk: '2023',
    academicYear: '2026/2027',
    status: 'Aktif',
    fatherName: 'Drs. Syahrani',
    motherName: 'Nur Hasanah',
    parentPhone: '081277665544',
    parentAddress: 'Jl. Antasari No. 78, Jakarta Selatan',
  },
  {
    id: 'std-005',
    school_id: 'sch-001',
    fullName: 'Fajar Maulana Malik',
    nik: '3171052201060005',
    nis: '21221088',
    nisn: '0065432109',
    pob: 'Bogor',
    dob: '2006-01-22',
    gender: 'Laki-laki',
    address: 'Jl. Radio Dalam No. 10, Jakarta Selatan',
    phone: '081922334466',
    nomorInduk: 'SMA-GN-2022-088',
    classId: 'cls-003',
    rombelId: 'rmb-004',
    tahunMasuk: '2022',
    academicYear: '2026/2027',
    status: 'Lulus',
    fatherName: 'Malik Ibrahim',
    motherName: 'Halimah',
    parentPhone: '081366554433',
    parentAddress: 'Jl. Radio Dalam No. 10, Jakarta Selatan',
  },

  // SMP Harapan Bangsa Students
  {
    id: 'std-006',
    school_id: 'sch-002',
    fullName: 'Bagas Aditya Wardana',
    nik: '3172011404110001',
    nis: '24250701',
    nisn: '0112345678',
    pob: 'Jakarta',
    dob: '2011-04-14',
    gender: 'Laki-laki',
    address: 'Jl. Cikini Raya No. 40, Jakarta Pusat',
    phone: '081233557799',
    nomorInduk: 'SMP-HB-2024-001',
    classId: 'cls-004',
    rombelId: 'rmb-005',
    tahunMasuk: '2024',
    academicYear: '2026/2027',
    status: 'Aktif',
    fatherName: 'Gunawan Wardana',
    motherName: 'Endang Purwanti',
    parentPhone: '081199884422',
    parentAddress: 'Jl. Cikini Raya No. 40, Jakarta Pusat',
  },
];
