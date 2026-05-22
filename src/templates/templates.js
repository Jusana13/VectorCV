/* Creador de CV Dinámico - Diseñado y desarrollado por jusana */
import { CONTACT_ICONS, INTEREST_ICONS } from '../js/icon-library.js';

// Helper to escape HTML characters and prevent XSS or broken layouts
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const silhouetteSVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; background:#ffffff; display:block;"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#94a3b8"/></svg>`;

// Render rating stars for skills
function renderStars(level) {
  const max = 5;
  const filled = '★'.repeat(level);
  const empty = '☆'.repeat(max - level);
  return `<span class="stars">${filled}${empty}</span>`;
}

// -------------------------------------------------------------
// TEMPLATE 1: MODERNO (Charcoal & Old Gold Grid Layout)
// -------------------------------------------------------------
function renderModerno(data) {
  const colors = data.colors?.moderno || { primary: '#2C2D30', accent: '#C9A227', bgLight: '#F3EFE6' };
  
  // Format Name: split first word or show bold/accent color
  const nameParts = (data.personal.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');
  const lastName = data.personal.lastName || '';
  
  let nameHTML = '';
  if (firstName) {
    nameHTML = `${escapeHTML(firstName)} ${restName ? escapeHTML(restName) : ''} <br><span>${escapeHTML(lastName)}</span>`;
  } else {
    nameHTML = `<span>${escapeHTML(lastName)}</span>`;
  }

  // Profile text paragraphs
  const profileHTML = (data.personal.profile || [])
    .map(p => `<div class="profile-text">${escapeHTML(p)}</div>`)
    .join('');

  // Contact list
  const contactHTML = (data.contact || [])
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      if (c.href) {
        return `
          <div class="contact-item">
            <span class="contact-icon">${icon}</span>
            <span class="contact-text"><a href="${escapeHTML(c.href)}" target="_blank">${text}</a></span>
          </div>`;
      }
      return `
        <div class="contact-item">
          <span class="contact-icon">${icon}</span>
          <span class="contact-text">${text}</span>
        </div>`;
    })
    .join('');

  // Education list (with optional cert button)
  const educationHTML = (data.education || [])
    .map(edu => {
      const buttonHTML = edu.button?.url ? `
        <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(edu.button.text || 'Ver Certificado')}
        </a>` : '';
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(edu.title)}</span>
            <span class="item-date">${escapeHTML(edu.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(edu.institution)}</div>
          <p class="item-desc">${escapeHTML(edu.description)}</p>
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Experience list
  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="compact-list item-desc">
          ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="item-desc">${escapeHTML(exp.description || '')}</p>`;
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(exp.title)}</span>
            <span class="item-date">${escapeHTML(exp.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(exp.company)}</div>
          ${bulletsHTML}
        </div>`;
    })
    .join('');

  // Skills
  const skillsHTML = (data.skills || [])
    .map(s => `
      <div class="skill-item">
        <span>${escapeHTML(s.name)}</span>
        ${renderStars(s.level)}
      </div>`)
    .join('');

  // Languages (with SVG circle progress)
  const languagesHTML = (data.languages || [])
    .map(lang => {
      const percent = parseInt(lang.percentage) || 50;
      // SVG Circle stroke-dasharray is 125.6 (based on r=20 for smooth animation)
      const strokeDasharray = 125.6;
      const offset = strokeDasharray - (percent / 100) * strokeDasharray;
      return `
        <div class="lang-circle">
          <svg class="circle-svg">
            <circle class="circle-bg" cx="27.5" cy="27.5" r="20"></circle>
            <circle class="circle-progress" cx="27.5" cy="27.5" r="20" stroke-dasharray="${strokeDasharray}" style="stroke-dashoffset: ${offset};"></circle>
          </svg>
          <span class="lang-name">${escapeHTML(lang.name)} (${escapeHTML(lang.level)})</span>
        </div>`;
    })
    .join('');

  // Interests/Hobbies
  const interestsHTML = (data.interests || [])
    .map(key => {
      const item = INTEREST_ICONS[key];
      if (!item) return '';
      return `
        <div class="hobby-icon" title="${escapeHTML(item.name)}">
          ${item.svg}
        </div>`;
    })
    .join('');

  const photoHTML = data.personal.photo
    ? `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}"><img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}"></div>`
    : `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}">${silhouetteSVG}</div>`;

  return `
    <article class="cv-page moderno" style="--primary: ${colors.primary}; --accent: ${colors.accent}; --bg-light: ${colors.bgLight};">
      <header class="header">
        <div class="header-content">
          <h1>${nameHTML}</h1>
          <p class="profession">${escapeHTML(data.personal.profession)}</p>
        </div>
        ${photoHTML}
      </header>

      <main class="main-content">
        <!-- PROFILE -->
        <section class="section">
          <div class="section-title">
            <h2>Perfil Profesional</h2>
          </div>
          ${profileHTML}
        </section>

        <!-- EDUCATION -->
        <section class="section">
          <div class="section-title">
            <h2>Formación Académica</h2>
          </div>
          ${educationHTML}
        </section>

        <!-- EXPERIENCE -->
        <section class="section">
          <div class="section-title">
            <h2>Experiencia Laboral</h2>
          </div>
          ${experienceHTML}
        </section>
      </main>

      <aside class="sidebar">
        <!-- CONTACT -->
        <section class="section">
          <div class="section-title">
            <h2>Contacto</h2>
          </div>
          <div class="contact-grid">
            ${contactHTML}
          </div>
        </section>

        <!-- SKILLS -->
        <section class="section">
          <div class="section-title">
            <h2>Habilidades</h2>
          </div>
          <div class="sidebar-list">
            ${skillsHTML}
          </div>
        </section>

        <!-- LANGUAGES -->
        <section class="section">
          <div class="section-title">
            <h2>Idiomas</h2>
          </div>
          <div class="lang-grid">
            ${languagesHTML}
          </div>
        </section>

        <!-- INTERESTS -->
        <section class="section">
          <div class="section-title">
            <h2>Intereses</h2>
          </div>
          <div class="hobby-icons">
            ${interestsHTML}
          </div>
        </section>
      </aside>
    </article>
  `;
}

