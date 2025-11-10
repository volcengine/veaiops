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
 * Selection alert component
 * @description Displays alert information for selected metric
 */

import { Alert } from '@arco-design/web-react';
import type React from 'react';
import type { AliyunMetric } from '../../../../types';

interface SelectionAlertProps {
  selectedMetric: AliyunMetric | null;
}

export const SelectionAlert: React.FC<SelectionAlertProps> = ({
  selectedMetric,
}) => {
  if (!selectedMetric) {
    return null;
  }

  return (
    <Alert
      className={'mt-2'}
      type="success"
      content={`已选择指标: ${selectedMetric.metricName}`}
      showIcon
      closable={false}
    />
  );
};
