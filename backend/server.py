from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# --- All other imports after env load ---
import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- Config ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Dentalin API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("dentalin")


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Yetkilendirme gerekli")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Geçersiz token")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Yetkisiz erişim")
        user.pop("password_hash", None)
        user.pop("_id", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Oturum süresi doldu")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class Doctor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    specialty: str
    education: str
    experience_years: int
    bio: str
    image_url: str
    certifications: List[str] = []
    order: int = 0
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class DoctorIn(BaseModel):
    name: str
    title: str
    specialty: str
    education: str
    experience_years: int
    bio: str
    image_url: str
    certifications: List[str] = []
    order: int = 0
    active: bool = True


class Treatment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    short_desc: str
    long_desc: str
    duration: str
    benefits: List[str] = []
    image_url: str
    featured: bool = False
    order: int = 0
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class TreatmentIn(BaseModel):
    slug: str
    name: str
    short_desc: str
    long_desc: str
    duration: str
    benefits: List[str] = []
    image_url: str
    featured: bool = False
    order: int = 0
    active: bool = True


class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    location: str = "Batman"
    rating: int = 5
    text: str
    treatment: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    approved: bool = True
    created_at: str = Field(default_factory=now_iso)


class TestimonialIn(BaseModel):
    patient_name: str
    location: str = "Batman"
    rating: int = 5
    text: str
    treatment: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    approved: bool = True


class BeforeAfter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: Literal["implant", "ortodonti", "gulus_tasarimi", "beyazlatma"]
    before_url: str
    after_url: str
    description: str = ""
    # Case study fields
    patient_name: Optional[str] = None  # e.g., "Ahmet K."
    patient_age: Optional[int] = None
    problem: Optional[str] = None
    treatment_duration: Optional[str] = None
    doctor_name: Optional[str] = None
    result_summary: Optional[str] = None
    patient_quote: Optional[str] = None
    is_representative: bool = True  # true => "temsili klinik vaka"
    sessions: Optional[str] = None
    order: int = 0
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class BeforeAfterIn(BaseModel):
    title: str
    category: Literal["implant", "ortodonti", "gulus_tasarimi", "beyazlatma"]
    before_url: str
    after_url: str
    description: str = ""
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    problem: Optional[str] = None
    treatment_duration: Optional[str] = None
    doctor_name: Optional[str] = None
    result_summary: Optional[str] = None
    patient_quote: Optional[str] = None
    is_representative: bool = True
    sessions: Optional[str] = None
    order: int = 0
    active: bool = True


class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0
    active: bool = True


class FAQIn(BaseModel):
    question: str
    answer: str
    order: int = 0
    active: bool = True


class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    treatment_slug: str
    treatment_name: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = None
    status: Literal["pending", "confirmed", "completed", "cancelled"] = "pending"
    source: str = "website"
    created_at: str = Field(default_factory=now_iso)


class AppointmentIn(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    treatment_slug: str
    treatment_name: str
    preferred_date: str
    preferred_time: str
    notes: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "completed", "cancelled"]


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    message: Optional[str] = None
    interest: Optional[str] = None
    source: str = "website"
    quiz_answers: Optional[dict] = None
    quiz_recommendation: Optional[str] = None
    status: Literal["new", "contacted", "converted", "lost"] = "new"
    created_at: str = Field(default_factory=now_iso)


class LeadIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    message: Optional[str] = None
    interest: Optional[str] = None
    source: str = "website"
    quiz_answers: Optional[dict] = None
    quiz_recommendation: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status: Literal["new", "contacted", "converted", "lost"]


class QuizIn(BaseModel):
    answers: dict
    name: Optional[str] = None
    phone: Optional[str] = None


class InteractionIn(BaseModel):
    treatment_slug: str
    type: Literal["wa_click", "appointment_open", "appointment_complete", "card_view"] = "wa_click"


# ---------- Auth ----------
@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=12 * 3600,
        path="/",
    )
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]},
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me", response_model=UserOut)
async def me(admin: dict = Depends(get_current_admin)):
    return UserOut(**admin)


# ---------- Public ----------
@api.get("/public/doctors")
async def public_doctors():
    return await db.doctors.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)


@api.get("/public/treatments")
async def public_treatments():
    return await db.treatments.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)


