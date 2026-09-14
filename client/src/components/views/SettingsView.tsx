import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { authApi } from '../../api/auth';
import styles from '../table/TransactionsTable.module.css';

export const SettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showAlert } = useAlert();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({ name, email });
      updateUser(updated);
      showAlert('success', 'Profile updated successfully');
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert('error', 'New passwords do not match');
      return;
    }
    setIsSavingPassword(true);
    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      showAlert('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', maxWidth: 600 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Profile Settings</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Update your personal account details.</p>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-24)' }}>
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              className={styles.filterInput} 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Email Address</label>
            <input 
              type="email"
              className={styles.filterInput} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <button 
              type="submit"
              disabled={isSavingProfile}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', fontWeight: 500, cursor: 'pointer', opacity: isSavingProfile ? 0.7 : 1 }}
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Change Password</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Update your password to keep your account secure.</p>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-24)' }}>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Current Password</label>
            <input 
              type="password"
              className={styles.filterInput} 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>New Password</label>
            <input 
              type="password"
              className={styles.filterInput} 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required
              minLength={6}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Confirm New Password</label>
            <input 
              type="password"
              className={styles.filterInput} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
              minLength={6}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <button 
              type="submit"
              disabled={isSavingPassword}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-color)', color: 'white', border: 'none', fontWeight: 500, cursor: 'pointer', opacity: isSavingPassword ? 0.7 : 1 }}
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
