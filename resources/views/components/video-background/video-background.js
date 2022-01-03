import { createBehavior } from '@area17/a17-behaviors';

const VideoBackground = createBehavior(
    'VideoBackground',
    {
        toggle(e) {
            e.preventDefault();

            if(this.isPlaying){
                this.$player.pause();
            }else{
                this.$player.play();
            }

            this.updateButton();
        },
        handlePlay(e) {
            this.isPlaying = true;
        },
        handlePause(e) {
            this.isPlaying = false;
        },
        updateButton(){
            const buttonText = this.isPlaying ? this.buttonText.play : this.buttonText.pause;

            this.$pauseButton.innerText = buttonText;
            this.$pauseButton.setAttribute('aria-label', buttonText);
            this.$pauseButton.setAttribute('aria-pressed', this.isPlaying.toString());
        }
    },
    {
        init() {
            this.isPlaying = false;
            this.buttonText = {
                play: this.options['text-play'],
                pause: this.options['text-pause'],
            };

            this.$player = this.getChild('player');
            this.$pauseButton = this.getChild('controls').querySelector('button');

            this.$player.addEventListener('play', this.handlePlay, false);
            this.$player.addEventListener('pause', this.handlePause, false);
            this.$pauseButton.addEventListener('click', this.toggle, false);
        },
        enabled() {},
        resized() {},
        mediaQueryUpdated() {},
        disabled() {},
        destroy() {
            this.$player.removeEventListener('play', this.handlePlay);
            this.$player.removeEventListener('pause', this.handlePause);
            this.$pauseButton.removeEventListener('click', this.toggle);
        }
    }
);

export default VideoBackground;
