import React from 'react';
import Login from './Login';

const SupportLoginPage = () => {
    return (
        <Login 
            title="Support Portal" 
            expectedRole="SUPPORT" 
            redirectPath="/dashboard" 
        />
    );
};

export default SupportLoginPage;