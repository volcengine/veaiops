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

import type { ModuleType } from '@/types/module';
import type { CustomTableActionType } from '@veaiops/components';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import {
  SubscriptionModal,
  SubscriptionTable,
  useSubscriptionManagementLogic,
} from '../features/subscription';

/**
 * Event subscription page props
 */
interface EventSubscriptionPageProps {
  /** Module type (for filtering agent options) */
  moduleType?: ModuleType;
}

/**
 * Event subscription page
 *
 * @description Unified event subscription management page, supports different module types
 * - Event center: displays "Content Recognition Agent" + "Intelligent Threshold Agent"
 * - Oncall changes: only displays "Content Recognition Agent"
 *
 * Features:
 * - Agent filtering (displays different options based on module type)
 * - Event level filtering (P0/P1/P2/P3)
 * - WEBHOOK toggle and address configuration
 * - Effective time range setting
 * - Complete CRUD operations
 *
 * Consistent with origin/feat/web-v2:
 * - Uses SubscriptionTable component (displays "Event Subscription")
 * - Uses SubscriptionModal component (form modal)
 * - Uses useSubscriptionManagementLogic Hook (business logic)
 */
const EventSubscriptionPage: React.FC<EventSubscriptionPageProps> = ({
  moduleType,
}) => {
  // Table component ref (for accessing refresh function)
  const tableRef = useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

  // 🔍 Track callback reference changes (for debugging)
  const prevHandleEditRef = useRef<unknown>(null);
  const prevHandleDeleteRef = useRef<unknown>(null);
  const prevHandleAddRef = useRef<unknown>(null);

  // Wrap refresh function, ensure returns Promise<boolean>
  // ✅ Fix: useSubscriptionManagementLogic expects () => Promise<boolean>
  // But tableRef.current?.refresh?.() returns Promise<void> | undefined
  const refreshTable = useCallback(async (): Promise<boolean> => {
    try {
      await tableRef.current?.refresh?.();
      return true;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to refresh table',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'EventSubscriptionPage',
        component: 'refreshTable',
      });
      return false;
    }
  }, []);

  // Use subscription management logic Hook
  const {
    modalVisible,
    editingSubscription,
    // form is unused, but returned by useSubscriptionManagementLogic, keep for interface consistency
    form: _form,
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  } = useSubscriptionManagementLogic(refreshTable);

  // 🔍 Track handleEdit reference changes
  useEffect(() => {
    if (prevHandleEditRef.current !== handleEdit) {
      logger.debug({
        message: '[EventSubscriptionPage] handleEdit reference changed',
        data: {
          prevHandleEdit: prevHandleEditRef.current,
          currentHandleEdit: handleEdit,
        },
        source: 'EventSubscriptionPage',
        component: 'useEffect',
      });
      prevHandleEditRef.current = handleEdit;
    }
  }, [handleEdit]);

  // 🔍 Track handleDelete reference changes
  useEffect(() => {
    if (prevHandleDeleteRef.current !== handleDelete) {
      logger.debug({
        message: '[EventSubscriptionPage] handleDelete reference changed',
        data: {
          prevHandleDelete: prevHandleDeleteRef.current,
          currentHandleDelete: handleDelete,
        },
        source: 'EventSubscriptionPage',
        component: 'useEffect',
      });
      prevHandleDeleteRef.current = handleDelete;
    }
  }, [handleDelete]);

  // 🔍 Track handleAdd reference changes
  useEffect(() => {
    if (prevHandleAddRef.current !== handleAdd) {
      logger.debug({
        message: '[EventSubscriptionPage] handleAdd reference changed',
        data: {
          prevHandleAdd: prevHandleAddRef.current,
          currentHandleAdd: handleAdd,
        },
        source: 'EventSubscriptionPage',
        component: 'useEffect',
      });
      prevHandleAddRef.current = handleAdd;
    }
  }, [handleAdd]);

  // 🔍 Log modalVisible changes (changes when clicking add subscription)
  useEffect(() => {
    logger.debug({
      message: '[EventSubscriptionPage] modalVisible changed',
      data: {
        modalVisible,
        hasEditingSubscription: Boolean(editingSubscription),
      },
      source: 'EventSubscriptionPage',
      component: 'useEffect',
    });
  }, [modalVisible, editingSubscription]);

  // View subscription details (reserved feature)
  // Note: Detail drawer feature not yet implemented, only logs here
  const handleView = useCallback(
    (subscription: SubscribeRelationWithAttributes) => {
      logger.debug({
        message: 'View subscription details (feature to be implemented)',
        data: {
          subscriptionId: subscription._id,
          subscription,
        },
        source: 'EventSubscriptionPage',
        component: 'handleView',
      });
    },
    [],
  );

  return (
    <>
      {/* Event subscription table */}
      <SubscriptionTable
        ref={tableRef}
        moduleType={moduleType}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onView={handleView}
      />

      {/* Subscription form modal */}
      <SubscriptionModal
        visible={modalVisible}
        initialData={editingSubscription}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        moduleType={moduleType}
        title={editingSubscription ? 'Edit Subscription' : 'New Subscription'}
      />

      {/* TODO: Detail drawer - can be added if needed */}
      {/* <SubscriptionDetailDrawer
        visible={detailVisible}
        data={viewingSubscription}
        onClose={handleDetailClose}
      /> */}
    </>
  );
};

export default EventSubscriptionPage;
