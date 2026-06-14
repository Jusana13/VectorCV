/**
 * @fileoverview Creador de CV Dinámico — form-builder.js
 * Módulo encargado de la generación dinámica del panel de control de formularios lateral,
 * sincronización de inputs estáticos/dinámicos, reordenamiento de pestañas según la plantilla activa,
 * controles de tipografía y selectores de color.
 */

import { INTEREST_ICONS } from './icon-library.js';
import {
  state,
  templatesConfig,
  defaultData,
  SUPPORTED_FONTS,
  VISUAL_PLACEHOLDERS,
  saveState,
  getDeepValue,
  getActiveTemplateSupportedShapes,
  getActiveTemplateFeatures,
  resolveContactHref
} from './state.js';
import {
  getSectionTitle,
  getSingularForSection,
  resolveDefaultValue,
  getClonedTemplate,
  getButtonText
} from './utils.js';
import {
  updatePreview,
  injectDynamicFontCSS
} from './cv-renderer.js';

// ==========================================================================
// RENDERIZADORES DE FORMULARIOS POR SECCIÓN
// ==========================================================================

/**
 * Renderiza los párrafos de la sección Perfil Profesional.
 * @description Genera un textarea dinámico por cada párrafo guardado en el estado.
 *              Si solo hay un párrafo, elimina el botón de borrado para mantener la UI limpia.
 */
export function renderProfileForm() {
  const container = document.getElementById('profile-paragraphs-container');
  if (!container) return;
  container.innerHTML = '';

  state.personal.profile.forEach((text, index) => {
    const card = getClonedTemplate('template-profile-card', index);
    if (!card) return;

    const textarea = card.querySelector('.profile-paragraph-input');
    if (textarea) textarea.value = text;

    if (state.personal.profile.length <= 1) {
      card.querySelector('.btn-remove')?.remove();
    }

    container.appendChild(card);
  });
}

/**
 * Renderiza las tarjetas repetidoras de la sección Experiencia Laboral.
 * @description Crea campos de texto, inputs de fecha (con bloqueo dinámico si es puesto activo),
 *              área de viñetas de logros e inputs opcionales de botón/proyecto según la plantilla.
 */
export let expandedExperienceIndex = 0;
export function setExpandedExperienceIndex(idx) {
  expandedExperienceIndex = idx;
}

export let expandedEducationIndex = 0;
export function setExpandedEducationIndex(idx) {
  expandedEducationIndex = idx;
}

export function renderExperienceForm() {
  const container = document.getElementById('experience-list-container');
  if (!container) return;
  container.innerHTML = '';

  const singular = getSingularForSection('experience');

  const addBtnSpan = document.querySelector('[data-action="add-experience"] span');
  if (addBtnSpan) {
    addBtnSpan.textContent = getButtonText(singular, 'experience');
  }

  // Corregir índice expandido por si cambió la cantidad de elementos
  if (expandedExperienceIndex >= state.experience.length) {
    expandedExperienceIndex = state.experience.length - 1;
  }

  state.experience.forEach((exp, index) => {
    const card = getClonedTemplate('template-experience-card', index, { singular });
    if (!card) return;

    // Título dinámico
    const headerTitle = card.querySelector('.repeater-title');
    const updateHeaderTitle = () => {
      if (headerTitle) {
        const jobTitle = exp.title ? exp.title.trim() : '';
        const company = exp.company ? exp.company.trim() : '';
        if (jobTitle || company) {
          headerTitle.textContent = `${jobTitle}${jobTitle && company ? ' en ' : ''}${company}`;
        } else {
          headerTitle.textContent = `${singular} #${index + 1}`;
        }
      }
    };
    updateHeaderTitle();

    // Configurar estado colapsado inicial
    const isExpanded = index === expandedExperienceIndex;
    if (isExpanded) {
      card.classList.remove('collapsed');
      const arrow = card.querySelector('.collapse-arrow');
      if (arrow) arrow.style.transform = 'rotate(90deg)';
    } else {
      card.classList.add('collapsed');
      const arrow = card.querySelector('.collapse-arrow');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }

    // Event listener para el acordeón (cabecera cliqueable)
    const header = card.querySelector('.repeater-header');
    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove')) return;

        const wasCollapsed = card.classList.contains('collapsed');

        // Colapsar todas las demás
        const allCards = container.querySelectorAll('.repeater-card');
        allCards.forEach((c) => {
          c.classList.add('collapsed');
          const arrow = c.querySelector('.collapse-arrow');
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        });

        if (wasCollapsed) {
          card.classList.remove('collapsed');
          const arrow = card.querySelector('.collapse-arrow');
          if (arrow) arrow.style.transform = 'rotate(90deg)';
          expandedExperienceIndex = index;
        } else {
          expandedExperienceIndex = -1;
        }
      });
    }

    const titleInput = card.querySelector('.exp-input[data-field="title"]');
    if (titleInput) {
      titleInput.value = exp.title || '';
      // Actualizar título de cabecera dinámicamente al escribir
      titleInput.addEventListener('input', (e) => {
        exp.title = e.target.value;
        updateHeaderTitle();
      });
    }

    const companyInput = card.querySelector('.exp-input[data-field="company"]');
    if (companyInput) {
      companyInput.value = exp.company || '';
      // Actualizar título de cabecera dinámicamente al escribir
      companyInput.addEventListener('input', (e) => {
        exp.company = e.target.value;
        updateHeaderTitle();
      });
    }

    const startInput = card.querySelector('.exp-date-start');
    if (startInput) startInput.value = exp.startDate ? exp.startDate.substring(0, 7) : '';

    const endInput = card.querySelector('.exp-date-end');
    if (endInput) {
      endInput.value = exp.endDate ? exp.endDate.substring(0, 7) : '';
      if (exp.current) {
        endInput.disabled = true;
      }
    }

    const currentCheckbox = card.querySelector('.exp-date-current');
    if (currentCheckbox) {
      currentCheckbox.checked = !!exp.current;
    }

    const descTypeSelect = card.querySelector('.exp-desc-type-select');
    if (descTypeSelect) {
      descTypeSelect.value = exp.descriptionType || 'bullets';
    }

    const bulletsGroup = card.querySelector('.exp-bullets-group');
    const paragraphGroup = card.querySelector('.exp-paragraph-group');
    const isBullets = (exp.descriptionType || 'bullets') === 'bullets';
    if (bulletsGroup) bulletsGroup.style.display = isBullets ? 'flex' : 'none';
    if (paragraphGroup) paragraphGroup.style.display = isBullets ? 'none' : 'flex';

    const bulletsTextarea = card.querySelector('.exp-bullets-input');
    if (bulletsTextarea) {
      bulletsTextarea.value = (exp.bullets || []).join('\n');
    }

    const paragraphTextarea = card.querySelector('.exp-paragraph-input');
    if (paragraphTextarea) {
      paragraphTextarea.value = exp.description || '';
    }

    // Configurar enlace opcional
    const optionalLinkCheckbox = card.querySelector('.exp-optional-link-checkbox');
    const linkFieldset = card.querySelector('.exp-link-fieldset');
    const hasButton = exp.button && exp.button.enabled === true;
    if (optionalLinkCheckbox) {
      optionalLinkCheckbox.checked = hasButton;
    }
    if (linkFieldset) {
      linkFieldset.style.display = hasButton ? 'block' : 'none';
    }

    const btnTextInput = card.querySelector('.exp-btn-input[data-field="text"]');
    if (btnTextInput) btnTextInput.value = exp.button?.text || 'Ver Proyecto';

    const btnUrlInput = card.querySelector('.exp-btn-input[data-field="url"]');
    if (btnUrlInput) btnUrlInput.value = exp.button?.url || '';

    container.appendChild(card);
  });
}


