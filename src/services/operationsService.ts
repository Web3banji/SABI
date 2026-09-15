import {
  PlatformStatus,
  PlatformStatusRecord,
  PlatformStatusHistoryEntry,
  AdminUser,
  AdminRole,
  AuditLogEntry,
  AuditLogCategory,
  SupportTicket,
  OperationsNotification,
  PlatformSettings,
  ReportRecord,
  UserProfile,
  WorkRecord,
  AccountStatus,
  UserRestrictions,
  SuspensionDuration,
  SuspensionDetails,
  DeactivationDetails,
  AccountRecoveryRecord,
  Conversation,
  ReportStatus,
  ReportSeverity,
  ReportCategory,
  ModerationActionType,
  ModerationInternalNote,
  ModerationEvidenceAttachment,
  UserWarningRecord,
  CuratedCollection,
  DiscoverySectionConfig,
  CuratedTag,
  SupportInternalNote,
  VisibilityStatus,
} from '../types';

export interface AdminActor {
  id: string;
  email: string;
  name: string;
}

const OP_STORAGE_KEYS = {
  PLATFORM_STATUS: 'sabi_platform_status_v2',
  STATUS_HISTORY: 'sabi_status_history_v2',
  AUDIT_LOGS: 'sabi_audit_logs_v2',
  ADMIN_USERS: 'sabi_admin_users_v2',
  SUPPORT_TICKETS: 'sabi_support_tickets_v2',
  NOTIFICATIONS: 'sabi_notifications_v2',
  SETTINGS: 'sabi_platform_settings_v2',
  ACTIVE_ADMIN_SESSION: 'sabi_active_admin_session_v1',
  USERS: 'sabi_users_v1',
  WORK_RECORDS: 'sabi_work_records_v1',
  REPORTS: 'sabi_reports_v1',
  CONVERSATIONS: 'sabi_conversations_v1',
  CURATED_COLLECTIONS: 'sabi_curated_collections_v1',
  DISCOVERY_SECTIONS: 'sabi_discovery_sections_v1',
  CURATED_TAGS: 'sabi_curated_tags_v1',
};

// Registered default Root Super Admin
export const ROOT_ADMIN_EMAIL = 'oyebanjiisrael60@gmail.com';

const DEFAULT_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'col_client_proof',
    title: 'Verified Client Deliverables',
    slug: 'verified-client-deliverables',
    description: 'Direct independent confirmation from verified commissioners and enterprise clients.',
    badgeLabel: '100% Client Confirmed',
    accentColor: '#2D4D45',
    targetCategory: 'all',
    isActive: true,
    displayOrder: 1,
    featuredWorkIds: [],
    featuredUserIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: ROOT_ADMIN_EMAIL,
  },
  {
    id: 'col_craft_joinery',
    title: 'Tangible Craft & Architectural Fabrication',
    slug: 'tangible-craft-fabrication',
    description: 'Cabinetry, architectural millwork, bespoke timber creations, and structural joinery backed by walkthrough blueprints.',
    badgeLabel: 'Master Trades',
    accentColor: '#92400E',
    targetCategory: 'craft',
    isActive: true,
    displayOrder: 2,
    featuredWorkIds: [],
    featuredUserIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: ROOT_ADMIN_EMAIL,
  },
  {
    id: 'col_systems_eng',
    title: 'Full-Stack & Systems Architecture',
    slug: 'systems-architecture',
    description: 'Production web platforms, resilient distributed backends, and cryptographic ledger integrations.',
    badgeLabel: 'Engineering',
    accentColor: '#1E40AF',
    targetCategory: 'engineering',
    isActive: true,
    displayOrder: 3,
    featuredWorkIds: [],
    featuredUserIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: ROOT_ADMIN_EMAIL,
  },
  {
    id: 'col_brand_identity',
    title: 'Design Systems & Strategic Identity',
    slug: 'design-systems-identity',
    description: 'High-craft editorial typography, comprehensive brand architecture, and accessible UI component frameworks.',
    badgeLabel: 'Visual Design',
    accentColor: '#5B21B6',
    targetCategory: 'design',
    isActive: true,
    displayOrder: 4,
    featuredWorkIds: [],
    featuredUserIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: ROOT_ADMIN_EMAIL,
  },
];

const DEFAULT_DISCOVERY_SECTIONS: DiscoverySectionConfig[] = [
  {
    id: 'sec_hero',
    sectionKey: 'hero_highlights',
    title: "Curator's Spotlight & Featured Proofs",
    subtitle: 'Hand-vetted deliverable proofs exemplifying exceptional execution and verified client trust.',
    isEnabled: true,
    displayOrder: 1,
    itemLimit: 3,
    sortBy: 'priority',
    updatedAt: new Date().toISOString(),
    updatedBy: ROOT_ADMIN_EMAIL,
  },
  {
    id: 'sec_collections',
    sectionKey: 'curated_themes',
    title: 'Thematic Proof Collections',
    subtitle: 'Cross-disciplinary showcases organized by verified trade capabilities.',
    isEnabled: true,
    displayOrder: 2,
    itemLimit: 4,
    sortBy: 'priority',
    updatedAt: new Date().toISOString(),
    updatedBy: ROOT_ADMIN_EMAIL,
  },
  {
    id: 'sec_spotlight',
    sectionKey: 'spotlight_creators',
    title: 'Featured Professionals in Discover',
    subtitle: 'Proven practitioners with substantiated public deliverables and client reviews.',
    isEnabled: true,
    displayOrder: 3,
    itemLimit: 6,
    sortBy: 'client_confirmed',
    updatedAt: new Date().toISOString(),
    updatedBy: ROOT_ADMIN_EMAIL,
  },
  {
    id: 'sec_verified',
    sectionKey: 'verified_proofs',
    title: 'Recent Verified Client Confirmations',
    subtitle: 'Latest work deliverables independently countersigned by clients.',
    isEnabled: true,
    displayOrder: 4,
    itemLimit: 6,
    sortBy: 'recent',
    updatedAt: new Date().toISOString(),
    updatedBy: ROOT_ADMIN_EMAIL,
  },
];

