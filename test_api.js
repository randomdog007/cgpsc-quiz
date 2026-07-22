async function test() {
  const res = await fetch('https://c666e13e.cgpsc-quiz.pages.dev/api/quiz_attempts', {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST'
    }
  });
  
  console.log('Status:', res.status);
  console.log('CORS headers:', res.headers.get('Access-Control-Allow-Origin'));
}

test();
