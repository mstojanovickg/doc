import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function SessionManager() {
  const { sessions, loadSessions, saveSession, loadSession, removeSession, activeSessionId } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen) await loadSessions()
    setOpen(isOpen)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await saveSession(name.trim())
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10">
          Sessions
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sessions</DialogTitle>
        </DialogHeader>

        {/* Save */}
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Session name…"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1"
          />
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            size="sm"
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>

        {/* List */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin">
          {sessions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No saved sessions.</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                s.id === activeSessionId
                  ? 'border-primary/40 bg-accent'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{s.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(s.updated_at).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-primary"
                onClick={() => { loadSession(s); setOpen(false) }}
              >
                Load
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-destructive hover:text-destructive"
                onClick={() => removeSession(s.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
