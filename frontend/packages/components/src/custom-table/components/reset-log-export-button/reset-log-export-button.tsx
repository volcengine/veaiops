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

/**
 * Reset log export button component
 * Provides one-click export functionality for reset operation related logs
 */

import { devLog } from '@/custom-table/utils/log-utils';
import { performanceLogger } from '@/custom-table/utils/performance-logger';
import { resetLogAnalyzer } from '@/custom-table/utils/reset-log-analyzer';
import { resetLogCollector } from '@/custom-table/utils/reset-log-collector';
import { Button, Message, Modal } from '@arco-design/web-react';
import { IconDownload } from '@arco-design/web-react/icon';
import React, { useState } from 'react';

interface ResetLogExportButtonProps {
  /** Button text */
  text?: string;
  /** Button type */
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  /** Button size */
  size?: 'mini' | 'small' | 'default' | 'large';
  /** Whether to show log count */
  showCount?: boolean;
  /** Custom style */
  style?: React.CSSProperties;
  /** Custom class name */
  className?: string;
  /** Whether to enable log collection */
  enableLogging?: boolean;
}

/**
 * Reset log export button
 */
export const ResetLogExportButton: React.FC<ResetLogExportButtonProps> = ({
  text = 'Export Logs',
  type = 'primary',
  size = 'default',
  showCount = true,
  style,
  className,
  enableLogging = true,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Get log statistics
  const getLogStats = () => {
    const resetStats = resetLogCollector.getStats();
    const performanceStats = performanceLogger.getStats();
    const currentSession = resetLogCollector.getCurrentSession();

    return {
      reset: {
        totalSessions: resetStats.totalSessions,
        totalLogs: resetStats.totalLogs,
        errorRate: resetStats.errorRate || 0,
      },
      performance: {
        totalRenders: performanceStats.totalRenders,
      },
      currentSession: currentSession
        ? {
            id: currentSession.sessionId,
            logs: currentSession.logs.length,
            duration: Date.now() - currentSession.startTime,
          }
        : null,
    };
  };

  // Handle export logs
  const handleExportLogs = async () => {
    if (!enableLogging) {
      Message.warning('Log collection is not enabled');
      return;
    }

    setIsExporting(true);

    try {
      // Ensure current session ends
      if (resetLogCollector.getCurrentSession()) {
        resetLogCollector.endSession();
      }

      // Export reset logs
      resetLogCollector.exportResetLogs();

      Message.success('Reset logs exported successfully');
    } catch (error: unknown) {
      // ✅ Correct: Use devLog to record errors and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.error({
        component: 'ResetLogExportButton',
        message: `Failed to export logs: ${errorObj.message}`,
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
      });
      Message.error(`Failed to export logs: ${errorObj.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export analysis report
  const handleExportAnalysis = async () => {
    if (!enableLogging) {
      Message.warning('Log collection is not enabled');
      return;
    }

    setIsExporting(true);

    try {
      // Export analysis report
      resetLogAnalyzer.exportAnalysisReport();

      Message.success('Analysis report exported successfully');
    } catch (error: unknown) {
      // ✅ Correct: Use devLog to record errors and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      devLog.error({
        component: 'ResetLogExportButton',
        message: `Failed to export analysis report: ${errorObj.message}`,
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
      });
      Message.error(`Failed to export analysis report: ${errorObj.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle preview logs
  const handlePreviewLogs = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // Prevent default right-click menu
    }

    if (!enableLogging) {
      Message.warning('Log collection is not enabled');
      return;
    }

    setShowPreview(true);
  };

  // Preview log content
  const previewLogs = () => {
    const stats = getLogStats();
    const sessions = resetLogCollector.getAllSessions();
    const performanceStats = performanceLogger.getStats();

    return {
      metadata: {
        exportTime: new Date().toISOString(),
        totalResetSessions: stats.reset.totalSessions,
        totalResetLogs: stats.reset.totalLogs,
        totalPerformanceLogs: stats.performance.totalRenders,
        currentSession: stats.currentSession,
      },
      resetSessions: sessions.slice(-5), // Last 5 sessions
      performanceStats, // Performance statistics
    };
  };

  const stats = getLogStats();
  const totalLogs = stats.reset.totalLogs + stats.performance.totalRenders;

  return (
    <>
      <Button
        type={type}
        size={size}
        icon={<IconDownload />}
        loading={isExporting}
        onClick={handleExportLogs}
        onContextMenu={handlePreviewLogs}
        style={style}
        className={className}
      >
        {text}
        {showCount && totalLogs > 0 && ` (${totalLogs})`}
      </Button>

      {/* Analysis report export button */}
      <Button
        type="outline"
        size={size}
        icon={<IconDownload />}
        loading={isExporting}
        onClick={handleExportAnalysis}
        style={{ marginLeft: '8px', ...style }}
        className={className}
      >
        Export Analysis Report
      </Button>

      {/* Log preview modal */}
      <Modal
        title="Log Preview"
        visible={showPreview}
        onCancel={() => setShowPreview(false)}
        onOk={() => setShowPreview(false)}
        style={{ width: '800px', top: 20 }}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '12px',
              lineHeight: '1.4',
            }}
          >
            {JSON.stringify(previewLogs(), null, 2)}
          </pre>
        </div>
      </Modal>
    </>
  );
};

