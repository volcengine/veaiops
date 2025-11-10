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

export const calcArrowClipPath = (style: any) => {
  if (style.borderLeft && style.borderTop) {
    return 'polygon(100% 100%, 0 100%, 100% 0)';
  }

  if (style.borderRight && style.borderBottom) {
    return 'polygon(0 0, 100% 0, 0 100%)';
  }

  if (style.borderRight && style.borderTop) {
    return 'polygon(0 100%, 100% 100%, 0 0)';
  }
  if (style.borderLeft && style.borderBottom) {
    return 'polygon(100% 100%, 100% 0, 0 0)';
  }
  return '';
};

export interface CalcArrowGradientStyleParams {
  style: any;
  width: any;
  height: any;
}

export const calcArrowGradientStyle = ({
  style,
  width,
  height,
}: CalcArrowGradientStyleParams) => {
  /**
   * Arrow style is drawn as a separate square div without shadow or border, then uses clipPath to crop the arrow
   * Magic numbers like style.bottom - x are used to align with the outer border
   * bits-light's background-size includes the arrow in the gradient range
   * So the arrow's background-size also has an extra 7.07 magic number
   */
  // Top
  if (style.borderLeft && style.borderTop) {
    const bottom = style.bottom - 1;
    const left = style.left - 2;
    const right = style.right - 2;
    return {
      clipPath: 'polygon(0% 50%, 50% 100%, 100% 50%)',
      bottom,
      ...(style.left ? { left } : { right }),
      backgroundPosition: `${
        style.left ? -(left + 7.07) : -(width - right - 7.07)
      }px ${-(height - bottom - 7.07)}px`,
    };
  }

  // Bottom
  if (style.borderRight && style.borderBottom) {
    const top = style.top - 1;
    const left = style.left - 2;
    const right = style.right - 2;

    return {
      clipPath: 'polygon(0% 50%, 50% 0%, 100% 50%)',
      top,
      ...(style.left ? { left } : { right }),
      backgroundPosition: `${
        style.left ? -(left + 7.07) : -(width - right - 7.07)
      }px ${-(top + 7.07)}px`,
    };
  }

  // Right
  if (style.borderRight && style.borderTop) {
    const left = style.left - 1;
    const top = style.top - 2;
    const bottom = style.bottom - 2;
    return {
      clipPath: 'polygon(50% 0%, 0% 50%, 50% 100%)',
      left,
      ...(style.top ? { top } : { bottom }),
      backgroundPosition: `${-(left + 7.07)}px ${
        style.top ? -(top + 7.07) : -(height - bottom - 7.07)
      }px`,
    };
  }

  // Left
  if (style.borderLeft && style.borderBottom) {
    const right = style.right - 1;
    const top = style.top - 2;
    const bottom = style.bottom - 2;
    return {
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%)',
      right,
      ...(style.top ? { top } : { bottom }),
      backgroundPosition: `${-(width - right - 7.07)}px ${
        style.top ? -(top + 7.07) : -(height - bottom - 7.07)
      }px`,
    };
  }
  return {};
};
