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
 * History event table action configuration
 *
 * Abstract toolbar action configuration separately to improve code maintainability
 */

import { Button } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { useCallback } from 'react';

export interface HistoryTableActionsConfig {
  /** Refresh handler */
  onRefresh?: () => void;
}

/**
 * History event table action configuration Hook
 * Responsible for defining toolbar action buttons
 */
export const useHistoryTableActions = ({
  onRefresh,
}: HistoryTableActionsConfig) => {
  return useCallback(
    (_props: Record<string, unknown>) =>
      [
        onRefresh && (
          <Button
            key="refresh"
            type="secondary"
            icon={<IconRefresh />}
            onClick={onRefresh}
          >
            刷新
          </Button>
        ),
      ].filter(Boolean),
    [onRefresh],
  );
};
