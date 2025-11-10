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
 * Connection test modal related hooks
 */

import { useConnectionTest } from '@/hooks/use-connection-test';
import { useEffect } from 'react';
import type { TestStatus } from './constants';

export interface UseConnectTestModalProps {
  visible: boolean;
  connectId?: string;
  externalTestResult?: any;
  externalTesting?: boolean;
}

export const useConnectTestModal = ({
  visible,
  connectId,
  externalTestResult,
  externalTesting = false,
}: UseConnectTestModalProps) => {
  const { testConnection, testing, testResult, clearResult } =
    useConnectionTest();

  // Clear previous results when modal opens (no longer auto-start test)
  useEffect(() => {
    if (visible && !externalTestResult) {
      clearResult();
    }
  }, [visible, clearResult, externalTestResult]);

  // Retry test
  const handleRetry = (customParams?: any) => {
    if (connectId) {
      clearResult();
      testConnection(connectId, customParams);
    }
  };

  // Get current status
  const getCurrentStatus = (): TestStatus => {
    const currentTesting = externalTesting || testing;
    const currentTestResult = externalTestResult || testResult;

    if (currentTesting) {
      return 'loading';
    }
    if (currentTestResult) {
      return currentTestResult.success ? 'success' : 'error';
    }
    return 'idle';
  };

  const currentStatus = getCurrentStatus();
  const currentTestResult = externalTestResult || testResult;

  return {
    currentStatus,
    currentTestResult,
    testing,
    handleRetry,
  };
};
