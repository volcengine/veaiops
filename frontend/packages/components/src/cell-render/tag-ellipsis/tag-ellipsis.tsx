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

// Components
import { Link as ArcoLink, type SelectProps } from '@arco-design/web-react'; // Link and Select components from Arco Design component library
import type { BaseButtonProps } from '@arco-design/web-react/es/Button/interface'; // Button component property type definitions from Arco Design component library
import type { TagProps } from '@arco-design/web-react/es/Tag/interface';
import type { OperationsProps } from '@arco-design/web-react/es/Typography/interface'; // Typography component property type definitions from Arco Design component library
import type { TypographyEllipsisProps } from '@arco-design/web-react/lib/Typography/interface';
import { get, isEmpty, omit } from 'lodash-es'; // get and isEmpty functions from Lodash utility library
import { type CSSProperties, useCallback, useMemo } from 'react';
import { CustomOutlineTag } from '../custom-outline-tag';

// Component related
import { EllipsisRender } from '../ellipsis/ellipsis'; // Ellipsis rendering function
import styles from './index.module.less';

import { EllipsisList } from './ellipsis-list/ellipsis-list'; // Tag ellipsis list component

// Constant definitions
const EMPTY_CONTENT = '-';
const EMPTY_CONTENT_TEXT = '-';

// Utility functions
const ensureArray = <T,>(value: T | T[]): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
};

export type ShowMode = 'text' | 'count';

export type Action = {
  key: string;
  type: 'Button' | 'Select';
  actions: BaseButtonProps | SelectProps;
  cb?: (e: Event) => void;
};

export type RoutePath = {
  key: string;
  pathKey: string;
  prefix: string;
  func: ({ prefix, pathKey }: { prefix: string; pathKey: string }) => string;
  areaKey: string;
};

export type TagEllipsisData = {
  name: string;
  color?: string;
  type?:
    | 'success'
    | 'warning'
    | 'error'
    | 'stop'
    | 'loading'
    | 'spin'
    | 'processing'
    | undefined;
};
export type TagEllipsisProps<
  RecordType extends TagEllipsisData = TagEllipsisData,
> = {
  dataList: RecordType[];
  maxCount?: number;
  reverse?: boolean;
  showMode?: ShowMode;
  editable?: boolean;
  routePath?: RoutePath;
  ellipsisOption?: TypographyEllipsisProps;
  ellipsisTextStyle?: CSSProperties;
  ellipsisListStyle?: CSSProperties;
  actions?: Array<Action>;
  tagProps?: Partial<TagProps>;
};

const isObject = <T,>(target: string | T): target is T =>
  typeof target === 'object';

const renderEllipsis = (
  text: string,
  ellipsisOption: TypographyEllipsisProps | undefined,
  ellipsisTextStyle: CSSProperties,
) => {
  const defaultStyles = {
    color: text === EMPTY_CONTENT_TEXT ? 'rgb(var(--gray-6))' : 'inherit',
  };
  return (
    <EllipsisRender
      text={text}
      options={ellipsisOption}
      style={{
        fontWeight: 400,
        ...defaultStyles,
        ...ellipsisTextStyle,
      }}
    />
  );
};

const renderLink = (
  text: unknown,
  routePath: RoutePath,
  ellipsisOption: TypographyEllipsisProps | undefined,
  ellipsisTextStyle: CSSProperties,
) => (
  <ArcoLink
    className="no-underline text-current min-w-[200px] cursor-pointer"
    href={routePath?.func?.(get(text, `${String(routePath?.pathKey)}`))}
    target="_blank"
    rel="noreferrer"
  >
    {renderEllipsis(
      get(text, `${String(routePath?.key)}`),
      ellipsisOption,
      ellipsisTextStyle,
    )}
  </ArcoLink>
);

const TagEllipsis = <T extends TagEllipsisData>({
  dataList = [],
  maxCount = 1,
  reverse = false,
  showMode = 'text',
  editable = false,
  routePath,
  ellipsisOption = {} as OperationsProps,
  ellipsisTextStyle = {},
  ellipsisListStyle = {},
  actions = [],
  tagProps = {},
}: TagEllipsisProps<T>) => {
  const isShowTextMode = useMemo(() => showMode === 'text', [showMode]);
  const _ellipsisListStyle: CSSProperties | undefined = useMemo(
    () =>
      isShowTextMode
        ? ellipsisListStyle
        : { flexDirection: 'row-reverse', ...ellipsisListStyle },
    [ellipsisListStyle, isShowTextMode],
  );

  const renderTags = useCallback(
    (
      renderDataList: T[],
      popoverRenderEllipsisTextStyle: CSSProperties = {},
      isWrapMinWidth = false,
    ) => (
      <div
        className={`flex gap-2 flex-wrap ${
          isWrapMinWidth ? 'w-min-content' : 'items-center'
        }`}
      >
        {renderDataList.map((record, index) => {
          const mergeEllipsisTextStyle = {
            ...ellipsisTextStyle,
            ...popoverRenderEllipsisTextStyle,
          };
          const textRender =
            routePath?.pathKey && isObject(record)
              ? renderLink(
                  record,
                  routePath,
                  ellipsisOption,
                  mergeEllipsisTextStyle,
                )
              : renderEllipsis(
                  record.name || JSON.stringify(record),
                  ellipsisOption,
                  mergeEllipsisTextStyle,
                );

          const color = record?.color;
          return (
            <span
              key={`${record?.name || 'tag'}-${index}`}
              className="rd-tag-pro rd-tag-pro-big"
            >
              <CustomOutlineTag
                className={`${styles.tag} rd-tag rd-tag-outline`}
                closable={editable ? true : undefined}
                onClose={
                  editable ? () => tagProps?.onClose?.(record?.name) : undefined
                }
                {...omit(tagProps, ['onClose'])}
              >
                {textRender}
              </CustomOutlineTag>
            </span>
          );
        })}
      </div>
    ),
    [ellipsisTextStyle, routePath, ellipsisOption, tagProps, editable],
  );

  const renderContent = (renderDataList: T[]) =>
    renderTags(renderDataList, { flexDirection: 'column' }, false);

  let _data = dataList;

  if (
    _data?.length === 0 ||
    (isShowTextMode && (!_data || isEmpty(_data)) && isEmpty(_data))
  ) {
    return EMPTY_CONTENT;
  }

  if (!Array.isArray(dataList)) {
    _data = ensureArray(dataList);
  }

  const reversedDataList = reverse ? [..._data].reverse() : _data;

  return (
    <EllipsisList
      dataList={reversedDataList}
      maxCount={maxCount}
      ellipsisListPopover={{ position: 'bottom' }}
      render={renderTags}
      renderContent={renderContent}
      showMode={showMode}
      actions={actions}
      ellipsisListStyle={_ellipsisListStyle}
    />
  );
};

export { TagEllipsis };
export default TagEllipsis;
