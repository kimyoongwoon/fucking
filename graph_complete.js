// graph_complete.js - 메인 컨트롤러 - 축 선택 수정 버전

// Import modules
import { initializeDimensionSelector } from './graph_UI/dimension_selector/index.js';
import { createGraphFromSelection } from './graph_UI/graph_generator/index.js';

// Global data storage - 글로벌 윈도우 객체에도 할당
export let originalData = null;
export let graphInstances = {};
export let graphConfigs = {};

// ✅ 추가: 글로벌 윈도우 객체에도 할당 (디버깅 및 호환성용)
if (typeof window !== 'undefined') {
  window.originalData = null;
  window.graphInstances = {};
  window.graphConfigs = {};
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 graph_complete.js 로딩 시작');
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
    
    // ✅ 글로벌 윈도우 객체에도 할당
    if (typeof window !== 'undefined') {
      window.originalData = originalData;
    }
    
    console.log('✅ Data loaded successfully:', originalData);
    
    // 데이터 구조 검증
    if (!originalData.data_value || !Array.isArray(originalData.data_value)) {
      throw new Error('Invalid data structure: missing data_value array');
    }
    
    if (originalData.data_value.length === 0) {
      throw new Error('No data points found');
    }
    
    console.log(`✅ Loaded ${originalData.data_value.length} data points`);
    
    // Initialize dimension selector with loaded data
    initializeDimensionSelector(originalData);
    
  } catch (error) {
    console.error('❌ Data loading error:', error);
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
    
    // ✅ 수정: 축 선택 정보를 더 안전하게 추출
    const selectedAxes = Array.from(axisSelectors).map((select, position) => {
      const axisName = select.value;
      
      // 선택된 옵션에서 데이터 속성 읽기
      const selectedOption = select.selectedOptions[0];
      
      console.log(`🔍 Processing axis ${position}:`, {
        axisName,
        selectedOption,
        dataAxisType: selectedOption?.dataset?.axisType,
        dataAxisIndex: selectedOption?.dataset?.axisIndex
      });
      
      // ✅ 수정: 옵션에서 type과 index를 정확히 추출
      let axisType = selectedOption?.dataset?.axisType;
      let axisIndex = selectedOption?.dataset?.axisIndex;
      
      // ✅ 추가: 기본값 설정 및 유효성 검사
      if (!axisType || axisIndex === undefined) {
        console.warn(`⚠️ Missing data attributes for ${axisName}, attempting to infer...`);
        
        // 축 이름으로 타입과 인덱스 추론
        if (axisName === 'String') {
          axisType = 'string';
          axisIndex = -1;
        } else if (axisName.match(/^Y\d+$/)) {
          // Y0, Y1 등 - output 축
          axisType = 'output';
          axisIndex = parseInt(axisName.substring(1));
        } else {
          // x0, x1 등 - input 축
          axisType = 'input';
          // 원본 데이터에서 인덱스 찾기
          if (originalData?.basic_data?.axes) {
            const foundAxis = originalData.basic_data.axes.find(a => a.name === axisName);
            if (foundAxis) {
              axisIndex = originalData.basic_data.axes.indexOf(foundAxis);
            } else {
              console.error(`❌ Cannot find axis ${axisName} in original data`);
              axisIndex = 0; // 기본값
            }
          } else {
            axisIndex = 0; // 기본값
          }
        }
        
        console.log(`🔧 Inferred type: ${axisType}, index: ${axisIndex} for ${axisName}`);
      } else {
        axisIndex = parseInt(axisIndex);
      }
      
      return {
        name: axisName,
        index: axisIndex,
        type: axisType
      };
    });
    
    console.log('🎯 Final selected axes:', selectedAxes);
    
    // Validate selection
    if (!validateSelection(selectedDimension, selectedAxes)) {
      return;
    }
    
    console.log('🎯 Creating graph with selection:', {
      dimension: selectedDimension,
      axes: selectedAxes,
      dataPointCount: originalData ? originalData.data_value.length : 0
    });
    
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
  
  // ✅ 추가: 축 타입과 인덱스 유효성 검사
  for (const axis of axes) {
    if (!axis.type || axis.index === undefined || isNaN(axis.index)) {
      console.error(`❌ Invalid axis configuration:`, axis);
      alert(`축 설정 오류: ${axis.name} 축의 정보가 올바르지 않습니다.`);
      return false;
    }
  }
  
  // 데이터 존재 여부 확인
  if (!originalData || !originalData.data_value || originalData.data_value.length === 0) {
    alert('시각화할 데이터가 없습니다.');
    return false;
  }
  
  return true;
}

// Show error message
function showError(message) {
  const container = document.getElementById('graphs-container');
  container.innerHTML = `<div class="error" style="color: red; padding: 20px; text-align: center; font-weight: bold;">${message}</div>`;
}

// Remove graph
export function removeGraph(graphId) {
  // Destroy chart instance
  if (graphInstances[graphId]) {
    graphInstances[graphId].destroy();
    delete graphInstances[graphId];
  }
  
  // 글로벌 객체에서도 제거
  if (typeof window !== 'undefined' && window.graphInstances) {
    if (window.graphInstances[graphId]) {
      window.graphInstances[graphId].destroy();
      delete window.graphInstances[graphId];
    }
  }
  
  // Remove config
  delete graphConfigs[graphId];
  if (typeof window !== 'undefined' && window.graphConfigs) {
    delete window.graphConfigs[graphId];
  }
  
  // Remove DOM element
  const card = document.getElementById(graphId);
  if (card) {
    card.remove();
  }
  
  console.log(`🗑️ Graph ${graphId} removed`);
}

// ✅ 추가: 변수 동기화 함수
export function syncToGlobal() {
  if (typeof window !== 'undefined') {
    window.originalData = originalData;
    window.graphInstances = graphInstances;
    window.graphConfigs = graphConfigs;
  }
}