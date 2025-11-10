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
import type { SelectBlockPluginManager } from '../core/plugin-manager';
import type { logger } from '../logger';
import type { SearchHandlerPluginImpl } from '../plugins/search-handler';
import type { veArchSelectBlockProps } from '../types/interface';
import type { SelectBlockState } from '../types/plugin';

export interface EventHandlersContext {
  props: veArchSelectBlockProps;
  currentState: SelectBlockState;
  pluginManagerRef: React.MutableRefObject<
    SelectBlockPluginManager | undefined
  >;
  searchHandler: SearchHandlerPluginImpl | undefined;
  _canFetch: boolean;
  _fetchOptions: () => Promise<void>;
  logger: typeof logger;
  addDebugLog: (action: string, data: any) => void;
}

