import React from 'react';
import Card from '../components/Card';
import { LineChart, Line, BarChart, Bar, Tooltip, XAxis, YAxis } from 'recharts';

const Home = () => {
  const epsData = [
    { time: '00:00', eps: 120 },
    { time: '00:01', eps: 150 },
    { time: '00:02', eps: 170 },
  ];

  const severityData = [
    { severity: 'Critical', count: 10 },
    { severity: 'High', count: 20 },
    { severity: 'Medium', count: 30 },
  ];

  const recentEvents = [
    { time: '00:00', severity: 'Critical', message: 'Event 1' },
    { time: '00:01', severity: 'High', message: 'Event 2' },
    { time: '00:02', severity: 'Medium', message: 'Event 3' },
  ];

  const healthMetrics = [
    { name: 'API', status: 'Healthy' },
    { name: 'OpenSearch', status: 'Degraded' },
    { name: 'Ingest', status: 'Healthy' },
    { name: 'GPU', status: 'Healthy' },
    { name: 'Disk', status: 'Critical' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <h2 className="text-lg font-semibold">EPS LineChart</h2>
        <LineChart width={300} height={200} data={epsData}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="eps" stroke="#22d3ee" />
        </LineChart>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Alerts by Severity</h2>
        <BarChart width={300} height={200} data={severityData}>
          <XAxis dataKey="severity" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#22d3ee" />
        </BarChart>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Recent Events</h2>
        <ul className="space-y-2">
          {recentEvents.map((event, index) => (
            <li key={index} className="flex justify-between">
              <span>{event.time}</span>
              <span className={`text-${event.severity.toLowerCase()}`}>{event.severity}</span>
              <span>{event.message}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">System Health</h2>
        <ul className="space-y-2">
          {healthMetrics.map((metric, index) => (
            <li key={index} className="flex justify-between">
              <span>{metric.name}</span>
              <span className={`text-${metric.status.toLowerCase()}`}>{metric.status}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Home;