/**
 * Renderiza las tarjetas repetidoras de la sección Formación Académica.
 * @description Genera campos de texto para títulos, instituciones, rangos de fechas
 *              y inputs opcionales de enlace a certificados.
 */
export function renderEducationForm() {
  const container = document.getElementById('education-list-container');
  if (!container) return;
  container.innerHTML = '';

  const singular = getSingularForSection('education');

  const addBtnSpan = document.querySelector('[data-action="add-education"] span');
  if (addBtnSpan) {
    addBtnSpan.textContent = getButtonText(singular, 'education');
  }

  // Corregir índice expandido por si cambió la cantidad de elementos
  if (expandedEducationIndex >= state.education.length) {
    expandedEducationIndex = state.education.length - 1;
  }

  state.education.forEach((edu, index) => {
    const card = getClonedTemplate('template-education-card', index, { singular });
    if (!card) return;

    // Título dinámico
    const headerTitle = card.querySelector('.repeater-title');
    const updateHeaderTitle = () => {
      if (headerTitle) {
        const eduTitle = edu.title ? edu.title.trim() : '';
        const inst = edu.institution ? edu.institution.trim() : '';
        if (eduTitle || inst) {
          headerTitle.textContent = `${eduTitle}${eduTitle && inst ? ' en ' : ''}${inst}`;
        } else {
          headerTitle.textContent = `${singular} #${index + 1}`;
        }
      }
    };
    updateHeaderTitle();

    // Configurar estado colapsado inicial
    const isExpanded = index === expandedEducationIndex;
    if (isExpanded) {
      card.classList.remove('collapsed');
      const arrow = card.querySelector('.collapse-arrow');
      if (arrow) arrow.style.transform = 'rotate(90deg)';
    } else {
      card.classList.add('collapsed');
      const arrow = card.querySelector('.collapse-arrow');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    }

    // Event listener para el acordeón (cabecera cliqueable)
    const header = card.querySelector('.repeater-header');
    if (header) {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove')) return;

        const wasCollapsed = card.classList.contains('collapsed');

        // Colapsar todas las demás
        const allCards = container.querySelectorAll('.repeater-card');
        allCards.forEach((c) => {
          c.classList.add('collapsed');
          const arrow = c.querySelector('.collapse-arrow');
          if (arrow) arrow.style.transform = 'rotate(0deg)';
        });

        if (wasCollapsed) {
          card.classList.remove('collapsed');
          const arrow = card.querySelector('.collapse-arrow');
          if (arrow) arrow.style.transform = 'rotate(90deg)';
          expandedEducationIndex = index;
        } else {
          expandedEducationIndex = -1;
        }
      });
    }

    const titleInput = card.querySelector('.edu-input[data-field="title"]');
    if (titleInput) {
      titleInput.value = edu.title || '';
      titleInput.addEventListener('input', (e) => {
        edu.title = e.target.value;
        updateHeaderTitle();
      });
    }

    const instInput = card.querySelector('.edu-input[data-field="institution"]');
    if (instInput) {
      instInput.value = edu.institution || '';
      instInput.addEventListener('input', (e) => {
        edu.institution = e.target.value;
        updateHeaderTitle();
      });
    }

    const startInput = card.querySelector('.edu-date-start');
    if (startInput) startInput.value = edu.startDate ? edu.startDate.substring(0, 7) : '';

    const endInput = card.querySelector('.edu-date-end');
    if (endInput) {
      endInput.value = edu.endDate ? edu.endDate.substring(0, 7) : '';
      if (edu.current) {
        endInput.disabled = true;
      }
    }

    const currentCheckbox = card.querySelector('.edu-date-current');
    if (currentCheckbox) {
      currentCheckbox.checked = !!edu.current;
    }

    const descTextarea = card.querySelector('textarea[data-field="description"]');
    if (descTextarea) descTextarea.value = edu.description || '';

    // Configurar enlace opcional
    const optionalLinkCheckbox = card.querySelector('.edu-optional-link-checkbox');
    const linkFieldset = card.querySelector('.edu-link-fieldset');
    const hasButton = edu.button && edu.button.enabled === true;
    if (optionalLinkCheckbox) {
      optionalLinkCheckbox.checked = hasButton;
    }
    if (linkFieldset) {
      linkFieldset.style.display = hasButton ? 'block' : 'none';
    }

    const btnTextInput = card.querySelector('.edu-btn-input[data-field="text"]');
    if (btnTextInput) btnTextInput.value = edu.button?.text || 'Ver Certificado';

    const btnUrlInput = card.querySelector('.edu-btn-input[data-field="url"]');
    if (btnUrlInput) btnUrlInput.value = edu.button?.url || '';

    container.appendChild(card);
  });
}

