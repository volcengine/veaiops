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

import { Button, Card, Divider, Form, Space } from '@arco-design/web-react';
import { IconRefresh, IconSearch } from '@arco-design/web-react/icon';
import React from 'react';

import type { TableSchema } from '@/custom-table/types';
import { generateSearchFields } from '../search-field-generator';

interface SearchSectionProps {
  schema: TableSchema;
  searchForm: ReturnType<typeof Form.useForm<Record<string, unknown>>>[0];
  onSearch: (values: Record<string, unknown>) => void;
  onReset: () => void;
}

/**
 * Search section component
 */
export const SearchSection: React.FC<SearchSectionProps> = ({
  schema,
  searchForm,
  onSearch,
  onReset,
}) => {
  const searchFields = React.useMemo(() => {
    return generateSearchFields(schema.columns);
  }, [schema.columns]);

  if (!schema.features?.search || searchFields.length === 0) {
    return null;
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={searchForm}
        layout={
          typeof schema.features.search === 'object'
            ? schema.features.search.layout
            : 'horizontal'
        }
        onSubmit={onSearch}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {searchFields}
        </div>
        <Divider />
        <Space>
          <Button type="primary" htmlType="submit" icon={<IconSearch />}>
            {typeof schema.features.search === 'object'
              ? schema.features.search.searchText || 'Search'
              : 'Search'}{' '}
          </Button>
          <Button onClick={onReset} icon={<IconRefresh />}>
            {typeof schema.features.search === 'object'
              ? schema.features.search.resetText || 'Reset'
              : 'Reset'}{' '}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};
