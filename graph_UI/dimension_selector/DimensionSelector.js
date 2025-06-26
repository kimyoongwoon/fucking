// graph_UI/dimension_selector/DimensionSelector.js
// 차원 선택 드롭다운 관리

import { createAxisSelectors } from './AxisSelector.js';

let analysisResults = null;
let originalData = null;

export function initializeDimensionSelector(data) {
  originalData = data;
  analysisResults = analyzeData(data);
  
  const dimensionSelect = document.getElementById('dimension-select');
  const createBtn = document.getElementById('create-graph-btn');
  
  // Clear and populate dimension dropdown
  dimensionSelect.innerHTML = '';
  dimensionSelect.disabled = false;
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '차원을 선택하세요';
  dimensionSelect.appendChild(defaultOption);
  
  // Add available dimensions
  const availableDims = getAvailableDimensions(analysisResults);
  availableDims.forEach(dim => {
    const option = document.createElement('option');
    option.value = dim;
    option.textContent = `${dim}차원`;
    dimensionSelect.appendChild(option);
  });
  
  // Setup change event
  dimensionSelect.addEventListener('change', (e) => {
    const selectedDim = parseInt(e.target.value);
    if (selectedDim) {
      createAxisSelectors(selectedDim, analysisResults, originalData);
      createBtn.disabled = false;
    } else {
      document.getElementById('axis-selectors').innerHTML = '';
      createBtn.disabled = true;
    }
  });
}

// Analyze data structure
function analyzeData(data) {
  const basicData = data.basic_data;
  const dataValue = data.data_value;
  
  if (!dataValue || dataValue.length === 0) {
    throw new Error('분석할 데이터가 없습니다.');
  }
  
  const firstPoint = dataValue[0];
  const coords = firstPoint[0];
  const value = firstPoint[1];
  
  const j = coords.length;
  let k, hasString = false;
  
  // Determine k and string presence based on value type
  if (basicData.value_type === 'double') {
    k = 1;
    hasString = false;
  } else if (basicData.value_type === 'string_double') {
    k = 2;
    hasString = true;
  } else if (basicData.value_type === 'array') {
    k = Array.isArray(value) ? value.length : 1;
    hasString = false;
  } else if (basicData.value_type === 'string_array') {
    k = Array.isArray(value) && Array.isArray(value[1]) ? value[1].length + 1 : 2;
    hasString = true;
  }
  
  const n = j;
  const m = hasString ? k - 1 : k;
  const totalDim = n + m;
  
  return { j, k, n, m, totalDim, hasString, valueType: basicData.value_type };
}

// Determine available dimensions based on data structure
function getAvailableDimensions(analysis) {
  const { hasString, totalDim } = analysis;
  const availableDims = [];
  
  if (hasString) {
    if (totalDim >= 0) availableDims.push(1);
    if (totalDim >= 1) availableDims.push(2);
    if (totalDim >= 2) availableDims.push(3);
    if (totalDim >= 3) availableDims.push(4);
  } else {
    if (totalDim >= 1) availableDims.push(1);
    if (totalDim >= 2) availableDims.push(2);
    if (totalDim >= 3) availableDims.push(3);
    if (totalDim >= 4) availableDims.push(4);
  }
  
  return availableDims;
}

export function getAnalysisResults() {
  return analysisResults;
}