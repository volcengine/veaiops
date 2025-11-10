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
  Button,
  Card,
  Divider,
  Drawer,
  type FormInstance,
  Space,
} from '@arco-design/web-react';
import { DrawerFormContent, useDrawerFormSubmit } from '@veaiops/utils';
import type { AgentTemplate } from 'api-generate';
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
  // Use common drawer form submit Hook
  const { submitting, handleSubmit } = useDrawerFormSubmit({
    form,
    onSubmit,
    resetOnSuccess: true,
    closeOnSuccess: false, // Don't auto-close, controlled by parent component
  });

  return (
    <Drawer
      title={editingTemplate ? '编辑卡片模版' : '新建卡片模版'}
      visible={visible}
      onCancel={onCancel}
      width={1000}
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={submitting}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            保存
          </Button>
        </Space>
      }
    >
      <DrawerFormContent loading={submitting}>
        <Card title="操作指引" size="small">
          <StepCard />
        </Card>

        <Divider />
        <Card title="填写模版信息" className={'mt-5'} size="small">
          <CardTemplateForm form={form} />
        </Card>
      </DrawerFormContent>
    </Drawer>
  );
};
export default CardTemplateDrawer;
