from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ----------------------------- Models -----------------------------
def now_utc():
    return datetime.now(timezone.utc)


class EventCreate(BaseModel):
    title: str
    category: str  # nightlife | food | sports | culture
    start_time: str  # ISO string
    description: str = ""
    image_url: str = ""
    instagram: str = ""
    website: str = ""
    tickets_url: str = ""
    latitude: float
    longitude: float
    address: str = ""


class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    start_time: str
    description: str = ""
    image_url: str = ""
    instagram: str = ""
    website: str = ""
    tickets_url: str = ""
    latitude: float
    longitude: float
    address: str = ""
    checkins: int = 0
    created_by: str = "demo"
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())


class SessionRequest(BaseModel):
    session_id: str


# ----------------------------- Auth -----------------------------
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@api_router.post("/auth/session")
async def create_session(req: SessionRequest):
    async with httpx.AsyncClient(timeout=15) as hc:
        resp = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": req.session_id})
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session id")
    data = resp.json()
    email = data["email"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {
            "name": data.get("name"), "picture": data.get("picture")}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name"),
            "picture": data.get("picture"),
            "created_at": now_utc().isoformat(),
        })
    session_token = data["session_token"]
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": (now_utc() + timedelta(days=7)),
            "created_at": now_utc(),
        }},
        upsert=True,
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user, "session_token": session_token}


@api_router.post("/auth/dev-session")
async def dev_session():
    """Preview-only login for automated testing. Guarded by ALLOW_DEV_LOGIN env."""
    if os.environ.get("ALLOW_DEV_LOGIN", "").lower() != "true":
        raise HTTPException(status_code=404, detail="Not found")
    email = "demo@localloop.app"
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": "Demo Explorer",
            "picture": "", "created_at": now_utc().isoformat(),
        })
    session_token = f"dev_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "session_token": session_token, "user_id": user_id,
        "expires_at": (now_utc() + timedelta(days=7)), "created_at": now_utc(),
    })
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user, "session_token": session_token}


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


# ----------------------------- Events -----------------------------
def with_live_count(doc: dict) -> dict:
    """Add a simulated live-pulse jitter on top of real checkins."""
    base = doc.get("checkins", 0)
    jitter = random.randint(0, 18) + (hash(doc["id"]) % 40)
    doc["live_count"] = base + abs(jitter)
    doc["is_hot"] = doc["live_count"] > 45
    return doc


