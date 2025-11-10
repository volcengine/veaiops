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

import { safeJSONParse } from '@veaiops/utils';
import { delay, isFunction } from 'lodash-es';
import { logger } from '../../logger';
import type {
  DataSourceSetter,
  SelectDataSourceProps,
  SelectOption,
} from '../../types/interface';
import type {
  CacheHandlerPlugin,
  DataFetcherConfig,
  DataFetcherPlugin,
  PluginContext,
} from '../../types/plugin';
import { isDataSourceSetter, optionfy } from '../../util';

/**
 * Data fetcher plugin implementation
 */
export class DataFetcherPluginImpl implements DataFetcherPlugin {
  name = 'data-fetcher';

  config: DataFetcherConfig;

  private context!: PluginContext;

  private cacheHandlerRef?: CacheHandlerPlugin;

  // 🔧 Add destruction flag
  private isDestroyed = false;

  constructor(config: DataFetcherConfig) {
    this.config = config;
  }

  init(context: PluginContext): void {
    this.context = context;
    logger.debug(
      'DataFetcher',
      'Plugin initialized',
      {
        hasContext: Boolean(context),
      },
      'init',
    );
  }

  setCacheHandler(cacheHandler: CacheHandlerPlugin): void {
    this.cacheHandlerRef = cacheHandler;
  }

  /**
   * Get current context (with defensive checks)
   */
  private getContext(): PluginContext | null {
    if (this.isDestroyed) {
      logger.warn('DataFetcher', 'plugin is destroyed', {}, 'getContext');
      return null;
    }
    if (!this.context) {
      logger.warn('DataFetcher', 'context is null', {}, 'getContext');
      return null;
    }
    return this.context;
  }

