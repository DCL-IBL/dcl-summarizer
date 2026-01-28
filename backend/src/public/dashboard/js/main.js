class DashboardController {
    constructor() {
        this.navBtns = document.querySelectorAll('[data-target]');
        this.page = document.querySelector('[data-activesection]');

        this.uploadForm = document.getElementById('uploadForm');
        this.uploadFiles = document.getElementById('file_select');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.uploadProgressFill = document.getElementById('progressFill');
        this.uploadProgressText = document.getElementById('progressText');
        this.uploadProgressBar = document.getElementById('progressBar');
        this.uploadResult = document.getElementById('uploadResult');

        this.aug_form = document.getElementById('queryForm');
        this.aug_queryInput = document.getElementById('RAGQuery');
        this.aug_result = document.getElementById('result');
        this.aug_responseText = document.getElementById('responseText');
        this.aug_loading = document.getElementById('loading');

        this.token = localStorage.getItem('accessToken');
        
        this.init();

        this.last_page = localStorage.getItem('last_page');
        if (this.last_page != null) {
            this.switchSection(this.last_page);
        }
    }

    init() {
        this.navBtns.forEach(
            btn => {
                btn.addEventListener('click', () => this.switchSection(btn.dataset.target))
            }
        );

        this.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.upload();
        });

        // Preview selected files
        this.uploadFiles.addEventListener('change', () => {
            const files = this.getFiles();
            if (files.length > 0) {
                this.uploadProgressText.textContent = `${files.length} file(s) selected`;
            }
        });

        this.aug_form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.run_query();
        });

        this.es = new EventSource(`${this.token}/events`);

        this.es.addEventListener('message', (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === "document") {
            window.location.reload();
            } else if (payload.type == "query") {
                this.aug_loading.classList.replace("block-visible","block-hidden");
                this.aug_result.classList.replace("block-hidden","block-visible");
                this.aug_responseText.textContent = payload.result;
            }
        });
    }

    getFiles() {
        return Array.from(this.uploadFiles.files);
    }

    async upload() {
        const files = this.getFiles();
        if (files.length === 0) return;

        const formData = new FormData();
    
        files.forEach(file => {
            formData.append('files', file);
        });
    
        //this.setLoading(true);
        //this.clearResult();

        try {
            const response = await fetch(`${this.token}/api/process-txt`, {method: 'POST', body: formData}).
            catch((error)=>{console.log(error)});
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            //this.showResult('Files uploaded successfully!', 'success');
      
            this.uploadForm.reset();
            this.uploadProgressText.textContent = 'Ready';
      
            window.location.reload();
        } catch (error) {
            //this.showResult(error.message, 'error');
        } finally {
            //this.setLoading(false);
        }
    }

    async run_query() {
        const query = this.aug_queryInput.value.trim();
        if (!query) return;

        this.aug_loading.classList.replace("block-hidden","block-visible");
        this.aug_result.classList.replace("block-visible","block-hidden");

        fetch(`${this.token}/api/process-rag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "RAGQuery": query })
        })
        .then(response => response.json())
        .catch(error => {
            this.aug_loading.classList.replace("block-visible","block-hidden");
            alert('Error processing query: ' + error.message);
        });
    }

    switchSection(target) {
        const old_target = this.page.dataset.activesection;
        this.page.dataset.activesection = target;
        document.getElementById(old_target).classList.replace("block-visible","block-hidden");
        document.getElementById(target).classList.replace("block-hidden","block-visible");
        localStorage.setItem('last_page',target);
    }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());
