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

import type { BrowserInfo, PageInfo, PerformanceMetrics } from './types';

export const getBrowserInfo = (): BrowserInfo => {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      language: '',
      platform: '',
      screenWidth: 0,
      screenHeight: 0,
      viewportWidth: 0,
      viewportHeight: 0,
      timezone: '',
      cookieEnabled: false,
    };
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
  };
};

export const getPageInfo = (): PageInfo => {
  if (typeof window === 'undefined') {
    return {
      url: '',
      pathname: '',
      search: '',
      hash: '',
      referrer: '',
      title: '',
    };
  }

  return {
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    referrer: document.referrer,
    title: document.title,
  };
};

export const collectPerformanceMetrics = (): PerformanceMetrics => {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const perf = window.performance;
  const navigation = perf.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  const paint = perf.getEntriesByType('paint');

  const metrics: PerformanceMetrics = {};

  if (navigation) {
    metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
    metrics.domContentLoadedTime =
      navigation.domContentLoadedEventEnd - navigation.fetchStart;
    metrics.timeToInteractive =
      navigation.domInteractive - navigation.fetchStart;
  }

  paint.forEach((entry) => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = entry.startTime;
    } else if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });

  if ('memory' in performance) {
    const { memory } = performance as {
      memory?: PerformanceMetrics['memoryUsage'];
    };
    if (memory) {
      metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
  }

  return metrics;
};

