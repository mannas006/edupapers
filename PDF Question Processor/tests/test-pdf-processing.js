import fetch from 'node-fetch';

// Test the PDF processing with an existing file
const testData = {
    file_url: 'https://dsfqdmrkryjpglrsffhc.supabase.co/storage/v1/object/public/edupapers/papers/00a4734e-a661-46a4-9627-50b90d3c17d9.pdf',
    filename: '00a4734e-a661-46a4-9627-50b90d3c17d9.pdf',
    paper_id: '00a4734e-a661-46a4-9627-50b90d3c17d9',
    metadata: {
        test: true
    }
};

console.log('Testing PDF processing with data:', testData);

fetch('http://localhost:8000/webhook/process-pdf', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
    console.log('Response:', data);
    if (data.processing_id) {
        console.log(`Processing started with ID: ${data.processing_id}`);
        console.log(`Check status at: http://localhost:8000/status/${data.processing_id}`);
    }
})
.catch(error => {
    console.error('Error:', error);
});
