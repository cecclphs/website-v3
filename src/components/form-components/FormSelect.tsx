import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import React from "react";

const FormSelect = ({ control, name, rules = {}, options, ...props }) => {
    return <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Apply To Use</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={value}
                    label="Apply To Use"
                    onChange={onChange}
                >
                    {options.map(({label, value}) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                </Select>
            </FormControl>
        )}
    />      
};

export default FormSelect;