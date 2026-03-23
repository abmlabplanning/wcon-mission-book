'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/Button'
import { Mission } from '@/src/types'

export default function MissionsAdminPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editMission, setEditMission] = useState<Mission | null>(null)
  const [form, setForm] = useState({ title: '', description: '', score: 10 })
  const [saving, setSaving] = useState(false)

  const fetchMissions = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('missions')
      .select('*')
      .order('order_num')
    setMissions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMissions() }, [fetchMissions])

  const openCreate = () => {
    setEditMission(null)
    setForm({ title: '', description: '', score: 10 })
    setShowForm(true)
  }

  const openEdit = (m: Mission) => {
    setEditMission(m)
    setForm({ title: m.title, description: m.description || '', score: m.score })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (editMission) {
      await supabase.from('missions').update({
        title: form.title,
        description: form.description || null,
        score: form.score,
      }).eq('id', editMission.id)
    } else {
      const maxOrder = missions.length > 0 ? Math.max(...missions.map((m) => m.order_num)) + 1 : 1
      await supabase.from('missions').insert({
        title: form.title,
        description: form.description || null,
        score: form.score,
        order_num: maxOrder,
        is_active: true,
      })
    }

    setSaving(false)
    setShowForm(false)
    fetchMissions()
  }

  const handleToggle = async (m: Mission) => {
    const supabase = createClient()
    await supabase.from('missions').update({ is_active: !m.is_active }).eq('id', m.id)
    fetchMissions()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('미션을 삭제하시겠어요?')) return
    const supabase = createClient()
    await supabase.from('missions').delete().eq('id', id)
    fetchMissions()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-gray-900">미션 관리</h1>
        <Button size="sm" onClick={openCreate}>+ 미션 추가</Button>
      </div>

      {/* 미션 폼 */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#2D5A27]/20">
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            {editMission ? '미션 수정' : '새 미션'}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">미션 제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예) 단체 사진 찍기"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D5A27]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">설명 (선택)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="미션에 대한 추가 설명을 입력하세요"
                rows={2}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D5A27] resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">점수</label>
              <input
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                min={1}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#2D5A27]"
              />
            </div>
            <div className="flex gap-2">
              <Button fullWidth loading={saving} onClick={handleSave}>
                {editMission ? '수정 완료' : '추가'}
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setShowForm(false)}>취소</Button>
            </div>
          </div>
        </div>
      )}

      {/* 미션 목록 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : missions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm text-gray-500">미션을 추가해주세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-xl p-3 shadow-sm border-l-4 ${m.is_active ? 'border-[#2D5A27]' : 'border-gray-200 opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{m.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-bold text-[#2D5A27]">+{m.score}점</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {m.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(m)}
                    className="p-1.5 text-gray-400 hover:text-[#2D5A27] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggle(m)}
                    className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