/**
 * Renderiza la sección Habilidades (Skills) adaptada a las características de la plantilla activa.
 * @description Alterna entre sliders deslizantes (0-100%) y menús de selección de estrellas (1-5)
 *              o texto plano basándose en la configuración de la plantilla.
 */
export function renderSkillsForm() {
  const container = document.getElementById('skills-list-container');
  if (!container) return;
  container.innerHTML = '';

  const singular = getSingularForSection('skills');

  const addBtnSpan = document.querySelector('[data-action="add-skill"] span');
  if (addBtnSpan) {
    addBtnSpan.textContent = getButtonText(singular, 'skills');
  }

  const activeTmplConfig = templatesConfig.find(t => t.id === state.activeTemplate);
  const layout = activeTmplConfig?.resourceLayouts?.skills || 'bullets-list';

  const isPercentage = layout.startsWith('progress-');
  const isLevel = layout.startsWith('rating-');
  const templateId = isPercentage ? 'template-skill-percentage-card' : 'template-skill-card';

  state.skills.forEach((skill, index) => {
    let percent = skill.percentage;
    if (percent === undefined) {
      percent = skill.level ? skill.level * 20 : 60;
    }

    const card = getClonedTemplate(templateId, index, { singular, percentage: percent });
    if (!card) return;

    const nameInput = card.querySelector('input[data-field="name"]');
    if (nameInput) nameInput.value = resolveDefaultValue(skill.name || '', 'name', 'skills');

    if (isPercentage) {
      const rangeInput = card.querySelector('.skill-input-range');
      if (rangeInput) {
        rangeInput.value = percent;
      }
    } else {
      const inputRow = card.querySelector('.input-row');
      if (inputRow) {
        inputRow.classList.toggle('skill-grid-with-level', isLevel);
        inputRow.classList.toggle('skill-grid-no-level', !isLevel);
      }
      const levelGroup = card.querySelector('.level-group');
      if (levelGroup) {
        levelGroup.style.display = isLevel ? '' : 'none';
      }

      const select = card.querySelector('select[data-field="level"]');
      const levelLabel = card.querySelector('.level-group label');
      if (select) {
        if (levelLabel) levelLabel.textContent = 'Nivel (1 - 5)';
        select.innerHTML = `
          <option value="1">1 ★</option>
          <option value="2">2 ★★</option>
          <option value="3">3 ★★★</option>
          <option value="4">4 ★★★★</option>
          <option value="5">5 ★★★★★</option>
        `;
        select.value = skill.level || 3;
      }
    }

    container.appendChild(card);
  });
  updateSectionLabels('skills');
}

/**
 * Renderiza la sección de cualidades de Personalidad.
 * @description Muestra u oculta controles de estrellas según si la plantilla soporta
 *              features de visualización de rasgos de personalidad.
 */
