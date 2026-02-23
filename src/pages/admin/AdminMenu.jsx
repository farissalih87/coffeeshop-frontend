import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { menuApi } from '../../api'
import toast from 'react-hot-toast'

const INIT_CATEGORY = { name: '', name_ar: '', icon: '☕' }
const INIT_ITEM = { name: '', name_ar: '', description: '', description_ar: '', price: '', category_id: '', available: true }

const EMOJIS = ['☕','🧊','🍵','🥐','🍊','🥤','🍰','🧇','🥗','🍫','🧃','🍹']

// Mock data
let mockCats = [
  { id:1, name:'Hot Coffee', name_ar:'قهوة ساخنة', icon:'☕' },
  { id:2, name:'Cold Coffee', name_ar:'قهوة باردة', icon:'🧊' },
  { id:3, name:'Tea', name_ar:'شاي', icon:'🍵' },
  { id:4, name:'Pastries', name_ar:'معجنات', icon:'🥐' },
]
let mockItems = [
  { id:1, category_id:1, name:'Espresso', name_ar:'إسبريسو', price:12, available:true },
  { id:2, category_id:1, name:'Cappuccino', name_ar:'كابتشينو', price:18, available:true },
  { id:3, category_id:2, name:'Iced Latte', name_ar:'لاتيه مثلج', price:22, available:true },
  { id:4, category_id:3, name:'Karak Tea', name_ar:'كرك', price:10, available:true },
]

let nextCatId = 10; let nextItemId = 20

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-dark text-lg">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-dark text-sm font-semibold font-body mb-1.5">{label}</label>
      <input
        className="w-full border border-gray-200 focus:border-coffee-500 rounded-xl px-3 py-2.5 font-body text-dark outline-none transition-colors bg-gray-50"
        {...props}
      />
    </div>
  )
}

