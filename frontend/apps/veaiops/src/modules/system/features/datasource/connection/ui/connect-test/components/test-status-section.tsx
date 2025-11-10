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
 * Test status section component
 */

import type React from 'react';
import type { TestStatus } from './constants';
import { StatusIcon } from './status-icon';
import { TestStatusContent } from './test-status-content';

export interface TestStatusSectionProps {
  status: TestStatus;
}

export const TestStatusSection: React.FC<TestStatusSectionProps> = ({
  status,
}) => (
  <div className="text-center py-8">
    <div className="flex flex-col items-center gap-4">
      <StatusIcon status={status} />
      <TestStatusContent status={status} />
    </div>
  </div>
);
