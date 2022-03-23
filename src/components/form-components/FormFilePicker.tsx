import { Button, TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import React from "react";
import { PhotoCamera } from "@mui/icons-material";

const FormFilePicker = ({ control, name, rules ={}, multiple=false, ...props }) => {
    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
            <label className="flex flex-col w-full" htmlFor={name}>
                <input
                    multiple
                    className="hidden"
                    accept="image/*"
                    id={name}
                    type="file"
                    onChange={e=> onChange(e.target.files)}
                />
                <Button
                    component="span"
                    {...props}
                >
                    {props.label}
                </Button>
            </label>
        )}
    />
};

export default FormFilePicker;