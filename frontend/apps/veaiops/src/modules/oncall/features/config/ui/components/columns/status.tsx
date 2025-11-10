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

import { Popconfirm, Switch } from '@arco-design/web-react';
import type { Interest } from 'api-generate';
import type React from 'react';

/**
 * Status column render component
 */
export const StatusColumn: React.FC<{
  isActive: boolean;
  record: Interest;
  onToggle: (ruleUuid: string, checked: boolean) => void;
}> = ({ isActive, record, onToggle }) => {
  // Type safety: ensure uuid exists
  if (!record.uuid) {
    return null;
  }

  return (
    <Popconfirm
      title={isActive ? '确定要停止此规则吗？' : '确定要启用此规则吗？'}
      onOk={() => onToggle(record.uuid as string, !isActive)}
      okText="确定"
      cancelText="取消"
    >
      <Switch
        checked={isActive}
        checkedText="启用"
        uncheckedText="停止"
        className="cursor-pointer"
        data-testid="toggle-oncall-rule-btn"
      />
    </Popconfirm>
  );
};
