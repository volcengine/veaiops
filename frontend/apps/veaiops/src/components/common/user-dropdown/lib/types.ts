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

import type { User } from '@veaiops/api-client';

/**
 * User form data (for password change form)
 *
 * Why custom:
 * - Used for form validation and UI interaction, extends API-generated UpdatePasswordRequest type
 * - Contains frontend-specific form fields (e.g., confirm_password for frontend validation)
 *
 * Corresponding API type: UpdatePasswordRequest (from @veaiops/api-client)
 */
export interface UserFormData {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

/**
 * Extended user type (includes frontend additional fields)
 *
 * Why extend:
 * - Frontend needs id field (mapped from _id) and role field (derived from is_supervisor)
 * - Used for local storage and UI display
 */
export type ExtendedUser = Partial<User> & {
  id?: string;
  role?: string;
};
