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
        <h2 className="text-xl font-bold text-gray-800">إدارة المديرين</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          + إضافة مدير
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-right">اسم المستخدم</th>
              <th className="px-4 py-3 text-right">تاريخ الإنشاء</th>
              <th className="px-4 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{a.username}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(a.created_at).toLocaleDateString('ar')}
                </td>
                <td className="px-4 py-3">
                  {a.username !== admin?.username && (
                    <button
                      onClick={() => setDeleteID(a.id)}
                      className="text-red-500 hover:underline text-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة مدير جديد</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">اسم المستخدم</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
                  {createMutation.isPending ? 'جاري الحفظ...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition-colors">
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
