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

import type {
  Connect,
  ConnectCreateRequest,
  DataSourceType,
} from 'api-generate';

// Form field configuration type
export interface FormFieldConfig {
  label: string;
  field: string;
  placeholder: string;
  isPassword?: boolean;
  autoFocus?: boolean;
}

// Form field component props
export interface FormFieldProps {
  config: FormFieldConfig;
  disabled?: boolean;
  initialValue?: string;
}

// Form fields list component props
export interface FormFieldsListProps {
  connectType: DataSourceType;
  connect?: Connect;
  disabledFields?: string[];
}

// Password form component props
export interface PasswordFormProps {
  connectType: DataSourceType;
  connect?: Connect;
  onSubmit: (params: Partial<ConnectCreateRequest>) => void;
  onCancel: () => void;
  loading?: boolean;
  showButtons?: boolean;
}

// Password form component ref
export interface PasswordFormRef {
  submit: () => void;
}

// Form action buttons component props
export interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
}
