// graph_UI/graph_generator/utils/DataUtils.js
// 데이터 가공 및 유틸리티 함수 - 디버깅 강화 버전

// ✅ 완전히 재작성된 데이터 준비 함수
export function prepareDataForVisualization(dataset, originalData, filters = {}, window = null) {
  console.log(`🔧 prepareDataForVisualization 시작`);
  console.log(`📊 Dataset:`, dataset);
  console.log(`🗂️ Original data length:`, originalData?.data_value?.length || 0);
  console.log(`🔍 Filters:`, filters);
  console.log(`🪟 Window:`, window);
  
  if (!originalData || !originalData.data_value) {
    console.warn('❌ No original data provided');
    return [];
  }
  
  if (!dataset || !dataset.axes) {
    console.warn('❌ No dataset or axes provided');
    return [];
  }
  
  console.log(`✅ Data validation passed`);
  console.log(`📋 Selected axes:`, dataset.axes);
  
  // ✅ 추가: 축 정보 상세 출력
  dataset.axes.forEach((axis, index) => {
    console.log(`🔍 Axis ${index}:`, {
      name: axis.name,
      type: axis.type,
      index: axis.index
    });
  });
  
  // ✅ 추가: 첫 번째 데이터 포인트 상세 분석
  if (originalData.data_value.length > 0) {
    const firstPoint = originalData.data_value[0];
    console.log(`🔍 First data point analysis:`);
    console.log(`  - Full point:`, firstPoint);
    console.log(`  - Coords:`, firstPoint[0]);
    console.log(`  - Value:`, firstPoint[1]);
    console.log(`  - Value type:`, originalData.basic_data.value_type);
  }
  
  // Extract data for selected axes
  const preparedData = [];
  
  // ✅ 수정: 첫 번째 데이터 포인트만 상세 분석
  originalData.data_value.forEach((point, index) => {
    try {
      const coords = point[0];
      const value = point[1];
      
      const dataPoint = {
        _originalIndex: index,
        _coords: coords,
        _value: value,
        _fullData: formatFullData(coords, value)
      };
      
      // ✅ 수정: 축별 데이터 추출 로직 개선
      let extractionSuccessful = true;
      
      if (index === 0) {
        console.log(`\n🔍 Processing first data point (index 0):`);
        console.log(`  - Coords:`, coords);
        console.log(`  - Value:`, value);
      }
      
      dataset.axes.forEach((axis, axisIndex) => {
        let extractedValue = null;
        
        try {
          if (index === 0) {
            console.log(`\n  🔍 Processing axis ${axisIndex} (${axis.name}):`);
            console.log(`    - Type: ${axis.type}`);
            console.log(`    - Index: ${axis.index}`);
          }
          
          if (axis.type === 'input') {
            if (coords && Array.isArray(coords) && coords.length > axis.index && axis.index >= 0) {
              extractedValue = coords[axis.index];
              if (index === 0) {
                console.log(`    ✅ Input extraction: coords[${axis.index}] = ${extractedValue}`);
              }
            } else {
              if (index === 0) {
                console.log(`    ❌ Input extraction failed:`);
                console.log(`      - coords is array: ${Array.isArray(coords)}`);
                console.log(`      - coords length: ${coords ? coords.length : 'null'}`);
                console.log(`      - axis.index: ${axis.index}`);
                console.log(`      - index valid: ${axis.index >= 0 && coords && coords.length > axis.index}`);
              }
              extractionSuccessful = false;
            }
          } else if (axis.type === 'output') {
            extractedValue = extractOutputValue(value, axis.index, originalData.basic_data.value_type);
            if (index === 0) {
              console.log(`    📤 Output extraction result: ${extractedValue}`);
            }
            if (extractedValue === null || extractedValue === undefined) {
              if (index === 0) {
                console.log(`    ❌ Output extraction failed`);
              }
              extractionSuccessful = false;
            }
          } else if (axis.type === 'string') {
            if (Array.isArray(value) && typeof value[0] === 'string') {
              extractedValue = value[0];
              if (index === 0) {
                console.log(`    ✅ String extraction: ${extractedValue}`);
              }
            } else {
              if (index === 0) {
                console.log(`    ❌ String extraction failed`);
              }
              extractionSuccessful = false;
            }
          }
          
          // ✅ 중요: 추출된 값을 dataPoint에 저장
          if (extractedValue !== null && extractedValue !== undefined) {
            dataPoint[axis.name] = extractedValue;
            if (index === 0) {
              console.log(`    ✅ Stored ${axis.name} = ${extractedValue}`);
            }
          } else {
            if (index === 0) {
              console.log(`    ❌ Failed to store ${axis.name} (value: ${extractedValue})`);
            }
            extractionSuccessful = false;
          }
          
        } catch (error) {
          console.error(`❌ Error extracting ${axis.name}:`, error);
          extractionSuccessful = false;
        }
      });
      
      // ✅ 수정: 모든 축이 성공적으로 추출된 경우만 포함
      if (extractionSuccessful) {
        preparedData.push(dataPoint);
        if (index === 0) {
          console.log(`\n✅ First data point successfully extracted:`, dataPoint);
        }
      } else {
        if (index < 3) { // 처음 3개만 상세 로그
          console.warn(`⚠️ Skipping data point ${index} due to axis extraction failure`);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Error processing data point ${index}:`, error);
    }
  });
  
  console.log(`📊 After axis extraction: ${preparedData.length} points`);
  if (preparedData.length > 0) {
    console.log(`📋 Sample extracted data:`, preparedData[0]);
    console.log(`📋 Available keys:`, Object.keys(preparedData[0]));
  } else {
    console.error(`❌ No data points successfully extracted!`);
    console.error(`❌ Debug info:`);
    console.error(`  - Original data points: ${originalData.data_value.length}`);
    console.error(`  - Selected axes: ${dataset.axes.length}`);
    console.error(`  - First axis details:`, dataset.axes[0]);
    if (dataset.axes[1]) {
      console.error(`  - Second axis details:`, dataset.axes[1]);
    }
    return [];
  }
  
  // Apply filters
  let filteredData = applyFilters(preparedData, filters, originalData);
  console.log(`🔍 After filters: ${filteredData.length} points`);
  
  // Apply window if exists
  if (window) {
    filteredData = applyWindow(filteredData, window, dataset);
    console.log(`🪟 After window: ${filteredData.length} points`);
  }
  
  console.log(`✅ prepareDataForVisualization 완료: ${filteredData.length} points`);
  return filteredData;
}

// ✅ 강화된 Output 값 추출 함수
function extractOutputValue(value, index, valueType) {
  try {
    console.log(`🔍 Extracting output value at index ${index} from:`, value, `(type: ${valueType})`);
    
    if (valueType === 'double') {
      const result = index === 0 ? value : null;
      console.log(`📤 Double extraction result:`, result);
      return result;
    } else if (valueType === 'string_double') {
      if (index === 0 && Array.isArray(value) && value.length > 1) {
        const result = value[1];
        console.log(`📤 String_double extraction result:`, result);
        return result;
      }
      console.log(`📤 String_double extraction failed`);
      return null;
    } else if (valueType === 'array') {
      if (Array.isArray(value) && value.length > index) {
        const result = value[index];
        console.log(`📤 Array extraction result:`, result);
        return result;
      }
      console.log(`📤 Array extraction failed`);
      return null;
    } else if (valueType === 'string_array') {
      if (Array.isArray(value) && Array.isArray(value[1]) && value[1].length > index) {
        const result = value[1][index];
        console.log(`📤 String_array extraction result:`, result);
        return result;
      }
      console.log(`📤 String_array extraction failed`);
      return null;
    }
    
    console.log(`📤 Unknown value type: ${valueType}`);
    return null;
  } catch (error) {
    console.warn(`❌ Failed to extract output value at index ${index}:`, error);
    return null;
  }
}

// Apply filters to data
function applyFilters(data, filters, originalData) {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  console.log(`🔍 Applying filters:`, filters);
  
  return data.filter(dataPoint => {
    for (const axisName in filters) {
      const filter = filters[axisName];
      if (!filter || filter.mode === '모두') continue;
      
      const value = getAxisValue(dataPoint, axisName, originalData);
      if (value === null || value === undefined) continue;
      
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

// ✅ 수정: 윈도우 적용 함수 강화
function applyWindow(data, window, dataset) {
  if (!window || !window.axes) return data;
  
  console.log(`🪟 Applying window constraints:`, window.axes);
  
  const filteredData = data.filter(dataPoint => {
    for (const axisName in window.axes) {
      const axisWindow = window.axes[axisName];
      const value = dataPoint[axisName];

      if (value !== undefined && value !== null && !isNaN(value)) {
        const start = parseFloat(axisWindow.startValue);
        const end = parseFloat(axisWindow.endValue);
        
        if (value < start || value > end) {
          return false;
        }
      }
    }

    return true;
  });
  
  // ✅ 윈도우 필터링 결과 상세 로그
  Object.entries(window.axes).forEach(([axisName, axisWindow]) => {
    const axisValues = data.map(d => d[axisName]).filter(v => v !== undefined && v !== null && !isNaN(v));
    const filteredValues = filteredData.map(d => d[axisName]).filter(v => v !== undefined && v !== null && !isNaN(v));
    console.log(`🪟 Window ${axisName}: [${axisWindow.startValue}, ${axisWindow.endValue}]`);
    console.log(`   - Original: ${axisValues.length} valid values`);
    console.log(`   - Filtered: ${filteredValues.length} valid values`);
    if (axisValues.length > 0) {
      console.log(`   - Value range: [${Math.min(...axisValues)}, ${Math.max(...axisValues)}]`);
    }
  });
  
  return filteredData;
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
    return extractOutputValue(dataPoint._value, axis.index, originalData.basic_data.value_type);
  }
  
  return null;
}

// Find axis information by name
export function findAxisByName(name, originalData) {
  // Check input axes
  if (originalData.basic_data && originalData.basic_data.axes) {
    const inputAxes = originalData.basic_data.axes;
    for (let i = 0; i < inputAxes.length; i++) {
      if (inputAxes[i].name === name) {
        return { type: 'input', index: i };
      }
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

// ✅ 강화된 축 범위 계산
export function getAxisRange(axisName, data) {
  console.log(`📏 Calculating range for axis: ${axisName}`);
  console.log(`📊 Data length: ${data.length}`);
  
  if (data.length > 0) {
    console.log(`📋 Sample data keys:`, Object.keys(data[0]));
  }
  
  const values = data
    .map(d => d[axisName])
    .filter(v => v !== undefined && v !== null && !isNaN(v) && isFinite(v));
  
  console.log(`📏 Valid values for ${axisName}: ${values.length}/${data.length}`);
  if (values.length > 0) {
    console.log(`📏 Sample values:`, values.slice(0, 5));
  }
  
  if (values.length === 0) {
    console.warn(`⚠️ No valid values found for axis ${axisName}`);
    return { min: 0, max: 1 };
  }
  
  const range = {
    min: Math.min(...values),
    max: Math.max(...values)
  };
  
  // 최소/최대값이 같은 경우 처리
  if (range.min === range.max) {
    range.max = range.min + 1;
  }
  
  console.log(`📏 Axis ${axisName} range: [${range.min}, ${range.max}] from ${values.length} values`);
  
  return range;
}

// Get original axis info from basic_data
export function findOriginalAxisInfo(axisName, originalData) {
  if (!originalData || !originalData.basic_data || !originalData.basic_data.axes) {
    return null;
  }
  
  return originalData.basic_data.axes.find(axis => axis.name === axisName);
}