import openpyxl
from typing import List, Dict, Any

def parse_excel(file_path: str) -> List[Dict[str, Any]]:
    wb = openpyxl.load_workbook(file_path)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))

    # Find header row (contains "Stt" and "Họ và tên")
    header_row_idx = None
    for i, row in enumerate(rows):
        if not row:
            continue
        row_str = " ".join(str(c) for c in row if c)
        if ("Stt" in row_str or "STT" in row_str) and "tên" in row_str.lower():
            header_row_idx = i
            break

    if header_row_idx is None:
        raise ValueError("Không tìm thấy dòng tiêu đề trong file Excel")

    headers = list(rows[header_row_idx])

    col_map = {}
    for j, h in enumerate(headers):
        if h:
            col_map[str(h).strip()] = j

    patients = []
    for row in rows[header_row_idx + 1:]:
        if not row or not row[0]:
            continue
        try:
            stt = int(row[0])
        except (ValueError, TypeError):
            continue

        def get(name):
            idx = col_map.get(name)
            if idx is not None and idx < len(row):
                return row[idx]
            return None

        ma_bn      = str(get("Id") or "").strip()
        ho_ten     = str(get("Họ và tên") or "").strip()
        gioi_tinh  = str(get("Giới tính") or "").strip()
        ngay_sinh  = str(get("Năm sinh") or "").strip()
        ten_goi    = str(get("Tên gói khám") or "").strip()

        so_nha = str(get("Số nhà - Tên đường") or "").strip()
        phuong = str(get("Phường/Xã") or "").strip()
        tinh   = str(get("Tỉnh/Thành phố") or "").strip()
        if so_nha or phuong or tinh:
            dia_chi = ", ".join(p for p in [so_nha, phuong, tinh] if p)
        else:
            dia_chi = str(get("Địa chỉ") or "").strip()

        # Collect services (all columns after "Tên gói khám")
        goi_idx = col_map.get("Tên gói khám", -1)
        services = {}
        if goi_idx >= 0:
            for j in range(goi_idx + 1, len(headers)):
                svc_name = headers[j]
                if svc_name and str(svc_name).strip():
                    val = row[j] if j < len(row) else None
                    try:
                        qty = float(val) if val else 0
                        # Làm gọn số nguyên (1.0 -> 1)
                        if qty == int(qty): qty = int(qty)
                    except (ValueError, TypeError):
                        qty = 1 if val else 0
                    if qty > 0:
                        services[str(svc_name).strip()] = qty

        patients.append({
            "stt": stt,
            "ma_bn": ma_bn,
            "ho_ten": ho_ten,
            "gioi_tinh": gioi_tinh,
            "ngay_sinh": ngay_sinh,
            "dia_chi": dia_chi,
            "ten_goi_kham": ten_goi,
            "ngay_kham": "",
            "services": services,
        })

    return patients
