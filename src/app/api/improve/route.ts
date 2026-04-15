import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { text, nodeType } = await req.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert product manager mastering the Theresa Torres' Opportunity Mapping framework. Refine and improve the following text for a ${nodeType} node. Make it concise, exact, and highly actionable. Return ONLY the finalized text without quotes or explanations.`
                },
                { role: "user", content: text }
            ],
            model: "gpt-4o",
        })

        const result = completion.choices[0]?.message?.content?.trim() || text

        return NextResponse.json({ improvedText: result })
    } catch (error: any) {
        console.error('OpenAI Error:', error)
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }
}
