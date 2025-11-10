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
 * Step indicator component
 * @description Displays current wizard step progress
 * @author AI Assistant
 * @date 2025-01-15
 */

import { IconLeft, IconRight } from '@arco-design/web-react/icon';
import React from 'react';
import { DATA_SOURCE_CONFIGS } from '../config/datasource-configs';
import type { DataSourceType } from '../types';
import { IntroCard, StepStatus } from './intro-card';
import styles from './step-indicator.module.less';

export interface StepIndicatorProps {
  selectedType: DataSourceType | null;
  currentStep: number;
}

/**
 * Get step status
 */
const getStepStatus = (index: number, currentStep: number): StepStatus => {
  if (index < currentStep) {
    return StepStatus.COMPLETED;
  }
  if (index === currentStep) {
    return StepStatus.ACTIVE;
  }
  return StepStatus.PENDING;
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  selectedType,
  currentStep,
}) => {
  // ✅ All Hooks must be called at component top level, before any conditional checks
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Check scroll state
  const checkScrollState = React.useCallback(() => {
    if (!scrollRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Scroll to specified position
  const scrollTo = React.useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) {
      return;
    }

    const scrollAmount = 280; // One card width
    const currentScroll = scrollRef.current.scrollLeft;
    const newScroll =
      direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  }, []);

  // Scroll to current step
  const scrollToCurrentStep = React.useCallback(() => {
    if (!scrollRef.current) {
      return;
    }

    const stepWidth = 280; // Card width
    const scrollAmount = currentStep * stepWidth;

    scrollRef.current.scrollTo({
      left: scrollAmount,
      behavior: 'smooth',
    });
  }, [currentStep]);

  // Listen to scroll events
  React.useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      checkScrollState();
      scrollElement.addEventListener('scroll', checkScrollState);

      return () => {
        scrollElement.removeEventListener('scroll', checkScrollState);
      };
    }
    return undefined;
  }, [checkScrollState]);

  // When step changes, scroll to current step
  React.useEffect(() => {
    scrollToCurrentStep();
  }, [scrollToCurrentStep]);

  // ✅ Conditional checks moved after Hooks
  if (!selectedType) {
    return null;
  }

  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  if (!config) {
    return null;
  }

  return (
    <div className={styles.stepsContainer}>
      {/* Left arrow */}
      <button
        className={`${styles.scrollArrow} ${styles.left} ${
          !canScrollLeft ? styles.disabled : ''
        }`}
        onClick={() => scrollTo('left')}
        disabled={!canScrollLeft}
        aria-label="向左滚动"
      >
        <IconLeft className={styles.arrowIcon} />
      </button>

      {/* Right arrow */}
      <button
        className={`${styles.scrollArrow} ${styles.right} ${
          !canScrollRight ? styles.disabled : ''
        }`}
        onClick={() => scrollTo('right')}
        disabled={!canScrollRight}
        aria-label="向右滚动"
      >
        <IconRight className={styles.arrowIcon} />
      </button>

      <div className={styles.stepsWrapper} ref={scrollRef}>
        {config.steps.map((step, index) => (
          <div key={step.key} className={styles.stepItem}>
            <IntroCard
              index={index}
              title={step.title}
              description={step.description}
              status={getStepStatus(index, currentStep)}
              showConnector={false}
            />
            {/* All steps have connector container, last one set to invisible to maintain consistent width */}
            <div
              className={`${styles.connectorWrapper} ${
                index >= config.steps.length - 1 ? styles.hidden : ''
              }`}
            >
              <div
                className={`${styles.connector} ${
                  getStepStatus(index, currentStep) === StepStatus.COMPLETED
                    ? styles.completed
                    : ''
                }`}
              >
                <div className={styles.connectorLine} />
                <div className={styles.connectorDot} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
