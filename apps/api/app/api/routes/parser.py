from fastapi import APIRouter
from pydantic import BaseModel
from app.services.tool_parser_service import generate_tool_metadata

router = APIRouter()

class ParseToolRequest(BaseModel):
    url: str

@router.post("/extract")
def extract_tool_metadata(payload: ParseToolRequest):
    """
    接收目标工具URL，使用爬虫并调用LLM自动抽取相关特征（分类、标签、描述）。
    供管理后台等前端系统直接调研。
    """
    data = generate_tool_metadata(str(payload.url))
    return {"success": bool(data), "data": data}
