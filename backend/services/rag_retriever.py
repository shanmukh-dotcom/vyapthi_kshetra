import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class KnowledgeRetriever:
    """
    Modular Local RAG Knowledge Retriever.
    Reads curated knowledge items from backend/modules/potato_ai/knowledge/
    Computes keyword / term frequency relevance scoring for queries.
    Interface: retrieve(query, top_k)
    """

    def __init__(self):
        self.knowledge_base_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "modules", "potato_ai", "knowledge"
        )
        self.documents = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        self.documents = []
        if not os.path.exists(self.knowledge_base_dir):
            logger.warning(f"Knowledge base directory not found at {self.knowledge_base_dir}")
            return

        for fname in os.listdir(self.knowledge_base_dir):
            if fname.endswith(".json"):
                fpath = os.path.join(self.knowledge_base_dir, fname)
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            for item in data:
                                self.documents.append(item)
                        elif isinstance(data, dict):
                            self.documents.append(data)
                except Exception as e:
                    logger.error(f"Failed to load knowledge file {fname}: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Retrieves top_k relevant knowledge items matching query terms.
        Returns:
        {
           "chunks": [...],
           "source_ids": ["defect_scab_001", "recommendation_storage_001", ...]
        }
        """
        if not self.documents:
            self._load_knowledge_base()

        query_terms = set(query.lower().replace(",", " ").replace(".", " ").split())
        scored_docs = []

        for doc in self.documents:
            # Flatten doc fields into search text
            doc_id = doc.get("id") or doc.get("source") or "kn_001"
            doc_text = f"{doc.get('name', '')} {doc.get('symptoms', '')} {doc.get('guidance', '')} {doc.get('details', '')} {doc.get('topic', '')}".lower()
            
            # Simple term-overlap score
            score = 0
            for term in query_terms:
                if len(term) > 2 and term in doc_text:
                    score += doc_text.count(term) * (2 if term in doc.get("name", "").lower() else 1)

            # Always include default recommendations if score is 0
            if score > 0 or doc.get("topic") or doc.get("name"):
                scored_docs.append((score, doc_id, doc))

        # Sort by relevance score
        scored_docs.sort(key=lambda x: x[0], reverse=True)

        selected_chunks = []
        source_ids = []

        for score, doc_id, doc in scored_docs[:top_k]:
            source_ids.append(doc_id)
            selected_chunks.append({
                "id": doc_id,
                "title": doc.get("name") or doc.get("topic") or doc.get("title") or "Agricultural Quality Rule",
                "content": doc.get("symptoms") or doc.get("guidance") or doc.get("details") or str(doc),
                "source": doc.get("source", "Standard Agricultural Guideline")
            })

        # Ensure source_ids are unique
        source_ids = list(dict.fromkeys(source_ids))

        return {
            "chunks": selected_chunks,
            "source_ids": source_ids
        }

# Global singleton instance
retriever_service = KnowledgeRetriever()
