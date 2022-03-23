import AddFacility from "../components/AddFacility";
import MemberLayout from "../components/MemberLayout"
import Page from "../components/Page"

const Facility = () => {
    return <MemberLayout>
        <Page title="Facility">
            <AddFacility />
        </Page>
    </MemberLayout>
}

export default Facility;