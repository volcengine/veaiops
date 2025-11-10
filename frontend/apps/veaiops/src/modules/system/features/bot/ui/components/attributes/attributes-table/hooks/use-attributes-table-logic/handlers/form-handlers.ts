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

import type { BotAttributeFormData } from '@bot/types';
import type { BotAttribute } from 'api-generate';
import { useCallback } from 'react';

/**
 * Bot attributes table form handling Hook
 */
export const useAttributesTableFormHandlers = ({
  modalType,
  editingAttribute,
  createAttribute,
  updateAttribute,
  handleCloseModal,
  refreshTable,
}: {
  modalType: 'create' | 'edit';
  editingAttribute: BotAttribute | null;
  createAttribute: (params: {
    name: string;
    values: string[];
  }) => Promise<boolean>;
  updateAttribute: (params: { id: string; value: string }) => Promise<boolean>;
  handleCloseModal: () => void;
  refreshTable: () => Promise<void>;
}) => {
  /**
   * Handle form submission
   *
   * @returns Promise<boolean> - Returns whether the operation was successful, used by caller to determine if table refresh is needed
   */
  const handleFormSubmit = useCallback(
    async (values: BotAttributeFormData): Promise<boolean> => {
      let success = false;

      if (modalType === 'create' && values.value) {
        // Handle multiple selection and single selection cases
        const valuesArray = Array.isArray(values.value)
          ? values.value
          : [values.value];
        success = await createAttribute({
          name: values.name,
          values: valuesArray,
        });
        // ✅ Refresh table after successful creation
        if (success) {
          await refreshTable();
        }
      } else if (
        modalType === 'edit' &&
        editingAttribute?._id &&
        values.value &&
        typeof values.value === 'string' // Only support single value when editing
      ) {
        success = await updateAttribute({
          id: editingAttribute._id,
          value: values.value,
        });
        // ✅ Refresh table after successful update
        if (success) {
          await refreshTable();
        }
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
      refreshTable,
    ],
  );

  return {
    handleFormSubmit,
  };
};
