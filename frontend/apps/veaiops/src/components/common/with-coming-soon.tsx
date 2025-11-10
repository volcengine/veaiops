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

import type React from 'react';
import { ComingSoonPage } from './coming-soon-page';

interface WithComingSoonOptions {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Whether to enable ComingSoon mode, defaults to true */
  enabled?: boolean;
}

/**
 * ComingSoon HOC - Used to temporarily display ComingSoon page without polluting business code
 * @param WrappedComponent Wrapped component
 * @param options Configuration options
 * @returns Wrapped component
 */
export function withComingSoon<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithComingSoonOptions = {},
) {
  const {
    title = '功能开发中',
    description = '此功能正在开发中，敬请期待',
    enabled = true,
  } = options;

  const WithComingSoonComponent: React.FC<P> = (props) => {
    // If ComingSoon mode is enabled, show ComingSoon page
    if (enabled) {
      return <ComingSoonPage title={title} description={description} />;
    }

    // Otherwise render original component
    return <WrappedComponent {...props} />;
  };

  // Set display name for easier debugging
  WithComingSoonComponent.displayName = `withComingSoon(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithComingSoonComponent;
}

export default withComingSoon;
