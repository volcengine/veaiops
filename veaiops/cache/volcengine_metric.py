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
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional

import aiohttp

from veaiops.utils.log import logger


@dataclass
class MetricDimension:
    """Metric dimension information data model.

    This class is used to store dimension information of monitoring metrics,
    including dimension name, description, and whether it is a required dimension.

    Attributes:
        dimension_name: Dimension name, used to identify the dimension
        description: Dimension description information
        required: Whether it is a required dimension, True means this dimension must be provided
    """

    dimension_name: str
    description: str
    required: bool


@dataclass
class VolcengineMetricDetail:
    """Volcengine monitoring metric detail data model.

    This class is used to store complete monitoring metric information,
    including metric name, description, unit, statistics method, dimension information, etc.

    Attributes:
        metric_name: Metric name
        metric_tips: Metric tips information
        description: Metric description
        description_cn: Chinese description
        description_en: English description
        namespace: Product namespace
        sub_namespace: Sub namespace
        unit: Metric unit
        statistics: Statistics method (e.g., max, min, avg)
        point_interval: Data point interval (seconds)
        point_delay: Data delay time (seconds)
        group_by_interval: Grouping interval
        original_point_delay: Original data delay time
        type_alert_enable: Whether alerting is enabled
        type_consume_enable: Whether consumption is enabled
        dimensions: List of dimensions
        un_support_sub_ns_resource: Whether sub-namespace resources are not supported
        report_method: Reporting method (e.g., Periodic)
        query_not_fill_zero: Whether to not fill zero values during query
    """

    metric_name: str
    metric_tips: str
    description: str
    description_cn: str
    description_en: str
    namespace: str
    sub_namespace: str
    unit: str
    statistics: str
    point_interval: int
    point_delay: int
    group_by_interval: int
    original_point_delay: int
    type_alert_enable: bool
    type_consume_enable: bool
    dimensions: List[MetricDimension]
    un_support_sub_ns_resource: bool
    report_method: str
    query_not_fill_zero: bool


