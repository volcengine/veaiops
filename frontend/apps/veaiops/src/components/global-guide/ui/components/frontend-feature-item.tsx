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

/**
 * Frontend feature item component
 * Used to display and interact with a single frontend feature
 */

import { Button, Typography } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type React from 'react';

import type { FeatureActionType, FrontendFeature } from '../../lib';
import { startGlobalGuideLogCollection } from '../../lib';
import style from '../styles/index.module.less';

const { Text } = Typography;

export interface OnFeatureClickParams {
  featureId: string;
  selector: string;
  tooltipContent: string;
  actionType: FeatureActionType;
  targetRoute: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  prerequisiteSteps?: string[];
  currentStepConfig?: any;
  allowDisabled?: boolean;
}

export interface FrontendFeatureItemProps {
  /** Frontend feature configuration */
  feature: FrontendFeature;
  /** Current step's route */
  currentRoute: string;
  /** Feature click callback */
  onFeatureClick: (params: OnFeatureClickParams) => void;
  /** Go to config click callback */
  onGoToConfig?: (stepNumber: number) => void;
  /** Whether to highlight */
  highlighted?: boolean;
  /** Whether disabled */
  disabled?: boolean;
  /** Current step configuration */
  currentStepConfig?: any;
}

/**
 * Frontend feature item component
 * Renders a single frontend feature, including button and description
 */
export const FrontendFeatureItem: React.FC<FrontendFeatureItemProps> = ({
  feature,
  currentRoute,
  onFeatureClick,
  onGoToConfig,
  highlighted = false,
  disabled = false,
  currentStepConfig,
}) => {
  const handleClick = () => {
    if (disabled) {
      return;
    }

    onFeatureClick({
      featureId: feature.id,
      selector: feature.selector,
      tooltipContent: feature.tooltipContent || '',
      actionType: feature.actionType || 'direct',
      targetRoute: feature.targetRoute || currentRoute,
      placement: feature.placement,
      prerequisiteSteps: feature.prerequisiteSteps,
      currentStepConfig,
      allowDisabled: feature.allowDisabled,
    });
  };

  const handleGoToConfig = () => {
    if (onGoToConfig && currentStepConfig?.number) {
      // In development environment, automatically start log collection
      if (process.env.NODE_ENV === 'development') {
        logger.info({
          message: '[FrontendFeatureItem] 前往配置按钮被点击，开始收集日志',
          data: {
            featureId: feature.id,
            featureName: feature.name,
            stepNumber: currentStepConfig.number,
            stepTitle: currentStepConfig.title,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
          source: 'FrontendFeatureItem',
          component: 'handleGoToConfig',
        });

        // Use dedicated GlobalGuide log collector
        const sessionId = startGlobalGuideLogCollection({
          featureId: feature.id,
          stepNumber: currentStepConfig.number,
        });

        logger.info({
          message: '前往配置按钮被点击，日志收集已自动开始',
          data: {
            sessionId,
            featureId: feature.id,
            stepNumber: currentStepConfig.number,
          },
          source: 'FrontendFeatureItem',
          component: 'handleGoToConfig',
        });
      }

      onGoToConfig(currentStepConfig.number);
    }
  };

  const itemClassName = [
    style.featureItem,
    highlighted && style.highlighted,
    disabled && style.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClassName} onClick={handleClick}>
      <div className={style.featureContent}>
        <Button
          type="text"
          size="small"
          className={style.featureBtn}
          disabled={disabled}
        >
          {feature.name}
        </Button>
        <Text className={style.featureDescription}>{feature.description}</Text>
      </div>
      {onGoToConfig && (
        <Button
          type="primary"
          size="small"
          className={style.goToConfigBtn}
          onClick={handleGoToConfig}
          disabled={disabled}
        >
          前往配置
        </Button>
      )}
    </div>
  );
};
