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

export function withResetLogging<T extends (...args: unknown[]) => unknown>(
  target: unknown,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>,
): TypedPropertyDescriptor<T> {
  const originalMethod = descriptor.value!;

  descriptor.value = ((...args: unknown[]) => {
    const component =
      (target as { constructor?: { name?: string } }).constructor?.name ||
      'Unknown';
    const method = propertyName;

    resetLogCollector.log({
      component,
      method,
      action: 'start',
      data: {
        arguments: args,
        timestamp: new Date().toISOString(),
      },
    });

    try {
      const result = originalMethod.apply(target, args);

      if (
        result &&
        typeof result === 'object' &&
        'then' in result &&
        typeof (result as { then: unknown }).then === 'function'
      ) {
        return (result as Promise<unknown>)
          .then((res: unknown) => {
            resetLogCollector.log({
              component,
              method,
              action: 'end',
              data: {
                result: res,
                timestamp: new Date().toISOString(),
              },
            });
            return res;
          })
          .catch((error: unknown) => {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            resetLogCollector.log({
              component,
              method,
              action: 'error',
              data: {
                error: errorMessage,
                stack: errorStack,
                timestamp: new Date().toISOString(),
              },
            });
            throw error;
          });
      }

      resetLogCollector.log({
        component,
        method,
        action: 'end',
        data: {
          result,
          timestamp: new Date().toISOString(),
        },
      });

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      resetLogCollector.log({
        component,
        method,
        action: 'error',
        data: {
          error: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
        },
      });
      throw error;
    }
  }) as T;

  return descriptor;
}

