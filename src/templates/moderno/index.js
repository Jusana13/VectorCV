import { renderStars, escapeHTML, silhouetteSVG, CONTACT_ICONS, INTEREST_ICONS } from '../helpers.js';

export function render(data) {
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
      const buttonHTML = exp.button?.url ? `
        <a href="${escapeHTML(exp.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(exp.button.text || 'Ver Proyecto')}
        </a>` : '';
      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(exp.title)}</span>
            <span class="item-date">${escapeHTML(exp.period)}</span>
          </div>
          <div class="item-subtitle">${escapeHTML(exp.company)}</div>
          ${bulletsHTML}
          ${buttonHTML}
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
            <h2>${escapeHTML(data.sectionTitles?.profile || 'Perfil Profesional')}</h2>
          </div>
          ${profileHTML}
        </section>

        <!-- EDUCATION -->
        <section class="section">
          <div class="section-title">
            <h2>${escapeHTML(data.sectionTitles?.education || 'Formación Académica')}</h2>
          </div>
          ${educationHTML}
        </section>

        <!-- EXPERIENCE -->
        <section class="section">
          <div class="section-title">
            <h2>${escapeHTML(data.sectionTitles?.experience || 'Experiencia Laboral')}</h2>
          </div>
          ${experienceHTML}
        </section>
      </main>

      <aside class="sidebar">
        <!-- CONTACT -->
        <section class="section">
          <div class="section-title">
            <h2>${escapeHTML(data.sectionTitles?.contact || 'Contacto')}</h2>
          </div>
          <div class="contact-grid">
            ${contactHTML}
          </div>
        </section>

        <!-- SKILLS -->
        <section class="section">
          <div class="section-title">
            <h2>${escapeHTML(data.sectionTitles?.skills || 'Habilidades')}</h2>
          </div>
          <div class="sidebar-list">
            ${skillsHTML}
          </div>
        </section>

        <!-- LANGUAGES -->
        <section class="section">
          <div class="section-title">
            <h2>${escapeHTML(data.sectionTitles?.languages || 'Idiomas')}</h2>
          </div>
          <div class="lang-grid">
            ${languagesHTML}
          </div>
        </section>

        <!-- INTERESTS -->
        <section class="section">
          <div class="section-title">
            <h2>${escapeHTML(data.sectionTitles?.interests || 'Intereses')}</h2>
          </div>
          <div class="hobby-icons">
            ${interestsHTML}
          </div>
        </section>
      </aside>
    </article>
  `;
}
