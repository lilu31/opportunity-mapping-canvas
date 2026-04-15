"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error('Login error:', error.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col space-y-6 w-full max-w-sm mx-auto bg-white p-10 rounded-xl shadow-md border border-slate-100">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
                <p className="text-sm text-slate-500 mt-2">Sign in to opportunity mapping</p>
            </div>

            <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="default"
                className="w-full text-base py-5 transition-all"
            >
                {isLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>

            <div className="text-center text-xs text-slate-400 mt-4">
                By continuing, you agree to our Terms of Service.
            </div>
        </div>
    )
}
