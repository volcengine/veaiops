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

import { Modal } from '@arco-design/web-react';
import type React from 'react';
import styles from '../../index.module.less';

/**
 * LogoutModal component parameters
 */
export interface LogoutModalProps {
  visible: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Logout confirmation modal component
 */
export const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      title="确认退出"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="确认退出"
      cancelText="取消"
      okButtonProps={{ status: 'danger', loading }}
      confirmLoading={loading}
      wrapClassName={styles.logoutModal}
      footer={(cancelButtonNode, okButtonNode) => (
        <div className="flex justify-end gap-1.5">
          {cancelButtonNode}
          {okButtonNode}
        </div>
      )}
    >
      <div className="flex items-center space-x-3 p-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <p className="text-text font-medium">您确定要退出登录吗？</p>
          <p className="text-textSecondary text-sm mt-1">
            退出后需要重新登录才能访问系统
          </p>
        </div>
      </div>
    </Modal>
  );
};
