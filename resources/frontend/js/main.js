import manageBehaviors from '@area17/a17-helpers/src/utility/manageBehaviors';
import * as Behaviors from './behaviors';

document.addEventListener('DOMContentLoaded', function () {
    manageBehaviors({...ToolkitBehaviors, ...Behaviors});
});
