import React from 'react';

const Models = () => {
  const models = [
    { name: 'Model A', gpuUtil: '75%', version: 'v1.0' },
    { name: 'Model B', gpuUtil: '60%', version: 'v2.1' },
    { name: 'Model C', gpuUtil: '90%', version: 'v3.0' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Models</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model, index) => (
          <Card key={index}>
            <h2 className="text-lg font-medium">{model.name}</h2>
            <p>GPU Utilization: {model.gpuUtil}</p>
            <p>Version: {model.version}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Models;
