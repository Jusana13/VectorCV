/**
 * @fileoverview Creador de CV Dinámico — utils.js
 * Funciones de utilidad pura para formateo de texto, fechas, singularización morfológica
 * en español e inyección de plantillas HTML del panel de control.
 */

import { UI_ICONS } from './icon-library.js';
import { state, templatesConfig, defaultData } from './state.js';

/**
 * Obtiene el título de una sección adaptado por la plantilla activa en base a aliases declarados.
 * @param {string} sectionKey - Clave identificadora de la sección (ej. 'skills', 'experience').
 * @returns {string} El título adaptado de la sección.
 * @description Si el título coincide con el valor global predeterminado y la plantilla activa declara
 *              un alias específico en su config.json, se sirve dicho alias para mayor modularidad.
 */
export function getSectionTitle(sectionKey) {
  if (!state || !state.sectionTitles) return defaultData.sectionTitles[sectionKey] || '';
  let title = state.sectionTitles[sectionKey];
  if (!title) title = defaultData.sectionTitles[sectionKey] || '';

  if (title === defaultData.sectionTitles[sectionKey] && templatesConfig) {
    const activeTemplateConfig = templatesConfig.find(t => t.id === state.activeTemplate);
    if (activeTemplateConfig?.sectionAliases?.[sectionKey]) {
      return activeTemplateConfig.sectionAliases[sectionKey];
    }
  }
  return title;
}

/**
 * Obtiene la denominación singular para los elementos de una sección adaptada por la plantilla.
 * @param {string} sectionKey - Clave identificadora de la sección.
 * @returns {string} Término singular correspondiente (ej. 'Puesto de Trabajo', 'Estudio', 'Competencia').
 */
export function getSingularForSection(sectionKey) {
  if (templatesConfig) {
    const activeTemplateConfig = templatesConfig.find(t => t.id === state.activeTemplate);
    if (activeTemplateConfig?.singularAliases?.[sectionKey]) {
      return activeTemplateConfig.singularAliases[sectionKey];
    }
  }
  
  // Usar el título original/base de la sección de la plantilla o el por defecto,
  // ignorando los cambios de texto personalizados que el usuario haya hecho en el estado,
  // para mantener consistentes las etiquetas del panel del editor (ej. "Añadir Habilidad").
  let baseTitle = '';
  if (templatesConfig) {
    const activeTemplateConfig = templatesConfig.find(t => t.id === state.activeTemplate);
    if (activeTemplateConfig?.sectionAliases?.[sectionKey]) {
      baseTitle = activeTemplateConfig.sectionAliases[sectionKey];
    }
  }
  if (!baseTitle) {
    baseTitle = defaultData.sectionTitles[sectionKey] || '';
  }
  
  return getSingularFromPlural(baseTitle);
}

/**
 * Resuelve dinámicamente un valor de campo por defecto en base al singular de sección de la plantilla activa.
 * @param {string} value - El valor de texto original.
 * @param {string} field - El nombre del campo (ej. 'name', 'title').
 * @param {string} sectionKey - La sección correspondiente.
 * @returns {string} El valor resuelto y adaptado si corresponde, o el original.
 * @description Mapea marcadores fijos (como 'Habilidad 1' o 'Nombre de tu Puesto de Trabajo') al
 *              término singular personalizado de la plantilla activa (como 'Competencia 1').
 *              Asegura que no se realicen validaciones ad-hoc con startWiths (Regla 18 del Guardián).
 */
