// graph_UI/graph_option/visualization_type/visualization_config.js
// 시각화 타입별 설정 정보

const VISUALIZATION_CONFIGS = {
  // 1D visualizations
  'line1d': {
    name: '수직선',
    hasOptions: false,
    axisRoles: ['x'],
    supportedScaling: []
  },
  'category': {
    name: '카테고리',
    hasOptions: false,
    axisRoles: [],
    supportedScaling: []
  },
  
  // 2D visualizations
  'size': {
    name: '크기',
    hasOptions: false,
    axisRoles: ['x'],
    supportedScaling: ['size']
  },
  'color': {
    name: '색상',
    hasOptions: false,
    axisRoles: ['x'],
    supportedScaling: ['color']
  },
  'scatter': {
    name: '산점도',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: []
  },
  
  // 2D String visualizations
  'bar_size': {
    name: '막대-크기',
    hasOptions: true,
    axisRoles: ['x'],
    supportedScaling: ['size']
  },
  'bar_color': {
    name: '막대-색상',
    hasOptions: true,
    axisRoles: ['x'],
    supportedScaling: ['color']
  },
  'bar': {
    name: '막대그래프',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: []
  },
  
  // 3D visualizations
  'size_color': {
    name: '크기+색상',
    hasOptions: false,
    axisRoles: ['x'],
    supportedScaling: ['size', 'color']
  },
  'scatter_size': {
    name: '산점도+크기',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: ['size']
  },
  'scatter_color': {
    name: '산점도+색상',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: ['color']
  },
  
  // 3D String visualizations
  'grouped_bar_size': {
    name: '막대-크기',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: ['size']
  },
  'grouped_bar': {
    name: '그룹막대',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: []
  },
  'grouped_bar_color': {
    name: '막대-색상',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: ['color']
  },
  
  // 4D visualizations
  'scatter_size_color': {
    name: '산점도+크기+색상',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: ['size', 'color']
  },
  
  // 4D String visualizations
  'grouped_scatter_size_color': {
    name: '그룹산점도+크기+색상',
    hasOptions: true,
    axisRoles: ['x', 'y'],
    supportedScaling: ['size', 'color']
  }
};

// Get configuration for a visualization type
export function getVisualizationConfig(vizType) {
  return VISUALIZATION_CONFIGS[vizType] || null;
}

// Check if visualization supports a specific option
export function supportsOption(vizType, option) {
  const config = VISUALIZATION_CONFIGS[vizType];
  if (!config) return false;
  
  return config.supportedScaling.includes(option);
}

// Get axis roles for visualization
export function getAxisRoles(vizType) {
  const config = VISUALIZATION_CONFIGS[vizType];
  return config ? config.axisRoles : [];
}

// Get all visualization types for a dimension
export function getVisualizationTypesForDimension(dimension, hasString) {
  const types = [];
  
  switch (dimension) {
    case 1:
      if (hasString) {
        types.push('category');
      } else {
        types.push('line1d');
      }
      break;
      
    case 2:
      if (hasString) {
        types.push('bar_size', 'bar_color', 'bar');
      } else {
        types.push('size', 'color', 'scatter');
      }
      break;
      
    case 3:
      if (hasString) {
        types.push('grouped_bar_size', 'grouped_bar', 'grouped_bar_color');
      } else {
        types.push('size_color', 'scatter_size', 'scatter_color');
      }
      break;
      
    case 4:
      if (hasString) {
        types.push('grouped_scatter_size_color');
      } else {
        types.push('scatter_size_color');
      }
      break;
  }
  
  return types.map(type => ({
    type: type,
    ...VISUALIZATION_CONFIGS[type]
  }));
}