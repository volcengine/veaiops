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

import { GlobalGuideStepNumber } from '../../enums/guide-steps.enum';
import {
  createDebugStepClickCommand,
  debugUrlState,
  exportGlobalGuideLogs,
} from './debug';
import {
  analyzeGlobalGuide,
  exportAllGlobalGuideLogs,
  quickDiagnoseGlobalGuide,
} from './diagnostics';
import './types'; // Import Window interface extension

/**
 * Register console debug commands
 *
 * Register to global window object for developers to use in browser console
 *
 * @param handleStepClick - Step click handler function
 * @returns Cleanup function
 */
export const registerConsoleCommands = (
  handleStepClick: (stepNumber: number) => void,
): (() => void) => {
  // Register log export and diagnosis commands
  window.exportAllGlobalGuideLogs = exportAllGlobalGuideLogs;
  window.quickDiagnoseGuide = quickDiagnoseGlobalGuide;
  window.analyzeGlobalGuide = analyzeGlobalGuide;

  // Register step debug commands
  window.debugStep1Click = createDebugStepClickCommand({
    handleStepClick,
    stepNumber: GlobalGuideStepNumber.CONNECTION,
    stepName: '第一步',
  });

  window.debugStep2Click = createDebugStepClickCommand({
    handleStepClick,
    stepNumber: GlobalGuideStepNumber.DATASOURCE,
    stepName: '第二步',
  });

  // Register other debug commands
  window.debugUrlState = debugUrlState;
  window.exportGlobalGuideLogs = exportGlobalGuideLogs;

  // Return cleanup function
  return () => {
    // Remove global methods on cleanup
    delete window.exportAllGlobalGuideLogs;
    delete window.quickDiagnoseGuide;
    delete window.analyzeGlobalGuide;
    delete window.debugStep1Click;
    delete window.debugStep2Click;
    delete window.debugUrlState;
    delete window.exportGlobalGuideLogs;
  };
};
