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
      bundler: 'rspack', // Use rspack for better proxy log support
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
    // Ensure SPA routing works correctly
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
    // Ensure static assets are copied correctly
    copy: [
      {
        from: './public',
        to: './',
      },
      // Documentation will be integrated via integrate-docs script after build
      // Do not copy here to avoid build order dependency issues
    ],
  },
  resolve: {
    alias: {
      // ==================== Wizard Component ====================
      // Note: Must be defined before @/* to ensure more specific aliases match first
      '@wizard': path.resolve(__dirname, 'src/components/wizard'),

      // ==================== System Module (src/modules/system) ====================
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

      // ==================== Threshold Module (src/modules/threshold) ====================
      '@task-config': path.resolve(
        __dirname,
        'src/modules/threshold/features/task-config',
      ),
      '@threshold/shared': path.resolve(
        __dirname,
        'src/modules/threshold/shared',
      ),

      // ==================== Oncall Module (src/modules/oncall) ====================
      '@oncall/api': path.resolve(__dirname, 'src/modules/oncall/api'),
      '@oncall/shared': path.resolve(__dirname, 'src/modules/oncall/shared'),
      '@oncall-config': path.resolve(
        __dirname,
        'src/modules/oncall/features/config',
      ),

      // ==================== Event Center Module (src/modules/event-center) ====================
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

      // ==================== Package Aliases ====================
      'api-generate': path.resolve(__dirname, 'api-generate'),
      '@veaiops/components': path.resolve(
        __dirname,
        '../../packages/components/src',
      ),

      // Common path aliases
      '@/*': path.resolve(__dirname, 'src/*'),
    },
  },
  tools: {
    tailwindcss: {
      config: './tailwind.config.ts',
    },
    devServer: {
      // Configure SPA route fallback - all non-API paths fall back to index.html
      historyApiFallback: {
        rewrites: [
          // Documentation paths do not fall back to index.html, handled by proxy
          { from: /^\/docs/, to: (context: any) => context.parsedUrl.pathname },
          // Other paths fall back to index.html
          { from: /./, to: '/index.html' },
        ],
      },
      proxy: {
        '/apis/v1': {
          // API proxy target address, can be configured via API_PROXY_TARGET environment variable
          // Defaults to local development server http://localhost:8000
          // Production environment should set correct backend API address
          target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',
          // Disable automatic redirect following, let frontend handle redirects to maintain Authorization header
          followRedirects: false,
        },
        // Documentation service proxy - for development environment
        '/docs': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          logLevel: 'debug',
          pathRewrite: { '^/docs': '/veaiops' },
          onProxyReq: (proxyReq: any, req: any, res: any) => {
            // Ensure HTML is accepted
            proxyReq.setHeader(
              'Accept',
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            );
          },
        },
      },
    },
  },
  // HTML configuration - add favicon and meta tags
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
