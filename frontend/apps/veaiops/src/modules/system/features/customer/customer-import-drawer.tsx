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
  Alert,
  Button,
  Divider,
  Drawer,
  Space,
  Typography,
  Upload,
} from '@arco-design/web-react';
import {
  IconDownload,
  IconFile,
  IconUpload,
} from '@arco-design/web-react/icon';
import type React from 'react';
import { useState } from 'react';

const { Text, Title } = Typography;

interface CustomerImportDrawerProps {
  visible: boolean;
  loading: boolean;
  onImport: (file: File) => Promise<boolean>;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Customer import drawer component
 */
const CustomerImportDrawer: React.FC<CustomerImportDrawerProps> = ({
  visible,
  loading,
  onImport,
  onClose,
  onSuccess,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);

  const handleUpload = async () => {
    if (fileList.length > 0) {
      const file = fileList[0].originFile;
      if (file) {
        const success = await onImport(file);
        if (success) {
          setFileList([]);
          // Call success callback after import succeeds
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    }
  };

  const handleClose = () => {
    setFileList([]);
    onClose();
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent =
      'customer_id,name,desensitized_name\n' +
      'CUST001,示例客户1,示例***1\n' +
      'CUST002,示例客户2,示例***2';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customer_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Drawer
      title={
        <Space>
          <IconUpload />
          <Title heading={6} className="m-0">
            导入客户数据
          </Title>
        </Space>
      }
      visible={visible}
      onCancel={handleClose}
      width={520}
      focusLock={false}
      footer={
        <div className="text-right">
          <Space>
            <Button onClick={handleClose}>取消</Button>
            <Button
              type="primary"
              loading={loading}
              disabled={fileList.length === 0}
              onClick={handleUpload}
            >
              开始导入
            </Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* Import instructions */}
        <Alert
          type="info"
          content={
            <Space direction="vertical" size="small">
              <Text>请按照以下要求准备CSV文件：</Text>
              <Text>• 文件格式：CSV (逗号分隔值)</Text>
              <Text>• 字符编码：UTF-8</Text>
              <Text>• 必填字段：customer_id, name, desensitized_name</Text>
            </Space>
          }
        />

        {/* Template download */}
        <div>
          <Space>
            <Button
              type="outline"
              icon={<IconDownload />}
              onClick={downloadTemplate}
            >
              下载模板文件
            </Button>
            <Text type="secondary">建议先下载模板文件，按格式填写数据</Text>
          </Space>
        </div>

        <Divider />

        {/* File upload */}
        <div>
          <Title heading={6} className="mb-4">
            选择文件
          </Title>
          <Upload
            fileList={fileList}
            onChange={setFileList}
            accept=".csv"
            limit={1}
            drag
            tip="支持拖拽上传，仅支持CSV格式文件"
            autoUpload={false}
            beforeUpload={() => true}
          >
            <div className="text-center py-10">
              <IconFile className="text-5xl text-gray-400" />
              <div className="mt-4">
                <Text>点击或拖拽文件到此区域上传</Text>
              </div>
              <div className="mt-2">
                <Text type="secondary" className="text-xs">
                  支持 .csv 格式，文件大小不超过 10MB
                </Text>
              </div>
            </div>
          </Upload>
        </div>

        {/* Important notes */}
        <Alert
          type="warning"
          content={
            <Space direction="vertical" size="small">
              <Text className="font-bold">注意事项：</Text>
              <Text>• 导入过程中请勿关闭页面或刷新浏览器</Text>
              <Text>• 如果客户ID已存在，将跳过该条记录</Text>
            </Space>
          }
        />
      </Space>
    </Drawer>
  );
};

export { CustomerImportDrawer };
export default CustomerImportDrawer;
