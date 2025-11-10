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

import { CustomLoading } from '@/custom-table/components';
import type { TableContentProps } from '@/custom-table/types';
/**
 * CustomTable main content render component
 * Optimized based on pro-components design pattern
 *

 * @date 2025-12-19
 */
import type React from 'react';
import { useMemo } from 'react';

/**
 * @name Table main content component
 * @description Responsible for rendering the complete table content structure, including title, filters, loading state, table body, and footer content
 */
export const TableContent: React.FC<TableContentProps> = ({
  header,
  alertDom,
  filterDom,
  loadingConfig = {},
  renderers,
  tableDom,
  className = 'flex-1 flex flex-col gap-2',
  style,
}) => {
  const {
    useCustomLoading = false,
    loading = false,
    customLoading = false,
    tip = 'Loading...',
  } = loadingConfig;

  /** @name Header area rendering */
  const headerDom = useMemo(() => {
    const headerObj = header as
      | {
          title?: React.ReactNode;
          actions?: React.ReactNode;
          className?: string;
          style?: React.CSSProperties;
        }
      | undefined;
    if (
      !headerObj?.title &&
      !(Array.isArray(headerObj?.actions) && headerObj?.actions.length)
    ) {
      return null;
    }

    return (
      <div className={headerObj?.className} style={headerObj?.style}>
        {headerObj?.title && <div>{headerObj.title}</div>}
        {headerObj?.actions && <div>{headerObj.actions}</div>}
      </div>
    );
  }, [header]);

  /** @name Loading state rendering */
  const loadingDom = useMemo(() => {
    const shouldShowLoading = useCustomLoading && (loading || customLoading);
    if (!shouldShowLoading) {
      return null;
    }
    // Safely convert tip to string, ensure type safety
    let tipString = 'Loading...';
    if (tip != null) {
      if (typeof tip === 'string') {
        tipString = tip;
      } else {
        // If not string type, use default value, avoid type conversion issues
        tipString = 'Loading...';
      }
    }
    return <CustomLoading tip={tipString} />;
  }, [useCustomLoading, loading, customLoading, tip]);

  /** @name Table content rendering */
  const tableContentDom = useMemo(
    () => (renderers?.tableRender ? renderers.tableRender(tableDom) : null),
    [renderers, tableDom],
  );

  /** @name Footer content rendering */
  const footerDom = useMemo(() => {
    if (renderers?.footerRender) {
      // Compatible with two signatures: () => ReactNode and (props) => ReactNode
      return (renderers.footerRender as any)({});
    }
    return null;
  }, [renderers]);

  return (
    <div className={className} style={style}>
      {headerDom}
      {alertDom}
      {filterDom}
      {loadingDom}
      {tableContentDom}
      {footerDom}
    </div>
  );
};
