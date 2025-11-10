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

import type React from 'react';

// Import using path alias - Components

import { AnimatedBackground } from '@/components';
// Local component imports
import LoginCard from './login-card';
import LoginForm from './login-form';
import LoginHeader from './login-header';

// Import using path alias - Configuration
import { loginStyles } from '@/modules/auth';

// Import using path alias - Hooks
import { useLogin } from '@/hooks';

const LoginPage: React.FC = () => {
  const { form, loading, handleSubmit } = useLogin();

  return (
    <AnimatedBackground>
      <div className={loginStyles.background.container}>
        <LoginCard>
          <LoginHeader />
          <LoginForm form={form} loading={loading} onSubmit={handleSubmit} />
        </LoginCard>
      </div>
    </AnimatedBackground>
  );
};

export default LoginPage;
