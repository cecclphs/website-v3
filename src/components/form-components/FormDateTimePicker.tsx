import { DateTimePicker } from "@mui/lab";
import DatePicker from "@mui/lab/DatePicker"
import TextField from "@mui/material/TextField"
import { Controller } from "react-hook-form";

const FormDateTimePicker = ({name, control, rules = {}, label, ...props}) => {
    return <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => 
            <DateTimePicker
                label={label}
                renderInput={(params) =>  
                    <TextField 
                        variant="filled"
                        {...params}/> 
                    }
                onChange={onChange}
                value={value}
            />
        }
        {...props}
    />
}

export default FormDateTimePicker;