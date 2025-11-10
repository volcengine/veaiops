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
 * Plugin event system module
 * Responsible for event communication between plugins
 *
 * @date 2025-12-19
 */
import { devLog } from '@/custom-table/utils/log-utils';

/**
 * @name Event listener type
 */
export type EventListener = (...args: unknown[]) => void;

/**
 * @name Event unsubscribe function type
 */
export type UnsubscribeFunction = () => void;

/**
 * @name Plugin event system
 */
export class PluginEventSystem {
  private eventListeners: Record<string, EventListener[]> = {};

  /**
   * @name Emit event
   */
  emit(event: string, ...args: unknown[]): void {
    const listeners = this.eventListeners[event] || [];

    listeners.forEach((listener) => {
      try {
        listener(...args);
      } catch (error: unknown) {
        // ✅ Correct: Record error but don't interrupt other listeners' execution, expose actual error information
        // Event listener errors should not interrupt other listeners, but still need to log for debugging
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        devLog.warn({
          component: 'PluginEventSystem',
          message: `Event listener execution failed (event: "${event}")`,
          data: {
            event,
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
        });
      }
    });
  }

  /**
   * @name Listen to event
   */
  on({
    event,
    listener,
  }: {
    event: string;
    listener: EventListener;
  }): UnsubscribeFunction {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    this.eventListeners[event].push(listener);

    // Return unsubscribe function
    return () => {
      this.off({ event, listener });
    };
  }

  /**
   * @name Listen to event once
   */
  once({
    event,
    listener,
  }: {
    event: string;
    listener: EventListener;
  }): UnsubscribeFunction {
    const onceListener: EventListener = (...args) => {
      listener(...args);
      this.off({ event, listener: onceListener });
    };

    return this.on({ event, listener: onceListener });
  }

  /**
   * @name Unsubscribe from event
   */
  off({
    event,
    listener,
  }: {
    event: string;
    listener?: EventListener;
  }): void {
    if (!this.eventListeners[event]) {
      return;
    }

    if (!listener) {
      // Remove all listeners for this event
      delete this.eventListeners[event];
      return;
    }

    const index = this.eventListeners[event].indexOf(listener);
    if (index > -1) {
      this.eventListeners[event].splice(index, 1);
    }

    // If no listeners left, delete event
    if (this.eventListeners[event].length === 0) {
      delete this.eventListeners[event];
    }
  }

  /**
   * @name Get event listener count
   */
  getListenerCount(event: string): number {
    return this.eventListeners[event]?.length || 0;
  }

  /**
   * @name Get all event names
   */
  getEventNames(): string[] {
    return Object.keys(this.eventListeners);
  }

  /**
   * @name Check if has listeners
   */
  hasListeners(event: string): boolean {
    return this.getListenerCount(event) > 0;
  }

  /**
   * @name Remove all event listeners
   */
  removeAllListeners(): void {
    this.eventListeners = {};
  }

  /**
   * @name Remove all listeners for specified event
   */
  removeAllListenersForEvent(event: string): void {
    delete this.eventListeners[event];
  }

  /**
   * @name Get event system status
   */
  getStatus(): {
    totalEvents: number;
    totalListeners: number;
    events: Record<string, number>;
  } {
    const events = this.getEventNames();
    const totalListeners = events.reduce(
      (sum, event) => sum + this.getListenerCount(event),
      0,
    );

    const eventCounts: Record<string, number> = {};
    events.forEach((event) => {
      eventCounts[event] = this.getListenerCount(event);
    });

    return {
      totalEvents: events.length,
      totalListeners,
      events: eventCounts,
    };
  }
}
