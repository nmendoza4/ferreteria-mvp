from sqlalchemy import BigInteger, Column, DateTime, Integer, Numeric, Text, func
from database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = {"schema": "public"}

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    image_url = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
