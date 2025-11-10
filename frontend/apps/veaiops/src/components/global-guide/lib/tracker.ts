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
 * Global guide tracking tracker
 * Used to collect user behavior data and optimize guide experience
 */

/**
 * Common tracking method parameters interface
 */
interface TrackParams {
  eventName: string;
  properties: Record<string, any>;
}

export class GlobalGuideTracker {
  private userId: string;
  private sessionId: string;

  constructor() {
    this.userId = this.getUserId();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get user ID
   */
  private getUserId(): string {
    // Get from localStorage or user information
    return localStorage.getItem('userId') || 'anonymous';
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track step view
   */
  trackStepView(stepNumber: number): void {
    this.track({
      eventName: 'guide_step_view',
      properties: {
        step_number: stepNumber,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track step completion
   */
  trackStepComplete(stepNumber: number): void {
    this.track({
      eventName: 'guide_step_complete',
      properties: {
        step_number: stepNumber,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track hint click
   */
  trackHintClick({
    stepNumber,
    hintType,
  }: {
    stepNumber: number;
    hintType: string;
  }): void {
    this.track({
      eventName: 'guide_hint_click',
      properties: {
        step_number: stepNumber,
        hint_type: hintType,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track quick fix
   */
  trackQuickFix({
    stepNumber,
    fixType,
  }: {
    stepNumber: number;
    fixType: string;
  }): void {
    this.track({
      eventName: 'guide_fix_click',
      properties: {
        step_number: stepNumber,
        fix_type: fixType,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track route jump
   */
  trackRouteJump({
    fromRoute,
    toRoute,
  }: {
    fromRoute: string;
    toRoute: string;
  }): void {
    this.track({
      eventName: 'guide_jump_route',
      properties: {
        from_route: fromRoute,
        to_route: toRoute,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track guide close
   */
  trackGuideClose(): void {
    this.track({
      eventName: 'guide_close',
      properties: {
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track guide open
   */
  trackGuideOpen(): void {
    this.track({
      eventName: 'guide_open',
      properties: {
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track error occurrence
   */
  trackError({
    stepNumber,
    errorType,
    errorMessage,
  }: {
    stepNumber: number;
    errorType: string;
    errorMessage: string;
  }): void {
    this.track({
      eventName: 'guide_error',
      properties: {
        step_number: stepNumber,
        error_type: errorType,
        error_message: errorMessage,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track task creation
   */
  trackTaskCreate({
    taskType,
    platform,
  }: {
    taskType: string;
    platform: string;
  }): void {
    this.track({
      eventName: 'guide_task_create',
      properties: {
        task_type: taskType,
        platform,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track injection operation
   */
  trackInjection({
    platform,
    strategy,
    success,
  }: {
    platform: string;
    strategy: string;
    success: boolean;
  }): void {
    this.track({
      eventName: 'guide_injection',
      properties: {
        platform,
        strategy,
        success,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Track version management
   */
  trackVersionManagement({
    action,
    versionNumber,
  }: {
    action: string;
    versionNumber: number;
  }): void {
    this.track({
      eventName: 'guide_version_management',
      properties: {
        action,
        version_number: versionNumber,
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId,
      },
    });
  }

  /**
   * Common tracking method
   */
  private track({ eventName, properties }: TrackParams): void {
    try {
      // Can integrate actual tracking service here
      // e.g., analytics.track(eventName, properties);

      // Store locally for debugging
      const trackingData = {
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      };

      const existingData = JSON.parse(
        localStorage.getItem('guide_tracking') || '[]',
      );
      existingData.push(trackingData);

      // Only keep the most recent 100 records
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }

      localStorage.setItem('guide_tracking', JSON.stringify(existingData));
    } catch (error) {
      // console.error removed
    }
  }

  /**
   * Get tracking data
   */
  getTrackingData(): any[] {
    try {
      return JSON.parse(localStorage.getItem('guide_tracking') || '[]');
    } catch (error) {
      console.error('Error getting tracking data:', error);
      return [];
    }
  }

  /**
   * Clear tracking data
   */
  clearTrackingData(): void {
    localStorage.removeItem('guide_tracking');
  }
}

// Create global instance
export const globalGuideTracker = new GlobalGuideTracker();
