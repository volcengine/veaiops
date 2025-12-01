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

import json
from datetime import datetime, timezone
from typing import List, Literal, Optional, override

from tenacity import retry, stop_after_attempt, wait_fixed
from volcengine.ApiInfo import ApiInfo
from volcengine.viking_knowledgebase import Collection, Doc, Point, VikingKnowledgeBaseService

from veaiops.schema.models.chatops import Citation
from veaiops.schema.types import CitationType
from veaiops.utils.log import logger


class EnhancedCollection(Collection):
    """Enhanced Collection for Viking Knowledge Base."""

    def __init__(self, viking_knowledgebase_service, collection_name, kwargs=None):
        # Call the parent class constructor
        super().__init__(viking_knowledgebase_service, collection_name, kwargs)

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(5))
    def delete_point(
        self,
        point_id: str,
        collection_name: Optional[str] = None,
        project: str = "default",
        resource_id: Optional[str] = None,
    ) -> None:
        """Delete a point from the knowledge base.

        Args:
            point_id (str): The ID of the point to delete.
            collection_name (Optional[str], optional): The name of the collection. Defaults to None.
            project (str, optional): The project name. Defaults to "default".
            resource_id (Optional[str], optional): The resource ID. Defaults to None.
        """
        params = {"point_id": point_id, "collection_name": self.collection_name, "project": project}
        if collection_name is not None:
            params["collection_name"] = collection_name
        if project is not None:
            params["project"] = project
        if resource_id is not None:
            params["resource_id"] = resource_id

        self.viking_knowledgebase_service.json_exception("DeletePoint", {}, json.dumps(obj=params))

    @override
    def add_doc(
        self,
        add_type,
        doc_id=None,
        doc_name=None,
        doc_type=None,
        tos_path=None,
        url=None,
        meta=None,
        project="default",
        resource_id=None,
        collection_name=None,
        headers=None,
        lark_file=None,
    ):
        params = {"collection_name": self.collection_name, "add_type": add_type, "project": project}
        if resource_id is not None:
            params["resource_id"] = resource_id
        if collection_name is not None:
            params["collection_name"] = collection_name

        if add_type == "tos":
            params["tos_path"] = tos_path
        elif add_type == "url":
            params["doc_id"] = doc_id
            params["doc_name"] = doc_name
            params["doc_type"] = doc_type
            params["url"] = url
            if meta is not None:
                params["meta"] = meta
        elif add_type == "lark":
            params["doc_id"] = doc_id
            params["doc_type"] = doc_type
            params["lark_file"] = lark_file
            if meta is not None:
                params["meta"] = meta
        self.viking_knowledgebase_service.json_exception("AddDoc", {}, json.dumps(params))

    def list_docs(
        self,
        offset=0,
        limit=-1,
        doc_type=None,
        project="default",
        collection_name=None,
        headers=None,
        filter=None,
    ) -> List[Doc]:
        """List documents in the knowledge base.

        Args:
            offset (int, optional): The offset for pagination. Defaults to 0.
            limit (int, optional): The maximum number of documents to return. Defaults to -1.
            doc_type (str, optional): The type of documents to filter by. Defaults to None.
            project (str, optional): The project name. Defaults to "default".
            collection_name (Optional[str], optional): The name of the collection to filter by. Defaults to None.
            headers (Optional[dict], optional): Headers to include in the request. Defaults to None.
            filter (Optional[dict], optional): Additional filters to apply. Defaults to None.

        Returns:
            List[Doc]: A list of documents matching the criteria.
        """
        params = {
            "collection_name": self.collection_name,
            "offset": offset,
            "limit": limit,
            "doc_type": doc_type,
            "project": project,
        }
        if filter:
            params["filter"] = filter
        if collection_name is not None:
            params["collection_name"] = collection_name
        res = self.viking_knowledgebase_service.json_exception("ListDocs", {}, json.dumps(params))
        data = json.loads(res)["data"]
        docs = []
        for item in data["doc_list"]:
            item["project"] = project
            docs.append(Doc(item))
        return docs

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(10))
    def check_doc_exists(
        self,
        doc_id,
        project: str = "default",
        collection_name: Optional[str] = None,
    ) -> Optional[Doc]:
        """Check if a document exists in the knowledge base.

        Args:
            doc_id (str): The ID of the document to check.
            project (str, optional): The project name. Defaults to "default".
            collection_name (Optional[str], optional): The name of the collection to check. Defaults to None.

        Raises:
            FileNotFoundError: If the document is not found.

        Returns:
            Optional[Doc]: The document if found, None otherwise.
        """
        doc = self.get_doc(doc_id=doc_id, project=project, collection_name=collection_name)
        status = doc.status.get("process_status")
        if status == 0:
            return doc
        elif status == 1:
            # Processing failed, delete the doc
            self.delete_doc(project=project, doc_id=doc_id)
            logger.error(f"Doc parsed failed. Delete doc {doc_id}")
            return None

        logger.info(f"Wait for doc {doc_id} processing")
        failed_code = doc.status.get("failed_code")
        raise FileNotFoundError(f"KB doc does not ready, Status {status}, Failed Code {failed_code}")

    @retry(stop=stop_after_attempt(5), wait=wait_fixed(5))
    def add_point(
        self,
        doc_id: str,
        chunk_type: Literal["structured", "text", "faq"],
        content: Optional[str] = None,
        question: Optional[str] = None,
        fields: Optional[List] = None,
        collection_name: Optional[str] = None,
        project: str = "default",
        resource_id: Optional[str] = None,
    ) -> Optional[Point]:
        """Add a point to the knowledge base.

        Args:
            doc_id (str): The ID of the document to add the point to.
            chunk_type (Literal["structured", "text", "faq"]): The type of the chunk.
            content (Optional[str], optional): The content of the point. Defaults to None.
            question (Optional[str], optional): The question associated with the point. Defaults to None.
            fields (Optional[List], optional): A list of fields to include in the point. Defaults to None.
            collection_name (Optional[str], optional): The name of the collection to add the point to. Defaults to None.
            project (str, optional): The project name. Defaults to "default".
            resource_id (Optional[str], optional): The resource ID to associate with the point. Defaults to None.

        Raises:
            e: If the document is still processing or an error occurs.

        Returns:
            Optional[Point]: The created point or None if the document is not ready.
        """
        try:
            doc = self.check_doc_exists(doc_id, project, collection_name)
        except Exception as e:
            logger.warning(f"Doc is still processing. Add fail{doc_id}. {e}")
            raise e
        if doc is None:
            return None
        params = {
            "doc_id": doc_id,
            "chunk_type": chunk_type,
            "content": content,
            "collection_name": self.collection_name,
            "project": project,
        }
        if collection_name is not None:
            params["collection_name"] = collection_name
        if question is not None:
            params["question"] = question
        if fields is not None:
            params["fields"] = fields
        if resource_id is not None:
            params["resource_id"] = resource_id
        res = self.viking_knowledgebase_service.json_exception("AddPoint", {}, json.dumps(params))
        res = json.loads(res)
        res["data"]["project"] = project
        if resource_id is not None:
            res["data"]["resource_id"] = resource_id
        res["data"]["doc_info"] = res["data"].get("doc_info", {})
        return Point(res["data"])

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(5))
    def update_point(
        self,
        point_id: str,
        collection_name: Optional[str] = None,
        project: str = "default",
        resource_id: Optional[str] = None,
        content: Optional[str] = None,
        fields: Optional[List] = None,
        question: Optional[str] = None,
    ) -> None:
        """Update a point in the knowledge base.

        Args:
            point_id (str): The ID of the point to update.
            collection_name (Optional[str], optional): The name of the collection. Defaults to None.
            project (str, optional): The project name. Defaults to "default".
            resource_id (Optional[str], optional): Resource ID to filter points. Defaults to None.
            content (Optional[str], optional): The content of the point. Defaults to None.
            fields (Optional[List], optional): A list of fields to update. Defaults to None.
            question (Optional[str], optional): The question associated with the point. Defaults to None.
        """
        params = {"point_id": point_id}
        if collection_name is not None:
            params["collection_name"] = collection_name
        if project is not None:
            params["project"] = project
        if resource_id is not None:
            params["resource_id"] = resource_id
        if content is not None:
            params["content"] = content
        if fields is not None:
            params["fields"] = fields
        if question is not None:
            params["question"] = question

        self.viking_knowledgebase_service.json_exception("UpdatePoint", {}, json.dumps(params))

    @retry(stop=stop_after_attempt(10), wait=wait_fixed(3))
    def list_all_points(
        self,
        doc_ids: Optional[List[str]] = None,
        project: str = "default",
        resource_id: Optional[str] = None,
        collection_name: Optional[str] = None,
    ) -> List[Point]:
        """List all points in the knowledge base.

        Args:
            doc_ids (Optional[List[str]], optional): A list of document IDs to filter points. Defaults to None.
            project (str, optional): The project name. Defaults to "default".
            resource_id (str, optional): Resource ID to filter points. Defaults to None.
            collection_name (str, optional): Collection name to filter points. Defaults to None.

        Returns:
            List[Point]: A list of points in the knowledge base.
        """
        points = []
        offset = 0
        while True:
            points_chunk = self.list_points(
                project=project,
                collection_name=collection_name,
                doc_ids=doc_ids,
                resource_id=resource_id,
                offset=offset,
                limit=100,
            )
            points.extend(points_chunk)
            offset += 100
            # The maximum value of offset is 20_000
            if len(points_chunk) < 100 or offset >= 20000:
                break

        return points


