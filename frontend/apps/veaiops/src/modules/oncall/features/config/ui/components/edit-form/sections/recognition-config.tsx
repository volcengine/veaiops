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

import {
  Alert,
  Form,
  Input,
  Space,
  Tag,
  Typography,
} from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react';
import {
  IconCheck,
  IconClose,
  IconInfoCircle,
} from '@arco-design/web-react/icon';
import { CardWithTitle } from '@veaiops/components';
import { Interest } from 'api-generate';
import type React from 'react';
import { ExampleInput } from '../components';

const { Text } = Typography;

interface RecognitionConfigProps {
  form: FormInstance;
  inspectCategory: Interest['inspect_category'] | undefined;
}

/**
 * Recognition Conditions Configuration Section
 * - SEMANTIC mode: Positive/Negative examples
 * - RE mode: Regular expression
 */
export const RecognitionConfig: React.FC<RecognitionConfigProps> = ({
  form,
  inspectCategory,
}) => {
  // Monitor form values for real-time preview
  const examplesPositiveValue = Form.useWatch('examples_positive', form);
  const examplesNegativeValue = Form.useWatch('examples_negative', form);

  return (
    <CardWithTitle title="识别条件配置" className="mb-4">
      {/* SEMANTIC mode: Few-shot Learning */}
      {inspectCategory === Interest.inspect_category.SEMANTIC && (
        <>
          <Alert
            type="info"
            content={
              <div>
                <Text className="font-medium">💡 Few-shot Learning 提示</Text>
                <div className="text-xs mt-2">
                  • 至少提供 3-5 个正面或反面示例，帮助模型理解识别标准
                  <br />• 覆盖不同的表达方式，提升识别准确率
                  <br />• 明确区分边界情况，减少误报和漏报
                </div>
              </div>
            }
            className="mb-4"
          />

          <Form.Item
            label={
              <Space>
                <IconCheck className="text-[rgb(var(--green-6))] text-base" />
                <span className="font-medium">正面示例</span>
                <Tag color="green" size="small">
                  推荐 3-5 个
                </Tag>
              </Space>
            }
            field="examples_positive"
            extra={
              <Alert
                type="success"
                content={
                  <div>
                    <div className="text-xs mb-2">
                      <IconCheck className="mr-1" />
                      输入<strong>应该被检测到</strong>的消息示例，每行一个
                    </div>
                    <div className="text-xs">
                      示例：生产API服务挂了，大量502错误
                      <br />
                      示例：数据库响应时间从100ms激增到10秒
                    </div>
                  </div>
                }
                className="mt-2"
              />
            }
          >
            <ExampleInput
              value={examplesPositiveValue}
              type="positive"
              placeholder="例如：&#10;多个region都出现了问题&#10;北京与上海的用户都反馈报错&#10;订单服务完全不可用，错误率100%"
              onChange={(value) => {
                form.setFieldValue('examples_positive', value);
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <IconClose className="text-[rgb(var(--red-6))] text-base" />
                <span className="font-medium">反面示例</span>
                <Tag color="orangered" size="small">
                  推荐 3-5 个
                </Tag>
              </Space>
            }
            field="examples_negative"
            extra={
              <Alert
                type="error"
                content={
                  <div>
                    <div className="text-xs mb-2">
                      <IconClose className="mr-1" />
                      输入<strong>不应该被检测到</strong>的消息示例，每行一个
                    </div>
                    <div className="text-xs">
                      示例：开发环境测试出现了一些错误
                      <br />
                      示例：性能还有优化空间
                    </div>
                  </div>
                }
                className="mt-2"
              />
            }
          >
            <ExampleInput
              value={examplesNegativeValue}
              type="negative"
              placeholder="例如：&#10;线上环境的问题&#10;单个用户反馈问题&#10;昨天修复的小bug"
              onChange={(value) => {
                form.setFieldValue('examples_negative', value);
              }}
            />
          </Form.Item>
        </>
      )}

      {/* RE mode: Regular Expression */}
      {inspectCategory === Interest.inspect_category.RE && (
        <>
          <Alert
            type="info"
            content={
              <div>
                <Text className="font-medium">💡 正则表达式提示</Text>
                <div className="text-xs mt-2">
                  • 使用在线工具（如 regex101.com）测试正则表达式
                  <br />• 注意转义特殊字符（如 \、[、]、(、)）
                  <br />• 使用非贪婪匹配（.*?）避免过度匹配
                </div>
              </div>
            }
            className="mb-4"
          />

          <Form.Item
            label={<strong>正则表达式</strong>}
            field="regular_expression"
            rules={[{ required: true, message: '请输入正则表达式' }]}
            extra={
              <Alert
                type="info"
                content={
                  <div>
                    <div className="text-xs mb-2">
                      <IconInfoCircle className="mr-1" />
                      使用正则表达式匹配目标内容
                    </div>
                    <div className="text-xs font-mono">
                      常用示例：
                      <br />• ^svip.* - 匹配以 svip 开头的内容
                      <br />• (SVIP|VIP) - 匹配 SVIP 或 VIP
                      <br />• (\[ALERT\]|\[CRITICAL\]) - 匹配告警关键词
                    </div>
                  </div>
                }
                className="mt-2"
              />
            }
          >
            <Input
              placeholder="例如: ^svip.*|(SVIP|VIP)"
              className="font-mono"
            />
          </Form.Item>
        </>
      )}
    </CardWithTitle>
  );
};
