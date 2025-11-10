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

/**
 * Beautiful guide tip component core logic
 * Uses modular design, focused on main functionality implementation
 */

import { logger } from '@veaiops/utils';
import type { GuideTipOptions } from './types';
import {
  calculateTipPosition,
  cleanupExistingTips,
  createTipContainer,
  getElementRect,
  recalculateArrowPosition,
  validateTargetElement,
} from './utils';

/**
 * Show beautiful guide tip
 * Based on original branch functionality, adapted to current modular structure
 */
export const showGuideTip = (options: GuideTipOptions): (() => void) => {
  const {
    content,
    selector,
    placement = 'top',
    showArrow = true,
    customStyle = {},
    buttonText = '知道了',
    autoClose = false,
    autoCloseDelay = 5000,
    closeOnOutsideClick = true,
    onClose,
  } = options;

  try {
    // Immediately log function call
    logger.info({
      message: '[GuideTip] showGuideTip function called',
      data: {
        selector,
        content,
        placement,
        timestamp: new Date().toISOString(),
      },
      source: 'GuideTip',
      component: 'showGuideTip',
    });

    // Clean up existing guide tips
    cleanupExistingTips(selector, content, placement);

    // Validate target element
    const targetElement = validateTargetElement(selector);
    if (!targetElement) {
      return () => {
        // Empty cleanup function when target element does not exist
      };
    }

    // Get target element position and size
    const targetRect = getElementRect(targetElement);

    // Create tip container and elements
    const { tipContainer, tipElement, closeButton, arrowElement } =
      createTipContainer(options);

    // Add to page
    document.body.appendChild(tipContainer);

    // Add click outside to close functionality
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element;
      // If click is not on element inside tip container, close tip
      if (!tipContainer.contains(target)) {
        cleanup();
      }
    };

    // Listen for click events (if enabled)
    if (closeOnOutsideClick) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    // Position tip
    const rect = targetElement.getBoundingClientRect();
    const tipRect = tipElement.getBoundingClientRect();

    // Add positioning debug information
    logger.info({
      message: '[GuideTip] Position calculation debug information',
      data: {
        selector,
        content,
        placement,
        targetRect: {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
        },
        tipRect: {
          width: tipRect.width,
          height: tipRect.height,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
      source: 'GuideTip',
      component: 'showGuideTip',
    });

    // Calculate position (including initial arrow position)
    const position = calculateTipPosition(targetRect, tipElement, placement);
    tipElement.style.left = `${position.left}px`;
    tipElement.style.top = `${position.top}px`;

    // Add final positioning result debug information
    logger.info({
      message: '[GuideTip] Final positioning result',
      data: {
        selector,
        content,
        placement,
        finalPosition: {
          left: position.left,
          top: position.top,
          arrowLeft: position.arrowLeft,
          arrowTop: position.arrowTop,
        },
        targetElement: {
          tagName: targetElement.tagName,
          textContent: targetElement.textContent?.trim(),
          boundingRect: targetElement.getBoundingClientRect(),
        },
      },
      source: 'GuideTip',
      component: 'showGuideTip',
    });

    // Recalculate arrow position (considering boundary adjustments)
    if (arrowElement && showArrow) {
      recalculateArrowPosition(
        arrowElement,
        targetRect,
        tipRect,
        position,
        placement,
      );
    }

    // Add enter animation
    tipElement.style.opacity = '0';
    tipElement.style.transform = 'translateY(-20px) scale(0.9)';
    tipElement.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

    // Also add enter animation for arrow
    if (arrowElement) {
      const currentTransform = arrowElement.style.transform || '';
      arrowElement.style.opacity = '0';
      arrowElement.style.transform = `${currentTransform} scale(0.9)`;
      arrowElement.style.transition =
        'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }

    requestAnimationFrame(() => {
      tipElement.style.opacity = '1';
      tipElement.style.transform = 'translateY(0) scale(1)';

      // Arrow also shows simultaneously
      if (arrowElement) {
        arrowElement.style.opacity = '1';
        const currentTransform = arrowElement.style.transform || '';
        arrowElement.style.transform = currentTransform.replace(
          ' scale(0.9)',
          '',
        );
      }
    });

    // Cleanup function
    const cleanup = () => {
      // Remove event listeners (if added)
      if (closeOnOutsideClick) {
        document.removeEventListener('mousedown', handleOutsideClick);
      }

      // Add exit animation for both tip and arrow
      tipElement.style.opacity = '0';
      tipElement.style.transform = 'translateY(-20px) scale(0.9)';

      // Arrow also adds exit animation
      if (arrowElement) {
        const currentTransform = arrowElement.style.transform || '';
        arrowElement.style.opacity = '0';
        arrowElement.style.transform = `${currentTransform} scale(0.9)`;
        arrowElement.style.transition =
          'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }

      setTimeout(() => {
        if (tipContainer.parentNode) {
          tipContainer.parentNode.removeChild(tipContainer);
        }
        if (onClose) {
          onClose();
        }
      }, 400);
    };

    // Set button click
    if (closeButton) {
      closeButton.onclick = cleanup;
    }

    // Auto close (if enabled)
    if (autoClose) {
      setTimeout(cleanup, autoCloseDelay);
    }

    logger.info({
      message: '[GuideTip] Beautiful guide tip displayed',
      data: { selector, content, placement, autoClose, closeOnOutsideClick },
      source: 'GuideTip',
      component: 'showGuideTip',
    });

    return cleanup;
  } catch (error) {
    logger.error({
      message: '[GuideTip] Failed to show guide tip',
      data: {
        error: error instanceof Error ? error.message : String(error),
        selector,
        content,
      },
      source: 'GuideTip',
      component: 'showGuideTip',
    });
    return () => {
      // Empty cleanup function
    };
  }
};
