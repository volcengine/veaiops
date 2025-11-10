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

import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { MetricThresholdResult } from 'api-generate';
import { useCallback, useRef, useState } from 'react';
import { convertTimeseriesData } from '../../../ui/components/shared/data-utils';
import type { TimeseriesDataPoint } from '../../../ui/components/shared/types';
import { callTimeseriesApi } from '../hooks/use-api-call';
import type { RequestParams } from '../types';

/**
 * Data fetching Hook parameter interface
 */
export interface UseDataFetchingParams {
  metric?: MetricThresholdResult;
  timeRange: [Date, Date];
  prepareRequestParams: () => RequestParams | null;
}

/**
 * Data fetching Hook
 * Responsible for fetching and processing timeseries data
 */
export const useDataFetching = ({
  metric,
  timeRange,
  prepareRequestParams,
}: UseDataFetchingParams) => {
  const [loading, setLoading] = useState(false);
  const [timeseriesData, setTimeseriesData] = useState<TimeseriesDataPoint[]>(
    [],
  );
  // Request counter used to prevent race conditions
  const requestIdRef = useRef(0);

  // 🔧 Render counter - used to detect infinite loops
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  if (renderCountRef.current > 50) {
    logger.error({
      message: '⚠️ useDataFetching 渲染次数过多，可能存在死循环！',
      data: {
        renderCount: renderCountRef.current,
      },
      source: 'useTimeseriesData',
      component: 'useDataFetching',
    });
  }

  // Fetch timeseries data - use useCallback to stabilize reference, avoid infinite loops
  const fetchTimeseriesData = useCallback(async () => {
    logger.info({
      message: '📊 开始获取时序数据',
      data: {
        hasMetric: Boolean(metric),
        metricName: metric?.name,
        timeRange: timeRange.map((d) => d.toISOString()),
        requestId: requestIdRef.current + 1,
      },
      source: 'useTimeseriesData',
      component: 'fetchTimeseriesData',
    });

    const params = prepareRequestParams();
    if (!params) {
      logger.warn({
        message: '⚠️ 请求参数无效，取消获取',
        data: { hasMetric: Boolean(metric) },
        source: 'useTimeseriesData',
        component: 'fetchTimeseriesData',
      });
      return;
    }

    // Increment request ID to detect race conditions
    const currentRequestId = ++requestIdRef.current;

    logger.info({
      message: '🚀 准备调用时序数据API',
      data: {
        requestId: currentRequestId,
        datasourceType: params.datasourceTypeNormalized,
        metricName: metric?.name,
      },
      source: 'useTimeseriesData',
      component: 'fetchTimeseriesData',
    });

    setLoading(true);
    try {
      let response;

      try {
        response = await callTimeseriesApi(params);
        logger.info({
          message: '✅ 时序数据API调用成功',
          data: {
            requestId: currentRequestId,
            responseCode: response.code,
            hasData: Boolean(response.data),
          },
          source: 'useTimeseriesData',
          component: 'fetchTimeseriesData',
        });
      } catch (_apiError: unknown) {
        // ✅ Correct: use logger to record error, expose actual error information
        const errorObj =
          _apiError instanceof Error ? _apiError : new Error(String(_apiError));
        logger.error({
          message: '❌ 时序数据API调用失败',
          data: {
            requestId: currentRequestId,
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            params,
          },
          source: 'useTimeseriesData',
          component: 'fetchTimeseriesData',
        });
        throw _apiError; // Re-throw, let outer catch handle
      }

      // Check if this is the latest request (prevent race conditions)
      if (currentRequestId !== requestIdRef.current) {
        // ✅ Correct: use logger to record information
        logger.info({
          message: 'Request superseded, ignoring response',
          data: {
            currentRequestId,
            expectedRequestId: requestIdRef.current,
          },
          source: 'useTimeseriesData',
          component: 'fetchTimeseriesData',
        });
        return;
      }

      // Boundary check: response must exist
      if (!response) {
        Message.error('服务器响应为空');
        return;
      }

      // Boundary check: response code and data
      if (response.code === API_RESPONSE_CODE.SUCCESS) {
        // Boundary check: response.data may be null, undefined, or not an array
        if (!response.data) {
          // ✅ Correct: use logger to record warning
          logger.warn({
            message: 'Response data is empty',
            data: { responseCode: response.code },
            source: 'useTimeseriesData',
            component: 'fetchTimeseriesData',
          });
          setTimeseriesData([]);
          Message.info('暂无数据');
          return;
        }

        const dataArray = Array.isArray(response.data) ? response.data : [];

        // Boundary check: data array is empty
        if (dataArray.length === 0) {
          // ✅ Correct: use logger to record info
          logger.info({
            message: 'No timeseries data returned',
            data: { timeRange },
            source: 'useTimeseriesData',
            component: 'fetchTimeseriesData',
          });
          setTimeseriesData([]);
          Message.info('查询时间范围内暂无数据');
          return;
        }

        // Boundary check: data volume too large warning
        const totalDataPoints = dataArray.reduce((sum, item) => {
          return sum + (item.timestamps?.length || 0);
        }, 0);

        if (totalDataPoints > 10000) {
          Message.warning(
            `数据点数量较大 (${totalDataPoints})，图表渲染可能较慢`,
          );
        }

        try {
          // Boundary check: metric must exist
          if (!metric) {
            Message.error('指标信息无效');
            setTimeseriesData([]);
            return;
          }
          // metric has been verified to exist, type is MetricThresholdResult
          const chartData = convertTimeseriesData({
            backendData: dataArray,
            metric,
          });

          // Boundary check: converted data should be valid
          if (!chartData || chartData.length === 0) {
            // ✅ Correct: use logger to record warning
            logger.warn({
              message: 'Converted chart data is empty',
              data: { dataArrayLength: dataArray.length },
              source: 'useTimeseriesData',
              component: 'fetchTimeseriesData',
            });
            Message.info('数据转换后为空，可能是数据格式问题');
            setTimeseriesData([]);
            return;
          }

          setTimeseriesData(chartData);
        } catch (conversionError: unknown) {
          // ✅ Correct: use logger to record error, expose actual error information
          const errorObj =
            conversionError instanceof Error
              ? conversionError
              : new Error(String(conversionError));
          logger.error({
            message: 'Data conversion error',
            data: {
              error: errorObj.message,
              stack: errorObj.stack,
              errorObj,
            },
            source: 'useTimeseriesData',
            component: 'fetchTimeseriesData',
          });
          const errorMessage =
            conversionError instanceof Error
              ? conversionError.message
              : '数据格式转换失败，请检查数据格式';
          Message.error(errorMessage);
          setTimeseriesData([]);
        }
      } else {
        // API returned error code
        const errorMessage = response.message || '获取时序数据失败';
        Message.error(errorMessage);
        setTimeseriesData([]);
      }
    } catch (error: unknown) {
      // Only show error if request was not superseded
      if (currentRequestId === requestIdRef.current) {
        // ✅ Correct: use logger to record error, expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'fetchTimeseriesData error',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'useTimeseriesData',
          component: 'fetchTimeseriesData',
        });

        // Boundary check: error object type
        const errorMessage = errorObj.message || '获取时序数据失败';

        Message.error(errorMessage);
        setTimeseriesData([]);
      }
    } finally {
      // Only update loading state if request was not superseded
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        logger.info({
          message: '✅ 时序数据获取流程完成',
          data: {
            requestId: currentRequestId,
            dataPointsCount: timeseriesData.length,
          },
          source: 'useTimeseriesData',
          component: 'fetchTimeseriesData',
        });
      }
    }
  }, [prepareRequestParams, metric, timeRange]); // ✅ Add dependency array, stabilize function reference

  return {
    loading,
    timeseriesData,
    fetchTimeseriesData,
    setTimeseriesData,
  };
};
