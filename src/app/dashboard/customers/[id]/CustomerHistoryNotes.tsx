import * as React from 'react'

interface CustomerHistoryNotesProps {
  notes?: string | null
}

export function CustomerHistoryNotes({ notes }: CustomerHistoryNotesProps) {
  if (!notes) {
    return <span className="text-slate-400 italic text-xs">Status transition recorded</span>
  }

  const lines = notes.split('\n').map(l => l.trim()).filter(Boolean)

  // If simple single-line note without diff arrows
  if (lines.length <= 1 && !notes.includes('→')) {
    return (
      <div className="text-slate-700 text-xs leading-relaxed whitespace-normal break-words">
        {notes}
      </div>
    )
  }

  // Header line if first line is not a bullet
  const hasHeader = lines.length > 1 && !lines[0].startsWith('•')
  const header = hasHeader ? lines[0] : null
  const changeLines = hasHeader ? lines.slice(1) : lines

  return (
    <div className="space-y-1.5 py-1 w-full whitespace-normal break-words">
      {header && (
        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 whitespace-normal break-words">
          <span className="w-1.5 h-1.5 rounded-full bg-[#136d86] shrink-0" />
          <span>{header}</span>
        </div>
      )}

      <div className={`space-y-1 ${header ? 'pl-2 border-l-2 border-slate-200' : ''}`}>
        {changeLines.map((line, idx) => {
          const isBullet = line.startsWith('•')
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim()

          // Check if it follows "Label: old → new" pattern
          const colonIdx = cleanLine.indexOf(':')
          const arrowIdx = cleanLine.indexOf('→')

          if (colonIdx > -1 && arrowIdx > -1 && colonIdx < arrowIdx) {
            const label = cleanLine.substring(0, colonIdx).trim()
            const valuesPart = cleanLine.substring(colonIdx + 1).trim()
            const [oldPart, ...restNew] = valuesPart.split('→')
            const newPart = restNew.join('→').trim()

            const oldVal = (oldPart || '').trim().replace(/^["']|["']$/g, '')
            const newVal = (newPart || '').trim().replace(/^["']|["']$/g, '')

            return (
              <div key={idx} className="text-xs flex items-center flex-wrap gap-1.5 leading-normal whitespace-normal break-words">
                <span className="font-semibold text-[#002868] text-[11px] shrink-0">
                  {label}:
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-rose-50 text-rose-700 border border-rose-200/80 font-mono line-through decoration-rose-400 break-all">
                  {oldVal}
                </span>
                <span className="text-slate-400 font-bold text-xs shrink-0">&rarr;</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-medium break-all">
                  {newVal}
                </span>
              </div>
            )
          }

          // In case line has pipe separated updates (older format):
          if (cleanLine.includes(' | ')) {
            const subItems = cleanLine.split(' | ')
            return (
              <div key={idx} className="space-y-1">
                {subItems.map((sub, sIdx) => (
                  <div key={sIdx} className="text-xs text-slate-700 flex items-start gap-1 whitespace-normal break-words">
                    <span className="text-slate-400 font-bold shrink-0">•</span>
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            )
          }

          // Plain text line
          return (
            <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 whitespace-normal break-words">
              {isBullet && <span className="text-slate-400 font-bold shrink-0">•</span>}
              <span>{cleanLine}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