export function resolveDefaultValue(value, field, sectionKey) {
  if (!value || typeof value !== 'string') return value;
  const singular = getSingularForSection(sectionKey);

  if (sectionKey === 'skills' && field === 'name') {
    const match = value.match(/^(?:Habilidad|Competencia)\s+(\d+)$/i);
    if (match) return `${singular} ${match[1]}`;
  }
  if (sectionKey === 'techSkills' && field === 'name') {
    const match = value.match(/^(?:Habilidad técnica|Habilidad|Competencia)\s+(\d+)$/i);
    if (match) return `${singular} ${match[1]}`;
  }
  if (sectionKey === 'languages' && field === 'name') {
    const match = value.match(/^(?:Idioma)\s+(\d+)$/i);
    if (match) return `${singular} ${match[1]}`;
  }
  if (sectionKey === 'personality' && field === 'name') {
    const match = value.match(/^(?:Cualidad)\s+(\d+)$/i);
    if (match) return `${singular} ${match[1]}`;
  }
  if (sectionKey === 'experience' && field === 'title') {
    if (value === 'Nombre de tu Puesto de Trabajo') {
      return `Nombre de tu ${singular}`;
    }
  }
  if (sectionKey === 'education' && field === 'title') {
    if (value === 'Nombre de tu Grado o Formación Académica') {
      return `Nombre de tu ${singular}`;
    }
  }
  return value;
}

/**
 * Clona una plantilla HTML reemplazando marcadores estructurales y constantes de forma limpia.
 * @param {string} templateId - El ID del elemento <template> en el HTML.
 * @param {number} index - El índice (0-based) del elemento en la lista.
 * @param {Object} [data={}] - Objeto clave-valor con marcadores adicionales a reemplazar.
 * @returns {HTMLElement|null} El elemento clonado ya parseado y formateado, o null si falla.
 */
export function getClonedTemplate(templateId, index, data = {}) {
  const template = document.getElementById(templateId);
  if (!template) {
    console.error(`Plantilla no encontrada: ${templateId}`);
    return null;
  }
  let html = template.innerHTML;

  html = html.replace(/{index}/g, index + 1)
    .replace(/{index-0}/g, index)
    .replace(/{trashIcon}/g, UI_ICONS.trash || '');

  Object.entries(data).forEach(([key, val]) => {
    const placeholder = new RegExp(`{${key}}`, 'g');
    html = html.replace(placeholder, val !== undefined && val !== null ? val : '');
  });

  const temp = document.createElement('div');
  temp.innerHTML = html.trim();
  return temp.firstElementChild;
}

/**
 * Obtiene la forma singular en español de un título en plural usando mapeos y reglas morfológicas.
 * @param {string} text - El texto en plural a singularizar.
 * @returns {string} El texto singularizado.
 */
export function getSingularFromPlural(text) {
  if (!text) return '';
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'experiencia laboral' || lower === 'experiencia') return 'Puesto de Trabajo';
  if (lower === 'formación académica' || lower === 'formacion academica' || lower === 'estudios') return 'Estudio';
  if (lower === 'habilidades técnicas' || lower === 'habilidades tecnicas' || lower === 'habilidades') return 'Habilidad';
  if (lower === 'idiomas') return 'Idioma';
  if (lower === 'intereses y hobbies' || lower === 'intereses') return 'Interés';

  const words = trimmed.split(/\s+/);
  const singularWords = words.map(word => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (!cleanWord) return word;
    const isUpperCase = cleanWord === cleanWord.toUpperCase() && cleanWord.length > 1;
    const isTitleCase = cleanWord[0] === cleanWord[0].toUpperCase() && cleanWord.length > 1;

    let lowerWord = cleanWord.toLowerCase();
    let singular = lowerWord;

    if (lowerWord.endsWith('ces')) {
      singular = lowerWord.slice(0, -3) + 'z';
    } else if (lowerWord.endsWith('ciones')) {
      singular = lowerWord.slice(0, -6) + 'ción';
    } else if (lowerWord.endsWith('siones')) {
      singular = lowerWord.slice(0, -6) + 'sión';
    } else if (lowerWord.endsWith('ades')) {
      singular = lowerWord.slice(0, -4) + 'ad';
    } else if (lowerWord.endsWith('edes')) {
      singular = lowerWord.slice(0, -4) + 'ed';
    } else if (lowerWord.endsWith('udes')) {
      singular = lowerWord.slice(0, -4) + 'ud';
    } else if (lowerWord.endsWith('eses')) {
      singular = lowerWord.slice(0, -4) + 'és';
    } else if (lowerWord.endsWith('les')) {
      singular = lowerWord.slice(0, -2);
    } else if (lowerWord.endsWith('res')) {
      singular = lowerWord.slice(0, -2);
    } else if (lowerWord.endsWith('nes')) {
      singular = lowerWord.slice(0, -2);
    } else if (lowerWord.endsWith('as')) {
      singular = lowerWord.slice(0, -1);
    } else if (lowerWord.endsWith('os')) {
      singular = lowerWord.slice(0, -1);
    } else if (lowerWord.endsWith('s') && !lowerWord.endsWith('is') && !lowerWord.endsWith('us') && lowerWord.length > 2) {
      singular = lowerWord.slice(0, -1);
    }

    if (isUpperCase) {
      return singular.toUpperCase();
    } else if (isTitleCase) {
      return singular.charAt(0).toUpperCase() + singular.slice(1);
    }
    return singular;
  });

  return singularWords.join(' ');
}