export function renderPersonalityForm() {
  const container = document.getElementById('personality-list-container');
  if (!container) return;
  container.innerHTML = '';

  const addBtnSpan = document.querySelector('[data-action="add-personality"] span');
  if (addBtnSpan) {
    addBtnSpan.textContent = 'Añadir Cualidad';
  }

  const activeTmplConfig = templatesConfig.find(t => t.id === state.activeTemplate);
  const layout = activeTmplConfig?.resourceLayouts?.personality || 'bullets-list';

  const isPercentage = layout.startsWith('progress-');
  const isLevel = layout.startsWith('rating-');
  const templateId = isPercentage ? 'template-personality-percentage-card' : 'template-personality-card';
  const list = state.personality || [];

  list.forEach((pers, index) => {
    let percent = pers.percentage;
    if (percent === undefined) {
      percent = pers.level ? pers.level * 20 : 60;
    }

    const card = getClonedTemplate(templateId, index, { percentage: percent });
    if (!card) return;

    const nameInput = card.querySelector('input[data-field="name"]');
    if (nameInput) nameInput.value = pers.name || '';

    if (isPercentage) {
      const rangeInput = card.querySelector('.pers-input-range');
      if (rangeInput) {
        rangeInput.value = percent;
      }
    } else {
      const inputRow = card.querySelector('.personality-grid');
      if (inputRow) {
        inputRow.classList.toggle('hide-levels', !isLevel);
      }
      const levelGroup = card.querySelector('.level-group');
      if (levelGroup) {
        levelGroup.style.display = isLevel ? '' : 'none';
      }
      const select = card.querySelector('select[data-field="level"]');
      if (select) {
        select.value = pers.level || 3;
      }
    }

    container.appendChild(card);
  });
  updateSectionLabels('personality');
}

/**
 * Renderiza la lista de Habilidades Técnicas (especial para plantillas con columnas).
 */
export function renderTechSkillsForm() {
  const container = document.getElementById('tech-skills-list-container');
  if (!container) return;
  container.innerHTML = '';

  const addBtnSpan = document.querySelector('[data-action="add-tech-skill"] span');
  if (addBtnSpan) {
    addBtnSpan.textContent = 'Añadir Habilidad Técnica';
  }

  const list = state.techSkills || [];
  list.forEach((ts, index) => {
    const card = getClonedTemplate('template-tech-skill-card', index);
    if (!card) return;

    const nameInput = card.querySelector('input[data-field="name"]');
    if (nameInput) nameInput.value = ts.name || '';

    container.appendChild(card);
  });
  updateSectionLabels('techSkills');
}

export function renderLanguagesForm() {
  const container = document.getElementById('languages-list-container');
  if (!container) return;
  container.innerHTML = '';

  const singular = getSingularForSection('languages');

  const addBtnSpan = document.querySelector('[data-action="add-language"] span');
  if (addBtnSpan) {
    addBtnSpan.textContent = getButtonText(singular, 'languages');
  }

  const activeTmplConfig = templatesConfig.find(t => t.id === state.activeTemplate);
  const layout = activeTmplConfig?.resourceLayouts?.languages || 'bullets-list';

  const isPercentage = layout.startsWith('progress-');
  const templateId = isPercentage ? 'template-language-percentage-card' : 'template-language-simple-card';

  state.languages.forEach((lang, index) => {
    const card = getClonedTemplate(templateId, index, { singular, percentage: lang.percentage || 100 });
    if (!card) return;

    const nameInput = card.querySelector('input[data-field="name"]');
    if (nameInput) nameInput.value = lang.name || '';

    const levelInput = card.querySelector('input[data-field="level"]');
    if (levelInput) levelInput.value = lang.level || '';

    if (isPercentage) {
      const rangeInput = card.querySelector('.lang-input-range');
      if (rangeInput) {
        rangeInput.value = lang.percentage || 100;
      }
    }

    container.appendChild(card);
  });
  updateSectionLabels('languages');
}

/**
 * Renderiza las casillas de verificación e iconos de Intereses y Hobbies.
 */
