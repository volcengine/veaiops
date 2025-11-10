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

import { Alert, Spin } from '@arco-design/web-react';
import type { AlertProps } from '@arco-design/web-react/es/Alert/interface';
import {
  type CSSProperties,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
  type Ref,
  forwardRef,
  useMemo,
} from 'react';

import { Tip } from '@/tip';
import { TipMode } from './constant';
import styles from './index.module.less';

const withLoading = (
  content: ReactNode,
  loading: boolean | undefined,
  loadingTip: string | undefined,
) => (
  <Spin
    block
    loading={loading}
    tip={loadingTip || '数据加载中'}
    style={{ width: '100%' }}
  >
    {content}
  </Spin>
);

const renderTipComponent = (
  tips: string | undefined,
  tipMode: TipMode,
  alertProps: AlertProps,
) => {
  if (!tips) {
    return null;
  }
  if (tipMode === TipMode.TIP_TOOL) {
    return <Tip content={tips} />;
  }
  return <Alert content={tips} {...alertProps} />;
};

interface CardInMainProps {
  title?: string | ReactNode;
  tips?: string;
  tipMode?: TipMode;
  alertProps?: AlertProps;
  children: ReactNode;
  show?: boolean;
  style?: CSSProperties;
  wrapStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  className?: string;
  wrapClassName?: string;
  titleWrapClassName?: string;
  loading?: boolean;
  loadingTip?: string;
  actions?: ReactNode | ReactNode[];
}
const CardInMain = forwardRef(
  (
    {
      title,
      tips,
      tipMode = TipMode.TIP_TOOL,
      alertProps = {},
      children,
      show = true,
      style,
      className,
      wrapClassName = '',
      titleWrapClassName = '',
      wrapStyle = {},
      titleStyle = {},
      loading = false,
      loadingTip,
      actions,
    }: PropsWithChildren<CardInMainProps>,
    ref: Ref<HTMLDivElement>,
  ): ReactElement | null => {
    const renderTip = useMemo(
      () => renderTipComponent(tips, tipMode, alertProps),
      [tips, tipMode, alertProps],
    );

    if (show !== true) {
      return null;
    }

    const cardClassName = className
      ? `${styles.card} ${className}`
      : styles.card;

    const renderActions = Array.isArray(actions) ? actions : [actions];

    if (title) {
      return withLoading(
        <div ref={ref} className={cardClassName} style={style}>
          <div className={'flex justify-between items-center gap-3'}>
            <div className={titleWrapClassName}>
              <h4 className={styles.header} style={titleStyle}>
                {title}
              </h4>
              {renderTip}
            </div>
            {/* Use flex to wrap and distribute evenly */}
            {renderActions && (
              <div className="flex justify-between">
                {renderActions.map((item, index) => (
                  <div key={`action-${index}`} className="flex-1">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`mt-3 ${wrapClassName}`} style={wrapStyle}>
            {children}
          </div>
        </div>,
        loading,
        loadingTip,
      );
    }

    return withLoading(
      <div ref={ref} className={cardClassName} style={style}>
        {children}
      </div>,
      loading,
      loadingTip,
    );
  },
);
export { CardInMain };
