'use client'

import Link from 'next/link'
import { LayoutGrid, MoreVertical, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function MapCard({ board }: { board: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsMenuOpen(false)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDeleting(true)
        await supabase.from('boards').delete().eq('id', board.id)
        window.location.reload()
    }

    const cancelDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowDeleteConfirm(false)
    }

    if (isDeleting) return null

    return (
        <Link href={`/map/${board.id}`} className="block group">
            <div className="h-[220px] bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-100 relative overflow-hidden">
                {showDeleteConfirm && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]" onClick={cancelDelete}>
                        <div className="bg-white p-5 rounded-xl shadow-2xl border border-red-100 w-[240px] text-center" onClick={(e) => e.stopPropagation()}>
                            <h3 className="font-bold text-base text-slate-900 mb-1">Delete this map?</h3>
                            <p className="text-xs text-slate-500 mb-4">This will permanently remove the map and all its data.</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={cancelDelete} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
                                <button onClick={confirmDelete} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
                        <LayoutGrid className="w-5 h-5" />
                    </div>

                    <div ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsMenuOpen(!isMenuOpen)
                            }}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-12 right-6 bg-white border border-slate-200 shadow-xl rounded-lg py-1 z-10 w-32 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{board.title}</h3>
                    <p className="text-xs text-slate-400">Created {new Date(board.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </Link>
    )
}
