// graph_UI/graph_generator/DatasetCard.js
// 데이터셋 카드 생성 (삭제 버튼 포함) - 수정된 버전

import { createChart } from './graph_gen.js';
import { removeGraph } from '../../graph_complete.js';

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
  // ✅ 캔버스 스타일 명시적 설정
  canvas.style.width = '100%';
  canvas.style.height = '300px';
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
  
  // ✅ 수정: 옵션 초기화를 더 안전하게 처리
  setTimeout(() => {
    try {
      // 동적 import로 옵션 관리자 로드
      import('../graph_option/graph_option_manager.js').then(module => {
        const { graphOptionManager } = module;
        graphOptionManager.initializeOptions(graphId, dataset, originalData);
        console.log(`⚙️ Options initialized for ${graphId}`);
      }).catch(error => {
        console.warn(`⚠️ Failed to load option manager for ${graphId}:`, error);
        // 옵션 관리자 로딩 실패해도 기본 기능은 작동하도록
      });
    } catch (error) {
      console.warn(`⚠️ Error initializing options for ${graphId}:`, error);
    }
  }, 100);
  
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
  
  console.log(`🔄 Switching ${graphId} to visualization ${vizTypeIndex}`);
  
  // Update visualization
  createChart(graphId, vizTypeIndex);
  
  // ✅ 수정: 옵션 업데이트를 더 안전하게 처리
  setTimeout(() => {
    try {
      import('../graph_option/graph_option_manager.js').then(module => {
        const { graphOptionManager } = module;
        graphOptionManager.onVisualizationChange(graphId, vizTypeIndex);
      }).catch(error => {
        console.warn(`⚠️ Failed to update options for ${graphId}:`, error);
      });
    } catch (error) {
      console.warn(`⚠️ Error updating options for ${graphId}:`, error);
    }
  }, 50);
}