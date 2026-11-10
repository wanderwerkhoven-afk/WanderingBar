import { useEffect, useState, type ReactNode } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Cloud, CloudOff, Download, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { prepareSync, startLiveSync, type PreparedSync } from './storageSync';
import './cloud.css';

type Phase = 'login' | 'loading' | 'conflict' | 'ready' | 'error';

function message(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('auth/unauthorized-domain')) return 'Voeg wanderwerkhoven-afk.github.io toe bij Authentication → Settings → Authorized domains.';
    if (error.message.includes('auth/operation-not-allowed')) return 'Schakel Google in bij Firebase → Authentication → Sign-in method.';
    if (error.message.includes('permission-denied')) return 'Firestore-toegang geweigerd. Publiceer de beveiligingsregels uit firestore.rules.';
    return error.message;
  }
  return 'Er is iets misgegaan. Probeer het opnieuw.';
}

export default function CloudGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>('loading');
  const [prepared, setPrepared] = useState<PreparedSync | null>(null);
  const [initial, setInitial] = useState<Awaited<ReturnType<PreparedSync['activate']>> | null>(null);
  const [error, setError] = useState('');
  const [exported, setExported] = useState(false);
  const [remoteChange, setRemoteChange] = useState(false);
  const [retry, setRetry] = useState(0);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser, e => {
    setError(message(e)); setPhase('error');
  }), []);

  useEffect(() => {
    let cancelled = false;
    if (user === undefined) return;
    if (!user) {
      setPhase('login'); setPrepared(null); setInitial(null); setRemoteChange(false);
      return;
    }
    setPhase('loading'); setError(''); setExported(false); setInitial(null);
    void prepareSync(user.uid).then(async next => {
      if (cancelled) return;
      setPrepared(next);
      if (next.hasConflict) { setPhase('conflict'); return; }
      const data = await next.activate();
      if (!cancelled) { setInitial(data); setPhase('ready'); }
    }).catch(e => {
      if (!cancelled) { setError(message(e)); setPhase('error'); }
    });
    return () => { cancelled = true; };
  }, [user, retry]);

  useEffect(() => {
    if (!user || phase !== 'ready' || !initial) return;
    return startLiveSync(user.uid, initial, () => setRemoteChange(true), e => setError(e));
  }, [user, phase, initial]);

  async function logIn() {
    setError(''); setSigningIn(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { setError(message(e)); }
    finally { setSigningIn(false); }
  }

  async function choose(choice: 'cloud' | 'merge') {
    if (!prepared || !exported) return;
    setPhase('loading'); setError('');
    try {
      const data = await prepared.activate(choice);
      setInitial(data); setPhase('ready');
    } catch (e) { setError(message(e)); setPhase('error'); }
  }

  if (phase !== 'ready') return (
    <div className="cloud-auth-page">
      <div className="cloud-auth-card">
        <div className="cloud-auth-symbol"><ShieldCheck size={30}/></div>
        <p className="cloud-eyebrow">WANDERING BAR</p>
        <h1>BarBack<span>.</span></h1>
        {phase === 'login' && <>
          <p>Log veilig in met je Google-account. Je evenementen, inventaris en recepten worden daarna met Firebase gesynchroniseerd.</p>
          <button type="button" className="cloud-primary" disabled={signingIn} onClick={logIn}>
            {signingIn ? 'Inloggen…' : 'Inloggen met Google'}
          </button>
          <small>Je lokale gegevens blijven bewaard.</small>
        </>}
        {phase === 'loading' && <p role="status">Je gegevens veilig controleren en synchroniseren…</p>}
        {phase === 'conflict' && <>
          <h2>Er zijn twee versies gevonden</h2>
          <p>Op dit apparaat staan lokale gegevens die verschillen van Firebase. Kies welke versie je wilt gebruiken. Download eerst een back-up van <strong>beide</strong> versies.</p>
          <button className="cloud-secondary" type="button" onClick={() => {
            prepared?.exportBackup(); setExported(true);
          }}><Download size={18}/> Back-up downloaden</button>
          <button className="cloud-primary" disabled={!exported} type="button" onClick={() => void choose('merge')}>
            Lokale gegevens samenvoegen met Firebase
          </button>
          <button className="cloud-secondary" disabled={!exported} type="button" onClick={() => void choose('cloud')}>
            Alleen Firebase-gegevens gebruiken
          </button>
          <small>Bij samenvoegen blijven unieke records behouden. Bij gelijke ID's krijgt de lokale versie voorrang. De back-up bevat de originele versies.</small>
        </>}
        {phase === 'error' && <>
          <p>De cloudverbinding is nog niet gereed. Je bestaande gegevens zijn niet verwijderd.</p>
          <button className="cloud-primary" onClick={() => setRetry(i => i + 1)}>Opnieuw proberen</button>
        </>}
        {error && <div className="cloud-error" role="alert">{error}</div>}
        {user && <button type="button" className="cloud-signout" onClick={() => void signOut(auth)}><LogOut size={16}/> Ander Google-account</button>}
      </div>
    </div>
  );

  return <>
    <div className="cloud-status-bar" role="status">
      <span><Cloud size={15}/> Firebase verbonden · {user?.displayName || user?.email}</span>
      <button type="button" onClick={() => void signOut(auth)} aria-label="Uitloggen"><LogOut size={16}/></button>
    </div>
    {(error || remoteChange) && <div className="cloud-notice" role="alert">
      {error ? <CloudOff size={19}/> : <RefreshCw size={19}/>}
      <span>{error || 'Er zijn nieuwe gegevens van een ander apparaat. Vernieuw om ze te zien.'}</span>
      {remoteChange && <button type="button" onClick={() => window.location.reload()}>Vernieuwen</button>}
    </div>}
    {children}
  </>;
}
