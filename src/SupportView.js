import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SupportDashboard from './dashboards/support/SupportDashboard';
import EmergencyRequestDetails from './dashboards/support/EmergencyRequestDetails';

const SupportView = () => (
  <Routes>
    <Route index element={<SupportDashboard />} />
    <Route path="request/:requestId" element={<EmergencyRequestDetails />} />
  </Routes>
);

export default SupportView;