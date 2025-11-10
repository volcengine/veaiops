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

import { logger } from '@veaiops/utils';
import { useEffect, useRef } from 'react';

interface UseRenderMonitorParams {
  title?: string;
}

export const useRenderMonitor = ({ title }: UseRenderMonitorParams) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const RENDER_WARNING_THRESHOLD = 10;
  const RENDER_ERROR_THRESHOLD = 30;
  const RENDER_TIME_WINDOW = 10000;

  useEffect(() => {
    const now = Date.now();

    if (now - lastRenderTimeRef.current > RENDER_TIME_WINDOW) {
      renderCountRef.current = 0;
      lastRenderTimeRef.current = now;
    }

    renderCountRef.current++;

    if (renderCountRef.current === RENDER_WARNING_THRESHOLD) {
      logger.warn({
        message: `[CustomTable] ⚠️ Frequent render warning! Rendered ${renderCountRef.current} times within ${RENDER_TIME_WINDOW / 1000} seconds`,
        data: {
          title,
          renderCount: renderCountRef.current,
          timeWindow: `${RENDER_TIME_WINDOW / 1000} seconds`,
        },
        source: 'CustomTable',
        component: 'RenderMonitor',
      });
    }

    if (renderCountRef.current >= RENDER_ERROR_THRESHOLD) {
      logger.error({
        message: `[CustomTable] 🚨 Excessive render error! Rendered ${renderCountRef.current} times within ${RENDER_TIME_WINDOW / 1000} seconds`,
        data: {
          title,
          renderCount: renderCountRef.current,
          timeWindow: `${RENDER_TIME_WINDOW / 1000} seconds`,
        },
        source: 'CustomTable',
        component: 'RenderMonitor',
      });
    }
  });
};

