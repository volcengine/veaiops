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

import type { PluginContext } from '../../../types/plugin';

export class EmergencyStateHandler {
  private isProcessingStateReset = false;

  setupEmergencyStateResetListener(
    context: PluginContext | null,
    addDebugLog: (action: string, data: any) => void,
    fallbackDOMSync: (loading: boolean) => void,
  ): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('forceStateReset', (event: any) => {
      if (this.isProcessingStateReset) {
        addDebugLog('EMERGENCY_STATE_RESET_SKIPPED', {
          reason: '防止死循环',
          timestamp: Date.now(),
        });
        return;
      }

      try {
        this.isProcessingStateReset = true;
        const detail = event.detail || { loading: false, fetching: false };

        addDebugLog('EMERGENCY_STATE_RESET', {
          detail,
          timestamp: Date.now(),
        });

        if (context) {
          context.setState({
            loading: detail.loading,
            fetching: detail.fetching,
          });

          fallbackDOMSync(detail.loading);

          addDebugLog('EMERGENCY_STATE_RESET_SUCCESS', {
            newState: detail,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        addDebugLog('EMERGENCY_STATE_RESET_ERROR', {
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        });
      } finally {
        this.isProcessingStateReset = false;
      }
    });
  }

  fallbackDOMSync(loading: boolean): void {
    requestAnimationFrame(() => {
      const selectElements = document.querySelectorAll('.arco-select');
      selectElements.forEach((element) => {
        if (loading) {
          element.classList.add('arco-select-loading');
        } else {
          element.classList.remove('arco-select-loading');
        }

        const placeholder = element.querySelector('.arco-select-placeholder');
        if (placeholder) {
          placeholder.textContent = loading ? '搜索中...' : '请选择';
        }
      });
    });
  }
}
