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
import { renderAliyunInstancesList } from '../providers/aliyun';
import { renderInstances } from './instance-renderer';
import { renderComplexObject } from './object-renderer';
import { renderTargets } from './target-renderer';

/**
 * Value content renderer (for vertical layout)
 */
export const ConfigValueContent = ({ configKey, value }: ConfigItem) => {
  // Special handling for Volcengine instances list
  if (configKey === 'instances' || configKey === 'volcengine_instances') {
    return renderInstances(value);
  }

  // Special handling for Aliyun instances list (dimensions)
  if (configKey === 'aliyun_dimensions') {
    return renderAliyunInstancesList(value);
  }

  // Special handling for Zabbix hosts list
  if (configKey === 'zabbix_targets' || configKey === 'targets') {
    return renderTargets(value);
  }

  // Handle complex objects and arrays
  if (typeof value === 'object' && value !== null) {
    return renderComplexObject({ obj: value });
  }

  return null; // Should not happen
};
