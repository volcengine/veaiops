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
 * Step card component
 * @description Displays a card for a single wizard step, supporting different states (pending, active, completed)
 * @author AI Assistant
 * @date 2025-01-15
 */

import { IconCheck } from '@arco-design/web-react/icon';
import type React from 'react';
import styles from './intro-card.module.less';

export enum StepStatus {
  PENDING = 'pending', // Not started
  ACTIVE = 'active', // In progress
  COMPLETED = 'completed', // Completed
}

export interface IntroCardProps {
  /** Step index (starting from 0) */
  index: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step status */
  status: StepStatus;
  /** Whether to show connector (last step doesn't show) */
  showConnector?: boolean;
}

/**
 * Step card component
 */
export const IntroCard: React.FC<IntroCardProps> = ({
  index,
  title,
  description,
  status,
  showConnector = true,
}) => {
  const isActive = status === StepStatus.ACTIVE;
  const isCompleted = status === StepStatus.COMPLETED;
  const isPending = status === StepStatus.PENDING;

  return (
    <div
      className={`${styles.introCard} ${
        isActive ? styles.active : ''
      } ${isCompleted ? styles.completed : ''} ${
        isPending ? styles.pending : ''
      }`}
    >
      {/* Top decorator bar */}
      <div className={styles.topDecorator} />

      {/* Step icon area */}
      <div className={styles.iconSection}>
        <div className={styles.iconCircle}>
          <div className={styles.iconInner}>
            {isCompleted ? (
              <IconCheck className={styles.checkIcon} />
            ) : (
              <span className={styles.stepNumber}>{index + 1}</span>
            )}
          </div>
        </div>

        {/* Pulse animation ring (only shown in active state) */}
        {isActive && <div className={styles.pulseRing} />}
      </div>

      {/* Text content area */}
      <div className={styles.contentSection}>
        <div className={styles.stepLabel}>第{index + 1}步</div>
        <h3 className={styles.stepTitle}>{title}</h3>
        <p className={styles.stepDescription}>{description}</p>
      </div>

      {/* Step connector line */}
      {showConnector && (
        <div className={styles.connectorWrapper}>
          <div
            className={`${styles.connector} ${
              isCompleted ? styles.completed : ''
            }`}
          >
            <div className={styles.connectorLine} />
            <div className={styles.connectorDot} />
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroCard;
