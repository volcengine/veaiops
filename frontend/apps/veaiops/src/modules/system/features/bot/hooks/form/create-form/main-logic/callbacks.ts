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

import type { FormInstance } from '@arco-design/web-react';
import { useCallback } from 'react';
import {
  addKbCollection as addKbCollectionUtil,
  checkAppIdDuplicate,
  removeKbCollection as removeKbCollectionUtil,
  updateKbCollection as updateKbCollectionUtil,
} from '../utils';

/**
 * Bot create form callback functions
 */
export const useBotCreateFormCallbacks = ({
  form,
  kbCollections,
  setKbCollections,
  setShowSecrets,
}: {
  form: FormInstance;
  kbCollections: string[];
  setKbCollections: (collections: string[]) => void;
  setShowSecrets: React.Dispatch<
    React.SetStateAction<{
      secret: boolean;
      ak: boolean;
      sk: boolean;
      api_key: boolean;
    }>
  >;
}) => {
  // Add knowledge base collection
  const addKbCollection = useCallback(() => {
    addKbCollectionUtil(kbCollections, setKbCollections);
  }, [kbCollections, setKbCollections]);

  // Remove knowledge base collection
  const removeKbCollection = useCallback(
    (index: number) => {
      removeKbCollectionUtil({
        index,
        kbCollections,
        form,
        setKbCollections,
      });
    },
    [kbCollections, form, setKbCollections],
  );

  // Update knowledge base collection
  const updateKbCollection = useCallback(
    ({ index, value }: { index: number; value: string }) => {
      updateKbCollectionUtil({
        index,
        value,
        kbCollections,
        form,
        setKbCollections,
      });
    },
    [kbCollections, form, setKbCollections],
  );

  // Toggle password visibility
  const toggleSecretVisibility = useCallback(
    (field: 'secret' | 'ak' | 'sk' | 'api_key') => {
      setShowSecrets((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    },
    [setShowSecrets],
  );

  /**
   * Check if App ID is duplicate
   * @param appId - App ID to check
   * @returns Error message if duplicate, otherwise undefined
   */
  const checkAppIdDuplicateHandler = useCallback(
    async (appId: string): Promise<string | undefined> => {
      return await checkAppIdDuplicate(appId);
    },
    [],
  );

  return {
    addKbCollection,
    removeKbCollection,
    updateKbCollection,
    toggleSecretVisibility,
    checkAppIdDuplicate: checkAppIdDuplicateHandler,
  };
};
