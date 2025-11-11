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
 * URL 查询参数同步 Hook
 * 负责将表格的查询状态与 URL 参数进行上下界同步
 */

import type {
  QuerySyncConfig,
  QuerySyncContext,
} from '@/custom-table/types/plugins/query-sync';
import { useSearchParams } from '@modern-js/runtime/router';
import { getSearchParamsObject, logger } from '@veaiops/utils';
import { useMount, useUpdateEffect } from 'ahooks';
import { isEmpty, isEqual } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';
import { querySyncLogger } from './internal/query-sync-logger';

// 🎯 调试计数器
let hookCallCount = 0;

/**
 * 规范化query对象，用于准确对比
 *
 * 边界case处理：
 * - 移除 undefined/null/空字符串
 * - 数组排序保证顺序一致
 * - 递归处理嵌套对象
 */
const normalizeQuery = (query: Record<string, any>): Record<string, any> => {
  const normalized: Record<string, any> = {};

  Object.entries(query || {}).forEach(([key, value]) => {
    // 跳过无效值
    if (value === undefined || value === null || value === '') {
      return;
    }

    // 处理数组：过滤空值并排序
    if (Array.isArray(value)) {
      const filtered = value.filter(
        (v) => v !== undefined && v !== null && v !== '',
      );
      if (filtered.length > 0) {
        // 排序保证顺序一致（数字和字符串分别排序）
        normalized[key] = [...filtered].sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
          }
          return String(a).localeCompare(String(b));
        });
      }
      return;
    }

    // 处理对象：递归规范化
    if (typeof value === 'object' && value !== null) {
      const nested = normalizeQuery(value);
      if (!isEmpty(nested)) {
        normalized[key] = nested;
      }
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

/**
 * 规范化URL参数字符串，用于准确对比
 */
const normalizeUrlParams = (searchParams: URLSearchParams): string => {
  const params = new URLSearchParams();
  const entries = Array.from(searchParams.entries());

  // 过滤空值并排序
  const filtered = entries.filter(([_, value]) => value !== '');
  filtered.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0].localeCompare(b[0]);
    }
    return String(a[1]).localeCompare(String(b[1]));
  });

  // 重新构建
  filtered.forEach(([key, value]) => {
    params.append(key, value);
  });

  return params.toString();
};

/**
 * 启用日志收集（需在 component 中调用）
 */
const enableLogging = () => {
  // 调用方需在 component 中执行：
  // const { startCollection } = useAutoLogExport({ autoStart: true });
  // startCollection();
};

/**
 * 导出日志（需在 component 中调用 useAutoLogExport 后使用）
 */
const exportLogs = () => {
  // 调用方需集成 useAutoLogExport 并调用其 exportLogs
};

/**
 * 查询参数同步 Hook
 */
