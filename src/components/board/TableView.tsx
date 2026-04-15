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

export function TableView() {
    const { nodes } = useCanvasStore()
    const [filter, setFilter] = useState('')

    const filteredNodes = nodes.filter(node => {
        const titleMatch = (node.data.title as string)?.toLowerCase().includes(filter.toLowerCase())
        const descMatch = (node.data.description as string)?.toLowerCase().includes(filter.toLowerCase())
        const typeMatch = (node.type as string).toLowerCase().includes(filter.toLowerCase())
        return titleMatch || descMatch || typeMatch
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
                                <TableHead className="w-[180px] font-semibold text-slate-700">Entity Type</TableHead>
                                <TableHead className="w-[250px] font-semibold text-slate-700">Opportunity Title</TableHead>
                                <TableHead className="font-semibold text-slate-700">Context / Description</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredNodes.length > 0 ? filteredNodes.map((node) => (
                                <TableRow key={node.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <Badge variant="outline" className={`font-medium ${node.type === 'Opportunity' ? 'bg-[#fee2e2] text-red-700 border-red-200' :
                                                node.type === 'Metric' ? 'bg-[#dcfce7] text-green-700 border-green-200' :
                                                    'bg-[#e0e7ff] text-indigo-700 border-indigo-200'
                                            }`}>
                                            {node.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800">{node.data.title as string || 'Untitled Node'}</TableCell>
                                    <TableCell className="text-slate-600 truncate max-w-[400px] text-sm">
                                        {node.data.description as string || <span className="text-slate-400 italic">No description provided</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-slate-400 text-xs font-medium cursor-not-allowed">Edit via Canvas</span>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <p className="text-base font-medium text-slate-700 mb-1">No nodes found</p>
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
