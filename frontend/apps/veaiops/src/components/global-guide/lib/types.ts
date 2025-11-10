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

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';
export type PlatformType = 'volcengine' | 'zabbix' | 'aliyun';

export type FeatureActionType = 'direct' | 'navigation';

export interface FrontendFeature {
  id: string;
  name: string;
  description: string;
  selector: string; // CSS selector for the target element
  tooltipContent?: string; // Content for x-guide tooltip (optional, not needed for direct actions like opening drawers)
  actionType?: FeatureActionType; // 'direct': Directly trigger function | 'navigation': Navigate and highlight guide
  targetRoute?: string; // Target route when actionType is 'navigation' (optional, defaults to step's route)
  placement?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip position, default 'top'
  prerequisiteSteps?: string[]; // Prerequisite step IDs that must be completed before executing current function
  allowDisabled?: boolean; // Whether to allow guide display when element is disabled (default false, some functions like "batch operations" need to prompt user to select items first)
}

export interface GlobalGuideStep {
  number: number;
  title: string;
  description: string;
  route: string;
  icon: string; // Icon name corresponding to the step
  frontendFeatures: FrontendFeature[]; // Frontend feature list
  completionCriteria: string[];
  commonIssues: Array<{
    issue: string;
    solution: string;
    action: string;
  }>;
}

export interface UserProgress {
  connection?: {
    isHealthy: boolean;
    lastChecked?: string;
    issues?: string[];
  };
  datasource?: {
    isValid: boolean;
    type?: PlatformType;
    config?: Record<string, any>;
  };
  metricModel?: {
    isComplete: boolean;
    modelId?: string;
    dimensions?: Record<string, any>;
  };
  metric?: {
    isValid: boolean;
    previewData?: any[];
    quality?: {
      coverage: number;
      gapRate: number;
    };
  };
  task?: {
    isTrained: boolean;
    taskId?: string;
    version?: number;
    results?: any[];
  };
  injection?: {
    isSimulated: boolean;
    platforms?: PlatformType[];
    strategy?: Record<string, any>;
  };
}

export interface GuideConfig {
  steps: GlobalGuideStep[];
  theme: 'light' | 'dark';
  position: 'top' | 'bottom' | 'left' | 'right';
  autoAdvance: boolean;
  showProgress: boolean;
}
