export type FaroAutonomy =
    | 'answer_only'
    | 'suggest_actions'
    | 'execute_actions';

export type FaroResponseStyle =
    | 'brief'
    | 'balanced'
    | 'detailed';

export interface FaroAISettings {
    autonomy: FaroAutonomy;
    responseStyle: FaroResponseStyle;
}

const STORAGE_KEY = 'FARO_AI_SETTINGS';

const DEFAULT_SETTINGS: FaroAISettings = {
    autonomy: 'answer_only',
    responseStyle: 'balanced',
};

export function getFaroAISettings(): FaroAISettings {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return DEFAULT_SETTINGS;
        }

        const parsed = JSON.parse(saved);

        return {
            autonomy:
                parsed.autonomy === 'answer_only' ||
                    parsed.autonomy === 'suggest_actions' ||
                    parsed.autonomy === 'execute_actions'
                    ? parsed.autonomy
                    : DEFAULT_SETTINGS.autonomy,

            responseStyle:
                parsed.responseStyle === 'brief' ||
                    parsed.responseStyle === 'balanced' ||
                    parsed.responseStyle === 'detailed'
                    ? parsed.responseStyle
                    : DEFAULT_SETTINGS.responseStyle,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveFaroAISettings(
    settings: FaroAISettings
): void {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );
}