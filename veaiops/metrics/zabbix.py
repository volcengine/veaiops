# Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import asyncio
import os
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from pyzabbix import ZabbixAPI

from veaiops.handler.errors import RecordNotFoundError
from veaiops.metrics.base import (
    BaseRuleConfig,
    BaseRuleSynchronizer,
    DataSource,
    generate_unique_key,
    rate_limit,
)
from veaiops.metrics.timeseries import InputTimeSeries
from veaiops.schema.documents import (
    IntelligentThresholdTask,
)
from veaiops.schema.types import EventLevel
from veaiops.settings import WebhookSettings, get_settings
from veaiops.utils.crypto import decrypt_secret_value
from veaiops.utils.log import logger

__all__ = [
    "ZabbixClient",
    "ZabbixDataSource",
    "ZabbixTarget",
    "ZabbixTriggerTag",
    "ZabbixTemplate",
    "ZabbixTemplateMetric",
    "ZabbixHost",
    "ZabbixItem",
    "ZabbixMediatype",
    "ZabbixUserGroup",
    "DEFAULT_PAGE_SIZE",
]

DEFAULT_PAGE_SIZE = 5000


class ZabbixTriggerTag(BaseModel):
    """Zabbix trigger tag configuration."""

    tag: str = Field(..., description="Tag key")
    value: str = Field(..., description="Tag value")


class ZabbixTriggerConfig(BaseModel):
    """Zabbix trigger configuration."""

    hostname: str = Field(..., description="Host name")
    metric_name: str = Field(..., description="Metric name")
    start: int = Field(..., description="Start time")
    end: int = Field(..., description="End time")
    threshold: float = Field(..., description="Threshold value")
    threshold_operator: str = Field(..., description="Threshold operator (>, <, >=, <=, =, <>)")
    aggregation_function: str = Field(..., description="Aggregation function (e.g., min, max, avg)")
    aggregation_period: str = Field(..., description="Aggregation period (e.g., 5m, 1h)")


class ZabbixTarget(BaseModel):
    """ZabbixTarget structure with itemid and hostname."""

    itemid: str = Field(..., description="Zabbix item ID")
    hostname: str = Field(..., description="Host name")


class ZabbixMediatype(BaseModel):
    """Zabbix mediatype model with essential fields."""

    media_type_id: str = Field(..., description="Zabbix mediatype ID")
    name: str = Field(..., description="Zabbix mediatype name")
    media_type: str = Field(..., description="Zabbix mediatype type")


class ZabbixUserGroup(BaseModel):
    """Zabbix user group model."""

    usrgrpid: str = Field(..., description="Zabbix user group ID")
    name: str = Field(..., description="Zabbix user group name")
    gui_access: str = Field(..., description="GUI access level")
    users_status: str = Field(..., description="User status")
    debug_mode: str = Field(..., description="Debug mode")


class ZabbixTemplate(BaseModel):
    """Zabbix template model with only essential fields."""

    templateid: str = Field(..., description="Zabbix template ID")
    name: str = Field(..., description="Zabbix template name")


class ZabbixTemplateMetric(BaseModel):
    """Zabbix template metric model with essential fields."""

    history: str = Field(..., description="History type")
    name: str = Field(..., description="Metric name")
    metric_name: str = Field(..., description="Item key")


class ZabbixHost(BaseModel):
    """Zabbix host model with essential fields."""

    host: str = Field(..., description="Zabbix host")
    name: str = Field(..., description="Zabbix Host name")


class ZabbixItem(BaseModel):
    """Zabbix item model with essential fields."""

    hostname: str = Field(..., description="Host name")
    itemid: str = Field(..., description="Zabbix item ID")


default_media_type = "ve_aiops_media_type"
default_action = "ve_aiops_action"
default_tag_key = "managed-by"
default_tag_value = "ve_aiops"
default_timeout = int(os.getenv("ZABBIX_TIMEOUT", 10))

webhook_script = """
try {
    Zabbix.log(4, '[ Jira webhook ] Started with params: ' + value);

    var result = {
            'tags': {
                'endpoint': 'jira'
            }
        },
        params = JSON.parse(value),
        req = new HttpRequest(),
        resp;


    req.addHeader('Content-Type: application/json');

    resp = req.post(params.url,
        JSON.stringify({params: params})
    );

    if (req.getStatus() != 200) {
        throw 'Response code: ' + req.getStatus();
    }

    resp = JSON.parse(resp);
    result.tags.issue_id = resp.id;
    result.tags.issue_key = resp.key;

    return JSON.stringify(result);
}
catch (error) {
    Zabbix.log(4, '[ Jira webhook ] Issue creation failed json : ' + JSON.stringify({"params": params}));
    Zabbix.log(3, '[ Jira webhook ] issue creation failed : ' + error);

    throw 'Failed with error: ' + error;
}
"""

