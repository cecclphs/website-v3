import { FC } from "react";
import MemberLayout from "../../components/MemberLayout";
import Page from "../../components/Page";
import { useObjectVal } from 'react-firebase-hooks/database';
import { get, ref, serverTimestamp, set, update } from "firebase/database";
import { rtdb } from "../../config/firebase";
import { CardRecord } from "../../types/Cards";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Switch } from "@mui/material";
import { DataGridPro, GridActionsCellItem, GridColDef, GridColumnMenu, GridRowParams, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid-pro";
import {updateDoc} from 'firebase/firestore';
import StudentDetails from '../../types/StudentDetails';
import { Add, Delete } from "@mui/icons-material";
import { useDialog } from "../../hooks/useDialog";
import { useForm } from "react-hook-form";
import FormTextField from "../../components/form-components/FormTextField";
import { useSnackbar } from "notistack";

type CardForm = Omit<CardRecord, 'createdOn'> & { cardId: string }

const AddCardDialog: FC<{onClose: () => void}> = ({ onClose }) => {
    const { control, handleSubmit, formState: { isSubmitting, isValid, errors } } = useForm<CardForm>({
        mode: 'onChange',
        defaultValues: {
            englishName: '',
            chineseName: '',
            class: '',
            studentid: '',
            cardId: '',
        }
    });
    const { enqueueSnackbar } = useSnackbar();

    const onSubmit = async (data: CardForm) => {
        console.log(data);
        const { cardId, ...rest } = data;
        //check if cardId is unique
        const cardSnapshot = await get(ref(rtdb, `cards/${cardId}`));
        if (cardSnapshot.exists()) {
            enqueueSnackbar('Card ID already exists', { variant: 'error' });
            return;
        }
        await set(ref(rtdb, `cards/${data.cardId}`), {
            ...rest,
            active: true,
            createdOn: serverTimestamp(),
            englishName: data.englishName.toUpperCase(),
        });
        onClose();
    }

    return <>
        <DialogTitle>Add Card</DialogTitle>
        <DialogContent>
            <div className="flex flex-col space-y-2 py-1">
                <FormTextField
                    type="number"
                    required
                    control={control}
                    name="cardId"
                    label="Card ID"
                    error={!!errors.cardId}
                    rules={{ required: true, message: 'Card ID is definetly required' }}
                />
                <FormTextField
                    required
                    control={control}
                    name="englishName"
                    label="English Name"
                    error={!!errors.englishName}
                    rules={{ required: true, message: 'English Name is required' }}
                />
                <FormTextField
                    required
                    control={control}
                    name="chineseName"
                    label="Chinese Name"
                    error={!!errors.chineseName}
                    rules={{ required: true, message: 'Chinese Name is required' }}
                    />
                <FormTextField
                    required
                    control={control}
                    name="class"
                    label="Class"
                    error={!!errors.class}
                    rules={{ required: true, message: 'Class is required' }}
                    />
                <FormTextField
                    required
                    control={control}
                    name="studentid"
                    label="Student ID"
                    error={!!errors.studentid}
                    rules={{ required: true, message: 'Student ID is required' }}
                    />
                <Button disabled={!isValid || isSubmitting} onClick={handleSubmit(onSubmit)}>Add</Button>
            </div>
        </DialogContent>
    </>
}

function CustomToolbar() {
    const [openDialog, closeDialog] = useDialog();
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button onClick={() => openDialog({
            children: <AddCardDialog onClose={closeDialog} />,
        })} startIcon={<Add/>}>Add</Button>
      </GridToolbarContainer>
    );
  }
  

const Cards:FC = () => {
    const [value, loading, error] = useObjectVal<{ [cardId: string] : CardRecord }> (ref(rtdb, 'cards'));
    const cards = Object.keys(value || {}).map(cardId => ({ id: cardId, ...value[cardId]}));
    const [openDialog, closeDialog] = useDialog();

    const deleteCard = async (cardId: string) => {
        //show confirmation
        openDialog({
            children: <>
                <DialogTitle>Delete Card</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this card?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button color="error" onClick={async () => {
                        await set(ref(rtdb, `cards/${cardId}`), null);
                        closeDialog();
                    }}>Delete</Button>
                </DialogActions>
            </>
        })
    }

    const columns = [
        {
            field: 'id',
            type: 'number',
            headerName: 'Card ID',
        },
        {
            field: 'englishName',
            type: 'string',
            headerName: 'English Name',
            width: 300,
            editable: true,
        },
        {
            field: 'chineseName',
            type: 'string',
            headerName: 'Chinese Name',
            editable: true,
        },
        {
            field: 'class',
            type: 'string',
            headerName: 'Class',
            editable: true,
        },
        {
            field: 'studentid',
            type: 'string',
            headerName: 'Student ID',
            editable: true,
        },
        {
            field: 'active',
            type: 'boolean',
            headerName: 'Active',
            editable: true,
        },
        {
            field: 'actions',
            type: "actions",
            getActions: (params: GridRowParams<typeof cards[number]>) => [
                <GridActionsCellItem icon={<Delete/>} onClick={() => deleteCard(params.row.id)} label="Delete"/>
            ]        
        }
    ]

    const processRowUpdate = (newRow: typeof cards[number]) => {
        console.log(newRow)
        //get data of same row
        const oldRow = cards.find(row => row.id == newRow.id);
        //get the updated key and value
        const key = Object.keys(newRow).find(key => newRow[key] != oldRow[key]);
        if(!key) return oldRow;
        const value = newRow[key];
        //update the data
        const cardRef = ref(rtdb, 'cards/' + newRow.id);
        update(cardRef, { [key]: value });
        return newRow
    }

    return <MemberLayout>
        <Page title="Cards">
            <div className="flex flex-col space-y-2">
            <DataGridPro
                autoHeight
                loading={loading}
                rows={cards}
                columns={columns}
                disableSelectionOnClick
                getRowId={(row) => row.id}
                experimentalFeatures={{ newEditingApi: true }} 
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => console.error(error)}
                density="compact"
                components={{
                    ColumnMenu: GridColumnMenu,
                    Toolbar: CustomToolbar
                }}
        
            />
            </div>
        </Page>
    </MemberLayout>
}

export default Cards;