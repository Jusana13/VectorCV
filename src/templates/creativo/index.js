import { escapeHTML, silhouetteSVG, CONTACT_ICONS } from '../helpers.js';

export function render(data) {
  const colors = data.colors?.creativo || { primary: '#222222', accent: '#f4b844', bgLight: '#fdf8ec' };
  
  // Format Name: "JORDANA JONES" (all caps)
  const fullName = `${data.personal.name || ''} ${data.personal.lastName || ''}`.toUpperCase();
  
  // Sidebar "Habilidades Técnicas" (from data.techSkills array)
  const techSkillsHTML = (data.techSkills || [])
    .map(ts => `
      <div class="bullet-item">
        <span class="list-bullet"></span>
        <span class="bullet-text">${escapeHTML(ts.name)}</span>
      </div>`)
    .join('');

  // Sidebar "Competencias / Skills" (from data.skills)
  const skillsHTML = (data.skills || [])
    .map(s => `
      <div class="bullet-item">
        <span class="list-bullet"></span>
        <span class="bullet-text">${escapeHTML(s.name)}</span>
      </div>`)
    .join('');

  // Languages (Idiomas) in sidebar
  const languagesHTML = (data.languages || [])
    .map(lang => `
      <div class="bullet-item">
        <span class="list-bullet"></span>
        <span class="bullet-text"><strong>${escapeHTML(lang.name)}:</strong> ${escapeHTML(lang.level)}</span>
      </div>`)
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

  // Profile text paragraphs
  const profileHTML = (data.personal.profile || [])
    .map(p => `<p class="profile-text">${escapeHTML(p)}</p>`)
    .join('');

  // Experience list (Work experience)
  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <div class="item-bullets-wrapper">
          <ul class="bullets-list">
            ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
          </ul>
        </div>` : `<p class="item-desc">${escapeHTML(exp.description || '')}</p>`;
        
      const buttonHTML = exp.button?.url ? `
        <a href="${escapeHTML(exp.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(exp.button.text || 'Ver Proyecto')}
        </a>` : '';

      return `
        <div class="item">
          <div class="item-title">${escapeHTML(exp.title)}</div>
          <div class="item-subtitle-row">
            <span class="item-subtitle">${escapeHTML(exp.company)}</span>
            <span class="item-date"><span class="date-bullet"></span>${escapeHTML(exp.period)}</span>
          </div>
          ${bulletsHTML}
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Education list (Academic background)
  const educationHTML = (data.education || [])
    .map(edu => {
      const buttonHTML = edu.button?.url ? `
        <a href="${escapeHTML(edu.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(edu.button.text || 'Ver Certificado')}
        </a>` : '';
        
      return `
        <div class="item">
          <div class="item-title">${escapeHTML(edu.title)}</div>
          <div class="item-subtitle-row">
            <span class="item-subtitle">${escapeHTML(edu.institution)}</span>
            <span class="item-date"><span class="date-bullet"></span>${escapeHTML(edu.period)}</span>
          </div>
          <p class="item-desc">${escapeHTML(edu.description)}</p>
          ${buttonHTML}
        </div>`;
    })
    .join('');

  const photoHTML = data.personal.photo
    ? `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}"><img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(fullName)}"></div>`
    : `<div class="photo-wrap shape-${data.personal.photoShape || 'circle'}">${silhouetteSVG}</div>`;

  return `
    <article class="cv-page creativo" style="--primary: ${colors.primary}; --accent: ${colors.accent}; --bg-light: ${colors.bgLight};">
      <!-- SVG Background Decoration -->
      <div class="creativo-bg">
        <svg viewBox="0 0 210 297" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <!-- White background -->
          <rect width="210" height="297" fill="#ffffff" />
          
          <!-- Cream top background wave -->
          <path d="M 0 0 H 210 V 28 C 130 30, 70 60, 38 75 C 20 80, 10 70, 0 62 Z" fill="var(--bg-light)" />
          
          <!-- Layered light gold/yellow top wave -->
          <path d="M 0 0 H 210 V 16 C 130 18, 70 44, 38 55 C 20 60, 10 50, 0 42 Z" fill="var(--accent)" opacity="0.6" />
          
          <!-- Main gold/yellow top wave (occupying photo space on left, above title on right) -->
          <path d="M 0 0 H 210 V 22 C 130 24, 70 52, 38 65 C 20 70, 10 60, 0 52 Z" fill="var(--accent)" />
          
          <!-- Bottom-right corner light-yellow accent curve -->
          <path d="M 210 297 H 175 C 190 280, 205 285, 210 297 Z" fill="var(--accent)" opacity="0.12" />
        </svg>
      </div>
      
      <aside class="sidebar">
        <!-- Photo Container -->
        <div class="photo-container">
          ${photoHTML}
        </div>
        
        <!-- Contact Info -->
        <div class="contact-section">
          ${contactHTML}
        </div>
        
        <!-- Habilidades Técnicas (sidebar) -->
        <div class="sidebar-section">
          <h3>${escapeHTML(data.sectionTitles?.techSkills || 'Habilidades Técnicas')}</h3>
          <div class="bullet-list-container">
            ${techSkillsHTML}
          </div>
        </div>

        <!-- Idiomas (sidebar) -->
        <div class="sidebar-section">
          <h3>${escapeHTML(data.sectionTitles?.languages || 'Idiomas')}</h3>
          <div class="bullet-list-container">
            ${languagesHTML}
          </div>
        </div>

        <!-- Competencias (sidebar) -->
        <div class="sidebar-section">
          <h3>${escapeHTML(data.sectionTitles?.skills || 'Competencias')}</h3>
          <div class="bullet-list-container">
            ${skillsHTML}
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header class="header">
          <p class="profession">${escapeHTML(data.personal.profession || 'Título del puesto')}</p>
          <h1>${escapeHTML(fullName)}</h1>
        </header>

        <!-- About Me Section -->
        <section class="section">
          <h2>${escapeHTML(data.sectionTitles?.profile || 'Perfil Profesional')}</h2>
          ${profileHTML}
        </section>

        <!-- Experience Section -->
        <section class="section">
          <h2>${escapeHTML(data.sectionTitles?.experience || 'Experiencia Laboral')}</h2>
          <div class="items-container">
            ${experienceHTML}
          </div>
        </section>

        <!-- Education Section -->
        <section class="section">
          <h2>${escapeHTML(data.sectionTitles?.education || 'Formación Académica')}</h2>
          <div class="items-container">
            ${educationHTML}
          </div>
        </section>
      </main>
    </article>
  `;
}
