import secrets
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from siwe import SiweMessage

from app.models.schemas import User
from app.services import database

router = APIRouter()

NONCE_TTL = 300  # 5 minutes
NONCES: dict[str, tuple[str, float]] = {}  # address -> (nonce, created_at)


def _prune_expired_nonces() -> None:
    now = time.time()
    expired = [k for k, (_, ts) in NONCES.items() if now - ts > NONCE_TTL]
    for k in expired:
        del NONCES[k]


class ConnectWalletRequest(BaseModel):
    message: str
    signature: str


@router.get("/nonce")
def get_nonce(address: str):
    if not address:
        raise HTTPException(status_code=400, detail="Missing address")
    _prune_expired_nonces()
    nonce = secrets.token_hex(8)
    NONCES[address.lower()] = (nonce, time.time())
    return {"nonce": nonce}


@router.post("/connect-wallet")
def connect_wallet(req: ConnectWalletRequest):
    try:
        if hasattr(SiweMessage, "from_message"):
            siwe_msg = SiweMessage.from_message(req.message)
        else:
            siwe_msg = SiweMessage(req.message)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid SIWE message: {exc}")

    address = siwe_msg.address
    nonce_entry = NONCES.get(address.lower())
    if not nonce_entry:
        raise HTTPException(status_code=400, detail="Missing or expired nonce")
    expected_nonce, created_at = nonce_entry
    if time.time() - created_at > NONCE_TTL:
        raise HTTPException(status_code=400, detail="Missing or expired nonce")

    if siwe_msg.nonce != expected_nonce:
        raise HTTPException(status_code=400, detail="Nonce mismatch")

    try:
        siwe_msg.verify(req.signature)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Signature validation failed: {exc}")

    NONCES.pop(address.lower(), None)

    user = database.get_user_by_wallet(address)
    if user is None:
        username = address
        display_name = f"{address[:6]}...{address[-4:]}"
        user = User(username=username, display_name=display_name, wallet_address=address)
        database.add_user(user)

    return {
        "username": user.username,
        "display_name": user.display_name,
        "wallet_address": user.wallet_address,
    }
