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

import type { SelectCustomWithFooterProps } from '@/custom-table/types';
import { Button, Select } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { type FC, type ReactNode, useEffect, useMemo, useState } from 'react';
import styles from './base-select-footer.module.less';
import { getFinallyOptions } from './utils';

const BaseSelectFooter: FC<SelectCustomWithFooterProps> = (props) => {
  const { value, options, onChange, onVisibleChange, ...otherProps } = props;
  /** Internal value */
  const [stateValue, setStateValue] = useState(value);
  /** Whether to show dropdown */
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (_visible: boolean) => {
    if (!_visible) {
      // If window closes, sync with external value
      setStateValue(value);
    }
    setVisible(_visible);
    onVisibleChange?.(_visible);
  };

  useEffect(() => {
    // Only clear operation when internal and external values differ
    if (value !== stateValue && value === undefined) {
      setStateValue(value);
    }
  }, [value, stateValue]);

  const finallyOptions = useMemo(() => {
    // Ensure value and stateValue are single values or arrays, matching getFinallyOptions parameter types
    let normalizedValue: string | number | undefined;
    if (Array.isArray(value)) {
      normalizedValue = value.length > 0 ? value[0] : undefined;
    } else if (value) {
      normalizedValue = value;
    } else {
      normalizedValue = undefined;
    }

    let normalizedStateValue: string | number | undefined;
    if (Array.isArray(stateValue)) {
      normalizedStateValue = stateValue.length > 0 ? stateValue[0] : undefined;
    } else if (stateValue) {
      normalizedStateValue = stateValue;
    } else {
      normalizedStateValue = undefined;
    }
    // options is SimpleOptions (string[] | number[]), getFinallyOptions expects SimpleOptions[]
    // So need to convert single options to array
    const normalizedOptions = options ? [options] : undefined;

    return getFinallyOptions({
      value: normalizedValue,
      stateValue: normalizedStateValue,
      options: normalizedOptions,
    });
  }, [value, stateValue, options]);

  const dropdownRender = (menu: ReactNode) => {
    if (
      !finallyOptions ||
      !Array.isArray(finallyOptions) ||
      finallyOptions.length === 0
    ) {
      return menu;
    }

    const sure = () => {
      setStateValue(stateValue);
      // stateValue may be an array (multiple selection mode), need to convert to single value
      let normalizedValue: string | number | undefined;
      if (Array.isArray(stateValue)) {
        normalizedValue = stateValue.length > 0 ? stateValue[0] : undefined;
      } else {
        normalizedValue = stateValue;
      }
      onChange?.(normalizedValue);
      setVisible(!visible);
    };

    const resetAll = () => {
      setStateValue(undefined);
      setVisible(false);
    };
    return (
      <div className={styles.popup}>
        {menu}
        <div className={styles.footer}>
          <Button size="mini" className={styles.selectAll} onClick={resetAll}>
            Reset
          </Button>
          <Button size="mini" type="primary" onClick={sure}>
            Confirm
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Select
      className={styles.select}
      size="small"
      mode="multiple"
      placeholder="Search"
      filterOption={false}
      removeIcon={null}
      allowClear={false}
      value={stateValue}
      onChange={setStateValue}
      dropdownRender={dropdownRender}
      dropdownMenuClassName={styles.dropdown}
      popupVisible={visible}
      onVisibleChange={handleVisibleChange}
      options={finallyOptions}
      arrowIcon={<IconSearch />}
      style={{ width: 240 }}
      showSearch={{ retainInputValueWhileSelect: true }}
      triggerProps={{
        style: {
          maxWidth: 320,
        },
        className: styles.popupWrap,
        autoAlignPopupWidth: false,
        autoAlignPopupMinWidth: true,
        position: 'br',
      }}
      {...otherProps}
    />
  );
};

export { BaseSelectFooter };
