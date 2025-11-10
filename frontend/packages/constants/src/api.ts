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

export const API_ENDPOINTS = {
  HEALTH: '/health',
  USER: '/user',
  ALARM: {
    LIST: '/alarm/list',
    DETAIL: '/alarm/detail',
    UPDATE: '/alarm/update',
  },
  MONITOR: {
    METRICS: '/monitor/metrics',
    SERVERS: '/monitor/servers',
    CHART_DATA: '/monitor/chart-data',
  },
} as const;

// API response status codes
export const API_RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 1,
} as const;

// Pagination related constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_LIMIT: 100,
  DEFAULT_SKIP: 0,
  MAX_PAGE_SIZE: 1000,
} as const;