message_templates = [
    {
        "eventsource": 0,
        "recovery": 0,  # 问题消息
        "subject": "Problem: {EVENT.NAME}",
        "message": """Problem started at {EVENT.TIME} on {EVENT.DATE}
Problem name: {EVENT.NAME}
Host: {HOST.NAME}
Severity: {EVENT.SEVERITY}
Operational data: {EVENT.OPDATA}
Original problem ID: {EVENT.ID}
""",
    },
    {
        "eventsource": 0,
        "recovery": 1,  # 问题恢复消息
        "subject": "Resolved in {EVENT.DURATION}: {EVENT.NAME}",
        "message": """Problem has been resolved at {EVENT.RECOVERY.TIME} on {EVENT.RECOVERY.DATE}
Problem name: {EVENT.NAME}
Problem duration: {EVENT.DURATION}
Host: {HOST.NAME}
Severity: {EVENT.SEVERITY}
Original problem ID: {EVENT.ID}
{TRIGGER.URL}""",
    },
]

value_type_float = "0"
value_type_unsigned_int = "3"


class ZabbixClient:
    """Zabbix API client wrapper."""

    def __init__(self, url: str, user: str, password: str) -> None:
        self.zapi = ZabbixAPI(url, timeout=default_timeout)
        self.zapi.login(user, password)

    async def get_metric_data(
        self,
        item_ids: List[int],
        time_from: Optional[int] = None,
        time_till: Optional[int] = None,
        history_type: int = 0,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> List[Dict[str, Any]]:
        """Get history data for a single page.

        Args:
            item_ids: List of item IDs to get history for
            time_from: Start time as Unix timestamp
            time_till: End time as Unix timestamp
            history_type: History type (0 - numeric float, 1 - character, etc.)
            page_size: Number of records per batch (recommended <= 5000)

        Returns:
            List of history data points for a single page
        """

        def _get_history(*args):
            logger.debug(f"Fetching history for default_timeout: {default_timeout},item_ids: {item_ids}")
            return self.zapi.history.get(
                itemids=item_ids,
                time_from=time_from,
                time_till=time_till,
                output="extend",
                limit=page_size,
                history=history_type,
                sortfield="clock",
                sortorder="ASC",
            )

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _get_history)

    def get_triggers(self, pattern: str) -> List[Dict[str, Any]]:
        """Get all Zabbix triggers, optionally filtered by description pattern.

        Args:
            pattern: pattern to filter triggers by description

        Returns:
            List of trigger dictionaries
        """
        return self.zapi.trigger.get(search={"description": pattern}, output="extend")

    def create_rule(
        self,
        unique_key: str,
        trigger_configs: List[ZabbixTriggerConfig],
        dynamic_tags: List[ZabbixTriggerTag] = None,
        priority: int = 1,
        contact_group_ids: Optional[List[str]] = None,
        alert_methods: Optional[List[str]] = None,
    ) -> None:
        """Create a Zabbix trigger rule.

        Args:
            unique_key: trigger unique key
            trigger_configs: List of trigger configurations with time ranges
            dynamic_tags: List of dynamic tags to add to the trigger
            priority: Zabbix trigger priority (1 for info, 2 for warning, 4 for critical)
            contact_group_ids: List of contact group IDs (optional)
            alert_methods: List of alert methods (optional)

        Returns:
            None
        """
        # Use dynamic tags directly
        all_tags = dynamic_tags or []  # Use dynamic tags only

        trigger_tags = [{"tag": tag.tag, "value": tag.value} for tag in all_tags]
        expressions = []

        for trigger_config in trigger_configs:
            expressions.append(
                f"({trigger_config.aggregation_function}(/{trigger_config.hostname}/{trigger_config.metric_name},{trigger_config.aggregation_period})"
                f"{trigger_config.threshold_operator}{trigger_config.threshold} "
                f"and time()>={trigger_config.start} and time()<={trigger_config.end})"
            )

        expression = " or ".join(expressions)

        self.zapi.trigger.create(
            description=unique_key,
            expression=expression,
            tags=trigger_tags,
            priority=priority,
            status=0,
        )

        # If contact group and alert methods are provided, create actions
        if contact_group_ids and alert_methods:
            self.create_action(
                trigger_name=unique_key,
                user_group_ids=contact_group_ids,
                media_type_ids=alert_methods,
            )

    def update_rule(
        self,
        unique_key: str,
        trigger_configs: List[ZabbixTriggerConfig],
        existing_trigger: Dict[str, Any],
        dynamic_tags: List[ZabbixTriggerTag] = None,
        priority: int = 1,
        contact_group_ids: Optional[List[str]] = None,
        alert_methods: Optional[List[str]] = None,
    ) -> None:
        """Update a Zabbix trigger rule.

        Args:
            unique_key: trigger unique key
            trigger_configs: List of trigger configurations with time ranges
            existing_trigger: Existing trigger data from Zabbix
            dynamic_tags: List of dynamic tags to add to the trigger
            priority: Zabbix trigger priority (1 for info, 2 for warning, 4 for critical)
            contact_group_ids: List of contact group IDs (optional)
            alert_methods: List of alert methods (optional)

        Returns:
            None
        """
        # Use dynamic tags directly
        all_tags = dynamic_tags or []  # Use dynamic tags only
        trigger_id = existing_trigger.get("triggerid")
        if not trigger_id:
            raise ValueError(f"Trigger {unique_key} not found")

        trigger_tags = [{"tag": tag.tag, "value": tag.value} for tag in all_tags]
        expressions = []

        for trigger_config in trigger_configs:
            expressions.append(
                f"({trigger_config.aggregation_function}(/{trigger_config.hostname}/{trigger_config.metric_name},{trigger_config.aggregation_period})"
                f"{trigger_config.threshold_operator}{trigger_config.threshold} "
                f"and time()>={trigger_config.start} and time()<={trigger_config.end})"
            )

        expression = " or ".join(expressions)

        triggers = self.zapi.trigger.get(filter={"description": unique_key})
        for trigger in triggers:
            trigger_id = trigger["triggerid"]
            self.zapi.trigger.update(
                triggerid=trigger_id,
                expression=expression,
                tags=trigger_tags,
                priority=priority,
            )

        # If contact group and alert methods are provided, update actions
        if contact_group_ids and alert_methods:
            self.update_action(trigger_name=unique_key, user_group_ids=contact_group_ids, media_type_ids=alert_methods)

        # If contact group or alert methods are not provided, delete actions
        elif not contact_group_ids or not alert_methods:
            self.delete_action(unique_key)

    def delete_rules(self, unique_keys: List[str]) -> None:
        """Delete Zabbix trigger rules in bulk.

        Args:
            unique_keys: list of trigger unique keys

        Returns:
            None
        """
        # First bulk delete actions associated with triggers
        for unique_key in unique_keys:
            self.delete_action(unique_key)

        # Then bulk delete triggers
        triggers = self.zapi.trigger.get(filter={"description": unique_keys})
        if triggers:
            trigger_ids = [trigger["triggerid"] for trigger in triggers]
            self.zapi.trigger.delete(*trigger_ids)

    def get_templates(self, name: Optional[str] = None) -> List[ZabbixTemplate]:
        """Get all Zabbix templates, optionally filtered by name.

        Args:
            name: Optional name pattern to filter templates by name

        Returns:
            List of ZabbixTemplate objects
        """
        return [
            ZabbixTemplate(templateid=template["templateid"], name=template["host"])
            for template in self.zapi.template.get(search={"name": name}, output="extend")
        ]

    def get_mediatypes(self) -> List[ZabbixMediatype]:
        """Get all Zabbix mediatypes.

        Returns:
            List of ZabbixMediatype objects
        """
        return [
            ZabbixMediatype(
                media_type_id=mediatype["mediatypeid"], name=mediatype["name"], media_type=mediatype["type"]
            )
            for mediatype in self.zapi.mediatype.get(output="extend")
        ]

    def get_usergroups(self) -> List[ZabbixUserGroup]:
        """Get all Zabbix user groups.

        Returns:
            List of ZabbixUserGroup objects
        """
        return [
            ZabbixUserGroup(
                usrgrpid=usergroup["usrgrpid"],
                name=usergroup["name"],
                gui_access=usergroup["gui_access"],
                users_status=usergroup["users_status"],
                debug_mode=usergroup["debug_mode"],
            )
            for usergroup in self.zapi.usergroup.get(output="extend")
        ]

    def get_metrics_by_template_id(self, template_id: str) -> List[ZabbixTemplateMetric]:
        """Get Zabbix metrics by template ID.

        Args:
            template_id: The ID of the template to get metrics for

        Returns:
            List of ZabbixTemplateMetric objects with only type, name, key_ fields and type is 0 or 3
        """
        metrics = self.zapi.item.get(filter={"hostid": template_id}, output="extend")
        # Filter items: only include type 0 or 3, and only include type, name, key_ fields
        # 0: float 3: int
        filtered_metrics = []
        for metric in metrics:
            if metric.get("value_type") in [value_type_float, value_type_unsigned_int]:
                filtered_metrics.append(
                    ZabbixTemplateMetric(
                        history=metric["value_type"],
                        name=metric["name"],
                        metric_name=metric["key_"],
                    )
                )
        return filtered_metrics

    def get_hosts_by_template_id(self, template_id: str) -> List[ZabbixHost]:
        """Get Zabbix hosts by template ID.

        Args:
            template_id: The ID of the template to get hosts for

        Returns:
            List of ZabbixHost objects
        """
        return [ZabbixHost(**host) for host in self.zapi.host.get(templateids=template_id, output="extend")]

    def get_items_by_host_and_metric_name(self, host: str, metric_name: str) -> List[ZabbixItem]:
        """Get Zabbix items by host and metric name.

        Args:
            host: The host name to get items for
            metric_name: The metric name (item key_) to filter by

        Returns:
            List of ZabbixItem objects
        """
        items = self.zapi.item.get(
            filter={"host": host, "key_": metric_name},
            output="extend",
        )

        return [ZabbixItem(itemid=item["itemid"], hostname=host) for item in items]

    def create_action(self, trigger_name: str, user_group_ids: List[str], media_type_ids: List[str]):
        """Create a Zabbix action.

        Args:
            trigger_name: Name of the trigger to create the action for
            user_group_ids: List of user group IDs to send notifications to
            media_type_ids: List of media type IDs to use for notifications

        Returns:
            None
        """
        operations = []
        recovery_operations = []

        # Create operations for each user group and media type
        for group_id in user_group_ids:
            # Create an operation for each media type
            for media_type_id in media_type_ids:
                operation = {
                    "operationtype": 0,  # 0 indicates send message
                    "opmessage": {"default_msg": 1, "mediatypeid": media_type_id},
                    "opmessage_grp": [{"usrgrpid": group_id}],
                }
                operations.append(operation)

                # Recovery operation
                recovery_operation = {
                    "operationtype": 0,  # 0 indicates send message
                    "opmessage": {"default_msg": 1, "mediatypeid": media_type_id},
                    "opmessage_grp": [{"usrgrpid": group_id}],
                }
                recovery_operations.append(recovery_operation)

        self.zapi.action.create(
            name=trigger_name,
            eventsource=0,  # 0表示触发器事件
            status=0,  # 0 indicates enabled
            esc_period=120,  # Default duration is 120 seconds
            filter={
                "evaltype": 0,  # 0 indicates AND
                "conditions": [
                    {
                        "conditiontype": 3,  # trigger
                        "operator": 2,
                        "value": trigger_name,
                    }
                ],
            },
            operations=operations,
            recovery_operations=recovery_operations,
        )

    def test_connection(self):
        """Test if the Zabbix connection is working.

        Returns:
            None
        """
        self.get_templates()
        return

    def delete_action(self, trigger_name: str):
        """Delete a Zabbix action by trigger name.

        Args:
            trigger_name: Name of the trigger to delete the action for

        Returns:
            None
        """
        # First get actions matching the trigger name
        actions = self.zapi.action.get(filter={"name": trigger_name}, output=["actionid"])

        # If matching actions are found, delete them
        if actions:
            action_ids = [action["actionid"] for action in actions]
            self.zapi.action.delete(*action_ids)

    def update_action(self, trigger_name: str, user_group_ids: List[str], media_type_ids: List[str]):
        """Update a Zabbix action by trigger name, or create it if it doesn't exist.

        Args:
            trigger_name: Name of the trigger to update/create the action for
            user_group_ids: List of user group IDs to send notifications to
            media_type_ids: List of media type IDs to use for notifications

        Returns:
            None
        """
        # First get actions matching the trigger name
        actions = self.zapi.action.get(filter={"name": trigger_name}, output=["actionid"])

        # Build operations and recovery operations
        operations = []
        recovery_operations = []

        # Create operations for each user group and media type
        for group_id in user_group_ids:
            # Create an operation for each media type
            for media_type_id in media_type_ids:
                operation = {
                    "operationtype": 0,  # 0 indicates send message
                    "opmessage": {"default_msg": 1, "mediatypeid": media_type_id},
                    "opmessage_grp": [{"usrgrpid": group_id}],
                }
                operations.append(operation)

                # Recovery operation
                recovery_operation = {
                    "operationtype": 0,  # 0 indicates send message
                    "opmessage": {"default_msg": 1, "mediatypeid": media_type_id},
                    "opmessage_grp": [{"usrgrpid": group_id}],
                }
                recovery_operations.append(recovery_operation)

        # If matching actions are found, update them
        if actions:
            for action in actions:
                action_id = action["actionid"]
                self.zapi.action.update(
                    actionid=action_id,
                    operations=operations,
                    recovery_operations=recovery_operations,
                )
        # If no matching actions are found, create new actions
        else:
            self.create_action(trigger_name, user_group_ids, media_type_ids)

    def create_default_mediatype(self):
        """Create default media type if it doesn't exist."""
        media_type_name = default_media_type
        existing_mediatypes = self.zapi.mediatype.get(filter={"name": media_type_name})
        if existing_mediatypes:
            logger.info(f"media type '{media_type_name}' exists")
            return
        event_center_url = get_settings(WebhookSettings).event_center_external_url.rstrip("/")
        webhook_url = f"{event_center_url}/apis/v1/manager/event-center/event/intelligent_threshold/zabbix/"

        parameters = [
            {"name": "host_id", "value": "{HOST.ID}"},
            {"name": "host_name", "value": "{HOST.NAME}"},
            {"name": "ip", "value": "{HOST.IP}"},
            {"name": "item_id", "value": "{ITEM.ID}"},
            {"name": "item_name", "value": "{ITEM.NAME}"},
            {"name": "item_value", "value": "{ITEM.VALUE}"},
            {"name": "message", "value": "{ALERT.MESSAGE}"},
            {"name": "metric_name", "value": "{ITEM.KEY}"},
            {"name": "subject", "value": "{ALERT.SUBJECT}"},
            {"name": "tags", "value": "{EVENT.TAGSJSON}"},
            {"name": "trigger_status", "value": "{TRIGGER.STATUS}"},
            {"name": "url", "value": webhook_url},
        ]

        self.zapi.mediatype.create(
            type=4,  # 4 represents Webhook
            name=media_type_name,
            script=webhook_script,
            parameters=parameters,
            message_templates=message_templates,
        )
        logger.info(f"media type '{media_type_name}' created")

    def create_default_action(self, username: str):
        """Create default action if it doesn't exist."""
        existing_actions = self.zapi.action.get(filter={"name": default_action})
        if existing_actions:
            logger.info(f"action '{default_action}' exists")
            return

        users = self.zapi.user.get(filter={"username": username})
        if not users:
            raise RecordNotFoundError(message=f"User '{username}' not found")
        user_id = users[0]["userid"]

        media_types = self.zapi.mediatype.get(filter={"name": default_media_type})
        if not media_types:
            raise RecordNotFoundError(message=f"Media type {default_media_type} not found")
        media_type_id = media_types[0]["mediatypeid"]

        operations = [
            {
                "operationtype": 0,  # Send message
                "opmessage_usr": [{"userid": user_id}],
                "opmessage": {"default_msg": 1, "mediatypeid": media_type_id},
                "esc_period": "1h",
                "esc_step_from": 1,
                "esc_step_to": 1,
            }
        ]

        recovery_operations = [
            {
                "operationtype": 0,  # Send message
                "opmessage_usr": [{"userid": user_id}],
                "opmessage": {"default_msg": 1, "mediatypeid": media_type_id},
            }
        ]

        # 4. Define filter conditions for Action
        conditions = [
            {
                "conditiontype": 26,
                "operator": 0,  # (default) =
                "value": default_tag_value,
                "value2": default_tag_key,
            }
        ]

        self.zapi.action.create(
            name=default_action,
            eventsource=0,  # Trigger event
            status=0,  # Enable
            esc_period="1h",
            filter={
                "evaltype": 0,  # AND
                "conditions": conditions,
            },
            operations=operations,
            recovery_operations=recovery_operations,
        )
        self.update_user_mediums(user_id, media_type_id)

    def get_user_existing_medias(self, user_id):
        """Get user existing mediums."""
        user = self.zapi.user.get(
            userids=user_id,
            output=["userid"],
            selectMedias=["mediatypeid", "sendto", "active", "severity", "period"],
        )
        return user[0].get("medias", [])

    def update_user_mediums(self, user_id, mediatype_id):
        """Update user mediums."""
        existing_medias = self.get_user_existing_medias(user_id)
        new_media = {
            "mediatypeid": mediatype_id,
            "sendto": "veaiops",
            "active": 0,
            "severity": 63,
            "period": "1-7,00:00-24:00",
        }

        for i, media in enumerate(existing_medias):
            if media["mediatypeid"] == mediatype_id:
                return

        existing_medias.append(new_media)
        self.zapi.user.update({"userid": user_id, "medias": existing_medias})


