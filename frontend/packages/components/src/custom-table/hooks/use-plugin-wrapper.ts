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

import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
} from '@/custom-table/types';
import type { PluginManager } from '@/custom-table/types/plugins';
import { devLog } from '@/custom-table/utils/log-utils';
import { logger } from '@veaiops/utils';
import React from 'react';
import { wrapWithPlugins } from '../plugins';

export interface UsePluginWrapperParams<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
> {
  pluginManager: PluginManager<RecordType, QueryType> | null;
  mainContent: React.ReactNode;
  context: PluginContext<RecordType, QueryType>;
}

export function usePluginWrapper<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>({
  pluginManager,
  mainContent,
  context,
}: UsePluginWrapperParams<RecordType, QueryType>): React.ReactNode {
  const wrappedContent = React.useMemo(() => {
    if (!pluginManager) {
      return mainContent;
    }

    try {
      devLog.log({
        component: 'CustomTable',
        message: 'Starting to call wrapWithPlugins',
        data: {
          hasPluginManager: Boolean(pluginManager),
          hasMainContent: Boolean(mainContent),
          hasContext: Boolean(context),
          mainContentType: typeof mainContent,
          isValidMainContent: React.isValidElement(mainContent),
        },
      });

      const result = wrapWithPlugins<RecordType, QueryType>({
        pluginManager,
        content: mainContent,
        context,
      });

      devLog.log({
        component: 'CustomTable',
        message: 'wrapWithPlugins called successfully',
        data: {
          wrappedContentType: typeof result,
          isValidElement: React.isValidElement(result),
          isNull: result === null,
          isUndefined: result === undefined,
        },
      });

      return result;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'wrapWithPlugins call failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          hasPluginManager: Boolean(pluginManager),
          hasMainContent: Boolean(mainContent),
          hasContext: Boolean(context),
        },
        source: 'CustomTable',
        component: 'wrapWithPlugins',
      });
      return mainContent;
    }
  }, [pluginManager, mainContent, context]);

  return wrappedContent;
}

