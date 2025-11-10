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
 * Project table action configuration
 *
 * Abstract toolbar action configuration separately to improve code maintainability
 */

import { Button } from '@arco-design/web-react';
import { IconPlus, IconUpload } from '@arco-design/web-react/icon';
import { useCallback } from 'react';

export interface ProjectTableActionsConfig {
  /** Create handler */
  onCreate?: () => void;
  /** Import handler */
  onImport?: () => void;
}

/**
 * Project table action configuration Hook
 * Responsible for defining toolbar action buttons
 */
export const useProjectTableActions = ({
  onCreate,
  onImport,
}: ProjectTableActionsConfig) => {
  return useCallback(
    (_props: Record<string, unknown>) =>
      [
        onCreate && (
          <Button
            key="create"
            type="primary"
            icon={<IconPlus />}
            onClick={onCreate}
            data-testid="new-project-btn"
          >
            Create Project
          </Button>
        ),
        onImport && (
          <Button
            key="import"
            icon={<IconUpload />}
            onClick={onImport}
            data-testid="import-project-btn"
          >
            Import Projects
          </Button>
        ),
      ].filter(Boolean),
    [onCreate, onImport],
  );
};
