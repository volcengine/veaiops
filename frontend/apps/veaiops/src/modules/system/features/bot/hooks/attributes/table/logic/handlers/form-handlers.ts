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

import type { BotAttributeFormData, ModalType } from '@bot/types';
import type { BotAttribute } from 'api-generate';
import { useCallback } from 'react';

/**
 * Bot attribute table form handler Hook
 */
export const useBotAttributesTableFormHandlers = ({
  modalType,
  editingAttribute,
  createAttribute,
  updateAttribute,
  handleCloseModal,
}: {
  modalType: ModalType;
  editingAttribute: BotAttribute | null;
  createAttribute: (params: {
    name: string;
    values: string[];
  }) => Promise<boolean>;
  updateAttribute: (params: { id: string; value: string }) => Promise<boolean>;
  handleCloseModal: () => void;
}) => {
  /**
   * Handle form submission
   * Note: Table refresh logic is handled by caller, only return success status here
   */
  const handleFormSubmit = useCallback(
    async (values: BotAttributeFormData) => {
      let success = false;

      if (modalType === 'create' && values.value) {
        // Handle multi-select and single-select cases
        const valuesArray = Array.isArray(values.value)
          ? values.value
          : [values.value];
        success = await createAttribute({
          name: values.name,
          values: valuesArray,
        });
      } else if (
        modalType === 'edit' &&
        editingAttribute?._id &&
        values.value &&
        typeof values.value === 'string' // Edit mode only supports single value
      ) {
        success = await updateAttribute({
          id: editingAttribute._id,
          value: values.value,
        });
      }

      if (success) {
        handleCloseModal();
      }

      return success;
    },
    [
      modalType,
      editingAttribute,
      createAttribute,
      updateAttribute,
      handleCloseModal,
    ],
  );

  return {
    handleFormSubmit,
  };
};
