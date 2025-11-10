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
  startLogCollection,
} from '@veaiops/utils';
import type React from 'react';
import { useEffect, useState } from 'react';

const { Text } = Typography;

/**
 * Log export debug button component
 * Used to manually export debug logs for troubleshooting
 */
export interface LogExportButtonProps {
  buttonText?: string;
  showCount?: boolean;
  showClearButton?: boolean;
  autoStart?: boolean;
  position?: 'fixed' | 'inline';
}

export const LogExportButton: React.FC<LogExportButtonProps> = ({
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
    const count = getLogCount();
    if (count === 0) {
      Message.warning('暂无日志可导出');
      return;
    }

    try {
      exportLogsToFile();
      Message.success(`成功导出 ${count} 条日志`);
    } catch (error) {
      // ✅ Correct: Expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '导出日志失败';
      Message.error(errorMessage);
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
    Modal.info({
      title: '日志调试说明',
      content: (
        <div>
          <p>
            <strong>日志收集范围：</strong>
          </p>
          <ul>
            <li>Subscription（订阅机制）相关日志</li>
            <li>QuerySync（查询同步）相关日志</li>
            <li>MonitorAccess（监控数据源管理）相关日志</li>
            <li>CustomTable 相关日志</li>
            <li>其他 VeAIOps 系统日志</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            <strong>使用说明：</strong>
          </p>
          <ol>
            <li>日志会自动收集到浏览器内存中</li>
            <li>点击"导出日志"按钮下载日志文件</li>
            <li>日志文件为文本格式，可用任意编辑器打开</li>
            <li>建议在复现问题后立即导出日志</li>
          </ol>
          <p style={{ marginTop: '12px' }}>
            <Text type="secondary">
              当前日志数：{logCount} 条{isCollecting && ' | 收集状态：进行中'}
            </Text>
          </p>
        </div>
      ),
      style: { width: 600 },
    });
  };

  const containerStyle: React.CSSProperties =
    position === 'fixed'
      ? {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
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
