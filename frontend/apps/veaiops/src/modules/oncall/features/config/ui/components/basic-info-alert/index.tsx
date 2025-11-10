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

import { Alert } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import type React from 'react';

import type { BasicInfoAlertProps } from './types';
import { formatActionCategoryText, formatInspectCategoryText } from './utils';

/**
 * Basic info Alert component
 * Displays read-only information: action category, inspect category, version
 */
export const BasicInfoAlert: React.FC<BasicInfoAlertProps> = ({ rule }) => {
  return (
    <Alert
      type="info"
      title="基本信息"
      content={
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          <div className="flex items-center">
            <span className="text-[#86909c] shrink-0 mr-2">告警类别：</span>
            <CellRender.Ellipsis
              text={formatActionCategoryText(rule.action_category)}
              style={{ fontWeight: 500 }}
            />
          </div>
          <div className="flex items-center">
            <span className="text-[#86909c] shrink-0 mr-2">检测类别：</span>
            <CellRender.Ellipsis
              text={formatInspectCategoryText(rule.inspect_category)}
              style={{ fontWeight: 500 }}
            />
          </div>
          <div className="flex items-center">
            <span className="text-[#86909c] shrink-0 mr-2">版本：</span>
            <CellRender.Ellipsis
              text={`v${rule.version || 1}`}
              style={{ fontWeight: 500 }}
            />
          </div>
        </div>
      }
      style={{ marginBottom: 16 }}
    />
  );
};

export type { BasicInfoAlertProps } from './types';
