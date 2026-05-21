# 🏥 Bảng Kê Chi Phí Ngoại Trú

## Cấu trúc thư mục sau khi giải nén

```
outpatient-billing/
├── docker-compose.yml
├── README.md
├── templates/                     ← ĐẶT FILE MẪU VÀO ĐÂY
│   └── MẪU_BANG_KÊ_VIỆN_PHÍ_NGOẠI_TRÚ.docx
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── excel_parser.py
│   └── word_generator.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── index.css
```

## Cách chạy (chỉ 3 bước)

### Bước 1: Đặt file Word mẫu
Copy file `MẪU_BANG_KÊ_VIỆN_PHÍ_NGOẠI_TRÚ.docx` vào thư mục `templates/`

### Bước 2: Chạy Docker
```bash
docker-compose up -d
```
> Lần đầu mất 5-10 phút vì cần tải LibreOffice (~300MB).

### Bước 3: Mở trình duyệt
- **Giao diện web:** http://localhost:3000
- **API docs:**      http://localhost:8000/docs

---

## Sử dụng

1. **Quản lý dịch vụ** → Tab "Quản lý dịch vụ": thêm/sửa/xóa dịch vụ và đơn giá
2. **Nhập dữ liệu** → Tab "Nhập Excel": kéo thả file Excel nghiệm thu
3. **Xem & xuất** → Tab "Danh sách bảng kê": xem chi tiết, xuất Word hoặc PDF

---

## Các lệnh hữu ích

```bash
# Xem log
docker-compose logs -f backend

# Dừng
docker-compose down

# Build lại sau khi sửa code
docker-compose build && docker-compose up -d

# Xóa toàn bộ dữ liệu (reset database)
docker-compose down -v && docker-compose up -d
```
