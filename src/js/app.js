import { renderCV, TEMPLATES } from '../templates/templates.js';
import { INTEREST_ICONS, UI_ICONS } from './icon-library.js';

// --- ESTADO GLOBAL ---
let state = null;
let currentZoomMode = 'fit'; // 'fit' o 'manual'
let zoomScale = 1.0;

// Datos por defecto genéricos
const defaultData = {
  activeTemplate: 'moderno',
  personal: {
    name: 'AQUÍ VA TU NOMBRE',
    lastName: 'Y TUS APELLIDOS',
    profession: 'Tu Profesión / Especialidad',
    photo: '',
    photoShape: 'circle',
    profile: [
      'Describe aquí tu perfil profesional en uno o dos párrafos breves. Destaca tus principales competencias, experiencia y lo que puedes aportar a la empresa.',
      'Puedes añadir más párrafos de perfil o eliminarlos utilizando los botones de control de arriba.'
    ]
  },
  contact: [
    { type: 'location', text: 'Ciudad, País' },
    { type: 'email', text: 'correo@ejemplo.com', href: 'mailto:correo@ejemplo.com' },
    { type: 'phone', text: '+34 600 000 000' },
    { type: 'web', text: 'tuweb.com', href: 'https://tuweb.com' }
  ],
  experience: [
    {
      title: 'Nombre de tu Puesto de Trabajo',
      company: 'Nombre de la Empresa o Entidad',
      period: 'Año Inicio - Año Fin (o Actual)',
      bullets: [
        'Detalla aquí un logro importante o una responsabilidad principal que tuviste.',
        'Procura iniciar cada viñeta con un verbo de acción claro y conciso.',
        'Puedes agregar tantas líneas de logros o tareas como necesites.'
      ]
    }
  ],
  education: [
    {
      title: 'Nombre de tu Grado o Formación Académica',
      institution: 'Nombre de la Institución o Escuela',
      period: 'Año Inicio - Año Fin',
      description: 'Describe brevemente las materias de mayor importancia, proyectos realizados o competencias especiales desarrolladas durante tus estudios.',
      button: { text: 'Ver Certificado', url: '' }
    }
  ],
  skills: [
    { name: 'Habilidad 1', level: 5 },
    { name: 'Habilidad 2', level: 4 },
    { name: 'Habilidad 3', level: 3 }
  ],
  languages: [
    { name: 'Español', level: 'Nativo', percentage: 100 },
    { name: 'Inglés', level: 'Avanzado', percentage: 75 }
  ],
  interests: ['tech', 'reading', 'sports'],
  colors: {
    moderno: { primary: '#2C2D30', accent: '#C9A227', bgLight: '#F3EFE6' },
    profesional: { primary: '#1b2a4a', accent: '#e8a838', sidebarBg: '#f4f6f8' },
    minimalista: { primary: '#111111', accent: '#666666' }
  }
};

// --- AUTO-ESCALADO DEL PREVISUALIZADOR ---
function scalePreview() {
  const previewPanel = document.getElementById('preview-panel');
  const previewWrapper = document.querySelector('.cv-preview-wrapper');
  const previewContainer = document.querySelector('.cv-preview-container');
  if (!previewPanel || !previewWrapper || !previewContainer) return;

  const padding = 80;
  const panelWidth = previewPanel.clientWidth - padding;
  const panelHeight = previewPanel.clientHeight - padding;

  if (currentZoomMode === 'fit') {
    const scaleX = panelWidth / 794;
    const scaleY = panelHeight / 1123;
    zoomScale = Math.min(scaleX, scaleY);
    zoomScale = Math.max(0.3, Math.min(zoomScale, 1.2)); // límites razonables
    
    // Sincronizar controles UI
    const zoomRange = document.getElementById('zoom-range');
    const zoomLabel = document.getElementById('zoom-val-label');
    if (zoomRange) zoomRange.value = Math.round(zoomScale * 100);
    if (zoomLabel) zoomLabel.textContent = `${Math.round(zoomScale * 100)}%`;
  }

  // Establecer dimensiones en el wrapper y aplicar transform de escala al contenedor
  previewWrapper.style.width = `${794 * zoomScale}px`;
  previewWrapper.style.height = `${1123 * zoomScale}px`;
  previewContainer.style.transform = `scale(${zoomScale})`;
}

