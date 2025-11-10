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
 * Account management module constant configuration
 * @description Constant definitions and configuration related to account management
 */

import type { UserRole, UserStatus } from '@account';

/**
 * User role configuration
 */
export const USER_ROLE_CONFIG = {
  admin: {
    text: "管理员",
    color: "red",
    description: "系统管理员，拥有所有权限",
  },
  user: {
    text: "普通用户",
    color: "blue",
    description: "普通用户，拥有基础功能权限",
  },
  viewer: {
    text: "只读用户",
    color: "gray",
    description: "只读用户，仅可查看数据",
  },
} as const;

/**
 * User status configuration
 */
export const USER_STATUS_CONFIG = {
  active: {
    text: "正常",
    color: "green",
    description: "用户状态正常，可以正常使用系统",
  },
  inactive: {
    text: "未激活",
    color: "orange",
    description: "用户未激活，需要激活后才能使用",
  },
  locked: {
    text: "已锁定",
    color: "red",
    description: "用户已被锁定，无法登录系统",
  },
} as const;

/**
 * User role options
 */
export const USER_ROLE_OPTIONS = [
  { label: "全部角色", value: "" },
  { label: "管理员", value: "admin" },
  { label: "普通用户", value: "user" },
  { label: "只读用户", value: "viewer" },
] as const;

/**
 * User status options
 */
export const USER_STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "正常", value: "active" },
  { label: "未激活", value: "inactive" },
  { label: "已锁定", value: "locked" },
] as const;

/**
 * User permissions configuration
 */
export const USER_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canManageRoles: true,
    canResetPassword: true,
    canLockUnlock: true,
  },
  user: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canManageRoles: false,
    canResetPassword: false,
    canLockUnlock: false,
  },
  viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canManageRoles: false,
    canResetPassword: false,
    canLockUnlock: false,
  },
} as const;

/**
 * Account management configuration
 */
export const ACCOUNT_MANAGEMENT_CONFIG = {
  // Table configuration
  table: {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },

  // Form configuration
  form: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },

  // Password configuration
  password: {
    minLength: 8,
    maxLength: 32,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },

  // Username configuration
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },

  // Email configuration
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

/**
 * User validation rules
 */
export const USER_VALIDATION_RULES = {
  username: [
    { required: true, message: "请输入用户名" },
    {
      minLength: ACCOUNT_MANAGEMENT_CONFIG.username.minLength,
      message: `用户名至少${ACCOUNT_MANAGEMENT_CONFIG.username.minLength}个字符`,
    },
    {
      maxLength: ACCOUNT_MANAGEMENT_CONFIG.username.maxLength,
      message: `用户名最多${ACCOUNT_MANAGEMENT_CONFIG.username.maxLength}个字符`,
    },
    {
      match: ACCOUNT_MANAGEMENT_CONFIG.username.pattern,
      message: "用户名只能包含字母、数字、下划线和中划线",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱地址" },
    {
      match: ACCOUNT_MANAGEMENT_CONFIG.email.pattern,
      message: "请输入有效的邮箱地址",
    },
  ],
  password: [
    { required: true, message: "请输入密码" },
    {
      minLength: ACCOUNT_MANAGEMENT_CONFIG.password.minLength,
      message: `密码至少${ACCOUNT_MANAGEMENT_CONFIG.password.minLength}个字符`,
    },
    {
      maxLength: ACCOUNT_MANAGEMENT_CONFIG.password.maxLength,
      message: `密码最多${ACCOUNT_MANAGEMENT_CONFIG.password.maxLength}个字符`,
    },
  ],
  role: [{ required: true, message: "请选择用户角色" }],
  status: [{ required: true, message: "请选择用户状态" }],
} as const;

/**
 * Default user data
 */
export const DEFAULT_USER_DATA = {
  username: "",
  email: "",
  password: "",
  role: "user" as UserRole,
  status: "active" as UserStatus,
  is_system_admin: false,
} as const;

/**
 * Table column width configuration
 */
export const ACCOUNT_TABLE_COLUMNS_WIDTH = {
  username: 150,
  email: 200,
  role: 100,
  status: 100,
  last_login: 180,
  created_at: 180,
  actions: 200,
} as const;

/**
 * Action button configuration
 */
export const ACCOUNT_ACTIONS_CONFIG = {
  edit: {
    text: "编辑",
    icon: "IconEdit",
    type: "primary",
  },
  delete: {
    text: "删除",
    icon: "IconDelete",
    type: "danger",
  },
  resetPassword: {
    text: "重置密码",
    icon: "IconRefresh",
    type: "warning",
  },
  lock: {
    text: "锁定",
    icon: "IconLock",
    type: "warning",
  },
  unlock: {
    text: "解锁",
    icon: "IconUnlock",
    type: "success",
  },
} as const;
