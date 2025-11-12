// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Message } from '@arco-design/web-react';
import type { PluginContext } from '../../../types/plugin';

/**
 * 粘贴值验证器
 */
export class PasteValidator {
  constructor(private context: PluginContext) {}

  /**
   * 第1步：基础验证和预处理
   */
  preValidateValues(values: string[]): {
    isValid: boolean;
    validValues: string[];
    errorMessage?: string;
  } {
    // 检查空值
    if (!values || values.length === 0) {
      return { isValid: false, validValues: [], errorMessage: '粘贴内容为空' };
    }

    // 过滤空字符串和无效值
    const validValues = values
      .map((val) => val.trim())
      .filter((val) => val.length > 0)
      .filter((val) => this.validatePastedValue(val));

    if (validValues.length === 0) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: '粘贴的内容格式不正确',
      };
    }

    // 检查单个值长度限制
    const oversizedValues = validValues.filter((val) => val.length > 50);
    if (oversizedValues.length > 0) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: `以下值过长（超过50字符）：${oversizedValues.slice(0, 3).join(', ')}${
          oversizedValues.length > 3 ? '...' : ''
        }`,
      };
    }

    // 检查粘贴数量限制 - 放宽限制，支持更大批量操作
    if (validValues.length > 1000) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: `一次最多粘贴1000个值，当前粘贴了${validValues.length}个`,
      };
    }

    return { isValid: true, validValues };
  }

  /**
   * 第2步：值类型转换
   */
  convertValueTypes(values: string[]): (string | number)[] {
    // 🔧 防御性检查：确保context存在
    if (!this.context) {
      return values;
    }

    const { props } = this.context;

    // 如果使用了pasteValueKey，优先使用自定义处理函数或保持字符串类型
    if (props.pasteValueKey) {
      const initialValues = values.map((val) => val); // 先转换为基础类型数组

      if (props.pasteValueProcessor) {
        return props.pasteValueProcessor(initialValues);
      }
      return initialValues;
    }

    return values.map((val) => {
      // 原有逻辑：根据optionCfg.valueRender决定类型转换
      const { dataSource } = props;
      if (
        dataSource &&
        typeof dataSource === 'object' &&
        'optionCfg' in dataSource &&
        dataSource.optionCfg?.valueRender
      ) {
        try {
          const numericValue = Number(val);
          return Number.isNaN(numericValue) ? val : numericValue;
        } catch (error) {
          return val;
        }
      }
      return val;
    });
  }

  /**
   * 第3步：去重检查
   */
  checkDuplication(
    newValues: (string | number)[],
    currentValues: (string | number)[],
  ): {
    hasNewValues: boolean;
    newUniqueValues: (string | number)[];
    duplicateValues: (string | number)[];
  } {
    const currentSet = new Set(currentValues.map((v) => String(v)));
    const newUniqueValues: (string | number)[] = [];
    const duplicateValues: (string | number)[] = [];

    newValues.forEach((val) => {
      if (currentSet.has(String(val))) {
        duplicateValues.push(val);
      } else {
        newUniqueValues.push(val);
        currentSet.add(String(val)); // 避免本次粘贴内部重复
      }
    });

    return {
      hasNewValues: newUniqueValues.length > 0,
      newUniqueValues,
      duplicateValues,
    };
  }

  /**
   * 第4步：数量限制检查
   */
  checkLimits(
    newValues: (string | number)[],
    _currentValues: (string | number)[],
  ): {
    isValid: boolean;
    finalValues: (string | number)[];
    errorMessage?: string;
  } {
    // 🔧 防御性检查：确保context存在
    if (!this.context) {
      // ✅ Silent mode: Context destroyed, skip validation (expected behavior)
      return { isValid: true, finalValues: newValues };
    }

    // 🔧 批量粘贴场景下完全放开数量限制，不进行任何数量检查
    // 这样可以支持大批量的数据导入操作
    return { isValid: true, finalValues: newValues };
  }

  /**
   * 第5步：数据源验证（验证值是否在远程数据源中存在）
   */
  async validateAgainstDataSource(values: (string | number)[]): Promise<{
    validValues: (string | number)[];
    invalidValues: (string | number)[];
  }> {
    // 🔧 防御性检查：确保context存在
    if (!this.context) {
      // ✅ Silent mode: Context destroyed, skip validation (expected behavior)
      return { validValues: values, invalidValues: [] };
    }

    const { props } = this.context;

    // 如果没有数据源，跳过验证
    if (
      !props.dataSource ||
      typeof props.dataSource !== 'object' ||
      !('api' in props.dataSource)
    ) {
      return { validValues: values, invalidValues: [] };
    }

    try {
      // 由于数据源验证较为复杂，暂时跳过远程验证
      // 将所有值视为有效，由用户在选择后通过正常的数据获取流程来验证

      // 简单的格式验证（针对数字ID）
      const validValues: (string | number)[] = [];
      const invalidValues: (string | number)[] = [];

      values.forEach((value) => {
        const strValue = String(value);
        // 基础格式验证：如果是数字ID，应该只包含数字
        if (
          /^\d+$/.test(strValue) &&
          strValue.length >= 3 &&
          strValue.length <= 20
        ) {
          validValues.push(value);
        } else {
          invalidValues.push(value);
        }
      });

      return { validValues, invalidValues };
    } catch (error) {
      // 验证失败时，为了用户体验，可以选择跳过验证或显示警告
      Message.warning('数据验证时发生错误，已跳过验证');
      return { validValues: values, invalidValues: [] };
    }
  }

  /**
   * 验证粘贴的值
   */
  validatePastedValue(value: string): boolean {
    // 基础验证：非空字符串
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return false;
    }

    // 这里可以添加更多的验证逻辑
    // 例如：格式验证、长度限制等
    return true;
  }

  /**
   * 过滤有效的粘贴值
   */
  filterValidValues(values: string[]): string[] {
    return values.filter((value) => this.validatePastedValue(value));
  }

  /**
   * 处理特殊字符
   */
  sanitizeValue(value: string): string {
    // 移除不可见字符和多余的空格
    return value.trim().replace(/[\u200B-\u200D]|\uFEFF/g, '');
  }

  /**
   * 批量处理粘贴值
   */
  processPastedValues(
    values: string[],
    beforePasteProcess?: (value: string) => string,
  ): string[] {
    return values
      .map((value) => this.sanitizeValue(value))
      .filter((value) => this.validatePastedValue(value))
      .map((value) => (beforePasteProcess ? beforePasteProcess(value) : value));
  }
}
