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

import { Button, Space } from '@arco-design/web-react';
import { IconEdit, IconEye } from '@arco-design/web-react/icon';
import type { Interest } from 'api-generate';
import type React from 'react';

/**
 * Actions column render component
 */
export const OncallActionsColumn: React.FC<{
  record: Interest;
  onViewDetails: (rule: Interest) => void;
  onEdit?: (rule: Interest) => void;
}> = ({ record, onViewDetails, onEdit }) => (
  <Space>
    {onEdit && (
      <Button
        type="text"
        size="small"
        icon={<IconEdit />}
        onClick={() => onEdit(record)}
        data-testid="edit-oncall-rule-btn"
      >
        编辑
      </Button>
    )}
    <Button
      type="text"
      size="small"
      icon={<IconEye />}
      onClick={() => onViewDetails(record)}
      data-testid="view-oncall-rule-details-btn"
    >
      查看详情
    </Button>
  </Space>
);
