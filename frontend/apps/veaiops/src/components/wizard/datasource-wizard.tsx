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
 * Data source creation wizard component - refactored version
 * @description Supports creation flow for three data source types: Zabbix, Aliyun, and Volcengine, using modular component structure
 * @author AI Assistant
 * @date 2025-01-15
 */

import { Button, Drawer, Space, Typography } from '@arco-design/web-react';
import { IconClose, IconLeft, IconRight } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  StepContent,
  StepIndicator,
  TypeSelection,
  useWizardController,
} from './components';
import styles from './datasource-wizard.module.less';
import { useDataSourceWizard } from './hooks/state/use-datasource-wizard';
import type { DataSourceType } from './types';
import { WizardStep } from './types';
import { prefillDataSourceConfig } from './utils/data/prefill';
import { getStepProgressText } from './utils/wizard-logic';

const { Text } = Typography;

export interface DataSourceWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (dataSource: unknown) => void;
  editingDataSource?: any; // Data source being edited (for edit mode)
}

export const DataSourceWizard: React.FC<DataSourceWizardProps> = ({
  visible,
  onClose,
  onSuccess: _onSuccess,
  editingDataSource,
}) => {
  // Only log key fields to avoid circular references
  logger.info({
    message: '🎨 DataSourceWizard component rendering',
    data: {
      visible,
      editingDataSourceId: editingDataSource?._id || editingDataSource?.id,
      editingDataSourceName: editingDataSource?.name,
      editingDataSourceType: editingDataSource?.type,
    },
    source: 'DataSourceWizard',
    component: 'render',
  });

  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [hasInitializedEditMode, setHasInitializedEditMode] = useState(false);
  const { state, actions } = useDataSourceWizard();

  // Monitor component mount and unmount
  useEffect(() => {
    logger.info({
      message: '✨ DataSourceWizard mounted',
      data: {},
      source: 'DataSourceWizard',
      component: 'mount',
    });
    return () => {
      logger.info({
        message: '💥 DataSourceWizard unmounting',
        data: {},
        source: 'DataSourceWizard',
        component: 'unmount',
      });
    };
  }, []);

  // Monitor visible prop changes
  useEffect(() => {
    logger.info({
      message: '📊 visible prop changed',
      data: {
        visible,
        timestamp: new Date().toISOString(),
      },
      source: 'DataSourceWizard',
      component: 'visible-effect',
    });

    if (visible) {
      logger.info({
        message: '🔓 Drawer is opening',
        data: {},
        source: 'DataSourceWizard',
        component: 'visible-effect',
      });
    } else {
      logger.info({
        message: '🔒 Drawer is closing',
        data: {},
        source: 'DataSourceWizard',
        component: 'visible-effect',
      });
    }
  }, [visible]);

  // Monitor selectedType changes
  useEffect(() => {
    logger.info({
      message: '📑 selectedType changed',
      data: { selectedType },
      source: 'DataSourceWizard',
      component: 'selectedType-effect',
    });
  }, [selectedType]);

  // Monitor state.currentStep changes
  useEffect(() => {
    logger.info({
      message: '📍 currentStep changed',
      data: { currentStep: state.currentStep },
      source: 'DataSourceWizard',
      component: 'currentStep-effect',
    });
  }, [state.currentStep]);

  // Use wizard controller
  const {
    handleTypeSelect,
    handleNext,
    handlePrev,
    canProceedToNext,
    getNextButtonText,
    getPrevButtonText,
    shouldShowPrevButton,
    CreationConfirmModalComponent,
  } = useWizardController({
    selectedType,
    setSelectedType,
    state,
    actions,
    onClose,
    onSuccess: _onSuccess,
    editingDataSource,
  });

  // Handle edit mode initialization
  useEffect(() => {
    if (visible && editingDataSource && !hasInitializedEditMode) {
      // Edit mode: automatically set data source type and enter first step
      // Convert type to lowercase to match DataSourceType enum value
      const dataSourceType =
        editingDataSource.type?.toLowerCase() as DataSourceType;

      setSelectedType(dataSourceType);
      actions.setDataSourceType(dataSourceType);

      // In edit mode, directly jump to first step so user can see and modify configuration
      actions.setCurrentStep(WizardStep.FIRST_STEP);

      // Reset prefill flag
      setHasPrefilled(false);

      // Mark edit mode as initialized
      setHasInitializedEditMode(true);

      actions.setEditingDataSourceId(
        editingDataSource._id || editingDataSource.id,
      );

      // Prefill data source name
      if (editingDataSource.name) {
        actions.setDataSourceName(editingDataSource.name);
      }

      // Prefill data source description
      if (editingDataSource.description) {
        actions.setDataSourceDescription(editingDataSource.description);
      }

      // Edit mode also needs to load connection list

      actions.fetchConnects(dataSourceType).catch((_error) => {
        // Ignore connection fetch errors
      });
    } else if (
      visible &&
      !editingDataSource &&
      state.currentStep === WizardStep.TYPE_SELECTION &&
      !selectedType
    ) {
      // Only reset state when wizard is fully closed and reopened
      // Avoid accidentally resetting during user operations

      actions.resetWizard();
      setSelectedType(null);
      setHasPrefilled(false);
      setHasInitializedEditMode(false);
    }
  }, [
    visible,
    editingDataSource,
    state.currentStep,
    selectedType,
    hasInitializedEditMode,
  ]); // Variables used in dependency check conditions

  // Prefill configuration data (after connection list is loaded)
  useEffect(() => {
    if (
      visible &&
      editingDataSource &&
      state.connects.length > 0 &&
      state.currentStep === WizardStep.FIRST_STEP &&
      !hasPrefilled
    ) {
      prefillDataSourceConfig(editingDataSource, actions, state);
      setHasPrefilled(true);
    }
  }, [
    visible,
    editingDataSource,
    state.connects.length,
    state.currentStep,
    hasPrefilled,
  ]);

  // Prevent accidental keyboard events triggering button clicks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // If user presses Enter key during type selection stage, don't automatically proceed to next step
      if (
        event.key === 'Enter' &&
        state.currentStep === WizardStep.TYPE_SELECTION &&
        selectedType &&
        visible
      ) {
        event.preventDefault();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedType, state.currentStep, visible]);

  // Drawer component callback function for handling keyboard events

  const handleDrawerKeyDown = (event: React.KeyboardEvent) => {
    // Check if event is triggered by Drawer component itself and handle Enter key
    if (
      event.key === 'Enter' &&
      state.currentStep === WizardStep.TYPE_SELECTION &&
      selectedType &&
      visible
    ) {
      event.preventDefault();
    }
  };

  // Handle close event
  const handleClose = useCallback(() => {
    logger.info({
      message: '🚪 handleClose called - Drawer onCancel triggered',
      data: {
        currentState: {
          selectedType,
          currentStep: state.currentStep,
          dataSourceType: state.dataSourceType,
        },
      },
      source: 'DataSourceWizard',
      component: 'handleClose',
    });
    onClose();
    logger.info({
      message: '✅ onClose() executed',
      data: {},
      source: 'DataSourceWizard',
      component: 'handleClose',
    });
  }, [onClose, state.currentStep, selectedType, state.dataSourceType]);

  // Handle cleanup work after drawer is fully closed (Arco Design Drawer's afterClose callback)
  const handleAfterClose = useCallback(() => {
    logger.info({
      message: '🧹 handleAfterClose called - Drawer afterClose triggered',
      data: {},
      source: 'DataSourceWizard',
      component: 'handleAfterClose',
    });

    // Reset all local state
    setSelectedType(null);
    setHasPrefilled(false);
    setHasInitializedEditMode(false);

    // Reset wizard state (including all step data, selections, etc.)
    actions.resetWizard();
    logger.info({
      message: '✅ Wizard state reset completed',
      data: {},
      source: 'DataSourceWizard',
      component: 'handleAfterClose',
    });
  }, [actions]);

  const footerContent = (
    <div className={styles.wizardFooter}>
      <div className={styles.footerLeft}>
        <Space>
          {shouldShowPrevButton() && (
            <Button onClick={handlePrev} icon={<IconLeft />}>
              {getPrevButtonText()}
            </Button>
          )}
        </Space>
      </div>

      <div className={styles.footerRight}>
        <Space>
          {selectedType && state.currentStep >= 0 && (
            <Text type="secondary" className={styles.stepIndicator}>
              {getStepProgressText(selectedType, state.currentStep)}
            </Text>
          )}
          <Button
            type="primary"
            disabled={!canProceedToNext()}
            onClick={handleNext}
            title={
              !selectedType ? 'Please select a data source type first' : ''
            }
            className={styles.wizardButton}
          >
            {getNextButtonText()}
            <IconRight style={{ marginLeft: 4 }} />
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        width={1200}
        title={
          editingDataSource
            ? 'Edit Monitoring Data Source'
            : 'Add Monitoring Data Source'
        }
        visible={visible}
        onCancel={handleClose}
        afterClose={handleAfterClose}
        footer={footerContent}
        closable
        maskClosable={false}
        escToExit
        className={styles.dataSourceWizard}
        closeIcon={<IconClose />}
        unmountOnExit
        focusLock={false}
      >
        <div className={styles.wizardContainer}>
          {/* Step indicator */}
          {selectedType && state.currentStep >= WizardStep.FIRST_STEP && (
            <StepIndicator
              selectedType={selectedType}
              currentStep={state.currentStep}
            />
          )}

          {/* Step content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {selectedType && state.currentStep >= WizardStep.FIRST_STEP ? (
              <StepContent
                selectedType={selectedType}
                currentStep={state.currentStep}
                state={state}
                actions={actions}
              />
            ) : (
              <TypeSelection
                selectedType={selectedType}
                onTypeSelect={handleTypeSelect}
              />
            )}
          </div>
        </div>
      </Drawer>

      {/* Creation confirmation modal */}
      {CreationConfirmModalComponent}
    </>
  );
};

export default DataSourceWizard;
