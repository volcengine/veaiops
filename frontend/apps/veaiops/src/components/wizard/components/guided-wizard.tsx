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
 * Guided data source wizard component
 * @description Integrates x-guide component to implement guided data source creation flow
 * @author AI Assistant
 * @date 2025-01-15
 */

import { Button } from '@arco-design/web-react';
import { XGuide } from '@veaiops/components';
import type { IGuide, IStep } from '@veaiops/components';
import type { Connect } from 'api-generate';
import type React from 'react';
import { useMemo, useState } from 'react';
import { DATA_SOURCE_CONFIGS } from '../config/datasource-configs';
import styles from '../datasource-wizard.module.less';
import { useDataSourceWizard } from '../hooks/state/use-datasource-wizard';
import type { DataSourceType } from '../types';
import { getStepProgressText } from '../utils/wizard-logic';
import { FooterActions } from './footer-actions';
import { StepContent } from './step-content';
import { TypeSelection } from './type-selection';
import { useWizardController } from './wizard-controller';

export interface GuidedWizardProps {
  connects: Connect[];
  onSuccess?: (dataSource: unknown) => void;
  onClose: () => void;
}

export const GuidedWizard: React.FC<GuidedWizardProps> = ({
  connects,
  onClose,
  onSuccess,
}) => {
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [guideVisible, setGuideVisible] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return (
      !urlParams.has('connectDrawerShow') ||
      urlParams.get('connectDrawerShow') !== 'true'
    );
  });
  const { state, actions } = useDataSourceWizard();

  // Use wizard controller
  const {
    handleTypeSelect,
    handleNext,
    handlePrev,
    canProceedToNext,
    getNextButtonText,
    getPrevButtonText,
    shouldShowPrevButton,
    CreationConfirmModalComponent,
  } = useWizardController({
    selectedType,
    setSelectedType,
    state,
    actions,
    onClose,
    onSuccess,
  });

  // Create guide steps
  const guideSteps: IStep[] = useMemo(() => {
    const steps: IStep[] = [
      {
        selector: '#datasource-type-selection',
        title: '选择数据源类型',
        content:
          '首先选择您要创建的数据源类型。我们支持 Zabbix、阿里云和火山引擎三种数据源。',
        placement: 'bottom',
        beforeStepChange: () => {
          // Ensure in type selection phase
          if (selectedType) {
            setSelectedType(null);
            actions.resetWizard();
          }
        },
      },
    ];

    // If data source type is selected, add corresponding steps
    if (selectedType) {
      const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
      if (config) {
        config.steps.forEach((step, index) => {
          steps.push({
            selector: `#wizard-step-${index}`,
            title: step.title,
            content: step.description,
            placement: 'right',
            beforeStepChange: () => {
              // Ensure at correct step
              if (state.currentStep !== index) {
                actions.setCurrentStep(index);
              }
            },
          });
        });
      }
    }

    return steps;
  }, [selectedType, state.currentStep, actions]);

  // Guide configuration
  const guideConfig: IGuide = {
    steps: guideSteps,
    type: 'card',
    mask: true,
    arrow: true,
    hotspot: true,
    closable: true,
    visible: guideVisible,
    localKey: 'datasource-wizard-guide',
    showStepInfo: true,
    showPreviousBtn: true,
    nextText: '下一步',
    prevText: '上一步',
    okText: '完成',
    maskClosable: false,
    onClose: () => {
      setGuideVisible(false);
    },
    afterStepChange: (stepIndex: number, step: IStep) => {
      // Synchronize wizard state based on guide steps
      if (stepIndex === 0) {
        // Return to type selection
        setSelectedType(null);
        actions.resetWizard();
      } else if (selectedType && stepIndex > 0) {
        // Synchronize to corresponding configuration step
        const configStepIndex = stepIndex - 1;
        actions.setCurrentStep(configStepIndex);
      }
    },
  };

  // Handle type selection (integrated with guide)
  const handleGuidedTypeSelect = (type: DataSourceType) => {
    handleTypeSelect(type);
    // Guide to next step
    setGuideVisible(true);
  };

  return (
    <>
      <div className={styles.guidedWizardContainer}>
        {/* X-Guide guide component */}
        <XGuide {...guideConfig} />

        {/* Main content area */}
        <div className={styles.wizardContent}>
          {/* Step content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {selectedType ? (
              <StepContent
                selectedType={selectedType}
                currentStep={state.currentStep}
                state={state}
                actions={actions}
                connects={connects}
              />
            ) : (
              <TypeSelection
                selectedType={selectedType}
                onTypeSelect={handleGuidedTypeSelect}
              />
            )}
          </div>

          {/* Bottom action buttons (using unified component to improve readability) */}
          <FooterActions
            className={styles.wizardFooter}
            showPrev={shouldShowPrevButton()}
            prevText={getPrevButtonText()}
            onPrev={handlePrev}
            canProceed={canProceedToNext()}
            nextText={getNextButtonText()}
            onNext={handleNext}
            stepProgressText={
              selectedType && state.currentStep >= 0
                ? getStepProgressText(selectedType, state.currentStep)
                : undefined
            }
            leftExtras={
              <Button
                type="outline"
                onClick={() => setGuideVisible(!guideVisible)}
                style={{ marginLeft: 8 }}
              >
                {guideVisible ? '关闭引导' : '开启引导'}
              </Button>
            }
            rightExtras={null}
          />
        </div>
      </div>

      {/* Creation confirmation modal */}
      {CreationConfirmModalComponent}
    </>
  );
};

export default GuidedWizard;
