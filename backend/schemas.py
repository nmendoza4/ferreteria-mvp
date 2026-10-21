from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    stock: int = Field(ge=0)
    image_url: str | None = None


class ProductResponse(ProductCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
