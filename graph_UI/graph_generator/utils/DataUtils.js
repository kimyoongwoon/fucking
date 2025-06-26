// graph_UI/graph_generator/utils/DataUtils.js
// 데이터 가공 및 유틸리티 함수

// Prepare data for visualization by extracting selected axes
export function prepareDataForVisualization(dataset, originalData, filters = {}, window = null) {
  if (!originalData || !originalData.data_value) {
    return [];
  }
  
  // Extract data for selected axes
  const preparedData = originalData.data_value.map((point, index) => {
    const coords = point[0];
    const value = point[1];
    
    const dataPoint = {
      _originalIndex: index,
      _coords: coords,
      _value: value,
      _fullData: formatFullData(coords, value)
    };
    
    // Extract values for each selected axis
    dataset.axes.forEach(axis => {
      if (axis.type === 'input') {
        dataPoint[axis.name] = coords[axis.index];
      } else if (axis.type === 'output') {
        if (Array.isArray(value)) {
          if (typeof value[0] === 'string') {
            // string_double or string_array
            dataPoint[axis.name] = value[1][axis.index];
          } else {
            // array
            dataPoint[axis.name] = value[axis.index];
          }
        } else {
          // double
          dataPoint[axis.name] = value;
        }
      } else if (axis.type === 'string') {
        dataPoint[axis.name] = value[0]; // string value
      }
    });
    
    return dataPoint;
  });
  
  // Apply filters
  let filteredData = applyFilters(preparedData, filters, originalData);
  
  // Apply window if exists
  if (window) {
    filteredData = applyWindow(filteredData, window, dataset);
  }
  
  return filteredData;
}

// Apply filters to data
function applyFilters(data, filters, originalData) {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  return data.filter(dataPoint => {
    for (const axisName in filters) {
      const filter = filters[axisName];
      if (!filter || filter.mode === '모두') continue;
      
      const value = getAxisValue(dataPoint, axisName, originalData);
      if (value === null) continue;
      
      // Apply filter condition
      if (filter.mode === '>=') {
        if (value < filter.value) return false;
      } else if (filter.mode === '=') {
        if (Math.abs(value - filter.value) > 0.0001) return false;
      } else if (filter.mode === '<=') {
        if (value > filter.value) return false;
      }
    }
    
    return true;
  });
}

// Apply window constraints to data
function applyWindow(data, window, dataset) {
  if (!window || !window.axes) return data;
  
  return data.filter(dataPoint => {
    for (const axisName in window.axes) {
      const axisWindow = window.axes[axisName];
      const value = dataPoint[axisName];
      
      if (value !== undefined && 
          (value < axisWindow.startValue || value >= axisWindow.endValue)) {
        return false;
      }
    }
    
    return true;
  });
}

// Get axis value from data point
function getAxisValue(dataPoint, axisName, originalData) {
  // First check if it's already in the prepared data
  if (dataPoint[axisName] !== undefined) {
    return dataPoint[axisName];
  }
  
  // Otherwise, extract from original data
  const axis = findAxisByName(axisName, originalData);
  if (!axis) return null;
  
  if (axis.type === 'input') {
    return dataPoint._coords[axis.index];
  } else if (axis.type === 'output') {
    const val = dataPoint._value;
    if (Array.isArray(val)) {
      if (typeof val[0] === 'string') {
        return val[1][axis.index];
      } else {
        return val[axis.index];
      }
    } else {
      return val;
    }
  }
  
  return null;
}

// Find axis information by name
export function findAxisByName(name, originalData) {
  // Check input axes
  const inputAxes = originalData.basic_data.axes;
  for (let i = 0; i < inputAxes.length; i++) {
    if (inputAxes[i].name === name) {
      return { type: 'input', index: i };
    }
  }
  
  // Check for string axis
  if (name === 'String') {
    return { type: 'string', index: -1 };
  }
  
  // Check output axes (Y0, Y1, ...)
  const match = name.match(/^Y(\d+)$/);
  if (match) {
    return { type: 'output', index: parseInt(match[1]) };
  }
  
  return null;
}

// Format full data for display
export function formatFullData(coords, value) {
  let result = `입력: [${coords.join(', ')}]\n`;
  
  if (Array.isArray(value)) {
    if (typeof value[0] === 'string') {
      result += `출력: "${value[0]}", [${value[1].join(', ')}]`;
    } else {
      result += `출력: [${value.join(', ')}]`;
    }
  } else {
    result += `출력: ${value}`;
  }
  
  return result;
}

// Get min/max range for an axis
export function getAxisRange(axisName, data) {
  const values = data
    .map(d => d[axisName])
    .filter(v => v !== undefined && !isNaN(v));
  
  if (values.length === 0) {
    return { min: 0, max: 100 };
  }
  
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

// Get original axis info from basic_data
export function findOriginalAxisInfo(axisName, originalData) {
  if (!originalData || !originalData.basic_data || !originalData.basic_data.axes) {
    return null;
  }
  
  return originalData.basic_data.axes.find(axis => axis.name === axisName);
}