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
import type { OperationType } from '@task-config/lib';
import { DrawerFormContent, logger } from '@veaiops/utils';
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskVersion,
} from 'api-generate';
import type React from 'react';
import { useEffect } from 'react';
import { getDrawerTitle, getDrawerWidth, isFormOperation } from '../../utils';
import { TaskDrawerTitle } from '../displays';
import { TaskDrawerContent } from './drawer-content';
import { TaskDrawerFooter } from './drawer-footer';

interface MainTaskDrawerProps {
  visible: boolean;
  operationType: OperationType;
  editingTask: IntelligentThresholdTask | null;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  form: FormInstance;
  loading: boolean;
  versions: IntelligentThresholdTaskVersion[];
  versionsLoading: boolean;
  setDetailConfigData: (data: any) => void;
  setDetailConfigVisible: (visible: boolean) => void;
  onViewCleaningResult: (version: IntelligentThresholdTaskVersion) => void;
}

/**
 * Main task drawer component
 */
export const MainTaskDrawer: React.FC<MainTaskDrawerProps> = ({
  visible,
  operationType,
  editingTask,
  onCancel,
  onSubmit,
  form,
  loading,
  versions,
  versionsLoading,
  setDetailConfigData,
  setDetailConfigVisible,
  onViewCleaningResult,
}) => {
  // Monitor loading state changes
  useEffect(() => {
    logger.info({
      message: '[MainTaskDrawer] Loading 状态变化',
      data: {
        loading,
        operationType,
        visible,
      },
      source: 'MainTaskDrawer',
      component: 'useEffect',
    });
  }, [loading, operationType, visible]);

  return (
    <Drawer
      width={getDrawerWidth(operationType)}
      title={
        operationType === 'detail' ? (
          <TaskDrawerTitle titleType="task-detail" taskRecord={editingTask} />
        ) : (
          getDrawerTitle(operationType)
        )
      }
      visible={visible}
      onCancel={onCancel}
      maskClosable={!loading}
      focusLock={false}
      footer={
        operationType === 'detail' ? null : (
          <TaskDrawerFooter
            operationType={operationType}
            loading={loading}
            form={form}
            onCancel={onCancel}
          />
        )
      }
    >
      <DrawerFormContent
        loading={Boolean(loading) && isFormOperation(operationType)}
      >
        <TaskDrawerContent
          operationType={operationType}
          editingTask={editingTask}
          form={form}
          loading={loading}
          onSubmit={onSubmit}
          versions={versions}
          versionsLoading={versionsLoading}
          setDetailConfigData={setDetailConfigData}
          setDetailConfigVisible={setDetailConfigVisible}
          onViewCleaningResult={onViewCleaningResult}
        />
      </DrawerFormContent>
    </Drawer>
  );
};

export default MainTaskDrawer;
