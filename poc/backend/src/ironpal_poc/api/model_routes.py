from __future__ import annotations

import hashlib
import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from ironpal_poc.auth import get_current_user
from ironpal_poc.config import settings
from ironpal_poc.models import User

router = APIRouter(prefix="/model", tags=["model"])


def _packages_dir() -> str:
    # poc/backend/model_packages, written by scripts/model/build_package.py
    return getattr(settings, "model_packages_dir", None) or os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
        "model_packages",
    )


def _latest() -> tuple[str, str] | None:
    d = _packages_dir()
    latest = os.path.join(d, "latest")
    if not os.path.exists(latest):
        return None
    version = open(latest).read().strip()
    path = os.path.join(d, version + ".json")
    if not os.path.exists(path):
        return None
    return version, path


@router.get("/package")
def get_package(
    request: Request,
    since: str = "",
    user: User = Depends(get_current_user),
) -> Response:
    """Serve the latest signed model package (design §8, §10).

    `since=<version>` or a matching `If-None-Match` ETag returns 304 so the app can poll cheaply.
    The package is static data (params, campaign map, priors, explanations); it never depends on
    the caller, so nothing about the user is read here beyond authentication.
    """
    found = _latest()
    if not found:
        raise HTTPException(status_code=404, detail="no model package published")
    version, path = found
    body = open(path, "rb").read()
    etag = '"' + hashlib.sha256(body).hexdigest()[:32] + '"'
    if since == version or request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag, "X-Package-Version": version})
    return Response(
        content=body,
        media_type="application/json",
        headers={"ETag": etag, "X-Package-Version": version, "Cache-Control": "no-cache"},
    )
