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

/**
 * Zabbix metric selection business logic Hook
 * @description Handles core business logic for Zabbix metric selection
 */

import type { ZabbixTemplateMetric } from 'api-generate';
import { useCallback } from 'react';
import type { WizardActions } from '../../../../types';

export const useZabbixMetricSelection = (actions: WizardActions) => {
  const handleMetricSelect = useCallback(
    (metric: ZabbixTemplateMetric) => {
      actions.setSelectedMetric(metric);
    },
    [actions],
  );

  return {
    handleMetricSelect,
  };
};
