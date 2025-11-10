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

import { Button, Drawer, Form, Input, Space } from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { DrawerFormContent, useDrawerFormSubmit } from '@veaiops/utils';
import type React from 'react';

interface ProjectCreateDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: { project_id: string; name: string }) => Promise<boolean>;
  loading?: boolean;
}

/**
 * Create project drawer component
 */
export const ProjectCreateDrawer: React.FC<ProjectCreateDrawerProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  // Use common drawer form submit Hook
  const { submitting, handleSubmit } = useDrawerFormSubmit({
    form,
    onSubmit,
    resetOnSuccess: true,
    closeOnSuccess: true,
    onClose,
  });

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      width={560}
      title="Create Project"
      visible={visible}
      onCancel={handleClose}
      focusLock={false}
      footer={
        <div className="text-right">
          <Space>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting || Boolean(loading)}
            >
              Create
            </Button>
          </Space>
        </div>
      }
      maskClosable={false}
    >
      <DrawerFormContent loading={submitting || Boolean(loading)}>
        <div className="p-6">
          <Form
            form={form}
            layout="vertical"
            scrollToFirstError
            autoComplete="off"
          >
            {/* Tip information */}
            <div className="px-4 py-3 rounded-lg border border-[#bedaff] mb-6 flex items-start gap-2 bg-[#f0f6ff]">
              <IconInfoCircle className="text-base text-[#165dff] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#4e5969] leading-relaxed">
                Project ID and project name are required fields. Project ID cannot be modified after creation.
              </div>
            </div>

            {/* Project ID */}
            <Form.Item
              label="Project ID"
              field="project_id"
              rules={[
                {
                  required: true,
                  message: 'Please enter project ID',
                },
                {
                  validator: (value, callback) => {
                    if (!value) {
                      callback();
                      return;
                    }
                    // Validate project ID format: only allow letters, numbers, underscores, and hyphens
                    const regex = /^[a-zA-Z0-9_-]+$/;
                    if (!regex.test(value)) {
                      callback('Project ID can only contain letters, numbers, underscores, and hyphens');
                    } else if (value.length < 2) {
                      callback('Project ID must be at least 2 characters long');
                    } else if (value.length > 64) {
                      callback('Project ID cannot exceed 64 characters');
                    } else {
                      callback();
                    }
                  },
                },
              ]}
              extra="Unique identifier for the project, cannot be modified after creation"
            >
              <Input
                placeholder="Please enter project ID, e.g., proj_001"
                maxLength={64}
                showWordLimit
              />
            </Form.Item>

            {/* Project name */}
            <Form.Item
              label="Project Name"
              field="name"
              rules={[
                {
                  required: true,
                  message: 'Please enter project name',
                },
                {
                  maxLength: 100,
                  message: 'Project name cannot exceed 100 characters',
                },
                {
                  validator: (value, callback) => {
                    if (!value) {
                      callback();
                      return;
                    }
                    if (value.trim().length === 0) {
                      callback('Project name cannot be blank');
                    } else {
                      callback();
                    }
                  },
                },
              ]}
              extra="Display name for the project, can contain Chinese characters"
            >
              <Input
                placeholder="Please enter project name, e.g., Example Project"
                maxLength={100}
                showWordLimit
              />
            </Form.Item>
          </Form>
        </div>
      </DrawerFormContent>
    </Drawer>
  );
};

export default ProjectCreateDrawer;
