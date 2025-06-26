// graph_UI/graph_option/graph_option_manager.js
// 그래프 옵션 통합 관리 - 최종 수정 버전

import { createVisualizationTypeOption } from './visualization_type/VisualizationTypeOption.js';
import { createDataFilterOption } from './data_filter/DataFilterOption.js';
import { createWindowOption } from './window/WindowOption.js';
import { createSizeScalingOption } from './scaling/size/SizeScalingOption.js';
import { createColorScalingOption } from './scaling/color/ColorScalingOption.js';
import { updateChart } from '../graph_generator/graph_gen.js';
import { graphConfigs, originalData } from '../../graph_complete.js';
import { getAxisRange, findOriginalAxisInfo } from '../graph_generator/utils/DataUtils.js';

class GraphOptionManager {
  constructor() {
    this.originalData = null;
  }
  
  // Initialize all options for a graph
  initializeOptions(graphId, dataset, originalData) {
    console.log(`⚙️ Initializing options for ${graphId}`);
    
    this.originalData = originalData;
    const container = document.getElementById(`options-${graphId}`);
    
    if (!container) {
      console.error(`❌ Options container not found: options-${graphId}`);
      return;
    }
    
    container.innerHTML = '';
    
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (!config) {
      console.error(`❌ Graph config not found for ${graphId}`);
      return;
    }
    
    const currentVizType = dataset.visualizationTypes[config.currentVizIndex];
    
    console.log(`⚙️ Current viz type: ${currentVizType.type}`);
    console.log(`📊 Dataset axes:`, dataset.axes);
    
    // Get used axes for current visualization
    const usedAxes = this.getUsedAxesForVisualization(dataset, currentVizType);
    const unusedAxes = this.getUnusedAxes(dataset, originalData);
    
    console.log(`✅ Used axes: ${usedAxes.map(a => a.name).join(', ')}`);
    console.log(`🔍 Unused axes: ${unusedAxes.map(a => a.name).join(', ')}`);
    
    // 0. Visualization Type Option (if applicable)
    try {
      const vizTypeOption = createVisualizationTypeOption(
        graphId,
        currentVizType.type,
        (options) => this.onVisualizationOptionsChange(graphId, options)
      );
      if (vizTypeOption && vizTypeOption.style.display !== 'none') {
        container.appendChild(vizTypeOption);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to create visualization type option:`, error);
    }
    
    // 1. Data Filter Option (for unused axes) - 빈 배열일 때 스킵
    if (unusedAxes.length > 0) {
      try {
        const filterOption = createDataFilterOption(
          graphId,
          unusedAxes,
          (filters) => this.onFilterChange(graphId, filters)
        );
        if (filterOption) {
          container.appendChild(filterOption);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create data filter option:`, error);
      }
    } else {
      console.log(`ℹ️ No unused axes, skipping filter option`);
    }
    
    // 2. Window Option (for used axes)
    if (usedAxes.length > 0) {
      try {
        const windowOption = createWindowOption(
          graphId,
          usedAxes,
          originalData,
          (window) => this.onWindowChange(graphId, window)
        );
        if (windowOption) {
          container.appendChild(windowOption);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create window option:`, error);
      }
    } else {
      console.log(`ℹ️ No used axes, skipping window option`);
    }
    
    // 3. Size Scaling Option (if visualization has size encoding)
    if (this.hasOption(currentVizType.type, 'size')) {
      try {
        const sizeOption = createSizeScalingOption(
          graphId,
          (scalingConfig) => this.onSizeScalingChange(graphId, scalingConfig)
        );
        if (sizeOption) {
          container.appendChild(sizeOption);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create size scaling option:`, error);
      }
    }
    
