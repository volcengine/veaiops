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

import { Tooltip, Typography } from '@arco-design/web-react';
import { safeStringify } from '../../../utils/field-translation';

const { Text } = Typography;

/**
 * renderComplexObject parameters interface
 */
export interface RenderComplexObjectParams {
  obj: unknown;
  maxItems?: number;
}

/**
 * Render complex object
 */
export const renderComplexObject = ({
  obj,
  maxItems = 3,
}: RenderComplexObjectParams) => {
  if (!obj || typeof obj !== 'object') {
    return String(obj);
  }

  // Generate complete JSON string for tooltip
  const fullJsonString = JSON.stringify(obj, null, 2);

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return <Text type="secondary">空数组</Text>;
    }

    const displayContent = (
      <div className="flex flex-col gap-0.5">
        {obj.slice(0, maxItems).map((item, index) => (
          <div key={index} className="text-xs">
            <Text type="secondary">
              {typeof item === 'object'
                ? `${JSON.stringify(item).substring(0, 30)}...`
                : String(item)}
            </Text>
          </div>
        ))}
        {obj.length > maxItems && (
          <Text type="secondary" className="text-xs">
            +{obj.length - maxItems} 更多...
          </Text>
        )}
      </div>
    );

    return (
      <Tooltip
        content={
          <pre className="max-h-[300px] overflow-auto text-xs">
            {fullJsonString}
          </pre>
        }
        position="top"
      >
        <div className="cursor-help">{displayContent}</div>
      </Tooltip>
    );
  }

  // Handle regular objects
  const entries = Object.entries(obj).slice(0, maxItems);
  if (entries.length === 0) {
    return <Text type="secondary">空对象</Text>;
  }

  const displayContent = (
    <div className="flex flex-col gap-0.5">
      {entries.map(([key, value]) => (
        <div key={key} className="text-xs">
          <Text type="secondary">
            <span className="font-bold">{key}:</span> {safeStringify(value)}
          </Text>
        </div>
      ))}
      {Object.keys(obj).length > maxItems && (
        <Text type="secondary" className="text-xs">
          +{Object.keys(obj).length - maxItems} 更多...
        </Text>
      )}
    </div>
  );

  return (
    <Tooltip
      content={
        <pre className="max-h-[300px] overflow-auto text-xs">
          {fullJsonString}
        </pre>
      }
      position="top"
    >
      <div className="cursor-help">{displayContent}</div>
    </Tooltip>
  );
};
