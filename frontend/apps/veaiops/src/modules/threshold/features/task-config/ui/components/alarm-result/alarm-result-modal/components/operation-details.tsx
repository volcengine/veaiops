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

import { Typography } from '@arco-design/web-react';
import type React from 'react';
import styles from '../../alarm-result-modal.module.less';
import type { FormattedAlarmResultData } from '../types';
import { OperationCard } from './operation-card';

const { Text } = Typography;

interface OperationDetailsProps {
  data: FormattedAlarmResultData;
  onCopyError: (error: string) => void;
}

/**
 * Operation details section
 */
export const OperationDetails: React.FC<OperationDetailsProps> = ({
  data,
  onCopyError,
}) => {
  if (!data?.rule_operations) {
    return null;
  }

  const { rule_operations } = data;
  const hasOperations =
    rule_operations.create.length > 0 ||
    rule_operations.update.length > 0 ||
    rule_operations.delete.length > 0 ||
    rule_operations.failed.length > 0;

  if (!hasOperations) {
    return (
      <div className={styles.emptyState}>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          暂无详细操作信息
        </Text>
      </div>
    );
  }

  return (
    <div>
      <OperationCard
        title="成功创建"
        operations={rule_operations.create}
        type="create"
        icon="✅"
        onCopyError={onCopyError}
      />
      <OperationCard
        title="成功更新"
        operations={rule_operations.update}
        type="update"
        icon="🔄"
        onCopyError={onCopyError}
      />
      <OperationCard
        title="成功删除"
        operations={rule_operations.delete}
        type="delete"
        icon="🗑️"
        onCopyError={onCopyError}
      />
      <OperationCard
        title="操作失败"
        operations={rule_operations.failed}
        type="failed"
        icon="❌"
        onCopyError={onCopyError}
      />
    </div>
  );
};
