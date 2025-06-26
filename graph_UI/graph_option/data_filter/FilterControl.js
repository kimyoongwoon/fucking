// graph_UI/graph_option/data_filter/FilterControl.js
// 개별 필터 컨트롤 UI - 안전한 오류 처리 버전

import { prepareDataForVisualization, getAxisRange } from '../../graph_generator/utils/DataUtils.js';
import { graphConfigs, originalData } from '../../../graph_complete.js';

export function createFilterControl(axis, graphId, onFilterChange) {
  const control = document.createElement('div');
  control.className = 'filter-control';
  
  const label = document.createElement('div');
  label.className = 'filter-label';
  label.textContent = axis.name;
  control.appendChild(label);
  
  // Filter mode buttons
  const buttons = document.createElement('div');
  buttons.className = 'filter-buttons';
  
  const buttonTypes = ['모두', '>=', '=', '<='];
  const filterState = { mode: '모두', value: 0 };
  
  buttonTypes.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'filter-button';
    if (type === '모두') btn.classList.add('active');
    btn.textContent = type;
    btn.onclick = () => {
      // Update button states
      buttons.querySelectorAll('.filter-button').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      
      filterState.mode = type;
      onFilterChange(axis.name, filterState);
    };
    buttons.appendChild(btn);
  });
  
  control.appendChild(buttons);
  
  // Slider and text input container
  const sliderContainer = document.createElement('div');
  sliderContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 5px;';
  
  // Slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'filter-slider';
  slider.style.flex = '1';
  
  // Text input
  const textInput = document.createElement('input');
  textInput.type = 'number';
  textInput.className = 'filter-text-input';
  textInput.style.cssText = 'width: 80px; padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 11px;';
  textInput.step = 'any';
  
  // Value display
  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'filter-value';
  valueDisplay.style.cssText = 'min-width: 60px; text-align: center; font-size: 11px; color: #666;';
  valueDisplay.textContent = '계산 중...';
  
  // ✅ 수정: 안전한 데이터 범위 계산
  setTimeout(() => {
    try {
      const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
      const dataSource = originalData || window.originalData;
      
      if (!config || !dataSource) {
        console.warn(`FilterControl: Missing config or data for ${graphId}`);
        setDefaultRange();
        return;
      }
      
      // 현재 필터 없이 데이터를 준비
      const preparedData = prepareDataForVisualization(
        config.dataset,
        dataSource,
        {}, // 필터 없음
        null // 윈도우 없음
      );
      
      if (preparedData.length === 0) {
        console.warn(`FilterControl: No prepared data for axis ${axis.name}`);
        setDefaultRange();
        return;
      }
      
      // ✅ 추가: 축 데이터 존재 여부 확인
      const hasAxisData = preparedData.some(d => d[axis.name] !== undefined && d[axis.name] !== null);
      if (!hasAxisData) {
        console.warn(`FilterControl: No data found for axis ${axis.name}`);
        console.warn(`Available axes:`, preparedData.length > 0 ? Object.keys(preparedData[0]) : 'no data');
        setDefaultRange();
        return;
      }
      
      const range = getAxisRange(axis.name, preparedData);
      const initialValue = (range.min + range.max) / 2;
      
      setupSlider(range, initialValue);
      
    } catch (error) {
      console.error(`FilterControl: Error calculating range for ${axis.name}:`, error);
      setDefaultRange();
    }
  }, 0);
  
  // ✅ 추가: 기본 범위 설정 함수
  function setDefaultRange() {
    const range = { min: 0, max: 100 };
    const initialValue = 50;
    setupSlider(range, initialValue);
    console.log(`FilterControl: Using default range for ${axis.name}`);
  }
  
  // ✅ 추가: 슬라이더 설정 함수
  function setupSlider(range, initialValue) {
    // Setup slider
    slider.min = range.min;
    slider.max = range.max;
    slider.value = initialValue;
    slider.step = (range.max - range.min) / 1000;
    
    // Setup text input
    textInput.min = range.min;
    textInput.max = range.max;
    textInput.value = initialValue.toFixed(3);
    
    valueDisplay.textContent = initialValue.toFixed(3);
    
    filterState.value = initialValue;
    filterState.min = range.min;
    filterState.max = range.max;
    
    console.log(`FilterControl: ${axis.name} range set to [${range.min}, ${range.max}]`);
  }
  
  // Slider change event
  slider.oninput = () => {
    const value = parseFloat(slider.value);
    textInput.value = value.toFixed(3);
    valueDisplay.textContent = value.toFixed(3);
    filterState.value = value;
    onFilterChange(axis.name, filterState);
  };
  
  // Text input change event
  const updateFromTextInput = () => {
    let value = parseFloat(textInput.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    if (isNaN(value)) {
      value = parseFloat(slider.value);
    } else if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }
    
    textInput.value = value.toFixed(3);
    slider.value = value;
    valueDisplay.textContent = value.toFixed(3);
    filterState.value = value;
    onFilterChange(axis.name, filterState);
  };
  
  textInput.onchange = updateFromTextInput;
  textInput.onblur = updateFromTextInput;
  textInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      updateFromTextInput();
      textInput.blur();
    }
  };
  
  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(textInput);
  
  control.appendChild(sliderContainer);
  control.appendChild(valueDisplay);
  
  return control;
}