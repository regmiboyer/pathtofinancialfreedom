import React from 'react';

export default function StubStrategyPage({ name }) {
  return (
    <div>
      <h1>{name}</h1>
      <p style={{ color: '#64748b' }}>
        This strategy hasn't been ported to v2 yet — its backend microservice currently
        returns <code>501 Not Implemented</code>. See that service's <code>PORT-TODO.md</code> for
        what needs to be lifted from the original <code>index.html</code>.
      </p>
    </div>
  );
}
