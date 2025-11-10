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

interface ProjectImportDrawerProps {
  visible: boolean;
  loading: boolean;
  onImport: (file: File) => Promise<boolean>;
  onClose: () => void;
}

/**
 * Project import drawer component
 */
export const ProjectImportDrawer: React.FC<ProjectImportDrawerProps> = ({
  visible,
  loading,
  onImport,
  onClose,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);

  const handleUpload = async () => {
    if (fileList.length > 0) {
      const file = fileList[0].originFile;
      if (file) {
        const success = await onImport(file);
        if (success) {
          setFileList([]);
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
      'project_id,name,description\n' +
      'PROJ001,Example Project 1,This is an example project description\n' +
      'PROJ002,Example Project 2,This is another example project description';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'project_template.csv');
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
            Import Project Data
          </Title>
        </Space>
      }
      visible={visible}
      onCancel={handleClose}
      width={520}
      focusLock={false}
      maskClosable={false}
      footer={
        <div className="text-right">
          <Space>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              disabled={fileList.length === 0}
              onClick={handleUpload}
            >
              Start Import
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
              <Text>Please prepare the CSV file according to the following requirements:</Text>
              <Text>• File format: CSV (Comma-Separated Values)</Text>
              <Text>• Character encoding: UTF-8</Text>
              <Text>• Required fields: project_id, name</Text>
              <Text>• Optional fields: description</Text>
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
              Download Template
            </Button>
            <Text type="secondary">It is recommended to download the template file first and fill in the data according to the format</Text>
          </Space>
        </div>

        <Divider />

        {/* File upload */}
        <div>
          <Title heading={6} className="mb-4">
            Select File
          </Title>
          <Upload
            fileList={fileList}
            onChange={setFileList}
            accept=".csv"
            limit={1}
            drag
            tip="Drag and drop upload supported, CSV format files only"
            autoUpload={false}
            beforeUpload={() => true}
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <IconFile style={{ fontSize: '48px', color: '#C9CDD4' }} />
              <div style={{ marginTop: '16px' }}>
                <Text>Click or drag files to this area to upload</Text>
              </div>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" className="text-xs">
                  Supports .csv format, file size not exceeding 10MB
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
              <Text className="font-bold">Important Notes:</Text>
              <Text>• Do not close the page or refresh the browser during the import process</Text>
              <Text>• If a project ID already exists, that record will be skipped</Text>
            </Space>
          }
        />
      </Space>
    </Drawer>
  );
};

export default ProjectImportDrawer;
