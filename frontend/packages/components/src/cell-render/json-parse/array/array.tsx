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
import { isNull, isUndefined } from 'lodash-es';

const canJsonParse = (str: string | null | undefined): boolean => {
  if (!str) {
    return false;
  }
  try {
    JSON.parse(str);
    return true;
  } catch (error: unknown) {
    // ✅ Silently handle JSON.parse errors (this is expected, used to validate if string is valid JSON)
    // No need to log warnings, as this is a normal validation flow
    return false;
  }
};

const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
};

const JsonParseRender = ({
  jsonStr,
}: {
  jsonStr: string | undefined | null;
}) => {
  if (isNull(jsonStr) || isUndefined(jsonStr) || jsonStr?.length === 0) {
    return EMPTY_CONTENT;
  }
  let dataList;
  if (canJsonParse(jsonStr)) {
    dataList = JSON.parse(jsonStr);
  } else {
    dataList = ensureArray(jsonStr);
  }
  return <span>{JSON.stringify(dataList)}</span>;
};

export { JsonParseRender };
