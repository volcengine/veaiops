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
 * Region input component
 * @description Handles Aliyun/Volcengine Region input
 */

import { Input } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import type React from 'react';
import styles from '../../../datasource-wizard.module.less';
import type { RegionInputProps } from '../types';

const { Link } = CellRender;

export const RegionInput: React.FC<
  RegionInputProps & { provider?: 'aliyun' | 'volcengine' }
> = ({ region, onRegionChange, provider = 'aliyun' }) => {
  const isAliyun = provider === 'aliyun';
  const placeholder = isAliyun
    ? '请输入阿里云 Region ID，例如 cn-hangzhou'
    : '请输入火山引擎 Region ID，例如 cn-beijing';

  const linkUrl = isAliyun
    ? 'https://help.aliyun.com/document_detail/40654.html?spm=5176.21213303.J_ZGek9Blx07Hclc3Ddt9dg.114.53972f3d4BHXcu&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@40654._.ID_help@@%E6%96%87%E6%A1%A3@@40654-RL_%E5%9C%B0%E5%9F%9F%E5%88%97%E8%A1%A8-LOC_2024SPAllResult-OR_ser-PAR1_213e057517606989536807109e6994-V_4-PAR3_o-RE_new5-P0_0-P1_0'
    : 'https://volcengine.com/docs/6534/174392';

  const linkText = isAliyun ? '阿里云地域列表' : '火山引擎地域列表';

  return (
    <div className={styles.searchContainer}>
      <Input
        placeholder={placeholder}
        value={region}
        onChange={onRegionChange}
        allowClear
        addAfter={
          <Link
            link={linkUrl}
            text={linkText}
            linkProps={{ rel: 'noreferrer' }}
          />
        }
      />
    </div>
  );
};
