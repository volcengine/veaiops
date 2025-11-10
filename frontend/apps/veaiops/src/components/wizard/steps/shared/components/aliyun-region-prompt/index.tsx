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
 * Aliyun Region prompt component
 * @description Used to prompt users that Region must be filled after selecting Aliyun metric
 */
export const AliyunRegionPrompt: React.FC = () => {
  return (
    <div>
      <p>选择阿里云监控项后，必须填写 Region 才能继续下一步。</p>
      <p>
        例如：<code>cn-hangzhou</code>，可参考
        <Link
          href="https://help.aliyun.com/document_detail/40654.html?spm=5176.21213303.J_ZGek9Blx07Hclc3Ddt9dg.114.53972f3d4BHXcu&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@40654._.ID_help@@%E6%96%87%E6%A1%A3@@40654-RL_%E5%9C%B0%E5%9F%9F%E5%88%97%E8%A1%A8-LOC_2024SPAllResult-OR_ser-PAR1_213e057517606989536807109e6994-V_4-PAR3_o-RE_new5-P0_0-P1_0"
          rel="noreferrer"
          target="_blank"
        >
          阿里云地域列表
        </Link>
        。
      </p>
    </div>
  );
};
