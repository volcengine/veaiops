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
 * GlobalGuide utility type definitions
 */

/**
 * localStorage stored data structure
 */
export interface GlobalGuideStore {
  state?: {
    guideVisible?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Step issue type
 */
export interface StepIssue {
  type: string;
  message: string;
  action: string;
}

/**
 * Window interface extension - GlobalGuide debug commands
 *
 * Why extend Window interface:
 * - Need to register debug commands on global window object for developers to use in browser console
 * - TypeScript requires explicit type definitions, avoid using (window as any)
 * - Complies with .cursorrules type safety standards
 */
declare global {
  interface Window {
    // GlobalGuide log export
    exportAllGlobalGuideLogs?: (filename?: string) => void;
    // Quick diagnosis
    quickDiagnoseGuide?: () => void;
    // Comprehensive analysis
    analyzeGlobalGuide?: () => void;
    // Debug step 1 click
    debugStep1Click?: () => void;
    // Debug step 2 click
    debugStep2Click?: () => void;
    // Debug URL state
    debugUrlState?: () => void;
    // Export GlobalGuide logs
    exportGlobalGuideLogs?: () => void;
  }
}
