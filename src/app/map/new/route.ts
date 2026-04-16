import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: board, error } = await supabase
        .from('boards')
        .insert({ title: 'New Opportunity Map', user_id: user.id })
        .select()
        .single()

    if (error || !board) {
        return NextResponse.redirect(new URL('/?error=create_failed', request.url))
    }

    return NextResponse.redirect(new URL(`/map/${board.id}`, request.url))
}
