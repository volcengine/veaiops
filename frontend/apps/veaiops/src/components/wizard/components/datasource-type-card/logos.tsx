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
 * Data source logo component collection
 * @description SVG icon definitions for each data source type
 */

import type React from 'react';
import styles from './styles.module.less';

/** Volcengine logo */
export const VolcengineLogo: React.FC = () => (
  <svg viewBox="0 0 64 64" className={styles.logo}>
    {/* Volcano base */}
    <ellipse cx="32" cy="52" rx="24" ry="3" fill="currentColor" opacity="0.2" />
    {/* Volcano left side */}
    <path
      d="M16 52 C 18 50, 20 38, 22 32 L 26 20 L 28 16 L 30 18 L 32 28 L 32 52 Z"
      fill="currentColor"
      opacity="0.7"
    />
    {/* Volcano right side */}
    <path
      d="M48 52 C 46 50, 44 38, 42 32 L 38 20 L 36 16 L 34 18 L 32 28 L 32 52 Z"
      fill="currentColor"
      opacity="0.5"
    />
    {/* Volcano crater depression */}
    <path
      d="M 26 20 Q 28 14, 32 13 Q 36 14, 38 20 L 36 24 L 28 24 Z"
      fill="currentColor"
      opacity="0.3"
    />
    {/* Lava/flame effect */}
    <g opacity="0.6">
      <circle cx="30" cy="12" r="2" fill="currentColor" />
      <circle cx="32" cy="10" r="2.5" fill="currentColor" />
      <circle cx="34" cy="12" r="2" fill="currentColor" />
      <path
        d="M 30 14 Q 32 8, 34 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </g>
    {/* Volcano main body highlight */}
    <path
      d="M 28 30 Q 30 24, 32 22 Q 34 24, 36 30 L 38 45 L 26 45 Z"
      fill="currentColor"
      opacity="0.15"
    />
  </svg>
);

/** Aliyun logo */
export const AliyunLogo: React.FC = () => (
  <svg viewBox="0 0 120 80" className={styles.logo}>
    {/* Aliyun official logo style */}
    {/* Left rounded rectangle */}
    <path
      d="M 10 20
         L 10 20
         C 10 12, 16 8, 24 8
         L 40 8
         L 40 20
         L 28 20
         C 24 20, 22 22, 22 26
         L 22 54
         C 22 58, 24 60, 28 60
         L 40 60
         L 40 72
         L 24 72
         C 16 72, 10 68, 10 60
         Z"
      fill="currentColor"
    />
    {/* Right rounded rectangle */}
    <path
      d="M 110 20
         L 110 20
         C 110 12, 104 8, 96 8
         L 80 8
         L 80 20
         L 92 20
         C 96 20, 98 22, 98 26
         L 98 54
         C 98 58, 96 60, 92 60
         L 80 60
         L 80 72
         L 96 72
         C 104 72, 110 68, 110 60
         Z"
      fill="currentColor"
    />
    {/* Middle horizontal bar */}
    <rect x="45" y="35" width="30" height="10" rx="3" fill="currentColor" />
  </svg>
);

/** Zabbix logo */
export const ZabbixLogo: React.FC = () => (
  <svg viewBox="0 0 80 60" className={styles.logo}>
    {/* Zabbix logo - clear Z letter */}
    <g>
      {/* Z letter top horizontal line */}
      <rect x="18" y="12" width="44" height="8" fill="currentColor" />
      {/* Z letter middle diagonal line - from top right to bottom left */}
      <path d="M 62 20 L 18 40 L 18 32 L 54 20 Z" fill="currentColor" />
      {/* Z letter bottom horizontal line */}
      <rect x="18" y="40" width="44" height="8" fill="currentColor" />
    </g>
  </svg>
);
