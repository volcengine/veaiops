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
 * AI model related constants
 */

// Model type options
export const MODEL_TYPE_OPTIONS = [
  { label: '分类模型', value: 'classification' },
  { label: '回归模型', value: 'regression' },
  { label: '聚类模型', value: 'clustering' },
  { label: '异常检测', value: 'anomaly_detection' },
  { label: '时序预测', value: 'forecasting' },
];

// Framework options
export const FRAMEWORK_OPTIONS = [
  { label: 'TensorFlow', value: 'tensorflow' },
  { label: 'PyTorch', value: 'pytorch' },
  { label: 'Scikit-learn', value: 'scikit-learn' },
  { label: 'XGBoost', value: 'xgboost' },
  { label: 'LightGBM', value: 'lightgbm' },
];

// Status options
export const STATUS_OPTIONS = [
  { label: '训练中', value: 'training', color: 'blue' },
  { label: '已部署', value: 'deployed', color: 'green' },
  { label: '已停止', value: 'stopped', color: 'gray' },
  { label: '错误', value: 'error', color: 'red' },
  { label: '等待中', value: 'pending', color: 'orange' },
];

// Optimizer options
export const OPTIMIZER_OPTIONS = [
  { label: 'Adam', value: 'adam' },
  { label: 'SGD', value: 'sgd' },
  { label: 'RMSprop', value: 'rmsprop' },
  { label: 'AdaGrad', value: 'adagrad' },
];

// Loss function options
export const LOSS_FUNCTION_OPTIONS = [
  { label: 'Cross Entropy', value: 'cross_entropy' },
  { label: 'Mean Squared Error', value: 'mse' },
  { label: 'Mean Absolute Error', value: 'mae' },
  { label: 'Huber Loss', value: 'huber' },
];

/**
 * Get default configuration for AI model
 * Used as initial values when creating new model
 */
export const DEFAULT_MODEL_CONFIG = {
  type: 'classification',
  framework: 'tensorflow',
  status: 'pending',
  training_config: {
    dataset_size: 10000,
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.001,
    optimizer: 'adam',
    loss_function: 'cross_entropy',
  },
  deployment_config: {
    cpu_cores: 2,
    memory_gb: 4,
    gpu_count: 0,
    max_concurrent_requests: 50,
    auto_scaling: false,
  },
  is_active: false,
};

/**
 * Note: MOCK_MODELS has been removed
 * Please use useBots Hook to get Bot data from real API (as replacement for AI models)
 *
 * Usage example:
 * import { useBots } from '@/hooks/use-api-data';
 *
 * const { data: bots, loading, error, refetch } = useBots();
 */
