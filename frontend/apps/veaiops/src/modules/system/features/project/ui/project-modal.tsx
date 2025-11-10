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
  DatePicker,
  Divider,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
} from '@arco-design/web-react';
import {
  PROJECT_MANAGEMENT_CONFIG,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_VALIDATION_RULES,
  type ProjectFormData,
  type ProjectModalProps,
} from '@project';
import type React from 'react';

const { Row, Col } = Grid;

/**
 * Project modal component
 * Supports create and edit project functionality
 */
export const ProjectModal: React.FC<ProjectModalProps> = ({
  visible,
  editingProject,
  onCancel,
  onSubmit,
  form,
}) => {
  const isEditing = Boolean(editingProject);

  const handleOk = async () => {
    try {
      const values = await form.validate();

      // Convert date format
      const formData: ProjectFormData = {
        ...values,
        start_date: values.start_date
          ? new Date(values.start_date).toISOString().split('T')[0]
          : '',
        end_date: values.end_date
          ? new Date(values.end_date).toISOString().split('T')[0]
          : '',
      };

      await onSubmit(formData);
    } catch (error) {
      // Errors are handled in Hook, silently handle here
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? '编辑项目' : '新建项目'}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      style={{ width: 720 }}
      maskClosable={false}
      okText={isEditing ? '保存' : '创建'}
      cancelText="取消"
    >
      <Form form={form} layout="vertical" scrollToFirstError>
        {/* Basic information */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-gray-900 mb-3">基本信息</h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="项目名称"
                field="name"
                rules={[
                  {
                    required: PROJECT_VALIDATION_RULES.name.required,
                    message: '请输入项目名称',
                  },
                  {
                    maxLength: PROJECT_VALIDATION_RULES.name.maxLength,
                    message: `项目名称不能超过${PROJECT_VALIDATION_RULES.name.maxLength}个字符`,
                  },
                ]}
              >
                <Input
                  placeholder="请输入项目名称"
                  maxLength={PROJECT_VALIDATION_RULES.name.maxLength}
                  showWordLimit
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="负责人"
                field="owner"
                rules={[
                  {
                    maxLength: PROJECT_MANAGEMENT_CONFIG.maxOwnerLength,
                    message: `负责人名称不能超过${PROJECT_MANAGEMENT_CONFIG.maxOwnerLength}个字符`,
                  },
                ]}
              >
                <Input
                  placeholder="请输入负责人"
                  maxLength={PROJECT_MANAGEMENT_CONFIG.maxOwnerLength}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="项目描述"
            field="description"
            rules={[
              {
                maxLength: PROJECT_MANAGEMENT_CONFIG.maxDescriptionLength,
                message: `描述不能超过${PROJECT_MANAGEMENT_CONFIG.maxDescriptionLength}个字符`,
              },
            ]}
          >
            <Input.TextArea
              placeholder="请输入项目描述"
              rows={3}
              maxLength={PROJECT_MANAGEMENT_CONFIG.maxDescriptionLength}
              showWordLimit
            />
          </Form.Item>
        </div>

        <Divider />

        {/* Project configuration */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-gray-900 mb-3">项目配置</h4>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="项目状态"
                field="status"
                rules={[{ required: true, message: '请选择项目状态' }]}
              >
                <Select placeholder="请选择项目状态">
                  {PROJECT_STATUS_OPTIONS.slice(1).map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="优先级"
                field="priority"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  {PROJECT_PRIORITY_OPTIONS.slice(1).map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="项目进度"
                field="progress"
                rules={[
                  {
                    type: 'number',
                    min: PROJECT_MANAGEMENT_CONFIG.minProgress,
                    max: PROJECT_MANAGEMENT_CONFIG.maxProgress,
                    message: `进度必须在${PROJECT_MANAGEMENT_CONFIG.minProgress}-${PROJECT_MANAGEMENT_CONFIG.maxProgress}之间`,
                  },
                ]}
              >
                <InputNumber
                  placeholder="请输入项目进度"
                  min={PROJECT_MANAGEMENT_CONFIG.minProgress}
                  max={PROJECT_MANAGEMENT_CONFIG.maxProgress}
                  suffix="%"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Time and budget */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-gray-900 mb-3">
            时间和预算
          </h4>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="开始时间" field="start_date">
                <DatePicker
                  placeholder="请选择开始时间"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="结束时间" field="end_date">
                <DatePicker
                  placeholder="请选择结束时间"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="预算金额"
                field="budget"
                rules={[
                  {
                    type: 'number',
                    min: 0,
                    max: PROJECT_MANAGEMENT_CONFIG.maxBudget,
                    message: `预算不能超过${PROJECT_MANAGEMENT_CONFIG.maxBudget}元`,
                  },
                ]}
              >
                <InputNumber
                  placeholder="请输入预算金额"
                  min={0}
                  max={PROJECT_MANAGEMENT_CONFIG.maxBudget}
                  prefix="¥"
                  style={{ width: '100%' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => (value || '').replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Other settings */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-3">其他设置</h4>

          <Form.Item
            label="是否激活"
            field="is_active"
            triggerPropName="checked"
            tooltip="激活状态的项目将显示在项目列表中"
          >
            <Switch checkedText="激活" uncheckedText="禁用" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectModal;
