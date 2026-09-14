import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/users';
import type { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { Trash2, Edit2, ShieldAlert } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        // Handled by role check below
      } else {
        showAlert('error', 'Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      showAlert('success', 'User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <ShieldAlert size={48} style={{ marginBottom: 16, color: 'var(--text-muted)' }} />
        <h2>Access Denied</h2>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>User Management</h2>
        <button 
          style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', fontWeight: 500, cursor: 'pointer' }}
          onClick={() => alert('Add User Modal Coming Soon!')}
        >
          Add User
        </button>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)' }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                      backgroundColor: u.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: u.role === 'admin' ? '#4F46E5' : '#6B7280'
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => alert('Edit User Modal Coming Soon!')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginRight: 12 }}>
                      <Edit2 size={16} />
                    </button>
                    {u.id !== user.id && (
                      <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
