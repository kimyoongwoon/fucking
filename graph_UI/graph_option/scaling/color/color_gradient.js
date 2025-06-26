// graph_UI/graph_option/scaling/color/color_gradient.js
// 색상 그라디언트 함수

/**
 * Apply color scaling - blue to red gradient
 */
export function applyColorScaling(dataValue, minData, maxData, colorScalingConfig = {}) {
  // Normalize to 0-1 range
  let normalizedValue;
  if (minData === maxData) {
    normalizedValue = 0.5;
  } else {
    normalizedValue = (dataValue - minData) / (maxData - minData);
  }
  
  // Clamp to 0-1 range
  normalizedValue = Math.max(0, Math.min(1, normalizedValue));
  
  return blueToRedGradient(normalizedValue);
}

/**
 * Generate blue to red gradient color
 * 0 = Dark blue (#00008B), 1 = Strong red (#DC143C)
 */
function blueToRedGradient(normalizedValue) {
  // Define color stops
  const darkBlue = { r: 0, g: 0, b: 139 };      // #00008B
  const lightBlue = { r: 173, g: 216, b: 230 }; // #ADD8E6
  const lightRed = { r: 255, g: 182, b: 193 };  // #FFB6C1
  const strongRed = { r: 220, g: 20, b: 60 };   // #DC143C
  
  let r, g, b;
  
  if (normalizedValue <= 0.33) {
    // Dark blue to light blue
    const t = normalizedValue / 0.33;
    r = Math.round(darkBlue.r + (lightBlue.r - darkBlue.r) * t);
    g = Math.round(darkBlue.g + (lightBlue.g - darkBlue.g) * t);
    b = Math.round(darkBlue.b + (lightBlue.b - darkBlue.b) * t);
  } else if (normalizedValue <= 0.67) {
    // Light blue to light red
    const t = (normalizedValue - 0.33) / 0.34;
    r = Math.round(lightBlue.r + (lightRed.r - lightBlue.r) * t);
    g = Math.round(lightBlue.g + (lightRed.g - lightBlue.g) * t);
    b = Math.round(lightBlue.b + (lightRed.b - lightBlue.b) * t);
  } else {
    // Light red to strong red
    const t = (normalizedValue - 0.67) / 0.33;
    r = Math.round(lightRed.r + (strongRed.r - lightRed.r) * t);
    g = Math.round(lightRed.g + (strongRed.g - lightRed.g) * t);
    b = Math.round(lightRed.b + (strongRed.b - lightRed.b) * t);
  }
  
  return `rgb(${r}, ${g}, ${b})`;
}