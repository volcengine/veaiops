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
 * Data source decoration element components
 * @description Brand decoration elements for each data source type
 */

import type React from 'react';
import styles from './styles.module.less';

/** Volcengine decoration - triangles/mountains */
export const VolcengineDecoration: React.FC = () => (
  <>
    <div className={`${styles.decorationTriangle} ${styles.triangle1}`} />
    <div className={`${styles.decorationTriangle} ${styles.triangle2}`} />
    <div className={`${styles.decorationTriangle} ${styles.triangle3}`} />
  </>
);

/** Aliyun decoration - clouds/waves */
export const AliyunDecoration: React.FC = () => (
  <>
    <div className={`${styles.decorationWave} ${styles.wave1}`} />
    <div className={`${styles.decorationWave} ${styles.wave2}`} />
    <div className={`${styles.decorationCloud} ${styles.cloud1}`} />
  </>
);

/** Zabbix decoration - squares/grid */
export const ZabbixDecoration: React.FC = () => (
  <>
    <div className={`${styles.decorationSquare} ${styles.square1}`} />
    <div className={`${styles.decorationSquare} ${styles.square2}`} />
    <div className={`${styles.decorationSquare} ${styles.square3}`} />
  </>
);
