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
 * Card template management guide page
 */

import { Modal } from '@arco-design/web-react';
import type React from 'react';
import StepCard from './step-card';

interface CardTemplateGuideProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Card template management guide component
 */
export const CardTemplateGuide: React.FC<CardTemplateGuideProps> = ({
  visible,
  onClose,
  onComplete: _onComplete,
}) => {
  return (
    <Modal
      title="消息卡片模版管理创建引导"
      visible={visible}
      onCancel={onClose}
      footer={null}
      style={{ width: 1000, maxHeight: '80vh' }}
    >
      <StepCard onClose={onClose} />
    </Modal>
  );
};
