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

import { Grid } from '@arco-design/web-react';

import styles from './index.module.less';

const { Col } = Grid;

export type CardBoxProps = {
  /** Card box width */
  span: 8 | 12 | 24;
  /** Whether to have border */
  border?: boolean;
  children: ReactNode;
};
const CardBox: FC<CardBoxProps> = ({ span, border, children }) => (
  <Col className={styles.chartBox} span={span}>
    <div className={`${styles.wrapper} ${border ? ' bordered' : ''}`}>
      {children}
    </div>
  </Col>
);

export { CardBox };
