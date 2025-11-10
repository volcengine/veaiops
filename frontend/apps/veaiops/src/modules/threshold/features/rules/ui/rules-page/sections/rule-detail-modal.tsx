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

import { Modal } from '@arco-design/web-react';
import type { ThresholdRule } from '@threshold/shared/types/rules';
import type React from 'react';

/**
 * Rule detail modal component
 */
export const RuleDetailModal: React.FC<{
  visible: boolean;
  selectedRule: ThresholdRule | null;
  onCancel: () => void;
}> = ({ visible, selectedRule, onCancel }) => {
  return (
    <Modal
      title="规则详情"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      style={{ width: 600 }}
    >
      {selectedRule && (
        <div>
          <p>
            <strong>规则名称:</strong> {selectedRule.name}
          </p>
          <p>
            <strong>描述:</strong> {selectedRule.description}
          </p>
          <p>
            <strong>状态:</strong> {selectedRule.is_active ? '启用' : '禁用'}
          </p>
          <p>
            <strong>触发次数:</strong> {selectedRule.trigger_count}
          </p>
        </div>
      )}
    </Modal>
  );
};