// -------------------------------------------------------------
// TEMPLATE 2: PROFESIONAL (Navy/Gold Grid Layout with Left Stripe)
// -------------------------------------------------------------
function renderProfesional(data) {
  const colors = data.colors?.profesional || { primary: '#1b2a4a', accent: '#e8a838', sidebarBg: '#f4f6f8' };
  
  const nameParts = (data.personal.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');
  const lastName = data.personal.lastName || '';
  
  const nameHTML = `<h1>${escapeHTML(firstName)} ${restName ? escapeHTML(restName) : ''} <span>${escapeHTML(lastName)}</span></h1>`;

  const profileHTML = (data.personal.profile || [])
    .map(p => `<div class="profile-text">${escapeHTML(p)}</div>`)
    .join('');

  const contactHTML = (data.contact || [])
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      if (c.href) {
        return `
          <div class="contact-item">
            <span class="contact-icon">${icon}</span>
            <span class="contact-text"><a href="${escapeHTML(c.href)}" target="_blank">${text}</a></span>
          </div>`;
      }
      return `
        <div class="contact-item">
          <span class="contact-icon">${icon}</span>
          <span class="contact-text">${text}</span>
        </div>`;
    })
    .join('');

  const educationHTML = (data.education || [])
    .map(edu => {
      const buttonHTML = edu.button?.url ? `
        <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(edu.button.text || 'Ver Certificado')}
        </a>` : '';
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(edu.title)}</span>
            <span class="item-date">${escapeHTML(edu.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(edu.institution)}</div>
          <p class="item-desc">${escapeHTML(edu.description)}</p>
          ${buttonHTML}
        </div>`;
    })
    .join('');

  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="compact-list item-desc">
          ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="item-desc">${escapeHTML(exp.description || '')}</p>`;
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(exp.title)}</span>
            <span class="item-date">${escapeHTML(exp.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(exp.company)}</div>
          ${bulletsHTML}
        </div>`;
    })
    .join('');

  const skillsHTML = (data.skills || [])
    .map(s => `
      <div class="skill-item">
        <span>${escapeHTML(s.name)}</span>
        ${renderStars(s.level)}
      </div>`)
    .join('');

  const languagesHTML = (data.languages || [])
    .map(lang => {
      const percent = parseInt(lang.percentage) || 50;
      const strokeDasharray = 125.6;
      const offset = strokeDasharray - (percent / 100) * strokeDasharray;
      return `
        <div class="lang-circle">
          <svg class="circle-svg">
            <circle class="circle-bg" cx="24" cy="24" r="20"></circle>
            <circle class="circle-progress" cx="24" cy="24" r="20" stroke-dasharray="${strokeDasharray}" style="stroke-dashoffset: ${offset};"></circle>
          </svg>
          <span class="lang-name">${escapeHTML(lang.name)}<br>(${escapeHTML(lang.level)})</span>
        </div>`;
    })
    .join('');

  const interestsHTML = (data.interests || [])
    .map(key => {
      const item = INTEREST_ICONS[key];
      if (!item) return '';
      return `
        <div class="hobby-icon" title="${escapeHTML(item.name)}">
          ${item.svg}
        </div>`;
    })
    .join('');

  const photoHTML = data.personal.photo
    ? `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}"><img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}"></div>`
    : `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}">${silhouetteSVG}</div>`;

  return `
    <article class="cv-page profesional" style="--navy: ${colors.primary}; --gold: ${colors.accent}; --side: ${colors.sidebarBg};">
      <header class="header">
        <div class="header-name">
          ${nameHTML}
          <p class="profession">${escapeHTML(data.personal.profession)}</p>
        </div>
        ${photoHTML}
      </header>

      <div class="main-layout">
        <main class="main-content">
          <!-- PROFILE -->
          <section class="section">
            <div class="section-title">
              <h2>Perfil Profesional</h2>
            </div>
            ${profileHTML}
          </section>

          <!-- EDUCATION -->
          <section class="section">
            <div class="section-title">
              <h2>Formación Académica</h2>
            </div>
            ${educationHTML}
          </section>

          <!-- EXPERIENCE -->
          <section class="section">
            <div class="section-title">
              <h2>Experiencia Laboral</h2>
            </div>
            ${experienceHTML}
          </section>
        </main>

        <aside class="sidebar">
          <!-- CONTACT -->
          <section class="section">
            <div class="section-title">
              <h2>Contacto</h2>
            </div>
            <div class="contact-grid">
              ${contactHTML}
            </div>
          </section>

          <!-- SKILLS -->
          <section class="section">
            <div class="section-title">
              <h2>Habilidades</h2>
            </div>
            <div class="sidebar-list">
              ${skillsHTML}
            </div>
          </section>

          <!-- LANGUAGES -->
          <section class="section">
            <div class="section-title">
              <h2>Idiomas</h2>
            </div>
            <div class="lang-grid">
              ${languagesHTML}
            </div>
          </section>

          <!-- INTERESTS -->
          <section class="section">
            <div class="section-title">
              <h2>Intereses</h2>
            </div>
            <div class="hobby-icons">
              ${interestsHTML}
            </div>
          </section>
        </aside>
      </div>
    </article>
  `;
}

