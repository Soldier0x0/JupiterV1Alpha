import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Users, 
  Mail, 
  Shield, 
  Calendar, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Building,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface User {
  _id: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
  is_active: boolean;
  password_set: boolean;
  created_at: string;
  last_login?: string;
}

interface CreateUserForm {
  email: string;
  role: string;
  tenant_name: string;
  send_email: boolean;
}

const USER_ROLES = [
  { value: 'tenant_admin', label: 'Tenant Administrator', description: 'Full access to tenant' },
  { value: 'security_analyst', label: 'Security Analyst', description: 'Analyze threats and incidents' },
  { value: 'soc_operator', label: 'SOC Operator', description: 'Monitor and respond to alerts' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to data' },
  { value: 'guest', label: 'Guest', description: 'Limited access for external users' }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    role: 'viewer',
    tenant_name: '',
    send_email: true
  });

  const token = localStorage.getItem('jupiter_token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!createForm.email || !createForm.role) {
      setMessage('Email and role are required');
      return;
    }

    setCreateLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ User created successfully! Welcome email sent.');
        setShowCreateForm(false);
        setCreateForm({
          email: '',
          role: 'viewer',
          tenant_name: '',
          send_email: true
        });
        fetchUsers(); // Refresh user list
      } else {
        setMessage(`❌ ${data.detail || 'Failed to create user'}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: 'text-red-400',
      tenant_admin: 'text-orange-400',
      security_analyst: 'text-blue-400',
      soc_operator: 'text-green-400',
      viewer: 'text-gray-400',
      guest: 'text-purple-400'
    };
    return colors[role as keyof typeof colors] || 'text-gray-400';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1>User Management</h1>
        </div>
        <div className="text-center p-8">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full"></div>
          <p className="mt-2 muted">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="muted">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅')
            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
            : 'bg-red-400/10 text-red-400 border border-red-400/20'
        }`}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-semibold">{users.length}</p>
                <p className="text-sm muted">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-semibold">{users.filter(u => u.is_active).length}</p>
                <p className="text-sm muted">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-semibold">{users.filter(u => u.role.includes('admin')).length}</p>
                <p className="text-sm muted">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-semibold">{new Set(users.map(u => u.tenant_name)).size}</p>
                <p className="text-sm muted">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center p-8">
              <Users className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="muted">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.is_active ? 'bg-emerald-400/10' : 'bg-red-400/10'
                    }`}>
                      {user.is_active ? (
                        <UserCheck className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.email}</p>
                        {user.password_set ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" title="Password set" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-400" title="Password not set" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm muted">
                        <span className={`font-medium ${getRoleColor(user.role)}`}>
                          {USER_ROLES.find(r => r.value === user.role)?.label || user.role}
                        </span>
                        <span>•</span>
                        <span>{user.tenant_name}</span>
                        <span>•</span>
                        <span>Created {formatDate(user.created_at)}</span>
                        {user.last_login && (
                          <>
                            <span>•</span>
                            <span>Last login {formatDate(user.last_login)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <p className="text-sm muted">
                Add a new user to the system. They will receive an email with instructions to set up their password.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs muted mt-1">
                  {USER_ROLES.find(r => r.value === createForm.role)?.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Organization Name (Optional)</label>
                <input
                  type="text"
                  value={createForm.tenant_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, tenant_name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none"
                  placeholder="Leave blank for main organization"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send_email"
                  checked={createForm.send_email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, send_email: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="send_email" className="text-sm">
                  Send welcome email with password setup instructions
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={createUser}
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}