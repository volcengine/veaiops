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
 * Connection test modal header component
 */

import { IconExperiment } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type React from 'react';

const { CustomOutlineTag, Ellipsis } = CellRender;

export interface ModalHeaderProps {
  connectName: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ connectName }) => (
  <div className="flex items-center font-semibold text-base gap-2.5">
    <IconExperiment style={{ color: 'var(--color-primary)', marginRight: 8 }} />
    <span>连接测试</span>
    <CustomOutlineTag>
      连接名称：
      <Ellipsis text={connectName} />
    </CustomOutlineTag>
  </div>
);
