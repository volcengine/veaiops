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

import { Button, Modal, Table, Typography } from '@arco-design/web-react';
import { EMPTY_CONTENT } from '@veaiops/constants';
import * as React from 'react';

const { Text } = Typography;

/**
 * Aliyun instances list component (click to open Modal)
 */
const AliyunInstancesListModal: React.FC<{ value: unknown[] }> = ({
  value,
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  // Generate table column configuration
  const columns = React.useMemo(() => {
    if (!value || value.length === 0) {
      return [];
    }

    // Get all keys from the first instance
    const firstInstance = value[0];
    if (typeof firstInstance !== 'object' || firstInstance === null) {
      return [
        {
          title: '值',
          dataIndex: 'value',
          key: 'value',
        },
      ];
    }

    // Create a column for each key
    return Object.keys(firstInstance).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      width: 200,
      render: (text: any) => String(text || '-'),
    }));
  }, [value]);

  // Process table data
  const tableData = React.useMemo(() => {
    if (!value) {
      return [];
    }
    return value.map((item: any, index: number) => {
      if (typeof item === 'object' && item !== null) {
        return { ...item, key: `row-${index}` };
      }
      return { value: String(item), key: `row-${index}` };
    });
  }, [value]);

  return (
    <>
      <Button
        type="text"
        size="small"
        onClick={() => setModalVisible(true)}
        style={{ padding: '0', height: 'auto' }}
      >
        <Text type="primary" className="text-xs">
          查看实例列表 ({value?.length || 0})
        </Text>
      </Button>
      <Modal
        title="实例列表"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        style={{ width: 800 }}
      >
        <Table
          columns={columns}
          data={tableData}
          pagination={{
            pageSize: 10,
            showTotal: true,
            showJumper: true,
          }}
          scroll={{ x: true }}
          size="small"
        />
      </Modal>
    </>
  );
};

/**
 * Render Aliyun instances list (click to open Modal)
 */
export const renderAliyunInstancesList = (value: unknown) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return EMPTY_CONTENT;
  }

  return <AliyunInstancesListModal value={value} />;
};
