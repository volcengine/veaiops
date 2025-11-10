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

import type { TableTitleProps } from '@/custom-table/types/components/table-title';
import { Space } from '@arco-design/web-react';
/**
 * Table title component
 */
import React from 'react';
import '../../styles/components/table-title.less';

const TableTitle: React.FC<TableTitleProps> = ({
  title,
  actions,
  className = '',
  titleStyle = {},
  actionClassName = '',
}) => {
  if (!title && !actions?.length) {
    return null;
  }

  return (
    <div
      className={`custom-table-title ${className}`.trim()}
      style={titleStyle}
    >
      {title && <div className="title-text">{title}</div>}
      {actions && actions.length > 0 && (
        <div className={`title-actions ${actionClassName}`.trim()}>
          <Space>
            {actions.map((action: React.ReactNode, index: number) => (
              <React.Fragment key={`action-${index}`}>{action}</React.Fragment>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

export { TableTitle };