  /**
   * Fetch data through data setter
   * @param dataSource Data source configuration
   * @param remoteSearchParams Search parameters
   * @param externalContext Optional external context (for debounce scenarios)
   */
  async fetchByDataSetter(
    dataSource: DataSourceSetter,
    remoteSearchParams: Record<string, any>,
    externalContext?: PluginContext,
  ): Promise<SelectOption[]> {
    // Prefer external context, then use internal context
    const ctx = externalContext || this.getContext();
    if (!ctx) {
      logger.warn(
        'DataFetcher',
        'fetchByDataSetter called but context is null or destroyed',
        {
          isDestroyed: this.isDestroyed,
          hasExternalContext: Boolean(externalContext),
        },
        'fetchByDataSetter',
      );
      return [];
    }

    const {
      serviceInstance,
      api,
      isJsonParse = false,
      JsonParseEntityKey = '',
      payload = {},
      responseEntityKey,
      optionCfg,
    } = dataSource;

    const { limit, handleParams } = this.config;
    const { state, utils } = ctx; // 🔧 Use passed ctx instead of this.context
    const { props } = ctx; // 🔧 Use passed ctx instead of this.context

    let _options: SelectOption[] = [];

    try {
      // Check if payload contains custom paste value field (e.g., accountIDs), if so don't add additional value parameter
      const hasPasteValueKey =
        props.pasteValueKey && payload[props.pasteValueKey];

      const finalParams = handleParams(
        utils.removeUndefinedValues({
          ...payload,
          ...remoteSearchParams,
          // Only add value parameter when pasteValueKey is not used
          ...(hasPasteValueKey ? {} : { value: props.value }),
          pageReq: {
            skip: state.skip,
            limit,
          },
        }),
      );

      // 🔧 Add request start log
      logger.info(
        'DataFetcher',
        `Starting data request: ${api}`,
        {
          api,
          params: finalParams,
          serviceInstance: serviceInstance ? 'exists' : 'missing',
          skip: state.skip,
          limit,
        },
        'fetchByDataSetter',
      );

      const requestStartTime = Date.now();
      const response = await serviceInstance?.[api]?.(finalParams);
      const requestDuration = Date.now() - requestStartTime;

      // 🔧 Record original response structure
      const responseStructure = {
        api,
        hasResponse: Boolean(response),
        responseType: typeof response,
        responseKeys:
          response && typeof response === 'object' ? Object.keys(response) : [],

        // Check response.result path
        hasResult: Boolean(response?.result),
        resultType: typeof response?.result,
        resultKeys: response?.result ? Object.keys(response.result) : [],

        // Check response.result[responseEntityKey] path
        hasResultEntity: Boolean(response?.result?.[responseEntityKey]),
        resultEntityType: typeof response?.result?.[responseEntityKey],
        resultEntityIsArray: Array.isArray(
          response?.result?.[responseEntityKey],
        ),
        resultEntityLength: Array.isArray(response?.result?.[responseEntityKey])
          ? response.result[responseEntityKey].length
          : 'N/A',

        // Check response[responseEntityKey] path (direct access)
        hasDirectEntity: Boolean(response?.[responseEntityKey]),
        directEntityType: typeof response?.[responseEntityKey],
        directEntityIsArray: Array.isArray(response?.[responseEntityKey]),
        directEntityLength: Array.isArray(response?.[responseEntityKey])
          ? response[responseEntityKey].length
          : 'N/A',

        responseEntityKey,
      };

      logger.info(
        'DataFetcher',
        `Response structure analysis: ${api}`,
        responseStructure,
        'fetchByDataSetter',
      );

      // 🔧 Fix: Directly use response[responseEntityKey] (i.e., response.data)
      let ret = response?.[responseEntityKey];

      logger.debug(
        'DataFetcher',
        `Data extraction result: ${api}`,
        {
          api,
          responseEntityKey,
          retType: typeof ret,
          retIsArray: Array.isArray(ret),
          retLength: Array.isArray(ret) ? ret.length : 'N/A',
        },
        'fetchByDataSetter',
      );

      if (isJsonParse) {
        // Support JSON parsing
        const parsedData = safeJSONParse({ valueString: ret, empty: {} }) as {
          [key: string]: any;
        };
        ret = parsedData?.[JsonParseEntityKey];
      }

      const dataArray = utils.ensureArray(ret);
      _options = optionfy({
        dataSet: dataArray,
        ...optionCfg,
      });

      // 🔧 Add request success log
      logger.info(
        'DataFetcher',
        `Request successful: ${api}`,
        {
          api,
          duration: `${requestDuration}ms`,
          dataCount: dataArray?.length || 0,
          optionsCount: _options?.length || 0,
          responseEntityKey,
          actualDataReceived: dataArray?.length > 0,
        },
        'fetchByDataSetter',
      );

      // Handle data source sharing
      if (props.dataSourceShare && this.cacheHandlerRef) {
        this.cacheHandlerRef.setToCache(api, response);
      }
    } catch (error) {
      // 🔧 Add request failure log
      logger.error(
        'DataFetcher',
        `Request failed: ${api}`,
        error as Error,
        {
          api,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'fetchByDataSetter',
      );
      _options = [];
    } finally {
      delay(() => {
        const finalCtx = this.getContext();
        if (finalCtx) {
          finalCtx.setState({
            fetching: false,
            loading: false,
          });
          logger.debug(
            'DataFetcher',
            'Delayed reset loading state',
            {
              api,
            },
            'fetchByDataSetter',
          );
        }
      }, 500);
    }

    return _options;
  }

  /**
   * Fetch data through function
   * @param dataSource Data source function
   * @param remoteSearchParams Search parameters
   * @param externalContext Optional external context (for debounce scenarios)
   */
  async fetchByFunction(
    dataSource: (props: SelectDataSourceProps) => Promise<any> | any,
    remoteSearchParams: any,
    externalContext?: PluginContext,
  ): Promise<SelectOption[]> {
    // Prefer externally passed context
    const ctx = externalContext || this.getContext();
    if (!ctx) {
      logger.warn(
        'DataFetcher',
        'fetchByFunction called but context is null or destroyed',
        {
          isDestroyed: this.isDestroyed,
          hasExternalContext: Boolean(externalContext),
        },
        'fetchByFunction',
      );
      return [];
    }

    const { limit, handleParams } = this.config;
    const { state, utils } = ctx;
    const { props } = ctx;

    try {
      // Check if remoteSearchParams contains custom paste value field, if so don't add extra value parameter
      const hasPasteValueKey =
        props.pasteValueKey && remoteSearchParams[props.pasteValueKey];

      const finalParams = handleParams(
        utils.removeUndefinedValues({
          ...remoteSearchParams,
          // Only add value parameter when pasteValueKey is not used
          ...(hasPasteValueKey ? {} : { value: props.value }),
          pageReq: {
            skip: state.skip,
            limit,
          },
        }),
      );

      // 🔧 Add function request start log
      logger.info(
        'DataFetcher',
        'Starting data source function execution',
        {
          params: finalParams,
          skip: state.skip,
          limit,
        },
        'fetchByFunction',
      );

      const requestStartTime = Date.now();
      const response = await dataSource?.(finalParams);
      const requestDuration = Date.now() - requestStartTime;

      let _options: SelectOption[] = [];

      // Process data returned by function type data source according to actual situation
      if (Array.isArray(response)) {
        _options = response;
      }

      // 🔧 Add function request success log
      logger.info(
        'DataFetcher',
        'Data source function executed successfully',
        {
          duration: `${requestDuration}ms`,
          optionsCount: _options?.length || 0,
          isArray: Array.isArray(response),
        },
        'fetchByFunction',
      );

      return _options;
    } catch (error) {
      // 🔧 Add function request failure log
      logger.error(
        'DataFetcher',
        'Data source function execution failed',
        error as Error,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        'fetchByFunction',
      );
      return [];
    }
  }

  /**
   * Unified data fetching method
   * @param dataSource Data source configuration or function
   * @param remoteSearchParams Search parameters
   * @param externalContext Optional external context (for debounce scenarios)
   */
  async fetchData(
    dataSource:
      | DataSourceSetter
      | ((props: SelectDataSourceProps) => Promise<any>),
    remoteSearchParams: Record<string, any>,
    externalContext?: PluginContext,
  ): Promise<SelectOption[]> {
    // Prefer externally passed context
    const ctx = externalContext || this.getContext();
    if (!ctx) {
      logger.warn(
        'DataFetcher',
        'fetchData called but context is null or destroyed',
        {
          isDestroyed: this.isDestroyed,
          hasContext: Boolean(this.context),
          hasExternalContext: Boolean(externalContext),
        },
        'fetchData',
      );
      return [];
    }

    // 🔧 Record dataSource information in detail
    const dataSourceInfo: any = {
      typeofDataSource: typeof dataSource,
      isObject: typeof dataSource === 'object' && dataSource !== null,
    };

    if (typeof dataSource === 'object' && dataSource !== null) {
      dataSourceInfo.hasServiceInstance = 'serviceInstance' in dataSource;
      dataSourceInfo.hasApi = 'api' in dataSource;
      if ('api' in dataSource) {
        dataSourceInfo.apiValue = (dataSource as any).api;
        dataSourceInfo.apiType = typeof (dataSource as any).api;
        dataSourceInfo.apiIncludesUndefined =
          typeof (dataSource as any).api === 'string' &&
          (dataSource as any).api.includes('undefined');
        dataSourceInfo.apiIncludesNull =
          typeof (dataSource as any).api === 'string' &&
          (dataSource as any).api.includes('null');
      }
      if ('serviceInstance' in dataSource) {
        const { serviceInstance } = dataSource as any;
        dataSourceInfo.serviceInstanceType = typeof serviceInstance;
        if (
          'api' in dataSource &&
          typeof (dataSource as any).api === 'string'
        ) {
          const { api } = dataSource as any;
          dataSourceInfo.apiMethodExists =
            typeof serviceInstance?.[api] === 'function';
        }
      }
    }

    const isValidDataSourceSetter = isDataSourceSetter(dataSource);
    const isValidFunction = isFunction(dataSource);

    // 🔧 Add data fetching entry log
    logger.info(
      'DataFetcher',
      'Data fetching entry',
      {
        dataSourceType: (() => {
          if (isValidDataSourceSetter) {
            return 'DataSourceSetter';
          }
          if (isValidFunction) {
            return 'Function';
          }
          return 'Invalid';
        })(),
        isValidDataSourceSetter,
        isValidFunction,
        dataSourceInfo,
        remoteSearchParams,
      },
      'fetchData',
    );

    if (isValidDataSourceSetter) {
      return this.fetchByDataSetter(
        dataSource,
        remoteSearchParams,
        externalContext,
      );
    }
    if (isValidFunction) {
      return this.fetchByFunction(
        dataSource as (props: SelectDataSourceProps) => Promise<any>,
        remoteSearchParams,
        externalContext,
      );
    }

    logger.warn(
      'DataFetcher',
      'dataSource validation failed, unable to fetch data',
      {
        dataSourceType: typeof dataSource,
        dataSourceInfo,
        possibleReasons: [
          'api contains undefined or null',
          'api method does not exist in serviceInstance',
          'serviceInstance is empty',
          'dataSource configuration incomplete',
        ],
      },
      'fetchData',
    );

    return [];
  }

  /**
   * Process fetched option data
   * @param options Original option data
   * @param isAppend Whether append mode
   * @param apiName API name
   * @param externalContext Optional external context (for debounce scenarios)
   */
  processOptions(
    options: SelectOption[],
    isAppend = false,
    apiName?: string,
    externalContext?: PluginContext,
  ): SelectOption[] {
    // Prefer externally passed context
    const ctx = externalContext || this.getContext();
    if (!ctx) {
      logger.warn(
        'DataFetcher',
        'processOptions called but context is null or destroyed',
        {
          isDestroyed: this.isDestroyed,
          optionsCount: options?.length || 0,
          hasExternalContext: Boolean(externalContext),
        },
        'processOptions',
      );
      return options;
    }

    const { state } = ctx;
    const { handleOptions } = this.config;
    const { props } = ctx;

    // 🔧 Add option processing log
    logger.debug(
      'DataFetcher',
      'Processing option data',
      {
        apiName,
        optionsCount: options?.length || 0,
        isAppend,
        existingOptionsCount: state.fetchOptions?.length || 0,
      },
      'processOptions',
    );

    // Decide whether to append data - use cloneDeep to ensure deep copy, consistent with original code
    const finalOptions = isAppend
      ? this.cloneDeep([...state.fetchOptions, ...options])
      : options;

    // Apply user-defined processing function
    const result = isFunction(handleOptions)
      ? handleOptions({ options: finalOptions, value: props.value })
      : finalOptions;

    logger.debug(
      'DataFetcher',
      'Option processing completed',
      {
        apiName,
        finalOptionsCount: result?.length || 0,
        hasCustomHandler: isFunction(handleOptions),
      },
      'processOptions',
    );

    return result;
  }

  /**
   * Deep copy function, ensure consistent behavior with original code
   */
  private cloneDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.cloneDeep(item)) as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.cloneDeep(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Update pagination related state
   */
  updatePaginationState(options: SelectOption[]): void {
    const ctx = this.getContext();
    if (!ctx) {
      logger.warn(
        'DataFetcher',
        'updatePaginationState called but context is null or destroyed',
        {
          isDestroyed: this.isDestroyed,
        },
        'updatePaginationState',
      );
      return;
    }

    const { limit } = this.config;

    // 🔧 Remove loading reset, let search-handler manage loading state uniformly
    ctx.setState({
      canTriggerLoadMore: options?.length >= limit,
    });

    logger.debug(
      'DataFetcher',
      'Updating pagination state',
      {
        optionsCount: options?.length || 0,
        limit,
        canTriggerLoadMore: options?.length >= limit,
      },
      'updatePaginationState',
    );
  }

  destroy(): void {
    this.isDestroyed = true;
    logger.debug('DataFetcher', 'Plugin destroyed', {}, 'destroy');
    // Clean up resources
    this.context = null as any;
  }
}
