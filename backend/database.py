from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, ServiceGroup, Service
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/outpatient_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _migrate_services(engine):
    """Add bhyt_price column to services if not exists."""
    from sqlalchemy import text, inspect
    insp = inspect(engine)
    if 'services' not in insp.get_table_names():
        return
    existing = {c['name'] for c in insp.get_columns('services')}
    if 'bhyt_price' not in existing:
        with engine.connect() as conn:
            conn.execute(text('ALTER TABLE services ADD COLUMN bhyt_price FLOAT'))
            conn.commit()

def _migrate_bill_items(engine):
    """Add BHYT columns to bill_items if they don't exist (safe migration)."""
    from sqlalchemy import text, inspect
    insp = inspect(engine)
    if 'bill_items' not in insp.get_table_names():
        return
    existing = {c['name'] for c in insp.get_columns('bill_items')}
    new_cols = [
        ('don_gia_bh',    'FLOAT DEFAULT 0'),
        ('ty_le_tt_dv',   'FLOAT DEFAULT 100'),
        ('ty_le_bhyt',    'FLOAT'),
        ('thanh_tien_bh', 'FLOAT'),
        ('quy_bhyt',      'FLOAT'),
        ('nb_cung_tt',    'FLOAT'),
        ('nb_tu_tra',     'FLOAT'),
    ]
    with engine.connect() as conn:
        for col, typ in new_cols:
            if col not in existing:
                conn.execute(text(f'ALTER TABLE bill_items ADD COLUMN {col} {typ}'))
        conn.commit()

def _migrate_exam_packages(engine):
    """Create exam package tables if not exists."""
    from sqlalchemy import text, inspect
    insp = inspect(engine)
    existing = set(insp.get_table_names())
    with engine.connect() as conn:
        if 'exam_packages' not in existing:
            conn.execute(text("""
                CREATE TABLE exam_packages (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(200) UNIQUE NOT NULL,
                    description VARCHAR(500),
                    created_at TIMESTAMP DEFAULT NOW()
                )"""))
        if 'package_services' not in existing:
            conn.execute(text("""
                CREATE TABLE package_services (
                    id SERIAL PRIMARY KEY,
                    package_id INTEGER REFERENCES exam_packages(id) ON DELETE CASCADE,
                    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
                    so_luong INTEGER DEFAULT 1,
                    don_gia_bv FLOAT,
                    don_gia_bh FLOAT
                )"""))
        if 'package_patients' not in existing:
            conn.execute(text("""
                CREATE TABLE package_patients (
                    id SERIAL PRIMARY KEY,
                    package_id INTEGER REFERENCES exam_packages(id) ON DELETE CASCADE,
                    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
                    bill_id INTEGER REFERENCES outpatient_bills(id) ON DELETE SET NULL,
                    ngay_kham VARCHAR(20),
                    added_at TIMESTAMP DEFAULT NOW()
                )"""))
        conn.commit()

