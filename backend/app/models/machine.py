"""Machine model"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Machine(Base):
    """Machine model"""

    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    is_running = Column(Boolean, nullable=False, default=False)
    factory_section_id = Column(Integer, ForeignKey("factory_sections.id"), nullable=False)

    # Relationships
    factory_section = relationship("FactorySection", backref="machines")
