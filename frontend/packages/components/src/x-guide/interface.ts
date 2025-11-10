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

import type { TooltipProps } from '@arco-design/web-react';
import type React from 'react';
import type { StepNumber } from './constant/lang';

export type SinglePlacement = 'top' | 'bottom' | 'left' | 'right';

export type Placement =
  | 'top'
  | 'left'
  | 'bottom'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';

export type SelectorType = string | Element | (() => Element);

export type ContentType = string | React.ReactNode | (() => React.ReactNode);

export interface ITargetPos {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * @title IStep
 */
export interface IStep {
  /**
   * Element selector, supports querySelector selector
   * @zh 元素选择器，支持 querySelector 选择器
   */
  selector?: SelectorType;
  /**
   * Target position relative to, priority lower than selector
   * @zh 相对于的目标位置，优先级低于selector
   */
  targetPos?: ITargetPos;
  /**
   * Display title
   * @zh 展示标题
   */
  title?: string;
  /**
   * Display image
   * @zh 展示图片
   */
  imageTitle?: any;
  /**
   * Display description
   * @zh 展示描述
   */
  content?: ContentType;
  /**
   * Guide position, such as bottom-left, left-bottom, bottom, etc.
   * @zh 引导 的位置，如 bottom-left、left-bottom、bottom 等
   */
  placement?: Placement;
  /**
   * Modal offset, can change modal position, e.g., { x: 20, y: 10 }
   * @zh modal 偏移量，可改变 modal 的位置，如 { x: 20, y: 10 }
   */
  offset?: Record<'x' | 'y', number>;
  /**
   * Used to control the distance between focus arrow and tooltip edge
   * @defaultValue 24
   * @zh 用于控制焦点箭头 和 提示框边缘的距离
   */
  marginNumber?: number;
  /**
   * Parent element node, element can be added to body, if parent is null, it will be added to selector offsetParent by default
   * @zh 父元素节点，元素可被新增到 body，如果 parent 为 null，则会默认被新增到选择器 offsetParent
   */
  parent?: 'body' | null;
  /**
   * Control guide step visibility, used for async rendering
   * @zh 控制 guide 每个步骤显示隐藏，用于异步渲染
   */
  visible?: boolean;
  /**
   * Whether to skip this step
   * @zh 是否跳过该步骤
   */
  skip?: boolean;
  /**
   * Whether to show tooltip for close button
   * @defaultValue false
   * @zh 是否关闭按钮的tooltip
   */
  closeTooltip?: boolean;
  /**
   * Tooltip props for close button, can change text in this property
   * @zh 关闭按钮的tooltipProps，可以在此属性中更改文字
   */
  closeTooltipProps?: TooltipProps;
  /**
   * Whether to disable auto scroll, when disabled, guide modal position completely depends on element position, may cause guide modal display incomplete, recommended for non-step modals
   * @defaultValue false
   * @zh 是否禁用自动滚动，禁用后，引导弹框的位置完全取决于元素的位置，可能会存在引导弹框显示不全的问题，推荐在非步骤弹框中使用
   */
  disableScroll?: boolean;
  /**
   * Callback triggered before clicking next step
   * @zh 点击下一步之前触发的回调
   */
  beforeStepChange?: (
    curStep: IStep,
    curStepIndex: number,
    steps: IStep[],
  ) => void;
}

/**
 * @title IGuide
 */
export interface IGuide {
  /**
   * Guide steps, detailed configuration see IStep
   * @zh 引导步骤，详细配置见IStep
   */
  steps: IStep[];
  /**
   * Guide type, divided into card guide and tooltip guide
   * @defaultValue 'card'
   * @zh 引导的类型，分为卡片引导和气泡提示引导
   */
  type?: 'tip' | 'card' | 'richCard';
  /**
   * Used for different theme color customization, only effective when type = tip, default blue, bits-light displays as white background navigation
   * @defaultValue null
   * @zh 用于不同的主题色的定制，仅在 type = tip 时生效，默认蓝色，bits-light 时展示为白底导航
   */
  theme?: 'bits-light' | null;
  /**
   * Used to control whether to show step bar
   * @defaultValue null
   * @zh 用于控制是否展示步骤条
   */
  showStepInfo?: boolean;
  /**
   * Used to show user button
   * @defaultValue null
   * @zh 用于展示用户按钮
   */
  showAction?: boolean;
  /**
   * Used to control the spacing between focus and modal
   * @defaultValue null
   * @zh 用于控制焦点和弹窗之间的间隔
   */
  hotspotDistance?: number;
  /**
   * Local cache key, caches whether this guide page has been shown, need to ensure localKey uniqueness within the system
   * @zh 本地缓存 key，缓存是否展示过该引导页，需确保系统内 localKey 唯一性
   */
  localKey?: string;
  /**
   * Whether to show mask, can choose transparent mask
   * @zh 是否展示蒙层, 可选择透明蒙层
   */
  mask?: boolean | 'transparent';
  /**
   * Whether modal shows arrow
   * @zh 弹窗是否展示箭头
   */
  arrow?: boolean;
  /**
   * Whether modal shows hotspot
   * @zh 弹窗是否展示热点
   */
  hotspot?: boolean;
  /**
   * Whether guide can be skipped
   * @zh 是否可以跳过引导
   */
  closable?: boolean;
  /**
   * Initial step, step can be controlled, -1 means component is not displayed
   * @zh 初始步骤，步骤可受控，为-1 则不展示组件
   */
  step?: number;
  /**
   * Modal class name
   * @zh 弹窗类名
   */
  modalClassName?: string;
  /**
   * Mask class name
   * @zh 蒙层类名
   */
  maskClassName?: string;
  /**
   * Expiration date, guide page will not be shown if current time is greater than or equal to this time
   * @zh 过期时间，大于等于该时间都不展示引导页
   */
  expireDate?: string;
  /**
   * Control guide visibility, used for async rendering
   * @zh 控制 guide 显示隐藏，用于异步渲染
   */
  visible?: boolean;
  /**
   * Multi-language
   * @defaultValue 'zh'
   * @zh 多语言
   */
  lang?: 'zh' | 'en' | 'ja';
  /**
   * Step information text for modal
   * @zh modal 的步骤信息文案
   */
  stepText?: (stepIndex: number, stepCount: number) => string;
  /**
   * 'Previous' button text
   * @zh '上一步'按钮文案
   */
  prevText?: string;
  /**
   * 'Next' button text
   * @zh 下一步'按钮文案
   */
  nextText?: string;
  /**
   * Confirm button text
   * @zh 确认按钮文案
   */
  okText?: string;
  /**
   * Callback before clicking next step
   * @zh 点击下一步之前的回调
   */
  beforeStepChange?: (stepIndex: number, step: IStep) => void;
  /**
   * Callback when clicking next step
   * @zh 点击下一步的回调
   */
  afterStepChange?: (stepIndex: number, step: IStep) => void;
  /**
   * Callback when guide ends
   * @zh 引导结束的回调
   */
  onClose?: () => void;
  /**
   * User button action
   * @zh 用户按钮行为
   */
  onActionChange?: (action: string) => void;
  /**
   * Whether to show 'Previous' button
   * @zh 是否显示'上一步'按钮
   */
  showPreviousBtn?: boolean;
  /**
   * Custom element to skip guide
   * @zh 自定义跳过引导的元素
   */
  closeEle?: React.ReactNode;
  /**
   * Whether clicking mask can close
   * @defaultValue false
   * @zh 点击蒙层是否可以关闭
   */
  maskClosable?: boolean;
  /**
   * Custom mask mount position
   * @zh 自定义蒙层挂载位置
   */
  getMaskContainer?: () => Element;
}

export interface IModal {
  type: string;
  theme?: 'bits-light' | null;
  showStepInfo?: boolean;
  showAction?: boolean;
  anchorEl: HTMLElement;
  parentEl: HTMLElement;
  realWindow: Window;
  steps: IStep[];
  stepIndex: number;
  mask: boolean | string;
  arrow: boolean;
  hotspot: boolean | string;
  closable: boolean;
  /* close element */
  closeEle?: React.ReactNode;
  onClose: () => void;
  onChange: (direction: number) => void;
  onActionChange: (action: string) => void;
  stepText?: (stepIndex: number, stepCount: number) => string;
  showPreviousBtn: boolean;
  nextText?: string;
  prevText?: string;
  okText?: string;
  className?: string;
  TEXT: (
    key: 'NEXT_STEP' | 'I_KNOW' | 'STEP_NUMBER' | 'PREV_STEP' | 'CLOSE',
  ) => string | StepNumber;
}
