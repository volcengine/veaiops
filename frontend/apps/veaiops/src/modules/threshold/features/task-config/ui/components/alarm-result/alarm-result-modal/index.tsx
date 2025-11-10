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

import { Button, Modal } from '@arco-design/web-react';
import type React from 'react';
import styles from '../alarm-result-modal.module.less';
import { OperationDetails, SummaryCard } from './components';
import { useErrorHandler, useFormattedData } from './hooks';
import type { AlarmResultModalProps } from './types';

/**
 * Alarm rule creation result detail modal component
 *
 * Features:
 * - Uses gradient background and card-style design to enhance visual appeal
 * - Hierarchical display of statistics and detailed operation results
 * - Uses icons and color coding to optimize visual presentation
 * - Supports special rendering of error information
 * - Provides history record viewing entry
 */
export const AlarmResultModal: React.FC<AlarmResultModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  // Format data
  const formattedData = useFormattedData(data);

  // Error handling
  const { handleCopyError } = useErrorHandler();

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <span className="text-2xl">🚨</span>
          告警规则创建详情
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          知道了
        </Button>
      }
      style={{ width: 800 }}
      maskClosable={false}
      className={styles.alarmResultModal}
    >
      <div className={styles.modalContent}>
        {formattedData && <SummaryCard data={formattedData} />}
        {formattedData && (
          <OperationDetails
            data={formattedData}
            onCopyError={handleCopyError}
          />
        )}
      </div>
    </Modal>
  );
};

export default AlarmResultModal;
