import { Add, AddRounded, DeleteTwoTone, Edit } from '@mui/icons-material';
import { Button, Collapse, Fab, IconButton, InputAdornment, TextField } from '@mui/material';
import { collection, deleteDoc, doc, query, setDoc, Timestamp, where } from 'firebase/firestore';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import MemberLayout from '../../components/MemberLayout';
import Page from '../../components/Page';
import { db, docConverter } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

const Links = () => {
    const { user, userToken } = useAuth();
    const [values, loading, error, snapshot] = useCollectionData(query(collection(db,'links').withConverter(docConverter)));
    const [newLink, setNewLink] = useState({id: '', url: ''});
    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error.message}</p>;

    const handleSubmit = async () => {
        if(!user) return;
        await setDoc(doc(db, 'links', newLink.id), {url: newLink.url, createdAt: Timestamp.now()});
        setNewLink({id: '', url: ''});
    }

    return <MemberLayout>
        <Page title="Admin Links">
            <div className="flex flex-row space-x-3 p-3 rounded-lg shadow-md">
                <TextField 
                    label="Slug" 
                    size='small'
                    InputProps={{
                        startAdornment: <InputAdornment position="end">clphscec.ga/</InputAdornment>
                    }}
                    value={newLink.id}
                    onChange={e => setNewLink({...newLink, id: e.target.value})}
                />
                <TextField
                    fullWidth
                    label="Link"
                    size='small'
                    value={newLink.url}
                    onChange={e => setNewLink({...newLink, url: e.target.value})}
                />
                <Button
                    variant='contained'
                    startIcon={<AddRounded/>}
                    onClick={handleSubmit}>
                    Add
                </Button>
            </div>
            {(values || []).map(({ id, name, url }) => (
                <div key={id} className='flex flex-row space-x-3 items-center py-2 px-1'>
                    <h2 className='text-xl font-semibold'>{id}</h2>
                    <p className='text-sm flex-1'>{url}</p>
                    <IconButton onClick={() => deleteDoc(doc(db, 'links', id))}>
                        <DeleteTwoTone/>
                    </IconButton>
                </div>
            ))}
        </Page>
    </MemberLayout>
}

export default Links;