// visualizations/chart_factory.js
// 차트 생성 팩토리 함수

// Import chart functions
import { create1DLineChart, createCategoryChart } from './charts/1dim/line_chart.js';
import { createSizeChart, createColorChart, createScatterChart } from './charts/2dim/2dimchart_double.js';
import { createBarSizeChart, createBarColorChart, createBarChart } from './charts/2dim/2dimchart_string.js';
import { createSizeColorChart, createScatterSizeChart, createScatterColorChart } from './charts/3dim/3dimchart_double.js';
import { createGroupedBarSizeChart, createGroupedBarChart, createGroupedBarColorChart } from './charts/3dim/3dimchart_string.js';
import { createScatterSizeColorChart } from './charts/4dim/4dimchart_double.js';
import { createGroupedScatterSizeColorChart } from './charts/4dim/4dimchart_string.js';

export function createVisualization(dataset, vizType, data, scalingConfig = {}, colorScalingConfig = {}, vizOptions = {}) {
  // Pass data directly without additional processing
  // Data should already be prepared by graph_generator
  
  switch (vizType.type) {
    // 1D visualizations
    case 'line1d':
      return create1DLineChart(data, dataset);
    case 'category':
      return createCategoryChart(data, dataset);
      
    // 2D visualizations
    case 'size':
      return createSizeChart(data, dataset, scalingConfig);
    case 'color':
      return createColorChart(data, dataset, colorScalingConfig);
    case 'scatter':
      return createScatterChart(data, dataset);
      
    // 2D String visualizations
    case 'bar_size':
      return createBarSizeChart(data, dataset, scalingConfig);
    case 'bar_color':
      return createBarColorChart(data, dataset, colorScalingConfig);
    case 'bar':
      return createBarChart(data, dataset);
      
    // 3D visualizations
    case 'size_color':
      return createSizeColorChart(data, dataset, scalingConfig, colorScalingConfig);
    case 'scatter_size':
      return createScatterSizeChart(data, dataset, scalingConfig);
    case 'scatter_color':
      return createScatterColorChart(data, dataset, colorScalingConfig);
      
    // 3D String visualizations
    case 'grouped_bar_size':
      return createGroupedBarSizeChart(data, dataset, scalingConfig);
    case 'grouped_bar':
      return createGroupedBarChart(data, dataset);
    case 'grouped_bar_color':
      return createGroupedBarColorChart(data, dataset, colorScalingConfig);
      
    // 4D visualizations
    case 'scatter_size_color':
      return createScatterSizeColorChart(data, dataset, scalingConfig, colorScalingConfig);
      
    // 4D String visualizations
    case 'grouped_scatter_size_color':
      return createGroupedScatterSizeColorChart(data, dataset, scalingConfig, colorScalingConfig);
      
    default:
      throw new Error(`Unknown visualization type: ${vizType.type}`);
  }
}