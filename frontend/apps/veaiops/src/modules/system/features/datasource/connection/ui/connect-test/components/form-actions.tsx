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

import { Button } from '@arco-design/web-react';
import type React from 'react';
import type { FormActionsProps } from './types';

/**
 * Form action buttons component
 * Provides cancel and submit buttons
 */
export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  loading,
}) => (
  <div className="flex justify-end gap-3 mt-6">
    <Button onClick={onCancel} disabled={loading}>
      取消
    </Button>
    <Button type="primary" onClick={onSubmit} loading={loading}>
      下一步
    </Button>
  </div>
);
