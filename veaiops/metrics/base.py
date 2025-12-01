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

import abc
import asyncio
import functools
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from veaiops.metrics.timeseries import InputTimeSeries
from veaiops.schema.documents import (
    Connect,
    IntelligentThresholdTask,
    IntelligentThresholdTaskVersion,
)
from veaiops.schema.documents.intelligent_threshold.alarm_sync_record import RuleOperationResult
from veaiops.schema.models.intelligent_threshold.alarm import RuleOperations
from veaiops.schema.types import EventLevel
from veaiops.utils.log import logger

__all__ = [
    "DataSource",
    "DataSourceTypeLiteralType",
    "generate_unique_key",
    "rate_limit",
    "BaseRuleConfig",
    "BaseRuleSynchronizer",
]


# Rate limiter implementation
class RateLimiter:
    """Rate limiter for controlling QPS."""

    # Use class variables to store token buckets for different concurrency groups
    _buckets = {}
    _locks = {}

    @classmethod
    def _get_lock(cls, key: str):
        """Get lock for specified key."""
        if key not in cls._locks:
            cls._locks[key] = asyncio.Lock()
        return cls._locks[key]

    @classmethod
    async def acquire_token(cls, group: str, qps: int):
        key = f"{group}_{qps}"
        while True:
            lock = cls._get_lock(key)
            async with lock:
                now = asyncio.get_event_loop().time()
                bucket = cls._buckets.get(key) or {"tokens": float(qps), "last_refill": now, "qps": qps}
                # refill
                time_passed = now - bucket["last_refill"]
                bucket["tokens"] = min(float(bucket["qps"]), bucket["tokens"] + time_passed * qps)
                bucket["last_refill"] = now
                if bucket["tokens"] >= 1:
                    bucket["tokens"] -= 1
                    cls._buckets[key] = bucket
                    return
                wait_time = (1 - bucket["tokens"]) / qps
                cls._buckets[key] = bucket
            await asyncio.sleep(wait_time)


def rate_limit(func):
    """Decorator: Rate limiting based on data source's concurrency group and QPS quota."""

    @functools.wraps(func)
    async def wrapper(self, *args, **kwargs):
        # Get data source's concurrency group and QPS quota
        # concurrency_group may be an attribute or method in different data sources
        if callable(self.concurrency_group):
            group = self.concurrency_group()
        else:
            group = self.concurrency_group

        # Handle both sync and async cases for get_concurrency_quota method
        # Synchronous method
        if asyncio.iscoroutinefunction(self.get_concurrency_quota):
            qps = await self.get_concurrency_quota()
        elif callable(self.get_concurrency_quota):
            qps = self.get_concurrency_quota()
        else:
            qps = self.get_concurrency_quota

        logger.debug(f"Acquiring token for group {group} with QPS {qps}")
        await RateLimiter.acquire_token(group, qps)

        # Determine how to call based on whether the decorated function is a coroutine
        if asyncio.iscoroutinefunction(func):
            return await func(self, *args, **kwargs)
        else:
            return func(self, *args, **kwargs)

    return wrapper


DataSourceTypeLiteralType = Literal[
    "Zabbix",
    "Aliyun",
    "Volcengine",
]


