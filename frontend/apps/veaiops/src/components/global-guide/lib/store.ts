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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { GlobalGuideStepNumber } from '../enums/guide-steps.enum';

export type StepStatus = 'pending' | 'active' | 'completed' | 'error';
export type PlatformType = 'volcengine' | 'zabbix' | 'aliyun';

export interface UserProgress {
  connection?: {
    isHealthy: boolean;
    lastChecked?: string;
    issues?: string[];
  };
  datasource?: {
    isValid: boolean;
    type?: PlatformType;
    config?: Record<string, any>;
  };
  metricModel?: {
    isComplete: boolean;
    modelId?: string;
    dimensions?: Record<string, any>;
  };
  metric?: {
    isValid: boolean;
    previewData?: any[];
    quality?: {
      coverage: number;
      gapRate: number;
    };
  };
  task?: {
    isTrained: boolean;
    taskId?: string;
    version?: number;
    results?: any[];
  };
  injection?: {
    isSimulated: boolean;
    platforms?: PlatformType[];
    strategy?: Record<string, any>;
  };
}

export interface GlobalGuideState {
  // Current step
  currentStep: GlobalGuideStepNumber;

  // Step status map
  stepStatusMap: Record<GlobalGuideStepNumber, StepStatus>;

  // Platform selection
  platformSelection: PlatformType | null;

  // Last visited route
  lastVisitedRoute: string;

  // User progress
  userProgress: UserProgress;

  // Whether side guide panel is visible
  sideGuidePanelVisible: boolean;

  // Whether panel content is visible
  panelContentVisible: boolean;

  // Actions
  updateCurrentStep: (step: GlobalGuideStepNumber) => void;
  updateStepStatus: (step: GlobalGuideStepNumber, status: StepStatus) => void;
  updatePlatformSelection: (platform: PlatformType) => void;
  updateLastVisitedRoute: (route: string) => void;
  updateUserProgress: (progress: Partial<UserProgress>) => void;
  setSideGuidePanelVisible: (visible: boolean) => void;
  setPanelContentVisible: (visible: boolean) => void;
  resetGuide: () => void;
}

const initialState: Omit<
  GlobalGuideState,
  keyof Pick<
    GlobalGuideState,
    | 'updateCurrentStep'
    | 'updateStepStatus'
    | 'updatePlatformSelection'
    | 'updateLastVisitedRoute'
    | 'updateUserProgress'
    | 'setSideGuidePanelVisible'
    | 'setPanelContentVisible'
    | 'resetGuide'
  >
> = {
  currentStep: GlobalGuideStepNumber.CONNECTION,
  stepStatusMap: {
    [GlobalGuideStepNumber.CONNECTION]: 'active' as StepStatus, // First step is active by default
    [GlobalGuideStepNumber.DATASOURCE]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.TEMPLATE]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.METRIC_CONFIG]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.TASK]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.INJECTION]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.BOT_MANAGEMENT]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.CARD_TEMPLATE]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.ACCOUNT]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.PROJECT]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.ONCALL_CONFIG]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.ONCALL_RULES]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.ONCALL_HISTORY]: 'pending' as StepStatus,
    [GlobalGuideStepNumber.ONCALL_STATS]: 'pending' as StepStatus,
  },
  platformSelection: null,
  lastVisitedRoute: '',
  userProgress: {},
  sideGuidePanelVisible: false, // Side guide panel is hidden by default
  panelContentVisible: false, // Panel content is hidden by default
};

export const useGlobalGuideStore = create<GlobalGuideState>()(
  persist(
    (set, _get) => ({
      ...initialState,

      updateCurrentStep: (step: GlobalGuideStepNumber) => {
        set((_state) => {
          // Reset all step statuses to pending
          const newStepStatusMap: Record<GlobalGuideStepNumber, StepStatus> = {
            [GlobalGuideStepNumber.CONNECTION]: 'pending',
            [GlobalGuideStepNumber.DATASOURCE]: 'pending',
            [GlobalGuideStepNumber.TEMPLATE]: 'pending',
            [GlobalGuideStepNumber.METRIC_CONFIG]: 'pending',
            [GlobalGuideStepNumber.TASK]: 'pending',
            [GlobalGuideStepNumber.INJECTION]: 'pending',
            [GlobalGuideStepNumber.BOT_MANAGEMENT]: 'pending',
            [GlobalGuideStepNumber.CARD_TEMPLATE]: 'pending',
            [GlobalGuideStepNumber.ACCOUNT]: 'pending',
            [GlobalGuideStepNumber.PROJECT]: 'pending',
            [GlobalGuideStepNumber.ONCALL_CONFIG]: 'pending',
            [GlobalGuideStepNumber.ONCALL_RULES]: 'pending',
            [GlobalGuideStepNumber.ONCALL_HISTORY]: 'pending',
            [GlobalGuideStepNumber.ONCALL_STATS]: 'pending',
          };

          // Set current step to active
          newStepStatusMap[step] = 'active';

          return {
            currentStep: step,
            stepStatusMap: newStepStatusMap,
          };
        });
      },

      updateStepStatus: (step: GlobalGuideStepNumber, status: StepStatus) => {
        set((_state) => ({
          stepStatusMap: {
            ..._state.stepStatusMap,
            [step]: status,
          },
        }));
      },

      updatePlatformSelection: (platform: PlatformType) => {
        set({ platformSelection: platform });
      },

      updateLastVisitedRoute: (route: string) => {
        set({ lastVisitedRoute: route });
      },

      updateUserProgress: (progress: Partial<UserProgress>) => {
        set((_state) => ({
          userProgress: {
            ..._state.userProgress,
            ...progress,
          },
        }));
      },

      setSideGuidePanelVisible: (visible: boolean) => {
        set({ sideGuidePanelVisible: visible });
        // When side panel is collapsed, panel content should also be collapsed
        if (!visible) {
          set({ panelContentVisible: false });
        }
      },

      setPanelContentVisible: (visible: boolean) => {
        set({ panelContentVisible: visible });
        // When panel content is expanded, side panel should also be expanded
        if (visible) {
          set({ sideGuidePanelVisible: true });
        }
      },

      resetGuide: () => {
        set(initialState);
      },
    }),
    {
      name: 'global-guide-store',
      // Only persist critical state to avoid sensitive information leakage
      // guideVisible is not persisted, defaults to false on each visit
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepStatusMap: state.stepStatusMap,
        platformSelection: state.platformSelection,
        lastVisitedRoute: state.lastVisitedRoute,
        // guideVisible: state.guideVisible, // Not persisted, defaults to false
      }),
    },
  ),
);

// Clear potentially existing old cache
export const clearGuideCache = () => {
  try {
    const stored = localStorage.getItem('global-guide-store');
    if (stored) {
      const parsed = JSON.parse(stored);
      // If guideVisible field exists, remove it
      if ('state' in parsed && 'guideVisible' in parsed.state) {
        delete parsed.state.guideVisible;
        localStorage.setItem('global-guide-store', JSON.stringify(parsed));
      }
    }
  } catch (error) {
    console.warn('Failed to clear guide cache:', error);
  }
};

// Clear cache when module loads
clearGuideCache();
