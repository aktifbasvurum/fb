from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    balance_tl: float = 0.0
    role: str = "user"  # user or admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Account(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    cookie_data: str  # JSON string of cookies
    price_tl: float
    status: str = "available"  # available, sold
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PurchasedAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    account_id: str
    account_data: dict  # Full account info including cookies
    purchase_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_email: str
    amount_usdt: float
    amount_tl: float
    wallet_address: str
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None

# ============= INPUT MODELS =============
class RegisterInput(BaseModel):
    email: EmailStr
    password: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class PaymentRequestInput(BaseModel):
    amount_usdt: float
    wallet_address: str

class PurchaseInput(BaseModel):
    category_id: str
    quantity: int

class CategoryInput(BaseModel):
    name: str

class AccountInput(BaseModel):
    category_id: str
    cookie_data: str
    price_tl: float

class AdminLoginInput(BaseModel):
    username: str
    password: str

# ============= HELPER FUNCTIONS =============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def get_usdt_to_tl_rate() -> float:
    """Fetch real-time USDT to TL exchange rate"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.exchangerate-api.com/v4/latest/USD")
            data = response.json()
            return data['rates'].get('TRY', 34.5)  # Fallback to ~34.5 if API fails
    except:
        return 34.5  # Default fallback rate

# ============= AUTH ROUTES =============
@api_router.post("/auth/register")
async def register(input: RegisterInput):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=input.email,
        password_hash=hash_password(input.password)
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create token
    token = create_token({"sub": user.id, "email": user.email, "role": user.role})
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "balance_tl": user.balance_tl,
            "role": user.role
        }
    }

@api_router.post("/auth/login")
async def login(input: LoginInput):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(input.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    token = create_token({"sub": user.id, "email": user.email, "role": user.role})
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "balance_tl": user.balance_tl,
            "role": user.role
        }
    }

@api_router.get("/user/profile")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "balance_tl": user.balance_tl,
        "role": user.role
    }

# ============= PAYMENT ROUTES =============
@api_router.post("/payment/request")
async def create_payment_request(input: PaymentRequestInput, user: User = Depends(get_current_user)):
    # Get current USDT to TL rate
    rate = await get_usdt_to_tl_rate()
    amount_tl = input.amount_usdt * rate
    
    payment = PaymentRequest(
        user_id=user.id,
        user_email=user.email,
        amount_usdt=input.amount_usdt,
        amount_tl=amount_tl,
        wallet_address=input.wallet_address
    )
    
    doc = payment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.payment_requests.insert_one(doc)
    
    return {"message": "Payment request submitted", "payment": payment}

@api_router.get("/payment/my-requests")
async def get_my_payment_requests(user: User = Depends(get_current_user)):
    requests = await db.payment_requests.find({"user_id": user.id}, {"_id": 0}).to_list(100)
    return requests

@api_router.get("/payment/wallet-address")
async def get_wallet_address():
    # Admin sets this in env or returns from settings collection
    wallet = await db.settings.find_one({"key": "admin_wallet_address"}, {"_id": 0})
    if wallet:
        return {"wallet_address": wallet.get('value', '')}
    return {"wallet_address": ""}

# ============= CATEGORY ROUTES =============
@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    # Add available account count for each category
    for cat in categories:
        count = await db.accounts.count_documents({"category_id": cat['id'], "status": "available"})
        cat['available_count'] = count
    return categories

# ============= ACCOUNT ROUTES =============
@api_router.get("/accounts/available/{category_id}")
async def get_available_accounts(category_id: str):
    # Get category
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Count available accounts
    count = await db.accounts.count_documents({"category_id": category_id, "status": "available"})
    
    # Get price (use first available account's price)
    account = await db.accounts.find_one({"category_id": category_id, "status": "available"}, {"_id": 0})
    price = account.get('price_tl', 0) if account else 0
    
    return {
        "category_id": category_id,
        "category_name": category['name'],
        "available_count": count,
        "price_per_account": price
    }

@api_router.post("/accounts/purchase")
async def purchase_accounts(input: PurchaseInput, user: User = Depends(get_current_user)):
    # Get available accounts
    accounts = await db.accounts.find(
        {"category_id": input.category_id, "status": "available"},
        {"_id": 0}
    ).limit(input.quantity).to_list(input.quantity)
    
    if len(accounts) < input.quantity:
        raise HTTPException(status_code=400, detail=f"Only {len(accounts)} accounts available")
    
    # Calculate total price
    total_price = sum(acc['price_tl'] for acc in accounts)
    
    # Check user balance
    if user.balance_tl < total_price:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Deduct balance
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"balance_tl": user.balance_tl - total_price}}
    )
    
    # Mark accounts as sold and create purchased accounts
    purchased = []
    for account in accounts:
        # Mark as sold
        await db.accounts.update_one(
            {"id": account['id']},
            {"$set": {"status": "sold"}}
        )
        
        # Create purchased account
        purchased_account = PurchasedAccount(
            user_id=user.id,
            account_id=account['id'],
            account_data=account
        )
        
        doc = purchased_account.model_dump()
        doc['purchase_date'] = doc['purchase_date'].isoformat()
        await db.purchased_accounts.insert_one(doc)
        purchased.append(purchased_account)
    
    return {
        "message": f"Successfully purchased {input.quantity} accounts",
        "total_paid": total_price,
        "new_balance": user.balance_tl - total_price
    }

@api_router.get("/accounts/my-accounts")
async def get_my_accounts(user: User = Depends(get_current_user)):
    accounts = await db.purchased_accounts.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return accounts

@api_router.delete("/accounts/{account_id}")
async def delete_account(account_id: str, user: User = Depends(get_current_user)):
    # Find purchased account
    account = await db.purchased_accounts.find_one({"account_id": account_id, "user_id": user.id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Delete from purchased accounts
    await db.purchased_accounts.delete_one({"account_id": account_id, "user_id": user.id})
    
    return {"message": "Account deleted permanently"}

# ============= ADMIN ROUTES =============
@api_router.post("/admin/login")
async def admin_login(input: AdminLoginInput):
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if input.username != admin_username or input.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # Create admin user if not exists
    admin_user = await db.users.find_one({"email": "admin@platform.com"}, {"_id": 0})
    if not admin_user:
        admin = User(
            id="admin-" + str(uuid.uuid4()),
            email="admin@platform.com",
            password_hash=hash_password(admin_password),
            role="admin"
        )
        doc = admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        admin_user = doc
    
    token = create_token({"sub": admin_user['id'], "email": admin_user['email'], "role": "admin"})
    
    return {
        "token": token,
        "user": {
            "id": admin_user['id'],
            "email": admin_user['email'],
            "role": "admin"
        }
    }

@api_router.get("/admin/users")
async def get_all_users(admin: User = Depends(get_current_admin)):
    users = await db.users.find({"role": "user"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/payment-requests")
async def get_payment_requests(status: Optional[str] = None, admin: User = Depends(get_current_admin)):
    query = {}
    if status:
        query['status'] = status
    
    requests = await db.payment_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return requests

@api_router.put("/admin/payment-requests/{request_id}/approve")
async def approve_payment(request_id: str, admin: User = Depends(get_current_admin)):
    # Find request
    request = await db.payment_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Request already processed")
    
    # Update request status
    await db.payment_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "approved", "processed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Add balance to user
    await db.users.update_one(
        {"id": request['user_id']},
        {"$inc": {"balance_tl": request['amount_tl']}}
    )
    
    return {"message": "Payment approved and balance added"}

@api_router.put("/admin/payment-requests/{request_id}/reject")
async def reject_payment(request_id: str, admin: User = Depends(get_current_admin)):
    request = await db.payment_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.payment_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "rejected", "processed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Payment rejected"}

@api_router.get("/admin/categories")
async def admin_get_categories(admin: User = Depends(get_current_admin)):
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        count = await db.accounts.count_documents({"category_id": cat['id'], "status": "available"})
        sold_count = await db.accounts.count_documents({"category_id": cat['id'], "status": "sold"})
        cat['available_count'] = count
        cat['sold_count'] = sold_count
    return categories

@api_router.post("/admin/categories")
async def create_category(input: CategoryInput, admin: User = Depends(get_current_admin)):
    category = Category(name=input.name)
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, input: CategoryInput, admin: User = Depends(get_current_admin)):
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": {"name": input.name}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category updated"}

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, admin: User = Depends(get_current_admin)):
    await db.categories.delete_one({"id": category_id})
    # Also delete all accounts in this category
    await db.accounts.delete_many({"category_id": category_id})
    return {"message": "Category deleted"}

@api_router.get("/admin/accounts")
async def admin_get_accounts(category_id: Optional[str] = None, admin: User = Depends(get_current_admin)):
    query = {}
    if category_id:
        query['category_id'] = category_id
    
    accounts = await db.accounts.find(query, {"_id": 0}).to_list(1000)
    return accounts

@api_router.post("/admin/accounts")
async def create_account(input: AccountInput, admin: User = Depends(get_current_admin)):
    account = Account(
        category_id=input.category_id,
        cookie_data=input.cookie_data,
        price_tl=input.price_tl
    )
    doc = account.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.accounts.insert_one(doc)
    return account

@api_router.delete("/admin/accounts/{account_id}")
async def admin_delete_account(account_id: str, admin: User = Depends(get_current_admin)):
    await db.accounts.delete_one({"id": account_id})
    return {"message": "Account deleted"}

@api_router.put("/admin/settings/wallet")
async def update_wallet_address(wallet_address: str, admin: User = Depends(get_current_admin)):
    await db.settings.update_one(
        {"key": "admin_wallet_address"},
        {"$set": {"value": wallet_address}},
        upsert=True
    )
    return {"message": "Wallet address updated"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(get_current_admin)):
    total_users = await db.users.count_documents({"role": "user"})
    pending_payments = await db.payment_requests.count_documents({"status": "pending"})
    total_categories = await db.categories.count_documents({})
    available_accounts = await db.accounts.count_documents({"status": "available"})
    sold_accounts = await db.accounts.count_documents({"status": "sold"})
    
    return {
        "total_users": total_users,
        "pending_payments": pending_payments,
        "total_categories": total_categories,
        "available_accounts": available_accounts,
        "sold_accounts": sold_accounts
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()