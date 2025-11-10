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

import type React from 'react';

/**
 * Intelligent threshold trend data type
 */
export interface ThresholdTrendData {
  period: string;
  success: number;
  failed: number;
}

/**
 * Event trend data type
 */
export interface EventTrendData {
  period: string;
  count: number;
}

/**
 * Message trend data type
 */
export interface MessageTrendData {
  period: string;
  count: number;
}

/**
 * System resource overview item type
 */
export interface SystemOverviewItem {
  name: string;
  value: number;
  icon: React.ReactNode;
}

/**
 * System resource overview data type
 */
export interface SystemOverviewData {
  category: string;
  items: SystemOverviewItem[];
}

/**
 * Statistics data check result type
 */
export interface StatisticsDataCheck {
  hasData: boolean;
  hasThresholdData: boolean;
  hasEventData: boolean;
  hasMessageData: boolean;
}
