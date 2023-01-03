import StoreComponent from "../../components/StoreComponent";

const TerminalStoreFront = () => {    
    return <div className="px-4 py-8 min-h-screen w-screen grid place-items-center">
        <StoreComponent register={{ studentid: 'T1-TEST', englishName: 'Terminal 1' }} />
    </div>
}

export default TerminalStoreFront;