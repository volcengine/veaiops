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
import logging
from typing import List

from beanie.odm.operators.find.comparison import Eq
from pymongo.errors import PyMongoError

from veaiops.handler.services.intelligent_threshold.alarm import sync_alarm_rules_service
from veaiops.handler.services.intelligent_threshold.mcp import call_threshold_agent
from veaiops.schema.documents.intelligent_threshold.alarm_sync_record import AlarmSyncRecord
from veaiops.schema.documents.intelligent_threshold.auto_refresh_task import (
    AutoIntelligentThresholdTaskRecord,
    AutoIntelligentThresholdTaskRecordDetail,
)
from veaiops.schema.documents.intelligent_threshold.task import IntelligentThresholdTask
from veaiops.schema.documents.intelligent_threshold.task_version import IntelligentThresholdTaskVersion
from veaiops.schema.models.intelligent_threshold.alarm import SyncAlarmRulesPayload
from veaiops.schema.types import (
    AutoIntelligentThresholdTaskAlarmInjectStatus,
    AutoIntelligentThresholdTaskDetailStatus,
    AutoIntelligentThresholdTaskDetailTaskStatus,
    AutoIntelligentThresholdTaskStatus,
    IntelligentThresholdTaskStatus,
    TaskPriority,
)

logger = logging.getLogger(__name__)


async def initialize_auto_refresh_task() -> AutoIntelligentThresholdTaskRecord:
    """Initialize intelligent threshold auto-refresh task.

    1. Query IntelligentThresholdTask(Document) for tasks with auto_update=True as tasks to update thresholds,
    2. Record to AutoIntelligentThresholdTaskRecord(Document),
    3. Record update details for tasks in AutoIntelligentThresholdTaskRecordDetail(Document),
    4. If any MongoDB insertion operation fails, perform rollback,
    5. Update AutoIntelligentThresholdTaskRecord status to processing.

    Returns:
        AutoIntelligentThresholdTaskRecord: The created auto refresh task record

    Raises:
        Exception: If any error occurs during the process
    """
    # Step 1: Query IntelligentThresholdTask for tasks with auto_update=True
    auto_update_tasks = await IntelligentThresholdTask.find(Eq(IntelligentThresholdTask.auto_update, True)).to_list()

    if not auto_update_tasks:
        logger.info("No intelligent threshold tasks found with auto_update=True")
        # Create a record with empty task list
        task_record = AutoIntelligentThresholdTaskRecord(
            status=AutoIntelligentThresholdTaskStatus.COMPLETED,  # Completed
            task_all=[],  # Empty list
        )
        await task_record.insert()
        return task_record

    # Create task ID list
    task_ids = [task.id for task in auto_update_tasks]

    # Create transaction-like behavior with manual rollback
    task_record = None
    detail_records = []

    try:
        # Step 2: Record to AutoIntelligentThresholdTaskRecord
        task_record = AutoIntelligentThresholdTaskRecord(
            status=AutoIntelligentThresholdTaskStatus.PENDING,  # Pending
            task_all=task_ids,
        )
        await task_record.insert()
        logger.info(f"Created AutoIntelligentThresholdTaskRecord with ID: {task_record.id}")

        # Step 3: Record update details for tasks
        for task in auto_update_tasks:
            # Create detail record
            detail_record = AutoIntelligentThresholdTaskRecordDetail(
                auto_intelligent_threshold_task_record_id=task_record.id,
                intelligent_threshold_task_id=task.id,
                version=0,  # VersionInitialized
                status=AutoIntelligentThresholdTaskDetailStatus.PENDING,  # Pending
                intelligent_threshold_task_status=AutoIntelligentThresholdTaskDetailTaskStatus.PENDING,  # Pending
                alarm_inject_status=AutoIntelligentThresholdTaskAlarmInjectStatus.INITIALIZED,  # Initialized
                created_user="cronjob",
                updated_user="cronjob",
            )
            await detail_record.insert()
            detail_records.append(detail_record)
            logger.info(f"Created AutoIntelligentThresholdTaskRecordDetail for task {task.id}")

        # Step 4: Update AutoIntelligentThresholdTaskRecord status to processing
        task_record.status = AutoIntelligentThresholdTaskStatus.PROCESSING  # Processing
        await task_record.save()
        logger.info(f"Updated AutoIntelligentThresholdTaskRecord {task_record.id} status to processing")

        return task_record

    except PyMongoError as e:
        logger.error(f"Database error occurred: {e}")
        # Step 4: Rollback on failure
        await _rollback_auto_refresh_task_creation(task_record, detail_records)
        raise Exception(f"Failed to initialize auto refresh task due to database error: {e}")

    except Exception as e:
        logger.error(f"Unexpected error occurred: {e}")
        # Step 4: Rollback on failure
        await _rollback_auto_refresh_task_creation(task_record, detail_records)
        raise Exception(f"Failed to initialize auto refresh task: {e}")


