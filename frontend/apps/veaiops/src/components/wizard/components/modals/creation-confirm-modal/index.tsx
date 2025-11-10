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
 * CreationConfirmModal - Data source creation confirmation modal (entry file)
 * @description Extracts UI and logic of "create data source" confirmation modal to improve wizard-controller readability
 */

import { Modal } from '@arco-design/web-react';
import type React from 'react';
import type {
  DataSourceType,
  StepConfig,
  WizardActions,
  WizardState,
} from '../../../types';
import { ModalContent } from './modal-content';
import { useModalHandlers } from './use-modal-handlers';
import { getDataSourceTypeText } from './utils';

export interface CreationConfirmModalProps {
  visible: boolean;
  selectedType: DataSourceType;
  currentStepConfig: StepConfig;
  state: WizardState;
  actions: WizardActions;
  onClose: () => void;
  onConfirm: (dataSource?: unknown) => void;
  editingDataSource?: any;
}

/**
 * Data source creation confirmation modal component
 */
export const CreationConfirmModal: React.FC<CreationConfirmModalProps> = ({
  visible,
  selectedType,
  currentStepConfig,
  state,
  actions,
  onClose,
  onConfirm,
  editingDataSource,
}) => {
  const dataSourceTypeText = getDataSourceTypeText(selectedType);

  const { handleOk, handleCancel } = useModalHandlers({
    selectedType,
    currentStepConfig,
    state,
    actions,
    onClose,
    onConfirm,
    editingDataSource,
  });

  return (
    <Modal
      title={editingDataSource ? '确认更新数据源' : '确认创建数据源'}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
      style={{ width: 720 }}
    >
      <ModalContent
        state={state}
        selectedType={selectedType}
        dataSourceTypeText={dataSourceTypeText}
        isEditMode={Boolean(editingDataSource)}
      />
    </Modal>
  );
};

export default CreationConfirmModal;
