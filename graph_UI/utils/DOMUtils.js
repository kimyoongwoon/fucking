// graph_UI/utils/DOMUtils.js
// DOM 조작 유틸리티 함수

/**
 * Show error message in a container
 */
export function showError(message, containerId = 'graphs-container') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="error">${message}</div>`;
  }
}

/**
 * Create and show loading indicator
 */
export function showLoading(containerId = 'graphs-container') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading">데이터를 처리하는 중...</div>';
  }
}

/**
 * Clear container content
 */
export function clearContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Create element with attributes
 */
export function createElement(tag, attributes = {}, innerHTML = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('data')) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  });
  
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  
  return element;
}

/**
 * Toggle class on element
 */
export function toggleClass(element, className, force) {
  if (element) {
    element.classList.toggle(className, force);
  }
}

/**
 * Find closest parent with selector
 */
export function findClosest(element, selector) {
  return element ? element.closest(selector) : null;
}

/**
 * Debounce function for input events
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}