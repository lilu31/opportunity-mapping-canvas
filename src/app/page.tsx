import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Plus, MoreVertical, LayoutGrid } from 'lucide-react'

// Simulated loading to showcase skeletons in the dashboard
async function RecentBoards() {
  const supabase = createClient()

  // Fake delay of 1.5s for illustration of UI polish
  await new Promise(resolve => setTimeout(resolve, 1500))

  const { data: boards } = await supabase.from('boards').select('*').order('created_at', { ascending: false })

  if (!boards || boards.length === 0) {
    return (
      <div className="col-span-1 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[220px]">
        <h3 className="text-slate-600 font-medium mb-1">No maps found</h3>
        <p className="text-sm text-slate-400 text-center mb-4">Start visualizing your problem space by creating your first map.</p>
        <Link href="/board/new" className="text-indigo-600 font-medium text-sm hover:underline">
          Create Board →
        </Link>
      </div>
    )
  }

  return (
    <>
      {boards.map(board => (
        <Link key={board.id} href={`/board/${board.id}`} className="block group">
          <div className="h-[220px] bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-100">
            <div className="flex justify-between items-start">
              {/* Visual Preview Stub */}
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{board.title}</h3>
              <p className="text-xs text-slate-400">Created {new Date(board.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </Link>
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
          <Link href="/board/new" className="block">
            <div className="h-[220px] bg-transparent rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-100 hover:border-slate-300">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800">Start New Map</h3>
              <p className="text-xs text-slate-500 mt-1">Using Strategy Template</p>
            </div>
          </Link>

          <Suspense fallback={<BoardSkeletons />}>
            <RecentBoards />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
