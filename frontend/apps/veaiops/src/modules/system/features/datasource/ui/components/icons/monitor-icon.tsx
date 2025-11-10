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

import type React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Generic monitor icon component
 */
export const MonitorIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#666',
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="14"
      rx="2"
      fill={color}
      fillOpacity="0.1"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M6 10L8 8L12 12L16 8L18 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2 20H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
