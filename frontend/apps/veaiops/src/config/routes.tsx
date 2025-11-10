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
 * Route configuration unified export file (deprecated)
 *
 * ⚠️ Warning: This file is deprecated and no longer used
 *
 * Reason: This file is a redundant intermediate layer that causes circular references:
 * 1. config/index.ts exports export * from './routes' → routes.tsx
 * 2. routes.tsx exports routesConfig from './routes' → routes/index.ts
 * 3. routes/index.ts imports module routes → may cause circular reference through config/index.ts
 *
 * Solution:
 * - config/index.ts now directly exports routesConfig from './routes/index'
 * - All consumers should import from '@/config/routes' or '@/config/routes/index'
 * - This file is kept only for backward compatibility, but should actually be deleted
 *
 * @deprecated Please use routes/index.ts or import through config/index.ts
 */

// Re-export routes/index.ts for backward compatibility
// But recommend consumers directly import routes/index.ts
export type { RouteConfig, RouteUtils } from '../types/route';
export { routesConfig } from './routes/index';
