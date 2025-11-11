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

import type { RouteConfig } from '@/types/route';
import React from 'react';
import { EVENT_CENTER_ROUTES_PATH, EventCenterPages } from '../config';

/**
 * Event center route configuration
 */
export const eventCenterRoutes: RouteConfig[] = [
  {
    path: EVENT_CENTER_ROUTES_PATH.Strategy,
    element: React.createElement(EventCenterPages.Strategy),
    title: '消息卡片通知策略',
    icon: 'IconNotification',
    requireAuth: true,
  },
  {
    path: EVENT_CENTER_ROUTES_PATH.SubscribeRelation,
    element: React.createElement(EventCenterPages.SubscribeRelation),
    title: '事件订阅',
    icon: 'IconSubscribe',
    requireAuth: true,
  },
  {
    path: EVENT_CENTER_ROUTES_PATH.History,
    element: React.createElement(EventCenterPages.History),
    title: '历史事件',
    icon: 'IconHistory',
    requireAuth: true,
  },
  {
    path: EVENT_CENTER_ROUTES_PATH.Statistics,
    element: React.createElement(EventCenterPages.Statistics),
    title: '统计分析',
    icon: 'IconBarChart',
    requireAuth: true,
  },
];
