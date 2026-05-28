import { escapeHTML, silhouetteSVG, CONTACT_ICONS } from '../helpers.js';

function renderDots(level) {
  const max = 5;
  let dots = '';
  for (let i = 1; i <= max; i++) {
    if (i <= level) {
      dots += '<span class="dot filled">●</span>';
    } else {
      dots += '<span class="dot empty">●</span>';
    }
  }
  return `<span class="dots-container">${dots}</span>`;
}

export function render(data) {
  const colors = data.colors?.rosa || { primary: '#d63a3a', accent: '#d63a3a', bgLight: '#f2b7b4' };
  
  // Name formatting: e.g. "Jean LAGACHE"
  const firstName = data.personal.name || '';
  const lastName = (data.personal.lastName || '').toUpperCase();
  
  // Profile summary
  const profileHTML = (data.personal.profile || [])
    .map(p => `<p class="profile-text">${escapeHTML(p)}</p>`)
    .join('');

  // Education list (Estudios)
  const educationHTML = (data.education || [])
    .map(edu => {
      const buttonHTML = edu.button?.url ? `
        <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(edu.button.text || 'Ver Certificado')}
        </a>` : '';
      return `
        <div class="item">
          <div class="item-title">${escapeHTML(edu.institution).toUpperCase()} | ${escapeHTML(edu.title).toUpperCase()} | ${escapeHTML(edu.period)}</div>
          <p class="item-desc">${escapeHTML(edu.description)}</p>
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Experience list (Experiencia Laboral)
  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="compact-list">
          ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="item-desc">${escapeHTML(exp.description || '')}</p>`;
      
      const buttonHTML = exp.button?.url ? `
        <a href="${escapeHTML(exp.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(exp.button.text || 'Ver Proyecto')}
        </a>` : '';

      return `
        <div class="item">
          <div class="item-title">${escapeHTML(exp.company).toUpperCase()} | ${escapeHTML(exp.title).toUpperCase()} | ${escapeHTML(exp.period)}</div>
          ${bulletsHTML}
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Habilidades
  const skillsHTML = (data.skills || [])
    .map(s => `
      <div class="skill-row">
        <span class="skill-name">${escapeHTML(s.name)}</span>
        ${renderDots(s.level)}
      </div>`)
    .join('');

  // Personalidad
  const personalityHTML = (data.personality || [])
    .map(p => `
      <div class="skill-row">
        <span class="skill-name">${escapeHTML(p.name)}</span>
        ${renderDots(p.level)}
      </div>`)
    .join('');

  // Contact list formatted as Dirección, Móvil, Email
  const addressItem = data.contact.find(c => c.type === 'location')?.text || 'Ciudad, País';
  const phoneItem = data.contact.find(c => c.type === 'phone')?.text || '+34 600 000 000';
  const emailItem = data.contact.find(c => c.type === 'email')?.text || 'correo@ejemplo.com';

  // Languages (Idiomas) in right column
  const languagesHTML = (data.languages || [])
    .map(lang => `
      <div class="lang-row">
        <strong>${escapeHTML(lang.name)}:</strong> ${escapeHTML(lang.level)}
      </div>`)
    .join('');

  const additionalInfoText = data.personal.additionalInfo || 'Disponible para incorporación inmediata y flexibilidad horaria en proyectos dinámicos.';

  const photoHTML = data.personal.photo
    ? `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}"><img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}"></div>`
    : `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}">${silhouetteSVG}</div>`;

  return `
    <article class="cv-page rosa" style="--primary: ${colors.primary}; --accent: ${colors.accent}; --rose-bg: ${colors.accent};">
      
      <!-- LEFT COLUMN (Pink background) -->
      <section class="left-column">
        <header class="left-header">
          <h1 class="profession-title">${escapeHTML(data.personal.profession || 'Título del puesto').toUpperCase()}</h1>
          <div class="profile-summary">
            ${profileHTML}
          </div>
        </header>

        <!-- ESTUDIOS -->
        <div class="section">
          <div class="section-title">
            <span class="bullet"></span>
            <h2>${escapeHTML(data.sectionTitles?.education || 'Estudios').toUpperCase()}</h2>
          </div>
          <div class="items-list">
            ${educationHTML}
          </div>
        </div>

        <!-- EXPERIENCIA LABORAL -->
        <div class="section">
          <div class="section-title">
            <span class="bullet"></span>
            <h2>${escapeHTML(data.sectionTitles?.experience || 'Experiencia Laboral').toUpperCase()}</h2>
          </div>
          <div class="items-list">
            ${experienceHTML}
          </div>
        </div>

        <!-- HABILIDADES -->
        <div class="section">
          <div class="section-title">
            <span class="bullet"></span>
            <h2>${escapeHTML(data.sectionTitles?.skills || 'Habilidades').toUpperCase()}</h2>
          </div>
          <div class="skills-list">
            ${skillsHTML}
          </div>
        </div>

        <!-- PERSONALIDAD -->
        <div class="section">
          <div class="section-title">
            <span class="bullet"></span>
            <h2>${escapeHTML(data.sectionTitles?.personality || 'Personalidad').toUpperCase()}</h2>
          </div>
          <div class="skills-list">
            ${personalityHTML}
          </div>
        </div>
      </section>

      <!-- RIGHT COLUMN (White background) -->
      <section class="right-column">
        <!-- Top vertical line that runs behind the photo -->
        <div class="top-red-line"></div>
        
        <!-- Photo Container -->
        <div class="photo-container">
          ${photoHTML}
        </div>
        
        <!-- Name -->
        <h2 class="name-title">${escapeHTML(firstName)} <span class="last-name">${escapeHTML(lastName)}</span></h2>
        
        <!-- Contact details -->
        <div class="contact-details">
          <div class="contact-row">
            <span class="contact-label">Dirección:</span>
            <span class="contact-val">${escapeHTML(addressItem)}</span>
          </div>
          <div class="contact-row">
            <span class="contact-label">Móvil:</span>
            <span class="contact-val">${escapeHTML(phoneItem)}</span>
          </div>
          <div class="contact-row">
            <span class="contact-label">Email:</span>
            <span class="contact-val">${escapeHTML(emailItem)}</span>
          </div>
        </div>

        <!-- Decorative vertical separator -->
        <div class="middle-red-line"></div>

        <!-- IDIOMAS -->
        <div class="right-section">
          <div class="right-section-title">
            <span class="bullet-red"></span>
            <h2>${escapeHTML(data.sectionTitles?.languages || 'Idiomas').toUpperCase()}</h2>
          </div>
          <div class="right-section-content">
            ${languagesHTML}
          </div>
        </div>

        <!-- INFORMACIÓN ADICIONAL -->
        <div class="right-section">
          <div class="right-section-title">
            <span class="bullet-red"></span>
            <h2>${escapeHTML(data.sectionTitles?.interests || 'Información Adicional').toUpperCase()}</h2>
          </div>
          <div class="right-section-content additional-info">
            <p>${escapeHTML(additionalInfoText)}</p>
          </div>
        </div>

        <!-- Bottom decorative vertical line -->
        <div class="bottom-red-line"></div>
      </section>

    </article>
  `;
}