// -------------------------------------------------------------
// TEMPLATE 3: MINIMALISTA (B&W High-Contrast Layout)
// -------------------------------------------------------------
function renderMinimalista(data) {
  const colors = data.colors?.minimalista || { primary: '#111111', accent: '#666666' };
  
  const nameHTML = `<h1>${escapeHTML(data.personal.name || '')} <span>${escapeHTML(data.personal.lastName || '')}</span></h1>`;

  const profileHTML = (data.personal.profile || [])
    .map(p => `<p class="profile-text">${escapeHTML(p)}</p>`)
    .join('');

  const contactHTML = (data.contact || [])
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      if (c.href) {
        return `
          <div class="contact-item">
            <span class="contact-icon">${icon}</span>
            <span class="contact-text"><a href="${escapeHTML(c.href)}" target="_blank">${text}</a></span>
          </div>`;
      }
      return `
        <div class="contact-item">
          <span class="contact-icon">${icon}</span>
          <span class="contact-text">${text}</span>
        </div>`;
    })
    .join('');

  const educationHTML = (data.education || [])
    .map(edu => {
      const buttonHTML = edu.button?.url ? `
        <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(edu.button.text || 'Ver Certificado')}
        </a>` : '';
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(edu.title)}</span>
            <span class="item-date">${escapeHTML(edu.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(edu.institution)}</div>
          <p class="item-desc">${escapeHTML(edu.description)}</p>
          ${buttonHTML}
        </div>`;
    })
    .join('');

  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="compact-list item-desc">
          ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="item-desc">${escapeHTML(exp.description || '')}</p>`;
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(exp.title)}</span>
            <span class="item-date">${escapeHTML(exp.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(exp.company)}</div>
          ${bulletsHTML}
        </div>`;
    })
    .join('');

  const skillsHTML = (data.skills || [])
    .map(s => `
      <div class="skill-item">
        <span>${escapeHTML(s.name)}</span>
        ${renderStars(s.level)}
      </div>`)
    .join('');

  const languagesHTML = (data.languages || [])
    .map(lang => `
      <div class="lang-row">
        <span>${escapeHTML(lang.name)}</span>
        <span class="lang-level">${escapeHTML(lang.level)}</span>
      </div>`)
    .join('');

  const interestsHTML = (data.interests || [])
    .map(key => {
      const item = INTEREST_ICONS[key];
      if (!item) return '';
      return `
        <div class="hobby-item">
          ${item.svg}
          <span>${escapeHTML(item.name)}</span>
        </div>`;
    })
    .join('');

  const photoHTML = data.personal.photo
    ? `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}"><img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}"></div>`
    : `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}">${silhouetteSVG}</div>`;

  return `
    <article class="cv-page minimalista" style="--primary: ${colors.primary}; --text-muted: ${colors.accent};">
      <header class="header">
        <div class="header-name">
          ${nameHTML}
          <p class="profession">${escapeHTML(data.personal.profession)}</p>
        </div>
        ${photoHTML}
      </header>

      <div class="content-layout">
        <div class="main-column">
          <!-- PROFILE -->
          <section class="section">
            <div class="section-title">
              <h2>Perfil Profesional</h2>
            </div>
            ${profileHTML}
          </section>

          <!-- EXPERIENCE -->
          <section class="section">
            <div class="section-title">
              <h2>Experiencia Laboral</h2>
            </div>
            ${experienceHTML}
          </section>

          <!-- EDUCATION -->
          <section class="section">
            <div class="section-title">
              <h2>Formación Académica</h2>
            </div>
            ${educationHTML}
          </section>
        </div>

        <div class="side-column">
          <!-- CONTACT -->
          <section class="section">
            <div class="section-title">
              <h2>Contacto</h2>
            </div>
            <div class="contact-list">
              ${contactHTML}
            </div>
          </section>

          <!-- SKILLS -->
          <section class="section">
            <div class="section-title">
              <h2>Habilidades</h2>
            </div>
            <div class="sidebar-list">
              ${skillsHTML}
            </div>
          </section>

          <!-- LANGUAGES -->
          <section class="section">
            <div class="section-title">
              <h2>Idiomas</h2>
            </div>
            <div class="lang-grid">
              ${languagesHTML}
            </div>
          </section>

          <!-- INTERESTS -->
          <section class="section">
            <div class="section-title">
              <h2>Intereses</h2>
            </div>
            <div class="hobby-list">
              ${interestsHTML}
            </div>
          </section>
        </div>
      </div>
    </article>
  `;
}

// -------------------------------------------------------------
// CENTRAL REGISTRY & PUBLIC INTERFACE
// -------------------------------------------------------------
export const TEMPLATES = {
  moderno: {
    name: 'Modelo Moderno (Charcoal)',
    render: renderModerno
  },
  profesional: {
    name: 'Modelo Profesional (Navy/Gold)',
    render: renderProfesional
  },
  minimalista: {
    name: 'Modelo Minimalista (Black & White)',
    render: renderMinimalista
  }
};

export function renderCV(data, templateId) {
  const tmpl = TEMPLATES[templateId] || TEMPLATES.moderno;
  return tmpl.render(data);
}