export function renderInterestsForm() {
  const container = document.getElementById('interests-grid-container');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(INTEREST_ICONS).forEach(([key, value]) => {
    const isSelected = state.interests.includes(key);
    const card = document.createElement('div');
    card.className = `interest-checkbox-card ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-interest', key);
    card.innerHTML = `
      ${value.svg}
      <span>${value.name}</span>
      <input type="checkbox" ${isSelected ? 'checked' : ''}>
    `;
    container.appendChild(card);
  });
}

// ==========================================================================
// SINCRONIZACIÓN Y RE-ETIQUETADO DINÁMICO
// ==========================================================================

/**
 * Genera una etiqueta descriptiva en base al prefijo y el singular de la sección.
 * @param {string} prefix - Prefijo de la etiqueta (ej. 'Nombre', 'Nivel').
 * @param {string} singular - Término singular de la sección (ej. 'Idioma').
 * @returns {string} La etiqueta descriptiva formateada en español correcto.
 * @private
 */
function getDescriptiveLabel(prefix, singular) {
  const lowerSingular = (singular || '').trim().toLowerCase();
  if (!lowerSingular) return prefix;
  
  let article = 'de';
  if (lowerSingular === 'idioma') {
    article = 'del';
  } else if (lowerSingular === 'habilidad' || lowerSingular === 'cualidad' || lowerSingular === 'competencia' || lowerSingular === 'habilidad técnica' || lowerSingular === 'habilidad tecnica') {
    article = 'de la';
  } else {
    const isFeminine = lowerSingular.endsWith('a') || lowerSingular.endsWith('d');
    article = isFeminine ? 'de la' : 'del';
  }
  return `${prefix} ${article} ${lowerSingular}`;
}

/**
 * Actualiza los números de índice y descripciones descriptivas de un repeater.
 * @param {string} sectionKey - Clave identificadora (experiencia, habilidades, etc.).
 */
export function updateSectionLabels(sectionKey) {
  const titleText = getSectionTitle(sectionKey);
  const singular = getSingularForSection(sectionKey);

  let containerId = '';
  let addAction = '';
  if (sectionKey === 'experience') {
    containerId = 'experience-list-container';
    addAction = 'add-experience';
  } else if (sectionKey === 'education') {
    containerId = 'education-list-container';
    addAction = 'add-education';
  } else if (sectionKey === 'skills') {
    containerId = 'skills-list-container';
    addAction = 'add-skill';
  } else if (sectionKey === 'languages') {
    containerId = 'languages-list-container';
    addAction = 'add-language';
  } else if (sectionKey === 'personality') {
    containerId = 'personality-list-container';
    addAction = 'add-personality';
  } else if (sectionKey === 'techSkills') {
    containerId = 'tech-skills-list-container';
    addAction = 'add-tech-skill';
  }

  if (containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      const cards = container.querySelectorAll('.repeater-card');
      cards.forEach((card, index) => {
        const titleSpan = card.querySelector('.repeater-title');
        if (titleSpan) {
          titleSpan.textContent = `${singular} #${index + 1}`;
        }

        if (['skills', 'languages', 'personality', 'techSkills'].includes(sectionKey)) {
          const formGroups = card.querySelectorAll('.form-group');
          formGroups.forEach(group => {
            const label = group.querySelector('label');
            if (!label) return;

            const input = group.querySelector('input, select, textarea');
            if (input) {
              const field = input.getAttribute('data-field');
              if (field === 'name') {
                label.textContent = getDescriptiveLabel('Nombre', singular);
              } else if (field === 'level') {
                label.textContent = input.tagName === 'SELECT' ? 'Nivel (1 - 5)' : 'Nivel Texto';
              }
            }

            const rangeInput = group.querySelector('input[type="range"]');
            if (rangeInput) {
              const strong = label.querySelector('.percent-label');
              const pct = strong ? strong.textContent : '';
              const prefix = sectionKey === 'languages' ? 'Dominio' : 'Nivel';
              label.innerHTML = `${prefix}: <strong class="percent-label">${pct}</strong>`;
            }
          });
        }
      });
    }
  }

  if (addAction) {
    const addBtnSpan = document.querySelector(`[data-action="${addAction}"] span`);
    if (addBtnSpan) {
      addBtnSpan.textContent = getButtonText(singular, sectionKey);
    }
  }
}

/**
 * Renderiza los botones de selección de forma de foto de perfil (avatar).
 */
export function renderShapeToggles() {
  const shapeTogglesSide = document.querySelector('.avatar-shape-toggles-side');
  if (!shapeTogglesSide) return;

  const supported = getActiveTemplateSupportedShapes();
  shapeTogglesSide.innerHTML = '';

  if (supported.length <= 1) {
    shapeTogglesSide.style.display = 'none';
    return;
  } else {
    shapeTogglesSide.style.display = '';
  }

  const shapeDefinitions = {
    circle: {
      title: 'Circular',
      svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none" /></svg>`
    },
    rounded: {
      title: 'Bordes Redondeados',
      svg: `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" stroke-width="2" fill="none" /></svg>`
    },
    square: {
      title: 'Cuadrada',
      svg: `<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="0" stroke="currentColor" stroke-width="2" fill="none" /></svg>`
    }
  };

  supported.forEach(shapeId => {
    const def = shapeDefinitions[shapeId];
    if (!def) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `shape-toggle-btn ${state.personal.photoShape === shapeId ? 'active' : ''}`;
    btn.setAttribute('data-shape', shapeId);
    btn.title = def.title;
    btn.innerHTML = def.svg;
    shapeTogglesSide.appendChild(btn);
  });
}

/**
 * Sincroniza los selectores de color del panel de Diseño en base al config.json de la plantilla activa.
 * @description Genera dinámicamente campos de tipo color y les asigna event listeners inline.
 */
