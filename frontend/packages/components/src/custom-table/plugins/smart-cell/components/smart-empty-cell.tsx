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

// import type { UserRole } from '@veaiops/types'; // UserRole type temporarily undefined
/**
 * Smart empty value cell component
 * Based on EPS platform's SmartEmptyCell implementation
 */
import { CellRender } from '@/cell-render';
import type {
  BaseRecord,
  CellRenderParams,
  EmptyValueConfig,
  EmptyValueContext,
  UserRole,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
import { Button, Tooltip } from '@arco-design/web-react';
import { IconEdit, IconLock, IconPlus } from '@arco-design/web-react/icon';
import type React from 'react';
import { type ReactNode, useMemo, useState } from 'react';
import styles from './smart-empty-cell.module.less';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

export interface SmartEmptyCellProps<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Cell value */
  value: unknown;
  /** Row data */
  record: RecordType;
  /** Field name */
  field: string;
  /** Empty value configuration */
  emptyConfig: EmptyValueConfig;
  /** User role */
  userRole: UserRole;
  /** Context information */
  context: EmptyValueContext;
  /** Show permission hints */
  showPermissionHints: boolean;
  /** Enable contextual display */
  enableContextualDisplay: boolean;
  /** Empty value click callback */
  onEmptyValueClick?: (params: CellRenderParams<RecordType>) => void;
  /** Style class name */
  className?: string;
  /** Children elements */
  children?: ReactNode;
}

export const SmartEmptyCell = <RecordType extends BaseRecord = BaseRecord>({
  value,
  record,
  field,
  emptyConfig,
  userRole,
  context,
  showPermissionHints,
  enableContextualDisplay,
  onEmptyValueClick,
  className,
  children,
}: SmartEmptyCellProps<RecordType>): React.ReactElement => {
  const [hover, setHover] = useState(false);

  // Check if value is empty
  const isEmpty = useMemo(() => {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  }, [value]);

  // Check permission
  const hasPermission = useMemo(() => {
    const roles = emptyConfig.permission?.allowedRoles;
    if (!roles) {
      return true;
    }
    return roles.includes(userRole);
  }, [emptyConfig.permission?.allowedRoles, userRole]);

  // Handle click event
  const handleClick = () => {
    if (!hasPermission || !emptyConfig.allowEdit) {
      return;
    }

    const params: CellRenderParams<RecordType> = {
      value,
      record,
      field,
      isEmpty,
      context,
      userRole,
    };

    if (onEmptyValueClick) {
      onEmptyValueClick(params);
    } else if (emptyConfig.onClick) {
      emptyConfig.onClick(params as unknown as Record<string, unknown>);
    }

    devLog.log({
      component: 'SmartEmptyCell',
      message: 'Empty cell clicked',
      data: { field, userRole },
    });
  };

  // Render empty value content
  const renderEmptyContent = () => {
    const { strategy, text, icon, component: CustomComponent } = emptyConfig;

    // Custom component
    if (CustomComponent) {
      return (
        <CustomComponent
          value={value}
          record={record}
          field={field}
          context={context}
          userRole={userRole}
        />
      );
    }

    // Render based on strategy
    switch (strategy) {
      case 'text':
        return <span className={styles.emptyText}>{text || '--'}</span>;

      case 'placeholder':
        return (
          <span className={styles.placeholder}>
            {hasPermission && emptyConfig.allowEdit
              ? 'Click to add'
              : text || '--'}
          </span>
        );

      case 'button':
        if (!hasPermission || !emptyConfig.allowEdit) {
          return <span className={styles.emptyText}>{text || '--'}</span>;
        }
        return (
          <Button
            type="text"
            size="small"
            icon={icon || <IconPlus />}
            onClick={handleClick}
            className={styles.addButton}
          >
            {text || 'Add'}
          </Button>
        );

      case 'icon':
        return (
          <div className={styles.iconContainer}>
            {icon || <IconPlus />}
            {text && <span className={styles.iconText}>{text}</span>}
          </div>
        );

      case 'contextual':
        if (!enableContextualDisplay) {
          return <span className={styles.emptyText}>{text || '--'}</span>;
        }
        return renderContextualContent();

      case 'hide':
        return null;

      default:
        return <span className={styles.emptyText}>{text || '--'}</span>;
    }
  };

  // Render contextual related content
  const renderContextualContent = () => {
    const { dataSize, hasRelatedData, isRequired } = context;

    if (isRequired) {
      return <CustomOutlineTag>Required</CustomOutlineTag>;
    }

    if (hasRelatedData) {
      return <span className={styles.contextualHint}>Data linking...</span>;
    }

    if (dataSize === 'large') {
      return <span className={styles.placeholder}>Loading...</span>;
    }

    return <span className={styles.emptyText}>--</span>;
  };

  // Render permission hint
  const renderPermissionHint = () => {
    if (!showPermissionHints || hasPermission || !isEmpty) {
      return null;
    }

    const permissionText =
      emptyConfig.permission?.hint || 'No permission to operate';

    return (
      <Tooltip content={permissionText}>
        <div className={styles.permissionHint}>
          <IconLock />
        </div>
      </Tooltip>
    );
  };

  // Render edit hint
  const renderEditHint = () => {
    if (!hasPermission || !emptyConfig.allowEdit || !hover || !isEmpty) {
      return null;
    }

    return (
      <div className={styles.editHint}>
        <IconEdit />
      </div>
    );
  };

  // If has value, render original content directly
  if (!isEmpty) {
    return <div className={className}>{children || String(value)}</div>;
  }

  // Render empty value cell
  const canClick = hasPermission && emptyConfig.allowEdit;

  return (
    <div
      className={`${styles.smartEmptyCell} ${
        canClick ? styles.clickable : ''
      } ${className || ''}`}
      onClick={canClick ? handleClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.content}>
        {renderEmptyContent()}
        {renderPermissionHint()}
        {renderEditHint()}
      </div>

      {emptyConfig.showTooltip && emptyConfig.tooltip && (
        <Tooltip content={emptyConfig.tooltip}>
          <div className={styles.tooltipTrigger} />
        </Tooltip>
      )}
    </div>
  );
};
