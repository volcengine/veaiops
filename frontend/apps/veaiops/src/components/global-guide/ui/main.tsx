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

import type React from 'react';
import { useEffect } from 'react';

import { useGlobalGuideLogic } from '../hooks';
import { initAutoLogCollection } from '../lib';
import { ExpandedPanel, SideGuidePanel } from './components';
import style from './styles/index.module.less';

/**
 * Global guide component - main container
 * Provides full-chain guide experience for intelligent threshold task configuration
 */
export const GlobalGuide: React.FC = () => {
  const {
    // State
    currentStep,
    sideGuidePanelVisible,
    panelContentVisible,
    steps,
    currentStepConfig,

    // Methods
    getStepStatus,
    handleStepClick,
    handleStepSelect,
    handleFrontendFeatureClick,
    handleCloseSidePanel,
    handleOpenSidePanel,
    handleClosePanelContent,
  } = useGlobalGuideLogic();

  // Initialize auto log collection
  useEffect(() => {
    const cleanup = initAutoLogCollection();

    // Cleanup on component unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return (
    <div className={style.globalGuide}>
      {/* Side floating guide panel */}
      <SideGuidePanel
        sideGuidePanelVisible={sideGuidePanelVisible}
        steps={steps}
        currentStep={currentStep}
        getStepStatus={getStepStatus}
        onOpenSidePanel={handleOpenSidePanel}
        onCloseSidePanel={handleCloseSidePanel}
        onStepSelect={handleStepSelect}
      />

      {/* Expanded guide panel */}
      <ExpandedPanel
        panelContentVisible={panelContentVisible}
        currentStepConfig={currentStepConfig || null}
        onClosePanelContent={handleClosePanelContent}
        onStepClick={handleStepClick}
        onFrontendFeatureClick={handleFrontendFeatureClick}
      />
    </div>
  );
};
