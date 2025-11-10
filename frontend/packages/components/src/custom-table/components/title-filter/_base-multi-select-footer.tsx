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

import { Button, Select, Spin } from '@arco-design/web-react';
import type { SelectProps } from '@arco-design/web-react';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import type { Option } from '@veaiops/types';
import styles from './index.module.less';

type SelectValue = string | number | string[] | number[] | undefined;

interface SelectCustomWithFooterProps extends Omit<SelectProps, 'value'> {
  value: SelectValue;
  options?: Option[] | (string | number)[];
  onChange: (value?: SelectValue) => void;
  multiple?: boolean;
}

const BaseSelectFooter: FC<SelectCustomWithFooterProps> = (props) => {
  const { value, options, onChange, onVisibleChange, loading, ...otherProps } =
    props;
  /** Internal value */
  const [stateValue, setStateValue] = useState<SelectValue>(value);
  useEffect(() => {
    // Only clear operation when internal value differs from external value
    if (value !== stateValue) {
      setStateValue(value);
    }
    // Only listen to external value changes
  }, [value, stateValue]);

  /** Whether to show dropdown */
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = useCallback(
    (_visible: boolean) => {
      if (!_visible) {
        // If window closes, use external value
        setStateValue(value);
      }
      setVisible(_visible);
      onVisibleChange?.(_visible);
    },
    [onVisibleChange, value],
  );

  const dropdownRender = useCallback(
    (menu: ReactNode) => {
      if (loading) {
        return (
          <div className={styles.loading}>
            <Spin className={styles.spin} />
          </div>
        );
      }

      if (!options || options.length === 0) {
        return menu;
      }

      const sure = () => {
        onChange(stateValue);
        setVisible(false);
      };

      const resetAll = () => {
        onChange(undefined);
        setVisible(false);
      };
      return (
        <div>
          {menu}
          <div className={`${styles.footer} justify-between`}>
            <Button size="mini" className={styles.selectAll} onClick={resetAll}>
              Reset
            </Button>
            <Button size="mini" type="primary" onClick={sure}>
              Confirm
            </Button>
          </div>
        </div>
      );
    },
    [loading, options, stateValue, onChange],
  );

  return (
    <Select
      className={styles.select}
      size="small"
      mode="multiple"
      value={stateValue}
      onChange={setStateValue}
      allowClear={true}
      dropdownRender={dropdownRender}
      triggerProps={{
        style: {
          maxWidth: 240,
        },
        autoAlignPopupWidth: false,
        autoAlignPopupMinWidth: true,
        position: 'br',
      }}
      dropdownMenuClassName={styles.dropdown}
      popupVisible={visible}
      onVisibleChange={handleVisibleChange}
      loading={loading}
      options={options}
      {...otherProps}
    />
  );
};

export { BaseSelectFooter };
