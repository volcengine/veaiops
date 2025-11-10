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

export interface TipProps {
  className?: string;
  type?: string;
  modalStyle?: React.CSSProperties;
  arrow?: boolean;
  arrowStyle?: React.CSSProperties;
  hotspot?: boolean | string;
  hotspotStyle?: React.CSSProperties;
  closeEle?: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
  stepInfo: {
    title?: React.ReactNode;
    content?: React.ReactNode | (() => React.ReactNode);
  };
  theme?: 'bits-light' | null | string;
  _stepText?: (current: number, total: number) => string;
  stepIndex?: number;
  steps?: any[]; // Changed to array type
  showPreviousBtn?: boolean;
  handlePreviousChange?: () => void;
  _prevText?: string;
  handleNextChange?: () => void;
  _okText?: string;
  _closeText?: string;
  showStepInfo?: boolean;
  showAction?: boolean;
  handleActionChange?: (action: string) => void;
}

export interface TipArrowProps {
  arrow: boolean;
  arrowStyle: React.CSSProperties;
  arrowStyleWrap: React.CSSProperties;
  arrowGradientStyleWrap: React.CSSProperties;
  theme: 'bits-light' | null | string;
  PREFIX: string;
}

export interface TipCloseButtonProps {
  closeEle?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  PREFIX: string;
}

export interface TipContentProps {
  stepInfo: {
    title?: React.ReactNode;
    content?: React.ReactNode | (() => React.ReactNode);
  };
  todPrefixCls: string;
  PREFIX: string;
}

export interface TipFooterProps {
  showAction?: boolean;
  showStepInfo?: boolean;
  showPreviousBtn?: boolean;
  stepIndex?: number;
  steps?: any[]; // Changed to array type
  _stepText?: (current: number, total: number) => string;
  handlePreviousChange?: () => void;
  _prevText?: string;
  handleNextChange?: () => void;
  _okText?: string;
  handleActionChange?: (action: 'confirm' | 'cancel') => void;
  todPrefixCls: string;
  PREFIX: string;
}
