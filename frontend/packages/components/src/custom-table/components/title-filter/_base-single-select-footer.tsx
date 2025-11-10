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
import { type FC, type ReactNode, useCallback, useState } from 'react';

import type { Option } from '@veaiops/types';
import styles from './index.module.less';

type SelectValue = string | number | string[] | number[] | undefined;

interface SelectCustomWithFooterProps extends Omit<SelectProps, 'value'> {
  value: SelectValue;
  options?: Option[] | (string | number)[];
  onChange: (value?: SelectValue) => void;
}

const BaseSelectFooter: FC<SelectCustomWithFooterProps> = (props) => {
  const { value, options, onChange, onVisibleChange, loading, ...otherProps } =
    props;

  /** Whether to show dropdown */
  const [visible, setVisible] = useState(false);

  const handleVisibleChange = useCallback(
    (_visible: boolean) => {
      setVisible(_visible);
      onVisibleChange?.(_visible);
    },
    [onVisibleChange],
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

      const resetAll = () => {
        onChange(undefined);
        setVisible(false);
      };
      return (
        <div>
          {menu}
          <div className={`${styles.footer} justify-center`}>
            <Button size="mini" className={styles.selectAll} onClick={resetAll}>
              Reset
            </Button>
          </div>
        </div>
      );
    },
    [loading, options, onChange],
  );

  return (
    <Select
      className={styles.select}
      size="small"
      value={value}
      onChange={onChange}
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
