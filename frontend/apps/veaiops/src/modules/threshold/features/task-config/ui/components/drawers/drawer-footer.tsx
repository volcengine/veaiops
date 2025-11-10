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
import type { FormInstance } from '@arco-design/web-react/es/Form';
import type { OperationType } from '@task-config/lib';
import type React from 'react';
import { getButtonText, isReadOnlyOperation } from '../../utils';

interface TaskDrawerFooterProps {
  operationType: OperationType;
  loading: boolean;
  form: FormInstance;
  onCancel: () => void;
}

/**
 * Task drawer footer button component
 */
export const TaskDrawerFooter: React.FC<TaskDrawerFooterProps> = ({
  operationType,
  loading,
  form,
  onCancel,
}) => {
  // Read-only operations only show close button
  if (isReadOnlyOperation(operationType)) {
    return (
      <Space>
        <Button onClick={onCancel}>关闭</Button>
      </Space>
    );
  }

  // Other operations show cancel and confirm buttons
  return (
    <Space>
      <Button onClick={onCancel} disabled={loading}>
        取消
      </Button>
      <Button type="primary" onClick={() => form.submit()} loading={loading}>
        {getButtonText(operationType)}
      </Button>
    </Space>
  );
};

export default TaskDrawerFooter;
