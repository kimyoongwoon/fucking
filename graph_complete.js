// graph_complete.js - 메인 컨트롤러

// Import modules
import { initializeDimensionSelector } from './graph_UI/dimension_selector/index.js';
import { createGraphFromSelection } from './graph_UI/graph_generator/index.js';

// Global data storage
export let originalData = null;
export let graphInstances = {}; // 생성된 그래프 인스턴스 저장
export let graphConfigs = {}; // 그래프별 설정 저장

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

// Load data from sessionStorage
function loadData() {
  const rawData = sessionStorage.getItem('generatedData');
  
  if (!rawData) {
    showError('데이터가 없습니다. 먼저 데이터를 생성해주세요.');
    return;
  }
  
  try {
    originalData = JSON.parse(rawData);
    console.log('Data loaded:', originalData);
    
    // Initialize dimension selector with loaded data
    initializeDimensionSelector(originalData);
    
  } catch (error) {
    showError('데이터 로딩 오류: ' + error.message);
  }
}

// Setup event listeners
function setupEventListeners() {
  const createBtn = document.getElementById('create-graph-btn');
  
  createBtn.addEventListener('click', () => {
    const dimensionSelect = document.getElementById('dimension-select');
    const selectedDimension = parseInt(dimensionSelect.value);
    
    // Get selected axes
    const axisSelectors = document.querySelectorAll('.axis-select');
    const selectedAxes = Array.from(axisSelectors).map(select => ({
      name: select.value,
      index: parseInt(select.dataset.axisIndex),
      type: select.dataset.axisType
    }));
    
    // Validate selection
    if (!validateSelection(selectedDimension, selectedAxes)) {
      return;
    }
    
    // Create graph with selected configuration
    createGraphFromSelection({
      dimension: selectedDimension,
      axes: selectedAxes,
      originalData: originalData
    });
  });
}

// Validate axis selection
function validateSelection(dimension, axes) {
  // Check if all axes are selected
  if (axes.some(axis => !axis.name)) {
    alert('모든 축을 선택해주세요.');
    return false;
  }
  
  // Check for duplicates
  const axisNames = axes.map(a => a.name);
  if (new Set(axisNames).size !== axisNames.length) {
    alert('중복된 축을 선택할 수 없습니다.');
    return false;
  }
  
  return true;
}

// Show error message
function showError(message) {
  const container = document.getElementById('graphs-container');
  container.innerHTML = `<div class="error">${message}</div>`;
}

// Remove graph
export function removeGraph(graphId) {
  // Destroy chart instance
  if (graphInstances[graphId]) {
    graphInstances[graphId].destroy();
    delete graphInstances[graphId];
  }
  
  // Remove config
  delete graphConfigs[graphId];
  
  // Remove DOM element
  const card = document.getElementById(graphId);
  if (card) {
    card.remove();
  }
  
  console.log(`Graph ${graphId} removed`);
}