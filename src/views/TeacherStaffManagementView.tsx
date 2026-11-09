import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  UserCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Download,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCSV } from '../utils/exportUtils';
import { TeacherStaff, StaffType } from '../types';
import { Card } from '../components/common/Card';
import { Table, Column, Pagination } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

interface TeacherStaffProps {
  initialType?: StaffType;
}

export const TeacherStaffManagementView: React.FC<TeacherStaffProps> = ({
  initialType = 'Guru',
}) => {
  const { teachersStaff, rombels, addTeacherStaff, updateTeacherStaff, deleteTeacherStaff } =
    useTenantAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<StaffType>(initialType);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<TeacherStaff | null>(null);

  // Form states
  const defaultFormData = {
    type: activeTab,
    fullName: '',
    nik: '',
    nip: '',
    email: '',
    phone: '',
    address: '',
    position: activeTab === 'Guru' ? 'Guru Mata Pelajaran' : 'Staff Administrasi',
    subjectsInput: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
    joinDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter list by tab, search, status
  const filteredList = useMemo(() => {
    return teachersStaff.filter((item) => {
      const matchType = item.type === activeTab;
      const matchSearch =
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip.includes(searchTerm) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchType && matchSearch && matchStatus;
    });
  }, [teachersStaff, activeTab, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Handlers
  const handleOpenAdd = () => {
    setActiveStaff(null);
    setFormData({
      ...defaultFormData,
      type: activeTab,
      position: activeTab === 'Guru' ? 'Guru Mata Pelajaran' : 'Staff Administrasi',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (item: TeacherStaff) => {
    setActiveStaff(item);
    setFormData({
      type: item.type,
      fullName: item.fullName,
      nik: item.nik,
      nip: item.nip,
      email: item.email,
      phone: item.phone,
      address: item.address,
      position: item.position,
      subjectsInput: item.subjects ? item.subjects.join(', ') : '',
      status: item.status,
      joinDate: item.joinDate,
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenDetail = (item: TeacherStaff) => {
    setActiveStaff(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (item: TeacherStaff) => {
    setActiveStaff(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (item: TeacherStaff) => {
    const newStatus = item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    updateTeacherStaff(item.id, { status: newStatus });
    success('Status Diperbarui', `${item.fullName} sekarang ${newStatus}.`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.nik.trim()) errors.nik = 'NIK wajib diisi';
    if (!formData.nip.trim()) errors.nip = 'NIP / NUPTK wajib diisi';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi';
    if (!formData.position.trim()) errors.position = 'Jabatan wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const subjects =
        formData.type === 'Guru' && formData.subjectsInput
          ? formData.subjectsInput
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      if (activeStaff) {
        updateTeacherStaff(activeStaff.id, {
          type: formData.type,
          fullName: formData.fullName,
          nik: formData.nik,
          nip: formData.nip,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          position: formData.position,
          subjects,
          status: formData.status,
          joinDate: formData.joinDate,
        });
        success('Data Diperbarui', `Profil ${formData.fullName} berhasil diperbarui.`);
      } else {
        addTeacherStaff({
          type: formData.type,
          fullName: formData.fullName,
          nik: formData.nik,
          nip: formData.nip,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          position: formData.position,
          subjects,
          status: formData.status,
          joinDate: formData.joinDate,
        });
        success(
          `${formData.type} Ditambahkan`,
          `${formData.fullName} berhasil terdaftar dalam sistem.`
        );
      }
      setIsSubmitting(false);
      setIsAddEditModalOpen(false);
    }, 350);
  };

  const handleDeleteConfirm = () => {
    if (!activeStaff) return;
    deleteTeacherStaff(activeStaff.id);
    setIsDeleteModalOpen(false);
    success('Data Dihapus', `${activeStaff.fullName} telah dihapus dari sistem.`);
  };

  // Columns
  const columns: Column<TeacherStaff>[] = [
    {
      header: 'Nama & NIP',
      width: '30%',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">
            {item.avatar ? <img src={item.avatar} alt={item.fullName} /> : item.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {item.fullName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              NIP: <span style={{ fontFamily: 'var(--font-mono)' }}>{item.nip}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Jabatan / Tugas',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
            {item.position}
          </div>
          {item.type === 'Guru' && item.subjects && item.subjects.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '2px' }}>
              {item.subjects.join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Kontak',
      render: (item) => (
        <div style={{ fontSize: '0.82rem' }}>
          <div>{item.email}</div>
          <div style={{ color: 'var(--text-muted)' }}>{item.phone || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Wali Kelas',
      render: (item) => {
        if (item.type !== 'Guru') return <span style={{ color: 'var(--text-muted)' }}>-</span>;
        const rombel = rombels.find((r) => r.homeroomTeacherId === item.id);
        return rombel ? (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#ecfdf5',
              color: '#065f46',
              fontWeight: 700,
              fontSize: '0.78rem',
              border: '1px solid #a7f3d0',
            }}
          >
            {rombel.name}
          </span>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bukan Wali</span>
        );
      },
    },
    {
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (item) => (
        <div className="table-actions">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDetail(item)}
            title="Lihat Detail"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenEdit(item)}
            title="Edit Profil"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleToggleStatus(item)}
            title={item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {item.status === 'Aktif' ? (
              <XCircle size={16} color="#ef4444" />
            ) : (
              <CheckCircle size={16} color="#10b981" />
            )}
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDelete(item)}
            title="Hapus"
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
            {activeTab === 'Guru' ? (
              <Briefcase size={26} color="var(--color-primary)" />
            ) : (
              <UserCheck size={26} color="var(--color-primary)" />
            )}
            {activeTab === 'Guru' ? 'Teacher Management' : 'Staff Management'}
          </h1>
          <p>
            Kelola data pendidik (Guru) dan tenaga kependidikan (Staff/TU) yang bertugas di sekolah.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={() => {
              const exportData = filteredList.map((t) => ({
                Tipe: t.type,
                'Nama Lengkap': t.fullName,
                NIP: t.nip,
                NIK: t.nik,
                Jabatan: t.position,
                'Mata Pelajaran': t.subjects ? t.subjects.join(', ') : '-',
                Email: t.email,
                Telepon: t.phone || '-',
                Status: t.status,
                'Tanggal Bergabung': t.joinDate,
              }));
              exportToCSV(exportData, `Data_${activeTab}_EduCore`);
              success('Export Berhasil', `Data ${activeTab} berhasil diekspor ke CSV!`);
            }}
          >
            Export CSV
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Tambah {activeTab}
          </Button>
        </div>
      </div>

      {/* Tabs between Teachers and Staff */}
      <div className="tabs-nav" style={{ marginBottom: '16px' }}>
        <button
          className={`tab-btn ${activeTab === 'Guru' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Guru');
            setCurrentPage(1);
          }}
        >
          <Briefcase size={16} />
          <span>
            Tenaga Pendidik / Guru ({teachersStaff.filter((t) => t.type === 'Guru').length})
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'Staff' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Staff');
            setCurrentPage(1);
          }}
        >
          <UserCheck size={16} />
          <span>
            Tenaga Kependidikan / Staff ({teachersStaff.filter((t) => t.type === 'Staff').length})
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <Card noPadding>
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="toolbar-search">
            <Search size={16} className="toolbar-search-icon" />
            <input
              type="text"
              placeholder={`Cari nama ${activeTab.toLowerCase()}, NIP, email, atau jabatan...`}
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
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={paginatedList}
          keyExtractor={(item) => item.id}
          emptyState={
            <EmptyState
              title={`Tidak ada data ${activeTab.toLowerCase()} ditemukan`}
              description={`Belum ada data ${activeTab.toLowerCase()} yang sesuai dengan kriteria filter.`}
              actionText={`Tambah ${activeTab} Baru`}
              onAction={handleOpenAdd}
            />
          }
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={activeStaff ? `Edit Data ${formData.type}` : `Tambah ${formData.type} Baru`}
        subtitle="Form registrasi profil kepegawaian sekolah"
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
              {activeStaff ? 'Simpan Perubahan' : 'Daftarkan Profil'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Tipe Kepegawaian <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as StaffType })}
            >
              <option value="Guru">Tenaga Pendidik (Guru)</option>
              <option value="Staff">Tenaga Kependidikan (Staff/TU)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Status Keaktifan <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">
              Nama Lengkap & Gelar <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Siti Rahmawati, M.Pd."
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            {formErrors.fullName && <span className="form-error-msg">{formErrors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              NIK (16 Digit) <span className="form-required">*</span>
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
              NIP / NUPTK <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 198204152006042003"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
            {formErrors.nip && <span className="form-error-msg">{formErrors.nip}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Jabatan / Posisi <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Guru Matematika Senior / Kepala TU"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            {formErrors.position && <span className="form-error-msg">{formErrors.position}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Bergabung</label>
            <input
              type="date"
              className="form-input"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>

          {formData.type === 'Guru' && (
            <div className="form-group form-group-full">
              <label className="form-label">Mata Pelajaran yang Diampu</label>
              <input
                type="text"
                className="form-input"
                placeholder="Pisahkan dengan koma, contoh: Matematika Wajib, Matematika Peminatan"
                value={formData.subjectsInput}
                onChange={(e) => setFormData({ ...formData, subjectsInput: e.target.value })}
              />
              <span className="form-helper">Mata pelajaran utama yang diajarkan oleh guru</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Email Resmi <span className="form-required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Contoh: siti@smagaruda.sch.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {formErrors.email && <span className="form-error-msg">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Nomor Handphone / WhatsApp</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 081388776655"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">Alamat Domisili</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Alamat tempat tinggal saat ini..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Detail */}
      {activeStaff && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={activeStaff.fullName}
          subtitle={`Detail Kepegawaian • ${activeStaff.type}`}
          size="md"
          footer={
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          }
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              className="user-avatar"
              style={{
                width: '76px',
                height: '76px',
                margin: '0 auto 12px',
                fontSize: '1.6rem',
              }}
            >
              {activeStaff.avatar ? (
                <img src={activeStaff.avatar} alt={activeStaff.fullName} />
              ) : (
                activeStaff.fullName.charAt(0)
              )}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {activeStaff.fullName}
            </h3>
            <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
              {activeStaff.position}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
              <StatusBadge status={activeStaff.status} />
              {activeStaff.type === 'Guru' && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    fontWeight: 600,
                  }}
                >
                  Tenaga Pendidik
                </span>
              )}
            </div>
          </div>

          <div className="form-grid" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div className="form-group">
              <span className="form-label">NIP</span>
              <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {activeStaff.nip}
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">NIK</span>
              <div style={{ fontWeight: 600 }}>{activeStaff.nik}</div>
            </div>
            <div className="form-group">
              <span className="form-label">Email</span>
              <div style={{ fontWeight: 600 }}>{activeStaff.email}</div>
            </div>
            <div className="form-group">
              <span className="form-label">Nomor Handphone</span>
              <div style={{ fontWeight: 600 }}>{activeStaff.phone || '-'}</div>
            </div>
            {activeStaff.type === 'Guru' && (
              <div className="form-group form-group-full">
                <span className="form-label">Mata Pelajaran Diampu</span>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {activeStaff.subjects?.join(', ') || '-'}
                </div>
              </div>
            )}
            <div className="form-group">
              <span className="form-label">Tanggal Bergabung</span>
              <div style={{ fontWeight: 600 }}>
                {new Date(activeStaff.joinDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
            <div className="form-group form-group-full">
              <span className="form-label">Alamat Lengkap</span>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {activeStaff.address || '-'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {activeStaff && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={`Hapus Data ${activeStaff.type}`}
          message={`Apakah Anda yakin ingin menghapus data ${activeStaff.type.toLowerCase()} "${activeStaff.fullName}" (NIP: ${activeStaff.nip})?`}
          confirmText="Ya, Hapus Data"
          variant="danger"
        />
      )}
    </div>
  );
};
