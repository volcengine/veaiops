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

import { resetLogCollector } from '@/custom-table/utils/reset-log-collector';
import { Button } from '@arco-design/web-react';
import { ensureArray } from '@veaiops/utils';
import type { FC, ReactNode } from 'react';
import { commonClassName } from '../core/constants';
import { renderActions } from '../core/renderer';

interface ActionsAreaProps {
  /** Wrapper class name */
  wrapperClassName?: string;
  /** Whether to show reset button */
  showReset?: boolean;
  /** Whether reset is available */
  canReset?: boolean;
  /** Reset handler function */
  onReset?: () => void;
  /** Custom action buttons */
  customActions?: ReactNode[] | ReactNode;
  /** Custom action buttons style */
  customActionsStyle?: React.CSSProperties;
}

/**
 * Actions area component
 * Responsible for rendering reset button and custom action buttons
 */
const ActionsArea: FC<ActionsAreaProps> = ({
  wrapperClassName = '',
  showReset,
  canReset,
  onReset,
  customActions,
  customActionsStyle = {},
}) => {
  // Handle reset button click
  const handleResetClick = () => {
    resetLogCollector.log({
      component: 'ActionsArea',
      method: 'handleResetClick',
      action: 'start',
      data: {
        showReset,
        canReset,
        hasOnReset: Boolean(onReset),
        timestamp: new Date().toISOString(),
      },
    });

    try {
      if (onReset) {
        resetLogCollector.log({
          component: 'ActionsArea',
          method: 'handleResetClick',
          action: 'call',
          data: {
            method: 'onReset',
          },
        });
        onReset();
      }

      resetLogCollector.log({
        component: 'ActionsArea',
        method: 'handleResetClick',
        action: 'end',
        data: {
          success: true,
        },
      });
    } catch (error: any) {
      resetLogCollector.log({
        component: 'ActionsArea',
        method: 'handleResetClick',
        action: 'error',
        data: {
          error: error.message,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  // If no actions, don't render
  if (!showReset && !customActions) {
    return null;
  }

  return (
    <div className={`${commonClassName} ${wrapperClassName}`}>
      {/* Reset button */}
      {showReset && canReset && onReset && (
        <Button type="outline" onClick={handleResetClick}>
          Reset
        </Button>
      )}

      {/* Custom action buttons */}
      {customActions && (
        <div className={commonClassName} style={customActionsStyle}>
          {renderActions(ensureArray(customActions))}
        </div>
      )}
    </div>
  );
};

export { ActionsArea };
export default ActionsArea;
