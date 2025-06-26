// graph_UI/graph_generator/graph_gen.js
// 그래프 생성 메인 함수 - 완전 수정 버전

import { createDatasetCard } from './DatasetCard.js';
import { prepareDataForVisualization } from './utils/DataUtils.js';
import { graphInstances, graphConfigs, originalData } from '../../graph_complete.js';

let graphCounter = 0;

export function createGraphFromSelection(selection) {
  const { dimension, axes, originalData: passedData } = selection;
  
  // Generate unique graph ID
  const graphId = `graph-${Date.now()}-${graphCounter++}`;
  
  // Determine visualization types based on dimension and axes
  const visualizationTypes = getVisualizationTypes(dimension, axes);
  
  // Create dataset configuration
  const dataset = {
    id: graphId,
    name: generateDatasetName(dimension, axes),
    dimension: dimension,
    axes: axes,
    visualizationTypes: visualizationTypes,
    dataType: getDataType(dimension, axes)
  };
  
  // Store configuration
  graphConfigs[graphId] = {
    dataset: dataset,
    currentVizIndex: 0,
    filters: {},
    window: null,
    scalingConfig: { type: 'default', params: {} },
    colorScalingConfig: { type: 'default' },
    vizOptions: {}
  };
  
  // 글로벌 객체와 동기화
  if (typeof window !== 'undefined') {
    window.graphConfigs = window.graphConfigs || {};
    window.graphConfigs[graphId] = graphConfigs[graphId];
  }
  
  // Create and add dataset card to DOM
  const container = document.getElementById('graphs-container');
  const card = createDatasetCard(dataset, graphId, passedData || originalData);
  container.appendChild(card);
  
  // Create initial chart with longer delay to ensure DOM is ready
  setTimeout(() => {
    createChart(graphId, 0);
  }, 300);
  
  console.log(`📊 Graph ${graphId} created with dataset:`, dataset);
}

// Determine available visualization types
function getVisualizationTypes(dimension, axes) {
  const hasString = axes.some(a => a.type === 'string');
  
  switch (dimension) {
    case 1:
      if (axes[0].type === 'string') {
        return [{ name: '카테고리', type: 'category' }];
      }
      return [{ name: '수직선', type: 'line1d' }];
      
    case 2:
      if (hasString) {
        return [
          { name: '막대-크기', type: 'bar_size' },
          { name: '막대-색상', type: 'bar_color' },
          { name: '막대그래프', type: 'bar' }
        ];
      }
      return [
        { name: '크기', type: 'size' },
        { name: '색상', type: 'color' },
        { name: '산점도', type: 'scatter' }
      ];
      
    case 3:
      if (hasString) {
        return [
          { name: '막대-크기', type: 'grouped_bar_size' },
          { name: '그룹막대', type: 'grouped_bar' },
          { name: '막대-색상', type: 'grouped_bar_color' }
        ];
      }
      return [
        { name: '크기+색상', type: 'size_color' },
        { name: '산점도+크기', type: 'scatter_size' },
        { name: '산점도+색상', type: 'scatter_color' }
      ];
      
    case 4:
      if (hasString) {
        return [
          { name: '그룹산점도+크기+색상', type: 'grouped_scatter_size_color' }
        ];
      }
      return [
        { name: '산점도+크기+색상', type: 'scatter_size_color' }
      ];
      
    default:
      return [];
  }
}

// Generate dataset name
function generateDatasetName(dimension, axes) {
  const axisNames = axes.map(a => a.name).join(', ');
  return `${dimension}D - ${axisNames}`;
}

// Get data type string
function getDataType(dimension, axes) {
  const hasString = axes.some(a => a.type === 'string');
  return hasString ? `${dimension}D-String` : `${dimension}D`;
}

