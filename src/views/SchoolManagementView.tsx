import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  UploadCloud,
  Layers,
  Users,
  GraduationCap,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import { School, SchoolLevel, SchoolStatus } from '../types';
import { Card } from '../components/common/Card';
import { Table, Column, Pagination } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

const LEVELS: SchoolLevel[] = ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'MA', 'MTs'];
const STATUSES: SchoolStatus[] = ['Trial', 'Aktif', 'Nonaktif', 'Suspended'];

export const SchoolManagementView: React.FC = () => {
  const {
    schools,
    addSchool,
    updateSchool,
    deleteSchool,
    switchSchool,
    currentSchool,
    isSuperAdmin,
    users,
    students,
    teachersStaff,
  } = useTenantAuth();

  const { success, error } = useToast();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    npsn: '',
    name: '',
    address: '',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    level: 'SMA' as SchoolLevel,
    academicYear: '2026/2027',
    status: 'Aktif' as SchoolStatus,
    phone: '',
    email: '',
    principalName: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered & Paginated schools
  const filteredSchools = useMemo(() => {
    return schools.filter((sch) => {
      const matchSearch =
        sch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.npsn.includes(searchTerm) ||
        sch.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLevel = selectedLevel === 'all' || sch.level === selectedLevel;
      const matchStatus = selectedStatus === 'all' || sch.status === selectedStatus;
      return matchSearch && matchLevel && matchStatus;
    });
  }, [schools, searchTerm, selectedLevel, selectedStatus]);

  const totalPages = Math.ceil(filteredSchools.length / pageSize) || 1;
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchools.slice(start, start + pageSize);
  }, [filteredSchools, currentPage, pageSize]);

  // Handlers
  const handleOpenAdd = () => {
    setActiveSchool(null);
    setFormData({
      npsn: '',
      name: '',
      address: '',
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
      level: 'SMA',
      academicYear: '2026/2027',
      status: 'Aktif',
      phone: '',
      email: '',
      principalName: '',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (sch: School) => {
    setActiveSchool(sch);
    setFormData({
      npsn: sch.npsn,
      name: sch.name,
      address: sch.address,
      logo: sch.logo,
      level: sch.level,
      academicYear: sch.academicYear,
      status: sch.status,
      phone: sch.phone || '',
      email: sch.email || '',
      principalName: sch.principalName || '',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenDetail = (sch: School) => {
    setActiveSchool(sch);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (sch: School) => {
    setActiveSchool(sch);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (sch: School) => {
    const newStatus: SchoolStatus = sch.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    updateSchool(sch.id, { status: newStatus });
    success(
      'Status Diperbarui',
      `Sekolah ${sch.name} sekarang berstatus ${newStatus}.`
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.npsn.trim()) errors.npsn = 'NPSN wajib diisi';
    else if (!/^\d{8}$/.test(formData.npsn.trim())) {
      errors.npsn = 'NPSN harus berupa 8 digit angka';
    }

    if (!formData.name.trim()) errors.name = 'Nama Sekolah wajib diisi';
    if (!formData.address.trim()) errors.address = 'Alamat wajib diisi';
    if (!formData.academicYear.trim()) errors.academicYear = 'Tahun Ajaran wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (activeSchool) {
        updateSchool(activeSchool.id, formData);
        success('Sekolah Berhasil Diperbarui', `Data ${formData.name} telah disimpan.`);
      } else {
        const newSch = addSchool(formData);
        success(
          'Sekolah Berhasil Ditambahkan',
          `${formData.name} terdaftar sebagai tenant baru dengan struktur akademik awal.`
        );
      }
      setIsSubmitting(false);
      setIsAddEditModalOpen(false);
    }, 400);
  };

  const handleDeleteConfirm = () => {
    if (!activeSchool) return;
    deleteSchool(activeSchool.id);
    setIsDeleteModalOpen(false);
    success('Sekolah Dihapus', `Data tenant ${activeSchool.name} dan seluruh entitas terkait telah dihapus.`);
  };

  // Table columns definition
  const columns: Column<School>[] = [
    {
      header: 'Sekolah & NPSN',
      width: '30%',
      render: (sch) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#f1f5f9',
              border: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            <img
              src={sch.logo}
              alt={sch.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as any).src =
                  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
              {sch.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              NPSN: <span style={{ fontFamily: 'var(--font-mono)' }}>{sch.npsn}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Jenjang',
      render: (sch) => (
        <span
          style={{
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'var(--bg-surface-subtle)',
            fontWeight: 700,
            fontSize: '0.78rem',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {sch.level}
        </span>
      ),
    },
    {
      header: 'Tahun Ajaran',
      accessor: 'academicYear',
    },
    {
      header: 'Alamat',
      render: (sch) => (
        <div
          style={{
            maxWidth: '220px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
          }}
          title={sch.address}
        >
          {sch.address}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (sch) => <StatusBadge status={sch.status} />,
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (sch) => (
        <div className="table-actions">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDetail(sch)}
            title="Lihat Detail Sekolah"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenEdit(sch)}
            title="Edit Sekolah"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleToggleStatus(sch)}
            title={sch.status === 'Aktif' ? 'Nonaktifkan Sekolah' : 'Aktifkan Sekolah'}
          >
            {sch.status === 'Aktif' ? (
              <XCircle size={16} color="#ef4444" />
            ) : (
              <CheckCircle size={16} color="#10b981" />
            )}
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDelete(sch)}
            title="Hapus Sekolah"
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
            <Building2 size={26} color="var(--color-primary)" />
            School / Tenant Management
          </h1>
          <p>
            Kelola instansi sekolah yang terdaftar pada platform SaaS. Setiap sekolah terisolasi
            sebagai tenant mandiri.
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenAdd}
          >
            Tambah Sekolah
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
              placeholder="Cari berdasarkan nama sekolah, NPSN, atau alamat..."
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
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Jenjang</option>
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
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
              {STATUSES.map((st) => (
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
          data={paginatedSchools}
          keyExtractor={(sch) => sch.id}
          emptyState={
            <EmptyState
              title="Tidak ada sekolah ditemukan"
              description="Coba ubah kata kunci pencarian atau sesuaikan filter jenjang dan status."
              actionText="Tambah Sekolah Baru"
              onAction={handleOpenAdd}
            />
          }
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSchools.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal Add / Edit School */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={activeSchool ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}
        subtitle="Form registrasi profil dan konfigurasi tenant sekolah"
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
            <Button
              variant="primary"
              onClick={handleFormSubmit}
              loading={isSubmitting}
            >
              {activeSchool ? 'Simpan Perubahan' : 'Daftarkan Sekolah'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">
              NPSN (Nomor Pokok Sekolah Nasional) <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 20103456"
              maxLength={8}
              value={formData.npsn}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value.replace(/\D/g, '') })}
            />
            {formErrors.npsn && <span className="form-error-msg">{formErrors.npsn}</span>}
            <span className="form-helper">Harus 8 digit angka resmi Kemdikbud</span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Nama Sekolah <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: SMA Garuda Nusantara"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Jenjang Pendidikan <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as SchoolLevel })}
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Tahun Ajaran Awal <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 2026/2027"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />
            {formErrors.academicYear && (
              <span className="form-error-msg">{formErrors.academicYear}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Status Tenant <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SchoolStatus })}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Kepala Sekolah</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Dr. Bambang Soeprapto, M.Pd."
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Telepon Sekolah</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 021-72890123"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Sekolah</label>
            <input
              type="email"
              className="form-input"
              placeholder="Contoh: info@sekolah.sch.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Logo Upload Simulation */}
          <div className="form-group form-group-full">
            <label className="form-label">Logo Sekolah</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  background: '#f8fafc',
                  flexShrink: 0,
                }}
              >
                <img
                  src={formData.logo}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="URL Gambar Logo (atau pilih upload di bawah)"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                />
                <div style={{ marginTop: '6px' }}>
                  <label
                    className="btn btn-outline btn-sm"
                    style={{ cursor: 'pointer', display: 'inline-flex' }}
                  >
                    <UploadCloud size={14} />
                    <span>Upload Logo Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({ ...prev, logo: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">
              Alamat Lengkap <span className="form-required">*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Alamat lengkap lokasi sekolah..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            {formErrors.address && <span className="form-error-msg">{formErrors.address}</span>}
          </div>
        </form>
      </Modal>

      {/* Modal School Detail */}
      {activeSchool && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={activeSchool.name}
          subtitle={`Detail Informasi Tenant • NPSN: ${activeSchool.npsn}`}
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
              <Button
                variant="primary"
                icon={<ExternalLink size={16} />}
                onClick={() => {
                  switchSchool(activeSchool.id);
                  setIsDetailModalOpen(false);
                  success(
                    'Konteks Tenant Dipilih',
                    `Sekarang Anda berada dalam konteks tenant ${activeSchool.name}.`
                  );
                }}
              >
                Masuk ke Tenant Ini
              </Button>
            </>
          }
        >
          <div>
            {/* Header Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={activeSchool.logo}
                  alt={activeSchool.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {activeSchool.name}
                  </h2>
                  <StatusBadge status={activeSchool.status} />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Jenjang: <strong>{activeSchool.level}</strong> • Tahun Ajaran:{' '}
                  <strong>{activeSchool.academicYear}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                  Tenant ID: {activeSchool.id} • Dibuat pada:{' '}
                  {new Date(activeSchool.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {students.filter((s) => s.school_id === activeSchool.id).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Siswa Terdaftar</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                  {teachersStaff.filter((t) => t.school_id === activeSchool.id && t.type === 'Guru').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guru Aktif</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed' }}>
                  {users.filter((u) => u.school_id === activeSchool.id).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User Akun</div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="form-grid">
              <div className="form-group">
                <span className="form-label">Kepala Sekolah</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {activeSchool.principalName || '-'}
                </div>
              </div>
              <div className="form-group">
                <span className="form-label">NPSN</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {activeSchool.npsn}
                </div>
              </div>
              <div className="form-group">
                <span className="form-label">Telepon</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {activeSchool.phone || '-'}
                </div>
              </div>
              <div className="form-group">
                <span className="form-label">Email</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {activeSchool.email || '-'}
                </div>
              </div>
              <div className="form-group form-group-full">
                <span className="form-label">Alamat Lengkap</span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {activeSchool.address}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {activeSchool && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Konfirmasi Hapus Sekolah"
          message={`Apakah Anda yakin ingin menghapus data sekolah "${activeSchool.name}" (NPSN: ${activeSchool.npsn})? Seluruh data pengguna, siswa, guru, dan kelas pada tenant ini akan ikut terhapus secara permanen.`}
          confirmText="Ya, Hapus Tenant Sekolah"
          variant="danger"
        />
      )}
    </div>
  );
};