export function syncColorPickers() {
  const activeTmpl = state.activeTemplate;
  const container = document.querySelector('.color-picker-grid');
  if (!container) return;

  const activeTemplateConfig = templatesConfig ? templatesConfig.find(t => t.id === activeTmpl) : null;
  const colorsDef = activeTemplateConfig?.colors || { primary: "Color Principal", accent: "Color Secundario" };
  
  if (!state.colors[activeTmpl]) {
    const defaultColors = defaultData.colors[activeTmpl] || { primary: '#2C2D30', accent: '#C9A227' };
    state.colors[activeTmpl] = JSON.parse(JSON.stringify(defaultColors));
  }
  const currentColors = state.colors[activeTmpl];

  // --- RENDERIZADO DE SKINS ---
  const skinWrapper = document.getElementById('skin-selector-wrapper');
  const skinsGrid = document.getElementById('skins-grid');
  if (skinWrapper && skinsGrid) {
    if (activeTemplateConfig?.skins && activeTemplateConfig.skins.length > 0) {
      skinWrapper.style.display = 'flex';
      skinsGrid.innerHTML = '';
      
      activeTemplateConfig.skins.forEach(skin => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'skin-btn';
        
        // Determinar si esta skin es la activa basándose en la coincidencia exacta de colores
        let isMatch = true;
        Object.entries(skin.colors).forEach(([k, v]) => {
          if (currentColors[k]?.toLowerCase() !== v.toLowerCase()) {
            isMatch = false;
          }
        });
        
        if (isMatch) {
          btn.classList.add('active');
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'skin-btn-name';
        nameSpan.textContent = skin.name;
        btn.appendChild(nameSpan);
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'skin-preview-dots';
        
        const previewKeys = ['primary', 'accent', 'bgLight', 'sidebarBg', 'cardLight'];
        previewKeys.forEach(k => {
          if (skin.colors[k]) {
            const dot = document.createElement('span');
            dot.className = 'skin-preview-dot';
            dot.style.backgroundColor = skin.colors[k];
            dotsContainer.appendChild(dot);
          }
        });
        btn.appendChild(dotsContainer);
        
        btn.addEventListener('click', () => {
          state.colors[activeTmpl] = JSON.parse(JSON.stringify(skin.colors));
          
          if (skin.font) {
            if (!state.fonts) state.fonts = {};
            state.fonts[activeTmpl] = skin.font;
            injectDynamicFontCSS(skin.font);
            syncFontSelector();
          }
          
          syncColorPickers();
          updatePreview();
          updateThumbnailColors();
          saveState();
        });
        
        skinsGrid.appendChild(btn);
      });
    } else {
      skinWrapper.style.display = 'none';
    }
  }
  // --- FIN RENDERIZADO DE SKINS ---

  container.innerHTML = '';

  Object.entries(colorsDef).forEach(([token, label]) => {
    const value = currentColors[token] || '#000000';
    const itemDiv = document.createElement('div');
    itemDiv.className = 'color-picker-item';
    itemDiv.innerHTML = `
      <input type="color" id="color-${token}" data-token="${token}" value="${value}">
      <span>${label}</span>
    `;
    container.appendChild(itemDiv);

    const input = itemDiv.querySelector('input');
    input.addEventListener('input', (e) => {
      state.colors[activeTmpl][token] = e.target.value;
      updatePreview();
      updateThumbnailColors();
      saveState();
    });
  });
}

/**
 * Sincroniza las miniaturas del selector modal con los colores personalizados por el usuario.
 */
export function updateThumbnailColors() {
  if (!templatesConfig || templatesConfig.length === 0) return;
  templatesConfig.forEach(tmpl => {
    const cardDiv = document.querySelector(`.template-card[data-value="${tmpl.id}"]`);
    if (cardDiv) {
      const colors = state.colors[tmpl.id] || {};
      Object.entries(colors).forEach(([k, v]) => {
        cardDiv.style.setProperty(`--preview-${k}`, v);
      });
      // Fallback for older bgLight mapped to --preview-rose
      if (colors.bgLight) cardDiv.style.setProperty('--preview-rose', colors.bgLight);
    }
  });
}

/**
 * Sincroniza y pobla dinámicamente el selector de fuentes del panel de Diseño.
 */
export function syncFontSelector() {
  const container = document.getElementById('custom-font-select-container');
  const trigger = document.getElementById('custom-font-select-trigger');
  const selectedValue = document.getElementById('custom-font-selected-value');
  const optionsContainer = document.getElementById('custom-font-select-options');
  
  if (!container || !trigger || !selectedValue || !optionsContainer) return;

  const activeTmpl = state.activeTemplate;
  const activeTmplConfig = templatesConfig.find(t => t.id === activeTmpl);
  
  const supported = (activeTmplConfig && activeTmplConfig.supportedFonts) || SUPPORTED_FONTS;

  let currentFont = state.fonts?.[activeTmpl] || defaultData.fonts[activeTmpl] || activeTmplConfig?.defaultFont || 'Inter';
  if (!supported.includes(currentFont)) {
    currentFont = supported[0] || 'Inter';
    if (!state.fonts) state.fonts = {};
    state.fonts[activeTmpl] = currentFont;
    injectDynamicFontCSS(currentFont);
  }

  selectedValue.textContent = currentFont;
  selectedValue.style.fontFamily = `'${currentFont}', sans-serif`;

  const defaultFont = defaultData.fonts[activeTmpl] || activeTmplConfig?.defaultFont || 'Inter';

  optionsContainer.innerHTML = '';
  supported.forEach(font => {
    const optionDiv = document.createElement('div');
    optionDiv.className = `custom-select-option ${font === currentFont ? 'selected' : ''}`;
    optionDiv.setAttribute('data-value', font);

    const nameWrapper = document.createElement('div');
    nameWrapper.style.display = 'flex';
    nameWrapper.style.alignItems = 'center';
    nameWrapper.style.gap = '8px';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'custom-select-option-text';
    nameSpan.textContent = font;
    nameSpan.style.fontFamily = `'${font}', sans-serif`;
    nameWrapper.appendChild(nameSpan);

    if (font === defaultFont) {
      const badge = document.createElement('span');
      badge.style.fontSize = '9px';
      badge.style.color = 'var(--db-accent, #ebd078)';
      badge.style.border = '1px solid var(--db-accent, #ebd078)';
      badge.style.padding = '1px 5px';
      badge.style.borderRadius = '4px';
      badge.style.fontFamily = 'var(--db-font-family, sans-serif)';
      badge.style.fontWeight = '500';
      badge.style.textTransform = 'uppercase';
      badge.style.letterSpacing = '0.5px';
      badge.style.opacity = '0.8';
      badge.textContent = 'defecto';
      nameWrapper.appendChild(badge);
    }

    const previewSpan = document.createElement('span');
    previewSpan.className = 'custom-select-option-preview';
    previewSpan.textContent = 'AaBbCc';
    previewSpan.style.fontFamily = `'${font}', sans-serif`;

    optionDiv.appendChild(nameWrapper);
    optionDiv.appendChild(previewSpan);

    optionDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!state.fonts) state.fonts = {};
      state.fonts[state.activeTemplate] = font;
      
      selectedValue.textContent = font;
      selectedValue.style.fontFamily = `'${font}', sans-serif`;
      
      injectDynamicFontCSS(font);
      updatePreview();
      saveState();
      container.classList.remove('active');
      
      optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
        opt.classList.toggle('selected', opt.getAttribute('data-value') === font);
      });
    });

    optionsContainer.appendChild(optionDiv);
  });
}

