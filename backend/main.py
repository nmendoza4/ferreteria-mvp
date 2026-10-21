from datetime import datetime, timedelta, timezone
import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

load_dotenv()

from database import get_db
from models import Product
from schemas import ProductCreate, ProductResponse


app = FastAPI(
    title="Ferretería API",
    description="API de inventario conectada a Supabase con autenticación JWT",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ALGORITHM = "HS256"
TOKEN_MINUTES = 60

if not SECRET_KEY or not ADMIN_PASSWORD:
    raise RuntimeError(
        "Configura SECRET_KEY y ADMIN_PASSWORD en el archivo .env"
    )

security = HTTPBearer()


class LoginRequest(BaseModel):
    username: str
    password: str


def create_token(username: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=TOKEN_MINUTES
    )
    payload = {"sub": username, "exp": expires}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalido",
            )

        return username

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
        )


@app.get("/")
def home():
    return {"message": "Ferreteria API funcionando correctamente"}


@app.post("/api/v1/auth/login")
def login(data: LoginRequest):
    if (
        data.username != ADMIN_USER
        or data.password != ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contrasena incorrectos",
        )

    return {
        "access_token": create_token(data.username),
        "token_type": "bearer",
    }


@app.get(
    "/api/v1/products",
    response_model=list[ProductResponse],
)
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id).all()


@app.post(
    "/api/v1/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user),
):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.put(
    "/api/v1/products/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    data: ProductCreate,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    for field, value in data.model_dump().items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/v1/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )

    db.delete(product)
    db.commit()

    return {"message": "Producto eliminado correctamente"}
