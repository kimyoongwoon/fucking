// graph_UI/graph_option/graph_option_manager.js
// 그래프 옵션 통합 관리

import { createVisualizationTypeOption } from './visualization_type/VisualizationTypeOption.js';
import { createDataFilterOption } from './data_filter/DataFilterOption.js';
import { createWindowOption } from './window/WindowOption.js';
import { createSizeScalingOption } from './scaling/size/SizeScalingOption.js';
import { createColorScalingOption } from './scaling/color/ColorScalingOption.js';
import { updateChart } from '../graph_generator/graph_gen.js';
import { graphConfigs } from '../../graph_complete.js';
import { getAxisRange, findOriginalAxisInfo } from '../graph_generator/utils/DataUtils.js';

class GraphOptionManager {
  constructor() {
    this.originalData = null;
  }
  
  // Initialize all options for a graph
  initializeOptions(graphId, dataset, originalData) {
    this.originalData = originalData;
    const container = document.getElementById(`options-${graphId}`);
    container.innerHTML = '';
    
    const config = graphConfigs[graphId];
    const currentVizType = dataset.visualizationTypes[config.currentVizIndex];
    
    // Get used axes for current visualization
    const usedAxes = this.getUsedAxesForVisualization(dataset, currentVizType);
    const unusedAxes = this.getUnusedAxes(dataset, originalData);
    
    // 0. Visualization Type Option (if applicable)
    const vizTypeOption = createVisualizationTypeOption(
      graphId,
      currentVizType.type,
      (options) => this.onVisualizationOptionsChange(graphId, options)
    );
    if (vizTypeOption && vizTypeOption.style.display !== 'none') {
      container.appendChild(vizTypeOption);
    }
    
    // 1. Data Filter Option (for unused axes)
    if (unusedAxes.length > 0) {
      const filterOption = createDataFilterOption(
        graphId,
        unusedAxes,
        (filters) => this.onFilterChange(graphId, filters)
      );
      if (filterOption) container.appendChild(filterOption);
    }
    
    // 2. Window Option (for used axes)
    if (usedAxes.length > 0) {
      const windowOption = createWindowOption(
        graphId,
        usedAxes,
        originalData,
        (window) => this.onWindowChange(graphId, window)
      );
      if (windowOption) container.appendChild(windowOption);
    }
    
    // 3. Size Scaling Option (if visualization has size encoding)
    if (this.hasOption(currentVizType.type, 'size')) {
      const sizeOption = createSizeScalingOption(
        graphId,
        (scalingConfig) => this.onSizeScalingChange(graphId, scalingConfig)
      );
      if (sizeOption) container.appendChild(sizeOption);
    }
    
    // 4. Color Scaling Option (if visualization has color encoding)
    if (this.hasOption(currentVizType.type, 'color')) {
      const colorOption = createColorScalingOption(
        graphId,
        (colorConfig) => this.onColorScalingChange(graphId, colorConfig)
      );
      if (colorOption) container.appendChild(colorOption);
    }
  }
  
  // Called when visualization type changes
  onVisualizationChange(graphId, vizTypeIndex) {
    const config = graphConfigs[graphId];
    const dataset = config.dataset;
    
    // Re-initialize options for new visualization type
    this.initializeOptions(graphId, dataset, this.originalData);
  }
  
  // Get axes used by current visualization
  getUsedAxesForVisualization(dataset, vizType) {
    const axisMap = {
      'line1d': ['x'],
      'category': [],
      'size': ['x'],
      'color': ['x'],
      'scatter': ['x', 'y'],
      'bar_size': ['x'],
      'bar_color': ['x'],
      'bar': ['x', 'y'],
      'size_color': ['x'],
      'scatter_size': ['x', 'y'],
      'scatter_color': ['x', 'y'],
      'grouped_bar_size': ['x', 'y'],
      'grouped_bar': ['x', 'y'],
      'grouped_bar_color': ['x', 'y'],
      'scatter_size_color': ['x', 'y'],
      'grouped_scatter_size_color': ['x', 'y']
    };
    
    const roles = axisMap[vizType.type] || [];
    const usedAxes = [];
    
    if (roles.includes('x') && dataset.axes[0] && dataset.axes[0].type !== 'string') {
      usedAxes.push(dataset.axes[0]);
    }
    if (roles.includes('y') && dataset.axes[1] && dataset.axes[1].type !== 'string') {
      usedAxes.push(dataset.axes[1]);
    }
    
    return usedAxes;
  }
  
  // Get unused axes (for filtering)
  getUnusedAxes(dataset, originalData) {
    const usedAxeNames = dataset.axes.map(a => a.name);
    const allAxes = [];
    
    // Get all available axes from original data
    if (originalData.basic_data && originalData.basic_data.axes) {
      originalData.basic_data.axes.forEach((axis, index) => {
        if (!usedAxeNames.includes(axis.name)) {
          allAxes.push({
            name: axis.name,
            type: 'input',
            index: index
          });
        }
      });
    }
    
    // Add output axes if not used
    const firstData = originalData.data_value[0];
    if (firstData) {
      const value = firstData[1];
      let outputCount = 1;
      
      if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          outputCount = value[1].length;
        } else {
          outputCount = value.length;
        }
      }
      
      for (let i = 0; i < outputCount; i++) {
        const yName = `Y${i}`;
        if (!usedAxeNames.includes(yName)) {
          allAxes.push({
            name: yName,
            type: 'output',
            index: i
          });
        }
      }
    }
    
    // Filter out string type axes from unused
    return allAxes.filter(a => a.type !== 'string');
  }
  
  // Check if visualization has specific option
  hasOption(vizType, option) {
    const optionMap = {
      size: ['size', 'scatter_size', 'size_color', 'scatter_size_color', 'bar_size', 'grouped_bar_size', 'grouped_scatter_size_color'],
      color: ['color', 'size_color', 'scatter_color', 'scatter_size_color', 'bar_color', 'grouped_bar_color', 'grouped_scatter_size_color']
    };
    
    return optionMap[option]?.includes(vizType) || false;
  }
  
  // Option change handlers
  onFilterChange(graphId, filters) {
    graphConfigs[graphId].filters = filters;
    updateChart(graphId);
  }
  
  onWindowChange(graphId, window) {
    graphConfigs[graphId].window = window;
    updateChart(graphId);
  }
  
  onSizeScalingChange(graphId, scalingConfig) {
    graphConfigs[graphId].scalingConfig = scalingConfig;
    updateChart(graphId);
  }
  
  onColorScalingChange(graphId, colorConfig) {
    graphConfigs[graphId].colorScalingConfig = colorConfig;
    updateChart(graphId);
  }
  
  onVisualizationOptionsChange(graphId, options) {
    // Store visualization-specific options
    if (!graphConfigs[graphId].vizOptions) {
      graphConfigs[graphId].vizOptions = {};
    }
    Object.assign(graphConfigs[graphId].vizOptions, options);
    updateChart(graphId);
  }
}

// Export singleton instance
export const graphOptionManager = new GraphOptionManager();