/**
 * Lee las variables del estado global y rellena los inputs estáticos (del tipo data-bind).
 * @description Modifica la visibilidad de los acordeones y pestañas basándose en los features.
 */
export function syncStaticInputs() {
  const inputs = document.querySelectorAll('[data-bind]');
  inputs.forEach(input => {
    const path = input.getAttribute('data-bind');
    const value = getDeepValue(state, path);
    if (value !== undefined) {
      input.value = value;
    }
  });

  const imgPreview = document.getElementById('avatar-preview-img');
  const svgPreview = document.querySelector('.avatar-preview .placeholder-svg');
  const previewBox = document.getElementById('avatar-preview-box');
  const btnClearPhoto = document.getElementById('btn-clear-photo');

  const activeTmplConfig = templatesConfig ? templatesConfig.find(t => t.id === state.activeTemplate) : null;
  const allowClearPhoto = activeTmplConfig?.features?.allowClearPhoto || false;

  if (imgPreview && svgPreview) {
    if (state.personal.photo) {
      imgPreview.src = state.personal.photo;
      imgPreview.style.display = 'block';
      svgPreview.style.display = 'none';
      if (btnClearPhoto) {
        btnClearPhoto.style.display = allowClearPhoto ? 'inline-flex' : 'none';
      }
    } else {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
      svgPreview.style.display = 'block';
      if (btnClearPhoto) btnClearPhoto.style.display = 'none';
    }
  }
  if (previewBox) {
    previewBox.classList.remove('shape-circle', 'shape-rounded', 'shape-square');
    previewBox.classList.add(`shape-${state.personal.photoShape || 'circle'}`);
  }

  renderShapeToggles();

  const shapeButtons = document.querySelectorAll('.shape-toggle-btn');
  shapeButtons.forEach(btn => {
    if (btn.getAttribute('data-shape') === (state.personal.photoShape || 'circle')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Sincronizar número de teléfono dividido
  const fullPhone = getDeepValue(state, 'contact.2.text') || '';
  const prefixSelect = document.getElementById('phone-prefix-select');
  const numberInput = document.getElementById('phone-number-input');
  const fullInputHidden = document.getElementById('phone-full-input');

  if (prefixSelect && numberInput) {
    const prefixes = Array.from(prefixSelect.options).map(opt => opt.value);
    prefixes.sort((a, b) => b.length - a.length);

    let matchedPrefix = '+34';
    let restNumber = fullPhone;

    for (const pref of prefixes) {
      if (fullPhone.startsWith(pref)) {
        matchedPrefix = pref;
        restNumber = fullPhone.slice(pref.length).trim();
        break;
      }
    }

    prefixSelect.value = matchedPrefix;
    numberInput.value = restNumber;
    if (fullInputHidden) {
      fullInputHidden.value = fullPhone;
    }
  }

  const triggerBtnText = document.getElementById('current-template-text');
  if (triggerBtnText) {
    const displayName = activeTmplConfig ? activeTmplConfig.name : 'Moderno';
    triggerBtnText.textContent = `Plantilla: ${displayName}`;
  }

  const cards = document.querySelectorAll('.template-card');
  cards.forEach(card => {
    const isAct = card.getAttribute('data-value') === state.activeTemplate;
    card.classList.toggle('active', isAct);
    const badge = card.querySelector('.template-badge');
    if (badge) {
      badge.textContent = isAct ? 'Activa' : 'Seleccionar';
    }
  });

  const features = getActiveTemplateFeatures();
  const editorPanel = document.querySelector('.editor-panel');
  if (editorPanel) {
    editorPanel.classList.toggle('hide-buttons', !features.buttons);
    editorPanel.classList.toggle('hide-education-buttons', !features.educationButtons);
    editorPanel.classList.toggle('hide-experience-buttons', !features.experienceButtons);
    editorPanel.classList.toggle('hide-skill-levels', !features.skillLevels);
  }

  // Ordenar pestañas de la UI
  const mandatoryTabs = ['sec-personal', 'sec-contact', 'sec-design'];
  const userOrder = activeTmplConfig?.tabOrder;
  
  let order;
  if (!userOrder || !Array.isArray(userOrder)) {
    order = [...mandatoryTabs];
  } else {
    order = [...userOrder];
    // Ensure all mandatory tabs are present
    if (!order.includes('sec-personal')) {
      order.unshift('sec-personal');
    }
    if (!order.includes('sec-contact')) {
      const personalIdx = order.indexOf('sec-personal');
      order.splice(personalIdx + 1, 0, 'sec-contact');
    }
    if (!order.includes('sec-design')) {
      order.push('sec-design');
    }
  }

  // Filter based on explicit feature flags as a secondary defense
  order = order.filter(target => {
    if (target === 'sec-education' && features.education === false) return false;
    if (target === 'sec-experience' && features.experience === false) return false;
    return true;
  });

  const navTabs = document.querySelector('.editor-tabs');

  if (navTabs) {
    const tabs = Array.from(navTabs.querySelectorAll('.tab-btn'));

    order.forEach(target => {
      const tab = tabs.find(t => t.getAttribute('data-target') === target);
      if (tab) {
        tab.style.display = 'block';
        const sectionKey = target.replace('sec-', '');

        let tabTitle = '';
        if (sectionKey === 'personal') {
          tabTitle = 'Información Personal';
        } else if (sectionKey === 'profile') {
          tabTitle = 'Perfil';
        } else if (sectionKey === 'design') {
          tabTitle = 'Diseño';
        } else if (sectionKey === 'tech-skills') {
          tabTitle = getSectionTitle('techSkills');
        } else {
          tabTitle = getSectionTitle(sectionKey);
        }

        if (tabTitle) {
          tab.textContent = tabTitle;
        }

        navTabs.appendChild(tab);
      }
    });

    tabs.forEach(tab => {
      const target = tab.getAttribute('data-target');
      if (!order.includes(target)) {
        tab.style.display = 'none';
        if (tab.classList.contains('active')) {
          const firstTab = tabs.find(t => t.getAttribute('data-target') === 'sec-personal');
          if (firstTab) firstTab.click();
        }
      }
    });
  }

  if (order.includes('sec-skills')) renderSkillsForm();
  if (order.includes('sec-languages')) renderLanguagesForm();
  if (order.includes('sec-interests')) renderInterestsForm();
  if (order.includes('sec-personality')) renderPersonalityForm();
  if (order.includes('sec-tech-skills')) renderTechSkillsForm();

  const editableLegends = document.querySelectorAll('legend[contenteditable="true"]');
  editableLegends.forEach(legend => {
    const sectionKey = legend.getAttribute('data-section-title');
    const targetText = getSectionTitle(sectionKey);
    if (document.activeElement !== legend) {
      if (legend.textContent !== targetText) {
        legend.textContent = targetText;
      }
    }
    updateSectionLabels(sectionKey);
  });

  syncColorPickers();
  updateThumbnailColors();
  syncFontSelector();

  // Sincronizar estado de los botones de alternancia de visibilidad de secciones
  const visibilityButtons = document.querySelectorAll('.btn-toggle-visibility');
  visibilityButtons.forEach(btn => {
    const secKey = btn.getAttribute('data-section');
    if (secKey && state.visibleSections) {
      const isVisible = state.visibleSections[secKey] !== false;
      btn.classList.toggle('is-hidden', !isVisible);
    }
  });
}

/**
 * Renderiza todo el panel lateral sincronizando inputs y regenerando repeaters.
 */
const CONTACT_NAMES = {
  web: "Página Web",
  linkedin: "LinkedIn",
  github: "GitHub",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X (Twitter)",
  behance: "Behance",
  dribbble: "Dribbble",
  portfolio: "Portafolio",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  skype: "Skype",
  medium: "Medium",
  stackoverflow: "Stack Overflow"
};

/**
 * Renderiza los canales de contacto dinámicos/adicionales y rellena el selector para agregar nuevos.
 */
export function renderDynamicContacts() {
  const container = document.getElementById('dynamic-contacts-container');
  if (!container) return;
  container.innerHTML = '';

  const select = document.getElementById('select-add-contact-type');
  const activeContacts = state.contact.slice(3);

  activeContacts.forEach((contact, idx) => {
    const realIdx = idx + 3;
    const name = CONTACT_NAMES[contact.type] || contact.type;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'form-group dynamic-contact-item';
    itemDiv.innerHTML = `
      <div class="dynamic-contact-header">
        <label>${name}</label>
        <button type="button" class="btn-delete-contact" data-index="${realIdx}" title="Eliminar este canal de contacto">
          <svg viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
      <input type="text" class="dynamic-contact-input" data-index="${realIdx}" placeholder="Ej. ${VISUAL_PLACEHOLDERS.contact[contact.type] || ''}" value="${contact.text || ''}">
    `;
    container.appendChild(itemDiv);

    const input = itemDiv.querySelector('.dynamic-contact-input');
    input.addEventListener('input', (e) => {
      state.contact[realIdx].text = e.target.value;
      
      const val = e.target.value.trim();
      const type = state.contact[realIdx].type;
      state.contact[realIdx].href = resolveContactHref(type, val);

      updatePreview();
      saveState();
    });

    const deleteBtn = itemDiv.querySelector('.btn-delete-contact');
    deleteBtn.addEventListener('click', () => {
      state.contact.splice(realIdx, 1);
      renderDynamicContacts();
      updatePreview();
      saveState();
    });
  });

  if (select) {
    select.innerHTML = '<option value="" disabled selected>Seleccionar canal...</option>';
    const currentTypes = state.contact.map(c => c.type);
    
    Object.entries(CONTACT_NAMES).forEach(([type, name]) => {
      if (!currentTypes.includes(type)) {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = name;
        select.appendChild(opt);
      }
    });
  }
}

export function renderAllForms() {
  syncStaticInputs();
  renderDynamicContacts();
  renderProfileForm();
  renderExperienceForm();
  renderEducationForm();
  renderSkillsForm();
  renderPersonalityForm();
  renderTechSkillsForm();
  renderLanguagesForm();
  renderInterestsForm();
}
