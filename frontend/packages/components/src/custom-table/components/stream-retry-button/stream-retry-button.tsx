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
  Progress,
  Space,
  Tooltip,
  Typography,
} from '@arco-design/web-react';
import {
  IconLoading,
  IconRefresh,
  IconSearch,
} from '@arco-design/web-react/icon';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './index.less';

import type { StreamRetryButtonProps } from '@/custom-table/types';

const { Text } = Typography;

/**
 * Stream loading retry button component
 * Specifically designed for handling rate limit errors in Argos stream loading
 */
const StreamRetryButton: React.FC<StreamRetryButtonProps> = ({
  isRetrying,
  hasError,
  errorType = 'unknown',
  needContinue = false,
  onRetry,
  autoRetryDelay = 3,
  className = '',
  hasMoreData = true,
  onLoadMore,
}) => {
  const [countdown, setCountdown] = useState(autoRetryDelay);
  const [isAutoRetrying, setIsAutoRetrying] = useState(
    hasError && autoRetryDelay > 0,
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Execute retry
  const handleRetry = useCallback(() => {
    clearTimer();
    setIsAutoRetrying(false);
    onRetry?.();
  }, [onRetry, clearTimer]);

  // Auto retry logic
  useEffect(() => {
    if (hasError && isAutoRetrying && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (hasError && isAutoRetrying && countdown === 0) {
      handleRetry();
    }

    return () => clearTimer();
  }, [hasError, isAutoRetrying, countdown, handleRetry, clearTimer]);

  // Reset state
  useEffect(() => {
    if (hasError) {
      setCountdown(autoRetryDelay);
      setIsAutoRetrying(autoRetryDelay > 0);
    } else {
      setIsAutoRetrying(false);
    }
  }, [hasError, autoRetryDelay]);

  // Error text for different error types
  const getErrorText = () => {
    switch (errorType) {
      case 'rate_limit':
        return 'Request rate limit exceeded, auto-retrying...';
      case 'concurrency_limit':
        return 'Concurrency limit exceeded, auto-retrying...';
      case 'timeout':
        return 'Request timeout, please click to retry';
      default:
        return 'Loading failed, please click to retry';
    }
  };

  // Progress bar calculation
  const progressPercent = Math.round(
    ((autoRetryDelay - countdown) / autoRetryDelay) * 100,
  );

  if (!hasError && !isRetrying) {
    // Normal state, show load more button
    const handleClick = onLoadMore || onRetry;

    if (!hasMoreData) {
      return null;
    }

    return (
      <div className={`stream-retry-button ${className}`} onClick={handleClick}>
        <IconSearch />
        <span>
          {needContinue ? 'Continue searching for more data' : 'Load more'}
        </span>
      </div>
    );
  }

  if (isRetrying) {
    // Loading state
    return (
      <div className={`stream-retry-button loading ${className}`}>
        <IconLoading />
        <span>Loading...</span>
      </div>
    );
  }

  // Error state, show retry button
  return (
    <div className={`stream-retry-button error ${className}`}>
      {isAutoRetrying ? (
        <div className="auto-retry-container">
          <Text type="warning">{getErrorText()}</Text>
          <div className="retry-progress-container">
            <Progress
              percent={progressPercent}
              showText={false}
              status="warning"
              size="small"
            />
            <Text className="countdown-text">Retry in {countdown} seconds</Text>
          </div>
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<IconRefresh />}
              onClick={handleRetry}
            >
              Retry Now
            </Button>
            <Button size="small" onClick={() => setIsAutoRetrying(false)}>
              Cancel Auto Retry
            </Button>
          </Space>
        </div>
      ) : (
        <Space>
          <Text type="warning">{getErrorText()}</Text>
          <Tooltip content="Click to retry">
            <Button type="primary" icon={<IconRefresh />} onClick={handleRetry}>
              Retry
            </Button>
          </Tooltip>
        </Space>
      )}
    </div>
  );
};

export { StreamRetryButton };