async def _rollback_auto_refresh_task_creation(
    task_record: AutoIntelligentThresholdTaskRecord, detail_records: List[AutoIntelligentThresholdTaskRecordDetail]
) -> None:
    """Rollback task creation if any error occurs.

    Args:
        task_record: The created auto intelligent threshold task record to delete
        detail_records: The list of created auto intelligent threshold task detail records to delete
    """
    try:
        # Delete detail records
        for detail_record in detail_records:
            if detail_record.id:
                await detail_record.delete()
                logger.info(f"Deleted AutoIntelligentThresholdTaskRecordDetail {detail_record.id} during rollback")

        # Delete task record
        if task_record and task_record.id:
            await task_record.delete()
            logger.info(f"Deleted AutoIntelligentThresholdTaskRecord {task_record.id} during rollback")

    except Exception as rollback_error:
        logger.error(f"Error during rollback: {rollback_error}")
        # We don't raise here as this is already part of error handling


async def scheduled_process_record_detail_tasks(max_iterations: int = 100, gap_time: int = 10) -> None:
    """Scheduled process record detail tasks.

    1. Query the most recent AutoIntelligentThresholdTaskRecord, if status is not Processing, return directly
    2. After getting the record, call ProcessRecordDetailTasks to process detail tasks in the record
    """
    # Query the most recent AutoIntelligentThresholdTaskRecord
    latest_record = await AutoIntelligentThresholdTaskRecord.find().sort("-created_at").first_or_none()

    # If no record found or status is not Processing, return directly
    if not latest_record or latest_record.status != AutoIntelligentThresholdTaskStatus.PROCESSING:
        return

    # Call ProcessRecordDetailTasks to process detail tasks in the record
    # This is a placeholder implementation as ProcessRecordDetailTasks is not implemented yet
    await process_record_detail_tasks(latest_record, max_iterations, gap_time)


async def process_record_detail_tasks(
    record: AutoIntelligentThresholdTaskRecord, max_iterations: int = 100, gap_time: int = 10
) -> None:
    """Process record detail tasks.

    Process all auto threshold update sub-tasks under the specified
    AutoIntelligentThresholdTaskRecord.
    This function will loop until all sub-tasks are completed or the maximum
    iteration count is reached.

    Each loop cycle includes the following main steps:
    1. processDetailTaskStatus(...) : First step, process the status related to
       the "threshold calculation task" itself.
    2. processDetailAlarmInjectStatus(...) : Second step, process the status
       related to "creating alarm rules based on thresholds".
    3. checkAndUpdateOverallRecordStatus(...) : Third step, check the overall
       progress of all sub-tasks and decide whether to continue to the next loop.
    4. If checkAndUpdateOverallRecordStatus returns True, exit the loop,
       otherwise wait for a period of time (gap_time) before proceeding to
       the next loop.

    Args:
        record: The AutoIntelligentThresholdTaskRecord to process
        max_iterations: Maximum iteration count to prevent infinite loops (default: 100)
        gap_time: Gap time between iterations in minutes (default: 10)
    """
    iteration_count = 0

    while iteration_count < max_iterations:
        iteration_count += 1
        logger.info(f"[RecordID: {record.id}, Iteration: {iteration_count}] Starting processing iteration.")

        # Step 1: Process the status related to the "threshold calculation task" itself
        await process_detail_task_status(record)
        logger.info(f"[RecordID: {record.id}, Iteration: {iteration_count}] Finished processDetailTaskStatus.")

        # Step 2: Process the status related to "creating alarm rules based on thresholds"
        await process_detail_alarm_inject_status(record)
        logger.info(f"[RecordID: {record.id}, Iteration: {iteration_count}] Finished processDetailAlarmInjectStatus.")

        try:
            # Step 3: Check the overall progress of all sub-tasks and decide whether to continue
            all_details_completed = await check_and_update_overall_record_status(record)
            if all_details_completed:
                logger.info(
                    f"[RecordID: {record.id}, Iteration: {iteration_count}] All details completed. Exiting loop."
                )
                break
            logger.info(f"[RecordID: {record.id}, Iteration: {iteration_count}] Continuing to next iteration.")
        except Exception as e:
            logger.error(
                f"[RecordID: {record.id}, Iteration: {iteration_count}] Error in checkAndUpdateOverallRecordStatus: {e}"
            )
            continue

        # Step 4: Wait for a period of time before proceeding to the next loop
        await asyncio.sleep(gap_time * 60)


