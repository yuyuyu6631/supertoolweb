from fastapi import APIRouter

from app.api.routes import ai_search, auth, catalog, crawl, recommend, chat, parser

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(catalog.router, tags=["catalog"])
api_router.include_router(ai_search.router, tags=["ai-search"])
api_router.include_router(recommend.router, tags=["recommend"])
api_router.include_router(crawl.router, tags=["crawl"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(parser.router, prefix="/parser", tags=["parser"])
