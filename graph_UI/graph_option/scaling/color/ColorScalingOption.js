// graph_UI/graph_option/scaling/color/ColorScalingOption.js
// 색상 스케일링 옵션 UI

export function createColorScalingOption(graphId, onColorChange) {
  const section = document.createElement('div');
  section.className = 'color-scaling-section option-section';
  section.style.marginTop = '5px';
  
  // Collapsible header
  const header = document.createElement('div');
  header.className = 'color-scaling-header';
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
  title.textContent = '고급 색상 스케일링 옵션';
  title.style.fontWeight = 'bold';
  
  header.appendChild(arrow);
  header.appendChild(title);
  
  // Controls container
  const controls = document.createElement('div');
  controls.className = 'color-scaling-controls';
  controls.style.display = 'none';
  controls.style.cssText = 'padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa;';
  
  // Toggle functionality
  let isExpanded = false;
  header.onclick = () => {
    isExpanded = !isExpanded;
    controls.style.display = isExpanded ? 'block' : 'none';
    arrow.style.transform = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
  };
  
  // Color gradient info
  const gradientInfo = document.createElement('div');
  gradientInfo.style.marginBottom = '15px';
  
  const gradientLabel = document.createElement('div');
  gradientLabel.textContent = '색상 그라디언트:';
  gradientLabel.style.cssText = 'font-weight: bold; margin-bottom: 8px;';
  
  const gradientBar = document.createElement('div');
  gradientBar.style.cssText = `
    height: 20px;
    background: linear-gradient(to right, #00008B, #ADD8E6, #FFB6C1, #DC143C);
    border-radius: 10px;
    border: 1px solid #ccc;
    margin-bottom: 5px;
  `;
  
  const gradientLabels = document.createElement('div');
  gradientLabels.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; color: #666;';
  gradientLabels.innerHTML = '<span>최솟값 (진한 파랑)</span><span>최댓값 (강한 빨강)</span>';
  
  gradientInfo.appendChild(gradientLabel);
  gradientInfo.appendChild(gradientBar);
  gradientInfo.appendChild(gradientLabels);
  controls.appendChild(gradientInfo);
  
  // Apply and Reset buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;';
  
  const resetButton = document.createElement('button');
  resetButton.textContent = '기본값으로 재설정';
  resetButton.style.cssText = `
    padding: 6px 12px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  const applyButton = document.createElement('button');
  applyButton.textContent = '적용';
  applyButton.style.cssText = `
    padding: 6px 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  // Button events
  resetButton.onclick = () => {
    onColorChange({ type: 'default' });
  };
  
  applyButton.onclick = () => {
    onColorChange({ type: 'default' });
  };
  
  buttonContainer.appendChild(resetButton);
  buttonContainer.appendChild(applyButton);
  controls.appendChild(buttonContainer);
  
  section.appendChild(header);
  section.appendChild(controls);
  
  return section;
}