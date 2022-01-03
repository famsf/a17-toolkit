import { manageBehaviors } from '@area17/a17-behaviors';
import * as Behaviors from './behaviors';

document.addEventListener('DOMContentLoaded', function () {
    manageBehaviors(Behaviors, {
        breakpoints: ['sm', 'md', 'lg', 'xl', '2xl']
    });
});
