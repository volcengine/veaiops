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

import { Button } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import { type FC, useMemo, useState } from 'react';
import { CheckBoxDrawer } from './components/check-box-drawer';
import type { CustomFieldsProps } from './types';

/**
 * Custom fields component
 * Provides field selection and customization functionality
 */
const CustomFields: FC<CustomFieldsProps> = ({
  disabledFields,
  columns,
  value = [],
  confirm,
  initialFields,
  buttonText = 'Customize Columns',
  drawerTitle = 'Customize Columns Configuration',
}) => {
  const [visible, setVisible] = useState(false);

  // Calculate active field count (total fields minus selected fields)
  const activeCount = useMemo(() => {
    const totalFields = columns?.length || 0;
    const selectedFields = value?.length || 0;
    return Math.max(0, totalFields - selectedFields);
  }, [columns?.length, value?.length]);

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleConfirm = (newValue: string[]) => {
    confirm(newValue);
  };

  return (
    <>
      <Button
        className="flex items-center gap-2"
        onClick={handleOpen}
        icon={<IconSettings />}
      >
        <span>{buttonText}</span>
        {activeCount > 0 && (
          <span className="custom-fields-active-count">{activeCount}+</span>
        )}
      </Button>
      <CheckBoxDrawer
        title={drawerTitle}
        disabledFields={disabledFields}
        columns={columns}
        visible={visible}
        close={handleClose}
        value={value}
        initialValue={initialFields}
        confirm={handleConfirm}
      />
    </>
  );
};

export { CustomFields };
export default CustomFields;
