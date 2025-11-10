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
  DATA_SOURCE_TYPES,
  type DataSourceType,
  type MonitorItem,
  STATUS_CONFIG,
} from '@/modules/system/features/datasource/lib';
import { Descriptions, Modal, Typography } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import { DataSourceType as ApiDataSourceType } from 'api-generate';
import type React from 'react';
import { getDataSourceIcon } from '../../icons';
import {
  AliyunDetailSection,
  VolcengineDetailSection,
  ZabbixDetailSection,
} from './detail-sections';

const { StampTime } = CellRender;

const { Text } = Typography;
const { CustomOutlineTag } = CellRender;

interface DetailModalProps {
  visible: boolean;
  item: MonitorItem | null;
  onClose: () => void;
}

/**
 * Data source detail modal component
 */
export const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  item,
  onClose,
}) => {
  if (!item) {
    return null;
  }

  // Convert DataSourceType enum value to string key
  const getTypeKey = (type: DataSourceType): string => {
    if (type === ApiDataSourceType.ZABBIX) {
      return 'Zabbix';
    }
    if (type === ApiDataSourceType.ALIYUN) {
      return 'Aliyun';
    }
    if (type === ApiDataSourceType.VOLCENGINE) {
      return 'Volcengine';
    }
    return 'Zabbix'; // Default to Zabbix
  };
  const typeKey = getTypeKey(item.type);
  const dataSourceConfig =
    DATA_SOURCE_TYPES[typeKey as keyof typeof DATA_SOURCE_TYPES];
  const statusConfig = STATUS_CONFIG[item.status];

  return (
    <Modal
      title={`数据源详情 - ${item.name}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: 600 }}
    >
      <Descriptions
        column={2}
        data={[
          {
            label: '数据源ID',
            value: <Text copyable={{ text: item.id }}>{item.id}</Text>,
          },
          {
            label: '数据源名称',
            value: item.name,
          },
          {
            label: '数据源类型',
            value: dataSourceConfig ? (
              <CustomOutlineTag>
                <div className="flex items-center gap-1">
                  {getDataSourceIcon(item.type, {
                    size: 14,
                    color: dataSourceConfig.iconColor,
                  })}
                  {dataSourceConfig.label}
                </div>
              </CustomOutlineTag>
            ) : (
              <CustomOutlineTag>未知类型</CustomOutlineTag>
            ),
          },
          {
            label: '运行状态',
            value: (
              <CustomOutlineTag>
                {statusConfig.emoji} {statusConfig.label}
              </CustomOutlineTag>
            ),
          },
          {
            label: '是否启用',
            value: (
              <CustomOutlineTag>
                {item.is_active ? '✅ 已启用' : '❌ 已禁用'}
              </CustomOutlineTag>
            ),
          },
          {
            label: '描述信息',
            value: item.description || '-',
            span: 2,
          },
          {
            label: '创建时间',
            value: <StampTime time={item.created_at} />,
          },
          {
            label: '更新时间',
            value: <StampTime time={item.updated_at} />,
          },
        ]}
      />

      {/* Display specific configuration information based on data source type */}
      {item.type === ApiDataSourceType.ZABBIX && <ZabbixDetailSection />}
      {item.type === ApiDataSourceType.ALIYUN && <AliyunDetailSection />}
      {item.type === ApiDataSourceType.VOLCENGINE && (
        <VolcengineDetailSection />
      )}
    </Modal>
  );
};
