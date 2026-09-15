import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Send,
  Filter,
  Search,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  UserCheck,
  Tag,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SupportTicket, AdminUser } from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface SupportSectionProps {
  tickets: SupportTicket[];
  adminUser: AdminUser | null;
  onRefreshData: () => void;
}

export const SupportSection: React.FC<SupportSectionProps> = ({
  tickets,
  adminUser,
  onRefreshData,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned_to_me' | 'unassigned'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active view tab inside ticket details: 'messages' | 'notes' | 'details'
  const [detailTab, setDetailTab] = useState<'messages' | 'notes' | 'details'>('messages');

  // Input states
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escalation and Resolution Modal States
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Derive current ticket
  const selectedTicket = useMemo(() => {
    return tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;
  }, [tickets, selectedTicketId]);

  // Current admin actor
  const actor = useMemo(() => {
    return {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Sabi Support Staff',
    };
  }, [adminUser]);

  // Metrics
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const escalatedCount = tickets.filter((t) => t.status === 'escalated').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  // Filtered ticket queue
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Assignment filter
      if (assignmentFilter === 'assigned_to_me') {
        if (!t.assignedToEmail || t.assignedToEmail.toLowerCase() !== actor.email.toLowerCase()) {
          return false;
        }
      } else if (assignmentFilter === 'unassigned') {
        if (t.assignedToEmail) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = t.ticketNumber.toLowerCase().includes(q);
        const matchSubj = t.subject.toLowerCase().includes(q);
        const matchUser = (t.userName || '').toLowerCase().includes(q) || (t.userEmail || '').toLowerCase().includes(q);
        const matchMsg = t.messages.some((m) => m.content.toLowerCase().includes(q));
        if (!matchNum && !matchSubj && !matchUser && !matchMsg) return false;
      }

      return true;
    });
  }, [tickets, statusFilter, assignmentFilter, categoryFilter, searchQuery, actor.email]);

  // Actions
  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsSubmitting(true);

    operationsService.replyToSupportTicket(
      selectedTicket.id,
      {
        senderName: actor.name,
        senderEmail: actor.email,
        isStaff: true,
        content: replyText.trim(),
      },
      actor
    );

    // If open, transition to in_progress
    if (selectedTicket.status === 'open') {
      operationsService.updateSupportTicketStatus(selectedTicket.id, 'in_progress', actor);
    }

    setReplyText('');
    setIsSubmitting(false);
    onRefreshData();
  };

  const handleAddInternalNote = () => {
    if (!selectedTicket || !internalNoteText.trim()) return;
    setIsSubmitting(true);

    operationsService.addSupportInternalNote(
      selectedTicket.id,
      internalNoteText.trim(),
      actor
    );

    setInternalNoteText('');
    setIsSubmitting(false);
    onRefreshData();
  };

  const handleAssignToMe = () => {
    if (!selectedTicket) return;
    operationsService.assignSupportTicket(
      selectedTicket.id,
      actor.email,
      actor.name,
      actor
    );
    onRefreshData();
  };

  const handleStatusChange = (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    operationsService.updateSupportTicketStatus(selectedTicket.id, status, actor);
    onRefreshData();
  };

  const handleConfirmEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!escalateReason.trim()) {
      setActionError('Escalation reason is required.');
      return;
    }

    operationsService.escalateSupportTicket(
      selectedTicket.id,
      escalateReason.trim(),
      actor
    );

    setIsEscalating(false);
    setEscalateReason('');
    setActionError(null);
    onRefreshData();
  };

  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!resolutionSummary.trim()) {
      setActionError('Resolution summary is required.');
      return;
    }

    operationsService.resolveSupportTicket(
      selectedTicket.id,
      resolutionSummary.trim(),
      actor
    );

    setIsResolving(false);
    setResolutionSummary('');
    setActionError(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <LifeBuoy className="w-4 h-4 text-rose-600" />
            <span>Open Tickets</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {openCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Awaiting first response</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>In Progress</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {inProgressCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Active investigation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
            <span>Escalated</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {escalatedCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Technical & trust review</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#2D4D45]" />
            <span>Resolved</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {resolvedCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Successfully concluded</p>
        </div>
      </div>

      {/* Main Support Workspace */}
      <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden">
        {/* Header & Global Filters */}
        <div className="p-4 sm:p-6 border-b border-[#E7E2D8] bg-[#FAF8F5] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#16222F]">
                Operations Support Desk & User Inquiries
              </h2>
              <p className="text-xs text-[#52606D]">
                Support client confirmations, investigate evidence verification issues, and resolve member tickets.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'open', 'in_progress', 'escalated', 'resolved', 'closed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#2D4D45] text-white shadow-xs'
                      : 'bg-white text-[#52606D] border border-[#E7E2D8] hover:bg-stone-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Secondary Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8690]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets by subject, ticket number, user name, or message..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value as typeof assignmentFilter)}
                className="px-3 py-2 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold text-[#16222F] focus:outline-none"
              >
                <option value="all">All Assignments</option>
                <option value="assigned_to_me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold text-[#16222F] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="proof_verification">Proof Verification</option>
                <option value="evidence_upload">Evidence Upload</option>
                <option value="client_confirmation">Client Confirmation</option>
                <option value="account_access">Account Access</option>
                <option value="general">General Support</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dual-Pane Queue & Ticket Detail Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E7E2D8] min-h-[640px]">
          {/* Left Pane: Ticket Queue (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col max-h-[700px] overflow-y-auto divide-y divide-[#E7E2D8] bg-[#FAF8F5]/30">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7A8690]">
                No support tickets match the selected filters.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const isAssignedToMe =
                  ticket.assignedToEmail?.toLowerCase() === actor.email.toLowerCase();

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-4 transition-all cursor-pointer text-xs space-y-2 ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-[#2D4D45] shadow-xs'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#2D4D45]">
                        {ticket.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            ticket.status === 'open'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : ticket.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : ticket.status === 'escalated'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-[#EAF3EF] text-[#2D4D45] border border-[#CFE2D9]'
                          }`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-[#16222F] line-clamp-1">
                      {ticket.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#7A8690] pt-0.5">
                      <span>{ticket.userName}</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Assigned badge & note count */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E7E2D8]/60 text-[10px]">
                      <span
                        className={`font-medium ${
                          isAssignedToMe
                            ? 'text-[#2D4D45] font-bold'
                            : ticket.assignedToName
                            ? 'text-stone-600'
                            : 'text-stone-400 italic'
                        }`}
                      >
                        {ticket.assignedToName ? `Assigned: ${ticket.assignedToName}` : 'Unassigned'}
                      </span>

                      {ticket.internalNotes && ticket.internalNotes.length > 0 && (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-mono">
                          {ticket.internalNotes.length} notes
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Pane: Ticket Detail Workspace (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-white">
            {selectedTicket ? (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="p-5 border-b border-[#E7E2D8] bg-[#FAF8F5]/60 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#2D4D45]">
                          {selectedTicket.ticketNumber}
                        </span>
                        <span className="text-[#7A8690]">·</span>
                        <span className="text-xs font-bold text-[#52606D] capitalize">
                          {selectedTicket.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#16222F]">
                        {selectedTicket.subject}
                      </h3>
                      <p className="text-[11px] text-[#7A8690]">
                        From: <strong className="text-[#16222F]">{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                      </p>
                    </div>

                    {/* Assignment & Status Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!selectedTicket.assignedToEmail ? (
                        <button
                          type="button"
                          onClick={handleAssignToMe}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#2D4D45] text-[#2D4D45] hover:bg-[#EAF3EF] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign to Me</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
                          {selectedTicket.assignedToName}
                        </span>
                      )}

                      {/* Status Dropdown */}
                      <select
                        value={selectedTicket.status}
                        onChange={(e) =>
                          handleStatusChange(e.target.value as SupportTicket['status'])
                        }
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D5CEC2] bg-white focus:outline-none focus:border-[#2D4D45]"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="escalated">Escalated</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Bar (Escalate / Resolve Quick Buttons) */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E7E2D8]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEscalating(true)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Escalate to Lead</span>
                      </button>

                      {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                        <button
                          type="button"
                          onClick={() => setIsResolving(true)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-[#2D4D45] bg-[#EAF3EF] hover:bg-[#2D4D45] hover:text-white border border-[#CFE2D9] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Ticket</span>
                        </button>
                      )}
                    </div>

                    {/* View Tabs */}
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setDetailTab('messages')}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                          detailTab === 'messages'
                            ? 'bg-[#2D4D45] text-white'
                            : 'text-[#7A8690] hover:text-[#16222F]'
                        }`}
                      >
                        Conversation ({selectedTicket.messages.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailTab('notes')}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                          detailTab === 'notes'
                            ? 'bg-amber-700 text-white'
                            : 'text-[#7A8690] hover:text-[#16222F]'
                        }`}
                      >
                        Internal Notes ({selectedTicket.internalNotes?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailTab('details')}
                        className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                          detailTab === 'details'
                            ? 'bg-stone-800 text-white'
                            : 'text-[#7A8690] hover:text-[#16222F]'
                        }`}
                      >
                        Audit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner: Escalated notice */}
                {selectedTicket.status === 'escalated' && (
                  <div className="p-3 bg-purple-50 border-b border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>
                        <strong>Escalated Case:</strong> {selectedTicket.escalatedReason || 'Awaiting technical verification.'}
                      </span>
                    </div>
                    {selectedTicket.escalatedBy && (
                      <span className="text-[10px] text-purple-700 font-mono">
                        By {selectedTicket.escalatedBy}
                      </span>
                    )}
                  </div>
                )}

                {/* Banner: Resolved notice */}
                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') &&
                  selectedTicket.resolutionSummary && (
                    <div className="p-3 bg-[#EAF3EF] border-b border-[#CFE2D9] text-[#16222F] text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2D4D45] shrink-0" />
                        <span>
                          <strong>Resolution Summary:</strong> {selectedTicket.resolutionSummary}
                        </span>
                      </div>
                      {selectedTicket.resolvedBy && (
                        <span className="text-[10px] text-[#2D4D45] font-mono">
                          Resolved by {selectedTicket.resolvedBy}
                        </span>
                      )}
                    </div>
                  )}

                {/* TAB 1: CONVERSATION THREAD */}
                {detailTab === 'messages' && (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                      {selectedTicket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl max-w-[85%] text-xs space-y-1 ${
                            m.isStaff
                              ? 'ml-auto bg-[#EAF3EF] border border-[#CFE2D9] text-[#16222F]'
                              : 'bg-[#FAF8F5] border border-[#E7E2D8] text-[#16222F]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px]">
                            <span className="font-bold">
                              {m.isStaff ? `Sabi Staff (${m.senderName})` : m.senderName}
                            </span>
                            <span className="text-[#7A8690] font-mono">
                              {new Date(m.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input Box */}
                    <div className="p-4 border-t border-[#E7E2D8] bg-[#FAF8F5]/50 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder="Type an official response to the user..."
                        className="flex-1 px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={isSubmitting || !replyText.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: INTERNAL STAFF NOTES */}
                {detailTab === 'notes' && (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          Internal notes are confidential staff records and are never visible to the user.
                        </span>
                      </div>

                      {(!selectedTicket.internalNotes || selectedTicket.internalNotes.length === 0) ? (
                        <div className="p-8 text-center text-xs text-[#7A8690]">
                          No internal notes recorded yet for this ticket.
                        </div>
                      ) : (
                        selectedTicket.internalNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold">
                              <span>Staff Note by {note.authorName}</span>
                              <span className="font-mono text-amber-800">
                                {new Date(note.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-stone-800 leading-relaxed whitespace-pre-wrap">
                              {note.note}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Internal Note Input */}
                    <div className="p-4 border-t border-[#E7E2D8] bg-[#FAF8F5]/60 flex flex-col gap-2">
                      <textarea
                        rows={2}
                        value={internalNoteText}
                        onChange={(e) => setInternalNoteText(e.target.value)}
                        placeholder="Add private staff observation, investigation step, or verification check..."
                        className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-amber-600 focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddInternalNote}
                        disabled={isSubmitting || !internalNoteText.trim()}
                        className="self-end px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                      >
                        Add Internal Note
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: TICKET METADATA & AUDIT */}
                {detailTab === 'details' && (
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2D8]">
                      <div>
                        <span className="text-[10px] text-[#7A8690] uppercase font-bold block">
                          Ticket ID
                        </span>
                        <span className="font-mono font-bold text-[#16222F]">
                          {selectedTicket.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A8690] uppercase font-bold block">
                          Reference Number
                        </span>
                        <span className="font-mono font-bold text-[#2D4D45]">
                          {selectedTicket.ticketNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A8690] uppercase font-bold block">
                          Created At
                        </span>
                        <span className="text-[#16222F]">
                          {new Date(selectedTicket.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7A8690] uppercase font-bold block">
                          Assigned Moderator
                        </span>
                        <span className="text-[#16222F]">
                          {selectedTicket.assignedToName || 'Unassigned'}
                        </span>
                      </div>
                      {selectedTicket.escalatedAt && (
                        <div>
                          <span className="text-[10px] text-purple-700 uppercase font-bold block">
                            Escalated At
                          </span>
                          <span className="text-purple-900 font-mono">
                            {new Date(selectedTicket.escalatedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedTicket.resolvedAt && (
                        <div>
                          <span className="text-[10px] text-[#2D4D45] uppercase font-bold block">
                            Resolved At
                          </span>
                          <span className="text-[#2D4D45] font-mono">
                            {new Date(selectedTicket.resolvedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-[#7A8690]">
                Select a support inquiry from the queue to begin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Technical Escalation */}
      {isEscalating && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E7E2D8] shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700">
                <ArrowUpRight className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#16222F]">
                  Escalate Support Ticket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEscalating(false)}
                className="text-[#7A8690] hover:text-[#16222F]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#52606D]">
              Escalate ticket <strong className="font-mono">{selectedTicket.ticketNumber}</strong> to senior operations leads and platform engineers.
            </p>

            {actionError && (
              <div className="p-2 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleConfirmEscalation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#16222F] block mb-1">
                  Reason for Technical Escalation *
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Explain why this inquiry requires senior engineering or trust lead intervention..."
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-purple-600 focus:outline-none bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEscalating(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#52606D] hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ticket Resolution */}
      {isResolving && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E7E2D8] shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2D4D45]">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#16222F]">
                  Resolve Support Ticket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResolving(false)}
                className="text-[#7A8690] hover:text-[#16222F]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#52606D]">
              Record formal resolution summary for ticket <strong className="font-mono">{selectedTicket.ticketNumber}</strong>.
            </p>

            {actionError && (
              <div className="p-2 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
                {actionError}
              </div>
            )}

            <form onSubmit={handleConfirmResolution} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#16222F] block mb-1">
                  Resolution Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Summarize the action taken, client confirmation verified, or assistance provided..."
                  className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResolving(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#52606D] hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Resolve & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