class EnhancedVikingKBService(VikingKnowledgeBaseService):
    """Enhanced Viking Knowledge Base Service."""

    def __init__(
        self,
        ak: str,
        sk: str,
        host: str = "api-knowledgebase.mlp.cn-beijing.volces.com",
        region: str = "cn-beijing",
        sts_token: str = "",
        scheme: str = "https",
        connection_timeout: int = 30,
        socket_timeout: int = 30,
    ):
        super().__init__(
            host=host,
            region=region,
            ak=ak,
            sk=sk,
            sts_token=sts_token,
            scheme=scheme,
            connection_timeout=connection_timeout,
            socket_timeout=socket_timeout,
        )
        self.api_info = EnhancedVikingKBService.get_api_info()

    @staticmethod
    def get_api_info():
        """Get API information.

        Returns:
            dict: A dictionary containing API information.
        """
        api_info = {
            # Collection
            "CreateCollection": ApiInfo(
                "POST",
                "/api/knowledge/collection/create",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "GetCollection": ApiInfo(
                "POST",
                "/api/knowledge/collection/info",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "DropCollection": ApiInfo(
                "POST",
                "/api/knowledge/collection/delete",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "ListCollections": ApiInfo(
                "POST",
                "/api/knowledge/collection/list",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "UpdateCollection": ApiInfo(
                "POST",
                "/api/knowledge/collection/update",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "SearchCollection": ApiInfo(
                "POST",
                "/api/knowledge/collection/search",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "SearchAndGenerate": ApiInfo(
                "POST",
                "/api/knowledge/collection/search_and_generate",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "SearchKnowledge": ApiInfo(
                "POST",
                "/api/knowledge/collection/search_knowledge",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            # Doc
            "AddDoc": ApiInfo(
                "POST",
                "/api/knowledge/doc/add",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "DeleteDoc": ApiInfo(
                "POST",
                "/api/knowledge/doc/delete",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "GetDocInfo": ApiInfo(
                "POST",
                "/api/knowledge/doc/info",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "ListDocs": ApiInfo(
                "POST",
                "/api/knowledge/doc/list",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "UpdateDocMeta": ApiInfo(
                "POST",
                "/api/knowledge/doc/update_meta",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            # Point
            "GetPointInfo": ApiInfo(
                "POST",
                "/api/knowledge/point/info",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "ListPoints": ApiInfo(
                "POST",
                "/api/knowledge/point/list",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "AddPoint": ApiInfo(
                "POST",
                "/api/knowledge/point/add",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "DeletePoint": ApiInfo(
                "POST",
                "/api/knowledge/point/delete",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "UpdatePoint": ApiInfo(
                "POST",
                "/api/knowledge/point/update",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            # Service
            "Ping": ApiInfo(
                "GET",
                "/ping",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            "Rerank": ApiInfo(
                "POST",
                "/api/knowledge/service/rerank",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
            # Chat
            "ChatCompletion": ApiInfo(
                "POST",
                "/api/knowledge/chat/completions",
                {},
                {},
                {"Accept": "application/json", "Content-Type": "application/json"},
            ),
        }
        return api_info

    def get_collection(
        self,
        collection_name: str,
        project: str = "default",
        resource_id: Optional[str] = None,
        headers: Optional[dict] = {},
    ) -> EnhancedCollection:
        """Get a collection by name.

        Args:
            collection_name (str): The name of the collection.
            project (str, optional): The project name. Defaults to "default".
            resource_id (Optional[str], optional): The resource ID. Defaults to None.
            headers (Optional[dict], optional): Headers to include in the request. Defaults to None.

        Returns:
            EnhancedCollection: The requested collection.
        """
        params = {"name": collection_name, "project": project}
        if resource_id is not None:
            params["resource_id"] = resource_id
        res = self.json_exception("GetCollection", {}, json.dumps(params))
        data = json.loads(res)["data"]

        now_index_list = data["pipeline_list"][0]["index_list"][0]
        fields = now_index_list["index_config"]["fields"]
        data["fields"] = fields

        return EnhancedCollection(self, collection_name, data)


def convert_viking_to_citations(viking_returns: List[dict]) -> List[Citation]:
    """Convert Viking KB search results to Citations.

    Args:
        viking_returns (List[dict]): Viking KB search results.

    Returns:
        List[Citation]: List of citations.
    """
    viking_returns = [item for i in viking_returns if i.get("result_list") for item in i["result_list"]]
    citations: dict[str, Citation] = {}
    for item in viking_returns:
        doc_info = item.get("doc_info", {})
        title = item.get("original_question") or doc_info.get("doc_name", "")
        update_time = doc_info.get("update_time", int(datetime.now(timezone.utc).timestamp()))
        source = ""
        content = item.get("content", "").strip()
        meta_list_raw = doc_info.get("doc_meta")
        try:
            meta_list = json.loads(meta_list_raw) if meta_list_raw else []
        except Exception as e:
            logger.error(f"Error parsing doc_meta for {title}: {e}")
            meta_list = []
        for meta in meta_list:
            if meta.get("field_name") == "source":
                source = meta.get("field_value")
            # if meta["field_name"] == "file_name":
            #     title = meta["field_value"]

        # Deduplication based on knowledge_key
        if title in citations:
            if content in citations[title].content:
                continue
            else:
                citations[title].content += f"\n{content}"
                continue
        else:
            citation = Citation(
                content=content,
                source=source,
                title=title.strip(),
                citation_type=CitationType.Document if item.get("chunk_source") == "document" else CitationType.QA,
                update_ts_seconds=update_time,
                knowledge_key=item.get("id"),
            )
            citations[title] = citation
    return list(citations.values())
