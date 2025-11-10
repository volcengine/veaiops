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

import { Message } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { authConfig, useAuth } from '../config/auth';

export interface LogoutOptions {
  showConfirm?: boolean;
  showMessage?: boolean;
  redirectToLogin?: boolean;
  onBeforeLogout?: () => void | Promise<void>;
  onAfterLogout?: () => void | Promise<void>;
}

export const useLogout = () => {
  const { logout: authLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const BROADCAST_KEY = 'volcaiops_logout_broadcast';

  // Listen for logout broadcasts from other tabs to maintain multi-tab consistency
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === BROADCAST_KEY && e.newValue) {
        // Received logout broadcast from other tab
        // Fix: Clear authentication info from localStorage, not sessionStorage
        localStorage.removeItem(authConfig.storageKeys.token);
        localStorage.removeItem(authConfig.storageKeys.username);
        localStorage.removeItem(authConfig.storageKeys.isSupervisor);
        localStorage.removeItem(authConfig.storageKeys.userData);
        sessionStorage.clear();
        window.location.href = authConfig.loginPath;
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const logout = async (
    options: LogoutOptions = {},
  ): Promise<{ success: boolean; error?: Error }> => {
    const {
      showMessage = true,
      redirectToLogin = true,
      onBeforeLogout,
      onAfterLogout,
    } = options;

    try {
      setIsLoggingOut(true);

      // Execute before logout callback
      if (onBeforeLogout) {
        await onBeforeLogout();
      }

      // Clear authentication state
      authLogout();

      // Clear other possible session storage data
      // localStorage clear operation removed, unified use of sessionStorage

      // Clear session storage
      sessionStorage.clear();

      // Broadcast logout to other tabs (only localStorage can trigger storage event)
      try {
        localStorage.setItem(BROADCAST_KEY, String(Date.now()));
      } catch {}

      // Show logout success message
      if (showMessage) {
        Message.success('已安全退出登录');
      }

      // Execute after logout callback
      if (onAfterLogout) {
        await onAfterLogout();
      }

      // Redirect to login page
      if (redirectToLogin) {
        // Use replace instead of push to prevent users from going back to logged-out page via back button
        window.location.href = authConfig.loginPath;
      }

      return { success: true };
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        const errorMessage = errorObj.message || '退出登录失败，请重试';
        Message.error(errorMessage);
      }
      return { success: false, error: errorObj };
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Quick logout (no confirmation dialog)
  const quickLogout = () => {
    logout({
      showConfirm: false,
      showMessage: true,
      redirectToLogin: true,
    });
  };

  // Silent logout (no messages displayed)
  const silentLogout = () => {
    logout({
      showConfirm: false,
      showMessage: false,
      redirectToLogin: true,
    });
  };

  // Force logout (for token expiration, etc.)
  const forceLogout = (reason?: string) => {
    const message = reason ? `${reason}，请重新登录` : '登录已过期，请重新登录';

    logout({
      showConfirm: false,
      showMessage: true,
      redirectToLogin: true,
      onBeforeLogout: () => {
        Message.warning(message);
      },
    });
  };

  return {
    logout,
    quickLogout,
    silentLogout,
    forceLogout,
    isLoggingOut,
  };
};
