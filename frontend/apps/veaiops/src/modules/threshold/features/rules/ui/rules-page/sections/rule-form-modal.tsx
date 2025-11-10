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

import { type Form, Modal } from '@arco-design/web-react';
import type { ThresholdRule } from '@threshold/shared/types/rules';
import type React from 'react';
// TODO: RuleFormSimple component needs to be created or imported from correct location
// import { RuleFormSimple } from '../../rules-form-simple';

/**
 * Rule form modal component
 */
export const RuleFormModal: React.FC<{
  visible: boolean;
  editingRule: ThresholdRule | null;
  loading: boolean;
  form: ReturnType<typeof Form.useForm>[0];
  onSubmit: () => void;
  onCancel: () => void;
}> = ({ visible, editingRule, loading, form, onSubmit, onCancel }) => {
  return (
    <Modal
      title={editingRule ? '编辑规则' : '新建规则'}
      visible={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="保存"
      cancelText="取消"
      style={{ width: 800 }}
      confirmLoading={loading}
    >
      {/* TODO: RuleFormSimple component needs to be created or imported from correct location */}
      {/* <RuleFormSimple form={form} editingRule={editingRule} /> */}
      <div>Rule form content placeholder</div>
    </Modal>
  );
};
