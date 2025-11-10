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

import { Space, Tag } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import type { Interest } from 'api-generate';

/**
 * Rule information display component
 */
export const RuleInfo = ({ rule }: { rule: Interest }) => {
  return (
    <div className="rule-info">
      <CellRender.InfoWithCode name={rule.name} code={rule.uuid || rule.name} />
    </div>
  );
};

/**
 * Rule status display component
 */
export const RuleStatus = ({ isActive }: { isActive: boolean }) => {
  return (
    <Tag color={isActive ? 'green' : 'red'}>{isActive ? '启用' : '禁用'}</Tag>
  );
};

/**
 * Rule category display component
 */
export const RuleCategories = ({
  actionCategory,
  inspectCategory,
}: {
  actionCategory: string;
  inspectCategory: string;
}) => {
  return (
    <Space direction="vertical" size="small">
      <div>
        <span className="category-label">告警类别：</span>
        <Tag>{actionCategory}</Tag>
      </div>
      <div>
        <span className="category-label">检测类别：</span>
        <Tag>{inspectCategory}</Tag>
      </div>
    </Space>
  );
};

/**
 * Rule configuration display component
 */
export const RuleConfig = ({
  regex,
  inspectHistory,
  silenceDelta,
}: {
  regex: string;
  inspectHistory: number;
  silenceDelta: number;
}) => {
  return (
    <Space direction="vertical" size="small">
      <div>
        <span className="config-label">正则表达式：</span>
        <code className="regex-code">{regex}</code>
      </div>
      <div>
        <span className="config-label">检测窗口：</span>
        <span>{inspectHistory} 条消息</span>
      </div>
      <div>
        <span className="config-label">抑制间隔：</span>
        <span>{silenceDelta} 秒</span>
      </div>
    </Space>
  );
};