async def process_detail_task_status(record: AutoIntelligentThresholdTaskRecord) -> None:
    """Process the status related to the "threshold calculation task" itself.

    This function queries all unfinished tasks in the AutoIntelligentThresholdTaskRecordDetail table
    that belong to the AutoIntelligentThresholdTaskRecord, and processes each one.

    Args:
        record: The AutoIntelligentThresholdTaskRecord to process
    """
    # Query all unfinished tasks in AutoIntelligentThresholdTaskRecordDetail table
    # that belong to the AutoIntelligentThresholdTaskRecord
    # Unfinished tasks are those with status not equal to SUCCESS or FAILED
    unfinished_tasks = await AutoIntelligentThresholdTaskRecordDetail.find(
        AutoIntelligentThresholdTaskRecordDetail.auto_intelligent_threshold_task_record_id == record.id,
        AutoIntelligentThresholdTaskRecordDetail.status != AutoIntelligentThresholdTaskDetailStatus.COMPLETED,
    ).to_list()

    logger.info(f"[RecordID: {record.id}] Found {len(unfinished_tasks)} unfinished tasks in processDetailTaskStatus.")

    # Iterate through each unfinished task
    for task_detail in unfinished_tasks:
        try:
            # 1. If task_detail status is pending, we need to trigger the threshold calculation task
            # This involves creating a new version and calling ThresholdRecommender to start the task
            if task_detail.intelligent_threshold_task_status == AutoIntelligentThresholdTaskDetailTaskStatus.PENDING:
                # Get the IntelligentThresholdTask to fetch the required parameters
                intelligent_task = await IntelligentThresholdTask.find_one(
                    IntelligentThresholdTask.id == task_detail.intelligent_threshold_task_id,
                    Eq(IntelligentThresholdTask.is_active, True),
                )
                if not intelligent_task:
                    logger.error(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"IntelligentThresholdTask not found for task_id: {task_detail.intelligent_threshold_task_id}"
                    )
                    task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
                    await task_detail.save()
                    continue

                # Get the latest version of the task
                latest_version = (
                    await IntelligentThresholdTaskVersion.find(
                        IntelligentThresholdTaskVersion.task_id == task_detail.intelligent_threshold_task_id
                    )
                    .sort("-version")
                    .first_or_none()
                )

                if not latest_version:
                    logger.error(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"No version found for task_id: {task_detail.intelligent_threshold_task_id}"
                    )
                    task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
                    await task_detail.save()
                    continue

                # Create a new version for this task run
                new_version_number = latest_version.version + 1
                new_version_doc = IntelligentThresholdTaskVersion(
                    task_id=task_detail.intelligent_threshold_task_id,
                    version=new_version_number,
                    metric_template_value=latest_version.metric_template_value,
                    n_count=latest_version.n_count,
                    direction=latest_version.direction,
                    sensitivity=latest_version.sensitivity,
                    created_user=latest_version.created_user,
                    updated_user=latest_version.updated_user,
                    status=IntelligentThresholdTaskStatus.RUNNING,
                    result=None,
                )
                await new_version_doc.insert()

                # Update task_detail with the new version and change status to Processing
                task_detail.version = new_version_number
                task_detail.status = AutoIntelligentThresholdTaskDetailStatus.PROCESSING
                task_detail.intelligent_threshold_task_status = AutoIntelligentThresholdTaskDetailTaskStatus.PROCESSING
                await task_detail.save()

                # Trigger the threshold calculation task by calling the threshold agent via HTTP
                await call_threshold_agent(
                    task_id=task_detail.intelligent_threshold_task_id,
                    task_version=new_version_number,
                    datasource_id=str(intelligent_task.datasource_id),
                    metric_template_value=latest_version.metric_template_value,
                    n_count=latest_version.n_count,
                    direction=latest_version.direction,
                    sensitivity=latest_version.sensitivity,
                    task_priority=TaskPriority.LOW,
                )

                logger.info(
                    f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                    f"Triggered threshold calculation task with version {new_version_number}"
                )

            # 2. If task_detail status is Processing, check the actual status of the intelligent threshold task
            # and update task_detail intelligent_threshold_task_status accordingly
            elif (
                task_detail.intelligent_threshold_task_status == AutoIntelligentThresholdTaskDetailTaskStatus.PROCESSING
            ):
                # Get the task version to check its status
                task_version = await IntelligentThresholdTaskVersion.find_one(
                    IntelligentThresholdTaskVersion.task_id == task_detail.intelligent_threshold_task_id,
                    IntelligentThresholdTaskVersion.version == task_detail.version,
                )

                if not task_version:
                    logger.error(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"Task version {task_detail.version} not found for task_id: "
                        f"{task_detail.intelligent_threshold_task_id}"
                    )
                    task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
                    task_detail.intelligent_threshold_task_status = AutoIntelligentThresholdTaskDetailTaskStatus.FAILED
                    await task_detail.save()
                    continue

                # Update the task detail status based on the task version status
                new_task_detail_status = task_detail.intelligent_threshold_task_status
                if task_version.status == IntelligentThresholdTaskStatus.SUCCESS:
                    new_task_detail_status = AutoIntelligentThresholdTaskDetailTaskStatus.SUCCESS
                elif task_version.status == IntelligentThresholdTaskStatus.FAILED:
                    new_task_detail_status = AutoIntelligentThresholdTaskDetailTaskStatus.FAILED

                if new_task_detail_status != task_detail.intelligent_threshold_task_status:
                    task_detail.intelligent_threshold_task_status = new_task_detail_status
                    await task_detail.save()

                # If the task is still running, no action needed

            # 3. If task_detail status is Success, and if alarm_inject_status is Initialized, set it to pending
            elif task_detail.intelligent_threshold_task_status == AutoIntelligentThresholdTaskDetailTaskStatus.SUCCESS:
                alarm_sync_record = await AlarmSyncRecord.find_one(
                    AlarmSyncRecord.task_id == task_detail.intelligent_threshold_task_id
                )
                if alarm_sync_record is None:
                    task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
                    await task_detail.save()
                    continue

                if task_detail.alarm_inject_status == AutoIntelligentThresholdTaskAlarmInjectStatus.INITIALIZED:
                    task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.PENDING
                    await task_detail.save()
                    logger.info(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"Updated alarm_inject_status to Pending"
                    )

            # 4. If task_detail status is Fail, it's already in the correct state
            elif task_detail.status == AutoIntelligentThresholdTaskDetailStatus.COMPLETED:
                # Status is already Failed, set status to Completed
                task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
                await task_detail.save()
                logger.info(
                    f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] failedUpdated status to Completed"
                )

        except Exception as e:
            logger.error(f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] Error processing task detail: {e}")
            task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
            await task_detail.save()
            continue