@api_router.get("/events")
async def list_events(category: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    docs = await db.events.find(query, {"_id": 0}).to_list(1000)
    return [with_live_count(d) for d in docs]


@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    doc = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    return with_live_count(doc)


@api_router.post("/events")
async def create_event(payload: EventCreate, user=Depends(get_current_user)):
    event = Event(**payload.dict(), created_by=user["user_id"])
    await db.events.insert_one(event.dict())
    return with_live_count(event.dict())


@api_router.post("/events/{event_id}/checkin")
async def checkin(event_id: str, user=Depends(get_current_user)):
    doc = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Event not found")
    already = await db.checkins.find_one({"event_id": event_id, "user_id": user["user_id"]})
    if already:
        await db.checkins.delete_one({"event_id": event_id, "user_id": user["user_id"]})
        await db.events.update_one({"id": event_id}, {"$inc": {"checkins": -1}})
        checked_in = False
    else:
        await db.checkins.insert_one({"event_id": event_id, "user_id": user["user_id"], "at": now_utc().isoformat()})
        await db.events.update_one({"id": event_id}, {"$inc": {"checkins": 1}})
        checked_in = True
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    result = with_live_count(updated)
    result["checked_in"] = checked_in
    return result


@api_router.get("/events/{event_id}/checkin-status")
async def checkin_status(event_id: str, user=Depends(get_current_user)):
    already = await db.checkins.find_one({"event_id": event_id, "user_id": user["user_id"]})
    return {"checked_in": bool(already)}


# ----------------------------- Seed -----------------------------
SEED_EVENTS = [
    {
        "title": "Neon Nights Rooftop", "category": "nightlife",
        "description": "The city's hottest rooftop party with resident DJs, skyline views and craft cocktails until sunrise.",
        "image_url": "https://images.unsplash.com/photo-1630395822970-acd6a691d97e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "neonnights.sf", "website": "https://example.com/neon", "tickets_url": "https://example.com/tickets/neon",
        "latitude": 37.7899, "longitude": -122.4014, "address": "Union Square, SF", "checkins": 62,
    },
    {
        "title": "Mission Street Food Fair", "category": "food",
        "description": "40+ local vendors, live grills and global street eats. Come hungry, leave happy.",
        "image_url": "https://images.unsplash.com/photo-1551883738-19ffa3dc4c43?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "missionfoodfair", "website": "https://example.com/food", "tickets_url": "",
        "latitude": 37.7599, "longitude": -122.4148, "address": "Mission District, SF", "checkins": 38,
    },
    {
        "title": "Bay Trail Morning Run", "category": "sports",
        "description": "Community 5K along the waterfront. All paces welcome, coffee after.",
        "image_url": "https://images.unsplash.com/photo-1601564350184-9e93c13df688?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "baytrailrun", "website": "", "tickets_url": "",
        "latitude": 37.8078, "longitude": -122.4177, "address": "Embarcadero, SF", "checkins": 21,
    },
    {
        "title": "Contemporary Art After Dark", "category": "culture",
        "description": "Late-night gallery opening with immersive installations, live music and wine.",
        "image_url": "https://images.unsplash.com/photo-1569783721854-33a99b4c0bae?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "sfmoma", "website": "https://example.com/art", "tickets_url": "https://example.com/tickets/art",
        "latitude": 37.7857, "longitude": -122.4011, "address": "SoMa, SF", "checkins": 44,
    },
    {
        "title": "Warehouse Techno Session", "category": "nightlife",
        "description": "Underground techno, industrial vibes and an all-night lineup of local selectors.",
        "image_url": "https://images.unsplash.com/photo-1630395822970-acd6a691d97e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "warehouse.sf", "website": "", "tickets_url": "https://example.com/tickets/warehouse",
        "latitude": 37.7690, "longitude": -122.4090, "address": "Potrero Hill, SF", "checkins": 55,
    },
    {
        "title": "Taco & Tequila Sunday", "category": "food",
        "description": "Authentic tacos, agave flights and mariachi in the heart of the Mission.",
        "image_url": "https://images.unsplash.com/photo-1551883738-19ffa3dc4c43?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "tacotequila", "website": "https://example.com/taco", "tickets_url": "",
        "latitude": 37.7521, "longitude": -122.4180, "address": "Valencia St, SF", "checkins": 29,
    },
    {
        "title": "Golden Gate Pickup Soccer", "category": "sports",
        "description": "Casual pickup soccer in the park. Bring water, make friends, play hard.",
        "image_url": "https://images.unsplash.com/photo-1601564350184-9e93c13df688?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "ggpsoccer", "website": "", "tickets_url": "",
        "latitude": 37.7694, "longitude": -122.4862, "address": "Golden Gate Park, SF", "checkins": 17,
    },
    {
        "title": "Jazz in the Fillmore", "category": "culture",
        "description": "Intimate live jazz night honoring the Fillmore's legendary music history.",
        "image_url": "https://images.unsplash.com/photo-1569783721854-33a99b4c0bae?crop=entropy&cs=srgb&fm=jpg&q=85",
        "instagram": "fillmorejazz", "website": "https://example.com/jazz", "tickets_url": "https://example.com/tickets/jazz",
        "latitude": 37.7840, "longitude": -122.4330, "address": "Fillmore, SF", "checkins": 33,
    },
]


@app.on_event("startup")
async def seed_and_index():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    count = await db.events.count_documents({})
    if count == 0:
        base = now_utc()
        for i, e in enumerate(SEED_EVENTS):
            ev = Event(**e, start_time=(base + timedelta(days=i, hours=3)).isoformat())
            await db.events.insert_one(ev.dict())
        logger.info("Seeded %d demo events", len(SEED_EVENTS))


@api_router.get("/")
async def root():
    return {"message": "LocalLoop API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
