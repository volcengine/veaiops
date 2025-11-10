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

import { Button, Typography } from '@arco-design/web-react';
import {
  IconClose,
  IconCommon,
  IconDashboard,
  IconInfoCircleFill,
  IconStarFill,
  IconThunderbolt,
} from '@arco-design/web-react/icon';
import type React from 'react';

import type { GlobalGuideStep } from '../../lib';
import {
  exportGlobalGuideLogs,
  getGlobalGuideLogSession,
  isGlobalGuideLogCollecting,
  quickExportGlobalGuideLogs,
  startGlobalGuideLogCollection,
} from '../../lib';
import style from '../styles/index.module.less';
import type { OnFeatureClickParams } from './frontend-feature-item';
import { FrontendFeatureItem } from './frontend-feature-item';

const { Title, Text } = Typography;

interface ExpandedPanelProps {
  panelContentVisible: boolean;
  currentStepConfig: GlobalGuideStep | null;
  onClosePanelContent: () => void;
  onStepClick: (stepNumber: number) => void;
  onFrontendFeatureClick: (params: OnFeatureClickParams) => void;
}

/**
 * Expanded guide panel component
 */
export const ExpandedPanel: React.FC<ExpandedPanelProps> = ({
  panelContentVisible,
  currentStepConfig,
  onClosePanelContent,
  onStepClick,
  onFrontendFeatureClick,
}) => {
  // Wrap frontend feature click handling, automatically close panel after click
  const handleFrontendFeatureClickWithClose = (
    params: OnFeatureClickParams,
  ) => {
    // Execute original feature click logic first (async, will continue executing)
    onFrontendFeatureClick(params);

    // Immediately close panel to give user feedback
    // Prerequisite steps' async execution will continue, won't be interrupted
    onClosePanelContent();
  };

  if (!panelContentVisible) {
    return null;
  }

  return (
    <div className={style.expandedPanel}>
      <div className={style.panelHeader}>
        <Title heading={6} className={style.panelTitle}>
          全局配置向导
        </Title>
        <Button
          type="text"
          size="small"
          icon={<IconClose />}
          onClick={onClosePanelContent}
          className={style.closeBtn}
        />
      </div>

      <div className={style.panelContent}>
        {/* Welcome Section */}
        <div className={style.welcomeSection}>
          <div className={style.welcomeIcon}>
            <div className={style.cloudIcon}>
              <div className={style.cloudShape} />
              <div className={style.sparkleIcon}>
                <IconThunderbolt
                  style={{ fontSize: '20px', color: '#165dff' }}
                />
              </div>
            </div>
          </div>
          <Text className={style.welcomeText}>
            <IconCommon style={{ fontSize: '16px', marginRight: '4px' }} />
            你想做什么?
          </Text>
        </div>

        {/* Current step information */}
        {currentStepConfig && (
          <div className={style.currentStepInfo}>
            <div className={style.stepHeader}>
              <div className={style.stepNumber}>{currentStepConfig.number}</div>
              <div className={style.stepTitle}>{currentStepConfig.title}</div>
            </div>
            <Text className={style.stepDescription}>
              {currentStepConfig.description}
            </Text>
          </div>
        )}

        {/* Platform features */}
        {currentStepConfig && (
          <div className={style.frontendFeatures}>
            <Text className={style.featuresTitle}>
              <IconStarFill
                style={{
                  fontSize: '14px',
                  marginRight: '4px',
                  color: '#ffb400',
                }}
              />
              模版功能：
            </Text>
            <div className={style.featuresList}>
              {currentStepConfig.frontendFeatures.map((feature) => (
                <FrontendFeatureItem
                  key={feature.id}
                  feature={feature}
                  currentRoute={currentStepConfig.route}
                  onFeatureClick={handleFrontendFeatureClickWithClose}
                  onGoToConfig={onStepClick}
                  highlighted={feature.id === 'new-connection'}
                  currentStepConfig={currentStepConfig}
                />
              ))}
            </div>
          </div>
        )}

        {/* Log export tool - only shown in development environment */}
        {process.env.NODE_ENV === 'development' && (
          <div className={style.logExporterSection}>
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <Text style={{ fontSize: '12px', color: '#666' }}>
                <IconDashboard
                  style={{ fontSize: '14px', marginRight: '4px' }}
                />
                日志导出工具
              </Text>
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => {
                    console.log('🚀 开始收集前往配置全链路日志...');

                    // Use dedicated GlobalGuide log collector
                    const sessionId = startGlobalGuideLogCollection({
                      featureId: 'goto-config',
                      stepNumber: currentStepConfig?.number,
                    });

                    // Show prompt
                    console.log(
                      `✅ GlobalGuide 日志收集已开始！\n\n会话ID: ${sessionId}\n\n现在请点击"前往配置"按钮，系统将自动收集全链路日志。\n\n完成后请点击"导出日志"按钮下载日志文件。`,
                    );
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  开始收集
                </button>
                <button
                  onClick={() => {
                    console.log('🚀 开始收集前往配置全链路日志...');

                    // Use dedicated GlobalGuide log collector
                    const sessionId = startGlobalGuideLogCollection({
                      featureId: 'goto-config',
                      stepNumber: currentStepConfig?.number,
                    });

                    // Show prompt
                    console.log(
                      `✅ GlobalGuide 日志收集已开始！\n\n会话ID: ${sessionId}\n\n现在请点击"前往配置"按钮，系统将自动收集全链路日志。\n\n完成后请点击"导出日志"按钮下载日志文件。`,
                    );
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  开始收集
                </button>
                <button
                  onClick={() => {
                    // Use dedicated GlobalGuide log collector to export
                    const filename = exportGlobalGuideLogs();
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  导出日志
                </button>
                <button
                  onClick={() => {
                    const selectors = [
                      '#new-datasource-btn',
                      '[data-testid="new-datasource-btn"]',
                      '[data-testid="delete-datasource-btn"]',
                      '[data-testid="edit-datasource-btn"]',
                      '[data-testid="toggle-datasource-btn"]',
                      '[data-testid="new-connection-btn"]',
                      '[data-testid="edit-connection-btn"]',
                      '[data-testid="test-connection-btn"]',
                      '[data-testid="delete-connection-btn"]',
                    ];

                    selectors.forEach((selector) => {
                      document.querySelector(selector);
                    });
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#fa8c16',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  检查元素
                </button>
                <button
                  onClick={() => {
                    // Use quick export functionality
                    const filename = quickExportGlobalGuideLogs();
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#722ed1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  快速导出
                </button>
                <button
                  onClick={() => {
                    const session = getGlobalGuideLogSession();
                    const isCollecting = isGlobalGuideLogCollecting();
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#fa8c16',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  收集状态
                </button>
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '10px',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconInfoCircleFill
                  style={{ fontSize: '12px', marginRight: '4px' }}
                />
                使用说明：1. 点击"开始收集" → 2. 点击"前往配置" → 3.
                点击"导出日志"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
