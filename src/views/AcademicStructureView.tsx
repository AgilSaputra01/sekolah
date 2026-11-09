import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  School as SchoolIcon,
  BookOpen,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import {
  AcademicYear,
  Semester,
  AcademicLevel,
  AcademicClass,
  Rombel,
  SemesterName,
} from '../types';
import { Card } from '../components/common/Card';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export type AcademicStructureTab = 'years' | 'levels' | 'classes' | 'rombels' | 'homeroom';

interface AcademicStructureProps {
  initialTab?: AcademicStructureTab;
}

export const AcademicStructureView: React.FC<AcademicStructureProps> = ({
  initialTab = 'years',
}) => {
  const {
    academicYears,
    semesters,
    levels,
    classes,
    rombels,
    students,
    teachersStaff,
    currentSchool,
    addAcademicYear,
    updateAcademicYear,
    setActiveAcademicYear,
    deleteAcademicYear,
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
  } = useTenantAuth();

  const { success, warning } = useToast();
  const [activeTab, setActiveTab] = useState<AcademicStructureTab>(initialTab);

  const activeTeachers = teachersStaff.filter(
    (t) => t.type === 'Guru' && t.status === 'Aktif'
  );

  // ===================== Academic Year Modal States =====================
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearForm, setYearForm] = useState({
    year: '2027/2028',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    activeSemester: 'Semester 1' as SemesterName,
  });

  // ===================== Level Modal States =====================
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<AcademicLevel | null>(null);
  const [levelForm, setLevelForm] = useState({
    name: 'SMA',
    code: 'SMA',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // ===================== Class Modal States =====================
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademicClass | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    levelId: levels[0]?.id || '',
    gradeLevel: 10,
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // ===================== Rombel Modal States =====================
  const [isRombelModalOpen, setIsRombelModalOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Rombel | null>(null);
  const [rombelForm, setRombelForm] = useState({
    name: '',
    classId: classes[0]?.id || '',
    academicYearId: academicYears[0]?.id || '',
    semester: 'Semester 1' as SemesterName,
    homeroomTeacherId: null as string | null,
    capacity: 36,
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // ===================== Homeroom Assignment Modal =====================
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRombelForAssign, setSelectedRombelForAssign] = useState<Rombel | null>(null);
  const [assignedTeacherId, setAssignedTeacherId] = useState<string>('');

  // ===================== Deletion Modal States =====================
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'year' | 'level' | 'class' | 'rombel';
    id: string;
    title: string;
  } | null>(null);

  // Handlers for Academic Year
  const handleOpenAddYear = () => {
    setEditingYear(null);
    setYearForm({
      year: '',
      status: 'Aktif',
      activeSemester: 'Semester 1',
    });
    setIsYearModalOpen(true);
  };

  const handleOpenEditYear = (ay: AcademicYear) => {
    setEditingYear(ay);
    setYearForm({
      year: ay.year,
      status: ay.status,
      activeSemester: ay.activeSemester,
    });
    setIsYearModalOpen(true);
  };

  const handleSubmitYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.year.trim()) return;

    if (editingYear) {
      updateAcademicYear(editingYear.id, yearForm);
      success('Tahun Ajaran Diperbarui', `Tahun ajaran ${yearForm.year} disimpan.`);
    } else {
      addAcademicYear(yearForm);
      success(
        'Tahun Ajaran Ditambahkan',
        `Tahun ajaran ${yearForm.year} dibuat beserta semester dasarnya.`
      );
    }
    setIsYearModalOpen(false);
  };

  // Handlers for Level
  const handleOpenAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({ name: '', code: '', status: 'Aktif' });
    setIsLevelModalOpen(true);
  };

  const handleOpenEditLevel = (lvl: AcademicLevel) => {
    setEditingLevel(lvl);
    setLevelForm({ name: lvl.name, code: lvl.code, status: lvl.status });
    setIsLevelModalOpen(true);
  };

  const handleSubmitLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelForm.name.trim() || !levelForm.code.trim()) return;

    if (editingLevel) {
      updateLevel(editingLevel.id, levelForm);
      success('Jenjang Diperbarui', `Jenjang ${levelForm.name} telah disimpan.`);
    } else {
      addLevel(levelForm);
      success('Jenjang Ditambahkan', `Jenjang ${levelForm.name} dibuat.`);
    }
    setIsLevelModalOpen(false);
  };

  // Handlers for Class
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      levelId: levels[0]?.id || '',
      gradeLevel: 10,
      status: 'Aktif',
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (c: AcademicClass) => {
    setEditingClass(c);
    setClassForm({
      name: c.name,
      levelId: c.levelId,
      gradeLevel: c.gradeLevel,
      status: c.status,
    });
    setIsClassModalOpen(true);
  };

  const handleSubmitClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    if (editingClass) {
      updateClass(editingClass.id, classForm);
      success('Kelas Diperbarui', `Kelas ${classForm.name} disimpan.`);
    } else {
      addClass(classForm);
      success('Kelas Ditambahkan', `Kelas ${classForm.name} dibuat.`);
    }
    setIsClassModalOpen(false);
  };

  // Handlers for Rombel
  const handleOpenAddRombel = () => {
    setEditingRombel(null);
    setRombelForm({
      name: '',
      classId: classes[0]?.id || '',
      academicYearId: academicYears[0]?.id || '',
      semester: 'Semester 1',
      homeroomTeacherId: null,
      capacity: 36,
      status: 'Aktif',
    });
    setIsRombelModalOpen(true);
  };

  const handleOpenEditRombel = (r: Rombel) => {
    setEditingRombel(r);
    setRombelForm({
      name: r.name,
      classId: r.classId,
      academicYearId: r.academicYearId,
      semester: r.semester,
      homeroomTeacherId: r.homeroomTeacherId,
      capacity: r.capacity,
      status: r.status,
    });
    setIsRombelModalOpen(true);
  };

  const handleSubmitRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rombelForm.name.trim()) return;

    if (editingRombel) {
      updateRombel(editingRombel.id, rombelForm);
      success('Rombel Diperbarui', `Rombel ${rombelForm.name} disimpan.`);
    } else {
      addRombel(rombelForm);
      success('Rombel Ditambahkan', `Rombel ${rombelForm.name} dibuat.`);
    }
    setIsRombelModalOpen(false);
  };

  // Homeroom Assignment Handlers
  const handleOpenAssignModal = (r: Rombel) => {
    setSelectedRombelForAssign(r);
    setAssignedTeacherId(r.homeroomTeacherId || '');
    setIsAssignModalOpen(true);
  };

  const handleSaveHomeroomAssign = () => {
    if (!selectedRombelForAssign) return;
    const teacherId = assignedTeacherId ? assignedTeacherId : null;
    assignHomeroomTeacher(selectedRombelForAssign.id, teacherId);

    const teacher = activeTeachers.find((t) => t.id === teacherId);
    success(
      'Wali Kelas Ditetapkan',
      teacher
        ? `${teacher.fullName} sekarang menjadi wali kelas rombel ${selectedRombelForAssign.name}.`
        : `Wali kelas rombel ${selectedRombelForAssign.name} dikosongkan.`
    );
    setIsAssignModalOpen(false);
  };

  // General Delete confirmation
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'year') deleteAcademicYear(deleteTarget.id);
    if (deleteTarget.type === 'level') deleteLevel(deleteTarget.id);
    if (deleteTarget.type === 'class') deleteClass(deleteTarget.id);
    if (deleteTarget.type === 'rombel') deleteRombel(deleteTarget.id);

    success('Data Dihapus', `${deleteTarget.title} berhasil dihapus.`);
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Layers size={26} color="var(--color-primary)" />
            Academic Structure
          </h1>
          <p>
            Konfigurasi hierarki akademik bertingkat:{' '}
            <strong>Tahun Ajaran &rarr; Semester &rarr; Jenjang &rarr; Kelas &rarr; Rombel &rarr; Wali Kelas</strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'years' ? 'active' : ''}`}
          onClick={() => setActiveTab('years')}
        >
          <Calendar size={16} />
          <span>6.1 Tahun Ajaran & Semester</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          <SchoolIcon size={16} />
          <span>6.3 Jenjang (Levels)</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          <Layers size={16} />
          <span>6.4 Kelas (Tingkat)</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'rombels' ? 'active' : ''}`}
          onClick={() => setActiveTab('rombels')}
        >
          <BookOpen size={16} />
          <span>6.5 Rombel</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'homeroom' ? 'active' : ''}`}
          onClick={() => setActiveTab('homeroom')}
        >
          <Sparkles size={16} />
          <span>6.6 Penugasan Wali Kelas</span>
        </button>
      </div>

      {/* ===================== TAB 1: ACADEMIC YEARS & SEMESTERS ===================== */}
      {activeTab === 'years' && (
        <div className="animate-fade-in">
          <Card
            title="Daftar Tahun Ajaran"
            subtitle="Hanya boleh ada 1 tahun ajaran aktif untuk sekolah ini."
            icon={<Calendar size={18} color="var(--color-primary)" />}
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={handleOpenAddYear}
              >
                Tambah Tahun Ajaran
              </Button>
            }
            noPadding
          >
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tahun Ajaran</th>
                    <th>Semester Aktif</th>
                    <th>Status Tahun</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {academicYears.map((ay) => {
                    const isAktif = ay.status === 'Aktif';
                    return (
                      <tr key={ay.id} style={{ background: isAktif ? '#f8fafc' : 'transparent' }}>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isAktif ? 'var(--color-primary)' : 'var(--text-main)' }}>
                            {ay.year}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#1e40af',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                            }}
                          >
                            {ay.activeSemester}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={ay.status} />
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {isAktif
                              ? 'Tahun kalender saat ini'
                              : 'Tahun ajaran arsip / lampau'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            {!isAktif && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setActiveAcademicYear(ay.id);
                                  success(
                                    'Tahun Ajaran Diaktifkan',
                                    `Tahun ajaran ${ay.year} sekarang berstatus Aktif.`
                                  );
                                }}
                              >
                                Set Aktif
                              </Button>
                            )}
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => handleOpenEditYear(ay)}
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => {
                                setDeleteTarget({
                                  type: 'year',
                                  id: ay.id,
                                  title: `Tahun Ajaran ${ay.year}`,
                                });
                                setIsDeleteModalOpen(true);
                              }}
                              title="Hapus"
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ===================== TAB 2: LEVELS / JENJANG ===================== */}
      {activeTab === 'levels' && (
        <div className="animate-fade-in">
          <Card
            title="Daftar Jenjang Pendidikan (Levels)"
            subtitle="Master jenjang institusi sekolah (SD, SMP, SMA, SMK, MTs, dll.)"
            icon={<SchoolIcon size={18} color="var(--color-primary)" />}
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={handleOpenAddLevel}
              >
                Tambah Jenjang
              </Button>
            }
            noPadding
          >
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Jenjang</th>
                    <th>Kode</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((lvl) => (
                    <tr key={lvl.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{lvl.name}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {lvl.code}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={lvl.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => handleOpenEditLevel(lvl)}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => {
                              setDeleteTarget({
                                type: 'level',
                                id: lvl.id,
                                title: `Jenjang ${lvl.name}`,
                              });
                              setIsDeleteModalOpen(true);
                            }}
                            title="Hapus"
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ===================== TAB 3: CLASSES (TINGKAT) ===================== */}
      {activeTab === 'classes' && (
        <div className="animate-fade-in">
          <Card
            title="Daftar Tingkat Kelas"
            subtitle="Pengelompokan tingkatan belajar berdasarkan jenjang (misal: Kelas 10, Kelas 11, Kelas 12)"
            icon={<Layers size={18} color="var(--color-primary)" />}
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={handleOpenAddClass}
              >
                Tambah Kelas
              </Button>
            }
            noPadding
          >
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Kelas</th>
                    <th>Jenjang</th>
                    <th>Tingkat Angka</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => {
                    const lvl = levels.find((l) => l.id === cls.levelId);
                    return (
                      <tr key={cls.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cls.name}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                            }}
                          >
                            {lvl ? lvl.name : cls.levelId}
                          </span>
                        </td>
                        <td>Tingkat {cls.gradeLevel}</td>
                        <td>
                          <StatusBadge status={cls.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => handleOpenEditClass(cls)}
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => {
                                setDeleteTarget({
                                  type: 'class',
                                  id: cls.id,
                                  title: `Kelas ${cls.name}`,
                                });
                                setIsDeleteModalOpen(true);
                              }}
                              title="Hapus"
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ===================== TAB 4: ROMBEL ===================== */}
      {activeTab === 'rombels' && (
        <div className="animate-fade-in">
          <Card
            title="Rombongan Belajar (Rombel)"
            subtitle="Unit rombel tempat belajar siswa (contoh: 10-MIPA-1, 10-MIPA-2, 1A)"
            icon={<BookOpen size={18} color="var(--color-primary)" />}
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={handleOpenAddRombel}
              >
                Tambah Rombel
              </Button>
            }
            noPadding
          >
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Rombel</th>
                    <th>Kelas / Tingkat</th>
                    <th>Tahun Ajaran</th>
                    <th>Semester</th>
                    <th>Wali Kelas</th>
                    <th>Kapasitas & Murid</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rombels.map((rmb) => {
                    const cls = classes.find((c) => c.id === rmb.classId);
                    const teacher = activeTeachers.find((t) => t.id === rmb.homeroomTeacherId);
                    const studentCount = students.filter((s) => s.rombelId === rmb.id).length;
                    const ay = academicYears.find((y) => y.id === rmb.academicYearId);

                    return (
                      <tr key={rmb.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                            {rmb.name}
                          </div>
                        </td>
                        <td>{cls ? cls.name : '-'}</td>
                        <td>{ay ? ay.year : '-'}</td>
                        <td>{rmb.semester}</td>
                        <td>
                          {teacher ? (
                            <span style={{ fontWeight: 600, color: '#065f46' }}>
                              {teacher.fullName}
                            </span>
                          ) : (
                            <span
                              style={{
                                color: '#ef4444',
                                fontSize: '0.78rem',
                                fontStyle: 'italic',
                              }}
                            >
                              Belum Ditetapkan
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '60px',
                                height: '6px',
                                background: '#e2e8f0',
                                borderRadius: '999px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min((studentCount / rmb.capacity) * 100, 100)}%`,
                                  height: '100%',
                                  background: 'var(--color-primary)',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {studentCount}/{rmb.capacity}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={rmb.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => handleOpenAssignModal(rmb)}
                              title="Tugaskan Wali Kelas"
                            >
                              <Sparkles size={15} color="var(--color-primary)" />
                            </button>
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => handleOpenEditRombel(rmb)}
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => {
                                setDeleteTarget({
                                  type: 'rombel',
                                  id: rmb.id,
                                  title: `Rombel ${rmb.name}`,
                                });
                                setIsDeleteModalOpen(true);
                              }}
                              title="Hapus"
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ===================== TAB 5: HOMEROOM TEACHER ASSIGNMENT ===================== */}
      {activeTab === 'homeroom' && (
        <div className="animate-fade-in">
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              color: '#5b21b6',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} />
                <span>Papan Penugasan Wali Kelas (Homeroom Assignment Board)</span>
              </div>
              <p style={{ fontSize: '0.82rem', marginTop: '2px', opacity: 0.9 }}>
                Setiap rombel dapat memiliki satu wali kelas pendamping yang bertanggung jawab membina siswa.
              </p>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              Terpasang:{' '}
              {rombels.filter((r) => r.homeroomTeacherId).length}/{rombels.length} Rombel
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '18px',
            }}
          >
            {rombels.map((rmb) => {
              const teacher = activeTeachers.find((t) => t.id === rmb.homeroomTeacherId);
              const cls = classes.find((c) => c.id === rmb.classId);
              const studentCount = students.filter((s) => s.rombelId === rmb.id).length;

              return (
                <div
                  key={rmb.id}
                  className="card"
                  style={{
                    padding: '20px',
                    borderColor: teacher ? 'var(--border-subtle)' : '#fecaca',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                        }}
                      >
                        {rmb.name.substring(0, 3)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {rmb.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {cls ? cls.name : '-'} • Kapasitas: {studentCount}/{rmb.capacity} Siswa
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={rmb.status} />
                  </div>

                  {/* Teacher Assignment Box */}
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: teacher ? '#f0fdf4' : '#fff1f2',
                      border: teacher ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: teacher ? '#166534' : '#9f1239', marginBottom: '4px' }}>
                      {teacher ? 'Wali Kelas Bertugas' : 'Belum Ditugaskan'}
                    </div>
                    {teacher ? (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#14532d' }}>
                          {teacher.fullName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '2px' }}>
                          NIP: {teacher.nip} • {teacher.position}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.82rem', color: '#be123c' }}>
                        Pilih guru dari daftar pendidik untuk ditugaskan sebagai wali rombel ini.
                      </div>
                    )}
                  </div>

                  <Button
                    variant={teacher ? 'outline' : 'primary'}
                    size="sm"
                    className="btn-full"
                    style={{ width: '100%' }}
                    onClick={() => handleOpenAssignModal(rmb)}
                  >
                    {teacher ? 'Ganti / Ubah Wali Kelas' : 'Tugaskan Wali Kelas'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* Modal Add / Edit Academic Year */}
      <Modal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        title={editingYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
        subtitle="Konfigurasi tahun kalender akademik"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsYearModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmitYear}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitYear} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">
              Tahun Ajaran <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 2026/2027"
              value={yearForm.year}
              onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Semester Aktif</label>
            <select
              className="form-select"
              value={yearForm.activeSemester}
              onChange={(e) =>
                setYearForm({ ...yearForm, activeSemester: e.target.value as SemesterName })
              }
            >
              <option value="Semester 1">Semester 1 (Ganjil)</option>
              <option value="Semester 2">Semester 2 (Genap)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status Keaktifan</label>
            <select
              className="form-select"
              value={yearForm.status}
              onChange={(e) =>
                setYearForm({ ...yearForm, status: e.target.value as 'Aktif' | 'Nonaktif' })
              }
            >
              <option value="Aktif">Aktif (Sebagai tahun berjalan)</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
            <span className="form-helper">
              Jika diset 'Aktif', seluruh tahun ajaran lain pada sekolah ini otomatis nonaktif.
            </span>
          </div>
        </form>
      </Modal>

      {/* Modal Add / Edit Level */}
      <Modal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title={editingLevel ? 'Edit Jenjang' : 'Tambah Jenjang Baru'}
        subtitle="Contoh: SD, SMP, SMA, SMK"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLevelModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmitLevel}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitLevel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">
              Nama Jenjang <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: SMA"
              value={levelForm.name}
              onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Kode Jenjang <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: SMA"
              value={levelForm.code}
              onChange={(e) => setLevelForm({ ...levelForm, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={levelForm.status}
              onChange={(e) =>
                setLevelForm({ ...levelForm, status: e.target.value as 'Aktif' | 'Nonaktif' })
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Add / Edit Class */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? 'Edit Tingkat Kelas' : 'Tambah Tingkat Kelas'}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsClassModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmitClass}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">
              Nama Kelas <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Kelas 10 / Kelas 1"
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Jenjang</label>
            <select
              className="form-select"
              value={classForm.levelId}
              onChange={(e) => setClassForm({ ...classForm, levelId: e.target.value })}
            >
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tingkat Numerik</label>
            <input
              type="number"
              className="form-input"
              value={classForm.gradeLevel}
              onChange={(e) =>
                setClassForm({ ...classForm, gradeLevel: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={classForm.status}
              onChange={(e) =>
                setClassForm({ ...classForm, status: e.target.value as 'Aktif' | 'Nonaktif' })
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal Add / Edit Rombel */}
      <Modal
        isOpen={isRombelModalOpen}
        onClose={() => setIsRombelModalOpen(false)}
        title={editingRombel ? 'Edit Rombel' : 'Tambah Rombongan Belajar'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRombelModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmitRombel}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitRombel} className="form-grid">
          <div className="form-group form-group-full">
            <label className="form-label">
              Nama Rombel <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 10-MIPA-1 atau 1A"
              value={rombelForm.name}
              onChange={(e) => setRombelForm({ ...rombelForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tingkat Kelas</label>
            <select
              className="form-select"
              value={rombelForm.classId}
              onChange={(e) => setRombelForm({ ...rombelForm, classId: e.target.value })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tahun Ajaran</label>
            <select
              className="form-select"
              value={rombelForm.academicYearId}
              onChange={(e) => setRombelForm({ ...rombelForm, academicYearId: e.target.value })}
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.year} ({ay.status})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              value={rombelForm.semester}
              onChange={(e) =>
                setRombelForm({ ...rombelForm, semester: e.target.value as SemesterName })
              }
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kapasitas Maksimal Siswa</label>
            <input
              type="number"
              className="form-input"
              value={rombelForm.capacity}
              onChange={(e) =>
                setRombelForm({ ...rombelForm, capacity: Number(e.target.value) })
              }
            />
          </div>
        </form>
      </Modal>

      {/* Modal Assign Homeroom Teacher */}
      {selectedRombelForAssign && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Penugasan Wali Kelas: ${selectedRombelForAssign.name}`}
          subtitle="Pilih tenaga pengajar yang akan ditugaskan membimbing rombel ini"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveHomeroomAssign}>
                Terapkan Penugasan
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Pilih Guru Wali Kelas</label>
              <select
                className="form-select"
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
              >
                <option value="">-- Kosongkan Wali Kelas --</option>
                {activeTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} (NIP: {t.nip}) - {t.position}
                  </option>
                ))}
              </select>
              <span className="form-helper">
                Guru yang dipilih akan memegang tanggung jawab akademik atas rombel{' '}
                <strong>{selectedRombelForAssign.name}</strong>.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Konfirmasi Hapus"
          message={`Apakah Anda yakin ingin menghapus data "${deleteTarget.title}"?`}
          confirmText="Ya, Hapus"
          variant="danger"
        />
      )}
    </div>
  );
};
