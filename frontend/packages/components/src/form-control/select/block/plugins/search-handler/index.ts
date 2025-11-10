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

import { debounce } from 'lodash-es';
import { logger } from '../../logger';
import type {
  CacheHandlerPlugin,
  DataFetcherPlugin,
  PluginContext,
  SearchHandlerConfig,
  SearchHandlerPlugin,
  SearchParams,
} from '../../types/plugin';
import { isDataSourceSetter } from '../../util';
import { executeDebouncedSearch } from './utils/debounced-search';
import { DebugLogger } from './utils/debug';
import { EmergencyStateHandler } from './utils/emergency';
import { getSearchParams } from './utils/search-params';

/**
 * Search handler plugin implementation
 */
export class SearchHandlerPluginImpl implements SearchHandlerPlugin {
  name = 'search-handler';

  config: SearchHandlerConfig;

  private context!: PluginContext;

  private debouncedSearchFn?: any;

  private dataFetcherRef?: DataFetcherPlugin;

  private cacheHandlerRef?: CacheHandlerPlugin;

  private isDestroyed = false;

  private debugLogger: DebugLogger;

  private emergencyHandler: EmergencyStateHandler;

  constructor(config: SearchHandlerConfig) {
    this.config = {
      debounceDelay: 500,
      ...config,
    };

    this.debugLogger = new DebugLogger();
    this.emergencyHandler = new EmergencyStateHandler();

    this.debugLogger.exposeDebugMethods(this.config);
  }

  private addDebugLog(action: string, data: any): void {
    this.debugLogger.addDebugLog(action, data);
  }

  init(context: PluginContext): void {
    this.context = context;
    this.emergencyHandler.setupEmergencyStateResetListener(
      this.context,
      (action, data) => this.debugLogger.addDebugLog(action, data),
      (loading) => this.emergencyHandler.fallbackDOMSync(loading),
    );
  }

  /**
   * Set data fetcher plugin reference
   */
  setDataFetcher(dataFetcher: DataFetcherPlugin): void {
    this.dataFetcherRef = dataFetcher;
  }

  setCacheHandler(cacheHandler: CacheHandlerPlugin): void {
    this.cacheHandlerRef = cacheHandler;
  }

  getSearchParams(inputValue: string): Record<string, any> {
    return getSearchParams(inputValue, this.config);
  }

  /**
   * Create debounced search function
   */
  createDebouncedSearch(): any {
    this.addDebugLog('CREATE_DEBOUNCED_SEARCH_CALLED', {
      hasDebouncedSearchFn: Boolean(this.debouncedSearchFn),
      timestamp: Date.now(),
    });

    if (this.debouncedSearchFn) {
      this.addDebugLog('REUSE_EXISTING_DEBOUNCED_SEARCH', {
        timestamp: Date.now(),
      });
      return this.debouncedSearchFn;
    }

    this.addDebugLog('CREATE_NEW_DEBOUNCED_SEARCH', {
      debounceDelay: this.config.debounceDelay,
      timestamp: Date.now(),
    });

    // 🔧 Capture current context, dataFetcher, cacheHandler references when creating debounced function
    // This way even if plugin is destroyed, debounced function can still access these references
    const capturedContext = this.context;
    const capturedDataFetcher = this.dataFetcherRef;
    const capturedCacheHandler = this.cacheHandlerRef;
    const capturedAddDebugLog = this.addDebugLog.bind(this);

    // 🔧 Add log when capturing
    logger.debug(
      'SearchHandler',
      '捕获 context 引用', // Keep Chinese error message in code string
      {
        hasCapturedContext: Boolean(capturedContext),
        capturedContextType: typeof capturedContext,
        hasCapturedDataFetcher: Boolean(capturedDataFetcher),
        hasCapturedCacheHandler: Boolean(capturedCacheHandler),
        isDestroyed: this.isDestroyed,
      },
      'createDebouncedSearch',
    );

    this.debouncedSearchFn = debounce(async (searchParams: SearchParams) => {
      return await executeDebouncedSearch(searchParams, {
        capturedContext,
        capturedDataFetcher,
        capturedCacheHandler,
        config: this.config,
        getSearchParams: (inputValue: string) =>
          this.getSearchParams(inputValue),
      });
    }, this.config.debounceDelay);

    return this.debouncedSearchFn;
  }

  /**
   * Get data fetcher plugin
   */
  private getDataFetcherPlugin() {
    return this.dataFetcherRef;
  }

  /**
   * Create search callback function
   */
  createSearchCallback(): (v: string, reason: string) => void {
    return (v: string, reason: string) => {
      // 🔧 Add context null check
      if (!this.context) {
        this.addDebugLog('SEARCH_CALLBACK_ABORT', {
          reason: 'context is null',
          inputValue: v,
          timestamp: Date.now(),
        });
        return;
      }

      const { state } = this.context;

      // 🔧 Record search callback trigger
      this.addDebugLog('SEARCH_CALLBACK_TRIGGERED', {
        inputValue: v,
        reason,
        currentSearchValue: state.searchValue,
        currentLoading: state.loading,
        timestamp: Date.now(),
      });

      if (v === state.searchValue || reason === 'optionListHide') {
        this.addDebugLog('SEARCH_CALLBACK_SKIPPED', {
          reason: v === state.searchValue ? 'same_value' : 'option_list_hide',
          inputValue: v,
          callbackReason: reason,
        });
        return;
      }

      // Call user-defined search callback
      const { props } = this.context;
      if (props._onSearch) {
        this.addDebugLog('USER_SEARCH_CALLBACK_CALLED', {
          inputValue: v,
          timestamp: Date.now(),
        });
        props._onSearch({ search: v });
      }

      // 🔧 Record debounced search about to trigger
      this.addDebugLog('DEBOUNCED_SEARCH_TRIGGER', {
        inputValue: v,
        debounceDelay: this.config.debounceDelay,
        timestamp: Date.now(),
      });

      // Trigger search
      const debouncedSearch = this.createDebouncedSearch();
      debouncedSearch({ inputValue: v });
    };
  }

  /**
   * Reset search state
   */
  resetSearch(): void {
    if (!this.context) {
      this.addDebugLog('RESET_SEARCH_ABORT', {
        reason: 'context is null',
        timestamp: Date.now(),
      });
      return;
    }
    this.context.setState({
      searchValue: '',
      skip: 0,
      canTriggerLoadMore: true,
      fetching: false,
      loading: false, // Ensure loading state is also reset
    });
  }

  /**
   * Clear debounced function, force recreate
   * 🔧 Called when dependency changes to ensure new debounced function uses latest dataSource
   */
  clearDebouncedSearch(): void {
    if (
      this.debouncedSearchFn &&
      typeof this.debouncedSearchFn.cancel === 'function'
    ) {
      this.debouncedSearchFn.cancel();
      this.addDebugLog('DEBOUNCED_SEARCH_CLEARED', {
        reason: 'dependency changed, force recreate',
        timestamp: Date.now(),
      });
    }
    this.debouncedSearchFn = undefined;
    logger.info(
      'SearchHandler',
      'Debounced function cleared, will recreate on next createDebouncedSearch call',
      {},
      'clearDebouncedSearch',
    );
  }

  destroy(): void {
    this.isDestroyed = true;

    // Cancel debounced function
    if (
      this.debouncedSearchFn &&
      typeof this.debouncedSearchFn.cancel === 'function'
    ) {
      this.debouncedSearchFn.cancel();
      this.addDebugLog('DEBOUNCED_SEARCH_CANCELLED', {
        reason: 'plugin destroy called',
        timestamp: Date.now(),
      });
    }

    this.context = null as any;
  }
}
