import React from 'react';

const Cases = () => {
  const cases = [
    { id: 'Case 1', status: 'Open', description: 'Investigate malware', comments: ['Comment 1', 'Comment 2'] },
    { id: 'Case 2', status: 'Closed', description: 'Resolved phishing attack', comments: ['Comment 3'] },
    { id: 'Case 3', status: 'In Progress', description: 'Analyze suspicious activity', comments: [] },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Cases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cases.map((caseItem, index) => (
          <Card key={index}>
            <h2 className="text-lg font-medium">{caseItem.id}</h2>
            <p>Status: {caseItem.status}</p>
            <p>{caseItem.description}</p>
            <div className="mt-2">
              <h3 className="text-md font-medium">Comments</h3>
              <ul className="space-y-1">
                {caseItem.comments.length > 0 ? (
                  caseItem.comments.map((comment, idx) => <li key={idx}>{comment}</li>)
                ) : (
                  <li>No comments</li>
                )}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Cases;
