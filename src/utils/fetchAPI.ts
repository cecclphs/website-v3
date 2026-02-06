import { User } from 'firebase/auth'

export const fetchAPI = async (apiMethod: string, user: User | null | undefined, options: RequestInit = {}) => {
    if (!user) {
        throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    try {
        const response = await fetch(`/api/${apiMethod}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Check if response is ok
        if (!response.ok) {
            // Try to parse error as JSON
            const error = await response.json().catch(() => ({
                error: `Request failed with status ${response.status}`
            }));
            return { error: error.error || error.message || 'Request failed' };
        }

        // Parse successful response
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch API error:', error);
        return {
            error: error instanceof Error ? error.message : 'Network request failed'
        };
    }
}

export default fetchAPI;