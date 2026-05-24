import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  CreditCard,
  User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminRepository } from "../../../data/api/admin/adminRepository";

import { SkeletonTable } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  
  // Search & Filter parameters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  // Modals & Panels
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionUserId, setActionUserId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUsersList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (activeFilter) params.is_active = activeFilter;
      
      const response = await adminRepository.getUsers(params);
      const list = response?.data?.results || response?.results || response?.data || response || [];
      setUsers(list);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsersList();
  };

  const handleToggleActive = async (userId) => {
    try {
      const response = await adminRepository.toggleUserActive(userId);
      const updated = response?.data || response;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: updated.is_active } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, is_active: updated.is_active }));
      }
      toast.success(`User status changed successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle user activation status.");
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      const response = await adminRepository.changeUserRole(userId, role);
      const updated = response?.data || response;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => ({ ...prev, role: updated.role }));
      }
      toast.success(`Role updated to ${role} successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to change user role.");
    }
  };

  const handleDeleteUser = async () => {
    if (!actionUserId) return;
    try {
      await adminRepository.deleteUser(actionUserId);
      setUsers(prev => prev.filter(u => u.id !== actionUserId));
      setSelectedUser(null);
      setConfirmDelete(false);
      toast.success("User account permanently deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user account.");
    }
  };

  return (
    <div className="p-8 space-y-8 pt-24">
      {/* Title */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight">User Directory</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Manage user activation states, assign coach roles, and inspect profiles</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111] p-4 rounded-2xl border border-white/5">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md bg-black border border-gray-800 rounded-xl p-1.5 focus-within:border-orange-500 transition">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent px-3 py-2 text-xs outline-none"
          />
          <button type="submit" className="p-2 bg-orange-500 text-black hover:bg-orange-400 rounded-lg transition">
            <Search size={14} />
          </button>
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-400 w-full md:w-40"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="COACH">Coach</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-400 w-full md:w-40"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
          No users match the search/filters credentials.
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition cursor-pointer"
                  >
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <UserIcon size={14} className="text-gray-500" />
                      {u.username}
                    </td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        u.role === 'ADMIN' ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                        u.role === 'COACH' ? "bg-purple-500/10 text-purple-400 border border-purple-500/25" :
                        "bg-gray-500/10 text-gray-400 border border-gray-500/25"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold uppercase text-[9px] ${u.is_active ? "text-green-500" : "text-red-500"}`}>
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle Active */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(u.id); }}
                          className={`p-1.5 rounded-lg transition ${
                            u.is_active 
                              ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10" 
                              : "text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                          }`}
                          title={u.is_active ? "Deactivate Account" : "Activate Account"}
                        >
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        
                        {/* Change Role Selection */}
                        <select
                          value={u.role}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => { e.stopPropagation(); handleChangeRole(u.id, e.target.value); }}
                          className="bg-black border border-gray-800 text-gray-400 px-2 py-1 rounded-lg text-[10px] outline-none"
                        >
                          <option value="USER">USER</option>
                          <option value="COACH">COACH</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Slide Panel */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[98]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-[450px] bg-[#0f0f0f] border-l border-white/10 p-8 shadow-2xl z-[99] overflow-y-auto custom-scrollbar flex flex-col gap-6"
              initial={{ x: 450 }}
              animate={{ x: 0 }}
              exit={{ x: 450 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <UserIcon className="text-orange-500" size={20} /> User Profile Details
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Account details */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Account Info</div>
                  <div className="text-sm font-bold text-white">{selectedUser.username}</div>
                  <div className="text-xs text-gray-400">{selectedUser.email}</div>
                  <div className="flex items-center gap-3 pt-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Joined: {new Date(selectedUser.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Profile physical metrics */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Physical Metrics</div>
                  {selectedUser.profile ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Height</span>
                        <span className="font-bold text-white">{selectedUser.profile.height ? `${selectedUser.profile.height} cm` : "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Weight</span>
                        <span className="font-bold text-white">{selectedUser.profile.weight ? `${selectedUser.profile.weight} kg` : "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Activity Level</span>
                        <span className="font-bold text-white">{selectedUser.profile.activity_level ?? "1.2"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Fitness Level</span>
                        <span className="font-bold text-white uppercase">{selectedUser.profile.fitness_level ?? "BEGINNER"}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">No profile metrics completed by user.</p>
                  )}
                </div>

                {/* Subscription Tier Details */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Membership Tier</div>
                  {selectedUser.subscription_details ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tier Name:</span>
                        <span className="font-bold text-orange-500 uppercase">{selectedUser.subscription_details.plan_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-bold text-white uppercase">{selectedUser.subscription_details.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Active range:</span>
                        <span className="text-gray-300">
                          {selectedUser.subscription_details.start_date ? new Date(selectedUser.subscription_details.start_date).toLocaleDateString() : ""} - {selectedUser.subscription_details.end_date ? new Date(selectedUser.subscription_details.end_date).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CreditCard size={14} />
                      <span>No active paid membership (Free Tier).</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-auto border-t border-white/5 pt-4 space-y-3">
                <div className="text-[10px] text-red-500 font-bold uppercase">Danger Control Zone</div>
                
                {confirmDelete ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3">
                    <p className="text-[11px] text-red-400 leading-normal">
                      Are you sure you want to permanently delete this user account? All logs and historical data will be cleared.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteUser}
                        className="flex-1 py-2 bg-red-500 text-white font-bold rounded-xl text-xs uppercase"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2 bg-white/5 text-gray-300 rounded-xl text-xs uppercase font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setActionUserId(selectedUser.id); setConfirmDelete(true); }}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-2 border border-red-500/20 transition"
                  >
                    <Trash2 size={14} /> Permanent Account Delete
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
