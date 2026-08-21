import {
    getFaroAISettings,
} from '../services/aiSettings';

export interface GeminiAttachment {
    type: 'image' | 'audio' | 'file';
    name: string;
    mimeType: string;
    base64: string;
}

export async function askGemini(
    message: string,
    businessId: string,
    attachments: GeminiAttachment[] = []
): Promise<string> {

    console.log('========== ASK GEMINI ==========');
    console.log('Mensaje:', message);
    console.log('Business ID:', businessId);
    console.log('Attachments:', attachments);
    console.log('Cantidad de archivos:', attachments.length);

    const aiSettings = getFaroAISettings();

    console.log('AI Settings:', aiSettings);

    const response = await fetch('/api/chat', {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify({
            message,
            businessId,
            aiSettings,
            attachments,
        }),
    });

    console.log(
        'Respuesta HTTP:',
        response.status,
        response.statusText
    );

    const data = await response.json().catch(() => null);

    console.log('Respuesta /api/chat:', data);

    if (!response.ok) {
        console.error(
            'Faro AI Server error:',
            data
        );

        throw new Error(
            data?.error ||
            'Failed to communicate with Faro AI'
        );
    }

    if (!data) {
        throw new Error(
            'El servidor respondió vacío'
        );
    }

    if (!data.reply) {
        console.error(
            'La respuesta no contiene reply:',
            data
        );

        throw new Error(
            'Faro AI no devolvió una respuesta válida'
        );
    }

    console.log(
        'Respuesta final de Faro:',
        data.reply
    );

    console.log('========== ASK GEMINI END ==========');

    return data.reply;
}