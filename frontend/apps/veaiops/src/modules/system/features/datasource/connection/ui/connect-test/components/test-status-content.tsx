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
 * Test status content component
 */

import { Typography } from '@arco-design/web-react';
import type React from 'react';
import type { TestStatus } from './constants';
import { STATUS_MESSAGES } from './constants';

const { Text } = Typography;

export interface TestStatusContentProps {
  status: TestStatus;
}

export const TestStatusContent: React.FC<TestStatusContentProps> = ({
  status,
}) => {
  const message = STATUS_MESSAGES[status];

  return (
    <div style={{ maxWidth: '400px' }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 600,
          margin: 0,
          color: message.color,
          display: 'block',
          marginBottom: 8,
        }}
      >
        {message.title}
      </Text>
      <Text style={{ color: 'var(--color-text-2)' }}>
        {message.description}
      </Text>
    </div>
  );
};
