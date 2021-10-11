import { GoogleAuthProvider, onAuthStateChanged, signInWithRedirect } from "@firebase/auth";
import { onDisconnect, onValue, ref, serverTimestamp, set } from "@firebase/database";
import { collection, doc, onSnapshot, signOut } from "@firebase/firestore";
import { useRouter } from "next/dist/client/router";
import { useState, useEffect, useContext, createContext } from "react";
import { auth, db, firebase, rtdb } from "../config/firebase";
import { useLocalStorage } from "./useHooks";

const authContext = createContext({ user: {} });
const { Provider } = authContext;

/**
 * @component
 * @param {props} props children that require access to the useAuth hook
 * @returns {Provider}
 */
export function AuthProvider({ children }) {
    const auth = useAuthProvider();
    return <Provider value={auth}>{children}</Provider>;
}

/**
 * The hook which contains the current state of user authentication
 * @returns authContext
 */
export const useAuth = () => {
    return useContext(authContext);
};

/**
 * Logic required to run the auth methods for Firebase
 * @returns { user, userDetails, signInWithEmailAndPassword, signOut, initGoogleSignIn }
 */

//Use variable as userDetails might be immediately needed before react even renders
let latestUserDetails = {}
let appInstance = Date.now();

const useAuthProvider = () => {
    const [user, setUser] = useState(null); 
    const [userDetails, setUserDetails] = useState(null);
    const [lastCommitted, setLastCommitted] = useLocalStorage("lastCommited", 0);  //The last committed state of our user claims document, decides if token needs to update if outdated
    const router = useRouter()

    /**
     * Sign in user with a Google Account with a redirect
     */
    const initGoogleSignIn = async () => {
        await signInWithRedirect(auth, new GoogleAuthProvider()
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
    const getUserTokenResult = async (refresh) => {
        if (!user) return;
        let { claims } = await user.getIdTokenResult(refresh);
        
        //If user on homepage, redirect to dashboard
        if (router.asPath.startsWith('/')) {
            // history.push('/home');
        }
        return claims
    };

    /**
     * Handles when onAuthStateChanged is called, and sets user into User State
     * @param {firebase.auth.User} user 
     */
    const handleAuthStateChanged = (user) => {
        if (user) {
            setUser(user);
            console.log('logged in as ', user.email);
        }
        else setUser(false);
    };

    //Attaches the onAuthStateChanged to listen for changes in authentication eg: login, signout etc.
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, handleAuthStateChanged);
        return () => unsub();
        }, []);
    
    //Attaches user claims documents to listen for changes in user permissions, if yes update token to ensure no permission errors
    useEffect(() => {
        if (!user) return;
        return onSnapshot(doc(db,'user_claims',user.uid), async (snap) => {
            const data = snap.data();
            
            if(!data?._lastCommitted) return;

            if (lastCommitted && !(data?._lastCommitted || {}).isEqual(lastCommitted)) {
                setUserDetails({ ...(await getUserTokenResult(true)), ...latestUserDetails })
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
                latestUserDetails = { ...(await getUserTokenResult()), ...doc.data() }
                setUserDetails(latestUserDetails)
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
    }, [user]);

    /**
     * Signs out the current user
     * @returns null
     */
    const userSignOut = () => {
        return signOut().then(() => {
            setUser(false);
        });
    };

    return {
        user,
        userDetails,
        getUserTokenResult,
        appInstance,
        signOut: userSignOut,
        initGoogleSignIn
    };
};