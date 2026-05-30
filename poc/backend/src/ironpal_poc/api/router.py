from __future__ import annotations

from fastapi import APIRouter

from ironpal_poc.api import auth_routes, sessions_routes, templates_routes, vision_routes

router = APIRouter()
router.include_router(auth_routes.router)
router.include_router(templates_routes.router)
router.include_router(vision_routes.router)
router.include_router(sessions_routes.router)