// ✅ 완전히 재작성된 차트 생성 함수
export function createChart(graphId, vizTypeIndex) {
  console.log(`🔧 createChart 시작: ${graphId}, vizIndex: ${vizTypeIndex}`);
  
  // 1. 설정과 데이터 소스 확인
  const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
  const dataSource = originalData || window.originalData;
  
  if (!config) {
    console.error(`❌ Config not found for ${graphId}`);
    console.error('Available configs:', Object.keys(graphConfigs));
    return;
  }
  
  if (!dataSource) {
    console.error(`❌ Data source not available`);
    console.error('originalData:', originalData);
    console.error('window.originalData:', window.originalData);
    return;
  }
  
  // 2. 캔버스 요소 확인
  const canvas = document.getElementById(`chart-${graphId}`);
  if (!canvas) {
    console.error(`❌ Canvas element not found: chart-${graphId}`);
    return;
  }
  
  console.log(`✅ Canvas found:`, canvas);
  
  // 3. 기존 차트 인스턴스 완전 제거
  const existingInstance = graphInstances[graphId] || (window.graphInstances && window.graphInstances[graphId]);
  if (existingInstance) {
    console.log(`🗑️ Destroying existing chart instance`);
    try {
      existingInstance.destroy();
    } catch (error) {
      console.warn(`Warning destroying chart:`, error);
    }
    delete graphInstances[graphId];
    if (window.graphInstances) {
      delete window.graphInstances[graphId];
    }
  }
  
  // 4. 캔버스 완전 초기화
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 캔버스 크기 재설정
  canvas.style.width = '100%';
  canvas.style.height = '300px';
  canvas.width = canvas.offsetWidth || 400;
  canvas.height = 300;
  
  console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`);
  
  // 5. 데이터셋과 시각화 타입 확인
  const dataset = config.dataset;
  const vizType = dataset.visualizationTypes[vizTypeIndex];
  
  console.log(`📊 Dataset:`, dataset);
  console.log(`🎨 Visualization type:`, vizType);
  
  try {
    // 6. 데이터 준비
    console.log(`📈 Preparing data...`);
    const preparedData = prepareDataForVisualization(
      dataset,
      dataSource,
      config.filters || {},
      config.window
    );
    
    console.log(`📋 Prepared data: ${preparedData.length} points`);
    if (preparedData.length > 0) {
      console.log(`📋 Sample data point:`, preparedData[0]);
      console.log(`📋 Available keys:`, Object.keys(preparedData[0]));
    } else {
      console.warn(`⚠️ No data points prepared!`);
    }
    
    // 7. 차트 팩토리 import 및 시각화 생성
    console.log(`🏭 Importing chart factory...`);
    import('../../visualizations/chart_factory.js').then(module => {
      console.log(`✅ Chart factory imported`);
      
      try {
        console.log(`🎨 Creating visualization...`);
        const chartConfig = module.createVisualization(
          dataset,
          vizType,
          preparedData,
          config.scalingConfig || { type: 'default', params: {} },
          config.colorScalingConfig || { type: 'default' },
          config.vizOptions || {}
        );
        
        console.log(`📊 Chart config created:`, chartConfig);
        
        // 8. Chart.js 인스턴스 생성
        console.log(`⚙️ Creating Chart.js instance...`);
        const chartInstance = new Chart(canvas, chartConfig);
        
        // 9. 인스턴스 저장
        graphInstances[graphId] = chartInstance;
        if (typeof window !== 'undefined') {
          window.graphInstances = window.graphInstances || {};
          window.graphInstances[graphId] = chartInstance;
        }
        
        // 10. 설정 업데이트
        config.currentVizIndex = vizTypeIndex;
        
        console.log(`✅ Chart ${graphId} created successfully!`);
        console.log(`📊 Chart instance:`, chartInstance);
        
      } catch (error) {
        console.error(`❌ Chart creation failed:`, error);
        console.error(`Error stack:`, error.stack);
        
        // 오류 메시지 표시
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center; background: #fee;';
        errorDiv.textContent = `차트 생성 실패: ${error.message}`;
        
        const container = canvas.parentElement;
        container.innerHTML = '';
        container.appendChild(errorDiv);
      }
      
    }).catch(error => {
      console.error(`❌ Chart factory import failed:`, error);
      console.error(`Import error stack:`, error.stack);
      
      // Import 오류 메시지 표시
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center; background: #fee;';
      errorDiv.textContent = `모듈 로딩 실패: ${error.message}`;
      
      const container = canvas.parentElement;
      container.innerHTML = '';
      container.appendChild(errorDiv);
    });
    
  } catch (error) {
    console.error(`❌ Data preparation failed:`, error);
    console.error(`Data error stack:`, error.stack);
    
    // 데이터 준비 오류 메시지 표시
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center; background: #fee;';
    errorDiv.textContent = `데이터 준비 실패: ${error.message}`;
    
    const container = canvas.parentElement;
    container.innerHTML = '';
    container.appendChild(errorDiv);
  }
}

// Update chart when options change
export function updateChart(graphId) {
  const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
  if (!config) {
    console.error(`❌ Cannot update chart ${graphId}: config not found`);
    return;
  }
  
  console.log(`🔄 Updating chart ${graphId} with vizIndex ${config.currentVizIndex}`);
  createChart(graphId, config.currentVizIndex);
}