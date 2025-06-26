// graph_UI/graph_option/visualization_type/VisualizationTypeOption.js
// 시각화 타입 변경 옵션 (버튼들로 이미 구현되어 있으므로 추가 옵션 제공)

import { getVisualizationConfig } from './visualization_config.js';

export function createVisualizationTypeOption(graphId, currentVizType, onVizTypeChange) {
  // 현재는 버튼으로 시각화 타입을 변경하므로, 
  // 추가적인 시각화 설정이 필요한 경우 여기에 구현
  
  const section = document.createElement('div');
  section.className = 'viz-type-option option-section';
  section.style.display = 'none'; // 기본적으로 숨김
  
  // 시각화 타입별 추가 설정이 필요한 경우
  const vizConfig = getVisualizationConfig(currentVizType);
  if (vizConfig && vizConfig.hasOptions) {
    section.style.display = 'block';
    
    const title = document.createElement('h4');
    title.textContent = '시각화 옵션';
    section.appendChild(title);
    
    // 예: 산점도의 경우 포인트 스타일 선택
    if (currentVizType === 'scatter' || currentVizType.includes('scatter')) {
      const pointStyleSelect = createPointStyleSelect(graphId, onVizTypeChange);
      section.appendChild(pointStyleSelect);
    }
    
    // 예: 막대그래프의 경우 막대 너비 조정
    if (currentVizType.includes('bar')) {
      const barWidthControl = createBarWidthControl(graphId, onVizTypeChange);
      section.appendChild(barWidthControl);
    }
  }
  
  return section;
}

// 포인트 스타일 선택기
function createPointStyleSelect(graphId, onChange) {
  const container = document.createElement('div');
  container.style.marginBottom = '10px';
  
  const label = document.createElement('label');
  label.textContent = '포인트 스타일: ';
  label.style.fontWeight = 'bold';
  
  const select = document.createElement('select');
  select.style.cssText = 'margin-left: 8px; padding: 4px 8px; border: 1px solid #ccc; border-radius: 3px;';
  
  const styles = [
    { value: 'circle', text: '원형' },
    { value: 'cross', text: '십자' },
    { value: 'crossRot', text: '회전 십자' },
    { value: 'dash', text: '대시' },
    { value: 'line', text: '라인' },
    { value: 'rect', text: '사각형' },
    { value: 'rectRounded', text: '둥근 사각형' },
    { value: 'rectRot', text: '회전 사각형' },
    { value: 'star', text: '별' },
    { value: 'triangle', text: '삼각형' }
  ];
  
  styles.forEach(style => {
    const option = document.createElement('option');
    option.value = style.value;
    option.textContent = style.text;
    select.appendChild(option);
  });
  
  select.onchange = () => {
    onChange({ pointStyle: select.value });
  };
  
  container.appendChild(label);
  container.appendChild(select);
  
  return container;
}

// 막대 너비 컨트롤
function createBarWidthControl(graphId, onChange) {
  const container = document.createElement('div');
  container.style.marginBottom = '10px';
  
  const label = document.createElement('label');
  label.textContent = '막대 너비: ';
  label.style.fontWeight = 'bold';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0.1';
  slider.max = '1.0';
  slider.step = '0.1';
  slider.value = '0.8';
  slider.style.cssText = 'width: 150px; margin-left: 8px;';
  
  const valueSpan = document.createElement('span');
  valueSpan.textContent = '80%';
  valueSpan.style.cssText = 'margin-left: 10px; font-family: monospace;';
  
  slider.oninput = () => {
    const percentage = Math.round(slider.value * 100);
    valueSpan.textContent = `${percentage}%`;
    onChange({ barPercentage: parseFloat(slider.value) });
  };
  
  container.appendChild(label);
  container.appendChild(slider);
  container.appendChild(valueSpan);
  
  return container;
}