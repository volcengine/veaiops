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

import { CellRender } from '@/cell-render';
import { Card, Descriptions, Typography } from '@arco-design/web-react';
import type React from 'react';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

const { Title, Text } = Typography;

/**
 * Configuration change item
 */
export interface ConfigChange {
  /** Field path */
  path: string;
  /** Field name */
  label: string;
  /** Original value */
  oldValue: any;
  /** New value */
  newValue: any;
  /** Change type */
  type: 'added' | 'modified' | 'deleted';
}

/**
 * Configuration comparison properties
 */
export interface ConfigDiffProps {
  /** Original configuration */
  originalConfig: Record<string, any>;
  /** New configuration */
  newConfig: Record<string, any>;
  /** Field label mapping */
  fieldLabels?: Record<string, string>;
  /** Ignored fields */
  ignoreFields?: string[];
  /** Custom render function */
  renderValue?: (value: any, field: string) => React.ReactNode;
}

/**
 * Deeply compare two objects and return change list
 */
const getConfigChanges = (
  original: Record<string, any>,
  current: Record<string, any>,
  fieldLabels: Record<string, string> = {},
  ignoreFields: string[] = [],
  prefix = '',
): ConfigChange[] => {
  const changes: ConfigChange[] = [];
  const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);

  for (const key of allKeys) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    // Skip ignored fields
    if (ignoreFields.includes(fullPath)) {
      continue;
    }

    const oldValue = original[key];
    const newValue = current[key];
    const label = fieldLabels[fullPath] || key;

    if (!(key in original)) {
      // Added field
      changes.push({
        path: fullPath,
        label,
        oldValue: undefined,
        newValue,
        type: 'added',
      });
    } else if (!(key in current)) {
      // Deleted field
      changes.push({
        path: fullPath,
        label,
        oldValue,
        newValue: undefined,
        type: 'deleted',
      });
    } else if (
      typeof oldValue === 'object' &&
      typeof newValue === 'object' &&
      oldValue !== null &&
      newValue !== null &&
      !Array.isArray(oldValue) &&
      !Array.isArray(newValue)
    ) {
      // Recursively compare objects
      changes.push(
        ...getConfigChanges(
          oldValue,
          newValue,
          fieldLabels,
          ignoreFields,
          fullPath,
        ),
      );
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      // Modified field
      changes.push({
        path: fullPath,
        label,
        oldValue,
        newValue,
        type: 'modified',
      });
    }
  }

  return changes;
};

/**
 * Format value display
 */
const formatValue = (value: any): React.ReactNode => {
  if (value === undefined) {
    return <Text type="secondary">Not set</Text>;
  }

  if (value === null) {
    return <Text type="secondary">null</Text>;
  }

  if (typeof value === 'boolean') {
    return <CustomOutlineTag>{value ? 'Yes' : 'No'}</CustomOutlineTag>;
  }

  if (typeof value === 'object') {
    return <Text code>{JSON.stringify(value, null, 2)}</Text>;
  }

  return <Text>{String(value)}</Text>;
};

/**
 * Configuration change summary component
 * @description Displays detailed comparison information of configuration changes
 */
export const ConfigChangeSummary: React.FC<ConfigDiffProps> = ({
  originalConfig,
  newConfig,
  fieldLabels = {},
  ignoreFields = [],
  renderValue = formatValue,
}) => {
  const changes = getConfigChanges(
    originalConfig,
    newConfig,
    fieldLabels,
    ignoreFields,
  );

  if (changes.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">No configuration changes</Text>
        </div>
      </Card>
    );
  }

  const addedChanges = changes.filter((c) => c.type === 'added');
  const modifiedChanges = changes.filter((c) => c.type === 'modified');
  const deletedChanges = changes.filter((c) => c.type === 'deleted');

  return (
    <div>
      {/* Change statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Title heading={6}>Change Statistics</Title>
        <div style={{ display: 'flex', gap: 16 }}>
          {addedChanges.length > 0 && (
            <CustomOutlineTag>
              Added {addedChanges.length} items
            </CustomOutlineTag>
          )}
          {modifiedChanges.length > 0 && (
            <CustomOutlineTag>
              Modified {modifiedChanges.length} items
            </CustomOutlineTag>
          )}
          {deletedChanges.length > 0 && (
            <CustomOutlineTag>
              Deleted {deletedChanges.length} items
            </CustomOutlineTag>
          )}
        </div>
      </Card>

      {/* Added items */}
      {addedChanges.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Title heading={6} style={{ color: '#00b42a' }}>
            Added Configuration Items
          </Title>
          <Descriptions
            column={1}
            data={addedChanges.map((change) => ({
              label: change.label,
              value: renderValue(change.newValue, change.path),
            }))}
          />
        </Card>
      )}

      {/* Modified items */}
      {modifiedChanges.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Title heading={6} style={{ color: '#ff7d00' }}>
            Modified Configuration Items
          </Title>
          {modifiedChanges.map((change, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Text bold>{change.label}</Text>
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary">Old Value: </Text>
                  {renderValue(change.oldValue, change.path)}
                </div>
                <div>
                  <Text type="secondary">New Value: </Text>
                  {renderValue(change.newValue, change.path)}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Deleted items */}
      {deletedChanges.length > 0 && (
        <Card>
          <Title heading={6} style={{ color: '#f53f3f' }}>
            Deleted Configuration Items
          </Title>
          <Descriptions
            column={1}
            data={deletedChanges.map((change) => ({
              label: change.label,
              value: renderValue(change.oldValue, change.path),
            }))}
          />
        </Card>
      )}
    </div>
  );
};

/**
 * Simple configuration comparison component
 */
export const ConfigDiff: React.FC<{
  title?: string;
  changes: ConfigChange[];
}> = ({ title = '配置变更', changes }) => {
  if (changes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Text type="secondary">没有配置变更</Text>
      </div>
    );
  }

  // Get change type display information
  const getChangeTypeInfo = (type: ConfigChange['type']) => {
    switch (type) {
      case 'added':
        return { color: 'green', text: 'Added' };
      case 'modified':
        return { color: 'orange', text: 'Modified' };
      case 'deleted':
        return { color: 'red', text: 'Deleted' };
      default:
        return { color: 'gray', text: 'Unknown' };
    }
  };

  return (
    <Card title={title}>
      {changes.map((change, index) => {
        const typeInfo = getChangeTypeInfo(change.type);

        return (
          <div key={index} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CustomOutlineTag>{typeInfo.text}</CustomOutlineTag>
              <Text bold>{change.label}</Text>
            </div>

            {change.type === 'modified' && (
              <div style={{ marginTop: 4, marginLeft: 16 }}>
                <div>
                  <Text type="secondary">Old Value: </Text>
                  {formatValue(change.oldValue)}
                </div>
                <div>
                  <Text type="secondary">New Value: </Text>
                  {formatValue(change.newValue)}
                </div>
              </div>
            )}

            {change.type === 'added' && (
              <div style={{ marginTop: 4, marginLeft: 16 }}>
                <Text type="secondary">Value: </Text>
                {formatValue(change.newValue)}
              </div>
            )}

            {change.type === 'deleted' && (
              <div style={{ marginTop: 4, marginLeft: 16 }}>
                <Text type="secondary">Old Value: </Text>
                {formatValue(change.oldValue)}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
};

export { getConfigChanges, formatValue };
