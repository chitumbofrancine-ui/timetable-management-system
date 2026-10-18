import os
from datetime import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Please configure SUPABASE_URL and SUPABASE_KEY in .env"
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(
    title="Timetable Management System API",
    description="API for managing university timetable records",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TimetableCreate(BaseModel):
    course_name: str = Field(min_length=1)
    lecturer: str = Field(min_length=1)
    room: str = Field(min_length=1)
    day: str = Field(min_length=1)
    start_time: time
    end_time: time


class TimetableUpdate(BaseModel):
    course_name: str | None = Field(default=None, min_length=1)
    lecturer: str | None = Field(default=None, min_length=1)
    room: str | None = Field(default=None, min_length=1)
    day: str | None = Field(default=None, min_length=1)
    start_time: time | None = None
    end_time: time | None = None


@app.get("/")
def home():
    return {
        "message": "Timetable Management System API is running",
        "documentation": "/docs",
    }


@app.get("/api/timetable")
def get_timetable():
    response = (
        supabase.table("timetable")
        .select("*")
        .order("id")
        .execute()
    )
    return response.data


@app.post("/api/timetable", status_code=201)
def create_timetable(record: TimetableCreate):
    data = record.model_dump(mode="json")

    response = (
        supabase.table("timetable")
        .insert(data)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="The timetable record could not be created",
        )

    return response.data[0]


@app.put("/api/timetable/{record_id}")
def update_timetable(record_id: int, record: TimetableUpdate):
    changes = record.model_dump(
        mode="json",
        exclude_unset=True,
        exclude_none=True,
    )

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one field to update",
        )

    response = (
        supabase.table("timetable")
        .update(changes)
        .eq("id", record_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Timetable record not found",
        )

    return response.data[0]


@app.delete("/api/timetable/{record_id}")
def delete_timetable(record_id: int):
    response = (
        supabase.table("timetable")
        .delete()
        .eq("id", record_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Timetable record not found",
        )

    return {
        "message": "Timetable record deleted successfully",
        "id": record_id,
    }