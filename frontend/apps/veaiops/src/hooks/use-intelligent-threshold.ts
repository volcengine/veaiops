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

import { useCallback, useState } from 'react';

/**
 * Task drawer state management Hook
 */
export const useTaskDrawer = () => {
  const [visible, setVisible] = useState(false);
  const [operateType, setOperateType] = useState<
    'create' | 'edit' | 'rerun' | 'versions' | 'results'
  >('create');
  const [record, setRecord] = useState<any>(null);

  const openDrawer = useCallback(
    (type: typeof operateType, taskRecord?: any) => {
      setOperateType(type);
      setRecord(taskRecord || null);
      setVisible(true);
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    setVisible(false);
    setRecord(null);
  }, []);

  return {
    visible,
    operateType,
    record,
    openDrawer,
    closeDrawer,
  };
};

/**
 * Alarm drawer state management Hook
 */
export const useAlarmDrawer = () => {
  const [visible, setVisible] = useState(false);
  const [record, setRecord] = useState<any>(null);

  const openDrawer = useCallback((taskRecord: any) => {
    setRecord(taskRecord);
    setVisible(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setVisible(false);
    setRecord(null);
  }, []);

  return {
    visible,
    record,
    openDrawer,
    closeDrawer,
  };
};
