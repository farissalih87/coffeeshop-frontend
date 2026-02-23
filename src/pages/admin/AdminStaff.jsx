import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Save, Shield, User } from 'lucide-react'
import { userApi } from '../../api'
import toast from 'react-hot-toast'

let mockUsers = [
  { id:1, name:'Admin User', email:'admin@coffeeshop.com', role:'admin', created_at:'2024-01-01' },
  { id:2, name:'Ahmed Staff', email:'staff@coffeeshop.com', role:'staff', created_at:'2024-01-15' },
  { id:3, name:'Sara Staff', email:'sara@coffeeshop.com', role:'staff', created_at:'2024-02-01' },
]
let nextUserId = 10

const INIT_FORM = { name: '', email: '', password: '', role: 'staff' }

export default function AdminStaff() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(INIT_FORM)

  const { data } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => userApi.getAll().then(r => r.data),
    placeholderData: { users: mockUsers },
    retry: false,
  })

  const users = data?.users || mockUsers

  const openAdd = () => { setForm(INIT_FORM); setModal('add') }
  const openEdit = (user) => { setForm({ name: user.name, email: user.email, password: '', role: user.role }); setModal({ edit: user }) }

  const save = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required')
    try {
      if (modal?.edit) await userApi.update(modal.edit.id, form)
      else await userApi.create(form)
    } catch {}
    if (modal?.edit) {
      mockUsers = mockUsers.map(u => u.id === modal.edit.id ? { ...u, ...form } : u)
    } else {
      mockUsers = [...mockUsers, { id: nextUserId++, ...form, created_at: new Date().toISOString().split('T')[0] }]
    }
    qc.invalidateQueries(['staff-users'])
    setModal(null)
    toast.success('Staff member saved!')
  }

  const remove = (id) => {
    if (id === 1) return toast.error("Can't delete admin account")
    mockUsers = mockUsers.filter(u => u.id !== id)
    qc.invalidateQueries(['staff-users'])
    toast.success('Staff removed')
    userApi.delete(id).catch(() => {})
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} accounts</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-1.5 text-sm py-2">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="grid gap-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                           ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-coffee-100 text-coffee-600'}`}>
              {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-dark">{user.name}</p>
              <p className="text-sm text-gray-400 font-body">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-coffee-100 text-coffee-700'}`}>
                {user.role}
              </span>
              <p className="text-xs text-gray-300 hidden sm:block">{user.created_at}</p>
              <div className="flex gap-1">
                <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(user.id)} disabled={user.id === 1} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-30">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-dark text-lg">
                {modal?.edit ? 'Edit Staff' : 'Add Staff'}
              </h3>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={14} />
              </button>
            </div>

            {[
              { label:'Full Name', key:'name', type:'text', placeholder:'Ahmed Staff' },
              { label:'Email', key:'email', type:'email', placeholder:'ahmed@coffeeshop.com' },
              { label:'Password', key:'password', type:'password', placeholder:modal?.edit ? 'Leave blank to keep' : '••••••••' },
            ].map(f => (
              <div key={f.key} className="mb-4">
                <label className="block text-dark text-sm font-semibold font-body mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 focus:border-coffee-500 rounded-xl px-3 py-2.5 font-body text-dark outline-none transition-colors bg-gray-50"
                />
              </div>
            ))}

            <div className="mb-5">
              <label className="block text-dark text-sm font-semibold font-body mb-1.5">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {['staff','admin'].map(role => (
                  <button key={role} onClick={() => setForm({...form, role})}
                    className={`py-2.5 rounded-xl border-2 font-body text-sm font-semibold capitalize transition-all
                               ${form.role === role ? 'border-coffee-500 bg-coffee-50 text-coffee-800' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={save} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
