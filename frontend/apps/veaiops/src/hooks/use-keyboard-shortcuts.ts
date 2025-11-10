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

import { useEffect } from 'react';
import { useLogout } from './use-logout';

export const useKeyboardShortcuts = () => {
  const { quickLogout } = useLogout();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + Q = Quick logout
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'Q'
      ) {
        event.preventDefault();
        quickLogout();
      }

      // Ctrl/Cmd + Shift + L = Quick logout (alternative shortcut)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'L'
      ) {
        event.preventDefault();
        quickLogout();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [quickLogout]);
};
