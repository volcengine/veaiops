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

/**
 * Metric template management configuration
 */
export const METRIC_TEMPLATE_MANAGEMENT_CONFIG = {
  // Table configuration
  table: {
    pageSize: 10,
    pageSizeOptions: ["10", "20", "50", "100"],
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },

  // Search configuration
  search: {
    placeholder: "请输入模板名称或指标名称",
    debounceTime: 300,
  },

  // Modal configuration
  modal: {
    width: 1000,
    destroyOnClose: true,
  },

  // Drawer configuration
  drawer: {
    width: 800,
    destroyOnClose: true,
    placement: "right" as const,
  },

  // Form configuration
  form: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },

  // Action button configuration
  actions: {
    create: {
      text: "新建模板",
      type: "primary" as const,
    },
    edit: {
      text: "编辑",
      type: "text" as const,
    },
    delete: {
      text: "删除",
      type: "text" as const,
      status: "danger" as const,
    },
    view: {
      text: "查看",
      type: "text" as const,
    },
  },

  // Message prompt configuration
  messages: {
    create: {
      success: "创建指标模板成功",
      error: "创建指标模板失败",
    },
    update: {
      success: "更新指标模板成功",
      error: "更新指标模板失败",
    },
    delete: {
      success: "删除指标模板成功",
      error: "删除指标模板失败",
      confirm: "确定要删除这个指标模板吗？",
    },
    fetch: {
      error: "获取指标模板列表失败",
    },
  },
} as const;

/**
 * Default metric template filter parameters
 */
export const DEFAULT_FILTER_PARAMS = {
  skip: 0,
  limit: 10,
} as const;

/**
 * Form validation rules
 */
export const FORM_RULES = {
  name: [
    { required: true, message: "请输入指标模板名称" },
    { minLength: 2, message: "指标模板名称至少2个字符" },
    { maxLength: 50, message: "指标模板名称不能超过50个字符" },
  ],
  metricType: [{ required: true, message: "请选择指标模板类型" }],
  minValue: [
    { required: true, message: "请输入指标最小值" },
    { type: "number", message: "指标最小值必须是数字" },
  ],
  maxValue: [
    { required: true, message: "请输入指标最大值" },
    { type: "number", message: "指标最大值必须是数字" },
  ],
  normalRangeStart: [
    { required: true, message: "请输入默认阈值下界" },
    { type: "number", message: "默认阈值下界必须是数字" },
  ],
  normalRangeEnd: [
    { required: true, message: "请输入默认阈值上界" },
    { type: "number", message: "默认阈值上界必须是数字" },
  ],
} as const;
