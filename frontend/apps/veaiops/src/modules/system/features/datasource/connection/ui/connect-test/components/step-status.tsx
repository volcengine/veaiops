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
 * Step status component
 */

import { Steps } from '@arco-design/web-react';
import type React from 'react';
import { type StepStatus as StepStatusType, TestStep } from '../types';

const { Step } = Steps;

export interface StepStatusProps {
  currentStep: TestStep;
  testing: boolean;
}

export const StepStatus: React.FC<StepStatusProps> = ({
  currentStep,
  testing,
}) => {
  const getStepStatus = (stepIndex: TestStep): StepStatusType => {
    if (stepIndex < currentStep) {
      return 'finish';
    }
    if (stepIndex === currentStep) {
      return testing ? 'process' : 'wait';
    }
    return 'wait';
  };

  return (
    <Steps current={currentStep} style={{ marginBottom: 24 }}>
      <Step
        title="填写连接参数"
        description="输入连接所需的认证信息"
        status={getStepStatus(TestStep.FORM)}
      />
      <Step
        title="测试连接"
        description="验证连接是否可用"
        status={getStepStatus(TestStep.TEST)}
      />
    </Steps>
  );
};
