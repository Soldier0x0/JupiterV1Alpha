import React from 'react';
import Card from '../components/Card';

const Home = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <h2 className="text-lg font-semibold">EPS LineChart</h2>
        <p>Placeholder for EPS LineChart</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Alerts by Severity</h2>
        <p>Placeholder for Alerts by Severity BarChart</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Recent Events</h2>
        <p>Placeholder for Recent Events List</p>
      </Card>
    </div>
  );
};

export default Home;
