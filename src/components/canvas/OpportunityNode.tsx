import { memo, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Trash2, Plus, Sparkles, Trophy, Loader2 } from 'lucide-react'
import { useCanvasStore } from '@/store/useCanvasStore'

// Define our types
interface Outcome {
    id: string;
    title: string;
    description: string;
}

interface Metric {
    id: string;
    title: string;
    description: string;
    outcomes: Outcome[];
}

export const OpportunityNode = memo(({ id, data, selected }: NodeProps) => {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData)
    const removeNode = useCanvasStore((state) => state.removeNode)
    const metrics: Metric[] = (data.metrics as Metric[]) || []
    const [isImproving, setIsImproving] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
            console.error(err)
        } finally {
            setIsImproving(false)
        }
    }

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        setIsDeleteDialogOpen(false)
        removeNode?.(id)
    }

    const cancelDelete = () => {
        setIsDeleteDialogOpen(false)
    }

    const handleAddMetric = () => {
        updateNodeData?.(id, {
            metrics: [...metrics, {
                id: crypto.randomUUID(),
                title: 'New Metric',
                description: '',
                outcomes: []
            }]
        })
    }

    const handleUpdateMetric = (metricId: string, updates: Partial<Metric>) => {
        const newMetrics = metrics.map(m => m.id === metricId ? { ...m, ...updates } : m)
        updateNodeData?.(id, { metrics: newMetrics })
    }

    const handleAddOutcome = (metricId: string) => {
        const newMetrics = metrics.map(m => {
            if (m.id === metricId) {
                return {
                    ...m,
                    outcomes: [...(m.outcomes || []), {
                        id: crypto.randomUUID(),
                        title: 'New Outcome',
                        description: ''
                    }]
                }
            }
            return m
        })
        updateNodeData?.(id, { metrics: newMetrics })
    }

    const handleUpdateOutcome = (metricId: string, outcomeId: string, updates: Partial<Outcome>) => {
        const newMetrics = metrics.map(m => {
            if (m.id === metricId) {
                return {
                    ...m,
                    outcomes: m.outcomes.map(o => o.id === outcomeId ? { ...o, ...updates } : o)
                }
            }
            return m
        })
        updateNodeData?.(id, { metrics: newMetrics })
    }

    const handleDeleteMetric = (metricId: string) => {
        updateNodeData?.(id, { metrics: metrics.filter(m => m.id !== metricId) })
    }

    const handleDeleteOutcome = (metricId: string, outcomeId: string) => {
        const newMetrics = metrics.map(m => {
            if (m.id === metricId) {
                return { ...m, outcomes: m.outcomes.filter(o => o.id !== outcomeId) }
            }
            return m
        })
        updateNodeData?.(id, { metrics: newMetrics })
    }

    const isCust = data.type === 'CUSTOMER_OPPORTUNITY'

    return (
        <div className={`min-w-[450px] w-fit max-w-[1200px] rounded-2xl shadow-xl border font-sans transition-all ${isCust ? 'bg-[#e0f2fe] ' + (selected ? 'border-blue-400' : 'border-[#bae6fd]') : 'bg-[#fce9dc] ' + (selected ? 'border-orange-400' : 'border-[#fac2a5]')}`}>
            <Handle type="target" position={Position.Top} className={`w-4 h-4 border-2 border-white ${isCust ? 'bg-blue-400' : 'bg-orange-400'}`} />

            {isDeleteDialogOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 rounded-2xl backdrop-blur-[2px] transition-all">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-red-100 w-[300px] text-center">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Delete permanently?</h3>
                        <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">Are you sure you want to completely delete this Opportunity, including all mapped Metrics and Outcomes?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={cancelDelete} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-600/30 cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 relative">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <div className={`text-[12px] font-bold tracking-[0.15em] uppercase ${isCust ? 'text-blue-800/80' : 'text-orange-800/80'}`}>
                        {isCust ? 'Customer Opportunity' : 'Business Opportunity'}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleImprove}
                            disabled={isImproving}
                            title="Improve Description with AI"
                            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isCust ? 'hover:bg-blue-200/50 text-blue-900 bg-blue-100/40' : 'hover:bg-orange-200/50 text-orange-900 bg-orange-100/40'}`}
                        >
                            {isImproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            title="Delete Opportunity"
                            className={`w-8 h-8 flex items-center justify-center rounded-xl text-red-700 transition-colors cursor-pointer hover:bg-red-200/80 ${isCust ? 'bg-blue-100/40' : 'bg-orange-100/40'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <input
                    value={data.title as string || ''}
                    className={`font-bold text-3xl mb-4 w-full bg-transparent border-none focus:outline-none focus:ring-2 rounded px-1 -ml-1 text-slate-900 ${isCust ? 'focus:ring-blue-400/50 placeholder-blue-400' : 'focus:ring-orange-400/50 placeholder-orange-400'}`}
                    placeholder="Opportunity Name..."
                    onChange={(e) => updateNodeData?.(id, { title: e.target.value })}
                />

                <textarea
                    value={data.description as string || ''}
                    className={`text-lg w-full bg-transparent border-none focus:outline-none focus:ring-2 rounded px-1 -ml-1 resize-none h-20 leading-relaxed font-medium ${isCust ? 'text-blue-950/80 focus:ring-blue-400/50 placeholder-blue-300' : 'text-orange-950/80 focus:ring-orange-400/50 placeholder-[#ea9f82]'}`}
                    placeholder="Describe the opportunity context and goals..."
                    onChange={(e) => updateNodeData?.(id, { description: e.target.value })}
                />

                {/* Metrics Section */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <div className="text-[11px] font-bold text-[#cf7d5c] tracking-[0.15em] uppercase">Success Metrics</div>
                        <button
                            onClick={handleAddMetric}
                            className="text-[#bc5a36] hover:text-[#903d22] text-sm font-bold flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" /> Add Metric
                        </button>
                    </div>

                    <div className="flex flex-row flex-wrap gap-6">
                        {metrics.map(metric => (
                            <div key={metric.id} className="bg-[#b4dfab] rounded-[20px] p-5 shadow-sm relative group w-[340px] shrink-0">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-[10px] font-bold text-green-900/60 tracking-[0.15em] uppercase">
                                        Success Metric
                                    </div>
                                    <button onClick={() => handleDeleteMetric(metric.id)} title="Delete Metric" className="w-6 h-6 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <input
                                    value={metric.title}
                                    className="font-bold text-2xl mb-1 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-600/30 rounded px-1 -ml-1 placeholder-green-700/50 text-[#095a28]"
                                    placeholder="Metric Name..."
                                    onChange={(e) => handleUpdateMetric(metric.id, { title: e.target.value })}
                                />

                                {/* Outcomes inside Metric */}
                                < div className="mt-6" >
                                    <div className="text-[10px] font-bold text-green-800/50 tracking-[0.15em] uppercase mb-3">
                                        Targeted Outcomes
                                    </div>
                                    <div className="space-y-3">
                                        {(metric.outcomes || []).map(outcome => (
                                            <div key={outcome.id} className="bg-[#cedcee] rounded-xl p-4 shadow-sm hover:shadow relative group/outcome transition-all">
                                                <div className="flex justify-between items-start">
                                                    <input
                                                        value={outcome.title}
                                                        className="font-bold text-lg text-blue-800 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded px-1 -ml-1 placeholder-blue-800/40"
                                                        placeholder="Outcome Title..."
                                                        onChange={(e) => handleUpdateOutcome(metric.id, outcome.id, { title: e.target.value })}
                                                    />
                                                    <button onClick={() => handleDeleteOutcome(metric.id, outcome.id)} title="Delete Outcome" className="w-5 h-5 flex items-center justify-center rounded text-red-500 hover:bg-red-100/80 transition-colors opacity-0 group-hover/outcome:opacity-100 cursor-pointer flex-shrink-0 mt-1 ml-1">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <input
                                                    value={outcome.description}
                                                    className="text-[15px] italic text-blue-900/60 mt-1 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400/30 rounded px-1 -ml-1 placeholder-blue-900/40 block pb-1 border-b border-transparent hover:border-blue-300/30 transition-colors"
                                                    placeholder="Short outcome summary..."
                                                    onChange={(e) => handleUpdateOutcome(metric.id, outcome.id, { description: e.target.value })}
                                                />
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => handleAddOutcome(metric.id)}
                                            className="w-full py-3 mt-4 flex items-center justify-center gap-2 border-[2px] border-dashed border-[#8ec784] text-[#4f8d45] font-bold text-sm rounded-xl hover:bg-[#a6d79a] transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4 stroke-[3]" /> Add Outcome
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            <Handle type="source" position={Position.Bottom} className={`w-4 h-4 border-2 border-white ${isCust ? 'bg-blue-400' : 'bg-orange-400'}`} />
        </div >
    )
})
OpportunityNode.displayName = 'OpportunityNode'
