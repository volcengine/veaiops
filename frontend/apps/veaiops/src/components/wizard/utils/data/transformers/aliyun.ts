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
 * Aliyun data transformation utilities
 * @description Handles format conversion of Aliyun API response data
 * @author AI Assistant
 * @date 2025-01-16
 */

import type { AliyunInstance, AliyunMetric, AliyunProject } from '../../types';

/**
 * Transform project data
 */
export const transformProjectData = (rawData: any[]): AliyunProject[] => {
  return rawData.map((item: any) => ({
    project: item.Namespace || item.namespace || item.project || 'Unknown',
    description: item.Description || item.description || '',
    region: item.Region || item.region || '',
  }));
};

/**
 * Transform metric data
 */
export const transformMetricData = (rawData: any[]): AliyunMetric[] => {
  return (
    rawData?.map?.((item: any) => ({
      metricName: item.MetricName,
      namespace: item.Namespace,
      description: item.Description,
      unit: item.Unit,
      dimensions: item.Dimensions || [],
      // Parse Dimensions string (comma-separated) into array
      dimensionKeys: item.Dimensions
        ? item.Dimensions.split(',')
            .map((d: string) => d.trim())
            .filter(Boolean)
        : [],
    })) || []
  );
};

/**
 * Transform instance data
 *
 * Backend API: /apis/v1/datasource/connect/aliyun/metrics/instances (POST)
 * Response format: [{instanceId: "xxx", userId: "yyy"}, ...]
 * Each object itself is dimensions, need to extract instanceId and other fields for display
 *
 * Field compatibility notes:
 * - instanceId: may be instanceId, InstanceId, instance_id
 * - instanceName: may be instanceName, InstanceName, instance_name, if not available use instanceId
 * - region: may be region, Region
 */
export const transformInstanceData = (rawData: unknown): AliyunInstance[] => {
  const dataArray = rawData as any[];

  if (!Array.isArray(dataArray)) {
    return [];
  }

  return dataArray.map((item: any) => {
    // Try to get instance ID from multiple possible fields
    // When only userId is available without instanceId, use userId as instanceId (for compatibility)
    const instanceId =
      item.instanceId ||
      item.InstanceId ||
      item.instance_id ||
      item.userId || // When only userId is available, use userId as instanceId
      '';

    // Try to get instance name from multiple possible fields, if not available use instanceId
    // When only userId is available, use "userId: xxx" format as name
    const instanceName =
      item.instanceName ||
      item.InstanceName ||
      item.instance_name ||
      (item.userId && !item.instanceId
        ? `userId: ${item.userId}`
        : undefined) ||
      instanceId ||
      '';

    // Try to get region from multiple possible fields
    const region = item.region || item.Region || '';

    return {
      instanceId,
      instanceName,
      region,
      // The entire item is dimensions, containing all dimension information
      dimensions: item,
    };
  });
};

/**
 * Get mock instance data (fallback for API failures)
 */
export const getMockInstanceData = (): AliyunInstance[] => {
  return [];
};
