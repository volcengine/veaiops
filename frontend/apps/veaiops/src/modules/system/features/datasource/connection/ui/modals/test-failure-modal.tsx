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
 * Test failure modal component
 */

import { Alert, Button, Modal } from '@arco-design/web-react';
import type React from 'react';

interface TestFailureModalProps {
  visible: boolean;
  error: string;
  onClose: () => void;
}

export const TestFailureModal: React.FC<TestFailureModalProps> = ({
  visible,
  error,
  onClose,
}) => {
  return (
    <Modal
      title="连接测试失败"
      visible={visible}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          确定
        </Button>
      }
      maskClosable={false}
      style={{ width: 500 }}
    >
      <div style={{ padding: '16px 0' }}>
        <Alert type="error" title="连接测试失败" content={error} showIcon />
        <Alert
          type="warning"
          title="请检查以下配置后重试："
          content={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>网络连接是否正常</li>
              <li>API地址是否正确</li>
              <li>用户名和密码是否正确</li>
              <li>服务器是否可访问</li>
            </ul>
          }
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    </Modal>
  );
};
