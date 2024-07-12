import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User, ParsedToken } from "@firebase/auth";
import { onDisconnect, onValue, ref, serverTimestamp, set } from "@firebase/database";
import { collection, doc, onSnapshot, Timestamp, DocumentData } from "@firebase/firestore";
import { useRouter } from "next/dist/client/router";
import React, { useState, useEffect, useContext, createContext } from "react";
import { auth, db, firebase, rtdb } from "../config/firebase";
import Merge from "../types/Merge";
import StudentDetails from "../types/StudentDetails";
import UserToken from "../types/UserToken";
import { useLocalStorage } from "./useHooks";
import { useAuthState } from 'react-firebase-hooks/auth';
export type AuthHook = ReturnType<typeof useAuthProvider>;

const authContext = createContext<ReturnType<typeof useAuthProvider>>({ user: null, userDetails:undefined, userToken: undefined, getUserTokenResult: () => null, appInstance: 0, signOut: async () => {}, initGoogleSignIn: async () => {}, refreshUserToken: async () => {} });
const { Provider } = authContext;

/**
 * @component
 * @param {props} props children that require access to the useAuth hook
 * @returns {Provider}
 */
export function AuthProvider({ children }: { children: React.ReactChild | React.ReactChildren}) {
    const auth = useAuthProvider();
    return <Provider value={auth}>{children}</Provider>;
}


/**
 * The hook which contains the current state of user authentication
 * @returns authContext
 */
export const useAuth = () => {
    return useContext<ReturnType<typeof useAuthProvider>>(authContext);
};

/**
 * Logic required to run the auth methods for Firebase
 * @returns { user, userDetails, signInWithEmailAndPassword, signOut, initGoogleSignIn }
 */

let appInstance = Date.now();

type UserDetails = Merge<
    StudentDetails,
    {
        migrated: boolean;
        _firstLogin: Timestamp;
    }
>

const useAuthProvider = () => {
    const [user, authing, authError] = useAuthState(auth); 
    const [userDetails, setUserDetails] = useState<UserDetails>();
    const [userToken, setUserToken] = useState<UserToken>();
    const [lastCommitted, setLastCommitted] = useLocalStorage<number>("lastCommited", 0);  //The last committed state of our user claims document, decides if token needs to update if outdated
    const router = useRouter()

    /**
     * Sign in user with a Google Account with a redirect
     */
    const initGoogleSignIn = async () => {
        await signInWithPopup(auth, new GoogleAuthProvider()
                .setCustomParameters({
                    prompt: "select_account",
                    hd: "clphs.edu.my"
                })).catch((error) => {
                    return { error };
                });
    };
    
    /**
     * Get firebase user tokens with custom claims for permission use, only refreshes if is true
     * @param {boolean} refresh 
     * @returns userClaims
     */
    const getUserTokenResult = async (refresh: boolean = false) => {
        if (!user) return;
        let { claims } = await user.getIdTokenResult(refresh);
        
        //If user on homepage, redirect to dashboard
        if (router.asPath == '/') {
            router.push('/dashboard');
        }
        return claims as unknown as UserToken
    };

    const refreshUserToken = async () => {
        const userToken = await getUserTokenResult(true);
        setUserToken(userToken);
    };

    /**
     * Signs out the current user
     * @returns null
     */
    const userSignOut = () => {
        return signOut(auth)
    };

    //Attaches the onAuthStateChanged to listen for changes in authentication eg: login, signout etc.
    useEffect(() => {
        if (user) {
            console.log('logged in as ', user.email);
        }
        else if(user === null && authing === false) {
            router.push('/');
        }
    }, [user]);
    
    //Attaches user claims documents to listen for changes in user permissions, if yes update token to ensure no permission errors
    useEffect(() => {
        if (!user) return;
        (async () => setUserToken(await getUserTokenResult()))();
        return onSnapshot(doc(db,'user_claims',user.uid), async (snap) => {
            const data = snap.data();
            
            if(!data?._lastCommitted) return;

            if (lastCommitted && !(data?._lastCommitted || {}).isEqual(lastCommitted)) {
                console.log('updating user token')
                setUserToken(await getUserTokenResult(true));
            }
            setLastCommitted(data?._lastCommitted);
        },
        error => {
            console.log(error)
        });
    }, [user?.uid]); //Only reattach if user uid is updated :(

    //Attaches the user document to listen for changes in the document
    useEffect(() => {
        if (user?.uid) {
            // Subscribe to user document on mount
            const unsubscribe = onSnapshot(doc(db,'users',user.uid), async (doc) => {
                const userDetails = doc.data() as UserDetails
                if(!userDetails?.migrated) router.push('/setup')
                setUserDetails(userDetails)
            })
            var userStatusDatabaseRef = ref(rtdb,'/status/' + user.uid); 
            var isOfflineForDatabase = {
                state: 'offline',
                last_changed: serverTimestamp(),
            };

            var isOnlineForDatabase = {
                state: 'online',
                last_changed: serverTimestamp(),
            };
            onValue(ref(rtdb,'.info/connected'), (snapshot) => {
                // If we're not currently connected, don't do anything.
                if (snapshot.val() == false) return;
                onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(function() {
                    set(userStatusDatabaseRef, isOnlineForDatabase);
                });
            }, (error) => {
                console.error(error);
            })

            return () => {
                unsubscribe();
            }
        }
    }, [user, userToken]);

    return {
        user,
        userDetails,
        userToken,
        getUserTokenResult,
        appInstance,
        signOut: userSignOut,
        initGoogleSignIn,
        refreshUserToken
    };
};