const DEFAULT_CURATED_TAGS: CuratedTag[] = [
  { id: 'tag_1', name: 'React', category: 'engineering', isFeatured: true, priorityOrder: 1, usageCount: 14 },
  { id: 'tag_2', name: 'TypeScript', category: 'engineering', isFeatured: true, priorityOrder: 2, usageCount: 12 },
  { id: 'tag_3', name: 'Architectural Millwork', category: 'craft', isFeatured: true, priorityOrder: 1, usageCount: 8 },
  { id: 'tag_4', name: 'UI/UX Design', category: 'design', isFeatured: true, priorityOrder: 1, usageCount: 15 },
  { id: 'tag_5', name: 'Joinery & Woodcraft', category: 'craft', isFeatured: true, priorityOrder: 2, usageCount: 9 },
  { id: 'tag_6', name: 'Bespoke Tailoring', category: 'fashion', isFeatured: true, priorityOrder: 1, usageCount: 6 },
  { id: 'tag_7', name: 'Brand Systems', category: 'design', isFeatured: true, priorityOrder: 2, usageCount: 11 },
  { id: 'tag_8', name: 'Next.js', category: 'engineering', isFeatured: true, priorityOrder: 3, usageCount: 10 },
  { id: 'tag_9', name: 'Commercial Photography', category: 'creative', isFeatured: true, priorityOrder: 1, usageCount: 7 },
  { id: 'tag_10', name: 'Technical Writing', category: 'freelance', isFeatured: false, priorityOrder: 4, usageCount: 5 },
];

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Operations Service read error for ${key}:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Operations Service write error for ${key}:`, err);
  }
}

// Initial Platform Status State
const DEFAULT_STATUS_RECORD: PlatformStatusRecord = {
  status: 'OPERATIONAL',
  previousStatus: 'OPERATIONAL',
  reason: 'Production system healthy and fully operational',
  changedBy: 'System Architect',
  changedByEmail: ROOT_ADMIN_EMAIL,
  changedById: 'sys_root',
  changedAt: new Date().toISOString(),
  publicNotice: 'All verified work records and client confirmation protocols are operational.',
};

// Initial Platform Settings
const DEFAULT_SETTINGS: PlatformSettings = {
  allowRegistrations: true,
  allowNewWorkSubmissions: true,
  allowClientConfirmations: true,
  requireEmailVerification: false,
  maxEvidenceUploadMB: 25,
  maxEvidencePerRecord: 10,
  publicDiscoveryEnabled: true,
  messagingEnabled: true,
  maintenanceNotice: 'Sabi is undergoing scheduled system optimization. Documented records remain safely verified in read-only mode.',
  suspensionNotice: 'Sabi platform operations are currently suspended under administrative review.',
  updatedAt: new Date().toISOString(),
  updatedBy: ROOT_ADMIN_EMAIL,
};

// Initial Seed Admins
const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin_root_1',
    email: ROOT_ADMIN_EMAIL,
    fullName: 'Israel Oyebanji',
    role: 'super_admin',
    active: true,
    addedAt: '2026-01-01T00:00:00.000Z',
    addedBy: 'SYSTEM_BOOTSTRAP',
    lastActiveAt: new Date().toISOString(),
    notes: 'Primary Platform Owner and Root Super Administrator',
  },
  {
    id: 'admin_mod_1',
    email: 'moderation@sabi.id',
    fullName: 'Trust & Safety Lead',
    role: 'moderator',
    active: true,
    addedAt: '2026-01-15T10:00:00.000Z',
    addedBy: ROOT_ADMIN_EMAIL,
    lastActiveAt: new Date().toISOString(),
    notes: 'Verification integrity and evidence audit coordinator',
  },
];

export const operationsService = {
  // ==========================================================================
  // 1. PLATFORM STATUS MANAGEMENT (CORE CONTROLLER)
  // ==========================================================================

  getPlatformStatus(): PlatformStatusRecord {
    return getStorage<PlatformStatusRecord>(OP_STORAGE_KEYS.PLATFORM_STATUS, DEFAULT_STATUS_RECORD);
  },

  getStatusHistory(): PlatformStatusHistoryEntry[] {
    const history = getStorage<PlatformStatusHistoryEntry[]>(OP_STORAGE_KEYS.STATUS_HISTORY, []);
    if (history.length === 0) {
      // Seed initial history record
      const initialEntry: PlatformStatusHistoryEntry = {
        id: 'hist_init_001',
        fromStatus: 'OPERATIONAL',
        toStatus: 'OPERATIONAL',
        reason: 'Initial production system deployment',
        changedBy: 'System Architect',
        changedByEmail: ROOT_ADMIN_EMAIL,
        changedById: 'sys_root',
        changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        publicNotice: 'System online.',
      };
      setStorage(OP_STORAGE_KEYS.STATUS_HISTORY, [initialEntry]);
      return [initialEntry];
    }
    return history;
  },

  /**
   * Transition Platform Status with mandatory justification, state history, and audit log.
   * Workflows supported:
   * OPERATIONAL -> SUSPENDED -> OPERATIONAL
   * OPERATIONAL -> MAINTENANCE -> OPERATIONAL
   */
  setPlatformStatus(
    newStatus: PlatformStatus,
    reason: string,
    actor: { id: string; email: string; name: string },
    options?: { publicNotice?: string; estimatedResolution?: string }
  ): { success: boolean; record: PlatformStatusRecord; error?: string } {
    if (!reason || reason.trim().length < 5) {
      return {
        success: false,
        record: this.getPlatformStatus(),
        error: 'A detailed operational reason (minimum 5 characters) is strictly required to change platform status.',
      };
    }

    const currentRecord = this.getPlatformStatus();
    const previousStatus = currentRecord.status;

    if (previousStatus === newStatus) {
      return {
        success: false,
        record: currentRecord,
        error: `Platform is already in ${newStatus} status.`,
      };
    }

    const now = new Date().toISOString();
    const newRecord: PlatformStatusRecord = {
      status: newStatus,
      previousStatus,
      reason: reason.trim(),
      changedBy: actor.name || actor.email,
      changedByEmail: actor.email,
      changedById: actor.id,
      changedAt: now,
      publicNotice: options?.publicNotice?.trim() || (
        newStatus === 'MAINTENANCE'
          ? this.getSettings().maintenanceNotice
          : newStatus === 'SUSPENDED'
          ? this.getSettings().suspensionNotice
          : 'Sabi services are fully operational.'
      ),
      estimatedResolution: options?.estimatedResolution?.trim(),
    };

    // Save current status
    setStorage(OP_STORAGE_KEYS.PLATFORM_STATUS, newRecord);

    // Append to status history
    const history = this.getStatusHistory();
    const historyEntry: PlatformStatusHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromStatus: previousStatus,
      toStatus: newStatus,
      reason: reason.trim(),
      changedBy: actor.name || actor.email,
      changedByEmail: actor.email,
      changedById: actor.id,
      changedAt: now,
      publicNotice: newRecord.publicNotice,
    };
    history.unshift(historyEntry);
    setStorage(OP_STORAGE_KEYS.STATUS_HISTORY, history);

    // Log to Audit Ledger
    this.logAuditEvent({
      action: `PLATFORM_STATUS_CHANGE_${previousStatus}_TO_${newStatus}`,
      category: 'platform',
      actorEmail: actor.email,
      actorName: actor.name || actor.email,
      actorId: actor.id,
      targetType: 'PLATFORM_STATE',
      targetId: 'platform_core',
      details: `Platform transitioned from ${previousStatus} to ${newStatus}. Reason: "${reason.trim()}". Public Notice: "${newRecord.publicNotice}"`,
      previousValue: previousStatus,
      newValue: newStatus,
      metadata: {
        estimatedResolution: options?.estimatedResolution,
      },
    });

    // Notify all active listeners across tabs / components
    this.broadcastPlatformStatusChange(newRecord);

    return { success: true, record: newRecord };
  },

  subscribeToPlatformStatus(callback: (status: PlatformStatusRecord) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformStatusRecord>;
      callback(customEvent.detail || this.getPlatformStatus());
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === OP_STORAGE_KEYS.PLATFORM_STATUS) {
        callback(this.getPlatformStatus());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sabi_platform_status_changed', handler);
      window.addEventListener('storage', storageHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sabi_platform_status_changed', handler);
        window.removeEventListener('storage', storageHandler);
      }
    };
  },

  broadcastPlatformStatusChange(record: PlatformStatusRecord) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<PlatformStatusRecord>('sabi_platform_status_changed', {
          detail: record,
        })
      );
    }
  },

  // ==========================================================================
  // 2. AUDIT LOGS LEDGER (IMMUTABLE OPERATIONAL RECORDS)
  // ==========================================================================

  getAuditLogs(): AuditLogEntry[] {
    const logs = getStorage<AuditLogEntry[]>(OP_STORAGE_KEYS.AUDIT_LOGS, []);
    if (logs.length === 0) {
      // Seed default baseline audit log entry
      const baseline: AuditLogEntry = {
        id: 'audit_base_001',
        action: 'PLATFORM_INITIALIZATION',
        category: 'platform',
        actorEmail: ROOT_ADMIN_EMAIL,
        actorName: 'Israel Oyebanji',
        actorId: 'sys_root',
        targetType: 'SYSTEM',
        targetId: 'sabi_core',
        details: 'Operations Center initialized with Zero-Trust Security Protocol',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      };
      setStorage(OP_STORAGE_KEYS.AUDIT_LOGS, [baseline]);
      return [baseline];
    }
    return logs;
  },

  logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    setStorage(OP_STORAGE_KEYS.AUDIT_LOGS, logs);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sabi_audit_logs_changed'));
    }
    return newEntry;
  },

  subscribeToAuditLogs(callback: () => void): () => void {
    const handler = () => callback();
    if (typeof window !== 'undefined') {
      window.addEventListener('sabi_audit_logs_changed', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sabi_audit_logs_changed', handler);
      }
    };
  },

  // ==========================================================================
  // 3. ADMIN ROLES & ACCESS CONTROL
  // ==========================================================================

  getAdminUsers(): AdminUser[] {
    const admins = getStorage<AdminUser[]>(OP_STORAGE_KEYS.ADMIN_USERS, []);
    if (admins.length === 0) {
      setStorage(OP_STORAGE_KEYS.ADMIN_USERS, DEFAULT_ADMINS);
      return DEFAULT_ADMINS;
    }
    // Ensure root email always has super_admin entry
    if (!admins.some((a) => a.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase())) {
      admins.unshift(DEFAULT_ADMINS[0]);
      setStorage(OP_STORAGE_KEYS.ADMIN_USERS, admins);
    }
    return admins;
  },

  checkAdminAuthorization(
    user: UserProfile | null | { email?: string; id?: string }
  ): { isAuthorized: boolean; role?: AdminRole; adminProfile?: AdminUser } {
    if (!user || !user.email) {
      // Check active elevated admin session if any
      const elevatedSession = getStorage<{ email: string; role: AdminRole; timestamp: number } | null>(
        OP_STORAGE_KEYS.ACTIVE_ADMIN_SESSION,
        null
      );
      if (elevatedSession && Date.now() - elevatedSession.timestamp < 86400000) {
        const adminUsers = this.getAdminUsers();
        const matched = adminUsers.find(
          (a) => a.email.toLowerCase() === elevatedSession.email.toLowerCase() && a.active
        );
        if (matched) {
          return { isAuthorized: true, role: matched.role, adminProfile: matched };
        }
      }
      return { isAuthorized: false };
    }

    const email = user.email.toLowerCase().trim();

    // The primary app owner / super admin is always authorized
    if (email === ROOT_ADMIN_EMAIL.toLowerCase()) {
      const rootAdmin = this.getAdminUsers().find((a) => a.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) || DEFAULT_ADMINS[0];
      return { isAuthorized: true, role: 'super_admin', adminProfile: rootAdmin };
    }

    const adminUsers = this.getAdminUsers();
    const matched = adminUsers.find((a) => a.email.toLowerCase() === email && a.active);

    if (matched) {
      return { isAuthorized: true, role: matched.role, adminProfile: matched };
    }

    return { isAuthorized: false };
  },

  setElevatedAdminSession(email: string, role: AdminRole): void {
    setStorage(OP_STORAGE_KEYS.ACTIVE_ADMIN_SESSION, {
      email: email.toLowerCase().trim(),
      role,
      timestamp: Date.now(),
    });
  },

  clearElevatedAdminSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(OP_STORAGE_KEYS.ACTIVE_ADMIN_SESSION);
    }
  },

  addAdminUser(
    adminData: { email: string; fullName: string; role: AdminRole; notes?: string },
    actor: { id: string; email: string; name: string }
  ): { success: boolean; admin?: AdminUser; error?: string } {
    const email = adminData.email.toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const admins = this.getAdminUsers();
    if (admins.some((a) => a.email.toLowerCase() === email)) {
      return { success: false, error: 'An administrator with this email already exists.' };
    }

    const newAdmin: AdminUser = {
      id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      fullName: adminData.fullName.trim() || email.split('@')[0],
      role: adminData.role,
      active: true,
      addedAt: new Date().toISOString(),
      addedBy: actor.email,
      notes: adminData.notes?.trim(),
      lastActiveAt: new Date().toISOString(),
    };

    admins.push(newAdmin);
    setStorage(OP_STORAGE_KEYS.ADMIN_USERS, admins);

    this.logAuditEvent({
      action: 'ADMIN_USER_ADD',
      category: 'roles',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'ADMIN_USER',
      targetId: newAdmin.id,
      details: `Added new administrator: ${newAdmin.fullName} (${newAdmin.email}) with role: ${newAdmin.role}`,
      newValue: newAdmin.role,
    });

    return { success: true, admin: newAdmin };
  },

  updateAdminUser(
    adminId: string,
    updates: Partial<Pick<AdminUser, 'role' | 'active' | 'fullName' | 'notes'>>,
    actor: { id: string; email: string; name: string }
  ): { success: boolean; error?: string } {
    const admins = this.getAdminUsers();
    const index = admins.findIndex((a) => a.id === adminId);
    if (index === -1) {
      return { success: false, error: 'Administrator record not found.' };
    }

    const existing = admins[index];
    if (existing.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase() && updates.active === false) {
      return { success: false, error: 'Cannot deactivate the root platform super administrator.' };
    }

    admins[index] = { ...existing, ...updates };
    setStorage(OP_STORAGE_KEYS.ADMIN_USERS, admins);

    this.logAuditEvent({
      action: 'ADMIN_USER_UPDATE',
      category: 'roles',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'ADMIN_USER',
      targetId: adminId,
      details: `Updated administrator ${existing.email}. Role: ${updates.role ?? existing.role}, Active: ${updates.active ?? existing.active}`,
      previousValue: existing.role,
      newValue: updates.role,
    });

    return { success: true };
  },

  removeAdminUser(
    adminId: string,
    actor: { id: string; email: string; name: string }
  ): { success: boolean; error?: string } {
    const admins = this.getAdminUsers();
    const target = admins.find((a) => a.id === adminId);
    if (!target) {
      return { success: false, error: 'Administrator record not found.' };
    }

    if (target.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot delete the root platform super administrator.' };
    }

    const filtered = admins.filter((a) => a.id !== adminId);
    setStorage(OP_STORAGE_KEYS.ADMIN_USERS, filtered);

    this.logAuditEvent({
      action: 'ADMIN_USER_DELETE',
      category: 'roles',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'ADMIN_USER',
      targetId: adminId,
      details: `Deleted administrator: ${target.fullName} (${target.email})`,
      previousValue: target.role,
    });

    return { success: true };
  },

  // ==========================================================================
  // 4. PLATFORM SETTINGS
  // ==========================================================================

  getSettings(): PlatformSettings {
    return getStorage<PlatformSettings>(OP_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings(
    newSettings: Partial<PlatformSettings>,
    actor: { id: string; email: string; name: string }
  ): PlatformSettings {
    const current = this.getSettings();
    const updated: PlatformSettings = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.email,
    };
    setStorage(OP_STORAGE_KEYS.SETTINGS, updated);

    this.logAuditEvent({
      action: 'PLATFORM_SETTINGS_UPDATE',
      category: 'settings',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SETTINGS',
      targetId: 'global_config',
      details: `Updated platform settings. Registrations: ${updated.allowRegistrations}, Work submissions: ${updated.allowNewWorkSubmissions}, Client confirmations: ${updated.allowClientConfirmations}`,
    });

    return updated;
  },

  // ==========================================================================
  // 5. SUPPORT TICKETS
  // ==========================================================================

  getSupportTickets(): SupportTicket[] {
    const tickets = getStorage<SupportTicket[]>(OP_STORAGE_KEYS.SUPPORT_TICKETS, []);
    if (tickets.length === 0) {
      // Seed initial sample inquiries for triage demonstration
      const initialTickets: SupportTicket[] = [
        {
          id: 'tkt_001',
          ticketNumber: 'SABI-8291',
          userEmail: 'kofi.boateng@example.com',
          userName: 'Kofi Boateng',
          subject: 'Client did not receive confirmation email link',
          category: 'confirmation_issue',
          status: 'open',
          priority: 'high',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          assignedTo: 'moderation@sabi.id',
          messages: [
            {
              id: 'msg_tkt_1',
              senderName: 'Kofi Boateng',
              senderEmail: 'kofi.boateng@example.com',
              isStaff: false,
              content: 'Hello, I requested independent client confirmation for my Custom Walnut Dining Table project yesterday. The client says they checked spam and haven’t seen the email yet. Can you check the token delivery status?',
              timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
          ],
        },
        {
          id: 'tkt_002',
          ticketNumber: 'SABI-8292',
          userEmail: 'sarah.adler@example.com',
          userName: 'Sarah Adler',
          subject: 'Clarification on video file upload limits for architectural walkthroughs',
          category: 'general',
          status: 'in_progress',
          priority: 'normal',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
          assignedTo: ROOT_ADMIN_EMAIL,
          messages: [
            {
              id: 'msg_tkt_2',
              senderName: 'Sarah Adler',
              senderEmail: 'sarah.adler@example.com',
              isStaff: false,
              content: 'What is the maximum allowed resolution or file size for video walkthrough evidence in the architecture category?',
              timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
            },
            {
              id: 'msg_tkt_3',
              senderName: 'Israel Oyebanji',
              senderEmail: ROOT_ADMIN_EMAIL,
              isStaff: true,
              content: 'Hi Sarah, currently direct video evidence supports up to 25MB walkthrough clips. For long-format 4K walkthroughs, we recommend hosting on YouTube/Vimeo unlisted and attaching the direct verified link.',
              timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
            },
          ],
        },
      ];
      setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, initialTickets);
      return initialTickets;
    }
    return tickets;
  },

  createSupportTicket(
    ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>,
    initialMessage: string
  ): SupportTicket {
    const tickets = this.getSupportTickets();
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt_${Date.now()}`,
      ticketNumber: `SABI-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderName: ticketData.userName,
          senderEmail: ticketData.userEmail,
          isStaff: false,
          content: initialMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    tickets.unshift(newTicket);
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);
    return newTicket;
  },

  replyToSupportTicket(
    ticketId: string,
    message: { senderName: string; senderEmail: string; isStaff: boolean; content: string },
    actor: { id: string; email: string; name: string }
  ): boolean {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    ticket.messages.push({
      id: `msg_${Date.now()}`,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      isStaff: message.isStaff,
      content: message.content.trim(),
      timestamp: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_REPLY',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Replied to support ticket ${ticket.ticketNumber} (${ticket.subject})`,
    });

    return true;
  },

  updateSupportTicketStatus(
    ticketId: string,
    status: SupportTicket['status'],
    actor: { id: string; email: string; name: string }
  ): boolean {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_STATUS_CHANGE',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Updated ticket ${ticket.ticketNumber} status from ${oldStatus} to ${status}`,
      previousValue: oldStatus,
      newValue: status,
    });

    return true;
  },

  /**
   * Assign a support ticket to an administrator or staff member.
   */
  assignSupportTicket(
    ticketId: string,
    assignedToEmail: string,
    assignedToName: string,
    actor: AdminActor
  ): boolean {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    const previousAssignee = ticket.assignedTo || 'Unassigned';
    ticket.assignedTo = assignedToEmail;
    ticket.assignedToName = assignedToName;
    ticket.updatedAt = new Date().toISOString();
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_ASSIGNED',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Assigned ticket ${ticket.ticketNumber} to ${assignedToName} (${assignedToEmail})`,
      previousValue: previousAssignee,
      newValue: assignedToEmail,
    });

    return true;
  },

  /**
   * Add a private staff-only internal note to a support ticket.
   */
  addSupportInternalNote(
    ticketId: string,
    noteText: string,
    actor: AdminActor
  ): boolean {
    const noteTrimmed = noteText.trim();
    if (!noteTrimmed) return false;

    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    const now = new Date().toISOString();
    const noteId = `snt_${Date.now()}`;

    if (!ticket.internalNotes) ticket.internalNotes = [];
    ticket.internalNotes.push({
      id: noteId,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: noteTrimmed,
      createdAt: now,
    });

    ticket.updatedAt = now;
    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_NOTE_ADDED',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Added internal staff note to ticket ${ticket.ticketNumber}`,
    });

    return true;
  },

  /**
   * Technically escalate a support ticket for engineering or senior attention.
   */
  escalateSupportTicket(
    ticketId: string,
    escalationReason: string,
    actor: AdminActor
  ): boolean {
    const reasonTrimmed = escalationReason.trim();
    if (!reasonTrimmed) return false;

    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    const now = new Date().toISOString();
    const previousStatus = ticket.status;
    ticket.status = 'escalated';
    ticket.escalationReason = reasonTrimmed;
    ticket.escalatedAt = now;
    ticket.escalatedBy = actor.name;
    ticket.priority = 'urgent';
    ticket.updatedAt = now;

    if (!ticket.internalNotes) ticket.internalNotes = [];
    ticket.internalNotes.push({
      id: `snt_${Date.now()}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: `TECHNICAL ESCALATION: ${reasonTrimmed}`,
      createdAt: now,
    });

    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_ESCALATED',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Escalated ticket ${ticket.ticketNumber} to engineering. Reason: "${reasonTrimmed}"`,
      previousValue: previousStatus,
      newValue: 'escalated',
    });

    return true;
  },

  /**
   * Resolve a support ticket with a comprehensive resolution summary.
   */
  resolveSupportTicket(
    ticketId: string,
    resolutionSummary: string,
    actor: AdminActor
  ): boolean {
    const summaryTrimmed = resolutionSummary.trim();
    if (!summaryTrimmed) return false;

    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    const now = new Date().toISOString();
    ticket.status = 'resolved';
    ticket.resolutionSummary = summaryTrimmed;
    ticket.resolvedAt = now;
    ticket.resolvedBy = actor.name;
    ticket.updatedAt = now;

    // Also append an official message into the conversation thread
    ticket.messages.push({
      id: `msg_res_${Date.now()}`,
      senderName: actor.name,
      senderEmail: actor.email,
      isStaff: true,
      content: `[RESOLUTION SUMMARY]: ${summaryTrimmed}`,
      timestamp: now,
    });

    setStorage(OP_STORAGE_KEYS.SUPPORT_TICKETS, tickets);

    this.logAuditEvent({
      action: 'SUPPORT_TICKET_RESOLVED',
      category: 'support',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'SUPPORT_TICKET',
      targetId: ticketId,
      details: `Resolved support ticket ${ticket.ticketNumber} with resolution summary: "${summaryTrimmed.slice(0, 100)}"`,
      previousValue: ticket.status,
      newValue: 'resolved',
    });

    return true;
  },

  // ==========================================================================
  // 6. PLATFORM NOTIFICATIONS & BROADCASTS
  // ==========================================================================

  getNotifications(): OperationsNotification[] {
    const notifs = getStorage<OperationsNotification[]>(OP_STORAGE_KEYS.NOTIFICATIONS, []);
    if (notifs.length === 0) {
      const initial: OperationsNotification = {
        id: 'notif_init_1',
        title: 'Platform Proof Engine Operating Normative',
        message: 'All cryptographic client confirmation signatures and evidence uploads are operating normally.',
        type: 'operational',
        active: true,
        broadcastToAll: false,
        createdAt: new Date().toISOString(),
        createdBy: ROOT_ADMIN_EMAIL,
      };
      setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, [initial]);
      return [initial];
    }
    return notifs;
  },

  createNotification(
    data: { title: string; message: string; type: OperationsNotification['type']; broadcastToAll: boolean },
    actor: { id: string; email: string; name: string }
  ): OperationsNotification {
    const notifs = this.getNotifications();
    const newNotif: OperationsNotification = {
      id: `notif_${Date.now()}`,
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type,
      active: true,
      broadcastToAll: data.broadcastToAll,
      createdAt: new Date().toISOString(),
      createdBy: actor.email,
    };
    notifs.unshift(newNotif);
    setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, notifs);

    this.logAuditEvent({
      action: 'NOTIFICATION_BROADCAST_CREATE',
      category: 'notifications',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'NOTIFICATION',
      targetId: newNotif.id,
      details: `Created platform announcement: "${newNotif.title}" (Type: ${newNotif.type})`,
    });

    return newNotif;
  },

  toggleNotification(
    id: string,
    active: boolean,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const notifs = this.getNotifications();
    const notif = notifs.find((n) => n.id === id);
    if (!notif) return false;

    notif.active = active;
    setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, notifs);

    this.logAuditEvent({
      action: 'NOTIFICATION_STATUS_TOGGLE',
      category: 'notifications',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'NOTIFICATION',
      targetId: id,
      details: `${active ? 'Activated' : 'Deactivated'} platform notification: "${notif.title}"`,
    });

    return true;
  },

  deleteNotification(
    id: string,
    actor: { id: string; email: string; name: string }
  ): boolean {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (!target) return false;

    const filtered = notifs.filter((n) => n.id !== id);
    setStorage(OP_STORAGE_KEYS.NOTIFICATIONS, filtered);

    this.logAuditEvent({
      action: 'NOTIFICATION_DELETE',
      category: 'notifications',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'NOTIFICATION',
      targetId: id,
      details: `Deleted platform notification: "${target.title}"`,
    });

    return true;
  },

  // ==========================================================================
  // 6.5 CONTENT & DISTRIBUTION GOVERNANCE MODULE
  // ==========================================================================

  /**
   * Get all curated collections for discovery themes and showcase spotlights.
   */
  getCuratedCollections(): CuratedCollection[] {
    const collections = getStorage<CuratedCollection[]>(
      OP_STORAGE_KEYS.CURATED_COLLECTIONS,
      []
    );
    if (collections.length === 0) {
      setStorage(OP_STORAGE_KEYS.CURATED_COLLECTIONS, DEFAULT_COLLECTIONS);
      return DEFAULT_COLLECTIONS;
    }
    return collections.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /**
   * Save or create a curated collection with full audit tracking.
   */
  saveCuratedCollection(
    data: Partial<CuratedCollection> & { title: string },
    actor: AdminActor
  ): CuratedCollection {
    const collections = this.getCuratedCollections();
    const now = new Date().toISOString();
    let result: CuratedCollection;

    if (data.id) {
      const idx = collections.findIndex((c) => c.id === data.id);
      if (idx !== -1) {
        collections[idx] = {
          ...collections[idx],
          ...data,
          updatedAt: now,
          updatedBy: actor.email,
        };
        result = collections[idx];
      } else {
        result = {
          id: data.id,
          title: data.title.trim(),
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description || '',
          badgeLabel: data.badgeLabel || 'Curated',
          accentColor: data.accentColor || '#2D4D45',
          targetCategory: data.targetCategory || 'all',
          isActive: data.isActive !== undefined ? data.isActive : true,
          displayOrder: data.displayOrder || collections.length + 1,
          featuredWorkIds: data.featuredWorkIds || [],
          featuredUserIds: data.featuredUserIds || [],
          createdAt: now,
          updatedAt: now,
          createdBy: actor.email,
          updatedBy: actor.email,
        };
        collections.push(result);
      }
    } else {
      result = {
        id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.title.trim(),
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description || '',
        badgeLabel: data.badgeLabel || 'Curated',
        accentColor: data.accentColor || '#2D4D45',
        targetCategory: data.targetCategory || 'all',
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: data.displayOrder || collections.length + 1,
        featuredWorkIds: data.featuredWorkIds || [],
        featuredUserIds: data.featuredUserIds || [],
        createdAt: now,
        updatedAt: now,
        createdBy: actor.email,
        updatedBy: actor.email,
      };
      collections.push(result);
    }

    setStorage(OP_STORAGE_KEYS.CURATED_COLLECTIONS, collections);

    this.logAuditEvent({
      action: 'CURATED_COLLECTION_SAVE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'CURATED_COLLECTION',
      targetId: result.id,
      details: `Saved curated collection: "${result.title}" (Status: ${result.isActive ? 'Active' : 'Draft'}, Order: ${result.displayOrder})`,
    });

    return result;
  },

  /**
   * Delete a curated collection.
   */
  deleteCuratedCollection(collectionId: string, actor: AdminActor): boolean {
    const collections = this.getCuratedCollections();
    const target = collections.find((c) => c.id === collectionId);
    if (!target) return false;

    const filtered = collections.filter((c) => c.id !== collectionId);
    setStorage(OP_STORAGE_KEYS.CURATED_COLLECTIONS, filtered);

    this.logAuditEvent({
      action: 'CURATED_COLLECTION_DELETE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'CURATED_COLLECTION',
      targetId: collectionId,
      details: `Deleted curated collection: "${target.title}"`,
    });

    return true;
  },

  /**
   * Toggle curated collection active status.
   */
  toggleCollectionStatus(collectionId: string, isActive: boolean, actor: AdminActor): boolean {
    const collections = this.getCuratedCollections();
    const target = collections.find((c) => c.id === collectionId);
    if (!target) return false;

    target.isActive = isActive;
    target.updatedAt = new Date().toISOString();
    target.updatedBy = actor.email;
    setStorage(OP_STORAGE_KEYS.CURATED_COLLECTIONS, collections);

    this.logAuditEvent({
      action: 'CURATED_COLLECTION_TOGGLE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'CURATED_COLLECTION',
      targetId: collectionId,
      details: `${isActive ? 'Activated' : 'Deactivated'} curated collection: "${target.title}"`,
    });

    return true;
  },

  /**
   * Get discovery sections display and layout configuration.
   */
  getDiscoverySections(): DiscoverySectionConfig[] {
    const sections = getStorage<DiscoverySectionConfig[]>(
      OP_STORAGE_KEYS.DISCOVERY_SECTIONS,
      []
    );
    if (sections.length === 0) {
      setStorage(OP_STORAGE_KEYS.DISCOVERY_SECTIONS, DEFAULT_DISCOVERY_SECTIONS);
      return DEFAULT_DISCOVERY_SECTIONS;
    }
    return sections.sort((a, b) => a.displayOrder - b.displayOrder);
  },

  /**
   * Update discovery section configuration.
   */
  updateDiscoverySection(
    sectionKey: string,
    updates: Partial<DiscoverySectionConfig>,
    actor: AdminActor
  ): boolean {
    const sections = this.getDiscoverySections();
    const target = sections.find((s) => s.sectionKey === sectionKey || s.id === sectionKey);
    if (!target) return false;

    Object.assign(target, updates);
    target.updatedAt = new Date().toISOString();
    target.updatedBy = actor.email;
    setStorage(OP_STORAGE_KEYS.DISCOVERY_SECTIONS, sections);

    this.logAuditEvent({
      action: 'DISCOVERY_SECTION_UPDATE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'DISCOVERY_SECTION',
      targetId: target.sectionKey,
      details: `Updated Discovery section "${target.title}" (Enabled: ${target.isEnabled}, Sort: ${target.sortBy}, Limit: ${target.itemLimit})`,
    });

    return true;
  },

  /**
   * Get all curated skill & discipline tags.
   */
  getCuratedTags(): CuratedTag[] {
    const tags = getStorage<CuratedTag[]>(OP_STORAGE_KEYS.CURATED_TAGS, []);
    if (tags.length === 0) {
      setStorage(OP_STORAGE_KEYS.CURATED_TAGS, DEFAULT_CURATED_TAGS);
      return DEFAULT_CURATED_TAGS;
    }
    return tags.sort((a, b) => a.priorityOrder - b.priorityOrder);
  },

  /**
   * Save or create a curated tag.
   */
  saveCuratedTag(
    tagData: Partial<CuratedTag> & { name: string; category: string },
    actor: AdminActor
  ): CuratedTag {
    const tags = this.getCuratedTags();
    let result: CuratedTag;

    if (tagData.id) {
      const idx = tags.findIndex((t) => t.id === tagData.id);
      if (idx !== -1) {
        tags[idx] = { ...tags[idx], ...tagData };
        result = tags[idx];
      } else {
        result = {
          id: tagData.id,
          name: tagData.name.trim(),
          category: tagData.category,
          isFeatured: tagData.isFeatured !== undefined ? tagData.isFeatured : true,
          priorityOrder: tagData.priorityOrder || tags.length + 1,
          usageCount: tagData.usageCount || 1,
        };
        tags.push(result);
      }
    } else {
      result = {
        id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: tagData.name.trim(),
        category: tagData.category,
        isFeatured: tagData.isFeatured !== undefined ? tagData.isFeatured : true,
        priorityOrder: tagData.priorityOrder || tags.length + 1,
        usageCount: tagData.usageCount || 1,
      };
      tags.push(result);
    }

    setStorage(OP_STORAGE_KEYS.CURATED_TAGS, tags);

    this.logAuditEvent({
      action: 'CURATED_TAG_SAVE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'CURATED_TAG',
      targetId: result.id,
      details: `Saved curated tag: "${result.name}" (Category: ${result.category}, Featured: ${result.isFeatured})`,
    });

    return result;
  },

  /**
   * Delete a curated tag.
   */
  deleteCuratedTag(tagId: string, actor: AdminActor): boolean {
    const tags = this.getCuratedTags();
    const target = tags.find((t) => t.id === tagId);
    if (!target) return false;

    const filtered = tags.filter((t) => t.id !== tagId);
    setStorage(OP_STORAGE_KEYS.CURATED_TAGS, filtered);

    this.logAuditEvent({
      action: 'CURATED_TAG_DELETE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'CURATED_TAG',
      targetId: tagId,
      details: `Deleted curated tag: "${target.name}"`,
    });

    return true;
  },

  /**
   * Toggle a curated tag featured status.
   */
  toggleTagFeatured(tagId: string, isFeatured: boolean, actor: AdminActor): boolean {
    const tags = this.getCuratedTags();
    const target = tags.find((t) => t.id === tagId);
    if (!target) return false;

    target.isFeatured = isFeatured;
    setStorage(OP_STORAGE_KEYS.CURATED_TAGS, tags);

    this.logAuditEvent({
      action: 'CURATED_TAG_TOGGLE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'CURATED_TAG',
      targetId: tagId,
      details: `${isFeatured ? 'Promoted' : 'Demoted'} curated tag: "${target.name}"`,
    });

    return true;
  },

  /**
   * Update work record curation attributes (featured, priority rank, homepage placement, visibility).
   */
  updateWorkCuration(
    workId: string,
    curation: {
      isFeatured?: boolean;
      featuredPriority?: number;
      isRecommended?: boolean;
      homepagePlacement?: WorkRecord['homepagePlacement'];
      visibility?: VisibilityStatus;
      curatedCollectionIds?: string[];
      featuredNote?: string;
      isTakenDown?: boolean;
      takeDownReason?: string;
    },
    actor: AdminActor
  ): { success: boolean; work?: WorkRecord; error?: string } {
    const auth = this.verifyAdminActor(actor, 'moderator');
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const allWorks = getStorage<WorkRecord[]>(OP_STORAGE_KEYS.WORK_RECORDS, []);
    const idx = allWorks.findIndex((w) => w.id === workId);
    if (idx === -1) {
      return { success: false, error: 'Work record deliverable not found.' };
    }

    const now = new Date().toISOString();
    const target = allWorks[idx];

    if (curation.isFeatured !== undefined) {
      target.isFeatured = curation.isFeatured;
      if (curation.isFeatured) {
        target.featuredBy = actor.name;
        target.featuredAt = now;
      }
    }
    if (curation.featuredPriority !== undefined) {
      target.featuredPriority = curation.featuredPriority;
    }
    if (curation.isRecommended !== undefined) {
      target.isRecommended = curation.isRecommended;
    }
    if (curation.homepagePlacement !== undefined) {
      target.homepagePlacement = curation.homepagePlacement;
    }
    if (curation.visibility !== undefined) {
      target.visibility = curation.visibility;
    }
    if (curation.curatedCollectionIds !== undefined) {
      target.curatedCollectionIds = curation.curatedCollectionIds;
    }
    if (curation.featuredNote !== undefined) {
      target.featuredNote = curation.featuredNote.trim();
    }
    if (curation.isTakenDown !== undefined) {
      target.isTakenDown = curation.isTakenDown;
      if (curation.isTakenDown) {
        target.takeDownReason = curation.takeDownReason || 'Administrative curation adjustment';
        target.moderatedAt = now;
        target.moderatedBy = actor.name;
      } else {
        target.takeDownReason = undefined;
      }
    }

    allWorks[idx] = target;
    setStorage(OP_STORAGE_KEYS.WORK_RECORDS, allWorks);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sabi_work_records_changed', { detail: target })
      );
    }

    this.logAuditEvent({
      action: 'WORK_CURATION_UPDATE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'WORK_RECORD',
      targetId: workId,
      details: `Updated curation for deliverable "${target.title}". Featured: ${target.isFeatured}, Priority: ${target.featuredPriority || 'None'}, Homepage: ${target.homepagePlacement || 'none'}, Visibility: ${target.visibility}`,
    });

    return { success: true, work: target };
  },

  /**
   * Update user profile curation attributes (featured, priority rank, homepage spotlight, discovery appearance).
   */
  updateUserCuration(
    userId: string,
    curation: {
      isFeatured?: boolean;
      featuredRank?: number;
      homepageSpotlight?: boolean;
      appearInDiscover?: boolean;
      curationBadge?: string;
    },
    actor: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    const auth = this.verifyAdminActor(actor, 'moderator');
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (curation.isFeatured !== undefined) {
      user.isFeatured = curation.isFeatured;
    }
    if (curation.featuredRank !== undefined) {
      user.featuredRank = curation.featuredRank;
    }
    if (curation.homepageSpotlight !== undefined) {
      user.homepageSpotlight = curation.homepageSpotlight;
    }
    if (curation.appearInDiscover !== undefined) {
      user.appearInDiscover = curation.appearInDiscover;
    }
    if (curation.curationBadge !== undefined) {
      user.curationBadge = curation.curationBadge.trim();
    }

    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_CURATION_UPDATE',
      category: 'content',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Updated creator curation for ${user.fullName} (@${user.username || user.id}). Featured: ${user.isFeatured}, Rank: ${user.featuredRank || 'None'}, Homepage Spotlight: ${user.homepageSpotlight}, Discover: ${user.appearInDiscover}`,
    });

    return { success: true, user };
  },

  verifyAdminActor(
    actor: AdminActor,
    requiredRole?: AdminRole
  ): { authorized: boolean; isAuthorized: boolean; error?: string; role?: AdminRole } {
    if (!actor || !actor.email) {
      return { authorized: false, isAuthorized: false, error: 'Authorization error: Missing administrator credentials.' };
    }
    const check = this.checkAdminAuthorization({ email: actor.email, id: actor.id });
    if (!check.isAuthorized) {
      return {
        authorized: false,
        isAuthorized: false,
        error: `Authorization denied: Account ${actor.email} does not possess administrative privileges.`,
      };
    }
    if (requiredRole && check.role) {
      const hierarchy: Record<AdminRole, number> = {
        support: 1,
        moderator: 2,
        platform_admin: 3,
        super_admin: 4,
      };
      if (hierarchy[check.role] < hierarchy[requiredRole]) {
        return {
          authorized: false,
          isAuthorized: false,
          error: `Insufficient permissions: Required role "${requiredRole}", but active role is "${check.role}".`,
        };
      }
    }
    return { authorized: true, isAuthorized: true, role: check.role };
  },

  getUsers(): UserProfile[] {
    return getStorage<UserProfile[]>(OP_STORAGE_KEYS.USERS, []);
  },

  getUserById(id: string): UserProfile | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  updateUser(profile: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx !== -1) {
      users[idx] = profile;
      setStorage(OP_STORAGE_KEYS.USERS, users);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sabi_users_changed', { detail: profile }));
      }
    }
  },

  getUserAccountStatus(user: UserProfile): AccountStatus {
    if (user.isDeactivated || user.accountStatus === 'deactivated') {
      return 'deactivated';
    }
    if (user.isSuspended || user.accountStatus === 'suspended') {
      // Check if temporary suspension has expired
      if (user.suspensionDetails?.expiresAt) {
        const expires = new Date(user.suspensionDetails.expiresAt).getTime();
        if (Date.now() > expires) {
          return 'active';
        }
      }
      return 'suspended';
    }
    if (
      user.accountStatus === 'restricted' ||
      user.restrictions?.cannotMessage ||
      user.restrictions?.cannotPublishWork ||
      user.restrictions?.cannotRequestConfirmations ||
      user.restrictions?.cannotAppearInDiscover
    ) {
      return 'restricted';
    }
    return 'active';
  },

  /**
   * Suspend a user account with required reason, duration, and optional internal note.
   * Enforces server-side authorization check and logs an immutable audit event.
   */
  suspendUser(
    userId: string,
    data: {
      reason: string;
      internalNote?: string;
      duration: SuspensionDuration;
    },
    actor: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!data.reason || data.reason.trim().length < 5) {
      return { success: false, error: 'A clear suspension reason (minimum 5 characters) is required.' };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    // Safety guard: Root administrator account cannot be suspended
    if (user.email && user.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'The platform root administrator cannot be suspended.' };
    }

    // Calculate expiry based on duration
    let expiresAt: string | null = null;
    const now = Date.now();
    if (data.duration === '24h') {
      expiresAt = new Date(now + 24 * 3600 * 1000).toISOString();
    } else if (data.duration === '7d') {
      expiresAt = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
    } else if (data.duration === '30d') {
      expiresAt = new Date(now + 30 * 24 * 3600 * 1000).toISOString();
    } else if (data.duration === '90d') {
      expiresAt = new Date(now + 90 * 24 * 3600 * 1000).toISOString();
    }

    const suspensionDetails: SuspensionDetails = {
      reason: data.reason.trim(),
      internalNote: data.internalNote?.trim(),
      duration: data.duration,
      suspendedAt: new Date().toISOString(),
      expiresAt,
      suspendedBy: actor.name,
      suspendedByEmail: actor.email,
    };

    const previousStatus = this.getUserAccountStatus(user);

    user.accountStatus = 'suspended';
    user.isSuspended = true;
    user.suspendedReason = data.reason.trim();
    user.suspendedAt = suspensionDetails.suspendedAt;
    user.suspensionDetails = suspensionDetails;
    // Force revoke active sessions on suspension
    user.sessionsRevokedAt = new Date().toISOString();
    user.sessionVersion = (user.sessionVersion || 1) + 1;

    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_SUSPEND',
      category: 'users',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Suspended user ${user.fullName} (@${user.username || user.id}). Duration: ${data.duration}. Reason: "${data.reason}". ${data.internalNote ? `Internal note: "${data.internalNote}".` : ''}`,
      previousValue: previousStatus,
      newValue: 'suspended',
      metadata: {
        duration: data.duration,
        expiresAt,
        targetUserEmail: user.email,
        internalNote: data.internalNote,
      },
    });

    return { success: true, user };
  },

  /**
   * Unsuspend a user account and record the restoration reason.
   */
  unsuspendUser(
    userId: string,
    data: { restorationReason: string; internalNote?: string },
    actor: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!data.restorationReason || data.restorationReason.trim().length < 4) {
      return { success: false, error: 'A substantive reason for restoring the account is required.' };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const previousStatus = this.getUserAccountStatus(user);

    user.accountStatus = 'active';
    user.isSuspended = false;
    user.suspendedReason = undefined;
    user.suspendedAt = undefined;
    if (user.suspensionDetails) {
      user.suspensionDetails = undefined;
    }

    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_UNSUSPEND',
      category: 'users',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Restored account access for ${user.fullName} (@${user.username || user.id}). Reason for unsuspension: "${data.restorationReason}".`,
      previousValue: previousStatus,
      newValue: 'active',
      metadata: {
        restorationReason: data.restorationReason,
        internalNote: data.internalNote,
        targetUserEmail: user.email,
      },
    });

    return { success: true, user };
  },

  /**
   * Permanently or administratively deactivate an account.
   */
  deactivateUser(
    userId: string,
    data: {
      reason: string;
      internalNote?: string;
      isEligibleForRestoration: boolean;
    },
    actor: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!data.reason || data.reason.trim().length < 5) {
      return { success: false, error: 'A clear deactivation reason is required.' };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (user.email && user.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot deactivate the root platform super administrator.' };
    }

    const previousStatus = this.getUserAccountStatus(user);

    const deactivationDetails: DeactivationDetails = {
      reason: data.reason.trim(),
      internalNote: data.internalNote?.trim(),
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: actor.name,
      deactivatedByEmail: actor.email,
      isEligibleForRestoration: data.isEligibleForRestoration,
    };

    user.accountStatus = 'deactivated';
    user.isDeactivated = true;
    user.deactivationDetails = deactivationDetails;
    // Invalidate any active sessions
    user.sessionsRevokedAt = new Date().toISOString();
    user.sessionVersion = (user.sessionVersion || 1) + 1;

    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_DEACTIVATE',
      category: 'users',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Deactivated account for ${user.fullName} (@${user.username || user.id}). Eligible for future restoration: ${data.isEligibleForRestoration ? 'Yes' : 'No'}. Reason: "${data.reason}".`,
      previousValue: previousStatus,
      newValue: 'deactivated',
      metadata: {
        isEligibleForRestoration: data.isEligibleForRestoration,
        reason: data.reason,
        internalNote: data.internalNote,
        targetUserEmail: user.email,
      },
    });

    return { success: true, user };
  },

  /**
   * Restore an eligible deactivated account back to active status.
   */
  restoreDeactivatedUser(
    userId: string,
    data: { restorationReason: string; internalNote?: string },
    actor: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    if (!data.restorationReason || data.restorationReason.trim().length < 4) {
      return { success: false, error: 'A substantive reason for restoring the deactivated account is required.' };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (user.deactivationDetails && user.deactivationDetails.isEligibleForRestoration === false) {
      // Super admin override permitted
      if (auth.role !== 'super_admin') {
        return {
          success: false,
          error: 'This account was marked permanently ineligible for restoration. Only a Super Administrator can override.',
        };
      }
    }

    user.accountStatus = 'active';
    user.isDeactivated = false;
    user.deactivationDetails = undefined;

    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_RESTORE_DEACTIVATED',
      category: 'users',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Reinstated previously deactivated user ${user.fullName} (@${user.username || user.id}) to active status. Reason: "${data.restorationReason}".`,
      previousValue: 'deactivated',
      newValue: 'active',
      metadata: {
        restorationReason: data.restorationReason,
        internalNote: data.internalNote,
        targetUserEmail: user.email,
      },
    });

    return { success: true, user };
  },

  /**
   * Restrict or unrestrict specific capabilities (e.g. client confirmations, messaging, publishing, discovery).
   */
  updateUserRestrictions(
    userId: string,
    restrictions: UserRestrictions,
    actor: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const hasAnyRestriction =
      !!restrictions.cannotRequestConfirmations ||
      !!restrictions.cannotMessage ||
      !!restrictions.cannotPublishWork ||
      !!restrictions.cannotAppearInDiscover;

    const previousRestrictions = user.restrictions;
    const previousStatus = this.getUserAccountStatus(user);

    user.restrictions = {
      ...restrictions,
      restrictedAt: new Date().toISOString(),
      restrictedBy: actor.name,
      restrictedByEmail: actor.email,
    };

    if (user.accountStatus !== 'suspended' && user.accountStatus !== 'deactivated') {
      user.accountStatus = hasAnyRestriction ? 'restricted' : 'active';
    }

    this.updateUser(user);

    const restrictedList = [
      restrictions.cannotRequestConfirmations && 'Client Confirmations',
      restrictions.cannotMessage && 'Direct Messaging',
      restrictions.cannotPublishWork && 'Work Publishing',
      restrictions.cannotAppearInDiscover && 'Public Discovery',
    ]
      .filter(Boolean)
      .join(', ');

    this.logAuditEvent({
      action: 'USER_RESTRICTIONS_UPDATE',
      category: 'users',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: hasAnyRestriction
        ? `Applied capability restrictions on ${user.fullName}: [${restrictedList}]. Reason: "${restrictions.restrictedReason || 'Standard platform compliance enforcement'}"`
        : `Removed all capability restrictions from ${user.fullName}. Account capabilities fully restored.`,
      previousValue: previousStatus,
      newValue: user.accountStatus,
      metadata: {
        restrictions,
        previousRestrictions,
        targetUserEmail: user.email,
      },
    });

    return { success: true, user };
  },

  /**
   * Force logout from all active sessions for this user.
   */
  forceLogoutUser(
    userId: string,
    actor: AdminActor
  ): { success: boolean; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const revokedAt = new Date().toISOString();
    user.sessionsRevokedAt = revokedAt;
    user.sessionVersion = (user.sessionVersion || 1) + 1;

    this.updateUser(user);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sabi_session_revoked', {
          detail: { userId, timestamp: revokedAt },
        })
      );
    }

    this.logAuditEvent({
      action: 'USER_FORCE_LOGOUT',
      category: 'security',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Revoked all active sessions for ${user.fullName} (@${user.username || user.id}). User will be forcefully logged out on next request.`,
      metadata: {
        revokedAt,
        sessionVersion: user.sessionVersion,
        targetUserEmail: user.email,
      },
    });

    return { success: true };
  },

  /**
   * Handle account recovery workflows: Generates a secure, cryptographically-sound timed
   * account recovery token and link without ever exposing or changing passwords.
   */
  triggerAccountRecovery(
    userId: string,
    actor: AdminActor
  ): { success: boolean; recoveryRecord?: AccountRecoveryRecord; error?: string } {
    const auth = this.verifyAdminActor(actor);
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    // Generate high-entropy token
    const tokenRandom = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const recoveryToken = `rec_${Date.now()}_${tokenRandom}`;
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 hours

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sabi.id';
    const recoveryLink = `${baseUrl}?recovery=${recoveryToken}&u=${encodeURIComponent(user.username || user.id)}`;

    const recoveryRecord: AccountRecoveryRecord = {
      lastRecoveryTriggeredAt: new Date().toISOString(),
      recoveryToken,
      recoveryLink,
      recoveryStatus: 'pending',
      expiresAt,
      triggeredBy: actor.name,
      triggeredByEmail: actor.email,
    };

    user.recoveryRecord = recoveryRecord;
    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_RECOVERY_TRIGGERED',
      category: 'security',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Initiated secure account recovery flow for ${user.fullName} (${user.email || user.username}). Valid for 24 hours. No password exposed.`,
      metadata: {
        expiresAt,
        targetUserEmail: user.email,
      },
    });

    return { success: true, recoveryRecord };
  },

  /**
   * Validate an incoming account recovery token.
   */
  validateRecoveryToken(token: string): { valid: boolean; user?: UserProfile; error?: string } {
    if (!token) return { valid: false, error: 'No recovery token provided.' };
    const users = this.getUsers();
    const user = users.find(
      (u) => u.recoveryRecord && u.recoveryRecord.recoveryToken === token
    );

    if (!user || !user.recoveryRecord) {
      return { valid: false, error: 'Invalid or unrecognized recovery token.' };
    }

    if (new Date(user.recoveryRecord.expiresAt).getTime() < Date.now()) {
      return { valid: false, error: 'This recovery token has expired (24-hour limit exceeded).' };
    }

    if (user.recoveryRecord.recoveryStatus === 'completed') {
      return { valid: false, error: 'This recovery token has already been used.' };
    }

    return { valid: true, user };
  },

  /**
   * Complete account recovery, resetting session version and logging audit trail.
   */
  completeAccountRecovery(
    token: string,
    newPassword?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    const val = this.validateRecoveryToken(token);
    if (!val.valid || !val.user || !val.user.recoveryRecord) {
      return { success: false, error: val.error || 'Token validation failed.' };
    }

    const user = val.user;
    if (user.recoveryRecord) {
      user.recoveryRecord.recoveryStatus = 'completed';
    }
    user.sessionVersion = (user.sessionVersion || 1) + 1;
    user.sessionsRevokedAt = new Date().toISOString();
    user.lastActiveAt = new Date().toISOString();

    // If user was previously suspended due to lost access or compromised credentials, we ensure state is normalized if applicable
    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_RECOVERY_COMPLETED',
      category: 'security',
      actorEmail: user.email || user.username,
      actorName: user.fullName,
      actorId: user.id,
      targetType: 'USER',
      targetId: user.id,
      details: `Account recovery token successfully redeemed by ${user.fullName} (${user.email || user.username}). New session version v${user.sessionVersion} initiated.`,
    });

    return { success: true, user };
  },

  /**
   * Retrieve all audit logs targeting or concerning a specific user.
   */
  getUserAuditLogs(userId: string): AuditLogEntry[] {
    const allLogs = this.getAuditLogs();
    return allLogs.filter(
      (log) =>
        log.targetId === userId ||
        (log.metadata && (log.metadata.targetUserId === userId || log.metadata.userId === userId))
    );
  },

  /**
   * Compute comprehensive platform activity stats for a given user.
   */
  getUserActivitySummary(userId: string): {
    workRecordsCount: number;
    confirmedRecordsCount: number;
    evidenceBackedCount: number;
    proofRatio: number;
    reportsAgainstCount: number;
    reportsFiledCount: number;
    conversationsCount: number;
  } {
    const allWorks = getStorage<WorkRecord[]>(OP_STORAGE_KEYS.WORK_RECORDS, []);
    const userWorks = allWorks.filter((w) => w.userId === userId);
    const confirmedCount = userWorks.filter(
      (w) => w.confirmationStatus === 'confirmed' || w.confirmation?.status === 'confirmed'
    ).length;
    const evidenceCount = userWorks.filter(
      (w) => w.evidenceStatus === 'attached' || (w.evidenceList && w.evidenceList.length > 0)
    ).length;
    const provenCount = userWorks.filter(
      (w) =>
        w.confirmationStatus === 'confirmed' ||
        w.confirmation?.status === 'confirmed' ||
        w.evidenceStatus === 'attached' ||
        (w.evidenceList && w.evidenceList.length > 0)
    ).length;
    const proofRatio = userWorks.length > 0 ? Math.round((provenCount / userWorks.length) * 100) : 0;

    const allReports = getStorage<ReportRecord[]>(OP_STORAGE_KEYS.REPORTS, []);
    const reportsAgainst = allReports.filter((r) => r.reportedUserId === userId).length;
    const reportsFiled = allReports.filter((r) => r.reporterId === userId).length;

    const allConversations = getStorage<Conversation[]>(OP_STORAGE_KEYS.CONVERSATIONS, []);
    const userConversations = allConversations.filter(
      (c) =>
        c.participantOneId === userId ||
        c.participantTwoId === userId ||
        (c.participantIds && c.participantIds.includes(userId))
    ).length;

    return {
      workRecordsCount: userWorks.length,
      confirmedRecordsCount: confirmedCount,
      evidenceBackedCount: evidenceCount,
      proofRatio,
      reportsAgainstCount: reportsAgainst,
      reportsFiledCount: reportsFiled,
      conversationsCount: userConversations,
    };
  },

  // ==========================================================================
  // 6. MODERATION & INCIDENT REPORTS WORKFLOW ENGINE
  // ==========================================================================

  /**
   * Retrieve all reports with workflow normalization and default seed cases.
   */
  getReports(): ReportRecord[] {
    let reports = getStorage<ReportRecord[]>(OP_STORAGE_KEYS.REPORTS, []);

    if (reports.length === 0) {
      // Seed realistic initial cases demonstrating the entire lifecycle
      reports = [
        {
          id: 'rep_1001',
          caseNumber: 'CASE-1001',
          source: 'user_report',
          reporterId: 'usr_reporter_1',
          reporterName: 'Kofi Mensah',
          reporterEmail: 'kofi.mensah@example.com',
          reporterIsAnonymous: false,
          reportedUserId: 'usr_reported_1',
          reportedUserName: 'Chidi Okafor',
          workRecordId: 'wr_seeded_1',
          targetType: 'work_record',
          targetId: 'wr_seeded_1',
          category: 'fraudulent_proof',
          severity: 'high',
          reason: 'Unverified Client Confirmation Dispute',
          details: 'The creator logged a commercial hospitality branding project claiming my firm was the client signatory. We never authorized this confirmation link and have no record of this engagement.',
          status: 'open',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
          internalNotes: [
            {
              id: 'note_1',
              authorId: 'sys_triage',
              authorName: 'Triage Engine',
              authorEmail: 'system@sabi.id',
              note: 'Incoming case routed from client confirmation dispute form. Initial evidence inspection recommended.',
              createdAt: new Date(Date.now() - 3600000 * 17).toISOString(),
            },
          ],
        },
        {
          id: 'rep_1002',
          caseNumber: 'CASE-1002',
          source: 'system_heuristic', // Demonstration of automated flagging hook
          reporterId: 'system_heuristic',
          reporterName: 'Automated Heuristic Engine',
          reporterEmail: 'heuristics@sabi.id',
          reportedUserId: 'usr_reported_2',
          reportedUserName: 'David Adeleke',
          workRecordId: 'wr_seeded_2',
          targetType: 'work_record',
          targetId: 'wr_seeded_2',
          category: 'inappropriate_evidence',
          severity: 'medium',
          reason: 'Non-work evidence document attached',
          details: 'System flag: Evidence asset uploaded has low correlation with documented architectural drafting skills and appears to contain unredacted third-party personal contact lists.',
          status: 'under_review',
          assignedModeratorId: 'admin_mod_1',
          assignedModeratorName: 'Trust & Safety Lead',
          assignedModeratorEmail: 'moderation@sabi.id',
          assignedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
          internalNotes: [
            {
              id: 'note_2',
              authorId: 'admin_mod_1',
              authorName: 'Trust & Safety Lead',
              authorEmail: 'moderation@sabi.id',
              note: 'Reviewing file metadata. Requested secondary verification from user regarding document provenance.',
              createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
            },
          ],
          evidenceAttachments: [
            {
              id: 'ev_att_1',
              title: 'Evidence Audit Inspector Snapshot',
              url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
              note: 'Contains highlighted unredacted PII table.',
              attachedBy: 'Trust & Safety Lead',
              attachedByEmail: 'moderation@sabi.id',
              attachedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
            },
          ],
        },
        {
          id: 'rep_1003',
          caseNumber: 'CASE-1003',
          source: 'user_report',
          reporterId: 'usr_reporter_3',
          reporterName: 'Amina Bello',
          reporterEmail: 'amina.bello@example.com',
          reporterIsAnonymous: true,
          confidentialFlag: true,
          reportedUserId: 'usr_reported_3',
          reportedUserName: 'Folake Badmus',
          targetType: 'profile',
          targetId: 'usr_reported_3',
          category: 'impersonation',
          severity: 'critical',
          reason: 'Identity & Professional License Impersonation',
          details: 'The profile is using my exact professional registration number and claiming my certified civil engineering projects in Lagos.',
          status: 'escalated',
          escalationReason: 'Critical credential falsification involving legally protected engineering stamp. Requires Super Admin review and legal hold.',
          escalatedBy: 'Trust & Safety Lead',
          escalatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          assignedModeratorId: 'admin_root_1',
          assignedModeratorName: 'Israel Oyebanji',
          assignedModeratorEmail: ROOT_ADMIN_EMAIL,
          assignedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          internalNotes: [
            {
              id: 'note_3',
              authorId: 'admin_mod_1',
              authorName: 'Trust & Safety Lead',
              authorEmail: 'moderation@sabi.id',
              note: 'Cross-checked engineering registry. Name on registry does not match account registrant.',
              createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
              id: 'note_4',
              authorId: 'admin_mod_1',
              authorName: 'Trust & Safety Lead',
              authorEmail: 'moderation@sabi.id',
              note: 'Escalated to Super Admin for immediate profile lock and potential suspension.',
              createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            },
          ],
        },
        {
          id: 'rep_1004',
          caseNumber: 'CASE-1004',
          source: 'user_report',
          reporterId: 'usr_reporter_4',
          reporterName: 'Kwame Mensah',
          reporterEmail: 'kwame.mensah@example.com',
          reportedUserId: 'usr_reported_4',
          reportedUserName: 'Tariq Al-Mansoor',
          workRecordId: 'wr_seeded_4',
          targetType: 'work_record',
          targetId: 'wr_seeded_4',
          category: 'copyright_dispute',
          severity: 'medium',
          reason: 'Unauthorized portfolio asset usage',
          details: 'Design mockup files rendered by our agency were re-uploaded without attribution or licensing rights.',
          status: 'resolved',
          actionTaken: 'remove_content',
          actionDetails: 'Flagged work record taken down from public view. Creator issued a formal advisory notice.',
          decisionReason: 'Proof evidence confirmed to belong to originating agency repository. Work record removed under copyright compliance protocol.',
          resolutionNotes: 'Creator acknowledged the mistaken upload and agreed to only upload authored proof.',
          resolvedBy: 'Trust & Safety Lead',
          resolvedByEmail: 'moderation@sabi.id',
          resolvedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
        {
          id: 'rep_1005',
          caseNumber: 'CASE-1005',
          source: 'user_report',
          reporterId: 'usr_reporter_5',
          reporterName: 'Anonymous Client',
          reporterEmail: 'competitor@example.com',
          reportedUserId: 'usr_reported_5',
          reportedUserName: 'Adaeze Nwosu',
          targetType: 'user',
          targetId: 'usr_reported_5',
          category: 'spam',
          severity: 'low',
          reason: 'Generic dissatisfaction with quote',
          details: 'Professional did not respond to my inquiry within 2 hours.',
          status: 'dismissed',
          actionTaken: 'dismiss',
          decisionReason: 'Not a platform terms or proof integrity violation. Commercial quotation timing is at the discretion of the independent professional.',
          resolutionNotes: 'Dismissed without penalty. Inquirer advised to use standard communication channels.',
          resolvedBy: 'Trust & Safety Lead',
          resolvedByEmail: 'moderation@sabi.id',
          resolvedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        },
      ];
      setStorage(OP_STORAGE_KEYS.REPORTS, reports);
    }

    // Normalize any legacy status values (e.g. 'pending' -> 'open')
    return reports.map((r) => {
      let normStatus: ReportStatus = r.status || 'open';
      if ((normStatus as string) === 'pending') normStatus = 'open';
      return {
        ...r,
        caseNumber: r.caseNumber || `CASE-${r.id.replace(/[^0-9]/g, '').slice(-4) || '1001'}`,
        severity: r.severity || 'medium',
        status: normStatus,
        updatedAt: r.updatedAt || r.createdAt,
      };
    });
  },

  saveReports(reports: ReportRecord[]): void {
    setStorage(OP_STORAGE_KEYS.REPORTS, reports);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sabi_reports_changed'));
    }
  },

  subscribeToReports(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback();
    window.addEventListener('sabi_reports_changed', handler);
    return () => window.removeEventListener('sabi_reports_changed', handler);
  },

  getReportById(id: string): ReportRecord | null {
    const reports = this.getReports();
    return reports.find((r) => r.id === id || r.caseNumber === id) || null;
  },

  /**
   * Assign a moderation case to an administrator or moderator.
   */
  assignReportCase(
    reportId: string,
    moderator: { id: string; name: string; email: string },
    actor: AdminActor
  ): { success: boolean; report?: ReportRecord; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const now = new Date().toISOString();
    const target = reports[idx];
    target.assignedModeratorId = moderator.id;
    target.assignedModeratorName = moderator.name;
    target.assignedModeratorEmail = moderator.email;
    target.assignedAt = now;
    target.updatedAt = now;

    // Automatically transition 'open' to 'under_review'
    if (target.status === 'open' || target.status === 'pending') {
      target.status = 'under_review';
    }

    if (!target.internalNotes) target.internalNotes = [];
    target.internalNotes.push({
      id: `note_${Date.now()}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: `Case assigned to moderator ${moderator.name} (${moderator.email}). Status set to Under Review.`,
      createdAt: now,
    });

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_CASE_ASSIGNED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Case ${target.caseNumber || reportId} assigned to ${moderator.name} (${moderator.email}).`,
    });

    return { success: true, report: target };
  },

  /**
   * Transition report case status (Open, Under Review, Escalated, Resolved, Dismissed).
   */
  updateReportStatus(
    reportId: string,
    newStatus: ReportStatus,
    reason: string,
    actor: AdminActor
  ): { success: boolean; report?: ReportRecord; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const now = new Date().toISOString();
    const target = reports[idx];
    const prevStatus = target.status;
    target.status = newStatus;
    target.updatedAt = now;

    if (!target.internalNotes) target.internalNotes = [];
    target.internalNotes.push({
      id: `note_${Date.now()}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: `Status updated from ${prevStatus} to ${newStatus}. Reason: ${reason}`,
      createdAt: now,
    });

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_STATUS_UPDATED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Case ${target.caseNumber || reportId} status transitioned from ${prevStatus} to ${newStatus}. Reason: "${reason}"`,
    });

    return { success: true, report: target };
  },

  /**
   * Add an internal note to an active investigation.
   */
  addReportInternalNote(
    reportId: string,
    noteText: string,
    actor: AdminActor
  ): { success: boolean; note?: ModerationInternalNote; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const trimmed = noteText.trim();
    if (!trimmed) {
      return { success: false, error: 'Internal note cannot be empty.' };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const now = new Date().toISOString();
    const newNote: ModerationInternalNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: trimmed,
      createdAt: now,
    };

    const target = reports[idx];
    if (!target.internalNotes) target.internalNotes = [];
    target.internalNotes.push(newNote);
    target.updatedAt = now;

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_INTERNAL_NOTE_ADDED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Internal note added to Case ${target.caseNumber || reportId} by ${actor.name}.`,
    });

    return { success: true, note: newNote };
  },

  /**
   * Attach relevant evidence (screenshots, audit links, documentation) to a case.
   */
  addReportEvidenceAttachment(
    reportId: string,
    attachment: { title: string; url?: string; note?: string },
    actor: AdminActor
  ): { success: boolean; attachment?: ModerationEvidenceAttachment; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const trimmedTitle = attachment.title.trim();
    if (!trimmedTitle) {
      return { success: false, error: 'Attachment title is required.' };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const now = new Date().toISOString();
    const newAttachment: ModerationEvidenceAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: trimmedTitle,
      url: attachment.url?.trim(),
      note: attachment.note?.trim(),
      attachedBy: actor.name,
      attachedByEmail: actor.email,
      attachedAt: now,
    };

    const target = reports[idx];
    if (!target.evidenceAttachments) target.evidenceAttachments = [];
    target.evidenceAttachments.push(newAttachment);
    target.updatedAt = now;

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_EVIDENCE_ATTACHED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Evidence item "${trimmedTitle}" attached to Case ${target.caseNumber || reportId}.`,
    });

    return { success: true, attachment: newAttachment };
  },

  /**
   * Escalate a case for Senior Operations / Super Admin intervention.
   */
  escalateReportCase(
    reportId: string,
    escalationReason: string,
    actor: AdminActor
  ): { success: boolean; report?: ReportRecord; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const reasonTrimmed = escalationReason.trim();
    if (!reasonTrimmed || reasonTrimmed.length < 5) {
      return { success: false, error: 'Escalation requires a clear substantive reason (minimum 5 characters).' };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const now = new Date().toISOString();
    const target = reports[idx];
    target.status = 'escalated';
    target.escalationReason = reasonTrimmed;
    target.escalatedBy = actor.name;
    target.escalatedAt = now;
    target.updatedAt = now;
    // Escalate severity if low/medium
    if (target.severity === 'low' || target.severity === 'medium') {
      target.severity = 'high';
    }

    if (!target.internalNotes) target.internalNotes = [];
    target.internalNotes.push({
      id: `note_${Date.now()}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: `CASE ESCALATED: ${reasonTrimmed}`,
      createdAt: now,
    });

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_CASE_ESCALATED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Case ${target.caseNumber || reportId} escalated by ${actor.name}. Reason: "${reasonTrimmed}"`,
    });

    return { success: true, report: target };
  },

  /**
   * Resolve a case with a concrete moderation decision and action.
   */
  resolveReportCase(
    reportId: string,
    decision: {
      actionTaken: ModerationActionType;
      decisionReason: string;
      resolutionNotes?: string;
      actionDetails?: string;
      duration?: SuspensionDuration;
      internalNote?: string;
      restrictions?: Partial<UserRestrictions>;
      workRecordId?: string;
    },
    actor: AdminActor
  ): { success: boolean; report?: ReportRecord; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const decisionReason = decision.decisionReason.trim();
    if (!decisionReason || decisionReason.length < 5) {
      return { success: false, error: 'Every moderation resolution requires a formal decision reason (min 5 characters).' };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const target = reports[idx];
    const now = new Date().toISOString();

    // 1. Execute Sabi-supported platform moderation action
    const reportedUserId = target.reportedUserId;

    if (decision.actionTaken === 'warning') {
      this.issueUserWarning(
        reportedUserId,
        decisionReason,
        decision.internalNote,
        target.caseNumber || target.id,
        actor
      );
    } else if (decision.actionTaken === 'remove_content' || decision.actionTaken === 'work_taken_down') {
      const workId = decision.workRecordId || target.workRecordId || target.targetId;
      if (workId) {
        const allWorks = getStorage<WorkRecord[]>(OP_STORAGE_KEYS.WORK_RECORDS, []);
        const wIdx = allWorks.findIndex((w) => w.id === workId);
        if (wIdx !== -1) {
          allWorks[wIdx].isTakenDown = true;
          allWorks[wIdx].takeDownReason = decisionReason;
          allWorks[wIdx].moderatedBy = actor.name;
          allWorks[wIdx].moderatedAt = now;
          setStorage(OP_STORAGE_KEYS.WORK_RECORDS, allWorks);
        }
      }
    } else if (decision.actionTaken === 'restrict_account') {
      this.updateUserRestrictions(
        reportedUserId,
        {
          cannotRequestConfirmations: !!decision.restrictions?.cannotRequestConfirmations,
          cannotMessage: !!decision.restrictions?.cannotMessage,
          cannotPublishWork: !!decision.restrictions?.cannotPublishWork,
          cannotAppearInDiscover: !!decision.restrictions?.cannotAppearInDiscover,
          restrictedReason: decisionReason,
        },
        actor
      );
    } else if (decision.actionTaken === 'suspend_user' || decision.actionTaken === 'user_suspended') {
      this.suspendUser(
        reportedUserId,
        {
          reason: decisionReason,
          duration: decision.duration || '30d',
          internalNote: decision.internalNote || `Suspended following resolution of case ${target.caseNumber || target.id}`,
        },
        actor
      );
    } else if (decision.actionTaken === 'unsuspend_user') {
      this.unsuspendUser(
        reportedUserId,
        {
          restorationReason: decisionReason,
          internalNote: decision.internalNote,
        },
        actor
      );
    }

    // 2. Mark report case as resolved
    target.status = 'resolved';
    target.actionTaken = decision.actionTaken;
    target.decisionReason = decisionReason;
    target.resolutionNotes = decision.resolutionNotes?.trim() || decisionReason;
    target.actionDetails = decision.actionDetails?.trim();
    target.resolvedBy = actor.name;
    target.resolvedByEmail = actor.email;
    target.resolvedAt = now;
    target.updatedAt = now;

    if (!target.internalNotes) target.internalNotes = [];
    target.internalNotes.push({
      id: `note_${Date.now()}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: `CASE RESOLVED. Action taken: ${decision.actionTaken}. Decision Reason: ${decisionReason}`,
      createdAt: now,
    });

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_CASE_RESOLVED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Case ${target.caseNumber || reportId} resolved with action "${decision.actionTaken}". Reason: "${decisionReason}".`,
    });

    return { success: true, report: target };
  },

  /**
   * Dismiss an unfounded, invalid, or duplicate report case.
   */
  dismissReportCase(
    reportId: string,
    dismissalReason: string,
    actor: AdminActor
  ): { success: boolean; report?: ReportRecord; error?: string } {
    const authCheck = this.verifyAdminActor(actor, 'moderator');
    if (!authCheck.isAuthorized) {
      return { success: false, error: authCheck.error };
    }

    const reasonTrimmed = dismissalReason.trim();
    if (!reasonTrimmed || reasonTrimmed.length < 5) {
      return { success: false, error: 'Dismissing a report requires a documented justification (min 5 characters).' };
    }

    const reports = this.getReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { success: false, error: 'Report case not found.' };
    }

    const now = new Date().toISOString();
    const target = reports[idx];
    target.status = 'dismissed';
    target.actionTaken = 'dismiss';
    target.decisionReason = reasonTrimmed;
    target.resolutionNotes = `Dismissed: ${reasonTrimmed}`;
    target.resolvedBy = actor.name;
    target.resolvedByEmail = actor.email;
    target.resolvedAt = now;
    target.updatedAt = now;

    if (!target.internalNotes) target.internalNotes = [];
    target.internalNotes.push({
      id: `note_${Date.now()}`,
      authorId: actor.id,
      authorName: actor.name,
      authorEmail: actor.email,
      note: `CASE DISMISSED: ${reasonTrimmed}`,
      createdAt: now,
    });

    reports[idx] = target;
    this.saveReports(reports);

    this.logAuditEvent({
      action: 'MODERATION_CASE_DISMISSED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'REPORT',
      targetId: reportId,
      details: `Case ${target.caseNumber || reportId} dismissed as invalid/unfounded by ${actor.name}. Reason: "${reasonTrimmed}"`,
    });

    return { success: true, report: target };
  },

  /**
   * Issue a formal warning to a user account.
   */
  issueUserWarning(
    userId: string,
    warningReason: string,
    arg3?: string | AdminActor,
    arg4?: string | AdminActor,
    arg5?: AdminActor
  ): { success: boolean; user?: UserProfile; error?: string } {
    let internalNote: string | undefined;
    let caseId: string | undefined;
    let actor: AdminActor;

    if (arg3 && typeof arg3 === 'object' && 'email' in arg3) {
      actor = arg3;
      internalNote = typeof arg4 === 'string' ? arg4 : undefined;
      caseId = typeof arg5 === 'string' ? arg5 : undefined;
    } else {
      internalNote = typeof arg3 === 'string' ? arg3 : undefined;
      caseId = typeof arg4 === 'string' ? arg4 : undefined;
      actor = (arg5 || (arg4 && typeof arg4 === 'object' && 'email' in arg4 ? arg4 : { id: 'admin', email: ROOT_ADMIN_EMAIL, name: 'Administrator' })) as AdminActor;
    }

    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'Target user account not found.' };
    }

    const now = new Date().toISOString();
    const warning: UserWarningRecord = {
      id: `warn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reason: warningReason.trim(),
      internalNote: internalNote?.trim(),
      issuedBy: actor.name,
      issuedByEmail: actor.email,
      issuedAt: now,
      caseId,
    };

    if (!user.warnings) user.warnings = [];
    user.warnings.push(warning);
    this.updateUser(user);

    this.logAuditEvent({
      action: 'USER_WARNING_ISSUED',
      category: 'moderation',
      actorEmail: actor.email,
      actorName: actor.name,
      actorId: actor.id,
      targetType: 'USER',
      targetId: userId,
      details: `Formal warning issued to ${user.fullName} (${user.email || user.username}) regarding: "${warningReason.trim()}". Case: ${caseId || 'N/A'}`,
    });

    return { success: true, user };
  },
};
