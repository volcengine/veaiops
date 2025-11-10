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
import type { BaseHttpRequest } from './core/base-http-request';
import { FetchHttpRequest } from './core/fetch-http-request';
import type { OpenAPIConfig } from './core/open-api';
import { AgentTemplateService } from './services/agent-template-service';
import { AuthenticationService } from './services/authentication-service';
import { BotAttributesService } from './services/bot-attributes-service';
import { BotsService } from './services/bots-service';
import { ChatsService } from './services/chats-service';
import { CustomersService } from './services/customers-service';
import { DataSourceConnectService } from './services/data-source-connect-service';
import { DataSourcesService } from './services/data-sources-service';
import { EventService } from './services/event-service';
import { GlobalConfigService } from './services/global-config-service';
import { InformStrategyService } from './services/inform-strategy-service';
import { IntelligentThresholdAlarmService } from './services/intelligent-threshold-alarm-service';
import { IntelligentThresholdTaskService } from './services/intelligent-threshold-task-service';
import { MetricTemplateService } from './services/metric-template-service';
import { OncallRuleService } from './services/oncall-rule-service';
import { OncallScheduleService } from './services/oncall-schedule-service';
import { ProductsService } from './services/products-service';
import { ProjectsService } from './services/projects-service';
import { StatisticsService } from './services/statistics-service';
import { SubscribeService } from './services/subscribe-service';
import { UsersService } from './services/users-service';
import { WebhookService } from './services/webhook-service';
import { ZabbixService } from './services/zabbix-service';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class VolcAIOpsApi {
  public readonly agentTemplate: AgentTemplateService;
  public readonly authentication: AuthenticationService;
  public readonly botAttributes: BotAttributesService;
  public readonly bots: BotsService;
  public readonly chats: ChatsService;
  public readonly customers: CustomersService;
  public readonly dataSourceConnect: DataSourceConnectService;
  public readonly dataSources: DataSourcesService;
  public readonly event: EventService;
  public readonly globalConfig: GlobalConfigService;
  public readonly informStrategy: InformStrategyService;
  public readonly intelligentThresholdAlarm: IntelligentThresholdAlarmService;
  public readonly intelligentThresholdTask: IntelligentThresholdTaskService;
  public readonly metricTemplate: MetricTemplateService;
  public readonly oncallRule: OncallRuleService;
  public readonly oncallSchedule: OncallScheduleService;
  public readonly products: ProductsService;
  public readonly projects: ProjectsService;
  public readonly statistics: StatisticsService;
  public readonly subscribe: SubscribeService;
  public readonly users: UsersService;
  public readonly webhook: WebhookService;
  public readonly zabbix: ZabbixService;
  public readonly request: BaseHttpRequest;
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = FetchHttpRequest,
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? '',
      VERSION: config?.VERSION ?? '1.0.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.agentTemplate = new AgentTemplateService(this.request);
    this.authentication = new AuthenticationService(this.request);
    this.botAttributes = new BotAttributesService(this.request);
    this.bots = new BotsService(this.request);
    this.chats = new ChatsService(this.request);
    this.customers = new CustomersService(this.request);
    this.dataSourceConnect = new DataSourceConnectService(this.request);
    this.dataSources = new DataSourcesService(this.request);
    this.event = new EventService(this.request);
    this.globalConfig = new GlobalConfigService(this.request);
    this.informStrategy = new InformStrategyService(this.request);
    this.intelligentThresholdAlarm = new IntelligentThresholdAlarmService(
      this.request,
    );
    this.intelligentThresholdTask = new IntelligentThresholdTaskService(
      this.request,
    );
    this.metricTemplate = new MetricTemplateService(this.request);
    this.oncallRule = new OncallRuleService(this.request);
    this.oncallSchedule = new OncallScheduleService(this.request);
    this.products = new ProductsService(this.request);
    this.projects = new ProjectsService(this.request);
    this.statistics = new StatisticsService(this.request);
    this.subscribe = new SubscribeService(this.request);
    this.users = new UsersService(this.request);
    this.webhook = new WebhookService(this.request);
    this.zabbix = new ZabbixService(this.request);
  }
}
