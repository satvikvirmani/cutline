'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      });

      if (!response.ok) {
        setError('Wrong passcode');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('Could not reach the server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-card">
      <h1 className="login-title">30-Day Cut</h1>
      <p className="login-copy">Enter the passcode to open your tracker.</p>
      <form className="login-form" onSubmit={(event) => void submit(event)}>
        <div className="field">
          <label htmlFor="passcode">Passcode</label>
          <input id="passcode" type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} autoFocus />
        </div>
        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Checking...' : 'Unlock'}
        </button>
        <div className="login-error">{error}</div>
      </form>
    </section>
  );
}
