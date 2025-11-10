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

import { AIAgentIcon } from '@/components/global-guide';
import { layoutConfig } from '@/config/layout';
import { Link, useLocation } from '@modern-js/runtime/router';
import type React from 'react';

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

/**
 * Navigation component
 */
export const Navigation: React.FC<NavigationProps> = ({
  activeModule: _activeModule,
  onModuleChange,
}) => {
  const location = useLocation();

  // Define default page path for each module
  const moduleDefaultPaths = {
    statistics: '/statistics/overview',
    threshold: '/threshold/template',
    oncall: '/oncall/config',
    'event-center': '/event-center/strategy',
    system: '/system/bot-management',
  };

  const navItems = [
    { key: 'statistics', label: '用量统计' },
    { key: 'threshold', label: '智能阈值' },
    { key: 'oncall', label: 'ChatOps' },
    { key: 'event-center', label: '事件中心' },
    { key: 'system', label: '系统配置' },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(`/${item.key}`);
        return (
          <Link
            key={item.key}
            to={moduleDefaultPaths[item.key as keyof typeof moduleDefaultPaths]}
            className={
              isActive
                ? layoutConfig.navigation.activeClass
                : layoutConfig.navigation.inactiveClass
            }
            onClick={() => onModuleChange(item.key)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

/**
 * Logo component
 */
export const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`${layoutConfig.logo.gradient} ${layoutConfig.logo.header.size} rounded-lg flex items-center justify-center`}
      >
        <AIAgentIcon size={24} color="#ffffff" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-text m-0">veaiops</h1>
        <p className="text-xs text-textSecondary">火山引擎</p>
      </div>
    </div>
  );
};
