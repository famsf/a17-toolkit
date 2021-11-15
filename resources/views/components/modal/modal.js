import createBehavior from '@area17/a17-helpers/src/utility/createBehavior';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { addListener, removeListener } from '../functions/listeners';
import * as focusTrap from 'focus-trap';

const Modal = createBehavior(
    'Modal',
    {
        toggle(e) {
            e.preventDefault();

            if (this._data.isActive) {
                this.close();
            } else {
                this.open();
            }
        },

        close(e) {
            if (this._data.isActive) {
                this.$node.classList.remove(...this._data.activeClasses);
                this._data.focusTrap.deactivate();
                this._data.isActive = false;
                enableBodyScroll(this.$node);

                this.$node.dispatchEvent(new CustomEvent('Modal:closed'));
            }
        },

        open() {
            document.dispatchEvent(new CustomEvent('Modal:closeAll'));

            this.$node.classList.add(...this._data.activeClasses);
            this._data.isActive = true;

            setTimeout(() => {
                this._data.focusTrap.activate();
                disableBodyScroll(this.$node);
            }, 300);
        },

        handleEsc(e) {
            if (e.key === 'Escape') {
                this.close();
            }
        },

        handleClickOutside(e) {
            if (e.target.id === this.$node.id) {
                this.close(e);
            }
        }
    },
    {
        init() {
            this.$focusTrap = this.getChild('focus-trap');
            this.$closeButtons = this.getChildren('close-trigger');
            this.$initialFocus = this.getChild('initial-focus');

            if (!this.$initialFocus) {
                console.warn(
                    'No initial focus element found. Add a `h1` with the attribute `data-Modal-initial-focus`. The `h1` should also have an id that matches the modal id with `_title` appended'
                );
            }

            this._data.focusTrap = focusTrap.createFocusTrap(this.$focusTrap, {
                initialFocus: this.$initialFocus
            });

            this._data.isActive = false;
            this._data.activeClasses = ['a17-trans-show-hide--active'];

            if (this.$closeButtons) {
                addListener(this.$closeButtons, this.close);
            }

            this.$node.addEventListener('Modal:toggle', this.toggle, false);
            this.$node.addEventListener('Modal:open', this.open, false);
            this.$node.addEventListener('Modal:close', this.close, false);
            document.addEventListener('Modal:closeAll', this.close, false);

            document.addEventListener('keyup', this.handleEsc, false);

            // add listener to modal toggle buttons
            const modalId = this.$node.getAttribute('id');
            this.$triggers = document.querySelectorAll(
                `[data-modal-target="#${modalId}"]`
            );

            addListener(this.$triggers, this.toggle);

            if (this.options['panel']) {
                this.$node.addEventListener(
                    'click',
                    this.handleClickOutside,
                    false
                );
            }
        },
        enabled() {},
        resized() {},
        mediaQueryUpdated() {
            // current media query is: A17.currentMediaQuery
        },
        disabled() {},
        destroy() {
            this.close();

            if (this.$closeButtons) {
                removeListener(this.$closeButtons, this.close);
            }

            this.$node.removeEventListener('Modal:toggle', this.toggle);
            this.$node.removeEventListener('Modal:open', this.open);
            this.$node.removeEventListener('Modal:close', this.close);
            this.$node.removeEventListener('click', this.handleClickOutside);
            document.removeEventListener('Modal:closeAll', this.close);

            document.removeEventListener('keyup', this.handleEsc);

            removeListener(this.$triggers, this.toggle);
        }
    }
);

export default Modal;
