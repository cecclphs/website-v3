import { TextField, TextFieldProps } from "@mui/material";
import { Controller, Control, Path } from "react-hook-form";
import React, { ChangeEvent } from "react";

const FormTextField = <T = unknown>({ control, name, type = "text", rules = {}, ...props }: {
    control: Control<T>;
    name: Path<T>;
    type?: string;
    rules?: any;
} & TextFieldProps) => {

    const onValueChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if(type === "number") {
            //regex check if is a number
            return +e.target.value;
        }
        return e.target.value;
    }

    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
            <TextField type={type} onChange={e => onChange(onValueChange(e))} value={value} {...props} />
        )}
    />
};

export default FormTextField;