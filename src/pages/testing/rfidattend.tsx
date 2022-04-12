import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import useKeyPress from "../../hooks/useKeyPress";
import { fetchAPI } from "../../utils/fetchAPI";

const RFIDAttend = () => {
    /*
     This is just a test to prove that rfid attendance works, real concept will use terminal scanner.
    */
    const [cardId, setCardId] = useState("")
    const enterPressed = useKeyPress('Enter')
    
    useEffect(() => {
        (async () => {
            if(enterPressed) {
                const res = await fetch('/api/terminal/log_attendance', {
                    method: 'POST',
                    headers: {
                        authorization: 'Bearer ccf9d105-ac59-44a7-89e7-76903a0de0b5',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cardId: parseInt(cardId) })
                }).then(res => res.json())
                console.log(res)
                setCardId("")
            }
        })()
    }, [enterPressed])
    
    return <div className="h-screen w-screen grid place-items-center">
        <div className="p-4 rounded-lg border border-solid border-gray-400">
            <h1>Scan to Attend</h1>
            <TextField
                label="RFID number"
                variant="standard"
                size="small"
                fullWidth
                margin="normal"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
            />
        </div>
    </div>
}

export default RFIDAttend;