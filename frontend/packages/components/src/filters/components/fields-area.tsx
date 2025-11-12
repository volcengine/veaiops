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

import type React from 'react';
import { type FC, Fragment } from 'react';
import { commonClassName } from '../core/constants';
import type { FieldItem } from '../core/types';

interface FieldsAreaProps {
  /** 字段配置列表 */
  config: FieldItem[];
  /** 字段渲染器 */
  renderFieldItem: (field: FieldItem) => React.ReactNode;
  /** 操作区域组件 */
  actionsArea?: React.ReactNode;
}

/**
 * 字段区域组件
 * 负责渲染所有的筛选字段
 */
const FieldsArea: FC<FieldsAreaProps> = ({
  config,
  renderFieldItem,
  actionsArea,
}) => {
  // ✅ Silent mode: Remove console output, logs are collected via filterLogger

  return (
    <div className={`${commonClassName} w-full`}>
      {/* 渲染字段列表 */}
      {config.map((item, index) => {
        // 检查字段可见性
        if (item.visible === false) {
          return null;
        }

        const fieldKey = item.field || `field-${index}`;
        const fieldWithKey = {
          ...item,
          field: fieldKey,
        };

        // ✅ Silent mode: Remove console output, logs are collected via filterLogger

        return (
          <Fragment key={fieldKey}>{renderFieldItem(fieldWithKey)}</Fragment>
        );
      })}

      {/* 操作区域 */}
      {actionsArea}
    </div>
  );
};

export { FieldsArea };
export default FieldsArea;
