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
 * Data source setter type
 * Based on Select.Block definition in @veaiops/components
 */
export interface DataSourceSetter {
  serviceInstance: unknown;
  api: string;
  payload?: unknown;
  responseEntityKey: string;
  isJsonParse?: boolean;
  JsonParseEntityKey?: string;
  optionCfg: Partial<Record<string, unknown>>;
}

/**
 * Select data source props type
 */
export interface SelectDataSourceProps {
  search?: unknown;
  remoteSearchParams?: unknown;
  pageReq?: { skip: number; limit: number };
  value?: unknown;
}

/**
 * Data source option type
 */
export interface DataSourceOption<T = unknown> {
  label: string;
  value: string;
  extra: T;
}