@api.get("/public/testimonials")
async def public_testimonials():
    return await db.testimonials.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api.get("/public/before-after")
async def public_before_after(category: Optional[str] = None):
    q = {"active": True}
    if category and category != "all":
        q["category"] = category
    return await db.before_after.find(q, {"_id": 0}).sort("order", 1).to_list(100)


@api.get("/public/faqs")
async def public_faqs():
    return await db.faqs.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)


@api.get("/public/clinic-info")
async def clinic_info():
    return {
        "name": "Dentalin Ağız ve Diş Sağlığı Merkezi",
        "address": "Ziya Gökalp Mahallesi, Turgut Özal Bulvarı No:5, Batman Merkez",
        "phone": os.environ.get("CLINIC_PHONE", "04882125556"),
        "phone_display": "0488 212 55 56",
        "whatsapp": os.environ.get("CLINIC_WHATSAPP", "904882125556"),
        "email": "info@dentalin.com",
        "hours": {"hafta_ici": "09:00 - 19:00", "cumartesi": "09:00 - 17:00", "pazar": "Kapalı"},
        "maps_query": "Dentalin Diş Batman Ziya Gökalp Turgut Özal Bulvarı No:5",
    }


@api.post("/public/appointments", response_model=Appointment)
async def create_appointment(payload: AppointmentIn):
    apt = Appointment(**payload.model_dump())
    await db.appointments.insert_one(apt.model_dump())
    lead = Lead(
        name=apt.name, phone=apt.phone, email=apt.email,
        interest=apt.treatment_name, source="appointment_form", message=apt.notes,
    )
    await db.leads.insert_one(lead.model_dump())
    return apt


@api.post("/public/leads", response_model=Lead)
async def create_lead(payload: LeadIn):
    lead = Lead(**payload.model_dump())
    await db.leads.insert_one(lead.model_dump())
    return lead


@api.post("/public/quiz")
async def quiz(payload: QuizIn):
    a = payload.answers or {}
    scores = {"implant": 0, "ortodonti": 0, "gulus_tasarimi": 0, "beyazlatma": 0}
    if a.get("missing_tooth"):
        scores["implant"] += 3
    if a.get("crooked_teeth"):
        scores["ortodonti"] += 3
    if a.get("aesthetic"):
        scores["gulus_tasarimi"] += 2
    if a.get("yellowing"):
        scores["beyazlatma"] += 3
    if a.get("damaged_old_filling"):
        scores["gulus_tasarimi"] += 1
    if a.get("gum_problem"):
        scores["implant"] += 1
    recommendation = max(scores, key=scores.get)
    if all(v == 0 for v in scores.values()):
        recommendation = "gulus_tasarimi"
    tr_names = {
        "implant": "İmplant Tedavisi",
        "ortodonti": "Ortodonti",
        "gulus_tasarimi": "Gülüş Tasarımı",
        "beyazlatma": "Diş Beyazlatma",
    }
    if payload.name or payload.phone:
        lead = Lead(
            name=payload.name, phone=payload.phone, interest=tr_names[recommendation],
            source="ai_quiz", quiz_answers=a, quiz_recommendation=recommendation,
        )
        await db.leads.insert_one(lead.model_dump())
    return {
        "recommendation": recommendation,
        "recommendation_name": tr_names[recommendation],
        "scores": scores,
    }


def _today_start_iso() -> str:
    now = datetime.now(timezone.utc)
    return datetime(now.year, now.month, now.day, tzinfo=timezone.utc).isoformat()


@api.post("/public/track")
async def track_interaction(payload: InteractionIn, request: Request):
    ip = request.client.host if request.client else ""
    ua = request.headers.get("user-agent", "")
    ip_hash = str(hash(f"{ip}|{ua}"))[:16]
    doc = {
        "id": str(uuid.uuid4()),
        "treatment_slug": payload.treatment_slug,
        "type": payload.type,
        "ip_hash": ip_hash,
        "created_at": now_iso(),
    }
    await db.interactions.insert_one(doc)
    return {"ok": True}


