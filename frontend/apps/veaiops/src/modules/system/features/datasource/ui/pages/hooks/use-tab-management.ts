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

import { TAB_KEYS } from '@datasource/lib';
import { useSearchParams } from '@modern-js/runtime/router';
import { useSubscription } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import { useCallback, useEffect } from 'react';

/**
 * Tab management Hook
 * Responsibility: Manage Tab switching and URL state synchronization
 */
export const useTabManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { channels, createChannel } = useSubscription();

  // Ensure activeKeyChange channel is created
  useEffect(() => {
    createChannel('activeKeyChange');
  }, [createChannel]);

  // Read activeTab parameter from URL, use default value if not present
  const activeTab = searchParams.get('activeTab') || TAB_KEYS.VOLCENGINE;

  // Monitor activeTab changes
  useEffect(() => {
    logger.info({
      message: '[useTabManagement] activeTab value changed',
      data: {
        activeTab,
        urlActiveTab: searchParams.get('activeTab'),
        defaultTab: TAB_KEYS.VOLCENGINE,
        currentUrl: window.location.href,
      },
      source: 'useTabManagement',
      component: 'activeTab-effect',
    });
  }, [activeTab, searchParams]);

  // Handle Tab switching
  const handleTabChange = useCallback(
    (key: string) => {
      logger.info({
        message: '[useTabManagement] handleTabChange called',
        data: {
          key,
          currentActiveTab: activeTab,
          isSameTab: key === activeTab,
          tabKeys: TAB_KEYS,
        },
        source: 'useTabManagement',
        component: 'handleTabChange',
      });

      // Update URL parameters
      logger.info({
        message: '[useTabManagement] Prepare to update URL parameters',
        data: {
          key,
          currentSearchParams: Object.fromEntries(searchParams.entries()),
        },
        source: 'useTabManagement',
        component: 'handleTabChange',
      });

      setSearchParams({ activeTab: key });

      logger.info({
        message: '[useTabManagement] URL parameters updated',
        data: {
          key,
        },
        source: 'useTabManagement',
        component: 'handleTabChange',
      });

      // Publish activeKey change event
      if (channels.activeKeyChange) {
        logger.info({
          message: '[useTabManagement] Publish activeKey change event',
          data: {
            key,
            hasChannel: Boolean(channels.activeKeyChange),
          },
          source: 'useTabManagement',
          component: 'handleTabChange',
        });

        channels.activeKeyChange.publish({ activeKey: key });

        logger.info({
          message: '[useTabManagement] activeKey change event published',
          data: {
            key,
          },
          source: 'useTabManagement',
          component: 'handleTabChange',
        });
      } else {
        logger.warn({
          message: '[useTabManagement] activeKeyChange channel does not exist',
          data: {
            key,
            availableChannels: Object.keys(channels),
          },
          source: 'useTabManagement',
          component: 'handleTabChange',
        });
      }
    },
    [channels, setSearchParams, activeTab, searchParams],
  );

  return {
    activeTab,
    handleTabChange,
  };
};
