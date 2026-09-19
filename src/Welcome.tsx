import { useEffect, useRef, useState, type ReactNode } from 'react';
import { focusableElements, moveFocus, navigationAction } from './navigation';
import './welcome.css';

export const welcomeSessionKey = 'portfolio-welcome-seen-v1';

export function shouldWelcome() {
  try { return sessionStorage.getItem(welcomeSessionKey) !== 'true'; } catch { return true; }
}

export default function Welcome({ emblem, onEnter, onActivateSound }: { emblem: ReactNode; onEnter: (immersive: boolean) => void; onActivateSound: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    let mounted = true;
    // Wait for real font readiness, with a bounded fallback. Never block entry.
    const fallback = setTimeout(() => { if (mounted) setReady(true); }, 1500);
    void document.fonts.ready.then(() => { if (mounted) setReady(true); });
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-entry-mode="immersive"]')?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
    return () => {
      mounted = false;
      clearTimeout(fallback);
      clearTimeout(exitTimer.current);
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  function enter(immersive: boolean, instant = false) {
    if (leavingRef.current) return;
    leavingRef.current = true;
    // The user gesture also unlocks audio in App; do not defer it until the timer.
    if (immersive) onActivateSound();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
    if (reduced || instant) { onEnter(immersive); return; }
    setLeaving(true);
    exitTimer.current = setTimeout(() => onEnter(immersive), 360);
  }

  return <dialog ref={dialogRef} className={`welcome-screen${leaving ? ' is-leaving' : ''}`} aria-labelledby="welcome-title" aria-describedby="welcome-description" onCancel={event => { event.preventDefault(); enter(false, true); }} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return;
    if (leavingRef.current) { if (event.key !== 'Escape') event.preventDefault(); return; }
    const controls = focusableElements(event.currentTarget);
    if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
      return;
    }
    const action = navigationAction(event.key);
    if (action === 'previous' || action === 'next' || action === 'back' || action === 'open') {
      event.preventDefault();
      const choices = controls.filter(control => control.dataset.entryMode);
      moveFocus(choices, action === 'previous' || action === 'back' ? -1 : 1);
    } else if (event.key === 'Enter' && event.repeat) event.preventDefault();
  }}>
    <div className="welcome-shell">
      <header className="welcome-top"><span className="welcome-brand">ic<span>✦</span></span><span>IGNACIO CISTERNAS <b>/ PERSONAL PORTFOLIO</b></span><button className="welcome-skip" onClick={() => enter(false, true)} aria-label="Saltar bienvenida">Saltar intro <span>↗</span></button></header>
      <div className="welcome-stage">
        <div className="welcome-art" aria-hidden="true"><span className="welcome-orbit" /><span className="welcome-orbit orbit-two" /><span className="welcome-star">✦</span>{emblem}<span className="welcome-art-tag">A NEW CONNECTION AWAITS.</span><span className="welcome-serial">PLAYER 01 · YOUR STORY STARTS HERE</span></div>
        <div className="welcome-copy"><span className="welcome-label">HAS ENCONTRADO UNA NUEVA PERSONA.</span><h1 id="welcome-title">NO ES UN<br />PORTAFOLIO<br /><em>CUALQUIERA.</em></h1><p id="welcome-description">Pasa al otro lado del código.<br />Elige cómo quieres comenzar esta historia.</p></div>
        <div className="welcome-modes">
          <button className="welcome-mode immersive-mode" data-entry-mode="immersive" onClick={() => enter(true)} autoFocus><span className="mode-heading"><span>01 / MODO INMERSIVO</span><span className="mode-arrow">↗</span></span><span className="welcome-keys" aria-hidden="true"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><strong>ENTRA EN EL JUEGO.</strong><span className="mode-description">W/S o ↑/↓ para elegir.<br />D/→ o Enter para abrir. A/← para volver.</span><span className="mode-cta">Comenzar con teclado <small>ACTIVA EFECTOS DE SONIDO</small></span></button>
          <button className="welcome-mode pointer-mode" data-entry-mode="pointer" onClick={() => enter(false)}><span className="mode-heading"><span>02 / A TU RITMO</span><span className="mode-arrow">↗</span></span><span className="welcome-pointer" aria-hidden="true"><svg viewBox="0 0 60 64" fill="none"><path d="m10 5 36 29-18 2-9 17Z" fill="currentColor" /><path d="m33 39 10 16" stroke="currentColor" strokeWidth="6" /><path d="M44 8h10M51 2v12" stroke="currentColor" strokeWidth="2" /></svg></span><strong>SIGUE TU CURIOSIDAD.</strong><span className="mode-description">Haz clic o toca para explorar.<br />Desplázate para descubrir cada detalle.</span><span className="mode-cta">Explorar con ratón o touch <small>COMENZAR SIN SONIDO</small></span></button>
        </div>
      </div>
      <footer className="welcome-footer"><span className={`welcome-ready${ready ? ' is-ready' : ''}`} role="status"><i />{ready ? 'TODO LISTO. TU TURNO.' : 'PREPARANDO LA ESCENA…'}</span><span><b>WASD / FLECHAS</b> Elegir <b>ENTER</b> Comenzar<small>Puedes alternar teclado y ratón en cualquier momento.</small></span><strong>TAKE YOUR TIME.</strong></footer>
    </div>
  </dialog>;
}
