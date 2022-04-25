import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import StoreComponent from "../../components/StoreComponent";
import { useAuth } from "../../hooks/useAuth";



const Storefront = () => {
    const { userToken } = useAuth();
    
    return <MemberLayout>
        <Page title={`${userToken?.englishName}'s Storefront`}>
            <StoreComponent register={{ studentid: userToken?.studentid, englishName: userToken?.englishName }} />
        </Page>
    </MemberLayout>
}

export default Storefront;