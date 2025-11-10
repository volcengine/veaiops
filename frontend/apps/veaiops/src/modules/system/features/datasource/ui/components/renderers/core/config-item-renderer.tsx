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

import { Typography } from '@arco-design/web-react';
import type { ConfigItem } from '@datasource/types';
import { getFieldTranslation } from '../../../utils/field-translation';
import { ConfigKeyLabel } from './config-key-label';
import { ConfigValueContent } from './config-value-content';
import { ConfigValueRenderer } from './config-value-renderer';

const { Text } = Typography;

/**
 * Config item renderer component
 */
export const ConfigItemRenderer = ({ configKey, value }: ConfigItem) => {
  // Fields that force horizontal layout (even if array/object)
  const forceHorizontal = [
    'aliyun_group_by',
    'zabbix_targets',
    'targets',
  ].includes(configKey);

  // Fields that force vertical layout
  const forceVertical = [
    'instances',
    'volcengine_instances',
    'aliyun_dimensions',
  ].includes(configKey);

  const isVertical =
    forceVertical ||
    (!forceHorizontal && typeof value === 'object' && value !== null);

  if (isVertical) {
    const displayKey = getFieldTranslation(configKey) || configKey;
    return (
      <div className="flex items-center mb-2">
        <Text
          type="secondary"
          className="text-xs font-bold w-24 text-center pt-[2px]"
          style={{
            marginBottom: 0,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {displayKey}:
        </Text>
        <ConfigValueContent configKey={configKey} value={value} />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <ConfigKeyLabel configKey={configKey} />
      <ConfigValueRenderer configKey={configKey} value={value} />
    </div>
  );
};