export const useQuerySync = <QueryType extends Record<string, any> = any>(
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
): {
  query: QueryType;
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  syncQueryToUrl: (query: QueryType) => void;
  resetQuery: () => void;
  enableLogging: () => void;
  exportLogs: () => void;
} => {
  // 🎯 记录 hook 调用（用于调试和日志追踪）
  hookCallCount++;
  const currentCallId = hookCallCount;

  const [searchParams, setSearchParams] = useSearchParams();

  // 🔧 状态控制标志
  const isInitializedRef = useRef(false); // 是否已初始化
  const isResettingRef = useRef(false); // 是否正在重置

  // 🔧 防止循环同步的标志位
  const isSyncingToUrlRef = useRef(false); // 正在同步query→URL
  const isSyncingToQueryRef = useRef(false); // 正在同步URL→query

  // 🔧 真实变化检测：记录规范化后的值
  const lastNormalizedQueryRef = useRef<Record<string, any>>({});
  const lastNormalizedUrlRef = useRef<string>('');

  // 🚨 循环检测和自动熔断
  const syncCountRef = useRef({ queryToUrl: 0, urlToQuery: 0 });
  const lastResetTimeRef = useRef(Date.now());
  const SYNC_LIMIT = 5; // 连续同步限制：5次
  const RESET_INTERVAL = 1000; // 重置间隔：1秒
  /**
   * 同步查询参数到 URL
   *
   * 🎯 边界case处理：
   * - 规范化query后对比，避免类型转换循环
   * - 过滤空值（undefined/null/""）
   * - 数组参数正确序列化
   * - 保留认证参数
   */
  const syncQueryToUrl = useCallback(
    (query: QueryType) => {
      if (!config.syncQueryOnSearchParams) {
        querySyncLogger.debug({
          component: 'syncQueryToUrl',
          message: '跳过 - 未启用URL同步',
        });
        return;
      }

      // 🔧 规范化query用于对比
      const normalizedQuery = normalizeQuery(query);

      // 🔧 真实变化检测：使用深度对比
      if (isEqual(normalizedQuery, lastNormalizedQueryRef.current)) {
        querySyncLogger.debug({
          component: 'syncQueryToUrl',
          message: '⏭️ 跳过 - query未实际变化',
        });
        return;
      }

      querySyncLogger.info({
        component: 'syncQueryToUrl',
        message: '📤 开始同步query到URL',
        data: {
          normalizedQuery,
          lastQuery: lastNormalizedQueryRef.current,
        },
      });

      try {
        const newParams = new URLSearchParams();

        // 保留认证参数
        if (config.authQueryPrefixOnSearchParams) {
          for (const [key, value] of searchParams.entries()) {
            if (key in config.authQueryPrefixOnSearchParams) {
              newParams.set(key, value);
            }
          }
        }

        // 添加规范化后的查询参数
        Object.entries(normalizedQuery).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              newParams.append(key, String(item));
            });
          } else {
            // 🔧 修复：使用 querySearchParamsFormat 格式化参数值
            const formatter = config.querySearchParamsFormat?.[key];
            const formattedValue = formatter ? formatter(value) : String(value);

            newParams.set(key, formattedValue);
          }
        });

        const newUrlStr = normalizeUrlParams(newParams);

        querySyncLogger.info({
          component: 'syncQueryToUrl',
          message: '📤 设置URL参数',
          data: {
            oldUrl: lastNormalizedUrlRef.current,
            newUrl: newUrlStr,
            normalizedQuery,
            newParamsObject: Object.fromEntries(newParams.entries()),
            hasQuerySearchParamsFormat: Boolean(config.querySearchParamsFormat),
            querySearchParamsFormatKeys: config.querySearchParamsFormat
              ? Object.keys(config.querySearchParamsFormat)
              : [],
          },
        });

        setSearchParams(newParams, { replace: true });

        // 🔧 记录规范化后的值
        lastNormalizedQueryRef.current = normalizedQuery;
        lastNormalizedUrlRef.current = newUrlStr;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        querySyncLogger.error({
          component: 'syncQueryToUrl',
          message: '同步失败',
          data: {
            error: errorObj.message,
            errorObj,
          },
        });
      }
    },
    // 🎯 关键：只依赖配置项，不依赖searchParams（通过闭包访问最新值）
    [
      config.syncQueryOnSearchParams,
      config.authQueryPrefixOnSearchParams,
      setSearchParams,
    ],
  );

  /**
   * 从 URL 同步到查询参数
   *
   * 🎯 边界case处理：
   * - queryFormat 值类型转换
   * - 空参数过滤
   * - 认证参数排除
   * - 为未定义字段添加默认格式化函数
   */
  const syncUrlToQuery = useCallback(() => {
    if (!config.syncQueryOnSearchParams) {
      querySyncLogger.debug({
        component: 'syncUrlToQuery',
        message: '跳过 - 未启用URL同步',
      });
      return {};
    }

    // 🔧 修复：在 useActiveKeyHook 模式下，直接从 window.location.search 获取最新参数
    const actualSearchParams = config.useActiveKeyHook
      ? (() => {
          const { search } = window.location;
          const windowParams = new URLSearchParams(search);

          querySyncLogger.info({
            component: 'syncUrlToQuery',
            message: '📥 useActiveKeyHook 模式 - 从 window.location 读取',
            data: {
              windowLocationSearch: search,
              windowParamsEntries: Array.from(windowParams.entries()),
              contextSearchParams: searchParams.toString(),
            },
          });

          // 如果 window.location.search 有参数，使用它
          if (search) {
            return windowParams;
          }

          // 如果 window.location.search 为空，但 context.searchParams 有参数，使用 context
          const contextSearch = searchParams.toString();
          if (contextSearch) {
            return searchParams;
          }

          // 都为空，返回空的 URLSearchParams
          return new URLSearchParams();
        })()
      : searchParams;

    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 开始从URL同步到query',
      data: {
        useActiveKeyHook: config.useActiveKeyHook,
        hasQueryFormat: Boolean(config.queryFormat),
        queryFormatKeys: config.queryFormat
          ? Object.keys(config.queryFormat)
          : [],
        actualSearchParamsString: actualSearchParams.toString(),
        actualSearchParamsEntries: Array.from(actualSearchParams.entries()),
        contextSearchParamsString: searchParams.toString(),
        windowLocationSearch:
          typeof window !== 'undefined' ? window.location.search : 'N/A',
      },
    });

    // 使用 queryFormat 格式化 URL 参数
    let urlQuery: Record<string, any> = {};

    if (config.queryFormat) {
      // 🔧 为所有URL参数添加格式化函数（包括未定义的）
      const completeQueryFormat: Record<string, any> = {
        ...config.queryFormat,
      };

      for (const [key] of actualSearchParams.entries()) {
        // 跳过认证参数
        if (
          config.authQueryPrefixOnSearchParams &&
          key in config.authQueryPrefixOnSearchParams
        ) {
          continue;
        }

        // 为未定义字段添加默认格式化
        if (!completeQueryFormat[key]) {
          completeQueryFormat[key] = ({ value }: any) => value;
        }
      }

      urlQuery = getSearchParamsObject({
        searchParams: actualSearchParams,
        queryFormat: completeQueryFormat,
      });

      // 🔍 添加日志：记录 queryFormat 格式化后的结果
      querySyncLogger.info({
        component: 'syncUrlToQuery',
        message: '🔧 queryFormat 格式化完成',
        data: {
          urlQuery,
          urlQueryKeys: Object.keys(urlQuery),
          channelValue: urlQuery.channel,
          channelType: typeof urlQuery.channel,
        },
      });
    } else {
      // 默认解析（所有值作为字符串）
      for (const [key, value] of actualSearchParams.entries()) {
        if (
          config.authQueryPrefixOnSearchParams &&
          key in config.authQueryPrefixOnSearchParams
        ) {
          continue;
        }
        urlQuery[key] = value;
      }
    }

    // 🔍 记录过滤认证参数前的状态
    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 过滤认证参数前',
      data: {
        urlQuery,
        urlQueryKeys: Object.keys(urlQuery),
        urlQueryChannel: urlQuery.channel,
        urlQueryDatasourceType: urlQuery.datasource_type,
        hasAuthQueryPrefix: Boolean(config.authQueryPrefixOnSearchParams),
        authQueryPrefixKeys: config.authQueryPrefixOnSearchParams
          ? Object.keys(config.authQueryPrefixOnSearchParams)
          : [],
      },
    });

    // 过滤认证参数
    if (config.authQueryPrefixOnSearchParams) {
      Object.keys(config.authQueryPrefixOnSearchParams).forEach((key) => {
        delete urlQuery[key];
      });
    }

    // 🔍 记录过滤认证参数后的状态
    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 过滤认证参数后',
      data: {
        urlQuery,
        urlQueryKeys: Object.keys(urlQuery),
        urlQueryDatasourceType: urlQuery.datasource_type,
      },
    });

    // 🔧 规范化后返回
    const normalizedUrlQuery = normalizeQuery(urlQuery);

    // 🔍 记录规范化过程
    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 规范化过程',
      data: {
        beforeNormalize: urlQuery,
        afterNormalize: normalizedUrlQuery,
        beforeNormalizeDatasourceType: urlQuery.datasource_type,
        afterNormalizeDatasourceType: normalizedUrlQuery.datasource_type,
      },
    });

    // 🔍 详细记录最终结果
    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 返回规范化query',
      data: {
        urlQuery: normalizedUrlQuery,
        normalizedUrlQueryKeys: Object.keys(normalizedUrlQuery),
        normalizedUrlQueryDatasourceType: normalizedUrlQuery.datasource_type,
        normalizedUrlQueryDatasourceTypeType:
          typeof normalizedUrlQuery.datasource_type,
        isEmptyNormalizedUrlQuery: isEmpty(normalizedUrlQuery),
        rawUrlQuery: urlQuery,
        beforeNormalize: urlQuery,
        afterNormalize: normalizedUrlQuery,
      },
    });

    return normalizedUrlQuery;
  }, [
    config.syncQueryOnSearchParams,
    config.queryFormat,
    config.authQueryPrefixOnSearchParams,
    config.useActiveKeyHook,
    searchParams,
  ]);

  /**
   * 重置查询参数
   * 🔧 修复：使用 initQuery 而不是空对象，确保重置到初始状态
   * 🎯 边界case处理：
   * - initQuery 为空对象或 undefined：重置为空对象
   * - preservedFields 与 initQuery 合并：preservedFields 优先级更高
   * - querySearchParamsFormat 格式化 URL 参数
   * - 数组参数的 URL 同步
   * - 认证参数的保留
   * - syncQueryOnSearchParams 为 false 时不同步到 URL
   */
  const resetQuery = useCallback(
    (resetEmptyData = false, preservedFields?: Record<string, unknown>) => {
      isResettingRef.current = true;

      // 🔍 获取 initQuery（可能为空对象或 undefined）
      const baseInitQuery = config.initQuery || ({} as QueryType);

      // 🔧 合并 preservedFields（preservedFields 优先级更高）
      const resetTargetQuery = {
        ...baseInitQuery,
        ...(preservedFields || {}),
      } as QueryType;

      querySyncLogger.info({
        component: 'resetQuery',
        message: '🔄 重置查询参数',
        data: {
          hasInitQuery: Boolean(config.initQuery),
          initQuery: config.initQuery,
          preservedFields,
          resetTargetQuery,
          currentQuery: context.query,
          hasCustomReset: Boolean(config.customReset),
          resetEmptyData,
        },
      });

      if (config.customReset) {
        querySyncLogger.info({
          component: 'resetQuery',
          message: '🔄 使用 customReset',
          data: {
            initQuery: config.initQuery,
            preservedFields,
            resetTargetQuery,
          },
        });

        // 🔧 传递 initQuery 和 preservedFields 给 customReset
        config.customReset({
          resetEmptyData,
          setQuery: context.setQuery as any,
          initQuery: config.initQuery,
          preservedFields,
        });
      } else {
        querySyncLogger.info({
          component: 'resetQuery',
          message: '🔄 使用默认重置逻辑',
          data: {
            initQuery: config.initQuery,
            preservedFields,
            resetTargetQuery,
            currentQuery: context.query,
          },
        });

        // 🔧 修复：重置到 resetTargetQuery（initQuery + preservedFields）
        context.setQuery(resetTargetQuery);
      }

      // 🔧 同步 URL 参数到 resetTargetQuery（保留认证参数）
      // 🎯 边界case：如果 syncQueryOnSearchParams 为 false，不同步到 URL
      let newParams: URLSearchParams | undefined;
      if (!config.syncQueryOnSearchParams) {
        querySyncLogger.info({
          component: 'resetQuery',
          message: '⏭️ 跳过 URL 同步（syncQueryOnSearchParams 为 false）',
        });
        // 🎯 边界case：不同步时，newParams 使用当前的 searchParams
        newParams = searchParams;
      } else {
        newParams = new URLSearchParams();

        // 保留认证参数
        if (config.authQueryPrefixOnSearchParams) {
          for (const [key, value] of searchParams.entries()) {
            if (key in config.authQueryPrefixOnSearchParams) {
              newParams.set(key, value);
            }
          }
        }

        // 🔧 将 resetTargetQuery 中的非空值同步到 URL
        // 🎯 边界case：考虑 querySearchParamsFormat 格式化
        if (resetTargetQuery && typeof resetTargetQuery === 'object') {
          Object.entries(resetTargetQuery).forEach(([key, value]) => {
            // 跳过认证参数
            if (
              config.authQueryPrefixOnSearchParams &&
              key in config.authQueryPrefixOnSearchParams
            ) {
              return;
            }

            // 🎯 边界case：跳过空值（undefined、null、空字符串）
            if (value === undefined || value === null || value === '') {
              return;
            }

            // 🎯 边界case：使用 querySearchParamsFormat 格式化（如果存在）
            let formattedValue: string;
            const formatter = config.querySearchParamsFormat?.[key];
            if (formatter) {
              formattedValue = formatter(value);
            } else if (Array.isArray(value)) {
              // 🎯 边界case：数组参数，每个元素单独添加
              if (newParams) {
                value.forEach((item) => {
                  newParams!.append(key, String(item));
                });
              }
              return; // 数组已经处理，跳过后续单个值的设置
            } else if (typeof value === 'object' && value !== null) {
              // 🎯 边界case：对象值（但不是数组），序列化为 JSON
              formattedValue = JSON.stringify(value);
            } else if (typeof value === 'string') {
              formattedValue = value;
            } else {
              // 🎯 边界case：数字、布尔值等，转换为字符串
              formattedValue = String(value);
            }

            if (newParams) {
              newParams.set(key, formattedValue);
            }
          });
        }

        querySyncLogger.info({
          component: 'resetQuery',
          message: '🔄 更新 URL 参数',
          data: {
            newParams: newParams.toString(),
            resetTargetQuery,
            hasQuerySearchParamsFormat: Boolean(config.querySearchParamsFormat),
          },
        });

        setSearchParams(newParams, { replace: true });
      }

      // 🔧 重置所有状态（无论是否同步到 URL）
      const normalizedResetQuery = normalizeQuery(resetTargetQuery);
      lastNormalizedQueryRef.current = normalizedResetQuery;
      // 🎯 边界case：使用 newParams（如果同步到 URL 则为新参数，否则为当前 searchParams）
      lastNormalizedUrlRef.current = normalizeUrlParams(
        newParams || searchParams,
      );
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };

      querySyncLogger.info({
        component: 'resetQuery',
        message: '🔄 重置完成',
        data: {
          resetTargetQuery,
          normalizedResetQuery,
          finalQuery: context.query,
          finalUrl: window.location.href,
        },
      });

      setTimeout(() => {
        isResettingRef.current = false;
      }, 100);
    },
    [
      config.customReset,
      config.initQuery,
      config.authQueryPrefixOnSearchParams,
      config.syncQueryOnSearchParams,
      config.querySearchParamsFormat,
      context.setQuery,
      context.query,
      setSearchParams,
      searchParams,
    ],
  );

  /**
   * 初始化：只在挂载时执行一次
   */
  useMount(() => {
    if (isInitializedRef.current) {
      querySyncLogger.info({
        component: 'useMount',
        message: '🔄 跳过初始化 - 已初始化',
        data: {
          callId: currentCallId,
        },
      });
      return;
    }

    // 🔍 详细记录初始化前的状态
    querySyncLogger.info({
      component: 'useMount',
      message: '🔄 ========== QuerySync 初始化开始 ==========',
      data: {
        callId: currentCallId,
        syncEnabled: config.syncQueryOnSearchParams,
        useActiveKeyHook: config.useActiveKeyHook,
        hasQueryFormat: Boolean(config.queryFormat),
        queryFormatKeys: config.queryFormat
          ? Object.keys(config.queryFormat)
          : [],
        hasQuerySearchParamsFormat: Boolean(config.querySearchParamsFormat),
        querySearchParamsFormatKeys: config.querySearchParamsFormat
          ? Object.keys(config.querySearchParamsFormat)
          : [],
        windowLocationHref:
          typeof window !== 'undefined' ? window.location.href : 'N/A',
        windowLocationSearch:
          typeof window !== 'undefined' ? window.location.search : 'N/A',
        contextSearchParams: searchParams.toString(),
        contextQuery: context.query,
        normalizedContextQuery: normalizeQuery(context.query),
        timestamp: new Date().toISOString(),
      },
    });

    if (!config.syncQueryOnSearchParams) {
      querySyncLogger.info({
        component: 'useMount',
        message: '🔄 跳过初始化 - URL 同步未启用',
        data: {
          callId: currentCallId,
        },
      });
      isInitializedRef.current = true;
      return;
    }

    // 从URL初始化query
    querySyncLogger.info({
      component: 'useMount',
      message: '🔄 准备调用 syncUrlToQuery',
      data: {
        callId: currentCallId,
        useActiveKeyHook: config.useActiveKeyHook,
        windowLocationSearch:
          typeof window !== 'undefined' ? window.location.search : 'N/A',
        contextSearchParams: searchParams.toString(),
      },
    });

    const urlQuery = syncUrlToQuery();
    const normalizedCurrentQuery = normalizeQuery(context.query);

    // 🔍 详细记录 syncUrlToQuery 的返回结果
    querySyncLogger.info({
      component: 'useMount',
      message: '🔄 syncUrlToQuery 返回结果',
      data: {
        callId: currentCallId,
        urlQuery,
        urlQueryKeys: Object.keys(urlQuery),
        urlQueryDatasourceType: urlQuery.datasource_type,
        isEmptyUrlQuery: isEmpty(urlQuery),
        normalizedCurrentQuery,
        normalizedCurrentQueryKeys: Object.keys(normalizedCurrentQuery),
        normalizedCurrentQueryDatasourceType:
          normalizedCurrentQuery.datasource_type,
        isEmptyNormalizedCurrentQuery: isEmpty(normalizedCurrentQuery),
      },
    });

    if (!isEmpty(urlQuery)) {
      querySyncLogger.info({
        component: 'useMount',
        message: '📥 从URL初始化query - 开始合并',
        data: {
          callId: currentCallId,
          urlQuery,
          urlQueryDatasourceType: urlQuery.datasource_type,
          currentQuery: normalizedCurrentQuery,
          currentQueryDatasourceType: normalizedCurrentQuery.datasource_type,
          willMerge: true,
        },
      });

      // 🔧 使用规范化后的值合并
      context.setQuery((prev) => {
        const normalizedPrev = normalizeQuery(prev);
        const merged = {
          ...normalizedPrev,
          ...urlQuery,
        };

        // 🔍 记录合并过程（避免 Circular 引用）
        const prevQuerySnapshot = {
          ...prev,
          datasource_type: prev.datasource_type,
        };
        const urlQuerySnapshot = {
          ...urlQuery,
          datasource_type: urlQuery.datasource_type,
        };
        const mergedSnapshot = {
          ...merged,
          datasource_type: merged.datasource_type,
        };

        querySyncLogger.info({
          component: 'useMount',
          message: '📥 合并 query - 执行中',
          data: {
            callId: currentCallId,
            prevQuerySnapshot,
            prevQueryDatasourceType: prev.datasource_type,
            normalizedPrev,
            normalizedPrevDatasourceType: normalizedPrev.datasource_type,
            urlQuerySnapshot,
            urlQueryDatasourceType: urlQuery.datasource_type,
            mergedSnapshot,
            mergedDatasourceType: merged.datasource_type,
            mergedDatasourceTypeType: typeof merged.datasource_type,
          },
        });

        return merged as QueryType;
      });

      // 记录初始状态
      lastNormalizedQueryRef.current = urlQuery;
      lastNormalizedUrlRef.current = normalizeUrlParams(searchParams);

      // 🔍 记录最终状态（避免 Circular 引用）
      const finalQuerySnapshot = {
        ...context.query,
        datasource_type: context.query.datasource_type,
      };
      const finalQueryKeys = Object.keys(context.query);

      querySyncLogger.info({
        component: 'useMount',
        message: '📥 从URL初始化query - 完成',
        data: {
          callId: currentCallId,
          finalQueryKeys,
          finalQuerySnapshot,
          finalQueryDatasourceType: context.query.datasource_type,
          finalQueryDatasourceTypeType: typeof context.query.datasource_type,
          lastNormalizedQuery: lastNormalizedQueryRef.current,
          lastNormalizedQueryDatasourceType:
            lastNormalizedQueryRef.current?.datasource_type,
          lastNormalizedUrl: lastNormalizedUrlRef.current,
        },
      });
    } else if (!isEmpty(normalizedCurrentQuery)) {
      querySyncLogger.info({
        component: 'useMount',
        message: '📤 从query初始化URL',
        data: {
          callId: currentCallId,
          query: normalizedCurrentQuery,
          queryDatasourceType: normalizedCurrentQuery.datasource_type,
        },
      });
      syncQueryToUrl(normalizedCurrentQuery as QueryType);
    } else {
      querySyncLogger.info({
        component: 'useMount',
        message: '🔄 URL 和 query 都为空，跳过同步',
        data: {
          callId: currentCallId,
          urlQuery,
          normalizedCurrentQuery,
        },
      });
    }

    isInitializedRef.current = true;

    // 🔍 记录最终状态（避免 Circular 引用）
    const finalQuerySnapshot = {
      ...context.query,
      datasource_type: context.query.datasource_type,
    };
    const finalQueryKeys = Object.keys(context.query);

    querySyncLogger.info({
      component: 'useMount',
      message: '🔄 ========== QuerySync 初始化完成 ==========',
      data: {
        callId: currentCallId,
        finalQueryKeys,
        finalQuerySnapshot,
        finalQueryDatasourceType: context.query.datasource_type,
        finalQueryDatasourceTypeType: typeof context.query.datasource_type,
        lastNormalizedQuery: lastNormalizedQueryRef.current,
        lastNormalizedQueryDatasourceType:
          lastNormalizedQueryRef.current?.datasource_type,
        windowLocationHref:
          typeof window !== 'undefined' ? window.location.href : 'N/A',
        windowLocationSearch:
          typeof window !== 'undefined' ? window.location.search : 'N/A',
        timestamp: new Date().toISOString(),
      },
    });
  });

  /**
   * 监听query变化 → 同步到URL
   *
   * 🎯 使用 useUpdateEffect 避免初始渲染触发
   * 🎯 使用规范化对比避免类型转换导致的循环
   */
  useUpdateEffect(() => {
    // 跳过条件
    if (isResettingRef.current || !isInitializedRef.current) {
      querySyncLogger.debug({
        component: 'QueryListener',
        message: '⏭️ 跳过',
        data: {
          resetting: isResettingRef.current,
          initialized: isInitializedRef.current,
        },
      });
      syncCountRef.current.queryToUrl = 0;
      return;
    }

    // 防止反向同步触发
    if (isSyncingToQueryRef.current) {
      querySyncLogger.warn({
        component: 'QueryListener',
        message: '⚠️ 跳过 - 正在从URL同步',
      });
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      return;
    }

    // 🔧 规范化query
    const normalizedQuery = normalizeQuery(context.query);

    // 🔧 真实变化检测：深度对比规范化后的值
    if (isEqual(normalizedQuery, lastNormalizedQueryRef.current)) {
      querySyncLogger.debug({
        component: 'QueryListener',
        message: '⏭️ 跳过 - query未变化（深度对比）',
      });
      syncCountRef.current.queryToUrl = 0;
      return;
    }

    // 🚨 循环检测：时间窗口重置
    const now = Date.now();
    if (now - lastResetTimeRef.current > RESET_INTERVAL) {
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };
      lastResetTimeRef.current = now;
      querySyncLogger.debug({
        component: 'QueryListener',
        message: '⏱️ 时间窗口重置计数器',
      });
    }

    // 🚨 循环检测：连续同步超限熔断
    syncCountRef.current.queryToUrl++;
    if (syncCountRef.current.queryToUrl > SYNC_LIMIT) {
      querySyncLogger.error({
        component: 'QueryListener',
        message: '🚨 死循环熔断！query → URL',
        data: {
          syncCount: syncCountRef.current.queryToUrl,
          limit: SYNC_LIMIT,
          currentQuery: normalizedQuery,
          lastQuery: lastNormalizedQueryRef.current,
          diff: Object.keys(normalizedQuery).filter(
            (key) =>
              normalizedQuery[key] !== lastNormalizedQueryRef.current[key],
          ),
        },
      });
      logger.error({
        message:
          '[QuerySync] 🚨 死循环！query → URL 已熔断。检查queryFormat配置！',
        data: {
          syncCount: syncCountRef.current.queryToUrl,
          normalizedQuery,
          lastNormalizedQuery: lastNormalizedQueryRef.current,
        },
        source: 'CustomTable',
        component: 'QuerySync',
      });
      return;
    }

    // 同步到URL
    if (!isEmpty(normalizedQuery)) {
      querySyncLogger.info({
        component: 'QueryListener',
        message: '📤 query变化，同步到URL',
        data: {
          query: normalizedQuery,
          queryChannel: normalizedQuery.channel,
          syncCount: syncCountRef.current.queryToUrl,
          hasQuerySearchParamsFormat: Boolean(config.querySearchParamsFormat),
          querySearchParamsFormatKeys: config.querySearchParamsFormat
            ? Object.keys(config.querySearchParamsFormat)
            : [],
        },
      });

      isSyncingToUrlRef.current = true;

      try {
        syncQueryToUrl(normalizedQuery as QueryType);
        syncCountRef.current.urlToQuery = 0; // 重置反向计数

        // 🔍 添加日志：记录同步后的 URL 状态
        querySyncLogger.info({
          component: 'QueryListener',
          message: '✅ 同步完成，当前 URL',
          data: {
            windowLocationHref: window.location.href,
            windowLocationSearch: window.location.search,
            searchParamsString: searchParams.toString(),
          },
        });
      } finally {
        setTimeout(() => {
          isSyncingToUrlRef.current = false;
        }, 0);
      }
    }
  }, [context.query]);

  /**
   * 监听URL变化 → 同步到query
   *
   * 🎯 使用 useEffect（不是useUpdateEffect）因为需要响应URL变化
   * 🎯 使用规范化对比避免类型转换导致的循环
   */
  useEffect(() => {
    // 跳过条件
    if (isResettingRef.current || !isInitializedRef.current) {
      querySyncLogger.debug({
        component: 'URLListener',
        message: '⏭️ 跳过',
        data: {
          resetting: isResettingRef.current,
          initialized: isInitializedRef.current,
        },
      });
      syncCountRef.current.urlToQuery = 0;
      return;
    }

    // 防止反向同步触发
    if (isSyncingToUrlRef.current) {
      querySyncLogger.warn({
        component: 'URLListener',
        message: '⚠️ 跳过 - 正在从query同步',
      });
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      return;
    }

    // 🔧 规范化URL
    const normalizedUrl = normalizeUrlParams(searchParams);

    // 🔧 真实变化检测：字符串对比
    if (normalizedUrl === lastNormalizedUrlRef.current) {
      querySyncLogger.debug({
        component: 'URLListener',
        message: '⏭️ 跳过 - URL未变化',
      });
      syncCountRef.current.urlToQuery = 0;
      return;
    }

    // 🚨 循环检测：时间窗口重置
    const now = Date.now();
    if (now - lastResetTimeRef.current > RESET_INTERVAL) {
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };
      lastResetTimeRef.current = now;
      querySyncLogger.debug({
        component: 'URLListener',
        message: '⏱️ 时间窗口重置计数器',
      });
    }

    // 🚨 循环检测：连续同步超限熔断
    syncCountRef.current.urlToQuery++;
    if (syncCountRef.current.urlToQuery > SYNC_LIMIT) {
      querySyncLogger.error({
        component: 'URLListener',
        message: '🚨 死循环熔断！URL → query',
        data: {
          syncCount: syncCountRef.current.urlToQuery,
          limit: SYNC_LIMIT,
          currentUrl: normalizedUrl,
          lastUrl: lastNormalizedUrlRef.current,
        },
      });
      logger.error({
        message: '[QuerySync] 🚨 死循环！URL → query 已熔断。检查URL参数格式！',
        data: {
          syncCount: syncCountRef.current.urlToQuery,
          currentUrl: normalizedUrl,
          lastUrl: lastNormalizedUrlRef.current,
        },
        source: 'CustomTable',
        component: 'QuerySync',
      });
      return;
    }

    // 从URL同步
    const urlQuery = syncUrlToQuery();

    if (!isEmpty(urlQuery)) {
      querySyncLogger.info({
        component: 'URLListener',
        message: '📥 URL变化，同步到query',
        data: {
          urlQuery,
          syncCount: syncCountRef.current.urlToQuery,
        },
      });

      isSyncingToQueryRef.current = true;

      try {
        context.setQuery((prev) => {
          const normalizedPrev = normalizeQuery(prev);
          const merged = {
            ...normalizedPrev,
            ...urlQuery,
          };

          querySyncLogger.debug({
            component: 'URLListener',
            message: 'setQuery执行',
            data: {
              prev: normalizedPrev,
              urlQuery,
              merged,
            },
          });

          return merged as QueryType;
        });

        // 🔧 记录规范化后的值
        lastNormalizedUrlRef.current = normalizedUrl;
        lastNormalizedQueryRef.current = urlQuery;
        syncCountRef.current.queryToUrl = 0; // 重置反向计数
      } finally {
        setTimeout(() => {
          isSyncingToQueryRef.current = false;
        }, 0);
      }
    } else {
      querySyncLogger.debug({
        component: 'URLListener',
        message: '📥 URL为空',
      });
      lastNormalizedUrlRef.current = normalizedUrl;
      syncCountRef.current.urlToQuery = 0;
    }
  }, [searchParams]);

  return {
    query: context.query,
    setQuery: context.setQuery,
    syncQueryToUrl,
    resetQuery,
    enableLogging, // 新增：在 component 中调用以启用日志收集
    exportLogs, // 新增：在 component 中调用以导出日志（需先 enable）
  };
};