@api.get("/public/social-proof")
async def social_proof():
    """Real counts: distinct visitors who interacted with each treatment today."""
    start = _today_start_iso()
    pipeline = [
        {"$match": {"created_at": {"$gte": start}}},
        {"$group": {
            "_id": {"slug": "$treatment_slug", "ip": "$ip_hash"},
        }},
        {"$group": {
            "_id": "$_id.slug",
            "count": {"$sum": 1},
        }},
    ]
    out = {}
    async for row in db.interactions.aggregate(pipeline):
        out[row["_id"]] = row["count"]
    return {"counts": out, "as_of": now_iso()}


# ---------- Admin Stats ----------
@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    return {
        "appointments": {
            "total": await db.appointments.count_documents({}),
            "pending": await db.appointments.count_documents({"status": "pending"}),
            "confirmed": await db.appointments.count_documents({"status": "confirmed"}),
            "completed": await db.appointments.count_documents({"status": "completed"}),
            "last_7_days": await db.appointments.count_documents({"created_at": {"$gte": week_ago}}),
        },
        "leads": {
            "total": await db.leads.count_documents({}),
            "new": await db.leads.count_documents({"status": "new"}),
            "converted": await db.leads.count_documents({"status": "converted"}),
        },
        "doctors": await db.doctors.count_documents({"active": True}),
        "treatments": await db.treatments.count_documents({"active": True}),
    }


# ---------- Admin: Appointments ----------
@api.get("/admin/appointments")
async def list_appointments(admin: dict = Depends(get_current_admin), status_filter: Optional[str] = None):
    q = {}
    if status_filter and status_filter != "all":
        q["status"] = status_filter
    return await db.appointments.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/appointments/{apt_id}")
