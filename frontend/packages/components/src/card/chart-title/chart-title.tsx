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

import type { FC, ReactNode } from 'react';

import { Tip } from '@/tip';
import styles from './index.module.less';

type CardTitleProps = {
  /** Card title */
  title?: ReactNode;
  /** Card header tip */
  tips?: ReactNode;
  /** Whether to show tip */
  showTips?: boolean;
  /** Subtitle */
  subTitle?: ReactNode;
  /** Card text or description */
  description?: ReactNode;
  /** Card right side button actions */
  actions?: Array<ReactNode>;
};

export const CardTitle: FC<CardTitleProps> = ({
  title,
  tips,
  showTips = false,
  subTitle,
  actions,
  description,
}) => {
  const renderDescription = () => {
    if (!description) {
      return null;
    }
    if (typeof description === 'function') {
      // @ts-expect-error
      return description();
    }
    return description;
  };
  return (
    <>
      <div className={styles.lineOne}>
        <div className={styles.lineOneLeft}>
          {typeof title === 'string' ? (
            <span className={styles.title}>{title}</span>
          ) : (
            <>{title}</>
          )}
          {showTips && <Tip content={tips} />}
          {subTitle ? (
            <span className={styles.subTitle}>{subTitle}</span>
          ) : null}
        </div>
        {actions?.length ? (
          <div className={styles.actions}>{actions}</div>
        ) : null}
      </div>
      {renderDescription()}
    </>
  );
};
