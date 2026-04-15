import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full flex-1 flex flex-col justify-center items-center">
                <div className="mb-10 text-center">
                    <div className="h-10 w-10 bg-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
                        {/* Simple logo placeholder */}
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <h2 className="text-slate-800 font-medium">The Architect Tool</h2>
                </div>
                <LoginForm />
            </div>
        </main>
    )
}
