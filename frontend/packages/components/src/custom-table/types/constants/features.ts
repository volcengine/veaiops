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
 * CustomTable feature constant type definitions
 *

 * @date 2025-12-19
 */

/**
 * @name Feature flags type
 * @description Feature flags type inferred from DEFAULT_FEATURES constant
 */
export type FeatureFlags = {
  /** @name Whether to enable pagination feature */
  enablePagination: boolean;
  /** @name Whether to enable filter feature */
  enableFilter: boolean;
  /** @name Whether to enable sorting feature */
  enableSorting: boolean;
  /** @name Whether to enable selection feature */
  enableSelection: boolean;
  /** @name Whether to enable search feature */
  enableSearch: boolean;
  /** @name Whether to enable toolbar feature */
  enableToolbar: boolean;
  /** @name Whether to enable alert feature */
  enableAlert: boolean;
  /** @name Whether to enable query sync feature */
  enableQuerySync: boolean;
  /** @name Whether to enable data source feature */
  enableDataSource: boolean;
  /** @name Whether to enable column management feature */
  enableColumns: boolean;
  /** @name Whether to enable custom loading feature */
  enableCustomLoading: boolean;
  /** @name Whether to enable row selection feature */
  enableRowSelection: boolean;
  /** @name Whether to enable column width persistence feature */
  enableColumnWidthPersistence: boolean;
};