async def process_detail_alarm_inject_status(record: AutoIntelligentThresholdTaskRecord) -> None:
    """Process the status related to "creating alarm rules based on thresholds".

    This function queries all tasks in the AutoIntelligentThresholdTaskRecordDetail table
    that belong to the AutoIntelligentThresholdTaskRecord and have successfully completed
    the threshold calculation task, and processes the alarm injection status for each one.

    Args:
        record: The AutoIntelligentThresholdTaskRecord to process
    """
    # Query all tasks in AutoIntelligentThresholdTaskRecordDetail table
    # that belong to the AutoIntelligentThresholdTaskRecord and have successfully completed
    # the threshold calculation task (intelligent_threshold_task_status == SUCCESS)
    # and haven't completed alarm injection (alarm_inject_status != SUCCESS or FAILED)
    tasks_for_alarm_injection = await AutoIntelligentThresholdTaskRecordDetail.find(
        AutoIntelligentThresholdTaskRecordDetail.auto_intelligent_threshold_task_record_id == record.id,
        AutoIntelligentThresholdTaskRecordDetail.status != AutoIntelligentThresholdTaskDetailStatus.COMPLETED,
    ).to_list()

    # Iterate through each task that needs alarm injection
    for task_detail in tasks_for_alarm_injection:
        try:
            # Check if the alarm injection status is pending
            if task_detail.alarm_inject_status == AutoIntelligentThresholdTaskAlarmInjectStatus.INITIALIZED:
                logger.info(
                    f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] alarm_inject_status is INITIALIZED, skip"
                )

            elif task_detail.alarm_inject_status == AutoIntelligentThresholdTaskAlarmInjectStatus.PENDING:
                logger.info(
                    f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                    f"alarm_inject_status is PENDING, Triggering alarm rule injection"
                )

                # Get the IntelligentThresholdTask to fetch the required parameters
                intelligent_task = await IntelligentThresholdTask.find_one(
                    IntelligentThresholdTask.id == task_detail.intelligent_threshold_task_id
                )
                if not intelligent_task:
                    logger.error(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"IntelligentThresholdTask not found for task_id: {task_detail.intelligent_threshold_task_id}"
                    )
                    task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.FAILED
                    await task_detail.save()
                    continue

                # Get the latest version of the task to get the results
                task_version = await IntelligentThresholdTaskVersion.find_one(
                    IntelligentThresholdTaskVersion.task_id == task_detail.intelligent_threshold_task_id,
                    IntelligentThresholdTaskVersion.version == task_detail.version,
                )

                if not task_version:
                    logger.error(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"Task version {task_detail.version} not found for task_id: "
                        f"{task_detail.intelligent_threshold_task_id}"
                    )
                    task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.FAILED
                    await task_detail.save()
                    continue

                # Check if the task version has results
                if not task_version.result:
                    logger.warning(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"No results found in task version {task_detail.version}"
                    )
                    task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.FAILED
                    await task_detail.save()
                    continue

                # Get the latest record from AlarmSyncRecord table for task_id
                last_alarm_inject_record = await (
                    AlarmSyncRecord.find(AlarmSyncRecord.task_id == intelligent_task.id)
                    .sort(-AlarmSyncRecord.created_at)
                    .first_or_none()
                )

                if not last_alarm_inject_record:
                    logger.warning(
                        f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                        f"No previous alarm sync record found for task_id: "
                        f"{intelligent_task.id}"
                    )
                    task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.FAILED
                    await task_detail.save()

                await sync_alarm_rules_service(
                    SyncAlarmRulesPayload(
                        task_id=intelligent_task.id,
                        task_version_id=task_version.id,
                        contact_group_ids=last_alarm_inject_record.contact_group_ids,
                        alert_methods=last_alarm_inject_record.alert_methods,
                        alarm_level=last_alarm_inject_record.alarm_level,
                    )
                )

                # Update the alarm injection status to SUCCESS
                task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.SUCCESS
                await task_detail.save()
                logger.info(
                    f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] Updated alarm_inject_status to Success"
                )

            # If the alarm injection status is already SUCCESS or FAILED, no action needed
            elif task_detail.alarm_inject_status in [
                AutoIntelligentThresholdTaskAlarmInjectStatus.SUCCESS,
                AutoIntelligentThresholdTaskAlarmInjectStatus.FAILED,
            ]:
                # Status is already set, no action needed
                logger.info(
                    f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                    f"alarm_inject_status is {task_detail.alarm_inject_status}. Setting detail status to Completed."
                )
                task_detail.status = AutoIntelligentThresholdTaskDetailStatus.COMPLETED
                await task_detail.save()

        except Exception as e:
            logger.error(
                f"[RecordID: {record.id}, TaskDetailID: {task_detail.id}] "
                f"Error processing alarm injection for task detail: {e}"
            )
            # Update the alarm injection status to FAILED if an error occurs
            task_detail.alarm_inject_status = AutoIntelligentThresholdTaskAlarmInjectStatus.FAILED
            await task_detail.save()
            continue


