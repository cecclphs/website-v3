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
        <form className="p-4 rounded-lg border border-solid border-gray-400 min-w-[400px]" onSubmit={handleSubmit}>
            <h1 className="font-bold text-xl">Scan to Attend</h1>
            {result?.success ? <div className="flex flex-row">
                {/* <StudentImage studentid={result.data.studentid}/> */}
                <div className={`${result.data.isLate?'bg-orange-300':''}`}>
                    <h2 className="text-lg font-semibold">{result.data.chineseName} {result.data.englishName} {result.data.studentid}</h2>
                    <p className="text-green-500 font-semibold">Success!</p>
                    <p>Attending {result.data.recordName}</p>
                    <p>Going {result.data.direction}</p>
                    <p>{result.data.isLate? "Late": "On Time"}</p>
                </div>
                <KeyboardArrowLeftRounded className={`h-24 w-24 ${result.data.direction == 'in'?"":"rotate-180"}`}/>
            </div>: <>
                <p>{result?.message}</p>
            </>}
            <TextField
                autoFocus
                label="RFID number"
                variant="standard"
                size="small"
                fullWidth
                margin="normal"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
            />
        </form>
    </div>
}

export default RFIDAttend;