// graph_UI/dimension_selector/AxisSelector.js
// 축 선택 드롭다운 생성 및 관리

export function createAxisSelectors(dimension, analysisResults, originalData) {
  const container = document.getElementById('axis-selectors');
  container.innerHTML = '';
  
  // Get available axes
  const availableAxes = getAvailableAxes(analysisResults, originalData);
  
  // Create selectors for each dimension
  for (let i = 0; i < dimension; i++) {
    const selectorItem = createAxisSelectorItem(i, availableAxes, analysisResults.hasString);
    container.appendChild(selectorItem);
  }
  
  // Add change event listeners for validation
  setupAxisValidation(dimension);
}

// Get all available axes from data
function getAvailableAxes(analysisResults, originalData) {
  const axes = [];
  
  // Input axes (X0, X1, ...)
  if (originalData.basic_data && originalData.basic_data.axes) {
    originalData.basic_data.axes.forEach((axis, index) => {
      axes.push({
        name: axis.name,
        type: 'input',
        index: index
      });
    });
  }
  
  // String axis if present
  if (analysisResults.hasString) {
    axes.push({
      name: 'String',
      type: 'string',
      index: -1
    });
  }
  
  // Output axes (Y0, Y1, ...)
  const outputCount = analysisResults.hasString ? analysisResults.m : analysisResults.k;
  for (let i = 0; i < outputCount; i++) {
    axes.push({
      name: `Y${i}`,
      type: 'output',
      index: i
    });
  }
  
  return axes;
}

// Create individual axis selector
function createAxisSelectorItem(index, availableAxes, hasString) {
  const item = document.createElement('div');
  item.className = 'axis-selector-item';
  
  const label = document.createElement('label');
  label.textContent = index === 0 ? 'X축' : (index === 1 ? 'Y축' : `${index + 1}번째 축`);
  
  const select = document.createElement('select');
  select.className = 'axis-select';
  select.dataset.axisPosition = index;
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '선택하세요';
  select.appendChild(defaultOption);
  
  // Add axis options
  availableAxes.forEach(axis => {
    // String can only be on X axis (position 0)
    if (axis.type === 'string' && index !== 0) {
      return;
    }
    
    const option = document.createElement('option');
    option.value = axis.name;
    option.dataset.axisType = axis.type;
    option.dataset.axisIndex = axis.index;
    option.textContent = axis.name;
    select.appendChild(option);
  });
  
  item.appendChild(label);
  item.appendChild(select);
  
  return item;
}

// Setup validation for duplicate selection
function setupAxisValidation(dimension) {
  const selects = document.querySelectorAll('.axis-select');
  
  selects.forEach(select => {
    select.addEventListener('change', () => {
      validateAxisSelection();
      updateSelectOptions();
    });
  });
}

// Validate that no duplicates are selected
function validateAxisSelection() {
  const selects = document.querySelectorAll('.axis-select');
  const selectedValues = Array.from(selects)
    .map(s => s.value)
    .filter(v => v !== '');
  
  const hasDuplicates = selectedValues.length !== new Set(selectedValues).size;
  
  if (hasDuplicates) {
    // Optionally show warning
    console.warn('Duplicate axis selection detected');
  }
  
  return !hasDuplicates;
}

// Update options to show which are already selected
function updateSelectOptions() {
  const selects = document.querySelectorAll('.axis-select');
  const selectedValues = new Set();
  
  // Collect all selected values
  selects.forEach(select => {
    if (select.value) {
      selectedValues.add(select.value);
    }
  });
  
  // Update each select's options
  selects.forEach(select => {
    const currentValue = select.value;
    
    Array.from(select.options).forEach(option => {
      if (option.value && option.value !== currentValue) {
        // Disable if already selected elsewhere
        option.disabled = selectedValues.has(option.value);
        if (option.disabled) {
          option.textContent = `${option.value} (선택됨)`;
        } else {
          option.textContent = option.value;
        }
      }
    });
  });
}