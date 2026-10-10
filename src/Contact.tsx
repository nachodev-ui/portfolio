import { useEffect, useRef, useState, type FormEvent } from 'react';
import { profile } from './data';
import './contact.css';

type SendState = 'idle' | 'sending' | 'accepted' | 'activation' | 'error' | 'uncertain';

function ContactIcon({ name }: { name: 'arrow' | 'linkedin' | 'mail' | 'copy' | 'github' }) {
  const paths = {
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M7 10v7M11 17v-7m0 3c0-4 6-4 6 0v4" /><circle cx="7" cy="7" r=".7" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M15 8V3H3v13h5" /></>,
    github: <><path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .2-2-1-3 4-.5 6-2 6-6 0-1-.3-2-1-3 .3-1 .3-3 0-4-2 0-3 1-4 2a15 15 0 0 0-6 0C8 3 7 2 5 2c-.3 1-.3 3 0 4-.7 1-1 2-1 3 0 4 2 5.5 6 6-1 1-1 2-1 3v4" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [state, setState] = useState<SendState>('idle');
  const [feedback, setFeedback] = useState('');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef<AbortController | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => {
    clearTimeout(copyTimer.current);
    const pending = request.current;
    request.current = null;
    pending?.abort();
  }, []);

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true); setCopyError(false);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2800);
    } catch { setCopyError(true); }
  }

  function showFeedback(next: SendState, message: string) {
    setState(next); setFeedback(message);
    requestAnimationFrame(() => feedbackRef.current?.focus({ preventScroll: true }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current || state === 'accepted') return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get('name') ?? '').trim();
    const email = String(values.get('email') ?? '').trim();
    const subject = String(values.get('subject') ?? '').trim();
    const message = String(values.get('message') ?? '').trim();
    if (String(values.get('_honey') ?? '')) return;
    if (!form.reportValidity()) return;
    if (name.length < 2 || message.length < 20) {
      showFeedback('error', 'Escribe tu nombre y un mensaje de al menos 20 caracteres para que pueda entender tu propuesta.');
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setState('sending'); setFeedback('Enviando tu mensaje…');
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(profile.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name, email, subject, message,
          _subject: `Portfolio · ${subject}`,
          _replyto: email,
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      });
      const result: { success?: unknown; message?: unknown } = await response.json();
      if (request.current !== controller) return;
      if (controller.signal.aborted) throw new DOMException('Request timed out', 'AbortError');
      const providerMessage = typeof result.message === 'string' ? result.message : '';
      if (/activat|confirm.*email|verify.*email/i.test(providerMessage)) {
        showFeedback('activation', 'Este canal aún está pendiente de activación. Tu mensaje sigue aquí; por ahora puedes escribirme por correo o LinkedIn.');
      } else if (response.ok && (result.success === true || result.success === 'true')) {
        form.reset();
        showFeedback('accepted', 'Tu mensaje fue aceptado para envío. Gracias por conectar; responderé al correo que indicaste.');
      } else {
        showFeedback('error', 'El servicio no aceptó el envío. Conservamos tu mensaje: puedes intentarlo de nuevo o usar el correo directo.');
      }
    } catch {
      // A timeout or broken connection does not prove whether the provider received the request.
      if (request.current === controller) showFeedback('uncertain', 'No pudimos confirmar el envío. Tu mensaje sigue aquí. Antes de reenviarlo, también puedes contactarme por correo o LinkedIn.');
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) request.current = null;
    }
  }

  return <div className="page-inner contact-page">
    <header className="page-heading"><span className="eyebrow">05 / UNA NUEVA ALIANZA</span><h1 tabIndex={-1}>¿Creamos algo juntos?<span>.</span></h1><p>Una oportunidad, una idea o una buena conversación. El siguiente movimiento puede empezar aquí.</p></header>
    <div className="contact-dossier">
      <section className="contact-identity" aria-labelledby="contact-identity-title">
        <div className="contact-id-strip"><span>CONFIDANT / IC—01</span><span aria-hidden="true">✦</span></div>
        <h2 id="contact-identity-title">TU PRÓXIMA<br />IDEA.<br /><em>NUESTRO<br />DESAFÍO.</em></h2>
        <p>Desarrollo web, experiencias con identidad y datos con propósito. Si buscas a alguien para tu equipo o quieres construir algo, conversemos.</p>
        <a className="contact-linkedin" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><ContactIcon name="linkedin" /><span>Conectemos en LinkedIn<small>PERFIL PROFESIONAL</small></span><ContactIcon name="arrow" /><span className="sr-only"> (abre en otra pestaña)</span></a>
        <div className="contact-email"><span className="eyebrow">CORREO DIRECTO</span><a href={`mailto:${profile.email}`}>{profile.email}</a><button className="contact-copy" onClick={copyContact}><ContactIcon name="copy" />{copied ? '¡Copiado!' : 'Copiar correo'}</button><p className="copy-feedback" role="status">{copyError ? `Puedes copiar el contacto manualmente: ${profile.email}` : copied ? 'Correo copiado al portapapeles.' : ''}</p></div>
        <div className="contact-identity-footer"><span>Ignacio Cisternas<small>{profile.location}</small></span><a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="Ver código en GitHub (abre en otra pestaña)"><ContactIcon name="github" />GitHub<ContactIcon name="arrow" /></a></div>
      </section>
      <section className="calling-card" aria-labelledby="contact-form-title">
        <div className="calling-card-top"><span className="eyebrow">EL PRÓXIMO CAPÍTULO</span><span className="calling-card-stamp" aria-hidden="true">TAKE<br />YOUR<br />CHANCE.</span></div>
        <h2 id="contact-form-title">Deja tu mensaje<span>!</span></h2><p className="calling-card-intro">Escríbeme desde aquí. Te responderé por correo.</p>
        <form ref={formRef} onSubmit={submit} aria-label="Formulario de contacto">
          {state !== 'accepted' && <fieldset disabled={state === 'sending'} aria-busy={state === 'sending'}>
            <legend className="sr-only">Datos de tu mensaje</legend>
            <div className="contact-field-row"><label htmlFor="contact-name"><span><b>01</b> Tu nombre</span><input id="contact-name" name="name" autoComplete="name" placeholder="¿Con quién tengo el gusto?" required minLength={2} maxLength={100} /></label><label htmlFor="contact-email"><span><b>02</b> Tu correo</span><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="nombre@empresa.com" required maxLength={254} /></label></div>
            <label htmlFor="contact-subject"><span><b>03</b> ¿Qué tienes en mente?</span><select id="contact-subject" name="subject" defaultValue="Oportunidad laboral"><option>Oportunidad laboral</option><option>Propuesta de proyecto</option><option>Conversemos</option></select></label>
            <label htmlFor="contact-message"><span><b>04</b> Tu mensaje</span><textarea id="contact-message" name="message" placeholder="Cuéntame sobre el equipo, la oportunidad o tu idea…" required minLength={20} maxLength={5000} rows={5} aria-describedby="contact-message-hint" /></label>
            <span id="contact-message-hint" className="contact-message-hint">Entre 20 y 5.000 caracteres. Todos los campos son obligatorios.</span>
            <div hidden aria-hidden="true"><label>Dejar vacío<input name="_honey" tabIndex={-1} autoComplete="off" /></label></div>
            <button className="contact-send" type="submit"><span>{state === 'sending' ? 'Enviando mensaje…' : 'Enviar mensaje'}</span><ContactIcon name={state === 'sending' ? 'mail' : 'arrow'} /></button>
          </fieldset>}
          <div ref={feedbackRef} className={`contact-feedback feedback-${state}`} role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}>
            {state === 'accepted' && <><span className="feedback-seal" aria-hidden="true">✦</span><strong>Una nueva conexión.</strong></>}
            {feedback && <p>{feedback}</p>}
          </div>
          {state === 'accepted' && <button className="contact-new-message" type="button" onClick={() => { setState('idle'); setFeedback(''); requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus()); }}>Escribir otro mensaje <ContactIcon name="arrow" /></button>}
        </form>
        <p className="contact-relay">Tu nombre, correo y mensaje se envían mediante <a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener noreferrer">FormSubmit<span className="sr-only"> (privacidad, abre en otra pestaña)</span></a> para poder responderte.</p>
      </section>
    </div>
    <div className="contact-page-note"><span aria-hidden="true">✦</span><p>CADA GRAN PROYECTO EMPIEZA CON UN PRIMER MENSAJE.</p><span aria-hidden="true">IC / NEXT CHAPTER</span></div>
  </div>;
}
