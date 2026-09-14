import React from 'react';
import { Settings, Users, BarChart2 } from 'lucide-react';

const icons = {
  analytics: BarChart2,
  users: Users,
  settings: Settings,
};

const titles = {
  analytics: 'Analytics',
  users: 'Users Management',
  settings: 'Settings',
};

const descriptions = {
  analytics: 'Deep dive into your financial data and custom reports.',
  users: 'Manage team members, roles, and permissions.',
  settings: 'Configure your application preferences and billing details.',
};

export const PlaceholderView: React.FC<{ type: 'analytics' | 'users' | 'settings' }> = ({ type }) => {
  const Icon = icons[type];
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      flex: 1, minHeight: '60vh', textAlign: 'center', color: 'var(--text-muted)'
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        border: '1px solid var(--border-light)', color: 'var(--accent-color)'
      }}>
        <Icon size={28} />
      </div>
      <h2 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>{titles[type]}</h2>
      <p style={{ fontSize: 14, maxWidth: 300, lineHeight: 1.5 }}>{descriptions[type]}</p>
      <button style={{
        marginTop: 24, padding: '8px 16px', borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)',
        fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer'
      }}>
        Coming Soon
      </button>
    </div>
  );
};
