// graph_UI/graph_generator/DatasetCard.js
// 데이터셋 카드 생성 (삭제 버튼 포함)

import { createChart } from './graph_gen.js';
import { removeGraph } from '../../graph_complete.js';
import { graphOptionManager } from '../graph_option/graph_option_manager.js';

export function createDatasetCard(dataset, graphId, originalData) {
  const card = document.createElement('div');
  card.className = 'graph-card';
  card.id = graphId;
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = '그래프 삭제';
  deleteBtn.onclick = () => {
    if (confirm('이 그래프를 삭제하시겠습니까?')) {
      removeGraph(graphId);
    }
  };
  card.appendChild(deleteBtn);
  
  // Title
  const title = document.createElement('h3');
  title.textContent = dataset.name;
  card.appendChild(title);
  
  // Visualization type buttons
  const vizButtons = document.createElement('div');
  vizButtons.className = 'viz-buttons';
  
  dataset.visualizationTypes.forEach((vizType, vizIndex) => {
    const button = document.createElement('button');
    button.className = 'viz-button';
    if (vizIndex === 0) button.classList.add('active');
    button.textContent = vizType.name;
    button.onclick = () => switchVisualization(graphId, vizIndex);
    vizButtons.appendChild(button);
  });
  
  card.appendChild(vizButtons);
  
  // Options container
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-container';
  optionsContainer.id = `options-${graphId}`;
  card.appendChild(optionsContainer);
  
  // Chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';
  const canvas = document.createElement('canvas');
  canvas.id = `chart-${graphId}`;
  chartContainer.appendChild(canvas);
  card.appendChild(chartContainer);
  
  // Dataset info
  const info = document.createElement('div');
  info.className = 'dataset-info';
  info.innerHTML = `
    <strong>축 구성:</strong> ${dataset.axes.map(a => a.name).join(', ')}<br>
    <strong>데이터 타입:</strong> ${dataset.dataType}
  `;
  card.appendChild(info);
  
  // Initialize options
  setTimeout(() => {
    graphOptionManager.initializeOptions(graphId, dataset, originalData);
  }, 50);
  
  return card;
}

// Switch visualization type
function switchVisualization(graphId, vizTypeIndex) {
  // Update button states
  const card = document.getElementById(graphId);
  const buttons = card.querySelectorAll('.viz-button');
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === vizTypeIndex);
  });
  
  // Update visualization
  createChart(graphId, vizTypeIndex);
  
  // Update options if needed
  graphOptionManager.onVisualizationChange(graphId, vizTypeIndex);
}