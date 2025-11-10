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

import { Drawer } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import type React from 'react';
import { RerunFormConfig } from '../forms';

interface MetricConfigDrawerProps {
  visible: boolean;
  form: FormInstance;
  onCancel: () => void;
}

/**
 * Metric template configuration drawer component
 * Displays simplified configuration information: threshold direction, sliding window, normal start value, normal end value
 */
export const MetricConfigDrawer: React.FC<MetricConfigDrawerProps> = ({
  visible,
  form,
  onCancel,
}) => {
  return (
    <Drawer
      width={800}
      title="指标模版配置"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      focusLock={false}
    >
      <RerunFormConfig form={form} readOnly={true} />
    </Drawer>
  );
};

export default MetricConfigDrawer;
