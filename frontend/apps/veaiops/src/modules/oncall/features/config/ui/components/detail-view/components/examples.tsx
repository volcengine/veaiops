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

import { Button, Collapse, Space, Tooltip } from '@arco-design/web-react';
import {
  IconCopy,
  IconThumbDown,
  IconThumbUp,
} from '@arco-design/web-react/icon';
import type React from 'react';
import { useCallback } from 'react';

import type { UseCopyReturn } from '../hooks';

/**
 * Example display component properties
 */
export interface ExamplesProps {
  positiveExamples: string[];
  negativeExamples: string[];
  copyHook: UseCopyReturn;
}

/**
 * Example display component
 */
export const Examples: React.FC<ExamplesProps> = ({
  positiveExamples,
  negativeExamples,
  copyHook,
}) => {
  const { copiedText, handleCopy } = copyHook;

  /**
   * Render example content
   */
  const renderExampleContent = useCallback(
    (examples: string[], type: 'positive' | 'negative') => {
      return (
        <Space direction="vertical" className="w-full" size="small">
          {examples.map((example, index) => (
            <div
              key={index}
              className="p-3 bg-[var(--color-bg-2)] rounded-md text-sm leading-relaxed relative border border-[var(--color-border-2)]"
            >
              <div className="pr-8">{example}</div>
              <Tooltip
                content={
                  copiedText === `${type}-${index}` ? '已复制' : '复制示例'
                }
              >
                <Button
                  type="text"
                  size="mini"
                  icon={<IconCopy />}
                  className="absolute top-2 right-2 opacity-60"
                  onClick={() =>
                    handleCopy({
                      text: example,
                      identifier: `${type}-${index}`,
                      displayLabel: `${type === 'positive' ? '正面示例' : '负面示例'}${
                        index + 1
                      }`,
                    })
                  }
                />
              </Tooltip>
            </div>
          ))}
        </Space>
      );
    },
    [copiedText, handleCopy],
  );

  if (positiveExamples.length === 0 && negativeExamples.length === 0) {
    return null;
  }

  return (
    <>
      {positiveExamples.length > 0 && negativeExamples.length > 0 && (
        <Collapse defaultActiveKey={['positive', 'negative']} className="mb-4">
          <Collapse.Item
            name="positive"
            header={
              <div className="flex items-center">
                <IconThumbUp className="text-[#00b42a] mr-2" />
                <span>正面示例 {positiveExamples.length}</span>
              </div>
            }
          >
            {renderExampleContent(positiveExamples, 'positive')}
          </Collapse.Item>
          <Collapse.Item
            name="negative"
            header={
              <div className="flex items-center">
                <IconThumbDown className="text-[#f53f3f] mr-2" />
                <span>负面示例 {negativeExamples.length}</span>
              </div>
            }
          >
            {renderExampleContent(negativeExamples, 'negative')}
          </Collapse.Item>
        </Collapse>
      )}

      {positiveExamples.length > 0 && negativeExamples.length === 0 && (
        <Collapse defaultActiveKey={['positive']} className="mb-4">
          <Collapse.Item
            name="positive"
            header={
              <div className="flex items-center">
                <IconThumbUp className="text-[#00b42a] mr-2" />
                <span>正面示例 {positiveExamples.length}</span>
              </div>
            }
          >
            {renderExampleContent(positiveExamples, 'positive')}
          </Collapse.Item>
        </Collapse>
      )}

      {negativeExamples.length > 0 && positiveExamples.length === 0 && (
        <Collapse defaultActiveKey={['negative']} className="mb-4">
          <Collapse.Item
            name="negative"
            header={
              <div className="flex items-center">
                <IconThumbDown className="text-[#f53f3f] mr-2" />
                <span>负面示例 {negativeExamples.length}</span>
              </div>
            }
          >
            {renderExampleContent(negativeExamples, 'negative')}
          </Collapse.Item>
        </Collapse>
      )}
    </>
  );
};
