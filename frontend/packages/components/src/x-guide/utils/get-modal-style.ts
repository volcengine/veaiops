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

import { OPTIONS } from '../constant/const';
import { getOffsetTop } from './get-offset-parent';
import { getComputedStyle, getNodeName } from './utils';

interface IModalStyle {
  position: 'absolute' | 'fixed';
  top: number;
  left: number;
}

/**
 * Get modal position based on selector selected element, modal dimensions, user-defined placement and offset
 * Calculate the modal's position based on its anchor element, user-defined placement and offset
 * @param {HTMLElement} modalEl
 * @param {Element} anchorEl
 * @param {Element} parentEl
 * @param {string} placement
 * @param {object} customOffset
 */
export const getModalStyle = (
  modalEl: Element,
  anchorEl: Element,
  parentEl: Element,
  scrollContainer: Element,
  placement = 'bottom',
  customOffset = { x: 0, y: 0 },
): IModalStyle => {
  const { PADDING } = OPTIONS;
  const { MARGIN } = OPTIONS;
  const modalPos = modalEl.getBoundingClientRect();
  const anchorPosBf = anchorEl.getBoundingClientRect();
  const parentPos = parentEl.getBoundingClientRect();

  const anchorPos = {
    top: Number(anchorPosBf.top) - PADDING,
    left: Number(anchorPosBf.left) - PADDING,
    width: Number(anchorPosBf.width) + PADDING * 2,
    height: Number(anchorPosBf.height) + PADDING * 2,
  };

  const { scrollTop } = scrollContainer;

  const isParentBody = getNodeName(parentEl) === 'body';
  const isAnchorFixed =
    getNodeName(parentEl) === 'body' ||
    getComputedStyle(anchorEl).position === 'fixed';
  const anchorOffsetTop = getOffsetTop(anchorEl);

  let scrollY;
  if (isAnchorFixed) {
    scrollY = anchorPos.top;
  } else if (isParentBody) {
    scrollY = anchorPos.top + scrollTop;
  } else {
    scrollY = anchorOffsetTop;
  }

  /* The distance between the top of the offsetParent and the top of the anchor.
   *
   * We don't simply use anchorEl.offsetTop but the below code instead due to the following reason:
   * for the cases with no mask, the anchorEl's should be positioned relative to the body rather than
   * its real offsetParent.
   */
  const top = scrollY;
  const bottom = anchorPos.height + scrollY;
  const left = anchorPos.left - parentPos.left;

  const { width, height } = anchorPos;

  const transform: Record<string, Record<string, number>> = {
    top: {
      // Place modal above content
      top: top - modalPos.height - MARGIN,
      left: left + width / 2 - modalPos.width / 2,
    },
    bottom: {
      // Place modal below content
      top: bottom + MARGIN,
      left: left + width / 2 - modalPos.width / 2,
    },
    left: {
      // Place modal to the left of content
      top: top + height / 2 - modalPos.height / 2,
      left: left - modalPos.width - MARGIN,
    },
    right: {
      // Place modal to the right of content
      top: top + height / 2 - modalPos.height / 2,
      left: left + width + MARGIN,
    },
    'top-right': {
      // Modal's bottom-border aligns with content's top-border, right-borders horizontally aligned
      top: top - modalPos.height - MARGIN,
      left: left + width - modalPos.width,
    },
    'top-left': {
      // Modal's bottom-border aligns with content's top-border, left-borders horizontally aligned
      top: top - modalPos.height - MARGIN,
      left,
    },
    'bottom-right': {
      // Modal's top-border aligns with content's bottom-border, right-borders horizontally aligned
      top: bottom + MARGIN,
      left: left + width - modalPos.width,
    },
    'bottom-left': {
      // Modal's top-border aligns with content's bottom-border, left-borders horizontally aligned
      top: bottom + MARGIN,
      left,
    },
    'right-top': {
      // Modal's left-border aligns with content's right-border, top-borders horizontally aligned
      top,
      left: left + width + MARGIN,
    },
    'left-top': {
      // Modal's right-border aligns with content's left-border, top-borders horizontally aligned
      top,
      left: left - modalPos.width - MARGIN,
    },
    'right-bottom': {
      // Modal's left-border aligns with content's right-border, bottom-borders horizontally aligned
      top: bottom - modalPos.height,
      left: left + width + MARGIN,
    },
    'left-bottom': {
      // Modal's right-border aligns with content's left-border, bottom-borders horizontally aligned
      top: bottom - modalPos.height,
      left: left - modalPos.width - MARGIN,
    },
  };

  const offset = {
    x: customOffset.x || 0,
    y: customOffset.y || 0,
  };

  const position = transform[placement];

  return {
    position: isAnchorFixed ? 'fixed' : 'absolute',
    top: position.top + offset.y,
    left: position.left + offset.x,
  };
};
