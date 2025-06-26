// graph_UI/graph_option/scaling/size/SizeScalingOption.js
// 크기 스케일링 옵션 UI

export function createSizeScalingOption(graphId, onScalingChange) {
  const section = document.createElement('div');
  section.className = 'scaling-section option-section';
  section.style.marginTop = '5px';
  
  // Collapsible header
  const header = document.createElement('div');
  header.className = 'scaling-header';
  header.style.cssText = `
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    margin-bottom: 5px;
    user-select: none;
  `;
  
  const arrow = document.createElement('span');
  arrow.textContent = '▶';
  arrow.style.cssText = 'margin-right: 8px; transition: transform 0.2s; font-size: 12px;';
  
  const title = document.createElement('span');
  title.textContent = '고급 크기 스케일링 옵션';
  title.style.fontWeight = 'bold';
  
  header.appendChild(arrow);
  header.appendChild(title);
  
  // Controls container
  const controls = document.createElement('div');
  controls.className = 'scaling-controls';
  controls.style.display = 'none';
  controls.style.cssText = 'padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa;';
  
  // Toggle functionality
  let isExpanded = false;
  header.onclick = () => {
    isExpanded = !isExpanded;
    controls.style.display = isExpanded ? 'block' : 'none';
    arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
  };
  
  // Scaling type selector
  const typeContainer = document.createElement('div');
  typeContainer.style.marginBottom = '10px';
  
  const typeLabel = document.createElement('label');
  typeLabel.textContent = '스케일링 타입: ';
  typeLabel.style.fontWeight = 'bold';
  
  const typeSelect = document.createElement('select');
  typeSelect.style.cssText = 'margin-left: 8px; padding: 4px 8px; border: 1px solid #ccc; border-radius: 3px;';
  
  const options = [
    { value: 'default', text: '기본 (선형 정규화)' },
    { value: 'linear', text: '선형 변환 (ax + b)' },
    { value: 'sigmoid', text: '시그모이드 (S자 곡선)' }
  ];
  
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text;
    typeSelect.appendChild(option);
  });
  
  typeContainer.appendChild(typeLabel);
  typeContainer.appendChild(typeSelect);
  controls.appendChild(typeContainer);
  
  // Parameter controls container
  const paramContainer = document.createElement('div');
  paramContainer.className = 'param-controls';
  controls.appendChild(paramContainer);
  
  // Apply and Reset buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;';
  
  const resetButton = createButton('기본값으로 재설정', '#6c757d', () => {
    typeSelect.value = 'default';
    updateParameterControls('default');
    onScalingChange({ type: 'default', params: {} });
  });
  
  const applyButton = createButton('적용', '#007bff', () => {
    const config = getCurrentConfig();
    onScalingChange(config);
  });
  
  buttonContainer.appendChild(resetButton);
  buttonContainer.appendChild(applyButton);
  controls.appendChild(buttonContainer);
  
  // Type change event
  typeSelect.onchange = () => {
    updateParameterControls(typeSelect.value);
  };
  
  // Update parameter controls
  const updateParameterControls = (type) => {
    paramContainer.innerHTML = '';
    
    if (type === 'default') {
      paramContainer.innerHTML = '<p style="color: #666; font-style: italic;">기본 스케일링은 추가 매개변수가 필요하지 않습니다.</p>';
    } else if (type === 'linear') {
      paramContainer.appendChild(createSliderControl('a', '기울기 (a)', 1, 0.1, 5.0, 0.1));
      paramContainer.appendChild(createSliderControl('b', '오프셋 (b)', 0, -2.0, 2.0, 0.1));
    } else if (type === 'sigmoid') {
      paramContainer.appendChild(createSliderControl('k', '급경사도 (k)', 1, 0.1, 10.0, 0.1));
      const note = document.createElement('p');
      note.style.cssText = 'color: #666; font-size: 12px; margin-top: 5px; font-style: italic;';
      note.textContent = '※ 중점은 자동으로 데이터 범위의 중간값으로 설정됩니다.';
      paramContainer.appendChild(note);
    }
  };
  
  // Get current configuration
  const getCurrentConfig = () => {
    const type = typeSelect.value;
    const params = {};
    
    if (type === 'linear') {
      const aSlider = paramContainer.querySelector('.param-slider-a');
      const bSlider = paramContainer.querySelector('.param-slider-b');
      if (aSlider) params.a = parseFloat(aSlider.value);
      if (bSlider) params.b = parseFloat(bSlider.value);
    } else if (type === 'sigmoid') {
      const kSlider = paramContainer.querySelector('.param-slider-k');
      if (kSlider) params.k = parseFloat(kSlider.value);
    }
    
    return { type, params };
  };
  
  // Initialize with default
  updateParameterControls('default');
  
  section.appendChild(header);
  section.appendChild(controls);
  
  return section;
}

// Helper function to create buttons
function createButton(text, bgColor, onClick) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = `
    padding: 6px 12px;
    background: ${bgColor};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  btn.onclick = onClick;
  return btn;
}

// Helper function to create slider controls
function createSliderControl(paramName, label, defaultValue, min, max, step) {
  const container = document.createElement('div');
  container.style.marginBottom = '15px';
  
  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 5px;';
  
  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  labelSpan.style.fontWeight = 'bold';
  
  const valueSpan = document.createElement('span');
  valueSpan.className = `param-value-${paramName}`;
  valueSpan.textContent = defaultValue.toFixed(1);
  valueSpan.style.cssText = 'font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 3px;';
  
  labelDiv.appendChild(labelSpan);
  labelDiv.appendChild(valueSpan);
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = `param-slider-${paramName}`;
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = defaultValue;
  slider.style.width = '100%';
  
  slider.oninput = () => {
    valueSpan.textContent = parseFloat(slider.value).toFixed(1);
  };
  
  container.appendChild(labelDiv);
  container.appendChild(slider);
  
  return container;
}