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
 * Data source type card component
 * @description Displays a beautiful card for a single data source type, supporting branded visual design
 * @author AI Assistant
 * @date 2025-01-15
 */

import type React from 'react';
import { DataSourceType } from '../../types';
import { getBrandConfig } from './brand-config';
import { AliyunLogo, VolcengineLogo, ZabbixLogo } from './logos';
import styles from './styles.module.less';

export interface DataSourceTypeCardProps {
  /** Data source type */
  type: DataSourceType;
  /** Data source name */
  name: string;
  /** Data source description */
  description: string;
  /** Whether selected */
  selected: boolean;
  /** Click event handler */
  onClick: () => void;
}

/**
 * Render data source logo
 */
const renderLogo = (type: DataSourceType) => {
  switch (type) {
    case DataSourceType.VOLCENGINE:
      return <VolcengineLogo />;
    case DataSourceType.ALIYUN:
      return <AliyunLogo />;
    case DataSourceType.ZABBIX:
      return <ZabbixLogo />;
    default:
      return null;
  }
};

/**
 * Data source type card component
 */
export const DataSourceTypeCard: React.FC<DataSourceTypeCardProps> = ({
  type,
  name,
  description,
  selected,
  onClick,
}) => {
  const brandConfig = getBrandConfig(type);

  return (
    <div
      className={`${styles.card} ${brandConfig.className} ${
        selected ? styles.selected : ''
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Logo area - temporarily hidden */}
      {/* <div className={styles.logoContainer}>
        <div className={`${styles.logoWrapper} ${brandConfig.iconClass}`}>
          <div className={styles.logoInner}>{renderLogo(type)}</div>
        </div>
      </div> */}

      {/* Content area */}
      <div className={styles.content}>
        <div className={styles.name}>{name}</div>
        <div className={styles.description}>{description}</div>
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className={styles.selectedBadge}>
          <svg viewBox="0 0 24 24" className={styles.checkIcon}>
            <path
              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DataSourceTypeCard;
