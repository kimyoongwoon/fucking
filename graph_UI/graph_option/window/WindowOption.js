// graph_UI/graph_option/window/WindowOption.js
// 데이터 윈도우 옵션 생성 - 최종 수정 버전

import { createWindowControl } from './WindowControl.js';
import { findOriginalAxisInfo, getAxisRange } from '../../graph_generator/utils/DataUtils.js';
import { prepareDataForVisualization } from '../../graph_generator/utils/DataUtils.js';

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
  
  // ✅ 수정: 안전한 설정 참조
  let config = null;
  let tempData = [];
  
  try {
    // graphConfigs에서 설정 가져오기 (글로벌 또는 모듈에서)
    if (typeof window !== 'undefined' && window.graphConfigs && window.graphConfigs[graphId]) {
      config = window.graphConfigs[graphId];
    } else {
      // 모듈에서 import 시도
      import('../../../graph_complete.js').then(module => {
        if (module.graphConfigs && module.graphConfigs[graphId]) {
          config = module.graphConfigs[graphId];
        }
      }).catch(() => {
        console.warn('Could not import graphConfigs for window option');
      });
    }
    
    // 데이터 소스 확인
    const dataSource = originalData || (typeof window !== 'undefined' ? window.originalData : null);
    
    if (config && dataSource) {
      // 현재 필터 없이 데이터를 준비해서 실제 범위를 계산
      tempData = prepareDataForVisualization(
        config.dataset,
        dataSource,
        {}, // 필터 없음
        null // 윈도우 없음
      );
    }
  } catch (error) {
    console.warn('Failed to prepare data for window calculation:', error);
  }
  
  // Create window control for each used axis
  usedAxes.forEach(axis => {
    // Get original axis info for min/max/interval
    const originalAxis = findOriginalAxisInfo(axis.name, originalData);
    const interval = originalAxis ? originalAxis.interval : 1;
    const originalMin = originalAxis ? originalAxis.min : 0;
    const originalMax = originalAxis ? originalAxis.max : 10;
    
    // ✅ 수정: 실제 데이터 범위 계산
    let dataRange = { min: originalMin, max: originalMax };
    if (tempData.length > 0) {
      try {
        dataRange = getAxisRange(axis.name, tempData);
        // 데이터 범위가 원본 범위보다 좁을 수 있으므로 원본 범위를 기본으로 사용
        dataRange.min = Math.min(dataRange.min, originalMin);
        dataRange.max = Math.max(dataRange.max, originalMax);
      } catch (error) {
        console.warn(`Failed to get range for axis ${axis.name}:`, error);
        dataRange = { min: originalMin, max: originalMax };
      }
    }
    
    // ✅ 수정: 적절한 초기 윈도우 크기 계산
    const totalRange = dataRange.max - dataRange.min;
    
    // 더 큰 초기 윈도우 크기 설정 (전체 범위의 50%)
    const initialWindowSize = Math.max(
      totalRange * 0.5, // 전체 범위의 50%
      interval * 5 // 최소 interval * 5
    );
    
    // ✅ 수정: 데이터가 실제로 존재하는 범위에서 시작
    let startValue = dataRange.min;
    let endValue = Math.min(startValue + initialWindowSize, dataRange.max);
    
    // 윈도우가 너무 작으면 조정
    if (endValue - startValue < interval * 2) {
      endValue = Math.min(startValue + interval * 10, dataRange.max);
    }
    
    // 여전히 너무 작으면 전체 범위 사용
    if (endValue - startValue < totalRange * 0.1) {
      startValue = dataRange.min;
      endValue = dataRange.max;
    }
    
    // Initialize axis window state
    windowState.axes[axis.name] = {
      startValue: startValue,
      endValue: endValue,
      windowSize: endValue - startValue,
      stepSize: interval,
      interval: interval,
      min: dataRange.min,
      max: dataRange.max,
      originalMin: originalMin,
      originalMax: originalMax
    };
    
    const control = createWindowControl(
      axis,
      graphId,
      windowState.axes[axis.name],
      () => onWindowChange(windowState)
    );
    
    section.appendChild(control);
    
    console.log(`🪟 Window initialized for ${axis.name}: [${startValue.toFixed(2)}, ${endValue.toFixed(2)}] from data range [${dataRange.min.toFixed(2)}, ${dataRange.max.toFixed(2)}]`);
  });

  // ✅ 초기 윈도우 상태 적용
  console.log('🪟 Applying initial window state:', windowState);
  onWindowChange(windowState);
  
  return section;
}