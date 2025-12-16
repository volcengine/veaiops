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

import { Tooltip } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import type React from 'react';

/**
 * 标签列渲染组件
 */
export const LabelsColumn: React.FC<{
  labels: Record<string, string>;
}> = ({ labels }) => {
  if (!labels || Object.keys(labels).length === 0) {
    return <span className="text-[#999]">-</span>;
  }

  return (
    <div className="space-y-1">
      {Object.entries(labels).map(([key, value]) => (
        <div key={key} className="text-sm">
          <Tooltip content={`${key}: ${value}`}>
            <span style={{ display: 'inline-block', maxWidth: '100%' }}>
              <CellRender.CustomOutlineTag maxWidth={220} ellipsis>
                {`${key}: ${value}`}
              </CellRender.CustomOutlineTag>
            </span>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};
