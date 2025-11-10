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
 * Selectable item component
 * @description Unified selectable item component supporting radio, icon, title, description, etc.
 * @author AI Assistant
 * @date 2025-10-19
 */

import { Checkbox, Radio, Typography } from '@arco-design/web-react';
import type { ReactNode } from 'react';
import type React from 'react';
import styles from './selectable-item.module.less';

const { Text } = Typography;

export interface SelectableItemProps {
  /** Whether selected */
  selected: boolean;
  /** Click event */
  onClick: () => void;
  /** Icon */
  icon?: ReactNode;
  /** Main title */
  title: ReactNode;
  /** Description */
  description?: ReactNode;
  /** Extra information */
  extra?: ReactNode;
  /** Child content (displayed when selected) */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Selector type */
  selectorType?: 'radio' | 'checkbox' | 'none';
  /** Radio value (for Radio.Group) */
  radioValue?: string;
  /** Checkbox change event (for multi-select) */
  onCheckboxChange?: (checked: boolean) => void;
}

export const SelectableItem: React.FC<SelectableItemProps> = ({
  selected,
  onClick,
  icon,
  title,
  description,
  extra,
  children,
  className,
  selectorType = 'radio',
  radioValue,
  onCheckboxChange,
}) => {
  const handleCheckboxChange = (checked: boolean) => {
    if (onCheckboxChange) {
      onCheckboxChange(checked);
    }
  };

  return (
    <div
      className={`${styles.selectableItem} ${selected ? styles.selected : ''} ${className || ''}`}
      onClick={onClick}
    >
      {selectorType === 'radio' && (
        <Radio
          checked={selected}
          onChange={onClick}
          value={radioValue}
          style={{ marginRight: 12 }}
        />
      )}
      {selectorType === 'checkbox' && (
        <Checkbox
          checked={selected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          style={{ marginRight: 12 }}
        />
      )}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {typeof title === 'string' ? (
            <Text className={styles.title}>{title}</Text>
          ) : (
            <div className={styles.title}>{title}</div>
          )}
        </div>
        {description && (
          <div className={styles.description}>
            {typeof description === 'string' ? (
              <Text type="secondary">{description}</Text>
            ) : (
              description
            )}
          </div>
        )}
        {extra && <div className={styles.extra}>{extra}</div>}
        {children && selected && (
          <div className={styles.children}>{children}</div>
        )}
      </div>
    </div>
  );
};

export default SelectableItem;
