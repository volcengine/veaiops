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
  /**
   * Anchor or full path with anchor
   * Examples:
   * - "指标模板管理" -> will navigate to /intelligent-threshold/user-guide#指标模板管理
   * - "/intelligent-threshold/user-guide#指标模板管理" -> will use the full path
   */
  anchor?: string;
  /**
   * Optional page path (e.g., "/intelligent-threshold/user-guide")
   * If not provided, will use default path based on anchor
   */
  pagePath?: string;
}

/**
 * Documentation drawer component
 * Render documentation content via iframe in drawer
 */
export const DocsDrawer: React.FC<DocsDrawerProps> = ({
  visible,
  onClose,
  anchor,
  pagePath,
}) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasLoadedRef = useRef(false);

  // Get documentation URL (use proxy in dev, use static files in production)
  const getDocsUrl = () => {
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000'
        : '/veaiops';

    // If anchor contains a full path (starts with /), use it directly
    if (anchor?.startsWith('/')) {
      return `${baseUrl}${anchor}`;
    }

    // If pagePath is provided, use it with anchor
    if (pagePath) {
      const path = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
      return anchor
        ? `${baseUrl}${path}#${encodeURIComponent(anchor)}`
        : `${baseUrl}${path}`;
    }

    // Default: if anchor is "指标模板管理", navigate to user-guide page
    if (anchor === '指标模板管理') {
      const path = '/intelligent-threshold/user-guide';
      return `${baseUrl}${path}#${encodeURIComponent(anchor)}`;
    }

    // Fallback: just add anchor to base URL
    return anchor ? `${baseUrl}/#${encodeURIComponent(anchor)}` : `${baseUrl}/`;
  };

  useEffect(() => {
    if (visible) {
      // Reset loading state when drawer opens
      if (!hasLoadedRef.current) {
        setLoading(true);
      }
    }
  }, [visible]);

  const handleIframeLoad = () => {
    hasLoadedRef.current = true;
    setLoading(false);

    // After iframe loads, try to scroll to anchor if provided
    // Note: The URL hash should already be set in getDocsUrl(), so the browser
    // should automatically scroll to the anchor. This is a fallback for manual scrolling.
    if (anchor && iframeRef.current?.contentWindow) {
      const iframeWindow = iframeRef.current.contentWindow;

      // Wait for Docus page to fully render (including dynamic content)
      const scrollToAnchor = () => {
        try {
          const anchorText = anchor.startsWith('/')
            ? anchor.split('#')[1]
            : anchor;

          // Try to find element by ID (Docus uses URL-encoded IDs for Chinese headings)
          let element: Element | null = null;

          // Try URL-encoded ID first (Docus standard for Chinese)
          element = iframeWindow.document.querySelector(
            `#${encodeURIComponent(anchorText)}`,
          );

          // Fallback: try plain text ID
          if (!element) {
            element = iframeWindow.document.querySelector(`#${anchorText}`);
          }

          // Fallback: try finding by heading text content
          if (!element) {
            const headings = iframeWindow.document.querySelectorAll(
              'h1, h2, h3, h4, h5, h6',
            );
            for (const heading of Array.from(headings)) {
              if (heading.textContent?.trim() === anchorText) {
                element = heading;
                break;
              }
            }
          }

          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Fallback: update URL hash to trigger browser scroll
            // This helps when the element exists but querySelector failed
            if (
              iframeWindow.location.hash !==
              `#${encodeURIComponent(anchorText)}`
            ) {
              iframeWindow.location.hash = encodeURIComponent(anchorText);
            }
          }
        } catch (error) {
          // Cross-origin error, URL hash should handle it
          // This is expected in some cases, so we don't log it as an error
        }
      };

      // Wait for page to be fully ready
      const checkReady = () => {
        if (iframeWindow.document.readyState === 'complete') {
          // Additional delay for Docus to render dynamic content
          setTimeout(scrollToAnchor, 500);
        } else {
          setTimeout(checkReady, 100);
        }
      };

      // Start checking after a short delay
      setTimeout(checkReady, 200);
    }
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
