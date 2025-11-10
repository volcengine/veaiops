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
 * Next step guard validation (modularized)
 * @description Provides common "next step" guard validation for GuidedWizard / DataSourceWizard, improving readability and reusability
 * - Includes Region validation for Aliyun and Volcengine at the metric step
 * - Can be extended in this file for other data sources and step validations
 */

import { Modal } from '@arco-design/web-react';

import React from 'react';
import { AliyunRegionPrompt, VolcengineRegionPrompt } from '../../steps/shared';
import type { WizardState } from '../../types';
import { DataSourceType } from '../../types';

/**
 * Region guard parameters
 */
export interface RegionGuardParams {
  selectedType: DataSourceType | null;
  currentStepKey: string;
  state: WizardState;
}

/**
 * Aliyun connect step Region guard validation
 * @description Region input has been moved to the connection selection step, validated after connection selection is complete
 * @returns boolean - true: validation passed; false: validation failed (modal already shown)
 */
export const guardAliyunConnectRegion = ({
  selectedType,
  currentStepKey,
  state,
}: RegionGuardParams): boolean => {
  if (selectedType === DataSourceType.ALIYUN && currentStepKey === 'connect') {
    // Read from state.aliyun.region (entered by user in connection selection step)
    const region = (state.aliyun.region || '').trim();
    if (!region) {
      Modal.confirm({
        title: '请填写 Region',
        content: <AliyunRegionPrompt />,
        okText: '返回填写',
        cancelButtonProps: { style: { display: 'none' }, disabled: true },
      });

      return false;
    }
  }
  return true;
};

/**
 * Volcengine connect step Region guard validation
 * @description Region input has been moved to the connection selection step, validated after connection selection is complete
 * @returns boolean - true: validation passed; false: validation failed (modal already shown)
 */
export const guardVolcengineConnectRegion = ({
  selectedType,
  currentStepKey,
  state,
}: RegionGuardParams): boolean => {
  if (
    selectedType === DataSourceType.VOLCENGINE &&
    currentStepKey === 'connect'
  ) {
    const region = (state.volcengine.region || '').trim();
    if (!region) {
      Modal.confirm({
        title: '请填写 Region',
        content: <VolcengineRegionPrompt />,
        okText: '返回填写',
        cancelButtonProps: { style: { display: 'none' }, disabled: true },
      });

      return false;
    }
  }
  return true;
};
