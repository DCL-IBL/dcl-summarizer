document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('queryForm');
    const queryInput = document.getElementById('RAGQuery');
    const result = document.getElementById('result');
    const responseText = document.getElementById('responseText');
    const loading = document.getElementById('loading');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const query = queryInput.value.trim();
        if (!query) return;

        loading.classList.remove('hidden');
        result.classList.add('hidden');

        fetch('http://dcl.bas.bg:1316/api/process-rag', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "RAGQuery": query })
        })
        .then(response => response.json())
        .then(data => {
            loading.classList.add('hidden');
            result.classList.remove('hidden');
            responseText.textContent = data.result;
        })
        .catch(error => {
            loading.classList.add('hidden');
            alert('Error processing query: ' + error.message);
        });
    });
});
