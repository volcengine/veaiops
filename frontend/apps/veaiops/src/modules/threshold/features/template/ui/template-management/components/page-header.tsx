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

import { Button, Space, Typography } from '@arco-design/web-react';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import type React from 'react';

const { Title } = Typography;

/**
 * Template management page header
 */
export const TemplatePageHeader: React.FC<{
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
}> = ({ onRefresh, onCreate, loading }) => (
  <div className="mb-6 flex justify-between items-center">
    <Title heading={3}>智能阈值 - 模板管理</Title>
    <Space>
      <Button icon={<IconRefresh />} onClick={onRefresh} loading={loading}>
        刷新
      </Button>
      <Button type="primary" icon={<IconPlus />} onClick={onCreate}>
        创建模板
      </Button>
    </Space>
  </div>
);
