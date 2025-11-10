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

import { EMPTY_CONTENT } from '@veaiops/constants';
import isNull from 'lodash-es/isNull';
import isUndefined from 'lodash-es/isUndefined';
import type { FC } from 'react';

const BooleanRender: FC<{ data: unknown }> = ({ data }) => {
  if (isUndefined(data) || isNull(data)) {
    return <span>{EMPTY_CONTENT}</span>;
  }
  return <div className={'flex'}>{data ? 'Yes' : 'No'}</div>;
};

export { BooleanRender };
