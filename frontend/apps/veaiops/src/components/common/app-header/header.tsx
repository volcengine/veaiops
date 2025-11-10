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
import { DocsButton } from '../docs-button';
import { Logo, Navigation } from '../navigation';
import { UserDropdown } from '../user-dropdown';
import type { AppHeaderProps } from './types';

/**
 * Application header component
 * Includes Logo, navigation menu, documentation button, and user dropdown menu
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  activeModule,
  onModuleChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Logo & Navigation */}
      <div className="flex items-center space-x-8">
        <Logo />
        <Navigation
          activeModule={activeModule}
          onModuleChange={onModuleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* <ThemeToggle /> */}
        <DocsButton />
        <UserDropdown />
      </div>
    </div>
  );
};
