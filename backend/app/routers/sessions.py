import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Session as SessionModel

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


class SessionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    inputs_json: str
    results_json: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    inputs_json: str
    results_json: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SessionModel).order_by(SessionModel.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=SessionResponse)
async def create_session(data: SessionCreate, db: AsyncSession = Depends(get_db)):
    session = SessionModel(
        name=data.name,
        description=data.description,
        inputs_json=data.inputs_json,
        results_json=data.results_json,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str, data: SessionCreate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.name = data.name
    session.description = data.description
    session.inputs_json = data.inputs_json
    session.results_json = data.results_json
    await db.commit()
    await db.refresh(session)
    return session


@router.delete("/{session_id}")
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)
    await db.commit()
    return {"deleted": session_id}
