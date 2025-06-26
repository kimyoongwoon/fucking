// graph_UI/graph_option/data_filter/FilterControl.js
// 개별 필터 컨트롤 UI

import { prepareDataForVisualization, getAxisRange } from '../../graph_generator/utils/DataUtils.js';
import { graphConfigs,originalData  } from '../../../graph_complete.js';

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
  
  // Get data range
  setTimeout(() => {
    const config = graphConfigs[graphId];
    const preparedData = prepareDataForVisualization(
      config.dataset,
      originalData,
      {},
      null
    );
    
    const range = getAxisRange(axis.name, preparedData);
    const initialValue = (range.min + range.max) / 2;
    
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
  }, 0);
  
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