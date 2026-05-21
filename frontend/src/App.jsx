import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const API = '/api'
const fmt  = v => v ? new Intl.NumberFormat('vi-VN').format(v) : '0'
const fmt2 = v => v ? new Intl.NumberFormat('vi-VN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v) : ''

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type='success') => {
    const id = Date.now()
    setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3500)
  },[])
  return {toasts,add}
}

function Toast({toasts}) {
  return (
    <div className="toast-container">
      {toasts.map(t=>(
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type==='error'?'❌':'✅'} {t.msg}
        </div>
      ))}
    </div>
  )
}

function Sidebar({page,setPage}) {
  const navs = [
    {id:'dashboard', label:'Tổng quan',         icon:'📊'},
    {id:'upload',    label:'Nhập Excel',          icon:'📤'},
    {id:'bills',     label:'Danh sách bảng kê',   icon:'📋'},
    {id:'packages',  label:'Gói khám',            icon:'📦'},
    {id:'patients',  label:'Bệnh nhân',           icon:'👥'},
    {id:'services',  label:'Quản lý dịch vụ',    icon:'🗂️'},
    {id:'templates', label:'Mẫu in',               icon:'🖨️'},
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <h1>Bảng Kê Chi Phí<br/>Ngoại Trú</h1>
        <p>Hồng Đức II</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Chức năng</div>
        {navs.map(({id,label,icon})=>(
          <div key={id} className={`nav-item ${page===id?'active':''}`} onClick={()=>setPage(id)}>
            <span>{icon}</span>{label}
          </div>
        ))}
      </nav>
      <div style={{padding:'16px',borderTop:'1px solid rgba(255,255,255,0.1)',fontSize:11,color:'rgba(255,255,255,0.3)'}}>
        Phiên bản 1.0
      </div>
    </div>
  )
}