class ZabbixDataSource(DataSource):
    """Zabbix data source implementation."""

    targets: List[ZabbixTarget] = Field(..., description="Targets with itemid and hostname")
    metric_name: str = Field(..., description="Metric name")
    history_type: int = Field(default=0, description="History type")

    def __init__(self, **data: Any) -> None:
        super().__init__(**data)
        self._client: ZabbixClient | None = None

    @property
    def client(self) -> ZabbixClient:
        """Get Zabbix client instance."""
        if self._client is None:
            self._client = ZabbixClient(
                self.connect.zabbix_api_url,
                self.connect.zabbix_api_user,
                decrypt_secret_value(self.connect.zabbix_api_password),
            )
        return self._client

    @rate_limit
    async def fetch_partial_data(
        self,
        item_ids: List[int],
        time_from: int,
        time_till: Optional[int],
        page_size: int,
    ) -> List[Dict[str, Any]]:
        """Fetch partial data for a single page.

        Args:
            item_ids: List of item IDs to fetch data for
            time_from: Start time as Unix timestamp
            time_till: End time as Unix timestamp (can be None)
            page_size: Number of records per batch (recommended <= 5000)

        Returns:
            List of history data points for a single page
        """
        return await self.client.get_metric_data(
            item_ids=item_ids,
            time_from=time_from,
            time_till=time_till,
            history_type=self.history_type,
            page_size=page_size,
        )

    async def _fetch_one_slot(self, start: datetime, end: datetime | None = None) -> list[InputTimeSeries]:
        """Fetch data for a single time slot."""
        try:
            item_ids = [int(target.itemid) for target in self.targets]

            # Implement pagination logic here (moved from get_metric_data)
            all_data = []
            last_clock = int(start.timestamp())
            page_size = DEFAULT_PAGE_SIZE

            while True:
                page_data = await self.fetch_partial_data(
                    item_ids=item_ids,
                    time_from=last_clock,
                    time_till=int(end.timestamp()) if end else None,
                    page_size=page_size,
                )

                if not page_data:
                    break

                all_data.extend(page_data)
                last_clock = int(page_data[-1]["clock"])

                if len(page_data) < page_size:
                    break

            # Remove duplicates using the same logic as before
            seen = set()
            unique_data = []
            for item in all_data:
                key = (item["itemid"], item["clock"], item["value"])
                if key not in seen:
                    seen.add(key)
                    unique_data.append(item)

            return self._convert_history_to_timeseries(unique_data)
        except Exception as e:
            logger.error(f"Unexpected error when fetching data from Zabbix: {e}")
            raise

    @property
    def concurrency_group(self) -> str:
        """Get the concurrency group for Zabbix API requests.

        This method generates a unique identifier based on the Zabbix URL and username to implement
        rate limiting at the account level. Requests with the same URL and username will be grouped
        together and share the same concurrency quota, while requests with different
        URL/username combinations will be assigned to different concurrency groups.

        Returns:
            str: Unique concurrency group identifier in format "zabbix_{url}_{username}"
        """
        url = self.connect.zabbix_api_url
        username = self.connect.zabbix_api_user
        # Generate unique identifier using URL and username to
        # ensure requests from the same account are grouped together
        return f"zabbix_{url}_{username}"

    @property
    def get_concurrency_quota(self) -> int:
        """Get the concurrency quota for Zabbix API requests.

        Returns:
            int: The maximum number of concurrent requests allowed
        """
        return 10

    def _convert_history_to_timeseries(self, history_data: List[Dict[str, Any]]) -> list[InputTimeSeries]:
        """Convert Zabbix history data to time series format."""
        item_to_labels_map = self._build_item_labels_map()

        grouped_data: Dict[str, List[Dict[str, Any]]] = {}
        for item in history_data:
            itemid = item.get("itemid")
            if not itemid:
                raise Exception(f"Skipping item with missing itemid: {item}")

            if itemid not in grouped_data:
                grouped_data[itemid] = []
            grouped_data[itemid].append(item)

        result = []
        for itemid, data_points in grouped_data.items():
            if not data_points:
                continue

            timestamps = []
            values = []
            for point in data_points:
                try:
                    clock = point.get("clock")
                    value = point.get("value")

                    if clock is None or value is None:
                        raise Exception(f"Skipping point with missing clock or value: {point}")

                    timestamps.append(int(clock))
                    values.append(float(value))
                except (ValueError, TypeError) as e:
                    raise Exception(f"Skipping invalid point {point}: {e}") from e

            labels = item_to_labels_map.get(int(itemid), {})

            unique_key = generate_unique_key(self.metric_name, labels)
            result.append(
                InputTimeSeries(
                    name=self.metric_name,
                    timestamps=timestamps,
                    values=values,
                    labels=labels,
                    unique_key=unique_key,
                )
            )

        return result

    def _build_item_labels_map(self) -> Dict[int, Dict[str, str]]:
        """Build mapping from target to labels."""
        item_to_labels_map = {}
        for target in self.targets:
            labels = {"hostname": target.hostname, "itemid": target.itemid}
            itemid = int(target.itemid)
            item_to_labels_map[itemid] = labels
        return item_to_labels_map

    def get_mediatypes(self) -> List[ZabbixMediatype]:
        """Get all Zabbix mediatypes.

        Returns:
            List of ZabbixMediatype objects
        """
        return self.client.get_mediatypes()

    def get_usergroups(self) -> List[ZabbixUserGroup]:
        """Get all Zabbix user groups.

        Returns:
            List of ZabbixUserGroup objects
        """
        return self.client.get_usergroups()

    @staticmethod
    def _build_tags(task: IntelligentThresholdTask) -> List[ZabbixTriggerTag]:
        """Build tags for the rule from task projects, products, and customers.

        Args:
            task: Intelligent threshold task object

        Returns:
            List of ZabbixTriggerTag objects
        """
        # Add a fixed tag to indicate the rule was created by VolcAIOpsKit
        # Using namespaced format to avoid conflicts with user-defined tags
        tags = [ZabbixTriggerTag(tag=default_tag_key, value=default_tag_value)]

        # Add projects tags if projects exist in the task
        if hasattr(task, "projects") and task.projects:
            # Always create separate tags for each project
            for i, project in enumerate(task.projects, 1):
                tag_key = f"projects_{i:02d}"  # projects_01, projects_02, etc.
                tag_value = project  # value is a string, not a list
                tags.append(ZabbixTriggerTag(tag=tag_key, value=tag_value))

        return tags

    async def delete_all_rules(self) -> None:
        """Delete all alarm rules associated with this data source.

        This method retrieves all rules associated with this data source and deletes them in batches.
        Rules are deleted in batches of 10 to avoid overwhelming the API.
        """
        # Get all rules associated with this data source
        rule_name_prefix = f"{self.name}.{self.metric_name}"
        existing_triggers = self.client.get_triggers(pattern=rule_name_prefix)

        if not existing_triggers:
            logger.info("No rules found for data source %s", self.name)
            return

        # Extract unique keys from triggers
        unique_keys = [trigger.get("description", "") for trigger in existing_triggers if trigger.get("description")]

        if not unique_keys:
            logger.info("No valid rule keys found for data source %s", self.name)
            return

        logger.info("Found %d rules to delete for data source %s", len(unique_keys), self.name)

        # Delete rules in batches of 10
        batch_size = 10
        for i in range(0, len(unique_keys), batch_size):
            batch = unique_keys[i : i + batch_size]
            logger.info(
                "Deleting batch of %d rules (%d-%d) for data source %s",
                len(batch),
                i + 1,
                min(i + len(batch), len(unique_keys)),
                self.name,
            )

            self.client.delete_rules(batch)
            logger.info("Successfully deleted batch of %d rules for data source %s", len(batch), self.name)

        logger.info("Completed deletion of all %d rules for data source %s", len(unique_keys), self.name)

    async def sync_rules_for_intelligent_threshold_task(self, **kwargs) -> Dict[str, Any]:
        """Synchronizes alarm rules with concurrent execution for better performance.

        Args:
            **kwargs: Keyword arguments including:
                task: Intelligent threshold task object
                webhook: Webhook URL for notifications
                task_version: Intelligent threshold task version
                contact_group_ids: List of contact group IDs (optional)
                alert_methods: List of alert methods (optional)
                max_workers: Maximum number of concurrent workers (default: 10)
                rate_limit_period: Time period for rate limiting in seconds (default: 1.0)
                rate_limit_count: Maximum number of requests per period (default: 5)
                alarm_level: Alarm level (P0/P1/P2) (default: P2)

        Returns:
            Synchronization results dictionary with:
                total: Total number of operations
                created: Number of created rules
                updated: Number of updated rules
                deleted: Number of deleted rules
                failed: Number of failed operations
                created_rule_ids: List of created rule IDs
                updated_rule_ids: List of updated rule IDs
                deleted_rule_ids: List of deleted rule IDs
                rule_operations: List of rule operation details
        """
        config = ZabbixRuleConfig(**kwargs)
        synchronizer = RuleSynchronizer(self)
        return await synchronizer.sync_rules(config)


