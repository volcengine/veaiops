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

import { Form } from '@arco-design/web-react';
import type { ThresholdRule } from '@threshold/shared/types/rules';
import { useState } from 'react';

/**
 * Rules page state management Hook
 */
export const useRulesState = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<ThresholdRule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<ThresholdRule | null>(null);
  const [selectedRule, setSelectedRule] = useState<ThresholdRule | null>(null);
  const [form] = Form.useForm();

  return {
    loading,
    setLoading,
    rules,
    setRules,
    modalVisible,
    setModalVisible,
    detailModalVisible,
    setDetailModalVisible,
    editingRule,
    setEditingRule,
    selectedRule,
    setSelectedRule,
    form,
  };
};
