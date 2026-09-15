import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Eye,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Lock,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Flag,
  Clock,
  History,
  Key,
  Copy,
  Check,
  LogOut,
  Sliders,
  FileText,
  MessageSquare,
  Award,
  ChevronRight,
  AlertOctagon,
  Info,
  Briefcase,
  Phone,
  MapPin,
} from 'lucide-react';
import {
  UserProfile,
  WorkRecord,
  AdminUser,
  AccountStatus,
  SuspensionDuration,
  UserRestrictions,
  AccountRecoveryRecord,
  AuditLogEntry,
} from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface UsersSectionProps {
  users: UserProfile[];
  records: WorkRecord[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

type TabType = 'profile' | 'governance' | 'security' | 'activity' | 'history';

const PREDEFINED_SUSPENSION_REASONS = [
  'Deceptive or fraudulent work record documentation',
  'Impersonation or falsified professional credentials',
  'Harassment or inappropriate conduct in client messaging',
  'Unsolicited commercial spam or mass contact',
  'Attempted circumvention of client confirmation procedures',
  'Temporary freeze pending identity compliance review',
];

export const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  records,
  adminUser,
  onRefreshData,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus | 'flagged'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admins' | 'standard'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'works' | 'proof' | 'name'>('newest');

  // Selected User Detail Modal / Drawer
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Action Modals State
  const [suspendModalUser, setSuspendModalUser] = useState<UserProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendInternalNote, setSuspendInternalNote] = useState('');
  const [suspendDuration, setSuspendDuration] = useState<SuspensionDuration>('7d');
  const [suspendConfirmed, setSuspendConfirmed] = useState(false);

  const [unsuspendModalUser, setUnsuspendModalUser] = useState<UserProfile | null>(null);
  const [unsuspendReason, setUnsuspendReason] = useState('');
  const [unsuspendInternalNote, setUnsuspendInternalNote] = useState('');

  const [deactivateModalUser, setDeactivateModalUser] = useState<UserProfile | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateInternalNote, setDeactivateInternalNote] = useState('');
  const [isEligibleForRestoration, setIsEligibleForRestoration] = useState(true);
  const [deactivateConfirmUsername, setDeactivateConfirmUsername] = useState('');

  const [restoreModalUser, setRestoreModalUser] = useState<UserProfile | null>(null);
  const [restoreReason, setRestoreReason] = useState('');

  const [forceLogoutModalUser, setForceLogoutModalUser] = useState<UserProfile | null>(null);

  const [recoveryModalData, setRecoveryModalData] = useState<{
    user: UserProfile;
    record: AccountRecoveryRecord;
  } | null>(null);
  const [copiedRecoveryLink, setCopiedRecoveryLink] = useState(false);

  // Restrictions Editor State inside selected user
  const [editingRestrictions, setEditingRestrictions] = useState<UserRestrictions>({});
  const [restrictionReasonInput, setRestrictionReasonInput] = useState('');
  const [restrictionSuccessMsg, setRestrictionSuccessMsg] = useState<string | null>(null);

  // Common submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const adminActor = useMemo(() => {
    return {
      id: adminUser?.id || 'sys_admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };
  }, [adminUser]);

  // Sync restrictions editor when selectedUser changes
  const handleOpenUserDetails = (user: UserProfile, initialTab: TabType = 'profile') => {
    setSelectedUser(user);
    setActiveTab(initialTab);
    setEditingRestrictions(user.restrictions || {});
    setRestrictionReasonInput(user.restrictions?.restrictedReason || '');
    setRestrictionSuccessMsg(null);
  };

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          u.fullName.toLowerCase().includes(term) ||
          (u.email && u.email.toLowerCase().includes(term)) ||
          (u.username && u.username.toLowerCase().includes(term)) ||
          (u.profession && u.profession.toLowerCase().includes(term)) ||
          (u.skills && u.skills.some((s) => s.toLowerCase().includes(term))) ||
          u.id.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        const effectiveStatus = operationsService.getUserAccountStatus(u);

        if (statusFilter === 'flagged') {
          if (!u.isFlagged) return false;
        } else if (statusFilter !== 'all') {
          if (effectiveStatus !== statusFilter) return false;
        }

        if (roleFilter === 'admins') {
          if (!u.adminRole && !adminUser?.email?.includes(u.email || '')) return false;
        } else if (roleFilter === 'standard') {
          if (u.adminRole) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (sortBy === 'works') {
          const aCount = records.filter((r) => r.userId === a.id).length;
          const bCount = records.filter((r) => r.userId === b.id).length;
          return bCount - aCount;
        }
        if (sortBy === 'proof') {
          const aWorks = records.filter((r) => r.userId === a.id);
          const bWorks = records.filter((r) => r.userId === b.id);
          const aConfirmed = aWorks.filter((r) => r.confirmationStatus === 'confirmed').length;
          const bConfirmed = bWorks.filter((r) => r.confirmationStatus === 'confirmed').length;
          return bConfirmed - aConfirmed;
        }
        if (sortBy === 'name') {
          return a.fullName.localeCompare(b.fullName);
        }
        return 0;
      });
  }, [users, records, searchTerm, statusFilter, roleFilter, sortBy, adminUser]);

  // Counts by status
  const counts = useMemo(() => {
    let active = 0;
    let restricted = 0;
    let suspended = 0;
    let deactivated = 0;
    let flagged = 0;

    users.forEach((u) => {
      const s = operationsService.getUserAccountStatus(u);
      if (s === 'active') active++;
      if (s === 'restricted') restricted++;
      if (s === 'suspended') suspended++;
      if (s === 'deactivated') deactivated++;
      if (u.isFlagged) flagged++;
    });

    return { total: users.length, active, restricted, suspended, deactivated, flagged };
  }, [users]);

  // Handler: Suspend User (Real Backend Action)
  const handleExecuteSuspension = () => {
    if (!suspendModalUser) return;
    if (!suspendReason || suspendReason.trim().length < 5) {
      setActionError('A substantive suspension reason (minimum 5 characters) is required.');
      return;
    }
    if (!suspendConfirmed) {
      setActionError('You must explicitly confirm this suspension before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = operationsService.suspendUser(
      suspendModalUser.id,
      {
        reason: suspendReason.trim(),
        internalNote: suspendInternalNote.trim(),
        duration: suspendDuration,
      },
      adminActor
    );

    setIsSubmitting(false);

    if (res.success && res.user) {
      const updated = res.user;
      setSuspendModalUser(null);
      setSuspendReason('');
      setSuspendInternalNote('');
      setSuspendConfirmed(false);
      onRefreshData();
      if (selectedUser && selectedUser.id === updated.id) {
        setSelectedUser(updated);
      }
    } else {
      setActionError(res.error || 'Failed to suspend user.');
    }
  };

  // Handler: Unsuspend User
  const handleExecuteUnsuspension = () => {
    if (!unsuspendModalUser) return;
    if (!unsuspendReason || unsuspendReason.trim().length < 4) {
      setActionError('A substantive restoration reason (minimum 4 characters) is required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = operationsService.unsuspendUser(
      unsuspendModalUser.id,
      {
        restorationReason: unsuspendReason.trim(),
        internalNote: unsuspendInternalNote.trim(),
      },
      adminActor
    );

    setIsSubmitting(false);

    if (res.success && res.user) {
      const updated = res.user;
      setUnsuspendModalUser(null);
      setUnsuspendReason('');
      setUnsuspendInternalNote('');
      onRefreshData();
      if (selectedUser && selectedUser.id === updated.id) {
        setSelectedUser(updated);
      }
    } else {
      setActionError(res.error || 'Failed to restore account.');
    }
  };

  // Handler: Deactivate User
  const handleExecuteDeactivation = () => {
    if (!deactivateModalUser) return;
    if (!deactivateReason || deactivateReason.trim().length < 5) {
      setActionError('A clear deactivation reason is required.');
      return;
    }
    if (deactivateConfirmUsername.trim() !== deactivateModalUser.username.trim()) {
      setActionError(`Please type "${deactivateModalUser.username}" exactly to confirm deactivation.`);
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = operationsService.deactivateUser(
      deactivateModalUser.id,
      {
        reason: deactivateReason.trim(),
        internalNote: deactivateInternalNote.trim(),
        isEligibleForRestoration,
      },
      adminActor
    );

    setIsSubmitting(false);

    if (res.success && res.user) {
      const updated = res.user;
      setDeactivateModalUser(null);
      setDeactivateReason('');
      setDeactivateInternalNote('');
      setDeactivateConfirmUsername('');
      onRefreshData();
      if (selectedUser && selectedUser.id === updated.id) {
        setSelectedUser(updated);
      }
    } else {
      setActionError(res.error || 'Failed to deactivate account.');
    }
  };

  // Handler: Restore Deactivated User
  const handleExecuteRestoration = () => {
    if (!restoreModalUser) return;
    if (!restoreReason || restoreReason.trim().length < 4) {
      setActionError('A substantive reason for restoring the account is required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = operationsService.restoreDeactivatedUser(
      restoreModalUser.id,
      { restorationReason: restoreReason.trim() },
      adminActor
    );

    setIsSubmitting(false);

    if (res.success && res.user) {
      const updated = res.user;
      setRestoreModalUser(null);
      setRestoreReason('');
      onRefreshData();
      if (selectedUser && selectedUser.id === updated.id) {
        setSelectedUser(updated);
      }
    } else {
      setActionError(res.error || 'Failed to restore deactivated account.');
    }
  };

  // Handler: Update Capabilities / Restrictions
  const handleSaveRestrictions = () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setActionError(null);
    setRestrictionSuccessMsg(null);

    const updatedRestrictions: UserRestrictions = {
      ...editingRestrictions,
      restrictedReason: restrictionReasonInput.trim(),
    };

    const res = operationsService.updateUserRestrictions(
      selectedUser.id,
      updatedRestrictions,
      adminActor
    );

    setIsSubmitting(false);

    if (res.success && res.user) {
      setSelectedUser(res.user);
      onRefreshData();
      setRestrictionSuccessMsg('Capability restrictions successfully updated and logged to audit trail.');
      setTimeout(() => setRestrictionSuccessMsg(null), 4000);
    } else {
      setActionError(res.error || 'Failed to update restrictions.');
    }
  };

  // Handler: Force Logout
  const handleExecuteForceLogout = () => {
    if (!forceLogoutModalUser) return;
    setIsSubmitting(true);
    setActionError(null);

    const res = operationsService.forceLogoutUser(forceLogoutModalUser.id, adminActor);
    setIsSubmitting(false);

    if (res.success) {
      const updated = operationsService.getUserById(forceLogoutModalUser.id);
      setForceLogoutModalUser(null);
      onRefreshData();
      if (selectedUser && updated && selectedUser.id === updated.id) {
        setSelectedUser(updated);
      }
    } else {
      setActionError(res.error || 'Failed to revoke sessions.');
    }
  };

  // Handler: Secure Account Recovery
  const handleTriggerRecovery = (user: UserProfile) => {
    setIsSubmitting(true);
    setActionError(null);

    const res = operationsService.triggerAccountRecovery(user.id, adminActor);
    setIsSubmitting(false);

    if (res.success && res.recoveryRecord) {
      setRecoveryModalData({ user, record: res.recoveryRecord });
      setCopiedRecoveryLink(false);
      onRefreshData();
      const updated = operationsService.getUserById(user.id);
      if (selectedUser && updated && selectedUser.id === updated.id) {
        setSelectedUser(updated);
      }
    } else {
      setActionError(res.error || 'Failed to initiate account recovery.');
    }
  };

  // User activity & audit history for selectedUser
  const selectedUserActivity = useMemo(() => {
    if (!selectedUser) return null;
    return operationsService.getUserActivitySummary(selectedUser.id);
  }, [selectedUser, records]);

  const selectedUserAuditLogs = useMemo(() => {
    if (!selectedUser) return [];
    return operationsService.getUserAuditLogs(selectedUser.id);
  }, [selectedUser]);

  const selectedUserWorks = useMemo(() => {
    if (!selectedUser) return [];
    return records.filter((r) => r.userId === selectedUser.id);
  }, [selectedUser, records]);

  return (
    <div className="space-y-6">
      {/* Overview & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E7E2D8]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#16222F]">
                User Administration & Governance
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] text-xs font-mono font-bold border border-[#CFE2D9]">
                {counts.total} Accounts
              </span>
            </div>
            <p className="text-xs text-[#52606D] mt-1">
              Search professionals, manage account standing, enact suspensions with audit logging, and oversee security sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-xs font-semibold text-[#16222F] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#52606D]" />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Count Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Accounts', count: counts.total },
              { id: 'active', label: 'Active', count: counts.active, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { id: 'restricted', label: 'Restricted', count: counts.restricted, color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { id: 'suspended', label: 'Suspended', count: counts.suspended, color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { id: 'deactivated', label: 'Deactivated', count: counts.deactivated, color: 'text-slate-700 bg-slate-100 border-slate-300' },
              { id: 'flagged', label: 'Flagged Safety', count: counts.flagged, color: 'text-orange-700 bg-orange-50 border-orange-200' },
            ] as const
          ).map((filter) => {
            const isSelected = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#2D4D45] text-white border-[#2D4D45] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200/60 border-[#E7E2D8]'
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-[#52606D]'
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Role, and Sorting Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-[#7A8690] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, username, profession, skills, or ID..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60 text-[#16222F]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60 text-[#16222F] cursor-pointer"
            >
              <option value="all">Role: All Users</option>
              <option value="admins">Role: Staff & Administrators</option>
              <option value="standard">Role: Standard Professionals</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60 text-[#16222F] cursor-pointer"
            >
              <option value="newest">Sort: Newly Registered</option>
              <option value="works">Sort: Most Documented Works</option>
              <option value="proof">Sort: Most Client Confirmed</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[#52606D] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Professional</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Platform Activity</th>
                <th className="p-4">Account Created</th>
                <th className="p-4">Discoverability</th>
                <th className="p-4 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#7A8690]">
                    <UserX className="w-8 h-8 mx-auto text-[#A1B8B1] mb-2" />
                    <p className="font-bold text-sm text-[#16222F]">No accounts found</p>
                    <p className="text-xs text-[#52606D] mt-1">
                      No registered user accounts match the current filter or search parameters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const status = operationsService.getUserAccountStatus(u);
                  const userWorks = records.filter((r) => r.userId === u.id);
                  const confirmedCount = userWorks.filter(
                    (r) => r.confirmationStatus === 'confirmed' || r.confirmation?.status === 'confirmed'
                  ).length;
                  const evidenceCount = userWorks.filter(
                    (r) => r.evidenceStatus === 'attached' || (r.evidenceList && r.evidenceList.length > 0)
                  ).length;

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* User Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] font-bold flex items-center justify-center shrink-0 text-sm overflow-hidden">
                            {u.profilePhoto ? (
                              <img
                                src={u.profilePhoto}
                                alt={u.fullName}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              u.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#16222F] text-xs hover:underline cursor-pointer" onClick={() => handleOpenUserDetails(u)}>
                                {u.fullName}
                              </span>
                              {u.adminRole && (
                                <span className="px-1.5 py-0.2 rounded bg-[#2D4D45] text-white text-[9px] font-bold uppercase tracking-wider">
                                  {u.adminRole.replace('_', ' ')}
                                </span>
                              )}
                              {u.isFlagged && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                                  <Flag className="w-2.5 h-2.5 text-amber-700" />
                                  Flagged
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#52606D] font-mono">
                              @{u.username} • {u.email || 'No email registered'}
                            </p>
                            <p className="text-[10px] text-[#7A8690] truncate max-w-xs">
                              {u.profession || 'Craft not specified'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="p-4">
                        {status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}

                        {status === 'restricted' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              <Sliders className="w-3 h-3 text-amber-600" />
                              Restricted
                            </span>
                            <p className="text-[9px] text-amber-800 font-medium">
                              Capabilities limited
                            </p>
                          </div>
                        )}

                        {status === 'suspended' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Suspended
                            </span>
                            {u.suspensionDetails?.duration && (
                              <p className="text-[9px] text-rose-700 font-mono">
                                {u.suspensionDetails.duration === 'indefinite' ? 'Indefinite' : `Freeze: ${u.suspensionDetails.duration}`}
                              </p>
                            )}
                          </div>
                        )}

                        {status === 'deactivated' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold">
                            <UserX className="w-3 h-3 text-slate-600" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Activity Column */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#16222F]">
                              {userWorks.length}
                            </span>
                            <span className="text-[11px] text-[#52606D]">
                              {userWorks.length === 1 ? 'work record' : 'work records'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#7A8690]">
                            <span className="text-emerald-700 font-semibold">
                              {confirmedCount} confirmed
                            </span>
                            <span>•</span>
                            <span>{evidenceCount} evidence</span>
                          </div>
                        </div>
                      </td>

                      {/* Creation Date Column */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="text-[#16222F] font-mono text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Historical'}
                          </p>
                          <p className="text-[10px] text-[#7A8690]">
                            {u.lastActiveAt ? `Active ${new Date(u.lastActiveAt).toLocaleDateString()}` : 'Normative session'}
                          </p>
                        </div>
                      </td>

                      {/* Discovery Opt-in Column */}
                      <td className="p-4">
                        {u.appearInDiscover ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#2D4D45] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4D45]" />
                            Public Opt-In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#7A8690]">
                            <XCircle className="w-3.5 h-3.5 text-[#7A8690]" />
                            Private Only
                          </span>
                        )}
                      </td>

                      {/* Governance Actions Column */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleOpenUserDetails(u, 'profile')}
                            className="px-2.5 py-1 rounded-lg border border-[#D5CEC2] hover:bg-[#FAF8F5] text-[#16222F] text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Manage
                          </button>

                          {status === 'suspended' ? (
                            <button
                              onClick={() => {
                                setUnsuspendModalUser(u);
                                setUnsuspendReason('');
                                setUnsuspendInternalNote('');
                                setActionError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Unsuspend
                            </button>
                          ) : status === 'deactivated' ? (
                            <button
                              onClick={() => {
                                setRestoreModalUser(u);
                                setRestoreReason('');
                                setActionError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#EAF3EF] text-[#2D4D45] hover:bg-[#CFE2D9] border border-[#CFE2D9] text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSuspendModalUser(u);
                                setSuspendReason('');
                                setSuspendInternalNote('');
                                setSuspendDuration('7d');
                                setSuspendConfirmed(false);
                                setActionError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED USER MANAGEMENT DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E7E2D8] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7E2D8] flex items-start justify-between gap-4 bg-[#FAF8F5]/60 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] font-bold text-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedUser.profilePhoto ? (
                    <img
                      src={selectedUser.profilePhoto}
                      alt={selectedUser.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    selectedUser.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-[#16222F]">
                      {selectedUser.fullName}
                    </h3>
                    <span className="font-mono text-xs text-[#52606D]">
                      @{selectedUser.username}
                    </span>
                    {selectedUser.adminRole && (
                      <span className="px-2 py-0.5 rounded bg-[#2D4D45] text-white text-[10px] font-bold uppercase">
                        {selectedUser.adminRole.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#52606D] mt-0.5">
                    UID: <span className="font-mono">{selectedUser.id}</span> • Registered {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#7A8690] hover:text-[#16222F] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D5CEC2] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#E7E2D8] px-6 bg-white overflow-x-auto shrink-0">
              {(
                [
                  { id: 'profile', label: 'Profile & Verification' },
                  { id: 'governance', label: 'Governance & Status' },
                  { id: 'security', label: 'Sessions & Recovery' },
                  { id: 'activity', label: 'Platform Activity' },
                  { id: 'history', label: 'Audit History' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#2D4D45] text-[#2D4D45]'
                      : 'border-transparent text-[#7A8690] hover:text-[#16222F]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: PROFILE & VERIFICATION */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Identity Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2">
                      <p className="font-bold text-[#16222F] uppercase text-[10px] tracking-wider text-[#7A8690]">
                        Craft & Profession
                      </p>
                      <p className="font-semibold text-sm text-[#16222F]">
                        {selectedUser.profession || 'Not documented'}
                      </p>
                      <p className="text-[#52606D] text-xs">
                        {selectedUser.shortBio || 'No biography entered.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2">
                      <p className="font-bold text-[#16222F] uppercase text-[10px] tracking-wider text-[#7A8690]">
                        Contact & Coordinates
                      </p>
                      <div className="space-y-1.5 text-xs text-[#52606D]">
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#7A8690]" />
                          <span>{selectedUser.email || 'None registered'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#7A8690]" />
                          <span>{selectedUser.phone || 'None registered'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#7A8690]" />
                          <span>{selectedUser.location || 'Location not specified'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-[#7A8690]" />
                          <span>{selectedUser.yearsOfExperience || 0} years professional experience</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Demonstrations */}
                  <div className="p-4 rounded-xl bg-white border border-[#E7E2D8] space-y-3">
                    <p className="font-bold text-[#16222F]">Claimed & Demonstrated Skills</p>
                    {selectedUser.skills && selectedUser.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUser.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[#2D4D45] border border-[#CFE2D9] text-xs font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#7A8690]">No skills tagged yet.</p>
                    )}
                  </div>

                  {/* Documented Work Records in Sabi */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#16222F]">
                        Documented Proof Records ({selectedUserWorks.length})
                      </p>
                    </div>

                    {selectedUserWorks.length === 0 ? (
                      <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] text-center text-[#7A8690]">
                        This professional has not documented any work records yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedUserWorks.map((work) => (
                          <div
                            key={work.id}
                            className="p-3.5 rounded-xl border border-[#E7E2D8] bg-white hover:bg-[#FAF8F5]/60 transition-colors flex items-start justify-between gap-4"
                          >
                            <div>
                              <p className="font-bold text-[#16222F] text-xs">{work.title}</p>
                              <p className="text-[11px] text-[#52606D] mt-0.5">{work.category}</p>
                              <p className="text-[10px] text-[#7A8690] mt-1 line-clamp-1">
                                {work.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {work.confirmationStatus === 'confirmed' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Client Confirmed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-stone-100 text-[#52606D] text-[10px]">
                                  Self-Documented
                                </span>
                              )}

                              {work.isTakenDown && (
                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                  Moderated
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GOVERNANCE & STATUS */}
              {activeTab === 'governance' && (
                <div className="space-y-6">
                  {/* Active Status Banner */}
                  <div className="p-4 rounded-2xl border border-[#E7E2D8] bg-[#FAF8F5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#16222F]">Current Account Standing</span>
                      <span className="font-mono text-[11px] uppercase font-bold text-[#2D4D45]">
                        {operationsService.getUserAccountStatus(selectedUser)}
                      </span>
                    </div>

                    {selectedUser.isSuspended && selectedUser.suspensionDetails && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 mt-2">
                        <p className="font-bold flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-700" />
                          Account Temporarily Suspended
                        </p>
                        <p className="text-xs">Reason: "{selectedUser.suspensionDetails.reason}"</p>
                        {selectedUser.suspensionDetails.internalNote && (
                          <p className="text-[11px] text-rose-800">
                            Internal Note: {selectedUser.suspensionDetails.internalNote}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] text-rose-700 pt-1 font-mono">
                          <span>Duration: {selectedUser.suspensionDetails.duration}</span>
                          <span>Suspended By: {selectedUser.suspensionDetails.suspendedBy}</span>
                          {selectedUser.suspensionDetails.expiresAt && (
                            <span>
                              Expires: {new Date(selectedUser.suspensionDetails.expiresAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedUser.isDeactivated && selectedUser.deactivationDetails && (
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 space-y-1 mt-2">
                        <p className="font-bold flex items-center gap-1.5">
                          <UserX className="w-4 h-4 text-slate-700" />
                          Account Deactivated
                        </p>
                        <p className="text-xs">Reason: "{selectedUser.deactivationDetails.reason}"</p>
                        <p className="text-[10px] text-slate-600">
                          Eligible for appeal restoration: {selectedUser.deactivationDetails.isEligibleForRestoration ? 'Yes' : 'No (Permanent Policy Deactivation)'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Restrict Specific Capabilities Section */}
                  <div className="p-5 rounded-2xl border border-[#E7E2D8] bg-white space-y-4">
                    <div>
                      <h4 className="font-bold text-[#16222F] text-sm flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#2D4D45]" />
                        Restrict Specific Capabilities
                      </h4>
                      <p className="text-xs text-[#52606D] mt-0.5">
                        Enact targeted platform restrictions without fully suspending login access.
                      </p>
                    </div>

                    {restrictionSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {restrictionSuccessMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="p-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingRestrictions.cannotRequestConfirmations}
                          onChange={(e) =>
                            setEditingRestrictions({
                              ...editingRestrictions,
                              cannotRequestConfirmations: e.target.checked,
                            })
                          }
                          className="mt-1 rounded text-[#2D4D45] focus:ring-[#2D4D45]"
                        />
                        <div>
                          <p className="font-bold text-[#16222F]">Restrict Confirmation Requests</p>
                          <p className="text-[11px] text-[#52606D]">
                            Prevent user from dispatching cryptographic proof verification requests to clients.
                          </p>
                        </div>
                      </label>

                      <label className="p-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingRestrictions.cannotMessage}
                          onChange={(e) =>
                            setEditingRestrictions({
                              ...editingRestrictions,
                              cannotMessage: e.target.checked,
                            })
                          }
                          className="mt-1 rounded text-[#2D4D45] focus:ring-[#2D4D45]"
                        />
                        <div>
                          <p className="font-bold text-[#16222F]">Restrict Direct Messaging</p>
                          <p className="text-[11px] text-[#52606D]">
                            Bar initiating or replying to private peer-to-peer conversations.
                          </p>
                        </div>
                      </label>

                      <label className="p-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingRestrictions.cannotPublishWork}
                          onChange={(e) =>
                            setEditingRestrictions({
                              ...editingRestrictions,
                              cannotPublishWork: e.target.checked,
                            })
                          }
                          className="mt-1 rounded text-[#2D4D45] focus:ring-[#2D4D45]"
                        />
                        <div>
                          <p className="font-bold text-[#16222F]">Restrict Work Publishing</p>
                          <p className="text-[11px] text-[#52606D]">
                            Disallow logging or adding new work records or evidence items.
                          </p>
                        </div>
                      </label>

                      <label className="p-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingRestrictions.cannotAppearInDiscover}
                          onChange={(e) =>
                            setEditingRestrictions({
                              ...editingRestrictions,
                              cannotAppearInDiscover: e.target.checked,
                            })
                          }
                          className="mt-1 rounded text-[#2D4D45] focus:ring-[#2D4D45]"
                        />
                        <div>
                          <p className="font-bold text-[#16222F]">Exclude from Discovery</p>
                          <p className="text-[11px] text-[#52606D]">
                            Suppress profile from the public SABI Discover directory.
                          </p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#16222F] mb-1">
                        Reason / Administrative Justification
                      </label>
                      <input
                        type="text"
                        value={restrictionReasonInput}
                        onChange={(e) => setRestrictionReasonInput(e.target.value)}
                        placeholder="E.g. Temporary investigation of reported messaging conduct..."
                        className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveRestrictions}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#233C36] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isSubmitting ? 'Saving...' : 'Apply Capability Restrictions'}
                      </button>
                    </div>
                  </div>

                  {/* Primary State Transition Actions */}
                  <div className="p-5 rounded-2xl border border-[#E7E2D8] bg-[#FAF8F5] space-y-3">
                    <p className="font-bold text-[#16222F]">Administrative State Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.isSuspended ? (
                        <button
                          onClick={() => {
                            setUnsuspendModalUser(selectedUser);
                            setUnsuspendReason('');
                            setUnsuspendInternalNote('');
                            setActionError(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                        >
                          Unsuspend & Restore Account
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSuspendModalUser(selectedUser);
                            setSuspendReason('');
                            setSuspendInternalNote('');
                            setSuspendDuration('7d');
                            setSuspendConfirmed(false);
                            setActionError(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer"
                        >
                          Suspend Account Temporarily
                        </button>
                      )}

                      {selectedUser.isDeactivated ? (
                        <button
                          onClick={() => {
                            setRestoreModalUser(selectedUser);
                            setRestoreReason('');
                            setActionError(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#233C36] text-white font-bold text-xs cursor-pointer"
                        >
                          Restore Deactivated Account
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setDeactivateModalUser(selectedUser);
                            setDeactivateReason('');
                            setDeactivateInternalNote('');
                            setDeactivateConfirmUsername('');
                            setIsEligibleForRestoration(true);
                            setActionError(null);
                          }}
                          className="px-4 py-2 rounded-xl border border-rose-300 text-rose-800 hover:bg-rose-100 font-bold text-xs cursor-pointer"
                        >
                          Deactivate Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SESSIONS & RECOVERY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Session Invalidation */}
                  <div className="p-5 rounded-2xl border border-[#E7E2D8] bg-white space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-[#16222F] text-sm flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-[#2D4D45]" />
                          Active Session Governance
                        </h4>
                        <p className="text-xs text-[#52606D] mt-0.5">
                          Immediately invalidate all active tokens and device sessions across web and mobile.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setForceLogoutModalUser(selectedUser);
                          setActionError(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Force Logout All Sessions
                      </button>
                    </div>

                    <div className="pt-2 text-[11px] text-[#7A8690] space-y-1 font-mono">
                      <p>
                        Session Generation Version: v{selectedUser.sessionVersion || 1}
                      </p>
                      <p>
                        Last Sessions Revocation:{' '}
                        {selectedUser.sessionsRevokedAt
                          ? new Date(selectedUser.sessionsRevokedAt).toLocaleString()
                          : 'Never forced'}
                      </p>
                    </div>
                  </div>

                  {/* Account Recovery Flow */}
                  <div className="p-5 rounded-2xl border border-[#E7E2D8] bg-[#FAF8F5] space-y-4">
                    <div>
                      <h4 className="font-bold text-[#16222F] text-sm flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#2D4D45]" />
                        Secure Account Recovery Workflow
                      </h4>
                      <p className="text-xs text-[#52606D] mt-0.5">
                        Generate a secure cryptographic recovery link valid for 24 hours. Under Zero-Trust security rules, passwords are never stored in plaintext or accessible to administrators.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E7E2D8] space-y-2">
                      <p className="text-xs text-[#16222F] font-semibold">
                        Zero-Trust Credential Protocol:
                      </p>
                      <p className="text-xs text-[#52606D]">
                        Clicking the button below generates a single-use high-entropy token associated with this user. This link can be provided to the verified account holder to regain entry and set new credentials.
                      </p>
                    </div>

                    {selectedUser.recoveryRecord && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                        <p className="font-bold">Recent Recovery Token Generated</p>
                        <p className="text-[11px]">
                          Issued at: {new Date(selectedUser.recoveryRecord.lastRecoveryTriggeredAt).toLocaleString()}
                        </p>
                        <p className="text-[11px]">
                          Expires at: {new Date(selectedUser.recoveryRecord.expiresAt).toLocaleString()}
                        </p>
                        <p className="text-[11px] font-mono truncate">
                          Link: {selectedUser.recoveryRecord.recoveryLink}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-start">
                      <button
                        onClick={() => handleTriggerRecovery(selectedUser)}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#233C36] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isSubmitting ? 'Generating Token...' : 'Generate Secure Recovery Link'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PLATFORM ACTIVITY */}
              {activeTab === 'activity' && selectedUserActivity && (
                <div className="space-y-6">
                  {/* Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                      <p className="text-[10px] uppercase font-bold text-[#7A8690]">Work Records</p>
                      <p className="text-xl font-mono font-bold text-[#16222F] mt-1">
                        {selectedUserActivity.workRecordsCount}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                      <p className="text-[10px] uppercase font-bold text-[#7A8690]">Client Confirmed</p>
                      <p className="text-xl font-mono font-bold text-emerald-700 mt-1">
                        {selectedUserActivity.confirmedRecordsCount}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                      <p className="text-[10px] uppercase font-bold text-[#7A8690]">Evidence Attached</p>
                      <p className="text-xl font-mono font-bold text-[#2D4D45] mt-1">
                        {selectedUserActivity.evidenceBackedCount}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8]">
                      <p className="text-[10px] uppercase font-bold text-[#7A8690]">Proof Ratio</p>
                      <p className="text-xl font-mono font-bold text-[#16222F] mt-1">
                        {selectedUserActivity.proofRatio}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-[#E7E2D8]">
                      <p className="text-xs font-bold text-[#16222F]">Conversations Engaged</p>
                      <p className="text-2xl font-mono font-bold text-[#16222F] mt-2">
                        {selectedUserActivity.conversationsCount}
                      </p>
                      <p className="text-[10px] text-[#7A8690] mt-1">Direct peer messaging threads</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E7E2D8]">
                      <p className="text-xs font-bold text-[#16222F]">Reports Involving User</p>
                      <p className="text-2xl font-mono font-bold text-amber-700 mt-2">
                        {selectedUserActivity.reportsAgainstCount}
                      </p>
                      <p className="text-[10px] text-[#7A8690] mt-1">Safety reports filed against account</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E7E2D8]">
                      <p className="text-xs font-bold text-[#16222F]">Reports Initiated</p>
                      <p className="text-2xl font-mono font-bold text-[#52606D] mt-2">
                        {selectedUserActivity.reportsFiledCount}
                      </p>
                      <p className="text-[10px] text-[#7A8690] mt-1">Reports flagged by this user</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#16222F] text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-[#2D4D45]" />
                      Account Governance Audit Trail
                    </h4>
                    <p className="text-xs text-[#52606D] mt-0.5">
                      Immutable log of all administrative actions, suspensions, restrictions, and recovery events targeting this user.
                    </p>
                  </div>

                  {selectedUserAuditLogs.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] text-[#7A8690]">
                      No recorded administrative actions on this account.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedUserAuditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl border border-[#E7E2D8] bg-white text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono font-bold text-[#2D4D45] text-[11px]">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-[#7A8690] font-mono">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[#16222F]">{log.details}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#7A8690] pt-1 border-t border-[#F0ECE1]">
                            <span>Officer: {log.actorName} ({log.actorEmail})</span>
                            {log.previousValue && log.newValue && (
                              <span>• Transition: {String(log.previousValue)} → {String(log.newValue)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SUSPEND ACCOUNT TEMPORARILY */}
      {/* ========================================================================= */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D8]">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Suspend {suspendModalUser.fullName}?
                </h3>
                <p className="text-xs text-[#52606D]">
                  This is a real administrative action. The user will be forcefully logged out and prevented from accessing Sabi.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {actionError}
              </div>
            )}

            {/* Quick Reason Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#16222F]">
                Quick Select Common Violation:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_SUSPENSION_REASONS.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSuspendReason(r)}
                    className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-stone-200/80 text-[10px] text-[#52606D] border border-[#E7E2D8] transition-colors cursor-pointer text-left"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Reason Input */}
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Reason for Suspension (Required, logged to Audit Trail)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Explain the specific violation or standard infraction..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
              />
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Suspension Duration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(
                  [
                    { id: '24h', label: '24 Hours' },
                    { id: '7d', label: '7 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: '90d', label: '90 Days' },
                    { id: 'indefinite', label: 'Indefinite' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSuspendDuration(d.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer text-center ${
                      suspendDuration === d.id
                        ? 'bg-[#2D4D45] text-white border-[#2D4D45]'
                        : 'bg-[#FAF8F5] text-[#52606D] border-[#E7E2D8] hover:bg-stone-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Internal Note */}
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Internal Note (Optional, for admin team reference only)
              </label>
              <input
                type="text"
                value={suspendInternalNote}
                onChange={(e) => setSuspendInternalNote(e.target.value)}
                placeholder="Case notes or ticket reference (e.g. SABI-8291)..."
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
              />
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/60 border border-rose-200 cursor-pointer">
              <input
                type="checkbox"
                checked={suspendConfirmed}
                onChange={(e) => setSuspendConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-rose-700 focus:ring-rose-700"
              />
              <span className="text-[11px] text-rose-950 font-medium leading-snug">
                I confirm that this suspension is warranted under Sabi community guidelines and will be recorded under my administrator identity.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="px-3.5 py-2 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSuspension}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Suspending User...' : 'Enact Account Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UNSUSPEND ACCOUNT */}
      {/* ========================================================================= */}
      {unsuspendModalUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D8]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Unsuspend {unsuspendModalUser.fullName}
                </h3>
                <p className="text-xs text-[#52606D]">
                  Restore normative platform privileges. This restoration will be written to the Audit Log.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Restoration Reason (Required)
              </label>
              <textarea
                value={unsuspendReason}
                onChange={(e) => setUnsuspendReason(e.target.value)}
                placeholder="E.g. Successful appeal resolution, compliance verified, or duration completed..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Internal Note (Optional)
              </label>
              <input
                type="text"
                value={unsuspendInternalNote}
                onChange={(e) => setUnsuspendInternalNote(e.target.value)}
                placeholder="Notes for the moderation log..."
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setUnsuspendModalUser(null)}
                className="px-3.5 py-2 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteUnsuspension}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Restoring...' : 'Confirm Account Restoration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DEACTIVATE ACCOUNT */}
      {/* ========================================================================= */}
      {deactivateModalUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D8]">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Deactivate Account: {deactivateModalUser.fullName}
                </h3>
                <p className="text-xs text-[#52606D]">
                  This removes the user from active operation and revokes all login sessions.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Deactivation Reason (Required)
              </label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="E.g. Repeated terms violation, account holder departure request..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
              />
            </div>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] cursor-pointer">
              <input
                type="checkbox"
                checked={isEligibleForRestoration}
                onChange={(e) => setIsEligibleForRestoration(e.target.checked)}
                className="rounded text-[#2D4D45] focus:ring-[#2D4D45]"
              />
              <span className="text-xs text-[#16222F] font-semibold">
                Account is eligible for future restoration upon administrative appeal
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Type username <span className="font-mono text-rose-700 font-bold">{deactivateModalUser.username}</span> to confirm:
              </label>
              <input
                type="text"
                value={deactivateConfirmUsername}
                onChange={(e) => setDeactivateConfirmUsername(e.target.value)}
                placeholder={deactivateModalUser.username}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-rose-600 focus:outline-none bg-[#FAF8F5]/60 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setDeactivateModalUser(null)}
                className="px-3.5 py-2 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeactivation}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Deactivating...' : 'Confirm Permanent Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESTORE DEACTIVATED ACCOUNT */}
      {/* ========================================================================= */}
      {restoreModalUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D8]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Restore Deactivated Account: {restoreModalUser.fullName}
                </h3>
                <p className="text-xs text-[#52606D]">
                  Reactivate this professional account and restore their portfolio profile.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Restoration Reason (Required)
              </label>
              <textarea
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="E.g. Approved formal appeal review..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setRestoreModalUser(null)}
                className="px-3.5 py-2 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRestoration}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#233C36] text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Restoring...' : 'Restore to Active Standing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: FORCE LOGOUT CONFIRMATION */}
      {/* ========================================================================= */}
      {forceLogoutModalUser && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D8]">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Revoke All Active Sessions?
                </h3>
                <p className="text-xs text-[#52606D]">
                  {forceLogoutModalUser.fullName} (@{forceLogoutModalUser.username})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#52606D]">
              This will immediately invalidate all browser and device tokens for this user. They will be logged out on their next network request and required to authenticate afresh.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setForceLogoutModalUser(null)}
                className="px-3.5 py-2 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteForceLogout}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Revoking...' : 'Force Logout All Sessions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ACCOUNT RECOVERY LINK GENERATED */}
      {/* ========================================================================= */}
      {recoveryModalData && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E7E2D8]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Secure Recovery Link Created
                </h3>
                <p className="text-xs text-[#52606D]">
                  For {recoveryModalData.user.fullName} ({recoveryModalData.user.email || recoveryModalData.user.username})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#52606D]">
              Provide this single-use recovery link to the user. It allows them to securely regain access to their account without exposing passwords or security keys.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690]">
                  Single-Use Recovery URL
                </span>
                <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">
                  Valid 24 Hours
                </span>
              </div>
              <p className="font-mono text-xs text-[#16222F] break-all bg-white p-2.5 rounded-xl border border-[#E7E2D8]">
                {recoveryModalData.record.recoveryLink}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E7E2D8]">
              <span className="text-[11px] text-[#7A8690]">
                Logged in Audit Trail under {adminActor.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecoveryModalData(null)}
                  className="px-3.5 py-2 text-xs text-[#52606D] font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryModalData.record.recoveryLink);
                    setCopiedRecoveryLink(true);
                    setTimeout(() => setCopiedRecoveryLink(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#233C36] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedRecoveryLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
