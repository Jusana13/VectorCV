/**
 * @file index.js
 * @description Plantilla de diseño "Rounded" para la generación de currículums.
 * Presenta un diseño asimétrico con una columna izquierda blanca y una columna derecha
 * azul con tarjetas de esquinas redondeadas y una línea de tiempo vertical dinámica.
 */

import { escapeHTML, silhouetteSVG, CONTACT_ICONS, renderResource } from '../helpers.js';

/**
 * Genera el HTML para la plantilla de currículum "Rounded".
 * @param {Object} data - Datos del currículum del usuario.
 * @returns {string} Fragmento HTML listo para renderizar.
 */
export function render(data) {
  const colors = data.colors?.rounded || {
    primary: '#2A398A',
    accent: '#D1F2B6',
    cardLight: '#485CB8',
    cardDark: '#37489A'
  };

  // Nombres y apellidos
  const firstName = data.personal?.name || '';
  const lastName = data.personal?.lastName || '';

  // Foto de perfil
  const photoShape = data.personal?.photoShape || 'rounded';
  let photoWrapperHTML = '';
  const showPlaceholder = data.features?.photoPlaceholder !== false;

  if (data.personal?.photo) {
    photoWrapperHTML = `
      <div class="photo shape-${photoShape}" style="background-image: url('${escapeHTML(data.personal.photo)}');">
      </div>`;
  } else if (showPlaceholder) {
    const customSilhouette = silhouetteSVG.replace('color:#cbd5e1;', 'color: var(--primary); opacity: 0.25;');
    photoWrapperHTML = `
      <div class="photo shape-${photoShape}" style="display: flex; align-items: center; justify-content: center; background-color: #ffffff;">
        <div style="width: 50%; height: 50%;">${customSilhouette}</div>
      </div>`;
  }

  // Perfil profesional (Sobre mí)
  const profileHTML = (data.personal?.profile || [])
    .filter(p => p.trim())
    .map(p => `<p class="about-text profile-text">${escapeHTML(p)}</p>`)
    .join('');

  // Formación académica (Educación) - Sin botones
  const educationHTML = (data.education || [])
    .map(edu => {
      return `
        <div class="edu-item item">
          <h4 class="institute item-subtitle">${escapeHTML(edu.institution)}</h4>
          <p class="date item-date">${escapeHTML(edu.period)} ${edu.title ? ` — <span class="edu-title item-title">${escapeHTML(edu.title)}</span>` : ''}</p>
          ${edu.description ? `<p class="desc item-desc">${escapeHTML(edu.description)}</p>` : ''}
        </div>`;
    })
    .join('');

  // Experiencia laboral - Sin botones
  const experienceHTML = (data.experience || [])
    .map(exp => {
      const bulletsHTML = (exp.bullets || []).length > 0 && exp.bullets.some(b => b.trim()) ? `
        <ul class="exp-list item-desc">
          ${exp.bullets.filter(b => b.trim()).map(b => `<li>${escapeHTML(b)}</li>`).join('')}
        </ul>` : `<p class="exp-desc item-desc">${escapeHTML(exp.description || '')}</p>`;
        
      const companyInfo = exp.company ? `
        <span class="exp-company item-subtitle">${escapeHTML(exp.company)}</span>
        ${exp.location ? `<span class="exp-location"> (${escapeHTML(exp.location)})</span>` : ''}` : '';

      return `
        <div class="exp-item item">
          <div class="year item-date">• ${escapeHTML(exp.period)}</div>
          <div class="job item-title">${escapeHTML(exp.title)}</div>
          ${companyInfo ? `<div class="company-row">${companyInfo}</div>` : ''}
          ${bulletsHTML}
        </div>`;
    })
    .join('');

  // Habilidades y Conocimientos (Bloque 1)
  const skillsContent = renderResource(data.skills, 'skills', data.resourceLayouts?.skills, colors);
  const skillsHTML = skillsContent ? `
    <div class="block block-skills">
      <div class="icon-wrapper">
        <svg viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
      <h3 class="section-title">${escapeHTML(data.sectionTitles?.skills || 'Conocimientos').toUpperCase()}</h3>
      <div class="list-container">
        <ul class="custom-list">
          ${skillsContent}
        </ul>
      </div>
    </div>` : '';

  // Habilidades personales / Cualidades (Bloque 2)
  const personalityContent = renderResource(data.personality, 'personality', data.resourceLayouts?.personality, colors);
  const personalityHTML = personalityContent ? `
    <div class="block block-skills">
      <div class="icon-wrapper">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
        </svg>
      </div>
      <h3 class="section-title">${escapeHTML(data.sectionTitles?.personality || 'Habilidades').toUpperCase()}</h3>
      <div class="list-container">
        <ul class="custom-list">
          ${personalityContent}
        </ul>
      </div>
    </div>` : '';

  // Idiomas (Bloque 3)
  const languagesContent = renderResource(data.languages, 'languages', data.resourceLayouts?.languages, colors);
  const languagesHTML = languagesContent ? `
    <div class="block block-skills">
      <div class="icon-wrapper">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
      <h3 class="section-title">${escapeHTML(data.sectionTitles?.languages || 'Idiomas').toUpperCase()}</h3>
      <div class="languages-container">
        ${languagesContent}
      </div>
    </div>` : '';

  // Información de contacto
  const contactHTML = (data.contact || [])
    .filter(c => c.text && c.text.trim())
    .map(c => {
      const icon = CONTACT_ICONS[c.type] || '';
      const text = escapeHTML(c.text);
      return `
        <div class="contact-item">
          <div class="contact-icon">
            ${icon}
          </div>
          <span>${c.href ? `<a href="${escapeHTML(c.href)}" target="_blank">${text}</a>` : text}</span>
        </div>`;
    })
    .join('');

  // Título de la sección de contacto
  const contactSectionTitle = escapeHTML(data.sectionTitles?.contact || 'Contacto').toUpperCase();

  return `
    <article class="cv-page rounded" style="--primary: ${colors.primary}; --accent: ${colors.accent}; --card-light: ${colors.cardLight}; --card-dark: ${colors.cardDark};">
      <div class="main-content">
        <div class="left-col">
          <div class="header-blue-bg">
            ${photoWrapperHTML}
          </div>

          <div class="left-text-content">
            <h1 class="name-bold">${escapeHTML(firstName)}${lastName ? `<br>${lastName}` : ''}</h1>

            ${data.personal?.profession ? `
            <div class="job-title-container">
              <div class="job-line"></div>
              <div class="job-text">${escapeHTML(data.personal.profession)}</div>
            </div>` : ''}

            ${profileHTML ? `
            <h2 class="section-title-left">${escapeHTML(data.sectionTitles?.profile || 'SOBRE MÍ').toUpperCase()}</h2>
            ${profileHTML}` : ''}
          </div>
        </div>

        <div class="right-col">
          ${educationHTML ? `
          <div class="block block-formacion">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
              </svg>
            </div>
            <h3 class="section-title">${escapeHTML(data.sectionTitles?.education || 'Formación').toUpperCase()}</h3>
            ${educationHTML}
          </div>` : ''}

          ${experienceHTML ? `
          <div class="block block-experiencia">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
            </div>
            <h3 class="section-title">${escapeHTML(data.sectionTitles?.experience || 'Experiencia Laboral').toUpperCase()}</h3>
            ${experienceHTML}
          </div>` : ''}

          ${skillsHTML}
          ${personalityHTML}
          ${languagesHTML}
        </div>
      </div>

      ${contactHTML ? `
      <div class="footer-container">
        <div class="footer-divider">
          <div class="line"></div>
          <span>${contactSectionTitle}</span>
          <div class="line"></div>
        </div>

        <div class="contact-info">
          ${contactHTML}
        </div>
      </div>` : ''}
    </article>
  `;
}
