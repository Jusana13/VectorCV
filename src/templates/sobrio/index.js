import { escapeHTML, silhouetteSVG, CONTACT_ICONS, INTEREST_ICONS } from '../helpers.js';

export function render(data) {
  const colors = data.colors?.sobrio || { primary: '#EAEAE6', accent: '#222222' };
  
  // Format Name
  const fullname = `${data.personal.name || ''} ${data.personal.lastName || ''}`.trim();
  const nameHTML = fullname ? `<h1 class="fullname">${escapeHTML(fullname)}</h1>` : '';

  // Profession / Job Title
  const professionHTML = data.personal.profession 
    ? `<p class="profession-subtitle">${escapeHTML(data.personal.profession)}</p>` 
    : '';

  // Profile Photo: centered below name & profession if uploaded
  const photoHTML = data.personal.photo
    ? `<div class="photo shape-${data.personal.photoShape || 'circle'}">
         <img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}">
       </div>`
    : '';

  // Contact list row
  const contactItems = data.contact || [];
  const contactHTML = contactItems
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

  // Column 1: Profile Summary & Experience
  const profileHTML = (data.personal.profile || [])
    .map(p => `<p class="profile-text">${escapeHTML(p)}</p>`)
    .join('');

  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="experience-bullets">
          ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="experience-desc">${escapeHTML(exp.description || '')}</p>`;
      return `
        <div class="experience-item">
          <h3 class="item-title">${escapeHTML(exp.title)}</h3>
          <div class="item-company">${escapeHTML(exp.company)}</div>
          <div class="item-period">${escapeHTML(exp.period)}</div>
          <div class="item-body">${bulletsHTML}</div>
        </div>`;
    })
    .join('');

  // Column 2: Education & Skills
  const educationHTML = (data.education || [])
    .map(edu => {
      return `
        <div class="education-item">
          <h3 class="item-title">${escapeHTML(edu.title)}</h3>
          <div class="item-institution">${escapeHTML(edu.institution)}</div>
          <div class="item-period">${escapeHTML(edu.period)}</div>
          <p class="item-desc">${escapeHTML(edu.description)}</p>
        </div>`;
    })
    .join('');

  const skillsHTML = (data.skills || [])
    .map(s => `<li>${escapeHTML(s.name)}</li>`)
    .join('');

  // Bottom Left: Personality & Interests side-by-side
  const personalityHTML = (data.personality || [])
    .map(p => `<li>${escapeHTML(p.name)}</li>`)
    .join('');

  const interestsHTML = (data.interests || [])
    .map(key => {
      const item = INTEREST_ICONS[key];
      if (!item) return '';
      return `<li>${escapeHTML(item.name)}</li>`;
    })
    .join('');

  // Bottom Right: Languages
  const languagesHTML = (data.languages || [])
    .map(lang => `<li>${escapeHTML(lang.name)} ${lang.level ? `(${escapeHTML(lang.level)})` : ''}</li>`)
    .join('');

  return `
    <article class="cv-page sobrio" style="--bg-primary: ${colors.primary}; --accent-color: ${colors.accent};">
      <!-- HEADER -->
      <header class="header">
        <div class="header-name-container">
          <span class="header-line"></span>
          ${nameHTML}
          <span class="header-line"></span>
        </div>
        ${professionHTML}
        
        ${photoHTML}

        <div class="contact-row">
          ${contactHTML}
        </div>
      </header>

      <!-- MIDDLE CONTENT LAYOUT (Two columns) -->
      <div class="middle-layout">
        <!-- Absolute vertical divider line -->
        <div class="vertical-line"></div>
        
        <!-- Left Column: Profile & Experience -->
        <div class="col-left">
          <section class="section profile-section">
            <h2 class="section-title">${escapeHTML(data.sectionTitles?.profile || 'PROFILE SUMMARY')}</h2>
            <div class="profile-content">
              ${profileHTML}
            </div>
          </section>

          <hr class="section-divider">

          <section class="section experience-section">
            <h2 class="section-title">${escapeHTML(data.sectionTitles?.experience || 'EXPERIENCE')}</h2>
            <div class="experience-list">
              ${experienceHTML}
            </div>
          </section>
        </div>

        <!-- Right Column: Education & Skills -->
        <div class="col-right">
          <section class="section education-section">
            <h2 class="section-title">${escapeHTML(data.sectionTitles?.education || 'EDUCATION')}</h2>
            <div class="education-list">
              ${educationHTML}
            </div>
          </section>

          <hr class="section-divider right-col-divider">

          <section class="section skills-section">
            <h2 class="section-title">${escapeHTML(data.sectionTitles?.skills || 'SKILLS')}</h2>
            <ul class="bullets-list">
              ${skillsHTML}
            </ul>
          </section>
        </div>
      </div>

      <!-- BOTTOM LAYOUT (Personality, Interests, Languages) -->
      <div class="bottom-layout">
        <!-- Absolute vertical lines -->
        <div class="vertical-line line-1"></div>
        <div class="vertical-line line-2"></div>
        
        <div class="bottom-col bottom-col-1">
          <h2 class="section-title">${escapeHTML(data.sectionTitles?.personality || 'PERSONALITY')}</h2>
          <ul class="bullets-list">
            ${personalityHTML}
          </ul>
        </div>
        <div class="bottom-col bottom-col-2">
          <h2 class="section-title">${escapeHTML(data.sectionTitles?.interests || 'INTERESTS')}</h2>
          <ul class="bullets-list">
            ${interestsHTML}
          </ul>
        </div>
        <div class="bottom-col bottom-col-3">
          <section class="section languages-section">
            <h2 class="section-title">${escapeHTML(data.sectionTitles?.languages || 'LANGUAGES')}</h2>
            <ul class="bullets-list">
              ${languagesHTML}
            </ul>
          </section>
        </div>
      </div>
    </article>
  `;
}
