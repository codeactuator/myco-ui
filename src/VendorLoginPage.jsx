import React from 'react';
import Login from './Login';

const VendorLoginPage = () => {
    return (
        <Login 
            title="Vendor Portal" 
            expectedRole="VENDOR" 
            redirectPath="/dashboard" 
        />
    );
};

export default VendorLoginPage;