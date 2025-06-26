// graph_UI/graph_generator/graph_gen.js
// 그래프 생성 메인 함수

import { createDatasetCard } from './DatasetCard.js';
import { prepareDataForVisualization } from './utils/DataUtils.js';
import { graphInstances, graphConfigs } from '../../graph_complete.js';

let graphCounter = 0;

export function createGraphFromSelection(selection) {
  const { dimension, axes, originalData } = selection;
  
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
  
  // Create and add dataset card to DOM
  const container = document.getElementById('graphs-container');
  const card = createDatasetCard(dataset, graphId, originalData);
  container.appendChild(card);
  
  // Create initial chart
  setTimeout(() => {
    createChart(graphId, 0);
  }, 100);
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

// Create chart with Chart.js
export function createChart(graphId, vizTypeIndex) {
  const config = graphConfigs[graphId];
  const dataset = config.dataset;
  const vizType = dataset.visualizationTypes[vizTypeIndex];
  const canvas = document.getElementById(`chart-${graphId}`);
  
  // Destroy existing chart
  if (graphInstances[graphId]) {
    graphInstances[graphId].destroy();
  }
  
  try {
    // Prepare data for visualization
    const preparedData = prepareDataForVisualization(
      dataset,
      window.originalData,
      config.filters,
      config.window
    );
    
    // Import and create visualization
    import('../../visualizations/chart_factory.js').then(module => {
      const chartConfig = module.createVisualization(
        dataset,
        vizType,
        preparedData,
        config.scalingConfig,
        config.colorScalingConfig,
        config.vizOptions || {}
      );
      
      // Apply any vizOptions to chart config
      if (config.vizOptions) {
        applyVizOptions(chartConfig, config.vizOptions);
      }
      
      graphInstances[graphId] = new Chart(canvas, chartConfig);
      config.currentVizIndex = vizTypeIndex;
    });
    
  } catch (error) {
    console.error(`Chart creation error for ${graphId}:`, error);
    canvas.parentElement.innerHTML = `<div class="error">차트 생성 실패: ${error.message}</div>`;
  }
}

// Update chart when options change
export function updateChart(graphId) {
  const config = graphConfigs[graphId];
  createChart(graphId, config.currentVizIndex);
}

// Apply visualization options to chart config
function applyVizOptions(chartConfig, vizOptions) {
  // Apply point style for scatter plots
  if (vizOptions.pointStyle && chartConfig.data.datasets) {
    chartConfig.data.datasets.forEach(dataset => {
      dataset.pointStyle = vizOptions.pointStyle;
    });
  }
  
  // Apply bar width for bar charts
  if (vizOptions.barPercentage && chartConfig.type === 'bar') {
    if (!chartConfig.options.datasets) {
      chartConfig.options.datasets = {};
    }
    if (!chartConfig.options.datasets.bar) {
      chartConfig.options.datasets.bar = {};
    }
    chartConfig.options.datasets.bar.barPercentage = vizOptions.barPercentage;
  }
  
  // Add more option applications as needed
}