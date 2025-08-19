import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Plus, Settings, Trash2, Edit, Crown, User, Key } from 'lucide-react';
import Card from '../components/Card';
import { rbacAPI } from '../utils/api';
import { useAuth } from '../auth/AuthProvider';

const RoleManagement = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Modal states
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [],
    level: 5,
    tenant_scoped: true
  });

  const [roleAssignment, setRoleAssignment] = useState({
    user_id: '',
    role_id: '',
    assigned_by: user?.id || ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes, permissionsRes] = await Promise.allSettled([
        rbacAPI.getRoles(),
        rbacAPI.getUsers(),
        rbacAPI.getPermissions()
      ]);

      if (rolesRes.status === 'fulfilled') {
        setRoles(rolesRes.value.data.roles || []);
      }
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.users || []);
      }
      if (permissionsRes.status === 'fulfilled') {
        setPermissions(permissionsRes.value.data.permissions || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('Failed to load role management data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await rbacAPI.createRole(newRole);
      setMessage('Role created successfully');
      setNewRole({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
        level: 5,
        tenant_scoped: true
      });
      setShowCreateRoleModal(false);
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to create role');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    try {
      await rbacAPI.updateRole(selectedRole._id, {
        display_name: selectedRole.display_name,
        description: selectedRole.description,
        permissions: selectedRole.permissions,
        enabled: selectedRole.enabled
      });
      setMessage('Role updated successfully');
      setShowEditRoleModal(false);
      setSelectedRole(null);
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await rbacAPI.deleteRole(roleId);
      setMessage('Role deleted successfully');
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to delete role');
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    try {
      await rbacAPI.assignUserRole(roleAssignment.user_id, {
        role_id: roleAssignment.role_id,
        assigned_by: user?.id || ''
      });
      setMessage('Role assigned successfully');
      setRoleAssignment({
        user_id: '',
        role_id: '',
        assigned_by: user?.id || ''
      });
      setShowAssignRoleModal(false);
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to assign role');
    }
  };

  const togglePermission = (permission, isChecked) => {
    if (showCreateRoleModal) {
      setNewRole(prev => ({
        ...prev,
        permissions: isChecked
          ? [...prev.permissions, permission]
          : prev.permissions.filter(p => p !== permission)
      }));
    } else if (showEditRoleModal && selectedRole) {
      setSelectedRole(prev => ({
        ...prev,
        permissions: isChecked
          ? [...prev.permissions, permission]
          : prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'super_admin': return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'tenant_owner': return <Shield className="w-5 h-5 text-purple-400" />;
      case 'admin': return <Settings className="w-5 h-5 text-blue-400" />;
      case 'analyst': return <User className="w-5 h-5 text-green-400" />;
      case 'viewer': return <Key className="w-5 h-5 text-gray-400" />;
      default: return <Shield className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getRoleLevelColor = (level) => {
    if (level === 0) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    if (level === 1) return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    if (level === 2) return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    if (level === 3) return 'text-green-400 bg-green-400/10 border-green-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  if (!user?.permissions?.includes('roles:manage') && !user?.permissions?.includes('system:manage')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">Access Denied</h2>
          <p className="text-zinc-500">You don't have permission to manage roles.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl text-gradient flex items-center space-x-2">
            <Shield className="w-8 h-8 text-jupiter-secondary" />
            <span>Role Management</span>
          </h1>
          <p className="body-text text-zinc-400 mt-1">Manage user roles and permissions</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={() => setShowAssignRoleModal(true)}
            className="btn-ghost flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-4 h-4" />
            <span>Assign Role</span>
          </motion.button>
          <motion.button
            onClick={() => setShowCreateRoleModal(true)}
            className="btn-primary flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </motion.button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center space-x-2 ${
            message.includes('success') || message.includes('assigned')
              ? 'bg-jupiter-success/20 text-jupiter-success border border-jupiter-success/30'
              : 'bg-jupiter-danger/20 text-jupiter-danger border border-jupiter-danger/30'
          }`}
        >
          <span>{message}</span>
        </motion.div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Roles</p>
                <p className="text-2xl font-bold text-jupiter-secondary">{roles.length}</p>
              </div>
              <Shield className="w-8 h-8 text-jupiter-secondary" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Active Roles</p>
                <p className="text-2xl font-bold text-jupiter-success">
                  {roles.filter(r => r.enabled !== false).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-jupiter-success" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-jupiter-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-jupiter-warning">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-jupiter-warning" />
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="border-l-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Permissions</p>
                <p className="text-2xl font-bold text-purple-400">{permissions.length}</p>
              </div>
              <Key className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Roles List */}
      <Card>
        <h2 className="display-text text-xl mb-6 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-jupiter-secondary" />
          <span>System Roles</span>
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-zinc-400 mt-3">Loading roles...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role, index) => (
              <motion.div
                key={role._id}
                className="bg-cosmic-gray/30 border border-cosmic-border rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRoleIcon(role.name)}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-zinc-200">{role.display_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getRoleLevelColor(role.level)}`}>
                          Level {role.level}
                        </span>
                        {!role.tenant_scoped && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{role.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500">
                        <span>{role.permissions.length} permissions</span>
                        <span>•</span>
                        <span>Created: {new Date(role.created_at).toLocaleDateString()}</span>
                        {role.created_by === 'system' && (
                          <>
                            <span>•</span>
                            <span className="text-jupiter-warning">System Role</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      role.enabled !== false 
                        ? 'bg-jupiter-success/20 text-jupiter-success' 
                        : 'bg-zinc-500/20 text-zinc-500'
                    }`}>
                      {role.enabled !== false ? 'Active' : 'Disabled'}
                    </span>
                    
                    {role.created_by !== 'system' && (
                      <>
                        <motion.button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowEditRoleModal(true);
                          }}
                          className="p-2 hover:bg-cosmic-gray rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4 text-zinc-400" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleDeleteRole(role._id, role.display_name)}
                          className="p-2 hover:bg-jupiter-danger/20 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4 text-jupiter-danger" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create New Role</h3>
                <button
                  onClick={() => setShowCreateRoleModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRole} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">Role Name (Internal)</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      className="input-field"
                      placeholder="security_analyst"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">Display Name</label>
                    <input
                      type="text"
                      value={newRole.display_name}
                      onChange={(e) => setNewRole({...newRole, display_name: e.target.value})}
                      className="input-field"
                      placeholder="Security Analyst"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="input-field h-20 resize-none"
                    placeholder="Description of the role..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">Hierarchy Level</label>
                    <input
                      type="number"
                      value={newRole.level}
                      onChange={(e) => setNewRole({...newRole, level: parseInt(e.target.value)})}
                      className="input-field"
                      min="0"
                      max="10"
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1">Lower numbers = higher privileges</p>
                  </div>
                  <div className="flex items-center space-x-3 pt-8">
                    <input
                      type="checkbox"
                      id="tenant_scoped"
                      checked={newRole.tenant_scoped}
                      onChange={(e) => setNewRole({...newRole, tenant_scoped: e.target.checked})}
                      className="w-4 h-4 text-jupiter-secondary"
                    />
                    <label htmlFor="tenant_scoped" className="text-sm text-zinc-300">
                      Tenant Scoped (recommended)
                    </label>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-zinc-300">Permissions</label>
                  <div className="max-h-64 overflow-y-auto border border-zinc-700 rounded-lg p-4">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-zinc-300 mb-2">{category}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {perms.map((perm) => (
                            <div key={perm.name} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={perm.name}
                                checked={newRole.permissions.includes(perm.name)}
                                onChange={(e) => togglePermission(perm.name, e.target.checked)}
                                className="w-4 h-4 text-jupiter-secondary"
                              />
                              <label htmlFor={perm.name} className="text-sm text-zinc-300 flex-1">
                                {perm.name} - {perm.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoleModal(false)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-jupiter-secondary hover:bg-jupiter-primary text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditRoleModal && selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Role: {selectedRole.display_name}</h3>
                <button
                  onClick={() => setShowEditRoleModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateRole} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">Display Name</label>
                    <input
                      type="text"
                      value={selectedRole.display_name}
                      onChange={(e) => setSelectedRole({...selectedRole, display_name: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-8">
                    <input
                      type="checkbox"
                      id="edit_enabled"
                      checked={selectedRole.enabled !== false}
                      onChange={(e) => setSelectedRole({...selectedRole, enabled: e.target.checked})}
                      className="w-4 h-4 text-jupiter-secondary"
                    />
                    <label htmlFor="edit_enabled" className="text-sm text-zinc-300">
                      Role Enabled
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Description</label>
                  <textarea
                    value={selectedRole.description}
                    onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
                    className="input-field h-20 resize-none"
                    required
                  />
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-zinc-300">Permissions</label>
                  <div className="max-h-64 overflow-y-auto border border-zinc-700 rounded-lg p-4">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-zinc-300 mb-2">{category}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {perms.map((perm) => (
                            <div key={perm.name} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit_${perm.name}`}
                                checked={selectedRole.permissions.includes(perm.name)}
                                onChange={(e) => togglePermission(perm.name, e.target.checked)}
                                className="w-4 h-4 text-jupiter-secondary"
                              />
                              <label htmlFor={`edit_${perm.name}`} className="text-sm text-zinc-300 flex-1">
                                {perm.name} - {perm.description}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditRoleModal(false)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-jupiter-secondary hover:bg-jupiter-primary text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Update Role
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Role Modal */}
      <AnimatePresence>
        {showAssignRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Assign Role to User</h3>
                <button
                  onClick={() => setShowAssignRoleModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Select User</label>
                  <select
                    value={roleAssignment.user_id}
                    onChange={(e) => setRoleAssignment({...roleAssignment, user_id: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.email} - {user.role_display || 'No Role'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Select Role</label>
                  <select
                    value={roleAssignment.role_id}
                    onChange={(e) => setRoleAssignment({...roleAssignment, role_id: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a role...</option>
                    {roles.filter(role => role.enabled !== false).map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.display_name} (Level {role.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignRoleModal(false)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-jupiter-secondary hover:bg-jupiter-primary text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Assign Role
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoleManagement;