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
 * Step content component
 */

import type { Connect, DataSourceType } from 'api-generate';
import type React from 'react';
import { TestStep } from '../types';
import type { TestStatus } from './constants';
import { ErrorSection } from './error-section';
import { PasswordForm } from './password-form';
import { TestStatusSection } from './test-status-section';
import type { PasswordFormRef } from './types';

export interface StepContentProps {
  currentStep: TestStep;
  connectType: DataSourceType;
  connect?: Connect;
  currentStatus: TestStatus;
  currentTestResult: any;
  passwordFormRef: React.RefObject<PasswordFormRef>;
  onPasswordFormSubmit: (params: any) => void;
  onPasswordFormCancel: () => void;
}

export const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  connectType,
  connect,
  currentStatus,
  currentTestResult,
  passwordFormRef,
  onPasswordFormSubmit,
  onPasswordFormCancel,
}) => {
  switch (currentStep) {
    case TestStep.FORM:
      return (
        <PasswordForm
          ref={passwordFormRef}
          connectType={connectType}
          connect={connect}
          onSubmit={onPasswordFormSubmit}
          onCancel={onPasswordFormCancel}
          loading={false}
          showButtons={false}
        />
      );
    case TestStep.TEST:
      return (
        <div>
          <TestStatusSection status={currentStatus} />
          {currentTestResult && !currentTestResult.success && (
            <ErrorSection testResult={currentTestResult} />
          )}
        </div>
      );
    default:
      return null;
  }
};
