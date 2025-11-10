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

import type { ModalType } from '@bot/types';
import type { BotAttribute } from 'api-generate';
import { useCallback } from 'react';

/**
 * Bot attributes table modal handlers Hook
 */
export const useBotAttributesTableModalHandlers = ({
  setEditingAttribute,
  setIsModalVisible,
  setModalType,
  setViewModalVisible,
  setViewingAttribute,
}: {
  setEditingAttribute: (attribute: BotAttribute | null) => void;
  setIsModalVisible: (visible: boolean) => void;
  setModalType: (type: ModalType) => void;
  setViewModalVisible: (visible: boolean) => void;
  setViewingAttribute: (attribute: BotAttribute | null) => void;
}) => {
  /**
   * Open create modal
   */
  const handleOpenCreateModal = useCallback(() => {
    setModalType('create');
    setEditingAttribute(null);
    setIsModalVisible(true);
  }, [setModalType, setEditingAttribute, setIsModalVisible]);

  /**
   * Close modal
   */
  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setEditingAttribute(null);
  }, [setIsModalVisible, setEditingAttribute]);

  /**
   * Close view modal
   */
  const handleCloseViewModal = useCallback(() => {
    setViewModalVisible(false);
    setViewingAttribute(null);
  }, [setViewModalVisible, setViewingAttribute]);

  return {
    handleOpenCreateModal,
    handleCloseModal,
    handleCloseViewModal,
  };
};
