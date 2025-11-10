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
import { IconPlus } from '@arco-design/web-react/icon';
import React from 'react';

/**
 * Account action button configuration Hook
 * Provides table toolbar action button configuration
 */
export const useAccountActionConfig = (
  onAdd: () => void,
  isSupervisor: boolean,
) => {
  const actions = [
    <div key="add">
      <Button
        type="primary"
        onClick={onAdd}
        disabled={!isSupervisor}
        icon={<IconPlus />}
        data-testid="new-account-btn"
      >
        新增账号
      </Button>
    </div>,
  ];

  return { actions };
};
