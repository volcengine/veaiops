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

import type { TagProps } from '@arco-design/web-react/es/Tag/interface';
import { EMPTY_CONTENT, EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type React from 'react';
import {
  TagEllipsis,
  type TagEllipsisData,
} from '../tag-ellipsis/tag-ellipsis';
import styles from './index.module.less';

/**
 * Custom Outline Tag component property interface
 */
export interface CustomOutlineTagProps extends Omit<TagProps, 'color'> {
  /**
   * Tag text content
   */
  children: React.ReactNode;
  /**
   * Color theme, supports predefined data colors
   */
  colorTheme?:
    | 'data-1'
    | 'data-2'
    | 'data-3'
    | 'data-4'
    | 'data-5'
    | 'data-6'
    | 'data-7'
    | 'data-8'
    | 'data-9'
    | 'data-10'
    | 'data-11'
    | 'data-12'
    | 'data-13'
    | 'data-14'
    | 'data-15'
    | 'data-16'
    | 'data-17'
    | 'data-18'
    | 'data-19'
    | 'data-20';
  /**
   * Whether to enable ellipsis
   */
  ellipsis?: boolean;
  /**
   * Maximum width
   */
  maxWidth?: string | number;
}

/**
 * Custom Outline Tag component
 * Supports outline style and ellipsis functionality
 */
export const CustomOutlineTag: React.FC<CustomOutlineTagProps> = ({
  children,
  colorTheme,
  ellipsis = false, // Default to not enable ellipsis to avoid important information being truncated
  maxWidth = 'auto', // Default to automatic width to allow content to display completely
  className = '',
  style = {},
  ...restProps
}) => {
  if (!children) {
    return EMPTY_CONTENT;
  }
  const tagClassName = [
    'arco-tag',
    'arco-tag-checked',
    'arco-tag-size-default',
    'rd-tag',
    'rd-tag-outline',
    styles.customOutlineTag,
    colorTheme ? styles[`theme-${colorTheme}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const tagStyle = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    ...style,
  };

  return (
    <div className={tagClassName} style={tagStyle} {...restProps}>
      <span className="arco-tag-content">
        <div className={styles.tagContent}>
          {ellipsis ? (
            <div className={styles.ellipsisWrapper}>
              <div className={styles.ellipsisContentMirror}>
                <span className="arco-ellipsis-text">{children}</span>
              </div>
              <div className={styles.ellipsisContent}>
                <span className="arco-ellipsis-text">{children}</span>
              </div>
            </div>
          ) : (
            <span>{children}</span>
          )}
        </div>
      </span>
    </div>
  );
};

/**
 * Multi-tag rendering component property interface
 */
export interface CustomOutlineTagListProps {
  /**
   * Tag data list
   */
  dataList: Array<{
    name: string;
    key?: string;
    colorTheme?: CustomOutlineTagProps['colorTheme'];
  }>;
  /**
   * Maximum display count
   */
  maxCount?: number;
  /**
   * Tag properties
   */
  tagProps?: Partial<CustomOutlineTagProps>;
  /**
   * Whether to use ellipsis mode
   */
  useEllipsis?: boolean;
  /**
   * Additional configuration in ellipsis mode
   */
  ellipsisConfig?: {
    ellipsisOption?: any;
    ellipsisTextStyle?: React.CSSProperties;
    ellipsisListStyle?: React.CSSProperties;
  };
}

/**
 * Multi-tag rendering component
 * Supports maximum count limit and ellipsis display
 */
// Create alias for backward compatibility
export const CustomOutlineTagRender = CustomOutlineTag;

export const CustomOutlineTagList: React.FC<CustomOutlineTagListProps> = ({
  dataList = [],
  maxCount = 2,
  tagProps = {},
  useEllipsis = false,
  ellipsisConfig = {},
}) => {
  if (!dataList.length) {
    return (
      <span style={{ color: 'var(--color-text-4)' }}>{EMPTY_CONTENT_TEXT}</span>
    );
  }

  // If using ellipsis mode, call TagEllipsis component
  if (useEllipsis) {
    // Convert data format to TagEllipsis expected format
    const tagEllipsisData: TagEllipsisData[] = dataList.map((item) => ({
      name: item.name,
      // Can add other fields as needed
    }));

    return (
      <TagEllipsis
        dataList={tagEllipsisData}
        maxCount={maxCount}
        tagProps={tagProps}
        {...ellipsisConfig}
      />
    );
  }

  // Original simple implementation
  const displayList = dataList.slice(0, maxCount);
  const remainingCount = dataList.length - maxCount;

  return (
    <div className={styles.tagList}>
      {displayList.map((item, index) => (
        <CustomOutlineTag
          key={item.key || item.name || `tag-${index}`}
          colorTheme={item.colorTheme}
          {...tagProps}
        >
          {item.name}
        </CustomOutlineTag>
      ))}
      {remainingCount > 0 && (
        <CustomOutlineTag {...tagProps}>+{remainingCount}</CustomOutlineTag>
      )}
    </div>
  );
};
