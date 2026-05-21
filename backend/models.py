from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class ServiceGroup(Base):
    __tablename__ = "service_groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    display_order = Column(Integer, default=0)
    services = relationship("Service", back_populates="group", cascade="all, delete-orphan")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), unique=True, nullable=False)
    unit = Column(String(50), default="Lần")
    price = Column(Float, nullable=True)        # Đơn giá BV
    bhyt_price = Column(Float, nullable=True)   # Đơn giá BHYT (giá trần)
    group_id = Column(Integer, ForeignKey("service_groups.id"))
    display_order = Column(Integer, default=0)
    group = relationship("ServiceGroup", back_populates="services")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    ma_bn = Column(String(50), unique=True, index=True)
    ho_ten = Column(String(200))
    gioi_tinh = Column(String(10))
    ngay_sinh = Column(String(20))
    dia_chi = Column(String(500))
    ten_goi_kham = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    bills = relationship("OutpatientBill", back_populates="patient", cascade="all, delete-orphan")

class OutpatientBill(Base):
    __tablename__ = "outpatient_bills"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    ngay_kham = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="bills")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan")

class BillItem(Base):
    __tablename__ = "bill_items"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("outpatient_bills.id"))
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    so_luong = Column(Integer, default=1)
    don_gia_bv = Column(Float, default=0)
    don_gia_bh = Column(Float, default=0)        # Đơn giá BH (giá trần BHYT)
    ty_le_tt_dv = Column(Float, default=100)     # Tỷ lệ TT dịch vụ (%)
    thanh_tien_bv = Column(Float, default=0)     # Thành tiền BV = SL × ĐG BV
    ty_le_bhyt = Column(Float, nullable=True)    # Tỷ lệ TT BHYT (%) - 80,95,100
    thanh_tien_bh = Column(Float, nullable=True) # Thành tiền BH = TT BV × tỷ lệ/100
    quy_bhyt = Column(Float, nullable=True)      # Quỹ BHYT chi trả
    nb_cung_tt = Column(Float, nullable=True)    # NB cùng chi trả
    nb_tu_tra = Column(Float, nullable=True)     # NB tự trả
    bill = relationship("OutpatientBill", back_populates="items")
    service = relationship("Service")


# ── Gói khám ──────────────────────────────────────────────────────────────────
class ExamPackage(Base):
    __tablename__ = "exam_packages"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), unique=True, nullable=False)
    description   = Column(String(500), nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    # Dịch vụ trong gói
    package_services = relationship("PackageService", back_populates="package",
                                    cascade="all, delete-orphan")
    # Bệnh nhân trong gói
    package_patients = relationship("PackagePatient", back_populates="package",
                                    cascade="all, delete-orphan")

class PackageService(Base):
    """Dịch vụ thuộc gói khám (có thể override đơn giá)."""
    __tablename__ = "package_services"
    id          = Column(Integer, primary_key=True, index=True)
    package_id  = Column(Integer, ForeignKey("exam_packages.id"))
    service_id  = Column(Integer, ForeignKey("services.id"))
    so_luong    = Column(Integer, default=1)
    don_gia_bv  = Column(Float, nullable=True)   # None = dùng giá từ services
    don_gia_bh  = Column(Float, nullable=True)   # None = dùng bhyt_price từ services
    package     = relationship("ExamPackage", back_populates="package_services")
    service     = relationship("Service")

class PackagePatient(Base):
    """Bệnh nhân thuộc gói khám."""
    __tablename__ = "package_patients"
    id          = Column(Integer, primary_key=True, index=True)
    package_id  = Column(Integer, ForeignKey("exam_packages.id"))
    patient_id  = Column(Integer, ForeignKey("patients.id"))
    bill_id     = Column(Integer, ForeignKey("outpatient_bills.id"), nullable=True)
    ngay_kham   = Column(String(20), nullable=True)
    added_at    = Column(DateTime, default=datetime.utcnow)
    package     = relationship("ExamPackage", back_populates="package_patients")
    patient     = relationship("Patient")
    bill        = relationship("OutpatientBill")
