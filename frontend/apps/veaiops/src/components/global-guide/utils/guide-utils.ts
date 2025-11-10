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

import { logger } from '@veaiops/utils';
import { GlobalGuideStepNumber } from '../enums/guide-steps.enum';
import { useGlobalGuideStore } from '../global-guide.store';
import type { UserProgress } from '../global-guide.store';

/**
 * Get incomplete items for the current step
 */
export const getCurrentStepIssues = (
  currentStep: number,
  userProgress: UserProgress,
): Array<{ type: string; message: string; action: string }> => {
  const issues: Array<{ type: string; message: string; action: string }> = [];

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
      // Default case: don't add any issues
      break;
  }

  return issues;
};

/**
 * Get the current progress step
 */
export const getCurrentProgressStep = (): number => {
  const { stepStatusMap } = useGlobalGuideStore.getState();

  // Find the first incomplete step
  for (
    let i = GlobalGuideStepNumber.CONNECTION;
    i <= GlobalGuideStepNumber.INJECTION;
    i++
  ) {
    if (stepStatusMap[i] !== 'completed') {
      return i;
    }
  }

  // If all steps are completed, return the first step (default state)
  return GlobalGuideStepNumber.CONNECTION;
};

/**
 * Register console debug commands
 */
export const registerConsoleCommands = (
  handleStepClick: (stepNumber: number) => void,
) => {
  // Convenient method to export all related logs
  const exportAllGlobalGuideLogs = (filename?: string) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFilename =
      filename || `global-guide-complete-analysis-${timestamp}.log`;
  };

  // Quick diagnostic method
  const quickDiagnoseGlobalGuide = () => {
    // Check localStorage
    const guideStore = localStorage.getItem('global-guide-store');
    if (guideStore) {
      try {
        const parsed = JSON.parse(guideStore);
        if ('state' in parsed && 'guideVisible' in parsed.state) {
          console.error('[GlobalGuide] 发现问题: guideVisible 被持久化', {
            value: parsed.state.guideVisible,
            store: parsed,
          });
        }
      } catch (error) {
        console.error('[GlobalGuide] localStorage 解析失败', error);
      }
    }

    // Check DOM
    const visibleGuideElements = document.querySelectorAll(
      '[class*="global-guide"]:not([style*="display: none"])',
    );
    if (visibleGuideElements.length > 0) {
      console.error('[GlobalGuide] 发现问题: 存在可见的引导元素', {
        count: visibleGuideElements.length,
        elements: Array.from(visibleGuideElements).map((el) => ({
          tagName: el.tagName,
          className: el.className,
        })),
      });
    }
  };

  // Register to global object
  (window as any).exportAllGlobalGuideLogs = exportAllGlobalGuideLogs;
  (window as any).quickDiagnoseGuide = quickDiagnoseGlobalGuide;
  (window as any).analyzeGlobalGuide = () => {
    quickDiagnoseGlobalGuide();
    setTimeout(() => {
      exportAllGlobalGuideLogs();
    }, 2000);
  };

  // Add command to debug first step click
  (window as any).debugStep1Click = () => {
    logger.info({
      message: '[GlobalGuide] 手动触发第一步点击调试',
      data: {
        currentUrl: window.location.href,
        currentPath: window.location.pathname,
        currentSearch: window.location.search,
      },
      source: 'GlobalGuide',
      component: 'debugStep1Click',
    });

    // Simulate clicking the first step
    handleStepClick(GlobalGuideStepNumber.CONNECTION);

    setTimeout(() => {
      logger.info({
        message: '[GlobalGuide] 第一步点击调试完成',
        data: {
          finalUrl: window.location.href,
          finalPath: window.location.pathname,
          finalSearch: window.location.search,
        },
        source: 'GlobalGuide',
        component: 'debugStep1Click',
      });
    }, 100);
  };

  // Add command to debug second step click
  (window as any).debugStep2Click = () => {
    logger.info({
      message: '[GlobalGuide] 手动触发第二步点击调试',
      data: {
        currentUrl: window.location.href,
        currentPath: window.location.pathname,
        currentSearch: window.location.search,
      },
      source: 'GlobalGuide',
      component: 'debugStep2Click',
    });

    // Simulate clicking the second step
    handleStepClick(GlobalGuideStepNumber.DATASOURCE);

    setTimeout(() => {
      logger.info({
        message: '[GlobalGuide] 第二步点击调试完成',
        data: {
          finalUrl: window.location.href,
          finalPath: window.location.pathname,
          finalSearch: window.location.search,
        },
        source: 'GlobalGuide',
        component: 'debugStep2Click',
      });
    }, 100);
  };

  // Add command to debug URL state changes
  (window as any).debugUrlState = () => {
    logger.info({
      message: '[GlobalGuide] URL状态调试',
      data: {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        searchParams: new URLSearchParams(window.location.search).toString(),
      },
      source: 'GlobalGuide',
      component: 'debugUrlState',
    });
  };

  // Add command to export GlobalGuide logs
  (window as any).exportGlobalGuideLogs = () => {
    logger.info({
      message: '[GlobalGuide] 手动触发GlobalGuide日志导出',
      data: {
        currentUrl: window.location.href,
        currentPath: window.location.pathname,
        currentSearch: window.location.search,
        timestamp: new Date().toISOString(),
      },
      source: 'GlobalGuide',
      component: 'exportGlobalGuideLogs',
    });
  };

  // Return cleanup function
  return () => {
    // Remove global methods on cleanup
    delete (window as any).exportAllGlobalGuideLogs;
    delete (window as any).quickDiagnoseGuide;
    delete (window as any).analyzeGlobalGuide;
    delete (window as any).debugStep1Click;
    delete (window as any).debugStep2Click;
    delete (window as any).debugUrlState;
    delete (window as any).exportGlobalGuideLogs;
  };
};
