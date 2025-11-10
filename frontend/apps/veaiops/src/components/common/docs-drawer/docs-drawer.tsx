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

import { Drawer } from '@arco-design/web-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

interface DocsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 文档抽屉组件
 * 在抽屉中通过 iframe 渲染文档内容
 */
export const DocsDrawer: React.FC<DocsDrawerProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasLoadedRef = useRef(false);

  // 获取文档 URL（开发环境使用代理，生产环境使用静态文件）
  const getDocsUrl = () => {
    // 开发环境：直接访问文档服务器（避免代理重定向问题）
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:4000/';
    }
    // 生产环境：使用绝对路径（避免相对路径在子路由下出错）
    // 使用 /veaiops/ 路径与文档 baseURL 保持一致
    return '/veaiops/';
  };

  useEffect(() => {
    if (visible) {
      // 如果之前已经加载过，直接显示内容
      if (hasLoadedRef.current) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, [visible]);

  const handleIframeLoad = () => {
    hasLoadedRef.current = true;
    setLoading(false);
  };

  return (
    <Drawer
      width="80%"
      title={
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">📖 VeAIOps 文档</span>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      className="docs-drawer"
      bodyStyle={{ padding: 0, height: '100%' }}
    >
      <div className="relative w-full h-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">加载文档中...</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={getDocsUrl()}
          className="w-full h-full border-0"
          title="VeAIOps Documentation"
          onLoad={handleIframeLoad}
          onError={() => {
            setLoading(false);
          }}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    </Drawer>
  );
};
