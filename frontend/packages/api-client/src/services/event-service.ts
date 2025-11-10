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

/* generated using openapi-typescript-codegen -- do not edit */
import type { AgentNotification } from '../models/agent-notification';
import type { AgentType } from '../models/agent-type';
import type { APIResponse } from '../models/api-response';
import type { APIResponseEvent } from '../models/api-response-event';
import type { APIResponseString } from '../models/api-response-string';
import type { Event } from '../models/event';
import type { EventShowStatus } from '../models/event-show-status';
import type { PaginatedAPIResponseEventList } from '../models/paginated-api-response-event-list';
import type { CancelablePromise } from '../core/cancelable-promise';
import type { BaseHttpRequest } from '../core/base-http-request';
export class EventService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get Events
   * Retrieve a list of events with optional filtering and pagination
   * @returns PaginatedAPIResponseEventList Successful Response
   * @throws ApiError
   */
  public getApisV1ManagerEventCenterEvent({
    agentType,
    eventLevel,
    showStatus,
    region,
    projects,
    products,
    customers,
    startTime,
    endTime,
    sortOrder = 'desc',
    skip,
    limit = 100,
  }: {
    /**
     * Filter events by agent type (multiple selection allowed)
     */
    agentType?: Array<AgentType>,
    /**
     * Filter events by event level
     */
    eventLevel?: Array<'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>,
    /**
     * Filter events by show status (multiple selection allowed). Allowed values: Pending (PENDING), Success (SUCCESS), Not Subscribed (NOT_SUBSCRIBED), Not Matched (NOT_MATCHED), Filtered (FILTERED), Restrained (RESTRAINED)
     */
    showStatus?: Array<EventShowStatus>,
    /**
     * Filter events by region
     */
    region?: Array<string>,
    /**
     * Filter events by projects
     */
    projects?: Array<string>,
    /**
     * Filter events by products
     */
    products?: Array<string>,
    /**
     * Filter events by customers
     */
    customers?: Array<string>,
    /**
     * Filter events from start time
     */
    startTime?: string,
    /**
     * Filter events to end time
     */
    endTime?: string,
    /**
     * Sort order by creation time
     */
    sortOrder?: 'asc' | 'desc',
    /**
     * Number of events to skip
     */
    skip?: number,
    /**
     * Maximum number of events to return
     */
    limit?: number,
  }): CancelablePromise<PaginatedAPIResponseEventList> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/manager/event-center/event/',
      query: {
        'agent_type': agentType,
        'event_level': eventLevel,
        'show_status': showStatus,
        'region': region,
        'projects': projects,
        'products': products,
        'customers': customers,
        'start_time': startTime,
        'end_time': endTime,
        'sort_order': sortOrder,
        'skip': skip,
        'limit': limit,
      },
    });
  }
  /**
   * Create Event
   * Create a new event
   * @returns APIResponseEvent Created Successfully
   * @throws ApiError
   */
  public postApisV1ManagerEventCenterEvent({
    requestBody,
  }: {
    requestBody: Event,
  }): CancelablePromise<APIResponseEvent> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/manager/event-center/event/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get Event
   * Get an event by ID
   * @returns APIResponseEvent Successful Response
   * @throws ApiError
   */
  public getApisV1ManagerEventCenterEvent1({
    eventId,
  }: {
    eventId: string,
  }): CancelablePromise<APIResponseEvent> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/apis/v1/manager/event-center/event/{event_id}',
      path: {
        'event_id': eventId,
      },
    });
  }
  /**
   * Delete Event
   * Delete an event (soft delete)
   * @returns APIResponse Deleted Successfully
   * @throws ApiError
   */
  public deleteApisV1ManagerEventCenterEvent({
    eventId,
  }: {
    eventId: string,
  }): CancelablePromise<APIResponse> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/apis/v1/manager/event-center/event/{event_id}',
      path: {
        'event_id': eventId,
      },
    });
  }
  /**
   * Create Chatops Event
   * Create a new chatops event from agent notification
   * @returns APIResponseString Created Successfully
   * @throws ApiError
   */
  public postApisV1ManagerEventCenterEventChatops({
    requestBody,
  }: {
    requestBody: AgentNotification,
  }): CancelablePromise<APIResponseString> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/apis/v1/manager/event-center/event/chatops/',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
