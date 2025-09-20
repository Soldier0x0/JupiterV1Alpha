import React from 'react';
import DataTable from '../components/DataTable';

const Alerts = () => {
  const alertsData = [
    { time: '00:00', severity: 'Critical', entity: 'Host A', source: 'Firewall', message: 'Unauthorized access detected' },
    { time: '00:01', severity: 'High', entity: 'User B', source: 'Endpoint', message: 'Malware detected' },
    { time: '00:02', severity: 'Medium', entity: 'IP C', source: 'Network', message: 'Suspicious activity' },
  ];

  const columns = [
    { Header: 'Time', accessor: 'time' },
    { Header: 'Severity', accessor: 'severity' },
    { Header: 'Entity', accessor: 'entity' },
    { Header: 'Source', accessor: 'source' },
    { Header: 'Message', accessor: 'message' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Alerts</h1>
      <DataTable data={alertsData} columns={columns} />
    </div>
  );
};

export default Alerts;