/**
 * Reset log control panel
 * Provides log collection toggle and statistics
 */
export const ResetLogControlPanel: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [stats, setStats] = useState<{
    reset: { totalSessions: number; totalLogs: number; errorRate: number };
    performance: { totalRenders: number };
    currentSession: { id: string; logs: number; duration: number } | null;
  } | null>(null);

  const getLogStats = () => {
    const resetStats = resetLogCollector.getStats();
    const performanceStats = performanceLogger.getStats();
    const currentSession = resetLogCollector.getCurrentSession();

    return {
      reset: {
        totalSessions: resetStats.totalSessions,
        totalLogs: resetStats.totalLogs,
        errorRate: resetStats.errorRate || 0,
      },
      performance: {
        totalRenders: performanceStats.totalRenders,
      },
      currentSession: currentSession
        ? {
            id: currentSession.sessionId,
            logs: currentSession.logs.length,
            duration: Date.now() - currentSession.startTime,
          }
        : null,
    };
  };

  const handleToggleLogging = () => {
    if (isEnabled) {
      resetLogCollector.disable();
      setIsEnabled(false);
    } else {
      resetLogCollector.enable();
      setIsEnabled(true);
    }
  };

  const handleRefreshStats = () => {
    setStats(getLogStats());
  };

  React.useEffect(() => {
    if (isEnabled) {
      const interval = setInterval(handleRefreshStats, 1000);
      return () => clearInterval(interval);
    }
    return () => undefined;
  }, [isEnabled, handleRefreshStats]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 9999,
        minWidth: '200px',
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <Button
          type={isEnabled ? 'primary' : 'outline'}
          size="small"
          onClick={handleToggleLogging}
        >
          {isEnabled ? 'Stop Collection' : 'Start Collection'}{' '}
        </Button>
      </div>

      {isEnabled && stats && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>Reset Sessions: {stats.reset.totalSessions}</div>{' '}
          <div>Reset Logs: {stats.reset.totalLogs}</div>{' '}
          <div>Render Count: {stats.performance.totalRenders}</div>{' '}
          <div>Error Rate: {stats.reset.errorRate.toFixed(1)}%</div>{' '}
        </div>
      )}

      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
        <ResetLogExportButton
          size="small"
          text="Export Logs"
          enableLogging={isEnabled}
        />
        <Button
          size="small"
          type="outline"
          onClick={() => resetLogAnalyzer.exportAnalysisReport()}
          disabled={!isEnabled}
        >
          Analysis Report
        </Button>
      </div>
    </div>
  );
};

export default ResetLogExportButton;
