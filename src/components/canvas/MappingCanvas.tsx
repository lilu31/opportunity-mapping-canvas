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
import { MetricNode } from './MetricNode'
import { OutcomeNode } from './OutcomeNode'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RealtimeBoardSync } from './RealtimeBoardSync'

const nodeTypes = {
    Opportunity: OpportunityNode,
    Metric: MetricNode,
    Outcome: OutcomeNode,
}

export function MappingCanvas({ boardId }: { boardId: string }) {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes } = useCanvasStore()

    const addNode = useCallback((type: 'Opportunity' | 'Metric' | 'Outcome') => {
        const newNode = {
            id: crypto.randomUUID(),
            type,
            position: { x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 },
            data: {
                type: type === 'Opportunity' ? 'CUSTOMER_OPPORTUNITY' : type.toUpperCase(),
                title: `New ${type}`,
                description: '',
            },
        }
        setNodes([...nodes, newNode])
    }, [nodes, setNodes])

    return (
        <div className="w-full h-full bg-slate-50">
            <RealtimeBoardSync boardId={boardId} />
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
                        <Button size="sm" variant="outline" onClick={() => addNode('Opportunity')} className="gap-1">
                            <Plus className="w-4 h-4" /> Opportunity
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addNode('Metric')} className="gap-1">
                            <Plus className="w-4 h-4" /> Metric
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => addNode('Outcome')} className="gap-1">
                            <Plus className="w-4 h-4" /> Outcome
                        </Button>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    )
}
