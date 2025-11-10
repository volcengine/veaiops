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

/**
 * Table pagination plugin helper method factory
 */
import { getStateNumber, isCallableFunction } from './utils';

/**
 * Create pagination helper method collection
 */
export function createPaginationHelpers(context: any) {
  const { setCurrent } = context.helpers;
  const { setPageSize } = context.helpers;

  return {
    setCurrent,
    setPageSize,
    goToFirst: () => {
      if (isCallableFunction(setCurrent)) {
        setCurrent(1);
      }
    },
    goToLast: () => {
      const total = getStateNumber({
        value: context.state.tableTotal,
        defaultValue: 0,
      });
      const pageSize = getStateNumber({
        value: context.state.pageSize,
        defaultValue: 10,
      });
      const lastPage = Math.ceil(total / pageSize);
      if (isCallableFunction(setCurrent)) {
        setCurrent(lastPage);
      }
    },
    goToNext: () => {
      const current = getStateNumber({
        value: context.state.current,
        defaultValue: 1,
      });
      const total = getStateNumber({
        value: context.state.tableTotal,
        defaultValue: 0,
      });
      const pageSize = getStateNumber({
        value: context.state.pageSize,
        defaultValue: 10,
      });
      const nextPage = current + 1;
      const lastPage = Math.ceil(total / pageSize);
      if (nextPage <= lastPage && isCallableFunction(setCurrent)) {
        setCurrent(nextPage);
      }
    },
    goToPrevious: () => {
      const current = getStateNumber({
        value: context.state.current,
        defaultValue: 1,
      });
      const prevPage = current - 1;
      if (prevPage >= 1 && isCallableFunction(setCurrent)) {
        setCurrent(prevPage);
      }
    },
    resetPagination: () => {
      if (isCallableFunction(setCurrent)) {
        setCurrent(1);
      }
    },
  };
}
