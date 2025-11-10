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

import { isEmpty } from 'lodash-es';
import type React from 'react';
import { useCallback } from 'react';
import type { SelectBlockPluginManager } from '../core/plugin-manager';
import { logger } from '../logger';
import type { DataFetcherPluginImpl } from '../plugins/data-fetcher';
import type { PaginationPluginImpl } from '../plugins/pagination-handler';
import type { PasteHandlerPluginImpl } from '../plugins/paste-handler';
import type { SearchHandlerPluginImpl } from '../plugins/search-handler';
import type { SelectOption, veArchSelectBlockProps } from '../types/interface';
import type { SelectBlockState } from '../types/plugin';
import { handleVisibleChangeLogic } from './use-event-handlers.visible-change';

/**
 * Event handlers Hook
 * Responsible for handling search, paste, visibility change, scroll and other events
 */
export function useEventHandlers(
  props: veArchSelectBlockProps,
  currentState: SelectBlockState,
  searchHandler: SearchHandlerPluginImpl | undefined,
  pasteHandler: PasteHandlerPluginImpl | undefined,
  paginationHandler: PaginationPluginImpl | undefined,
  dataFetcher: DataFetcherPluginImpl | undefined,
  _canFetch: boolean,
  shouldFetchOptionsWithDefaultValue: boolean,
  addDebugLog: (action: string, data: any) => void,
  pluginManagerRef: React.MutableRefObject<
    SelectBlockPluginManager | undefined
  >,
) {
  const {
    formatRemoteSearchKey = (v: string) => v,
    _onSearch,
    isDebouncedFetch = false,
    isScrollFetching = false,
    remoteSearchKey,
    value,
    options: initialOptions = [],
  } = props;

  // Search handler - Fix missing onSearch logic
  const onSearch = isDebouncedFetch
    ? (v: string, reason?: string) => {
        logger.info(
          'UseEventHandlers',
          'onSearch triggered',
          {
            searchValue: v,
            reason,
            currentSearchValue: currentState?.searchValue,
            isDebouncedFetch,
          },
          'onSearch',
        );

        if (v === currentState?.searchValue || reason === 'optionListHide') {
          logger.debug(
            'UseEventHandlers',
            'onSearch skipped - value unchanged or option list hidden',
            {
              sameValue: v === currentState?.searchValue,
              optionListHide: reason === 'optionListHide',
            },
            'onSearch',
          );
          return;
        }

        // Update search value to state
        pluginManagerRef.current?.setState({
          searchValue: v,
        });

        // Call external search callback
        _onSearch?.({ search: v });

        logger.info(
          'UseEventHandlers',
          'onSearch preparing to create debounced search',
          {
            hasSearchHandler: Boolean(searchHandler),
          },
          'onSearch',
        );

        // 🔥 Key: Trigger data fetching (regardless of whether input is empty)
        const debouncedSearch = searchHandler?.createDebouncedSearch();

        logger.info(
          'UseEventHandlers',
          'onSearch calling debounced search',
          {
            hasDebouncedSearch: Boolean(debouncedSearch),
            inputValue: v,
          },
          'onSearch',
        );

        debouncedSearch?.({ inputValue: v });

        addDebugLog('ON_SEARCH_TRIGGERED', {
          searchValue: v,
          reason,
          timestamp: Date.now(),
        });
      }
    : (searchValue: string) => {
        logger.debug(
          'UseEventHandlers',
          'onSearch (non-debounced mode)',
          {
            searchValue,
          },
          'onSearch',
        );
        _onSearch?.({ search: searchValue });
      };

  // Internal method to fetch options - keep consistent with original file
  // 🔧 Fix infinite loop: Remove object dependencies, use ref to access latest state
  const _fetchOptions = useCallback(async () => {
    logger.info(
      'UseEventHandlers',
      '_fetchOptions called',
      {
        hasDataFetcher: Boolean(dataFetcher),
        hasSearchHandler: Boolean(searchHandler),
        hasCurrentState: Boolean(currentState),
        shouldFetchOptionsWithDefaultValue,
        remoteSearchKey,
        value,
      },
      '_fetchOptions',
    );

    if (!dataFetcher || !searchHandler || !currentState) {
      addDebugLog('FETCH_OPTIONS_SKIPPED', {
        hasDataFetcher: Boolean(dataFetcher),
        hasSearchHandler: Boolean(searchHandler),
        hasCurrentState: Boolean(currentState),
      });
      logger.warn(
        'UseEventHandlers',
        '_fetchOptions skipped - missing required plugins or state',
        {
          hasDataFetcher: Boolean(dataFetcher),
          hasSearchHandler: Boolean(searchHandler),
          hasCurrentState: Boolean(currentState),
        },
        '_fetchOptions',
      );
      return;
    }

    logger.debug(
      'UseEventHandlers',
      'Creating debounced search function',
      {
        hasSearchHandler: Boolean(searchHandler),
      },
      '_fetchOptions',
    );

    const debouncedSearch = searchHandler.createDebouncedSearch();

    logger.debug(
      'UseEventHandlers',
      'Debounced search function created',
      {
        hasDebouncedSearch: Boolean(debouncedSearch),
        shouldFetchOptionsWithDefaultValue,
        remoteSearchKey,
        mounted: currentState.mounted,
      },
      '_fetchOptions',
    );

    if (shouldFetchOptionsWithDefaultValue && remoteSearchKey) {
      if (!currentState.mounted) {
        logger.info(
          'UseEventHandlers',
          'Executing initial value search',
          {
            initValue: value,
            isOptionAppend: true,
          },
          '_fetchOptions',
        );
        await debouncedSearch({
          initValue: value,
          isOptionAppend: true,
        });
      } else {
        logger.info(
          'UseEventHandlers',
          'Executing empty search (mounted)',
          {},
          '_fetchOptions',
        );
        await debouncedSearch({});
      }
    } else {
      logger.info(
        'UseEventHandlers',
        'Executing normal search',
        {
          shouldFetchOptionsWithDefaultValue,
          remoteSearchKey,
        },
        '_fetchOptions',
      );
      await debouncedSearch({});
    }

    logger.info(
      'UseEventHandlers',
      '_fetchOptions execution completed',
      {},
      '_fetchOptions',
    );
  }, [
    // 🔧 Remove currentState dependency as it's accessed via closure
    dataFetcher,
    searchHandler,
    shouldFetchOptionsWithDefaultValue,
    remoteSearchKey,
    value,
  ]);

  const handleVisibleChange = useCallback(
    (visible: boolean) => {
      const context = {
        props,
        currentState,
        pluginManagerRef,
        searchHandler,
        _canFetch,
        _fetchOptions,
        logger,
        addDebugLog,
      };

      if (!visible) {
        logger.debug(
          'UseEventHandlers',
          'Dropdown closed - resetting state',
          {},
          'handleVisibleChange',
        );
        paginationHandler?.resetPagination?.();
        pluginManagerRef.current?.setState({
          fetching: false,
        });

        if (initialOptions && initialOptions.length > 0) {
          const selectOptions: SelectOption[] = initialOptions.map((option) => {
            if (typeof option === 'string' || typeof option === 'number') {
              return { label: String(option), value: option };
            }
            return option as SelectOption;
          });

          pluginManagerRef.current?.setState({
            fetchOptions: selectOptions,
          });
        }

        addDebugLog('VISIBLE_CHANGE_RESET', {
          reason: 'dropdown_hidden',
          resetStates: ['pagination', 'fetching', 'fetchOptions'],
        });
        return;
      }

      handleVisibleChangeLogic(context, visible);
    },
    [
      _canFetch,
      _fetchOptions,
      paginationHandler,
      initialOptions,
      JSON.stringify(props.dataSource),
      JSON.stringify(props.dependency),
    ],
  );

  // Scroll handler
  // 🔧 Fix infinite loop: Remove currentState destructuring dependency
  const popupScrollHandler = useCallback(
    (e: any) => {
      if (!isScrollFetching || !paginationHandler) {
        return;
      }

      const { target } = e;

      // Defensive check: ensure target exists
      if (!target) {
        console.warn(
          '[ScrollHandler] Event target is undefined, skipping scroll handling',
        );
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = target;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      if (
        isNearBottom &&
        currentState?.canTriggerLoadMore &&
        !currentState?.fetching
      ) {
        addDebugLog('SCROLL_LOAD_MORE', {
          scrollTop,
          scrollHeight,
          clientHeight,
          canTriggerLoadMore: currentState?.canTriggerLoadMore,
          fetching: currentState?.fetching,
        });

        // Trigger load more
        const currentSearchValue = currentState?.searchValue || '';
        const formattedSearchValue = formatRemoteSearchKey(currentSearchValue);

        // Trigger scroll load more data
        const debouncedSearch = searchHandler?.createDebouncedSearch();
        debouncedSearch?.({
          scroll: true,
          inputValue: formattedSearchValue,
        });
      }
    },
    // 🔧 Remove currentState destructuring dependency, access via closure
    [isScrollFetching, paginationHandler, formatRemoteSearchKey, searchHandler],
  );

  // Clear handler - Trigger refetch when user clicks clear button
  // 🔧 Fix infinite loop: Simplify dependencies
  const handleClear = useCallback(
    (visible: boolean) => {
      addDebugLog('CLEAR_TRIGGERED', {
        visible,
        _canFetch,
        hasDataSource: Boolean(props.dataSource),
      });

      // Only trigger refetch when there is data source and can fetch data
      if (_canFetch && props.dataSource) {
        // Delay a short time to ensure value has been cleared
        setTimeout(() => {
          addDebugLog('CLEAR_REFETCH', {
            reason: 'value cleared, refetching data',
          });
          _fetchOptions();
        }, 50);
      }

      // Call original onClear callback
      props.onClear?.(visible);
    },
    [_canFetch, _fetchOptions],
  );

  return {
    onSearch,
    handlePaste: pasteHandler?.handlePaste
      ? (event: ClipboardEvent) => pasteHandler.handlePaste(event)
      : (((_event: ClipboardEvent) => {}) as (event: ClipboardEvent) => void),
    handleVisibleChange,
    handleClear,
    popupScrollHandler,
    _fetchOptions,
  };
}
