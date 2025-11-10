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

import React, { useEffect, useState } from 'react';
import { PREFIX_CLS } from '../constant/const';
import { HotSpot } from './hot-spot';
import { TipArrow } from './tip-arrow';
import { TipCloseButton } from './tip-close-button';
import { TipContent } from './tip-content';
import { TipFooter } from './tip-footer';
import type { TipProps } from './types';
import { calcArrowClipPath, calcArrowGradientStyle } from './utils';

export const Tip = React.forwardRef<HTMLDivElement, TipProps>(
  (props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const {
      className,
      modalStyle,
      arrow = false,
      arrowStyle = {},
      hotspot,
      hotspotStyle,
      closeEle,
      onClose,
      closable = false,
      stepInfo,
      theme = '',
      _stepText = (current: number, total: number) => `${current}/${total}`,
      stepIndex = 0,
      steps = [],
      showPreviousBtn = false,
      handlePreviousChange,
      _prevText = 'Previous',
      handleNextChange,
      _okText = 'OK',
      _closeText,
      showStepInfo = false,
      showAction = false,
      handleActionChange,
    } = props;

    const todPrefixCls = PREFIX_CLS.GUIDE;
    const PREFIX = PREFIX_CLS.GUIDE_TIP;

    const isBitsTheme = theme === 'bits-light';
    const THEME = isBitsTheme ? 'bits-light' : '';
    const [arrowStyleWrap, setArrowStyleWrap] = useState({});
    const [arrowGradientStyleWrap, setArrowGradientStyleWrap] = useState({});

    useEffect(() => {
      if (!ref || typeof ref === 'function' || !ref.current) {
        return;
      }
      setArrowStyleWrap({
        ...arrowStyle,
        clipPath: calcArrowClipPath(arrowStyle),
      });
      if (theme !== 'bits-light') {
        return;
      }
      const { offsetWidth, offsetHeight } = ref.current;
      setArrowGradientStyleWrap({
        backgroundSize: `${offsetWidth + 14.14}px ${offsetHeight + 14.14}px`,
        ...calcArrowGradientStyle({
          style: arrowStyle,
          width: offsetWidth,
          height: offsetHeight,
        }),
      });
    }, [ref, theme, arrowStyle]);

    // Merge inline styles
    const combinedStyle = {
      ...modalStyle,
      ...(isBitsTheme
        ? {
            background:
              'linear-gradient(219deg, #6332ff 0%, #00e5e5 45.87%, #1664ff 100%)',
            backgroundSize: 'calc(100% + 14.14px) calc(100% + 14.14px)',
            backgroundPosition: '-7.06px -7.06px',
            border: '1px solid #dde2e9',
            borderRadius: '12px',
            boxShadow: '0 10px 20px 0 rgba(0, 0, 0, 0.05)',
            padding: 0,
            zIndex: 1400,
          }
        : {}),
    };

    return (
      <div
        ref={ref}
        className={`${PREFIX} ${THEME} ${className || ''}`}
        style={combinedStyle}
      >
        <div
          className={`${PREFIX}-content-wrap`}
          style={
            isBitsTheme
              ? {
                  margin: '1px',
                  borderRadius: '10px',
                  padding: '11px 14px 14px 14px',
                  background: 'rgb(255, 255, 255)',
                }
              : {}
          }
        >
          {/* ARROW */}
          <TipArrow
            arrow={arrow}
            arrowStyle={arrowStyle}
            arrowStyleWrap={arrowStyleWrap}
            arrowGradientStyleWrap={arrowGradientStyleWrap}
            theme={theme}
            PREFIX={PREFIX}
          />

          {/* HOT SPOT */}
          {hotspot && <HotSpot style={hotspotStyle} />}

          {/* CLOSE BUTTON */}
          <TipCloseButton
            closeEle={closeEle}
            closable={closable}
            onClose={onClose}
            PREFIX={PREFIX}
          />

          {/* CONTENT */}
          <TipContent
            stepInfo={stepInfo}
            todPrefixCls={todPrefixCls}
            PREFIX={PREFIX}
          />

          {/* FOOTER */}
          <TipFooter
            showAction={showAction}
            showStepInfo={showStepInfo}
            showPreviousBtn={showPreviousBtn}
            stepIndex={stepIndex}
            steps={steps}
            _stepText={_stepText}
            handlePreviousChange={handlePreviousChange}
            _prevText={_prevText}
            handleNextChange={handleNextChange}
            _okText={_okText}
            handleActionChange={handleActionChange}
            todPrefixCls={todPrefixCls}
            PREFIX={PREFIX}
          />
        </div>
      </div>
    );
  },
);
