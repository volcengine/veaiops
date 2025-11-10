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

import type { SelectOption } from '../../../types/interface';
import type { DataFetcherPlugin, PluginContext } from '../../../types/plugin';

/**
 * Paste data fetcher
 */
export class PasteDataFetcher {
  constructor(private context: PluginContext) {}

  /**
   * Trigger data fetch after paste, ensure newly pasted values can be searched
   */
  async triggerDataFetchForPastedValues(
    pastedValues: (string | number)[],
  ): Promise<void> {
    // 🔧 Defensive check: ensure context exists
    if (!this.context) {
      console.warn(
        '[PasteDataFetcher] Context has been destroyed, skipping data fetch',
      );
      return;
    }

    const { props } = this.context;

    // Check if data source configuration exists
    if (!props.dataSource || typeof props.dataSource !== 'object') {
      return;
    }

    try {
      // Get data fetcher plugin
      const dataFetcher = this.context.getPlugin?.(
        'data-fetcher',
      ) as DataFetcherPlugin;
      if (!dataFetcher || typeof dataFetcher.fetchData !== 'function') {
        return;
      }

      // Construct search parameters: use pasted values as search conditions
      const searchParams: Record<string, any> = {
        // Prefer pasteValueKey, then use searchKey or remoteSearchKey
        ...(props.pasteValueKey && { [props.pasteValueKey]: pastedValues }),

        // If no pasteValueKey, use traditional search fields
        ...(!props.pasteValueKey &&
          props.searchKey && { [props.searchKey]: pastedValues.join(',') }),
        ...(!props.pasteValueKey &&
          props.remoteSearchKey && {
            [props.remoteSearchKey]: pastedValues.join(','),
          }),

        // Construct correct pagination parameters
        pageReq: {
          skip: 0,
          limit: Math.max(50, pastedValues.length * 2),
        },
      };

      const fetchedOptions = await dataFetcher.fetchData(
        props.dataSource,
        searchParams,
      );

      // Update options in state
      if (fetchedOptions && fetchedOptions.length > 0) {
        // Get current options in state
        const currentOptions = this.context.state?.fetchOptions || [];

        // Merge newly fetched options, deduplicate
        const mergedOptions = this.mergeAndDeduplicateOptions(
          currentOptions,
          fetchedOptions,
        );

        // 🔧 Batch update state, including stateVersion to force re-render
        const currentState = this.context.state;
        this.context.setState({
          fetchOptions: mergedOptions,
          // 🔧 Force re-render: update stateVersion to ensure React immediately responds to state changes
          stateVersion: (currentState?.stateVersion || 0) + 1,
        });
      }
    } catch (error) {
      console.warn('[PasteDataFetcher] Data fetch failed after paste:', error);
      // Don't show error message, as this is a background operation
    }
  }

  /**
   * Merge and deduplicate options
   */
  private mergeAndDeduplicateOptions(
    currentOptions: SelectOption[],
    newOptions: SelectOption[],
  ): SelectOption[] {
    const optionMap = new Map<string | number, SelectOption>();

    // Add current options first
    currentOptions.forEach((option) => {
      optionMap.set(option.value, option);
    });

    // Then add new options (will overwrite duplicates)
    newOptions.forEach((option) => {
      optionMap.set(option.value, option);
    });

    return Array.from(optionMap.values());
  }
}
