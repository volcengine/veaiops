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

/**
 * GlobalGuide dedicated log collector
 * Specifically collects and exports full-chain logs related to GlobalGuide
 */

import {
  exportLogsInTimeRange,
  logger,
  startLogCollection,
  stopLogCollection,
} from '@veaiops/utils';

interface GlobalGuideLogSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  featureId?: string;
  stepNumber?: number;
  status: 'collecting' | 'completed' | 'failed';
}

class GlobalGuideLogCollector {
  private currentSession: GlobalGuideLogSession | null = null;
  private isCollecting = false;

  /**
   * Start collecting GlobalGuide logs
   */
  startCollection({
    featureId,
    stepNumber,
  }: {
    featureId?: string;
    stepNumber?: number;
  } = {}): string {
    const sessionId = `global-guide-${Date.now()}`;

    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      featureId,
      stepNumber,
      status: 'collecting',
    };

    // Start collecting logs
    startLogCollection();
    this.isCollecting = true;

    logger.info({
      message: '[GlobalGuideLogCollector] 开始收集 GlobalGuide 日志',
      data: {
        sessionId,
        featureId,
        stepNumber,
        startTime: new Date().toISOString(),
        url: window.location.href,
      },
      source: 'GlobalGuideLogCollector',
      component: 'startCollection',
    });

    return sessionId;
  }

  /**
   * Stop collection and export logs
   */
  exportLogs(filename?: string): string | null {
    if (!this.currentSession || !this.isCollecting) {
      console.warn('⚠️ No active log collection session');
      return null;
    }

    // Stop collection
    stopLogCollection();
    this.isCollecting = false;

    // Update session status
    this.currentSession.endTime = Date.now();
    this.currentSession.status = 'completed';

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalFilename = filename || `global-guide-logs-${timestamp}.log`;

    // Export logs from the last 10 minutes (covers entire GlobalGuide flow)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    exportLogsInTimeRange(tenMinutesAgo, undefined, finalFilename);

    logger.info({
      message: '[GlobalGuideLogCollector] GlobalGuide 日志已导出',
      data: {
        sessionId: this.currentSession.sessionId,
        filename: finalFilename,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        featureId: this.currentSession.featureId,
        stepNumber: this.currentSession.stepNumber,
        endTime: new Date().toISOString(),
      },
      source: 'GlobalGuideLogCollector',
      component: 'exportLogs',
    });

    // Clear current session
    this.currentSession = null;

    return finalFilename;
  }

  /**
   * Get current session information
   */
  getCurrentSession(): GlobalGuideLogSession | null {
    return this.currentSession;
  }

  /**
   * Check if currently collecting
   */
  isCurrentlyCollecting(): boolean {
    return this.isCollecting;
  }

  /**
   * Force stop collection (without export)
   */
  stopCollection(): void {
    if (this.isCollecting) {
      stopLogCollection();
      this.isCollecting = false;

      if (this.currentSession) {
        this.currentSession.status = 'failed';
        this.currentSession.endTime = Date.now();
      }
    }
  }

  /**
   * Quick export recent GlobalGuide logs
   */
  quickExport(): string | null {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `global-guide-quick-export-${timestamp}.log`;

    // Export logs from the last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    exportLogsInTimeRange(fiveMinutesAgo, undefined, filename);

    return filename;
  }
}

// Create global instance
export const globalGuideLogCollector = new GlobalGuideLogCollector();

// Export convenience methods
interface StartGlobalGuideLogCollectionParams {
  featureId?: string;
  stepNumber?: number;
}

export const startGlobalGuideLogCollection = ({
  featureId,
  stepNumber,
}: StartGlobalGuideLogCollectionParams = {}) => {
  return globalGuideLogCollector.startCollection({ featureId, stepNumber });
};

export const exportGlobalGuideLogs = (filename?: string) => {
  return globalGuideLogCollector.exportLogs(filename);
};

export const quickExportGlobalGuideLogs = () => {
  return globalGuideLogCollector.quickExport();
};

export const getGlobalGuideLogSession = () => {
  return globalGuideLogCollector.getCurrentSession();
};

export const isGlobalGuideLogCollecting = () => {
  return globalGuideLogCollector.isCurrentlyCollecting();
};

// Mount methods to global object for debugging convenience
if (typeof window !== 'undefined') {
  (window as any).startGlobalGuideLogCollection = startGlobalGuideLogCollection;
  (window as any).exportGlobalGuideLogs = exportGlobalGuideLogs;
  (window as any).quickExportGlobalGuideLogs = quickExportGlobalGuideLogs;
  (window as any).getGlobalGuideLogSession = getGlobalGuideLogSession;
  (window as any).isGlobalGuideLogCollecting = isGlobalGuideLogCollecting;
}
