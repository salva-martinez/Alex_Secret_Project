'use client';

import { useState, ReactElement, FormEvent, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2;
type AuthStatus = 'idle' | 'loading' | 'error';

interface CheckUsernameResponse {
  exists?: boolean;
  needsPassword?: boolean;
  allowed?: boolean;
}

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleUsernameSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(
        `/api/auth/check-username?username=${encodeURIComponent(username.trim())}`
      );
      const data = (await res.json()) as CheckUsernameResponse;

      if (data.allowed === false) {
        setStatus('error');
        setMessage('Usuario no autorizado.');
        return;
      }

      setIsRegister(data.needsPassword === true);
      setStep(2);
      setStatus('idle');
    } catch (err: unknown) {
      console.error('Check username error:', err);
      setStatus('error');
      setMessage('Error al verificar el usuario.');
    }
  };

  const handlePasswordSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });

        const data = (await res.json()) as { error?: string };

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error ?? 'Error al registrar.');
          return;
        }
      }

      const result = await signIn('credentials', {
        username: username.trim(),
        password,
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        setStatus('error');
        setMessage(isRegister ? 'Error al iniciar sesión.' : 'Contraseña incorrecta.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      console.error('Auth error:', err);
      setStatus('error');
      setMessage('Ha ocurrido un error.');
    }
  };

  const handleBack = (): void => {
    setStep(1);
    setPassword('');
    setMessage('');
    setStatus('idle');
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <h1 className="font-display text-neon-pink">FriendVault</h1>
        <p className="subtitle">Exclusive Media Library</p>

        {step === 1 ? (
          <form onSubmit={handleUsernameSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="nombre_de_usuario"
                required
                autoComplete="username"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="login-form">
            <p className="step-username">Usuario: {username}</p>
            <div className="input-group">
              <label htmlFor="password">
                {isRegister ? 'Elige una contraseña (mín. 8 caracteres)' : 'Contraseña'}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
                minLength={isRegister ? 8 : 1}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
            <div className="button-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={status === 'loading'}
              >
                Volver
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? (isRegister ? 'Registrando...' : 'Entrando...')
                  : (isRegister ? 'Registrar' : 'Entrar')}
              </button>
            </div>
          </form>
        )}

        {message && (
          <p className={`message ${status === 'error' ? 'text-neon-pink' : 'text-neon-cyan'}`}>
            {message}
          </p>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
          text-align: left;
        }

        .step-username {
          color: var(--text-muted);
          font-size: 0.9rem;
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
          box-sizing: border-box;
        }

        .input-group input:focus {
          border-color: var(--accent-pink);
          box-shadow: var(--neon-pink-glow);
        }

        .button-row {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }

        .message {
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
      ` }} />
    </div>
  );
}
