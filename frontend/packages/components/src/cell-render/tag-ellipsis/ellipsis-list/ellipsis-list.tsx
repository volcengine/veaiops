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

import {
  Button,
  type ButtonProps,
  Link,
  Popover,
  type PopoverProps,
  Select,
  type SelectProps,
  Tag,
} from '@arco-design/web-react';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import type { Action, ShowMode } from '..';

import { prefixCls } from './style/variable';

import './style/index.less';

export interface EllipsisListProps<T> {
  /** Data source */
  dataList: any[];
  /** Maximum number of items to display externally */
  maxCount?: number;
  /** Render function for externally displayed data */
  render: (data: T[]) => ReactNode | ReactNode[];
  /** Render function for Popover content */
  renderContent: (data: T[]) => ReactNode | ReactNode[];
  /** Close card when mouse leaves */
  closeMoveOut?: boolean;
  /** Close button text */
  closeText?: string;
  /** Style for overflow items */
  ellipsisListStyle?: CSSProperties;
  /** Popover configuration for overflow items */
  ellipsisListPopover?: PopoverProps;
  /** Display mode */
  showMode: ShowMode;
  /** Actions */
  actions: Array<Action>;
}

const EllipsisList = <T,>(props: EllipsisListProps<T>) => {
  const {
    showMode,
    dataList,
    maxCount = 1,
    render,
    renderContent,
    closeMoveOut = true,
    ellipsisListStyle,
    ellipsisListPopover,
    actions,
  } = props;

  const [visible, setVisible] = useState(false);

  const content = showMode === 'text' ? dataList.slice(maxCount) : dataList;
  const handleOnVisibleChange = useCallback(
    (_visible: boolean) => {
      if (closeMoveOut) {
        setVisible(_visible);
      } else {
        _visible && setVisible(_visible);
      }
    },
    [closeMoveOut],
  );

  const popoverWrap = useCallback(
    (children: ReactNode) => (
      <Popover
        content={
          <div className={`${prefixCls}-detail-popover`}>
            {renderContent(content)}
          </div>
        }
        className={`${prefixCls}-popover-wrapper`}
        style={ellipsisListStyle}
        popupVisible={visible}
        onVisibleChange={handleOnVisibleChange}
        {...ellipsisListPopover}
      >
        {children}
      </Popover>
    ),
    [
      visible,
      content,
      ellipsisListStyle,
      handleOnVisibleChange,
      renderContent,
      ellipsisListPopover,
    ],
  );

  const actionRender = useMemo(
    () => (
      <div className={'flex items-center gap-1 w-min-width'}>
        {}
        {actions?.map(({ key, type, actions, cb }) =>
          type === 'Button' ? (
            <Button key={key} {...(actions as ButtonProps)} onClick={cb} />
          ) : (
            <Select key={key} {...(actions as SelectProps)} />
          ),
        )}
      </div>
    ),
    [actions],
  );

  const textRender = useMemo(
    () => (
      <>
        {maxCount > 0 && render(dataList.slice(0, maxCount))}
        {dataList.length > maxCount &&
          popoverWrap(
            <Link className={`${prefixCls}-link`}>
              <Tag>{`+${content?.length}`}</Tag>
            </Link>,
          )}
        {actionRender}
      </>
    ),
    [dataList, content, actionRender, maxCount, render, popoverWrap],
  );

  const countRender = useMemo(
    () => (dataList?.length > 0 ? popoverWrap(dataList?.length) : 0),
    [dataList, popoverWrap],
  );

  return (
    <div className={'flex gap-1'} style={{ ...ellipsisListStyle }}>
      {showMode === 'text' ? textRender : countRender}
    </div>
  );
};

export { EllipsisList };
