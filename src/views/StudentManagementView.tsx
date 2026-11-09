import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  User,
  BookOpen,
  Heart,
  Phone,
  Calendar,
  MapPin,
  IdCard,
  Download,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCSV } from '../utils/exportUtils';
import { Student, StudentStatus } from '../types';
import { Card } from '../components/common/Card';
import { Table, Column, Pagination } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

const STUDENT_STATUSES: StudentStatus[] = ['Aktif', 'Lulus', 'Pindah', 'Nonaktif'];

export const StudentManagementView: React.FC = () => {
  const {
    students,
    classes,
    rombels,
    academicYears,
    currentSchool,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useTenantAuth();

  const { success } = useToast();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRombel, setSelectedRombel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Detail Modal Tab
  const [detailTab, setDetailTab] = useState<'profile' | 'academic' | 'parent'>('profile');

  // Form active tab
  const [formTab, setFormTab] = useState<'identity' | 'academic' | 'parent'>('identity');

  // Form State
  const defaultFormData = {
    fullName: '',
    nik: '',
    nis: '',
    nisn: '',
    pob: '',
    dob: '2008-01-01',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    address: '',
    phone: '',
    nomorInduk: '',
    classId: classes[0]?.id || '',
    rombelId: rombels[0]?.id || '',
    tahunMasuk: '2024',
    academicYear: currentSchool?.academicYear || '2026/2027',
    status: 'Aktif' as StudentStatus,
    fatherName: '',
    motherName: '',
    guardianName: '',
    guardianRelation: '',
    parentPhone: '',
    parentAddress: '',
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm) ||
        s.nisn.includes(searchTerm) ||
        s.nik.includes(searchTerm);
      const matchClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchRombel = selectedRombel === 'all' || s.rombelId === selectedRombel;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchSearch && matchClass && matchRombel && matchStatus;
    });
  }, [students, searchTerm, selectedClass, selectedRombel, selectedStatus]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Handlers
  const handleOpenAdd = () => {
    setActiveStudent(null);
    setFormData({
      ...defaultFormData,
      classId: classes[0]?.id || '',
      rombelId: rombels[0]?.id || '',
      academicYear: currentSchool?.academicYear || '2026/2027',
    });
    setFormErrors({});
    setFormTab('identity');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setActiveStudent(s);
    setFormData({
      fullName: s.fullName,
      nik: s.nik,
      nis: s.nis,
      nisn: s.nisn,
      pob: s.pob,
      dob: s.dob,
      gender: s.gender,
      address: s.address,
      phone: s.phone,
      nomorInduk: s.nomorInduk,
      classId: s.classId,
      rombelId: s.rombelId,
      tahunMasuk: s.tahunMasuk,
      academicYear: s.academicYear,
      status: s.status,
      fatherName: s.fatherName,
      motherName: s.motherName,
      guardianName: s.guardianName || '',
      guardianRelation: s.guardianRelation || '',
      parentPhone: s.parentPhone,
      parentAddress: s.parentAddress,
    });
    setFormErrors({});
    setFormTab('identity');
    setIsAddEditModalOpen(true);
  };

  const handleOpenDetail = (s: Student) => {
    setActiveStudent(s);
    setDetailTab('profile');
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (s: Student) => {
    setActiveStudent(s);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Nama Lengkap wajib diisi';
    if (!formData.nik.trim()) errors.nik = 'NIK wajib diisi';
    if (!formData.nis.trim()) errors.nis = 'NIS wajib diisi';
    if (!formData.nisn.trim()) errors.nisn = 'NISN wajib diisi';
    if (!formData.pob.trim()) errors.pob = 'Tempat Lahir wajib diisi';
    if (!formData.dob.trim()) errors.dob = 'Tanggal Lahir wajib diisi';
    if (!formData.classId) errors.classId = 'Pilih Tingkat Kelas';
    if (!formData.rombelId) errors.rombelId = 'Pilih Rombongan Belajar';
    if (!formData.fatherName.trim()) errors.fatherName = 'Nama Ayah wajib diisi';
    if (!formData.motherName.trim()) errors.motherName = 'Nama Ibu wajib diisi';
    if (!formData.parentPhone.trim()) errors.parentPhone = 'Nomor HP Orang Tua wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Switch to the tab containing the error
      if (errors.fullName || errors.nik || errors.nis || errors.nisn || errors.pob || errors.dob) {
        setFormTab('identity');
      } else if (errors.classId || errors.rombelId) {
        setFormTab('academic');
      } else {
        setFormTab('parent');
      }
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (activeStudent) {
        updateStudent(activeStudent.id, formData);
        success('Data Siswa Diperbarui', `Profil ${formData.fullName} berhasil disimpan.`);
      } else {
        addStudent(formData);
        success('Siswa Ditambahkan', `${formData.fullName} berhasil terdaftar di rombel.`);
      }
      setIsSubmitting(false);
      setIsAddEditModalOpen(false);
    }, 400);
  };

  const handleDeleteConfirm = () => {
    if (!activeStudent) return;
    deleteStudent(activeStudent.id);
    setIsDeleteModalOpen(false);
    success('Data Siswa Dihapus', `Siswa ${activeStudent.fullName} telah dihapus.`);
  };

  // Table Columns
  const columns: Column<Student>[] = [
    {
      header: 'Nama Siswa & NISN',
      width: '28%',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">
            {s.avatar ? <img src={s.avatar} alt={s.fullName} /> : s.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {s.fullName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              NIS: {s.nis} • NISN: {s.nisn}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Jenis Kelamin',
      render: (s) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {s.gender}
        </span>
      ),
    },
    {
      header: 'Tingkat Kelas',
      render: (s) => {
        const cls = classes.find((c) => c.id === s.classId);
        return <span style={{ fontWeight: 600 }}>{cls ? cls.name : '-'}</span>;
      },
    },
    {
      header: 'Rombel',
      render: (s) => {
        const rombel = rombels.find((r) => r.id === s.rombelId);
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#f1f5f9',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--color-primary)',
            }}
          >
            {rombel ? rombel.name : '-'}
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (s) => (
        <div className="table-actions">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDetail(s)}
            title="Lihat Detail Siswa"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenEdit(s)}
            title="Edit Siswa"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDelete(s)}
            title="Hapus Siswa"
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <GraduationCap size={26} color="var(--color-primary)" />
            Student Profile & Management
          </h1>
          <p>
            Kelola master data siswa lengkap: identitas kependudukan, penempatan rombel/kelas, serta
            data orang tua/wali.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={() => {
              const exportData = filteredStudents.map((s) => ({
                NIS: s.nis,
                NISN: s.nisn,
                'Nama Lengkap': s.fullName,
                'Jenis Kelamin': s.gender,
                Kelas: classes.find((c) => c.id === s.classId)?.name || '-',
                Rombel: rombels.find((r) => r.id === s.rombelId)?.name || '-',
                Status: s.status,
                'No Telepon': s.phone || '-',
                'Nama Ayah': s.fatherName || '-',
                'Nama Ibu': s.motherName || '-',
              }));
              exportToCSV(exportData, `Data_Siswa_${currentSchool?.name || 'EduCore'}`);
              success('Export Berhasil', 'Data siswa berhasil diekspor ke CSV!');
            }}
          >
            Export CSV
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Tambah Siswa Baru
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card noPadding>
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={16} className="toolbar-search-icon" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, NISN, atau NIK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="toolbar-filters">
            <select
              className="filter-select"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedRombel}
              onChange={(e) => {
                setSelectedRombel(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Rombel</option>
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Status</option>
              {STUDENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={paginatedStudents}
          keyExtractor={(s) => s.id}
          emptyState={
            <EmptyState
              title="Tidak ada data siswa ditemukan"
              description="Coba ubah kata kunci pencarian atau sesuaikan filter kelas, rombel, dan status."
              actionText="Tambah Siswa Baru"
              onAction={handleOpenAdd}
            />
          }
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal Add / Edit Student (Multi-section Tabbed Form) */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={activeStudent ? 'Edit Profil Siswa' : 'Registrasi Siswa Baru'}
        subtitle="Form master data kesiswaan terintegrasi"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} loading={isSubmitting}>
              {activeStudent ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
            </Button>
          </>
        }
      >
        <div>
          {/* Form Tabs */}
          <div className="tabs-nav">
            <button
              type="button"
              className={`tab-btn ${formTab === 'identity' ? 'active' : ''}`}
              onClick={() => setFormTab('identity')}
            >
              <User size={16} />
              <span>1. Identitas Pribadi</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${formTab === 'academic' ? 'active' : ''}`}
              onClick={() => setFormTab('academic')}
            >
              <BookOpen size={16} />
              <span>2. Data Akademik</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${formTab === 'parent' ? 'active' : ''}`}
              onClick={() => setFormTab('parent')}
            >
              <Heart size={16} />
              <span>3. Orang Tua / Wali</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            {/* Section 1: Identity */}
            {formTab === 'identity' && (
              <div className="form-grid animate-fade-in">
                <div className="form-group form-group-full">
                  <label className="form-label">
                    Nama Lengkap Siswa <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  {formErrors.fullName && (
                    <span className="form-error-msg">{formErrors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    NIK (Nomor Induk Kependudukan) <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="16 Digit NIK"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) =>
                      setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })
                    }
                  />
                  {formErrors.nik && <span className="form-error-msg">{formErrors.nik}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Jenis Kelamin <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as 'Laki-laki' | 'Perempuan',
                      })
                    }
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tempat Lahir <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Jakarta"
                    value={formData.pob}
                    onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                  />
                  {formErrors.pob && <span className="form-error-msg">{formErrors.pob}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tanggal Lahir <span className="form-required">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                  {formErrors.dob && <span className="form-error-msg">{formErrors.dob}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Handphone Siswa</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 082199887711"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Alamat domisili tempat tinggal siswa..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Section 2: Academic */}
            {formTab === 'academic' && (
              <div className="form-grid animate-fade-in">
                <div className="form-group">
                  <label className="form-label">
                    NIS (Nomor Induk Sekolah) <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 23241001"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  />
                  {formErrors.nis && <span className="form-error-msg">{formErrors.nis}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    NISN (Nomor Induk Siswa Nasional) <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="10 digit NISN"
                    maxLength={10}
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value.replace(/\D/g, '') })
                    }
                  />
                  {formErrors.nisn && <span className="form-error-msg">{formErrors.nisn}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor Induk Pokok</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: SMA-GN-2024-001"
                    value={formData.nomorInduk}
                    onChange={(e) => setFormData({ ...formData, nomorInduk: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tahun Masuk</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 2024"
                    value={formData.tahunMasuk}
                    onChange={(e) => setFormData({ ...formData, tahunMasuk: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tingkat Kelas <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.classId && (
                    <span className="form-error-msg">{formErrors.classId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Rombongan Belajar (Rombel) <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.rombelId}
                    onChange={(e) => setFormData({ ...formData, rombelId: e.target.value })}
                  >
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.rombelId && (
                    <span className="form-error-msg">{formErrors.rombelId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Tahun Ajaran</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status Siswa</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as StudentStatus })
                    }
                  >
                    {STUDENT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Section 3: Parent / Guardian */}
            {formTab === 'parent' && (
              <div className="form-grid animate-fade-in">
                <div className="form-group">
                  <label className="form-label">
                    Nama Ayah Kandung <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Hendra Pratama"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  />
                  {formErrors.fatherName && (
                    <span className="form-error-msg">{formErrors.fatherName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nama Ibu Kandung <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Ratna Sari"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  />
                  {formErrors.motherName && (
                    <span className="form-error-msg">{formErrors.motherName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Wali (Jika Ada)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nama wali murid"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hubungan dengan Siswa</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Paman / Kakek"
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Nomor Telepon Orang Tua / Wali <span className="form-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 081122339900"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  />
                  {formErrors.parentPhone && (
                    <span className="form-error-msg">{formErrors.parentPhone}</span>
                  )}
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Alamat Orang Tua / Wali</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Alamat domisili orang tua..."
                    value={formData.parentAddress}
                    onChange={(e) => setFormData({ ...formData, parentAddress: e.target.value })}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {/* Modal Student Detail with 3 Tabs: Profile, Academic, Parent/Guardian */}
      {activeStudent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={activeStudent.fullName}
          subtitle={`NIS: ${activeStudent.nis} • NISN: ${activeStudent.nisn}`}
          size="lg"
          footer={
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          }
        >
          <div>
            {/* Header banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
              }}
            >
              <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '1.4rem' }}>
                {activeStudent.avatar ? (
                  <img src={activeStudent.avatar} alt={activeStudent.fullName} />
                ) : (
                  activeStudent.fullName.charAt(0)
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {activeStudent.fullName}
                  </h3>
                  <StatusBadge status={activeStudent.status} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Rombel:{' '}
                  <strong>{rombels.find((r) => r.id === activeStudent.rombelId)?.name || '-'}</strong>{' '}
                  • Kelas:{' '}
                  <strong>{classes.find((c) => c.id === activeStudent.classId)?.name || '-'}</strong>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="tabs-nav">
              <button
                className={`tab-btn ${detailTab === 'profile' ? 'active' : ''}`}
                onClick={() => setDetailTab('profile')}
              >
                <User size={16} />
                <span>Profile Identitas</span>
              </button>
              <button
                className={`tab-btn ${detailTab === 'academic' ? 'active' : ''}`}
                onClick={() => setDetailTab('academic')}
              >
                <BookOpen size={16} />
                <span>Data Akademik</span>
              </button>
              <button
                className={`tab-btn ${detailTab === 'parent' ? 'active' : ''}`}
                onClick={() => setDetailTab('parent')}
              >
                <Heart size={16} />
                <span>Orang Tua / Wali</span>
              </button>
            </div>

            {/* Tab 1: Profile */}
            {detailTab === 'profile' && (
              <div className="form-grid animate-fade-in">
                <div className="form-group">
                  <span className="form-label">NIK (Kependudukan)</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeStudent.nik}</div>
                </div>
                <div className="form-group">
                  <span className="form-label">Jenis Kelamin</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeStudent.gender}</div>
                </div>
                <div className="form-group">
                  <span className="form-label">Tempat & Tanggal Lahir</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.pob},{' '}
                    {new Date(activeStudent.dob).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Nomor Handphone Siswa</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.phone || '-'}
                  </div>
                </div>
                <div className="form-group form-group-full">
                  <span className="form-label">Alamat Lengkap</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {activeStudent.address || '-'}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Academic */}
            {detailTab === 'academic' && (
              <div className="form-grid animate-fade-in">
                <div className="form-group">
                  <span className="form-label">NIS (Nomor Induk Siswa)</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {activeStudent.nis}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">NISN (Nasional)</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {activeStudent.nisn}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Nomor Induk Pokok</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.nomorInduk || '-'}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Tingkat Kelas</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {classes.find((c) => c.id === activeStudent.classId)?.name || '-'}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Rombongan Belajar (Rombel)</span>
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {rombels.find((r) => r.id === activeStudent.rombelId)?.name || '-'}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Tahun Masuk</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.tahunMasuk}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Tahun Ajaran Aktif</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.academicYear}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Status Siswa</span>
                  <div>
                    <StatusBadge status={activeStudent.status} />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Parent/Guardian */}
            {detailTab === 'parent' && (
              <div className="form-grid animate-fade-in">
                <div className="form-group">
                  <span className="form-label">Nama Ayah</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.fatherName}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Nama Ibu</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.motherName}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Nama Wali</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.guardianName || '-'}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Hubungan dengan Wali</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.guardianRelation || '-'}
                  </div>
                </div>
                <div className="form-group">
                  <span className="form-label">Nomor HP Orang Tua</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {activeStudent.parentPhone}
                  </div>
                </div>
                <div className="form-group form-group-full">
                  <span className="form-label">Alamat Orang Tua / Wali</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {activeStudent.parentAddress || '-'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {activeStudent && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Data Siswa"
          message={`Apakah Anda yakin ingin menghapus data siswa "${activeStudent.fullName}" (NIS: ${activeStudent.nis})?`}
          confirmText="Ya, Hapus Siswa"
          variant="danger"
        />
      )}
    </div>
  );
};
