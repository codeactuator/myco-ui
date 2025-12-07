import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const recoverySuccessData = {
  labels: ['Successfully Recovered', 'Recovery Failed', 'In Progress'],
  datasets: [
    {
      label: 'Item Recovery Status',
      data: [210, 45, 32],
      backgroundColor: [
        'rgba(25, 135, 84, 0.7)',
        'rgba(220, 53, 69, 0.7)',
        'rgba(255, 193, 7, 0.7)',
      ],
      borderColor: [
        'rgba(25, 135, 84, 1)',
        'rgba(220, 53, 69, 1)',
        'rgba(255, 193, 7, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const SupportAnalytics = () => {
  return (
    <div className="container-fluid">
      <h4 className="mb-4">Support Analytics</h4>
      <div className="row">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Item Recovery Success</h5>
              <Doughnut data={recoverySuccessData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAnalytics;