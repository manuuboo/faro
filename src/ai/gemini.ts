import {
    getFaroAISettings,
} from '../services/aiSettings';

export async function askGemini(
    message: string,
    businessId: string
): Promise<string> {
    const aiSettings = getFaroAISettings();

    const response = await fetch('/api/chat', {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            message,
            businessId,
            aiSettings,
        }),
    });

    if (!response.ok) {
        const errorData =
            await response.json().catch(() => null);

        console.error(
            'Faro AI Server error:',
            errorData
        );

        throw new Error(
            errorData?.error ||
            'Failed to communicate with Faro AI'
        );
    }

    const data = await response.json();

    return data.reply;
}