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

import { useRef } from 'react';

/**
 * Bot attribute fetching Hook ref management
 */
export const useFetchAttributesRefs = ({
  botId,
  channel,
}: {
  botId: string;
  channel: string;
}) => {
  // Use refs to stabilize botId and channel references, avoid circular dependencies
  const botIdRef = useRef(botId);
  const channelRef = useRef(channel);

  // Update ref values without triggering re-render
  botIdRef.current = botId;
  channelRef.current = channel;

  return {
    botIdRef,
    channelRef,
  };
};
