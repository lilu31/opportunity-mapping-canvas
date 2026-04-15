"use client"

import { useState } from 'react'
import { MappingCanvas } from '@/components/canvas/MappingCanvas'
import { TableView } from '@/components/board/TableView'
import { Button } from '@/components/ui/button'

export default function BoardPage({ params }: { params: { id: string } }) {
    const [view, setView] = useState<'canvas' | 'table'>('canvas')

    return (
        <main className="w-full h-screen overflow-hidden flex flex-col">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shadow-inner">
                        <span className="text-white text-[10px] font-bold">OM</span>
                    </div>
                    <h1 className="font-semibold text-slate-800 tracking-tight">Opportunity Mapping Canvas</h1>
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
                    <MappingCanvas boardId={params.id} />
                ) : (
                    <TableView />
                )}
            </div>
        </main>
    )
}
