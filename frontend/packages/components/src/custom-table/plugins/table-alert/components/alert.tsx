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

import { Alert } from '@arco-design/web-react';
/**
 * Table alert info component
 */
import type React from 'react';
import '../style/alert.less';

export interface CustomAlertProps {
  show?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  content?: React.ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  show = true,
  type = 'info',
  content,
  showIcon = true,
  closable = true,
  position = 'top',
  className = '',
  onClose,
}) => {
  if (!show || !content) {
    return null;
  }

  return (
    <div className={`custom-table-alert ${position} ${className}`.trim()}>
      <Alert
        type={type}
        showIcon={showIcon}
        closable={closable}
        content={content}
        onClose={onClose}
      />
    </div>
  );
};

export { CustomAlert };
