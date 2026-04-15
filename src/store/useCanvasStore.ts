import { create } from 'zustand'
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react'

export type CanvasState = {
    nodes: Node[]
    edges: Edge[]
    onNodesChange: OnNodesChange
    onEdgesChange: OnEdgesChange
    onConnect: OnConnect
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    updateNodeData: (id: string, newData: any) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    nodes: [],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        })
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        })
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        })
    },
    setNodes: (nodes: Node[]) => {
        set({ nodes })
    },
    setEdges: (edges: Edge[]) => {
        set({ edges })
    },
    updateNodeData: (id: string, newData: any) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } }
                }
                return node
            }),
        })
    },
}))
