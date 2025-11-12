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
 * Documentation drawer component
 * Render documentation content via iframe in drawer
 */
export const DocsDrawer: React.FC<DocsDrawerProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasLoadedRef = useRef(false);

  // Get documentation URL (use proxy in dev, use static files in production)
  const getDocsUrl = () => {
    // Development environment: access documentation server directly (avoid proxy redirect issues)
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:4000/';
    }
    // Production environment: use absolute path (avoid relative path errors in sub-routes)
    // Use /veaiops/ path to keep consistent with documentation baseURL
    return '/veaiops/';
  };

  useEffect(() => {
    if (visible) {
      // If already loaded before, show content directly
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
