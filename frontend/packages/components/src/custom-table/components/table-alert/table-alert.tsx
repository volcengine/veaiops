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

import type { TableAlertProps } from '@/custom-table/types';
import { devLog } from '@/custom-table/utils/log-utils';
import { Alert } from '@arco-design/web-react';
/**
 * Table alert information component
 */
import type React from 'react';

const TableAlert: React.FC<TableAlertProps> = ({
  show,
  type = 'info',
  content,
}) => {
  if (process.env.NODE_ENV === 'development') {
    devLog.log({
      component: 'TableAlert',
      message: 'Component rendered:',
      data: {
        show,
        type,
        hasContent: Boolean(content),
      },
    });
  }

  if (!show || !content) {
    return null;
  }

  return (
    <Alert
      className="custom-table-alert"
      type={type}
      showIcon
      content={content}
    />
  );
};

export { TableAlert };
