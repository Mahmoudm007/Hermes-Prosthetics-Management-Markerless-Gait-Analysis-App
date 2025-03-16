import uuid
import jwt
import logging
from datetime import datetime, timedelta
from passlib.context import CryptContext

from src.config import Config

password_context = CryptContext(schemes=["bcrypt"])


def generate_password_hash(password: str) -> str:
    hash = password_context.hash(password)
    return hash


def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)


def create_access_token(user: dict, expiry: timedelta = None, refresh: bool = False):
    payload = {
        "user": user,
        "exp": int(
            (datetime.now() + (expiry if expiry else timedelta(minutes=60))).timestamp()
        ),
        "jti": str(uuid.uuid4()),
        "refresh": refresh,
    }

    token = jwt.encode(
        payload=payload, key=Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM
    )

    return token


def decode_token(token: str) -> dict | None:
    try:
        token_data = jwt.decode(
            jwt=token, key=Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM]
        )
        return token_data
    except jwt.PyJWTError as jwte:
        logging.exception(jwte)
        return None
    except Exception as e:
        logging.exception(e)
        return None
