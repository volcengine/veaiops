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

import { Tooltip } from '@arco-design/web-react';
import {
  IconClockCircle,
  IconClose,
  IconFolder,
  IconIdcard,
  IconLink,
  IconList,
  IconMenuFold,
  IconRobot,
  IconSettings,
  IconStorage,
  IconThunderbolt,
  IconUser,
} from '@arco-design/web-react/icon';
import type React from 'react';
import { useEffect, useState } from 'react';

import type { GlobalGuideStepNumber } from '../../enums/guide-steps.enum';
import type { GlobalGuideStep, StepStatus } from '../../lib';
import style from '../styles/index.module.less';

interface SideGuidePanelProps {
  sideGuidePanelVisible: boolean;
  steps: GlobalGuideStep[];
  currentStep: GlobalGuideStepNumber;
  getStepStatus: (stepNumber: GlobalGuideStepNumber) => StepStatus;
  onOpenSidePanel: () => void;
  onCloseSidePanel: () => void;
  onStepSelect: (stepNumber: GlobalGuideStepNumber) => void;
}

// Icon mapping table - semantic icons for all steps
const iconMap: Record<string, React.ReactElement> = {
  IconLink: <IconLink />, // Step 1: Connection management
  IconStorage: <IconStorage />, // Step 2: Data source
  IconSettings: <IconSettings />, // Step 3: Metric configuration / Step 11: ChatOps configuration
  IconThunderbolt: <IconThunderbolt />, // Step 4: Intelligent threshold task
  IconRobot: <IconRobot />, // Step 7: Group chat bot management
  IconCard: <IconIdcard />, // Step 8: Card template management
  IconUser: <IconUser />, // Step 9: Account management
  IconFolder: <IconFolder />, // Step 10: Project management
  IconList: <IconList />, // Step 12: Oncall alert rules
  IconClockCircle: <IconClockCircle />, // Step 13: Oncall alert history
};

/**
 * Side guide panel component
 */
export const SideGuidePanel: React.FC<SideGuidePanelProps> = ({
  sideGuidePanelVisible,
  steps,
  currentStep,
  getStepStatus,
  onOpenSidePanel,
  onCloseSidePanel,
  onStepSelect,
}) => {
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // When side panel opens, activate first step by default
  useEffect(() => {
    if (sideGuidePanelVisible && steps.length > 0) {
      // If current step is empty or invalid, select first step by default
      const firstStep = steps[0];
      if (!currentStep || currentStep !== firstStep.number) {
        onStepSelect(firstStep.number);
      }
    }
  }, [sideGuidePanelVisible, steps, currentStep, onStepSelect]);

  // Handle close panel
  const handleClosePanel = () => {
    setIsPanelVisible(false);
  };

  // Handle expand panel
  const handleExpandPanel = () => {
    setIsPanelVisible(true);
  };

  // Calculate panel style
  const panelClassName = `${style.sideGuidePanel} ${
    !isPanelVisible ? style.collapsed : ''
  }`;

  return (
    <>
      {/* Edge expand button - only shown when collapsed */}
      {!isPanelVisible && (
        <div className={style.edgeExpandButton} onClick={handleExpandPanel}>
          <div className={style.edgeButtonIcon}>{'<'}</div>
        </div>
      )}

      <div className={panelClassName}>
        {/* Top-right close button */}
        {isPanelVisible && (
          <div className={style.closeButton} onClick={handleClosePanel}>
            <IconClose className={style.closeIcon} />
          </div>
        )}

        {/* Guide icon - reference BCM style */}
        <Tooltip
          key={sideGuidePanelVisible ? 'disabled' : 'enabled'}
          content="智能阈值配置向导"
          position="left"
          disabled={sideGuidePanelVisible}
        >
          <div
            id="global-guide-icon"
            className={style.guideIcon}
            onClick={onOpenSidePanel}
          >
            <div className={style.iconWrapper}>
              <div className={style.gradientContainer}>
                <img
                  src="data:image/png;base64,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"
                  alt="AI 助手"
                  className={style.aiIcon}
                />
              </div>
            </div>
          </div>
        </Tooltip>

        {/* Step indicators - only shown when side guide panel is open */}
        {sideGuidePanelVisible && (
          <div className={style.stepIndicators}>
            {steps.map((step) => (
              <Tooltip
                key={step.number}
                content={step.description}
                position="left"
                style={{ zIndex: 1400 }}
              >
                <div
                  className={`${style.stepIndicator} ${
                    step.number === currentStep ? style.active : ''
                  } ${
                    getStepStatus(step.number) === 'completed'
                      ? style.completed
                      : ''
                  }`}
                  onClick={() => onStepSelect(step.number)}
                >
                  <div className={style.stepIcon}>
                    {iconMap[step.icon] || (
                      <div className={style.stepNumber}>{step.number}</div>
                    )}
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Function buttons - only shown when side guide panel is open */}
        {sideGuidePanelVisible && (
          <>
            {/* Expand/collapse button */}
            <div className={style.expandButton} onClick={onCloseSidePanel}>
              <IconMenuFold />
            </div>
          </>
        )}
      </div>
    </>
  );
};
