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

import { Input, Space } from '@arco-design/web-react';
import type React from 'react';
import { useMemo } from 'react';

import type { ExampleInputProps } from '../types';

/**
 * Example input component (with preview)
 */
export const ExampleInput: React.FC<ExampleInputProps> = ({
  value,
  type,
  placeholder,
  onChange,
}) => {
  // Parse current example list
  const examples = useMemo(() => {
    if (!value || !value.trim()) {
      return [];
    }
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [value]);

  const isPositive = type === 'positive';
  const borderColor = isPositive ? 'rgb(var(--green-6))' : 'rgb(var(--red-6))';
  const bgColor = isPositive
    ? 'rgba(var(--green-1), 0.5)'
    : 'rgba(var(--red-1), 0.5)';
  const borderColorLight = isPositive
    ? 'rgb(var(--green-3))'
    : 'rgb(var(--red-3))';

  return (
    <div className="w-full">
      {/* Current example preview */}
      {examples.length > 0 && (
        <div className="mb-3">
          <Space direction="vertical" className="w-full" size="small">
            {examples.map((example, index) => (
              <div
                key={index}
                className="p-3 rounded-md text-sm leading-relaxed border transition-all hover:shadow-sm"
                style={{
                  backgroundColor: bgColor,
                  borderColor: borderColorLight,
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: borderColor,
                      color: '#fff',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 text-[#1d2129]">{example}</div>
                </div>
              </div>
            ))}
          </Space>
        </div>
      )}

      {/* Input field */}
      <Input.TextArea
        value={value}
        placeholder={placeholder}
        autoSize={{ minRows: 3, maxRows: 6 }}
        style={{
          borderColor: examples.length > 0 ? borderColorLight : undefined,
        }}
        onChange={(val) => {
          onChange?.(val);
        }}
      />
    </div>
  );
};
