import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock, User } from 'lucide-react';
import { UserProfile } from '../../types';
import { operationsService } from '../../services/operationsService';
import { auth } from '../../services/auth';

interface UserAccountRecoveryViewProps {
  recoveryToken: string;
  onRecoveryComplete: (recoveredUser: UserProfile) => void;
  onCancel: () => void;
}

export const UserAccountRecoveryView: React.FC<UserAccountRecoveryViewProps> = ({
  recoveryToken,
  onRecoveryComplete,
  onCancel,
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const res = operationsService.validateRecoveryToken(recoveryToken);
    setIsValidating(false);
    if (res.valid && res.user) {
      setTokenValid(true);
      setTargetUser(res.user);
    } else {
      setTokenValid(false);
      setValidationError(res.error || 'This recovery link is invalid or has expired.');
    }
  }, [recoveryToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setSubmitError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = operationsService.completeAccountRecovery(recoveryToken, newPassword);
    setIsSubmitting(false);

    if (res.success && res.user) {
      setIsSuccess(true);
      auth.setCurrentUser(res.user);
      setTimeout(() => {
        onRecoveryComplete(res.user!);
      }, 2000);
    } else {
      setSubmitError(res.error || 'Failed to complete recovery.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E2D8] shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3EF] text-[#2D4D45] flex items-center justify-center mx-auto border border-[#CFE2D9]">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#16222F]">Account Recovery</h2>
          <p className="text-xs text-[#52606D]">
            Official secure recovery token verification for SABI
          </p>
        </div>

        {isValidating ? (
          <div className="py-8 text-center text-xs text-[#7A8690] space-y-2">
            <div className="w-6 h-6 border-2 border-[#2D4D45] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Validating cryptographic recovery token...</p>
          </div>
        ) : !tokenValid ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
              <AlertTriangle className="w-6 h-6 text-rose-700 mx-auto" />
              <p className="font-bold">Recovery Link Invalid or Expired</p>
              <p className="text-[11px] text-rose-800">{validationError}</p>
            </div>
            <p className="text-xs text-[#7A8690]">
              Recovery tokens are single-use and expire after 24 hours. Contact your platform administrator if you require a new recovery token.
            </p>
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl border border-[#D5CEC2] hover:bg-[#FAF8F5] text-xs font-bold text-[#16222F] transition-colors cursor-pointer"
            >
              Return to Sabi Home
            </button>
          </div>
        ) : isSuccess ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#16222F]">Account Successfully Recovered!</h3>
              <p className="text-xs text-[#52606D]">
                Your credentials have been securely reset. Redirecting you to your Sabi proof portfolio...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Info Pill */}
            {targetUser && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2D8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EAF3EF] border border-[#CFE2D9] text-[#2D4D45] font-bold flex items-center justify-center shrink-0">
                  {targetUser.fullName.charAt(0)}
                </div>
                <div className="overflow-hidden text-left">
                  <p className="font-bold text-xs text-[#16222F] truncate">
                    {targetUser.fullName}
                  </p>
                  <p className="text-[11px] text-[#52606D] font-mono truncate">
                    @{targetUser.username} • {targetUser.email}
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                {submitError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A8690] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16222F] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A8690] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-[#FAF8F5]/60"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#7A8690] leading-relaxed">
              Completing recovery invalidates all prior sessions and issues a new session version under Zero-Trust credentials.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#2D4D45] hover:bg-[#233C36] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Credentials...' : 'Reset Password & Access Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
