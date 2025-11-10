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

import visionImage from '@/assets/vision.png';
import { ModernCard } from '@/components/ui';
import type { SystemStatistics } from 'api-generate';
import type React from 'react';

interface ThresholdDetailedStatisticsProps {
  statistics: SystemStatistics | null;
}

/**
 * Intelligent threshold task detailed statistics component
 * @description Display detailed execution statistics for intelligent threshold tasks
 */
export const ThresholdDetailedStatistics: React.FC<
  ThresholdDetailedStatisticsProps
> = ({ statistics }) => {
  const activeTasks = statistics?.active_intelligent_threshold_tasks || 0;
  const autoUpdateTasks =
    statistics?.active_intelligent_threshold_autoupdate_tasks || 0;
  const totalExecutions =
    (statistics?.latest_30d_intelligent_threshold_success_num || 0) +
    (statistics?.latest_30d_intelligent_threshold_failed_num || 0);
  const successCount =
    statistics?.latest_30d_intelligent_threshold_success_num || 0;
  const failedCount =
    statistics?.latest_30d_intelligent_threshold_failed_num || 0;

  return (
    <ModernCard
      title="智能阈值任务详细统计"
      description="近期智能阈值任务执行情况统计，包含活跃任务、执行次数和成功率等关键指标"
      backgroundImage={visionImage}
      height={500}
      statistics={[
        {
          label: '活跃智能阈值任务',
          value: activeTasks,
          color: '#1890ff',
        },
        {
          label: '自动更新任务',
          value: autoUpdateTasks,
          color: '#52c41a',
        },
        {
          label: '近30天总执行次数',
          value: totalExecutions,
          color: '#faad14',
        },
        {
          label: '近30天成功次数',
          value: successCount,
          color: '#52c41a',
        },
        {
          label: '近30天失败次数',
          value: failedCount,
          color: '#f5222d',
        },
      ]}
      buttonText=""
    />
  );
};

export default ThresholdDetailedStatistics;
