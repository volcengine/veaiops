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

import type { ProjectStatus, ProjectPriority } from '@project/types';

/**
 * Project management configuration constants
 */
export const PROJECT_MANAGEMENT_CONFIG = {
  title: "Project Management",
  pageSize: 10,
  maxNameLength: 100,
  maxDescriptionLength: 1000,
  maxOwnerLength: 50,
  maxBudget: 10000000, // 10 million
  minProgress: 0,
  maxProgress: 100,
} as const;

/**
 * Project status configuration
 */
export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { text: string; color: string }
> = {
  planning: { text: "Planning", color: "blue" },
  active: { text: "In Progress", color: "green" },
  suspended: { text: "Suspended", color: "orange" },
  completed: { text: "Completed", color: "arcoblue" },
  cancelled: { text: "Cancelled", color: "red" },
} as const;

/**
 * Project priority configuration
 */
export const PROJECT_PRIORITY_CONFIG: Record<
  ProjectPriority,
  { text: string; color: string }
> = {
  low: { text: "Low", color: "gray" },
  medium: { text: "Medium", color: "blue" },
  high: { text: "High", color: "orange" },
  urgent: { text: "Urgent", color: "red" },
} as const;

/**
 * Project status options
 */
export const PROJECT_STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Planning", value: "planning" },
  { label: "In Progress", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;

/**
 * Project priority options
 */
export const PROJECT_PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
] as const;

/**
 * Project table column configuration
 */
export const PROJECT_TABLE_COLUMNS = {
  name: { title: "Project Name", width: 200 },
  status: { title: "Status", width: 100 },
  priority: { title: "Priority", width: 100 },
  owner: { title: "Owner", width: 120 },
  progress: { title: "Progress", width: 120 },
  budget: { title: "Budget", width: 120 },
  start_date: { title: "Start Date", width: 120 },
  end_date: { title: "End Date", width: 120 },
  created_at: { title: "Created At", width: 150 },
  actions: { title: "Actions", width: 200 },
} as const;

/**
 * Project import template fields
 */
export const PROJECT_IMPORT_TEMPLATE_FIELDS = [
  "project_id",
  "name",
  "description",
  "status",
  "priority",
  "owner",
  "start_date",
  "end_date",
  "budget",
  "progress",
] as const;

/**
 * Project validation rules
 */
export const PROJECT_VALIDATION_RULES = {
  name: {
    required: true,
    maxLength: PROJECT_MANAGEMENT_CONFIG.maxNameLength,
  },
  status: {
    required: true,
    enum: ["planning", "active", "suspended", "completed", "cancelled"],
  },
  priority: {
    required: true,
    enum: ["low", "medium", "high", "urgent"],
  },
  budget: {
    min: 0,
    max: PROJECT_MANAGEMENT_CONFIG.maxBudget,
  },
  progress: {
    min: PROJECT_MANAGEMENT_CONFIG.minProgress,
    max: PROJECT_MANAGEMENT_CONFIG.maxProgress,
  },
  start_date: {
    format: "YYYY-MM-DD",
  },
  end_date: {
    format: "YYYY-MM-DD",
  },
} as const;

/**
 * Project progress color configuration
 */
export const PROJECT_PROGRESS_COLORS = {
  low: "#f53f3f", // 0-30% red
  medium: "#ff7d00", // 31-70% orange
  high: "#00b42a", // 71-100% green
} as const;

/**
 * Project budget formatting configuration
 */
export const PROJECT_BUDGET_CONFIG = {
  currency: "¥",
  locale: "zh-CN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
} as const;
