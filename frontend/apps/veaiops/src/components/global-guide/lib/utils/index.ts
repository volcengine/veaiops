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
 * GlobalGuide utility functions unified export
 *
 * Architecture notes (conforms to .cursorrules Feature-Based architecture):
 * - types.ts - Type definitions (Window interface extensions, StepIssue, etc.)
 * - issues.ts - Step issue checking
 * - progress.ts - Step progress retrieval
 * - diagnostics.ts - Diagnostic functionality (localStorage and DOM checking)
 * - debug.ts - Debug commands (step click, URL state, etc.)
 * - commands.ts - Console command registration (entry function)
 * - wait.ts - Element wait utility (original element-wait.ts)
 * - log-collector.ts - Log collector (original global-guide-log-collector.ts)
 */

// Export type definitions
export type { GlobalGuideStore, StepIssue } from './types';

// Export step-related functionality
export { getCurrentStepIssues } from './issues';
export { getCurrentProgressStep } from './progress';

// Export diagnostic functionality
export {
  analyzeGlobalGuide,
  exportAllGlobalGuideLogs,
  quickDiagnoseGlobalGuide,
} from './diagnostics';

// Export debug commands
export {
  createDebugStepClickCommand,
  debugUrlState,
} from './debug';
export type { DebugStepClickParams } from './debug';

// Export console command registration (main entry function)
export { registerConsoleCommands } from './commands';

// Export element wait utility
export * from './wait';

// Export log collector
export * from './log-collector';
