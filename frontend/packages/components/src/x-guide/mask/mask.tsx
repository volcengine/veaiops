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

import type React from 'react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PREFIX_CLS } from '../constant/const';
import { getDocument, getMaskStyle } from '../utils';

// Use object to wrap callback functions, avoid exporting mutable bindings
const scrollCallbacks = {
  onScrollStart: () => undefined,
  onScrollEnd: () => undefined,
};

export const ScrollStartCb = () => scrollCallbacks.onScrollStart();
export const ScrollEndCb = () => scrollCallbacks.onScrollEnd();

interface IMask {
  mask: boolean | string;
  className: string;
  anchorEl: Element;
  realWindow: Window;
  handleClick: () => void;
  getMaskContainer?: () => Element;
}

const Mask: React.FC<IMask> = ({
  className,
  anchorEl,
  realWindow,
  mask,
  handleClick,
  getMaskContainer,
}) => {
  const [style, setStyle] = useState({});
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef<number>(0);
  const PREFIX = PREFIX_CLS.GUIDE_MASK;
  const getMaskContainerFn =
    getMaskContainer || (() => getDocument(anchorEl).body);

  const calculateStyle = (): void => {
    const style: CSSProperties = getMaskStyle(anchorEl);
    if (mask === 'transparent') {
      style.borderColor = 'transparent';
    }
    setStyle(style);
  };

  const handleResize = (): void => {
    if (timerRef.current) {
      realWindow.cancelAnimationFrame(timerRef.current);
    }
    timerRef.current = realWindow.requestAnimationFrame(() => {
      calculateStyle();
    });
  };

  useEffect(() => {
    scrollCallbacks.onScrollStart = () => {
      setHidden(true);
    };
    scrollCallbacks.onScrollEnd = () => {
      setHidden(false);
      calculateStyle();
    };
    calculateStyle();
  }, [anchorEl]);

  useEffect(() => {
    realWindow.addEventListener('resize', handleResize);
    return () => {
      realWindow.removeEventListener('resize', handleResize);
    };
  }, [realWindow, anchorEl]);

  if (!anchorEl) {
    return null;
  }

  return createPortal(
    <div
      className={`${PREFIX}${hidden ? ` ${PREFIX}--hidden` : ''} ${className}`}
      style={style}
      onClick={handleClick}
    />,
    getMaskContainerFn(),
  );
};

export { Mask };
