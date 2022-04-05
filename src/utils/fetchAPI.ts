import { User } from 'firebase/auth'
export const fetchAPI = async (apiMethod: string, options: RequestInit, user: User) => {
    if(!user) throw new Error('User is not defined')
    return fetch(`/api/${apiMethod}`, {
        headers: {
            authorization: `Bearer ${await user.getIdToken()}`
        },
        ...options
    })
}