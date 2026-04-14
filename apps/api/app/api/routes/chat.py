from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.rag_chat_service import stream_chat_rag

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@router.post("")
def chat_stream(payload: ChatRequest, db: Session = Depends(get_db)):
    """流式 SSE 对话接口，返回标准 Server-Sent Events 格式。"""
    messages_dict = [{"role": msg.role, "content": msg.content} for msg in payload.messages]
    return StreamingResponse(
        stream_chat_rag(db=db, messages=messages_dict),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Nginx 代理不缓冲
        },
    )
