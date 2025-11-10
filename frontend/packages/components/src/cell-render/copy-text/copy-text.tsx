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

// Arco Design UI library related modules
import { Typography } from '@arco-design/web-react';

// Project related modules
import type { TypographyEllipsisProps } from '@arco-design/web-react/es/Typography/interface';
import type { CSSProperties, FC } from 'react';

import { EMPTY_CONTENT } from '@veaiops/constants';

export interface CopyTextEllipsisRenderProps {
  text: string | number | undefined;
  style?: CSSProperties;
  empty?: JSX.Element;
  ellipsisProps?: TypographyEllipsisProps;
}

// Text ellipsis processing function component
const CopyableTextRender: FC<CopyTextEllipsisRenderProps> = ({
  text = '',
  style = {},
  empty = EMPTY_CONTENT,
  ellipsisProps = {},
}) => {
  if (!text) {
    return typeof empty === 'string' ? <span>{empty}</span> : empty;
  }
  return (
    <Typography.Text
      style={{
        display: 'flex',
        alignItems: 'center',
        marginRight: 18,
        ...style,
      }}
      ellipsis={false}
      copyable={true}
    >
      <Typography.Ellipsis
        style={{ maxWidth: '100%' }}
        showTooltip
        {...ellipsisProps}
      >
        {text}
      </Typography.Ellipsis>
    </Typography.Text>
  );
};

export { CopyableTextRender };
