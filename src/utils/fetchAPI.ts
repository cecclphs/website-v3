import { User } from 'firebase/auth'
export const fetchAPI = async (apiMethod: string, user: User, options?: RequestInit) => {
    if(!user) throw new Error('User is not defined')
    return fetch(`/api/${apiMethod}`, {
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            authorization: `Bearer ${await user.getIdToken()}`
        },
        ...options
    }).then(res => res.json())
}