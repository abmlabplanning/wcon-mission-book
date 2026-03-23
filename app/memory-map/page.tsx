'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { Header } from '@/src/components/layout/Header'
import Image from 'next/image'

interface PhotoItem {
  id: string
  image_url: string
  approved_at: string
  groups: { id: string; name: string; color: string }
  missions: { title: string }
}

export default function MemoryMapPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<{ id: string; name: string; color: string }[]>([])
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<PhotoItem | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: photosData }, { data: groupsData }] = await Promise.all([
        supabase
          .from('submissions')
          .select('id, image_url, approved_at, groups(id, name, color), missions(title)')
          .eq('status', 'approved')
          .order('approved_at', { ascending: false }),
        supabase.from('groups').select('id, name, color').order('order_num'),
      ])
      setPhotos((photosData as unknown as PhotoItem[]) || [])
      setGroups(groupsData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = filterGroupId
    ? photos.filter((p) => p.groups?.id === filterGroupId)
    : photos

  return (
    <div className="min-h-screen bg-[#F5F2EC]">
      <Header title="추억지도" showBack backHref="/" />

      {/* 필터 탭 */}
      <div className="sticky top-14 z-30 bg-[#F5F2EC]/95 backdrop-blur-sm px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilterGroupId(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterGroupId === null
                ? 'bg-[#2D5A27] text-white'
                : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            전체
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGroupId(filterGroupId === g.id ? null : g.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterGroupId === g.id
                  ? 'text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
              style={filterGroupId === g.id ? { backgroundColor: g.color } : {}}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* 갤러리 */}
      <div className="px-3 py-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📷</p>
            <p className="text-sm text-gray-500">
              {filterGroupId ? '이 조의 인증 사진이 없어요' : '아직 인증된 미션이 없어요'}
            </p>
            <p className="text-xs text-gray-400 mt-1">미션을 완료하고 사진을 올려보세요!</p>
          </div>
        ) : (
          <div className="columns-2 gap-2 space-y-2">
            {filtered.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid mb-2"
                onClick={() => setLightbox(photo)}
              >
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
                  style={{ borderBottom: `3px solid ${photo.groups?.color || '#2D5A27'}` }}
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.missions?.title || '인증 사진'}
                    width={200}
                    height={200}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                  {/* 오버레이 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p
                      className="text-[10px] font-bold mb-0.5"
                      style={{ color: photo.groups?.color ? `hsl(from ${photo.groups.color} h s 85%)` : '#fff' }}
                    >
                      {photo.groups?.name}
                    </p>
                    <p className="text-[10px] text-white/90 line-clamp-1">{photo.missions?.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 사진 수 표시 */}
        {filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            총 {filtered.length}장의 추억
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: lightbox.groups?.color || '#fff' }}
              >
                {lightbox.groups?.name}
              </p>
              <p className="text-xs text-white/80">{lightbox.missions?.title}</p>
            </div>
            <button className="text-white p-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <Image
              src={lightbox.image_url}
              alt={lightbox.missions?.title || '인증 사진'}
              width={480}
              height={480}
              className="max-w-full max-h-full object-contain rounded-xl"
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
