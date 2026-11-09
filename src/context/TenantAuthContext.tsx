import React, { createContext, useContext, useState, useEffect } from 'react';
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
  UserRole,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_ROLES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SEMESTERS,
  INITIAL_LEVELS,
  INITIAL_CLASSES,
  INITIAL_ROMBELS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS_STAFF,
} from '../services/mockData';

interface TenantAuthContextType {
  // Current session
  currentSchool: School | null;
  currentUser: User;
  currentRoleDefinition: RoleDefinition | undefined;
  isSuperAdmin: boolean;
  
  // Tenant Switcher & User Switcher
  switchSchool: (schoolId: string | 'all') => void;
  switchUser: (userId: string) => void;
  resetAllData: () => void;

  // Permission Checker
  hasPermission: (module: ModuleType, action: ActionType) => boolean;

  // Master Lists (Filtered by current tenant for non-Super Admin or when a tenant is selected)
  schools: School[];
  users: User[];
  roles: RoleDefinition[];
  students: Student[];
  teachersStaff: TeacherStaff[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  levels: AcademicLevel[];
  classes: AcademicClass[];
  rombels: Rombel[];

  // Global / Raw Lists (for dropdowns / tenant lookups)
  allSchools: School[];
  allUsers: User[];

  // CRUD Actions
  addSchool: (data: Omit<School, 'id' | 'createdAt'>) => School;
  updateSchool: (id: string, data: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  addUser: (data: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  updateRolePermissions: (roleId: string, module: ModuleType, action: ActionType, allowed: boolean) => void;
  addRole: (role: Omit<RoleDefinition, 'id'>) => RoleDefinition;

  addStudent: (data: Omit<Student, 'id' | 'school_id'>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addTeacherStaff: (data: Omit<TeacherStaff, 'id' | 'school_id'>) => TeacherStaff;
  updateTeacherStaff: (id: string, data: Partial<TeacherStaff>) => void;
  deleteTeacherStaff: (id: string) => void;

  addAcademicYear: (data: Omit<AcademicYear, 'id' | 'school_id' | 'createdAt'>) => AcademicYear;
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;
  setActiveAcademicYear: (id: string) => void;

  addSemester: (data: Omit<Semester, 'id' | 'school_id'>) => Semester;
  updateSemester: (id: string, data: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;

  addLevel: (data: Omit<AcademicLevel, 'id' | 'school_id'>) => AcademicLevel;
  updateLevel: (id: string, data: Partial<AcademicLevel>) => void;
  deleteLevel: (id: string) => void;

  addClass: (data: Omit<AcademicClass, 'id' | 'school_id'>) => AcademicClass;
  updateClass: (id: string, data: Partial<AcademicClass>) => void;
  deleteClass: (id: string) => void;

  addRombel: (data: Omit<Rombel, 'id' | 'school_id'>) => Rombel;
  updateRombel: (id: string, data: Partial<Rombel>) => void;
  deleteRombel: (id: string) => void;
  assignHomeroomTeacher: (rombelId: string, teacherId: string | null) => void;
}

const STORAGE_KEY = 'educore_saas_data_v1';

const TenantAuthContext = createContext<TenantAuthContextType | undefined>(undefined);

export const TenantAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or fallback to seeds
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schools`);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_roles`);
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachersStaff, setTeachersStaff] = useState<TeacherStaff[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teachers_staff`);
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS_STAFF;
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_academic_years`);
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_YEARS;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_semesters`);
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  const [levels, setLevels] = useState<AcademicLevel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_levels`);
    return saved ? JSON.parse(saved) : INITIAL_LEVELS;
  });

  const [classes, setClasses] = useState<AcademicClass[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [rombels, setRombels] = useState<Rombel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rombels`);
    return saved ? JSON.parse(saved) : INITIAL_ROMBELS;
  });

  // Current logged in user (default to Super Admin usr-001)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    return saved || 'usr-001';
  });

  // Active selected tenant ID. If Super Admin, can be null / 'all' or specific school.
  // For tenant-bound users, locked to user's school_id.
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_selected_school_id`);
    return saved !== null ? saved : 'sch-001';
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(schools));
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
    localStorage.setItem(`${STORAGE_KEY}_roles`, JSON.stringify(roles));
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
    localStorage.setItem(`${STORAGE_KEY}_teachers_staff`, JSON.stringify(teachersStaff));
    localStorage.setItem(`${STORAGE_KEY}_academic_years`, JSON.stringify(academicYears));
    localStorage.setItem(`${STORAGE_KEY}_semesters`, JSON.stringify(semesters));
    localStorage.setItem(`${STORAGE_KEY}_levels`, JSON.stringify(levels));
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
    localStorage.setItem(`${STORAGE_KEY}_rombels`, JSON.stringify(rombels));
    localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUserId);
    if (selectedSchoolId) {
      localStorage.setItem(`${STORAGE_KEY}_selected_school_id`, selectedSchoolId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_selected_school_id`);
    }
  }, [
    schools,
    users,
    roles,
    students,
    teachersStaff,
    academicYears,
    semesters,
    levels,
    classes,
    rombels,
    currentUserId,
    selectedSchoolId,
  ]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const isSuperAdmin = currentUser.role === 'Super Admin';

  // Determine active school context
  // If user is not super admin, strictly lock to their school_id
  const effectiveSchoolId = isSuperAdmin ? selectedSchoolId : currentUser.school_id;
  const currentSchool = schools.find((s) => s.id === effectiveSchoolId) || null;

  const currentRoleDefinition = roles.find((r) => r.name === currentUser.role);

  // Permission verification
  const hasPermission = (module: ModuleType, action: ActionType): boolean => {
    if (isSuperAdmin) return true;
    if (!currentRoleDefinition) return false;
    const modPerms = currentRoleDefinition.permissions[module];
    if (!modPerms) return false;
    return !!modPerms[action];
  };

  const switchSchool = (schoolId: string | 'all') => {
    if (schoolId === 'all') {
      setSelectedSchoolId(null);
    } else {
      setSelectedSchoolId(schoolId);
    }
  };

  const switchUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUserId(userId);
      if (targetUser.school_id) {
        setSelectedSchoolId(targetUser.school_id);
      }
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    setSchools(INITIAL_SCHOOLS);
    setUsers(INITIAL_USERS);
    setRoles(INITIAL_ROLES);
    setStudents(INITIAL_STUDENTS);
    setTeachersStaff(INITIAL_TEACHERS_STAFF);
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setSemesters(INITIAL_SEMESTERS);
    setLevels(INITIAL_LEVELS);
    setClasses(INITIAL_CLASSES);
    setRombels(INITIAL_ROMBELS);
    setCurrentUserId('usr-001');
    setSelectedSchoolId('sch-001');
  };

  // Filter helper: if effectiveSchoolId is present, strictly isolate data
  const filterByTenant = <T extends { school_id?: string | null }>(items: T[]): T[] => {
    if (effectiveSchoolId) {
      return items.filter((item) => item.school_id === effectiveSchoolId);
    }
    // If Super Admin has selected 'all' tenants, return all items
    return items;
  };

  // Filtered lists for the active tenant view
  const tenantUsers = effectiveSchoolId
    ? users.filter((u) => u.school_id === effectiveSchoolId || (u.role === 'Super Admin' && !u.school_id))
    : users;
  const tenantStudents = filterByTenant(students);
  const tenantTeachersStaff = filterByTenant(teachersStaff);
  const tenantAcademicYears = filterByTenant(academicYears);
  const tenantSemesters = filterByTenant(semesters);
  const tenantLevels = filterByTenant(levels);
  const tenantClasses = filterByTenant(classes);
  const tenantRombels = filterByTenant(rombels);

  // CRUD Implementations
  const addSchool = (data: Omit<School, 'id' | 'createdAt'>): School => {
    const newSchool: School = {
      ...data,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSchools((prev) => [newSchool, ...prev]);
    // Create default academic structure for new school
    const newAy: AcademicYear = {
      id: `ay-${Date.now()}`,
      school_id: newSchool.id,
      year: newSchool.academicYear || '2026/2027',
      status: 'Aktif',
      activeSemester: 'Semester 1',
      createdAt: new Date().toISOString(),
    };
    setAcademicYears((prev) => [newAy, ...prev]);

    const newSem1: Semester = {
      id: `sem-${Date.now()}-1`,
      school_id: newSchool.id,
      name: 'Semester 1',
      academicYearId: newAy.id,
      status: 'Aktif',
    };
    const newSem2: Semester = {
      id: `sem-${Date.now()}-2`,
      school_id: newSchool.id,
      name: 'Semester 2',
      academicYearId: newAy.id,
      status: 'Nonaktif',
    };
    setSemesters((prev) => [...prev, newSem1, newSem2]);

    const newLevel: AcademicLevel = {
      id: `lvl-${Date.now()}`,
      school_id: newSchool.id,
      name: newSchool.level,
      code: newSchool.level,
      status: 'Aktif',
    };
    setLevels((prev) => [...prev, newLevel]);

    return newSchool;
  };

  const updateSchool = (id: string, data: Partial<School>) => {
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSchool = (id: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== id));
    // Clean cascade
    setUsers((prev) => prev.filter((u) => u.school_id !== id));
    setStudents((prev) => prev.filter((st) => st.school_id !== id));
    setTeachersStaff((prev) => prev.filter((t) => t.school_id !== id));
    setAcademicYears((prev) => prev.filter((ay) => ay.school_id !== id));
    setSemesters((prev) => prev.filter((sem) => sem.school_id !== id));
    setLevels((prev) => prev.filter((l) => l.school_id !== id));
    setClasses((prev) => prev.filter((c) => c.school_id !== id));
    setRombels((prev) => prev.filter((r) => r.school_id !== id));
    if (selectedSchoolId === id) {
      setSelectedSchoolId('all');
    }
  };

  const addUser = (data: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...data,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const updateRolePermissions = (
    roleId: string,
    module: ModuleType,
    action: ActionType,
    allowed: boolean
  ) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [module]: {
                ...role.permissions[module],
                [action]: allowed,
              },
            },
          };
        }
        return role;
      })
    );
  };

  const addRole = (roleData: Omit<RoleDefinition, 'id'>): RoleDefinition => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: `role-${Date.now()}`,
      userCount: 0,
    };
    setRoles((prev) => [...prev, newRole]);
    return newRole;
  };

  const addStudent = (data: Omit<Student, 'id' | 'school_id'>): Student => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      school_id: targetSchoolId,
    };
    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((st) => (st.id === id ? { ...st, ...data } : st)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((st) => st.id !== id));
  };

  const addTeacherStaff = (data: Omit<TeacherStaff, 'id' | 'school_id'>): TeacherStaff => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newTeacherStaff: TeacherStaff = {
      ...data,
      id: `${data.type === 'Guru' ? 'tch' : 'stf'}-${Date.now()}`,
      school_id: targetSchoolId,
    };
    setTeachersStaff((prev) => [newTeacherStaff, ...prev]);
    return newTeacherStaff;
  };

  const updateTeacherStaff = (id: string, data: Partial<TeacherStaff>) => {
    setTeachersStaff((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTeacherStaff = (id: string) => {
    setTeachersStaff((prev) => prev.filter((t) => t.id !== id));
    // If teacher was homeroom, unassign
    setRombels((prev) =>
      prev.map((r) => (r.homeroomTeacherId === id ? { ...r, homeroomTeacherId: null } : r))
    );
  };

  // Academic Year: Enforce only one active academic year per school!
  const addAcademicYear = (data: Omit<AcademicYear, 'id' | 'school_id' | 'createdAt'>): AcademicYear => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newAy: AcademicYear = {
      ...data,
      id: `ay-${Date.now()}`,
      school_id: targetSchoolId,
      createdAt: new Date().toISOString(),
    };

    setAcademicYears((prev) => {
      // If newly added is 'Aktif', set all other years of this school to 'Nonaktif'
      if (newAy.status === 'Aktif') {
        const deactivated = prev.map((ay) =>
          ay.school_id === targetSchoolId ? { ...ay, status: 'Nonaktif' as const } : ay
        );
        return [newAy, ...deactivated];
      }
      return [newAy, ...prev];
    });

    // Create default semesters for this year
    const s1: Semester = {
      id: `sem-${Date.now()}-1`,
      school_id: targetSchoolId,
      name: 'Semester 1',
      academicYearId: newAy.id,
      status: 'Aktif',
    };
    const s2: Semester = {
      id: `sem-${Date.now()}-2`,
      school_id: targetSchoolId,
      name: 'Semester 2',
      academicYearId: newAy.id,
      status: 'Nonaktif',
    };
    setSemesters((prev) => [...prev, s1, s2]);

    return newAy;
  };

  const updateAcademicYear = (id: string, data: Partial<AcademicYear>) => {
    setAcademicYears((prev) => {
      const target = prev.find((ay) => ay.id === id);
      if (!target) return prev;
      const targetSchoolId = target.school_id;

      if (data.status === 'Aktif') {
        return prev.map((ay) => {
          if (ay.id === id) {
            return { ...ay, ...data };
          }
          if (ay.school_id === targetSchoolId) {
            return { ...ay, status: 'Nonaktif' as const };
          }
          return ay;
        });
      }
      return prev.map((ay) => (ay.id === id ? { ...ay, ...data } : ay));
    });
  };

  const setActiveAcademicYear = (id: string) => {
    updateAcademicYear(id, { status: 'Aktif' });
  };

  const deleteAcademicYear = (id: string) => {
    setAcademicYears((prev) => prev.filter((ay) => ay.id !== id));
  };

  const addSemester = (data: Omit<Semester, 'id' | 'school_id'>): Semester => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newSem: Semester = {
      ...data,
      id: `sem-${Date.now()}`,
      school_id: targetSchoolId,
    };
    setSemesters((prev) => [...prev, newSem]);
    return newSem;
  };

  const updateSemester = (id: string, data: Partial<Semester>) => {
    setSemesters((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const addLevel = (data: Omit<AcademicLevel, 'id' | 'school_id'>): AcademicLevel => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newLevel: AcademicLevel = {
      ...data,
      id: `lvl-${Date.now()}`,
      school_id: targetSchoolId,
    };
    setLevels((prev) => [...prev, newLevel]);
    return newLevel;
  };

  const updateLevel = (id: string, data: Partial<AcademicLevel>) => {
    setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
  };

  const deleteLevel = (id: string) => {
    setLevels((prev) => prev.filter((l) => l.id !== id));
  };

  const addClass = (data: Omit<AcademicClass, 'id' | 'school_id'>): AcademicClass => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newClass: AcademicClass = {
      ...data,
      id: `cls-${Date.now()}`,
      school_id: targetSchoolId,
    };
    setClasses((prev) => [...prev, newClass]);
    return newClass;
  };

  const updateClass = (id: string, data: Partial<AcademicClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const addRombel = (data: Omit<Rombel, 'id' | 'school_id'>): Rombel => {
    const targetSchoolId = effectiveSchoolId || schools[0]?.id || 'sch-001';
    const newRombel: Rombel = {
      ...data,
      id: `rmb-${Date.now()}`,
      school_id: targetSchoolId,
    };
    setRombels((prev) => [...prev, newRombel]);
    return newRombel;
  };

  const updateRombel = (id: string, data: Partial<Rombel>) => {
    setRombels((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const deleteRombel = (id: string) => {
    setRombels((prev) => prev.filter((r) => r.id !== id));
  };

  const assignHomeroomTeacher = (rombelId: string, teacherId: string | null) => {
    setRombels((prev) =>
      prev.map((r) => (r.id === rombelId ? { ...r, homeroomTeacherId: teacherId } : r))
    );
  };

  return (
    <TenantAuthContext.Provider
      value={{
        currentSchool,
        currentUser,
        currentRoleDefinition,
        isSuperAdmin,
        switchSchool,
        switchUser,
        resetAllData,
        hasPermission,

        schools,
        users: tenantUsers,
        roles,
        students: tenantStudents,
        teachersStaff: tenantTeachersStaff,
        academicYears: tenantAcademicYears,
        semesters: tenantSemesters,
        levels: tenantLevels,
        classes: tenantClasses,
        rombels: tenantRombels,

        allSchools: schools,
        allUsers: users,

        addSchool,
        updateSchool,
        deleteSchool,

        addUser,
        updateUser,
        deleteUser,

        updateRolePermissions,
        addRole,

        addStudent,
        updateStudent,
        deleteStudent,

        addTeacherStaff,
        updateTeacherStaff,
        deleteTeacherStaff,

        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        setActiveAcademicYear,

        addSemester,
        updateSemester,
        deleteSemester,

        addLevel,
        updateLevel,
        deleteLevel,

        addClass,
        updateClass,
        deleteClass,

        addRombel,
        updateRombel,
        deleteRombel,
        assignHomeroomTeacher,
      }}
    >
      {children}
    </TenantAuthContext.Provider>
  );
};

export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);
  if (!context) {
    throw new Error('useTenantAuth must be used within a TenantAuthProvider');
  }
  return context;
};
