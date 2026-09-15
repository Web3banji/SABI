import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserX,
  FileText,
  Search,
  Filter,
  Check,
  X,
  AlertOctagon,
  Eye,
  MessageSquare,
  Paperclip,
  ChevronRight,
  ArrowRight,
  User,
  Sparkles,
  RefreshCw,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ReportRecord,
  UserProfile,
  AdminUser,
  ReportStatus,
  ReportSeverity,
  ReportCategory,
} from '../../../types';
import { operationsService } from '../../../services/operationsService';
import { CaseInvestigationModal } from '../CaseInvestigationModal';

interface ReportsSectionProps {
  reports: ReportRecord[];
  users: UserProfile[];
  adminUser: AdminUser | null;
  adminUsers?: AdminUser[];
  onRefreshData: () => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  reports,
  users,
  adminUser,
  adminUsers = [],
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | ReportSeverity>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ReportCategory>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned_to_me' | 'unassigned'>('all');

  // Selected case for deep investigation modal
  const [selectedCase, setSelectedCase] = useState<ReportRecord | null>(null);

  // Quick Ingest / Test Flag Modal
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestType, setIngestType] = useState<'user_report' | 'system_heuristic'>('user_report');
  const [ingestCategory, setIngestCategory] = useState<ReportCategory>('fraudulent_proof');
  const [ingestSeverity, setIngestSeverity] = useState<ReportSeverity>('high');
  const [ingestReportedUserId, setIngestReportedUserId] = useState(users[0]?.id || '');
  const [ingestReason, setIngestReason] = useState('');
  const [ingestDetails, setIngestDetails] = useState('');

  // Counts
  const totalCount = reports.length;
  const openCount = reports.filter((r) => r.status === 'open' || (r.status as string) === 'pending').length;
  const underReviewCount = reports.filter((r) => r.status === 'under_review').length;
  const escalatedCount = reports.filter((r) => r.status === 'escalated').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const dismissedCount = reports.filter((r) => r.status === 'dismissed').length;

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (r.caseNumber && r.caseNumber.toLowerCase().includes(term)) ||
      r.id.toLowerCase().includes(term) ||
      r.reason.toLowerCase().includes(term) ||
      (r.details && r.details.toLowerCase().includes(term)) ||
      (r.reportedUserName && r.reportedUserName.toLowerCase().includes(term)) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(term)) ||
      (r.assignedModeratorName && r.assignedModeratorName.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    // Status Filter
    if (statusFilter !== 'all') {
      const normStatus = (r.status as string) === 'pending' ? 'open' : r.status;
      if (normStatus !== statusFilter) return false;
    }

    // Severity Filter
    if (severityFilter !== 'all') {
      if ((r.severity || 'medium') !== severityFilter) return false;
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      if (r.category !== categoryFilter) return false;
    }

    // Assignment Filter
    if (assignmentFilter === 'assigned_to_me') {
      if (r.assignedModeratorId !== adminUser?.id && r.assignedModeratorEmail !== adminUser?.email) {
        return false;
      }
    } else if (assignmentFilter === 'unassigned') {
      if (r.assignedModeratorId) return false;
    }

    return true;
  });

  const handleQuickAssignToMe = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!adminUser) return;
    const actor = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.fullName,
    };
    operationsService.assignReportCase(
      reportId,
      { id: adminUser.id, name: adminUser.fullName, email: adminUser.email },
      actor
    );
    onRefreshData();
  };

  const handleCreateTestReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestReason.trim()) return;

    const reportedUser = users.find((u) => u.id === ingestReportedUserId);
    const newReport: ReportRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caseNumber: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      source: ingestType,
      reporterId: ingestType === 'system_heuristic' ? 'system_heuristic' : (adminUser?.id || 'usr_reporter'),
      reporterName: ingestType === 'system_heuristic' ? 'Automated Heuristic Engine' : (adminUser?.fullName || 'Platform Auditor'),
      reporterEmail: ingestType === 'system_heuristic' ? 'heuristics@sabi.id' : adminUser?.email,
      reportedUserId: ingestReportedUserId,
      reportedUserName: reportedUser?.fullName || 'Target Creator',
      targetType: 'user',
      targetId: ingestReportedUserId,
      category: ingestCategory,
      severity: ingestSeverity,
      reason: ingestReason.trim(),
      details: ingestDetails.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentReports = operationsService.getReports();
    currentReports.unshift(newReport);
    operationsService.saveReports(currentReports);

    operationsService.logAuditEvent({
      action: 'USER_REPORT_SUBMITTED',
      category: 'reports',
      actorEmail: adminUser?.email || 'admin@sabi.id',
      actorName: adminUser?.fullName || 'Administrator',
      actorId: adminUser?.id || 'admin',
      targetType: 'REPORT',
      targetId: newReport.id,
      details: `New incident report ${newReport.caseNumber} filed: "${newReport.reason}"`,
    });

    setShowIngestModal(false);
    setIngestReason('');
    setIngestDetails('');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Workflow Header & Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-lg font-bold text-[#16222F]">
                Incident & Moderation Reports Queue
              </h2>
            </div>
            <p className="text-xs text-[#52606D]">
              Operate the end-to-end Sabi moderation workflow: review incoming reports, investigate proof fraud, attach audit evidence, and enforce real governance decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIngestModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate / Log Case</span>
            </button>
            <button
              onClick={onRefreshData}
              className="p-2 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-[#52606D] hover:text-[#16222F] transition-colors cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workflow Lifecycle Visual Bar */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#7A8690] shrink-0">
            Standard Moderation Workflow:
          </span>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#16222F] flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E2D8]">1. Report Submitted</span>
            <ArrowRight className="w-3 h-3 text-[#7A8690]" />
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E2D8]">2. Review Queue</span>
            <ArrowRight className="w-3 h-3 text-[#7A8690]" />
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E2D8]">3. Investigation</span>
            <ArrowRight className="w-3 h-3 text-[#7A8690]" />
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E2D8]">4. Decision</span>
            <ArrowRight className="w-3 h-3 text-[#7A8690]" />
            <span className="px-2 py-0.5 rounded-md bg-[#2D4D45] text-white">5. Resolution</span>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-stone-100 border-[#16222F] shadow-xs'
                : 'bg-white border-[#E7E2D8] hover:bg-[#FAF8F5]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block">
              Total Cases
            </span>
            <span className="text-xl font-black font-mono text-[#16222F] mt-1 block">
              {totalCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('open')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'open'
                ? 'bg-rose-50 border-rose-400 shadow-xs'
                : 'bg-white border-[#E7E2D8] hover:bg-rose-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                Open
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <span className="text-xl font-black font-mono text-rose-900 mt-1 block">
              {openCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('under_review')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'under_review'
                ? 'bg-amber-50 border-amber-400 shadow-xs'
                : 'bg-white border-[#E7E2D8] hover:bg-amber-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Under Review
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <span className="text-xl font-black font-mono text-amber-900 mt-1 block">
              {underReviewCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('escalated')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'escalated'
                ? 'bg-purple-50 border-purple-400 shadow-xs'
                : 'bg-white border-[#E7E2D8] hover:bg-purple-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                Escalated
              </span>
              <AlertOctagon className="w-3 h-3 text-purple-600" />
            </div>
            <span className="text-xl font-black font-mono text-purple-900 mt-1 block">
              {escalatedCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('resolved')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-[#EAF3EF] border-[#2D4D45] shadow-xs'
                : 'bg-white border-[#E7E2D8] hover:bg-[#EAF3EF]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D4D45]">
                Resolved
              </span>
              <CheckCircle2 className="w-3 h-3 text-[#2D4D45]" />
            </div>
            <span className="text-xl font-black font-mono text-[#2D4D45] mt-1 block">
              {resolvedCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('dismissed')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'dismissed'
                ? 'bg-stone-100 border-stone-400 shadow-xs'
                : 'bg-white border-[#E7E2D8] hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                Dismissed
              </span>
              <span className="w-2 h-2 rounded-full bg-stone-400" />
            </div>
            <span className="text-xl font-black font-mono text-stone-800 mt-1 block">
              {dismissedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7A8690] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports by Case ID, reason, creator name, reporter, or notes..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60 text-[#16222F]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8690] hover:text-[#16222F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-[#D5CEC2] bg-[#FAF8F5] text-[#16222F] focus:outline-none focus:border-[#2D4D45] w-full sm:w-auto"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-[#D5CEC2] bg-[#FAF8F5] text-[#16222F] focus:outline-none focus:border-[#2D4D45] w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              <option value="fraudulent_proof">Fraudulent Proof</option>
              <option value="inappropriate_evidence">Inappropriate Evidence</option>
              <option value="impersonation">Impersonation</option>
              <option value="harassment_conduct">Harassment / Conduct</option>
              <option value="copyright_dispute">Copyright Dispute</option>
              <option value="spam">Spam / Solicitation</option>
              <option value="unverified_client">Unverified Client Dispute</option>
              <option value="other">Other</option>
            </select>

            {/* Assignment Filter */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-[#D5CEC2] bg-[#FAF8F5] text-[#16222F] focus:outline-none focus:border-[#2D4D45] w-full sm:w-auto"
            >
              <option value="all">All Assignments</option>
              <option value="assigned_to_me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Quick Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#E7E2D8]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] pr-2 shrink-0">
            Status:
          </span>
          {(['all', 'open', 'under_review', 'escalated', 'resolved', 'dismissed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#2D4D45] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200 border border-[#E7E2D8]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[10px] font-black uppercase tracking-wider text-[#7A8690]">
                <th className="py-3.5 px-4">Case ID & Type</th>
                <th className="py-3.5 px-4">Reported Party / Content</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Moderator</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] text-[#7A8690] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-5 h-5 text-[#2D4D45]" />
                      </div>
                      <p className="text-xs font-bold text-[#16222F]">No reports match your current filter</p>
                      <p className="text-[11px] text-[#7A8690]">
                        Try loosening the severity or status parameters, or simulate a new test case.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setSeverityFilter('all');
                          setCategoryFilter('all');
                          setAssignmentFilter('all');
                        }}
                        className="mt-2 text-xs font-bold text-[#2D4D45] hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => {
                  const reportedUser = users.find((u) => u.id === r.reportedUserId);
                  const reporterUser = users.find((u) => u.id === r.reporterId);
                  const normStatus = (r.status as string) === 'pending' ? 'open' : r.status;
                  const isAssignedToCurrent =
                    r.assignedModeratorId === adminUser?.id || r.assignedModeratorEmail === adminUser?.email;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedCase(r)}
                      className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group"
                    >
                      {/* 1. Case ID & Category */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-[#16222F] bg-[#FAF8F5] border border-[#E7E2D8] px-1.5 py-0.5 rounded">
                            {r.caseNumber || r.id}
                          </span>
                          {r.source === 'system_heuristic' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                              Heuristic
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-[#16222F] group-hover:text-[#2D4D45] transition-colors line-clamp-1">
                          {r.reason}
                        </p>
                        <span className="text-[10px] text-[#7A8690] capitalize block">
                          {r.category?.replace('_', ' ') || 'Conduct issue'}
                        </span>
                      </td>

                      {/* 2. Reported Party / Content */}
                      <td className="py-4 px-4 align-top space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] flex items-center justify-center font-bold text-[10px] text-[#2D4D45] shrink-0">
                            {reportedUser?.fullName?.charAt(0) || r.reportedUserName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#16222F] truncate">
                              {reportedUser?.fullName || r.reportedUserName || 'Reported Creator'}
                            </p>
                            <p className="text-[10px] text-[#7A8690] truncate">
                              @{reportedUser?.username || 'user'}
                            </p>
                          </div>
                        </div>
                        {r.workRecordId && (
                          <div className="pt-0.5 flex items-center gap-1 text-[10px] text-[#7A8690]">
                            <FileText className="w-3 h-3 text-[#2D4D45]" />
                            <span>Linked Work Record</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Reporter */}
                      <td className="py-4 px-4 align-top">
                        {r.reporterIsAnonymous ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-[#52606D] flex items-center gap-1">
                              <Shield className="w-3 h-3 text-[#7A8690]" />
                              <span>Anonymous</span>
                            </span>
                            <span className="text-[9px] text-[#7A8690] block">Identity Shielded</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs text-[#16222F]">
                              {reporterUser?.fullName || r.reporterName || 'External User'}
                            </p>
                            <p className="text-[10px] text-[#7A8690] truncate">
                              {reporterUser?.email || r.reporterEmail || 'Verified User'}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 4. Severity */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            r.severity === 'critical'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : r.severity === 'high'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : r.severity === 'medium'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.severity === 'critical'
                                ? 'bg-rose-600'
                                : r.severity === 'high'
                                ? 'bg-amber-600'
                                : r.severity === 'medium'
                                ? 'bg-blue-600'
                                : 'bg-stone-500'
                            }`}
                          />
                          {r.severity || 'medium'}
                        </span>
                      </td>

                      {/* 5. Status */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            normStatus === 'open'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : normStatus === 'under_review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : normStatus === 'escalated'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : normStatus === 'resolved'
                              ? 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {normStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* 6. Assigned Moderator */}
                      <td className="py-4 px-4 align-top">
                        {r.assignedModeratorName ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs text-[#16222F] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2D4D45]" />
                              {r.assignedModeratorName}
                            </p>
                            <p className="text-[10px] text-[#7A8690] truncate">
                              {r.assignedModeratorEmail}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[11px] text-[#7A8690] italic">Unassigned</span>
                            {adminUser && normStatus !== 'resolved' && normStatus !== 'dismissed' && (
                              <button
                                onClick={(e) => handleQuickAssignToMe(r.id, e)}
                                className="text-[10px] font-bold text-[#2D4D45] hover:underline block cursor-pointer"
                              >
                                Take Case
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 7. Dates */}
                      <td className="py-4 px-4 align-top text-[11px] text-[#7A8690] space-y-0.5">
                        <p title={`Logged: ${new Date(r.createdAt).toLocaleString()}`}>
                          Created: {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                        <p title={`Updated: ${new Date(r.updatedAt || r.createdAt).toLocaleString()}`}>
                          Updated: {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* 8. Action Button */}
                      <td className="py-4 px-4 align-top text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(r);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#D5CEC2] hover:border-[#2D4D45] bg-[#FAF8F5] text-xs font-bold text-[#16222F] hover:bg-white transition-all cursor-pointer shadow-2xs group-hover:bg-[#2D4D45] group-hover:text-white group-hover:border-[#2D4D45]"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Investigation Drawer / Modal */}
      {selectedCase && (
        <CaseInvestigationModal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          report={selectedCase}
          adminUser={adminUser}
          users={users}
          adminUsers={adminUsers}
          onCaseUpdated={(updated) => {
            setSelectedCase(updated);
            onRefreshData();
          }}
          onRefreshAll={onRefreshData}
        />
      )}

      {/* Modal: Simulate / Log New Incident Case */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16222F]/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E7E2D8] p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#2D4D45]" />
                <h3 className="text-sm font-bold text-[#16222F]">Log / Simulate Incident Report</h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-[#7A8690] hover:text-[#16222F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#52606D]">
              Submit an incoming user abuse report or automated heuristic trigger directly into the review queue.
            </p>

            <form onSubmit={handleCreateTestReport} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Source Pipeline</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIngestType('user_report')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      ingestType === 'user_report'
                        ? 'bg-[#2D4D45] text-white border-[#2D4D45]'
                        : 'bg-[#FAF8F5] text-[#52606D] border-[#E7E2D8]'
                    }`}
                  >
                    User Report Submission
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestType('system_heuristic')}
                    className={`p-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      ingestType === 'system_heuristic'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-[#FAF8F5] text-[#52606D] border-[#E7E2D8]'
                    }`}
                  >
                    Automated Flag / Heuristic
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Reported Creator</label>
                <select
                  value={ingestReportedUserId}
                  onChange={(e) => setIngestReportedUserId(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Category</label>
                  <select
                    value={ingestCategory}
                    onChange={(e) => setIngestCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                  >
                    <option value="fraudulent_proof">Fraudulent Proof</option>
                    <option value="inappropriate_evidence">Inappropriate Evidence</option>
                    <option value="impersonation">Impersonation</option>
                    <option value="harassment_conduct">Harassment / Conduct</option>
                    <option value="copyright_dispute">Copyright Dispute</option>
                    <option value="spam">Spam / Solicitation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Severity</label>
                  <select
                    value={ingestSeverity}
                    onChange={(e) => setIngestSeverity(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Violation Headline / Reason *</label>
                <input
                  type="text"
                  value={ingestReason}
                  onChange={(e) => setIngestReason(e.target.value)}
                  placeholder="e.g. Fabricated client confirmation claim"
                  className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Incident Narrative Details</label>
                <textarea
                  rows={3}
                  value={ingestDetails}
                  onChange={(e) => setIngestDetails(e.target.value)}
                  placeholder="Specific description of the violation..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#D5CEC2] text-xs font-bold text-[#52606D] hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!ingestReason.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Submit Case to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
