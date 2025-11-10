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

// Login page style configuration
export const loginStyles = {
  // Background style
  background: {
    container: 'min-h-screen flex items-center justify-center p-4',
  },

  // Card style
  card: {
    container: 'w-96 p-8 shadow-2xl border-0',
    style: {
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(139, 69, 255, 0.2)',
      boxShadow:
        '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 69, 255, 0.1)',
    },
  },

  // Logo style
  logo: {
    container:
      'w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden',
    style: {
      background:
        'linear-gradient(135deg, #8b45ff 0%, #6a0dad 50%, #4b0082 100%)',
      boxShadow:
        '0 15px 35px rgba(139, 69, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    highlight: {
      container: 'absolute inset-0 opacity-30',
      style: {
        background:
          'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
      },
    },
    icon: 'text-white text-3xl relative z-10',
  },

  // Title style
  title: {
    container: 'mb-3 text-white font-bold text-3xl',
    style: {
      background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },

  // Subtitle style
  subtitle: 'text-gray-300 text-lg',

  // Form style
  form: {
    container: 'space-y-6',
    label: 'text-gray-300 font-medium',
    input: {
      style: {},
    },
    icon: 'text-gray-400',
  },

  // Button style
  button: {
    container: 'w-full border-0',
    style: {
      background:
        'linear-gradient(135deg, #8b45ff 0%, #6a0dad 50%, #4b0082 100%)',
      height: '52px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(139, 69, 255, 0.4)',
      transition: 'all 0.3s ease',
    },
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 35px rgba(139, 69, 255, 0.6)',
    },
    leave: {
      transform: 'translateY(0)',
      boxShadow: '0 8px 25px rgba(139, 69, 255, 0.4)',
    },
  },

  // Footer information style
  footer: {
    container: 'text-center mt-8',
    text: 'text-gray-400 text-sm leading-relaxed',
  },
} as const;

// Form validation rules
export const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { minLength: 2, message: '用户名至少2个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6个字符' },
  ],
};

// Form field configuration
export const formFields = {
  username: {
    label: '用户名',
    placeholder: '请输入用户名',
    icon: 'IconUser',
  },
  password: {
    label: '密码',
    placeholder: '请输入密码',
    icon: 'IconLock',
  },
} as const;
