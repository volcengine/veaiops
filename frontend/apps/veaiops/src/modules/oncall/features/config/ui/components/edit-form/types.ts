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

import type { FormInstance } from '@arco-design/web-react';
import type { Interest } from 'api-generate';

/**
 * Edit form component props
 */
export interface EditFormProps {
  form: FormInstance;
  inspectCategory: Interest['inspect_category'] | undefined;
  currentSilenceDelta: string | undefined;
  rule?: Interest;
  onSilenceDeltaChange: (value: string | undefined) => void;
}

/**
 * Example input component props
 */
export interface ExampleInputProps {
  value?: string;
  type: 'positive' | 'negative';
  placeholder?: string;
  onChange?: (value: string) => void;
}
