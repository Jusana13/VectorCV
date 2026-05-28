import { renderStars, escapeHTML, silhouetteSVG, CONTACT_ICONS, INTEREST_ICONS } from '../helpers.js';

export function render(data) {
  const colors = data.colors?.asimetrico || { primary: '#111316', accent: '#c9a227' };
  
  // Split name for visual styling (thin/bold contrast)
  const nameParts = (data.personal.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');
  const lastName = data.personal.lastName || '';
  
  const nameLightHTML = `<p class="name-light">${escapeHTML((firstName + ' ' + restName).trim().toUpperCase())}</p>`;
  const nameBoldHTML = `<p class="name-bold">${escapeHTML(lastName.toUpperCase())}</p>`;

  // Photo Box
  const photoShape = data.personal.photoShape || 'square';
  const photoHTML = data.personal.photo
    ? `<div class="photo shape-${photoShape}"><img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}"></div>`
    : `<div class="photo shape-${photoShape} placeholder">${silhouetteSVG}</div>`;

  // Contact Info
  const contactHTML = (data.contact || [])
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      if (c.href) {
        return `
          <div class="contact-item">
            <span class="icon">${icon}</span>
            <span><a href="${escapeHTML(c.href)}" target="_blank">${text}</a></span>
          </div>`;
      }
      return `
        <div class="contact-item">
          <span class="icon">${icon}</span>
          <span>${text}</span>
        </div>`;
    })
    .join('');

  // Column Left
  // Profile (About Me)
  const profileHTML = (data.personal.profile || []).length > 0 ? `
    <div class="block">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.profile || 'Perfil Profesional')}</h2>
      ${(data.personal.profile || []).map(p => `<p class="profile-text">${escapeHTML(p)}</p>`).join('')}
    </div>` : '';

  // Education
  const educationHTML = (data.education || []).length > 0 ? `
    <div class="block">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.education || 'Formación Académica')}</h2>
      ${(data.education || []).map(edu => {
        const buttonHTML = edu.button?.url ? `
          <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
            ${escapeHTML(edu.button.text || 'Ver Certificado')}
          </a>` : '';
        return `
          <div class="edu-item">
            <p class="org">${escapeHTML(edu.institution)}</p>
            <p class="sub">${escapeHTML(edu.title)} | ${escapeHTML(edu.period)}</p>
            <p class="item-desc">${escapeHTML(edu.description)}</p>
            ${buttonHTML}
          </div>`;
      }).join('')}
    </div>` : '';

  // Skills
  const skillsHTML = (data.skills || []).length > 0 ? `
    <div class="block">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.skills || 'Habilidades')}</h2>
      <div class="skills-container">
        ${(data.skills || []).map(s => `
          <div class="skill-item">
            <span class="skill-name">${escapeHTML(s.name)}</span>
            ${renderStars(s.level)}
          </div>`).join('')}
      </div>
    </div>` : '';

  // Column Right
  // Experience
  const experienceHTML = (data.experience || []).length > 0 ? `
    <div class="block" style="margin-bottom:0;">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.experience || 'Experiencia Laboral')}</h2>
      ${(data.experience || []).map(exp => {
        const bulletsHTML = (exp.bullets || []).length > 0 ? `
          <ul>
            ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
          </ul>` : `<p class="item-desc">${escapeHTML(exp.description || '')}</p>`;
          
        const buttonHTML = exp.button?.url ? `
          <a href="${escapeHTML(exp.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
            ${escapeHTML(exp.button.text || 'Ver Proyecto')}
          </a>` : '';

        return `
          <article class="exp-item">
            <p class="job">${escapeHTML(exp.title)}</p>
            <p class="company">${escapeHTML(exp.company)} | ${escapeHTML(exp.period)}</p>
            ${bulletsHTML}
            ${buttonHTML}
          </article>`;
      }).join('')}
    </div>` : '';

  // Languages
  const languagesHTML = (data.languages || []).length > 0 ? `
    <div class="block">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.languages || 'Idiomas')}</h2>
      <div class="languages-container">
        ${(data.languages || []).map(lang => `
          <div class="lang-item">
            <div class="lang-header">
              <span class="lang-name"><strong>${escapeHTML(lang.name)}</strong></span>
              <span class="lang-level">${escapeHTML(lang.level)}</span>
            </div>
            <div class="lang-bar-wrap">
              <div class="lang-bar" style="width: ${lang.percentage || 50}%;"></div>
            </div>
          </div>`).join('')}
      </div>
    </div>` : '';

  // Personality
  const personalityHTML = (data.personality || []).length > 0 ? `
    <div class="block">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.personality || 'Personalidad')}</h2>
      <div class="personality-container">
        ${(data.personality || []).map(p => `
          <div class="personality-tag">
            <span>${escapeHTML(p.name)}</span>
          </div>`).join('')}
      </div>
    </div>` : '';

  // Interests
  const interestsHTML = (data.interests || []).length > 0 ? `
    <div class="block">
      <h2 class="section-title">${escapeHTML(data.sectionTitles?.interests || 'Intereses')}</h2>
      <div class="interests-container">
        ${(data.interests || []).map(key => {
          const item = INTEREST_ICONS[key];
          if (!item) return '';
          return `
            <div class="interest-item" title="${escapeHTML(item.name)}">
              <span class="interest-icon">${item.svg}</span>
              <span class="interest-name">${escapeHTML(item.name)}</span>
            </div>`;
        }).join('')}
      </div>
    </div>` : '';

  return `
    <article class="cv-page asimetrico" style="--primary-color: ${colors.primary}; --accent-color: ${colors.accent};">
      <div class="top-band"></div>
      ${photoHTML}

      <section class="header">
        ${nameLightHTML}
        ${nameBoldHTML}
        <p class="role">${escapeHTML(data.personal.profession)}</p>
        <div class="contact">
          ${contactHTML}
        </div>
      </section>

      <section class="left-col">
        ${profileHTML}
        ${educationHTML}
        ${skillsHTML}
      </section>

      <section class="right-col">
        ${experienceHTML}
        ${languagesHTML}
        ${personalityHTML}
        ${interestsHTML}
      </section>
    </article>
  `;
}
