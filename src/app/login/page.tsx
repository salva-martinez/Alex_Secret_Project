'use client';

import { useState, ReactElement, FormEvent, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export default function LoginPage(): ReactElement {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus('loading');

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        setStatus('error');
        const isAccessDenied = result.error === 'AccessDenied';
        setMessage(isAccessDenied ? 'Your email is not on the invitation list.' : 'Something went wrong.');
        return;
      }

      setStatus('success');
      setMessage('Check your email for the magic link!');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <h1 className="font-display text-neon-pink">FriendVault</h1>
        <p className="subtitle">Exclusive Media Library</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">EMail Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="invite-only@example.com"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending...' : 'Get Magic Link'}
          </button>
        </form>

        {message && (
          <p className={`message ${status === 'error' ? 'text-neon-pink' : 'text-neon-cyan'}`}>
            {message}
          </p>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .login-container {
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-card {
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        h1 {
          font-size: 3rem;
          margin: 0;
        }

        .subtitle {
          color: var(--text-muted);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .input-group label {
          font-family: 'Righteous', cursive;
          font-size: 0.8rem;
          color: var(--accent-cyan);
        }

        .input-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 12px;
          color: white;
          border-radius: 6px;
          outline: none;
        }

        .input-group input:focus {
          border-color: var(--accent-pink);
          box-shadow: var(--neon-pink-glow);
        }

        .message {
          font-size: 0.9rem;
          margin-top: 1rem;
        }
      `}} />
    </div>
  );
}
