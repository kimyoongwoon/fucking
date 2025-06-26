// graph_UI/graph_option/graph_option_manager.js
// 그래프 옵션 통합 관리 - 수정된 버전

import { createVisualizationTypeOption } from './visualization_type/VisualizationTypeOption.js';
import { createDataFilterOption } from './data_filter/DataFilterOption.js';
import { createWindowOption } from './window/WindowOption.js';
import { createSizeScalingOption } from './scaling/size/SizeScalingOption.js';
import { createColorScalingOption } from './scaling/color/ColorScalingOption.js';
import { updateChart } from '../graph_generator/graph_gen.js';
import { graphConfigs, originalData } from '../../graph_complete.js'; // ✅ originalData import 추가
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
    
    console.log(`Initializing options for ${graphId}, vizType: ${currentVizType.type}, dataset:`, dataset); // ✅ 디버깅 로그
    
    // Get used axes for current visualization
    const usedAxes = this.getUsedAxesForVisualization(dataset, currentVizType);
    const unusedAxes = this.getUnusedAxes(dataset, originalData);
    
    console.log(`Used axes:`, usedAxes); // ✅ 디버깅 로그
    console.log(`Unused axes:`, unusedAxes); // ✅ 디버깅 로그
    
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
  
  // ✅ 수정: Get axes used by current visualization
  getUsedAxesForVisualization(dataset, vizType) {
    // 시각화 타입별 사용 축 매핑
    const axisMap = {
      // 1D
      'line1d': ['position0'], // 첫 번째 축만 위치용으로 사용
      'category': [], // 카테고리는 위치축 없음 (string 축 사용)
      
      // 2D  
      'size': ['position0'], // x축만 위치용, 나머지는 크기용
      'color': ['position0'], // x축만 위치용, 나머지는 색상용
      'scatter': ['position0', 'position1'], // x, y 모두 위치용
      
      // 2D String
      'bar_size': ['position0'], // 숫자 축만 위치용 (string 축 제외)
      'bar_color': ['position0'], // 숫자 축만 위치용
      'bar': ['position0'], // 첫 번째 숫자 축만 위치용
      
      // 3D
      'size_color': ['position0'], // x축만 위치용
      'scatter_size': ['position0', 'position1'], // x, y 위치용
      'scatter_color': ['position0', 'position1'], // x, y 위치용
      
      // 3D String
      'grouped_bar_size': ['position0'], // 숫자 축들 중 첫 번째만 위치용
      'grouped_bar': ['position0'], // 첫 번째 숫자 축만 위치용
      'grouped_bar_color': ['position0'], // 첫 번째 숫자 축만 위치용
      
      // 4D
      'scatter_size_color': ['position0', 'position1'], // x, y 위치용
      
      // 4D String
      'grouped_scatter_size_color': ['position0', 'position1'] // 숫자 축들 중 처음 두 개 위치용
    };
    
    const roles = axisMap[vizType.type] || [];
    const usedAxes = [];
    
    // ✅ 수정: 숫자 축들만 필터링해서 순서대로 매핑
    const numericAxes = dataset.axes.filter(axis => axis.type !== 'string');
    
    roles.forEach((role, index) => {
      if (numericAxes[index]) {
        usedAxes.push(numericAxes[index]);
      }
    });
    
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