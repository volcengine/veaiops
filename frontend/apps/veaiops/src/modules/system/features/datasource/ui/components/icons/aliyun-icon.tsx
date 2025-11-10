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
 * Aliyun icon component
 */
export const AliyunIcon: React.FC<IconProps> = ({
  size = 16,
  color = '#00A86B',
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
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      fill={color}
      fillOpacity="0.1"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M8 12L12 8L16 12L12 16L8 12Z" fill={color} />
    <path
      d="M12 6V8M12 16V18M6 12H8M16 12H18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="2" fill="white" />
  </svg>
);
