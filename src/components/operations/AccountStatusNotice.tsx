import React from 'react';
import { ShieldAlert, UserX, AlertTriangle, LogOut, Mail, Clock } from 'lucide-react';
import { UserProfile } from '../../types';

interface AccountStatusNoticeProps {
  user: UserProfile;
  onLogout: () => void;
}

export const AccountStatusNotice: React.FC<AccountStatusNoticeProps> = ({ user, onLogout }) => {
  const isSuspended = !!user.isSuspended;
  const isDeactivated = !!user.isDeactivated;

  if (!isSuspended && !isDeactivated) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E2D8] shadow-2xl p-8 space-y-6 text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
            isSuspended
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {isSuspended ? (
            <ShieldAlert className="w-8 h-8" />
          ) : (
            <UserX className="w-8 h-8" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#16222F]">
            {isSuspended ? 'Account Temporarily Suspended' : 'Account Deactivated'}
          </h2>
          <p className="text-xs text-[#52606D]">
            {isSuspended
              ? 'Your Sabi account has been suspended by an administrator due to a safety or platform compliance issue.'
              : 'This Sabi account has been deactivated.'}
          </p>
        </div>

        {/* Reason Box */}
        {isSuspended && user.suspendedReason && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2 text-xs">
            <p className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              Administrative Reason:
            </p>
            <p className="text-rose-950 italic">"{user.suspendedReason}"</p>

            {user.suspensionDetails && (
              <div className="pt-2 border-t border-rose-200 text-[11px] text-rose-800 space-y-1">
                {user.suspensionDetails.duration && (
                  <p className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Duration: {user.suspensionDetails.duration === 'indefinite' ? 'Indefinite review' : user.suspensionDetails.duration}
                  </p>
                )}
                {user.suspensionDetails.expiresAt && (
                  <p>
                    Anticipated Expiration: {new Date(user.suspensionDetails.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {isDeactivated && user.deactivationDetails && (
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-left space-y-2 text-xs text-slate-800">
            <p className="font-bold">Deactivation Reason:</p>
            <p className="italic">"{user.deactivationDetails.reason}"</p>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] text-xs text-[#52606D] text-left space-y-1">
          <p className="font-bold text-[#16222F] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#2D4D45]" />
            Appeals & Inquiries
          </p>
          <p className="text-[11px]">
            If you believe this action was made in error or wish to request an account review, contact support at{' '}
            <span className="font-mono font-bold text-[#16222F]">support@sabi.id</span> with your account username (<span className="font-mono">{user.username}</span>).
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-xs font-bold text-[#16222F] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out of Session
        </button>
      </div>
    </div>
  );
};