export default function AdminMenu() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('items')
  const [catModal, setCatModal] = useState(null) // null | 'add' | { edit: cat }
  const [itemModal, setItemModal] = useState(null)
  const [catForm, setCatForm] = useState(INIT_CATEGORY)
  const [itemForm, setItemForm] = useState(INIT_ITEM)

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories().then(r => r.data),
    placeholderData: { categories: mockCats },
    retry: false,
  })
  const { data: itemsData } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => menuApi.getAllItems().then(r => r.data),
    placeholderData: { items: mockItems },
    retry: false,
  })

  const categories = catsData?.categories || mockCats
  const items = itemsData?.items || mockItems

  const openAddCat = () => { setCatForm(INIT_CATEGORY); setCatModal('add') }
  const openEditCat = (cat) => { setCatForm({ name: cat.name, name_ar: cat.name_ar, icon: cat.icon }); setCatModal({ edit: cat }) }

  const openAddItem = () => { setItemForm({ ...INIT_ITEM, category_id: categories[0]?.id || '' }); setItemModal('add') }
  const openEditItem = (item) => {
    setItemForm({ name: item.name, name_ar: item.name_ar || '', description: item.description || '', description_ar: item.description_ar || '', price: item.price, category_id: item.category_id, available: item.available })
    setItemModal({ edit: item })
  }

  const saveCategory = async () => {
    try {
      if (catModal?.edit) {
        await menuApi.updateCategory(catModal.edit.id, catForm)
        mockCats = mockCats.map(c => c.id === catModal.edit.id ? { ...c, ...catForm } : c)
      } else {
        await menuApi.createCategory(catForm)
        mockCats = [...mockCats, { id: nextCatId++, ...catForm }]
      }
    } catch { if (!catModal?.edit) mockCats = [...mockCats, { id: nextCatId++, ...catForm }]
      else mockCats = mockCats.map(c => c.id === catModal.edit.id ? { ...c, ...catForm } : c)
    }
    qc.invalidateQueries(['categories'])
    setCatModal(null)
    toast.success('Category saved!')
  }

  const deleteCat = (id) => {
    mockCats = mockCats.filter(c => c.id !== id)
    qc.invalidateQueries(['categories'])
    toast.success('Category deleted')
    menuApi.deleteCategory(id).catch(() => {})
  }

  const saveItem = async () => {
    const data = { ...itemForm, price: parseFloat(itemForm.price) }
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k,v]) => fd.append(k, v))
      if (itemModal?.edit) await menuApi.updateItem(itemModal.edit.id, fd)
      else await menuApi.createItem(fd)
    } catch {}
    if (itemModal?.edit) mockItems = mockItems.map(i => i.id === itemModal.edit.id ? { ...i, ...data } : i)
    else mockItems = [...mockItems, { id: nextItemId++, ...data }]
    qc.invalidateQueries(['menu-items'])
    setItemModal(null)
    toast.success('Item saved!')
  }

  const deleteItem = (id) => {
    mockItems = mockItems.filter(i => i.id !== id)
    qc.invalidateQueries(['menu-items'])
    toast.success('Item deleted')
    menuApi.deleteItem(id).catch(() => {})
  }

  const toggleAvailable = (item) => {
    mockItems = mockItems.map(i => i.id === item.id ? { ...i, available: !i.available } : i)
    qc.invalidateQueries(['menu-items'])
    menuApi.updateItem(item.id, new FormData()).catch(() => {})
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Menu Management</h1>
        <div className="flex gap-2">
          <button onClick={openAddCat} className="btn-secondary flex items-center gap-1.5 text-sm py-2">
            <Plus size={16} /> Category
          </button>
          <button onClick={openAddItem} className="btn-primary flex items-center gap-1.5 text-sm py-2">
            <Plus size={16} /> Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['items','categories'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold font-body transition-all capitalize
                       ${activeTab === tab ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-600 border border-coffee-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items Table */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name','Arabic','Category','Price','Available','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => {
                const cat = categories.find(c => c.id === item.category_id)
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-body font-semibold text-dark text-sm">{item.name}</td>
                    <td className="px-4 py-3 font-arabic text-dark text-sm" dir="rtl">{item.name_ar}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm font-body">{cat?.icon} {cat?.name}</td>
                    <td className="px-4 py-3 font-bold text-coffee-700 font-body">{item.price} AED</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAvailable(item)}>
                        {item.available
                          ? <ToggleRight className="text-green-500" size={22} />
                          : <ToggleLeft className="text-gray-300" size={22} />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEditItem(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={15} /></button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories Table */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Icon','Name','Arabic Name','Items','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-2xl">{cat.icon}</td>
                  <td className="px-4 py-3 font-body font-semibold text-dark">{cat.name}</td>
                  <td className="px-4 py-3 font-arabic text-dark" dir="rtl">{cat.name_ar}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{items.filter(i => i.category_id === cat.id).length}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEditCat(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={15} /></button>
                      <button onClick={() => deleteCat(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      {catModal && (
        <Modal title={catModal?.edit ? 'Edit Category' : 'Add Category'} onClose={() => setCatModal(null)}>
          <Input label="Name (English)" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Hot Coffee" />
          <Input label="Name (Arabic)" value={catForm.name_ar} onChange={e => setCatForm({...catForm, name_ar: e.target.value})} placeholder="قهوة ساخنة" dir="rtl" />
          <div className="mb-4">
            <label className="block text-dark text-sm font-semibold font-body mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map(em => (
                <button key={em} onClick={() => setCatForm({...catForm, icon: em})}
                  className={`text-2xl p-2 rounded-xl transition-all ${catForm.icon === em ? 'bg-coffee-100 ring-2 ring-coffee-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveCategory} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={16} /> Save
          </button>
        </Modal>
      )}

      {/* Item Modal */}
      {itemModal && (
        <Modal title={itemModal?.edit ? 'Edit Item' : 'Add Item'} onClose={() => setItemModal(null)}>
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-0">
            <Input label="Name (English)" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
            <Input label="Name (Arabic)" value={itemForm.name_ar} onChange={e => setItemForm({...itemForm, name_ar: e.target.value})} dir="rtl" />
            <Input label="Description" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} />
            <Input label="Description (Arabic)" value={itemForm.description_ar} onChange={e => setItemForm({...itemForm, description_ar: e.target.value})} dir="rtl" />
            <Input label="Price (AED)" type="number" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} />
            <div className="mb-4">
              <label className="block text-dark text-sm font-semibold font-body mb-1.5">Category</label>
              <select
                value={itemForm.category_id}
                onChange={e => setItemForm({...itemForm, category_id: parseInt(e.target.value)})}
                className="w-full border border-gray-200 focus:border-coffee-500 rounded-xl px-3 py-2.5 font-body text-dark outline-none bg-gray-50"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input type="checkbox" checked={itemForm.available} onChange={e => setItemForm({...itemForm, available: e.target.checked})} className="w-4 h-4 accent-coffee-600" />
              <span className="font-body text-sm text-dark">Available</span>
            </label>
          </div>
          <button onClick={saveItem} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            <Save size={16} /> Save Item
          </button>
        </Modal>
      )}
    </div>
  )
}
