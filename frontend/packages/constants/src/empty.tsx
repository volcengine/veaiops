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

import type { FC } from 'react';

export const EMPTY_CONTENT_TEXT = '-';

export const EMPTY_CONTENT = (
  <span className="text-gray-default">{EMPTY_CONTENT_TEXT}</span>
);

export const EMPTY_CONTENT_TEXT_DOM = <span>No Data</span>;

export const EmptyDataTagRender: FC<{ text?: string }> = ({
  text = 'No Data',
}) => <span className="text-gray-default">{text}</span>;

export const EMPTY_CONTENT_TAG = (
  <span
    className="text-gray-default"
    style={{ textAlign: 'center', fontWeight: 400 }}
  >
    {EMPTY_CONTENT_TEXT_DOM}
  </span>
);

export const EMPTY_CONTENT_TAG_WRAP = (text: string) => (
  <span
    className="text-gray-default"
    style={{ textAlign: 'center', fontWeight: 400 }}
  >
    {text || EMPTY_CONTENT_TEXT_DOM}
  </span>
);
