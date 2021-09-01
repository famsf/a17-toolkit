import createBehavior from '@area17/a17-helpers/src/utility/createBehavior';

const Accordion = createBehavior(
    'Accordion',
    {
        toggle(e) {
            e.preventDefault();

            const index = e.currentTarget.getAttribute('data-Accordion-index');

            if (this._data.activeIndexes.includes(index)) {
                this.close(index);

                this._data.activeIndexes = this._data.activeIndexes.filter(
                    (item) => {
                        return item !== index;
                    }
                );
            } else {
                this.open(index);
                this._data.activeIndexes.push(index);
            }
        },

        close(index) {
            const activeTrigger = this.$triggers[index];
            const activeIcon = this.$triggerIcons[index];
            const activeContent = this.$contents[index];

            activeContent.style.height = '0px';

            activeTrigger.setAttribute('aria-expanded', 'false');
            activeContent.setAttribute('aria-hidden', 'true');
            activeIcon.classList.remove('rotate-180');
        },

        open(index) {
            const activeTrigger = this.$triggers[index];
            const activeIcon = this.$triggerIcons[index];
            const activeContent = this.$contents[index];
            const activeContentInner = this.$contentInners[index];
            const contentHeight = activeContentInner.offsetHeight;

            activeContent.style.height = `${contentHeight}px`;

            activeTrigger.setAttribute('aria-expanded', 'true');
            activeContent.setAttribute('aria-hidden', 'false');
            activeIcon.classList.add('rotate-180');
        }
    },
    {
        init() {
            this._data.activeIndexes = [];

            this.$initOpen = this.getChildren('init-open');
            this.$triggers = this.getChildren('trigger');
            this.$triggerIcons = this.getChildren('trigger-icon');
            this.$contents = this.getChildren('content');
            this.$contentInners = this.getChildren('content-inner');

            this.$triggers.forEach((trigger) => {
                trigger.addEventListener('click', this.toggle, false);
            });

            this.$initOpen.forEach((trigger) => {
                trigger.click();
            });
        },
        enabled() {},
        resized() {},
        mediaQueryUpdated() {},
        disabled() {},
        destroy() {
            this.$triggers.forEach((trigger) => {
                trigger.removeEventListener('click', this.toggle);
            });
        }
    }
);

export default Accordion;
