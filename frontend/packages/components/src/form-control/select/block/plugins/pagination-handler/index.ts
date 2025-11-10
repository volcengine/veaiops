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

import { logger } from '../../logger';
import type {
  PaginationConfig,
  PaginationPlugin,
  PluginContext,
  SearchHandlerPlugin,
} from '../../types/plugin';

/**
 * Pagination plugin implementation
 */
export class PaginationPluginImpl implements PaginationPlugin {
  name = 'pagination';

  config: PaginationConfig;

  private context!: PluginContext;

  private searchHandler?: SearchHandlerPlugin;

  constructor(config: PaginationConfig) {
    this.config = config;
  }

  init(context: PluginContext): void {
    this.context = context;
  }

  /**
   * Set search handler plugin reference
   */
  setSearchHandler(searchHandler: SearchHandlerPlugin): void {
    this.searchHandler = searchHandler;
  }

  /**
   * Handle popup scroll event
   */
  async handlePopupScroll(element: HTMLElement): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'handlePopupScroll called but context is null',
        {},
        'handlePopupScroll',
      );
      return false;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;
    const scrollBottom = scrollHeight - (scrollTop + clientHeight);

    // Trigger load more when scrolling near bottom
    if (scrollBottom < 10) {
      const { state } = this.context;

      if (!state.fetching && state.canTriggerLoadMore) {
        this.context.setState({ fetching: true });

        // Get search handler plugin to execute search
        const searchHandler = this.getSearchHandlerPlugin();
        if (searchHandler) {
          const debouncedSearch = searchHandler.createDebouncedSearch();
          await debouncedSearch({
            scroll: true,
            inputValue: state.searchValue,
          });
        }
      }
    }

    return true;
  }

  /**
   * Reset pagination state
   */
  resetPagination(): void {
    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'resetPagination called but context is null',
        {},
        'resetPagination',
      );
      return;
    }
    this.context.setState({
      skip: 0,
      canTriggerLoadMore: true,
      fetching: false,
    });
  }

  /**
   * Handle visibility change
   */
  handleVisibleChange(visible: boolean): void {
    if (!visible) {
      this.resetPagination();

      // Restore to initial state
      if (!this.context) {
        logger.warn(
          'PaginationPlugin',
          'handleVisibleChange called but context is null',
          { visible },
          'handleVisibleChange',
        );
        return;
      }
      const { state } = this.context;
      this.context.setState({
        fetchOptions: state.initFetchOptions || [],
      });
    }
  }

  /**
   * Get current skip count
   */
  getCurrentSkip(): number {
    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'getCurrentSkip called but context is null',
        {},
        'getCurrentSkip',
      );
      return 0;
    }
    return this.context.state.skip;
  }

  /**
   * Set skip count
   */
  setSkip(skip: number): void {
    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'setSkip called but context is null',
        { skip },
        'setSkip',
      );
      return;
    }
    this.context.setState({ skip });
  }

  /**
   * Increase skip count to next page
   */
  nextSkip(): void {
    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'nextSkip called but context is null',
        {},
        'nextSkip',
      );
      return;
    }
    const { state } = this.context;
    const { limit } = this.context.props.pageReq || { limit: 100 };
    const currentSkip = this.getCurrentSkip();
    this.setSkip(currentSkip + limit);
  }

  /**
   * Whether can load more
   */
  canLoadMore(): boolean {
    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'canLoadMore called but context is null',
        {},
        'canLoadMore',
      );
      return false;
    }
    return this.context.state.canTriggerLoadMore;
  }

  /**
   * Set whether can load more
   */
  setCanLoadMore(canLoad: boolean): void {
    if (!this.context) {
      logger.warn(
        'PaginationPlugin',
        'setCanLoadMore called but context is null',
        { canLoad },
        'setCanLoadMore',
      );
      return;
    }
    this.context.setState({ canTriggerLoadMore: canLoad });
  }

  /**
   * Get search handler plugin
   */
  private getSearchHandlerPlugin(): SearchHandlerPlugin | undefined {
    return this.searchHandler;
  }

  destroy(): void {
    this.context = null!;
    this.searchHandler = undefined;
  }
}
