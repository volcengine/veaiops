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

// Export main component
export { PasswordForm } from './password-form';

// Export sub-components
export { FormField } from './form-field';
export { FormFieldsList } from './form-fields-list';
export { FormActions } from './form-actions';

// Export other components
export { ModalHeader } from './modal-header';
export { ModalFooter } from './modal-footer';
export { StepStatus } from './step-status';
export { StepContent } from './step-content';
export { useConnectTestModal } from './hooks';

// Export types
export type {
  PasswordFormProps,
  PasswordFormRef,
  FormFieldProps,
  FormFieldsListProps,
  FormActionsProps,
  FormFieldConfig,
} from './types';

// Export configuration
export { FORM_FIELD_CONFIGS } from './config';
