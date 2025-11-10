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

import { Button } from '@arco-design/web-react';
import { IconPlus, IconUpload } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';
import type React from 'react';

/**
 * Get project table action button configuration
 */
export const getProjectTableActions = ({
  onCreate,
  onImport,
}: {
  onCreate?: () => void;
  onImport?: () => void;
}): React.ReactNode[] => {
  const actions: React.ReactNode[] = [];

  // Handle create project button click
  const handleCreateClick = (e: React.MouseEvent<HTMLElement>) => {
    logger.debug({
      message: '[ProjectTableActions] 🆕 Create project button clicked',
      data: {
        timestamp: Date.now(),
        eventType: e.type,
        defaultPrevented: e.defaultPrevented,
      },
      source: 'ProjectTableActions',
      component: 'handleCreateClick',
    });

    // ✅ Step 1: Immediately prevent all default behaviors
    e.preventDefault();
    e.stopPropagation();

    logger.debug({
      message: '[ProjectTableActions] ✅ Default behaviors prevented',
      data: {
        timestamp: Date.now(),
        defaultPrevented: e.defaultPrevented,
      },
      source: 'ProjectTableActions',
      component: 'handleCreateClick',
    });

    // ✅ Step 2: Execute callback in next event loop to avoid side effects from synchronous execution
    setTimeout(() => {
      logger.debug({
        message: '[ProjectTableActions] 📞 Calling onCreate callback',
        data: {
          timestamp: Date.now(),
        },
        source: 'ProjectTableActions',
        component: 'handleCreateClick',
      });
      onCreate?.();
    }, 0);
  };

  // Handle import project button click
  const handleImportClick = (e: React.MouseEvent<HTMLElement>) => {
    logger.debug({
      message: '[ProjectTableActions] 📥 Import project button clicked',
      data: {
        timestamp: Date.now(),
        eventType: e.type,
        defaultPrevented: e.defaultPrevented,
      },
      source: 'ProjectTableActions',
      component: 'handleImportClick',
    });

    // ✅ Step 1: Immediately prevent all default behaviors
    e.preventDefault();
    e.stopPropagation();

    logger.debug({
      message: '[ProjectTableActions] ✅ Default behaviors prevented',
      data: {
        timestamp: Date.now(),
        defaultPrevented: e.defaultPrevented,
      },
      source: 'ProjectTableActions',
      component: 'handleImportClick',
    });

    // ✅ Step 2: Execute callback in next event loop to avoid side effects from synchronous execution
    setTimeout(() => {
      logger.debug({
        message: '[ProjectTableActions] 📞 Calling onImport callback',
        data: {
          timestamp: Date.now(),
        },
        source: 'ProjectTableActions',
        component: 'handleImportClick',
      });
      onImport?.();
    }, 0);
  };

  if (onCreate) {
    actions.push(
      <Button
        key="create"
        type="primary"
        htmlType="button"
        icon={<IconPlus />}
        onClick={handleCreateClick}
      >
        新建项目
      </Button>,
    );
  }

  if (onImport) {
    actions.push(
      <Button
        key="import"
        htmlType="button"
        icon={<IconUpload />}
        onClick={handleImportClick}
      >
        导入项目
      </Button>,
    );
  }

  return actions;
};
