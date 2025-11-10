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

import React, { type FC, type ReactNode } from 'react';
import { FILTER_CONTAINER_ID, commonClassName } from '../core/constants';
import type { FilterStyle } from '../core/types';
import style from '../index.module.less';

interface FilterContainerProps {
  /** Custom class name */
  className?: string;
  /** Filter style configuration */
  filterStyle: FilterStyle;
  /** Child components */
  children: ReactNode;
}

/**
 * Filter container component
 * Responsible for providing basic layout and styles for filters
 */
const FilterContainer: FC<FilterContainerProps> = ({
  className = '',
  filterStyle,
  children,
}) => {
  return (
    <div
      id={FILTER_CONTAINER_ID}
      className={
        filterStyle.isWithBackgroundAndBorder
          ? style.listFilter
          : style.listFilterNoBgNoBorder
      }
    >
      <div className={style.listFilterContent}>
        <div
          className={`${commonClassName} justify-between w-full ${className}`}
          style={filterStyle.style}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export { FilterContainer };
export default FilterContainer;
