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

import { Link } from '@arco-design/web-react';
import type React from 'react';

/**
 * Volcengine Region prompt component
 * @description Used to prompt users that Region must be filled after selecting Volcengine metric
 */
export const VolcengineRegionPrompt: React.FC = () => {
  return (
    <div>
      <p>选择火山引擎监控项后，必须填写 Region 才能继续下一步。</p>
      <p>
        例如：<code>cn-beijing</code>，可参考
        <Link
          href="https://www.volcengine.com/docs/6396/143609"
          rel="noreferrer"
          target="_blank"
        >
          火山引擎地域列表
        </Link>
        。
      </p>
    </div>
  );
};
