from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recommend import RecommendItem, RecommendRequest
from app.services.recommendation_service import recommend

router = APIRouter()


@router.post("/recommend", response_model=list[RecommendItem])
def recommend_tools(payload: RecommendRequest, db: Session = Depends(get_db)):
    return recommend(db=db, payload=payload)
