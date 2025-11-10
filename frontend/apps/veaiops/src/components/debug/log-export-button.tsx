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

import {
  Button,
  Message,
  Modal,
  Space,
  Typography,
} from '@arco-design/web-react';
import {
  IconDelete,
  IconDownload,
  IconInfoCircle,
} from '@arco-design/web-react/icon';
import {
  clearCollectedLogs,
  exportLogsToFile,
  getLogCount,
  logger,
  startLogCollection,
} from '@veaiops/utils';
import type React from 'react';
import { useEffect, useState } from 'react';

const { Text } = Typography;

/**
 * Log export debug button component
 * Used to manually export debug logs for troubleshooting
 */
export const LogExportButton: React.FC<{
  buttonText?: string;
  showCount?: boolean;
  showClearButton?: boolean;
  autoStart?: boolean;
  position?: 'fixed' | 'inline';
}> = ({
  buttonText = '导出日志',
  showCount = true,
  showClearButton = true,
  autoStart = true,
  position = 'fixed',
}) => {
  const [logCount, setLogCount] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    if (autoStart) {
      startLogCollection();
      setIsCollecting(true);
    }

    // Periodically update log count
    const interval = setInterval(() => {
      setLogCount(getLogCount());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [autoStart]);

  const handleExportLogs = () => {
    try {
      // ✅ Correct: Use logger to record debug information
      logger.debug({
        message: '开始导出日志',
        data: {},
        source: 'LogExportButton',
        component: 'handleExportLogs',
      });

      // Try to export logs from all components
      if (typeof (window as any).exportAllComponentLogs === 'function') {
        logger.debug({
          message: '找到 exportAllComponentLogs 函数',
          data: {},
          source: 'LogExportButton',
          component: 'handleExportLogs',
        });
        const allLogs = (window as any).exportAllComponentLogs();

        const { components } = allLogs.metadata;
        const totalLogs = allLogs.metadata.total;

        // ✅ Correct: Use logger to record log statistics
        logger.info({
          message: '日志统计',
          data: { metadata: allLogs.metadata },
          source: 'LogExportButton',
          component: 'handleExportLogs',
        });

        let message = `成功导出 ${totalLogs} 条日志 (`;
        const parts: string[] = [];
        if (components.Filters > 0) {
          parts.push(`Filters: ${components.Filters}`);
        }
        if (components.TableFilterPlugin > 0) {
          parts.push(`TableFilter: ${components.TableFilterPlugin}`);
        }
        if (components.CustomTable) {
          parts.push(`CustomTable: ${components.CustomTable || 0}`);
        }
        if (components.SelectBlock) {
          parts.push(`SelectBlock: ${components.SelectBlock || 0}`);
        }
        if (components.QuerySync) {
          parts.push(`QuerySync: ${components.QuerySync || 0}`);
        }
        // 🔥 New: Display VeAIOps Utils log statistics
        if (components.VeAIOpsUtils) {
          parts.push(`VeAIOps: ${components.VeAIOpsUtils || 0}`);
        }
        message += `${parts.join(', ')})`;

        Message.success({
          content: message,
          duration: 3000,
        });

        logger.info({
          message: '日志导出成功',
          data: { totalLogs, components },
          source: 'LogExportButton',
          component: 'handleExportLogs',
        });
        return;
      }

      // ✅ Correct: Use logger to record warning
      logger.warn({
        message: 'exportAllComponentLogs 函数不存在，使用降级方案',
        data: {},
        source: 'LogExportButton',
        component: 'handleExportLogs',
      });

      // Fallback: Use default log export
      const count = getLogCount();
      if (count === 0) {
        Message.warning('暂无日志可导出');
        return;
      }

      exportLogsToFile();
      Message.success(`成功导出 ${count} 条日志`);
    } catch (error) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '导出日志失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'LogExportButton',
        component: 'handleExportLogs',
      });
      const errorMessage = errorObj.message;
      Message.error(`导出日志失败: ${errorMessage}`);
    }
  };

  const handleClearLogs = () => {
    Modal.confirm({
      title: '确认清空日志',
      content: `当前有 ${logCount} 条日志，确定要清空吗？`,
      onOk: () => {
        try {
          clearCollectedLogs();
          setLogCount(0);
          Message.success('已清空日志');
        } catch (error) {
          // ✅ Correct: Expose actual error information
          const errorMessage =
            error instanceof Error ? error.message : '清空日志失败';
          Message.error(errorMessage);
        }
      },
    });
  };

  const handleShowInfo = () => {
    // Try to get loop detection information
    let loopDetection = null;
    try {
      if (typeof (window as any).detectSelectBlockLoop === 'function') {
        loopDetection = (window as any).detectSelectBlockLoop();
      }
    } catch (error) {
      // Silent handling: Loop detection failure does not affect main flow
      // Error details can be accessed via error variable (if needed)
    }

    Modal.info({
      title: '日志调试说明',
      content: (
        <div>
          <p>
            <strong>日志收集范围：</strong>
          </p>
          <ul>
            <li>SelectBlock（下拉选择器）相关日志</li>
            <li>CustomTable（自定义表格）相关日志</li>
            <li>Filters（筛选器）相关日志</li>
            <li>Subscription（订阅机制）相关日志</li>
            <li>QuerySync（查询同步）相关日志</li>
            <li>MonitorAccess（监控数据源管理）相关日志</li>
            <li>🔥 Drawer、ConnectionManager、DataSourceWizard 相关日志</li>
            <li>🔥 useDataSourceHandlers、ManagementPage 相关日志</li>
            <li>其他 VeAIOps 系统日志</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            <strong>使用说明：</strong>
          </p>
          <ol>
            <li>日志会自动收集到浏览器内存中</li>
            <li>点击"导出日志"按钮下载日志文件</li>
            <li>日志文件为 JSON 格式，可用任意编辑器打开</li>
            <li>建议在复现问题后立即导出日志</li>
          </ol>
          {loopDetection && loopDetection.highFrequencyMessages.length > 0 && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#fff7e6',
                borderRadius: '4px',
              }}
            >
              <Text type="warning">
                <strong>⚠️ 检测到高频日志：</strong>
              </Text>
              <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                {loopDetection.highFrequencyMessages
                  .slice(0, 3)
                  .map(([msg, count]: [string, number]) => (
                    <li key={msg}>
                      {msg}: {count} 次
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <p style={{ marginTop: '12px' }}>
            <Text type="secondary">
              当前日志数：{logCount} 条{isCollecting && ' | 收集状态：进行中'}
            </Text>
          </p>
          <p style={{ marginTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              💡 提示：在控制台输入 <code>window.detectSelectBlockLoop()</code>{' '}
              可查看详细的循环检测报告
            </Text>
          </p>
        </div>
      ),
      style: { width: 650 },
    });
  };

  const containerStyle: React.CSSProperties =
    position === 'fixed'
      ? {
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
        }
      : {};

  // Only display in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={containerStyle}>
      <Space>
        {showCount && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            日志: {logCount} 条
          </Text>
        )}
        <Button
          type="primary"
          size="small"
          icon={<IconDownload />}
          onClick={handleExportLogs}
          disabled={logCount === 0}
        >
          {buttonText}
        </Button>
        {showClearButton && (
          <Button
            type="outline"
            size="small"
            icon={<IconDelete />}
            onClick={handleClearLogs}
            disabled={logCount === 0}
            status="warning"
          >
            清空
          </Button>
        )}
        <Button
          type="text"
          size="small"
          icon={<IconInfoCircle />}
          onClick={handleShowInfo}
        />
      </Space>
    </div>
  );
};

export default LogExportButton;
