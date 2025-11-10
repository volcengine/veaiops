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

import { Message } from '@arco-design/web-react';
import {
  type LastRequestParams,
  type UpdateAttributeParams,
  updateAttributeApi,
} from '@bot';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Use ref to stabilize parameter references
 */
interface UseUpdateAttributeParams {
  lastRequestParamsRef: React.MutableRefObject<LastRequestParams>;
  setLoading: (loading: boolean) => void;
}

/**
 * Update special attention Hook
 */
export function useUpdateAttribute({
  lastRequestParamsRef,
  setLoading,
}: UseUpdateAttributeParams) {
  const updateAttribute = useCallback(
    async ({ id, value }: UpdateAttributeParams) => {
      const params = { botAttributeId: id, value };

      try {
        setLoading(true);
        const success = await updateAttributeApi(params);

        if (success) {
          Message.success('特别关注更新成功');
          // Log: update successful, component responsible for refreshing table
          // Note: extract complex object parameters as variables to avoid TypeScript parsing errors (TS1136)
          const savedNamesForUpdate = Array.isArray(
            lastRequestParamsRef.current.names,
          )
            ? [...lastRequestParamsRef.current.names]
            : lastRequestParamsRef.current.names;
          const updateLoggerData = {
            savedNames: savedNamesForUpdate,
            savedValue: lastRequestParamsRef.current.value,
          };
          logger.info({
            message: '特别关注更新成功',
            data: updateLoggerData,
            source: 'useBotAttributes',
            component: 'updateAttribute',
          });
          // Don't refresh here, component will refresh via CustomTable's refresh method
          return true;
        }

        return false;
      } catch (error) {
        Message.error(
          error instanceof Error ? error.message : '更新特别关注失败，请重试',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [lastRequestParamsRef, setLoading],
  );

  return updateAttribute;
}
