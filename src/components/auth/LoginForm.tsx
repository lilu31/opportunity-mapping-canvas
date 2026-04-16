'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
    const [isLoadingEmail, setIsLoadingEmail] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        setIsLoadingGoogle(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            console.error(error)
            setIsLoadingGoogle(false)
        }
    }

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoadingEmail(true)
        setMessage('')

        // Attempt standard login
        let { error } = await supabase.auth.signInWithPassword({ email, password })

        // If user is absent, try explicitly signing them up
        if (error && error.message.includes('Invalid login credentials')) {
            const { error: signUpError } = await supabase.auth.signUp({ email, password })
            error = signUpError
            if (!error) {
                setMessage('Account successfully created! Check your email or login directly (if confirmations are disabled).')
                setIsLoadingEmail(false)
                return
            }
        }

        if (error) {
            setMessage(`Error: ${error.message}`)
        } else {
            window.location.href = '/' // Force hard redirect on success to trigger middleware
        }
        setIsLoadingEmail(false)
    }

    return (
        <div className="flex flex-col space-y-4 w-full">
            <Button
                onClick={handleGoogleLogin}
                disabled={isLoadingGoogle || isLoadingEmail}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm opacity-50 cursor-not-allowed"
            >
                <svg className="w-4 h-4 grayscale" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">Or Local Login</span>
                </div>
            </div>

            <form onSubmit={handlePasswordLogin} className="flex flex-col space-y-3">
                <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button
                    type="submit"
                    disabled={isLoadingEmail || isLoadingGoogle}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                    {isLoadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up & Login'}
                </Button>
            </form>

            {message && (
                <p className="text-sm text-center text-indigo-600 mt-2 font-medium">{message}</p>
            )}
        </div>
    )
}
