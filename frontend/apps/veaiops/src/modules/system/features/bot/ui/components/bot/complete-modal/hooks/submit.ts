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

import type { BotCreateRequest, BotUpdateRequest } from '@bot/lib';
import { useCallback } from 'react';

/**
 * Submit handler parameters interface
 */
export interface UseBotCompleteSubmitParams {
  /**
   * Submit handler
   * Accepts BotCreateRequest or BotUpdateRequest, returns Promise<boolean>
   */
  onSubmit: (values: BotCreateRequest | BotUpdateRequest) => Promise<boolean>;
}

export const useBotCompleteSubmit = ({
  onSubmit,
}: UseBotCompleteSubmitParams) => {
  /**
   * Create form submit handler
   * Fields are aligned, can directly pass through
   */
  const handleCreateSubmit = useCallback(
    async (values: BotCreateRequest): Promise<boolean> => {
      return await onSubmit(values);
    },
    [onSubmit],
  );

  /**
   * Edit form submit handler
   * Directly pass through BotUpdateRequest
   */
  const handleEditSubmit = useCallback(
    async (values: BotUpdateRequest): Promise<boolean> => {
      return await onSubmit(values);
    },
    [onSubmit],
  );

  return {
    handleCreateSubmit,
    handleEditSubmit,
  };
};
