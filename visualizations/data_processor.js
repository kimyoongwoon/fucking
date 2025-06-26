// visualizations/data_processor.js
// 시각화를 위한 데이터 처리 (필터링, 변환 등)

/**
 * Process data for visualization
 * This is a simplified version since most processing is done in graph_generator
 */
export function processDataForVisualization(data, vizType, options = {}) {
  if (!data || data.length === 0) {
    return [];
  }
  
  let processedData = [...data];
  
  // Apply any visualization-specific transformations
  switch (vizType) {
    case 'category':
      // Group by category
      processedData = groupByCategory(processedData);
      break;
      
    case 'bar':
    case 'grouped_bar':
      // Aggregate data for bar charts
      processedData = aggregateForBarChart(processedData, options);
      break;
      
    // Add more specific processing as needed
  }
  
  return processedData;
}

// Group data by category
function groupByCategory(data) {
  const grouped = {};
  
  data.forEach(item => {
    const category = item.String || item[Object.keys(item)[0]];
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return Object.entries(grouped).map(([category, items]) => ({
    category,
    count: items.length,
    items
  }));
}

// Aggregate data for bar charts
function aggregateForBarChart(data, options) {
  const { groupBy, aggregateBy, aggregateFunction = 'mean' } = options;
  
  if (!groupBy || !aggregateBy) {
    return data;
  }
  
  const grouped = {};
  
  data.forEach(item => {
    const key = item[groupBy];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item[aggregateBy]);
  });
  
  return Object.entries(grouped).map(([key, values]) => ({
    [groupBy]: key,
    [aggregateBy]: aggregate(values, aggregateFunction),
    count: values.length
  }));
}

// Aggregate function
function aggregate(values, func) {
  const numbers = values.filter(v => !isNaN(v));
  
  if (numbers.length === 0) return 0;
  
  switch (func) {
    case 'sum':
      return numbers.reduce((a, b) => a + b, 0);
    case 'mean':
      return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    case 'median':
      const sorted = numbers.sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    case 'min':
      return Math.min(...numbers);
    case 'max':
      return Math.max(...numbers);
    default:
      return numbers[0];
  }
}

// Sort data for better visualization
export function sortData(data, sortBy, order = 'asc') {
  if (!sortBy || !data.length) return data;
  
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      return order === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

// Limit data points for performance
export function limitDataPoints(data, maxPoints = 1000) {
  if (data.length <= maxPoints) return data;
  
  // Simple sampling - take every nth point
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}