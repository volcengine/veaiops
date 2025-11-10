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

import { Select } from '@veaiops/components';
import { EventLevel } from 'api-generate';
import type React from 'react';
import { ALARM_LEVEL_OPTIONS } from '../../shared/constants';

interface AlarmLevelSelectorProps {
  loading: boolean;
}

/**
 * Alarm level selector component
 *
 * All data sources need to select alarm level
 */
export const AlarmLevelSelector: React.FC<AlarmLevelSelectorProps> = ({
  loading,
}) => {
  return (
    <Select.Block
      isControl
      formItemProps={{
        label: '告警级别',
        field: 'alarmLevel',
        rules: [{ required: true, message: '请选择告警级别' }],
        initialValue: EventLevel.P2,
      }}
      controlProps={{
        placeholder: '请选择告警级别',
        options: ALARM_LEVEL_OPTIONS,
        disabled: loading,
      }}
    />
  );
};
