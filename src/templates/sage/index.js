import { renderStars, escapeHTML, silhouetteSVG, CONTACT_ICONS, INTEREST_ICONS } from '../helpers.js';

export function render(data) {
  const colors = data.colors?.sage || { primary: '#b5d3cd', accent: '#22252a' };
  
  // Split name for visual styling
  const nameParts = (data.personal.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');
  const lastName = data.personal.lastName || '';
  
  // Profile Photo (Circular by default, with concentric borders)
  const photoShape = data.personal.photoShape || 'circle';
  const photoHTML = data.personal.photo
    ? `<img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}">`
    : silhouetteSVG;

  // Split contact items: first two go on the left, the rest on the right
  const contactItems = data.contact || [];
  const midPoint = 2;
  const leftContacts = contactItems.slice(0, midPoint);
  const rightContacts = contactItems.slice(midPoint);

  const leftContactHTML = leftContacts
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      return `
        <div class="contact-item left">
          <span class="contact-text">${c.href ? `<a href="${escapeHTML(c.href)}" target="_blank">${text}</a>` : text}</span>
          <div class="icon-circle">${icon}</div>
          <div class="contact-line"></div>
        </div>`;
    })
    .join('');

  const rightContactHTML = rightContacts
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      return `
        <div class="contact-item right">
          <div class="contact-line"></div>
          <div class="icon-circle">${icon}</div>
          <span class="contact-text">${c.href ? `<a href="${escapeHTML(c.href)}" target="_blank">${text}</a>` : text}</span>
        </div>`;
    })
    .join('');

  // Column 1: Education
  const educationHTML = (data.education || [])
    .map(edu => {
      const buttonHTML = edu.button?.url ? `
        <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(edu.button.text || 'Ver Certificado')}
        </a>` : '';
      return `
        <div class="ed-block item">
          <h3 class="ed-title item-title">${escapeHTML(edu.title).toUpperCase()}</h3>
          <p class="ed-detail item-subtitle">${escapeHTML(edu.institution)}</p>
          <p class="ed-detail item-date">${escapeHTML(edu.period)}</p>
          <p class="ed-detail item-desc">${escapeHTML(edu.description)}</p>
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Column 2: Expertise (Personality) & Interests
  const personalityHTML = (data.personality || [])
    .map(p => `<li>${escapeHTML(p.name).toUpperCase()}</li>`)
    .join('');

  const personalitySection = personalityHTML ? `
    <ul class="expertise-list">
      ${personalityHTML}
    </ul>` : '';

  const interestsHTML = (data.interests || []).length > 0 ? `
    <div class="interests-section">
      <div class="mini-header">
        <span class="mini-line"></span>
        <span class="mini-title">${escapeHTML(data.sectionTitles?.interests || 'Intereses')}</span>
        <span class="mini-line"></span>
      </div>
      <div class="interests-grid">
        ${(data.interests || []).map(key => {
          const item = INTEREST_ICONS[key];
          if (!item) return '';
          return `
            <div class="interest-icon-box" title="${escapeHTML(item.name)}">
              ${item.svg}
            </div>`;
        }).join('')}
      </div>
    </div>` : '';

  const col2HTML = `
    ${personalitySection}
    ${interestsHTML}
  `;

  // Column 3: Skills & Languages
  const skillsHTML = (data.skills || [])
    .map(s => {
      const percent = s.percentage !== undefined ? s.percentage : (s.level ? s.level * 20 : 60);
      return `
        <div class="skill-block">
          <span class="skill-name">${escapeHTML(s.name).toUpperCase()}</span>
          <div class="progress-bg">
            <div class="progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>`;
    })
    .join('');

  const languagesHTML = (data.languages || []).length > 0 ? `
    <div class="languages-section" style="margin-top: 25px;">
      <h4 class="ed-title" style="margin-bottom: 12px; font-size: 11px;">${escapeHTML(data.sectionTitles?.languages || 'Idiomas').toUpperCase()}</h4>
      ${(data.languages || []).map(lang => `
        <div class="skill-block">
          <span class="skill-name">${escapeHTML(lang.name).toUpperCase()} (${escapeHTML(lang.level)})</span>
          <div class="progress-bg">
            <div class="progress-fill" style="width: ${lang.percentage || 50}%;"></div>
          </div>
        </div>`).join('')}
    </div>` : '';

  const col3HTML = `
    ${skillsHTML}
    ${languagesHTML}
  `;

  // Bottom Section: Work Experience
  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="exp-list item-desc">
          ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="exp-desc item-desc">${escapeHTML(exp.description || '')}</p>`;
        
      const locationHTML = exp.location ? `
        <span class="exp-separator">•</span>
        <span class="exp-location">${escapeHTML(exp.location)}</span>` : '';
        
      const buttonHTML = exp.button?.url ? `
        <a href="${escapeHTML(exp.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(exp.button.text || 'Ver Proyecto')}
        </a>` : '';

      return `
        <div class="exp-item item">
          <div class="exp-header-row">
            <div class="exp-header-left">
              <span class="exp-company item-subtitle">${escapeHTML(exp.company)}</span>
              ${locationHTML}
            </div>
            <div class="exp-header-right">
              <span class="exp-date item-date">${escapeHTML(exp.period)}</span>
            </div>
          </div>
          <div class="exp-body">
            <h4 class="exp-job-title item-title">${escapeHTML(exp.title)}</h4>
            ${bulletsHTML}
            ${buttonHTML}
          </div>
        </div>`;
    })
    .join('');

  // Main profile block
  const profileHTML = (data.personal.profile || [])
    .map(p => `<p class="profile-desc profile-text">${escapeHTML(p)}</p>`)
    .join('');

  const edTitle = escapeHTML(data.sectionTitles?.education || 'Educación');
  const expTitle = escapeHTML(data.sectionTitles?.personality || 'Cualidades');
  const skillTitle = escapeHTML(data.sectionTitles?.skills || 'Habilidades');
  const workExpTitle = escapeHTML(data.sectionTitles?.experience || 'Experiencia');

  return `
    <article class="cv-page sage" style="--primary: ${colors.primary}; --accent: ${colors.accent};">
      <div class="header-spacing"></div>

      <header class="top-band">
        <div class="contact-col left">
          ${leftContactHTML}
        </div>

        <div class="profile-pic shape-${photoShape}">
          ${photoHTML}
        </div>

        <div class="contact-col right">
          ${rightContactHTML}
        </div>
      </header>

      <section class="intro-section">
        <div class="name-wrapper">
          <div class="name-line"></div>
          <h1 class="name">
            <span class="name-first">${escapeHTML(firstName)} ${restName ? escapeHTML(restName) : ''}</span>
            <span class="name-last">${escapeHTML(lastName)}</span>
          </h1>
          <div class="name-line"></div>
        </div>
        <h2 class="job-title">${escapeHTML(data.personal.profession)}</h2>
        ${profileHTML}
      </section>

      <!-- 3 Columns Header -->
      <div class="three-pills-container">
        <div class="three-pills-line"></div>
        <div class="three-pills-row">
          <div class="pill-col">
            <div class="pill-title">${edTitle}</div>
          </div>
          <div class="pill-col">
            <div class="pill-title">${expTitle}</div>
          </div>
          <div class="pill-col">
            <div class="pill-title">${skillTitle}</div>
          </div>
        </div>
      </div>

      <!-- 3 Columns Content -->
      <section class="three-columns">
        <div class="col">
          ${educationHTML}
        </div>
        <div class="col bordered">
          ${col2HTML}
        </div>
        <div class="col bordered">
          ${col3HTML}
        </div>
      </section>

      <!-- Work Experience Section -->
      <section class="experience-section">
        <div class="pill-wrapper">
          <div class="pill-line"></div>
          <div class="pill-title">${workExpTitle}</div>
          <div class="pill-line"></div>
        </div>
        <div class="exp-container">
          ${experienceHTML}
        </div>
      </section>
    </article>
  `;
}
