'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface JsonPreviewProps {
  data: unknown
}

export function JsonPreview({ data }: JsonPreviewProps) {
  const [expanded, setExpanded] = useState(false)

  const formatted = JSON.stringify(data, null, 2)
  const preview = formatted.length > 60 ? formatted.slice(0, 60) + '...' : formatted

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0" />
        )}
        <code className="font-mono">{expanded ? 'JSON' : preview}</code>
      </button>
      {expanded && (
        <pre className="mt-2 p-3 bg-muted/30 border border-border rounded-xl text-xs font-mono text-foreground overflow-x-auto max-h-64 overflow-y-auto">
          {formatted}
        </pre>
      )}
    </div>
  )
}
