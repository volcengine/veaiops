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

import { resetLogCollector } from './collector';

export function useResetLogging(componentName: string) {
  return {
    logStart: (method: string, data?: Record<string, unknown>) => {
      resetLogCollector.log({
        component: componentName,
        method,
        action: 'start',
        data,
      });
    },
    logEnd: (method: string, data?: Record<string, unknown>) => {
      resetLogCollector.log({
        component: componentName,
        method,
        action: 'end',
        data,
      });
    },
    logCall: (method: string, data?: Record<string, unknown>) => {
      resetLogCollector.log({
        component: componentName,
        method,
        action: 'call',
        data,
      });
    },
    logError: (
      method: string,
      error: Error,
      data?: Record<string, unknown>,
    ) => {
      resetLogCollector.log({
        component: componentName,
        method,
        action: 'error',
        data: {
          ...data,
          error: error.message,
        },
        stackTrace: error.stack,
      });
    },
  };
}
