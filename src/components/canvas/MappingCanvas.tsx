"use client"

import { useCallback } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '@/store/useCanvasStore'
import { OpportunityNode } from './OpportunityNode'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RealtimeMapSync } from './RealtimeMapSync'
import { useSupabasePersist } from '@/store/useSupabasePersist'

const nodeTypes = {
    Opportunity: OpportunityNode,
}

export function MappingCanvas({ mapId }: { mapId: string }) {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes } = useCanvasStore()

    // Enable debounced persistence to Supabase
    useSupabasePersist(mapId)

    const addNode = useCallback((type: 'Opportunity', subType: 'BUSINESS_OPPORTUNITY' | 'CUSTOMER_OPPORTUNITY') => {
        const newNode = {
            id: crypto.randomUUID(),
            type,
            position: { x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 },
            data: {
                type: subType,
                title: `New ${subType === 'BUSINESS_OPPORTUNITY' ? 'Business' : 'Customer'} Opportunity`,
                description: '',
                metrics: []
            },
        }
        setNodes([...nodes, newNode])
    }, [nodes, setNodes])

    return (
        <div className="w-full h-full bg-slate-50">
            <RealtimeMapSync mapId={mapId} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background gap={16} size={1} color="#e2e8f0" />
                <Controls />
                <MiniMap zoomable pannable nodeClassName={(node) => `mini-${node.type}`} />

                <Panel position="top-left" className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => addNode('Opportunity', 'BUSINESS_OPPORTUNITY')} className="gap-1 text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border-orange-200">
                            <Plus className="w-4 h-4" /> Business Opportunity
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addNode('Opportunity', 'CUSTOMER_OPPORTUNITY')} className="gap-1 text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200">
                            <Plus className="w-4 h-4" /> Customer Opportunity
                        </Button>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}