async def update_appointment(apt_id: str, payload: AppointmentStatusUpdate, admin: dict = Depends(get_current_admin)):
    res = await db.appointments.update_one({"id": apt_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Randevu bulunamadı")
    return {"ok": True}


@api.delete("/admin/appointments/{apt_id}")
async def delete_appointment(apt_id: str, admin: dict = Depends(get_current_admin)):
    await db.appointments.delete_one({"id": apt_id})
    return {"ok": True}


# ---------- Admin: Leads ----------
@api.get("/admin/leads")
async def list_leads(admin: dict = Depends(get_current_admin)):
    return await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/leads/{lead_id}")
async def update_lead(lead_id: str, payload: LeadStatusUpdate, admin: dict = Depends(get_current_admin)):
    res = await db.leads.update_one({"id": lead_id}, {"$set": {"status": payload.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead bulunamadı")
    return {"ok": True}


@api.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, admin: dict = Depends(get_current_admin)):
    await db.leads.delete_one({"id": lead_id})
    return {"ok": True}


# ---------- Admin: Doctors ----------
@api.get("/admin/doctors")
async def admin_doctors(admin: dict = Depends(get_current_admin)):
    return await db.doctors.find({}, {"_id": 0}).sort("order", 1).to_list(200)


@api.post("/admin/doctors", response_model=Doctor)
async def create_doctor(payload: DoctorIn, admin: dict = Depends(get_current_admin)):
    doc = Doctor(**payload.model_dump())
    await db.doctors.insert_one(doc.model_dump())
    return doc


@api.patch("/admin/doctors/{doc_id}")
async def update_doctor(doc_id: str, payload: DoctorIn, admin: dict = Depends(get_current_admin)):
    res = await db.doctors.update_one({"id": doc_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Doktor bulunamadı")
    return {"ok": True}


@api.delete("/admin/doctors/{doc_id}")
async def delete_doctor(doc_id: str, admin: dict = Depends(get_current_admin)):
    await db.doctors.delete_one({"id": doc_id})
    return {"ok": True}


# ---------- Admin: Treatments ----------
@api.get("/admin/treatments")
async def admin_treatments(admin: dict = Depends(get_current_admin)):
    return await db.treatments.find({}, {"_id": 0}).sort("order", 1).to_list(200)


@api.post("/admin/treatments", response_model=Treatment)
async def create_treatment(payload: TreatmentIn, admin: dict = Depends(get_current_admin)):
    doc = Treatment(**payload.model_dump())
    await db.treatments.insert_one(doc.model_dump())
    return doc


@api.patch("/admin/treatments/{t_id}")
async def update_treatment(t_id: str, payload: TreatmentIn, admin: dict = Depends(get_current_admin)):
    res = await db.treatments.update_one({"id": t_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tedavi bulunamadı")
    return {"ok": True}


@api.delete("/admin/treatments/{t_id}")
async def delete_treatment(t_id: str, admin: dict = Depends(get_current_admin)):
    await db.treatments.delete_one({"id": t_id})
    return {"ok": True}


# ---------- Admin: Testimonials ----------
@api.get("/admin/testimonials")
async def admin_testimonials(admin: dict = Depends(get_current_admin)):
    return await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/testimonials", response_model=Testimonial)
async def create_testimonial(payload: TestimonialIn, admin: dict = Depends(get_current_admin)):
    doc = Testimonial(**payload.model_dump())
    await db.testimonials.insert_one(doc.model_dump())
    return doc


@api.patch("/admin/testimonials/{t_id}")
async def update_testimonial(t_id: str, payload: TestimonialIn, admin: dict = Depends(get_current_admin)):
    res = await db.testimonials.update_one({"id": t_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    return {"ok": True}


@api.delete("/admin/testimonials/{t_id}")
async def delete_testimonial(t_id: str, admin: dict = Depends(get_current_admin)):
    await db.testimonials.delete_one({"id": t_id})
    return {"ok": True}


# ---------- Admin: Before/After ----------
@api.get("/admin/before-after")
async def admin_before_after(admin: dict = Depends(get_current_admin)):
    return await db.before_after.find({}, {"_id": 0}).sort("order", 1).to_list(200)


@api.post("/admin/before-after", response_model=BeforeAfter)
async def create_before_after(payload: BeforeAfterIn, admin: dict = Depends(get_current_admin)):
    doc = BeforeAfter(**payload.model_dump())
    await db.before_after.insert_one(doc.model_dump())
    return doc


@api.delete("/admin/before-after/{ba_id}")
async def delete_before_after(ba_id: str, admin: dict = Depends(get_current_admin)):
    await db.before_after.delete_one({"id": ba_id})
    return {"ok": True}


# ---------- Admin: FAQ ----------
@api.get("/admin/faqs")
async def admin_faqs(admin: dict = Depends(get_current_admin)):
    return await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(200)


@api.post("/admin/faqs", response_model=FAQ)
async def create_faq(payload: FAQIn, admin: dict = Depends(get_current_admin)):
    doc = FAQ(**payload.model_dump())
    await db.faqs.insert_one(doc.model_dump())
    return doc


@api.patch("/admin/faqs/{f_id}")
async def update_faq(f_id: str, payload: FAQIn, admin: dict = Depends(get_current_admin)):
    res = await db.faqs.update_one({"id": f_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="SSS bulunamadı")
    return {"ok": True}


@api.delete("/admin/faqs/{f_id}")
async def delete_faq(f_id: str, admin: dict = Depends(get_current_admin)):
    await db.faqs.delete_one({"id": f_id})
    return {"ok": True}


@api.get("/")
async def root():
    return {"name": "Dentalin API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Seed ----------
async def seed():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@dentalin.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "dentalin2026")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Dentalin Yönetici",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": now_iso(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Admin password updated to match .env")

    if await db.treatments.count_documents({}) == 0:
        treatments = [
            {"slug": "implant", "name": "İmplant Tedavisi",
             "short_desc": "Eksik dişleriniz için kalıcı, doğal görünümlü çözüm",
             "long_desc": "Titanyum implantlar ile kayıp dişlerinizi yerine koyuyor, çiğneme fonksiyonunuzu ve estetiğinizi geri kazandırıyoruz.",
             "duration": "2-6 ay",
             "benefits": ["Ömür boyu kullanım", "Doğal görünüm", "Komşu dişlere zarar vermez", "Çiğneme konforu"],
             "image_url": "https://images.pexels.com/photos/5355921/pexels-photo-5355921.jpeg",
             "featured": True, "order": 1},
            {"slug": "ortodonti", "name": "Ortodonti",
             "short_desc": "Şeffaf plak ve modern braketlerle düzgün diş dizilimi",
             "long_desc": "Çapraşık dişler, kapanış bozuklukları ve estetik problemleriniz için yetişkin ve çocuk ortodonti tedavisi.",
             "duration": "6-24 ay",
             "benefits": ["Şeffaf plak seçeneği", "Estetik braketler", "Kontrollü tedavi planı", "Yetişkin ortodontisi"],
             "image_url": "https://images.unsplash.com/photo-1667133295315-820bb6481730?crop=entropy&cs=srgb&fm=jpg",
             "featured": True, "order": 2},
            {"slug": "gulus_tasarimi", "name": "Gülüş Tasarımı",
             "short_desc": "Yüzünüze özel, doğal ve estetik gülüş",
             "long_desc": "Dijital gülüş tasarımı ile yüz hatlarınıza uygun, doğal görünümlü estetik bir gülüşe kavuşun.",
             "duration": "1-3 hafta",
             "benefits": ["Dijital önizleme", "Lamine veneer", "Hızlı sonuç", "Kişiye özel tasarım"],
             "image_url": "https://images.pexels.com/photos/11928561/pexels-photo-11928561.jpeg",
             "featured": True, "order": 3},
            {"slug": "beyazlatma", "name": "Diş Beyazlatma",
             "short_desc": "Tek seansta birkaç ton daha beyaz dişler",
             "long_desc": "Profesyonel klinik beyazlatma uygulamamız ile dişlerinizdeki sarılığı ve lekeleri güvenli şekilde gideriyoruz.",
             "duration": "1 seans",
             "benefits": ["Tek seans sonuç", "Güvenli formül", "Hassasiyet yapmaz", "Uzun süreli etki"],
             "image_url": "https://images.unsplash.com/photo-1677026010083-78ec7f1b84ed?crop=entropy&cs=srgb&fm=jpg",
             "featured": True, "order": 4},
            {"slug": "zirkonyum-kaplama", "name": "Zirkonyum Kaplama",
             "short_desc": "Metalsiz, doğal görünümlü estetik kaplama",
             "long_desc": "Zirkonyum kaplamalarımız ile dişlerinize ışık geçirgenliği ve doğal estetik kazandırıyoruz.",
             "duration": "5-7 gün",
             "benefits": ["Metal içermez", "Alerji yapmaz", "Doğal renk", "Uzun ömürlü"],
             "image_url": "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?crop=entropy&cs=srgb&fm=jpg",
             "featured": False, "order": 5},
            {"slug": "kanal-tedavisi", "name": "Kanal Tedavisi",
             "short_desc": "Ağrısız ve modern endodonti uygulaması",
             "long_desc": "Hasarlı dişlerinizi çekmeden kurtaran modern kanal tedavisi yöntemlerimiz.",
             "duration": "1-2 seans",
             "benefits": ["Ağrısız", "Diş çekiminden kurtarır", "Hızlı işlem", "Modern cihazlar"],
             "image_url": "https://images.unsplash.com/photo-1588776814546-daab30f310ce?crop=entropy&cs=srgb&fm=jpg",
             "featured": False, "order": 6},
        ]
        for t in treatments:
            await db.treatments.insert_one(Treatment(**t).model_dump())
        logger.info("Treatments seeded")

    if await db.doctors.count_documents({}) == 0:
        doctors = [
            {"name": "Dr. Mehmet Yılmaz", "title": "Uzm. Dt.",
             "specialty": "İmplantoloji & Cerrahi",
             "education": "Hacettepe Üniversitesi Diş Hekimliği Fakültesi",
             "experience_years": 14,
             "bio": "İmplant cerrahisi ve estetik diş hekimliği alanında 14 yılı aşkın deneyime sahip. ITI ve EAO üyesi.",
             "image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=srgb&fm=jpg",
             "certifications": ["ITI Member", "EAO Sertifikalı", "All-on-4 Eğitimli"], "order": 1},
            {"name": "Dr. Ayşe Kaya", "title": "Uzm. Dt.",
             "specialty": "Ortodonti Uzmanı",
             "education": "Ankara Üniversitesi Diş Hekimliği Fakültesi",
             "experience_years": 11,
             "bio": "Şeffaf plak ortodontisi ve yetişkin tedavilerinde uzmanlaşmış. Invisalign ve Damon System sertifikalı.",
             "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?crop=entropy&cs=srgb&fm=jpg",
             "certifications": ["Invisalign Provider", "Damon System", "Türk Ortodonti Derneği"], "order": 2},
            {"name": "Dr. Selin Demir", "title": "Dt.",
             "specialty": "Estetik & Gülüş Tasarımı",
             "education": "Ege Üniversitesi Diş Hekimliği Fakültesi",
             "experience_years": 9,
             "bio": "Dijital gülüş tasarımı ve lamine veneer uygulamalarında deneyimli. DSD eğitimli.",
             "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=srgb&fm=jpg",
             "certifications": ["DSD Master", "Lamine Veneer Eğitimi", "Estetik Diş Hekimliği"], "order": 3},
            {"name": "Dr. Burak Aslan", "title": "Dt.",
             "specialty": "Genel Diş Hekimliği & Endodonti",
             "education": "İstanbul Üniversitesi Diş Hekimliği Fakültesi",
             "experience_years": 7,
             "bio": "Kanal tedavisi ve restoratif diş hekimliği alanında deneyimli. Hasta odaklı yaklaşımı ile tanınır.",
             "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?crop=entropy&cs=srgb&fm=jpg",
             "certifications": ["Endodonti Sertifikası", "Lazer Tedavisi"], "order": 4},
        ]
        for d in doctors:
            await db.doctors.insert_one(Doctor(**d).model_dump())
        logger.info("Doctors seeded")

    if await db.testimonials.count_documents({}) == 0:
        items = [
            {"patient_name": "Fatma A.", "text": "İmplant tedavim çok başarılı geçti, ekip profesyonel ve güler yüzlü. Batman'da bu kalite gerçekten fark yaratıyor.", "treatment": "İmplant Tedavisi"},
            {"patient_name": "Mustafa K.", "text": "Çocuğumun ortodonti tedavisi için tercih ettik. Dr. Ayşe Hanım'ın ilgisi ve klinik hijyeni mükemmel.", "treatment": "Ortodonti"},
            {"patient_name": "Zeynep Y.", "text": "Gülüş tasarımı sonrası özgüvenim arttı. Dijital önizleme sayesinde tedavi öncesi sonucu görmek harikaydı.", "treatment": "Gülüş Tasarımı"},
            {"patient_name": "Halil İ.", "text": "Yıllardır gittiğim klinikler arasında en modern olanı. Beyazlatma sonucu beklediğimin üstündeydi.", "treatment": "Diş Beyazlatma"},
            {"patient_name": "Esra D.", "text": "Randevu sistemi pratik, klinik temiz ve modern. Tüm ekibe çok teşekkür ederim.", "treatment": "Genel Tedavi"},
            {"patient_name": "Ahmet Ş.", "text": "Diş ağrım için akşam saatinde aradım, ertesi gün randevu verdiler. Çok hızlı ve profesyonel.", "treatment": "Kanal Tedavisi"},
        ]
        for t in items:
            await db.testimonials.insert_one(Testimonial(**t).model_dump())
        logger.info("Testimonials seeded")

    if await db.before_after.count_documents({}) == 0:
        ba_items = [
            {
                "title": "Ön Diş İmplant Vakası",
                "category": "implant",
                "before_url": "https://images.unsplash.com/photo-1620331311520-246422fd82f9?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.unsplash.com/photo-1581585504919-2dfa90b3b9ce?crop=entropy&cs=srgb&fm=jpg&q=85",
                "description": "Travma sonrası kaybedilen ön diş, implant ile yeniden kazandırıldı.",
                "patient_name": "Ahmet K.",
                "patient_age": 34,
                "problem": "Spor kazası sonrası kırılan ön diş ve estetik kayıp",
                "treatment_duration": "5 gün",
                "doctor_name": "Dr. Mehmet Yılmaz",
                "result_summary": "Doğal görünümlü, fonksiyonel ön diş restorasyonu",
                "patient_quote": "Artık fotoğraflarda gülümsemekten çekinmiyorum.",
                "is_representative": True,
                "sessions": "2 seans",
                "order": 1,
            },
            {
                "title": "All-on-4 Tam Çene İmplant",
                "category": "implant",
                "before_url": "https://images.unsplash.com/photo-1588776814546-daab30f310ce?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.pexels.com/photos/5355921/pexels-photo-5355921.jpeg",
                "description": "Tam dişsiz alt çenede All-on-4 implant uygulaması.",
                "patient_name": "Hasan B.",
                "patient_age": 58,
                "problem": "Tam dişsizlik ve hareketli protez konforsuzluğu",
                "treatment_duration": "3 ay",
                "doctor_name": "Dr. Mehmet Yılmaz",
                "result_summary": "Sabit ve konforlu çiğneme fonksiyonu",
                "patient_quote": "Yıllar sonra tekrar normal yemek yiyebiliyorum.",
                "is_representative": True,
                "sessions": "4 seans + iyileşme",
                "order": 2,
            },
            {
                "title": "Yetişkin Şeffaf Plak Ortodonti",
                "category": "ortodonti",
                "before_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.unsplash.com/photo-1581585504919-2dfa90b3b9ce?crop=entropy&cs=srgb&fm=jpg&q=85",
                "description": "Yetişkin hasta için şeffaf plak ile çapraşıklık tedavisi.",
                "patient_name": "Zeynep Y.",
                "patient_age": 27,
                "problem": "Ön bölgede çapraşıklık ve dudaktan görünür düzensiz dişler",
                "treatment_duration": "14 ay",
                "doctor_name": "Dr. Ayşe Kaya",
                "result_summary": "Düzgün, simetrik diş dizilimi",
                "patient_quote": "Braket olmadan tedavi olabilmek hayat kurtardı.",
                "is_representative": True,
                "sessions": "Aylık kontroller",
                "order": 3,
            },
            {
                "title": "Çocuk Ortodonti — Erken Müdahale",
                "category": "ortodonti",
                "before_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.unsplash.com/photo-1667133295315-820bb6481730?crop=entropy&cs=srgb&fm=jpg&q=85",
                "description": "11 yaş hastada gelişimsel ortodonti müdahalesi.",
                "patient_name": "Elif D.",
                "patient_age": 11,
                "problem": "Üst çene darlığı ve çapraz kapanış",
                "treatment_duration": "10 ay",
                "doctor_name": "Dr. Ayşe Kaya",
                "result_summary": "Doğru kapanış ve daha sağlıklı gelişim",
                "patient_quote": "Anne: Kızımın özgüveni çok arttı.",
                "is_representative": True,
                "sessions": "Aylık kontroller",
                "order": 4,
            },
            {
                "title": "Dijital Gülüş Tasarımı (Lamine Veneer)",
                "category": "gulus_tasarimi",
                "before_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.pexels.com/photos/11928561/pexels-photo-11928561.jpeg",
                "description": "Üst çenede 8 diş lamine veneer ile estetik dönüşüm.",
                "patient_name": "Selin A.",
                "patient_age": 31,
                "problem": "Renk değişikliği, asimetrik diş kenarları, gülüş hattı uyumsuzluğu",
                "treatment_duration": "10 gün",
                "doctor_name": "Dr. Selin Demir",
                "result_summary": "Doğal görünümlü, simetrik ve aydınlık gülüş",
                "patient_quote": "Sonucu daha tedavi başlamadan dijital olarak gördüm, harikaydı.",
                "is_representative": True,
                "sessions": "3 seans",
                "order": 5,
            },
            {
                "title": "Düğün Öncesi Gülüş Tasarımı",
                "category": "gulus_tasarimi",
                "before_url": "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.unsplash.com/photo-1677026010083-78ec7f1b84ed?crop=entropy&cs=srgb&fm=jpg&q=85",
                "description": "Düğün öncesi hızlı estetik dönüşüm planı.",
                "patient_name": "Merve K.",
                "patient_age": 28,
                "problem": "Düğün fotoğrafları öncesi diş rengi ve form düzensizliği",
                "treatment_duration": "2 hafta",
                "doctor_name": "Dr. Selin Demir",
                "result_summary": "Düğün gününe yetişen ışıltılı, doğal gülüş",
                "patient_quote": "Düğünümde tüm fotoğraflarda mutlu gülümsedim.",
                "is_representative": True,
                "sessions": "4 seans",
                "order": 6,
            },
            {
                "title": "Tek Seans Klinik Beyazlatma",
                "category": "beyazlatma",
                "before_url": "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.unsplash.com/photo-1677026010083-78ec7f1b84ed?crop=entropy&cs=srgb&fm=jpg&q=85",
                "description": "Lekeli dişlerde tek seans klinik tipi profesyonel beyazlatma.",
                "patient_name": "Burak T.",
                "patient_age": 36,
                "problem": "Kahve, çay tüketimine bağlı yoğun yüzey lekeleri",
                "treatment_duration": "1 seans (45 dk)",
                "doctor_name": "Dr. Burak Aslan",
                "result_summary": "5 ton daha beyaz, doğal görünümlü diş rengi",
                "patient_quote": "45 dakikada bu kadar değişeceğine inanmamıştım.",
                "is_representative": True,
                "sessions": "1 seans",
                "order": 7,
            },
            {
                "title": "Kombine Beyazlatma + Veneer",
                "category": "beyazlatma",
                "before_url": "https://images.unsplash.com/photo-1620331311520-246422fd82f9?crop=entropy&cs=srgb&fm=jpg&q=85",
                "after_url": "https://images.unsplash.com/photo-1677026010083-78ec7f1b84ed?crop=entropy&cs=srgb&fm=jpg&q=85",
                "description": "Tetrasiklin lekelerine kombine yaklaşım.",
                "patient_name": "Derya M.",
                "patient_age": 42,
                "problem": "Antibiyotiğe bağlı tetrasiklin lekeleri",
                "treatment_duration": "3 hafta",
                "doctor_name": "Dr. Selin Demir",
                "result_summary": "Yıllardır gizlemeye çalıştığı dişler artık doğal beyaz",
                "patient_quote": "İlk kez utanmadan gülümsüyorum.",
                "is_representative": True,
                "sessions": "5 seans",
                "order": 8,
            },
        ]
        for b in ba_items:
            await db.before_after.insert_one(BeforeAfter(**b).model_dump())
        logger.info("Before/After case studies seeded")

    if await db.faqs.count_documents({}) == 0:
        faqs = [
            {"question": "İmplant tedavisi ağrılı mıdır?", "answer": "Hayır. Lokal anestezi altında uygulanan işlem ağrısızdır. Tedavi sonrası hafif bir hassasiyet olabilir, reçete edilen ilaçlarla kolayca yönetilebilir.", "order": 1},
            {"question": "Ortodonti tedavisi ne kadar sürer?", "answer": "Vakanın karmaşıklığına bağlı olarak 6 ay ile 24 ay arasında değişir. İlk muayenede size kişiye özel net bir süre planı sunuyoruz.", "order": 2},
            {"question": "Tedavi ücretleri nasıl belirlenir?", "answer": "Detaylı muayene, dijital röntgen ve ihtiyaçlarınıza göre kişiselleştirilmiş tedavi planına göre belirlenir. İlk muayene ve fiyat danışmanlığımız ücretsizdir.", "order": 3},
            {"question": "Taksit imkanı var mı?", "answer": "Evet. Tüm kredi kartlarına 12 aya varan taksit ve klinik içi ödeme planı seçeneklerimiz bulunmaktadır.", "order": 4},
            {"question": "Tedavi kaç seansta tamamlanır?", "answer": "Tedavi türüne göre değişir. Beyazlatma genelde tek seans, gülüş tasarımı 2-3 seans, implant ise iyileşme süreciyle birlikte 2-6 ay sürer.", "order": 5},
            {"question": "Çocuğum için ortodonti tedavisi yaptırabilir miyim?", "answer": "7 yaşından itibaren ortodontik kontrol yapılmasını öneriyoruz. Çocuklara özel koruyucu ortodontik uygulamalarımız mevcuttur.", "order": 6},
        ]
        for f in faqs:
            await db.faqs.insert_one(FAQ(**f).model_dump())
        logger.info("FAQs seeded")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.doctors.create_index("order")
    await db.treatments.create_index("slug", unique=True)
    await db.appointments.create_index("created_at")
    await db.leads.create_index("created_at")
    await db.interactions.create_index("created_at")
    await db.interactions.create_index([("treatment_slug", 1), ("created_at", -1)])
    await seed()
    logger.info("Dentalin API started")


@app.on_event("shutdown")
async def shutdown():
    client.close()
