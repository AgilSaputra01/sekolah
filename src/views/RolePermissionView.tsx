import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Plus,
  Edit2,
  Check,
  X,
  Sliders,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import { useTenantAuth } from '../context/TenantAuthContext';
import { useToast } from '../context/ToastContext';
import { RoleDefinition, ModuleType, ActionType, UserRole } from '../types';
import { ALL_MODULES, ALL_ACTIONS, createEmptyPermissionMatrix } from '../services/mockData';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const RolePermissionView: React.FC = () => {
  const { roles, updateRolePermissions, addRole, users, isSuperAdmin } = useTenantAuth();
  const { success, warning } = useToast();

  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(roles[1] || roles[0]);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Calculate permissions count
  const countPermissions = (role: RoleDefinition) => {
    let count = 0;
    ALL_MODULES.forEach((mod) => {
      ALL_ACTIONS.forEach((act) => {
        if (role.permissions[mod]?.[act]) {
          count++;
        }
      });
    });
    return count;
  };

  const handleTogglePermission = (
    role: RoleDefinition,
    module: ModuleType,
    action: ActionType
  ) => {
    if (role.name === 'Super Admin') {
      warning('Super Admin dilindungi', 'Hak akses Super Admin selalu penuh dan tidak dapat dikurangi.');
      return;
    }

    const currentVal = !!role.permissions[module]?.[action];
    updateRolePermissions(role.id, module, action, !currentVal);
    success(
      'Permission Diperbarui',
      `Hak akses ${module} - ${action} untuk ${role.name} ${!currentVal ? 'diberikan' : 'dicabut'}.`
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole = addRole({
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Role kustom dengan izin modular.',
      isSystem: false,
      permissions: createEmptyPermissionMatrix(),
      status: 'Aktif',
    });

    setIsAddRoleModalOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedRole(newRole);
    success('Role Baru Dibuat', `Role ${newRole.name} berhasil dibuat. Silakan atur matriks permission-nya.`);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={26} color="var(--color-primary)" />
            Role & Permission Matrix
          </h1>
          <p>
            Sistem otorisasi modular berbasis kombinasi <strong>Module + Action</strong> (View,
            Create, Edit, Delete, Approve).
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddRoleModalOpen(true)}
          >
            Tambah Role Baru
          </Button>
        </div>
      </div>

      {/* Grid: Left Role List, Right Permission Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '24px' }}>
        {/* Left: Role List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', paddingLeft: '4px' }}>
            Daftar Role ({roles.length})
          </div>

          {roles.map((role) => {
            const isSelected = selectedRole.id === role.id;
            const userCount = users.filter((u) => u.role === role.name).length;
            const permCount = countPermissions(role);

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-subtle)',
                  background: isSelected ? '#f5f3ff' : '#ffffff',
                  boxShadow: isSelected ? '0 0 0 2px var(--color-primary)' : 'var(--shadow-xs)',
                  transition: 'all 0.2s ease',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} color={isSelected ? 'var(--color-primary)' : '#64748b'} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {role.name}
                    </span>
                  </div>
                  {role.isSystem && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        borderRadius: '4px',
                      }}
                    >
                      System
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    marginBottom: '12px',
                  }}
                >
                  {role.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: '8px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>
                    Permissions: <strong style={{ color: 'var(--color-primary)' }}>{permCount}</strong>/55
                  </span>
                  <span>
                    Pengguna: <strong style={{ color: 'var(--text-main)' }}>{userCount}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Permission Matrix Table */}
        <div>
          <Card
            title={`Matriks Permission: ${selectedRole.name}`}
            subtitle={selectedRole.description}
            icon={<Sliders size={20} color="var(--color-primary)" />}
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Aktif: <strong>{countPermissions(selectedRole)}</strong> Izin
                </span>
              </div>
            }
            noPadding
          >
            <div className="table-responsive">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>Modul Sistem</th>
                    {ALL_ACTIONS.map((act) => (
                      <th key={act} style={{ width: '13.6%' }}>
                        {act}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map((module) => {
                    return (
                      <tr key={module}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{module}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                              Akses data modul {module.toLowerCase()}
                            </span>
                          </div>
                        </td>
                        {ALL_ACTIONS.map((action) => {
                          const isChecked = !!selectedRole.permissions[module]?.[action];
                          const isSuper = selectedRole.name === 'Super Admin';

                          return (
                            <td key={action}>
                              <input
                                type="checkbox"
                                className="matrix-checkbox"
                                checked={isChecked}
                                disabled={isSuper}
                                onChange={() => handleTogglePermission(selectedRole, module, action)}
                                title={`${selectedRole.name} • ${module} - ${action}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: '16px 20px',
                background: '#f8fafc',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Info size={16} color="var(--color-primary)" />
              <span>
                Perubahan pada matriks ini langsung berdampak real-time terhadap visibilitas menu sidebar
                dan wewenang aksi pada seluruh pengguna dengan role{' '}
                <strong>{selectedRole.name}</strong>.
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Add Custom Role */}
      <Modal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        title="Tambah Role Baru"
        subtitle="Buat role wewenang khusus untuk struktur sekolah"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddRoleModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleCreateRole}>
              Buat Role
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">
              Nama Role <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Koordinator Kurikulum / Pembina OSIS"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi Tanggung Jawab</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Deskripsikan wewenang peran ini..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
