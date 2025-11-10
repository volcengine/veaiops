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

import type { TableAlertConfig } from '@/custom-table/types';
/**
 * Table alert message Hook
 */
import { type ReactNode, useCallback, useState } from 'react';
import { DEFAULT_TABLE_ALERT_CONFIG } from '../config';

export interface UseAlertProps {
  isAlertShow?: boolean;
  customAlertNode?: ReactNode;
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertContent?: ReactNode | string;
  config?: TableAlertConfig;
}

export const useAlert = ({
  isAlertShow = false,
  customAlertNode,
  alertType = 'info',
  alertContent,
  config = {},
}: UseAlertProps) => {
  const { defaultType = 'info' } = { ...DEFAULT_TABLE_ALERT_CONFIG, ...config };

  // Alert message state
  const [alertVisible, setAlertVisible] = useState(isAlertShow);
  const [currentAlertType, setCurrentAlertType] = useState(
    alertType || defaultType,
  );
  const [currentAlertContent, setCurrentAlertContent] = useState<
    ReactNode | string
  >(alertContent || '');

  // Show alert message
  const showAlert = useCallback(
    (
      content: ReactNode | string,
      type: 'info' | 'success' | 'warning' | 'error' = defaultType,
    ) => {
      setCurrentAlertContent(content);
      setCurrentAlertType(type);
      setAlertVisible(true);
    },
    [defaultType],
  );

  // Hide alert message
  const hideAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  return {
    isAlertShow: alertVisible,
    alertType: currentAlertType,
    alertContent: currentAlertContent,
    customAlertNode,
    showAlert,
    hideAlert,
  };
};
