import { Button, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { FC, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchAPI } from "../utils/fetchAPI";

const LinkAccountDialog: FC<{ onClose: () => void, studentid: string }> = ({ onClose, studentid }) => {
    const [email, setEmail] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const handleLink = async () => {
        if(email.trim() == '') 
            return enqueueSnackbar('Please enter an email address', { variant: 'error' });
            await fetchAPI('/user/link_account', user, {
                method: 'POST',
                body: JSON.stringify({
                    studentid,
                    email
                })
            })
            onClose();

    }
    return <>
        <DialogTitle>Link Account</DialogTitle>
        <DialogContent>
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleLink}>Link</Button>
        </DialogActions>
    </>
}

export default LinkAccountDialog;