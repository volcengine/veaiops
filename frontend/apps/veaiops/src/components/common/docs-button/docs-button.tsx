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

import { logger } from '@veaiops/utils';
import type React from 'react';
import { useEffect, useState } from 'react';
import { DocsDrawer } from '../docs-drawer';

/**
 * Documentation button component
 * Includes documentation icon button and documentation drawer
 */
export const DocsButton: React.FC = () => {
  const [docsDrawerVisible, setDocsDrawerVisible] = useState(false);

  // 🔍 Debug log: DocsButton mounted
  useEffect(() => {
    logger.info({
      message: '[DocsButton] Component mounted',
      data: {
        currentRoute: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
      source: 'DocsButton',
      component: 'componentMount',
    });
  }, []);

  // 🔍 Debug log: DocsDrawer visibility change
  useEffect(() => {
    logger.info({
      message: '[DocsButton] DocsDrawer visibility changed',
      data: {
        docsDrawerVisible,
        currentRoute: window.location.pathname,
        timestamp: new Date().toISOString(),
      },
      source: 'DocsButton',
      component: 'visibilityChange',
    });
  }, [docsDrawerVisible]);

  const handleDocsButtonClick = () => {
    logger.info({
      message: '[DocsButton] Documentation button clicked',
      data: {
        currentRoute: window.location.pathname,
        previousVisible: docsDrawerVisible,
        timestamp: new Date().toISOString(),
      },
      source: 'DocsButton',
      component: 'handleClick',
    });
    setDocsDrawerVisible(true);
  };

  return (
    <>
      {/* Documentation icon button */}
      <button
        id="docs-button"
        type="button"
        onClick={handleDocsButtonClick}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="查看文档"
        aria-label="查看文档"
        data-testid="docs-button"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>

      {/* Documentation drawer */}
      <DocsDrawer
        visible={docsDrawerVisible}
        onClose={() => setDocsDrawerVisible(false)}
      />
    </>
  );
};
