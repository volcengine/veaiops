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
 * Form submission logic Hook
 */

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type { DataSourceType } from 'api-generate';
import { useCallback, useState } from 'react';
import { useConnectionTestLogic } from './use-connection-test-logic';

interface UseFormSubmissionProps {
  type: DataSourceType;
  initialValues?: any;
  onSubmit: (values: any) => Promise<boolean>;
  onTestFailure?: (error: string) => void;
}

export const useFormSubmission = ({
  type,
  initialValues,
  onSubmit,
  onTestFailure,
}: UseFormSubmissionProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testError, setTestError] = useState<string>('');
  const [testConnectionData, setTestConnectionData] = useState<any>(null);
  const [externalTestResult, setExternalTestResult] = useState<any>(null);

  const { executeConnectionTest, validatePassword, clearResult } =
    useConnectionTestLogic({ type });

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (form: any): Promise<boolean> => {
      try {
        const values = await form.validate();

        // In edit mode, ensure connection name is included (even if field is disabled)
        if (initialValues?.name && !values.name) {
          values.name = initialValues.name;
        }

        setSubmitting(true);

        // Check if password is filled
        const missingField = validatePassword(values);
        if (missingField) {
          Message.error(`请输入${missingField}`);
          return false;
        }

        // Test connection before submission
        Message.info('正在测试连接...');

        // Execute connection test
        const testResult = await executeConnectionTest(values);

        if (!testResult.success) {
          // Clear error banner at top of page to avoid duplicate display
          clearResult();
          // Show test failure modal, block subsequent submission
          const errorMessage =
            testResult.message ||
            'Connection test failed, please check configuration and retry';
          setTestError(errorMessage);
          setTestConnectionData({
            _id: initialValues?._id || 'temp',
            name: values.name,
            type,
            is_active: values.is_active ?? true,
            ...values,
          });
          setExternalTestResult(testResult);
          setTestModalVisible(true);
          onTestFailure?.(errorMessage);
          return false;
        }

        Message.success('连接测试成功，正在提交...');

        // Submit data
        const success = await onSubmit(values);
        return success;
      } catch (error: unknown) {
        // ✅ Correct: Extract actual error information
        // Form validation failed or connection test failed
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMsg = errorObj.message || 'Operation failed';
        Message.error(errorMsg);
        logger.error({
          message: 'Connection form submission failed',
          data: {
            error: errorMsg,
            stack: errorObj.stack,
            errorObj,
            type,
          },
          source: 'useFormSubmission',
          component: 'handleSubmit',
        });
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [
      type,
      initialValues,
      validatePassword,
      executeConnectionTest,
      clearResult,
      onSubmit,
      onTestFailure,
    ],
  );

  /**
   * Close test failure modal
   */
  const handleTestModalClose = useCallback(() => {
    setTestModalVisible(false);
    setTestError('');
    setTestConnectionData(null);
    setExternalTestResult(null);
  }, []);

  return {
    submitting,
    testModalVisible,
    testError,
    testConnectionData,
    externalTestResult,
    handleSubmit,
    handleTestModalClose,
  };
};