class DataSource(BaseModel, abc.ABC):
    """Abstract base class for data sources, unifying interfaces across different data sources."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: str = Field(default="", description="Unique identifier for the data source")

    type: DataSourceTypeLiteralType = Field(
        default="Volcengine",
        description="Data source type",
        examples=["Volcengine", "Aliyun", "Zabbix"],
    )

    name: str = Field(default="", description="Data source name", examples=["Volcengine"])

    interval_seconds: int = Field(
        default=60,
        description="Time interval for fetching metric data, in seconds",
        examples=[60],
    )
    connect: Connect = Field(default_factory=Connect, description="Connect information for data sources")

    def model_dump(self, *args, **kwargs) -> Dict[str, Any]:
        """Model serialization method."""
        return super().model_dump(*args, **kwargs)

    def model_dump_json(self, *args, **kwargs) -> str:
        """Model serialization to JSON method."""
        return super().model_dump_json(*args, **kwargs)

    @abc.abstractmethod
    async def _fetch_one_slot(self, start: datetime, end: datetime | None = None) -> list[InputTimeSeries]:
        """Fetch data for a single time slot.

        Args:
            start: Start time
            end: End time

        Returns:
            List of data points
        """
        raise NotImplementedError()

    async def fetch(self, start: datetime, end: datetime | None = None) -> List[InputTimeSeries]:
        """Retrieve time series data.

        Args:
            start: Start time
            end: End time

        Returns:
            Normalized time series data
        """
        if end is None or end < start:
            end = start

        data = await self._fetch_one_slot(start, end)
        return data

    @abc.abstractmethod
    async def sync_rules_for_intelligent_threshold_task(self, **kwargs) -> Dict[str, Any]:
        """Synchronize alarm rules for intelligent threshold task.

        This abstract method defines the interface for synchronizing alarm rules
        based on intelligent threshold analysis results. Each data source implementation
        should provide its own specific logic for creating, updating, and deleting
        alarm rules according to the threshold task results.

        Args:
            **kwargs: Keyword arguments for implementation-specific parameters.
                Common parameters include:
                - task_version: Intelligent threshold task version with analysis results
                - contact_group_ids: List of contact group IDs for notifications
                - alert_methods: List of alert methods (e.g., 'email', 'sms', 'webhook')
                - max_workers: Maximum number of concurrent workers for API calls

        Returns:
            None: This is an abstract method - implementations should return
            appropriate synchronization results.

        Raises:
            NotImplementedError: Must be implemented by subclasses
        """
        raise NotImplementedError()

    @abc.abstractmethod
    def concurrency_group(self) -> str:
        """Get the concurrency group for the data source.

        Returns:
            str: The concurrency group identifier
        """
        raise NotImplementedError()

    @property
    @abc.abstractmethod
    def get_concurrency_quota(self) -> int:
        """Get the concurrency quota for the data source.

        Returns:
            int: The maximum number of concurrent requests allowed
        """
        raise NotImplementedError()

    @abc.abstractmethod
    def fetch_partial_data(self, *args, **kwargs):
        """Fetch partial data for a time range.

        Args:
            *args: Variable length argument list for implementation-specific parameters
            **kwargs: Arbitrary keyword arguments for implementation-specific parameters

        Returns:
            Implementation-specific response containing partial data points
        """
        raise NotImplementedError()

    @abc.abstractmethod
    async def delete_all_rules(self) -> None:
        """Delete all alarm rules associated with this data source."""
        raise NotImplementedError()


def generate_unique_key(name: str, labels: dict) -> str:
    """Generate a unique identifier for a time series.

    Args:
        name: Time series name
        labels: Time series label dictionary

    Returns:
        str: Unique identifier composed of name and sorted labels
    """
    sorted_labels = sorted(labels.items())
    labels_str = ",".join([f"{k}={v}" for k, v in sorted_labels])
    return f"{name}|{labels_str}"


@dataclass
class BaseRuleConfig:
    """Base rule configuration for all data sources."""

    task: Optional[IntelligentThresholdTask] = None
    task_version: Optional[IntelligentThresholdTaskVersion] = None
    contact_group_ids: Optional[List[str]] = None
    alert_methods: Optional[List[str]] = None
    alarm_level: EventLevel = EventLevel.P2
    webhook: Optional[str] = None


class BaseRuleSynchronizer(abc.ABC):
    """Base rule synchronizer for all data sources."""

    def __init__(self, datasource: "DataSource"):
        self.datasource = datasource

    @abc.abstractmethod
    async def sync_rules(self, config: BaseRuleConfig) -> Dict[str, Any]:
        """Asynchronously synchronize rules."""
        raise NotImplementedError()

    async def execute_operations(self, operations: List[Dict], operation_func_map: Dict[str, Any]) -> Dict[str, Any]:
        """Execute operations with retries."""
        rule_operations = RuleOperations()

        async def execute_with_retry(func, operation):
            """Wrapper to add retry logic."""
            max_retries = 3
            retry_interval = 2  # Initial retry interval in seconds

            for attempt in range(max_retries + 1):
                try:
                    result = await func(operation)
                    return result
                except Exception as e:
                    logger.warning(f"Operation failed, attempt {attempt + 1}/{max_retries}: {e}")
                    if attempt < max_retries:
                        await asyncio.sleep(retry_interval * (2**attempt))  # Exponential backoff
                    else:
                        raise

        tasks = []
        task_map = {}

        for operation in operations:
            operation_type = operation.get("type", "unknown")
            if operation_type in operation_func_map:
                func = operation_func_map[operation_type]
                task = asyncio.create_task(execute_with_retry(func, operation))
                tasks.append(task)
                task_map[task] = operation

        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        for task, result in zip(tasks, results_list):
            operation = task_map[task]

            if isinstance(result, Exception):
                rule_name = operation.get("rule_name", "unknown")
                operation_type = operation.get("type", "unknown")
                rule_operations.failed.append(
                    RuleOperationResult(
                        action=operation_type,
                        rule_name=rule_name,
                        status="error",
                        error=str(result),
                    )
                )
                continue

            if result["status"] == "success":
                operation_type = result.get("operation", operation.get("type", "unknown"))
                rule_id = result.get("rule_id")
                rule_name = result.get("rule_name", operation.get("rule_name", "unknown"))

                op_result = RuleOperationResult(
                    action=operation_type, rule_id=rule_id, rule_name=rule_name, status="success"
                )

                if operation_type == "create":
                    rule_operations.create.append(op_result)
                elif operation_type == "update":
                    rule_operations.update.append(op_result)
                elif operation_type == "delete":
                    rule_ids = result.get("rule_ids", [])
                    for deleted_id in rule_ids:
                        rule_operations.delete.append(
                            RuleOperationResult(
                                action=operation_type,
                                rule_id=deleted_id,
                                rule_name=rule_name,
                                status="success",
                            )
                        )
            else:
                operation_type = operation.get("type", "unknown")
                rule_name = operation.get("rule_name", "unknown")
                rule_operations.failed.append(
                    RuleOperationResult(
                        action=operation_type,
                        rule_name=rule_name,
                        status="failed",
                        error=result.get("error", "Unknown error"),
                    )
                )

        return {
            "total": len(rule_operations.create)
            + len(rule_operations.update)
            + len(rule_operations.delete)
            + len(rule_operations.failed),
            "created": len(rule_operations.create),
            "updated": len(rule_operations.update),
            "deleted": len(rule_operations.delete),
            "failed": len(rule_operations.failed),
            "rule_operations": rule_operations,
        }
