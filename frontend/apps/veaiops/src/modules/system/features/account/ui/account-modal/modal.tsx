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

import { Button, Drawer, Form, Space } from '@arco-design/web-react';
import { IconLock, IconSafe, IconUserAdd } from '@arco-design/web-react/icon';
import { CardWithTitle } from '@veaiops/components';
import { DrawerFormContent, useDrawerFormSubmit } from '@veaiops/utils';
import type React from 'react';
import {
  AccountInfo,
  AdminWarningCard,
  BasicInfoFields,
  ChangePasswordInfoCard,
  CreateAccountInfoCard,
} from './components';
import {
  type AccountModalProps,
  emailRules,
  newPasswordRules,
  passwordRules,
  roleRules,
  statusRules,
  usernameRules,
} from './lib';

/**
 * Account modal component
 * Provides account creation and editing functionality
 */
export const AccountModal: React.FC<AccountModalProps> = ({
  visible,
  editingUser,
  onCancel,
  onSubmit,
  form,
}) => {
  // Use common drawer form submit Hook
  const { submitting, handleSubmit } = useDrawerFormSubmit({
    form,
    onSubmit,
    resetOnSuccess: true,
    closeOnSuccess: false, // Don't auto-close, controlled by parent component
  });

  return (
    <Drawer
      width={600}
      title={
        <Space size={8}>
          {editingUser ? <IconLock /> : <IconUserAdd />}
          <span>{editingUser ? '修改密码' : '新增账号'}</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={
        <div className="text-right">
          <Space>
            <Button onClick={onCancel} disabled={submitting}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              icon={editingUser ? <IconSafe /> : <IconUserAdd />}
            >
              {editingUser ? '更新密码' : '创建账号'}
            </Button>
          </Space>
        </div>
      }
    >
      <DrawerFormContent loading={submitting}>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          disabled={Boolean(editingUser)}
        >
          {/* Create account info */}
          {!editingUser && <CreateAccountInfoCard />}

          {/* Change password info - regular user */}
          {editingUser && !editingUser.is_supervisor && (
            <ChangePasswordInfoCard />
          )}

          {/* System administrator warning */}
          {editingUser?.is_supervisor && (
            <AdminWarningCard username={editingUser.username} />
          )}

          {/* Basic information */}
          <CardWithTitle title="基本信息" className="mb-4">
            <BasicInfoFields
              editingUser={editingUser}
              usernameRules={usernameRules}
              emailRules={emailRules}
              passwordRules={passwordRules}
              newPasswordRules={newPasswordRules}
              roleRules={roleRules}
              statusRules={statusRules}
            />
          </CardWithTitle>

          {/* Account information (only shown when editing) */}
          {editingUser && (
            <CardWithTitle title="账号信息" className="mb-4">
              <AccountInfo editingUser={editingUser} />
            </CardWithTitle>
          )}
        </Form>
      </DrawerFormContent>
    </Drawer>
  );
};
