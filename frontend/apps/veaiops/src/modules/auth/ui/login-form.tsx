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

import { authConfig } from '@/config/auth';
import { formFields, formRules, loginStyles } from '@/modules/auth';
import {
  Button,
  Form,
  type FormInstance,
  Input,
  Message,
} from '@arco-design/web-react';
import { IconCode, IconLock, IconUser } from '@arco-design/web-react/icon';
import type { LoginRequest } from 'api-generate';
import type React from 'react';

type LoginFormData = LoginRequest;

interface LoginFormProps {
  form: FormInstance<LoginFormData>;
  loading: boolean;
  onSubmit: (
    values: LoginFormData,
  ) => Promise<{ success: boolean; error?: Error }>;
}
const LoginForm: React.FC<LoginFormProps> = ({ form, loading, onSubmit }) => {
  // Handle form submission
  const handleFormSubmit = (values: LoginFormData) => {
    // Ensure values are not empty
    if (!values || (!values.username && !values.password)) {
      const formValues = form.getFieldsValue();

      // Type safety check: ensure required fields exist
      if (formValues.username && formValues.password) {
        onSubmit(formValues);
      } else {
        // Type safety check failed, silently skip (form validation will handle required fields)
      }
    } else {
      onSubmit(values);
    }
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = loginStyles.button.hover.transform;
    e.currentTarget.style.boxShadow = loginStyles.button.hover.boxShadow;
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = loginStyles.button.leave.transform;
    e.currentTarget.style.boxShadow = loginStyles.button.leave.boxShadow;
  };

  // Development mode quick login
  const handleDevLogin = () => {
    if (authConfig.devMode.enabled) {
      // Set mock user information
      sessionStorage.setItem(
        authConfig.storageKeys.token,
        authConfig.devMode.mockUser.token,
      );
      sessionStorage.setItem(
        authConfig.storageKeys.username,
        authConfig.devMode.mockUser.username,
      );

      Message.success('开发模式登录成功');

      // Use full URL path for redirect to ensure correct navigation
      window.location.href = `${window.location.origin}${authConfig.defaultRedirectPath}`;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onSubmit={handleFormSubmit}
      className={loginStyles.form.container}
    >
      {/* Username input */}
      <Form.Item
        label={
          <span className={loginStyles.form.label}>
            {formFields.username.label}
          </span>
        }
        field="username"
        rules={formRules.username}
        requiredSymbol={false}
      >
        <Input
          prefix={<IconUser className={loginStyles.form.icon} />}
          placeholder={formFields.username.placeholder}
          size="large"
          className="h-12 rounded-lg"
        />
      </Form.Item>

      {/* Password input */}
      <Form.Item
        label={
          <span className={loginStyles.form.label}>
            {formFields.password.label}
          </span>
        }
        field="password"
        rules={formRules.password}
        requiredSymbol={false}
      >
        <Input.Password
          prefix={<IconLock className={loginStyles.form.icon} />}
          placeholder={formFields.password.placeholder}
          size="large"
          className="h-12 rounded-lg"
        />
      </Form.Item>

      {/* Login button */}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          className={`${loginStyles.button.container} h-12 rounded-lg transition-all duration-200 hover:transform hover:scale-105 hover:shadow-lg`}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          登录
        </Button>
      </Form.Item>

      {/* Development mode quick login button */}
      {authConfig.devMode.enabled && (
        <Form.Item>
          <Button
            type="outline"
            size="large"
            className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-purple-50 rounded-xl h-12"
            icon={<IconCode />}
            onClick={handleDevLogin}
          >
            开发模式快速登录
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default LoginForm;
