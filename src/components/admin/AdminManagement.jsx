import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../api/supabaseApi'
import LoadingSpinner from '../shared/LoadingSpinner'
import ConfirmDialog from '../shared/ConfirmDialog'

export default function AdminManagement() {
  const { admin } = useAuth()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [deleteID, setDeleteID] = useState(null)

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: () => adminAPI.getAll(admin?.token),
    enabled: !!admin?.token,
  })

  const createMutation = useMutation({
    mutationFn: () => adminAPI.create(admin.token, username, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] })
      setShowForm(false)
      setUsername('')
      setPassword('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.delete(admin.token, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync()
    } catch (err) {
      alert(err.message)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المديرين</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97]"
        >
          + إضافة مدير
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-l from-gray-50 to-gray-100/50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-4 text-right font-semibold">اسم المستخدم</th>
              <th className="px-4 py-4 text-right font-semibold">تاريخ الإنشاء</th>
              <th className="px-4 py-4 text-right font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a, idx) => (
              <tr key={a.id} className={`transition-colors duration-200 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              } hover:bg-primary/5`}>
                <td className="px-4 py-3.5 font-medium text-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {a.username.charAt(0).toUpperCase()}
                    </span>
                    {a.username}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-500">
                  {new Date(a.created_at).toLocaleDateString('ar')}
                </td>
                <td className="px-4 py-3.5">
                  {a.username !== admin?.username && (
                    <button
                      onClick={() => setDeleteID(a.id)}
                      className="text-red-500 hover:text-red-600 text-xs font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all duration-200"
                    >
                      حذف
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg">➕</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">إضافة مدير جديد</h3>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">اسم المستخدم</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50/50 transition-all duration-300"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-60 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
                  {createMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-all duration-300 active:scale-[0.98]">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteID && (
        <ConfirmDialog
          message="هل أنت متأكد من حذف هذا المدير؟"
          onConfirm={() => {
            deleteMutation.mutate(deleteID, { onSettled: () => setDeleteID(null) })
          }}
          onCancel={() => setDeleteID(null)}
        />
      )}
    </div>
  )
}
