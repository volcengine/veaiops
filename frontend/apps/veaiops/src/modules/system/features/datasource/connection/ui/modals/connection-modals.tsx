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
 * Connection panel modal component collection
 */

import type {
  Connect,
  ConnectCreateRequest,
  ConnectUpdateRequest,
  DataSourceType,
} from 'api-generate';
import type React from 'react';
import { ConnectTestModal } from '../connect-test/connect-test-modal';
import { CreateConnectionModal } from './create-connection-modal';
import { EditConnectionModal } from './edit-connection-modal';

interface ConnectionModalsProps {
  type: DataSourceType;
  createModalVisible: boolean;
  editModalVisible: boolean;
  testModalVisible: boolean;
  editingConnect: Connect | null;
  testingConnect: Connect | null;
  onCreateSubmit: (values: ConnectCreateRequest) => Promise<boolean>;
  onEditSubmit: (values: ConnectUpdateRequest) => Promise<boolean>;
  onCreateCancel: () => void;
  onEditCancel: () => void;
  onTestClose: () => void;
}

export const ConnectionModals: React.FC<ConnectionModalsProps> = ({
  type,
  createModalVisible,
  editModalVisible,
  testModalVisible,
  editingConnect,
  testingConnect,
  onCreateSubmit,
  onEditSubmit,
  onCreateCancel,
  onEditCancel,
  onTestClose,
}) => {
  return (
    <>
      {/* Create connection modal */}
      <CreateConnectionModal
        type={type}
        visible={createModalVisible}
        onSubmit={onCreateSubmit}
        onCancel={onCreateCancel}
      />

      {/* Edit connection modal */}
      <EditConnectionModal
        type={type}
        visible={editModalVisible}
        editingConnect={editingConnect}
        onSubmit={onEditSubmit}
        onCancel={onEditCancel}
      />

      {/* Test connection modal */}
      <ConnectTestModal
        visible={testModalVisible}
        connect={testingConnect}
        onClose={onTestClose}
      />
    </>
  );
};
