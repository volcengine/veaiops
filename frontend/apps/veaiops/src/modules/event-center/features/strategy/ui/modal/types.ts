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
import type {
  InformStrategy,
  InformStrategyCreate,
  InformStrategyUpdate,
} from 'api-generate';

/**
 * Strategy modal component props interface
 *
 * Type analysis (based on Python source code three-way comparison):
 * - editingStrategy receives InformStrategy (API response format)
 * - Form internally converts to format containing bot_id and chat_ids via adaptStrategyForEdit
 * - Uses InformStrategyCreate or InformStrategyUpdate (API request format) when submitting
 */
export interface StrategyModalProps {
  visible: boolean;
  // ✅ Unified use of InformStrategy (api-generate), conforms to single data source principle
  editingStrategy: InformStrategy | null;
  onCancel: () => void;
  onSubmit: (
    values: InformStrategyCreate | InformStrategyUpdate,
  ) => Promise<boolean>;
  form: FormInstance;
  /**
   * Drawer width, defaults to 800px
   */
  width?: number;
}
