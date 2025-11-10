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
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';

/**
 * Subscribe relation form component props
 */
export interface SubscribeRelationFormProps {
  /** Whether the drawer is visible */
  visible: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
  /** Callback to submit the form */
  onSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
  /** Edit subscription relation data, null means create new */
  editData?: SubscribeRelationWithAttributes | null;
  /** Form title */
  title?: string;
  /** Module type, used to determine which Agent options to display */
  moduleType?: ModuleType;
  /** Whether to show project import tooltip */
  showProjectTooltip?: boolean;
  /** Whether to show strategy creation tooltip */
  showStrategyTooltip?: boolean;
  /** Callback to hide project tooltip */
  hideProjectTooltip?: () => void;
  /** Callback to hide strategy tooltip */
  hideStrategyTooltip?: () => void;
}
