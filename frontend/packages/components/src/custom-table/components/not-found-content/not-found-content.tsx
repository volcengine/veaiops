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

import { Empty, Spin } from '@arco-design/web-react';
import { IconExclamationCircleFill } from '@arco-design/web-react/icon';
import type { FC } from 'react';
import styles from './index.module.less';

export enum NotFoundStatus {
  /** Default state */
  Default = 0,
  /** Start state */
  Start = 1,
  /** Query returned no data */
  NoData = 2,
  /** Request failed */
  RequestFail = 3,
  /** Timeout */
  Timeout = 4,
}

const FetchingUI = (
  <div className={styles.fetching}>
    <Spin style={{ margin: 12 }} />
  </div>
);

export const NotFoundContent: FC<{ notFoundStatus: NotFoundStatus }> = ({
  notFoundStatus,
}) => {
  switch (notFoundStatus) {
    case NotFoundStatus.Start:
      return FetchingUI;
    case NotFoundStatus.NoData:
      return <Empty className={styles.wrap} description="No search results" />;
    case NotFoundStatus.RequestFail:
      return (
        <Empty
          className={styles.wrap}
          description="Request failed"
          icon={<IconExclamationCircleFill />}
        />
      );
    case NotFoundStatus.Timeout:
      return (
        <Empty
          className={styles.wrap}
          description="Request timeout"
          icon={<IconExclamationCircleFill />}
        />
      );
    default:
      return null;
  }
};
