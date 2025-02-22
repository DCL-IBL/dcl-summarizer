$(document).ready(function() {
    $('#uploadForm').on('submit', function(e) {
        e.preventDefault();
        
        var formData = new FormData();
        formData.append('pdf', $('#pdfFile')[0].files[0]);

        $('#loading').removeClass('hidden');
        $('#result').addClass('hidden');

        $.ajax({
            url: 'http://backend:8000/api/process-pdf',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#loading').addClass('hidden');
                $('#result').removeClass('hidden');
                $('#resultText').text(response.result);
            },
            error: function(xhr, status, error) {
                $('#loading').addClass('hidden');
                alert('Error processing PDF: ' + error);
            }
        });
    });
});
