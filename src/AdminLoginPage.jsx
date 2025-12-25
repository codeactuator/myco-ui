import React from 'react';
import Login from './Login';

const AdminLoginPage = () => {
    return (
        <Login 
            title="Admin Portal" 
            expectedRole="ADMIN" 
            redirectPath="/dashboard" 
        />
    );
};

export default AdminLoginPage;