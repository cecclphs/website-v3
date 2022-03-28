import { AddRounded } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import useToggle from "../hooks/useToggle";

const AddAccount = () => {
    const [open, setOpen] = useToggle();
    
    const handleCreate = () => {
        setOpen();
    }

    return (
        <>
        <div className="grid place-items-center rounded-md border border-dashed border-gray-300 text-gray-500 cursor-pointer hover:text-gray-800" onClick={setOpen}>
            <div className="flex flex-row space-x-2 px-2">
                <AddRounded/>
                <span>Create New</span>
            </div>
        </div>
        <Dialog open={open} onClose={setOpen}>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Lorem Ipsum Anot?
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={setOpen}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default AddAccount;