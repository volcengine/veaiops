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

import {
  IconCheckCircle,
  IconExclamationCircle,
  IconInfoCircle,
  IconLock,
  IconSafe,
  IconUserAdd,
} from '@arco-design/web-react/icon';
import type React from 'react';

/**
 * Create account info card
 */
export const CreateAccountInfoCard: React.FC = () => {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <IconUserAdd className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            创建新账号须知
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconCheckCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">用户名：</span>
                <span className="text-gray-600">
                  3-20个字符，仅支持字母、数字和下划线
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconCheckCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">邮箱：</span>
                <span className="text-gray-600">
                  用于接收系统通知，支持密码找回
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconCheckCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">密码：</span>
                <span className="text-gray-600">
                  至少6个字符，建议使用大小写字母+数字+特殊字符组合
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconCheckCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">管理员：</span>
                <span className="text-gray-600">
                  拥有所有权限，可管理系统配置和账号
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconCheckCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">普通用户：</span>
                <span className="text-gray-600">仅可查看和使用系统功能</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Change password info card - regular user
 */
export const ChangePasswordInfoCard: React.FC = () => {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <IconLock className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
            密码修改须知
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconInfoCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">身份验证：</span>
                <span className="text-gray-600">
                  需要输入当前登录密码进行身份验证
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconInfoCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">密码要求：</span>
                <span className="text-gray-600">
                  新密码至少6个字符，建议使用大小写字母+数字+特殊字符组合
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconInfoCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">安全建议：</span>
                <span className="text-gray-600">
                  密码长度越长、字符类型越多，安全性越高
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconInfoCircle className="text-blue-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">密码强度：</span>
                <span className="text-gray-600">
                  系统会实时显示密码强度，建议使用"强"级别密码
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * System administrator warning card
 */
interface AdminWarningCardProps {
  username: string;
}

export const AdminWarningCard: React.FC<AdminWarningCardProps> = ({
  username,
}) => {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center animate-pulse">
          <IconSafe className="text-white text-lg" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <IconExclamationCircle className="text-orange-600" />
            系统管理员账号修改密码
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconExclamationCircle className="text-orange-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-orange-700">重要提示：</span>
                <span className="text-gray-600">
                  当前账号为系统管理员，具有最高权限
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconExclamationCircle className="text-orange-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-orange-700">身份验证：</span>
                <span className="text-gray-600">
                  需要输入当前登录密码进行身份验证
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconExclamationCircle className="text-orange-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-orange-700">密码要求：</span>
                <span className="text-gray-600">
                  新密码至少6个字符，
                  <strong className="text-orange-700">
                    强烈建议使用"强"级别密码
                  </strong>
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconExclamationCircle className="text-orange-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-orange-700">安全建议：</span>
                <span className="text-gray-600">
                  使用大小写字母+数字+特殊字符组合，且长度至少12位
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconExclamationCircle className="text-orange-500 text-base mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-orange-700">妥善保管：</span>
                <span className="text-gray-600">
                  密码修改后请妥善保管，避免泄露造成安全风险
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
