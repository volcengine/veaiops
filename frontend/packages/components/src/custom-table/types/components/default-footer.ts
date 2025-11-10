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
 * DefaultFooter component type definitions
 * Migrated from components/default-footer/types.ts
 */

/**
 * @name Default footer component properties
 */
export interface DefaultFooterProps {
  /** @name Whether there is more data */
  hasMoreData?: boolean;
  /** @name Load more data callback */
  onLoadMore?: () => void;
  /** @name Container style class name */
  className?: string;
}

/**
 * @name Default stream footer component properties
 */
export interface DefaultStreamFooterProps {
  /** @name Whether there is more data */
  hasMoreData?: boolean;
  /** @name Whether to continue loading */
  needContinue?: boolean;
  /** @name Load more data callback */
  onLoadMore?: () => void;
  /** @name Container style class name */
  className?: string;
}
