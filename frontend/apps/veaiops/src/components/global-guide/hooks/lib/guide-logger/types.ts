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

import type { FeatureActionType } from '../../lib';

export interface LogParams {
  level: 'info' | 'warn' | 'error';
  category: string;
  action: string;
  data?: any;
}

export interface LogFeatureTypeJudgmentParams {
  featureId: string;
  actionType: FeatureActionType;
  selector: string;
  tooltipContent: string;
}

export interface LogDirectActionParams {
  featureId: string;
  selector: string;
  success: boolean;
  error?: string;
}

export interface LogNavigationJumpParams {
  featureId: string;
  fromRoute: string;
  toRoute: string;
  success: boolean;
  error?: string;
}

export interface LogElementWaitParams {
  featureId: string;
  selector: string;
  success: boolean;
  waitTime: number;
  error?: string;
}

export interface LogHighlightGuideParams {
  featureId: string;
  selector: string;
  success: boolean;
  scrollTime: number;
  error?: string;
}

export interface LogUserInteractionParams {
  featureId: string;
  actionType: FeatureActionType;
  userAction: string;
  success: boolean;
  data?: any;
}

export interface LogPerformanceParams {
  featureId: string;
  actionType: FeatureActionType;
  metrics: {
    totalTime: number;
    waitTime?: number;
    scrollTime?: number;
    guideTime?: number;
  };
}

export interface LogErrorParams {
  category: string;
  action: string;
  error: Error | string;
  context?: any;
}

