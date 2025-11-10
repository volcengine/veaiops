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

import { GlobalGuideStepNumber } from '../../enums/guide-steps.enum';
import type { UserProgress } from '../store';
import type { StepIssue } from './types';

/**
 * Get current step's incomplete items
 *
 * @param currentStep - Current step number
 * @param userProgress - User progress data
 * @returns List of incomplete items
 */
export const getCurrentStepIssues = (
  currentStep: number,
  userProgress: UserProgress,
): StepIssue[] => {
  const issues: StepIssue[] = [];

  switch (currentStep) {
    case GlobalGuideStepNumber.CONNECTION:
      if (!userProgress.connection?.isHealthy) {
        issues.push({
          type: 'connection',
          message: '连接健康检查未通过',
          action: '检查连接',
        });
      }
      break;
    case GlobalGuideStepNumber.DATASOURCE:
      if (!userProgress.datasource?.isValid) {
        issues.push({
          type: 'datasource',
          message: '数据源配置不完整',
          action: '完善配置',
        });
      }
      break;
    case GlobalGuideStepNumber.TEMPLATE:
      if (!userProgress.metricModel?.isComplete) {
        issues.push({
          type: 'metricModel',
          message: '指标模型维度映射缺失',
          action: '修复映射',
        });
      }
      break;
    case GlobalGuideStepNumber.METRIC_CONFIG:
      if (!userProgress.metric?.isValid) {
        issues.push({
          type: 'metric',
          message: '指标配置质量不达标',
          action: '调整参数',
        });
      }
      break;
    case GlobalGuideStepNumber.TASK:
      if (!userProgress.task?.isTrained) {
        issues.push({
          type: 'task',
          message: '阈值任务训练未完成',
          action: '重新训练',
        });
      }
      break;
    case GlobalGuideStepNumber.INJECTION:
      if (!userProgress.injection?.isSimulated) {
        issues.push({
          type: 'injection',
          message: '注入规则模拟未通过',
          action: '重新模拟',
        });
      }
      break;
    default:
      // Default case, don't add any issues
      break;
  }

  return issues;
};
