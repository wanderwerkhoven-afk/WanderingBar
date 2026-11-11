import { useEffect, useState, type ReactNode } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { ArrowRight, Cloud, CloudOff, Download, LogOut, Martini, RefreshCw, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { prepareSync, startLiveSync, type PreparedSync } from './storageSync';
import LoginIllustration from './LoginIllustration';
import MigrationV3 from './MigrationV3';
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
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');
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
    return startLiveSync(user.uid, initial, () => setRemoteChange(true), e => setError(e), setSyncStatus);
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
      <header className="cloud-site-header">
        <div className="cloud-header-logo"><strong>Wandering Bar<span>.</span></strong><small>COCKTAIL EXPERIENCE ON LOCATION</small></div>
        <div className="cloud-header-label"><span className="cloud-header-marker"/> PRIVATE WORKSPACE</div>
      </header>
      <div className="cloud-auth-stage">
        <div className="cloud-art-left" aria-hidden="true">
          <div className="cloud-art-squiggle">〰</div>
          <div className="cloud-quote-preview"><div className="cloud-quote-top"><b>WANDERING BAR</b><span>OFFERTE</span></div><div className="cloud-quote-lines"><i/><i/><i/></div><div className="cloud-quote-total"/></div>
          <div className="cloud-art-dots"/>
          <div className="cloud-art-circle"/>
        </div>
        <div className={'cloud-auth-card' + (phase === 'conflict' ? ' cloud-auth-card-expanded' : '')}>
          <div className="cloud-auth-symbol"><Martini size={26} strokeWidth={1.6}/></div>
          <p className="cloud-eyebrow">WANDERING BAR · BARBACK</p>
          <h1>{phase === 'login' ? 'Welkom terug' : 'BarBack'}<span>.</span></h1>
        {phase === 'login' && <>
          <p className="cloud-intro">Jouw evenementen, cocktails en voorbereidingen. Alles op één plek.</p>
          <div className="cloud-login-separator"><span>VEILIG INLOGGEN</span></div>
          <button type="button" className="cloud-primary cloud-google-button" disabled={signingIn} onClick={logIn}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.4-.18-2.07H12v3.91h5.24a4.49 4.49 0 0 1-1.94 2.95v2.46h3.16c1.85-1.7 2.89-4.2 2.89-7.25Z"/>
              <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.46-2.37l-3.16-2.46c-.88.59-2.01.94-3.3.94-2.53 0-4.67-1.7-5.44-3.98H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z"/>
              <path fill="#FBBC05" d="M6.56 13.63a5.85 5.85 0 0 1 0-3.75V7.35H3.3a9.75 9.75 0 0 0 0 8.81l3.26-2.53Z"/>
              <path fill="#EA4335" d="M12 5.89c1.44 0 2.74.5 3.75 1.47l2.81-2.81A9.34 9.34 0 0 0 12 2.5a9.75 9.75 0 0 0-8.7 4.85l3.26 2.53A5.84 5.84 0 0 1 12 5.89Z"/>
            </svg>
            <span>{signingIn ? 'Even geduld…' : 'Verder met Google'}</span><ArrowRight size={18}/>
          </button>
          <div className="cloud-login-security"><ShieldCheck size={18}/><span>Beveiligde toegang tot jouw persoonlijke workspace.</span></div>
        </>}
        {phase === 'loading' && <p role="status">Je gegevens veilig controleren en synchroniseren…</p>}
        {phase === 'conflict' && <>
          <h2>Welke gegevens wil je gebruiken?</h2>
          <p>Dit apparaat bevat nog lokale BarBack-gegevens. Je kunt de Firebase-gegevens van je andere apparaat gebruiken of beide versies samenvoegen. Download eerst een back-up van <strong>beide</strong> versies.</p>
          {prepared?.localProblem && <p role="status">{prepared.localProblem} Je kunt wel veilig verdergaan met de gegevens uit Firebase.</p>}
          <button className="cloud-secondary" type="button" onClick={() => {
            prepared?.exportBackup(); setExported(true);
          }}><Download size={18}/> Back-up downloaden</button>
          <button className="cloud-primary" disabled={!exported} type="button" onClick={() => void choose('cloud')}>
            Apparaatcache vervangen door Firebase
          </button>
          <button className="cloud-secondary" disabled={!exported || !prepared?.canMerge} type="button" onClick={() => void choose('merge')}>
            Lokale gegevens samenvoegen met Firebase
          </button>
          <small>De eerste optie vervangt alleen de BarBack-gegevens in deze browser, niet je account of gegevens op je telefoon. De gedownloade back-up bewaart beide originele versies. Bij samenvoegen blijven unieke records behouden; bij gelijke ID's krijgt de lokale versie voorrang.</small>
        </>}
        {phase === 'error' && <>
          <p>De cloudverbinding is nog niet gereed. Je bestaande gegevens zijn niet verwijderd.</p>
          <button className="cloud-primary" onClick={() => setRetry(i => i + 1)}>Opnieuw proberen</button>
        </>}
        {error && <div className="cloud-error" role="alert">{error}</div>}
        {user && <button type="button" className="cloud-signout" onClick={() => void signOut(auth)}><LogOut size={16}/> Ander Google-account</button>}
        </div>
        <div className="cloud-art-right" aria-hidden="true"><LoginIllustration/><div className="cloud-art-caption">CRAFTED WITH CARE <span>✳</span></div></div>
      </div>
      <footer className="cloud-auth-footer"><span>© {new Date().getFullYear()} Wandering Bar</span><span className="cloud-footer-dot">·</span><span>Met aandacht voor elk detail</span></footer>
    </div>
  );

  return <>
    <div className="cloud-status-bar" role="status">
      <span><Cloud size={15}/> {syncStatus === 'synced' ? 'Gesynchroniseerd' : syncStatus === 'syncing' ? 'Synchroniseren…' : 'Synchronisatie controleren'} · {user?.displayName || user?.email}</span>
      
      <button type="button" onClick={() => void signOut(auth)} aria-label="Uitloggen"><LogOut size={16}/></button>
    </div>
    {(error || remoteChange) && <div className="cloud-notice" role="alert">
      {error ? <CloudOff size={19}/> : <RefreshCw size={19}/>}
      <span>{error || 'Er zijn nieuwe gegevens van een ander apparaat. Vernieuw om ze te zien.'}</span>
      {remoteChange && <button type="button" onClick={() => window.location.reload()}>Vernieuwen</button>}
    </div>}
    <MigrationV3 uid={user.uid}/>
    {children}
  </>;
}
