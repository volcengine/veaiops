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
import { type LastRequestParams, deleteAttributeApi } from '@bot';
import { logger } from '@veaiops/utils';
import type { BotAttribute } from 'api-generate';
import { useCallback } from 'react';

/**
 * Use ref to stabilize parameter references
 */
interface UseDeleteAttributeParams {
  lastRequestParamsRef: React.MutableRefObject<LastRequestParams>;
  setLoading: (loading: boolean) => void;
}

/**
 * Delete special attention Hook
 */
export function useDeleteAttribute({
  lastRequestParamsRef,
  setLoading,
}: UseDeleteAttributeParams) {
  const deleteAttribute = useCallback(
    async (attribute: BotAttribute): Promise<boolean> => {
      try {
        setLoading(true);
        if (!attribute._id) {
          Message.error('特别关注ID不存在');
          return false;
        }

        const success = await deleteAttributeApi({
          botAttributeId: attribute._id,
        });

        if (success) {
          Message.success('特别关注删除成功');
          // Log: delete successful, component responsible for refreshing table
          // Note: extract complex object parameters as variables to avoid TypeScript parsing errors (TS1136)
          const savedNamesForDelete = Array.isArray(
            lastRequestParamsRef.current.names,
          )
            ? [...lastRequestParamsRef.current.names]
            : lastRequestParamsRef.current.names;
          const deleteLoggerData = {
            savedNames: savedNamesForDelete,
            savedValue: lastRequestParamsRef.current.value,
          };
          logger.info({
            message: '特别关注删除成功',
            data: deleteLoggerData,
            source: 'useBotAttributes',
            component: 'deleteAttribute',
          });
          // ✅ Return true to indicate delete success
          return true;
        } else {
          Message.error('删除失败');
          return false;
        }
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        Message.error(errorObj.message || '删除特别关注失败，请重试');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [lastRequestParamsRef, setLoading],
  );

  return deleteAttribute;
}
