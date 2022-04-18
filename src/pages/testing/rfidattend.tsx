import { ArrowLeft, KeyboardArrowLeftRounded } from "@mui/icons-material";
import { TextField } from "@mui/material";
import { FormEvent, FormEventHandler, useEffect, useState } from "react";
import StudentImage from "../../components/StudentImage";
import useKeyPress from "../../hooks/useKeyPress";
import { fetchAPI } from "../../utils/fetchAPI";

let timeout = null;

const RFIDAttend = () => {
    /*
     This is just a test to prove that rfid attendance works, real concept will use terminal scanner.
    */
    const [cardId, setCardId] = useState("")
    const enterPressed = useKeyPress('Enter')
    const [result, setResult] = useState<any>({})
    
    // useEffect(() => {
    //     (async () => {
    //         if(enterPressed) {
                
    //         }
    //     })()
    // }, [enterPressed])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearTimeout(timeout);
        const res = await fetch('/api/terminal/log_attendance', {
            method: 'POST',
            headers: {
                authorization: 'Bearer ccf9d105-ac59-44a7-89e7-76903a0de0b5',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cardId: parseInt(cardId) })
        }).then(res => res.json())
        console.log(res)
        setResult(res)
        timeout = setTimeout(() => {
            setResult({})
        }, 5000)
        setCardId("")
    }
    
    return <div className="h-screen w-screen grid place-items-center">
        <div className="flex flex-col space-y-2 p-2">
            {result?.success ? <div className={`p-4 rounded-lg flex flex-row ${result.data.isLate?'bg-orange-100':'bg-green-100'} items-center justify-between`}>
                {/* <StudentImage studentid={result.data.studentid}/> */}
                <div>
                    <h2 className="text-xl font-semibold">{result.data.chineseName} {result.data.englishName} {result.data.studentid}</h2>
                    <p>Attending {result.data.recordName}</p>
                    <p>{result.data.isLate? "Late": "On Time"}</p>
                </div>
                <h2 className="capitalize text-4xl p-2">{result.data.direction}</h2>
            </div>: (result.message && <div className="p-4 rounded-lg bg-red-100">
                <p>{result?.message}</p>
            </div>)}
            <form className="p-4 rounded-lg border border-solid border-gray-400 min-w-[400px]" onSubmit={handleSubmit}>
                <h1 className="font-bold text-sm">Scan to Attend</h1>
                <TextField
                    autoFocus
                    label="RFID number"
                    variant="standard"
                    size="small"
                    fullWidth
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                />
            </form>
        </div>
    </div>
}

export default RFIDAttend;