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

import { Space } from '@arco-design/web-react';
import { type CSSProperties, type FC, useCallback } from 'react';
import type React from 'react';

import { CustomOutlineTag } from '../cell-render/custom-outline-tag';
import styles from './index.module.less';

enum TitleLevel {
  title = 1,
  subtitle = 2,
  thirdTitle = 3,
  fourTitle = 4,
}

export type WrapperWithTitleProps = {
  style?: CSSProperties;
  contentStyle?: CSSProperties; // 新增内容区域样式配置
  title: string;
  level: 1 | 2 | 3 | 4;
  children?: JSX.Element | JSX.Element[];
  noPadding?: boolean;
  /**
   * Actions to display next to the title (e.g., buttons)
   * Can be a single ReactNode or an array of ReactNodes
   */
  actions?: React.ReactNode | React.ReactNode[];
};

const titleMap: Record<TitleLevel, string> = {
  [TitleLevel.title]: 'h1',
  [TitleLevel.subtitle]: 'h2',
  [TitleLevel.thirdTitle]: 'h3',
  [TitleLevel.fourTitle]: 'div',
};

const WrapperWithTitle: FC<WrapperWithTitleProps> = ({
  style,
  noPadding = false,
  contentStyle = {},
  title,
  level,
  children,
  actions,
}) => {
  const getClassNameByLevel = useCallback(() => {
    let cls;
    if (level === TitleLevel.title) {
      cls = styles.title;
    } else if (level === TitleLevel.subtitle) {
      cls = styles.subtitle;
    } else if (level === TitleLevel.thirdTitle) {
      cls = styles.thirdtitle;
    } else if (level === TitleLevel.fourTitle) {
      cls = styles.fourtitle;
    }
    return cls
      ? ` ${cls} ${cls === 'secondary' ? styles.secondary : cls}`
      : cls;
  }, [level]);

  const TitleComponent = useCallback(
    ({
      title: wrapperTitle,
      level: wrapperLevel,
      style: wrapperStyle,
      contentStyle: wrapperContentStyle, // 新增参数
      noPadding: wrapperNoPadding,
      children: wrapperChildren,
      actions: wrapperActions,
    }: WrapperWithTitleProps) => {
      const Tag = (titleMap[wrapperLevel] ||
        'div') as keyof JSX.IntrinsicElements;
      const hasActions =
        wrapperActions &&
        (Array.isArray(wrapperActions) ? wrapperActions.length > 0 : true);

      return (
        <div className={'w-[100%]'}>
          {(wrapperTitle || hasActions) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {wrapperTitle && (
                <Tag style={wrapperStyle} className={getClassNameByLevel()}>
                  {wrapperTitle}
                </Tag>
              )}
              {hasActions && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: 'auto',
                    flexShrink: 0,
                  }}
                >
                  <Space>
                    {Array.isArray(wrapperActions)
                      ? wrapperActions.map((action, index) => (
                          <React.Fragment key={`action-${index}`}>
                            {action}
                          </React.Fragment>
                        ))
                      : wrapperActions}
                  </Space>
                </div>
              )}
            </div>
          )}
          <div
            style={{
              padding: wrapperNoPadding ? 0 : '10px 0',
              ...wrapperContentStyle, // 合并自定义样式
            }}
          >
            {wrapperChildren}
          </div>
        </div>
      );
    },
    [getClassNameByLevel],
  );

  return TitleComponent({
    title,
    level,
    style,
    contentStyle,
    noPadding,
    children,
    actions,
  });
};

export { WrapperWithTitle };
