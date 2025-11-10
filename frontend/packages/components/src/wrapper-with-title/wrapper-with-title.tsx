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

import { type CSSProperties, type FC, useCallback } from 'react';

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
  contentStyle?: CSSProperties; // New content area style configuration
  title: string;
  level: 1 | 2 | 3 | 4;
  children?: JSX.Element | JSX.Element[];
  noPadding?: boolean;
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
    if (!cls) {
      return cls;
    }
    let secondaryCls = cls;
    if (cls === 'secondary') {
      secondaryCls = styles.secondary;
    }
    return ` ${cls} ${secondaryCls}`;
  }, [level]);

  const TitleComponent = useCallback(
    ({
      title: wrapperTitle,
      level: wrapperLevel,
      style: wrapperStyle,
      contentStyle: wrapperContentStyle, // New parameter
      noPadding: wrapperNoPadding,
      children: wrapperChildren,
    }: WrapperWithTitleProps) => {
      const Tag = (titleMap[wrapperLevel] ||
        'div') as keyof JSX.IntrinsicElements;
      return (
        <div className={'w-[100%]'}>
          {wrapperTitle && (
            <Tag style={wrapperStyle} className={getClassNameByLevel()}>
              {wrapperTitle}
            </Tag>
          )}
          <div
            style={{
              padding: wrapperNoPadding ? 0 : '10px 0',
              ...wrapperContentStyle, // Merge custom styles
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
  });
};

export { WrapperWithTitle };
