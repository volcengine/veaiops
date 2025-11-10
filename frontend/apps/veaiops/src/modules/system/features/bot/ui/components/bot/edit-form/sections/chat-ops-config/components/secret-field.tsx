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

import {
  Button,
  Form,
  type FormInstance,
  Input,
  Tooltip,
} from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconEye,
  IconEyeInvisible,
} from '@arco-design/web-react/icon';
import { AutofillBlockerPresets } from '@veaiops/utils';
import type React from 'react';
import type { UseSecretViewerReturn } from '../hooks';

/**
 * SecretField component Props
 */
interface SecretFieldProps {
  label: string;
  field: string;
  required: boolean;
  placeholder: string;
  showSecret: boolean;
  toggleSecretVisibility: () => void;
  botId?: string;
  secretViewer: UseSecretViewerReturn;
  secretKey: 'api_key' | 'ak' | 'sk';
  fieldName: 'agent_cfg.api_key' | 'volc_cfg.ak' | 'volc_cfg.sk';
  formField: string;
}

/**
 * Encrypted field component (reusable)
 */
export const SecretField: React.FC<SecretFieldProps> = ({
  label,
  field,
  required,
  placeholder,
  showSecret,
  toggleSecretVisibility,
  botId,
  secretViewer,
  secretKey,
  fieldName,
  formField,
}) => {
  // Select corresponding AutofillBlocker preset based on secretKey
  let autofillBlockerProps;
  if (secretKey === 'api_key') {
    autofillBlockerProps = AutofillBlockerPresets.apiKey();
  } else if (secretKey === 'ak') {
    autofillBlockerProps = AutofillBlockerPresets.accessKey();
  } else {
    autofillBlockerProps = AutofillBlockerPresets.secretKey();
  }

  return (
    <div className="relative">
      <Form.Item
        label={label}
        field={field}
        rules={[
          {
            required,
            message: `请输入${label}`,
          },
        ]}
        extra={
          botId && (
            <Button
              type="text"
              size="small"
              loading={secretViewer.loadingSecrets[secretKey]}
              onClick={() =>
                secretViewer.handleViewSecret(fieldName, formField, secretKey)
              }
              style={{ fontSize: '12px', padding: 0 }}
            >
              查看加密信息
            </Button>
          )
        }
      >
        <Input
          type={showSecret ? 'text' : 'password'}
          placeholder={placeholder}
          allowClear
          {...autofillBlockerProps}
          suffix={
            <Button
              type="text"
              size="small"
              icon={showSecret ? <IconEyeInvisible /> : <IconEye />}
              onClick={toggleSecretVisibility}
            />
          }
        />
      </Form.Item>
      {secretViewer.showSecretTooltips[secretKey] && (
        <Tooltip
          content={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <IconCheckCircle style={{ color: '#1CB267', fontSize: '14px' }} />
              <span>已回填 {label}</span>
            </div>
          }
          position="top"
          popupVisible={secretViewer.showSecretTooltips[secretKey]}
          popupHoverStay={true}
          getPopupContainer={(node) => node.parentElement || document.body}
        >
          <div
            style={{
              position: 'absolute',
              top: '29px',
              left: '0',
              right: '0',
              height: '32px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};
