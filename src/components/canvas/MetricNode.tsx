import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MoreVertical, Sparkles, Loader2 } from 'lucide-react'
import { useCanvasStore } from '@/store/useCanvasStore'

export const MetricNode = memo(({ id, data, selected }: NodeProps) => {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData)
    const [isImproving, setIsImproving] = useState(false)

    const handleImprove = async () => {
        setIsImproving(true)
        try {
            const res = await fetch('/api/improve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: data.description || data.title, nodeType: 'Success Metric' }),
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
        <div className={`w-[280px] bg-[#dcfce7] rounded-xl shadow-sm border-2 ${selected ? 'border-green-400' : 'border-green-200'} text-slate-800 transition-all`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500 border-2 border-white" />

            <div className="p-3 relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-bold text-green-700 tracking-wider uppercase">Success Metric</div>
                    <div className="flex gap-1">
                        <button className="p-1 hover:bg-green-200 rounded text-green-600 transition-colors">
                            <MoreVertical className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <input
                    value={data.title as string || ''}
                    className="font-bold text-md mb-1 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-400 rounded px-1 -ml-1 placeholder-green-400"
                    placeholder="Metric name..."
                    onChange={(e) => updateNodeData?.(id, { title: e.target.value })}
                />

                <textarea
                    value={data.description as string || ''}
                    className="text-xs text-slate-600 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-400 rounded px-1 -ml-1 placeholder-green-400 resize-none h-10"
                    placeholder="How is this measured?"
                    onChange={(e) => updateNodeData?.(id, { description: e.target.value })}
                />

                <div className="mt-2 flex justify-end">
                    <button
                        onClick={handleImprove}
                        disabled={isImproving}
                        className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-200 px-2 py-1 rounded hover:bg-green-300 transition-colors disabled:opacity-50"
                    >
                        {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isImproving ? 'Improving...' : 'Improve'}
                    </button>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500 border-2 border-white" />
        </div>
    )
})
MetricNode.displayName = 'MetricNode'
