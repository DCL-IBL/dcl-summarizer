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

        this.token = localStorage.getItem('accessToken');

        this.init();
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
            const response = await fetch(`${this.token}/api/process-txt`, {method: 'POST', body: formData});
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

    switchSection(target) {
        const old_target = this.page.dataset.activesection;
        this.page.dataset.activesection = target;
        document.getElementById(old_target).classList.replace("block-visible","block-hidden");
        document.getElementById(target).classList.replace("block-hidden","block-visible");
    }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());
