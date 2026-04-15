"use client"

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useCanvasStore } from '@/store/useCanvasStore'

export function RealtimeBoardSync({ boardId }: { boardId: string }) {
    const { setNodes, setEdges, nodes, edges } = useCanvasStore()
    const supabase = createClient()
    const isInitialized = useRef(false)

    useEffect(() => {
        // 1. Initial Fetch
        const fetchBoardData = async () => {
            const { data: dbNodes } = await supabase.from('nodes').select('*').eq('board_id', boardId)
            const { data: dbEdges } = await supabase.from('edges').select('*').eq('board_id', boardId)

            if (dbNodes) {
                // Map DB nodes to React Flow nodes
                const rfNodes = dbNodes.map(n => ({
                    id: n.id,
                    type: n.type === 'CUSTOMER_OPPORTUNITY' || n.type === 'BUSINESS_OPPORTUNITY' ? 'Opportunity' :
                        n.type === 'SUCCESS_METRIC' ? 'Metric' : 'Outcome',
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

        fetchBoardData()

        // 2. Realtime Subscription (Postgres Changes)
        const channel = supabase.channel(`board_sync_${boardId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'nodes', filter: `board_id=eq.${boardId}` },
                (payload) => {
                    // In a real app we carefully merge, ignore echoes. 
                    // For now, refetch or merge simple updates.
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const n = payload.new as any
                        useCanvasStore.getState().setNodes([
                            ...useCanvasStore.getState().nodes.filter(existing => existing.id !== n.id),
                            {
                                id: n.id,
                                type: n.type === 'CUSTOMER_OPPORTUNITY' || n.type === 'BUSINESS_OPPORTUNITY' ? 'Opportunity' :
                                    n.type === 'SUCCESS_METRIC' ? 'Metric' : 'Outcome',
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
                { event: '*', schema: 'public', table: 'edges', filter: `board_id=eq.${boardId}` },
                (payload) => {
                    // Skip complex edge sync here for brevity, similar to nodes
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [boardId])

    return null
}
