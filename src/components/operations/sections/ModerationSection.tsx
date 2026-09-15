import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  ExternalLink,
  Award,
  XCircle,
  AlertOctagon,
  ArrowRight,
  UserX,
  MessageSquare,
  X,
} from 'lucide-react';
import { WorkRecord, UserProfile, AdminUser, ReportRecord } from '../../../types';
import { db } from '../../../services/db';
import { operationsService } from '../../../services/operationsService';

interface ModerationSectionProps {
  records: WorkRecord[];
  users: UserProfile[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
  onNavigateSection?: (section: string) => void;
}

export const ModerationSection: React.FC<ModerationSectionProps> = ({
  records,
  users,
  adminUser,
  onRefreshData,
  onNavigateSection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'taken_down' | 'active' | 'confirmed' | 'evidence'>('all');
  const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null);

  // Take down modal state
  const [takeDownRecord, setTakeDownRecord] = useState<WorkRecord | null>(null);
  const [takeDownReason, setTakeDownReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Warning creator modal state
  const [warningRecord, setWarningRecord] = useState<WorkRecord | null>(null);
  const [warningReason, setWarningReason] = useState('');
  const [warningNotes, setWarningNotes] = useState('');
  const [isWarningSubmitting, setIsWarningSubmitting] = useState(false);
  const [warningError, setWarningError] = useState<string | null>(null);
  const [warningSuccess, setWarningSuccess] = useState<string | null>(null);

  // Flag as incident report state
  const [flagRecord, setFlagRecord] = useState<WorkRecord | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSeverity, setFlagSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [isFlagSubmitting, setIsFlagSubmitting] = useState(false);
  const [flagSuccess, setFlagSuccess] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      (r.skillsDemonstrated && r.skillsDemonstrated.some((s) => s.toLowerCase().includes(term))) ||
      (r.clientName && r.clientName.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterStatus === 'taken_down') return !!r.isTakenDown;
    if (filterStatus === 'active') return !r.isTakenDown;
    if (filterStatus === 'confirmed') return r.confirmationStatus === 'confirmed';
    if (filterStatus === 'evidence') return r.evidenceStatus === 'attached' || r.evidenceStatus === 'verified';

    return true;
  });

  const handleTakeDown = () => {
    if (!takeDownRecord) return;
    if (!takeDownReason || takeDownReason.trim().length < 5) {
      setError('A substantive operational reason (min 5 characters) is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const success = db.takeDownWorkRecord(takeDownRecord.id, takeDownReason.trim(), actor);
    setIsSubmitting(false);

    if (success) {
      setTakeDownRecord(null);
      setTakeDownReason('');
      onRefreshData();
      if (selectedRecord && selectedRecord.id === takeDownRecord.id) {
        setSelectedRecord({ ...selectedRecord, isTakenDown: true, takeDownReason: takeDownReason.trim() });
      }
    } else {
      setError('Failed to take down record.');
    }
  };

  const handleRestore = (workId: string) => {
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const success = db.restoreWorkRecord(workId, actor);
    if (success) {
      onRefreshData();
      if (selectedRecord && selectedRecord.id === workId) {
        setSelectedRecord({ ...selectedRecord, isTakenDown: false, takeDownReason: undefined });
      }
    }
  };

  const handleIssueWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningRecord) return;
    if (!warningReason.trim() || warningReason.trim().length < 5) {
      setWarningError('A formal warning reason (min 5 characters) is required.');
      return;
    }

    setIsWarningSubmitting(true);
    setWarningError(null);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const result = operationsService.issueUserWarning(
      warningRecord.userId,
      warningReason.trim(),
      actor,
      warningNotes.trim() || undefined
    );

    setIsWarningSubmitting(false);
    if (result.success) {
      setWarningSuccess(`Warning successfully logged to creator's record.`);
      setTimeout(() => {
        setWarningRecord(null);
        setWarningReason('');
        setWarningNotes('');
        setWarningSuccess(null);
        onRefreshData();
      }, 1200);
    } else {
      setWarningError(result.error || 'Failed to issue warning.');
    }
  };

