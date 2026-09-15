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
  UserCheck,
  FileText,
  ExternalLink,
  Lock,
  Unlock,
  Send,
  Paperclip,
  MessageSquare,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Check,
  History,
  Ban,
  User,
  AlertOctagon,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import {
  ReportRecord,
  UserProfile,
  AdminUser,
  ReportStatus,
  ModerationActionType,
  SuspensionDuration,
  UserRestrictions,
  AuditLogEntry,
  WorkRecord,
} from '../../types';
import { operationsService } from '../../services/operationsService';
import { db } from '../../services/db';

interface CaseInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportRecord;
  adminUser: AdminUser | null;
  users: UserProfile[];
  adminUsers: AdminUser[];
  onCaseUpdated: (updated: ReportRecord) => void;
  onRefreshAll: () => void;
}

export const CaseInvestigationModal: React.FC<CaseInvestigationModalProps> = ({
  isOpen,
  onClose,
  report,
  adminUser,
  users,
  adminUsers,
  onCaseUpdated,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'investigation' | 'decision' | 'audit'>('overview');

  // Internal Note form
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Evidence Attachment form
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [isAttachingEvidence, setIsAttachingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  // Assignment state
  const [selectedModeratorId, setSelectedModeratorId] = useState<string>(
    report.assignedModeratorId || (adminUser?.id ?? '')
  );
  const [isAssigning, setIsAssigning] = useState(false);

  // Escalation form
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationError, setEscalationError] = useState<string | null>(null);

  // Decision & Resolution form
  const [actionType, setActionType] = useState<ModerationActionType>('warning');
  const [decisionReason, setDecisionReason] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState<SuspensionDuration>('30d');
  const [restrictions, setRestrictions] = useState<UserRestrictions>({
    cannotRequestConfirmations: false,
    cannotMessage: false,
    cannotPublishWork: false,
    cannotAppearInDiscover: false,
  });
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [showConfirmDecision, setShowConfirmDecision] = useState(false);

  // Privacy & Confidentiality toggle
  const [revealReporterIdentity, setRevealReporterIdentity] = useState(false);

  if (!isOpen) return null;

  const currentActor = {
    id: adminUser?.id || 'admin',
    email: adminUser?.email || 'admin@sabi.id',
    name: adminUser?.fullName || 'Administrator',
  };

  const reportedUser = users.find((u) => u.id === report.reportedUserId);
  const reporterUser = users.find((u) => u.id === report.reporterId);
  const allWorks = db.getAllWorkRecords();
  const linkedWorkRecord = report.workRecordId
    ? allWorks.find((w) => w.id === report.workRecordId)
    : null;

  // Case audit logs
  const caseAuditLogs: AuditLogEntry[] = operationsService
    .getAuditLogs()
    .filter((log) => log.targetId === report.id || log.targetId === report.caseNumber || log.targetId === report.reportedUserId)
    .slice(0, 15);

  // Workflow stages calculation
  const isResolved = report.status === 'resolved';
  const isDismissed = report.status === 'dismissed';
  const isEscalated = report.status === 'escalated';
  const isUnderReview = report.status === 'under_review' || isEscalated || isResolved || isDismissed;
  const hasNotesOrEvidence = (report.internalNotes?.length || 0) > 0 || (report.evidenceAttachments?.length || 0) > 0;

  // Handlers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setIsAddingNote(true);
    setNoteError(null);

    const result = operationsService.addReportInternalNote(report.id, newNoteText.trim(), currentActor);
    setIsAddingNote(false);

    if (result.success) {
      setNewNoteText('');
      const updated = operationsService.getReportById(report.id);
      if (updated) onCaseUpdated(updated);
      onRefreshAll();
    } else {
      setNoteError(result.error || 'Failed to add note.');
    }
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) {
      setEvidenceError('Please enter a title for the evidence item.');
      return;
    }
    setIsAttachingEvidence(true);
    setEvidenceError(null);

    const result = operationsService.addReportEvidenceAttachment(
      report.id,
      {
        title: evidenceTitle.trim(),
        url: evidenceUrl.trim() || undefined,
        note: evidenceNote.trim() || undefined,
      },
      currentActor
    );
    setIsAttachingEvidence(false);

    if (result.success) {
      setEvidenceTitle('');
      setEvidenceUrl('');
      setEvidenceNote('');
      setShowAddEvidence(false);
      const updated = operationsService.getReportById(report.id);
      if (updated) onCaseUpdated(updated);
      onRefreshAll();
    } else {
      setEvidenceError(result.error || 'Failed to attach evidence.');
    }
  };

  const handleAssignModerator = () => {
    if (!selectedModeratorId) return;
    const targetAdmin = adminUsers.find((a) => a.id === selectedModeratorId);
    if (!targetAdmin) return;

    setIsAssigning(true);
    const result = operationsService.assignReportCase(
      report.id,
      {
        id: targetAdmin.id,
        name: targetAdmin.fullName,
        email: targetAdmin.email,
      },
      currentActor
    );
    setIsAssigning(false);

    if (result.success && result.report) {
      onCaseUpdated(result.report);
      onRefreshAll();
    }
  };

  const handleEscalateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationReason.trim() || escalationReason.trim().length < 5) {
      setEscalationError('A substantive escalation rationale (minimum 5 characters) is required.');
      return;
    }

    setIsEscalating(true);
    setEscalationError(null);

    const result = operationsService.escalateReportCase(report.id, escalationReason.trim(), currentActor);
    setIsEscalating(false);

    if (result.success && result.report) {
      setShowEscalateModal(false);
      setEscalationReason('');
      onCaseUpdated(result.report);
      onRefreshAll();
    } else {
      setEscalationError(result.error || 'Failed to escalate case.');
    }
  };

  const handleExecuteDecision = () => {
    if (!decisionReason.trim() || decisionReason.trim().length < 5) {
      setDecisionError('A formal decision reason (min 5 characters) is required for every moderation outcome.');
      return;
    }

    setIsSubmittingDecision(true);
    setDecisionError(null);

    if (actionType === 'dismiss') {
      const result = operationsService.dismissReportCase(report.id, decisionReason.trim(), currentActor);
      setIsSubmittingDecision(false);
      setShowConfirmDecision(false);
      if (result.success && result.report) {
        onCaseUpdated(result.report);
        onRefreshAll();
        onClose();
      } else {
        setDecisionError(result.error || 'Failed to dismiss case.');
      }
      return;
    }

    const result = operationsService.resolveReportCase(
      report.id,
      {
        actionTaken: actionType,
        decisionReason: decisionReason.trim(),
        resolutionNotes: resolutionSummary.trim() || undefined,
        actionDetails: `Moderation action "${actionType}" executed by ${currentActor.name}.`,
        duration: actionType === 'suspend_user' ? suspensionDuration : undefined,
        restrictions: actionType === 'restrict_account' ? restrictions : undefined,
        workRecordId: report.workRecordId,
      },
      currentActor
    );

    setIsSubmittingDecision(false);
    setShowConfirmDecision(false);

    if (result.success && result.report) {
      onCaseUpdated(result.report);
      onRefreshAll();
      onClose();
    } else {
      setDecisionError(result.error || 'Failed to resolve case.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16222F]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-[#E7E2D8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-[#FAF8F5] border-b border-[#E7E2D8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D4D45] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-[#16222F] bg-white border border-[#E7E2D8] px-2 py-0.5 rounded">
                  {report.caseNumber || report.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    report.severity === 'critical'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : report.severity === 'high'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : report.severity === 'medium'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  {report.severity || 'medium'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    report.status === 'open'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : report.status === 'under_review'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : report.status === 'escalated'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : report.status === 'resolved'
                      ? 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  {report.status.replace('_', ' ')}
                </span>
                {report.source === 'system_heuristic' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Automated Heuristic
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-[#16222F] mt-1">{report.reason}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report.status !== 'resolved' && report.status !== 'dismissed' && (
              <button
                onClick={() => setShowEscalateModal(true)}
                className="px-3 py-1.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-purple-700" />
                <span>Escalate</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7A8690] hover:text-[#16222F] hover:bg-white border border-transparent hover:border-[#E7E2D8] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Moderation Workflow Progress Tracker */}
        <div className="bg-white border-b border-[#E7E2D8] px-6 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1: Report Submitted */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2D4D45] text-white flex items-center justify-center text-[10px] font-bold">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold text-[#16222F]">1. Submitted</p>
                <p className="text-[9px] text-[#7A8690]">Initial receipt</p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#D5CEC2]" />

            {/* Step 2: Review Queue */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isUnderReview || report.assignedModeratorId
                    ? 'bg-[#2D4D45] text-white'
                    : 'bg-[#FAF8F5] border border-[#D5CEC2] text-[#7A8690]'
                }`}
              >
                {isUnderReview || report.assignedModeratorId ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold text-[#16222F]">2. Review Queue</p>
                <p className="text-[9px] text-[#7A8690]">
                  {report.assignedModeratorName ? 'Assigned' : 'Awaiting officer'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#D5CEC2]" />

            {/* Step 3: Investigation */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  hasNotesOrEvidence || isResolved || isDismissed
                    ? 'bg-[#2D4D45] text-white'
                    : 'bg-[#FAF8F5] border border-[#D5CEC2] text-[#7A8690]'
                }`}
              >
                {hasNotesOrEvidence || isResolved || isDismissed ? <Check className="w-3.5 h-3.5" /> : '3'}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold text-[#16222F]">3. Investigation</p>
                <p className="text-[9px] text-[#7A8690]">
                  {hasNotesOrEvidence ? 'Evidence attached' : 'Gathering facts'}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#D5CEC2]" />

            {/* Step 4: Decision & Resolution */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isResolved
                    ? 'bg-[#2D4D45] text-white'
                    : isDismissed
                    ? 'bg-stone-600 text-white'
                    : 'bg-[#FAF8F5] border border-[#D5CEC2] text-[#7A8690]'
                }`}
              >
                {isResolved ? <Check className="w-3.5 h-3.5" /> : isDismissed ? <X className="w-3.5 h-3.5" /> : '4'}
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-bold text-[#16222F]">4. Resolution</p>
                <p className="text-[9px] text-[#7A8690]">
                  {isResolved ? 'Action taken' : isDismissed ? 'Dismissed' : 'Pending outcome'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#FAF8F5] border-b border-[#E7E2D8] px-6 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#2D4D45] text-[#2D4D45]'
                : 'border-transparent text-[#7A8690] hover:text-[#16222F]'
            }`}
          >
            Case Overview & Facts
          </button>
          <button
            onClick={() => setActiveTab('investigation')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'investigation'
                ? 'border-[#2D4D45] text-[#2D4D45]'
                : 'border-transparent text-[#7A8690] hover:text-[#16222F]'
            }`}
          >
            <span>Notes & Evidence</span>
            {(report.internalNotes?.length || 0) + (report.evidenceAttachments?.length || 0) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EAF3EF] text-[#2D4D45] font-bold">
                {(report.internalNotes?.length || 0) + (report.evidenceAttachments?.length || 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'decision'
                ? 'border-[#2D4D45] text-[#2D4D45]'
                : 'border-transparent text-[#7A8690] hover:text-[#16222F]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Decision & Actions</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-[#2D4D45] text-[#2D4D45]'
                : 'border-transparent text-[#7A8690] hover:text-[#16222F]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Case Audit Logs</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: OVERVIEW & CASE FACTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Assignment Banner */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E7E2D8] flex items-center justify-center text-[#2D4D45]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block">
                      Case Assignment
                    </span>
                    <p className="text-xs font-bold text-[#16222F]">
                      {report.assignedModeratorName
                        ? `Assigned to: ${report.assignedModeratorName} (${report.assignedModeratorEmail})`
                        : 'Unassigned (Case awaiting officer assignment)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedModeratorId}
                    onChange={(e) => setSelectedModeratorId(e.target.value)}
                    className="text-xs py-1.5 px-2.5 rounded-xl border border-[#D5CEC2] bg-white text-[#16222F] focus:outline-none focus:border-[#2D4D45]"
                  >
                    <option value="">Select Moderator...</option>
                    {adminUsers.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignModerator}
                    disabled={isAssigning || !selectedModeratorId}
                    className="px-3 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Case'}
                  </button>
                </div>
              </div>

              {/* Reported Content / Incident Narrative */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690]">
                    Incident Report Narrative
                  </span>
                  <span className="text-[11px] font-mono text-[#7A8690]">
                    Logged: {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] text-xs text-[#16222F] leading-relaxed whitespace-pre-wrap">
                  {report.details || 'No additional narrative text provided.'}
                </div>
              </div>

              {/* Two Column Layout: Reported User vs Reporter Party */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Reported Party Card */}
                <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690]">
                      Reported Party
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        reportedUser?.accountStatus === 'suspended'
                          ? 'bg-rose-100 text-rose-800'
                          : reportedUser?.accountStatus === 'restricted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#EAF3EF] text-[#2D4D45]'
                      }`}
                    >
                      {reportedUser?.accountStatus || 'active'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] flex items-center justify-center font-bold text-xs text-[#2D4D45]">
                      {reportedUser?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#16222F] truncate">
                        {reportedUser?.fullName || report.reportedUserName || 'Unknown User'}
                      </p>
                      <p className="text-[11px] text-[#7A8690] truncate">
                        @{reportedUser?.username || 'user'} • {reportedUser?.email || 'N/A'}
                      </p>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Discipline: {reportedUser?.profession || 'Creator'} • Location: {reportedUser?.location || 'Unspecified'}
                      </p>
                    </div>
                  </div>

                  {reportedUser?.warnings && reportedUser.warnings.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                      <span>Has {reportedUser.warnings.length} active formal warning(s) on file.</span>
                    </div>
                  )}

                  {reportedUser?.isSuspended && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-center gap-2">
                      <Ban className="w-4 h-4 shrink-0 text-rose-700" />
                      <span>Account currently suspended: "{reportedUser.suspendedReason || 'Administrative hold'}"</span>
                    </div>
                  )}
                </div>

                {/* Reporter Party Card with Privacy Protection */}
                <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690]">
                      Filing Reporter (Privacy Shielded)
                    </span>
                    {report.confidentialFlag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Confidential
                      </span>
                    )}
                  </div>

                  {report.reporterIsAnonymous && !revealReporterIdentity ? (
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#52606D]">
                        <EyeOff className="w-4 h-4 text-[#7A8690]" />
                        <span>Anonymous Reporter (Identity Shielded)</span>
                      </div>
                      <p className="text-[11px] text-[#7A8690]">
                        The filing party opted for confidential whistleblower protection.
                      </p>
                      {adminUser?.role === 'super_admin' && (
                        <button
                          onClick={() => setRevealReporterIdentity(true)}
                          className="mt-1 text-[11px] font-bold text-[#2D4D45] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Reveal Reporter Identity (Super Admin Override)</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E7E2D8] flex items-center justify-center font-bold text-xs text-[#52606D]">
                        {reporterUser?.fullName?.charAt(0) || report.reporterName?.charAt(0) || 'R'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#16222F] truncate">
                          {reporterUser?.fullName || report.reporterName || 'External Inquirer'}
                        </p>
                        <p className="text-[11px] text-[#7A8690] truncate">
                          {reporterUser?.email || report.reporterEmail || 'Confidential'}
                        </p>
                        <p className="text-[10px] text-[#7A8690] mt-1 font-mono">
                          Source: {report.source || 'user_report'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-[#7A8690] pt-2 border-t border-[#E7E2D8]">
                    Reports are shielded to prevent retaliatory harassment. Information is only exposed where necessary for formal investigation.
                  </div>
                </div>
              </div>

              {/* Linked Work Record (if reported content is a work record) */}
              {linkedWorkRecord && (
                <div className="p-5 rounded-2xl bg-white border border-[#E7E2D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690]">
                      Reported Work Record & Proof
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        linkedWorkRecord.isTakenDown
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-[#EAF3EF] text-[#2D4D45]'
                      }`}
                    >
                      {linkedWorkRecord.isTakenDown ? 'TAKEN DOWN' : 'ACTIVE IN DISCOVER'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#16222F]">{linkedWorkRecord.title}</h4>
                      <span className="text-[11px] text-[#7A8690]">Client: {linkedWorkRecord.clientName}</span>
                    </div>
                    <p className="text-xs text-[#52606D] line-clamp-2">{linkedWorkRecord.description}</p>
                    <div className="flex items-center gap-2 pt-2 text-[10px] text-[#7A8690]">
                      <span>Confirmation: {linkedWorkRecord.confirmationStatus}</span>
                      <span>•</span>
                      <span>Evidence status: {linkedWorkRecord.evidenceStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Escalation Banner if currently escalated */}
              {report.status === 'escalated' && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <AlertOctagon className="w-4 h-4 text-purple-700" />
                    <span>Case Escalated to Senior Operations</span>
                  </div>
                  <p className="text-xs text-purple-800 leading-relaxed">
                    Rationale: "{report.escalationReason || 'Senior review required.'}"
                  </p>
                  <p className="text-[10px] text-purple-600 font-mono">
                    Escalated by {report.escalatedBy || 'Operations Lead'} on{' '}
                    {report.escalatedAt ? new Date(report.escalatedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}

              {/* Resolution Summary Banner if resolved/dismissed */}
              {(report.status === 'resolved' || report.status === 'dismissed') && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    report.status === 'resolved'
                      ? 'bg-[#EAF3EF] border-[#CFE2D9] text-[#2D4D45]'
                      : 'bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Case {report.status === 'resolved' ? 'Resolved' : 'Dismissed'}: Action{' '}
                      <span className="capitalize">{report.actionTaken?.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Decision Reason: "{report.decisionReason || report.resolutionNotes || 'Case concluded'}"
                  </p>
                  <p className="text-[10px] font-mono opacity-80">
                    Resolved by {report.resolvedBy || 'Admin'} on{' '}
                    {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVESTIGATION, THREADED NOTES & EVIDENCE */}
          {activeTab === 'investigation' && (
            <div className="space-y-6">
              
              {/* Internal Notes Section */}
              <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#2D4D45]" />
                    <h4 className="text-xs font-bold text-[#16222F]">Internal Investigation Notes</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#7A8690]">
                    {report.internalNotes?.length || 0} notes
                  </span>
                </div>

                <div className="space-y-3">
                  {(!report.internalNotes || report.internalNotes.length === 0) ? (
                    <div className="p-6 text-center text-xs text-[#7A8690] bg-[#FAF8F5] rounded-xl border border-[#E7E2D8]">
                      No internal investigation notes logged yet. Notes are private to the administrative staff.
                    </div>
                  ) : (
                    report.internalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#16222F] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#2D4D45]" />
                            {note.authorName} ({note.authorEmail})
                          </span>
                          <span className="font-mono text-[10px] text-[#7A8690]">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#2A3B4C] leading-relaxed whitespace-pre-wrap pl-3.5">
                          {note.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-[#E7E2D8]">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block">
                    Add Confidential Case Note
                  </label>
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Document factual findings, contact history, or cross-checks..."
                    className="w-full text-xs p-3 rounded-xl border border-[#D5CEC2] bg-white text-[#16222F] focus:outline-none focus:border-[#2D4D45]"
                  />
                  {noteError && <p className="text-xs text-rose-600 font-semibold">{noteError}</p>}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingNote || !newNoteText.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAddingNote ? 'Saving...' : 'Add Case Note'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Attached Evidence Section */}
              <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#2D4D45]" />
                    <h4 className="text-xs font-bold text-[#16222F]">Relevant Case Evidence & Attachments</h4>
                  </div>
                  <button
                    onClick={() => setShowAddEvidence(!showAddEvidence)}
                    className="px-2.5 py-1 rounded-lg border border-[#D5CEC2] bg-[#FAF8F5] text-xs font-bold text-[#16222F] hover:bg-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Evidence</span>
                  </button>
                </div>

                {showAddEvidence && (
                  <form onSubmit={handleAddEvidence} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-3">
                    <h5 className="text-xs font-bold text-[#16222F]">Attach Evidence / Inspection Asset</h5>
                    <div>
                      <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Evidence Title *</label>
                      <input
                        type="text"
                        value={evidenceTitle}
                        onChange={(e) => setEvidenceTitle(e.target.value)}
                        placeholder="e.g. Disputed client email correspondence screenshot"
                        className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Asset URL / Screenshot Link</label>
                      <input
                        type="text"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#7A8690] block mb-1">Audit Explanatory Note</label>
                      <input
                        type="text"
                        value={evidenceNote}
                        onChange={(e) => setEvidenceNote(e.target.value)}
                        placeholder="Key observations or highlights..."
                        className="w-full text-xs p-2 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                      />
                    </div>
                    {evidenceError && <p className="text-xs text-rose-600 font-semibold">{evidenceError}</p>}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddEvidence(false)}
                        className="px-3 py-1.5 rounded-xl border border-[#D5CEC2] text-xs font-bold text-[#52606D] hover:bg-stone-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAttachingEvidence}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] cursor-pointer"
                      >
                        {isAttachingEvidence ? 'Attaching...' : 'Save Evidence'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {(!report.evidenceAttachments || report.evidenceAttachments.length === 0) ? (
                    <div className="p-6 text-center text-xs text-[#7A8690] bg-[#FAF8F5] rounded-xl border border-[#E7E2D8]">
                      No supplemental evidence items attached to this investigation yet.
                    </div>
                  ) : (
                    report.evidenceAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#16222F]">{att.title}</span>
                            {att.url && (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-[10px] font-bold text-[#2D4D45] hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Inspect link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          {att.note && <p className="text-[#52606D] text-[11px]">{att.note}</p>}
                          <p className="text-[10px] font-mono text-[#7A8690]">
                            Attached by {att.attachedBy} on {new Date(att.attachedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DECISION & RESOLUTION WORKBENCH */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D8]">
                  <div>
                    <h4 className="text-xs font-bold text-[#16222F]">
                      Moderation Enforcement Workbench
                    </h4>
                    <p className="text-[11px] text-[#52606D]">
                      Every moderation decision requires a clear reason, executes real backend actions on Sabi, and writes directly to immutable audit logs.
                    </p>
                  </div>
                </div>

                {/* Action Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block">
                    Choose Moderation Action
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {/* Action 1: Warning */}
                    <button
                      type="button"
                      onClick={() => setActionType('warning')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        actionType === 'warning'
                          ? 'border-[#2D4D45] bg-[#EAF3EF] shadow-xs ring-1 ring-[#2D4D45]'
                          : 'border-[#E7E2D8] bg-[#FAF8F5] hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-[#16222F]">Issue Formal Warning</span>
                      </div>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Adds an administrative warning record to user profile.
                      </p>
                    </button>

                    {/* Action 2: Remove / Restrict Content */}
                    <button
                      type="button"
                      onClick={() => setActionType('remove_content')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        actionType === 'remove_content'
                          ? 'border-[#2D4D45] bg-[#EAF3EF] shadow-xs ring-1 ring-[#2D4D45]'
                          : 'border-[#E7E2D8] bg-[#FAF8F5] hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-bold text-[#16222F]">Take Down Content</span>
                      </div>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Removes linked work record / proof from public discovery.
                      </p>
                    </button>

                    {/* Action 3: Restrict Capabilities */}
                    <button
                      type="button"
                      onClick={() => setActionType('restrict_account')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        actionType === 'restrict_account'
                          ? 'border-[#2D4D45] bg-[#EAF3EF] shadow-xs ring-1 ring-[#2D4D45]'
                          : 'border-[#E7E2D8] bg-[#FAF8F5] hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-bold text-[#16222F]">Restrict Account</span>
                      </div>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Disables specific capabilities (messages, confirmations, etc.).
                      </p>
                    </button>

                    {/* Action 4: Suspend Account */}
                    <button
                      type="button"
                      onClick={() => setActionType('suspend_user')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        actionType === 'suspend_user'
                          ? 'border-[#2D4D45] bg-[#EAF3EF] shadow-xs ring-1 ring-[#2D4D45]'
                          : 'border-[#E7E2D8] bg-[#FAF8F5] hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4 text-rose-700" />
                        <span className="text-xs font-bold text-[#16222F]">Suspend Account</span>
                      </div>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Temporary or indefinite account freeze and session revocation.
                      </p>
                    </button>

                    {/* Action 5: Unsuspend Account */}
                    <button
                      type="button"
                      onClick={() => setActionType('unsuspend_user')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        actionType === 'unsuspend_user'
                          ? 'border-[#2D4D45] bg-[#EAF3EF] shadow-xs ring-1 ring-[#2D4D45]'
                          : 'border-[#E7E2D8] bg-[#FAF8F5] hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#2D4D45]" />
                        <span className="text-xs font-bold text-[#16222F]">Unsuspend Account</span>
                      </div>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Restores an account proven innocent or upon appeal.
                      </p>
                    </button>

                    {/* Action 6: Dismiss Report */}
                    <button
                      type="button"
                      onClick={() => setActionType('dismiss')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        actionType === 'dismiss'
                          ? 'border-stone-800 bg-stone-100 shadow-xs ring-1 ring-stone-800'
                          : 'border-[#E7E2D8] bg-[#FAF8F5] hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-stone-600" />
                        <span className="text-xs font-bold text-[#16222F]">Dismiss Invalid Report</span>
                      </div>
                      <p className="text-[10px] text-[#7A8690] mt-1">
                        Concludes case as unfounded or duplicate without penalty.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Sub-configuration for Suspension */}
                {actionType === 'suspend_user' && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                      Suspension Duration
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {(['24h', '7d', '30d', '90d', 'indefinite'] as SuspensionDuration[]).map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setSuspensionDuration(dur)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            suspensionDuration === dur
                              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                              : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {dur === 'indefinite' ? 'Indefinite' : dur}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-configuration for Restrict Account */}
                {actionType === 'restrict_account' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                      Capabilities to Restrict
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restrictions.cannotMessage}
                          onChange={(e) => setRestrictions({ ...restrictions, cannotMessage: e.target.checked })}
                          className="rounded border-[#D5CEC2] text-[#2D4D45] focus:ring-0"
                        />
                        <span>Block direct messaging</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restrictions.cannotRequestConfirmations}
                          onChange={(e) =>
                            setRestrictions({ ...restrictions, cannotRequestConfirmations: e.target.checked })
                          }
                          className="rounded border-[#D5CEC2] text-[#2D4D45] focus:ring-0"
                        />
                        <span>Block client confirmations</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restrictions.cannotPublishWork}
                          onChange={(e) =>
                            setRestrictions({ ...restrictions, cannotPublishWork: e.target.checked })
                          }
                          className="rounded border-[#D5CEC2] text-[#2D4D45] focus:ring-0"
                        />
                        <span>Block new work submissions</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restrictions.cannotAppearInDiscover}
                          onChange={(e) =>
                            setRestrictions({ ...restrictions, cannotAppearInDiscover: e.target.checked })
                          }
                          className="rounded border-[#D5CEC2] text-[#2D4D45] focus:ring-0"
                        />
                        <span>Hide profile from Discover</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Mandatory Decision Reason */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block mb-1">
                    Formal Decision Reason (Mandatory) *
                  </label>
                  <textarea
                    rows={2}
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Document the exact findings, evidence verification, and policy basis for this action..."
                    className="w-full text-xs p-3 rounded-xl border border-[#D5CEC2] bg-white text-[#16222F] focus:outline-none focus:border-[#2D4D45]"
                  />
                </div>

                {/* Optional Resolution Summary */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block mb-1">
                    Internal Resolution Summary / Advice to User
                  </label>
                  <input
                    type="text"
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="e.g. Creator notified to submit re-authored evidence before reposting"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5CEC2] bg-white text-[#16222F] focus:outline-none focus:border-[#2D4D45]"
                  />
                </div>

                {decisionError && <p className="text-xs text-rose-600 font-semibold">{decisionError}</p>}

                {/* Execution Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!decisionReason.trim() || decisionReason.trim().length < 5) {
                        setDecisionError('A formal decision reason (min 5 characters) is required.');
                        return;
                      }
                      setShowConfirmDecision(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-all cursor-pointer shadow-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review & Execute Moderation Decision</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CASE AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#2D4D45]" />
                  <h4 className="text-xs font-bold text-[#16222F]">Immutable Case Audit Trail</h4>
                </div>
                <span className="text-[10px] font-mono text-[#7A8690]">
                  {caseAuditLogs.length} events logged
                </span>
              </div>

              {caseAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7A8690] bg-[#FAF8F5] rounded-xl border border-[#E7E2D8]">
                  No direct audit events matching this case ID yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E7E2D8] border border-[#E7E2D8] rounded-xl overflow-hidden">
                  {caseAuditLogs.map((log) => (
                    <div key={log.id} className="p-3 text-xs flex items-start justify-between gap-3 bg-[#FAF8F5]">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[10px] text-[#2D4D45] bg-[#EAF3EF] px-1.5 py-0.5 rounded">
                            {log.action}
                          </span>
                          <span className="font-bold text-[#16222F] text-[11px]">
                            {log.actorName} ({log.actorEmail})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#52606D]">{log.details}</p>
                      </div>
                      <span className="font-mono text-[10px] text-[#7A8690] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#E7E2D8] px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#7A8690] text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D4D45]" />
            <span>Sabi Operations Center • Incident Case Lifecycle Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#D5CEC2] hover:bg-stone-200 text-xs font-bold text-[#16222F] cursor-pointer"
          >
            Close Drawer
          </button>
        </div>
      </div>

      {/* MODAL: ESCALATE CASE */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#16222F]/70 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-purple-200 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
              <AlertOctagon className="w-5 h-5 text-purple-700" />
              <span>Escalate Case {report.caseNumber || report.id}</span>
            </div>
            <p className="text-xs text-[#52606D]">
              Escalating moves this case to the highest priority queue and alerts Senior Operations / Super Administrators for formal legal or integrity intervention.
            </p>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A8690] block mb-1">
                Escalation Rationale *
              </label>
              <textarea
                rows={3}
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Explain why standard moderation cannot resolve this (e.g. legal threat, forged government license)..."
                className="w-full text-xs p-3 rounded-xl border border-[#D5CEC2] focus:outline-none focus:border-purple-600"
              />
            </div>
            {escalationError && <p className="text-xs text-rose-600 font-semibold">{escalationError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D5CEC2] text-xs font-bold text-[#52606D] hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalateCase}
                disabled={isEscalating}
                className="px-4 py-1.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 cursor-pointer shadow-xs"
              >
                {isEscalating ? 'Escalating...' : 'Confirm Escalation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DECISION EXECUTION */}
      {showConfirmDecision && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#16222F]/70 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E7E2D8] p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#16222F] font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-[#2D4D45]" />
              <span>Confirm Moderation Enforcement</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2D8] space-y-2 text-xs">
              <p>
                <span className="font-bold text-[#7A8690]">Case ID:</span>{' '}
                <span className="font-mono font-bold text-[#16222F]">{report.caseNumber || report.id}</span>
              </p>
              <p>
                <span className="font-bold text-[#7A8690]">Target User:</span>{' '}
                <span className="font-bold text-[#16222F]">{reportedUser?.fullName || report.reportedUserName}</span>
              </p>
              <p>
                <span className="font-bold text-[#7A8690]">Enforcement Action:</span>{' '}
                <span className="font-bold text-rose-700 capitalize">{actionType.replace('_', ' ')}</span>
              </p>
              {actionType === 'suspend_user' && (
                <p>
                  <span className="font-bold text-[#7A8690]">Duration:</span>{' '}
                  <span className="font-bold text-[#16222F]">{suspensionDuration}</span>
                </p>
              )}
              <p>
                <span className="font-bold text-[#7A8690]">Decision Reason:</span> "{decisionReason}"
              </p>
            </div>
            <p className="text-[11px] text-[#7A8690] leading-relaxed">
              Executing will write directly to the persistent audit log, update account capabilities, and close this investigation case.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDecision(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D5CEC2] text-xs font-bold text-[#52606D] hover:bg-stone-100 cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleExecuteDecision}
                disabled={isSubmittingDecision}
                className="px-4 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] cursor-pointer shadow-xs"
              >
                {isSubmittingDecision ? 'Executing...' : 'Execute & Conclude Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
