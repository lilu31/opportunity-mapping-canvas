"use client"

import { useState, useEffect, useRef } from 'react'
import { MappingCanvas } from '@/components/canvas/MappingCanvas'
import { TableView } from '@/components/map/TableView'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function MapPage({ params }: { params: { id: string } }) {
    const [view, setView] = useState<'canvas' | 'table'>('canvas')
    const [title, setTitle] = useState('Loading...')
    const [isEditing, setIsEditing] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchTitle = async () => {
            const { data } = await supabase.from('boards').select('title').eq('id', params.id).single()
            if (data) setTitle(data.title)
        }
        fetchTitle()
    }, [params.id])

    const handleSaveTitle = async () => {
        setIsEditing(false)
        await supabase.from('boards').update({ title }).eq('id', params.id)
    }

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    return (
        <main className="w-full h-screen overflow-hidden flex flex-col">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100" title="Back to Workspace">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shadow-inner">
                        <span className="text-white text-[10px] font-bold">OM</span>
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <input
                                ref={inputRef}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle() }}
                                className="font-semibold text-slate-800 tracking-tight bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <button onClick={handleSaveTitle} className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors">
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 group">
                            <h1 className="font-semibold text-slate-800 tracking-tight text-sm">{title}</h1>
                            <button onClick={() => setIsEditing(true)} className="p-1 text-slate-300 hover:text-slate-600 rounded transition-colors opacity-0 group-hover:opacity-100">
                                <Pencil className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 shadow-inner">
                    <Button
                        variant={view === 'canvas' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('canvas')}
                        className={`text-xs h-7 px-4 rounded-sm transition-all ${view === 'canvas' ? 'shadow-sm bg-white text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Canvas
                    </Button>
                    <Button
                        variant={view === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('table')}
                        className={`text-xs h-7 px-4 rounded-sm transition-all ${view === 'table' ? 'shadow-sm bg-white text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Data Table
                    </Button>
                </div>
            </header>

            <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-50">
                {view === 'canvas' ? (
                    <MappingCanvas mapId={params.id} />
                ) : (
                    <TableView />
                )}
            </div>
        </main>
    )
}