class VolcengineMetricCache:
    """Volcengine monitoring metric detail cache manager."""

    def __init__(self, refresh_interval_seconds: int = 600):
        self.metrics: Dict[str, List[VolcengineMetricDetail]] = {}  # namespace -> [metrics]
        self.metrics_by_name: Dict[str, VolcengineMetricDetail] = {}  # metric_name -> metric
        self.metrics_by_sub_ns: Dict[str, List[VolcengineMetricDetail]] = {}  # sub_namespace -> [metrics]
        self.all_metrics: List[VolcengineMetricDetail] = []
        self.last_update: Optional[datetime] = None
        self._refresh_task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()
        self.refresh_interval_seconds = refresh_interval_seconds

    async def refresh_metrics(self, namespace: Optional[str] = None) -> bool:
        """Refresh metric data."""
        try:
            url = "https://cloudmonitor-api.console.volcengine.com/external/api/documents"
            params = {"Action": "ListMetricDocs", "Version": "2018-01-01"}
            headers = {"Content-Type": "application/json"}

            # If namespace is specified, only refresh that namespace
            data = {"Namespace": namespace} if namespace else {}

            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
                async with session.post(url, json=data, params=params, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        metrics_data = result.get("Result", {}).get("Data", [])

                        new_metrics = []
                        for metric in metrics_data:
                            if not metric["TypeAlertEnable"]:
                                continue

                            metric_detail = VolcengineMetricDetail(
                                metric_name=metric["MetricName"],
                                metric_tips=metric["MetricTips"],
                                description=metric["Description"],
                                description_cn=metric["DescriptionCN"],
                                description_en=metric["DescriptionEN"],
                                namespace=metric["Namespace"],
                                sub_namespace=metric["SubNamespace"],
                                unit=metric["Unit"],
                                statistics=metric["Statistics"],
                                point_interval=metric["PointInterval"],
                                point_delay=metric["PointDelay"],
                                group_by_interval=metric["GroupByInterval"],
                                original_point_delay=metric["OriginalPointDelay"],
                                type_alert_enable=metric["TypeAlertEnable"],
                                type_consume_enable=metric["TypeConsumeEnable"],
                                dimensions=[
                                    MetricDimension(
                                        dimension_name=dim["DimensionName"],
                                        description=dim.get("Description", ""),
                                        required=bool(dim.get("Required")),
                                    )
                                    for dim in metric.get("Dimensions", [])
                                    if isinstance(dim, dict)
                                ],
                                un_support_sub_ns_resource=metric["UnSupportSubNsResource"],
                                report_method=metric["ReportMethod"],
                                query_not_fill_zero=metric["QueryNotFillZero"],
                            )
                            new_metrics.append(metric_detail)

                        # Update indices
                        if namespace:
                            self.metrics[namespace] = new_metrics
                            self.all_metrics = [m for ns in self.metrics.values() for m in ns]
                            self._rebuild_indices()
                        else:
                            self.all_metrics = new_metrics
                            # Rebuild all indices
                            self._rebuild_indices()

                        self.last_update = datetime.now(timezone.utc)
                        logger.info(f"Refreshed {len(new_metrics)} metrics")
                        return True
                    else:
                        logger.error(f"API call failed: status={response.status} url={url}")
                        return False

        except Exception as e:
            logger.error(f"Failed to refresh metric data: {e}", exc_info=True)
            return False

    def _rebuild_indices(self):
        """Rebuild indices."""
        self.metrics.clear()
        self.metrics_by_name.clear()
        self.metrics_by_sub_ns.clear()

        for metric in self.all_metrics:
            # Group by namespace
            if metric.namespace not in self.metrics:
                self.metrics[metric.namespace] = []
            self.metrics[metric.namespace].append(metric)

            # Index by metric_name
            self.metrics_by_name[metric.metric_name] = metric

            # Group by sub_namespace
            if metric.sub_namespace not in self.metrics_by_sub_ns:
                self.metrics_by_sub_ns[metric.sub_namespace] = []
            self.metrics_by_sub_ns[metric.sub_namespace].append(metric)

    async def schedule_cache_refresh(self):
        """Scheduled cache refresh."""
        while not self._stop_event.is_set():
            try:
                # Wait for refresh interval or stop signal
                try:
                    await asyncio.wait_for(self._stop_event.wait(), timeout=self.refresh_interval_seconds)
                    break
                except asyncio.TimeoutError:
                    pass

                await self.refresh_metrics()

            except asyncio.CancelledError:
                logger.info("Metric cache refresh task has been cancelled")
                break
            except Exception as e:
                logger.error(f"Scheduled refresh exception: {e}", exc_info=True)

    # Quick query methods
    def get_metrics_by_namespace(self, namespace: str) -> List[VolcengineMetricDetail]:
        """Get metrics by Namespace."""
        return self.metrics.get(namespace, [])

    def get_metrics_by_sub_namespace(self, sub_namespace: str) -> List[VolcengineMetricDetail]:
        """Get metrics by SubNamespace."""
        return self.metrics_by_sub_ns.get(sub_namespace, [])

    def get_metric_by_name(self, metric_name: str) -> Optional[VolcengineMetricDetail]:
        """Get metric details by MetricName."""
        return self.metrics_by_name.get(metric_name)

    def get_namespaces(self) -> List[str]:
        """Get all namespaces."""
        return list(self.metrics.keys())

    def get_sub_namespaces(self, namespace: Optional[str] = None) -> List[str]:
        """Get all sub_namespaces, can filter by namespace."""
        if namespace:
            return list(set(m.sub_namespace for m in self.metrics.get(namespace, [])))
        return list(self.metrics_by_sub_ns.keys())

    def get_metric_names(self, namespace: Optional[str] = None, sub_namespace: Optional[str] = None) -> List[str]:
        """Get all metric names, can filter by namespace and sub_namespace."""
        metrics = self.all_metrics

        if namespace:
            metrics = [m for m in metrics if m.namespace == namespace]

        if sub_namespace:
            metrics = [m for m in metrics if m.sub_namespace == sub_namespace]

        return [m.metric_name for m in metrics]

    def search_metrics(
        self, keyword: Optional[str] = None, namespace: Optional[str] = None, sub_namespace: Optional[str] = None
    ) -> List[VolcengineMetricDetail]:
        """Search metrics (supports keyword search)."""
        metrics = self.all_metrics

        if namespace:
            metrics = [m for m in metrics if m.namespace == namespace]

        if sub_namespace:
            metrics = [m for m in metrics if m.sub_namespace == sub_namespace]

        if keyword:
            keyword_lower = keyword.lower()
            metrics = [
                m
                for m in metrics
                if keyword_lower in m.metric_name.lower()
                or keyword_lower in m.description.lower()
                or keyword_lower in m.description_cn.lower()
                or keyword_lower in m.description_en.lower()
            ]
        return metrics

    def start_refresh_task(self):
        """Start refresh task."""
        if self._refresh_task is None or self._refresh_task.done():
            self._stop_event = asyncio.Event()
            self._refresh_task = asyncio.create_task(self.schedule_cache_refresh())
            logger.info("Started Volcengine metric cache refresh task")

    async def stop_refresh_task(self):
        """Gracefully stop refresh task."""
        if self._refresh_task and not self._refresh_task.done():
            logger.info("Stopping metric cache refresh task...")
            self._stop_event.set()

            try:
                await asyncio.wait_for(self._refresh_task, timeout=5)
            except asyncio.TimeoutError:
                self._refresh_task.cancel()
                try:
                    await self._refresh_task
                except asyncio.CancelledError:
                    pass

            logger.info("Metric cache refresh task has stopped")
