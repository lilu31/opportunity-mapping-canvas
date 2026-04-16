import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Plus, LayoutGrid } from 'lucide-react'
import { MapCard } from '@/components/dashboard/MapCard'

// Simulated loading to showcase skeletons in the dashboard
async function RecentBoards() {
  const supabase = createClient()

  const { data: boards } = await supabase.from('boards').select('*').order('created_at', { ascending: false })

  if (!boards || boards.length === 0) {
    return null
  }

  return (
    <>
      {boards.map(board => (
        <MapCard key={board.id} board={board} />
      ))}
    </>
  )
}

function BoardSkeletons() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-[220px] bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <Skeleton className="w-10 h-10 rounded-full bg-slate-100" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4 bg-slate-100" />
            <Skeleton className="h-3 w-1/2 bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  )
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-10 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Workspace</h1>
          <p className="text-slate-500 mt-2">Visualizing opportunities and driving outcomes.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Create New Action Card */}
          <a href="/map/new" className="block">
            <div className="h-[220px] bg-transparent rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-100 hover:border-slate-300">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Start New Map</h3>
              <p className="text-xs text-slate-500 mt-1">Using Strategy Template</p>
            </div>
          </a>

          <Suspense fallback={<BoardSkeletons />}>
            <RecentBoards />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
