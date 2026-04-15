import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

export default function AdminUsers() {
  const { users, setUsers } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'citizen_dev' | 'admin'>('all');
  const [newUser, setNewUser] = useState({ name: '', email: '', team: '', role: 'citizen_dev' as 'citizen_dev' | 'admin' });

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const promoteToAdmin = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.team) return;
    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      team: newUser.team,
      role: newUser.role,
      avatar: newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', team: '', role: 'citizen_dev' });
    setShowAddModal(false);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    pending: users.filter(u => u.status === 'pending').length,
  };

  return (
    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
      <div style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.10em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(159,232,112,0.12)', border: '1px solid rgba(159,232,112,0.30)', color: '#3a7a1a' }}>Phase 1 — Foundation</span>
            </div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '4px' }}>User Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage platform access for citizen developers and admins</p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 18px', background: '#9FE870', border: 'none', borderRadius: '6px', color: '#0a0a0a', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            + Add User
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: stats.total, color: 'var(--accent-blue)' },
            { label: 'Active', value: stats.active, color: 'var(--accent-green)' },
            { label: 'Admins', value: stats.admins, color: 'var(--accent-purple)' },
            { label: 'Pending', value: stats.pending, color: 'var(--accent-orange)' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 16px' }}>
              <div style={{ color: stat.color, fontSize: '26px', fontWeight: '800', fontFamily: 'monospace' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <input
            type="text" placeholder="Search users..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
          />
          {(['all', 'citizen_dev', 'admin'] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)} style={{
              padding: '7px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
              background: filterRole === r ? 'var(--accent-green-dim)' : 'var(--bg-secondary)',
              border: `1px solid ${filterRole === r ? 'var(--accent-green)' : 'var(--border-color)'}`,
              color: filterRole === r ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {r === 'all' ? 'All' : r === 'admin' ? 'Admins' : 'Citizen Devs'}
            </button>
          ))}
        </div>

        {/* User Table */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['User', 'Team', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const roleColor = user.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-green)';
                const statusColor = user.status === 'active' ? 'var(--accent-green)' : user.status === 'pending' ? 'var(--accent-orange)' : 'var(--accent-red)';
                return (
                  <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', opacity: user.status === 'suspended' ? 0.6 : 1 }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${roleColor}22`, border: `1px solid ${roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor, fontWeight: '700', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                          {user.avatar}
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '500' }}>{user.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{user.team}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: `${roleColor}22`, color: roleColor, fontFamily: 'JetBrains Mono, monospace' }}>
                        {user.role === 'admin' ? 'Admin' : 'Citizen Dev'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, display: 'inline-block' }} className={user.status === 'active' ? 'pulse-green' : ''}></span>
                        <span style={{ color: statusColor, fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>{user.joinedAt}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => toggleStatus(user.id)} style={{ padding: '4px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}>
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        {user.role === 'citizen_dev' && (
                          <button onClick={() => promoteToAdmin(user.id)} style={{ padding: '4px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--accent-purple)', fontSize: '11px', cursor: 'pointer' }}>
                            Make Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '28px', width: '420px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Add New User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. Alex Johnson' },
                { label: 'Email', key: 'email', placeholder: 'alex.johnson@klaviyo.com' },
                { label: 'Team', key: 'team', placeholder: 'e.g. Marketing Ops' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px' }}>{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={(newUser as any)[f.key]} onChange={e => setNewUser(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px' }}>Role</label>
                <select value={newUser.role} onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                  <option value="citizen_dev">Citizen Developer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddUser} disabled={!newUser.name || !newUser.email || !newUser.team} style={{ flex: 1, padding: '10px', background: 'var(--accent-green)', border: 'none', borderRadius: '6px', color: '#0d1117', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
