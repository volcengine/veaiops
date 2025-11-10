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

import {
  IconCheckCircleFill,
  IconCloseCircleFill,
} from '@arco-design/web-react/icon';
import type React from 'react';

/**
 * Password requirement check item component
 */
interface PasswordRequirementItemProps {
  met: boolean;
  text: string;
}

export const PasswordRequirementItem: React.FC<
  PasswordRequirementItemProps
> = ({ met, text }) => {
  return (
    <div className="flex items-center gap-2 py-1">
      {met ? (
        <IconCheckCircleFill className="text-green-500 text-sm flex-shrink-0" />
      ) : (
        <IconCloseCircleFill className="text-gray-300 text-sm flex-shrink-0" />
      )}
      <span
        className={`text-xs ${met ? 'text-green-600 font-medium' : 'text-gray-500'}`}
      >
        {text}
      </span>
    </div>
  );
};
