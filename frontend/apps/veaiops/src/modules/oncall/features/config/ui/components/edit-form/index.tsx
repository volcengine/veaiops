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
import type React from 'react';

import {
  AlertConfig,
  BasicInfo,
  RecognitionConfig,
  RuleTypeConfig,
} from './sections';
import type { EditFormProps } from './types';

/**
 * Edit Form Component
 *
 * Refactoring Notes:
 * - Original branch (feat/web-v2): Contained Alert component in rule-edit-drawer.tsx
 * - Current branch: Refactored with CardWithTitle layout, split into sections
 * - Feature parity: ✅ All features aligned with original branch
 *
 * Component Breakdown:
 * - sections/rule-type-config.tsx: Rule type configuration (action/inspect category) - Create mode only
 * - sections/basic-info.tsx: Basic information (name + description)
 * - sections/alert-config.tsx: Alert configuration (level + silence_delta + inspect_history + is_active)
 * - sections/recognition-config.tsx: Recognition conditions (examples or regex)
 * - index.tsx: Main entry, assembles sections
 */
export const EditForm: React.FC<EditFormProps> = ({
  form,
  inspectCategory,
  currentSilenceDelta,
  rule,
  isEdit,
  onSilenceDeltaChange,
}) => {
  return (
    <Form form={form} layout="vertical" autoComplete="off">
      {/* Rule Type Configuration */}
      <RuleTypeConfig isEdit={isEdit} rule={rule} />

      {/* Basic Information */}
      <BasicInfo isEdit={isEdit} />

      {/* Alert Configuration */}
      <AlertConfig
        currentSilenceDelta={currentSilenceDelta}
        rule={rule}
        onSilenceDeltaChange={onSilenceDeltaChange}
      />

      {/* Recognition Conditions */}
      <RecognitionConfig form={form} inspectCategory={inspectCategory} />
    </Form>
  );
};

export type { EditFormProps } from './types';
