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
 * Generic instance list item component
 *
 * Supported data sources:
 * - Volcengine:
 *   - Backend API: /apis/v1/datasource/volcengine/metrics/instances (POST)
 *   - Response format: [{"ResourceID": "i-xxx"}, ...]
 *   - Transformed: { id: ResourceID, name: ResourceName || ResourceID, region, namespace, subNamespace, dimensions }
 *
 * - Aliyun:
 *   - Backend API: /apis/v1/datasource/connect/aliyun/metrics/instances (POST)
 *   - Response format: [{"instanceId": "xxx", ...}, ...]
 *   - Transformed: { id: instanceId, name: instanceName || instanceId, region, dimensions }
 *
 * Note: Zabbix uses a separate ZabbixHostListItem component, not this one
 */

import { Space, Tag, Typography } from '@arco-design/web-react';
import { IconCloud, IconDesktop } from '@arco-design/web-react/icon';
import type React from 'react';
import { SelectableItem } from '../../../../components/selectable-item';

const { Text } = Typography;

/**
 * Instance data interface
 * Unified instance data format for rendering in components
 */
export interface InstanceData {
  /** Instance unique identifier (from ResourceID/instanceId/instance_id fields) */
  id: string;
  /** Instance display name (from ResourceName/instanceName/instance_name fields, falls back to id if not available) */
  name?: string;
  /** Region information (optional) */
  region?: string;
  /** Dimension information (optional, used by Aliyun) */
  dimensions?: Record<string, string>;
  /** Namespace (optional, used by Volcengine) */
  namespace?: string;
  /** Sub-namespace (optional, used by Volcengine) */
  subNamespace?: string;
  /** Other extended fields */
  [key: string]: any;
}

/**
 * Get the unique identifier of an instance
 *
 * Problem: The same ResourceID may correspond to multiple DiskNames (e.g., i-xxx + vda1, i-xxx + vda2)
 * Solution: Combine id + DiskName + region + namespace + subNamespace to generate a unique identifier
 *
 * @param instance - Instance data
 * @param index - Optional index (for generating fallback identifier)
 * @returns Unique identifier string of the instance
 */
export function getInstanceUniqueId(
  instance: InstanceData,
  index?: number,
): string {
  // Get DiskName, which may be in instance.DiskName or instance.dimensions.DiskName
  const diskNameValue =
    (instance as Record<string, unknown>).DiskName ||
    instance.dimensions?.DiskName;
  const diskName =
    typeof diskNameValue === 'string' ? diskNameValue : undefined;

  // Combine all fields to generate unique identifier
  const uniqueId = [
    instance.id || (index !== undefined ? `id-${index}` : ''),
    diskName,
    instance.region,
    instance.namespace,
    instance.subNamespace,
  ]
    .filter(Boolean)
    .join('-');

  return uniqueId || (index !== undefined ? `instance-${index}` : 'unknown');
}

/**
 * Compare if two instances are the same (based on unique identifier)
 *
 * @param instance1 - First instance
 * @param instance2 - Second instance
 * @returns Returns true if the unique identifiers of the two instances are the same
 */
export function areInstancesEqual(
  instance1: InstanceData,
  instance2: InstanceData,
): boolean {
  return getInstanceUniqueId(instance1) === getInstanceUniqueId(instance2);
}

export interface InstanceListItemProps {
  instance: InstanceData;
  isSelected: boolean;
  iconType?: 'cloud' | 'desktop';
  onToggle: (instance: InstanceData, checked: boolean) => void;
}

export const InstanceListItem: React.FC<InstanceListItemProps> = ({
  instance,
  isSelected,
  iconType = 'cloud',
  onToggle,
}) => {
  const handleClick = () => {
    onToggle(instance, !isSelected);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onToggle(instance, checked);
  };

  const Icon = iconType === 'cloud' ? IconCloud : IconDesktop;

  // Build title
  // Priority: name > id > dimensions.instanceId > dimensions.userId
  // When only userId is available, display the userId value directly (consistent with the case where only instanceId is available)
  const displayId =
    instance.id ||
    instance.dimensions?.instanceId ||
    instance.dimensions?.userId ||
    '';
  const displayName =
    instance.name ||
    instance.id ||
    instance.dimensions?.instanceId ||
    instance.dimensions?.userId ||
    'Unknown Instance';

  const title = (
    <Space>
      {displayName}
      {instance.region && <Tag color="blue">{instance.region}</Tag>}
    </Space>
  );

  // Build description
  const description = instance.namespace ? (
    <Text type="secondary" style={{ fontSize: 12 }}>
      Namespace: {instance.namespace}
      {instance.subNamespace && ` | Sub-namespace: ${instance.subNamespace}`}
    </Text>
  ) : undefined;

  // Build extra information (dimensions)
  // Display logic:
  // 1. Only show labels for instanceId and userId, not the actual values (to avoid duplication with ID in title)
  // 2. Other dimensions (e.g., DiskName) display full key: value
  // 3. Filter out ResourceID that is already displayed in the title
  const extra = (() => {
    if (!instance.dimensions || Object.keys(instance.dimensions).length === 0) {
      return undefined;
    }

    // Check if instanceId or userId exists
    const instanceIdValue =
      instance.dimensions.instanceId ||
      instance.dimensions.InstanceId ||
      instance.dimensions.instance_id;
    const userIdValue = instance.dimensions.userId;

    // Build dimension tags list
    const dimensionTags: React.ReactNode[] = [];

    // If instanceId exists, only show label (not value, to avoid duplication with title)
    if (instanceIdValue) {
      dimensionTags.push(
        <Tag key="instanceId" size="small" style={{ marginRight: 4 }}>
          instanceId
        </Tag>,
      );
    }

    // If userId exists, only show label (not value, to avoid duplication with title)
    if (userIdValue) {
      dimensionTags.push(
        <Tag key="userId" size="small" style={{ marginRight: 4 }}>
          userId
        </Tag>,
      );
    }

    // Other dimensions (e.g., DiskName) display full key: value
    const otherDimensions = Object.entries(instance.dimensions).filter(
      ([key]) => {
        const normalizedKey = key.toLowerCase();
        return (
          normalizedKey !== 'resourceid' &&
          normalizedKey !== 'resource_id' &&
          normalizedKey !== 'instance_id' &&
          normalizedKey !== 'instanceid' &&
          normalizedKey !== 'userid' &&
          normalizedKey !== 'user_id'
        );
      },
    );

    otherDimensions.forEach(([key, value]) => {
      dimensionTags.push(
        <Tag key={key} size="small" style={{ marginRight: 4 }}>
          {key}: {value}
        </Tag>,
      );
    });

    if (dimensionTags.length === 0) {
      return undefined;
    }

    return (
      <div style={{ marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Dimensions: {dimensionTags}
        </Text>
      </div>
    );
  })();

  return (
    <SelectableItem
      selected={isSelected}
      onClick={handleClick}
      onCheckboxChange={handleCheckboxChange}
      selectorType="checkbox"
      icon={<Icon />}
      title={title}
      description={description}
      extra={extra}
    />
  );
};
