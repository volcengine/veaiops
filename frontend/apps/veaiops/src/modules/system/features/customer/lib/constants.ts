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
 * Customer management constant definitions
 */

// Customer status configuration
export const CUSTOMER_STATUS_CONFIG = {
  active: { color: "green", text: "活跃" },
  inactive: { color: "gray", text: "非活跃" },
  pending: { color: "orange", text: "待审核" },
  suspended: { color: "red", text: "已暂停" },
} as const;

// Customer type configuration
export const CUSTOMER_TYPE_CONFIG = {
  enterprise: { text: "企业客户" },
  individual: { text: "个人客户" },
  partner: { text: "合作伙伴" },
  trial: { text: "试用客户" },
} as const;

// Customer level configuration
export const CUSTOMER_LEVEL_CONFIG = {
  vip: { text: "VIP客户", color: "gold" },
  premium: { text: "高级客户", color: "purple" },
  standard: { text: "标准客户", color: "blue" },
  basic: { text: "基础客户", color: "gray" },
} as const;

// Customer management configuration
export const CUSTOMER_MANAGEMENT_CONFIG = {
  title: '客户管理',
  pageSize: 10,
  maxNameLength: 100,
  maxDescriptionLength: 500,
  maxAddressLength: 200,
} as const;

// Customer status options
export const CUSTOMER_STATUS_OPTIONS = [
  { label: "全部", value: "" },
  { label: "活跃", value: "active" },
  { label: "非活跃", value: "inactive" },
  { label: "待审核", value: "pending" },
  { label: "已暂停", value: "suspended" },
];

// Customer type options
export const CUSTOMER_TYPE_OPTIONS = [
  { label: "全部", value: "" },
  { label: "企业客户", value: "enterprise" },
  { label: "个人客户", value: "individual" },
  { label: "合作伙伴", value: "partner" },
  { label: "试用客户", value: "trial" },
];

// Customer level options
export const CUSTOMER_LEVEL_OPTIONS = [
  { label: "全部", value: "" },
  { label: "VIP客户", value: "vip" },
  { label: "高级客户", value: "premium" },
  { label: "标准客户", value: "standard" },
  { label: "基础客户", value: "basic" },
];

// Import file configuration
export const IMPORT_FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [".xlsx", ".xls", ".csv"],
  templateColumns: [
    "name",
    "contact",
    "email",
    "phone",
    "company",
    "address",
    "type",
    "level",
    "description",
  ],
} as const;
