import React, { useState } from 'react';
import { useApp, UserRole } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  Star,
  CheckCircle2,
  Trash2,
  Edit2,
  Mail,
  X,
  Lock,
  ArrowLeft,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  displayTitle: string;
  status: 'active' | 'invited' | 'suspended';
  email: string;
  phone: string;
  lastActive: string;
  avatar: string;
}

export const StaffScreen: React.FC = () => {
  const { showToast, currentUserRole, setScreen } = useApp();

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'staff-1',
      name: 'Ramesh Patel',
      role: 'KITCHEN',
      displayTitle: 'Head Chef & Kitchen Lead',
      status: 'active',
      email: 'ramesh.chef@feedopartner.com',
      phone: '+91 98765 11223',
      lastActive: '5 mins ago',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'staff-2',
      name: 'Anjali Sharma',
      role: 'MANAGER',
      displayTitle: 'Operations & Dispatch Manager',
      status: 'active',
      email: 'anjali.ops@feedopartner.com',
      phone: '+91 98765 22334',
      lastActive: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'staff-3',
      name: 'Deepak Kumar',
      role: 'KITCHEN',
      displayTitle: 'Biryani & Tandoor Specialist',
      status: 'active',
      email: 'deepak.k@feedopartner.com',
      phone: '+91 98765 33445',
      lastActive: '12 mins ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'staff-4',
      name: 'Kavita Roy',
      role: 'CASHIER',
      displayTitle: 'Front Counter & Cashier',
      status: 'active',
      email: 'kavita.cashier@feedopartner.com',
      phone: '+91 98765 44556',
      lastActive: '1 hour ago',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('STAFF');
  const [inviteTitle, setInviteTitle] = useState('');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      showToast('Please enter member name and email', 'error');
      return;
    }

    const newStaff: StaffMember = {
      id: 'staff-' + Date.now(),
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      displayTitle: inviteTitle.trim() || `${inviteRole} Member`,
      status: 'invited',
      phone: '+91 98*** *****',
      lastActive: 'Invited just now',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    };

    setStaffList([...staffList, newStaff]);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteTitle('');
    showToast(`Invitation sent to ${newStaff.email} as ${newStaff.role}`, 'success');
  };

  const handleRemoveStaff = (id: string, name: string) => {
    if (currentUserRole !== 'OWNER' && currentUserRole !== 'ADMIN') {
      showToast('Only Restaurant Owner or Admin can remove staff members', 'error');
      return;
    }
    setStaffList(staffList.filter((s) => s.id !== id));
    showToast(`Staff member "${name}" removed from restaurant`, 'info');
  };

  const handleToggleStatus = (id: string) => {
    if (currentUserRole !== 'OWNER' && currentUserRole !== 'ADMIN') {
      showToast('Only Restaurant Owner or Admin can suspend staff accounts', 'error');
      return;
    }
    setStaffList(
      staffList.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' }
          : s
      )
    );
    showToast('Staff status updated', 'info');
  };

  const roleBadgeStyles: Record<UserRole, string> = {
    OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
    MANAGER: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
    KITCHEN: 'bg-orange-100 text-orange-800 border-orange-200',
    CASHIER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Staff & Permissions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage team members, multi-tenant roles, POS kitchen station access, and account security.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="py-2.5 px-4 bg-feedo-500 hover:bg-feedo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/20 flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Invite Staff Member</span>
        </button>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Team Members
          </span>
          <h3 className="text-3xl font-black text-slate-900">{staffList.length + 1}</h3>
          <span className="text-xs text-slate-500">Including 1 Owner</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Kitchen Crew
          </span>
          <h3 className="text-3xl font-black text-orange-600">
            {staffList.filter((s) => s.role === 'KITCHEN').length}
          </h3>
          <span className="text-xs text-slate-500">Cooktop & Prep access only</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Online
          </span>
          <h3 className="text-3xl font-black text-emerald-600">
            {staffList.filter((s) => s.status === 'active').length}
          </h3>
          <span className="text-xs text-emerald-600 font-semibold">100% station coverage</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Security Mode
          </span>
          <h3 className="text-2xl font-black text-indigo-600 flex items-center gap-1.5 mt-1">
            <Shield className="w-6 h-6" /> Zero-Trust RLS
          </h3>
          <span className="text-xs text-slate-500">Database Role Guard Active</span>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Restaurant Staff Roster</h3>
            <p className="text-xs text-slate-500">Assigned roles and active permissions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Member</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Email & Contact</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Last Active</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Owner Row */}
              <tr className="bg-purple-50/40">
                <td className="py-3.5 px-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    LN
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Lakshmi Narayana</h4>
                    <p className="text-[11px] text-slate-500">Restaurant Owner</p>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-purple-100 text-purple-900 border-purple-200">
                    OWNER
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                  lucky.family.blr@feedopartner.com
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-500">Online now</td>
                <td className="py-3.5 px-3 text-right">
                  <span className="text-[10px] text-slate-400 font-semibold">Primary Account</span>
                </td>
              </tr>

              {/* Staff Rows */}
              {staffList.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{member.name}</h4>
                      <p className="text-[11px] text-slate-500">{member.displayTitle}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        roleBadgeStyles[member.role]
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                    {member.email}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : member.status === 'invited'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {member.status === 'active' ? 'Active' : member.status === 'invited' ? 'Invited' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{member.lastActive}</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title={member.status === 'active' ? 'Suspend Access' : 'Activate Access'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveStaff(member.id, member.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Role-Based Access Control (RBAC) Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">System Permission</th>
                <th className="pb-3 px-3 text-center">OWNER</th>
                <th className="pb-3 px-3 text-center">MANAGER</th>
                <th className="pb-3 px-3 text-center">STAFF</th>
                <th className="pb-3 px-3 text-center">KITCHEN</th>
                <th className="pb-3 px-3 text-center">CASHIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-medium">View & Accept Orders</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Update Kitchen Food Prep & Ready</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Edit Menu Items & Prices</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
                <td className="py-2.5 px-3 text-center text-slate-300">-</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">View Bank Accounts & Payouts</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Submit Sensitive KYC & PAN</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-feedo-400" />
                <span>Invite Staff Member</span>
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. suresh.chef@feedopartner.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Assigned Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
                >
                  <option value="MANAGER">MANAGER (Operations & Dispatch)</option>
                  <option value="KITCHEN">KITCHEN (Food Prep & Ready Stations)</option>
                  <option value="STAFF">STAFF (Fulfillment & Packaging)</option>
                  <option value="CASHIER">CASHIER (Counter & Billing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Custom Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g. Tandoor Master"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-feedo-500 hover:bg-feedo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
