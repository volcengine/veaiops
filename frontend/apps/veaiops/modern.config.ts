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

import path from 'node:path';
import type { AppToolsUserConfig } from '@modern-js/app-tools';
import { appTools, defineConfig } from '@modern-js/app-tools';
import { tailwindcssPlugin } from '@modern-js/plugin-tailwindcss';

export default defineConfig({
  plugins: [
    appTools({
      bundler: 'rspack', // 使用rspack以获得更好的代理日志支持
    }),
    tailwindcssPlugin(),
  ],
  runtime: {
    router: true,
  },
  source: {
    globalVars: {
      'process.env.REACT_APP_API_BASE_URL': process.env.REACT_APP_API_BASE_URL
        ? JSON.stringify(process.env.REACT_APP_API_BASE_URL)
        : undefined,
      'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
    },
    transformImport: [
      {
        libraryName: '@arco-design/web-react',
        libraryDirectory: 'es',
        camelToDashComponentName: false,
        style: false,
      },
    ],
  },
  server: {
    port: 8000,
  },
  dev: {
    // 确保 SPA 路由正常工作
    assetPrefix: '/',
  },
  output: {
    disableTsChecker: true,
    distPath: {
      root: process.env.NODE_ENV === 'development' ? 'dist' : 'output',
    },
    assetPrefix: process.env.NODE_ENV === 'development' ? '/' : './',
    cssModules: {
      auto: (resourcePath) =>
        resourcePath.includes('.module.') &&
        ['css', 'less', 'scss'].some((suffix) => resourcePath.endsWith(suffix)),
    },
    // 确保静态资源正确复制
    copy: [
      {
        from: './public',
        to: './',
      },
      // 文档会在构建后通过 integrate-docs 脚本集成
      // 不在此处复制，避免构建顺序依赖问题
    ],
  },
  resolve: {
    alias: {
      // ==================== Wizard 组件 ====================
      // 注意：必须在 @/* 之前定义，确保更具体的别名先匹配
      '@wizard': path.resolve(__dirname, 'src/components/wizard'),

      // ==================== System 模块 (src/modules/system) ====================
      '@account': path.resolve(
        __dirname,
        'src/modules/system/features/account',
      ),
      '@project': path.resolve(
        __dirname,
        'src/modules/system/features/project',
      ),
      '@customer': path.resolve(
        __dirname,
        'src/modules/system/features/customer',
      ),
      '@card-template': path.resolve(
        __dirname,
        'src/modules/system/features/card-template',
      ),
      '@bot': path.resolve(__dirname, 'src/modules/system/features/bot'),
      '@datasource': path.resolve(
        __dirname,
        'src/modules/system/features/datasource',
      ),

      // ==================== Threshold 模块 (src/modules/threshold) ====================
      '@task-config': path.resolve(
        __dirname,
        'src/modules/threshold/features/task-config',
      ),
      '@threshold/shared': path.resolve(
        __dirname,
        'src/modules/threshold/shared',
      ),

      // ==================== Oncall 模块 (src/modules/oncall) ====================
      '@oncall/api': path.resolve(__dirname, 'src/modules/oncall/api'),
      '@oncall/shared': path.resolve(__dirname, 'src/modules/oncall/shared'),
      '@oncall-config': path.resolve(
        __dirname,
        'src/modules/oncall/features/config',
      ),

      // ==================== Event Center 模块 (src/modules/event-center) ====================
      '@ec/history': path.resolve(
        __dirname,
        'src/modules/event-center/features/history',
      ),
      '@ec/strategy': path.resolve(
        __dirname,
        'src/modules/event-center/features/strategy',
      ),
      '@ec/subscription': path.resolve(
        __dirname,
        'src/modules/event-center/features/subscription',
      ),
      '@ec/statistics': path.resolve(
        __dirname,
        'src/modules/event-center/features/statistics',
      ),
      '@ec/shared': path.resolve(__dirname, 'src/modules/event-center/shared'),

      // ==================== 包别名 ====================
      'api-generate': path.resolve(__dirname, 'api-generate'),
      '@veaiops/components': path.resolve(
        __dirname,
        '../../packages/components/src',
      ),

      // 通用路径别名
      '@/*': path.resolve(__dirname, 'src/*'),
    },
  },
  tools: {
    tailwindcss: {
      config: './tailwind.config.ts',
    },
    devServer: {
      // 配置 SPA 路由回退 - 所有非API路径都回退到 index.html
      historyApiFallback: {
        rewrites: [
          // 文档路径不回退到 index.html，由代理处理
          { from: /^\/docs/, to: (context: any) => context.parsedUrl.pathname },
          // 其他路径回退到 index.html
          { from: /./, to: '/index.html' },
        ],
      },
      proxy: {
        '/apis/v1': {
          // API代理目标地址，可通过环境变量 API_PROXY_TARGET 配置
          // 默认使用本地开发服务器 http://localhost:8000
          // 生产环境请设置正确的后端API地址
          target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',
          // 禁用自动跟随重定向，让前端处理重定向以保持 Authorization header
          followRedirects: false,
        },
        // 文档服务代理 - 开发环境使用
        '/docs': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',
          pathRewrite: { '^/docs': '/veaiops' },
          onProxyReq: (proxyReq: any, req: any, res: any) => {
            // 确保接受 HTML
            proxyReq.setHeader(
              'Accept',
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            );
          },
        },
      },
    },
  },
  // HTML配置 - 添加favicon和meta标签
  html: {
    favicon: './config/favicon.svg',
    title: '火山引擎 veaiops',
    meta: {
      viewport:
        'width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover,minimum-scale=1,maximum-scale=1,user-scalable=no',
      'theme-color': '#1890ff',
      'apple-mobile-web-app-capable': 'yes',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      description: '火山引擎智能运维平台 - veaiops',
    },
    tags: [
      {
        tag: 'link',
        attrs: {
          rel: 'manifest',
          href:
            process.env.NODE_ENV === 'development'
              ? '/manifest.webmanifest'
              : './manifest.webmanifest',
        },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'apple-touch-icon',
          href:
            process.env.NODE_ENV === 'development'
              ? '/apple-touch-icon.png'
              : './apple-touch-icon.png',
          sizes: '180x180',
        },
      },
    ],
  },
}) as AppToolsUserConfig<'rspack'>;