@dataclass
class ZabbixRuleConfig(BaseRuleConfig):
    """Rule configuration for Zabbix."""

    @staticmethod
    def convert_alarm_level_to_zabbix_priority(alarm_level: EventLevel) -> int:
        """Convert alarm level from P0/P1/P2 to Zabbix priority values.

        Args:
            alarm_level: EventLevel enum value (P0, P1, or P2)

        Returns:
            Corresponding Zabbix priority value (1 for info, 2 for warning, 4 for critical)
        """
        level_mapping = {EventLevel.P0: 4, EventLevel.P1: 2, EventLevel.P2: 1}
        return level_mapping.get(alarm_level, 1)  # default to 1 (info) if not found


class RuleSynchronizer(BaseRuleSynchronizer):
    """Rule synchronizer for Zabbix."""

    def __init__(self, datasource: "ZabbixDataSource"):
        super().__init__(datasource)
        self.datasource = datasource
        self.client = datasource.client

    @property
    def concurrency_group(self) -> str:
        """Get the concurrency group for Aliyun API requests.

        Uses ak/sk to generate a unique identifier for rate limiting.

        Returns:
            str: The concurrency group identifier based on ak/sk
        """
        return f"{self.datasource.concurrency_group}_rule"

    @property
    def get_concurrency_quota(self) -> int:
        """Get the concurrency quota for Zabbix API requests.

        Returns:
            int: The maximum number of concurrent requests allowed
        """
        return 10

    async def sync_rules(self, config: ZabbixRuleConfig) -> Dict[str, Any]:
        """Asynchronously synchronize rules."""
        try:
            # Get existing rules from Zabbix
            rule_name_prefix = f"{self.datasource.name}.{self.datasource.metric_name}"
            existing_triggers = self.client.get_triggers(pattern=rule_name_prefix)

            # Generate unique keys for existing rules
            existing_rule_keys = {}
            for trigger in existing_triggers:
                unique_key = trigger.get("description", "")
                if unique_key:
                    existing_rule_keys[unique_key] = trigger

            # Generate desired rules from task result
            result_rule_keys = {}
            for metric_threshold_result in config.task_version.result or []:
                hostname = metric_threshold_result.labels.get("hostname")
                if not hostname:
                    continue  # Skip if hostname is not available

                unique_key = f"{self.datasource.name}.{self.datasource.metric_name}.{hostname}"

                result_rule_keys[unique_key] = {
                    "metric_threshold_result": metric_threshold_result,
                    "hostname": hostname,
                    "unique_key": unique_key,
                }

            # Generate dynamic tags from task
            dynamic_tags = self.datasource._build_tags(config.task) if config.task else []
            # Prepare operations
            update_operations = []
            create_operations = []
            delete_operations = []

            # Compare and prepare operations
            for unique_key, rule_info in result_rule_keys.items():
                metric_threshold_result = rule_info["metric_threshold_result"]
                hostname = rule_info["hostname"]

                # Prepare trigger configs
                trigger_configs = []
                for period_threshold_rule in metric_threshold_result.thresholds:
                    aggregation_period = f"{period_threshold_rule.window_size}m"
                    # Add upper bound rule if exists
                    if period_threshold_rule.upper_bound is not None:
                        trigger_configs.append(
                            ZabbixTriggerConfig(
                                metric_name=self.datasource.metric_name,
                                hostname=hostname,
                                start=period_threshold_rule.start_hour * 10000,  # Convert to Zabbix trigger time format
                                end=period_threshold_rule.end_hour * 10000,  # Convert to Zabbix trigger time format
                                threshold=period_threshold_rule.upper_bound,
                                threshold_operator=">",  # Using > for upper bound
                                aggregation_function="min",
                                aggregation_period=aggregation_period,
                            )
                        )

                    # Add lower bound rule if exists
                    if period_threshold_rule.lower_bound is not None:
                        trigger_configs.append(
                            ZabbixTriggerConfig(
                                metric_name=self.datasource.metric_name,
                                hostname=hostname,
                                start=period_threshold_rule.start_hour * 10000,  # Convert to Zabbix trigger time format
                                end=period_threshold_rule.end_hour * 10000,  # Convert to Zabbix trigger time format
                                threshold=period_threshold_rule.lower_bound,
                                threshold_operator="<",  # Using < for lower bound
                                aggregation_function="max",
                                aggregation_period=aggregation_period,
                            )
                        )

                # Convert alarm level to Zabbix priority
                priority = ZabbixRuleConfig.convert_alarm_level_to_zabbix_priority(config.alarm_level)

                # Check if rule already exists
                if unique_key in existing_rule_keys:
                    # Prepare update operation
                    update_operations.append(
                        {
                            "unique_key": unique_key,
                            "trigger_configs": trigger_configs,
                            "existing_trigger": existing_rule_keys[unique_key],
                            "dynamic_tags": dynamic_tags,  # Pass dynamic tags for update
                            "priority": priority,  # Pass priority for update
                            "contact_group_ids": config.contact_group_ids,  # Pass contact group IDs for update
                            "alert_methods": config.alert_methods,  # Pass alert methods for update
                        }
                    )
                else:
                    # Prepare create operation
                    create_operations.append(
                        {
                            "unique_key": unique_key,
                            "trigger_configs": trigger_configs,
                            "dynamic_tags": dynamic_tags,  # Pass dynamic tags for create
                            "priority": priority,  # Pass priority for create
                            "contact_group_ids": config.contact_group_ids,  # Pass contact group IDs for create
                            "alert_methods": config.alert_methods,  # Pass alert methods for create
                        }
                    )

            # Prepare delete operations for rules that no longer exist in the task
            for unique_key, existing_trigger in existing_rule_keys.items():
                if unique_key not in result_rule_keys:
                    delete_operations.append(
                        {
                            "unique_key": unique_key,
                        }
                    )

            # Execute operations
            return await self._execute_operations(create_operations, update_operations, delete_operations, config)

        except Exception as e:
            logger.error(f"Rule synchronization failed: {e}")
            raise

    async def _execute_operations(
        self,
        create_operations: List[Dict],
        update_operations: List[Dict],
        delete_operations: List[Dict],
        config: ZabbixRuleConfig,
    ) -> Dict[str, Any]:
        """Execute operations with rate limiting and retries."""
        # Prepare operations for base class execution
        all_operations = []

        # Add create operations
        for operation in create_operations:
            operation["type"] = "create"
            all_operations.append(operation)

        # Add update operations
        for operation in update_operations:
            operation["type"] = "update"
            all_operations.append(operation)

        # Add delete operation
        if delete_operations:
            operation = {
                "type": "delete",
                "unique_keys": [op["unique_key"] for op in delete_operations],
            }
            all_operations.append(operation)

        # Define operation function map
        operation_func_map = {
            "create": self._create_rule_wrapper,
            "update": self._update_rule_wrapper,
            "delete": self._delete_rules_wrapper,
        }

        # Use base class method to execute operations
        return await self.execute_operations(all_operations, operation_func_map)

    @rate_limit
    def _create_rule_wrapper(self, operation):
        try:
            # Get dynamic tags from operation
            dynamic_tags = operation.get("dynamic_tags", [])
            priority = operation.get("priority", 1)
            contact_group_ids = operation.get("contact_group_ids")
            alert_methods = operation.get("alert_methods")
            self.client.create_rule(
                operation["unique_key"],
                operation["trigger_configs"],
                dynamic_tags,
                priority,
                contact_group_ids,
                alert_methods,
            )
            return {
                "status": "success",
                "operation": "create",
                "rule_name": operation["unique_key"],
                "rule_id": operation["unique_key"],  # Using unique_key as rule_id for Zabbix
            }
        except Exception as e:
            return {
                "status": "error",
                "operation": "create",
                "rule_name": operation["unique_key"],
                "error": str(e),
            }

    @rate_limit
    def _update_rule_wrapper(self, operation):
        try:
            # Get dynamic tags from operation
            dynamic_tags = operation.get("dynamic_tags", [])
            priority = operation.get("priority", 4)  # Default to 4 (critical) if not specified
            contact_group_ids = operation.get("contact_group_ids")
            alert_methods = operation.get("alert_methods")
            self.client.update_rule(
                operation["unique_key"],
                operation["trigger_configs"],
                operation["existing_trigger"],
                dynamic_tags,
                priority,
                contact_group_ids,
                alert_methods,
            )
            return {
                "status": "success",
                "operation": "update",
                "rule_name": operation["unique_key"],
                "rule_id": operation["unique_key"],  # Using unique_key as rule_id for Zabbix
            }
        except Exception as e:
            return {
                "status": "error",
                "operation": "update",
                "rule_name": operation["unique_key"],
                "error": str(e),
            }

    @rate_limit
    def _delete_rules_wrapper(self, operation):
        try:
            self.client.delete_rules(operation["unique_keys"])
            return {
                "status": "success",
                "operation": "delete",
                "rule_ids": operation["unique_keys"],
                "rule_name": "Bulk delete rules",
            }
        except Exception as e:
            return {
                "status": "error",
                "operation": "delete",
                "rule_ids": operation["unique_keys"],
                "rule_name": "Bulk delete rules",
                "error": str(e),
            }
