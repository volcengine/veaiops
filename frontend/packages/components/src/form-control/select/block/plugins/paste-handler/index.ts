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
import { logger } from '../../logger';
import type {
  PasteHandlerConfig,
  PasteHandlerPlugin,
  PluginContext,
} from '../../types/plugin';
import { PasteDataFetcher } from './data-fetchers/paste-data-fetcher';
import { TokenSeparatorUtils } from './utils/token-separator-utils';
import { PasteValidator } from './validators/paste-validator';

// 导入拆分后的工具类

// 重新导出工具类，保持向后兼容
export { TokenSeparatorUtils };

/**
 * 粘贴处理插件实现
 */
export class PasteHandlerPluginImpl implements PasteHandlerPlugin {
  name = 'paste-handler';

  config: PasteHandlerConfig;

  private context!: PluginContext;

  private validator!: PasteValidator;

  private dataFetcher!: PasteDataFetcher;

  private logger = logger;

  constructor(config: PasteHandlerConfig) {
    this.config = config;
  }

  init(context: PluginContext): void {
    this.context = context;
    this.validator = new PasteValidator(context);
    this.dataFetcher = new PasteDataFetcher(context);
  }

  /**
   * 处理粘贴事件
   */
  handlePaste(event: ClipboardEvent): void {
    // 防御性检查：确保配置对象和context存在
    if (!this.config) {
      // ✅ Silent mode: Config not initialized, skip paste handling (expected behavior)
      return;
    }

    if (!this.context) {
      // ✅ Silent mode: Context destroyed, skip paste handling (expected behavior)
      return;
    }

    const {
      allowPasteMultiple,
      mode,
      tokenSeparators,
      beforePasteProcess,
      onPaste,
    } = this.config;

    // 只在多选模式且允许粘贴多个值时生效
    if (!allowPasteMultiple || mode !== 'multiple') {
      return;
    }

    const pastedText = event.clipboardData?.getData('text') || '';
    if (!pastedText.trim()) {
      return;
    }

    // 阻止默认行为
    event.preventDefault();

    // 🔧 增强分隔符支持 - 使用自定义或默认分隔符
    const separators =
      tokenSeparators || TokenSeparatorUtils.getDefaultSeparators();

    // 使用增强的文本切分方法
    const splitValues = TokenSeparatorUtils.splitTextByMultipleSeparators(
      pastedText,
      separators,
    );

    if (splitValues.length === 0) {
      return;
    }

    // 处理每个值
    const processedValues = this.validator.processPastedValues(
      splitValues,
      beforePasteProcess,
    );

    // 调用用户自定义的onPaste回调
    if (onPaste) {
      onPaste(processedValues, event);
    }

    // 更新组件的值
    this.updateValue(processedValues);
  }

  /**
   * 更新组件的值（包含完整的验证和错误处理）
   */
  private async updateValue(newValues: string[]): Promise<void> {
    // 🔧 防御性检查：确保context存在，避免组件销毁后的异步操作
    if (!this.context) {
      // ✅ Silent mode: Context destroyed, skip value update (expected behavior)
      return;
    }

    const { props } = this.context;

    // 获取当前已选中的值，确保类型一致性
    let rawCurrentValues: (string | number)[] = [];

    if (Array.isArray(props.value)) {
      rawCurrentValues = props.value
        .map((v) => (typeof v === 'object' ? v.value : v))
        .filter((v) => v !== undefined);
    } else if (props.value !== undefined && props.value !== null) {
      const singleValue =
        typeof props.value === 'object' ? props.value.value : props.value;
      if (singleValue !== undefined) {
        rawCurrentValues = [singleValue];
      }
    }

    // 保持当前值的原始类型，让onChangeProcessor处理最终的类型转换
    const currentValues = rawCurrentValues;

    try {
      // 🔧 第1步：基础验证和预处理
      const preValidationResult = this.validator.preValidateValues(newValues);
      if (!preValidationResult.isValid) {
        Message.error(preValidationResult.errorMessage || '粘贴数据验证失败');
        return;
      }

      // 🔧 第2步：值类型转换
      const processedNewValues = this.validator.convertValueTypes(
        preValidationResult.validValues,
      );

      // 🔧 第3步：去重检查
      const deduplicationResult = this.validator.checkDuplication(
        processedNewValues,
        currentValues,
      );
      if (deduplicationResult.hasNewValues === false) {
        Message.warning('粘贴的值已全部存在，无需重复添加');
        return;
      }

      // 🔧 第4步：数量限制检查
      const limitCheckResult = this.validator.checkLimits(
        deduplicationResult.newUniqueValues,
        currentValues,
      );
      if (!limitCheckResult.isValid) {
        Message.error(limitCheckResult.errorMessage || '数量限制检查失败');
        return;
      }

      // 🔧 第5步：数据源验证（验证值是否真实存在）
      const validationResult = await this.validator.validateAgainstDataSource(
        limitCheckResult.finalValues,
      );

      // 处理验证结果
      if (validationResult.validValues.length === 0) {
        Message.error(
          `所有粘贴的值都无效：${validationResult.invalidValues.join(', ')}`,
        );
        return;
      }

      // 部分成功的情况
      if (validationResult.invalidValues.length > 0) {
        Message.warning(
          `部分值无效已忽略：${validationResult.invalidValues.join(', ')}\n` +
            `成功添加：${validationResult.validValues.length} 个值`,
        );
      } else {
        Message.success(
          `成功粘贴 ${validationResult.validValues.length} 个账户`,
        );
      }

      // 🔧 第6步：更新组件值并触发数据获取
      const finalMergedValues = Array.from(
        new Set([...currentValues, ...validationResult.validValues]),
      );

      if (props.onChange) {
        // 🔧 使用onChangeProcessor处理传递给表单的值类型
        const processedValues = props.onChangeProcessor
          ? props.onChangeProcessor(finalMergedValues)
          : finalMergedValues; // 如果没有onChangeProcessor则保持原始类型

        // 构造option信息
        const optionInfo = validationResult.validValues.map((val) => ({
          value: val,
          label: String(val),
        }));

        this.logger.info(
          'PasteHandler',
          '🟢 粘贴触发onChange',
          {
            processedValues,
            optionInfo,
            placeholder: props.placeholder,
            addBefore: (props as any).addBefore,
            timestamp: new Date().toISOString(),
          },
          'handlePaste',
        );

        props.onChange(processedValues, optionInfo as any);
      }

      // 🔧 重要：粘贴后触发数据获取，确保新粘贴的值能被搜索到
      await this.dataFetcher.triggerDataFetchForPastedValues(
        validationResult.validValues,
      );
    } catch (error) {
      Message.error('验证粘贴数据时发生错误，请重试');
    }
  }

  /**
   * 创建粘贴事件处理器
   */
  createPasteHandler(): ((event: ClipboardEvent) => void) | undefined {
    // 防御性检查：确保配置对象和context存在
    if (!this.config || !this.config.allowPasteMultiple) {
      return undefined;
    }

    if (!this.context) {
      // ✅ Silent mode: Context destroyed, cannot create paste handler (expected behavior)
      return undefined;
    }

    // 绑定this上下文，防止调用时this丢失
    return this.handlePaste.bind(this);
  }

  destroy(): void {
    this.context = null as any;
  }
}
