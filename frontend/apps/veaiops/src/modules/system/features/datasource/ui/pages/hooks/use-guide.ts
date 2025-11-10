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

import type { IGuide } from '@veaiops/components';

import { useEffect, useMemo, useState } from 'react';
import {
  GUIDE_CONFIG_CONSTANTS,
  MONITOR_MANAGEMENT_GUIDE_STEPS,
} from '../config/guide-config';

/**
 * Monitor management page guide logic Hook
 *
 * @description
 * Encapsulates state management and configuration logic for guide components
 *
 * @returns Guide configuration object
 */
export const useGuide = () => {
  const [guideVisible, setGuideVisible] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return (
      !urlParams.has('connectDrawerShow') ||
      urlParams.get('connectDrawerShow') !== 'true'
    );
  });

  // Wait for DOM rendering to complete before showing guide
  useEffect(() => {
    // Function to check if target elements exist
    const checkTargetElements = () => {
      const connectionBtn = document.querySelector(
        '#monitor-connection-manage-btn',
      );
      const addConfigBtn = document.querySelector('#monitor-add-config-btn');

      return connectionBtn && addConfigBtn;
    };

    // Use requestAnimationFrame to ensure DOM is rendered
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const attemptShowGuide = (attempt = 1) => {
      rafId = requestAnimationFrame(() => {
        if (checkTargetElements()) {
          // Add extra delay to ensure layout is completely stable
          // Wait for all CSS animations, transitions, and layout calculations to complete
          timeoutId = setTimeout(() => {
            const connectionBtn = document.querySelector(
              '#monitor-connection-manage-btn',
            );

            const connectionRect = connectionBtn?.getBoundingClientRect();

            // Ensure element has actual dimensions (not display:none or visibility:hidden)
            if (
              connectionRect &&
              connectionRect.width > 0 &&
              connectionRect.height > 0
            ) {
              const urlParams = new URLSearchParams(window.location.search);
              const connectDrawerShow =
                !urlParams.has('connectDrawerShow') ||
                urlParams.get('connectDrawerShow') !== 'true';
              setGuideVisible(connectDrawerShow);

              // After showing guide, delay a short time to let XGuide component fully initialize
              // Then trigger a resize event to force XGuide to recalculate position
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 100);
            }
          }, 300); // Delay 300ms to ensure layout is stable
        } else if (attempt < 20) {
          // Try up to 20 times, with 50ms interval each time

          timeoutId = setTimeout(() => attemptShowGuide(attempt + 1), 50);
        }
      });
    };

    attemptShowGuide();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const guideConfig: IGuide = useMemo(
    () => ({
      steps: MONITOR_MANAGEMENT_GUIDE_STEPS,
      type: GUIDE_CONFIG_CONSTANTS.TYPE,
      theme: GUIDE_CONFIG_CONSTANTS.THEME,
      mask: true,
      maskStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      },
      arrow: true,
      hotspot: true,
      closable: false,
      visible: guideVisible,
      localKey: GUIDE_CONFIG_CONSTANTS.LOCAL_KEY,
      showStepInfo: true,
      showPreviousBtn: true,
      nextText: GUIDE_CONFIG_CONSTANTS.NEXT_TEXT,
      prevText: GUIDE_CONFIG_CONSTANTS.PREV_TEXT,
      okText: GUIDE_CONFIG_CONSTANTS.OK_TEXT,
      maskClosable: false,
      zIndex: 1400,
      onClose: () => {
        setGuideVisible(false);
      },
    }),
    [guideVisible],
  );

  return guideConfig;
};
