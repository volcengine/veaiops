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
 * Metric selection related type definitions
 */

import type { ZabbixTemplateMetric } from 'api-generate';
import type {
  AliyunMetric,
  VolcengineMetric,
  WizardActions,
  WizardState,
} from '../../../types';

export interface AliyunMetricSelectionProps {
  metrics: AliyunMetric[];
  selectedMetric: AliyunMetric | null;
  loading: boolean;
  searchText: string;
  onSearchChange: (value: string) => void;
  actions: WizardActions;
  state: WizardState;
}

export interface RegionInputProps {
  region?: string;
  onRegionChange?: (value: string) => void;
}

export interface MetricSearchProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

export interface GroupBySelectorProps {
  dimensionKeys: string[];
  selectedGroupBy: string[];
  onGroupByChange: (values: string[]) => void;
}

export interface MetricListItemProps {
  metric: AliyunMetric;
  isSelected: boolean;
  selectedGroupBy: string[];
  onMetricSelect: (metric: AliyunMetric) => void;
  onGroupByChange: (values: string[]) => void;
}

export interface MetricListProps {
  metrics: AliyunMetric[];
  selectedMetric: AliyunMetric | null;
  searchText: string;
  selectedGroupBy: string[];
  onMetricSelect: (metric: AliyunMetric) => void;
  onGroupByChange: (values: string[]) => void;
}

export interface SelectionAlertProps {
  selectedMetric: AliyunMetric | null;
}

// Volcengine metric selection component interface
export interface VolcengineMetricSelectionProps {
  metrics: VolcengineMetric[];
  selectedMetric: VolcengineMetric | null;
  loading: boolean;
  searchText: string;
  onSearchChange: (value: string) => void;
  actions: WizardActions;
}

export interface VolcengineMetricListItemProps {
  metric: VolcengineMetric;
  isSelected: boolean;
  onMetricSelect: (metric: VolcengineMetric) => void;
}

export interface VolcengineMetricListProps {
  metrics: VolcengineMetric[];
  selectedMetric: VolcengineMetric | null;
  searchText: string;
  onMetricSelect: (metric: VolcengineMetric) => void;
}

// Zabbix metric selection component interface
export interface ZabbixMetricSelectionProps {
  metrics: ZabbixTemplateMetric[];
  selectedMetric: ZabbixTemplateMetric | null;
  loading: boolean;
  searchText: string;
  onSearchChange: (value: string) => void;
  actions: WizardActions;
}

export interface ZabbixMetricListItemProps {
  metric: ZabbixTemplateMetric;
  isSelected: boolean;
  onMetricSelect: (metric: ZabbixTemplateMetric) => void;
}

export interface ZabbixMetricListProps {
  metrics: ZabbixTemplateMetric[];
  selectedMetric: ZabbixTemplateMetric | null;
  searchText: string;
  onMetricSelect: (metric: ZabbixTemplateMetric) => void;
}