// --- ACTUALIZAR PREVISUALIZACIÓN ---
function updatePreview() {
  const previewContainer = document.querySelector('.cv-preview-container');
  if (!previewContainer) return;
  
  // Renderizar la plantilla correspondiente
  const html = renderCV(state, state.activeTemplate);
  previewContainer.innerHTML = html;
  
  // Ajustar la escala por si cambió de plantilla o tamaño de contenedor
  scalePreview();
}

// --- GUARDAR Y CARGAR DEL LOCALSTORAGE ---
function saveState() {
  localStorage.setItem('cv_creator_state', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('cv_creator_state');
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar localStorage, usando datos por defecto", e);
      state = JSON.parse(JSON.stringify(defaultData));
    }
  } else {
    state = JSON.parse(JSON.stringify(defaultData));
  }
}

// --- HELPER PARA RUTAS DE DATOS PROFUNDAS ---
function getDeepValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setDeepValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

// --- GESTIÓN DE FORMULARIOS ---

// Sincronizar inputs estáticos
function syncStaticInputs() {
  const inputs = document.querySelectorAll('[data-bind]');
  inputs.forEach(input => {
    const path = input.getAttribute('data-bind');
    const value = getDeepValue(state, path);
    if (value !== undefined) {
      input.value = value;
    }
  });

  // Foto de perfil preview (sync preview image/svg visibility and shape)
  const imgPreview = document.getElementById('avatar-preview-img');
  const svgPreview = document.querySelector('.avatar-preview .placeholder-svg');
  const previewBox = document.getElementById('avatar-preview-box');
  if (imgPreview && svgPreview) {
    if (state.personal.photo) {
      imgPreview.src = state.personal.photo;
      imgPreview.style.display = 'block';
      svgPreview.style.display = 'none';
    } else {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
      svgPreview.style.display = 'block';
    }
  }
  if (previewBox) {
    previewBox.classList.remove('shape-circle', 'shape-rounded', 'shape-square');
    previewBox.classList.add(`shape-${state.personal.photoShape || 'circle'}`);
  }

  // Sync photo shape buttons
  const shapeButtons = document.querySelectorAll('.shape-toggle-btn');
  shapeButtons.forEach(btn => {
    if (btn.getAttribute('data-shape') === (state.personal.photoShape || 'circle')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Sync phone split inputs
  const fullPhone = getDeepValue(state, 'contact.2.text') || '';
  const prefixSelect = document.getElementById('phone-prefix-select');
  const numberInput = document.getElementById('phone-number-input');
  const fullInputHidden = document.getElementById('phone-full-input');
  
  if (prefixSelect && numberInput) {
    const prefixes = Array.from(prefixSelect.options).map(opt => opt.value);
    prefixes.sort((a, b) => b.length - a.length);
    
    let matchedPrefix = '+34'; // default
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

  // Template select
  const selectTemplate = document.getElementById('template-select');
  if (selectTemplate) {
    selectTemplate.value = state.activeTemplate;
  }
  
  // Actualizar los pickers de colores del tema
  syncColorPickers();
}

function syncColorPickers() {
  const activeTmpl = state.activeTemplate;
  const colors = state.colors[activeTmpl] || {};
  
  const primaryPicker = document.getElementById('color-primary');
  const accentPicker = document.getElementById('color-accent');
  
  if (primaryPicker && colors.primary) {
    primaryPicker.value = colors.primary;
  }
  if (accentPicker && colors.accent) {
    accentPicker.value = colors.accent;
  }
}

// Renderizar Perfil (textarea múltiple)
function renderProfileForm() {
  const container = document.getElementById('profile-paragraphs-container');
  if (!container) return;
  container.innerHTML = '';

  state.personal.profile.forEach((text, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'repeater-card';
    fieldset.innerHTML = `
      <div class="repeater-header">
        <span class="repeater-title">Párrafo ${index + 1}</span>
        ${state.personal.profile.length > 1 ? `
          <button type="button" class="btn-remove" data-action="remove-profile" data-index="${index}" title="Eliminar párrafo">
            ${UI_ICONS.trash}
          </button>
        ` : ''}
      </div>
      <div class="form-group">
        <textarea class="profile-paragraph-input" data-index="${index}">${text}</textarea>
      </div>
    `;
    container.appendChild(fieldset);
  });
}

// Renderizar Experiencia Laboral
function renderExperienceForm() {
  const container = document.getElementById('experience-list-container');
  if (!container) return;
  container.innerHTML = '';

  state.experience.forEach((exp, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'repeater-card';
    fieldset.innerHTML = `
      <div class="repeater-header">
        <span class="repeater-title">Puesto de Trabajo #${index + 1}</span>
        <button type="button" class="btn-remove" data-action="remove-experience" data-index="${index}" title="Eliminar trabajo">
          ${UI_ICONS.trash}
        </button>
      </div>
      <div class="form-group">
        <label>Cargo / Título</label>
        <input type="text" class="exp-input" data-field="title" data-index="${index}" value="${exp.title || ''}">
      </div>
      <div class="form-group">
        <label>Empresa</label>
        <input type="text" class="exp-input" data-field="company" data-index="${index}" value="${exp.company || ''}">
      </div>
      <div class="form-group">
        <label>Período / Fechas</label>
        <input type="text" class="exp-input" data-field="period" data-index="${index}" value="${exp.period || ''}">
      </div>
      <div class="form-group">
        <label>Logros o Tareas (Uno por línea)</label>
        <textarea class="exp-bullets-input" data-index="${index}" placeholder="Ingresa cada logro en una línea distinta">${(exp.bullets || []).join('\n')}</textarea>
      </div>
    `;
    container.appendChild(fieldset);
  });
}

// Renderizar Formación Académica
function renderEducationForm() {
  const container = document.getElementById('education-list-container');
  if (!container) return;
  container.innerHTML = '';

  state.education.forEach((edu, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'repeater-card';
    fieldset.innerHTML = `
      <div class="repeater-header">
        <span class="repeater-title">Estudio #${index + 1}</span>
        <button type="button" class="btn-remove" data-action="remove-education" data-index="${index}" title="Eliminar estudio">
          ${UI_ICONS.trash}
        </button>
      </div>
      <div class="form-group">
        <label>Titulación / Curso</label>
        <input type="text" class="edu-input" data-field="title" data-index="${index}" value="${edu.title || ''}">
      </div>
      <div class="form-group">
        <label>Institución / Escuela</label>
        <input type="text" class="edu-input" data-field="institution" data-index="${index}" value="${edu.institution || ''}">
      </div>
      <div class="form-group">
        <label>Período / Fechas</label>
        <input type="text" class="edu-input" data-field="period" data-index="${index}" value="${edu.period || ''}">
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea class="edu-input" data-field="description" data-index="${index}">${edu.description || ''}</textarea>
      </div>
      
      <fieldset class="form-fieldset nested-fieldset">
        <legend>Enlace Opcional (Certificado / Portfolio)</legend>
        <div class="form-group">
          <label>Texto del Botón</label>
          <input type="text" class="edu-btn-input" data-field="text" data-index="${index}" value="${edu.button?.text || 'Ver Certificado'}">
        </div>
        <div class="form-group">
          <label>URL del Enlace (Vacío para ocultar)</label>
          <input type="url" class="edu-btn-input" data-field="url" data-index="${index}" value="${edu.button?.url || ''}" placeholder="https://...">
        </div>
      </fieldset>
    `;
    container.appendChild(fieldset);
  });
}

// Renderizar Habilidades Técnicas
function renderSkillsForm() {
  const container = document.getElementById('skills-list-container');
  if (!container) return;
  container.innerHTML = '';

  state.skills.forEach((skill, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'repeater-card';
    fieldset.innerHTML = `
      <div class="repeater-header">
        <span class="repeater-title">Habilidad #${index + 1}</span>
        <button type="button" class="btn-remove" data-action="remove-skill" data-index="${index}" title="Eliminar habilidad">
          ${UI_ICONS.trash}
        </button>
      </div>
      <div class="input-row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; width: 100%;">
        <div class="form-group">
          <label>Habilidad</label>
          <input type="text" class="skill-input" data-field="name" data-index="${index}" value="${skill.name || ''}" placeholder="Ej. Linux">
        </div>
        <div class="form-group">
          <label>Nivel (1 - 5)</label>
          <select class="skill-input" data-field="level" data-index="${index}">
            <option value="1" ${skill.level === 1 ? 'selected' : ''}>1 ★</option>
            <option value="2" ${skill.level === 2 ? 'selected' : ''}>2 ★★</option>
            <option value="3" ${skill.level === 3 ? 'selected' : ''}>3 ★★★</option>
            <option value="4" ${skill.level === 4 ? 'selected' : ''}>4 ★★★★</option>
            <option value="5" ${skill.level === 5 ? 'selected' : ''}>5 ★★★★★</option>
          </select>
        </div>
      </div>
    `;
    container.appendChild(fieldset);
  });
}

// Renderizar Idiomas
function renderLanguagesForm() {
  const container = document.getElementById('languages-list-container');
  if (!container) return;
  container.innerHTML = '';

  state.languages.forEach((lang, index) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'repeater-card';
    fieldset.innerHTML = `
      <div class="repeater-header">
        <span class="repeater-title">Idioma #${index + 1}</span>
        <button type="button" class="btn-remove" data-action="remove-language" data-index="${index}" title="Eliminar idioma">
          ${UI_ICONS.trash}
        </button>
      </div>
      <div class="form-group">
        <label>Idioma</label>
        <input type="text" class="lang-input" data-field="name" data-index="${index}" value="${lang.name || ''}" placeholder="Ej. Inglés">
      </div>
      <div class="input-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label>Nivel Texto</label>
          <input type="text" class="lang-input" data-field="level" data-index="${index}" value="${lang.level || ''}" placeholder="Ej. B2 o Nativo">
        </div>
        <div class="form-group">
          <label>Dominio (%): <strong class="percent-label">${lang.percentage || 100}%</strong></label>
          <input type="range" class="lang-input-range" data-index="${index}" min="0" max="100" value="${lang.percentage || 100}" style="accent-color: var(--db-accent);">
        </div>
      </div>
    `;
    container.appendChild(fieldset);
  });
}

// Renderizar Selector de Intereses
function renderInterestsForm() {
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

// Renderizar todo el panel lateral de formularios
function renderAllForms() {
  syncStaticInputs();
  renderProfileForm();
  renderExperienceForm();
  renderEducationForm();
  renderSkillsForm();
  renderLanguagesForm();
  renderInterestsForm();
}

// --- CONFIGURACIÓN DE EVENT LISTENERS ---
function setupEventListeners() {
  // 1. Selector de Plantillas
  const selectTemplate = document.getElementById('template-select');
  if (selectTemplate) {
    selectTemplate.addEventListener('change', (e) => {
      state.activeTemplate = e.target.value;
      syncColorPickers();
      updatePreview();
      saveState();
    });
  }

  // 2. Cambio de Pestañas (Tabs) con auto-scroll
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mover los tabs automáticamente para centrar el tab activo en la barra de scroll
      const container = document.querySelector('nav.editor-tabs');
      if (container) {
        const containerWidth = container.clientWidth;
        const tabOffsetLeft = tab.offsetLeft;
        const tabWidth = tab.clientWidth;
        const scrollTarget = tabOffsetLeft - (containerWidth / 2) + (tabWidth / 2);
        container.scrollTo({
          left: scrollTarget,
          behavior: 'smooth'
        });
      }

      const targetSectionId = tab.getAttribute('data-target');
      const sections = document.querySelectorAll('.form-section');
      sections.forEach(s => s.classList.remove('active'));
      
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });

  // 3. Evento Delegado de Escritura en Inputs Estáticos (`data-bind`)
  const editorContent = document.querySelector('.editor-content');
  if (editorContent) {
    editorContent.addEventListener('input', (e) => {
      const bindPath = e.target.getAttribute('data-bind');
      if (bindPath) {
        setDeepValue(state, bindPath, e.target.value);
        updatePreview();
        saveState();
      }
    });
  }

  // 4. Delegado de Entradas Dinámicas de Párrafos de Perfil
  const profileContainer = document.getElementById('profile-paragraphs-container');
  if (profileContainer) {
    profileContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('profile-paragraph-input')) {
        const idx = parseInt(e.target.getAttribute('data-index'));
        state.personal.profile[idx] = e.target.value;
        updatePreview();
        saveState();
      }
    });
  }

  // 5. Delegado de Entradas Dinámicas de Experiencia Laboral
  const expContainer = document.getElementById('experience-list-container');
  if (expContainer) {
    expContainer.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      
      if (e.target.classList.contains('exp-input')) {
        const field = e.target.getAttribute('data-field');
        state.experience[idx][field] = e.target.value;
      } else if (e.target.classList.contains('exp-bullets-input')) {
        state.experience[idx].bullets = e.target.value.split('\n').filter(line => line.trim() !== '');
      }
      
      updatePreview();
      saveState();
    });
  }

  // 6. Delegado de Entradas Dinámicas de Formación Académica
  const eduContainer = document.getElementById('education-list-container');
  if (eduContainer) {
    eduContainer.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      
      if (e.target.classList.contains('edu-input')) {
        const field = e.target.getAttribute('data-field');
        state.education[idx][field] = e.target.value;
      } else if (e.target.classList.contains('edu-btn-input')) {
        const field = e.target.getAttribute('data-field');
        if (!state.education[idx].button) state.education[idx].button = { text: '', url: '' };
        state.education[idx].button[field] = e.target.value;
      }
      
      updatePreview();
      saveState();
    });
  }

  // 7. Delegado de Entradas Dinámicas de Habilidades
  const skillsContainer = document.getElementById('skills-list-container');
  if (skillsContainer) {
    skillsContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('skill-input')) {
        const idx = parseInt(e.target.getAttribute('data-index'));
        const field = e.target.getAttribute('data-field');
        let value = e.target.value;
        
        if (field === 'level') value = parseInt(value);
        state.skills[idx][field] = value;
        
        updatePreview();
        saveState();
      }
    });
  }

  // 8. Delegado de Entradas Dinámicas de Idiomas
  const langContainer = document.getElementById('languages-list-container');
  if (langContainer) {
    langContainer.addEventListener('input', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      
      if (e.target.classList.contains('lang-input')) {
        const field = e.target.getAttribute('data-field');
        state.languages[idx][field] = e.target.value;
      } else if (e.target.classList.contains('lang-input-range')) {
        const val = parseInt(e.target.value);
        state.languages[idx].percentage = val;
        
        // Actualizar el porcentaje de texto al lado
        const percentLabel = e.target.closest('.form-group').querySelector('.percent-label');
        if (percentLabel) percentLabel.textContent = `${val}%`;
        
        // Ajuste en el caso de Idiomas: autocompletar texto a partir del porcentaje
        if (val <= 25) {
          state.languages[idx].level = 'Básico';
        } else if (val <= 50) {
          state.languages[idx].level = 'Intermedio';
        } else if (val <= 75) {
          state.languages[idx].level = 'Avanzado';
        } else {
          state.languages[idx].level = 'Nativo / C2';
        }
        
        // Sincronizar el input de texto de nivel
        const levelInput = e.target.closest('.repeater-card').querySelector('input[data-field="level"]');
        if (levelInput) levelInput.value = state.languages[idx].level;
      }
      
      updatePreview();
      saveState();
    });
  }

  // 9. Delegado de Intereses (Selección de tarjetas en el grid)
  const interestsGrid = document.getElementById('interests-grid-container');
  if (interestsGrid) {
    interestsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.interest-checkbox-card');
      if (card) {
        const key = card.getAttribute('data-interest');
        const checkbox = card.querySelector('input[type="checkbox"]');
        
        // Si no se hizo click directamente en el checkbox, alternar su estado
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }

        if (checkbox.checked) {
          card.classList.add('selected');
          if (!state.interests.includes(key)) {
            state.interests.push(key);
          }
        } else {
          card.classList.remove('selected');
          state.interests = state.interests.filter(item => item !== key);
        }
        
        updatePreview();
        saveState();
      }
    });
  }

  // 10. Delegado de Botones de Eliminar y Agregar Elementos
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btn-remove');
    const addBtn = e.target.closest('.btn-add');

    if (removeBtn) {
      const action = removeBtn.getAttribute('data-action');
      const idx = parseInt(removeBtn.getAttribute('data-index'));

      if (action === 'remove-profile') {
        state.personal.profile.splice(idx, 1);
        renderProfileForm();
      } else if (action === 'remove-experience') {
        state.experience.splice(idx, 1);
        renderExperienceForm();
      } else if (action === 'remove-education') {
        state.education.splice(idx, 1);
        renderEducationForm();
      } else if (action === 'remove-skill') {
        state.skills.splice(idx, 1);
        renderSkillsForm();
      } else if (action === 'remove-language') {
        state.languages.splice(idx, 1);
        renderLanguagesForm();
      }

      updatePreview();
      saveState();
    }

    if (addBtn) {
      const action = addBtn.getAttribute('data-action');

      if (action === 'add-profile') {
        state.personal.profile.push('');
        renderProfileForm();
      } else if (action === 'add-experience') {
        state.experience.push({ title: '', company: '', period: '', bullets: [] });
        renderExperienceForm();
      } else if (action === 'add-education') {
        state.education.push({ title: '', institution: '', period: '', description: '', button: { text: 'Ver Certificado', url: '' } });
        renderEducationForm();
      } else if (action === 'add-skill') {
        state.skills.push({ name: '', level: 5 });
        renderSkillsForm();
      } else if (action === 'add-language') {
        state.languages.push({ name: '', level: 'Básico', percentage: 25 });
        renderLanguagesForm();
      }

      updatePreview();
      saveState();
    }
  });

  // 11. Control de Carga de Foto de Perfil (Disparador Integrado en el Previsualizador)
  const photoInput = document.getElementById('photo-upload-input');
  const avatarPreviewBox = document.getElementById('avatar-preview-box');

  // Redirige el clic en el contenedor de previsualización al input file oculto para abrir el selector de archivos
  if (avatarPreviewBox && photoInput) {
    avatarPreviewBox.addEventListener('click', () => {
      photoInput.click();
    });
  }

  // Escucha cambios en el input file para leer la imagen cargada y actualizar el estado
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          state.personal.photo = evt.target.result;
          
          const imgPreview = document.getElementById('avatar-preview-img');
          const svgPreview = document.querySelector('.avatar-preview .placeholder-svg');
          if (imgPreview && svgPreview) {
            imgPreview.src = evt.target.result;
            imgPreview.style.display = 'block';
            svgPreview.style.display = 'none';
          }
          updatePreview();
          saveState();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 11.5. Control del Selector de Formas de Foto (Círculo, Esquinas Redondeadas, Cuadrado)
  const shapeTogglesSide = document.querySelector('.avatar-shape-toggles-side');
  if (shapeTogglesSide) {
    shapeTogglesSide.addEventListener('click', (e) => {
      const btn = e.target.closest('.shape-toggle-btn');
      if (btn) {
        const shape = btn.getAttribute('data-shape');
        state.personal.photoShape = shape;
        
        // Sincroniza la clase active para la retroalimentación visual en los controles
        const shapeButtons = shapeTogglesSide.querySelectorAll('.shape-toggle-btn');
        shapeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Sincroniza la clase de máscara geométrica en la vista previa del editor
        const previewBox = document.getElementById('avatar-preview-box');
        if (previewBox) {
          previewBox.classList.remove('shape-circle', 'shape-rounded', 'shape-square');
          previewBox.classList.add(`shape-${shape}`);
        }
        
        updatePreview();
        saveState();
      }
    });
  }

  const prefixSelect = document.getElementById('phone-prefix-select');
  const numberInput = document.getElementById('phone-number-input');
  const fullInputHidden = document.getElementById('phone-full-input');
  
  const updatePhoneState = () => {
    if (prefixSelect && numberInput && fullInputHidden) {
      const fullValue = `${prefixSelect.value} ${numberInput.value.trim()}`.trim();
      fullInputHidden.value = fullValue;
      if (state.contact && state.contact[2]) {
        state.contact[2].text = fullValue;
        updatePreview();
        saveState();
      }
    }
  };
  
  if (prefixSelect) {
    prefixSelect.addEventListener('change', updatePhoneState);
  }
  if (numberInput) {
    numberInput.addEventListener('input', updatePhoneState);
  }

  const addressInput = document.getElementById('address-input');
  const btnGeolocation = document.getElementById('btn-geolocation');
  const btnSearchAddress = document.getElementById('btn-search-address');
  const addressSuggestions = document.getElementById('address-suggestions');
  let debounceTimeout = null;

  const fetchAddressSuggestions = (query) => {
    if (!query || query.length < 3) {
      if (addressSuggestions) addressSuggestions.style.display = 'none';
      return;
    }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'CVDinamicoApp/1.0 (julio@ejemplo.com)'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        if (addressSuggestions) addressSuggestions.style.display = 'none';
        return;
      }
      if (addressSuggestions) {
        addressSuggestions.innerHTML = '';
        data.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.display_name;
          li.addEventListener('click', () => {
            addressInput.value = item.display_name;
            addressSuggestions.style.display = 'none';
            if (state.contact && state.contact[0]) {
              state.contact[0].text = item.display_name;
              updatePreview();
              saveState();
            }
          });
          addressSuggestions.appendChild(li);
        });
        addressSuggestions.style.display = 'block';
      }
    })
    .catch(err => console.error("Error al buscar dirección:", err));
  };

  if (addressInput) {
    addressInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimeout);
      const query = e.target.value;
      debounceTimeout = setTimeout(() => {
        fetchAddressSuggestions(query);
      }, 500);
    });
    document.addEventListener('click', (e) => {
      if (addressSuggestions && !addressInput.contains(e.target) && !addressSuggestions.contains(e.target)) {
        addressSuggestions.style.display = 'none';
      }
    });
    addressInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(debounceTimeout);
        fetchAddressSuggestions(addressInput.value);
      }
    });
  }

  if (btnSearchAddress && addressInput) {
    btnSearchAddress.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(debounceTimeout);
      fetchAddressSuggestions(addressInput.value);
    });
  }

  if (btnGeolocation) {
    btnGeolocation.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.geolocation) {
        btnGeolocation.disabled = true;
        btnGeolocation.style.opacity = '0.5';
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
            fetch(url, {
              headers: {
                'Accept-Language': 'es',
                'User-Agent': 'CVDinamicoApp/1.0 (julio@ejemplo.com)'
              }
            })
            .then(res => res.json())
            .then(data => {
              btnGeolocation.disabled = false;
              btnGeolocation.style.opacity = '1';
              if (data && data.display_name) {
                if (addressInput) addressInput.value = data.display_name;
                if (state.contact && state.contact[0]) {
                  state.contact[0].text = data.display_name;
                  updatePreview();
                  saveState();
                }
              }
            })
            .catch(err => {
              btnGeolocation.disabled = false;
              btnGeolocation.style.opacity = '1';
              console.error("Error en reverse-geocoding Nominatim:", err);
            });
          },
          (error) => {
            btnGeolocation.disabled = false;
            btnGeolocation.style.opacity = '1';
            alert('No se pudo obtener la ubicación. Por favor, asegúrate de dar permisos de geolocalización.');
            console.error("Error de geolocalización:", error);
          },
          { timeout: 10000 }
        );
      } else {
        alert('La geolocalización no está soportada por tu navegador.');
      }
    });
  }

  // 12. Controladores de Color Pickers de Temas
  const primaryPicker = document.getElementById('color-primary');
  const accentPicker = document.getElementById('color-accent');

  if (primaryPicker) {
    primaryPicker.addEventListener('input', (e) => {
      const activeTmpl = state.activeTemplate;
      state.colors[activeTmpl].primary = e.target.value;
      updatePreview();
      saveState();
    });
  }
  if (accentPicker) {
    accentPicker.addEventListener('input', (e) => {
      const activeTmpl = state.activeTemplate;
      state.colors[activeTmpl].accent = e.target.value;
      updatePreview();
      saveState();
    });
  }

  // 13. Guardar / Importar / Exportar JSON y Modales
  const btnReset = document.getElementById('btn-reset');
  const btnExport = document.getElementById('btn-export-json');
  const btnImport = document.getElementById('btn-import-json');
  const btnPrint = document.getElementById('btn-print-pdf');
  const modalOverlay = document.getElementById('json-modal');
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  const modalSubmit = document.getElementById('btn-modal-import-submit');
  const modalTextarea = document.getElementById('json-modal-text');
  const importJsonFile = document.getElementById('import-json-file');
  const btnTriggerFileImport = document.getElementById('btn-trigger-file-import');
  const selectedFileName = document.getElementById('selected-file-name');

  // Restablecer los datos a los valores genéricos por defecto (Modal Personalizado)
  const confirmModal = document.getElementById('confirm-modal');
  const btnConfirmResetSubmit = document.getElementById('btn-confirm-reset-submit');

  if (btnReset && confirmModal) {
    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
      confirmModal.classList.add('active');
    });
  }

  if (btnConfirmResetSubmit && confirmModal) {
    btnConfirmResetSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('cv_creator_state');
      state = JSON.parse(JSON.stringify(defaultData));
      saveState();
      renderAllForms();
      updatePreview();
      confirmModal.classList.remove('active');
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-${(state.personal.name || 'personal').toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnImport) {
    btnImport.addEventListener('click', () => {
      if (modalOverlay) {
        modalTextarea.value = '';
        if (importJsonFile) importJsonFile.value = '';
        if (selectedFileName) selectedFileName.textContent = 'Ningún archivo seleccionado';
        modalOverlay.classList.add('active');
      }
    });
  }

  // Cerrar modal al pulsar en cualquier botón de cerrar (x o Cancelar)
  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Cerrar modal al pulsar fuera de la tarjeta (en el overlay)
  const allOverlays = document.querySelectorAll('.modal-overlay');
  allOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        e.preventDefault();
        overlay.classList.remove('active');
      }
    });
  });

  // Envío del área de texto
  if (modalSubmit && modalTextarea) {
    modalSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const parsed = JSON.parse(modalTextarea.value);
        if (parsed.personal && parsed.contact && parsed.experience) {
          state = parsed;
          saveState();
          renderAllForms();
          updatePreview();
          if (modalOverlay) modalOverlay.classList.remove('active');
        } else {
          alert('Error: El formato JSON no contiene las propiedades requeridas de CV.');
        }
      } catch (err) {
        alert('Error: Formato JSON inválido. Por favor revisa el formato.');
      }
    });
  }

  // Disparador del input tipo file oculto
  if (btnTriggerFileImport && importJsonFile) {
    btnTriggerFileImport.addEventListener('click', (e) => {
      e.preventDefault();
      importJsonFile.click();
    });
  }

  // Importar archivo JSON directo
  if (importJsonFile) {
    importJsonFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (selectedFileName) selectedFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed.personal && parsed.contact && parsed.experience) {
              state = parsed;
              saveState();
              renderAllForms();
              updatePreview();
              if (modalOverlay) modalOverlay.classList.remove('active');
              importJsonFile.value = ''; // limpiar
              if (selectedFileName) selectedFileName.textContent = 'Ningún archivo seleccionado';
            } else {
              alert('Error: El formato JSON no contiene las propiedades requeridas de CV.');
              if (selectedFileName) selectedFileName.textContent = 'Ningún archivo seleccionado';
            }
          } catch (err) {
            alert('Error al leer el archivo JSON: Formato inválido.');
            if (selectedFileName) selectedFileName.textContent = 'Ningún archivo seleccionado';
          }
        };
        reader.readAsText(file);
      } else {
        if (selectedFileName) selectedFileName.textContent = 'Ningún archivo seleccionado';
      }
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // 14. Controladores de Zoom Manual y Automático
  const btnZoomFit = document.getElementById('btn-zoom-fit');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const zoomRange = document.getElementById('zoom-range');
  const zoomLabel = document.getElementById('zoom-val-label');

  if (btnZoomFit) {
    btnZoomFit.addEventListener('click', () => {
      currentZoomMode = 'fit';
      btnZoomFit.classList.add('active');
      scalePreview();
    });
  }

  const setManualZoom = (newScale) => {
    currentZoomMode = 'manual';
    zoomScale = Math.max(0.3, Math.min(newScale, 1.5));
    if (btnZoomFit) btnZoomFit.classList.remove('active');
    if (zoomRange) zoomRange.value = Math.round(zoomScale * 100);
    if (zoomLabel) zoomLabel.textContent = `${Math.round(zoomScale * 100)}%`;
    scalePreview();
  };

  if (zoomRange) {
    zoomRange.addEventListener('input', (e) => {
      setManualZoom(parseInt(e.target.value) / 100);
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      setManualZoom(zoomScale + 0.1);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      setManualZoom(zoomScale - 0.1);
    });
  }

  // 15. Evento de Cambio de Escala en Redimensionamiento
  window.addEventListener('resize', scalePreview);

  // ResizeObserver para el panel de previsualización (más preciso)
  const previewPanel = document.getElementById('preview-panel');
  if (previewPanel && window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      scalePreview();
    });
    ro.observe(previewPanel);
  }
}

// --- INSTANCIACIÓN DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderAllForms();
  updatePreview();
  setupEventListeners();
});
