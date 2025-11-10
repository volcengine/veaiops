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

import { Link } from '@arco-design/web-react';
import type { LinkProps } from '@arco-design/web-react/es/Link/interface';
import { isString } from 'lodash-es';

import { EMPTY_CONTENT } from '@veaiops/constants';
import type { CSSProperties } from 'react';
import { EllipsisRender, type EllipsisRenderProps } from '../ellipsis/ellipsis';

// EMPTY_CONTENT is imported directly from constants

export enum RequireField {
  LINK = 'link',
  TEXT = 'text',
}

export type LinkRenderProps = {
  link: string | undefined;
  linkProps?: LinkProps;
  text?: string | number;
  requireField?: RequireField;
  noLinkText?: string;
  isTextRequire?: boolean;
  ellipsisProps?: Partial<EllipsisRenderProps>;
  ellipsisStyle?: CSSProperties;
};

const LinkRender = ({
  link,
  text,
  requireField,
  noLinkText = 'No link',
  isTextRequire = false,
  linkProps = {},
  ellipsisProps = {},
  ellipsisStyle = {},
}: LinkRenderProps): JSX.Element => {
  if (requireField) {
    if (
      (requireField === RequireField.LINK && link === undefined) ||
      (requireField === RequireField.TEXT && text === undefined)
    ) {
      return EMPTY_CONTENT;
    } else if (!link && text !== undefined) {
      return <EllipsisRender text={text} />;
    }
  }
  const linkText = isString(text) ? text?.trim() : text || 'Link';

  const ellipsisText = (
    <EllipsisRender
      text={linkText}
      style={{ maxWidth: 150, ...ellipsisStyle }}
      {...ellipsisProps}
    />
  );

  if (!link || (isTextRequire && !text)) {
    return <span style={{ color: 'rgb(var(--gray-6))' }}>{noLinkText}</span>;
  }

  return (
    <Link href={link} target="_blank" style={{ width: '100%' }} {...linkProps}>
      {ellipsisText}
    </Link>
  );
};

export { LinkRender };
export default LinkRender;
