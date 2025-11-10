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

//
import { layoutConfig } from '@/config/layout';
import type React from 'react';
import { AppHeader } from '../common/app-header';

interface LayoutMainProps {
  children: React.ReactNode;
  collapsed: boolean;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const LayoutMain: React.FC<LayoutMainProps> = ({
  children,
  collapsed,
  activeModule,
  onModuleChange,
}) => {
  return (
    <div
      className={`flex-1 flex flex-col overflow-x-hidden overflow-y-auto transition-all ${
        layoutConfig.sidebar.transitionDuration
      } ${collapsed ? 'ml-16' : 'ml-60'}`}
    >
      {/* Top navigation */}
      <header
        className={`${layoutConfig.header.backgroundColor} ${layoutConfig.header.borderColor} ${layoutConfig.header.padding}`}
      >
        <AppHeader
          activeModule={activeModule}
          onModuleChange={onModuleChange}
        />
      </header>

      {/* Main content */}
      <main
        className={`flex-1 ${layoutConfig.main.backgroundColor} ${layoutConfig.main.padding}`}
      >
        <div className="max-w-full">{children}</div>
      </main>
    </div>
  );
};

export { LayoutMain };
