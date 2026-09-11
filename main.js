(() => {
  const config = window.IBARRA_CONFIG || {};
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];

  const menuButton = $('.menu-toggle');
  const nav = $('.nav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded','false');
  }));

  const phoneText = config.phone || '';
  const emailText = config.email || '';
  const hoursText = config.hours || '';
  $('[data-phone-row]')?.toggleAttribute('hidden', !config.phone);
  $('[data-email-row]')?.toggleAttribute('hidden', !config.email);
  $('[data-hours-row]')?.toggleAttribute('hidden', !config.hours);
  $$('[data-phone-text]').forEach(el => el.textContent = phoneText);
  $$('[data-email-text]').forEach(el => el.textContent = emailText);
  $$('[data-hours-text]').forEach(el => el.textContent = hoursText);

  $$('[data-phone-link]').forEach(link => {
    if (config.phone) link.href = `tel:${config.phone.replace(/[^+\d]/g,'')}`;
    else link.href = '#contacto';
  });

  const waLinks = $$('[data-whatsapp-link]');
  const waBaseMessage = 'Hola, me gustaría recibir información sobre los servicios contables y administrativos.';
  waLinks.forEach(waLink => {
    if (config.whatsapp) {
      waLink.href = `https://wa.me/${config.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(waBaseMessage)}`;
      waLink.target = '_blank';
      waLink.rel = 'noopener';
    } else { waLink.href = '#contacto'; }
  });

  $('#contactForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      'Hola, me gustaría solicitar una asesoría.',
      '',
      `Nombre: ${data.get('nombre') || ''}`,
      `Teléfono: ${data.get('telefono') || ''}`,
      `Correo: ${data.get('correo') || ''}`,
      `Empresa: ${data.get('empresa') || ''}`,
      `Servicio: ${data.get('servicio') || ''}`,
      `Mensaje: ${data.get('mensaje') || ''}`
    ].join('\n');

    if (config.whatsapp) {
      window.open(`https://wa.me/${config.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    } else if (config.email) {
      window.location.href = `mailto:${config.email}?subject=${encodeURIComponent('Solicitud de asesoría - Ibarra y Asesores')}&body=${encodeURIComponent(message)}`;
    } else {
      const note = $('#formNote');
      if (note) note.textContent = 'El formulario está listo. Solo falta configurar WhatsApp o correo en js/config.js.';
    }
  });

  const privacy = $('#privacyDialog');
  $('#privacyLink')?.addEventListener('click', e => { e.preventDefault(); privacy?.showModal(); });
  $('#privacyClose')?.addEventListener('click', () => privacy?.close());

  $('#year').textContent = new Date().getFullYear();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => observer.observe(el));

  // Barra de progreso, encabezado compacto y volver al inicio.
  const progress = $('.scroll-progress span');
  const header = $('.site-header');
  const backTop = $('.back-to-top');
  const updateScrollUI = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pct = Math.min(100, Math.max(0, scrollY / max * 100));
    if (progress) progress.style.width = `${pct}%`;
    header?.classList.toggle('is-scrolled', scrollY > 36);
    backTop?.classList.toggle('visible', scrollY > 600);
  };
  addEventListener('scroll', updateScrollUI, { passive:true });
  updateScrollUI();
  backTop?.addEventListener('click', () => scrollTo({ top:0, behavior:'smooth' }));

  // Navegación activa por sección.
  const navLinks = $$('.nav a[href^="#"]:not(.btn)');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const sectionObserver = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio).slice(0,1).forEach(entry => {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin:'-35% 0px -55% 0px', threshold:[0,.2,.5] });
  sections.forEach(s => sectionObserver.observe(s));

  // Contador de experiencia.
  const counter = $('[data-counter]');
  if (counter) {
    const target = Number(counter.dataset.counter || 0);
    let played = false;
    const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || played) return;
      played = true;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { counter.textContent = target; return; }
      const start = performance.now();
      const duration = 1100;
      const tick = now => {
        const t = Math.min(1, (now-start)/duration);
        counter.textContent = Math.round(target * (1-Math.pow(1-t,3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold:.7 });
    counterObserver.observe(counter);
  }

  // Profundidad e iluminación que responde al cursor en tarjetas.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer:fine)').matches) {
    $$('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width;
        const y = (e.clientY-r.top)/r.height;
        card.style.setProperty('--mx', `${x*100}%`);
        card.style.setProperty('--my', `${y*100}%`);
        const rx = (0.5-y)*5;
        const ry = (x-0.5)*6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }
})();
