import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout, error, clearError } = useAuth();
  const [name, setName] = useState(user?.name ?? '');

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setNameSuccess(false);
    setNameLoading(true);
    try {
      const updated = await authApi.updateProfile(name.trim() || null);
      updateUser(updated);
      setNameSuccess(true);
    } catch {
      // error from context if API sets it
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      logout();
      navigate('/login', { replace: true, state: { message: 'Password changed. Please sign in with your new password.' } });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
      if (msg === 'WRONG_PASSWORD') setPasswordError('Current password is incorrect.');
      else if (msg === 'PASSWORD_TOO_SHORT') setPasswordError('New password must be at least 6 characters.');
      else setPasswordError('Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page settings-page">
      <header className="page-intro">
        <p className="muted">Change your display name and password.</p>
      </header>

      <div className="page-card-block">
        <h2 className="page-card-title">Display name</h2>
        <form onSubmit={handleNameSubmit} className="auth-form settings-form">
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          {nameSuccess && (
            <p className="settings-success" role="status">Display name updated.</p>
          )}
          <label>
            <span>Display name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={user?.email ?? ''}
              autoComplete="name"
            />
          </label>
          <button type="submit" disabled={nameLoading}>
            {nameLoading ? 'Saving…' : 'Save name'}
          </button>
        </form>
      </div>

      <div className="page-card-block">
        <h2 className="page-card-title">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="auth-form settings-form">
          {passwordError && (
            <div className="auth-error" role="alert">
              {passwordError}
            </div>
          )}
          <label>
            <span>Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label>
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
