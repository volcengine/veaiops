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

import { useAuth } from '@/config/auth';
//
import { layoutConfig } from '@/config/layout';
import { useLogout } from '@/hooks/use-logout';
import {
  AccountModal,
  transformApiUserToExtendedUser,
} from '@/modules/system/features/account';
import { Button, Dropdown, Form, Menu } from '@arco-design/web-react';
import { IconEdit } from '@arco-design/web-react/icon';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useCallback, useState } from 'react';
import { usePasswordUpdate, useUserData } from '../hooks';
import type { UserFormData } from '../lib';
import { LogoutModal } from './logout-modal';

/**
 * User dropdown menu component
 *
 * Functionality:
 * - Display current user information
 * - Change password (via AccountModal)
 * - Logout
 */
export const UserDropdown: React.FC = () => {
  const { user } = useAuth();
  const { logout, isLoggingOut } = useLogout();
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Get user data
  const { editingUser, isSupervisor } = useUserData({
    username: user?.username,
  });

  // Password update logic
  const { handleUpdate } = usePasswordUpdate({
    editingUser,
    onSuccess: () => {
      setModalVisible(false);
      form.resetFields();
    },
  });

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: UserFormData) => {
      return await handleUpdate(values);
    },
    [handleUpdate],
  );

  // Handle cancel password change
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
  }, [form]);

  // Handle logout click
  const handleLogout = useCallback(() => {
    setLogoutModalVisible(true);
  }, []);

  // Confirm logout
  const confirmLogout = useCallback(async () => {
    setLogoutModalVisible(false);

    const logoutResult = await logout({
      showMessage: true,
      redirectToLogin: true,
      onBeforeLogout: () => {
        // Empty function to satisfy logout interface requirements
      },
    });

    // Note: logout internally handles error messages and redirects
    // Here only log, do not show additional error prompts (avoid duplicate prompts)
    if (!logoutResult.success && logoutResult.error) {
      logger.warn({
        message: '退出登录失败',
        data: {
          error: logoutResult.error.message,
          stack: logoutResult.error.stack,
          errorObj: logoutResult.error,
        },
        source: 'UserDropdown',
        component: 'confirmLogout',
      });
    }
  }, [logout]);

  // Cancel logout
  const cancelLogout = useCallback(() => {
    setLogoutModalVisible(false);
  }, []);

  // Dropdown menu content
  const dropdownMenu = (
    <Menu>
      <Menu.Item
        key="editPassword"
        onClick={() => {
          form.setFieldsValue(editingUser);
          setModalVisible(true);
        }}
      >
        <Button type={'text'} icon={<IconEdit />}>
          修改密码
        </Button>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <div className="flex items-center space-x-2 text-red-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>退出登录</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown droplist={dropdownMenu} trigger="click" position="br">
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1 transition-colors">
          <div
            className={`flex items-center justify-center ${layoutConfig.user.avatar} ${layoutConfig.user.size}`}
          >
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0)?.toUpperCase() ||
                (isSupervisor === 'true' ? '管' : '用')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-text text-sm">
              {user?.username || (isSupervisor === 'true' ? '管理员' : '用户')}
            </span>
            <span className="text-textSecondary text-xs">
              {isSupervisor === 'true' ? '管理员' : '用户'}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-textSecondary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </Dropdown>

      {/* Logout confirmation modal */}
      <LogoutModal
        visible={logoutModalVisible}
        loading={isLoggingOut}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      {/* Change password modal */}
      <AccountModal
        visible={modalVisible}
        editingUser={
          editingUser
            ? (transformApiUserToExtendedUser(
                editingUser,
              ) as unknown as PageUser)
            : null
        }
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </>
  );
};
