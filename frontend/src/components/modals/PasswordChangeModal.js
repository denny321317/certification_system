import React, { useState, useMemo } from 'react';

/**
 * PasswordChangeModal
 *
 * Props:
 *  - open: boolean (whether modal is visible)
 *  - onClose: function
 *  - securitySettings: object returned from backend (see sample)
 *  - username: string (the username attempted during login)
 *  - oldPassword: string (the password user just used to login; needed for reset)
 *  - updateEndpoint: optional string (defaults to '/update-password')
 *  - token: the password reset token of the user
 *
 * When successful it redirects to /login.
 */
const PasswordChangeModal = ({
  open,
  onClose,
  securitySettings,
  username,
  oldPassword,
  updateEndpoint = 'http://localhost:8000/api/update-password-for-compliancy',
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const requirements = useMemo(() => {
    console.log('securitySettings in modal: ', securitySettings);
    if (!securitySettings) return [];
    const reqs = [];
    if (securitySettings.requireMinLength) {
      reqs.push({
        key: 'minLength',
        label: `至少 ${securitySettings.minLength} 個字元`,
        test: (pw) => pw.length >= securitySettings.minLength
      });
    }
    if (securitySettings.requireUpperLowerCase) {
      reqs.push({
        key: 'upperLower',
        label: '密碼需同時包含大小寫字母',
        test: (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw)
      });
    }
    if (securitySettings.requireNumber) {
      reqs.push({
        key: 'number',
        label: '密碼需包含至少一個數字',
        test: (pw) => /\d/.test(pw)
      });
    }
    if (securitySettings.requireSpecialChar) {
      reqs.push({
        key: 'special',
        label: '密碼需包含至少下列任意一個特殊字元 (!@#$%^&* etc.)',
        test: (pw) => /[^A-Za-z0-9]/.test(pw)
      });
    }
    return reqs;
  }, [securitySettings]);

  const allRequirementsMet = requirements.every(r => r.test(newPassword));
  const passwordsMatch = newPassword && newPassword === confirm;

  const canSubmit = allRequirementsMet && passwordsMatch && !submitting && newPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(updateEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setErrorMsg(data.error || 'Password reset failed.');
      } else {
        setSuccessMsg('Password updated. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1400);
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pwchange-title">
        <h2 id="pwchange-title" style={{ marginTop: 0 }}>請更新密碼</h2>
        <p style={{ marginTop: 0 }}>
          您的密碼已經不符合更新過後的密碼安全政策，請重設密碼
        </p>

        <div style={styles.requirements}>
          <strong>密碼要求:</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '6px', marginBottom: '12px' }}>
            {requirements.length === 0 && (
              <li>No special requirements (a new password is still needed)</li>
            )}
            {requirements.map(r => {
              const met = r.test(newPassword);
              return (
                <li key={r.key} style={{ color: met ? 'green' : 'red' }}>
                  {met ? '✓' : '✗'} {r.label}
                </li>
              );
            })}
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label htmlFor="newPassword">新密碼</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="confirmPassword">確認新密碼</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={styles.input}
            />
          </div>

            {/* Client-side status */}
          <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
            {!passwordsMatch && confirm.length > 0 && (
              <span style={{ color: 'red' }}>密碼不相符</span>
            )}
            {passwordsMatch && confirm.length > 0 && (
              <span style={{ color: 'green' }}>密碼相符</span>
            )}
          </div>

          {errorMsg && (
            <div style={{ ...styles.alert, ...styles.error }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ ...styles.alert, ...styles.success }}>
              {successMsg}
            </div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={styles.secondaryBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...styles.primaryBtn,
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  modal: {
    background: '#fff',
    padding: '24px 28px 28px',
    borderRadius: '8px',
    width: '420px',
    maxWidth: '90%',
    boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
    fontFamily: 'sans-serif',
    lineHeight: 1.4
  },
  requirements: {
    background: '#f5f7fa',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '14px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '12px'
  },
  input: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px'
  },
  primaryBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600
  },
  secondaryBtn: {
    background: '#e5e7eb',
    color: '#111',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    fontSize: '0.95rem'
  },
  alert: {
    padding: '8px 10px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    marginBottom: '8px'
  },
  error: {
    background: '#fde2e1',
    color: '#b42318'
  },
  success: {
    background: '#e1f9e5',
    color: '#067647'
  }
};

export default PasswordChangeModal;