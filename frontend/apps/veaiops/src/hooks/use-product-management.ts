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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { Product } from 'api-generate';
import { useCallback, useEffect, useState } from 'react';

/**
 * Product table data type
 */
interface ProductTableData extends Product {
  key: string;
  status: 'active' | 'inactive';
  is_active: boolean;
}

/**
 * Product management Hook
 */
export const useProductManagement = () => {
  const [products, setProducts] = useState<ProductTableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Get product list
  const fetchProducts = useCallback(
    async (params?: { skip?: number; limit?: number; name?: string }) => {
      try {
        setLoading(true);
        const response =
          await apiClient.products.getApisV1ManagerSystemConfigProducts({
            skip: params?.skip,
            limit: params?.limit,
            name: params?.name,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          const tableData: ProductTableData[] = response.data.map(
            (product: Product) => ({
              ...product,
              key: product.product_id || product.id || '',
              status: 'active' as const,
              is_active: true,
            }),
          );
          setProducts(tableData);
        } else {
          throw new Error(response.message || '获取产品列表失败');
        }
      } catch (error: unknown) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '获取产品列表失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'useProductManagement',
          component: 'fetchProducts',
        });
        const errorMessage =
          error instanceof Error ? error.message : '获取产品列表失败，请重试';
        Message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Delete product
  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        setLoading(true);
        const response =
          await apiClient.products.deleteApisV1ManagerSystemConfigProducts({
            productId,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('产品删除成功');
          await fetchProducts(); // Refresh list
          return true;
        } else {
          throw new Error(response.message || '删除产品失败');
        }
      } catch (error: unknown) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '删除产品失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'useProductManagement',
          component: 'deleteProduct',
        });
        const errorMessage =
          error instanceof Error ? error.message : '删除产品失败，请重试';
        Message.error(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchProducts],
  );

  // Import products
  const importProducts = useCallback(
    async (file: File) => {
      try {
        setImportLoading(true);

        // Use correct import endpoint
        const response =
          await apiClient.products.postApisV1ManagerSystemConfigProductsImport({
            formData: { file },
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('产品导入成功');
          await fetchProducts(); // Refresh list
          return true;
        } else {
          throw new Error(response.message || '导入产品失败');
        }
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '导入产品失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'ProductManagement',
          component: 'importProducts',
        });
        const errorMessage =
          errorObj.message || '导入产品失败，请检查文件格式后重试';
        Message.error(errorMessage);
        return false;
      } finally {
        setImportLoading(false);
      }
    },
    [fetchProducts],
  );

  // Fetch data when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    importLoading,
    fetchProducts,
    deleteProduct,
    importProducts,
  };
};

export default useProductManagement;
