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
// Directly use API-generated Customer type
import type { Customer } from 'api-generate';

// Customer table component ref type
// Use CustomTableActionType as base type to ensure type compatibility
import type {
  BaseQuery,
  BaseRecord,
  CustomTableActionType,
} from '@veaiops/components';

// Re-export Customer type for easy use in other files
export type { Customer } from 'api-generate';

// Customer table data type - directly use API-generated type
export type CustomerTableData = Customer;

// Customer form data interface - for form data when creating customers
export interface CustomerFormData {
  customer_id: string;
  name: string;
  desensitized_name?: string;
  is_active?: boolean;
}

// Customer table component properties
export interface CustomerTableProps {
  onDelete?: (customerId: string) => Promise<boolean>;
  onImport?: () => void;
}

// Use specific Customer type instead of BaseRecord to ensure type safety
export type CustomerTableRef = CustomTableActionType<Customer, BaseQuery>;

// Customer modal component properties
export interface CustomerModalProps {
  visible: boolean;
  editingCustomer: CustomerTableData | null;
  onCancel: () => void;
  onSubmit: (data: CustomerFormData) => Promise<boolean>;
  form: FormInstance;
}

// Customer import drawer component properties
export interface CustomerImportDrawerProps {
  visible: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<boolean>;
  uploading: boolean;
}
