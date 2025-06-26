// graph_UI/graph_option/scaling/size/size_scaling_functions.js
// 크기 스케일링 함수들

/**
 * Apply scaling function and convert to pixel radius
 */
export function applyScaling(dataValue, minData, maxData, scalingConfig) {
  const { type = 'default', params = {} } = scalingConfig || {};
  
  let normalizedValue;
  
  switch (type) {
    case 'linear':
      normalizedValue = linearScaling(dataValue, minData, maxData, params);
      break;
    case 'sigmoid':
      normalizedValue = sigmoidScaling(dataValue, minData, maxData, params);
      break;
    case 'default':
    default:
      normalizedValue = defaultScaling(dataValue, minData, maxData);
      break;
  }
  
  // Clamp to 0-1 range
  normalizedValue = Math.max(0, Math.min(1, normalizedValue));
  
  // Convert to pixel radius (3 = min radius, 15 = size range)
  return 3 + normalizedValue * 15;
}

/**
 * Default scaling function
 */
function defaultScaling(dataValue, minData, maxData) {
  if (minData === maxData) return 0.5;
  return (dataValue - minData) / (maxData - minData);
}

/**
 * Linear scaling function: size = a * dataValue + b
 */
function linearScaling(dataValue, minData, maxData, params) {
  const { a = 1, b = 0 } = params;
  
  // Apply linear transformation
  const transformedValue = a * dataValue + b;
  const transformedMin = a * minData + b;
  const transformedMax = a * maxData + b;
  
  // Normalize to 0-1 range
  if (transformedMin === transformedMax) return 0.5;
  return (transformedValue - transformedMin) / (transformedMax - transformedMin);
}

/**
 * Sigmoid scaling function
 */
function sigmoidScaling(dataValue, minData, maxData, params) {
  const { k = 1 } = params;
  
  // Set midpoint to middle of data range
  const midpoint = (minData + maxData) / 2;
  
  // Normalize input to -3 to 3 range
  const normalizedInput = (dataValue - midpoint) / ((maxData - minData) / 6);
  
  // Apply sigmoid
  return 1 / (1 + Math.exp(-k * normalizedInput));
}