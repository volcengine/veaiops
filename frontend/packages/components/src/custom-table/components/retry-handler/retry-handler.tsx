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

import type { RetryHandlerProps } from '@/custom-table/types';
import { Button } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
/**
 * Retry handler component
 * Used for handling retry logic when table data loading fails
 */
import type React from 'react';

/**
 * Retry handler component
 */
const RetryHandler: React.FC<RetryHandlerProps> = ({
  context,
  message = 'Load failed, please retry',
  buttonText = 'Retry',
}) => {
  const handleRetry = () => {
    if (context.helpers.run && typeof context.helpers.run === 'function') {
      context.helpers.run();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <p className="text-gray-500 mb-4">{message}</p>
      <Button type="primary" icon={<IconRefresh />} onClick={handleRetry}>
        {buttonText}
      </Button>
    </div>
  );
};

export { RetryHandler };