    // 4. Color Scaling Option (if visualization has color encoding)
    if (this.hasOption(currentVizType.type, 'color')) {
      try {
        const colorOption = createColorScalingOption(
          graphId,
          (colorConfig) => this.onColorScalingChange(graphId, colorConfig)
        );
        if (colorOption) {
          container.appendChild(colorOption);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to create color scaling option:`, error);
      }
    }
    
    console.log(`✅ Options initialization completed for ${graphId}`);
  }
  
  // Called when visualization type changes
  onVisualizationChange(graphId, vizTypeIndex) {
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (!config) {
      console.error(`❌ Config not found for visualization change: ${graphId}`);
      return;
    }
    
    const dataset = config.dataset;
    
    // Re-initialize options for new visualization type
    this.initializeOptions(graphId, dataset, this.originalData);
  }
  
  // Get axes used by current visualization
  getUsedAxesForVisualization(dataset, vizType) {
    const axisMap = {
      // 1D
      'line1d': ['position0'],
      'category': [],
      
      // 2D  
      'size': ['position0'],
      'color': ['position0'],
      'scatter': ['position0', 'position1'],
      
      // 2D String
      'bar_size': ['position0'],
      'bar_color': ['position0'],
      'bar': ['position0'],
      
      // 3D
      'size_color': ['position0'],
      'scatter_size': ['position0', 'position1'],
      'scatter_color': ['position0', 'position1'],
      
      // 3D String
      'grouped_bar_size': ['position0'],
      'grouped_bar': ['position0'],
      'grouped_bar_color': ['position0'],
      
      // 4D
      'scatter_size_color': ['position0', 'position1'],
      
      // 4D String
      'grouped_scatter_size_color': ['position0', 'position1']
    };
    
    const roles = axisMap[vizType.type] || [];
    const usedAxes = [];
    
    // 숫자 축들만 필터링해서 순서대로 매핑
    const numericAxes = dataset.axes.filter(axis => axis.type !== 'string');
    
    roles.forEach((role, index) => {
      if (numericAxes[index]) {
        usedAxes.push(numericAxes[index]);
      }
    });
    
    return usedAxes;
  }
  
  // ✅ 완전히 재작성된 사용되지 않는 축 계산
  getUnusedAxes(dataset, originalData) {
    console.log(`🔍 Calculating unused axes...`);
    
    if (!dataset || !dataset.axes) {
      console.warn(`⚠️ Invalid dataset for unused axes calculation`);
      return [];
    }
    
    if (!originalData || !originalData.basic_data) {
      console.warn(`⚠️ Invalid original data for unused axes calculation`);
      return [];
    }
    
    const usedAxeNames = dataset.axes.map(a => a.name);
    const allAxes = [];
    
    console.log(`📋 Currently used axes: ${usedAxeNames.join(', ')}`);
    
    // 1. Input axes from original data
    if (originalData.basic_data.axes) {
      originalData.basic_data.axes.forEach((axis, index) => {
        if (!usedAxeNames.includes(axis.name)) {
          allAxes.push({
            name: axis.name,
            type: 'input',
            index: index
          });
          console.log(`➕ Added unused input axis: ${axis.name}`);
        }
      });
    }
    
    // 2. Output axes - 실제 데이터에서 추출 가능한지 확인
    if (originalData.data_value && originalData.data_value.length > 0) {
      const firstData = originalData.data_value[0];
      const value = firstData[1];
      const valueType = originalData.basic_data.value_type;
      
      console.log(`🔍 Checking output axes for value type: ${valueType}`);
      console.log(`📊 Sample value:`, value);
      
      // Value type별 output 축 개수 계산
      let outputCount = 0;
      if (valueType === 'double') {
        outputCount = 1; // Y0만 존재
      } else if (valueType === 'string_double') {
        outputCount = 1; // Y0만 존재
      } else if (valueType === 'array') {
        outputCount = Array.isArray(value) ? value.length : 0;
      } else if (valueType === 'string_array') {
        outputCount = Array.isArray(value) && Array.isArray(value[1]) ? value[1].length : 0;
      }
      
      console.log(`📊 Calculated output count: ${outputCount}`);
      
      // 실제로 존재하는 output 축만 추가
      for (let i = 0; i < outputCount; i++) {
        const yName = `Y${i}`;
        if (!usedAxeNames.includes(yName)) {
          // 실제 값 추출 테스트
          const testValue = this.testExtractOutputValue(value, i, valueType);
          if (testValue !== null && testValue !== undefined && !isNaN(testValue)) {
            allAxes.push({
              name: yName,
              type: 'output',
              index: i
            });
            console.log(`➕ Added unused output axis: ${yName} (test value: ${testValue})`);
          } else {
            console.log(`➖ Skipped output axis: ${yName} (extraction failed)`);
          }
        }
      }
    }
    
    // 3. String 축 제외 (필터링에 적합하지 않음)
    const filteredAxes = allAxes.filter(a => a.type !== 'string');
    
    console.log(`✅ Final unused axes: ${filteredAxes.map(a => a.name).join(', ')}`);
    
    return filteredAxes;
  }
  
  // ✅ Output 값 추출 테스트 함수
  testExtractOutputValue(value, index, valueType) {
    try {
      if (valueType === 'double') {
        return index === 0 ? value : null;
      } else if (valueType === 'string_double') {
        return index === 0 && Array.isArray(value) && value.length > 1 ? value[1] : null;
      } else if (valueType === 'array') {
        return Array.isArray(value) && value.length > index ? value[index] : null;
      } else if (valueType === 'string_array') {
        return Array.isArray(value) && Array.isArray(value[1]) && value[1].length > index ? value[1][index] : null;
      }
      return null;
    } catch (error) {
      return null;
    }
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
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (config) {
      config.filters = filters;
      updateChart(graphId);
    }
  }
  
  onWindowChange(graphId, window) {
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (config) {
      config.window = window;
      updateChart(graphId);
    }
  }
  
  onSizeScalingChange(graphId, scalingConfig) {
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (config) {
      config.scalingConfig = scalingConfig;
      updateChart(graphId);
    }
  }
  
  onColorScalingChange(graphId, colorConfig) {
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (config) {
      config.colorScalingConfig = colorConfig;
      updateChart(graphId);
    }
  }
  
  onVisualizationOptionsChange(graphId, options) {
    const config = graphConfigs[graphId] || (window.graphConfigs && window.graphConfigs[graphId]);
    if (config) {
      if (!config.vizOptions) {
        config.vizOptions = {};
      }
      Object.assign(config.vizOptions, options);
      updateChart(graphId);
    }
  }
}

// Export singleton instance
export const graphOptionManager = new GraphOptionManager();