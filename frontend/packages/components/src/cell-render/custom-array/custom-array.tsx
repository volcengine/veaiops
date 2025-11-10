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

// React
import { Button } from '@arco-design/web-react';
import { isEmpty } from 'lodash-es';
import { type CSSProperties, type ReactNode, useMemo, useState } from 'react';

import { EMPTY_CONTENT } from '@veaiops/constants';

import './index.module.less';
import { IconDoubleDown, IconDoubleUp } from '@arco-design/web-react/icon';

// Define component property types
interface BatchArrayRenderProps<T> {
  data: T[]; // Data array
  renderItem: (item: T, index: number) => ReactNode; // Function to render each array element
  emptyContent?: JSX.Element; // Placeholder element for empty content
  direction?: 'vertical' | 'horizontal'; // Arrangement direction, optional values are 'vertical' or 'horizontal'
  wrap?: boolean; // Whether to wrap, only effective when direction is 'horizontal'
  maxDisplay?: number; // Maximum display count
  style?: CSSProperties;
  className?: string;
}

// Batch array rendering component
const CustomBatchRender = <T extends ReactNode>({
  data,
  renderItem = (item) => item,
  emptyContent = EMPTY_CONTENT,
  direction = 'horizontal',
  wrap = true,
  maxDisplay = 10,
  style = {},
  className,
}: BatchArrayRenderProps<T>) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayData = useMemo(
    () => (isExpanded ? data : data?.slice(0, maxDisplay)),
    [isExpanded, data, maxDisplay],
  );

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderContent = () => {
    if (isEmpty(displayData)) {
      return emptyContent;
    }

    return (
      <div className={'flex flex-col gap-[5px]'}>
        {displayData.map((item: T, index: number) => (
          <div key={`item-${index}`} className={`item-${index}`}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  };

  const flexStyle: CSSProperties = {
    display: 'flex',
    width: '100%',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    flexWrap: direction === 'horizontal' && wrap ? 'wrap' : 'nowrap',
    gap: '5px',
    ...style,
  };

  return (
    <div className={className} style={flexStyle}>
      {renderContent()}
      {data?.length > maxDisplay && (
        <span>
          <Button
            type={'text'}
            style={{ height: 15 }}
            onClick={handleToggleExpand}
          >
            {isExpanded ? <IconDoubleUp /> : <IconDoubleDown />}
          </Button>
        </span>
      )}
    </div>
  );
};

export { CustomBatchRender };
