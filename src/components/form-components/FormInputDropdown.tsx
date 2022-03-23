import React from "react";
import { MenuItem, Select } from "@mui/material";
import { Controller } from "react-hook-form";

const FormInputDropdown= ({name, control, rules ={}, options, ...props}) => {

  const generateSelectOptions = () => {
    return options.map((option) => {
      return (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      );
    });
  };

  return <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <Select onChange={onChange} value={value} {...props}>
          {generateSelectOptions()}
        </Select>
      )}
    />
};

export default FormInputDropdown;