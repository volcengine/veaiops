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
 * TableContent component type definitions
 * Optimized based on pro-components design patterns
 *

 * @date 2025-12-19
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * @name Table header related configuration
 */
export interface TableHeaderConfig {
  /** @name Table title */
  title?: string;
  /** @name Action button group on the right side of title */
  actions?: ReactNode[];
  /** @name Title container style class name */
  className?: string;
  /** @name Title container inline style */
  style?: CSSProperties;
}

/**
 * @name Table content loading state configuration
 */
export interface TableContentLoadingConfig {
  /** @name Whether to use custom loading component */
  useCustomLoading?: boolean;
  /** @name Table loading state */
  loading?: boolean;
  /** @name Custom loading state */
  customLoading?: boolean;
  /** @name Loading tip text */
  tip?: string;
}

/**
 * @name Renderer function collection
 */
export interface TableRenderers {
  /** @name Table content renderer */
  tableRender: (tableComponent: ReactNode) => ReactNode;
  /** @name Footer content renderer */
  footerRender: () => ReactNode;
}

/**
 * @name Table main content component props
 */
export interface TableContentProps {
  /** @name Table header configuration */
  header?: TableHeaderConfig;

  /** @name Alert/prompt component */
  alertDom?: ReactNode;

  /** @name Filter component */
  filterDom?: ReactNode;

  /** @name Loading state configuration */
  loadingConfig?: TableContentLoadingConfig;

  /** @name Renderer function collection */
  renderers: TableRenderers;

  /** @name Table main component */
  tableDom: ReactNode;

  /** @name Container style class name */
  className?: string;

  /** @name Container inline style */
  style?: CSSProperties;
}
