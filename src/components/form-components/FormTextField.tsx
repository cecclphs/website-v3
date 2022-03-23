import { TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import React from "react";

const FormTextField = ({ control, name, rules = {}, ...props }) => {
    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
            <TextField onChange={onChange} value={value} {...props} />
        )}
    />
};

export default FormTextField;