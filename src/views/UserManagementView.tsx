import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Building,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import { User, UserRole, UserStatus } from '../types';
import { Card } from '../components/common/Card';
import { Table, Column, Pagination } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { StatusBadge, RoleBadge } from '../components/common/Badge';
import { Modal, ConfirmModal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

const ROLES: UserRole[] = [
  'Admin Sekolah',
  'Kepala Sekolah',
  'Guru',
  'Staff',
  'Siswa',
  'Orang Tua/Wali',
  'Super Admin',
];

export const UserManagementView: React.FC = () => {
  const {
    users,
    allSchools,
    currentSchool,
    isSuperAdmin,
    addUser,
    updateUser,
    deleteUser,
  } = useTenantAuth();

  const { success } = useToast();

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Guru' as UserRole,
    school_id: currentSchool ? currentSchool.id : (allSchools[0]?.id || ''),
    status: 'Aktif' as UserStatus,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);
      const matchRole = selectedRole === 'all' || u.role === selectedRole;
      const matchSchool =
        selectedSchool === 'all' ||
        (selectedSchool === 'none' ? !u.school_id : u.school_id === selectedSchool);
      const matchStatus = selectedStatus === 'all' || u.status === selectedStatus;

      return matchSearch && matchRole && matchSchool && matchStatus;
    });
  }, [users, searchTerm, selectedRole, selectedSchool, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Handlers
  const handleOpenAdd = () => {
    setActiveUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Guru',
      school_id: currentSchool ? currentSchool.id : (allSchools[0]?.id || ''),
      status: 'Aktif',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setActiveUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      school_id: u.school_id || '',
      status: u.status,
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  const handleOpenDetail = (u: User) => {
    setActiveUser(u);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (u: User) => {
    setActiveUser(u);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = (u: User) => {
    const newStatus: UserStatus = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    updateUser(u.id, { status: newStatus });
    success('Status Diperbarui', `Akun ${u.name} sekarang ${newStatus}.`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid';
    }
    if (!formData.phone.trim()) errors.phone = 'Nomor HP wajib diisi';

    if (formData.role !== 'Super Admin' && !formData.school_id) {
      errors.school_id = 'Pilih sekolah untuk user ini';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (activeUser) {
        updateUser(activeUser.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          school_id: formData.role === 'Super Admin' ? null : formData.school_id,
          status: formData.status,
        });
        success('User Diperbarui', `Data akun ${formData.name} telah disimpan.`);
      } else {
        addUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          school_id: formData.role === 'Super Admin' ? null : formData.school_id,
          status: formData.status,
        });
        success('User Ditambahkan', `Akun baru ${formData.name} berhasil dibuat.`);
      }
      setIsSubmitting(false);
      setIsAddEditModalOpen(false);
    }, 350);
  };

  const handleDeleteConfirm = () => {
    if (!activeUser) return;
    deleteUser(activeUser.id);
    setIsDeleteModalOpen(false);
    success('User Dihapus', `Akun ${activeUser.name} telah dihapus.`);
  };

  // Columns definition
  const columns: Column<User>[] = [
    {
      header: 'Nama & Email',
      width: '28%',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="user-avatar">
            {u.avatar ? <img src={u.avatar} alt={u.name} /> : u.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {u.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (u) => <RoleBadge role={u.role} />,
    },
    {
      header: 'Sekolah Tenant',
      render: (u) => {
        if (!u.school_id) {
          return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Global (Semua)</span>;
        }
        const sch = allSchools.find((s) => s.id === u.school_id);
        return (
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {sch ? sch.name : u.school_id}
          </span>
        );
      },
    },
    {
      header: 'Nomor HP',
      accessor: 'phone',
    },
    {
      header: 'Status',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      header: 'Created Date',
      render: (u) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {new Date(u.createdAt).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (u) => (
        <div className="table-actions">
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDetail(u)}
            title="Lihat Detail User"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenEdit(u)}
            title="Edit User"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleToggleStatus(u)}
            title={u.status === 'Aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
          >
            {u.status === 'Aktif' ? (
              <XCircle size={16} color="#ef4444" />
            ) : (
              <CheckCircle size={16} color="#10b981" />
            )}
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => handleOpenDelete(u)}
            title="Hapus User"
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
            <Users size={26} color="var(--color-primary)" />
            User Management
          </h1>
          <p>
            Kelola data seluruh akun pengguna sekolah (Admin Sekolah, Kepala Sekolah, Guru, Staff,
            Siswa, Orang Tua).
          </p>
        </div>
        <div className="page-actions">
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Tambah User
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
              placeholder="Cari nama, email, atau nomor HP pengguna..."
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
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {isSuperAdmin && (
              <select
                className="filter-select"
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Semua Sekolah</option>
                <option value="none">Global (Super Admin)</option>
                {allSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

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
          data={paginatedUsers}
          keyExtractor={(u) => u.id}
          emptyState={
            <EmptyState
              title="Tidak ada pengguna ditemukan"
              description="Coba ubah kata kunci pencarian atau sesuaikan filter role dan status."
              actionText="Tambah User Baru"
              onAction={handleOpenAdd}
            />
          }
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal Add / Edit User */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={activeUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
        subtitle="Form pembuatan dan pengelolaan kredensial akun pengguna"
        size="md"
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
              {activeUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="form-grid">
          <div className="form-group form-group-full">
            <label className="form-label">
              Nama Lengkap & Gelar <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Deni Kurniawan, S.Kom."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Pengguna <span className="form-required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="Contoh: deni@smagaruda.sch.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {formErrors.email && <span className="form-error-msg">{formErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Nomor Handphone / WhatsApp <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: 081298765432"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {formErrors.phone && <span className="form-error-msg">{formErrors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Role Pengguna <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Sekolah Tenant <span className="form-required">*</span>
            </label>
            <select
              className="form-select"
              value={formData.school_id}
              onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
              disabled={formData.role === 'Super Admin'}
            >
              {formData.role === 'Super Admin' && (
                <option value="">Global (Tidak terikat tenant)</option>
              )}
              {allSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.level})
                </option>
              ))}
            </select>
            {formErrors.school_id && (
              <span className="form-error-msg">{formErrors.school_id}</span>
            )}
          </div>

          <div className="form-group form-group-full">
            <label className="form-label">Status Akun</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal User Detail */}
      {activeUser && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Detail Profil Pengguna"
          subtitle={`ID: ${activeUser.id}`}
          size="sm"
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
                width: '72px',
                height: '72px',
                margin: '0 auto 12px',
                fontSize: '1.6rem',
              }}
            >
              {activeUser.avatar ? (
                <img src={activeUser.avatar} alt={activeUser.name} />
              ) : (
                activeUser.name.charAt(0)
              )}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {activeUser.name}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
              <RoleBadge role={activeUser.role} />
              <StatusBadge status={activeUser.status} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{activeUser.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{activeUser.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                {activeUser.school_id
                  ? allSchools.find((s) => s.id === activeUser.school_id)?.name || activeUser.school_id
                  : 'Platform Super Admin (Semua Tenant)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Terdaftar: {new Date(activeUser.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {activeUser && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Akun Pengguna"
          message={`Apakah Anda yakin ingin menghapus akun "${activeUser.name}" (${activeUser.email})? Pengguna ini tidak akan dapat login kembali.`}
          confirmText="Ya, Hapus Akun"
          variant="danger"
        />
      )}
    </div>
  );
};
