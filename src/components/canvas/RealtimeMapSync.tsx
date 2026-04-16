"use client"

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useCanvasStore } from '@/store/useCanvasStore'

export function RealtimeMapSync({ mapId }: { mapId: string }) {
    const { setNodes, setEdges } = useCanvasStore()
    const supabase = createClient()
    const isInitialized = useRef(false)

    useEffect(() => {
        // 1. Initial Fetch
        const fetchMapData = async () => {
            const { data: dbNodes } = await supabase.from('nodes').select('*').eq('board_id', mapId)
            const { data: dbEdges } = await supabase.from('edges').select('*').eq('board_id', mapId)

            if (dbNodes) {
                const rfNodes = dbNodes.map(n => ({
                    id: n.id,
                    type: 'Opportunity',
                    position: { x: n.position_x, y: n.position_y },
                    data: { ...n.data, type: n.type },
                }))
                setNodes(rfNodes)
            }

            if (dbEdges) {
                const rfEdges = dbEdges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                }))
                setEdges(rfEdges)
            }
            isInitialized.current = true
        }

        fetchMapData()

        // 2. Realtime Subscription (Postgres Changes)
        const channel = supabase.channel(`map_sync_${mapId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nodes', filter: `board_id=eq.${mapId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const n = payload.new as any
                        useCanvasStore.getState().setNodes([
                            ...useCanvasStore.getState().nodes.filter(existing => existing.id !== n.id),
                            {
                                id: n.id,
                                type: 'Opportunity',
                                position: { x: n.position_x, y: n.position_y },
                                data: { ...n.data, type: n.type },
                            }
                        ])
                    } else if (payload.eventType === 'DELETE') {
                        const old = payload.old as any
                        useCanvasStore.getState().setNodes(
                            useCanvasStore.getState().nodes.filter(existing => existing.id !== old.id)
                        )
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'edges', filter: `board_id=eq.${mapId}` },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const e = payload.new as any
                        useCanvasStore.getState().setEdges([
                            ...useCanvasStore.getState().edges.filter(existing => existing.id !== e.id),
                            { id: e.id, source: e.source, target: e.target }
                        ])
                    } else if (payload.eventType === 'DELETE') {
                        const old = payload.old as any
                        useCanvasStore.getState().setEdges(
                            useCanvasStore.getState().edges.filter(existing => existing.id !== old.id)
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [mapId])

    return null
}