/**
 * Devuelve el texto adecuado para el botón "Añadir" según el singular y la sección.
 * @param {string} singular - El término singular (ej. 'Estudio').
 * @param {string} sectionKey - La sección correspondiente (ej. 'education').
 * @returns {string} El texto para el botón de la UI.
 */
export function getButtonText(singular, sectionKey) {
  if (sectionKey === 'experience' && singular === 'Puesto de Trabajo') return 'Añadir Trabajo';
  if (sectionKey === 'education' && singular === 'Estudio') return 'Añadir Formación';
  return `Añadir ${singular}`;
}

/**
 * Formatea un período en formato MM/YYYY a partir de fechas y el estado de vigencia.
 * @param {string} startDateVal - Fecha de inicio en formato YYYY-MM-DD.
 * @param {string} endDateVal - Fecha de finalización en formato YYYY-MM-DD.
 * @param {boolean} isCurrent - Indica si el puesto es actual (vigente).
 * @returns {string} El período formateado legible (ej. '05/2020 - Presente').
 */
export function formatPeriodDates(startDateVal, endDateVal, isCurrent) {
  if (!startDateVal) return '';

  const formatMonthYear = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const startFormatted = formatMonthYear(startDateVal);

  if (isCurrent) {
    return `${startFormatted} - Presente`;
  }

  if (endDateVal) {
    const endFormatted = formatMonthYear(endDateVal);
    return `${startFormatted} - ${endFormatted}`;
  }

  return startFormatted;
}

/**
 * Analiza un período textual de CV e intenta extraer fechas de inicio, fin y estado vigente.
 * @param {string} periodText - El período de texto (ej. '03/2021 - 12/2024' o '2022 - Presente').
 * @returns {Object} Un objeto con startDate, endDate y current listo para inputs de fecha.
 */
export function parsePeriodToDates(periodText) {
  const result = { startDate: '', endDate: '', current: false };
  if (!periodText) return result;

  const text = periodText.trim().toLowerCase();
  const parts = text.split(/[-–—]|a\s+|hasta\s+/).map(p => p.trim());

  const parsePart = (str) => {
    const myMatch = str.match(/^(\d{1,2})\/(\d{4})$/);
    if (myMatch) {
      const month = myMatch[1].padStart(2, '0');
      const year = myMatch[2];
      return `${year}-${month}`;
    }
    const yMatch = str.match(/^(\d{4})$/);
    if (yMatch) {
      return `${yMatch[1]}-01`;
    }
    return '';
  };

  if (parts.length >= 1 && parts[0]) {
    result.startDate = parsePart(parts[0]);
  }

  if (parts.length >= 2 && parts[1]) {
    if (parts[1] === 'presente' || parts[1] === 'actual' || parts[1] === 'actualidad' || parts[1].includes('hoy')) {
      result.current = true;
    } else {
      result.endDate = parsePart(parts[1]);
    }
  }

  return result;
}
