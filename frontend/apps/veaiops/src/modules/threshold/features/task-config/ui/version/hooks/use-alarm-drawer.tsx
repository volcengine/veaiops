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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskVersion,
} from 'api-generate';
import type React from 'react';
import { useCallback, useState } from 'react';
import { AlarmDrawer } from '../../alarm';
import { AlarmResultModal } from '../../components/alarm-result';

/**
 * Callback function for creating alarm rules
 */
export const useCreateAlarmCallback = (
  setSelectedVersion: (version: IntelligentThresholdTaskVersion | null) => void,
  setAlarmDrawerVisible: (visible: boolean) => void,
) => {
  // Handle create alarm rule
  const handleCreateAlarm = useCallback(
    (version: IntelligentThresholdTaskVersion) => {
      setSelectedVersion(version);
      setAlarmDrawerVisible(true);
    },
    [setSelectedVersion, setAlarmDrawerVisible],
  );

  return {
    handleCreateAlarm,
  };
};

/**
 * Alarm drawer hook - encapsulates alarm drawer state and rendering logic
 */
export const useAlarmDrawer = (
  task: IntelligentThresholdTask | null,
): {
  visible: boolean;
  selectedVersion: IntelligentThresholdTaskVersion | null;
  loading: boolean;
  resultModalVisible: boolean;
  resultData: any;
  open: (version: IntelligentThresholdTaskVersion) => void;
  close: () => void;
  handleSubmit: (values: any) => Promise<any>;
  render: () => React.ReactElement;
} => {
  const [visible, setVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<IntelligentThresholdTaskVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const open = useCallback((version: IntelligentThresholdTaskVersion) => {
    setSelectedVersion(version);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setSelectedVersion(null);
  }, []);

  const closeResultModal = useCallback(() => {
    setResultModalVisible(false);
    setResultData(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        setLoading(true);

        // Call alarm rule sync API
        const response =
          await apiClient.intelligentThresholdAlarm.postApisV1IntelligentThresholdAlarmSync(
            {
              requestBody: values,
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          // Set result data and display result modal
          setResultData(response.data);
          setResultModalVisible(true);
          close();

          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || 'Failed to create alarm rule');
        }
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Failed to create alarm rule';
        logger.error({
          message: 'Failed to create alarm rule',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
            taskId: task?._id,
            version: selectedVersion?.version,
            timestamp: Date.now(),
          },
          source: 'useAlarmDrawer',
          component: 'handleSubmit',
        });
        const fullErrorMessage = `Failed to create alarm rule: ${errorMessage}`;
        Message.error(fullErrorMessage);
        return { success: false, message: fullErrorMessage };
      } finally {
        setLoading(false);
      }
    },
    [task?._id, selectedVersion?.version, close],
  );

  const render = () => (
    <>
      <AlarmDrawer
        visible={visible}
        task={{ ...task, ...selectedVersion } as IntelligentThresholdTask}
        onCancel={close}
        onSubmit={handleSubmit}
        loading={loading}
      />
      <AlarmResultModal
        visible={resultModalVisible}
        data={resultData}
        onClose={closeResultModal}
      />
    </>
  );

  return {
    visible,
    selectedVersion,
    loading,
    resultModalVisible,
    resultData,
    open,
    close,
    handleSubmit,
    render,
  };
};
