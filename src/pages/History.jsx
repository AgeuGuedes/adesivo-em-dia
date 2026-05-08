import { useState, useEffect } from 'react'
import { Clock, User, MessageSquare, ClipboardList } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { POSITION_LABELS, POSITION_DAY } from '../lib/rotation'

export default function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('applications')
        .select('*, caregivers(name)')
        .order('applied_at', { ascending: false })
        .limit(30)
      setRecords(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-med-primary border-t-transparent animate-spin"/>
    </div>
  )

  return (
    <div className="p-5 max-w-lg mx-auto pb-28">
      <h2 className="text-2xl font-bold text-med-text mb-5">Histórico</h2>

      {records.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-med-faint">
          <ClipboardList size={48} strokeWidth={1} className="mb-3 opacity-40"/>
          <p className="text-lg">Nenhum registro ainda.</p>
        </div>
      )}

      <div className="space-y-3">
        {records.map((rec, i) => {
          const date    = new Date(rec.applied_at)
          const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
          const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          const info    = POSITION_LABELS[rec.position]
          const dayNum  = POSITION_DAY[rec.position]
          const isFirst = rec.position?.endsWith('1')

          return (
            <div key={rec.id}
              className={`bg-med-surface rounded-2xl p-4 border shadow-card ${
                i === 0 ? 'border-med-primary/40' : 'border-med-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-med-text font-bold text-lg leading-tight">
                    {info?.label || rec.position}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="w-7 h-7 rounded-full bg-med-primary border-2 border-med-primary-hover flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">{dayNum}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-med-primary-light text-med-primary border border-purple-200">
                      Dia {dayNum} · {rec.position}
                    </span>
                    {i === 0 && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-med-success-light text-med-success border border-green-200">
                        Último
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-med-muted text-sm">
                  <Clock size={13}/>{dateStr} · {timeStr}
                </span>
                <span className="flex items-center gap-1.5 text-med-muted text-sm">
                  <User size={13}/>{rec.caregivers?.name || 'N/A'}
                </span>
              </div>

              {rec.observations && (
                <div className="flex items-start gap-1.5 mt-2 text-med-faint text-sm italic">
                  <MessageSquare size={13} className="mt-0.5 shrink-0"/>
                  <span className="break-words min-w-0">"{rec.observations}"</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
