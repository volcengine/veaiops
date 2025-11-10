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

import { logger } from '@veaiops/utils';
import type React from 'react';
import { ensureRowKeys } from './table-renderer.helpers';
import type { BaseRecord } from './table-renderer.types';

export interface ProcessDataParams<RecordType extends BaseRecord = BaseRecord> {
  formattedData: RecordType[];
  rowKey: string | ((record: RecordType) => React.Key);
}

export function processData<RecordType extends BaseRecord = BaseRecord>({
  formattedData,
  rowKey,
}: ProcessDataParams<RecordType>): RecordType[] {
  try {
    const dataWithKeys = ensureRowKeys<RecordType>(formattedData, rowKey);
    logger.debug({
      message: '[createTableRenderer] ensureRowKeys succeeded',
      data: {
        dataWithKeysCount: Array.isArray(dataWithKeys)
          ? dataWithKeys.length
          : 0,
        originalDataCount: Array.isArray(formattedData)
          ? formattedData.length
          : 0,
      },
      source: 'CustomTable',
      component: 'createTableRenderer',
    });
    return dataWithKeys;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[createTableRenderer] ensureRowKeys failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        formattedDataType: typeof formattedData,
        formattedDataIsArray: Array.isArray(formattedData),
        rowKeyType: typeof rowKey,
      },
      source: 'CustomTable',
      component: 'createTableRenderer/ensureRowKeys',
    });
    return Array.isArray(formattedData) ? formattedData : [];
  }
}
