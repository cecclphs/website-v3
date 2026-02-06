import { Button, CircularProgress, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { FC, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchAPI } from "../utils/fetchAPI";

const LinkAccountDialog: FC<{ onClose: () => void, studentid: string }> = ({ onClose, studentid }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const handleLink = async () => {
        if (email.trim() === '') {
            return enqueueSnackbar('Please enter an email address', { variant: 'error' });
        }

        // Validate basic email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
        }

        setLoading(true);

        try {
            const result = await fetchAPI('/user/link_account', user, {
                method: 'POST',
                body: JSON.stringify({ studentid, email: email.trim() })
            });

            if (result.error) {
                enqueueSnackbar(result.error, { variant: 'error' });
                return;
            }

            enqueueSnackbar('Account linked successfully', { variant: 'success' });
            setEmail(''); // Clear input
            onClose();
        } catch (error) {
            console.error('Link account error:', error);
            enqueueSnackbar('Failed to link account. Please try again.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                disabled={loading}
                placeholder="user@example.com"
                helperText="Enter the email address of the account to link"
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button
                onClick={handleLink}
                variant="contained"
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Link Account'}
            </Button>
        </DialogActions>
    </>
}

export default LinkAccountDialog;