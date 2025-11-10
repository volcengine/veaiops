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

import { Spin } from '@arco-design/web-react';
import type React from 'react';
import './index.less';

import type { CustomLoadingProps } from '@/custom-table/types';

/**
 * Custom fixed position loading component
 * Solves the issue of loading icon not being in viewport on long pages
 */
const CustomLoading: React.FC<CustomLoadingProps> = ({
  tip = 'Loading...',
}) => (
  <div className="custom-table-loading-wrapper">
    <div className="custom-table-loading-mask" />
    <div className="custom-table-loading-container">
      <Spin size={40} tip={tip} />
    </div>
  </div>
);

export { CustomLoading };
