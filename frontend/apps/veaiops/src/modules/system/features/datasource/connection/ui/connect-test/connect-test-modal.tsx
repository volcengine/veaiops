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
 * Connection test modal component - optimized version
 */

import { Modal } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type { ConnectCreateRequest } from 'api-generate';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ConnectTestModalProps } from '../../../connection/lib';
import {
  ModalFooter,
  ModalHeader,
  StepContent,
  StepStatus,
  useConnectTestModal,
} from './components';
import type { PasswordFormRef } from './components';
import { TestStep } from './types';

export const ConnectTestModal: React.FC<ConnectTestModalProps> = ({
  visible,
  connect,
  onClose,
  externalTestResult,
  externalTesting = false,
}) => {
  const [currentStep, setCurrentStep] = useState(TestStep.FORM);
  const passwordFormRef = useRef<PasswordFormRef>(null);

  const { currentStatus, currentTestResult, testing, handleRetry } =
    useConnectTestModal({
      visible,
      connectId: connect?._id,
      externalTestResult,
      externalTesting,
    });

  const handlePasswordFormSubmit = async (
    params: Partial<ConnectCreateRequest>,
  ) => {
    setCurrentStep(TestStep.TEST);

    if (connect?._id) {
      try {
        handleRetry(params);
      } catch (error: unknown) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '连接测试失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'ConnectTestModal',
          component: 'handlePasswordFormSubmit',
        });
      }
    }
  };

  const handlePasswordFormCancel = () => {
    onClose();
  };

  const handleRetryFromStep2 = () => {
    setCurrentStep(TestStep.FORM);
  };

  const handleClose = () => {
    setCurrentStep(TestStep.FORM);
    onClose();
  };

  const handleNext = () => {
    passwordFormRef.current?.submit();
  };

  // Reset step status
  useEffect(() => {
    if (visible) {
      setCurrentStep(TestStep.FORM);
    }
  }, [visible]);

  if (!connect || !visible) {
    return null;
  }
  return (
    <Modal
      title={<ModalHeader connectName={connect.name} />}
      visible={visible}
      onCancel={handleClose}
      footer={
        <ModalFooter
          currentStep={currentStep}
          testing={testing}
          onClose={handleClose}
          onNext={handleNext}
          onRetry={handleRetryFromStep2}
        />
      }
      style={{
        width: 680,
        borderRadius: 12,
      }}
    >
      <>
        <StepStatus currentStep={currentStep} testing={testing} />
        <StepContent
          currentStep={currentStep}
          // ✅ Fix: Connect.type is already DataSourceType, no type assertion needed
          connectType={connect.type}
          connect={connect}
          currentStatus={currentStatus}
          currentTestResult={currentTestResult}
          passwordFormRef={passwordFormRef}
          onPasswordFormSubmit={handlePasswordFormSubmit}
          onPasswordFormCancel={handlePasswordFormCancel}
        />
      </>
    </Modal>
  );
};
