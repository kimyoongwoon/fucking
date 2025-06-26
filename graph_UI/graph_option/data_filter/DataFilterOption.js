// graph_UI/graph_option/data_filter/DataFilterOption.js
// 데이터 필터 옵션 생성

import { createFilterControl } from './FilterControl.js';
import { getAxisRange } from '../../graph_generator/utils/DataUtils.js';

export function createDataFilterOption(graphId, unusedAxes, onFilterChange) {
  if (unusedAxes.length === 0) return null;
  
  const section = document.createElement('div');
  section.className = 'filter-section option-section';
  
  const title = document.createElement('h4');
  title.textContent = '데이터 필터';
  section.appendChild(title);
  
  // Initialize filters object
  const filters = {};
  
  // Create filter control for each unused axis
  unusedAxes.forEach(axis => {
    const control = createFilterControl(
      axis,
      graphId,
      (axisName, filter) => {
        filters[axisName] = filter;
        onFilterChange(filters);
      }
    );
    section.appendChild(control);
  });
  
  return section;
}