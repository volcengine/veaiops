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
  Message,
  Progress,
  Space,
  Upload,
} from '@arco-design/web-react';
import { IconDownload, IconUpload } from '@arco-design/web-react/icon';
import type React from 'react';
import { downloadTemplate } from './utils';

interface UploadSectionProps {
  uploading: boolean;
  onUpload: (file: File) => Promise<boolean>;
}

/**
 * Upload section component
 */
export const UploadSection: React.FC<UploadSectionProps> = ({
  uploading,
  onUpload,
}) => {
  // Upload configuration
  const uploadProps = {
    accept: '.csv',
    beforeUpload: (file: File) => {
      if (!file.name.endsWith('.csv')) {
        Message.error('只支持CSV文件格式');
        return false;
      }
      onUpload(file);
      return false; // Prevent auto-upload
    },
    showUploadList: false,
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div />
        <Space>
          <Button icon={<IconDownload />} onClick={downloadTemplate}>
            下载模板
          </Button>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<IconUpload />} loading={uploading}>
              {uploading ? '导入中...' : '导入CSV'}
            </Button>
          </Upload>
        </Space>
      </div>

      {uploading && (
        <div className="mb-4">
          <Progress percent={50} />
          <div className="text-center mt-2 text-secondary">
            正在导入客户数据...
          </div>
        </div>
      )}

      <div className="mb-4 p-5 border-2 border-dashed border-gray-300 rounded-md text-center">
        <IconUpload
          style={{ fontSize: '48px', color: 'var(--color-text-secondary)' }}
        />
        <div className="mt-4 text-base">点击或拖拽文件到此区域上传</div>
        <div className="mt-2 text-secondary text-sm">
          支持CSV格式，包含字段：customer_id, name, desensitized_name
        </div>
      </div>
    </>
  );
};
