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
 * Data source type selection component
 * @description Displays the data source type selection interface
 * @author AI Assistant
 * @date 2025-01-15
 */

import { Alert } from '@arco-design/web-react';
import { IconCloud } from '@arco-design/web-react/icon';

import type React from 'react';
import { DATA_SOURCE_CONFIGS } from '../config/datasource-configs';
import styles from '../datasource-wizard.module.less';
import type { DataSourceType } from '../types';
import { DataSourceTypeCard } from './datasource-type-card';

export interface TypeSelectionProps {
  selectedType: DataSourceType | null;
  onTypeSelect: (type: DataSourceType) => void;
}

export const TypeSelection: React.FC<TypeSelectionProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  const handleTypeSelect = (type: DataSourceType) => {
    try {
      onTypeSelect(type);
    } catch (error) {}
  };

  return (
    <div className={styles.stepsContainer}>
      <div className={styles.introItems}>
        <div className={styles.stepContent}>
          <Alert
            type="info"
            content={
              <div>
                <div className={styles.stepTitle}>选择数据源类型</div>
                <div className={styles.stepDescription}>
                  请选择要创建的数据源类型，系统将引导您完成相应的配置流程。选择后"开始配置"按钮将变为可点击状态。
                </div>
              </div>
            }
          />
        </div>

        <div
          id="datasource-type-selection"
          className={styles.introCardsWrapper}
        >
          {DATA_SOURCE_CONFIGS.map((config) => {
            return (
              <DataSourceTypeCard
                key={config.type}
                type={config.type}
                name={config.name}
                description={config.description}
                selected={selectedType === config.type}
                onClick={() => handleTypeSelect(config.type)}
              />
            );
          })}

          {/* Coming soon card for more products */}
          <div className={styles.comingSoonCard}>
            {/* Temporarily hide icon */}
            {/* <div className={styles.comingSoonIconWrapper}>
              <IconCloud className={styles.comingSoonCloud} />
            </div> */}
            <div className={styles.comingSoonTitle}>更多产品</div>
            <div className={styles.comingSoonSubtitle}>敬请期待</div>
            <div className={styles.comingSoonDescription}>
              我们正在努力支持更多监控数据源
            </div>
            <div className={styles.comingSoonShine} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeSelection;
