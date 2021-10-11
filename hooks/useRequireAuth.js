import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const useRequireAuth = () => {
    const auth = useAuth();
    useEffect(() => {
        if (auth.user === false) {
            //Do something if user is not signed in like route to login page?
        }
    }, [auth]);

    return auth;
};