"use client"

import { useState } from 'react'
import { useCanvasStore } from '@/store/useCanvasStore'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TableRowData {
    id: string;
    type: 'Opportunity' | 'Metric' | 'Outcome';
    subType?: 'BUSINESS_OPPORTUNITY' | 'CUSTOMER_OPPORTUNITY';
    title: string;
    description: string;
    level: number;
    relations?: {
        incoming: string[];
        outgoing: string[];
    }
}

export function TableView() {
    const { nodes, edges } = useCanvasStore()
    const [filter, setFilter] = useState('')

    const flattenedNodes: TableRowData[] = []

    nodes.forEach(node => {
        const oppTitle = (node.data.title as string) || ''
        const oppDesc = (node.data.description as string) || ''

        const oppTitleMatch = oppTitle.toLowerCase().includes(filter.toLowerCase())
        const oppDescMatch = oppDesc.toLowerCase().includes(filter.toLowerCase())
        const oppTypeMatch = (node.data.type as string)?.toLowerCase().includes(filter.toLowerCase())
        const oppMatchMatch = oppTitleMatch || oppDescMatch || oppTypeMatch || filter === 'opportunity'

        const metrics = (node.data.metrics as any[]) || []

        // Instead of pure strict filtering, if parent matches or ANY child matches, we should show the parent.
        const treeMatches = oppMatchMatch || metrics.some(metric => {
            const mTitle = (metric.title as string) || ''
            if (mTitle.toLowerCase().includes(filter.toLowerCase()) || filter === 'metric') return true

            const outcomes = (metric.outcomes as any[]) || []
            return outcomes.some(outcome => {
                const oTitle = (outcome.title as string) || ''
                const oDesc = (outcome.description as string) || ''
                return oTitle.toLowerCase().includes(filter.toLowerCase()) || oDesc.toLowerCase().includes(filter.toLowerCase()) || filter === 'outcome'
            })
        })

        if (!treeMatches && filter !== '') return

        const incomingTitles = edges.filter(e => e.target === node.id).map(e => (nodes.find(n => n.id === e.source)?.data.title as string) || 'Untitled')
        const outgoingTitles = edges.filter(e => e.source === node.id).map(e => (nodes.find(n => n.id === e.target)?.data.title as string) || 'Untitled')

        flattenedNodes.push({
            id: node.id,
            type: 'Opportunity',
            subType: node.data.type as any,
            title: oppTitle || 'Untitled Opportunity',
            description: oppDesc || '',
            level: 0,
            relations: { incoming: incomingTitles, outgoing: outgoingTitles }
        })

        metrics.forEach(metric => {
            const mTitle = (metric.title as string) || ''
            const metricMatch = mTitle.toLowerCase().includes(filter.toLowerCase()) || filter === 'metric'

            const outcomes = (metric.outcomes as any[]) || []
            const outcomeMatches = outcomes.some(outcome => {
                const oTitle = (outcome.title as string) || ''
                const oDesc = (outcome.description as string) || ''
                return oTitle.toLowerCase().includes(filter.toLowerCase()) || oDesc.toLowerCase().includes(filter.toLowerCase()) || filter === 'outcome'
            })

            // Only show metric if filter is empty, or the metric matches, or an outcome matches, or parent perfectly matched
            if (filter === '' || oppMatchMatch || metricMatch || outcomeMatches) {
                flattenedNodes.push({
                    id: metric.id,
                    type: 'Metric',
                    title: mTitle || 'Untitled Metric',
                    description: metric.description || '',
                    level: 1
                })

                outcomes.forEach(outcome => {
                    const oTitle = (outcome.title as string) || ''
                    const oDesc = (outcome.description as string) || ''
                    const outcomeExactMatch = oTitle.toLowerCase().includes(filter.toLowerCase()) || oDesc.toLowerCase().includes(filter.toLowerCase()) || filter === 'outcome'

                    if (filter === '' || oppMatchMatch || metricMatch || outcomeExactMatch) {
                        flattenedNodes.push({
                            id: outcome.id,
                            type: 'Outcome',
                            title: oTitle || 'Untitled Outcome',
                            description: oDesc || '',
                            level: 2
                        })
                    }
                })
            }
        })
    })

    return (
        <div className="w-full h-full p-8 bg-slate-50 overflow-y-auto">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Nodes Repository</h2>
                        <p className="text-sm text-slate-500 mt-1">Review and manage all structured nodes mapped on your canvas.</p>
                    </div>
                    <div className="relative w-72">
                        <Input
                            placeholder="Search across title, description or type..."
                            className="w-full border-slate-300 shadow-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="border-b border-slate-200">
                                <TableHead className="w-[250px] font-semibold text-slate-700">Hierarchy / Type</TableHead>
                                <TableHead className="w-[220px] font-semibold text-slate-700">Title</TableHead>
                                <TableHead className="w-[250px] font-semibold text-slate-700">Connections</TableHead>
                                <TableHead className="font-semibold text-slate-700">Description</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flattenedNodes.length > 0 ? flattenedNodes.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className={`flex items-center ${item.level === 1 ? 'ml-6' : item.level === 2 ? 'ml-12' : ''}`}>
                                            {item.level > 0 && <span className="text-slate-300 mr-2">↳</span>}
                                            <Badge variant="outline" className={`font-medium ${item.type === 'Opportunity'
                                                ? (item.subType === 'CUSTOMER_OPPORTUNITY' ? 'bg-[#e0f2fe] text-blue-700 border-blue-200' : 'bg-[#fee2e2] text-red-700 border-red-200')
                                                : item.type === 'Metric' ? 'bg-[#dcfce7] text-green-700 border-green-200'
                                                    : 'bg-[#e0e7ff] text-indigo-700 border-indigo-200'
                                                }`}>
                                                {item.type === 'Opportunity' ? (item.subType === 'CUSTOMER_OPPORTUNITY' ? 'Customer Opp.' : 'Business Opp.') : item.type}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800">{item.title}</TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {item.relations && (
                                            <div className="flex flex-col gap-1">
                                                {item.relations.incoming.length > 0 && <div><span className="font-medium text-indigo-600">Depends on:</span> {item.relations.incoming.join(', ')}</div>}
                                                {item.relations.outgoing.length > 0 && <div><span className="font-medium text-amber-600">Drives:</span> {item.relations.outgoing.join(', ')}</div>}
                                                {item.relations.incoming.length === 0 && item.relations.outgoing.length === 0 && <span className="italic text-slate-400">No links</span>}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-600 truncate max-w-[300px] text-sm">
                                        {item.description ? item.description : <span className="text-slate-400 italic">No description provided</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-slate-400 text-xs font-medium cursor-not-allowed">Edit via Canvas</span>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <p className="text-base font-medium text-slate-700 mb-1">No mapping entity found</p>
                                            <p className="text-sm">We couldn't find any nodes matching your search filter.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
