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

interface ConfigOptions {
  margin?: number;
  padding?: number;
}

interface GuideOptions {
  MARGIN: number;
  PADDING: number;
}

const OPTIONS: GuideOptions = {
  MARGIN: 15,
  PADDING: 0,
};

/**
 * Set guide component configuration
 * @param config Configuration options
 * @param config.margin Margin, optional
 * @param config.padding Padding, optional
 */
export function setConfig({ margin, padding }: ConfigOptions): void {
  if (margin !== undefined) {
    OPTIONS.MARGIN = margin;
  }
  if (padding !== undefined) {
    OPTIONS.PADDING = padding;
  }
}

// CSS class name prefix constants
export const PREFIX_CLS = {
  GUIDE: 'tod-guide',
  GUIDE_CARD: 've-o-guide-card',
  GUIDE_RICHCARD: 've-o-guide-richcard',
  GUIDE_TIP: 'tod-guide-tip',
  GUIDE_MASK: 've-o-guide-mask',
} as const;

export { OPTIONS };
export type { ConfigOptions, GuideOptions };
