from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import AuthLoginRequest, AuthRegisterRequest, AuthUserResponse
from app.services import auth_service


router = APIRouter(prefix="/auth")


@router.post("/register", response_model=AuthUserResponse, status_code=201)
def register(payload: AuthRegisterRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    result = auth_service.register_user(db, payload, request)
    auth_service.set_auth_cookie(response, result.session_token)
    return auth_service.serialize_user(result.user)


@router.post("/login", response_model=AuthUserResponse)
def login(payload: AuthLoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    result = auth_service.login_user(db, payload, request)
    auth_service.set_auth_cookie(response, result.session_token)
    return auth_service.serialize_user(result.user)


@router.post("/logout", status_code=204)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    session_token = request.cookies.get(auth_service.settings.session_cookie_name)
    if session_token:
        auth_service.revoke_session(db, session_token)
    auth_service.clear_auth_cookie(response)


@router.get("/me", response_model=AuthUserResponse)
def me(user=Depends(auth_service.current_user_dependency)):
    return auth_service.serialize_user(user)
