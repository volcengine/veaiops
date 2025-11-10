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

import type { ConfigItem } from '@datasource/types';
import { CellRender } from '@veaiops/components';
import {
  renderAliyunDimension,
  renderAliyunInstancesList,
} from '../providers/aliyun';
import { renderTargets } from './target-renderer';

/**
 * Value renderer component (flex layout)
 */
export const ConfigValueRenderer = ({ configKey, value }: ConfigItem) => {
  // Special handling for Aliyun dimension - use tag rendering
  if (configKey === 'aliyun_group_by') {
    return <div className="flex-1">{renderAliyunDimension(value)}</div>;
  }

  // Special handling for Aliyun instances list - use Modal+Table
  if (configKey === 'aliyun_dimensions') {
    return <div className="flex-1">{renderAliyunInstancesList(value)}</div>;
  }

  // Special handling for targets-related fields - use tag rendering
  if (configKey === 'targets' || configKey === 'zabbix_targets') {
    return <div className="flex-1">{renderTargets(value)}</div>;
  }

  // Handle other fields
  return (
    <CellRender.Ellipsis
      text={String(value)}
      options={{ rows: 1 }}
      className="flex-1 text-xs max-w-36"
    />
  );
};
