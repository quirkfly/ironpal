from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path):
    # Force deterministic mock vision (no OpenAI spend / no key needed) — DR6.
    from ironpal_poc.config import settings

    settings.vision_mock = True
    settings.founder_user_id = ""

    # Point the engine at a throwaway sqlite file BEFORE the app starts up.
    from ironpal_poc import db as dbmod

    dbmod.init_engine(f"sqlite+pysqlite:///{tmp_path / 'test.db'}")
    dbmod.init_db()

    from ironpal_poc.main import app

    with TestClient(app) as c:
        yield c


def _token(client, role: str) -> str:
    r = client.post("/api/v1/auth/token", json={"role": role, "display_name": role})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture()
def founder_auth(client):
    return {"Authorization": f"Bearer {_token(client, 'founder')}"}


@pytest.fixture()
def tester_auth(client):
    return {"Authorization": f"Bearer {_token(client, 'tester')}"}
