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

import activeAgentImage from '@/assets/active_agent.jpg';
import ativeUserImage from '@/assets/ative_user.jpg';
import dailyEventImage from '@/assets/daily_event.jpg';
import dailyMessageImage from '@/assets/daily_message.png';
import { Grid } from '@arco-design/web-react';
import {
  IconMessage,
  IconNotification,
  IconRobot,
  IconUser,
} from '@arco-design/web-react/icon';
import type { SystemStatistics } from 'api-generate';
import type React from 'react';
import styles from './core-metrics-cards.module.less';

const { Row, Col } = Grid;

interface CoreMetricsCardsProps {
  statistics: SystemStatistics | null;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  backgroundImage?: string;
  prefix?: string;
}

/**
 * Single metric card component
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  backgroundImage = ativeUserImage,
  prefix,
}) => {
  return (
    <div className={styles['recommended-card-container']}>
      <div className={styles.card}>
        <div className={styles.bg}>
          <picture>
            <img
              src={backgroundImage}
              className={styles['bg-img']}
              alt={title}
            />
          </picture>
        </div>
        <div className={styles.bottom}>
          <div className="h-full w-full flex flex-col justify-between">
            <div>
              <div className={styles.header}>
                {prefix && <div className={styles.prefix}>{prefix}</div>}
                {prefix && (
                  <div
                    role="separator"
                    tabIndex={-1}
                    className="arco-divider arco-divider-vertical"
                  />
                )}
                <div className="arco-ellipsis">
                  <div className="arco-ellipsis-content-mirror arco-ellipsis-single">
                    <span className="arco-ellipsis-text">{title}</span>
                  </div>
                  <div className="arco-ellipsis-content arco-ellipsis-single">
                    <span className="arco-ellipsis-text">{title}</span>
                  </div>
                </div>
              </div>
              <div className="arco-ellipsis">
                <div className="arco-ellipsis-content-mirror arco-ellipsis-multiple arco-ellipsis-collapsed">
                  <span className="arco-ellipsis-text">
                    系统核心指标监控，实时展示{title}数据变化趋势
                  </span>
                </div>
                <div className="arco-ellipsis-content arco-ellipsis-multiple arco-ellipsis-collapsed">
                  <span className="arco-ellipsis-text">
                    系统核心指标监控，实时展示{title}数据变化趋势
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}>
                <div style={{ color }}>{value}</div>
              </div>
              <div className={styles.tag}>
                <div>{icon}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Core metrics cards component
 * @description Display card group for system core metrics
 */
export const CoreMetricsCards: React.FC<CoreMetricsCardsProps> = ({
  statistics,
}) => {
  const metrics = [
    {
      title: '活跃用户',
      value: statistics?.active_users || 0,
      icon: <IconUser style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      prefix: '用户统计',
    },
    {
      title: '活跃机器人',
      value: statistics?.active_bots || 0,
      icon: <IconRobot style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      prefix: '机器人',
      backgroundImage: activeAgentImage,
    },
    {
      title: '今日消息',
      value: statistics?.latest_24h_messages || 0,
      icon: <IconMessage style={{ color: '#faad14' }} />,
      color: '#faad14',
      prefix: '消息统计',
      backgroundImage: dailyMessageImage,
    },
    {
      title: '今日事件',
      value: statistics?.latest_24h_events || 0,
      icon: <IconNotification style={{ color: '#f5222d' }} />,
      color: '#f5222d',
      prefix: '事件监控',
      backgroundImage: dailyEventImage,
    },
  ];

  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      {metrics.map((metric, index) => (
        <Col span={6} key={index}>
          <MetricCard {...metric} />
        </Col>
      ))}
    </Row>
  );
};

export default CoreMetricsCards;
