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

import {
  Card,
  Divider,
  Drawer,
  type FormInstance,
} from '@arco-design/web-react';
import type { AgentTemplate } from 'api-generate';
import type React from 'react';
import StepCard from '../step-card';
import CardTemplateForm from './form';

export interface CardTemplateModalProps {
  visible: boolean;
  editingTemplate?: AgentTemplate;
  onCancel: () => void;
  onSubmit: (values: AgentTemplate) => Promise<boolean>;
  form: FormInstance;
}

const CardTemplateDrawer: React.FC<CardTemplateModalProps> = ({
  visible,
  editingTemplate,
  onCancel,
  onSubmit,
  form,
}) => {
  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      const success = await onSubmit(values);
      if (success) {
        // Success handling (close modal and reset form) is done in the hook
      }
    } catch (error) {
      // Form submission errors are handled in the hook, silently handle here
    }
  };
  return (
    <Drawer
      title={editingTemplate ? '编辑卡片模版' : '新建卡片模版'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={1300}
      okText="保存"
    >
      <Card title="操作指引" size="small">
        <StepCard />
      </Card>

      <Divider />
      <Card title="填写模版信息" className={'mt-5'} size="small">
        <CardTemplateForm form={form} />
      </Card>
    </Drawer>
  );
};
export default CardTemplateDrawer;
