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
 * Volcengine icon component
 */
export const VolcengineIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#E74C3C',
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
    <path
      d="M12 2L4 20H20L12 2Z"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 8L8 16H16L12 8Z" fill={color} />
    <circle cx="12" cy="6" r="1.5" fill={color} />
    <path d="M10 18H14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
