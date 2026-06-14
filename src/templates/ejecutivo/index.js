/**
 * @file index.js
 * @description Plantilla de diseño "Ejecutivo" para la generación de currículums.
 * Presenta una cabecera elegante de color oscuro, una columna lateral gris y una columna
 * principal blanca que divide el contenido del CV con un estilo profesional y estructurado.
 */

import { escapeHTML, silhouetteSVG, CONTACT_ICONS, renderResource } from '../helpers.js';

/**
 * Genera el HTML para la plantilla de currículum "Ejecutivo".
 * @param {Object} data - Datos del currículum del usuario.
 * @returns {string} Fragmento HTML listo para renderizar.
 */
export function render(data) {
  const colors = data.colors?.ejecutivo || { primary: '#1b2c47', accent: '#1b2c47', sidebarBg: '#e5e8ec' };

  // Nombre y apellidos
  const nameHTML = `${escapeHTML(data.personal.name || '')} ${escapeHTML(data.personal.lastName || '')}`;

  // Párrafos del perfil profesional
  const profileHTML = (data.personal.profile || [])
    .map(p => `<p class="profile-text">${escapeHTML(p)}</p>`)
    .join('');

  // Contacto (teléfono, email, web, dirección)
  const contactHTML = (data.contact || [])
    .filter(c => ['phone', 'email', 'web', 'location', 'address'].includes(c.type))
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      if (!text) return '';
      if (c.href) {
        return `
          <div class="contact-item">
            <div class="contact-icon">${icon}</div>
            <span class="contact-text"><a href="${escapeHTML(c.href)}" target="_blank">${text}</a></span>
          </div>`;
      }
      return `
        <div class="contact-item">
          <div class="contact-icon">${icon}</div>
          <span class="contact-text">${text}</span>
        </div>`;
    })
    .join('');

  // Habilidades (Herramientas, barra horizontal)
  const skillsHTML = renderResource(data.skills, 'skills', data.resourceLayouts?.skills, colors);

  // Idiomas (texto alineado a extremos en grid)
  const languagesHTML = renderResource(data.languages, 'languages', data.resourceLayouts?.languages, colors);

  // Personalidad (Información, lista de viñetas simples)
  const personalityHTML = renderResource(data.personality, 'personality', data.resourceLayouts?.personality, colors);

  // Experiencia laboral
  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 ? `
        <ul class="compact-list item-desc">
          ${exp.bullets.map(b => b && b.trim() ? `<li>${escapeHTML(b)}</li>` : '').join('')}
        </ul>` : (exp.description ? `<p class="item-desc">${escapeHTML(exp.description)}</p>` : '');

      const buttonHTML = exp.button?.url ? `
        <a href="${escapeHTML(exp.button.url)}" target="_blank" rel="noopener noreferrer" class="cert-btn">
          ${escapeHTML(exp.button.text || 'Ver Proyecto')}
        </a>` : '';

      return `
        <div class="item">
          <div class="item-header">
            <span class="item-title">${escapeHTML(exp.title)}</span>
          </div>
          <p class="item-subtitle">
            <span class="item-company">${escapeHTML(exp.company)}</span>
            ${exp.period ? `<span class="item-separator">|</span> <span class="item-date">${escapeHTML(exp.period)}</span>` : ''}
          </p>
          ${bulletsHTML}
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Formación académica
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
          </div>
          <p class="item-subtitle">
            <span class="item-institution">${escapeHTML(edu.institution)}</span>
            ${edu.period ? `<span class="item-separator">|</span> <span class="item-date">${escapeHTML(edu.period)}</span>` : ''}
          </p>
          ${edu.description ? `<p class="item-desc">${escapeHTML(edu.description)}</p>` : ''}
          ${buttonHTML}
        </div>`;
    })
    .join('');

  // Foto de perfil
  let photoHTML = '';
  if (data.personal.photo) {
    photoHTML = `<img src="${escapeHTML(data.personal.photo)}" alt="Foto de ${escapeHTML(data.personal.name || '')}">`;
  } else {
    photoHTML = silhouetteSVG;
  }

  return `
    <article class="cv-page ejecutivo" style="--primary: ${colors.primary}; --accent: ${colors.accent}; --sidebar-bg: ${colors.sidebarBg};">
      <!-- Header superior con fondo oscuro -->
      <header class="header">
        <div class="header-left">
          <!-- Espacio reservado para que se solape la foto de perfil -->
        </div>
        <div class="header-right">
          <h1>${nameHTML}</h1>
          <p class="profession">${escapeHTML(data.personal.profession || '')}</p>
        </div>
      </header>

      <!-- Contenedor del cuerpo -->
      <div class="cv-body">
        <!-- Columna Izquierda (Sidebar) -->
        <aside class="sidebar">
          <!-- Foto de perfil solapada -->
          <div class="photo-wrap">
            <div class="photo-placeholder shape-${data.personal.photoShape || 'circle'}">
              ${photoHTML}
            </div>
          </div>

          <div class="sidebar-content">
            <!-- Sección de Contacto -->
            ${contactHTML ? `
            <section class="section contact-section">
              <div class="section-title">
                <h2>${escapeHTML(data.sectionTitles?.contact || 'Contacto')}</h2>
              </div>
              <div class="contact-grid">
                ${contactHTML}
              </div>
            </section>
            ` : ''}

            <!-- Sección de Información (Personality) -->
            ${personalityHTML ? `
            <section class="section info-section">
              <div class="section-title">
                <h2>${escapeHTML(data.sectionTitles?.personality || 'Información')}</h2>
              </div>
              <ul class="info-list">
                ${personalityHTML}
              </ul>
            </section>
            ` : ''}

            <!-- Sección de Idiomas -->
            ${languagesHTML ? `
            <section class="section lang-section">
              <div class="section-title">
                <h2>${escapeHTML(data.sectionTitles?.languages || 'Idiomas')}</h2>
              </div>
              <div class="lang-grid">
                ${languagesHTML}
              </div>
            </section>
            ` : ''}
          </div>
        </aside>

        <!-- Columna Derecha (Contenido Principal) -->
        <main class="main-content">
          <!-- Mi Perfil -->
          <section class="section profile-section">
            <div class="section-title">
              <h2>${escapeHTML(data.sectionTitles?.profile || 'Perfil Profesional')}</h2>
            </div>
            ${profileHTML}
          </section>

          <!-- Experiencia -->
          ${experienceHTML ? `
          <section class="section experience-section">
            <div class="section-title">
              <h2>${escapeHTML(data.sectionTitles?.experience || 'Experiencia')}</h2>
            </div>
            ${experienceHTML}
          </section>
          ` : ''}

          <!-- Formación -->
          ${educationHTML ? `
          <section class="section education-section">
            <div class="section-title">
              <h2>${escapeHTML(data.sectionTitles?.education || 'Formación')}</h2>
            </div>
            ${educationHTML}
          </section>
          ` : ''}

          <!-- Herramientas (Skills) -->
          ${skillsHTML ? `
          <section class="section skills-section">
            <div class="section-title">
              <h2>${escapeHTML(data.sectionTitles?.skills || 'Herramientas')}</h2>
            </div>
            ${skillsHTML}
          </section>
          ` : ''}
        </main>
      </div>
    </article>
  `;
}
