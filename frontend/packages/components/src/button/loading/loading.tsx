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
  Popover,
  Tooltip,
} from '@arco-design/web-react';
import { type FC, useCallback, useState } from 'react';

import type { IProps } from './interface';

export const LoadingButton: FC<IProps> = (props) => {
  const { type = 'text', disabled, disableText, tip, onClick } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = useCallback(
    async (e: Event) => {
      setLoading(true);
      try {
        await onClick?.(e);
      } finally {
        setLoading(false);
      }
    },
    [onClick],
  );

  const getTextColor = () => {
    if (disabled) {
      return '#CCCED0';
    }
    if (props.status === 'danger') {
      return '#DB373F';
    }
    if (props.status === 'success') {
      return '#1CB267';
    }
    return '#1664FF';
  };

  const commonStyle = {
    fontSize: 13,
    fontWeight: 400,
    ...(type === 'primary' ? {} : { padding: '1px 4px' }),
    ...(type === 'text' ? { color: getTextColor() } : {}),
  };

  const rest = {
    ...(type === 'primary'
      ? { type: 'primary', size: 'small' }
      : { type: 'text', size: 'mini' }),
    ...props,
    style: { ...commonStyle, ...(props.style || {}) },
    onClick: handleClick,
  } as ButtonProps;

  // When button is not disabled, show persistent tip
  if (!disabled && tip) {
    return (
      <Popover trigger="hover" title={null} content={tip}>
        <Button loading={loading} {...rest} />
      </Popover>
    );
  }

  return (
    <Tooltip mini content={disableText} disabled={!(disableText && disabled)}>
      <Button loading={loading} {...rest} />
    </Tooltip>
  );
};
