import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Image, Tag, ChevronRight } from 'lucide-react'
import { menuApi } from '../../api'
import toast from 'react-hot-toast'

const B = { dark:'#1a0a0e', brand:'#7e2b3f', gold:'#c9956b', cream:'#fdf6ee', blush:'#fdf2f4' }

// ─── ALLOWED IMAGE TYPES ───────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const ALLOWED_LABEL = 'JPEG or PNG'

// ─── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
function ImageUpload({ preview, onChange }) {
  const inputRef = useRef()
  const [drag, setDrag] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      return toast.error(`Only ${ALLOWED_LABEL} images are allowed`)
    }
    onChange(file, URL.createObjectURL(file))
  }

  return (
    <div>
      <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
        Item Image <span style={{ color:'rgba(126,43,63,0.4)', textTransform:'none', letterSpacing:0 }}>({ALLOWED_LABEL} only)</span>
      </div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault(); setDrag(false)
          const file = e.dataTransfer.files[0]
          if (file && !ALLOWED_TYPES.includes(file.type)) {
            return toast.error(`Only ${ALLOWED_LABEL} images are allowed`)
          }
          handleFile(file)
        }}
        style={{ width:'100%', height:180, borderRadius:14, overflow:'hidden', border:`2px dashed ${drag ? B.brand : 'rgba(126,43,63,0.2)'}`, background: drag ? 'rgba(126,43,63,0.05)' : B.blush, cursor:'pointer', position:'relative', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', boxSizing:'border-box' }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }} />
            <div style={{ position:'absolute', inset:0, background:'rgba(26,10,14,0.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0}
            >
              <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', color:B.cream, letterSpacing:'0.1em' }}>Change Image</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign:'center', padding:16 }}>
            <Image size={28} color='rgba(126,43,63,0.2)' style={{ margin:'0 auto 10px', display:'block' }} />
            <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', color:'rgba(126,43,63,0.3)', letterSpacing:'0.06em' }}>Click or drag image here</div>
            <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.58rem', color:'rgba(126,43,63,0.2)', marginTop:4 }}>{ALLOWED_LABEL} · fills to cover automatically</div>
          </div>
        )}
      </div>
      {preview && (
        <button type="button" onClick={e => { e.stopPropagation(); onChange(null, null) }}
          style={{ marginTop:6, fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'rgba(220,38,38,0.45)', letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:'none', cursor:'pointer', padding:0 }}>
          Remove image
        </button>
      )}
      {/* accept only jpeg/png */}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}

// ─── ITEM MODAL ────────────────────────────────────────────────────────────────
function ItemModal({ item, categories, onClose, onSaved }) {
  const isEdit = !!item?.id
  const [form, setForm] = useState({
    name:           item?.name           || '',
    name_ar:        item?.name_ar        || '',
    description:    item?.description    || '',
    description_ar: item?.description_ar || '',
    price:          item?.price          || '',
    category_id:    item?.category_id    || (categories[0]?.id || ''),
    available:      item?.available      ?? true,
  })
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.image || null)
  const [saving,       setSaving]       = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.price)       return toast.error('Price is required')
    if (!form.category_id) return toast.error('Please select a category')

    setSaving(true)
    try {
      const data = new FormData()

      // append each field explicitly (avoid iterating object which may miss types)
      data.append('name',           form.name.trim())
      data.append('name_ar',        form.name_ar.trim())
      data.append('description',    form.description.trim())
      data.append('description_ar', form.description_ar.trim())
      data.append('price',          form.price)
      data.append('category_id',    form.category_id)

      // FIX 3: boolean must be '1'/'0', never "true"/"false" string
      data.append('available', form.available ? '1' : '0')

      // FIX 4: image handling
      if (imageFile) {
        data.append('image', imageFile)
      } else if (!imagePreview && item?.image) {
        data.append('remove_image', '1')
      }

      if (isEdit) {
        await menuApi.updateItem(item.id, data)
        toast.success('Item updated')
      } else {
        await menuApi.createItem(data)
        toast.success('Item created')
      }
      onSaved()
    } catch (e) {
      console.error(e)
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Failed to save item'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid rgba(126,43,63,0.15)', fontFamily:'Montserrat,sans-serif', fontSize:'0.88rem', color:B.dark, background:'white', outline:'none', boxSizing:'border-box' }
  const labelStyle = { fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:8 }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:50 }} />
      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
        style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'calc(100% - 32px)', maxWidth:520, zIndex:60, background:'white', borderRadius:24, padding:28, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'0.9rem', color:B.dark, letterSpacing:'0.1em', textTransform:'uppercase' }}>{isEdit ? 'Edit Item' : 'New Item'}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc' }}><X size={20} /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <ImageUpload preview={imagePreview} onChange={(f, p) => { setImageFile(f); setImagePreview(p) }} />

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            {categories.length === 0 ? (
              <div style={{ padding:'12px 14px', borderRadius:12, border:'1.5px solid rgba(220,38,38,0.2)', background:'rgba(220,38,38,0.03)', fontFamily:'Montserrat,sans-serif', fontSize:'0.78rem', color:'#dc2626' }}>
                No categories yet — create one in the Categories tab first.
              </div>
            ) : (
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                style={{ ...inputStyle, cursor:'pointer' }}
                onFocus={e => e.target.style.borderColor=B.brand}
                onBlur={e  => e.target.style.borderColor='rgba(126,43,63,0.15)'}
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {[
            { key:'name',           label:'Name (EN)',        placeholder:'e.g. Cappuccino',      tag:'input',    type:'text'   },
            { key:'name_ar',        label:'Name (AR)',         placeholder:'مثال: كابتشينو',        tag:'input',    type:'text',   rtl:true },
            { key:'description',    label:'Description (EN)', placeholder:'Short description...',  tag:'textarea'               },
            { key:'description_ar', label:'Description (AR)', placeholder:'وصف مختصر...',          tag:'textarea',              rtl:true },
            { key:'price',          label:'Price (AED)',       placeholder:'0',                     tag:'input',    type:'number' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              {f.tag === 'textarea' ? (
                <textarea value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} rows={2} dir={f.rtl?'rtl':'ltr'} style={{ ...inputStyle, resize:'none' }} onFocus={e => e.target.style.borderColor=B.brand} onBlur={e => e.target.style.borderColor='rgba(126,43,63,0.15)'} />
              ) : (
                <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} dir={f.rtl?'rtl':'ltr'} style={inputStyle} onFocus={e => e.target.style.borderColor=B.brand} onBlur={e => e.target.style.borderColor='rgba(126,43,63,0.15)'} />
              )}
            </div>
          ))}

          {/* Available toggle */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:12, background:B.blush }}>
            <div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:'0.83rem', color:B.dark }}>Available on menu</div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.67rem', color:'#aaa', marginTop:2 }}>Customers can see and order this item</div>
            </div>
            <button type="button" onClick={() => set('available', !form.available)}
              style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', background: form.available ? B.brand : '#ddd', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:'white', position:'absolute', top:3, left: form.available ? 23 : 3, transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:12, border:'1.5px solid rgba(126,43,63,0.12)', background:'white', color:'#888', fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:2, padding:'13px', borderRadius:12, border:'none', background: saving ? '#ccc' : B.brand, color:B.cream, fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 6px 20px rgba(126,43,63,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {saving
              ? <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.8s linear infinite' }} />
              : (isEdit ? 'Save Changes' : 'Create Item')}
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── DELETE ITEM CONFIRM ───────────────────────────────────────────────────────
function DeleteConfirm({ item, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    try { await menuApi.deleteItem(item.id); toast.success('Item deleted'); onDeleted() }
    catch { toast.error('Failed to delete'); setDeleting(false) }
  }
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:50 }} />
      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
        style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:320, zIndex:60, background:'white', borderRadius:20, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}
      >
        <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'0.88rem', color:B.dark, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Delete Item</div>
        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.82rem', color:'#666', marginBottom:20, lineHeight:1.5 }}>
          Remove <strong>{item.name}</strong>? This cannot be undone.
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid rgba(0,0,0,0.08)', background:'white', color:'#888', fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:'0.7rem', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'#dc2626', color:'white', fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.7rem', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── CATEGORY MODAL ────────────────────────────────────────────────────────────
function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = !!category?.id
  const [name,   setName]   = useState(category?.name    || '')
  const [nameAr, setNameAr] = useState(category?.name_ar || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Category name is required')
    setSaving(true)
    try {
      if (isEdit) {
        await menuApi.updateCategory(category.id, { name: name.trim(), name_ar: nameAr.trim() })
        toast.success('Category updated')
      } else {
        await menuApi.createCategory({ name: name.trim(), name_ar: nameAr.trim() })
        toast.success('Category created')
      }
      onSaved()
    } catch (e) {
      console.error(e)
      toast.error(e?.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = { width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid rgba(126,43,63,0.15)', fontFamily:'Montserrat,sans-serif', fontSize:'0.88rem', color:B.dark, background:'white', outline:'none', boxSizing:'border-box' }
  const labelStyle = { fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:8 }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:50 }} />
      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
        style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'calc(100% - 32px)', maxWidth:420, zIndex:60, background:'white', borderRadius:24, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'0.9rem', color:B.dark, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            {isEdit ? 'Edit Category' : 'New Category'}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc' }}><X size={20} /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={labelStyle}>Name (EN)</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hot Drinks"
              style={inputStyle} onFocus={e => e.target.style.borderColor=B.brand} onBlur={e => e.target.style.borderColor='rgba(126,43,63,0.15)'} />
          </div>
          <div>
            <label style={labelStyle}>Name (AR)</label>
            <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: مشروبات ساخنة"
              dir="rtl" style={inputStyle} onFocus={e => e.target.style.borderColor=B.brand} onBlur={e => e.target.style.borderColor='rgba(126,43,63,0.15)'} />
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:12, border:'1.5px solid rgba(126,43,63,0.12)', background:'white', color:'#888', fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex:2, padding:'13px', borderRadius:12, border:'none', background: saving ? '#ccc' : B.brand, color:B.cream, fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 6px 20px rgba(126,43,63,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {saving
              ? <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.8s linear infinite' }} />
              : (isEdit ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── DELETE CATEGORY CONFIRM ───────────────────────────────────────────────────
function DeleteCategoryConfirm({ category, itemCount, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    try { await menuApi.deleteCategory(category.id); toast.success('Category deleted'); onDeleted() }
    catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete category')
      setDeleting(false)
    }
  }
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:50 }} />
      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
        style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:340, zIndex:60, background:'white', borderRadius:20, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}
      >
        <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'0.88rem', color:B.dark, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Delete Category</div>
        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.82rem', color:'#666', marginBottom:20, lineHeight:1.6 }}>
          Remove <strong>{category.name}</strong>?{' '}
          {itemCount > 0
            ? <span style={{ color:'#dc2626' }}>This category has <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} — they will be unlinked.</span>
            : 'This cannot be undone.'}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid rgba(0,0,0,0.08)', background:'white', color:'#888', fontFamily:'Montserrat,sans-serif', fontWeight:600, fontSize:'0.7rem', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex:1, padding:'11px', borderRadius:10, border:'none', background:'#dc2626', color:'white', fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.7rem', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

// ─── CATEGORIES TAB ────────────────────────────────────────────────────────────
function CategoriesTab({ categories, items, onRefresh }) {
  const [modal,      setModal]      = useState(null)
  const [activeItem, setActiveItem] = useState(null)

  const openCreate = ()    => { setActiveItem(null); setModal('create') }
  const openEdit   = (cat) => { setActiveItem(cat);  setModal('edit')   }
  const openDelete = (cat) => { setActiveItem(cat);  setModal('delete') }
  const closeModal = ()    => { setModal(null); setActiveItem(null) }
  const afterSave  = ()    => { closeModal(); onRefresh() }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', color:'#aaa' }}>
          {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
        </div>
        <button onClick={openCreate}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer', background:B.brand, color:B.cream, fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', boxShadow:'0 4px 14px rgba(126,43,63,0.25)' }}>
          <Plus size={14} /> New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign:'center', paddingTop:48 }}>
          <Tag size={32} color='rgba(126,43,63,0.15)' style={{ margin:'0 auto 12px', display:'block' }} />
          <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(126,43,63,0.3)', fontSize:'0.62rem', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:10 }}>No Categories Yet</div>
          <button onClick={openCreate} style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:700, color:B.brand, letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
            Create First Category
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {categories.map(cat => {
            const count = items.filter(i => i.category_id === cat.id).length
            return (
              <div key={cat.id} style={{ display:'flex', alignItems:'center', background:'white', borderRadius:14, border:'1px solid rgba(126,43,63,0.08)', padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:B.blush, display:'flex', alignItems:'center', justifyContent:'center', marginRight:14, flexShrink:0 }}>
                  <Tag size={16} color={B.brand} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.88rem', color:B.dark, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cat.name}</div>
                  {cat.name_ar && (
                    <div style={{ fontFamily:'Noto Naskh Arabic,serif', fontSize:'0.75rem', color:'#aaa', marginTop:1 }} dir="rtl">{cat.name_ar}</div>
                  )}
                </div>
                <div style={{ flexShrink:0, marginRight:12, padding:'3px 10px', borderRadius:20, background:'rgba(126,43,63,0.07)' }}>
                  <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:700, color:B.brand, letterSpacing:'0.06em' }}>
                    {count} item{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={() => openEdit(cat)} style={{ width:32, height:32, borderRadius:8, border:'none', cursor:'pointer', background:'rgba(126,43,63,0.07)', color:B.brand, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => openDelete(cat)} style={{ width:32, height:32, borderRadius:8, border:'none', cursor:'pointer', background:'rgba(220,38,38,0.06)', color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <CategoryModal key="cat-modal" category={modal === 'edit' ? activeItem : null} onClose={closeModal} onSaved={afterSave} />
        )}
        {modal === 'delete' && activeItem && (
          <DeleteCategoryConfirm key="cat-del" category={activeItem} itemCount={items.filter(i => i.category_id === activeItem.id).length} onClose={closeModal} onDeleted={afterSave} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminMenu() {
  const [categories, setCategories] = useState([])
  const [items,      setItems]      = useState([])
  const [activeCat,  setActiveCat]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [editItem,   setEditItem]   = useState(null)
  const [tab,        setTab]        = useState('items')  // 'items' | 'categories'

  const load = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([menuApi.getCategories(), menuApi.getAllItems()])
      const cats = catRes.data?.categories || []
      const itms = itemRes.data?.items      || []
      setCategories(cats)
      setItems(itms)
      if (!activeCat && cats.length > 0) setActiveCat(cats[0].id)
    } catch { toast.error('Failed to load menu') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered   = activeCat ? items.filter(i => i.category_id === activeCat) : items
  const closeModal = () => { setModal(null); setEditItem(null) }
  const afterSave  = () => { closeModal(); load() }

  const tabBtn = (key, label, icon) => (
    <button onClick={() => setTab(key)}
      style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.68rem', letterSpacing:'0.1em', textTransform:'uppercase', transition:'all 0.2s', background: tab === key ? B.brand : 'white', color: tab === key ? B.cream : '#999', boxShadow: tab === key ? '0 4px 12px rgba(126,43,63,0.2)' : '0 1px 4px rgba(0,0,0,0.06)' }}>
      {icon}{label}
    </button>
  )

  return (
    <div style={{ padding:24, maxWidth:900, margin:'0 auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1.1rem', color:B.dark, letterSpacing:'0.08em', textTransform:'uppercase' }}>Menu Management</div>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', color:'#aaa', marginTop:3 }}>{items.length} items · {categories.length} categories</div>
        </div>
        {tab === 'items' && (
          <button onClick={() => { setEditItem(null); setModal('item') }}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:12, border:'none', cursor:'pointer', background:B.brand, color:B.cream, fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.7rem', letterSpacing:'0.12em', textTransform:'uppercase', boxShadow:'0 6px 20px rgba(126,43,63,0.3)' }}>
            <Plus size={16} /> New Item
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {tabBtn('items',      'Items',      <ChevronRight size={13} />)}
        {tabBtn('categories', 'Categories', <Tag size={13} />)}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid rgba(126,43,63,0.15)', borderTopColor:B.brand, animation:'spin 0.8s linear infinite' }} />
        </div>
      ) : tab === 'categories' ? (
        <CategoriesTab categories={categories} items={items} onRefresh={load} />
      ) : (
        <>
          {/* Category filter tabs */}
          <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:20, paddingBottom:2 }}>
            {[{ id:null, name:`All (${items.length})` }, ...categories.map(c => ({ id:c.id, name:`${c.name} (${items.filter(i=>i.category_id===c.id).length})` }))].map(t => (
              <button key={t.id} onClick={() => setActiveCat(t.id)}
                style={{ flexShrink:0, padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', background: activeCat===t.id ? B.brand : 'white', color: activeCat===t.id ? B.cream : '#aaa', boxShadow: activeCat===t.id ? '0 4px 12px rgba(126,43,63,0.2)' : '0 1px 4px rgba(0,0,0,0.06)', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                {t.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', paddingTop:60 }}>
              <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(126,43,63,0.2)', fontSize:'0.6rem', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:8 }}>— No Items —</div>
              <button onClick={() => { setEditItem(null); setModal('item') }} style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:700, color:B.brand, letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Add First Item</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:16 }}>
              {filtered.map(item => (
                <div key={item.id} style={{ background:'white', borderRadius:16, overflow:'hidden', border:'1px solid rgba(126,43,63,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ height:150, background:B.blush, position:'relative', overflow:'hidden' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <Image size={22} color='rgba(126,43,63,0.18)' />
                        <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.58rem', color:'rgba(126,43,63,0.2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>No Image</span>
                      </div>
                    )}
                    <div style={{ position:'absolute', top:8, left:8, padding:'3px 9px', borderRadius:20, background: item.available ? 'rgba(22,163,74,0.85)' : 'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)' }}>
                      <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.52rem', fontWeight:700, color:'white', letterSpacing:'0.1em', textTransform:'uppercase' }}>{item.available ? 'Available' : 'Hidden'}</span>
                    </div>
                  </div>
                  <div style={{ padding:'12px 14px' }}>
                    <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.85rem', color:B.dark }}>{item.name}</div>
                    {item.name_ar && <div style={{ fontFamily:'Noto Naskh Arabic,serif', fontSize:'0.78rem', color:'#aaa', marginTop:2 }} dir="rtl">{item.name_ar}</div>}
                    <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:B.brand, fontSize:'0.92rem', marginTop:4, marginBottom:12 }}>
                      {item.price} <span style={{ fontSize:'0.58rem', fontWeight:400, color:'#ccc' }}>AED</span>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => { setEditItem(item); setModal('item') }}
                        style={{ flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer', background:'rgba(126,43,63,0.07)', color:B.brand, fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => { setEditItem(item); setModal('delete') }}
                        style={{ width:34, height:34, borderRadius:8, border:'none', cursor:'pointer', background:'rgba(220,38,38,0.06)', color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {modal === 'item'   && <ItemModal    key="item" item={editItem} categories={categories} onClose={closeModal} onSaved={afterSave} />}
        {modal === 'delete' && <DeleteConfirm key="del" item={editItem} onClose={closeModal} onDeleted={afterSave} />}
      </AnimatePresence>
    </div>
  )
}
