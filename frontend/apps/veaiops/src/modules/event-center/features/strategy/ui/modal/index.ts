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
 * Strategy modal component unified export
 *
 * Directory structure:
 * - component.tsx  - Main component (101 lines)
 * - hooks/         - Business logic Hooks
 * - sections/      - UI block components
 * - types.ts       - Type definitions
 */

// ✅ Main component
export { default, StrategyModal } from './component';

// ✅ Type definitions
export type { StrategyModalProps } from './types';

// ✅ Hooks (optional export, for external use)
export { useFormLogic, type UseFormLogicResult } from './hooks';

// ✅ Block components (optional export, for external use)
export {
  CardTemplateConfigMessage,
  FormFields,
  TopAlert,
  WarningAlert,
  type FormFieldsProps,
  type TopAlertProps,
  type WarningAlertProps,
} from './sections';
