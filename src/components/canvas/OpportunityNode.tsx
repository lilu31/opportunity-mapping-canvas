import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MoreVertical, Sparkles, Loader2 } from 'lucide-react'
import { useCanvasStore } from '@/store/useCanvasStore'

export const OpportunityNode = memo(({ id, data, selected }: NodeProps) => {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData)
    const [isImproving, setIsImproving] = useState(false)

    const handleImprove = async () => {
        setIsImproving(true)
        try {
            const res = await fetch('/api/improve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: data.description || data.title, nodeType: 'Opportunity' }),
            })
            const result = await res.json()
            if (result.improvedText) {
                updateNodeData?.(id, { description: result.improvedText })
            }
        } catch (err) {
            console.error('Failed to improve node:', err)
        } finally {
            setIsImproving(false)
        }
    }

    return (
        <div className={`w-[320px] bg-[#fee2e2] rounded-xl shadow-sm border-2 ${selected ? 'border-red-400' : 'border-red-200'} text-slate-800 transition-all`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-400 border-2 border-white" />

            <div className="p-4 relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-bold text-red-600 tracking-wider uppercase">
                        {data.type === 'BUSINESS_OPPORTUNITY' ? 'Business Opportunity' : 'Customer Opportunity'}
                    </div>
                    <div className="flex gap-1">
                        <button className="p-1 hover:bg-red-200 rounded text-red-500 transition-colors">
                            <MoreVertical className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <input
                    value={data.title as string || ''}
                    className="font-bold text-lg mb-2 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1 -ml-1 placeholder-red-300"
                    placeholder="Enter opportunity name..."
                    onChange={(e) => updateNodeData?.(id, { title: e.target.value })}
                />

                <textarea
                    value={data.description as string || ''}
                    className="text-sm text-slate-700 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1 -ml-1 placeholder-red-300 resize-none h-16"
                    placeholder="Describe the opportunity..."
                    onChange={(e) => updateNodeData?.(id, { description: e.target.value })}
                />

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={handleImprove}
                        disabled={isImproving}
                        className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-100 px-2 py-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                        {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isImproving ? 'Improving...' : 'Improve'}
                    </button>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-red-400 border-2 border-white" />
        </div>
    )
})
OpportunityNode.displayName = 'OpportunityNode'
