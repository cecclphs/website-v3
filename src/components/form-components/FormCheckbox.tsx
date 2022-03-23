import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import React from "react";

const FormCheckbox = ({ control, name, rules = {}, ...props }) => {
    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
            <FormControlLabel control={<Checkbox onChange={onChange} checked={value || false} {...props} />} label={props?.label}/>
        )}
    />      
};

export default FormCheckbox;