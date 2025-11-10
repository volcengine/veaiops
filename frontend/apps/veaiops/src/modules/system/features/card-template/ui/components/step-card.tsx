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
 * Card template management guide page
 */

import { downloadCardTemplateWithCallback } from '@/utils/file-download';
import {
  Alert,
  Button,
  Card,
  Divider,
  Link,
  Message,
  Space,
  Steps,
  Typography,
} from '@arco-design/web-react';
import {
  IconDownload,
  IconLink,
  IconSave,
  IconSettings,
  IconUpload,
} from '@arco-design/web-react/icon';
import { useState } from 'react';

const { Title } = Typography;
const { Step } = Steps;
const StepCard = ({ onClose: _onClose }: { onClose?: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: '下载卡片模版',
      description: '下载预置的消息卡片模版文件',
      icon: <IconDownload />,
      content: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              type="info"
              content="请先下载我们为您准备的卡片模版文件，作为后续导入的基础。"
            />
            <div>
              <Title heading={6}>模版文件说明：</Title>
              <ul>
                <li>包含标准的消息通知卡片结构</li>
                <li>支持动态参数替换</li>
                <li>符合飞书卡片规范</li>
              </ul>
            </div>
            <Button
              type="primary"
              icon={<IconDownload />}
              onClick={() => {
                downloadCardTemplateWithCallback(
                  () => {
                    Message.success('卡片模版下载成功！');
                    setCurrentStep(1);
                  },
                  (error) => {
                    Message.error(`下载失败：${error.message}`);
                  },
                );
              }}
            >
              下载卡片模版
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      title: '登录飞书卡片搭建工具',
      description: '访问飞书开放平台的卡片搭建工具',
      icon: <IconLink />,
      content: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              type="info"
              content="请访问飞书卡片搭建工具，使用您的飞书账号登录。"
            />
            <div>
              <Title heading={6}>操作步骤：</Title>
              <ol>
                <li>点击下方链接访问飞书卡片搭建工具</li>
                <li>使用您的飞书账号登录</li>
                <li>进入卡片搭建工作台</li>
              </ol>
            </div>
            <Space>
              <Link
                href="https://open.feishu.cn/cardkit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="primary" icon={<IconLink />}>
                  访问飞书卡片搭建工具
                </Button>
              </Link>
              {/* <Button onClick={() => setCurrentStep(2)}>Login Completed</Button> */}
            </Space>
          </Space>
        </Card>
      ),
    },
    {
      title: '导入卡片模版',
      description: '将下载的模版文件导入到飞书卡片搭建工具',
      icon: <IconUpload />,
      content: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              type="info"
              content="在飞书卡片搭建工具中导入第一步下载的模版文件。"
            />
            <div>
              <Title heading={6}>导入步骤：</Title>
              <ol>
                <li>在卡片搭建工具中点击"导入卡片"按钮</li>
                <li>通过拖拽或选择文件的方式上传模版文件</li>
                <li>确认导入成功，查看卡片预览</li>
              </ol>
            </div>
            {/* <Button onClick={() => setCurrentStep(3)}>Import Completed</Button> */}
          </Space>
        </Card>
      ),
    },
    {
      title: '保存并发布卡片',
      description: '保存卡片模版并获取模版ID',
      icon: <IconSave />,
      content: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              type="info"
              content="保存并发布导入的卡片模版，记录生成的模版ID。"
            />
            <div>
              <Title heading={6}>发布步骤：</Title>
              <ol>
                <li>检查卡片内容和样式</li>
                <li>点击"保存"按钮保存卡片</li>
                <li>点击"发布"按钮发布卡片</li>
                <li>复制生成的卡片模版ID</li>
              </ol>
            </div>
            <Alert
              type="warning"
              content="请务必记录卡片模版ID，这是后续配置消息通知的关键信息。"
            />
            {/* <Button onClick={() => setCurrentStep(4)}>Publish Completed</Button> */}
          </Space>
        </Card>
      ),
    },
    {
      title: '配置消息通知',
      description: '回到事件中心设置消息通知卡片模版ID',
      icon: <IconSettings />,
      content: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              type="success"
              content="最后一步：在事件中心配置页面设置卡片模版ID。"
            />
            <div>
              <Title heading={6}>配置步骤：</Title>
              <ol>
                <li>返回事件中心卡片模版管理页面</li>
                <li>点击"新建模版"按钮</li>
                <li>填写模版信息并输入卡片模版ID</li>
                <li>保存配置完成设置</li>
              </ol>
            </div>
            {/* <Button
              type="primary"
              onClick={() => {
                // onComplete();
              }}
            >
              完成配置
            </Button> */}
          </Space>
        </Card>
      ),
    },
  ];
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        type="info"
        content="欢迎使用消息卡片模版管理功能！卡片模版的创建和配置请参考以下步骤。"
      />

      <Steps current={currentStep} onChange={setCurrentStep}>
        {steps.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </Steps>

      <Divider />

      {steps[currentStep - 1]?.content}
      {/* <div style={{ textAlign: 'center' }}>
        <Space>
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              上一步
            </Button>
          )}
          <Button onClick={onClose}>稍后配置</Button>
        </Space>
      </div> */}
    </Space>
  );
};
export default StepCard;
