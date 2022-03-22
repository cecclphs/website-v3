import { doc, getDoc, increment, serverTimestamp, updateDoc } from "@firebase/firestore";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { db } from "../config/firebase";

// Return blank fragment, no content is needed.
const Redirector = () => <></>;

export default Redirector;

//Resolve the slug on the server side and returning the appropriate redirect
export const getServerSideProps: GetServerSideProps<{slug: string}> = async (context: GetServerSidePropsContext) => {
    const slug  = context?.params?.slug as string | undefined;
    
    // Cache this redirect for 30 seconds before requiring a refresh in the backend
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=30'
    )

    try {
        if(!slug) throw new Error('No slug provided');
        //Fetch the slug document from firestore 'links' collection
        const docRef = doc(db, 'links', slug);
        const docSnapshot = await getDoc(docRef);;

        //Get url prop from document
        const url = docSnapshot.data()?.url;
    
        //Update document with stats because why not!
        await updateDoc(docRef, {
            clicks: increment(1),
            lastClicked: serverTimestamp()
        })
        
        //Return redirect to client
        return {
            redirect: {
                permanent: false,
                destination: url || "/",
            },
        };
    } catch (e) {
        //Handle any errors, including slug doc not found or invalid document
        //Redirects the user back to the home page.
        console.error(e);
        return { 
            redirect: {
                permanent: false,
                destination: "/"
            }, 
        };
    }
};