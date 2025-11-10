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
 * Data source wizard utility functions unified export
 * @description Provides all wizard-related utility functions, now organized by functional modules
 * @author AI Assistant
 * @date 2025-01-19
 */

// Initialize log collection
import { exportLogsToFile, startLogCollection } from '@veaiops/utils';

// Start log collection
startLogCollection();

// Add global log export function to window object for debugging convenience
if (typeof window !== 'undefined') {
  (window as any).exportDataSourceWizardLogs = () => {
    exportLogsToFile('datasource-wizard-debug.log');
  };
}

// ============================================================================
// Step-related functionality
// ============================================================================
export * from './steps';

// ============================================================================
// Data processing functionality
// ============================================================================
export * from './data';

// ============================================================================
// Validation functionality
// ============================================================================
export * from './validation';

// ============================================================================
// Error handling
// ============================================================================
export * from './error-handling';