/* ── Dashboard ── */
function Dashboard({setPage}) {
  const [stats, setStats] = useState(null)
  const [bills, setBills] = useState([])

  useEffect(()=>{
    axios.get(`${API}/stats`).then(r=>setStats(r.data)).catch(()=>{})
    axios.get(`${API}/bills`).then(r=>setBills(r.data)).catch(()=>{})
  },[])

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card teal">
          <div className="stat-label">Tổng bảng kê</div>
          <div className="stat-value">{stats?.total_bills||0}</div>
          <div className="stat-sub">Đã tạo trong hệ thống</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-label">Bệnh nhân</div>
          <div className="stat-value">{stats?.total_patients||0}</div>
          <div className="stat-sub">Đã đăng ký</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Tổng doanh thu</div>
          <div className="stat-value" style={{fontSize:18}}>{fmt(stats?.total_revenue||0)}</div>
          <div className="stat-sub">VNĐ</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">TB / bảng kê</div>
          <div className="stat-value" style={{fontSize:18}}>{fmt(Math.round(stats?.avg_per_bill||0))}</div>
          <div className="stat-sub">VNĐ</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        {/* Top services */}
        <div className="card">
          <div className="card-header"><h3>🏆 Dịch vụ sử dụng nhiều</h3></div>
          <div style={{padding:'0 0 8px'}}>
            {(stats?.top_services||[]).map((s,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',padding:'10px 20px',borderBottom:'1px solid var(--cream-dark)'}}>
                <span style={{width:24,height:24,background:'var(--navy)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</span>
                <span style={{flex:1,marginLeft:10,fontSize:12,color:'var(--text)'}}>{s.name?.slice(0,40)}{s.name?.length>40?'...':''}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--teal)'}}>{s.count} lần</span>
              </div>
            ))}
            {!stats?.top_services?.length&&<div style={{padding:'24px',textAlign:'center',color:'var(--text-light)',fontSize:13}}>Chưa có dữ liệu</div>}
          </div>
        </div>

        {/* Recent bills */}
        <div className="card">
          <div className="card-header">
            <h3>🕐 Bảng kê gần đây</h3>
            <button className="btn btn-outline btn-sm" onClick={()=>setPage('bills')}>Xem tất cả →</button>
          </div>
          <div style={{overflow:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Mã BN</th><th>Họ tên</th><th style={{textAlign:'right'}}>Tổng tiền</th></tr></thead>
              <tbody>
                {bills.slice(0,6).map(b=>(
                  <tr key={b.id}>
                    <td><span className="badge badge-teal">{b.ma_bn}</span></td>
                    <td style={{fontSize:12}}><strong>{b.ho_ten}</strong></td>
                    <td className="num" style={{textAlign:'right',fontWeight:700,color:'var(--teal)',fontSize:12}}>{fmt(b.total)}</td>
                  </tr>
                ))}
                {bills.length===0&&<tr><td colSpan={3} style={{textAlign:'center',color:'var(--text-light)',padding:'24px'}}>Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Upload ── */
function UploadPage({toast,setPage}) {
  const [file,setFile]=useState(null)
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState(null)
  const [dragging,setDragging]=useState(false)
  const fileRef=useRef()

  const handleFile=f=>{
    if(!f) return
    if(!f.name.match(/\.xlsx?$/i)){toast.add('Vui lòng chọn file Excel (.xlsx hoặc .xls)','error');return}
    setFile(f);setResult(null)
  }
  const upload=async()=>{
    if(!file) return
    setLoading(true)
    try{
      const fd=new FormData();fd.append('file',file)
      const res=await axios.post(`${API}/upload-excel`,fd)
      setResult(res.data);toast.add(`Đã nhập thành công ${res.data.count} bệnh nhân!`);setFile(null)
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi khi xử lý file','error')}
    setLoading(false)
  }
  return (
    <div>
      <div className="card mb-24">
        <div className="card-header"><h3>📤 Tải file Excel nghiệm thu</h3></div>
        <div className="card-body">
          <div className={`upload-area ${dragging?'drag-over':''}`}
            onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}>
            <div style={{fontSize:48,marginBottom:12}}>📊</div>
            {file
              ?<><div style={{fontWeight:700,color:'var(--navy)',fontSize:15}}>{file.name}</div><div style={{color:'var(--text-light)',fontSize:12,marginTop:4}}>{(file.size/1024).toFixed(1)} KB</div></>
              :<><div style={{fontWeight:700,color:'var(--navy)',fontSize:15}}>Kéo thả file hoặc nhấn để chọn</div><div style={{color:'var(--text-light)',fontSize:12,marginTop:4}}>Hỗ trợ file Excel (.xlsx, .xls)</div></>}
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
          </div>
          {file&&<div style={{display:'flex',gap:10,marginTop:16}}>
            <button className="btn btn-teal" onClick={upload} disabled={loading}>{loading?'⏳ Đang xử lý...':'▶ Xử lý & Tạo bảng kê'}</button>
            <button className="btn btn-outline" onClick={()=>setFile(null)}>Hủy</button>
          </div>}
        </div>
      </div>
      {result&&<div className="card">
        <div className="card-header"><h3>✅ Kết quả</h3><button className="btn btn-teal btn-sm" onClick={()=>setPage('bills')}>Xem danh sách →</button></div>
        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          <table className="data-table">
            <thead><tr><th>Mã BN</th><th>Họ tên</th><th>Số DV khớp</th><th style={{textAlign:'right'}}>Tổng tiền (VNĐ)</th></tr></thead>
            <tbody>
              {result.patients.map((p,i)=>(
                <tr key={i}>
                  <td><span className="badge badge-teal">{p.ma_bn}</span></td>
                  <td><strong>{p.ho_ten}</strong></td>
                  <td><span className="badge badge-navy">{p.services_count} DV</span></td>
                  <td className="num" style={{textAlign:'right',fontWeight:700,color:'var(--teal)'}}>{fmt(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  )
}

/* ── Preview Modal ── */
function PreviewModal({billId, onClose, onExportWord, onExportPdf}) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    axios.get(`${API}/bills/${billId}/preview`)
      .then(r=>{
        const blob = new Blob(
          [Uint8Array.from(atob(r.data.pdf_base64), c=>c.charCodeAt(0))],
          {type:'application/pdf'}
        )
        setPdfUrl(URL.createObjectURL(blob))
      })
      .catch(e=>setError(e.response?.data?.detail||'Không thể tạo preview'))
      .finally(()=>setLoading(false))
    return ()=>{ if(pdfUrl) URL.revokeObjectURL(pdfUrl) }
  },[billId])

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxWidth:860,height:'90vh',display:'flex',flexDirection:'column'}}>
        <div className="modal-header" style={{flexShrink:0}}>
          <h3>👁 Preview bảng kê</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-outline btn-sm" onClick={onExportWord}>📄 Tải Word</button>
            <button className="btn btn-teal btn-sm" onClick={onExportPdf}>📥 Tải PDF</button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',background:'#525659',padding:8}}>
          {loading&&<div style={{color:'white',fontSize:14}}>⏳ Đang tạo preview...</div>}
          {error&&<div style={{color:'#ff8888',fontSize:14,textAlign:'center',padding:20}}>
            ❌ {error}
            <br/><br/>
            <span style={{fontSize:12,opacity:0.8}}>Kiểm tra file template.docx đã được đặt vào thư mục templates/ chưa?</span>
          </div>}
          {pdfUrl&&<iframe
            src={pdfUrl}
            style={{width:'100%',height:'100%',border:'none',borderRadius:4}}
            title="Preview bảng kê"
          />}
        </div>
      </div>
    </div>
  )
}

/* ── BhytTab Component ── */
function BhytTab({bill, bhytForm, setBhytForm, saveBhyt, removeBhyt, bhytSaving, currentBhytRate, hasAnyBhyt}) {
  const allItems = bill.groups.flatMap(g => g.items)

  const initForm = (rate) => {
    const excl = allItems.filter(i => !i.ty_le_bh && !i.quy_bhyt).map(i => i.id)
    setBhytForm({
      ty_le_bhyt: rate || currentBhytRate || 80,
      // don_gia_bh đã được populate từ service.bhyt_price lúc tạo bảng kê
      // Hiển thị giá đó sẵn, user có thể chỉnh tay
      don_gia_bh_map: Object.fromEntries(
        allItems.map(i => [i.id, i.don_gia_bh > 0 ? i.don_gia_bh : ''])
      ),
      excluded_items: hasAnyBhyt ? excl : [],
    })
  }

  // Hint: check if item has catalog bhyt_price loaded
  const hasCatalogBhyt = allItems.some(i => i.don_gia_bh > 0)

  const toggleItem = (itemId) => {
    setBhytForm(f => {
      const excl = new Set(f.excluded_items || [])
      excl.has(itemId) ? excl.delete(itemId) : excl.add(itemId)
      return {...f, excluded_items: [...excl]}
    })
  }

  const setDgbh = (itemId, val) => {
    setBhytForm(f => ({...f, don_gia_bh_map: {...f.don_gia_bh_map, [itemId]: val}}))
  }

  // Live preview calc
  const preview = bhytForm ? (() => {
    const tl = bhytForm.ty_le_bhyt || 0
    const excl = new Set(bhytForm.excluded_items || [])
    let totalBV=0, totalQuy=0, totalNB=0
    allItems.forEach(i => {
      const bv = i.thanh_tien_bv || 0
      totalBV += bv
      if (!excl.has(i.id)) {
        const dgbh = parseFloat(bhytForm.don_gia_bh_map?.[i.id] || i.don_gia_bv || 0)
        const quy = Math.round(i.so_luong * dgbh * tl / 100)
        totalQuy += quy
        totalNB  += bv - quy
      } else {
        totalNB += bv
      }
    })
    return {totalBV, totalQuy, totalNB}
  })() : null

  if (!bhytForm) {
    // View mode
    return (
      <div>
        {/* Summary card */}
        <div style={{background:'var(--cream)',border:'1px solid var(--cream-dark)',borderRadius:10,padding:'16px 18px',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:'var(--navy)'}}>
                {hasAnyBhyt ? `Mức hưởng: ${currentBhytRate}%` : 'Chưa có thông tin BHYT'}
              </div>
              <div style={{fontSize:12,color:'var(--text-light)',marginTop:2}}>
                {hasAnyBhyt ? 'Đang áp dụng cho các dịch vụ được chọn' : 'Nhấn "Cài đặt BHYT" để nhập mức hưởng và chọn dịch vụ'}
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {hasAnyBhyt && <button className="btn btn-danger btn-sm" onClick={removeBhyt} disabled={bhytSaving}>🗑 Xóa BHYT</button>}
              <button className="btn btn-teal btn-sm" onClick={()=>initForm()} disabled={bhytSaving}>
                {hasAnyBhyt ? '✏ Chỉnh sửa' : '⚙️ Cài đặt BHYT'}
              </button>
            </div>
          </div>
          {hasAnyBhyt && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:14,paddingTop:14,borderTop:'1px solid var(--cream-dark)'}}>
              {[
                {label:'Tổng BV', val:bill.total, color:'var(--text)'},
                {label:'Quỹ BHYT chi trả', val:allItems.reduce((s,i)=>s+(i.quy_bhyt||0),0), color:'var(--green)'},
                {label:'NB cùng chi trả', val:allItems.reduce((s,i)=>s+(i.nb_cung_tt||0),0), color:'var(--gold)'},
                {label:'NB tự trả', val:allItems.reduce((s,i)=>s+(i.nb_tu_tra||0),0), color:'var(--red)'},
              ].map(({label,val,color})=>(
                <div key={label}>
                  <div style={{fontSize:11,color:'var(--text-light)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
                  <div style={{fontSize:15,fontWeight:800,color,fontFamily:'JetBrains Mono,monospace',marginTop:2}}>{fmt2(val)}</div>
                  <div style={{fontSize:10,color:'var(--text-light)'}}>đồng</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail table */}
        {hasAnyBhyt && (
          <div style={{overflow:'auto'}}>
            <table className="bill-table">
              <thead>
                <tr>
                  <th style={{width:'30%',textAlign:'left'}}>Dịch vụ</th>
                  <th>SL</th>
                  <th>ĐG BV (đ)</th>
                  <th>ĐG BH (đ)</th>
                  <th>TT BV (đ)</th>
                  <th>TL BH (%)</th>
                  <th style={{color:'#90EE90'}}>Quỹ BHYT (đ)</th>
                  <th>NB cùng TT (đ)</th>
                  <th style={{color:'#FFB3B3'}}>NB tự trả (đ)</th>
                </tr>
              </thead>
              <tbody>
                {bill.groups.map(grp=>[
                  <tr key={grp.group_name} className="group-row"><td colSpan={9}>{grp.group_name}</td></tr>,
                  ...grp.items.map(item=>(
                    <tr key={item.id} style={{opacity: item.quy_bhyt ? 1 : 0.55}}>
                      <td style={{fontSize:11}}>
                        {!item.quy_bhyt && <span style={{fontSize:10,background:'var(--border)',borderRadius:3,padding:'1px 5px',marginRight:5,color:'var(--text-light)'}}>Không BH</span>}
                        {item.name}
                      </td>
                      <td className="center">{item.so_luong}</td>
                      <td className="num">{fmt(item.don_gia_bv)}</td>
                      <td className="num">{fmt(item.don_gia_bh)||'—'}</td>
                      <td className="num">{fmt(item.thanh_tien_bv)}</td>
                      <td className="center" style={{color:'var(--teal)',fontWeight:700}}>{item.ty_le_bh ? `${item.ty_le_bh}%` : '—'}</td>
                      <td className="num" style={{color:'var(--green)'}}>{fmt(item.quy_bhyt)||'—'}</td>
                      <td className="num">{fmt(item.nb_cung_tt)||'—'}</td>
                      <td className="num" style={{fontWeight:600}}>{fmt(item.nb_tu_tra)}</td>
                    </tr>
                  )),
                ])}
                <tr className="grand-total-row">
                  <td colSpan={4} style={{textAlign:'right'}}>TỔNG CỘNG</td>
                  <td className="num">{fmt2(bill.total)}</td>
                  <td></td>
                  <td className="num" style={{color:'#90EE90'}}>{fmt2(allItems.reduce((s,i)=>s+(i.quy_bhyt||0),0))}</td>
                  <td className="num">{fmt2(allItems.reduce((s,i)=>s+(i.nb_cung_tt||0),0))}</td>
                  <td className="num" style={{color:'#FFB3B3'}}>{fmt2(allItems.reduce((s,i)=>s+(i.nb_tu_tra||0),0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // Edit mode
  const excl = new Set(bhytForm.excluded_items || [])
  const selectedCount = allItems.length - excl.size

  return (
    <div>
      {/* Header + preview */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Left: settings */}
        <div style={{background:'var(--cream)',borderRadius:10,padding:'14px 16px'}}>
          <div style={{fontWeight:700,fontSize:13,color:'var(--navy)',marginBottom:12}}>⚙️ Mức hưởng BHYT</div>
          <div style={{display:'flex',gap:6,marginBottom:10}}>
            {[80,95,100].map(v=>(
              <button key={v}
                className={`btn btn-sm ${bhytForm.ty_le_bhyt===v?'btn-teal':'btn-outline'}`}
                onClick={()=>setBhytForm(f=>({...f,ty_le_bhyt:v}))}>
                {v}%
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <input className="form-input" type="number" min="0" max="100" style={{width:100}}
              placeholder="Tùy chỉnh..."
              value={bhytForm.ty_le_bhyt||''}
              onChange={e=>setBhytForm(f=>({...f,ty_le_bhyt:parseFloat(e.target.value)||0}))}/>
            <span style={{fontSize:12,color:'var(--text-light)'}}>%</span>
          </div>
          <div style={{marginTop:12,fontSize:12,color:'var(--text-light)'}}>
            Áp dụng cho <strong style={{color:'var(--navy)'}}>{selectedCount}/{allItems.length}</strong> dịch vụ
          </div>
        </div>

        {/* Right: live preview */}
        <div style={{background:'var(--navy)',borderRadius:10,padding:'14px 16px',color:'white'}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>📊 Ước tính thanh toán</div>
          {[
            {label:'Tổng BV', val:preview.totalBV,  color:'white'},
            {label:'Quỹ BHYT chi trả', val:preview.totalQuy, color:'#90EE90'},
            {label:'NB tự trả', val:preview.totalNB, color:'#FFB3B3'},
          ].map(({label,val,color})=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:12,opacity:0.8}}>{label}</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:13,fontWeight:700,color}}>{fmt2(Math.round(val))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info about catalog prices */}
      {hasCatalogBhyt && (
        <div style={{
          background:'rgba(11,138,138,0.08)',border:'1px solid rgba(11,138,138,0.25)',
          borderRadius:8,padding:'8px 14px',marginBottom:10,fontSize:12,
          display:'flex',alignItems:'center',gap:8,color:'var(--teal)',
        }}>
          ℹ️ Các dịch vụ có <strong>giá BHYT trong danh mục</strong> đã được điền sẵn. Bạn có thể chỉnh sửa hoặc để trống để dùng giá BV.
        </div>
      )}

      {/* Service table: select + set don_gia_bh */}
      <div style={{border:'1px solid var(--border)',borderRadius:10,overflow:'hidden',marginBottom:14}}>
        <div style={{background:'var(--navy)',color:'white',padding:'8px 14px',display:'flex',alignItems:'center',gap:12}}>
          <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:13,fontWeight:600}}>
            <input type="checkbox"
              style={{width:14,height:14}}
              checked={excl.size===0}
              onChange={()=>setBhytForm(f=>({...f,excluded_items:excl.size===0?allItems.map(i=>i.id):[]}))}
            />
            Chọn tất cả dịch vụ
          </label>
          <span style={{marginLeft:'auto',fontSize:11,opacity:0.7}}>Đơn giá BH (để trống = dùng ĐG BV)</span>
        </div>
        <div style={{maxHeight:360,overflowY:'auto'}}>
          {bill.groups.map(grp=>(
            <div key={grp.group_name}>
              {/* Group sub-header */}
              <div style={{
                background:'var(--cream-dark)',padding:'6px 14px',
                fontSize:11,fontWeight:700,color:'var(--navy)',
                textTransform:'uppercase',letterSpacing:'0.06em',
                borderBottom:'1px solid var(--border)',
              }}>
                {grp.group_name}
              </div>
              {grp.items.map(item=>{
                const checked = !excl.has(item.id)
                const dgbh = bhytForm.don_gia_bh_map?.[item.id]
                return (
                  <div key={item.id} style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'8px 14px',
                    borderBottom:'1px solid var(--cream-dark)',
                    background: checked ? 'white' : 'var(--cream)',
                    transition:'background 0.15s',
                  }}>
                    {/* Checkbox */}
                    <input type="checkbox"
                      style={{width:14,height:14,cursor:'pointer',flexShrink:0}}
                      checked={checked}
                      onChange={()=>toggleItem(item.id)}
                    />
                    {/* Service name */}
                    <span style={{flex:1,fontSize:12,color:checked?'var(--text)':'var(--text-light)'}}>{item.name}</span>
                    {/* ĐG BV label */}
                    <span style={{fontSize:11,color:'var(--text-light)',width:90,textAlign:'right',flexShrink:0}}>
                      BV: {fmt(item.don_gia_bv)}đ
                    </span>
                    {/* ĐG BH input */}
                    <div style={{width:130,flexShrink:0}}>
                      <input
                        className="form-input"
                        type="number"
                        disabled={!checked}
                        style={{
                          padding:'4px 8px',fontSize:12,
                          opacity: checked ? 1 : 0.4,
                          background: checked ? 'white' : 'var(--cream)',
                          borderColor: dgbh!==undefined && dgbh!=='' && dgbh>0 ? 'var(--teal)' : undefined,
                        }}
                        placeholder={`= ${fmt(item.don_gia_bv)} (BV)`}
                        value={dgbh !== undefined && dgbh !== '' ? dgbh : ''}
                        onChange={e=>setDgbh(item.id, e.target.value===''?'':e.target.value)}
                      />
                      {checked && dgbh!==undefined && dgbh!=='' && parseFloat(dgbh)>0 && (
                        <div style={{fontSize:10,color:'var(--teal)',marginTop:1}}>✓ Giá BHYT danh mục</div>
                      )}
                      {checked && (dgbh===undefined || dgbh==='') && (
                        <div style={{fontSize:10,color:'var(--gold)',marginTop:1}}>← Nhập tay hoặc để = giá BV</div>
                      )}
                    </div>
                    {/* Preview quy */}
                    {checked && (
                      <span style={{width:90,textAlign:'right',fontSize:11,color:'var(--green)',fontFamily:'JetBrains Mono,monospace',flexShrink:0}}>
                        {fmt(Math.round(item.so_luong*(dgbh!==undefined&&dgbh!==''&&parseFloat(dgbh)>0?parseFloat(dgbh):item.don_gia_bv||0)*(bhytForm.ty_le_bhyt||0)/100))}đ
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer buttons */}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
        <button className="btn btn-outline" onClick={()=>setBhytForm(null)}>Hủy</button>
        <button className="btn btn-teal" onClick={saveBhyt} disabled={bhytSaving}>
          {bhytSaving ? '⏳ Đang lưu...' : `💾 Áp dụng BHYT (${selectedCount} DV)`}
        </button>
      </div>
    </div>
  )
}

/* ── Bill Detail Modal ── */
function BillDetailModal({billId, onClose, toast}) {
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [addServiceId, setAddServiceId] = useState('')
  const [addQty, setAddQty] = useState(1)
  const [editItem, setEditItem] = useState(null)
  const [editInfo, setEditInfo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('services')
  const [showPreview, setShowPreview] = useState(false)
  const [templates, setTemplates]     = useState([])
  const [selTemplate, setSelTemplate] = useState('') // '' = default
  const [bhytForm, setBhytForm] = useState(null) // {ty_le_bhyt, don_gia_bh_map}
  const [bhytSaving, setBhytSaving] = useState(false)

  const loadBill = ()=>axios.get(`${API}/bills/${billId}`).then(r=>setBill(r.data)).catch(()=>toast.add('Lỗi tải bảng kê','error'))

  useEffect(()=>{
    Promise.all([
      axios.get(`${API}/bills/${billId}`),
      axios.get(`${API}/service-groups`),
      axios.get(`${API}/templates`),
    ]).then(([b,g,t])=>{setBill(b.data);setGroups(g.data);setTemplates(t.data)})
      .catch(()=>toast.add('Không thể tải dữ liệu','error'))
      .finally(()=>setLoading(false))
  },[billId])

  const exportFile = async(type, tplId=null)=>{
    const tid = tplId || selTemplate
    const url = tid
      ? `${API}/bills/${billId}/export/${type}?template_id=${encodeURIComponent(tid)}`
      : `${API}/bills/${billId}/export/${type}`
    try{
      const res = await axios.get(url,{responseType:'blob'})
      const burl = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href=burl
      a.download=`bang_ke_${bill?.ma_bn}.${type==='word'?'docx':'pdf'}`; a.click()
      URL.revokeObjectURL(burl); toast.add(`Đã xuất ${type.toUpperCase()}!`)
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi khi xuất file','error')}
  }

  const saveInfo = async()=>{
    setSaving(true)
    try{
      const res = await axios.put(`${API}/bills/${billId}/info`,editInfo)
      setBill(res.data); setEditInfo(null)
      toast.add('Đã cập nhật thông tin!')
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setSaving(false)
  }

  const saveBhyt = async()=>{
    if(!bhytForm) return
    setBhytSaving(true)
    try{
      // Chỉ gửi các dịch vụ được chọn
      const payload = {
        ty_le_bhyt: bhytForm.ty_le_bhyt,
        don_gia_bh_map: bhytForm.don_gia_bh_map,
        excluded_item_ids: bhytForm.excluded_items || [],
      }
      const res = await axios.put(`${API}/bills/${billId}/bhyt`, payload)
      setBill(res.data); setBhytForm(null)
      toast.add('Đã cập nhật BHYT!')
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setBhytSaving(false)
  }

  const removeBhyt = async()=>{
    if(!confirm('Xóa toàn bộ BHYT khỏi bảng kê này?')) return
    setBhytSaving(true)
    try{
      const res = await axios.put(`${API}/bills/${billId}/bhyt`,{ty_le_bhyt:null,don_gia_bh_map:{},excluded_item_ids:[]})
      setBill(res.data); setBhytForm(null)
      toast.add('Đã xóa BHYT')
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setBhytSaving(false)
  }

  // Detect current BHYT rate from first item that has it
  const currentBhytRate = bill?.groups?.flatMap(g=>g.items).find(i=>i.ty_le_bh)?.ty_le_bh || null
  const hasAnyBhyt = bill?.groups?.flatMap(g=>g.items).some(i=>i.quy_bhyt>0)

  const addItem = async()=>{
    if(!addServiceId) return toast.add('Chọn dịch vụ','error')
    setSaving(true)
    try{
      const res = await axios.post(`${API}/bills/${billId}/items`,{service_id:parseInt(addServiceId),so_luong:addQty})
      setBill(res.data); setShowAddItem(false); setAddServiceId(''); setAddQty(1)
      toast.add('Đã thêm dịch vụ!')
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setSaving(false)
  }

  const updateItem = async()=>{
    setSaving(true)
    try{
      const res = await axios.put(`${API}/bills/${billId}/items/${editItem.id}`,{
        so_luong:parseInt(editItem.so_luong),
        don_gia_bv:parseFloat(editItem.don_gia_bv),
      })
      setBill(res.data); setEditItem(null)
      toast.add('Đã cập nhật!')
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setSaving(false)
  }

  const deleteItem = async(itemId)=>{
    if(!confirm('Xóa dịch vụ này?')) return
    try{
      await axios.delete(`${API}/bills/${billId}/items/${itemId}`)
      await loadBill(); toast.add('Đã xóa dịch vụ')
    }catch(e){toast.add('Lỗi khi xóa','error')}
  }

  if(loading) return <div className="modal-overlay"><div className="modal" style={{padding:40,textAlign:'center'}}>⏳ Đang tải...</div></div>
  if(!bill) return null

  const INFO_FIELDS = [
    {label:'Họ và tên (*)',        key:'ho_ten',         placeholder:'NGUYỄN VĂN A'},
    {label:'Ngày sinh (*)',        key:'ngay_sinh',       placeholder:'DD/MM/YYYY'},
    {label:'Giới tính (*)',        key:'gioi_tinh',       placeholder:'Nam / Nữ'},
    {label:'Địa chỉ (*)',          key:'dia_chi',         placeholder:'Số nhà, Phường/Xã, Tỉnh/TP', full:true},
    {label:'Ngày khám',            key:'ngay_kham',       placeholder:'DD/MM/YYYY'},
    {label:'Khoa',                 key:'khoa',            placeholder:'Khoa Khám Bệnh'},
    {label:'Mã thẻ BHYT',          key:'ma_the_bhyt',     placeholder:'GD-4-...'},
    {label:'BHYT có giá trị từ',   key:'bhyt_tu',         placeholder:'DD/MM/YYYY'},
    {label:'BHYT đến ngày',        key:'bhyt_den',        placeholder:'DD/MM/YYYY'},
    {label:'Mức hưởng BHYT',       key:'muc_huong_bhyt',  placeholder:'80%'},
    {label:'Cơ sở đăng ký BHYT',   key:'csdk_bhyt',       placeholder:'Tên cơ sở'},
    {label:'Chẩn đoán',            key:'chan_doan',        placeholder:'Tên bệnh'},
    {label:'Mã bệnh (ICD-10)',     key:'ma_benh',         placeholder:'M54.2'},
  ]

  return (
    <>
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
        {/* Header */}
        <div className="modal-header" style={{flexShrink:0}}>
          <div>
            <h3>Bảng kê chi phí ngoại trú</h3>
            <div style={{fontSize:12,color:'var(--text-light)',marginTop:2}}>
              <span className="badge badge-teal" style={{marginRight:6}}>{bill.ma_bn}</span>
              {bill.ho_ten} · {bill.ngay_kham||'Chưa có ngày'}
            </div>
          </div>
          <div style={{display:'flex',gap:6}}>
            {tab==='services'&&<button className="btn btn-outline btn-sm" onClick={()=>setShowAddItem(true)}>➕ Thêm DV</button>}
            {/* Template selector */}
            {templates.length>1&&(
              <select className="form-input form-select" style={{width:'auto',fontSize:12,padding:'4px 8px',height:30}}
                value={selTemplate} onChange={e=>setSelTemplate(e.target.value)}
                title="Chọn mẫu in">
                <option value="">⭐ Mẫu mặc định</option>
                {templates.filter(t=>!t.is_default).map(t=>(
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            <button className="btn btn-outline btn-sm" onClick={()=>setShowPreview(true)}>👁 Preview</button>
            <button className="btn btn-outline btn-sm" onClick={()=>exportFile('word')}>📄 Word</button>
            <button className="btn btn-teal btn-sm" onClick={()=>exportFile('pdf')}>📥 PDF</button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{padding:'8px 22px 0',flexShrink:0,borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',gap:0}}>
            {[{id:'info',label:'👤 Thông tin BN'},{id:'services',label:'💊 Chi phí dịch vụ'},{id:'bhyt',label:'🏥 BHYT'}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer',
                border:'none',background:'transparent',
                borderBottom: tab===t.id ? '2px solid var(--teal)' : '2px solid transparent',
                color: tab===t.id ? 'var(--teal)' : 'var(--text-light)',
                fontFamily:'Be Vietnam Pro,sans-serif',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'20px 22px'}}>

          {/* ── TAB: Thông tin bệnh nhân ── */}
          {tab==='info'&&(
            editInfo
              ? <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                    {INFO_FIELDS.map(({label,key,placeholder,full})=>(
                      <div key={key} className="form-group" style={{marginBottom:0,gridColumn:full?'1/-1':'auto'}}>
                        <label className="form-label">{label}</label>
                        <input className="form-input" placeholder={placeholder}
                          value={editInfo[key]||''} onChange={e=>setEditInfo({...editInfo,[key]:e.target.value})}/>
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                    <button className="btn btn-outline" onClick={()=>setEditInfo(null)}>Hủy</button>
                    <button className="btn btn-teal" onClick={saveInfo} disabled={saving}>{saving?'⏳ Đang lưu...':'💾 Lưu thay đổi'}</button>
                  </div>
                </div>
              : <div>
                  <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
                    <button className="btn btn-outline btn-sm" onClick={()=>setEditInfo({
                      ho_ten:bill.ho_ten,ngay_sinh:bill.ngay_sinh,gioi_tinh:bill.gioi_tinh,
                      dia_chi:bill.dia_chi,ngay_kham:bill.ngay_kham,
                      ma_the_bhyt:bill.ma_the_bhyt,bhyt_tu:bill.bhyt_tu,bhyt_den:bill.bhyt_den,
                      muc_huong_bhyt:bill.muc_huong_bhyt,csdk_bhyt:bill.csdk_bhyt,
                      khoa:bill.khoa,chan_doan:bill.chan_doan,ma_benh:bill.ma_benh,
                    })}>✏ Chỉnh sửa</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                    {[
                      {label:'Mã bệnh nhân',    val:bill.ma_bn,           color:'var(--teal)'},
                      {label:'Họ và tên',        val:bill.ho_ten},
                      {label:'Giới tính',        val:bill.gioi_tinh},
                      {label:'Ngày sinh',        val:bill.ngay_sinh},
                      {label:'Ngày khám',        val:bill.ngay_kham||'—'},
                      {label:'Khoa',             val:bill.khoa||'Khoa Khám Bệnh'},
                      {label:'Mã thẻ BHYT',      val:bill.ma_the_bhyt||'—'},
                      {label:'Mức hưởng BHYT',  val:bill.muc_huong_bhyt||'—'},
                      {label:'BHYT giá trị',    val:bill.bhyt_tu?`${bill.bhyt_tu} → ${bill.bhyt_den}`:'—'},
                      {label:'Cơ sở ĐK BHYT',   val:bill.csdk_bhyt||'—'},
                      {label:'Chẩn đoán',        val:bill.chan_doan||'—'},
                      {label:'Mã bệnh (ICD)',    val:bill.ma_benh||'—'},
                    ].map(({label,val,color})=>(
                      <div key={label} className="info-field">
                        <label>{label}</label>
                        <span style={color?{color}:{}}>{val}</span>
                      </div>
                    ))}
                    <div className="info-field" style={{gridColumn:'1/-1'}}>
                      <label>Địa chỉ</label>
                      <span>{bill.dia_chi||'—'}</span>
                    </div>
                  </div>
                </div>
          )}

          {/* ── TAB: Chi phí dịch vụ ── */}
          {tab==='services'&&<>
            {/* Add item form */}
            {showAddItem&&(
              <div style={{background:'var(--cream)',border:'1px solid var(--cream-dark)',borderRadius:10,padding:'14px 16px',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'var(--navy)'}}>➕ Thêm dịch vụ vào bảng kê</div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
                  <div style={{flex:3,minWidth:240}}>
                    <div className="form-label">Chọn dịch vụ</div>
                    <select className="form-input form-select" value={addServiceId} onChange={e=>setAddServiceId(e.target.value)}>
                      <option value="">-- Chọn dịch vụ --</option>
                      {groups.map(g=>(
                        <optgroup key={g.id} label={g.name}>
                          {g.services.map(s=>(
                            <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)} đ</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div style={{width:80}}>
                    <div className="form-label">Số lượng</div>
                    <input className="form-input" type="number" min="1" value={addQty} onChange={e=>setAddQty(parseInt(e.target.value)||1)}/>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-teal btn-sm" onClick={addItem} disabled={saving}>{saving?'⏳':'✓'} Thêm</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>{setShowAddItem(false);setAddServiceId('');setAddQty(1)}}>✕</button>
                  </div>
                </div>
              </div>
            )}

            {/* Cost table */}
            <div style={{overflow:'auto'}}>
              <table className="bill-table">
                <thead>
                  <tr>
                    <th style={{width:'33%',textAlign:'left'}}>Nội dung</th>
                    <th style={{width:'7%'}}>ĐVT</th>
                    <th style={{width:'5%'}}>SL</th>
                    <th style={{width:'11%'}}>Đơn giá BV</th>
                    <th style={{width:'7%'}}>ĐG BH</th>
                    <th style={{width:'6%'}}>TL%</th>
                    <th style={{width:'12%'}}>Thành tiền BV</th>
                    <th style={{width:'11%'}}>NB tự trả</th>
                    <th style={{width:'8%'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {bill.groups.map(grp=>{
                    const grpTotal = grp.items.reduce((s,i)=>s+(i.thanh_tien_bv||0),0)
                    return [
                      <tr key={`g-${grp.group_name}`} className="group-row"><td colSpan={9}>{grp.group_name}</td></tr>,
                      ...grp.items.map(item=>(
                        editItem?.id===item.id
                          ? <tr key={item.id} style={{background:'#fffbe6'}}>
                              <td style={{fontSize:12}}>{item.name}</td>
                              <td className="center">{item.unit}</td>
                              <td>
                                <input style={{width:46,padding:'2px 4px',border:'1px solid var(--teal)',borderRadius:4,textAlign:'center',fontSize:12}}
                                  type="number" min="1" value={editItem.so_luong}
                                  onChange={e=>setEditItem({...editItem,so_luong:e.target.value})}/>
                              </td>
                              <td>
                                <input style={{width:86,padding:'2px 4px',border:'1px solid var(--teal)',borderRadius:4,textAlign:'right',fontSize:12}}
                                  type="number" value={editItem.don_gia_bv}
                                  onChange={e=>setEditItem({...editItem,don_gia_bv:e.target.value})}/>
                              </td>
                              <td className="center" style={{color:'var(--text-light)'}}>0</td>
                              <td className="center">100</td>
                              <td className="num">{fmt(editItem.so_luong*editItem.don_gia_bv)}</td>
                              <td className="num">{fmt2(editItem.so_luong*editItem.don_gia_bv)}</td>
                              <td>
                                <div style={{display:'flex',gap:2}}>
                                  <button className="btn btn-teal btn-xs" onClick={updateItem} disabled={saving}>✓</button>
                                  <button className="btn btn-outline btn-xs" onClick={()=>setEditItem(null)}>✕</button>
                                </div>
                              </td>
                            </tr>
                          : <tr key={item.id}>
                              <td style={{fontSize:12}}>{item.name}</td>
                              <td className="center" style={{fontSize:12}}>{item.unit}</td>
                              <td className="center">{item.so_luong}</td>
                              <td className="num">{fmt(item.don_gia_bv)}</td>
                              <td className="center" style={{color:'var(--text-light)'}}>0</td>
                              <td className="center">100</td>
                              <td className="num">{fmt(item.thanh_tien_bv)}</td>
                              <td className="num">{fmt2(item.thanh_tien_bv)}</td>
                              <td>
                                <div style={{display:'flex',gap:2}}>
                                  <button className="btn btn-outline btn-xs" onClick={()=>setEditItem({id:item.id,so_luong:item.so_luong,don_gia_bv:item.don_gia_bv})}>✏</button>
                                  <button className="btn btn-danger btn-xs" onClick={()=>deleteItem(item.id)}>🗑</button>
                                </div>
                              </td>
                            </tr>
                      )),
                      <tr key={`t-${grp.group_name}`} className="total-row">
                        <td colSpan={6} style={{textAlign:'right',fontSize:12}}>Tổng ({grp.group_name})</td>
                        <td className="num">{fmt2(grpTotal)}</td>
                        <td className="num">{fmt2(grpTotal)}</td>
                        <td></td>
                      </tr>
                    ]
                  })}
                  <tr className="grand-total-row">
                    <td colSpan={6} style={{textAlign:'right'}}>TỔNG CỘNG</td>
                    <td className="num" style={{textAlign:'right'}}>{fmt2(bill.total)}</td>
                    <td className="num" style={{textAlign:'right'}}>{fmt2(bill.total)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{marginTop:12,padding:'12px 16px',background:'var(--cream)',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:600,color:'var(--text-mid)'}}>Tổng chi phí</span>
              <span style={{fontSize:17,fontWeight:800,color:'var(--navy)',fontFamily:'JetBrains Mono,monospace'}}>{fmt2(bill.total)} VNĐ</span>
            </div>
          </>}

          {/* ── TAB: BHYT ── */}
          {tab==='bhyt'&&(
            <BhytTab
              bill={bill}
              bhytForm={bhytForm}
              setBhytForm={setBhytForm}
              saveBhyt={saveBhyt}
              removeBhyt={removeBhyt}
              bhytSaving={bhytSaving}
              currentBhytRate={currentBhytRate}
              hasAnyBhyt={hasAnyBhyt}
            />
          )}
        </div>
      </div>
    </div>

    {/* Preview Modal */}
    {showPreview&&<PreviewModal
      billId={billId}
      onClose={()=>setShowPreview(false)}
      onExportWord={()=>exportFile('word')}
      onExportPdf={()=>exportFile('pdf')}
    />}
    </>
  )
}

/* ── Bills Page ── */
function BillsPage({toast}) {
  const [bills, setBills]       = useState([])
  const [search, setSearch]     = useState('')
  const [viewId, setViewId]     = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [exporting, setExporting] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [patients, setPatients] = useState([])
  const [newBill, setNewBill]   = useState({patient_id:'', ngay_kham:''})
  const [saving, setSaving]     = useState(false)

  const load = ()=>axios.get(`${API}/bills`).then(r=>setBills(r.data)).catch(()=>{})
  useEffect(()=>{load()},[])
  useEffect(()=>{
    if(showCreate)
      axios.get(`${API}/patients`).then(r=>setPatients(r.data)).catch(()=>{})
  },[showCreate])

  const createBill = async() => {
    if(!newBill.patient_id) return toast.add('Chọn bệnh nhân','error')
    setSaving(true)
    try {
      const res = await axios.post(`${API}/bills`,{
        patient_id:parseInt(newBill.patient_id), ngay_kham:newBill.ngay_kham})
      toast.add('Đã tạo bảng kê!'); setShowCreate(false)
      setNewBill({patient_id:'',ngay_kham:''}); load()
      setViewId(res.data.id) // mở luôn để thêm dịch vụ
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
    setSaving(false)
  }

  const del = async id=>{
    if(!confirm('Xóa bảng kê này?')) return
    await axios.delete(`${API}/bills/${id}`)
    setSelected(s=>{ s.delete(id); return new Set(s) })
    toast.add('Đã xóa'); load()
  }

  const exportFile = async(id, type, mabn)=>{
    try{
      const res = await axios.get(`${API}/bills/${id}/export/${type}`,{responseType:'blob'})
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href=url
      a.download=`bang_ke_${mabn}.${type==='word'?'docx':'pdf'}`; a.click()
      URL.revokeObjectURL(url); toast.add(`Đã xuất ${type.toUpperCase()}`)
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi khi xuất file','error')}
  }

  const exportBulk = async(type)=>{
    const ids = selected.size > 0 ? [...selected] : filtered.map(b=>b.id)
    if(ids.length === 0) return toast.add('Không có bảng kê để xuất','error')
    setExporting(true)
    try{
      const res = await axios.post(`${API}/bills/export-bulk`,{bill_ids: ids, format: type})
      const {zip_base64, filename, success_count, errors} = res.data
      // Download zip
      const bytes = Uint8Array.from(atob(zip_base64), c=>c.charCodeAt(0))
      const blob  = new Blob([bytes], {type:'application/zip'})
      const url   = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download=filename; a.click()
      URL.revokeObjectURL(url)
      toast.add(`Đã xuất ${success_count}/${ids.length} bảng kê thành công!`)
      if(errors.length) toast.add(errors[0],'error')
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi khi xuất','error')}
    setExporting(false)
  }

  const toggleSelect = id=>{
    setSelected(s=>{
      const ns = new Set(s)
      ns.has(id) ? ns.delete(id) : ns.add(id)
      return ns
    })
  }

  const toggleAll = ()=>{
    if(selected.size === filtered.length)
      setSelected(new Set())
    else
      setSelected(new Set(filtered.map(b=>b.id)))
  }

  const fmtDateTime = iso=>{
    if(!iso) return '—'
    const d = new Date(iso)
    const dd  = String(d.getDate()).padStart(2,'0')
    const mm  = String(d.getMonth()+1).padStart(2,'0')
    const yy  = d.getFullYear()
    const hh  = String(d.getHours()).padStart(2,'0')
    const min = String(d.getMinutes()).padStart(2,'0')
    return `${dd}/${mm}/${yy} ${hh}:${min}`
  }

  const filtered = bills.filter(b=>
    b.ho_ten?.toLowerCase().includes(search.toLowerCase())||
    b.ma_bn?.toLowerCase().includes(search.toLowerCase())
  )

  const allChecked   = filtered.length > 0 && selected.size === filtered.length
  const someChecked  = selected.size > 0 && selected.size < filtered.length
  const selectCount  = selected.size

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{flexWrap:'wrap',gap:8}}>
          <h3>📋 Danh sách bảng kê ({bills.length})</h3>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <div className="search-bar">
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}}>🔍</span>
              <input placeholder="Tìm theo tên hoặc mã BN..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowCreate(true)}>+ Tạo bảng kê</button>
          </div>
        </div>

        {/* Bulk action bar */}
        <div style={{
          padding:'10px 20px',
          background: selectCount > 0 ? 'var(--navy)' : 'var(--cream)',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:12,
          transition:'background 0.2s',
        }}>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',color: selectCount>0?'white':'var(--text-mid)',fontSize:13,fontWeight:600}}>
            <input
              type="checkbox"
              style={{width:15,height:15,cursor:'pointer'}}
              checked={allChecked}
              ref={el=>{ if(el) el.indeterminate = someChecked }}
              onChange={toggleAll}
            />
            {selectCount > 0
              ? `Đã chọn ${selectCount} bảng kê`
              : `Chọn tất cả (${filtered.length})`
            }
          </label>

          {/* Export buttons - show when any selected OR as default "export all filtered" */}
          <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
            {selectCount === 0 && (
              <span style={{fontSize:12,color:'var(--text-light)',alignSelf:'center'}}>
                Chọn bảng kê để xuất, hoặc:
              </span>
            )}
            <button
              className="btn btn-outline btn-sm"
              style={selectCount>0?{background:'rgba(255,255,255,0.15)',color:'white',borderColor:'rgba(255,255,255,0.3)'}:{}}
              onClick={()=>exportBulk('word')}
              disabled={exporting}
            >
              📄 {selectCount>0 ? `Xuất Word (${selectCount})` : 'Xuất tất cả Word'}
            </button>
            <button
              className="btn btn-teal btn-sm"
              style={selectCount>0?{background:'var(--teal-light)'}:{}}
              onClick={()=>exportBulk('pdf')}
              disabled={exporting}
            >
              {exporting ? '⏳ Đang xuất...' : <>📥 {selectCount>0 ? `Xuất PDF (${selectCount})` : 'Xuất tất cả PDF'}</>}
            </button>
            {selectCount > 0 && (
              <button className="btn btn-outline btn-sm"
                style={{background:'rgba(255,255,255,0.1)',color:'white',borderColor:'rgba(255,255,255,0.3)'}}
                onClick={()=>setSelected(new Set())}>
                ✕ Bỏ chọn
              </button>
            )}
          </div>
        </div>

        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{width:36,textAlign:'center'}}>
                  <input type="checkbox" style={{cursor:'pointer'}}
                    checked={allChecked}
                    ref={el=>{ if(el) el.indeterminate = someChecked }}
                    onChange={toggleAll}/>
                </th>
                <th>Mã BN</th>
                <th>Họ tên</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>Ngày giờ tạo</th>
                <th>Số DV</th>
                <th style={{textAlign:'right'}}>Tổng tiền (VNĐ)</th>
                <th style={{textAlign:'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b=>(
                <tr key={b.id}
                  style={{background: selected.has(b.id) ? 'rgba(11,138,138,0.06)' : undefined}}
                  onClick={()=>toggleSelect(b.id)}
                >
                  <td style={{textAlign:'center'}} onClick={e=>e.stopPropagation()}>
                    <input type="checkbox" style={{cursor:'pointer'}}
                      checked={selected.has(b.id)}
                      onChange={()=>toggleSelect(b.id)}/>
                  </td>
                  <td><span className="badge badge-teal">{b.ma_bn}</span></td>
                  <td><strong>{b.ho_ten}</strong></td>
                  <td>{b.gioi_tinh}</td>
                  <td className="text-sm text-muted">{b.ngay_sinh}</td>
                  <td>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{fmtDateTime(b.created_at).split(' ')[0]}</div>
                    <div style={{fontSize:11,color:'var(--text-light)'}}>{fmtDateTime(b.created_at).split(' ')[1]}</div>
                  </td>
                  <td><span className="badge badge-navy">{b.items_count}</span></td>
                  <td className="num" style={{textAlign:'right',fontWeight:700,color:'var(--teal)'}}>{fmt(b.total)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:3,justifyContent:'center'}}>
                      <button className="btn btn-outline btn-xs" title="Xem & Sửa" onClick={()=>setViewId(b.id)}>👁</button>
                      <button className="btn btn-outline btn-xs" title="Preview" onClick={()=>setPreviewId(b.id)}>📄</button>
                      <button className="btn btn-teal btn-xs" title="Xuất PDF" onClick={()=>exportFile(b.id,'pdf',b.ma_bn)}>📥</button>
                      <button className="btn btn-danger btn-xs" title="Xóa" onClick={()=>del(b.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&(
                <tr><td colSpan={9} style={{textAlign:'center',color:'var(--text-light)',padding:'32px'}}>
                  {search?'Không tìm thấy kết quả':'Chưa có bảng kê nào'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div style={{padding:'10px 20px',borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'var(--text-light)'}}>
            <span>Hiển thị {filtered.length} bảng kê{search?` (lọc từ ${bills.length})`:''}
            {selectCount > 0 && <span style={{color:'var(--teal)',fontWeight:600}}> · Đã chọn {selectCount}</span>}
            </span>
            <span style={{fontWeight:600,color:'var(--text-mid)'}}>
              Tổng: <span style={{color:'var(--teal)',fontFamily:'JetBrains Mono,monospace'}}>
                {fmt(filtered.reduce((s,b)=>s+(b.total||0),0))}
              </span> VNĐ
            </span>
          </div>
        )}
      </div>

      {/* Create bill modal */}
      {showCreate&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>📋 Tạo bảng kê mới</h3>
              <button className="btn btn-outline btn-xs" onClick={()=>setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Bệnh nhân (*)</label>
                <select className="form-input form-select" value={newBill.patient_id}
                  onChange={e=>setNewBill(v=>({...v,patient_id:e.target.value}))}>
                  <option value="">-- Chọn bệnh nhân --</option>
                  {patients.map(p=>(
                    <option key={p.id} value={p.id}>{p.ma_bn} — {p.ho_ten}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ngày khám</label>
                <input className="form-input" placeholder="DD/MM/YYYY"
                  value={newBill.ngay_kham} onChange={e=>setNewBill(v=>({...v,ngay_kham:e.target.value}))}/>
              </div>
              <div style={{fontSize:12,color:'var(--text-light)',background:'var(--cream)',padding:'10px 12px',borderRadius:8}}>
                💡 Sau khi tạo, bảng kê sẽ mở ngay để bạn thêm dịch vụ.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowCreate(false)}>Hủy</button>
              <button className="btn btn-teal" onClick={createBill} disabled={saving}>{saving?'⏳':'+'} Tạo</button>
            </div>
          </div>
        </div>
      )}

      {viewId&&<BillDetailModal billId={viewId} onClose={()=>{setViewId(null);load()}} toast={toast}/>}
      {previewId&&<PreviewModal
        billId={previewId}
        onClose={()=>setPreviewId(null)}
        onExportWord={async()=>exportFile(previewId,'word',bills.find(b=>b.id===previewId)?.ma_bn)}
        onExportPdf={async()=>exportFile(previewId,'pdf',bills.find(b=>b.id===previewId)?.ma_bn)}
      />}
    </div>
  )
}

/* ── Patients Page ── */
function PatientsPage({toast}) {
  const [patients, setPatients] = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editPt, setEditPt]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [newPt, setNewPt] = useState({ma_bn:'',ho_ten:'',gioi_tinh:'Nam',ngay_sinh:'',dia_chi:''})

  const load = useCallback(async(q='')=>{
    setLoading(true)
    try {
      const r = q
        ? await axios.get(`${API}/patients/search?q=${encodeURIComponent(q)}`)
        : await axios.get(`${API}/patients`)
      setPatients(r.data)
    } catch(e){}
    setLoading(false)
  },[])

  useEffect(()=>{load('')},[])
  useEffect(()=>{
    const t = setTimeout(()=>load(search), 300)
    return ()=>clearTimeout(t)
  },[search])

  const createPt = async() => {
    if(!newPt.ma_bn.trim()||!newPt.ho_ten.trim()) return toast.add('Nhập đủ Mã BN và Họ tên','error')
    setSaving(true)
    try {
      await axios.post(`${API}/patients`, newPt)
      toast.add('Đã thêm bệnh nhân!'); setShowCreate(false)
      setNewPt({ma_bn:'',ho_ten:'',gioi_tinh:'Nam',ngay_sinh:'',dia_chi:''})
      load('')
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
    setSaving(false)
  }

  const updatePt = async() => {
    setSaving(true)
    try {
      await axios.put(`${API}/patients/${editPt.id}`, editPt)
      toast.add('Đã cập nhật!'); setEditPt(null); load(search)
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
    setSaving(false)
  }

  const deletePt = async(id) => {
    if(!confirm('Xóa bệnh nhân này? Toàn bộ bảng kê cũng sẽ bị xóa.')) return
    try { await axios.delete(`${API}/patients/${id}`); toast.add('Đã xóa'); load(search) }
    catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
  }

  const FIELDS = [
    {key:'ma_bn',    label:'Mã BN (*)',       placeholder:'VD: 617592',   readOnly:editPt!==null},
    {key:'ho_ten',   label:'Họ tên (*)',       placeholder:'NGUYỄN VĂN A'},
    {key:'gioi_tinh',label:'Giới tính',        type:'select', options:['Nam','Nữ','Khác']},
    {key:'ngay_sinh',label:'Ngày sinh',        placeholder:'DD/MM/YYYY'},
    {key:'dia_chi',  label:'Địa chỉ',         placeholder:'Số nhà, Phường/Xã, Tỉnh/TP', full:true},
  ]

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3>👥 Danh sách bệnh nhân ({patients.length})</h3>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div className="search-bar">
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}}>🔍</span>
              <input placeholder="Tìm theo tên hoặc mã BN..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowCreate(true)}>+ Thêm BN</button>
          </div>
        </div>
        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã BN</th><th>Họ tên</th><th>Giới tính</th><th>Ngày sinh</th>
                <th>Địa chỉ</th><th style={{textAlign:'center'}}>Số lần khám</th>
                <th style={{textAlign:'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p=>(
                <tr key={p.id}>
                  <td><span className="badge badge-teal">{p.ma_bn}</span></td>
                  <td><strong>{p.ho_ten}</strong></td>
                  <td>{p.gioi_tinh}</td>
                  <td className="text-sm text-muted">{p.ngay_sinh}</td>
                  <td className="text-sm text-muted" style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.dia_chi}</td>
                  <td style={{textAlign:'center'}}><span className="badge badge-navy">{p.so_lan_kham} lần</span></td>
                  <td>
                    <div style={{display:'flex',gap:3,justifyContent:'center'}}>
                      <button className="btn btn-outline btn-xs" title="Sửa"
                        onClick={()=>setEditPt({...p})}>✏</button>
                      <button className="btn btn-danger btn-xs" title="Xóa"
                        onClick={()=>deletePt(p.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading&&patients.length===0&&<tr><td colSpan={7} style={{textAlign:'center',color:'var(--text-light)',padding:'32px'}}>
                {search?'Không tìm thấy':'Chưa có bệnh nhân nào'}
              </td></tr>}
              {loading&&<tr><td colSpan={7} style={{textAlign:'center',padding:'32px'}}>⏳</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreate&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Thêm bệnh nhân mới</h3>
              <button className="btn btn-outline btn-xs" onClick={()=>setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {FIELDS.map(({key,label,placeholder,type,options,full,readOnly})=>(
                  <div key={key} className="form-group" style={{marginBottom:0,gridColumn:full?'1/-1':'auto'}}>
                    <label className="form-label">{label}</label>
                    {type==='select'
                      ? <select className="form-input form-select" value={newPt[key]}
                          onChange={e=>setNewPt(v=>({...v,[key]:e.target.value}))}>
                          {options.map(o=><option key={o}>{o}</option>)}
                        </select>
                      : <input className="form-input" placeholder={placeholder||''}
                          value={newPt[key]} readOnly={readOnly}
                          onChange={e=>!readOnly&&setNewPt(v=>({...v,[key]:e.target.value}))}/>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowCreate(false)}>Hủy</button>
              <button className="btn btn-teal" onClick={createPt} disabled={saving}>{saving?'⏳':'+'} Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editPt&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>✏ Sửa bệnh nhân — <span style={{color:'var(--teal)'}}>{editPt.ma_bn}</span></h3>
              <button className="btn btn-outline btn-xs" onClick={()=>setEditPt(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {FIELDS.filter(f=>f.key!=='ma_bn').map(({key,label,placeholder,type,options,full})=>(
                  <div key={key} className="form-group" style={{marginBottom:0,gridColumn:full?'1/-1':'auto'}}>
                    <label className="form-label">{label}</label>
                    {type==='select'
                      ? <select className="form-input form-select" value={editPt[key]||''}
                          onChange={e=>setEditPt(v=>({...v,[key]:e.target.value}))}>
                          {options.map(o=><option key={o}>{o}</option>)}
                        </select>
                      : <input className="form-input" placeholder={placeholder||''}
                          value={editPt[key]||''} onChange={e=>setEditPt(v=>({...v,[key]:e.target.value}))}/>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setEditPt(null)}>Hủy</button>
              <button className="btn btn-teal" onClick={updatePt} disabled={saving}>{saving?'⏳':'💾'} Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Services Page ── */
function ServicesPage({toast}) {
  const [groups,setGroups]=useState([])
  const [showAddSvc,setShowAddSvc]=useState(null)
  const [showAddGrp,setShowAddGrp]=useState(false)
  const [editSvc,setEditSvc]=useState(null)
  const [newSvc,setNewSvc]=useState({name:'',unit:'Lần',price:'',bhyt_price:''})
  const [newGrp,setNewGrp]=useState({name:'',display_order:0})
  const [saving,setSaving]=useState(false)
  const [search,setSearch]=useState('')
  const [importing,setImporting]=useState(false)
  const [importResult,setImportResult]=useState(null)
  const importRef=useRef()

  const load=()=>axios.get(`${API}/service-groups`).then(r=>setGroups(r.data)).catch(()=>{})
  useEffect(()=>{load()},[])

  const addService=async gid=>{
    if(!newSvc.name.trim()) return toast.add('Vui lòng nhập tên dịch vụ','error')
    setSaving(true)
    try{
      await axios.post(`${API}/services`,{name:newSvc.name.trim(),unit:newSvc.unit,price:parseFloat(newSvc.price)||null,bhyt_price:parseFloat(newSvc.bhyt_price)||null,group_id:gid,display_order:99})
      toast.add('Đã thêm dịch vụ');setShowAddSvc(null);setNewSvc({name:'',unit:'Lần',price:'',bhyt_price:''});load()
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setSaving(false)
  }
  const updateService=async()=>{
    setSaving(true)
    try{
      await axios.put(`${API}/services/${editSvc.id}`,{name:editSvc.name,unit:editSvc.unit,price:parseFloat(editSvc.price)||null,bhyt_price:parseFloat(editSvc.bhyt_price)||null})
      toast.add('Đã cập nhật');setEditSvc(null);load()
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setSaving(false)
  }
  const delService=async id=>{
    if(!confirm('Xóa dịch vụ này?')) return
    await axios.delete(`${API}/services/${id}`);toast.add('Đã xóa');load()
  }
  const delGroup=async id=>{
    if(!confirm('Xóa nhóm này sẽ xóa toàn bộ dịch vụ bên trong. Bạn chắc chắn?')) return
    try{
      await axios.delete(`${API}/service-groups/${id}`)
      toast.add('Đã xóa nhóm dịch vụ')
      load()
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi khi xóa nhóm','error')}
  }
  const addGroup=async()=>{
    if(!newGrp.name.trim()) return
    setSaving(true)
    try{
      await axios.post(`${API}/service-groups`,newGrp);toast.add('Đã thêm nhóm')
      setShowAddGrp(false);setNewGrp({name:'',display_order:0});load()
    }catch(e){toast.add(e.response?.data?.detail||'Lỗi','error')}
    setSaving(false)
  }

  const handleImport = async(file)=>{
    if(!file) return
    if(!file.name.match(/\.xlsx?$/i)){ toast.add('Vui lòng chọn file Excel (.xlsx)','error'); return }
    setImporting(true); setImportResult(null)
    try{
      const fd = new FormData(); fd.append('file', file)
      const res = await axios.post(`${API}/services/import-excel`, fd)
      setImportResult(res.data)
      toast.add(`Nhập thành công: ${res.data.created} mới, ${res.data.updated} cập nhật`)
      load()
    }catch(e){ toast.add(e.response?.data?.detail||'Lỗi khi nhập file','error') }
    setImporting(false)
  }

  const handleExport = async()=>{
    try{
      const res = await axios.get(`${API}/services/export-excel`,{responseType:'blob'})
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href=url; a.download='danh_muc_dich_vu.xlsx'; a.click()
      URL.revokeObjectURL(url)
    }catch(e){ toast.add('Lỗi khi xuất file','error') }
  }

  const filtered = groups.map(g=>({
    ...g,
    services: g.services.filter(s=>!search||s.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(g=>!search||g.services.length>0)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,gap:12,flexWrap:'wrap'}}>
        <div className="search-bar" style={{maxWidth:320}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}}>🔍</span>
          <input placeholder="Tìm dịch vụ..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:12,color:'var(--text-light)'}}>{groups.reduce((s,g)=>s+g.services.length,0)} dịch vụ · {groups.length} nhóm</span>
          {/* Export template */}
          <button className="btn btn-outline btn-sm" onClick={handleExport} title="Tải file Excel mẫu / danh sách hiện tại">
            📥 Xuất Excel
          </button>
          {/* Import */}
          <button className="btn btn-outline btn-sm" onClick={()=>importRef.current?.click()} disabled={importing}>
            {importing ? '⏳ Đang nhập...' : '📤 Nhập Excel'}
          </button>
          <input ref={importRef} type="file" accept=".xlsx,.xls" style={{display:'none'}}
            onChange={e=>{handleImport(e.target.files[0]); e.target.value=''}}/>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowAddGrp(true)}>+ Thêm nhóm</button>
        </div>
      </div>

      {/* Import result */}
      {importResult&&(
        <div style={{
          marginBottom:16,padding:'12px 16px',borderRadius:10,
          background:'rgba(26,122,74,0.08)',border:'1px solid rgba(26,122,74,0.2)',
          display:'flex',alignItems:'center',justifyContent:'space-between',
        }}>
          <div style={{fontSize:13}}>
            ✅ Nhập thành công:
            <span style={{fontWeight:700,color:'var(--green)',marginLeft:6}}>{importResult.created} dịch vụ mới</span>
            {importResult.updated>0&&<span style={{fontWeight:700,color:'var(--teal)',marginLeft:8}}>· {importResult.updated} cập nhật</span>}
            {importResult.skipped>0&&<span style={{color:'var(--text-light)',marginLeft:8}}>· {importResult.skipped} bỏ qua</span>}
          </div>
          <button className="btn btn-xs btn-outline" onClick={()=>setImportResult(null)}>✕</button>
        </div>
      )}

      {filtered.map(grp=>(
        <div key={grp.id} className="service-group-card">
          <div className="service-group-header">
            <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
              <span>{grp.name} <span style={{opacity:0.6,fontWeight:400,fontSize:12}}>({grp.services.length})</span></span>
              <span style={{marginLeft:'auto',fontSize:10,opacity:0.5,fontWeight:400,display:'flex',gap:20,paddingRight:8}}>
                <span style={{width:130,textAlign:'right'}}>Giá BV</span>
                <span style={{width:130,textAlign:'right'}}>Giá BHYT</span>
              </span>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
              <button className="btn btn-xs" style={{background:'rgba(255,255,255,0.15)',color:'white',border:'none'}}
                onClick={()=>{setShowAddSvc(grp.id);setNewSvc({name:'',unit:'Lần',price:'',bhyt_price:''})}}>
                + Thêm DV
              </button>
              <button className="btn btn-xs" title="Xóa nhóm"
                style={{background:'rgba(192,57,43,0.7)',color:'white',border:'none'}}
                onClick={()=>delGroup(grp.id)}>
                🗑 Xóa nhóm
              </button>
            </div>
          </div>
          {showAddSvc===grp.id&&(
            <div style={{padding:'12px 16px',background:'var(--cream)',borderBottom:'1px solid var(--cream-dark)',display:'flex',gap:8,flexWrap:'wrap',alignItems:'flex-end'}}>
              <div style={{flex:3,minWidth:200}}><div className="form-label">Tên dịch vụ</div><input className="form-input" placeholder="Tên..." value={newSvc.name} onChange={e=>setNewSvc({...newSvc,name:e.target.value})}/></div>
              <div style={{flex:1,minWidth:80}}><div className="form-label">Đơn vị</div><input className="form-input" value={newSvc.unit} onChange={e=>setNewSvc({...newSvc,unit:e.target.value})}/></div>
              <div style={{flex:1,minWidth:110}}><div className="form-label">Đơn giá BV</div><input className="form-input" type="number" placeholder="0" value={newSvc.price} onChange={e=>setNewSvc({...newSvc,price:e.target.value})}/></div>
              <div style={{flex:1,minWidth:110}}><div className="form-label">Đơn giá BHYT</div><input className="form-input" type="number" placeholder="(không có)" value={newSvc.bhyt_price||''} onChange={e=>setNewSvc({...newSvc,bhyt_price:e.target.value})}/></div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-teal btn-sm" onClick={()=>addService(grp.id)} disabled={saving}>{saving?'⏳':'✓'} Lưu</button>
                <button className="btn btn-outline btn-sm" onClick={()=>setShowAddSvc(null)}>✕</button>
              </div>
            </div>
          )}
          {grp.services.map(svc=>(
            <div key={svc.id} className="service-row">
              <span className="service-name">{svc.name}</span>
              <span className="service-unit" style={{textAlign:'center'}}>{svc.unit}</span>
              {/* Đơn giá BV */}
              <span style={{
                width:130,textAlign:'right',flexShrink:0,
                fontFamily:'JetBrains Mono,monospace',fontSize:12,
                fontWeight:600,color:'var(--navy)',
              }}>
                {svc.price ? fmt(svc.price)+' đ' : <span style={{color:'var(--border)'}}>—</span>}
              </span>
              {/* Đơn giá BHYT */}
              <span style={{
                width:130,textAlign:'right',flexShrink:0,
                fontFamily:'JetBrains Mono,monospace',fontSize:12,
                fontWeight:600,
                color: svc.bhyt_price ? 'var(--gold)' : 'var(--border)',
              }}>
                {svc.bhyt_price ? fmt(svc.bhyt_price)+' đ' : '—'}
              </span>
              <div style={{display:'flex',gap:4}}>
                <button className="btn btn-outline btn-xs" onClick={()=>setEditSvc({...svc})}>✏</button>
                <button className="btn btn-danger btn-xs" onClick={()=>delService(svc.id)}>🗑</button>
              </div>
            </div>
          ))}
          {grp.services.length===0&&!showAddSvc&&<div style={{padding:'14px 16px',textAlign:'center',color:'var(--text-light)',fontSize:12}}>Chưa có dịch vụ nào</div>}
        </div>
      ))}

      {editSvc&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Chỉnh sửa dịch vụ</h3><button className="btn btn-outline btn-xs" onClick={()=>setEditSvc(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Tên dịch vụ</label><input className="form-input" value={editSvc.name} onChange={e=>setEditSvc({...editSvc,name:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Đơn vị tính</label><input className="form-input" value={editSvc.unit} onChange={e=>setEditSvc({...editSvc,unit:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Đơn giá BV (VNĐ)</label><input className="form-input" type="number" value={editSvc.price||''} onChange={e=>setEditSvc({...editSvc,price:e.target.value})}/></div>
              <div className="form-group">
                <label className="form-label">Đơn giá BHYT (VNĐ)
                  <span style={{fontSize:10,fontWeight:400,color:'var(--text-light)',marginLeft:6}}>Giá trần do BHYT quy định</span>
                </label>
                <input className="form-input" type="number" placeholder="Để trống nếu không có"
                  value={editSvc.bhyt_price||''} onChange={e=>setEditSvc({...editSvc,bhyt_price:e.target.value})}/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setEditSvc(null)}>Hủy</button>
              <button className="btn btn-teal" onClick={updateService} disabled={saving}>{saving?'⏳':'✓'} Lưu</button>
            </div>
          </div>
        </div>
      )}
      {showAddGrp&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Thêm nhóm dịch vụ</h3><button className="btn btn-outline btn-xs" onClick={()=>setShowAddGrp(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Tên nhóm</label><input className="form-input" placeholder="VD: Xét nghiệm..." value={newGrp.name} onChange={e=>setNewGrp({...newGrp,name:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Thứ tự hiển thị</label><input className="form-input" type="number" value={newGrp.display_order} onChange={e=>setNewGrp({...newGrp,display_order:parseInt(e.target.value)||0})}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowAddGrp(false)}>Hủy</button>
              <button className="btn btn-teal" onClick={addGroup} disabled={saving}>{saving?'⏳':'+'} Tạo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── App ── */
const PAGE_META = {
  dashboard:{title:'Tổng quan',         desc:'Thống kê và hoạt động gần đây'},
  upload:   {title:'Nhập dữ liệu Excel', desc:'Tải file nghiệm thu và tạo bảng kê tự động'},
  bills:    {title:'Danh sách bảng kê',  desc:'Xem, sửa, preview và xuất bảng kê'},
  packages: {title:'Gói khám',           desc:'Tạo và quản lý gói khám, phân công bệnh nhân, xuất hàng loạt'},
  patients: {title:'Bệnh nhân',          desc:'Danh sách bệnh nhân đã đăng ký'},
  services:  {title:'Quản lý dịch vụ',   desc:'Cấu hình danh mục dịch vụ và đơn giá'},
  templates: {title:'Mẫu in',              desc:'Quản lý các mẫu Word để xuất bảng kê'},
}

export default function App() {
  const [page, setPage]           = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toast = useToast()
  const meta  = PAGE_META[page]

  const navigate = (p) => { setPage(p); setSidebarOpen(false) }

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen?'open':''}`}
        onClick={()=>setSidebarOpen(false)}/>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen?'open':''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🏥</div>
          <h1>Bệnh Viện Hồng Đức II</h1>
          <p>Bảng kê chi phí</p>
        </div>
        <nav className="sidebar-nav">
          {navs.map(nav=>(
            <div key={nav.id}
              className={`nav-item ${page===nav.id?'active':''}`}
              onClick={()=>navigate(nav.id)}>
              <span style={{fontSize:16}}>{nav.icon}</span>
              <span>{nav.label}</span>
            </div>
          ))}
        </nav>
        <div style={{padding:'16px',borderTop:'1px solid rgba(255,255,255,0.1)',fontSize:11,color:'rgba(255,255,255,0.3)'}}>
          v1.0 · Hồng Đức II
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button className="mobile-menu-btn" onClick={()=>setSidebarOpen(v=>!v)}>☰</button>
            <div>
              <h2>{meta.title}</h2>
              <p>{meta.desc}</p>
            </div>
          </div>
        </div>
        <div className="page-content">
          {page==='dashboard'&&<Dashboard setPage={setPage}/>}
          {page==='upload'&&<UploadPage toast={toast} setPage={setPage}/>}
          {page==='bills'&&<BillsPage toast={toast}/>}
          {page==='packages'&&<PackagesPage toast={toast}/>}
          {page==='patients'&&<PatientsPage toast={toast}/>}
          {page==='services'&&<ServicesPage toast={toast}/>}
          {page==='templates'&&<TemplatesPage toast={toast}/>}
        </div>
      </div>
      <Toast toasts={toast.toasts}/>
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════
   GÓI KHÁM PAGE
   ══════════════════════════════════════════════════════════════════ */

/* ── Package Detail Modal ── */
function PackageDetailModal({pkgId, onClose, toast}) {
  const [pkg, setPkg]             = useState(null)
  const [groups, setGroups]       = useState([])
  const [patients, setPatients]   = useState([])
  const [tab, setTab]             = useState('services') // services|patients
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [exporting, setExporting] = useState(false)

  // Add service
  const [showAddSvc, setShowAddSvc]   = useState(false)
  const [selSvcs, setSelSvcs]         = useState(new Set())

  // Add patient
  const [showAddPt, setShowAddPt]     = useState(false)
  const [ptSearch, setPtSearch]       = useState('')
  const [ptResults, setPtResults]     = useState([])
  const [selPts, setSelPts]           = useState(new Set())
  const [ngayKham, setNgayKham]       = useState('')
  const [importPtRef] = useState({current: null})

  // Edit service inline
  const [editSvcId, setEditSvcId]     = useState(null)
  const [editSvcVals, setEditSvcVals] = useState({})

  const load = async () => {
    const [p, g, al] = await Promise.all([
      axios.get(`${API}/packages/${pkgId}`),
      axios.get(`${API}/service-groups`),
      axios.get(`${API}/patients/search?q=`),
    ])
    setPkg(p.data); setGroups(g.data); setPatients(al.data)
    setLoading(false)
  }
  useEffect(()=>{load()},[pkgId])

  const searchPatients = async(q) => {
    const r = await axios.get(`${API}/patients/search?q=${encodeURIComponent(q)}`)
    setPtResults(r.data)
  }
  useEffect(()=>{ searchPatients(ptSearch) },[ptSearch])

  // Add selected services
  const addServices = async() => {
    if(!selSvcs.size) return
    setSaving(true)
    try {
      const res = await axios.post(`${API}/packages/${pkgId}/services/bulk`,
        {service_ids:[...selSvcs]})
      setPkg(res.data); setSelSvcs(new Set()); setShowAddSvc(false)
      toast.add(`Đã thêm ${selSvcs.size} dịch vụ!`)
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
    setSaving(false)
  }

  // Update service
  const updateSvc = async(psId) => {
    setSaving(true)
    try {
      const res = await axios.put(`${API}/packages/${pkgId}/services/${psId}`, editSvcVals)
      setPkg(res.data); setEditSvcId(null)
      toast.add('Đã cập nhật!')
    } catch(e){ toast.add('Lỗi','error') }
    setSaving(false)
  }

  // Remove service
  const removeSvc = async(psId) => {
    if(!confirm('Xóa dịch vụ này khỏi gói?')) return
    try {
      await axios.delete(`${API}/packages/${pkgId}/services/${psId}`)
      await load(); toast.add('Đã xóa')
    } catch(e){ toast.add('Lỗi','error') }
  }

  // Add patients
  const addPatients = async() => {
    if(!selPts.size) return toast.add('Chọn ít nhất 1 bệnh nhân','error')
    setSaving(true)
    try {
      const res = await axios.post(`${API}/packages/${pkgId}/patients`,
        {patient_ids:[...selPts], ngay_kham:ngayKham})
      setPkg(res.data.package); setSelPts(new Set()); setShowAddPt(false)
      toast.add(`Đã thêm ${res.data.added.length} bệnh nhân và tạo bảng kê!`)
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
    setSaving(false)
  }

  // Remove patient
  const removePt = async(ppId) => {
    if(!confirm('Xóa bệnh nhân khỏi gói? (Bảng kê vẫn giữ lại)')) return
    try {
      await axios.delete(`${API}/packages/${pkgId}/patients/${ppId}`)
      await load(); toast.add('Đã xóa')
    } catch(e){ toast.add('Lỗi','error') }
  }

  // Export
  const exportPkg = async(fmt, ptIds=null) => {
    setExporting(true)
    try {
      const res = await axios.post(`${API}/packages/${pkgId}/export`,
        {format:fmt, patient_ids:ptIds})
      const {zip_base64, filename, success_count, errors} = res.data
      const bytes = Uint8Array.from(atob(zip_base64), c=>c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes],{type:'application/zip'}))
      const a = document.createElement('a'); a.href=url; a.download=filename; a.click()
      URL.revokeObjectURL(url)
      toast.add(`Xuất thành công ${success_count} bảng kê!`)
      if(errors.length) toast.add(errors[0],'error')
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi xuất file','error') }
    setExporting(false)
  }

  // Import services from Excel
  const handleImportSvcs = async(file) => {
    if(!file) return
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await axios.post(`${API}/packages/${pkgId}/import-services-excel`, fd)
      setPkg(res.data.package)
      toast.add(`Nhập: ${res.data.added} mới, ${res.data.updated} cập nhật, ${res.data.skipped} bỏ qua`)
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi nhập file','error') }
  }

  // Import patients from Excel
  const handleImportPts = async(file) => {
    if(!file) return
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await axios.post(
        `${API}/packages/${pkgId}/import-patients-excel?ngay_kham=${encodeURIComponent(ngayKham)}`, fd)
      setPkg(res.data.package)
      toast.add(`Nhập: ${res.data.added} BN mới, ${res.data.not_found} không tìm thấy`)
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi nhập file','error') }
  }

  if(loading) return <div className="modal-overlay"><div className="modal" style={{padding:40,textAlign:'center'}}>⏳</div></div>
  if(!pkg) return null

  const pkgSvcIds = new Set(pkg.services.map(s=>s.service_id))
  const allSvcs = groups.flatMap(g=>g.services.map(s=>({...s,group_name:g.name})))

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg" style={{maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
        {/* Header */}
        <div className="modal-header" style={{flexShrink:0}}>
          <div>
            <h3>📦 {pkg.name}</h3>
            <div style={{fontSize:12,color:'var(--text-light)',marginTop:2}}>
              {pkg.service_count} dịch vụ · {pkg.patient_count} bệnh nhân
              · Tổng giá: <strong style={{color:'var(--teal)'}}>{fmt(pkg.total_price)} đ</strong>
            </div>
          </div>
          <div style={{display:'flex',gap:6}}>
            <button className="btn btn-outline btn-sm" onClick={()=>exportPkg('word')} disabled={exporting}>📄 Xuất Word</button>
            <button className="btn btn-teal btn-sm" onClick={()=>exportPkg('pdf')} disabled={exporting}>
              {exporting?'⏳...':'📥 Xuất PDF tất cả'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{padding:'0 22px',flexShrink:0,borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex'}}>
            {[{id:'services',label:`💊 Dịch vụ (${pkg.service_count})`},
              {id:'patients',label:`👥 Bệnh nhân (${pkg.patient_count})`}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer',
                border:'none',background:'transparent',fontFamily:'Be Vietnam Pro,sans-serif',
                borderBottom:tab===t.id?'2px solid var(--teal)':'2px solid transparent',
                color:tab===t.id?'var(--teal)':'var(--text-light)',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>

          {/* ── TAB: Dịch vụ ── */}
          {tab==='services'&&<>
            <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
              <button className="btn btn-teal btn-sm" onClick={()=>setShowAddSvc(v=>!v)}>
                {showAddSvc?'✕ Đóng':'➕ Thêm dịch vụ'}
              </button>
              <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}>
                📤 Nhập từ Excel
                <input type="file" accept=".xlsx,.xls" style={{display:'none'}}
                  onChange={e=>{handleImportSvcs(e.target.files[0]);e.target.value=''}}/>
              </label>
              {pkg.service_count>0&&<span style={{fontSize:12,color:'var(--text-light)',alignSelf:'center'}}>
                Tổng: {fmt(pkg.total_price)} đ
              </span>}
            </div>

            {/* Add service panel */}
            {showAddSvc&&(
              <div style={{border:'1px solid var(--teal)',borderRadius:10,padding:'14px',marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Chọn dịch vụ để thêm vào gói:</div>
                <div style={{maxHeight:260,overflowY:'auto',border:'1px solid var(--border)',borderRadius:8}}>
                  {groups.map(g=>(
                    <div key={g.id}>
                      <div style={{background:'var(--navy)',color:'white',padding:'5px 12px',fontSize:11,fontWeight:700}}>
                        {g.name}
                      </div>
                      {g.services.map(s=>{
                        const inPkg = pkgSvcIds.has(s.id)
                        const checked = selSvcs.has(s.id)
                        return (
                          <div key={s.id} style={{
                            display:'flex',alignItems:'center',gap:10,padding:'7px 12px',
                            borderBottom:'1px solid var(--cream-dark)',
                            background:inPkg?'var(--cream)':checked?'rgba(11,138,138,0.05)':'white',
                            opacity:inPkg?0.5:1,
                          }}>
                            <input type="checkbox" disabled={inPkg} checked={inPkg||checked}
                              onChange={()=>{
                                if(inPkg) return
                                setSelSvcs(ss=>{const n=new Set(ss);n.has(s.id)?n.delete(s.id):n.add(s.id);return n})
                              }}/>
                            <span style={{flex:1,fontSize:12}}>{s.name}</span>
                            <span style={{fontSize:11,color:'var(--text-light)'}}>{fmt(s.price)} đ</span>
                            {inPkg&&<span style={{fontSize:10,color:'var(--teal)'}}>✓ Đã có</span>}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8,marginTop:10,justifyContent:'flex-end'}}>
                  <span style={{fontSize:12,color:'var(--text-light)',alignSelf:'center'}}>
                    Đã chọn: {selSvcs.size}
                  </span>
                  <button className="btn btn-outline btn-sm" onClick={()=>{setSelSvcs(new Set());setShowAddSvc(false)}}>Hủy</button>
                  <button className="btn btn-teal btn-sm" onClick={addServices} disabled={saving||!selSvcs.size}>
                    {saving?'⏳':'✓'} Thêm {selSvcs.size} DV
                  </button>
                </div>
              </div>
            )}

            {/* Service list */}
            <div style={{border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              {pkg.services.length===0&&<div style={{padding:'32px',textAlign:'center',color:'var(--text-light)'}}>
                Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" hoặc "Nhập từ Excel".
              </div>}
              {pkg.services.map(ps=>(
                editSvcId===ps.id
                  ?<div key={ps.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:'1px solid var(--cream-dark)',background:'#fffbe6'}}>
                    <span style={{flex:1,fontSize:12}}>{ps.name}</span>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <div><div style={{fontSize:10,color:'var(--text-light)'}}>SL</div>
                        <input style={{width:50,padding:'3px 5px',fontSize:12,border:'1px solid var(--teal)',borderRadius:4}}
                          type="number" min="1" value={editSvcVals.so_luong||ps.so_luong}
                          onChange={e=>setEditSvcVals(v=>({...v,so_luong:parseInt(e.target.value)||1}))}/></div>
                      <div><div style={{fontSize:10,color:'var(--text-light)'}}>Giá BV</div>
                        <input style={{width:90,padding:'3px 5px',fontSize:12,border:'1px solid var(--teal)',borderRadius:4}}
                          type="number" value={editSvcVals.don_gia_bv??ps.don_gia_bv??''}
                          placeholder={fmt(ps.catalog_price)}
                          onChange={e=>setEditSvcVals(v=>({...v,don_gia_bv:parseFloat(e.target.value)||null}))}/></div>
                      <div><div style={{fontSize:10,color:'var(--text-light)'}}>Giá BHYT</div>
                        <input style={{width:90,padding:'3px 5px',fontSize:12,border:'1px solid var(--teal)',borderRadius:4}}
                          type="number" value={editSvcVals.don_gia_bh??ps.don_gia_bh??''}
                          placeholder={fmt(ps.catalog_bhyt_price)||'—'}
                          onChange={e=>setEditSvcVals(v=>({...v,don_gia_bh:parseFloat(e.target.value)||null}))}/></div>
                      <button className="btn btn-teal btn-xs" onClick={()=>updateSvc(ps.id)} disabled={saving}>✓</button>
                      <button className="btn btn-outline btn-xs" onClick={()=>setEditSvcId(null)}>✕</button>
                    </div>
                  </div>
                  :<div key={ps.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderBottom:'1px solid var(--cream-dark)'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:'var(--text)'}}>{ps.name}</div>
                      <div style={{fontSize:11,color:'var(--text-light)',marginTop:1}}>{ps.group_name}</div>
                    </div>
                    <span style={{fontSize:11,background:'var(--cream)',borderRadius:4,padding:'2px 6px'}}>{ps.so_luong}x</span>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--navy)',fontFamily:'JetBrains Mono,monospace',width:90,textAlign:'right'}}>{fmt(ps.don_gia_bv)} đ</span>
                    {ps.don_gia_bh?<span style={{fontSize:11,color:'var(--gold)',width:85,textAlign:'right'}}>BH:{fmt(ps.don_gia_bh)}</span>
                      :<span style={{width:85}}/>}
                    <div style={{display:'flex',gap:3}}>
                      <button className="btn btn-outline btn-xs" onClick={()=>{setEditSvcId(ps.id);setEditSvcVals({})}}>✏</button>
                      <button className="btn btn-danger btn-xs" onClick={()=>removeSvc(ps.id)}>🗑</button>
                    </div>
                  </div>
              ))}
            </div>
          </>}

          {/* ── TAB: Bệnh nhân ── */}
          {tab==='patients'&&<>
            <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <input className="form-input" style={{width:160}} placeholder="Ngày khám (dd/mm/yyyy)"
                value={ngayKham} onChange={e=>setNgayKham(e.target.value)}/>
              <button className="btn btn-teal btn-sm" onClick={()=>setShowAddPt(v=>!v)}>
                {showAddPt?'✕ Đóng':'➕ Thêm bệnh nhân'}
              </button>
              <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}>
                📤 Nhập Excel (Mã BN)
                <input type="file" accept=".xlsx,.xls" style={{display:'none'}}
                  onChange={e=>{handleImportPts(e.target.files[0]);e.target.value=''}}/>
              </label>
              {pkg.patient_count>0&&<>
                <button className="btn btn-outline btn-sm" onClick={()=>exportPkg('word')} disabled={exporting}>📄 Xuất Word tất cả</button>
                <button className="btn btn-teal btn-sm" onClick={()=>exportPkg('pdf')} disabled={exporting}>📥 Xuất PDF tất cả</button>
              </>}
            </div>

            {/* Add patient panel */}
            {showAddPt&&(
              <div style={{border:'1px solid var(--teal)',borderRadius:10,padding:'14px',marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Tìm và chọn bệnh nhân:</div>
                <input className="form-input" placeholder="🔍 Tìm theo tên hoặc mã BN..."
                  value={ptSearch} onChange={e=>setPtSearch(e.target.value)}
                  style={{marginBottom:8}}/>
                <div style={{maxHeight:220,overflowY:'auto',border:'1px solid var(--border)',borderRadius:8}}>
                  {(ptSearch?ptResults:patients).map(p=>{
                    const inPkg = pkg.patients.some(pp=>pp.patient_id===p.id)
                    const checked = selPts.has(p.id)
                    return (
                      <div key={p.id} style={{
                        display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
                        borderBottom:'1px solid var(--cream-dark)',
                        background:inPkg?'var(--cream)':checked?'rgba(11,138,138,0.05)':'white',
                        opacity:inPkg?0.5:1,cursor:inPkg?'default':'pointer',
                      }} onClick={()=>{
                        if(inPkg) return
                        setSelPts(ss=>{const n=new Set(ss);n.has(p.id)?n.delete(p.id):n.add(p.id);return n})
                      }}>
                        <input type="checkbox" readOnly checked={inPkg||checked} style={{pointerEvents:'none'}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600}}>{p.ho_ten}</div>
                          <div style={{fontSize:11,color:'var(--text-light)'}}>{p.ma_bn} · {p.ngay_sinh} · {p.gioi_tinh}</div>
                        </div>
                        {inPkg&&<span style={{fontSize:10,color:'var(--teal)'}}>✓ Đã có</span>}
                      </div>
                    )
                  })}
                </div>
                <div style={{display:'flex',gap:8,marginTop:10,justifyContent:'flex-end'}}>
                  <span style={{fontSize:12,color:'var(--text-light)',alignSelf:'center'}}>Đã chọn: {selPts.size}</span>
                  <button className="btn btn-outline btn-sm" onClick={()=>{setSelPts(new Set());setShowAddPt(false)}}>Hủy</button>
                  <button className="btn btn-teal btn-sm" onClick={addPatients} disabled={saving||!selPts.size}>
                    {saving?'⏳':'✓'} Thêm {selPts.size} bệnh nhân
                  </button>
                </div>
              </div>
            )}

            {/* Patient list */}
            <div style={{border:'1px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              {pkg.patients.length===0&&<div style={{padding:'32px',textAlign:'center',color:'var(--text-light)'}}>
                Chưa có bệnh nhân nào.
              </div>}
              {pkg.patients.map(pp=>(
                <div key={pp.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'1px solid var(--cream-dark)'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{pp.ho_ten}</div>
                    <div style={{fontSize:11,color:'var(--text-light)',marginTop:1}}>
                      {pp.ma_bn} · {pp.ngay_sinh} · {pp.gioi_tinh}
                    </div>
                    {pp.ngay_kham&&<div style={{fontSize:11,color:'var(--teal)',marginTop:1}}>📅 {pp.ngay_kham}</div>}
                  </div>
                  {pp.bill_id&&<span style={{fontSize:11,background:'rgba(11,138,138,0.1)',color:'var(--teal)',borderRadius:4,padding:'2px 6px'}}>
                    Bảng kê #{pp.bill_id}
                  </span>}
                  <div style={{display:'flex',gap:4}}>
                    {pp.bill_id&&<>
                      <button className="btn btn-outline btn-xs" title="Xuất Word"
                        onClick={()=>exportPkg('word',[pp.patient_id])}>📄</button>
                      <button className="btn btn-teal btn-xs" title="Xuất PDF"
                        onClick={()=>exportPkg('pdf',[pp.patient_id])}>📥</button>
                    </>}
                    <button className="btn btn-danger btn-xs" onClick={()=>removePt(pp.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}

/* ── PackagesPage ── */
function PackagesPage({toast}) {
  const [packages, setPackages]   = useState([])
  const [viewId, setViewId]       = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newPkg, setNewPkg]       = useState({name:'',description:''})
  const [editPkg, setEditPkg]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')

  const load = ()=>axios.get(`${API}/packages`).then(r=>setPackages(r.data)).catch(()=>{})
  useEffect(()=>{load()},[])

  const createPkg = async() => {
    if(!newPkg.name.trim()) return toast.add('Nhập tên gói khám','error')
    setSaving(true)
    try {
      await axios.post(`${API}/packages`, newPkg)
      toast.add('Đã tạo gói khám!'); setShowCreate(false); setNewPkg({name:'',description:''}); load()
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
    setSaving(false)
  }

  const updatePkg = async() => {
    setSaving(true)
    try {
      await axios.put(`${API}/packages/${editPkg.id}`, editPkg)
      toast.add('Đã cập nhật!'); setEditPkg(null); load()
    } catch(e){ toast.add('Lỗi','error') }
    setSaving(false)
  }

  const deletePkg = async(id) => {
    if(!confirm('Xóa gói khám này? Bảng kê của bệnh nhân vẫn giữ lại.')) return
    try { await axios.delete(`${API}/packages/${id}`); toast.add('Đã xóa'); load() }
    catch(e){ toast.add('Lỗi','error') }
  }

  const filtered = packages.filter(p=>
    p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-bar" style={{maxWidth:320}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}}>🔍</span>
          <input placeholder="Tìm gói khám..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={()=>setShowCreate(true)}>
          + Tạo gói khám
        </button>
      </div>

      {/* Package cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
        {filtered.map(p=>(
          <div key={p.id} className="card" style={{cursor:'pointer'}}
            onClick={()=>setViewId(p.id)}>
            <div style={{padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--navy)'}}>{p.name}</div>
                  {p.description&&<div style={{fontSize:12,color:'var(--text-light)',marginTop:3}}>{p.description}</div>}
                </div>
                <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                  <button className="btn btn-outline btn-xs" onClick={()=>setEditPkg({...p})}>✏</button>
                  <button className="btn btn-danger btn-xs" onClick={()=>deletePkg(p.id)}>🗑</button>
                </div>
              </div>
              <div style={{display:'flex',gap:16}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--teal)'}}>{p.service_count}</div>
                  <div style={{fontSize:11,color:'var(--text-light)'}}>Dịch vụ</div>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--navy)'}}>{p.patient_count}</div>
                  <div style={{fontSize:11,color:'var(--text-light)'}}>Bệnh nhân</div>
                </div>
                <div style={{textAlign:'center',marginLeft:'auto'}}>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--gold)',fontFamily:'JetBrains Mono,monospace'}}>{fmt(p.total_price)}</div>
                  <div style={{fontSize:11,color:'var(--text-light)'}}>VNĐ / lượt</div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&(
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'48px',color:'var(--text-light)'}}>
            {search?'Không tìm thấy gói khám nào':'Chưa có gói khám nào. Nhấn "+ Tạo gói khám" để bắt đầu.'}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Tạo gói khám mới</h3>
              <button className="btn btn-outline btn-xs" onClick={()=>setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Tên gói khám (*)</label>
                <input className="form-input" placeholder="VD: Gói khám sức khỏe tổng quát"
                  value={newPkg.name} onChange={e=>setNewPkg(v=>({...v,name:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Mô tả</label>
                <input className="form-input" placeholder="Mô tả ngắn về gói khám..."
                  value={newPkg.description} onChange={e=>setNewPkg(v=>({...v,description:e.target.value}))}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowCreate(false)}>Hủy</button>
              <button className="btn btn-teal" onClick={createPkg} disabled={saving}>{saving?'⏳':'+'} Tạo</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editPkg&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h3>Chỉnh sửa gói khám</h3>
              <button className="btn btn-outline btn-xs" onClick={()=>setEditPkg(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Tên gói khám</label>
                <input className="form-input" value={editPkg.name}
                  onChange={e=>setEditPkg(v=>({...v,name:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Mô tả</label>
                <input className="form-input" value={editPkg.description||''}
                  onChange={e=>setEditPkg(v=>({...v,description:e.target.value}))}/></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setEditPkg(null)}>Hủy</button>
              <button className="btn btn-teal" onClick={updatePkg} disabled={saving}>{saving?'⏳':'💾'} Lưu</button>
            </div>
          </div>
        </div>
      )}

      {viewId&&<PackageDetailModal pkgId={viewId} onClose={()=>{setViewId(null);load()}} toast={toast}/>}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MẪU IN (TEMPLATES) PAGE
   ══════════════════════════════════════════════════════════════════ */
function TemplatesPage({toast}) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editTpl, setEditTpl]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const uploadRef = useRef()

  // Upload form state
  const [uploadForm, setUploadForm] = useState({name:'', description:'', set_default:false})

  const load = async() => {
    try { const r = await axios.get(`${API}/templates`); setTemplates(r.data) }
    catch(e){ toast.add('Lỗi tải danh sách mẫu','error') }
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const handleUpload = async(file) => {
    if(!file) return
    if(!file.name.endsWith('.docx'))
      return toast.add('Chỉ chấp nhận file .docx (Word)','error')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('name', uploadForm.name || file.name.replace('.docx',''))
      fd.append('description', uploadForm.description)
      fd.append('set_default', uploadForm.set_default ? 'true' : 'false')
      await axios.post(`${API}/templates/upload`, fd)
      toast.add('Đã upload mẫu thành công!')
      setUploadForm({name:'',description:'',set_default:false})
      load()
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi upload','error') }
    setUploading(false)
  }

  const setDefault = async(id) => {
    try {
      await axios.put(`${API}/templates/${id}`, {is_default: true})
      toast.add('Đã đặt làm mẫu mặc định'); load()
    } catch(e){ toast.add('Lỗi','error') }
  }

  const updateTpl = async() => {
    setSaving(true)
    try {
      await axios.put(`${API}/templates/${editTpl.id}`, {
        name: editTpl.name, description: editTpl.description
      })
      toast.add('Đã cập nhật!'); setEditTpl(null); load()
    } catch(e){ toast.add('Lỗi','error') }
    setSaving(false)
  }

  const deleteTpl = async(id, name) => {
    if(!confirm(`Xóa mẫu "${name}"?\nCác bảng kê đã xuất không bị ảnh hưởng.`)) return
    try {
      await axios.delete(`${API}/templates/${id}`)
      toast.add('Đã xóa mẫu'); load()
    } catch(e){ toast.add(e.response?.data?.detail||'Lỗi','error') }
  }

  const downloadTpl = (id) => {
    window.open(`${API}/templates/${id}/download`, '_blank')
  }

  return (
    <div>
      {/* Upload section */}
      <div className="card mb-24">
        <div className="card-header"><h3>📤 Upload mẫu in mới</h3></div>
        <div className="card-body">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Tên hiển thị</label>
              <input className="form-input" placeholder="VD: Mẫu 01/KBCB chuẩn"
                value={uploadForm.name} onChange={e=>setUploadForm(v=>({...v,name:e.target.value}))}/>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Mô tả</label>
              <input className="form-input" placeholder="Ghi chú về mẫu này..."
                value={uploadForm.description} onChange={e=>setUploadForm(v=>({...v,description:e.target.value}))}/>
            </div>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,cursor:'pointer',color:'var(--text-mid)'}}>
              <input type="checkbox" checked={uploadForm.set_default}
                onChange={e=>setUploadForm(v=>({...v,set_default:e.target.checked}))}/>
              Đặt làm mẫu mặc định
            </label>
            <button className="btn btn-teal btn-sm" onClick={()=>uploadRef.current?.click()} disabled={uploading}>
              {uploading ? '⏳ Đang upload...' : '📁 Chọn file .docx'}
            </button>
            <input ref={uploadRef} type="file" accept=".docx" style={{display:'none'}}
              onChange={e=>{handleUpload(e.target.files[0]); e.target.value=''}}/>
            <span style={{fontSize:12,color:'var(--text-light)'}}>
              Chỉ chấp nhận file Word (.docx)
            </span>
          </div>
        </div>
      </div>

      {/* How to guide */}
      <div style={{
        background:'rgba(11,138,138,0.06)',border:'1px solid rgba(11,138,138,0.2)',
        borderRadius:10,padding:'14px 18px',marginBottom:20,
      }}>
        <div style={{fontWeight:700,fontSize:13,color:'var(--teal)',marginBottom:8}}>
          📖 Hướng dẫn tạo mẫu in mới
        </div>
        <div style={{fontSize:12,color:'var(--text-mid)',lineHeight:1.7}}>
          <strong>1. Tải mẫu hiện có</strong> → nhấn nút "📥 Tải về" để lấy file Word mẫu gốc.<br/>
          <strong>2. Chỉnh sửa trong Word</strong> → thay đổi logo, font chữ, layout, thêm bớt cột... nhưng <strong>giữ nguyên cấu trúc bảng 13 cột</strong> và các placeholder như <code style={{background:'var(--cream)',padding:'1px 4px',borderRadius:3}}>612939</code> (mã BN), các tab bold cho họ tên, địa chỉ...<br/>
          <strong>3. Lưu file .docx</strong> → upload lên đây, đặt tên và mô tả rõ ràng.<br/>
          <strong>4. Khi xuất bảng kê</strong> → chọn mẫu muốn dùng trong modal chi tiết hoặc để trống dùng mẫu mặc định (⭐).
        </div>
      </div>

      {/* Templates list */}
      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text-light)'}}>⏳ Đang tải...</div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:16}}>
        {templates.map(t=>(
          <div key={t.id} className="card" style={{
            border: t.is_default ? '2px solid var(--teal)' : '1px solid var(--border)',
          }}>
            <div style={{padding:'16px 18px'}}>
              {/* Header */}
              <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:12}}>
                <div style={{
                  fontSize:28,width:44,height:44,background:'var(--cream)',
                  borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                }}>📄</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{fontWeight:700,fontSize:14,color:'var(--navy)',
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'
                    }}>{t.name}</div>
                    {t.is_default&&<span style={{
                      fontSize:10,background:'var(--teal)',color:'white',
                      borderRadius:10,padding:'1px 7px',flexShrink:0,
                    }}>⭐ Mặc định</span>}
                  </div>
                  <div style={{fontSize:11,color:'var(--text-light)',marginTop:2}}>{t.filename}</div>
                  {t.description&&<div style={{fontSize:12,color:'var(--text-mid)',marginTop:4}}>{t.description}</div>}
                </div>
              </div>

              {/* Meta */}
              <div style={{display:'flex',gap:16,fontSize:11,color:'var(--text-light)',marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--cream-dark)'}}>
                <span>📦 {t.size_kb} KB</span>
                {t.created_at&&<span>🕐 {t.created_at}</span>}
              </div>

              {/* Actions */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <button className="btn btn-outline btn-xs" onClick={()=>downloadTpl(t.id)}
                  title="Tải file Word về để xem/chỉnh sửa">
                  📥 Tải về
                </button>
                {!t.is_default&&(
                  <button className="btn btn-outline btn-xs" onClick={()=>setDefault(t.id)}
                    title="Đặt làm mẫu mặc định khi xuất">
                    ⭐ Đặt mặc định
                  </button>
                )}
                <button className="btn btn-outline btn-xs" onClick={()=>setEditTpl({...t})}
                  title="Sửa tên và mô tả">
                  ✏ Sửa
                </button>
                {!t.is_default&&(
                  <button className="btn btn-danger btn-xs" onClick={()=>deleteTpl(t.id, t.name)}>
                    🗑 Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading&&templates.length===0&&(
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:48,color:'var(--text-light)'}}>
            Chưa có mẫu in nào. Upload file .docx để bắt đầu.
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editTpl&&(
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>✏ Chỉnh sửa mẫu in</h3>
              <button className="btn btn-outline btn-xs" onClick={()=>setEditTpl(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">File</label>
                <input className="form-input" value={editTpl.filename} readOnly
                  style={{background:'var(--cream)',color:'var(--text-light)'}}/>
              </div>
              <div className="form-group">
                <label className="form-label">Tên hiển thị</label>
                <input className="form-input" value={editTpl.name}
                  onChange={e=>setEditTpl(v=>({...v,name:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <input className="form-input" value={editTpl.description||''}
                  onChange={e=>setEditTpl(v=>({...v,description:e.target.value}))}/>
              </div>
              <div style={{fontSize:12,color:'var(--text-light)'}}>
                Để thay đổi file template, hãy upload file mới ở trên.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setEditTpl(null)}>Hủy</button>
              <button className="btn btn-teal" onClick={updateTpl} disabled={saving}>{saving?'⏳':'💾'} Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
