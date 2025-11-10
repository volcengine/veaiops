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

import thinkingBg from '@/assets/thinking.png';
import { Tag, Typography } from '@arco-design/web-react';
import { IconInfoCircle } from '@arco-design/web-react/icon';
import { DATA_SOURCE_LABELS } from '@veaiops/constants';
import type { ConfigSectionProps, TypeConfig } from './types';

const { Text } = Typography;

interface HeaderProps extends ConfigSectionProps {
  typeConfig: TypeConfig;
}

/**
 * Datasource detail header card
 *
 * Contains gradient background, datasource type, status, and other information
 */
export const Header: React.FC<HeaderProps> = ({ datasource, typeConfig }) => {
  return (
    <>
      {/* Datasource type card - with background image */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-lg relative">
        {/* Background layer */}
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{
            backgroundImage: `url(${thinkingBg})`,
          }}
        />

        {/* Gradient mask layer */}
        <div className="absolute inset-0 opacity-85" />

        {/* Content layer */}
        <div className="p-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-white/25">
              <span className="text-white text-2xl">{typeConfig.icon}</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-white mb-1">
                {datasource.name}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Tag
                  color={typeConfig.color}
                  size="small"
                  className="bg-white/90"
                >
                  {DATA_SOURCE_LABELS[
                    datasource.type as unknown as keyof typeof DATA_SOURCE_LABELS
                  ] || typeConfig.label}
                </Tag>
                {datasource.is_active ? (
                  <Tag color="green" size="small" className="bg-white/90">
                    ✓ 已启用
                  </Tag>
                ) : (
                  <Tag color="red" size="small" className="bg-white/90">
                    ✕ 已禁用
                  </Tag>
                )}
              </div>
              {datasource.description && (
                <Text className="text-sm text-white mt-1 block [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
                  {datasource.description}
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information tip */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <IconInfoCircle className="text-blue-500 text-sm mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <div className="font-medium mb-1">数据源说明</div>
            <div>此数据源用于智能阈值任务的监控数据采集和告警规则注入</div>
          </div>
        </div>
      </div>
    </>
  );
};
