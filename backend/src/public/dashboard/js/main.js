class DashboardController {
    constructor() {
        this.navBtns = document.querySelectorAll('[data-target]');
        this.page = document.querySelector('[data-activesection]');
        this.init();
    }

    init() {
        this.navBtns.forEach(
            btn => {
                btn.addEventListener('click', () => this.switchSection(btn.dataset.target))
            }
        );
    }

    switchSection(target) {
        const old_target = this.page.dataset.activesection;
        this.page.dataset.activesection = target;
        document.getElementById(old_target).classList.replace("block-visible","block-hidden");
        document.getElementById(target).classList.replace("block-hidden","block-visible");
    }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());
