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
 * Status icon component
 */

import { Spin } from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconCloseCircle,
  IconExperiment,
} from '@arco-design/web-react/icon';
import type React from 'react';

export interface StatusIconProps {
  status: 'loading' | 'success' | 'error' | 'idle';
  size?: number;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 48,
}) => {
  const iconStyle = {
    fontSize: size,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  switch (status) {
    case 'loading':
      return <Spin size={size} style={iconStyle} />;
    case 'success':
      return <IconCheckCircle style={{ ...iconStyle, color: '#00b42a' }} />;
    case 'error':
      return <IconCloseCircle style={{ ...iconStyle, color: '#f53f3f' }} />;
    default:
      return <IconExperiment style={{ ...iconStyle, color: '#86909c' }} />;
  }
};