  const handleFlagAsIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagRecord) return;
    if (!flagReason.trim()) return;

    setIsFlagSubmitting(true);
    const creator = users.find((u) => u.id === flagRecord.userId);
    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const newReport: ReportRecord = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      caseNumber: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      source: 'user_report',
      reporterId: actor.id,
      reporterName: actor.name,
      reporterEmail: actor.email,
      reportedUserId: flagRecord.userId,
      reportedUserName: creator?.fullName || 'Creator',
      workRecordId: flagRecord.id,
      targetType: 'work_record',
      targetId: flagRecord.id,
      category: 'fraudulent_proof',
      severity: flagSeverity,
      reason: flagReason.trim(),
      details: `Work record "${flagRecord.title}" flagged during evidence inspection: ${flagReason.trim()}`,
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
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: newReport.id,
      details: `Work record "${flagRecord.title}" escalated to incident report queue as ${newReport.caseNumber}`,
    });

    setIsFlagSubmitting(false);
    setFlagSuccess(`Created incident case ${newReport.caseNumber} in the queue.`);
    setTimeout(() => {
      setFlagRecord(null);
      setFlagReason('');
      setFlagSuccess(null);
      onRefreshData();
      if (onNavigateSection) {
        onNavigateSection('reports');
      }
    }, 1200);
  };

  const getUserForRecord = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  return (
    <div className="space-y-6">
      {/* Moderation Header */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
          <div>
            <h2 className="text-lg font-bold text-[#16222F]">
              Work Record & Evidence Moderation Queue
            </h2>
            <p className="text-xs text-[#52606D]">
              Inspect proof authenticity, evidence attachments, client confirmations, and enforce integrity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateSection && (
              <button
                onClick={() => onNavigateSection('reports')}
                className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>Open Incident Reports Queue</span>
                <ArrowRight className="w-3 h-3 text-rose-700" />
              </button>
            )}
            <button
              onClick={onRefreshData}
              className="p-2 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-[#52606D] hover:text-[#16222F] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7A8690] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search work records by title, skills, client..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60 text-[#16222F]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'active', 'taken_down', 'confirmed', 'evidence'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === filter
                    ? 'bg-[#2D4D45] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-[#52606D] hover:bg-stone-200/60 border border-[#E7E2D8]'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Moderation Records Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D8] text-[#52606D] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Record Title & Creator</th>
                <th className="p-4">Status</th>
                <th className="p-4">Proof Tier</th>
                <th className="p-4">Demonstrated Skills</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D8]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#7A8690]">
                    No work records in this filter view.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const creator = getUserForRecord(r.userId);
                  const isConfirmed = r.confirmationStatus === 'confirmed';
                  const hasEvidence = r.evidenceStatus === 'attached' || r.evidenceStatus === 'verified';

                  return (
                    <tr key={r.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="p-4 max-w-xs">
                        <p className="font-bold text-[#16222F] truncate">{r.title}</p>
                        <p className="text-[11px] text-[#7A8690] truncate">
                          by {creator?.fullName || 'Unknown'} ({creator?.email || 'N/A'})
                        </p>
                      </td>

                      <td className="p-4">
                        {r.isTakenDown ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            Taken Down
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9] text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Public Active
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isConfirmed ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9] text-[10px] font-bold">
                              Confirmed
                            </span>
                          ) : hasEvidence ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                              Evidence
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px]">
                              Self-doc
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {(r.skillsDemonstrated || []).slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-[#52606D] whitespace-nowrap">
                        {r.completionDate || '—'}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRecord(r)}
                            className="px-2.5 py-1 rounded-lg border border-[#D5CEC2] hover:bg-stone-100 text-[#16222F] text-[11px] font-semibold cursor-pointer"
                          >
                            Inspect
                          </button>

                          {r.isTakenDown ? (
                            <button
                              onClick={() => handleRestore(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#EAF3EF] text-[#2D4D45] hover:bg-[#D7EAE1] text-[11px] font-bold cursor-pointer"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setTakeDownRecord(r);
                                setTakeDownReason('');
                                setError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold cursor-pointer"
                            >
                              Take Down
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

      {/* Record Inspect Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#E7E2D8] shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E7E2D8]">
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Work Record Evidence & Metadata
                </h3>
                <p className="text-xs text-[#7A8690]">ID: {selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#7A8690] hover:text-[#16222F] text-xs font-bold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-sm text-[#16222F]">{selectedRecord.title}</h4>
                <p className="text-[#52606D] mt-1">{selectedRecord.description || 'No description provided.'}</p>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2D8] grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-[#16222F] block">Client Name</span>
                  <span className="text-[#52606D]">{selectedRecord.clientName || 'Confidential / None'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#16222F] block">Client Email</span>
                  <span className="text-[#52606D]">{selectedRecord.clientEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#16222F] block">Completion Date</span>
                  <span className="text-[#52606D]">{selectedRecord.completionDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#16222F] block">Confirmation Status</span>
                  <span className="text-[#52606D] capitalize">{selectedRecord.confirmationStatus}</span>
                </div>
              </div>

              {selectedRecord.isTakenDown && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <p className="font-bold">Record Taken Down By Administrator</p>
                  <p className="text-[11px] mt-0.5">Reason: "{selectedRecord.takeDownReason}"</p>
                  <p className="text-[10px] text-rose-700 font-mono mt-0.5">
                    Moderator: {selectedRecord.moderatedBy} ({selectedRecord.moderatedAt ? new Date(selectedRecord.moderatedAt).toLocaleString() : ''})
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E7E2D8]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setWarningRecord(selectedRecord);
                    setWarningReason('');
                    setWarningNotes('');
                    setWarningError(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold cursor-pointer"
                >
                  Warn Creator
                </button>
                <button
                  onClick={() => {
                    setFlagRecord(selectedRecord);
                    setFlagReason(`Suspicious proof verification claim on "${selectedRecord.title}"`);
                    setFlagSeverity('high');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 text-xs font-bold cursor-pointer"
                >
                  Flag as Case
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedRecord.isTakenDown ? (
                  <button
                    onClick={() => handleRestore(selectedRecord.id)}
                    className="px-4 py-2 rounded-xl bg-[#2D4D45] text-white text-xs font-bold cursor-pointer"
                  >
                    Restore Work Record
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTakeDownRecord(selectedRecord);
                      setTakeDownReason('');
                      setError(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold cursor-pointer"
                  >
                    Take Down Work Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Take Down Confirmation Modal */}
      {takeDownRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#E7E2D8] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  Take Down "{takeDownRecord.title}"?
                </h3>
                <p className="text-xs text-[#52606D]">
                  This work record will be hidden from Discover and the creator's public profile.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">
                Reason for Take Down (Required)
              </label>
              <textarea
                value={takeDownReason}
                onChange={(e) => setTakeDownReason(e.target.value)}
                placeholder="E.g., Copyright dispute, unverified client claim, inappropriate evidence content..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2D8]">
              <button
                type="button"
                onClick={() => setTakeDownRecord(null)}
                className="px-3 py-1.5 text-xs text-[#52606D] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTakeDown}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Taking Down...' : 'Confirm Take Down'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Creator Modal */}
      {warningRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-amber-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">Issue Formal Creator Warning</h3>
                <p className="text-xs text-[#52606D]">Regarding work record "{warningRecord.title}"</p>
              </div>
            </div>

            {warningSuccess && (
              <div className="p-3 rounded-xl bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] text-xs font-bold">
                {warningSuccess}
              </div>
            )}
            {warningError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {warningError}
              </div>
            )}

            <form onSubmit={handleIssueWarning} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">Warning Reason *</label>
                <input
                  type="text"
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="e.g. Unverified claim on client deliverables"
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] bg-[#FAF8F5]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">Internal Note (Optional)</label>
                <textarea
                  value={warningNotes}
                  onChange={(e) => setWarningNotes(e.target.value)}
                  placeholder="Additional context for operations log..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] bg-[#FAF8F5]/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2D8]">
                <button
                  type="button"
                  onClick={() => setWarningRecord(null)}
                  className="px-3 py-1.5 text-xs text-[#52606D] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWarningSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
                >
                  {isWarningSubmitting ? 'Logging...' : 'Issue Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag as Incident Case Modal */}
      {flagRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-rose-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#16222F]">Escalate Work to Incident Queue</h3>
                <p className="text-xs text-[#52606D]">Creates a formal investigation case for this work item</p>
              </div>
            </div>

            {flagSuccess && (
              <div className="p-3 rounded-xl bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] text-xs font-bold">
                {flagSuccess}
              </div>
            )}

            <form onSubmit={handleFlagAsIncident} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">Severity Level</label>
                <select
                  value={flagSeverity}
                  onChange={(e) => setFlagSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] bg-[#FAF8F5]/50"
                >
                  <option value="critical">Critical (Immediate harm / copyright violation)</option>
                  <option value="high">High (Suspected fraudulent claim)</option>
                  <option value="medium">Medium (Requires confirmation verification)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">Allegation / Discrepancy *</label>
                <textarea
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Explain why this proof requires deep moderation triage..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] bg-[#FAF8F5]/50"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E2D8]">
                <button
                  type="button"
                  onClick={() => setFlagRecord(null)}
                  className="px-3 py-1.5 text-xs text-[#52606D] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFlagSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
                >
                  {isFlagSubmitting ? 'Escalating...' : 'Create Case & Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
