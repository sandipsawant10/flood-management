import React from 'react';
import { Button } from '@mui/material';

const CustomButton = ({ children, to, ...props }) => {
  return (
    <Button
      color="inherit"
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;