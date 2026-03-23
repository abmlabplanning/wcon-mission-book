'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/Button'
import { Group } from '@/src/types'
import { GROUP_COLORS } from '@/src/lib/constants'

export default function GroupsAdminPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [form, setForm] = useState({ name: '', color: GROUP_COLORS[0] })
  const [saving, setSaving] = useState(false)

  const fetchGroups = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('groups').select('*').order('order_num')
    setGroups(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const openCreate = () => {
    setEditGroup(null)
    setForm({ name: '', color: GROUP_COLORS[groups.length % GROUP_COLORS.length] })
    setShowForm(true)
  }

  const openEdit = (g: Group) => {
    setEditGroup(g)
    setForm({ name: g.name, color: g.color })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (editGroup) {
      await supabase.from('groups').update({ name: form.name, color: form.color }).eq('id', editGroup.id)
    } else {
      const maxOrder = groups.length > 0 ? Math.max(...groups.map((g) => g.order_num)) + 1 : 1
      await supabase.from('groups').insert({ name: form.name, color: form.color, order_num: maxOrder })
    }

    setSaving(false)
    setShowForm(false)
    fetchGroups()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('조를 삭제하면 관련 인증 데이터도 삭제됩니다. 계속하시겠어요?')) return
    const supabase = createClient()
    await supabase.from('groups').delete().eq('id', id)
    fetchGroups()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-gray-900">조 관리</h1>
        <Button size="sm" onClick={openCreate}>+ 조 추가</Button>
      </div>

      {/* 조 폼 */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#2D5A27]/20">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            {editGroup ? '조 수정' : '새 조 추가'}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">조 이름 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예) 1조"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D5A27]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">조 색상</label>
              <div className="grid grid-cols-5 gap-2">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-10 h-10 rounded-xl transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button fullWidth loading={saving} onClick={handleSave}>
                {editGroup ? '수정 완료' : '추가'}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setShowForm(false)}>취소</Button>
            </div>
          </div>
        </div>
      )}

      {/* 조 목록 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm text-gray-500">조를 추가해주세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.id}
              className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3"
              style={{ borderLeft: `4px solid ${g.color}` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: g.color }}
              >
                {g.name.replace('조', '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{g.name}</p>
                <p className="text-xs text-gray-400">{g.color}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(g)}
                  className="p-1.5 text-gray-400 hover:text-[#2D5A27] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