def init_db():
    _migrate_services(engine)
    _migrate_bill_items(engine)
    _migrate_exam_packages(engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(ServiceGroup).count() > 0:
            return
        groups_data = [
            ("Xét nghiệm", 1, [
                ("XN AFP (Alpha Fetoproteine) [Máu]", "Lần", 160000),
                ("XN Albumin [Máu]", "Lần", 70000),
                ("XN Bilirubin gián tiếp [Máu]", "Lần", 50000),
                ("XN CA 125 (cancer antigen 125) [Máu]", "Lần", 190000),
                ("XN CA 15 - 3 (Cancer Antigen 15- 3) [Máu]", "Lần", 190000),
                ("XN CA 19 - 9 (Carbohydrate Antigen 19-9) [Máu]", "Lần", 190000),
                ("XN CA 72 - 4 (Cancer Antigen 72- 4) [Máu]", "Lần", 190000),
                ("XN CEA (Carcino Embryonic Antigen) [Máu]", "Lần", 190000),
                ("XN Creatinin (máu)", "Lần", 50000),
                ("XN Cyfra 21- 1 [Máu]", "Lần", 190000),
                ("XN FT3 (Free Triiodothyronine) [Máu]", "Lần", 134000),
                ("XN FT4 (Free Thyroxine) [Máu]", "Lần", 134000),
                ("XN Glucose [Máu]", "Lần", 60000),
                ("XN HBsAg miễn dịch tự động", "Lần", 170000),
                ("XN PSA toàn phần (Total prostate-Specific Antigen) [Máu]", "Lần", 250000),
                ("XN TSH (Thyroid Stimulating hormone) [Máu]", "Lần", 134000),
                ("XN Tổng phân tích nước tiểu (Bằng máy tự động)", "Lần", 60000),
                ("XN Tổng phân tích tế bào máu ngoại vi (bằng máy đếm laser) (XN CTM)", "Lần", 120000),
                ("XN Urê máu [Máu]", "Lần", 50000),
                ("XN Đo hoạt độ ALT (GPT) [Máu]", "Lần", 60000),
                ("XN Đo hoạt độ AST (GOT) [Máu]", "Lần", 60000),
                ("XN Đo hoạt độ GGT [Máu]", "Lần", 60000),
                ("XN Định lượng Acid Uric [Máu]", "Lần", 60000),
                ("XN Định lượng Bilirubin toàn phần [Máu]", "Lần", 60000),
                ("XN Định lượng Bilirubin trực tiếp [Máu]", "Lần", 60000),
                ("XN Định lượng Cholesterol toàn phần (máu)", "Lần", 60000),
                ("XN Định lượng HDL-C [Máu]", "Lần", 60000),
                ("XN Định lượng HbA1c [Máu]", "Lần", 180000),
                ("XN Định lượng LDL - C [Máu]", "Lần", 60000),
                ("XN Định lượng Triglycerid [Máu]", "Lần", 60000),
                ("Xét nghiệm sàng lọc và định tính 5 loại ma túy", "Lần", 260000),
                ("XN Paps Mear", "Lần", 120000),
            ]),
            ("Chẩn đoán hình ảnh", 2, [
                ("Chụp MRI sọ não [không tiêm chất tương phản 3.0T]", "Lần", 3500000),
                ("XQ ngực thẳng", "Lần", 156000),
                ("XQ tuyến vú", "Lần", 360000),
                ("SA Doppler tuyến vú", "Lần", 200000),
                ("SA bụng (gan mật, tụy, lách, thận, bàng quang)", "Lần", 200000),
                ("SA tim doppler màu", "Lần", 350000),
                ("SA tuyến vú hai bên", "Lần", 200000),
                ("SA tuyến giáp", "Lần", 200000),
            ]),
            ("Thăm dò chức năng", 3, [
                ("Đo ECG", "Lần", 50000),
                ("Dv Đo thị lực", "Lần", 50000),
            ]),
            ("Phẫu thuật - Thủ thuật", 4, [
                ("Nội soi can thiệp - cắt 1 polyp ống tiêu hóa < 1cm [Dạ dày - Thực quản - Tá tràng]", "Lần", 800000),
                ("Nội soi thực quản - dạ dày - tá tràng có sinh thiết [Tiền mê - Clotest]", "Lần", 600000),
                ("Nội soi đại trực tràng toàn bộ ống mềm không sinh thiết [Gây mê]", "Lần", 700000),
            ]),
            ("Khám bệnh", 5, [
                ("Khám Nội tổng hợp", "Lần", 70000),
                ("Khám Sản / Phụ khoa (Ngoài giờ)", "Lần", 180000),
            ]),
        ]
        for gname, gorder, services in groups_data:
            grp = ServiceGroup(name=gname, display_order=gorder)
            db.add(grp)
            db.flush()
            for i, (sname, unit, price) in enumerate(services):
                db.add(Service(name=sname, unit=unit, price=price,
                               group_id=grp.id, display_order=i))
        db.commit()
        print("Database seeded.")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()
