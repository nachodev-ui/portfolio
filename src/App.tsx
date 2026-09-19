import { useEffect, useRef, useState, type ReactNode } from 'react';
import { profile, projects, sections, skillGroups, type Category, type Project, type SectionId } from './data';
import Welcome, { shouldWelcome, welcomeSessionKey } from './Welcome';
import { focusableElements, isEditing, moveFocus, navigationAction } from './navigation';

function Icon({ name, ...props }: { name: 'arrow' | 'sound' | 'mute' | 'motion' | 'github' | 'close' | 'copy' | 'pin' } & React.SVGProps<SVGSVGElement>) {
  const paths = {
    arrow: <><path d="M5 19 19 5M5 5h14v14" /></>,
    sound: <><path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16" /></>,
    mute: <><path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6" /></>,
    motion: <><path d="m13 2-9 12h7l-1 8 10-13h-7z" /></>,
    github: <><path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .2-2-1-3 4-.5 6-2 6-6 0-1-.3-2-1-3 .3-1 .3-3 0-4-2 0-3 1-4 2a15 15 0 0 0-6 0C8 3 7 2 5 2c-.3 1-.3 3 0 4-.7 1-1 2-1 3 0 4 2 5.5 6 6-1 1-1 2-1 3v4" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    copy: <><rect x="8" y="8" width="12" height="13" rx="1" /><path d="M15 8V3H3v13h5" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}

function CodeMask({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'code-mask small' : 'code-mask'} viewBox="0 0 420 340" aria-hidden="true">
    <path className="mask-shadow" d="m35 85 132 28 43-43 44 43 132-28-44 151-88-35-44 53-44-53-88 35Z" />
    <path className="mask-body" d="m25 70 135 27 50-48 50 48 135-27-50 151-87-34-48 57-48-57-87 34Z" />
    <path className="mask-eye" d="m76 118 87 16-18 41-38-7Zm268 0-87 16 18 41 38-7Z" />
    <path className="mask-cut" d="m177 113 16 11-31 42 29 32-17 16-43-48zm66 0-16 11 31 42-29 32 17 16 43-48z" />
    <path fill="var(--red)" d="m220 119-26 79h14l26-79z" />
  </svg>;
}

function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<Icon name="arrow" /><span className="sr-only"> (abre en otra pestaña)</span></a>;
}

function Modal({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = old; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby="modal-title" onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <div className="modal-top"><span className="eyebrow">EXPEDIENTE DESBLOQUEADO</span><button className="icon-button" onClick={onClose} aria-label="Cerrar ventana" autoFocus><Icon name="close" /></button></div>
    <h2 id="modal-title">{title}</h2>{children}
  </dialog>;
}

function Home() {
  return <div className="home-scene">
    <div className="home-kicker"><span className="tiny-star">✦</span> FRONTEND DEVELOPER & DATA EXPLORER</div>
    <h1 className="hero-title" tabIndex={-1}><span>IGNACIO</span><span>CISTERNAS<span className="title-dot">.</span></span></h1>
    <div className="hero-art"><div className="art-orbit" /><span className="art-star star-one">✦</span><span className="art-star star-two">✦</span><CodeMask /><span className="art-caption">CODE IS MY OTHER SELF.</span><span className="art-serial">IC—01 / ORIGINAL CHARACTER</span></div>
    <div className="hero-description"><span className="paper-label">UNA MENTE CURIOSA. MUCHAS POSIBILIDADES.</span><p>{profile.intro}</p><a className="action-button light" href="#proyectos">Explora mis proyectos <Icon name="arrow" /></a><span className="hero-location"><Icon name="pin" />{profile.location} <span> / </span> Creando conexiones</span></div>
    <div className="calling-stamp" aria-hidden="true"><span>TAKE YOUR</span><strong>TIME.</strong><span>MAKE IT COUNT.</span></div>
  </div>;
}

function PageHeading({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return <header className="page-heading"><span className="eyebrow">{label}</span><h1 tabIndex={-1}>{title}<span>.</span></h1>{children && <p>{children}</p>}</header>;
}

function Profile() {
  return <div className="page-inner"><PageHeading label="01 / DETRÁS DEL CÓDIGO" title="Mucho más que código">Soy Ignacio. Me gusta entender cómo funcionan las cosas y encontrar una mejor forma de construirlas.</PageHeading>
    <div className="profile-grid"><div className="identity-card"><span className="eyebrow">FICHA DE PERSONA</span><CodeMask small /><strong>IGNACIO<br />CISTERNAS</strong><span className="identity-alias">ALIAS: NACHODEV</span><span className="identity-location">SANTIAGO, CHILE</span></div>
      <div className="profile-copy"><h2>Entre interfaces,<br />datos y videojuegos.</h2><p>Mi formación es en Ingeniería en Informática en Duoc UC. Me enfoco en desarrollo frontend con React y TypeScript, y también disfruto construir aplicaciones móviles y servicios que conectan datos.</p><p>Mi experiencia en consultoría BI me enseñó a mirar más allá de una pantalla: entender el problema, ordenar la información y hacer que el resultado sea útil para quien lo usa.</p><p>Los videojuegos son parte de mi inspiración. Mis proyectos de Albion nacieron de una pregunta concreta: ¿cómo puedo tomar mejores decisiones con los datos que tengo?</p><div className="profile-values"><span>Curiosidad</span><span>Criterio</span><span>Creatividad</span></div></div>
    </div><div className="quote-strip"><span>“</span><p>La tecnología tiene más sentido cuando resuelve algo real.</p><span>✦</span></div>
  </div>;
}

function ProjectArt({ id }: { id: string }) {
  return <div className={`project-art project-art-${id}`} aria-hidden="true">
    <span className="project-art-caption">{id === 'calculator' ? 'CRAFT. CALCULATE. CONQUER.' : id === 'api' ? 'CONNECT THE DOTS.' : 'FROM CHAOS TO CLARITY.'}</span>
    {id === 'calculator' ? <><span className="art-cross">×</span><div className="calculator-display"><span>RETURN ON IDEAS</span><strong>∞<small>%</small></strong><div className="mini-bars">{[30, 54, 42, 68, 56, 87, 100].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></div></> : id === 'api' ? <><span className="api-bracket">&#123;</span><span className="api-word">API<small>REQUEST → RESPONSE</small></span><span className="api-bracket">&#125;</span></> : <div className="pipeline-art"><span>RAW</span><b>↘</b><span>REFINE</span><b>↗</b><span>READY</span></div>}
    <span className="art-decoration">✦</span>
  </div>;
}

function Projects({ onSelect }: { onSelect: (project: Project) => void }) {
  const [category, setCategory] = useState<Category>('Todos');
  const visible = projects.filter(project => category === 'Todos' || project.category === category);
  return <div className="page-inner"><PageHeading label="02 / MISIONES EN EL MUNDO REAL" title="Ideas en acción">Un ecosistema de proyectos que conecta interfaces, servicios y datos.</PageHeading>
    <div className="filter-bar" role="group" aria-label="Filtrar proyectos por área">{(['Todos', 'Frontend', 'Backend', 'Datos'] as Category[]).map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}{item === 'Todos' && <small>03</small>}</button>)}<span className="results-count" role="status">{visible.length} {visible.length === 1 ? 'proyecto' : 'proyectos'}</span></div>
    <div className="project-grid">{visible.map(project => <article className="project-card" key={project.id}><button className="project-open" onClick={() => onSelect(project)} aria-label={`Ver proyecto ${project.name}`}><ProjectArt id={project.id} /><div className="project-card-content"><div className="project-meta"><span>CASE {project.number}</span><span>{project.category}</span></div><h2>{project.name}</h2><p>{project.description}</p><div className="tag-list">{project.stack.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div><span className="project-bottom">Abrir expediente <Icon name="arrow" /></span></div></button></article>)}</div>
    <p className="page-footnote">Un producto, tres piezas que trabajan juntas. <ExternalLink href={profile.github}>Más código en GitHub</ExternalLink></p>
  </div>;
}

function Skills() {
  return <div className="page-inner"><PageHeading label="03 / EQUIPAMIENTO" title="Mi arsenal creativo">Herramientas que uso para pasar de una idea a una solución.</PageHeading><div className="skill-grid">{skillGroups.map((group, index) => <article className="skill-card" key={group.name}><div className="skill-card-top"><span>{group.category}</span><span>0{index + 1}</span></div><div className="skill-title"><span>{group.symbol}</span><h2>{group.name}</h2></div><p>{group.description}</p><div className="tag-list">{group.items.map(item => <span key={item}>{item}</span>)}</div></article>)}</div><div className="toolbelt"><span className="eyebrow">SIEMPRE EN EL INVENTARIO</span><p>Git & GitHub <span>✦</span> APIs REST <span>✦</span> Diseño adaptable <span>✦</span> Aprendizaje continuo</p></div></div>;
}

function Journey() {
  return <div className="page-inner"><PageHeading label="04 / PUNTOS DE GUARDADO" title="Cada paso cuenta">Una trayectoria que conecta desarrollo de software y análisis de datos.</PageHeading>
    <div className="timeline"><article><span className="timeline-year">2026</span><div><span className="eyebrow">PROYECTOS PERSONALES</span><h2>Construyendo un ecosistema</h2><p>Desarrollo de Albion Calculator y sus servicios de mercado: desde la experiencia de usuario hasta la captura, normalización y consulta de datos.</p><a className="inline-link" href="#proyectos">Explorar proyectos <Icon name="arrow" /></a></div></article>
      <article><span className="timeline-year">2025</span><div><span className="eyebrow">KR CONSULTING · PRÁCTICA PROFESIONAL</span><h2>Consultoría BI & análisis de datos</h2><p>Trabajo con Snowflake, Azure Data Factory, Power BI, Streamlit y Python. Integración de datos mediante APIs, visualización de información y herramientas internas para apoyar procesos operativos.</p><div className="tag-list"><span>Integración de datos</span><span>Dashboards</span><span>Automatización</span></div></div></article>
      <article><span className="timeline-year">2021</span><div><span className="eyebrow">DUOC UC · FORMACIÓN</span><h2>Ingeniería en Informática</h2><p>El comienzo de mi formación en desarrollo, bases de datos y construcción de soluciones de software.</p></div></article></div>
    <div className="learning-note"><span>✦</span><p><strong>El aprendizaje sigue.</strong><br />Snowflake · AWS Academy Cloud Foundations · Inglés B2</p></div>
  </div>;
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copyContact() {
    try { await navigator.clipboard.writeText(profile.email || profile.github); setCopied(true); setCopyError(false); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2800); }
    catch { setCopyError(true); }
  }
  return <div className="page-inner contact-page"><PageHeading label="05 / UNA NUEVA ALIANZA" title="¿Creamos algo juntos?">Una buena conversación puede ser el comienzo de un gran proyecto.</PageHeading><div className="contact-letter"><span className="letter-star">✦</span><span className="eyebrow">CARTA DE PRESENTACIÓN</span><h2>Tu próxima idea.<br /><em>Nuestro próximo desafío.</em></h2><p>Me interesan las interfaces con intención, las aplicaciones útiles y los problemas que invitan a aprender. Si compartimos esa curiosidad, conectemos.</p><div className="contact-actions">{profile.email ? <a className="action-button" href={`mailto:${profile.email}`}>Escríbeme <Icon name="arrow" /></a> : <ExternalLink className="action-button" href={profile.github}>Conectemos en GitHub</ExternalLink>}<button className="copy-button" onClick={copyContact}><Icon name="copy" />{copied ? '¡Copiado!' : 'Copiar contacto'}</button></div><p className="copy-feedback" role="status">{copyError ? `Puedes copiar el contacto manualmente: ${profile.email || profile.github}` : copied ? 'Contacto copiado al portapapeles.' : ''}</p><div className="letter-signature"><span>Ignacio Cisternas</span><span>{profile.location}</span></div></div><ExternalLink className="contact-handle" href={profile.github}><Icon name="github" /> @{profile.username}</ExternalLink></div>;
}

function getSection(): SectionId {
  const id = window.location.hash.slice(1);
  return sections.some(section => section.id === id) ? id as SectionId : 'inicio';
}
function savedBoolean(key: string, fallback: boolean) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : value === 'true'; } catch { return fallback; }
}

export default function App() {
  const [section, setSection] = useState<SectionId>(getSection);
  const [sound, setSound] = useState(() => savedBoolean('portfolio-sound', false));
  const [reduced, setReduced] = useState(() => savedBoolean('portfolio-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  const [project, setProject] = useState<Project | null>(null);
  const [help, setHelp] = useState(false);
  const [welcome, setWelcome] = useState(shouldWelcome);
  const audio = useRef<AudioContext | null>(null);
  const menu = useRef<HTMLElement>(null);
  const content = useRef<HTMLElement>(null);
  const enterContent = useRef(false);
  const keyboardSound = useRef(() => {});
  const current = sections.find(item => item.id === section)!;

  function playSound(force = false) {
    if (!sound && !force) return;
    try {
      audio.current ??= new AudioContext();
      const context = audio.current;
      void context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.07);
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.1);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Sound is optional: navigation remains available without Web Audio. */ }
  }
  useEffect(() => { keyboardSound.current = () => playSound(); });
  function focusContent(controlsFirst = false) {
    const root = content.current;
    if (!root) return;
    const target = (controlsFirst ? focusableElements(root)[0] : null) ?? root.querySelector<HTMLElement>('h1') ?? root;
    target.focus({ preventScroll: true });
    if (controlsFirst) target.scrollIntoView({ block: 'nearest' });
  }
  function finishWelcome(immersive: boolean) {
    try { sessionStorage.setItem(welcomeSessionKey, 'true'); } catch { /* Entry works even when storage is unavailable. */ }
    setWelcome(false);
    setSound(immersive);
    requestAnimationFrame(() => {
      if (immersive) menu.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
      else focusContent();
    });
  }
  useEffect(() => {
    try { localStorage.setItem('portfolio-sound', String(sound)); localStorage.setItem('portfolio-reduced-motion', String(reduced)); } catch { /* Private browsing may disable storage. */ }
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [sound, reduced]);
  useEffect(() => () => { if (audio.current) void audio.current.close().catch(() => {}); }, []);
  useEffect(() => {
    function onHashChange() {
      setSection(getSection()); setProject(null); setHelp(false);
      requestAnimationFrame(() => { content.current?.scrollTo(0, 0); window.scrollTo(0, 0); focusContent(enterContent.current); enterContent.current = false; });
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => { document.title = `${section === 'inicio' ? 'Portfolio' : current.label} — Ignacio Cisternas`; }, [section, current.label]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (welcome || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      const target = event.target as HTMLElement;
      if (isEditing(target)) return;
      const action = navigationAction(event.key);
      const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
      if (dialog) {
        // Keep game controls within the active dialog; Escape remains native.
        if (!action) return;
        event.preventDefault();
        if (action === 'back') { if (!event.repeat) { setProject(null); setHelp(false); } }
        else if (action === 'open') { if (!event.repeat) target.closest<HTMLElement>('button, a[href]')?.click(); }
        else moveFocus(focusableElements(dialog), action === 'previous' ? -1 : 1);
        return;
      }
      if (event.key === 'Escape' && section !== 'inicio') { window.location.hash = 'inicio'; return; }
      if (event.key === '?') { event.preventDefault(); setHelp(true); return; }
      const menuLinks = Array.from(menu.current!.querySelectorAll<HTMLAnchorElement>('a'));
      const selectedIndex = sections.findIndex(item => item.id === section);
      if (action === 'back') {
        event.preventDefault();
        menuLinks[selectedIndex].focus();
        return;
      }
      if (action === 'previous' || action === 'next') {
        event.preventDefault();
        const controls = content.current ? focusableElements(content.current) : [];
        // After a mouse click or heading focus, arrows can still reach the menu.
        const inContentControls = controls.includes(target);
        moveFocus(inContentControls ? controls : menuLinks, action === 'previous' ? -1 : 1, selectedIndex);
        keyboardSound.current();
        return;
      }
      if (action === 'open' || (event.key === 'Enter' && menu.current?.contains(target))) {
        event.preventDefault();
        if (event.repeat) return;
        const control = target.closest<HTMLElement>('button, a[href]');
        if (control && !menu.current?.contains(control)) { control.click(); return; }
        const link = (menu.current?.contains(target) ? target.closest('a') : null) ?? menuLinks[selectedIndex];
        if (link.hash === `#${section}`) { focusContent(true); return; }
        enterContent.current = true;
        link.click();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, welcome]);

  return <div className={`app-shell view-${section}`}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); content.current?.focus(); }}>Saltar al contenido</a>
    <header className="topbar"><a className="brand" href="#inicio" aria-label="Ignacio Cisternas, inicio"><span className="brand-symbol">ic<span>✦</span></span><span>IGNACIO CISTERNAS<small>PERSONAL PORTFOLIO</small></span></a><div className="topbar-center"><span className="status-dot" /> DESARROLLO CON PERSONALIDAD</div><div className="settings"><button className="setting-button" aria-label={sound ? 'Desactivar sonido' : 'Activar sonido'} aria-pressed={sound} onClick={() => { if (!sound) playSound(true); setSound(value => !value); }}><Icon name={sound ? 'sound' : 'mute'} /><span>SFX <b>{sound ? 'ON' : 'OFF'}</b></span></button><button className="setting-button motion-button" aria-label="Reducir animaciones" aria-pressed={reduced} onClick={() => setReduced(value => !value)}><Icon name="motion" /><span>{reduced ? 'CALMA' : 'ANIMACIÓN'}</span></button><button className="help-button" aria-label="Ayuda de navegación" onClick={() => setHelp(true)}>?</button></div></header>
    <div className="main-layout"><aside className="sidebar"><div className="chapter-label"><span className="chapter-number">0{sections.findIndex(item => item.id === section) + 1}</span><div>ELIGE TU SIGUIENTE<small>MOVIMIENTO.</small></div></div><nav ref={menu} className="main-menu" aria-label="Navegación principal">{sections.map((item, index) => <a key={item.id} href={`#${item.id}`} className={section === item.id ? 'selected' : ''} aria-current={section === item.id ? 'page' : undefined} onClick={() => playSound()}><span className="menu-number">0{index + 1}</span><span className="menu-label">{item.label}</span><span className="menu-arrow" aria-hidden="true">↗</span></a>)}</nav><div className="menu-caption"><span>✦</span><p>{current.note}</p></div><a className="sidebar-github" href={profile.github} target="_blank" rel="noopener noreferrer"><Icon name="github" /> GITHUB <Icon name="arrow" /><span className="sr-only"> (abre en otra pestaña)</span></a><span className="sidebar-vertical" aria-hidden="true">NOT YOUR AVERAGE PORTFOLIO.</span></aside>
    <main id="main-content" ref={content} tabIndex={-1} className="main-content"><div className="page-transition" key={section}>{section === 'inicio' ? <Home /> : section === 'perfil' ? <Profile /> : section === 'proyectos' ? <Projects onSelect={item => { playSound(); setProject(item); }} /> : section === 'habilidades' ? <Skills /> : section === 'trayectoria' ? <Journey /> : <Contact />}</div></main></div>
    <footer className="statusbar"><div><span className="footer-star">✦</span><strong>TAKE YOUR TIME.</strong><span className="footer-subtitle">Hay mucho por descubrir.</span></div><div className="keyboard-hints"><span><kbd>W</kbd><kbd>S</kbd> / ↑↓ Elegir</span><span><kbd>D</kbd> / ↵ Abrir</span><span><kbd>A</kbd> / ← Menú</span></div><span className="footer-edition">IC / PORTFOLIO — VOL. 01</span></footer>
    {project && <Modal title={project.name} onClose={() => setProject(null)}><div className="modal-project-label"><span>CASE {project.number}</span><span>{project.category}</span></div><p className="modal-intro">{project.subtitle}</p><div className="case-columns"><section><h3>El desafío</h3><p>{project.challenge}</p></section><section><h3>La solución</h3><p>{project.solution}</p></section></div><h3>Dentro del proyecto</h3><ul className="feature-list">{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul><div className="tag-list">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div><div className="modal-actions">{project.demo && <ExternalLink className="action-button" href={project.demo}>{project.demoLabel}</ExternalLink>}<ExternalLink className="source-link" href={project.repository}>Ver código</ExternalLink></div></Modal>}
    {help && <Modal title="Toma el control." className="help-modal" onClose={() => setHelp(false)}><p>Alterna entre teclado, ratón y touch cuando quieras.</p><dl className="help-list"><div><dt>W/S · ↑/↓</dt><dd>Elegir una sección. Dentro del contenido, recorrer sus botones y enlaces.</dd></div><div><dt>D · → · ↵</dt><dd>Abrir la opción enfocada o entrar en el contenido de una sección.</dd></div><div><dt>A · ←</dt><dd>Volver al menú; dentro de un expediente, cerrarlo.</dd></div><div><dt>Tab</dt><dd>Recorrer todos los enlaces y controles.</dd></div><div><dt>Escape</dt><dd>Cerrar un expediente o volver al inicio.</dd></div><div><dt>?</dt><dd>Abrir esta guía.</dd></div></dl><p>Los atajos no interfieren cuando estás escribiendo. Usa la rueda, Page Up o Page Down para leer; SFX y el control de animación ajustan la experiencia.</p><button className="replay-welcome" onClick={() => { setHelp(false); setWelcome(true); }}>Volver a ver la bienvenida <Icon name="arrow" /></button><p className="credits">Inspirado en Persona 5 Royal y en <ExternalLink href="https://github.com/ffaneto/persona5-website-theme">el proyecto de ffaneto</ExternalLink>. Diseño y código propios; sin afiliación con ATLUS o SEGA.</p></Modal>}
    {welcome && <Welcome emblem={<CodeMask />} onEnter={finishWelcome} onActivateSound={() => playSound(true)} />}
  </div>;
}
