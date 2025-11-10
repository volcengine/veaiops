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

import { Card } from '@arco-design/web-react';
import type { CardProps } from '@arco-design/web-react';
import type React from 'react';
import type { ReactNode } from 'react';
import styles from './index.module.less';

interface CardWithTitleProps extends Omit<CardProps, 'title'> {
  title: string | ReactNode;
}

/**
 * Card component with decorative bar
 * @description Adds blue decorative bar before title, maintaining consistent visual style with wrapper-with-title
 */
export const CardWithTitle: React.FC<CardWithTitleProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <Card
      {...props}
      title={<div className={styles.titleWithDecorator}>{title}</div>}
    >
      {children}
    </Card>
  );
};

export default CardWithTitle;
