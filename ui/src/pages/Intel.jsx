import React from 'react';

const Intel = () => {
  const feeds = [
    { name: 'Tor Forum', risk: 'High' },
    { name: 'Market X', risk: 'Critical' },
    { name: 'Pastebin', risk: 'Medium' },
  ];

  const findings = [
    { name: 'Leaked Credentials', risk: 'Critical' },
    { name: 'Malware Sample', risk: 'High' },
    { name: 'Suspicious Activity', risk: 'Medium' },
  ];

  const snapshot = "This is a snapshot of the latest findings from the feeds.";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Intel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-medium">Feeds</h2>
          <ul className="space-y-2">
            {feeds.map((feed, index) => (
              <li key={index} className="flex justify-between">
                <span>{feed.name}</span>
                <span className={`text-${feed.risk.toLowerCase()}`}>{feed.risk}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-medium">Findings</h2>
          <ul className="space-y-2">
            {findings.map((finding, index) => (
              <li key={index} className="flex justify-between">
                <span>{finding.name}</span>
                <span className={`text-${finding.risk.toLowerCase()}`}>{finding.risk}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="text-lg font-medium">Snapshot</h2>
        <p>{snapshot}</p>
      </Card>
    </div>
  );
};

export default Intel;