async def check_and_update_overall_record_status(record: AutoIntelligentThresholdTaskRecord) -> bool:
    """Check the overall progress of all sub-tasks and decide whether to continue.

    This function checks the status of all sub-tasks associated with the given record
    and determines whether all tasks have completed (either successfully or with failures).
    If all tasks are completed, it updates the overall record status to COMPLETED and returns True.
    Otherwise, it returns False to indicate that processing should continue.

    Args:
        record: The AutoIntelligentThresholdTaskRecord to check and update

    Returns:
        bool: True if all sub-tasks are completed and the loop should exit, False otherwise
    """
    # Query all task details associated with this record
    processing_task_count = await AutoIntelligentThresholdTaskRecordDetail.find(
        AutoIntelligentThresholdTaskRecordDetail.auto_intelligent_threshold_task_record_id == record.id,
        AutoIntelligentThresholdTaskRecordDetail.status == AutoIntelligentThresholdTaskDetailStatus.PROCESSING,
    ).count()

    current_record = await AutoIntelligentThresholdTaskRecord.find_one(
        AutoIntelligentThresholdTaskRecord.id == record.id,
    )

    new_record_status = (
        AutoIntelligentThresholdTaskStatus.COMPLETED
        if processing_task_count == 0
        else AutoIntelligentThresholdTaskStatus.PROCESSING
    )
    if current_record.status != new_record_status:
        current_record.status = new_record_status
        await current_record.save()

    return new_record_status == AutoIntelligentThresholdTaskStatus.COMPLETED
