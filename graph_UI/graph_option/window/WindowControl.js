// graph_UI/graph_option/window/WindowControl.js
// 개별 윈도우 컨트롤 UI

export function createWindowControl(axis, graphId, axisState, onWindowChange) {
  const control = document.createElement('div');
  control.className = 'axis-window-control';
  control.style.cssText = 'margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: white;';
  
  const label = document.createElement('div');
  label.textContent = `${axis.name}축`;
  label.style.cssText = 'font-weight: bold; font-size: 12px; margin-bottom: 5px;';
  control.appendChild(label);
  
  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; align-items: center; gap: 3px;';
  
  // Move left button
  const leftMoveBtn = createButton('<', () => {
    axisState.startValue -= axisState.stepSize;
    axisState.endValue -= axisState.stepSize;
    updateDisplay();
    onWindowChange();
  });
  
  // Shrink button
  const shrinkBtn = createButton('-', () => {
    const newEnd = axisState.endValue - axisState.stepSize;
    if (newEnd > axisState.startValue) {
      axisState.endValue = newEnd;
      axisState.windowSize = axisState.endValue - axisState.startValue;
      updateDisplay();
      onWindowChange();
    } else {
      alert('윈도우 크기를 더 줄일 수 없습니다.');
    }
  });
  
  // Step input
  const stepInput = document.createElement('input');
  stepInput.type = 'number';
  stepInput.value = axisState.stepSize;
  stepInput.min = '0.1';
  stepInput.step = 'any';
  stepInput.style.cssText = 'width: 60px; padding: 2px 4px; text-align: center; border: 1px solid #ccc; border-radius: 3px; font-size: 11px;';
  stepInput.onchange = () => {
    const newStep = parseFloat(stepInput.value);
    if (newStep > 0) {
      axisState.stepSize = newStep;
    } else {
      stepInput.value = axisState.stepSize;
    }
  };
  
  // Expand button
  const expandBtn = createButton('+', () => {
    axisState.endValue += axisState.stepSize;
    axisState.windowSize = axisState.endValue - axisState.startValue;
    updateDisplay();
    onWindowChange();
  });
  
  // Move right button
  const rightMoveBtn = createButton('>', () => {
    axisState.startValue += axisState.stepSize;
    axisState.endValue += axisState.stepSize;
    updateDisplay();
    onWindowChange();
  });
  
  buttonContainer.appendChild(leftMoveBtn);
  buttonContainer.appendChild(shrinkBtn);
  buttonContainer.appendChild(stepInput);
  buttonContainer.appendChild(expandBtn);
  buttonContainer.appendChild(rightMoveBtn);
  control.appendChild(buttonContainer);
  
  // Range input container
  const rangeInputContainer = document.createElement('div');
  rangeInputContainer.style.cssText = 'display: flex; align-items: center; gap: 5px; margin-top: 5px; font-size: 11px;';
  
  const rangeLabel = document.createElement('span');
  rangeLabel.textContent = '범위:';
  rangeLabel.style.minWidth = '35px';
  
  const startInput = createRangeInput(axisState.startValue);
  const separator = document.createElement('span');
  separator.textContent = '~';
  separator.style.padding = '0 3px';
  const endInput = createRangeInput(axisState.endValue);
  
  // Range input change handler
  const updateRange = () => {
    const start = parseFloat(startInput.value);
    const end = parseFloat(endInput.value);
    
    if (!isNaN(start) && !isNaN(end) && start < end) {
      axisState.startValue = start;
      axisState.endValue = end;
      axisState.windowSize = end - start;
      updateInfo();
      onWindowChange();
    } else {
      startInput.value = axisState.startValue.toFixed(2);
      endInput.value = axisState.endValue.toFixed(2);
      alert('시작값은 끝값보다 작아야 합니다.');
    }
  };
  
  startInput.onchange = updateRange;
  endInput.onchange = updateRange;
  
  rangeInputContainer.appendChild(rangeLabel);
  rangeInputContainer.appendChild(startInput);
  rangeInputContainer.appendChild(separator);
  rangeInputContainer.appendChild(endInput);
  control.appendChild(rangeInputContainer);
  
  // Window info
  const infoDiv = document.createElement('div');
  infoDiv.className = 'window-info';
  infoDiv.style.cssText = 'font-size: 10px; color: #666; margin-top: 3px; text-align: center;';
  
  // Update functions
  const updateDisplay = () => {
    startInput.value = axisState.startValue.toFixed(2);
    endInput.value = axisState.endValue.toFixed(2);
    updateInfo();
  };
  
  const updateInfo = () => {
    infoDiv.textContent = `윈도우 크기: ${axisState.windowSize.toFixed(2)}`;
  };
  
  updateInfo();
  control.appendChild(infoDiv);
  
  return control;
}

// Helper function to create buttons
function createButton(text, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = 'padding: 3px 8px; font-size: 11px; border: 1px solid #ccc; background: white; cursor: pointer; border-radius: 3px; min-width: 24px;';
  btn.onmouseover = () => btn.style.background = '#f0f0f0';
  btn.onmouseout = () => btn.style.background = 'white';
  btn.onclick = onClick;
  return btn;
}

// Helper function to create range inputs
function createRangeInput(value) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = value.toFixed(2);
  input.step = 'any';
  input.style.cssText = 'width: 65px; padding: 2px 4px; text-align: center; border: 1px solid #ccc; border-radius: 3px; font-size: 11px;';
  return input;
}