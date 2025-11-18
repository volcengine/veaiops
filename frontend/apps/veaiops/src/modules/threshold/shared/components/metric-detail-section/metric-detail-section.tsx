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

import { DocsDrawer } from '@/components/common/docs-drawer';
import { Button } from '@arco-design/web-react';
import { WrapperWithTitle } from '@veaiops/components';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';

interface MetricDetailSectionProps {
  /**
   * Title level for WrapperWithTitle (1-4)
   * @default 2
   */
  level?: 1 | 2 | 3 | 4;
  /**
   * Custom style for the wrapper
   */
  style?: React.CSSProperties;
  /**
   * Content to display inside the section
   */
  children: ReactNode;
  /**
   * Whether to use WrapperWithTitle component (recommended) or simple div
   * @default true
   */
  useWrapper?: boolean;
}

/**
 * Metric Detail Section Component
 *
 * Unified component for displaying metric detail sections with title and view docs button
 * Used across multiple forms in threshold module to avoid code duplication
 */
export const MetricDetailSection: FC<MetricDetailSectionProps> = ({
  level = 2,
  style,
  children,
  useWrapper = true,
}) => {
  const [docsDrawerVisible, setDocsDrawerVisible] = useState(false);

  const handleOpenDocs = () => {
    setDocsDrawerVisible(true);
  };

  if (useWrapper) {
    return (
      <>
        <WrapperWithTitle
          title="指标详情"
          level={level}
          style={style}
          actions={
            <Button
              type="text"
              size="small"
              onClick={handleOpenDocs}
              className="text-blue-600 hover:text-blue-700"
            >
              📖 查看文档
            </Button>
          }
        >
          {children}
        </WrapperWithTitle>
        <DocsDrawer
          visible={docsDrawerVisible}
          onClose={() => setDocsDrawerVisible(false)}
          anchor="指标模板管理"
        />
      </>
    );
  }

  return (
    <>
      <div style={style}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">指标详情</h3>
          <Button
            type="text"
            size="small"
            onClick={handleOpenDocs}
            className="text-blue-600 hover:text-blue-700"
          >
            📖 查看文档
          </Button>
        </div>
        {children}
      </div>
      <DocsDrawer
        visible={docsDrawerVisible}
        onClose={() => setDocsDrawerVisible(false)}
        anchor="指标模板管理"
      />
    </>
  );
};

export default MetricDetailSection;
