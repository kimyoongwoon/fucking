// graph_UI/graph_option/window/WindowOption.js
// 데이터 윈도우 옵션 생성

import { createWindowControl } from './WindowControl.js';
import { findOriginalAxisInfo } from '../../graph_generator/utils/DataUtils.js';

export function createWindowOption(graphId, usedAxes, originalData, onWindowChange) {
  if (usedAxes.length === 0) return null;
  
  const section = document.createElement('div');
  section.className = 'window-section option-section';
  
  const title = document.createElement('h4');
  title.textContent = '데이터 윈도우';
  section.appendChild(title);
  
  // Initialize window state
  const windowState = {
    maxDisplayCount: 200,
    axes: {}
  };
  
  // Create window control for each used axis
  usedAxes.forEach(axis => {
    // Get original axis info for min/max/interval
    const originalAxis = findOriginalAxisInfo(axis.name, originalData);
    const interval = originalAxis ? originalAxis.interval : 1;
    const min = originalAxis ? originalAxis.min : 0;
    const max = originalAxis ? originalAxis.max : 10;
    
    // Initialize axis window state
    windowState.axes[axis.name] = {
      startValue: min,
      endValue: min + 3, // Initial window size of 3
      windowSize: 3,
      stepSize: interval,
      interval: interval,
      min: min,
      max: max
    };
    
    const control = createWindowControl(
      axis,
      graphId,
      windowState.axes[axis.name],
      () => onWindowChange(windowState)
    );
    
    section.appendChild(control);
  });
  
  return section;
}