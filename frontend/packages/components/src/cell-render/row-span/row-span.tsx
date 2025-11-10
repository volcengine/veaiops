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

import type { ReactNode } from 'react';

type WithOptionalRowSpan<T> = T & {
  rowSpan?: number;
};

type RowSpanRecordType<T = Record<string, any>> = WithOptionalRowSpan<T>;

interface RowSpanCellProps<T extends RowSpanRecordType> {
  record: T; // Record object containing rowSpan configuration
  children: ReactNode; // Custom rendering component
}

/**
 * Return type of RowSpan function
 * Used in table column render functions
 */
export type RowSpanReturnType = {
  children: ReactNode;
  props: {
    rowSpan: any;
  };
};

/**
 * Component for processing rowSpan logic based on record configuration
 * @param record - Record object containing rowSpan configuration
 * @param renderComponent - Custom rendering component for cells
 * @returns Object containing cell content and properties
 */
const RowSpanCellRender = <T extends RowSpanRecordType>({
  record,
  children,
}: RowSpanCellProps<T>): RowSpanReturnType => ({
  children,
  props: {
    rowSpan: record?.rowSpan,
  },
});

export { RowSpanCellRender };
