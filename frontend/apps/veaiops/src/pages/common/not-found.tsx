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

import { Button, Empty, Result, Space } from '@arco-design/web-react';
import { IconHome, IconLeft } from '@arco-design/web-react/icon';
import { useNavigate } from '@modern-js/runtime/router';
import type React from 'react';

/**
 * 404 page component
 *
 * Used to display page not found message
 * Provides actions to go back or return to home page
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="max-w-2xl w-full px-6">
        <Result
          status="404"
          title="404"
          subTitle="抱歉，您访问的页面不存在"
          extra={
            <Space size="large" className="mt-6">
              <Button
                type="outline"
                icon={<IconLeft />}
                onClick={handleGoBack}
                size="large"
              >
                返回上一页
              </Button>
              <Button
                type="primary"
                icon={<IconHome />}
                onClick={handleGoHome}
                size="large"
              >
                返回首页
              </Button>
            </Space>
          }
        >
          <div className="mt-8">
            <Empty
              description={
                <div className="text-text-secondary">
                  <p>您可能输入了错误的地址，或该页面已被移除</p>
                  <p className="mt-2">
                    请检查 URL 是否正确，或返回首页继续浏览
                  </p>
                </div>
              }
              imgSrc="//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a0082b7754fbdb2d98a5c18d0b0edd25.png~tplv-uwbnlip3yd-webp.webp"
            />
          </div>
        </Result>
      </div>
    </div>
  );
};

export default NotFoundPage;
