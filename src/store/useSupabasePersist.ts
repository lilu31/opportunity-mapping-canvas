"use client"

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useCanvasStore } from '@/store/useCanvasStore'

/**
 * Debounced persistence hook: watches Zustand store changes
 * and writes them back to Supabase after a 1.5s pause in edits.
 */
export function useSupabasePersist(mapId: string) {
    const nodes = useCanvasStore((s) => s.nodes)
    const edges = useCanvasStore((s) => s.edges)
    const supabase = createClient()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isInitialLoad = useRef(true)

    useEffect(() => {
        // Skip the initial load (data coming from DB via RealtimeMapSync)
        if (isInitialLoad.current) {
            // Wait a short period before considering init done
            const initTimer = setTimeout(() => {
                isInitialLoad.current = false
            }, 3000)
            return () => clearTimeout(initTimer)
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(async () => {
            try {
                // Persist nodes
                for (const node of nodes) {
                    const { error } = await supabase.from('nodes').upsert({
                        id: node.id,
                        board_id: mapId,
                        type: (node.data.type as string) || 'BUSINESS_OPPORTUNITY',
                        position_x: node.position.x,
                        position_y: node.position.y,
                        data: node.data,
                    }, { onConflict: 'id' })
                    if (error) console.error('Node persist error:', error)
                }

                // Delete nodes from DB that are no longer in the store
                const { data: dbNodes } = await supabase.from('nodes').select('id').eq('board_id', mapId)
                if (dbNodes) {
                    const storeNodeIds = new Set(nodes.map(n => n.id))
                    const toDelete = dbNodes.filter(n => !storeNodeIds.has(n.id))
                    for (const del of toDelete) {
                        await supabase.from('nodes').delete().eq('id', del.id)
                    }
                }

                // Persist edges
                for (const edge of edges) {
                    const { error } = await supabase.from('edges').upsert({
                        id: edge.id,
                        board_id: mapId,
                        source: edge.source,
                        target: edge.target,
                    }, { onConflict: 'id' })
                    if (error) console.error('Edge persist error:', error)
                }

                // Delete edges from DB that are no longer in the store
                const { data: dbEdges } = await supabase.from('edges').select('id').eq('board_id', mapId)
                if (dbEdges) {
                    const storeEdgeIds = new Set(edges.map(e => e.id))
                    const toDeleteEdges = dbEdges.filter(e => !storeEdgeIds.has(e.id))
                    for (const del of toDeleteEdges) {
                        await supabase.from('edges').delete().eq('id', del.id)
                    }
                }
            } catch (err) {
                console.error('Persist failed:', err)
            }
        }, 1500)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [nodes, edges, mapId])
}
