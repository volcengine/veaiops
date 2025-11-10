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

import { Pagination } from '@arco-design/web-react';
import type { PaginationProps } from '@arco-design/web-react/es/Pagination';
/**
 * Pagination component
 */
import type React from 'react';
import type { ReactNode } from 'react';
import '../style/pagination.less';

export interface CustomPaginationProps extends PaginationProps {
  className?: string;
  showTotal?: boolean;
  position?: 'top' | 'bottom' | 'both';
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  className = '',
  total = 0,
  current = 1,
  pageSize = 10,
  showTotal = true,
  showJumper = true,
  sizeCanChange = true,
  position = 'bottom',
  onChange,
  ...restProps
}) => {
  // Compose showTotal renderer: "Items 1-10, Total 12 (2 pages), 10 items/page"
  const renderTotal:
    | ((total: number, range: number[]) => ReactNode)
    | undefined =
    showTotal === true
      ? (t: number, range: number[]) => {
          const pages = pageSize > 0 ? Math.ceil((t || 0) / pageSize) : 0;
          const start =
            range?.[0] ??
            (t > 0 && pageSize > 0 ? (current - 1) * pageSize + 1 : 0);
          const end =
            range?.[1] ??
            (pageSize > 0 ? Math.min(current * pageSize, t || 0) : 0);
          return `Items ${start}-${end}, Total ${t} (${pages} pages), ${pageSize} items/page`;
        }
      : undefined;

  // Prevent external showTotal from overriding our renderer
  // Arco PaginationProps' showTotal can be a function or boolean, needs explicit handling
  const safeRestProps = restProps as Omit<typeof restProps, 'showTotal'>;

  return (
    <div className={`custom-table-pagination ${position} ${className}`.trim()}>
      <Pagination
        {...safeRestProps}
        total={total}
        current={current}
        pageSize={pageSize}
        showTotal={renderTotal}
        showJumper={showJumper}
        sizeCanChange={sizeCanChange}
        onChange={onChange}
      />
    </div>
  );
};

export { CustomPagination };
