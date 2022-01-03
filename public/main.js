/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@area17/a17-behaviors/dist/esm/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@area17/a17-behaviors/dist/esm/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createBehavior": () => (/* binding */ createBehavior),
/* harmony export */   "manageBehaviors": () => (/* binding */ exportObj)
/* harmony export */ });
/* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "./node_modules/process/browser.js");
var getCurrentMediaQuery = function() {
  // Doc: https://code.area17.com/a17/a17-helpers/wikis/getCurrentMediaQuery

  return getComputedStyle(document.documentElement).getPropertyValue('--breakpoint').trim().replace(/"/g, '');
};

var resized = function() {
  // Doc: https://code.area17.com/a17/a17-helpers/wikis/resized

  var resizeTimer;
  var mediaQuery = getCurrentMediaQuery();

  function informApp() {
    // check media query
    var newMediaQuery = getCurrentMediaQuery();

    // tell everything resized happened
    window.dispatchEvent(new CustomEvent('resized', {
      detail: {
        breakpoint: newMediaQuery
      }
    }));

    // if media query changed, tell everything
    if (newMediaQuery !== mediaQuery) {
      if (window.A17) {
        window.A17.currentMediaQuery = newMediaQuery;
      }
      window.dispatchEvent(new CustomEvent('mediaQueryUpdated', {
        detail: {
          breakpoint: newMediaQuery,
          prevBreakpoint: mediaQuery
        }
      }));
      mediaQuery = newMediaQuery;
    }
  }

  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(informApp, 250);
  });

  if (mediaQuery === '') {
    window.requestAnimationFrame(informApp);
  } else if (window.A17) {
    window.A17.currentMediaQuery = mediaQuery;
  }
};

const isBreakpoint = function (breakpoint, breakpoints) {
  // Doc: https://code.area17.com/a17/a17-helpers/wikis/isBreakpoint

  // bail if no breakpoint is passed
  if (!breakpoint) {
    console.error('You need to pass a breakpoint name!');
    return false
  }

  // we only want to look for a specific modifier and make sure it is at the end of the string
  const regExp = new RegExp('\\+$|\\-$');

  // bps must be in order from smallest to largest
  let bps = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

  // override the breakpoints if the option is set on the global A17 object
  if (window.A17 && window.A17.breakpoints) {
    if (Array.isArray(window.A17.breakpoints)) {
      bps = window.A17.breakpoints;
    } else {
      console.warn('A17.breakpoints should be an array. Using defaults.');
    }
  }

  // override the breakpoints if a set of breakpoints is passed through as a parameter (added for A17-behaviors to allow usage with no globals)
  if (breakpoints) {
    if (Array.isArray(breakpoints)) {
      bps = breakpoints;
    } else {
      console.warn('isBreakpoint breakpoints should be an array. Using defaults.');
    }
  }

  // store current breakpoint in use
  const currentBp = getCurrentMediaQuery();

  // store the index of the current breakpoint
  const currentBpIndex = bps.indexOf(currentBp);

  // check to see if bp has a + or - modifier
  const hasModifier = regExp.exec(breakpoint);

  // store modifier value
  const modifier = hasModifier ? hasModifier[0] : false;

  // store the trimmed breakpoint name if a modifier exists, if not, store the full queried breakpoint name
  const bpName = hasModifier ? breakpoint.slice(0, -1) : breakpoint;

  // store the index of the queried breakpoint
  const bpIndex = bps.indexOf(bpName);

  // let people know if the breakpoint name is unrecognized
  if (bpIndex < 0) {
    console.warn(
      'Unrecognized breakpoint. Supported breakpoints are: ' + bps.join(', ')
    );
    return false
  }

  // compare the modifier with the index of the current breakpoint in the bps array with the index of the queried breakpoint.
  // if no modifier is set, compare the queried breakpoint name with the current breakpoint name
  if (
    (modifier === '+' && currentBpIndex >= bpIndex) ||
    (modifier === '-' && currentBpIndex <= bpIndex) ||
    (!modifier && breakpoint === currentBp)
  ) {
    return true
  }

  // the current breakpoint isn’t the one you’re looking for
  return false
};

var purgeProperties = function(obj) {
  // Doc: https://code.area17.com/a17/a17-helpers/wikis/purgeProperties
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }

  // alternatives considered: https://jsperf.com/deleting-properties-from-an-object
};

function Behavior(node, config = {}) {
  if (!node || !(node instanceof Element)) {
    throw new Error('Node argument is required');
  }

  this.$node = node;
  this.options = Object.assign({
    intersectionOptions: {
      rootMargin: '20%',
    }
  }, config.options || {});

  this.__isEnabled = false;
  this.__children = config.children;
  this.__breakpoints = config.breakpoints;

  // Auto-bind all custom methods to "this"
  this.customMethodNames.forEach(methodName => {
    this[methodName] = this[methodName].bind(this);
  });

  this._binds = {};
  this._data = new Proxy(this._binds, {
      set: (target, key, value) => {
          this.updateBinds(key, value);
          target[key] = value;
          return true;
      }
  });

  this.__isIntersecting = false;
  this.__intersectionObserver;

  return this;
}

Behavior.prototype = Object.freeze({
  updateBinds(key, value) {
      // TODO: cache these before hand?
      const targetEls = this.$node.querySelectorAll('[data-' + this.name.toLowerCase() + '-bindel*=' + key + ']');
      targetEls.forEach((target) => {
          target.innerHTML = value;
      });
      // TODO: cache these before hand?
      const targetAttrs = this.$node.querySelectorAll('[data-' + this.name.toLowerCase() + '-bindattr*="' + key + ':"]');
      targetAttrs.forEach((target) => {
          let bindings = target.dataset[this.name.toLowerCase() + 'Bindattr'];
          bindings.split(',').forEach((pair) => {
              pair = pair.split(':');
              if (pair[0] === key) {
                  if (pair[1] === 'class') {
                      // TODO: needs to know what the initial class was to remove it - fix?
                      if (this._binds[key] !== value) {
                          target.classList.remove(this._binds[key]);
                      }
                      if (value) {
                          target.classList.add(value);
                      }
                  } else {
                      target.setAttribute(pair[1], value);
                  }
              }
          });
      });
  },
  init() {
    // Get options from data attributes on node
    const regex = new RegExp('^data-' + this.name + '-(.*)', 'i');
    for (let i = 0; i < this.$node.attributes.length; i++) {
      const attr = this.$node.attributes[i];
      const matches = regex.exec(attr.nodeName);

      if (matches != null && matches.length >= 2) {
        if (this.options[matches[1]]) {
          console.warn(
            `Ignoring ${
              matches[1]
            } option, as it already exists on the ${name} behavior. Please choose another name.`
          );
        }
        this.options[matches[1]] = attr.value;
      }
    }

    // Behavior-specific lifecycle
    if (this.lifecycle.init != null) {
      this.lifecycle.init.call(this);
    }

    if (this.lifecycle.resized != null) {
      this.__resizedBind = this.__resized.bind(this);
      window.addEventListener('resized', this.__resizedBind);
    }

    if (this.lifecycle.mediaQueryUpdated != null || this.options.media) {
      this.__mediaQueryUpdatedBind = this.__mediaQueryUpdated.bind(this);
      window.addEventListener('mediaQueryUpdated', this.__mediaQueryUpdatedBind);
    }

    if (this.options.media) {
      this.__toggleEnabled();
    } else {
      this.enable();
    }

    this.__intersections();
  },
  destroy() {
    if (this.__isEnabled === true) {
      this.disable();
    }

    // Behavior-specific lifecycle
    if (this.lifecycle.destroy != null) {
      this.lifecycle.destroy.call(this);
    }

    if (this.lifecycle.resized != null) {
      window.removeEventListener('resized', this.__resizedBind);
    }

    if (this.lifecycle.mediaQueryUpdated != null || this.options.media) {
      window.removeEventListener('mediaQueryUpdated', this.__mediaQueryUpdatedBind);
    }

    if (this.lifecycle.intersectionIn != null || this.lifecycle.intersectionOut != null) {
      this.__intersectionObserver.unobserve(this.$node);
      this.__intersectionObserver.disconnect();
    }

    purgeProperties(this);
  },
  getChild(childName, context, multi = false) {
    if (context == null) {
      context = this.$node;
    }
    if (this.__children != null && this.__children[childName] != null) {
      return this.__children[childName];
    }
    return context[multi ? 'querySelectorAll' : 'querySelector'](
      '[data-' + this.name.toLowerCase() + '-' + childName.toLowerCase() + ']'
    );
  },
  getChildren(childName, context) {
    return this.getChild(childName, context, true);
  },
  isEnabled() {
    return this.__isEnabled;
  },
  enable() {
    this.__isEnabled = true;
    if (this.lifecycle.enabled != null) {
      this.lifecycle.enabled.call(this);
    }
  },
  disable() {
    this.__isEnabled = false;
    if (this.lifecycle.disabled != null) {
      this.lifecycle.disabled.call(this);
    }
  },
  addSubBehavior(SubBehavior, node = this.$node, config = {}) {
    const mb = exportObj;
    if (typeof SubBehavior === 'string') {
      mb.initBehavior(SubBehavior, node, config);
    } else {
      mb.add(SubBehavior);
      mb.initBehavior(SubBehavior.prototype.behaviorName, node, config);
    }
  },
  isBreakpoint(bp) {
    return isBreakpoint(bp, this.__breakpoints);
  },
  __toggleEnabled() {
    const isValidMQ = isBreakpoint(this.options.media, this.__breakpoints);
    if (isValidMQ && !this.__isEnabled) {
      this.enable();
    } else if (!isValidMQ && this.__isEnabled) {
      this.disable();
    }
  },
  __mediaQueryUpdated(e) {
    if (this.lifecycle.mediaQueryUpdated != null) {
      this.lifecycle.mediaQueryUpdated.call(this, e);
    }
    if (this.options.media) {
      this.__toggleEnabled();
    }
  },
  __resized(e) {
    if (this.lifecycle.resized != null) {
      this.lifecycle.resized.call(this, e);
    }
  },
  __intersections() {
    if (this.lifecycle.intersectionIn != null || this.lifecycle.intersectionOut != null) {
      this.__intersectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.target === this.$node) {
            if (entry.isIntersecting) {
              if (!this.__isIntersecting && this.lifecycle.intersectionIn != null) {
                this.__isIntersecting = true;
                this.lifecycle.intersectionIn.call(this);
              }
            } else {
              if (this.__isIntersecting && this.lifecycle.intersectionOut != null) {
                this.__isIntersecting = false;
                this.lifecycle.intersectionOut.call(this);
              }
            }
          }
        });
      }, this.options.intersectionOptions);
      this.__intersectionObserver.observe(this.$node);
    }
  }
});

const createBehavior = (name, def, lifecycle = {}) => {
  const fn = function(...args) {
    Behavior.apply(this, args);
  };

  const customMethodNames = [];

  const customProperties = {
    name: {
      get() {
        return this.behaviorName;
      },
    },
    behaviorName: {
      value: name,
      writable: true,
    },
    lifecycle: {
      value: lifecycle,
    },
    customMethodNames: {
      value: customMethodNames,
    },
  };

  // Expose the definition properties as 'this[methodName]'
  const defKeys = Object.keys(def);
  defKeys.forEach(key => {
    customMethodNames.push(key);
    customProperties[key] = {
      value: def[key],
      writable: true,
    };
  });

  fn.prototype = Object.create(Behavior.prototype, customProperties);
  return fn;
};

let options = {
  dataAttr: 'behavior',
  lazyAttr: 'behavior-lazy',
  intersectionOptions: {
    rootMargin: '20%',
  },
  breakpoints: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
};
let loadedBehaviorNames = [];
let observingBehaviors = false;
const loadedBehaviors = {};
const activeBehaviors = new Map();
const behaviorsAwaitingImport = new Map();
let io;
const ioEntries = new Map(); // need to keep a separate map of intersection observer entries as `io.takeRecords()` always returns an empty array, seems broken in all browsers 🤷🏻‍♂️
const intersecting = new Map();

/*
  getBehaviorNames

  Data attribute names can be written in any case,
  but `node.dataset` names are lowercase
  with camel casing for names split by -
  eg: `data-foo-bar` becomes `node.dataset.fooBar`

  bNode - node to grab behavior names from
  attr - name of attribute to pick
*/
function getBehaviorNames(bNode, attr) {
  attr = attr.toLowerCase().replace(/-([a-zA-Z0-9])/ig, (match, p1) => {
    return p1.toUpperCase();
  });
  if (bNode.dataset && bNode.dataset[attr]) {
    return bNode.dataset && bNode.dataset[attr] && bNode.dataset[attr].split(' ');
  } else {
    return [];
  }
}

/*
  importFailed

  bName - name of behavior that failed to import

  Either the imported module didn't look like a behavior module
  or nothing could be found to import
*/
function importFailed(bName) {
  // remove name from loaded behavior names index
  // maybe it'll be included via a script tag later
  const bNameIndex = loadedBehaviorNames.indexOf(bName);
  if (bNameIndex > -1) {
    loadedBehaviorNames.splice(bNameIndex, 1);
  }
}

/*
  destroyBehavior

  All good things must come to an end...
  Ok so likely the node has been removed, possibly by
  a deletion or ajax type page change

  bName - name of behavior to destroy
  bNode - node to destroy behavior on

  `destroy()` is an internal method of a behavior
  in `createBehavior`. Individual behaviors may
  also have their own `destroy` methods (called by
  the `createBehavior` `destroy`)
*/
function destroyBehavior(bName, bNode) {
  const nodeBehaviors = activeBehaviors.get(bNode);
  if (!nodeBehaviors || !nodeBehaviors[bName]) {
    console.warn(`No behavior '${bName}' instance on:`, bNode);
    return;
  }
  // run destroy method, remove, delete
  nodeBehaviors[bName].destroy();
  delete nodeBehaviors[bName];
  if (Object.keys(nodeBehaviors).length === 0) {
    activeBehaviors.delete(bNode);
  }
}

/*
  destroyBehaviors

  rNode - node to destroy behaviors on (and inside of)

  if a node with behaviors is removed from the DOM,
  clean up to save resources
*/
function destroyBehaviors(rNode) {
  const bNodes = Array.from(activeBehaviors.keys());
  bNodes.push(rNode);
  bNodes.forEach(bNode => {
    // is the active node the removed node
    // or does the removed node contain the active node?
    if (rNode === bNode || rNode.contains(bNode)) {
      // get behaviors on node
      const bNodeActiveBehaviors = activeBehaviors.get(bNode);
      // if some, destroy
      if (bNodeActiveBehaviors) {
        Object.keys(bNodeActiveBehaviors).forEach(bName => {
          destroyBehavior(bName, bNode);
          // stop intersection observer from watching node
          io.unobserve(bNode);
          ioEntries.delete(bNode);
          intersecting.delete(bNode);
        });
      }
    }
  });
}

/*
  importBehavior

  bName - name of behavior
  bNode - node to initialise behavior on

  Use `import` to bring in a behavior module and run it.
  This runs if there is no loaded behavior of this name.
  After import, the behavior is initialised on the node
*/
function importBehavior(bName, bNode) {
  // first check we haven't already got this behavior module
  if (loadedBehaviorNames.indexOf(bName) > -1) {
    // if no, store a list of nodes awaiting this behavior to load
    const awaitingImport = behaviorsAwaitingImport.get(bName) || [];
    if (!awaitingImport.includes(bNode)) {
      awaitingImport.push(bNode);
    }
    behaviorsAwaitingImport.set(bName, awaitingImport);
    return;
  }
  // push to our store of loaded behaviors
  loadedBehaviorNames.push(bName);
  // import
  // webpack interprets this, does some magic
  // process.env variables set in webpack config
  try {
    __webpack_require__("./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*.*.*\\..*$")(`${process.env.BEHAVIORS_PATH}${process.env.BEHAVIORS_COMPONENT_PATHS[bName]||''}${bName}.${process.env.BEHAVIORS_EXTENSION }`).then(module => {
      behaviorImported(bName, bNode, module);
    }).catch(err => {
      console.warn(`No loaded behavior called: ${bName}`);
      // fail, clean up
      importFailed(bName);
    });
  } catch(err1) {
    try {
      __webpack_require__("./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*.*\\..*$")(`${process.env.BEHAVIORS_PATH}${bName}.${process.env.BEHAVIORS_EXTENSION}`).then(module => {
        behaviorImported(bName, bNode, module);
      }).catch(err => {
        console.warn(`No loaded behavior called: ${bName}`);
        // fail, clean up
        importFailed(bName);
      });
    } catch(err2) {
      console.warn(`Unknown behavior called: ${bName}. \nIt maybe the behavior doesn't exist, check for typos and check Webpack has generated your file. \nYou might also want to check your webpack config plugins DefinePlugin for process.env.BEHAVIORS_EXTENSION, process.env.BEHAVIORS_PATH and or process.env.BEHAVIORS_COMPONENT_PATHS. See https://github.com/area17/a17-behaviors/wiki/02-Setup#webpackcommonjs`);
      // fail, clean up
      importFailed(bName);
    }
  }
}

/*
  behaviorImported

  bName - name of behavior
  bNode - node to initialise behavior on
  module - imported behavior module

  Run when a dynamic import is successfully imported,
  sets up and runs the behavior on the node
*/
function behaviorImported(bName, bNode, module) {
  // does what we loaded look right?
  if (module.default && typeof module.default === 'function') {
    // import complete, go go go
    loadedBehaviors[bName] = module.default;
    initBehavior(bName, bNode);
    // check for other instances of this behavior that where awaiting load
    if (behaviorsAwaitingImport.get(bName)) {
      behaviorsAwaitingImport.get(bName).forEach(node => {
        initBehavior(bName, node);
      });
      behaviorsAwaitingImport.delete(bName);
    }
  } else {
    console.warn(`Tried to import ${bName}, but it seems to not be a behavior`);
    // fail, clean up
    importFailed(bName);
  }
}

/*
  createBehaviors

  node - node to check for behaviors on elements

  assign behaviors to nodes
*/
function createBehaviors(node) {
  // Ignore text or comment nodes
  if (!('querySelectorAll' in node)) {
    return;
  }

  // first check for "critical" behavior nodes
  // these will be run immediately on discovery
  const behaviorNodes = [node, ...node.querySelectorAll(`[data-${options.dataAttr}]`)];
  behaviorNodes.forEach(bNode => {
    // an element can have multiple behaviors
    const bNames = getBehaviorNames(bNode, options.dataAttr);
    // loop them
    if (bNames) {
      bNames.forEach(bName => {
        initBehavior(bName, bNode);
      });
    }
  });

  // now check for "lazy" behaviors
  // these are triggered via an intersection observer
  // these have optional breakpoints at which to trigger
  const lazyBehaviorNodes = [node, ...node.querySelectorAll(`[data-${options.lazyAttr}]`)];
  lazyBehaviorNodes.forEach(bNode => {
    // look for lazy behavior names
    const bNames = getBehaviorNames(bNode, options.lazyAttr);
    const bMap = new Map();
    bNames.forEach(bName => {
      // check for a lazy behavior breakpoint trigger
      const behaviorMedia = bNode.dataset[`${bName.toLowerCase()}Lazymedia`];
      // store
      bMap.set(bName, behaviorMedia || false);
    });
    // store and observe
    if (bNode !== document) {
      ioEntries.set(bNode, bMap);
      intersecting.set(bNode, false);
      io.observe(bNode);
    }
  });
}

/*
  observeBehaviors

  runs a `MutationObserver`, which watches for DOM changes
  when a DOM change happens, insertion or deletion,
  the call back runs, informing us of what changed
*/
function observeBehaviors() {
  // flag to stop multiple MutationObserver
  observingBehaviors = true;
  // set up MutationObserver
  const mo = new MutationObserver(mutations => {
    // report on what changed
    mutations.forEach(mutation => {
      mutation.removedNodes.forEach(node => {
        destroyBehaviors(node);
      });
      mutation.addedNodes.forEach(node => {
        createBehaviors(node);
      });
    });
  });
  // observe changes to the entire document
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
}

/*
  loopLazyBehaviorNodes

  bNodes - elements to check for lazy behaviors

  Looks at the nodes that have lazy behaviors, checks
  if they're intersecting, optionally checks the breakpoint
  and initialises if needed. Cleans up after itself, by
  removing the intersection observer observing of the node
  if all lazy behaviors on a node have been initialised
*/

function loopLazyBehaviorNodes(bNodes) {
  bNodes.forEach(bNode => {
    // first, check if this node is being intersected
    if (intersecting.get(bNode) !== undefined && intersecting.get(bNode) === false) {
      return;
    }
    // now check to see if we have any lazy behavior names
    let lazyBNames = ioEntries.get(bNode);
    if (!lazyBNames) {
      return;
    }
    //
    lazyBNames.forEach((bMedia, bName) => {
      // if no lazy behavior breakpoint trigger,
      // or if the current breakpoint matches
      if (!bMedia || isBreakpoint(bMedia, options.breakpoints)) {
        // run behavior on node
        initBehavior(bName, bNode);
        // remove this behavior from the list of lazy behaviors
        lazyBNames.delete(bName);
        // if there are no more lazy behaviors left on the node
        // stop observing the node
        // else update the ioEntries
        if (lazyBNames.size === 0) {
          io.unobserve(bNode);
          ioEntries.delete(bNode);
        } else {
          ioEntries.set(bNode, lazyBNames);
        }
      }
    });
    // end loopLazyBehaviorNodes bNodes loop
  });
}

/*
  intersection

  entries - intersection observer entries

  The intersection observer call back,
  sets a value in the intersecting map true/false
  and if an entry is intersecting, checks if needs to
  init any lazy behaviors
*/
function intersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      intersecting.set(entry.target, true);
      loopLazyBehaviorNodes([entry.target]);
    } else {
      intersecting.set(entry.target, false);
    }
  });
}

/*
  mediaQueryUpdated

  If a resize has happened with enough size that a
  breakpoint has changed, checks to see if any lazy
  behaviors need to be initialised or not
*/
function mediaQueryUpdated() {
  loopLazyBehaviorNodes(Array.from(ioEntries.keys()));
}


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Public methods */

/*
  initBehavior

  bName - name of behavior
  bNode - node to initialise behavior on

  Is returned as public method

  Run the `init` method inside of a behavior,
  the internal one in `createBehavior`, which then
  runs the behaviors `init` life cycle method
*/
function initBehavior(bName, bNode, config = {}) {
  // first check we have a loaded behavior
  if (!loadedBehaviors[bName]) {
    // if not, attempt to import it
    importBehavior(bName, bNode);
    return;
  }
  // merge breakpoints into config
  config = {
    breakpoints: options.breakpoints,
    ...config
  };
  // now check that this behavior isn't already
  // running on this node
  const nodeBehaviors = activeBehaviors.get(bNode) || {};
  if (nodeBehaviors === {} || !nodeBehaviors[bName]) {
    const instance = new loadedBehaviors[bName](bNode, config);
    // update internal store of whats running
    nodeBehaviors[bName] = instance;
    activeBehaviors.set(bNode, nodeBehaviors);
    // init method in the behavior
    instance.init();
    //
    return instance;
  }
}

/*
  addBehaviors

  behaviors - behaviors modules, module or object

  Is returned as public method

  Can pass
  - a singular behavior as created by `createBehavior`,
  - a behavior object which will be passed to `createBehavior`
  - a behavior module
  - a collection of behavior modules

  Adds each behavior to memory, to be initialised to a DOM node when the
  corresponding DOM node exists
*/
function addBehaviors(behaviors) {
    // if singular behavior added, sort into module like structure
    if (typeof behaviors === 'function' && behaviors.prototype.behaviorName) {
      behaviors = { [behaviors.prototype.behaviorName]: behaviors };
    }
    // if an uncompiled behavior object is passed, create it
    if (typeof behaviors === 'string' && arguments.length > 1) {
      behaviors = { [behaviors]: createBehavior(...arguments) };
    }
    // process
    const unique = Object.keys(behaviors).filter((o) => loadedBehaviorNames.indexOf(o) === -1);
    if (unique.length) {
      // we have new unique behaviors, store them
      loadedBehaviorNames = loadedBehaviorNames.concat(unique);
      unique.forEach(bName => {
        loadedBehaviors[bName] = behaviors[bName];
      });
      // try and apply behaviors to any DOM node that needs them
      createBehaviors(document);
      // start the mutation observer looking for DOM changes
      if (!observingBehaviors) {
        observeBehaviors();
      }
    }
}

/*
  nodeBehaviors

  bNode - node on which to get active behaviors on

  Is returned as public method when webpack is set to development mode

  Returns all active behaviors on a node
*/
function nodeBehaviors(bNode) {
  const nodeBehaviors = activeBehaviors.get(bNode);
  if (!nodeBehaviors) {
    console.warn(`No behaviors on:`, bNode);
  } else {
    return nodeBehaviors;
  }
}

/*
  behaviorProperties

  bName - name of behavior to return properties of
  bNode - node on which the behavior is running

  Is returned as public method when webpack is set to development mode

  Returns all properties of a behavior
*/
function behaviorProperties(bName, bNode) {
  const nodeBehaviors = activeBehaviors.get(bNode);
  if (!nodeBehaviors || !nodeBehaviors[bName]) {
    console.warn(`No behavior '${bName}' instance on:`, bNode);
  } else {
    return activeBehaviors.get(bNode)[bName];
  }
}

/*
  behaviorProp

  bName - name of behavior to return properties of
  bNode - node on which the behavior is running
  prop - property to return or set
  value - value to set

  Is returned as public method when webpack is set to development mode

  Returns specific property of a behavior on a node, or runs a method
  or sets a property on a behavior if a value is set. For debuggging.
*/
function behaviorProp(bName, bNode, prop, value) {
  const nodeBehaviors = activeBehaviors.get(bNode);
  if (!nodeBehaviors || !nodeBehaviors[bName]) {
    console.warn(`No behavior '${bName}' instance on:`, bNode);
  } else if (activeBehaviors.get(bNode)[bName][prop]) {
    if (value && typeof value === 'function') {
      return activeBehaviors.get(bNode)[bName][prop];
    } else if (value) {
      activeBehaviors.get(bNode)[bName][prop] = value;
    } else {
      return activeBehaviors.get(bNode)[bName][prop];
    }
  } else {
    console.warn(`No property '${prop}' in behavior '${bName}' instance on:`, bNode);
  }
}

/*
  init

  gets this show on the road

  loadedBehaviorsModule - optional behaviors module to load on init
  opts - any options for this instance
*/

function init(loadedBehaviorsModule, opts) {
  options = {
    ...options, ...opts
  };

  // on resize, check
  resized();

  // set up intersection observer
  io = new IntersectionObserver(intersection, options.intersectionOptions);

  // if fn run with supplied behaviors, lets add them and begin
  if (loadedBehaviorsModule) {
    addBehaviors(loadedBehaviorsModule);
  }

  // watch for break point changes
  window.addEventListener('mediaQueryUpdated', mediaQueryUpdated);
}

// expose public methods, essentially returning

let exportObj = {
  init: init,
  add: addBehaviors,
  initBehavior: initBehavior,
  get currentBreakpoint() {
    return getCurrentMediaQuery();
  }
};

if (true) {
  Object.defineProperty(exportObj, 'loaded', {
    get: () => {
      return loadedBehaviorNames;
    }
  });
  exportObj.activeBehaviors = activeBehaviors;
  exportObj.active = activeBehaviors;
  exportObj.getBehaviors = nodeBehaviors;
  exportObj.getProps = behaviorProperties;
  exportObj.getProp = behaviorProp;
  exportObj.setProp = behaviorProp;
  exportObj.callMethod = behaviorProp;
}




/***/ }),

/***/ "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*.*.*\\..*$":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@area17/a17-behaviors/dist/esm/ lazy ^.*.*.*\..*$ namespace object ***!
  \*****************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	".": "./node_modules/@area17/a17-behaviors/dist/esm/index.js",
	"./": "./node_modules/@area17/a17-behaviors/dist/esm/index.js",
	"./index": "./node_modules/@area17/a17-behaviors/dist/esm/index.js",
	"./index.js": "./node_modules/@area17/a17-behaviors/dist/esm/index.js"
};

function webpackAsyncContext(req) {
	return Promise.resolve().then(() => {
		if(!__webpack_require__.o(map, req)) {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		}

		var id = map[req];
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*.*.*\\..*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*.*\\..*$":
/*!***************************************************************************************!*\
  !*** ./node_modules/@area17/a17-behaviors/dist/esm/ lazy ^.*.*\..*$ namespace object ***!
  \***************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	".": "./node_modules/@area17/a17-behaviors/dist/esm/index.js",
	"./": "./node_modules/@area17/a17-behaviors/dist/esm/index.js",
	"./index": "./node_modules/@area17/a17-behaviors/dist/esm/index.js",
	"./index.js": "./node_modules/@area17/a17-behaviors/dist/esm/index.js"
};

function webpackAsyncContext(req) {
	return Promise.resolve().then(() => {
		if(!__webpack_require__.o(map, req)) {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		}

		var id = map[req];
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*.*\\..*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./resources/frontend/js/behaviors/index.js":
/*!**************************************************!*\
  !*** ./resources/frontend/js/behaviors/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Accordion": () => (/* reexport safe */ _views_components_accordion_accordion__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   "Modal": () => (/* reexport safe */ _views_components_modal_modal__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   "VideoBackground": () => (/* reexport safe */ _views_components_video_background_video_background__WEBPACK_IMPORTED_MODULE_2__["default"])
/* harmony export */ });
/* harmony import */ var _views_components_accordion_accordion__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../views/components/accordion/accordion */ "./resources/views/components/accordion/accordion.js");
/* harmony import */ var _views_components_modal_modal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../views/components/modal/modal */ "./resources/views/components/modal/modal.js");
/* harmony import */ var _views_components_video_background_video_background__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../views/components/video-background/video-background */ "./resources/views/components/video-background/video-background.js");




/***/ }),

/***/ "./resources/frontend/js/main.js":
/*!***************************************!*\
  !*** ./resources/frontend/js/main.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @area17/a17-behaviors */ "./node_modules/@area17/a17-behaviors/dist/esm/index.js");
/* harmony import */ var _behaviors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./behaviors */ "./resources/frontend/js/behaviors/index.js");


document.addEventListener('DOMContentLoaded', function () {
  (0,_area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__.manageBehaviors)(_behaviors__WEBPACK_IMPORTED_MODULE_1__, {
    breakpoints: ['sm', 'md', 'lg', 'xl', '2xl']
  });
});

/***/ }),

/***/ "./resources/views/components/accordion/accordion.js":
/*!***********************************************************!*\
  !*** ./resources/views/components/accordion/accordion.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @area17/a17-behaviors */ "./node_modules/@area17/a17-behaviors/dist/esm/index.js");

var Accordion = (0,_area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__.createBehavior)('Accordion', {
  toggle: function toggle(e) {
    e.preventDefault();
    var index = e.currentTarget.getAttribute('data-Accordion-index');

    if (this._data.activeIndexes.includes(index)) {
      this.close(index);
      this._data.activeIndexes = this._data.activeIndexes.filter(function (item) {
        return item !== index;
      });
    } else {
      this.open(index);

      this._data.activeIndexes.push(index);
    }
  },
  close: function close(index) {
    var activeTrigger = this.$triggers[index];
    var activeIcon = this.$triggerIcons[index];
    var activeContent = this.$contents[index];
    activeContent.style.height = '0px';
    activeTrigger.setAttribute('aria-expanded', 'false');
    activeContent.setAttribute('aria-hidden', 'true');
    activeIcon.classList.remove('rotate-180');
  },
  open: function open(index) {
    var activeTrigger = this.$triggers[index];
    var activeIcon = this.$triggerIcons[index];
    var activeContent = this.$contents[index];
    var activeContentInner = this.$contentInners[index];
    var contentHeight = activeContentInner.offsetHeight;
    activeContent.style.height = "".concat(contentHeight, "px");
    activeTrigger.setAttribute('aria-expanded', 'true');
    activeContent.setAttribute('aria-hidden', 'false');
    activeIcon.classList.add('rotate-180');
  }
}, {
  init: function init() {
    var _this = this;

    this._data.activeIndexes = [];
    this.$initOpen = this.getChildren('init-open');
    this.$triggers = this.getChildren('trigger');
    this.$triggerIcons = this.getChildren('trigger-icon');
    this.$contents = this.getChildren('content');
    this.$contentInners = this.getChildren('content-inner');
    this.$triggers.forEach(function (trigger) {
      trigger.addEventListener('click', _this.toggle, false);
    });
    this.$initOpen.forEach(function (trigger) {
      trigger.click();
    });
  },
  enabled: function enabled() {},
  resized: function resized() {},
  mediaQueryUpdated: function mediaQueryUpdated() {},
  disabled: function disabled() {},
  destroy: function destroy() {
    var _this2 = this;

    this.$triggers.forEach(function (trigger) {
      trigger.removeEventListener('click', _this2.toggle);
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Accordion);

/***/ }),

/***/ "./resources/views/components/modal/modal.js":
/*!***************************************************!*\
  !*** ./resources/views/components/modal/modal.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @area17/a17-behaviors */ "./node_modules/@area17/a17-behaviors/dist/esm/index.js");
/* harmony import */ var body_scroll_lock__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! body-scroll-lock */ "./node_modules/body-scroll-lock/lib/bodyScrollLock.esm.js");
/* harmony import */ var focus_trap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! focus-trap */ "./node_modules/focus-trap/dist/focus-trap.esm.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }




var Modal = (0,_area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__.createBehavior)('Modal', {
  toggle: function toggle(e) {
    e.preventDefault();

    if (this._data.isActive) {
      this.close();
    } else {
      this.open();
    }
  },
  close: function close(e) {
    if (this._data.isActive) {
      var _this$$node$classList;

      (_this$$node$classList = this.$node.classList).remove.apply(_this$$node$classList, _toConsumableArray(this._data.activeClasses));

      this._data.focusTrap.deactivate();

      this._data.isActive = false;
      (0,body_scroll_lock__WEBPACK_IMPORTED_MODULE_1__.enableBodyScroll)(this.$node);
      this.$node.dispatchEvent(new CustomEvent('Modal:closed'));
    }
  },
  open: function open() {
    var _this$$node$classList2,
        _this = this;

    document.dispatchEvent(new CustomEvent('Modal:closeAll'));

    (_this$$node$classList2 = this.$node.classList).add.apply(_this$$node$classList2, _toConsumableArray(this._data.activeClasses));

    this._data.isActive = true;
    setTimeout(function () {
      _this._data.focusTrap.activate();

      (0,body_scroll_lock__WEBPACK_IMPORTED_MODULE_1__.disableBodyScroll)(_this.$node);
    }, 300);
  },
  handleEsc: function handleEsc(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  },
  handleClickOutside: function handleClickOutside(e) {
    if (e.target.id === this.$node.id) {
      this.close(e);
    }
  },
  addListener: function addListener(arr, func) {
    var arrLength = arr.length;

    for (var i = 0; i < arrLength; i++) {
      arr[i].addEventListener('click', func, false);
    }
  },
  removeListener: function removeListener(arr, func) {
    var arrLength = arr.length;

    for (var i = 0; i < arrLength; i++) {
      arr[i].removeEventListener('click', func);
    }
  }
}, {
  init: function init() {
    this.$focusTrap = this.getChild('focus-trap');
    this.$closeButtons = this.getChildren('close-trigger');
    this.$initialFocus = this.getChild('initial-focus');

    if (!this.$initialFocus) {
      console.warn('No initial focus element found. Add a `h1` with the attribute `data-Modal-initial-focus`. The `h1` should also have an id that matches the modal id with `_title` appended');
    }

    this._data.focusTrap = focus_trap__WEBPACK_IMPORTED_MODULE_2__.createFocusTrap(this.$focusTrap, {
      initialFocus: this.$initialFocus
    });
    this._data.isActive = false;
    this._data.activeClasses = ['a17-trans-show-hide--active'];

    if (this.$closeButtons) {
      this.addListener(this.$closeButtons, this.close);
    }

    this.$node.addEventListener('Modal:toggle', this.toggle, false);
    this.$node.addEventListener('Modal:open', this.open, false);
    this.$node.addEventListener('Modal:close', this.close, false);
    document.addEventListener('Modal:closeAll', this.close, false);
    document.addEventListener('keyup', this.handleEsc, false); // add listener to modal toggle buttons

    var modalId = this.$node.getAttribute('id');
    this.$triggers = document.querySelectorAll("[data-modal-target=\"#".concat(modalId, "\"]"));
    this.addListener(this.$triggers, this.toggle);

    if (this.options['panel']) {
      this.$node.addEventListener('click', this.handleClickOutside, false);
    }
  },
  enabled: function enabled() {},
  resized: function resized() {},
  mediaQueryUpdated: function mediaQueryUpdated() {// current media query is: A17.currentMediaQuery
  },
  disabled: function disabled() {},
  destroy: function destroy() {
    this.close();

    if (this.$closeButtons) {
      this.removeListener(this.$closeButtons, this.close);
    }

    this.$node.removeEventListener('Modal:toggle', this.toggle);
    this.$node.removeEventListener('Modal:open', this.open);
    this.$node.removeEventListener('Modal:close', this.close);
    this.$node.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('Modal:closeAll', this.close);
    document.removeEventListener('keyup', this.handleEsc);
    this.removeListener(this.$triggers, this.toggle);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Modal);

/***/ }),

/***/ "./resources/views/components/video-background/video-background.js":
/*!*************************************************************************!*\
  !*** ./resources/views/components/video-background/video-background.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @area17/a17-behaviors */ "./node_modules/@area17/a17-behaviors/dist/esm/index.js");

var VideoBackground = (0,_area17_a17_behaviors__WEBPACK_IMPORTED_MODULE_0__.createBehavior)('VideoBackground', {
  toggle: function toggle(e) {
    e.preventDefault();

    if (this.isPlaying) {
      this.$player.pause();
    } else {
      this.$player.play();
    }

    this.updateButton();
  },
  handlePlay: function handlePlay(e) {
    this.isPlaying = true;
  },
  handlePause: function handlePause(e) {
    this.isPlaying = false;
  },
  updateButton: function updateButton() {
    var buttonText = this.isPlaying ? this.buttonText.play : this.buttonText.pause;
    this.$pauseButton.innerText = buttonText;
    this.$pauseButton.setAttribute('aria-label', buttonText);
    this.$pauseButton.setAttribute('aria-pressed', this.isPlaying.toString());
  }
}, {
  init: function init() {
    this.isPlaying = false;
    this.buttonText = {
      play: this.options['text-play'],
      pause: this.options['text-pause']
    };
    this.$player = this.getChild('player');
    this.$pauseButton = this.getChild('controls').querySelector('button');
    this.$player.addEventListener('play', this.handlePlay, false);
    this.$player.addEventListener('pause', this.handlePause, false);
    this.$pauseButton.addEventListener('click', this.toggle, false);
  },
  enabled: function enabled() {},
  resized: function resized() {},
  mediaQueryUpdated: function mediaQueryUpdated() {},
  disabled: function disabled() {},
  destroy: function destroy() {
    this.$player.removeEventListener('play', this.handlePlay);
    this.$player.removeEventListener('pause', this.handlePause);
    this.$pauseButton.removeEventListener('click', this.toggle);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VideoBackground);

/***/ }),

/***/ "./node_modules/body-scroll-lock/lib/bodyScrollLock.esm.js":
/*!*****************************************************************!*\
  !*** ./node_modules/body-scroll-lock/lib/bodyScrollLock.esm.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "disableBodyScroll": () => (/* binding */ disableBodyScroll),
/* harmony export */   "clearAllBodyScrollLocks": () => (/* binding */ clearAllBodyScrollLocks),
/* harmony export */   "enableBodyScroll": () => (/* binding */ enableBodyScroll)
/* harmony export */ });
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Older browsers don't support event options, feature detect it.

// Adopted and modified solution from Bohdan Didukh (2017)
// https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

var hasPassiveEvents = false;
if (typeof window !== 'undefined') {
  var passiveTestOptions = {
    get passive() {
      hasPassiveEvents = true;
      return undefined;
    }
  };
  window.addEventListener('testPassive', null, passiveTestOptions);
  window.removeEventListener('testPassive', null, passiveTestOptions);
}

var isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);


var locks = [];
var documentListenerAdded = false;
var initialClientY = -1;
var previousBodyOverflowSetting = void 0;
var previousBodyPosition = void 0;
var previousBodyPaddingRight = void 0;

// returns true if `el` should be allowed to receive touchmove events.
var allowTouchMove = function allowTouchMove(el) {
  return locks.some(function (lock) {
    if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
      return true;
    }

    return false;
  });
};

var preventDefault = function preventDefault(rawEvent) {
  var e = rawEvent || window.event;

  // For the case whereby consumers adds a touchmove event listener to document.
  // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
  // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
  // the touchmove event on document will break.
  if (allowTouchMove(e.target)) {
    return true;
  }

  // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
  if (e.touches.length > 1) return true;

  if (e.preventDefault) e.preventDefault();

  return false;
};

var setOverflowHidden = function setOverflowHidden(options) {
  // If previousBodyPaddingRight is already set, don't set it again.
  if (previousBodyPaddingRight === undefined) {
    var _reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
    var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

    if (_reserveScrollBarGap && scrollBarGap > 0) {
      var computedBodyPaddingRight = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'), 10);
      previousBodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = computedBodyPaddingRight + scrollBarGap + 'px';
    }
  }

  // If previousBodyOverflowSetting is already set, don't set it again.
  if (previousBodyOverflowSetting === undefined) {
    previousBodyOverflowSetting = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
};

var restoreOverflowSetting = function restoreOverflowSetting() {
  if (previousBodyPaddingRight !== undefined) {
    document.body.style.paddingRight = previousBodyPaddingRight;

    // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
    // can be set again.
    previousBodyPaddingRight = undefined;
  }

  if (previousBodyOverflowSetting !== undefined) {
    document.body.style.overflow = previousBodyOverflowSetting;

    // Restore previousBodyOverflowSetting to undefined
    // so setOverflowHidden knows it can be set again.
    previousBodyOverflowSetting = undefined;
  }
};

var setPositionFixed = function setPositionFixed() {
  return window.requestAnimationFrame(function () {
    // If previousBodyPosition is already set, don't set it again.
    if (previousBodyPosition === undefined) {
      previousBodyPosition = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left
      };

      // Update the dom inside an animation frame 
      var _window = window,
          scrollY = _window.scrollY,
          scrollX = _window.scrollX,
          innerHeight = _window.innerHeight;

      document.body.style.position = 'fixed';
      document.body.style.top = -scrollY;
      document.body.style.left = -scrollX;

      setTimeout(function () {
        return window.requestAnimationFrame(function () {
          // Attempt to check if the bottom bar appeared due to the position change
          var bottomBarHeight = innerHeight - window.innerHeight;
          if (bottomBarHeight && scrollY >= innerHeight) {
            // Move the content further up so that the bottom bar doesn't hide it
            document.body.style.top = -(scrollY + bottomBarHeight);
          }
        });
      }, 300);
    }
  });
};

var restorePositionSetting = function restorePositionSetting() {
  if (previousBodyPosition !== undefined) {
    // Convert the position from "px" to Int
    var y = -parseInt(document.body.style.top, 10);
    var x = -parseInt(document.body.style.left, 10);

    // Restore styles
    document.body.style.position = previousBodyPosition.position;
    document.body.style.top = previousBodyPosition.top;
    document.body.style.left = previousBodyPosition.left;

    // Restore scroll
    window.scrollTo(x, y);

    previousBodyPosition = undefined;
  }
};

// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
var isTargetElementTotallyScrolled = function isTargetElementTotallyScrolled(targetElement) {
  return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
};

var handleScroll = function handleScroll(event, targetElement) {
  var clientY = event.targetTouches[0].clientY - initialClientY;

  if (allowTouchMove(event.target)) {
    return false;
  }

  if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
    // element is at the top of its scroll.
    return preventDefault(event);
  }

  if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
    // element is at the bottom of its scroll.
    return preventDefault(event);
  }

  event.stopPropagation();
  return true;
};

var disableBodyScroll = function disableBodyScroll(targetElement, options) {
  // targetElement must be provided
  if (!targetElement) {
    // eslint-disable-next-line no-console
    console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
    return;
  }

  // disableBodyScroll must not have been called on this targetElement before
  if (locks.some(function (lock) {
    return lock.targetElement === targetElement;
  })) {
    return;
  }

  var lock = {
    targetElement: targetElement,
    options: options || {}
  };

  locks = [].concat(_toConsumableArray(locks), [lock]);

  if (isIosDevice) {
    setPositionFixed();
  } else {
    setOverflowHidden(options);
  }

  if (isIosDevice) {
    targetElement.ontouchstart = function (event) {
      if (event.targetTouches.length === 1) {
        // detect single touch.
        initialClientY = event.targetTouches[0].clientY;
      }
    };
    targetElement.ontouchmove = function (event) {
      if (event.targetTouches.length === 1) {
        // detect single touch.
        handleScroll(event, targetElement);
      }
    };

    if (!documentListenerAdded) {
      document.addEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
      documentListenerAdded = true;
    }
  }
};

var clearAllBodyScrollLocks = function clearAllBodyScrollLocks() {
  if (isIosDevice) {
    // Clear all locks ontouchstart/ontouchmove handlers, and the references.
    locks.forEach(function (lock) {
      lock.targetElement.ontouchstart = null;
      lock.targetElement.ontouchmove = null;
    });

    if (documentListenerAdded) {
      document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
      documentListenerAdded = false;
    }

    // Reset initial clientY.
    initialClientY = -1;
  }

  if (isIosDevice) {
    restorePositionSetting();
  } else {
    restoreOverflowSetting();
  }

  locks = [];
};

var enableBodyScroll = function enableBodyScroll(targetElement) {
  if (!targetElement) {
    // eslint-disable-next-line no-console
    console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
    return;
  }

  locks = locks.filter(function (lock) {
    return lock.targetElement !== targetElement;
  });

  if (isIosDevice) {
    targetElement.ontouchstart = null;
    targetElement.ontouchmove = null;

    if (documentListenerAdded && locks.length === 0) {
      document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
      documentListenerAdded = false;
    }
  }

  if (isIosDevice) {
    restorePositionSetting();
  } else {
    restoreOverflowSetting();
  }
};



/***/ }),

/***/ "./node_modules/focus-trap/dist/focus-trap.esm.js":
/*!********************************************************!*\
  !*** ./node_modules/focus-trap/dist/focus-trap.esm.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createFocusTrap": () => (/* binding */ createFocusTrap)
/* harmony export */ });
/* harmony import */ var tabbable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tabbable */ "./node_modules/tabbable/dist/index.esm.js");
/*!
* focus-trap 6.6.0
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/


function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var activeFocusTraps = function () {
  var trapQueue = [];
  return {
    activateTrap: function activateTrap(trap) {
      if (trapQueue.length > 0) {
        var activeTrap = trapQueue[trapQueue.length - 1];

        if (activeTrap !== trap) {
          activeTrap.pause();
        }
      }

      var trapIndex = trapQueue.indexOf(trap);

      if (trapIndex === -1) {
        trapQueue.push(trap);
      } else {
        // move this existing trap to the front of the queue
        trapQueue.splice(trapIndex, 1);
        trapQueue.push(trap);
      }
    },
    deactivateTrap: function deactivateTrap(trap) {
      var trapIndex = trapQueue.indexOf(trap);

      if (trapIndex !== -1) {
        trapQueue.splice(trapIndex, 1);
      }

      if (trapQueue.length > 0) {
        trapQueue[trapQueue.length - 1].unpause();
      }
    }
  };
}();

var isSelectableInput = function isSelectableInput(node) {
  return node.tagName && node.tagName.toLowerCase() === 'input' && typeof node.select === 'function';
};

var isEscapeEvent = function isEscapeEvent(e) {
  return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
};

var isTabEvent = function isTabEvent(e) {
  return e.key === 'Tab' || e.keyCode === 9;
};

var delay = function delay(fn) {
  return setTimeout(fn, 0);
}; // Array.find/findIndex() are not supported on IE; this replicates enough
//  of Array.findIndex() for our needs


var findIndex = function findIndex(arr, fn) {
  var idx = -1;
  arr.every(function (value, i) {
    if (fn(value)) {
      idx = i;
      return false; // break
    }

    return true; // next
  });
  return idx;
};
/**
 * Get an option's value when it could be a plain value, or a handler that provides
 *  the value.
 * @param {*} value Option's value to check.
 * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
 * @returns {*} The `value`, or the handler's returned value.
 */


var valueOrHandler = function valueOrHandler(value) {
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }

  return typeof value === 'function' ? value.apply(void 0, params) : value;
};

var createFocusTrap = function createFocusTrap(elements, userOptions) {
  var doc = document;

  var config = _objectSpread2({
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true
  }, userOptions);

  var state = {
    // @type {Array<HTMLElement>}
    containers: [],
    // list of objects identifying the first and last tabbable nodes in all containers/groups in
    //  the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{ container: HTMLElement, firstTabbableNode: HTMLElement|null, lastTabbableNode: HTMLElement|null }>}
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: undefined
  };
  var trap; // eslint-disable-line prefer-const -- some private functions reference it, and its methods reference private functions, so we must declare here and define later

  var getOption = function getOption(configOverrideOptions, optionName, configOptionName) {
    return configOverrideOptions && configOverrideOptions[optionName] !== undefined ? configOverrideOptions[optionName] : config[configOptionName || optionName];
  };

  var containersContain = function containersContain(element) {
    return state.containers.some(function (container) {
      return container.contains(element);
    });
  };

  var getNodeForOption = function getNodeForOption(optionName) {
    var optionValue = config[optionName];

    if (!optionValue) {
      return null;
    }

    var node = optionValue;

    if (typeof optionValue === 'string') {
      node = doc.querySelector(optionValue);

      if (!node) {
        throw new Error("`".concat(optionName, "` refers to no known node"));
      }
    }

    if (typeof optionValue === 'function') {
      node = optionValue();

      if (!node) {
        throw new Error("`".concat(optionName, "` did not return a node"));
      }
    }

    return node;
  };

  var getInitialFocusNode = function getInitialFocusNode() {
    var node; // false indicates we want no initialFocus at all

    if (getOption({}, 'initialFocus') === false) {
      return false;
    }

    if (getNodeForOption('initialFocus') !== null) {
      node = getNodeForOption('initialFocus');
    } else if (containersContain(doc.activeElement)) {
      node = doc.activeElement;
    } else {
      var firstTabbableGroup = state.tabbableGroups[0];
      var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
      node = firstTabbableNode || getNodeForOption('fallbackFocus');
    }

    if (!node) {
      throw new Error('Your focus-trap needs to have at least one focusable element');
    }

    return node;
  };

  var updateTabbableNodes = function updateTabbableNodes() {
    state.tabbableGroups = state.containers.map(function (container) {
      var tabbableNodes = (0,tabbable__WEBPACK_IMPORTED_MODULE_0__.tabbable)(container);

      if (tabbableNodes.length > 0) {
        return {
          container: container,
          firstTabbableNode: tabbableNodes[0],
          lastTabbableNode: tabbableNodes[tabbableNodes.length - 1]
        };
      }

      return undefined;
    }).filter(function (group) {
      return !!group;
    }); // remove groups with no tabbable nodes
    // throw if no groups have tabbable nodes and we don't have a fallback focus node either

    if (state.tabbableGroups.length <= 0 && !getNodeForOption('fallbackFocus')) {
      throw new Error('Your focus-trap must have at least one container with at least one tabbable node in it at all times');
    }
  };

  var tryFocus = function tryFocus(node) {
    if (node === false) {
      return;
    }

    if (node === doc.activeElement) {
      return;
    }

    if (!node || !node.focus) {
      tryFocus(getInitialFocusNode());
      return;
    }

    node.focus({
      preventScroll: !!config.preventScroll
    });
    state.mostRecentlyFocusedNode = node;

    if (isSelectableInput(node)) {
      node.select();
    }
  };

  var getReturnFocusNode = function getReturnFocusNode(previousActiveElement) {
    var node = getNodeForOption('setReturnFocus');
    return node ? node : previousActiveElement;
  }; // This needs to be done on mousedown and touchstart instead of click
  // so that it precedes the focus event.


  var checkPointerDown = function checkPointerDown(e) {
    if (containersContain(e.target)) {
      // allow the click since it ocurred inside the trap
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      // immediately deactivate the trap
      trap.deactivate({
        // if, on deactivation, we should return focus to the node originally-focused
        //  when the trap was activated (or the configured `setReturnFocus` node),
        //  then assume it's also OK to return focus to the outside node that was
        //  just clicked, causing deactivation, as long as that node is focusable;
        //  if it isn't focusable, then return focus to the original node focused
        //  on activation (or the configured `setReturnFocus` node)
        // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
        //  which will result in the outside click setting focus to the node
        //  that was clicked, whether it's focusable or not; by setting
        //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
        //  on activation (or the configured `setReturnFocus` node)
        returnFocus: config.returnFocusOnDeactivate && !(0,tabbable__WEBPACK_IMPORTED_MODULE_0__.isFocusable)(e.target)
      });
      return;
    } // This is needed for mobile devices.
    // (If we'll only let `click` events through,
    // then on mobile they will be blocked anyways if `touchstart` is blocked.)


    if (valueOrHandler(config.allowOutsideClick, e)) {
      // allow the click outside the trap to take place
      return;
    } // otherwise, prevent the click


    e.preventDefault();
  }; // In case focus escapes the trap for some strange reason, pull it back in.


  var checkFocusIn = function checkFocusIn(e) {
    var targetContained = containersContain(e.target); // In Firefox when you Tab out of an iframe the Document is briefly focused.

    if (targetContained || e.target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = e.target;
      }
    } else {
      // escaped! pull it back in to where it just left
      e.stopImmediatePropagation();
      tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
    }
  }; // Hijack Tab events on the first and last focusable nodes of the trap,
  // in order to prevent focus from escaping. If it escapes for even a
  // moment it can end up scrolling the page and causing confusion so we
  // kind of need to capture the action at the keydown phase.


  var checkTab = function checkTab(e) {
    updateTabbableNodes();
    var destinationNode = null;

    if (state.tabbableGroups.length > 0) {
      // make sure the target is actually contained in a group
      // NOTE: the target may also be the container itself if it's tabbable
      //  with tabIndex='-1' and was given initial focus
      var containerIndex = findIndex(state.tabbableGroups, function (_ref) {
        var container = _ref.container;
        return container.contains(e.target);
      });

      if (containerIndex < 0) {
        // target not found in any group: quite possible focus has escaped the trap,
        //  so bring it back in to...
        if (e.shiftKey) {
          // ...the last node in the last group
          destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
        } else {
          // ...the first node in the first group
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (e.shiftKey) {
        // REVERSE
        // is the target the first tabbable node in a group?
        var startOfGroupIndex = findIndex(state.tabbableGroups, function (_ref2) {
          var firstTabbableNode = _ref2.firstTabbableNode;
          return e.target === firstTabbableNode;
        });

        if (startOfGroupIndex < 0 && state.tabbableGroups[containerIndex].container === e.target) {
          // an exception case where the target is the container itself, in which
          //  case, we should handle shift+tab as if focus were on the container's
          //  first tabbable node, and go to the last tabbable node of the LAST group
          startOfGroupIndex = containerIndex;
        }

        if (startOfGroupIndex >= 0) {
          // YES: then shift+tab should go to the last tabbable node in the
          //  previous group (and wrap around to the last tabbable node of
          //  the LAST group if it's the first tabbable node of the FIRST group)
          var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
          var destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = destinationGroup.lastTabbableNode;
        }
      } else {
        // FORWARD
        // is the target the last tabbable node in a group?
        var lastOfGroupIndex = findIndex(state.tabbableGroups, function (_ref3) {
          var lastTabbableNode = _ref3.lastTabbableNode;
          return e.target === lastTabbableNode;
        });

        if (lastOfGroupIndex < 0 && state.tabbableGroups[containerIndex].container === e.target) {
          // an exception case where the target is the container itself, in which
          //  case, we should handle tab as if focus were on the container's
          //  last tabbable node, and go to the first tabbable node of the FIRST group
          lastOfGroupIndex = containerIndex;
        }

        if (lastOfGroupIndex >= 0) {
          // YES: then tab should go to the first tabbable node in the next
          //  group (and wrap around to the first tabbable node of the FIRST
          //  group if it's the last tabbable node of the LAST group)
          var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;

          var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
          destinationNode = _destinationGroup.firstTabbableNode;
        }
      }
    } else {
      destinationNode = getNodeForOption('fallbackFocus');
    }

    if (destinationNode) {
      e.preventDefault();
      tryFocus(destinationNode);
    } // else, let the browser take care of [shift+]tab and move the focus

  };

  var checkKey = function checkKey(e) {
    if (isEscapeEvent(e) && valueOrHandler(config.escapeDeactivates) !== false) {
      e.preventDefault();
      trap.deactivate();
      return;
    }

    if (isTabEvent(e)) {
      checkTab(e);
      return;
    }
  };

  var checkClick = function checkClick(e) {
    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      return;
    }

    if (containersContain(e.target)) {
      return;
    }

    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
  }; //
  // EVENT LISTENERS
  //


  var addListeners = function addListeners() {
    if (!state.active) {
      return;
    } // There can be only one listening focus trap at a time


    activeFocusTraps.activateTrap(trap); // Delay ensures that the focused element doesn't capture the event
    // that caused the focus trap activation.

    state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function () {
      tryFocus(getInitialFocusNode());
    }) : tryFocus(getInitialFocusNode());
    doc.addEventListener('focusin', checkFocusIn, true);
    doc.addEventListener('mousedown', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('touchstart', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('click', checkClick, {
      capture: true,
      passive: false
    });
    doc.addEventListener('keydown', checkKey, {
      capture: true,
      passive: false
    });
    return trap;
  };

  var removeListeners = function removeListeners() {
    if (!state.active) {
      return;
    }

    doc.removeEventListener('focusin', checkFocusIn, true);
    doc.removeEventListener('mousedown', checkPointerDown, true);
    doc.removeEventListener('touchstart', checkPointerDown, true);
    doc.removeEventListener('click', checkClick, true);
    doc.removeEventListener('keydown', checkKey, true);
    return trap;
  }; //
  // TRAP DEFINITION
  //


  trap = {
    activate: function activate(activateOptions) {
      if (state.active) {
        return this;
      }

      var onActivate = getOption(activateOptions, 'onActivate');
      var onPostActivate = getOption(activateOptions, 'onPostActivate');
      var checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');

      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }

      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = doc.activeElement;

      if (onActivate) {
        onActivate();
      }

      var finishActivation = function finishActivation() {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }

        addListeners();

        if (onPostActivate) {
          onPostActivate();
        }
      };

      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
        return this;
      }

      finishActivation();
      return this;
    },
    deactivate: function deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }

      clearTimeout(state.delayInitialFocusTimer); // noop if undefined

      state.delayInitialFocusTimer = undefined;
      removeListeners();
      state.active = false;
      state.paused = false;
      activeFocusTraps.deactivateTrap(trap);
      var onDeactivate = getOption(deactivateOptions, 'onDeactivate');
      var onPostDeactivate = getOption(deactivateOptions, 'onPostDeactivate');
      var checkCanReturnFocus = getOption(deactivateOptions, 'checkCanReturnFocus');

      if (onDeactivate) {
        onDeactivate();
      }

      var returnFocus = getOption(deactivateOptions, 'returnFocus', 'returnFocusOnDeactivate');

      var finishDeactivation = function finishDeactivation() {
        delay(function () {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }

          if (onPostDeactivate) {
            onPostDeactivate();
          }
        });
      };

      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
        return this;
      }

      finishDeactivation();
      return this;
    },
    pause: function pause() {
      if (state.paused || !state.active) {
        return this;
      }

      state.paused = true;
      removeListeners();
      return this;
    },
    unpause: function unpause() {
      if (!state.paused || !state.active) {
        return this;
      }

      state.paused = false;
      updateTabbableNodes();
      addListeners();
      return this;
    },
    updateContainerElements: function updateContainerElements(containerElements) {
      var elementsAsArray = [].concat(containerElements).filter(Boolean);
      state.containers = elementsAsArray.map(function (element) {
        return typeof element === 'string' ? doc.querySelector(element) : element;
      });

      if (state.active) {
        updateTabbableNodes();
      }

      return this;
    }
  }; // initialize container elements

  trap.updateContainerElements(elements);
  return trap;
};


//# sourceMappingURL=focus-trap.esm.js.map


/***/ }),

/***/ "./resources/frontend/css/main.css":
/*!*****************************************!*\
  !*** ./resources/frontend/css/main.css ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/tabbable/dist/index.esm.js":
/*!*************************************************!*\
  !*** ./node_modules/tabbable/dist/index.esm.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "focusable": () => (/* binding */ focusable),
/* harmony export */   "isFocusable": () => (/* binding */ isFocusable),
/* harmony export */   "isTabbable": () => (/* binding */ isTabbable),
/* harmony export */   "tabbable": () => (/* binding */ tabbable)
/* harmony export */ });
/*!
* tabbable 5.2.0
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
var candidateSelectors = ['input', 'select', 'textarea', 'a[href]', 'button', '[tabindex]', 'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])', 'details>summary:first-of-type', 'details'];
var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
var matches = typeof Element === 'undefined' ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

var getCandidates = function getCandidates(el, includeContainer, filter) {
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));

  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }

  candidates = candidates.filter(filter);
  return candidates;
};

var isContentEditable = function isContentEditable(node) {
  return node.contentEditable === 'true';
};

var getTabindex = function getTabindex(node) {
  var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);

  if (!isNaN(tabindexAttr)) {
    return tabindexAttr;
  } // Browsers do not return `tabIndex` correctly for contentEditable nodes;
  // so if they don't have a tabindex attribute specifically set, assume it's 0.


  if (isContentEditable(node)) {
    return 0;
  } // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
  //  `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
  //  yet they are still part of the regular tab order; in FF, they get a default
  //  `tabIndex` of 0; since Chrome still puts those elements in the regular tab
  //  order, consider their tab index to be 0.


  if ((node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO' || node.nodeName === 'DETAILS') && node.getAttribute('tabindex') === null) {
    return 0;
  }

  return node.tabIndex;
};

var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};

var isInput = function isInput(node) {
  return node.tagName === 'INPUT';
};

var isHiddenInput = function isHiddenInput(node) {
  return isInput(node) && node.type === 'hidden';
};

var isDetailsWithSummary = function isDetailsWithSummary(node) {
  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
    return child.tagName === 'SUMMARY';
  });
  return r;
};

var getCheckedRadio = function getCheckedRadio(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};

var isTabbableRadio = function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }

  var radioScope = node.form || node.ownerDocument;

  var queryRadios = function queryRadios(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };

  var radioSet;

  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
      return false;
    }
  }

  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};

var isRadio = function isRadio(node) {
  return isInput(node) && node.type === 'radio';
};

var isNonTabbableRadio = function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
};

var isHidden = function isHidden(node, displayCheck) {
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }

  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;

  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  }

  if (!displayCheck || displayCheck === 'full') {
    while (node) {
      if (getComputedStyle(node).display === 'none') {
        return true;
      }

      node = node.parentElement;
    }
  } else if (displayCheck === 'non-zero-area') {
    var _node$getBoundingClie = node.getBoundingClientRect(),
        width = _node$getBoundingClie.width,
        height = _node$getBoundingClie.height;

    return width === 0 && height === 0;
  }

  return false;
};

var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
  if (node.disabled || isHiddenInput(node) || isHidden(node, options.displayCheck) ||
  /* For a details element with a summary, the summary element gets the focused  */
  isDetailsWithSummary(node)) {
    return false;
  }

  return true;
};

var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
  if (!isNodeMatchingSelectorFocusable(options, node) || isNonTabbableRadio(node) || getTabindex(node) < 0) {
    return false;
  }

  return true;
};

var tabbable = function tabbable(el, options) {
  options = options || {};
  var regularTabbables = [];
  var orderedTabbables = [];
  var candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  candidates.forEach(function (candidate, i) {
    var candidateTabindex = getTabindex(candidate);

    if (candidateTabindex === 0) {
      regularTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        node: candidate
      });
    }
  });
  var tabbableNodes = orderedTabbables.sort(sortOrderedTabbables).map(function (a) {
    return a.node;
  }).concat(regularTabbables);
  return tabbableNodes;
};

var focusable = function focusable(el, options) {
  options = options || {};
  var candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
  return candidates;
};

var isTabbable = function isTabbable(node, options) {
  options = options || {};

  if (!node) {
    throw new Error('No node provided');
  }

  if (matches.call(node, candidateSelector) === false) {
    return false;
  }

  return isNodeMatchingSelectorTabbable(options, node);
};

var focusableCandidateSelector = /* #__PURE__ */candidateSelectors.concat('iframe').join(',');

var isFocusable = function isFocusable(node, options) {
  options = options || {};

  if (!node) {
    throw new Error('No node provided');
  }

  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }

  return isNodeMatchingSelectorFocusable(options, node);
};


//# sourceMappingURL=index.esm.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		// The chunk loading function for additional chunks
/******/ 		// Since all referenced chunks are already included
/******/ 		// in this file, this function is empty here.
/******/ 		__webpack_require__.e = () => (Promise.resolve());
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/public/main": 0,
/******/ 			"public/main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunka17_toolkit"] = self["webpackChunka17_toolkit"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["public/main"], () => (__webpack_require__("./resources/frontend/js/main.js")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["public/main"], () => (__webpack_require__("./resources/frontend/css/main.css")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0Q7QUFDQTtBQUNBLHdEQUF3RCxxREFBVztBQUNuRSxPQUFPO0FBQ1A7QUFDQSxNQUFNO0FBQ047QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7O0FBR047QUFDQSxLQUFLOzs7QUFHTDtBQUNBLHVEQUF1RDs7QUFFdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNOztBQUVOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxNQUFNOzs7QUFHTix5Q0FBeUM7QUFDekM7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtEQUFrRDs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRTJCO0FBQzNCOzs7Ozs7Ozs7Ozs7O0FDcm5CQTs7Ozs7Ozs7Ozs7QUNBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHNCQUFzQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0Qjs7QUFFQTs7QUFFQTtBQUNB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QTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFakRBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbS9pbmRleC5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy9AYXJlYTE3L2ExNy1iZWhhdmlvcnMvZGlzdC9lc218bGF6eXwvXi4qLiouKlxcLi4qJC98Z3JvdXBPcHRpb25zOiB7fXxuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbXxsYXp5fC9eLiouKlxcLi4qJC98Z3JvdXBPcHRpb25zOiB7fXxuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vcmVzb3VyY2VzL2Zyb250ZW5kL2pzL2JlaGF2aW9ycy9pbmRleC5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL3Jlc291cmNlcy9mcm9udGVuZC9qcy9tYWluLmpzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vcmVzb3VyY2VzL3ZpZXdzL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL3Jlc291cmNlcy92aWV3cy9jb21wb25lbnRzL21vZGFsL21vZGFsLmpzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vcmVzb3VyY2VzL3ZpZXdzL2NvbXBvbmVudHMvdmlkZW8tYmFja2dyb3VuZC92aWRlby1iYWNrZ3JvdW5kLmpzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL2JvZHktc2Nyb2xsLWxvY2svbGliL2JvZHlTY3JvbGxMb2NrLmVzbS5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy9mb2N1cy10cmFwL2Rpc3QvZm9jdXMtdHJhcC5lc20uanMiLCJ3ZWJwYWNrOi8vYTE3LXRvb2xraXQvLi9yZXNvdXJjZXMvZnJvbnRlbmQvY3NzL21haW4uY3NzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy90YWJiYWJsZS9kaXN0L2luZGV4LmVzbS5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL2ExNy10b29sa2l0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL3J1bnRpbWUvZW5zdXJlIGNodW5rIiwid2VicGFjazovL2ExNy10b29sa2l0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYTE3LXRvb2xraXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2ExNy10b29sa2l0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGdldEN1cnJlbnRNZWRpYVF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gIC8vIERvYzogaHR0cHM6Ly9jb2RlLmFyZWExNy5jb20vYTE3L2ExNy1oZWxwZXJzL3dpa2lzL2dldEN1cnJlbnRNZWRpYVF1ZXJ5XG5cbiAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKCctLWJyZWFrcG9pbnQnKS50cmltKCkucmVwbGFjZSgvXCIvZywgJycpO1xufTtcblxudmFyIHJlc2l6ZWQgPSBmdW5jdGlvbigpIHtcbiAgLy8gRG9jOiBodHRwczovL2NvZGUuYXJlYTE3LmNvbS9hMTcvYTE3LWhlbHBlcnMvd2lraXMvcmVzaXplZFxuXG4gIHZhciByZXNpemVUaW1lcjtcbiAgdmFyIG1lZGlhUXVlcnkgPSBnZXRDdXJyZW50TWVkaWFRdWVyeSgpO1xuXG4gIGZ1bmN0aW9uIGluZm9ybUFwcCgpIHtcbiAgICAvLyBjaGVjayBtZWRpYSBxdWVyeVxuICAgIHZhciBuZXdNZWRpYVF1ZXJ5ID0gZ2V0Q3VycmVudE1lZGlhUXVlcnkoKTtcblxuICAgIC8vIHRlbGwgZXZlcnl0aGluZyByZXNpemVkIGhhcHBlbmVkXG4gICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZXNpemVkJywge1xuICAgICAgZGV0YWlsOiB7XG4gICAgICAgIGJyZWFrcG9pbnQ6IG5ld01lZGlhUXVlcnlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICAvLyBpZiBtZWRpYSBxdWVyeSBjaGFuZ2VkLCB0ZWxsIGV2ZXJ5dGhpbmdcbiAgICBpZiAobmV3TWVkaWFRdWVyeSAhPT0gbWVkaWFRdWVyeSkge1xuICAgICAgaWYgKHdpbmRvdy5BMTcpIHtcbiAgICAgICAgd2luZG93LkExNy5jdXJyZW50TWVkaWFRdWVyeSA9IG5ld01lZGlhUXVlcnk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ21lZGlhUXVlcnlVcGRhdGVkJywge1xuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBicmVha3BvaW50OiBuZXdNZWRpYVF1ZXJ5LFxuICAgICAgICAgIHByZXZCcmVha3BvaW50OiBtZWRpYVF1ZXJ5XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIG1lZGlhUXVlcnkgPSBuZXdNZWRpYVF1ZXJ5O1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQocmVzaXplVGltZXIpO1xuICAgIHJlc2l6ZVRpbWVyID0gc2V0VGltZW91dChpbmZvcm1BcHAsIDI1MCk7XG4gIH0pO1xuXG4gIGlmIChtZWRpYVF1ZXJ5ID09PSAnJykge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaW5mb3JtQXBwKTtcbiAgfSBlbHNlIGlmICh3aW5kb3cuQTE3KSB7XG4gICAgd2luZG93LkExNy5jdXJyZW50TWVkaWFRdWVyeSA9IG1lZGlhUXVlcnk7XG4gIH1cbn07XG5cbmNvbnN0IGlzQnJlYWtwb2ludCA9IGZ1bmN0aW9uIChicmVha3BvaW50LCBicmVha3BvaW50cykge1xuICAvLyBEb2M6IGh0dHBzOi8vY29kZS5hcmVhMTcuY29tL2ExNy9hMTctaGVscGVycy93aWtpcy9pc0JyZWFrcG9pbnRcblxuICAvLyBiYWlsIGlmIG5vIGJyZWFrcG9pbnQgaXMgcGFzc2VkXG4gIGlmICghYnJlYWtwb2ludCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1lvdSBuZWVkIHRvIHBhc3MgYSBicmVha3BvaW50IG5hbWUhJyk7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyB3ZSBvbmx5IHdhbnQgdG8gbG9vayBmb3IgYSBzcGVjaWZpYyBtb2RpZmllciBhbmQgbWFrZSBzdXJlIGl0IGlzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1xuICBjb25zdCByZWdFeHAgPSBuZXcgUmVnRXhwKCdcXFxcKyR8XFxcXC0kJyk7XG5cbiAgLy8gYnBzIG11c3QgYmUgaW4gb3JkZXIgZnJvbSBzbWFsbGVzdCB0byBsYXJnZXN0XG4gIGxldCBicHMgPSBbJ3hzJywgJ3NtJywgJ21kJywgJ2xnJywgJ3hsJywgJ3h4bCddO1xuXG4gIC8vIG92ZXJyaWRlIHRoZSBicmVha3BvaW50cyBpZiB0aGUgb3B0aW9uIGlzIHNldCBvbiB0aGUgZ2xvYmFsIEExNyBvYmplY3RcbiAgaWYgKHdpbmRvdy5BMTcgJiYgd2luZG93LkExNy5icmVha3BvaW50cykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHdpbmRvdy5BMTcuYnJlYWtwb2ludHMpKSB7XG4gICAgICBicHMgPSB3aW5kb3cuQTE3LmJyZWFrcG9pbnRzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0ExNy5icmVha3BvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkuIFVzaW5nIGRlZmF1bHRzLicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIG92ZXJyaWRlIHRoZSBicmVha3BvaW50cyBpZiBhIHNldCBvZiBicmVha3BvaW50cyBpcyBwYXNzZWQgdGhyb3VnaCBhcyBhIHBhcmFtZXRlciAoYWRkZWQgZm9yIEExNy1iZWhhdmlvcnMgdG8gYWxsb3cgdXNhZ2Ugd2l0aCBubyBnbG9iYWxzKVxuICBpZiAoYnJlYWtwb2ludHMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShicmVha3BvaW50cykpIHtcbiAgICAgIGJwcyA9IGJyZWFrcG9pbnRzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2lzQnJlYWtwb2ludCBicmVha3BvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkuIFVzaW5nIGRlZmF1bHRzLicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHN0b3JlIGN1cnJlbnQgYnJlYWtwb2ludCBpbiB1c2VcbiAgY29uc3QgY3VycmVudEJwID0gZ2V0Q3VycmVudE1lZGlhUXVlcnkoKTtcblxuICAvLyBzdG9yZSB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludFxuICBjb25zdCBjdXJyZW50QnBJbmRleCA9IGJwcy5pbmRleE9mKGN1cnJlbnRCcCk7XG5cbiAgLy8gY2hlY2sgdG8gc2VlIGlmIGJwIGhhcyBhICsgb3IgLSBtb2RpZmllclxuICBjb25zdCBoYXNNb2RpZmllciA9IHJlZ0V4cC5leGVjKGJyZWFrcG9pbnQpO1xuXG4gIC8vIHN0b3JlIG1vZGlmaWVyIHZhbHVlXG4gIGNvbnN0IG1vZGlmaWVyID0gaGFzTW9kaWZpZXIgPyBoYXNNb2RpZmllclswXSA6IGZhbHNlO1xuXG4gIC8vIHN0b3JlIHRoZSB0cmltbWVkIGJyZWFrcG9pbnQgbmFtZSBpZiBhIG1vZGlmaWVyIGV4aXN0cywgaWYgbm90LCBzdG9yZSB0aGUgZnVsbCBxdWVyaWVkIGJyZWFrcG9pbnQgbmFtZVxuICBjb25zdCBicE5hbWUgPSBoYXNNb2RpZmllciA/IGJyZWFrcG9pbnQuc2xpY2UoMCwgLTEpIDogYnJlYWtwb2ludDtcblxuICAvLyBzdG9yZSB0aGUgaW5kZXggb2YgdGhlIHF1ZXJpZWQgYnJlYWtwb2ludFxuICBjb25zdCBicEluZGV4ID0gYnBzLmluZGV4T2YoYnBOYW1lKTtcblxuICAvLyBsZXQgcGVvcGxlIGtub3cgaWYgdGhlIGJyZWFrcG9pbnQgbmFtZSBpcyB1bnJlY29nbml6ZWRcbiAgaWYgKGJwSW5kZXggPCAwKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1VucmVjb2duaXplZCBicmVha3BvaW50LiBTdXBwb3J0ZWQgYnJlYWtwb2ludHMgYXJlOiAnICsgYnBzLmpvaW4oJywgJylcbiAgICApO1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gY29tcGFyZSB0aGUgbW9kaWZpZXIgd2l0aCB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBpbiB0aGUgYnBzIGFycmF5IHdpdGggdGhlIGluZGV4IG9mIHRoZSBxdWVyaWVkIGJyZWFrcG9pbnQuXG4gIC8vIGlmIG5vIG1vZGlmaWVyIGlzIHNldCwgY29tcGFyZSB0aGUgcXVlcmllZCBicmVha3BvaW50IG5hbWUgd2l0aCB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWVcbiAgaWYgKFxuICAgIChtb2RpZmllciA9PT0gJysnICYmIGN1cnJlbnRCcEluZGV4ID49IGJwSW5kZXgpIHx8XG4gICAgKG1vZGlmaWVyID09PSAnLScgJiYgY3VycmVudEJwSW5kZXggPD0gYnBJbmRleCkgfHxcbiAgICAoIW1vZGlmaWVyICYmIGJyZWFrcG9pbnQgPT09IGN1cnJlbnRCcClcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgaXNu4oCZdCB0aGUgb25lIHlvdeKAmXJlIGxvb2tpbmcgZm9yXG4gIHJldHVybiBmYWxzZVxufTtcblxudmFyIHB1cmdlUHJvcGVydGllcyA9IGZ1bmN0aW9uKG9iaikge1xuICAvLyBEb2M6IGh0dHBzOi8vY29kZS5hcmVhMTcuY29tL2ExNy9hMTctaGVscGVycy93aWtpcy9wdXJnZVByb3BlcnRpZXNcbiAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICBkZWxldGUgb2JqW3Byb3BdO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFsdGVybmF0aXZlcyBjb25zaWRlcmVkOiBodHRwczovL2pzcGVyZi5jb20vZGVsZXRpbmctcHJvcGVydGllcy1mcm9tLWFuLW9iamVjdFxufTtcblxuZnVuY3Rpb24gQmVoYXZpb3Iobm9kZSwgY29uZmlnID0ge30pIHtcbiAgaWYgKCFub2RlIHx8ICEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlIGFyZ3VtZW50IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICB0aGlzLiRub2RlID0gbm9kZTtcbiAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgaW50ZXJzZWN0aW9uT3B0aW9uczoge1xuICAgICAgcm9vdE1hcmdpbjogJzIwJScsXG4gICAgfVxuICB9LCBjb25maWcub3B0aW9ucyB8fCB7fSk7XG5cbiAgdGhpcy5fX2lzRW5hYmxlZCA9IGZhbHNlO1xuICB0aGlzLl9fY2hpbGRyZW4gPSBjb25maWcuY2hpbGRyZW47XG4gIHRoaXMuX19icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cztcblxuICAvLyBBdXRvLWJpbmQgYWxsIGN1c3RvbSBtZXRob2RzIHRvIFwidGhpc1wiXG4gIHRoaXMuY3VzdG9tTWV0aG9kTmFtZXMuZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICB0aGlzW21ldGhvZE5hbWVdID0gdGhpc1ttZXRob2ROYW1lXS5iaW5kKHRoaXMpO1xuICB9KTtcblxuICB0aGlzLl9iaW5kcyA9IHt9O1xuICB0aGlzLl9kYXRhID0gbmV3IFByb3h5KHRoaXMuX2JpbmRzLCB7XG4gICAgICBzZXQ6ICh0YXJnZXQsIGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJpbmRzKGtleSwgdmFsdWUpO1xuICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gIH0pO1xuXG4gIHRoaXMuX19pc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuICB0aGlzLl9faW50ZXJzZWN0aW9uT2JzZXJ2ZXI7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbkJlaGF2aW9yLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoe1xuICB1cGRhdGVCaW5kcyhrZXksIHZhbHVlKSB7XG4gICAgICAvLyBUT0RPOiBjYWNoZSB0aGVzZSBiZWZvcmUgaGFuZD9cbiAgICAgIGNvbnN0IHRhcmdldEVscyA9IHRoaXMuJG5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtJyArIHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJy1iaW5kZWwqPScgKyBrZXkgKyAnXScpO1xuICAgICAgdGFyZ2V0RWxzLmZvckVhY2goKHRhcmdldCkgPT4ge1xuICAgICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgLy8gVE9ETzogY2FjaGUgdGhlc2UgYmVmb3JlIGhhbmQ/XG4gICAgICBjb25zdCB0YXJnZXRBdHRycyA9IHRoaXMuJG5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtJyArIHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJy1iaW5kYXR0cio9XCInICsga2V5ICsgJzpcIl0nKTtcbiAgICAgIHRhcmdldEF0dHJzLmZvckVhY2goKHRhcmdldCkgPT4ge1xuICAgICAgICAgIGxldCBiaW5kaW5ncyA9IHRhcmdldC5kYXRhc2V0W3RoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJ0JpbmRhdHRyJ107XG4gICAgICAgICAgYmluZGluZ3Muc3BsaXQoJywnKS5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgICAgICAgICAgIHBhaXIgPSBwYWlyLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgIGlmIChwYWlyWzBdID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwYWlyWzFdID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZHMgdG8ga25vdyB3aGF0IHRoZSBpbml0aWFsIGNsYXNzIHdhcyB0byByZW1vdmUgaXQgLSBmaXg/XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2JpbmRzW2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX2JpbmRzW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShwYWlyWzFdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9LFxuICBpbml0KCkge1xuICAgIC8vIEdldCBvcHRpb25zIGZyb20gZGF0YSBhdHRyaWJ1dGVzIG9uIG5vZGVcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ15kYXRhLScgKyB0aGlzLm5hbWUgKyAnLSguKiknLCAnaScpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy4kbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHRyID0gdGhpcy4kbm9kZS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoYXR0ci5ub2RlTmFtZSk7XG5cbiAgICAgIGlmIChtYXRjaGVzICE9IG51bGwgJiYgbWF0Y2hlcy5sZW5ndGggPj0gMikge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zW21hdGNoZXNbMV1dKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYElnbm9yaW5nICR7XG4gICAgICAgICAgICAgIG1hdGNoZXNbMV1cbiAgICAgICAgICAgIH0gb3B0aW9uLCBhcyBpdCBhbHJlYWR5IGV4aXN0cyBvbiB0aGUgJHtuYW1lfSBiZWhhdmlvci4gUGxlYXNlIGNob29zZSBhbm90aGVyIG5hbWUuYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcHRpb25zW21hdGNoZXNbMV1dID0gYXR0ci52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBCZWhhdmlvci1zcGVjaWZpYyBsaWZlY3ljbGVcbiAgICBpZiAodGhpcy5saWZlY3ljbGUuaW5pdCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5pbml0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGlmZWN5Y2xlLnJlc2l6ZWQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fX3Jlc2l6ZWRCaW5kID0gdGhpcy5fX3Jlc2l6ZWQuYmluZCh0aGlzKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemVkJywgdGhpcy5fX3Jlc2l6ZWRCaW5kKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saWZlY3ljbGUubWVkaWFRdWVyeVVwZGF0ZWQgIT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMubWVkaWEpIHtcbiAgICAgIHRoaXMuX19tZWRpYVF1ZXJ5VXBkYXRlZEJpbmQgPSB0aGlzLl9fbWVkaWFRdWVyeVVwZGF0ZWQuYmluZCh0aGlzKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZWRpYVF1ZXJ5VXBkYXRlZCcsIHRoaXMuX19tZWRpYVF1ZXJ5VXBkYXRlZEJpbmQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWVkaWEpIHtcbiAgICAgIHRoaXMuX190b2dnbGVFbmFibGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2ludGVyc2VjdGlvbnMoKTtcbiAgfSxcbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fX2lzRW5hYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgLy8gQmVoYXZpb3Itc3BlY2lmaWMgbGlmZWN5Y2xlXG4gICAgaWYgKHRoaXMubGlmZWN5Y2xlLmRlc3Ryb3kgIT0gbnVsbCkge1xuICAgICAgdGhpcy5saWZlY3ljbGUuZGVzdHJveS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxpZmVjeWNsZS5yZXNpemVkICE9IG51bGwpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemVkJywgdGhpcy5fX3Jlc2l6ZWRCaW5kKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saWZlY3ljbGUubWVkaWFRdWVyeVVwZGF0ZWQgIT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMubWVkaWEpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZWRpYVF1ZXJ5VXBkYXRlZCcsIHRoaXMuX19tZWRpYVF1ZXJ5VXBkYXRlZEJpbmQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxpZmVjeWNsZS5pbnRlcnNlY3Rpb25JbiAhPSBudWxsIHx8IHRoaXMubGlmZWN5Y2xlLmludGVyc2VjdGlvbk91dCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9faW50ZXJzZWN0aW9uT2JzZXJ2ZXIudW5vYnNlcnZlKHRoaXMuJG5vZGUpO1xuICAgICAgdGhpcy5fX2ludGVyc2VjdGlvbk9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBwdXJnZVByb3BlcnRpZXModGhpcyk7XG4gIH0sXG4gIGdldENoaWxkKGNoaWxkTmFtZSwgY29udGV4dCwgbXVsdGkgPSBmYWxzZSkge1xuICAgIGlmIChjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzLiRub2RlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fX2NoaWxkcmVuICE9IG51bGwgJiYgdGhpcy5fX2NoaWxkcmVuW2NoaWxkTmFtZV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19jaGlsZHJlbltjaGlsZE5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dFttdWx0aSA/ICdxdWVyeVNlbGVjdG9yQWxsJyA6ICdxdWVyeVNlbGVjdG9yJ10oXG4gICAgICAnW2RhdGEtJyArIHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJy0nICsgY2hpbGROYW1lLnRvTG93ZXJDYXNlKCkgKyAnXSdcbiAgICApO1xuICB9LFxuICBnZXRDaGlsZHJlbihjaGlsZE5hbWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDaGlsZChjaGlsZE5hbWUsIGNvbnRleHQsIHRydWUpO1xuICB9LFxuICBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19pc0VuYWJsZWQ7XG4gIH0sXG4gIGVuYWJsZSgpIHtcbiAgICB0aGlzLl9faXNFbmFibGVkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5saWZlY3ljbGUuZW5hYmxlZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5lbmFibGVkLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuX19pc0VuYWJsZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5saWZlY3ljbGUuZGlzYWJsZWQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5saWZlY3ljbGUuZGlzYWJsZWQuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG4gIGFkZFN1YkJlaGF2aW9yKFN1YkJlaGF2aW9yLCBub2RlID0gdGhpcy4kbm9kZSwgY29uZmlnID0ge30pIHtcbiAgICBjb25zdCBtYiA9IGV4cG9ydE9iajtcbiAgICBpZiAodHlwZW9mIFN1YkJlaGF2aW9yID09PSAnc3RyaW5nJykge1xuICAgICAgbWIuaW5pdEJlaGF2aW9yKFN1YkJlaGF2aW9yLCBub2RlLCBjb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYi5hZGQoU3ViQmVoYXZpb3IpO1xuICAgICAgbWIuaW5pdEJlaGF2aW9yKFN1YkJlaGF2aW9yLnByb3RvdHlwZS5iZWhhdmlvck5hbWUsIG5vZGUsIGNvbmZpZyk7XG4gICAgfVxuICB9LFxuICBpc0JyZWFrcG9pbnQoYnApIHtcbiAgICByZXR1cm4gaXNCcmVha3BvaW50KGJwLCB0aGlzLl9fYnJlYWtwb2ludHMpO1xuICB9LFxuICBfX3RvZ2dsZUVuYWJsZWQoKSB7XG4gICAgY29uc3QgaXNWYWxpZE1RID0gaXNCcmVha3BvaW50KHRoaXMub3B0aW9ucy5tZWRpYSwgdGhpcy5fX2JyZWFrcG9pbnRzKTtcbiAgICBpZiAoaXNWYWxpZE1RICYmICF0aGlzLl9faXNFbmFibGVkKSB7XG4gICAgICB0aGlzLmVuYWJsZSgpO1xuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRNUSAmJiB0aGlzLl9faXNFbmFibGVkKSB7XG4gICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICB9XG4gIH0sXG4gIF9fbWVkaWFRdWVyeVVwZGF0ZWQoZSkge1xuICAgIGlmICh0aGlzLmxpZmVjeWNsZS5tZWRpYVF1ZXJ5VXBkYXRlZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5tZWRpYVF1ZXJ5VXBkYXRlZC5jYWxsKHRoaXMsIGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm1lZGlhKSB7XG4gICAgICB0aGlzLl9fdG9nZ2xlRW5hYmxlZCgpO1xuICAgIH1cbiAgfSxcbiAgX19yZXNpemVkKGUpIHtcbiAgICBpZiAodGhpcy5saWZlY3ljbGUucmVzaXplZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5yZXNpemVkLmNhbGwodGhpcywgZSk7XG4gICAgfVxuICB9LFxuICBfX2ludGVyc2VjdGlvbnMoKSB7XG4gICAgaWYgKHRoaXMubGlmZWN5Y2xlLmludGVyc2VjdGlvbkluICE9IG51bGwgfHwgdGhpcy5saWZlY3ljbGUuaW50ZXJzZWN0aW9uT3V0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX19pbnRlcnNlY3Rpb25PYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihlbnRyaWVzID0+IHtcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICBpZiAoZW50cnkudGFyZ2V0ID09PSB0aGlzLiRub2RlKSB7XG4gICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgICAgaWYgKCF0aGlzLl9faXNJbnRlcnNlY3RpbmcgJiYgdGhpcy5saWZlY3ljbGUuaW50ZXJzZWN0aW9uSW4gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19pc0ludGVyc2VjdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5saWZlY3ljbGUuaW50ZXJzZWN0aW9uSW4uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX19pc0ludGVyc2VjdGluZyAmJiB0aGlzLmxpZmVjeWNsZS5pbnRlcnNlY3Rpb25PdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19pc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMubGlmZWN5Y2xlLmludGVyc2VjdGlvbk91dC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMub3B0aW9ucy5pbnRlcnNlY3Rpb25PcHRpb25zKTtcbiAgICAgIHRoaXMuX19pbnRlcnNlY3Rpb25PYnNlcnZlci5vYnNlcnZlKHRoaXMuJG5vZGUpO1xuICAgIH1cbiAgfVxufSk7XG5cbmNvbnN0IGNyZWF0ZUJlaGF2aW9yID0gKG5hbWUsIGRlZiwgbGlmZWN5Y2xlID0ge30pID0+IHtcbiAgY29uc3QgZm4gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgQmVoYXZpb3IuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG5cbiAgY29uc3QgY3VzdG9tTWV0aG9kTmFtZXMgPSBbXTtcblxuICBjb25zdCBjdXN0b21Qcm9wZXJ0aWVzID0ge1xuICAgIG5hbWU6IHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmVoYXZpb3JOYW1lO1xuICAgICAgfSxcbiAgICB9LFxuICAgIGJlaGF2aW9yTmFtZToge1xuICAgICAgdmFsdWU6IG5hbWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9LFxuICAgIGxpZmVjeWNsZToge1xuICAgICAgdmFsdWU6IGxpZmVjeWNsZSxcbiAgICB9LFxuICAgIGN1c3RvbU1ldGhvZE5hbWVzOiB7XG4gICAgICB2YWx1ZTogY3VzdG9tTWV0aG9kTmFtZXMsXG4gICAgfSxcbiAgfTtcblxuICAvLyBFeHBvc2UgdGhlIGRlZmluaXRpb24gcHJvcGVydGllcyBhcyAndGhpc1ttZXRob2ROYW1lXSdcbiAgY29uc3QgZGVmS2V5cyA9IE9iamVjdC5rZXlzKGRlZik7XG4gIGRlZktleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgIGN1c3RvbU1ldGhvZE5hbWVzLnB1c2goa2V5KTtcbiAgICBjdXN0b21Qcm9wZXJ0aWVzW2tleV0gPSB7XG4gICAgICB2YWx1ZTogZGVmW2tleV0sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9O1xuICB9KTtcblxuICBmbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJlaGF2aW9yLnByb3RvdHlwZSwgY3VzdG9tUHJvcGVydGllcyk7XG4gIHJldHVybiBmbjtcbn07XG5cbmxldCBvcHRpb25zID0ge1xuICBkYXRhQXR0cjogJ2JlaGF2aW9yJyxcbiAgbGF6eUF0dHI6ICdiZWhhdmlvci1sYXp5JyxcbiAgaW50ZXJzZWN0aW9uT3B0aW9uczoge1xuICAgIHJvb3RNYXJnaW46ICcyMCUnLFxuICB9LFxuICBicmVha3BvaW50czogWyd4cycsICdzbScsICdtZCcsICdsZycsICd4bCcsICd4eGwnXVxufTtcbmxldCBsb2FkZWRCZWhhdmlvck5hbWVzID0gW107XG5sZXQgb2JzZXJ2aW5nQmVoYXZpb3JzID0gZmFsc2U7XG5jb25zdCBsb2FkZWRCZWhhdmlvcnMgPSB7fTtcbmNvbnN0IGFjdGl2ZUJlaGF2aW9ycyA9IG5ldyBNYXAoKTtcbmNvbnN0IGJlaGF2aW9yc0F3YWl0aW5nSW1wb3J0ID0gbmV3IE1hcCgpO1xubGV0IGlvO1xuY29uc3QgaW9FbnRyaWVzID0gbmV3IE1hcCgpOyAvLyBuZWVkIHRvIGtlZXAgYSBzZXBhcmF0ZSBtYXAgb2YgaW50ZXJzZWN0aW9uIG9ic2VydmVyIGVudHJpZXMgYXMgYGlvLnRha2VSZWNvcmRzKClgIGFsd2F5cyByZXR1cm5zIGFuIGVtcHR5IGFycmF5LCBzZWVtcyBicm9rZW4gaW4gYWxsIGJyb3dzZXJzIPCfpLfwn4+74oCN4pmC77iPXG5jb25zdCBpbnRlcnNlY3RpbmcgPSBuZXcgTWFwKCk7XG5cbi8qXG4gIGdldEJlaGF2aW9yTmFtZXNcblxuICBEYXRhIGF0dHJpYnV0ZSBuYW1lcyBjYW4gYmUgd3JpdHRlbiBpbiBhbnkgY2FzZSxcbiAgYnV0IGBub2RlLmRhdGFzZXRgIG5hbWVzIGFyZSBsb3dlcmNhc2VcbiAgd2l0aCBjYW1lbCBjYXNpbmcgZm9yIG5hbWVzIHNwbGl0IGJ5IC1cbiAgZWc6IGBkYXRhLWZvby1iYXJgIGJlY29tZXMgYG5vZGUuZGF0YXNldC5mb29CYXJgXG5cbiAgYk5vZGUgLSBub2RlIHRvIGdyYWIgYmVoYXZpb3IgbmFtZXMgZnJvbVxuICBhdHRyIC0gbmFtZSBvZiBhdHRyaWJ1dGUgdG8gcGlja1xuKi9cbmZ1bmN0aW9uIGdldEJlaGF2aW9yTmFtZXMoYk5vZGUsIGF0dHIpIHtcbiAgYXR0ciA9IGF0dHIudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8tKFthLXpBLVowLTldKS9pZywgKG1hdGNoLCBwMSkgPT4ge1xuICAgIHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbiAgaWYgKGJOb2RlLmRhdGFzZXQgJiYgYk5vZGUuZGF0YXNldFthdHRyXSkge1xuICAgIHJldHVybiBiTm9kZS5kYXRhc2V0ICYmIGJOb2RlLmRhdGFzZXRbYXR0cl0gJiYgYk5vZGUuZGF0YXNldFthdHRyXS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG4vKlxuICBpbXBvcnRGYWlsZWRcblxuICBiTmFtZSAtIG5hbWUgb2YgYmVoYXZpb3IgdGhhdCBmYWlsZWQgdG8gaW1wb3J0XG5cbiAgRWl0aGVyIHRoZSBpbXBvcnRlZCBtb2R1bGUgZGlkbid0IGxvb2sgbGlrZSBhIGJlaGF2aW9yIG1vZHVsZVxuICBvciBub3RoaW5nIGNvdWxkIGJlIGZvdW5kIHRvIGltcG9ydFxuKi9cbmZ1bmN0aW9uIGltcG9ydEZhaWxlZChiTmFtZSkge1xuICAvLyByZW1vdmUgbmFtZSBmcm9tIGxvYWRlZCBiZWhhdmlvciBuYW1lcyBpbmRleFxuICAvLyBtYXliZSBpdCdsbCBiZSBpbmNsdWRlZCB2aWEgYSBzY3JpcHQgdGFnIGxhdGVyXG4gIGNvbnN0IGJOYW1lSW5kZXggPSBsb2FkZWRCZWhhdmlvck5hbWVzLmluZGV4T2YoYk5hbWUpO1xuICBpZiAoYk5hbWVJbmRleCA+IC0xKSB7XG4gICAgbG9hZGVkQmVoYXZpb3JOYW1lcy5zcGxpY2UoYk5hbWVJbmRleCwgMSk7XG4gIH1cbn1cblxuLypcbiAgZGVzdHJveUJlaGF2aW9yXG5cbiAgQWxsIGdvb2QgdGhpbmdzIG11c3QgY29tZSB0byBhbiBlbmQuLi5cbiAgT2sgc28gbGlrZWx5IHRoZSBub2RlIGhhcyBiZWVuIHJlbW92ZWQsIHBvc3NpYmx5IGJ5XG4gIGEgZGVsZXRpb24gb3IgYWpheCB0eXBlIHBhZ2UgY2hhbmdlXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yIHRvIGRlc3Ryb3lcbiAgYk5vZGUgLSBub2RlIHRvIGRlc3Ryb3kgYmVoYXZpb3Igb25cblxuICBgZGVzdHJveSgpYCBpcyBhbiBpbnRlcm5hbCBtZXRob2Qgb2YgYSBiZWhhdmlvclxuICBpbiBgY3JlYXRlQmVoYXZpb3JgLiBJbmRpdmlkdWFsIGJlaGF2aW9ycyBtYXlcbiAgYWxzbyBoYXZlIHRoZWlyIG93biBgZGVzdHJveWAgbWV0aG9kcyAoY2FsbGVkIGJ5XG4gIHRoZSBgY3JlYXRlQmVoYXZpb3JgIGBkZXN0cm95YClcbiovXG5mdW5jdGlvbiBkZXN0cm95QmVoYXZpb3IoYk5hbWUsIGJOb2RlKSB7XG4gIGNvbnN0IG5vZGVCZWhhdmlvcnMgPSBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKTtcbiAgaWYgKCFub2RlQmVoYXZpb3JzIHx8ICFub2RlQmVoYXZpb3JzW2JOYW1lXSkge1xuICAgIGNvbnNvbGUud2FybihgTm8gYmVoYXZpb3IgJyR7Yk5hbWV9JyBpbnN0YW5jZSBvbjpgLCBiTm9kZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHJ1biBkZXN0cm95IG1ldGhvZCwgcmVtb3ZlLCBkZWxldGVcbiAgbm9kZUJlaGF2aW9yc1tiTmFtZV0uZGVzdHJveSgpO1xuICBkZWxldGUgbm9kZUJlaGF2aW9yc1tiTmFtZV07XG4gIGlmIChPYmplY3Qua2V5cyhub2RlQmVoYXZpb3JzKS5sZW5ndGggPT09IDApIHtcbiAgICBhY3RpdmVCZWhhdmlvcnMuZGVsZXRlKGJOb2RlKTtcbiAgfVxufVxuXG4vKlxuICBkZXN0cm95QmVoYXZpb3JzXG5cbiAgck5vZGUgLSBub2RlIHRvIGRlc3Ryb3kgYmVoYXZpb3JzIG9uIChhbmQgaW5zaWRlIG9mKVxuXG4gIGlmIGEgbm9kZSB3aXRoIGJlaGF2aW9ycyBpcyByZW1vdmVkIGZyb20gdGhlIERPTSxcbiAgY2xlYW4gdXAgdG8gc2F2ZSByZXNvdXJjZXNcbiovXG5mdW5jdGlvbiBkZXN0cm95QmVoYXZpb3JzKHJOb2RlKSB7XG4gIGNvbnN0IGJOb2RlcyA9IEFycmF5LmZyb20oYWN0aXZlQmVoYXZpb3JzLmtleXMoKSk7XG4gIGJOb2Rlcy5wdXNoKHJOb2RlKTtcbiAgYk5vZGVzLmZvckVhY2goYk5vZGUgPT4ge1xuICAgIC8vIGlzIHRoZSBhY3RpdmUgbm9kZSB0aGUgcmVtb3ZlZCBub2RlXG4gICAgLy8gb3IgZG9lcyB0aGUgcmVtb3ZlZCBub2RlIGNvbnRhaW4gdGhlIGFjdGl2ZSBub2RlP1xuICAgIGlmIChyTm9kZSA9PT0gYk5vZGUgfHwgck5vZGUuY29udGFpbnMoYk5vZGUpKSB7XG4gICAgICAvLyBnZXQgYmVoYXZpb3JzIG9uIG5vZGVcbiAgICAgIGNvbnN0IGJOb2RlQWN0aXZlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSk7XG4gICAgICAvLyBpZiBzb21lLCBkZXN0cm95XG4gICAgICBpZiAoYk5vZGVBY3RpdmVCZWhhdmlvcnMpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoYk5vZGVBY3RpdmVCZWhhdmlvcnMpLmZvckVhY2goYk5hbWUgPT4ge1xuICAgICAgICAgIGRlc3Ryb3lCZWhhdmlvcihiTmFtZSwgYk5vZGUpO1xuICAgICAgICAgIC8vIHN0b3AgaW50ZXJzZWN0aW9uIG9ic2VydmVyIGZyb20gd2F0Y2hpbmcgbm9kZVxuICAgICAgICAgIGlvLnVub2JzZXJ2ZShiTm9kZSk7XG4gICAgICAgICAgaW9FbnRyaWVzLmRlbGV0ZShiTm9kZSk7XG4gICAgICAgICAgaW50ZXJzZWN0aW5nLmRlbGV0ZShiTm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qXG4gIGltcG9ydEJlaGF2aW9yXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yXG4gIGJOb2RlIC0gbm9kZSB0byBpbml0aWFsaXNlIGJlaGF2aW9yIG9uXG5cbiAgVXNlIGBpbXBvcnRgIHRvIGJyaW5nIGluIGEgYmVoYXZpb3IgbW9kdWxlIGFuZCBydW4gaXQuXG4gIFRoaXMgcnVucyBpZiB0aGVyZSBpcyBubyBsb2FkZWQgYmVoYXZpb3Igb2YgdGhpcyBuYW1lLlxuICBBZnRlciBpbXBvcnQsIHRoZSBiZWhhdmlvciBpcyBpbml0aWFsaXNlZCBvbiB0aGUgbm9kZVxuKi9cbmZ1bmN0aW9uIGltcG9ydEJlaGF2aW9yKGJOYW1lLCBiTm9kZSkge1xuICAvLyBmaXJzdCBjaGVjayB3ZSBoYXZlbid0IGFscmVhZHkgZ290IHRoaXMgYmVoYXZpb3IgbW9kdWxlXG4gIGlmIChsb2FkZWRCZWhhdmlvck5hbWVzLmluZGV4T2YoYk5hbWUpID4gLTEpIHtcbiAgICAvLyBpZiBubywgc3RvcmUgYSBsaXN0IG9mIG5vZGVzIGF3YWl0aW5nIHRoaXMgYmVoYXZpb3IgdG8gbG9hZFxuICAgIGNvbnN0IGF3YWl0aW5nSW1wb3J0ID0gYmVoYXZpb3JzQXdhaXRpbmdJbXBvcnQuZ2V0KGJOYW1lKSB8fCBbXTtcbiAgICBpZiAoIWF3YWl0aW5nSW1wb3J0LmluY2x1ZGVzKGJOb2RlKSkge1xuICAgICAgYXdhaXRpbmdJbXBvcnQucHVzaChiTm9kZSk7XG4gICAgfVxuICAgIGJlaGF2aW9yc0F3YWl0aW5nSW1wb3J0LnNldChiTmFtZSwgYXdhaXRpbmdJbXBvcnQpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBwdXNoIHRvIG91ciBzdG9yZSBvZiBsb2FkZWQgYmVoYXZpb3JzXG4gIGxvYWRlZEJlaGF2aW9yTmFtZXMucHVzaChiTmFtZSk7XG4gIC8vIGltcG9ydFxuICAvLyB3ZWJwYWNrIGludGVycHJldHMgdGhpcywgZG9lcyBzb21lIG1hZ2ljXG4gIC8vIHByb2Nlc3MuZW52IHZhcmlhYmxlcyBzZXQgaW4gd2VicGFjayBjb25maWdcbiAgdHJ5IHtcbiAgICBpbXBvcnQoYCR7cHJvY2Vzcy5lbnYuQkVIQVZJT1JTX1BBVEh9JHtwcm9jZXNzLmVudi5CRUhBVklPUlNfQ09NUE9ORU5UX1BBVEhTW2JOYW1lXXx8Jyd9JHtiTmFtZX0uJHtwcm9jZXNzLmVudi5CRUhBVklPUlNfRVhURU5TSU9OIH1gKS50aGVuKG1vZHVsZSA9PiB7XG4gICAgICBiZWhhdmlvckltcG9ydGVkKGJOYW1lLCBiTm9kZSwgbW9kdWxlKTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgY29uc29sZS53YXJuKGBObyBsb2FkZWQgYmVoYXZpb3IgY2FsbGVkOiAke2JOYW1lfWApO1xuICAgICAgLy8gZmFpbCwgY2xlYW4gdXBcbiAgICAgIGltcG9ydEZhaWxlZChiTmFtZSk7XG4gICAgfSk7XG4gIH0gY2F0Y2goZXJyMSkge1xuICAgIHRyeSB7XG4gICAgICBpbXBvcnQoYCR7cHJvY2Vzcy5lbnYuQkVIQVZJT1JTX1BBVEh9JHtiTmFtZX0uJHtwcm9jZXNzLmVudi5CRUhBVklPUlNfRVhURU5TSU9OfWApLnRoZW4obW9kdWxlID0+IHtcbiAgICAgICAgYmVoYXZpb3JJbXBvcnRlZChiTmFtZSwgYk5vZGUsIG1vZHVsZSk7XG4gICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oYE5vIGxvYWRlZCBiZWhhdmlvciBjYWxsZWQ6ICR7Yk5hbWV9YCk7XG4gICAgICAgIC8vIGZhaWwsIGNsZWFuIHVwXG4gICAgICAgIGltcG9ydEZhaWxlZChiTmFtZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoKGVycjIpIHtcbiAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBiZWhhdmlvciBjYWxsZWQ6ICR7Yk5hbWV9LiBcXG5JdCBtYXliZSB0aGUgYmVoYXZpb3IgZG9lc24ndCBleGlzdCwgY2hlY2sgZm9yIHR5cG9zIGFuZCBjaGVjayBXZWJwYWNrIGhhcyBnZW5lcmF0ZWQgeW91ciBmaWxlLiBcXG5Zb3UgbWlnaHQgYWxzbyB3YW50IHRvIGNoZWNrIHlvdXIgd2VicGFjayBjb25maWcgcGx1Z2lucyBEZWZpbmVQbHVnaW4gZm9yIHByb2Nlc3MuZW52LkJFSEFWSU9SU19FWFRFTlNJT04sIHByb2Nlc3MuZW52LkJFSEFWSU9SU19QQVRIIGFuZCBvciBwcm9jZXNzLmVudi5CRUhBVklPUlNfQ09NUE9ORU5UX1BBVEhTLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FyZWExNy9hMTctYmVoYXZpb3JzL3dpa2kvMDItU2V0dXAjd2VicGFja2NvbW1vbmpzYCk7XG4gICAgICAvLyBmYWlsLCBjbGVhbiB1cFxuICAgICAgaW1wb3J0RmFpbGVkKGJOYW1lKTtcbiAgICB9XG4gIH1cbn1cblxuLypcbiAgYmVoYXZpb3JJbXBvcnRlZFxuXG4gIGJOYW1lIC0gbmFtZSBvZiBiZWhhdmlvclxuICBiTm9kZSAtIG5vZGUgdG8gaW5pdGlhbGlzZSBiZWhhdmlvciBvblxuICBtb2R1bGUgLSBpbXBvcnRlZCBiZWhhdmlvciBtb2R1bGVcblxuICBSdW4gd2hlbiBhIGR5bmFtaWMgaW1wb3J0IGlzIHN1Y2Nlc3NmdWxseSBpbXBvcnRlZCxcbiAgc2V0cyB1cCBhbmQgcnVucyB0aGUgYmVoYXZpb3Igb24gdGhlIG5vZGVcbiovXG5mdW5jdGlvbiBiZWhhdmlvckltcG9ydGVkKGJOYW1lLCBiTm9kZSwgbW9kdWxlKSB7XG4gIC8vIGRvZXMgd2hhdCB3ZSBsb2FkZWQgbG9vayByaWdodD9cbiAgaWYgKG1vZHVsZS5kZWZhdWx0ICYmIHR5cGVvZiBtb2R1bGUuZGVmYXVsdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIGltcG9ydCBjb21wbGV0ZSwgZ28gZ28gZ29cbiAgICBsb2FkZWRCZWhhdmlvcnNbYk5hbWVdID0gbW9kdWxlLmRlZmF1bHQ7XG4gICAgaW5pdEJlaGF2aW9yKGJOYW1lLCBiTm9kZSk7XG4gICAgLy8gY2hlY2sgZm9yIG90aGVyIGluc3RhbmNlcyBvZiB0aGlzIGJlaGF2aW9yIHRoYXQgd2hlcmUgYXdhaXRpbmcgbG9hZFxuICAgIGlmIChiZWhhdmlvcnNBd2FpdGluZ0ltcG9ydC5nZXQoYk5hbWUpKSB7XG4gICAgICBiZWhhdmlvcnNBd2FpdGluZ0ltcG9ydC5nZXQoYk5hbWUpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGluaXRCZWhhdmlvcihiTmFtZSwgbm9kZSk7XG4gICAgICB9KTtcbiAgICAgIGJlaGF2aW9yc0F3YWl0aW5nSW1wb3J0LmRlbGV0ZShiTmFtZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybihgVHJpZWQgdG8gaW1wb3J0ICR7Yk5hbWV9LCBidXQgaXQgc2VlbXMgdG8gbm90IGJlIGEgYmVoYXZpb3JgKTtcbiAgICAvLyBmYWlsLCBjbGVhbiB1cFxuICAgIGltcG9ydEZhaWxlZChiTmFtZSk7XG4gIH1cbn1cblxuLypcbiAgY3JlYXRlQmVoYXZpb3JzXG5cbiAgbm9kZSAtIG5vZGUgdG8gY2hlY2sgZm9yIGJlaGF2aW9ycyBvbiBlbGVtZW50c1xuXG4gIGFzc2lnbiBiZWhhdmlvcnMgdG8gbm9kZXNcbiovXG5mdW5jdGlvbiBjcmVhdGVCZWhhdmlvcnMobm9kZSkge1xuICAvLyBJZ25vcmUgdGV4dCBvciBjb21tZW50IG5vZGVzXG4gIGlmICghKCdxdWVyeVNlbGVjdG9yQWxsJyBpbiBub2RlKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZpcnN0IGNoZWNrIGZvciBcImNyaXRpY2FsXCIgYmVoYXZpb3Igbm9kZXNcbiAgLy8gdGhlc2Ugd2lsbCBiZSBydW4gaW1tZWRpYXRlbHkgb24gZGlzY292ZXJ5XG4gIGNvbnN0IGJlaGF2aW9yTm9kZXMgPSBbbm9kZSwgLi4ubm9kZS5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS0ke29wdGlvbnMuZGF0YUF0dHJ9XWApXTtcbiAgYmVoYXZpb3JOb2Rlcy5mb3JFYWNoKGJOb2RlID0+IHtcbiAgICAvLyBhbiBlbGVtZW50IGNhbiBoYXZlIG11bHRpcGxlIGJlaGF2aW9yc1xuICAgIGNvbnN0IGJOYW1lcyA9IGdldEJlaGF2aW9yTmFtZXMoYk5vZGUsIG9wdGlvbnMuZGF0YUF0dHIpO1xuICAgIC8vIGxvb3AgdGhlbVxuICAgIGlmIChiTmFtZXMpIHtcbiAgICAgIGJOYW1lcy5mb3JFYWNoKGJOYW1lID0+IHtcbiAgICAgICAgaW5pdEJlaGF2aW9yKGJOYW1lLCBiTm9kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIG5vdyBjaGVjayBmb3IgXCJsYXp5XCIgYmVoYXZpb3JzXG4gIC8vIHRoZXNlIGFyZSB0cmlnZ2VyZWQgdmlhIGFuIGludGVyc2VjdGlvbiBvYnNlcnZlclxuICAvLyB0aGVzZSBoYXZlIG9wdGlvbmFsIGJyZWFrcG9pbnRzIGF0IHdoaWNoIHRvIHRyaWdnZXJcbiAgY29uc3QgbGF6eUJlaGF2aW9yTm9kZXMgPSBbbm9kZSwgLi4ubm9kZS5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS0ke29wdGlvbnMubGF6eUF0dHJ9XWApXTtcbiAgbGF6eUJlaGF2aW9yTm9kZXMuZm9yRWFjaChiTm9kZSA9PiB7XG4gICAgLy8gbG9vayBmb3IgbGF6eSBiZWhhdmlvciBuYW1lc1xuICAgIGNvbnN0IGJOYW1lcyA9IGdldEJlaGF2aW9yTmFtZXMoYk5vZGUsIG9wdGlvbnMubGF6eUF0dHIpO1xuICAgIGNvbnN0IGJNYXAgPSBuZXcgTWFwKCk7XG4gICAgYk5hbWVzLmZvckVhY2goYk5hbWUgPT4ge1xuICAgICAgLy8gY2hlY2sgZm9yIGEgbGF6eSBiZWhhdmlvciBicmVha3BvaW50IHRyaWdnZXJcbiAgICAgIGNvbnN0IGJlaGF2aW9yTWVkaWEgPSBiTm9kZS5kYXRhc2V0W2Ake2JOYW1lLnRvTG93ZXJDYXNlKCl9TGF6eW1lZGlhYF07XG4gICAgICAvLyBzdG9yZVxuICAgICAgYk1hcC5zZXQoYk5hbWUsIGJlaGF2aW9yTWVkaWEgfHwgZmFsc2UpO1xuICAgIH0pO1xuICAgIC8vIHN0b3JlIGFuZCBvYnNlcnZlXG4gICAgaWYgKGJOb2RlICE9PSBkb2N1bWVudCkge1xuICAgICAgaW9FbnRyaWVzLnNldChiTm9kZSwgYk1hcCk7XG4gICAgICBpbnRlcnNlY3Rpbmcuc2V0KGJOb2RlLCBmYWxzZSk7XG4gICAgICBpby5vYnNlcnZlKGJOb2RlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKlxuICBvYnNlcnZlQmVoYXZpb3JzXG5cbiAgcnVucyBhIGBNdXRhdGlvbk9ic2VydmVyYCwgd2hpY2ggd2F0Y2hlcyBmb3IgRE9NIGNoYW5nZXNcbiAgd2hlbiBhIERPTSBjaGFuZ2UgaGFwcGVucywgaW5zZXJ0aW9uIG9yIGRlbGV0aW9uLFxuICB0aGUgY2FsbCBiYWNrIHJ1bnMsIGluZm9ybWluZyB1cyBvZiB3aGF0IGNoYW5nZWRcbiovXG5mdW5jdGlvbiBvYnNlcnZlQmVoYXZpb3JzKCkge1xuICAvLyBmbGFnIHRvIHN0b3AgbXVsdGlwbGUgTXV0YXRpb25PYnNlcnZlclxuICBvYnNlcnZpbmdCZWhhdmlvcnMgPSB0cnVlO1xuICAvLyBzZXQgdXAgTXV0YXRpb25PYnNlcnZlclxuICBjb25zdCBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG11dGF0aW9ucyA9PiB7XG4gICAgLy8gcmVwb3J0IG9uIHdoYXQgY2hhbmdlZFxuICAgIG11dGF0aW9ucy5mb3JFYWNoKG11dGF0aW9uID0+IHtcbiAgICAgIG11dGF0aW9uLnJlbW92ZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBkZXN0cm95QmVoYXZpb3JzKG5vZGUpO1xuICAgICAgfSk7XG4gICAgICBtdXRhdGlvbi5hZGRlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNyZWF0ZUJlaGF2aW9ycyhub2RlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgLy8gb2JzZXJ2ZSBjaGFuZ2VzIHRvIHRoZSBlbnRpcmUgZG9jdW1lbnRcbiAgbW8ub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgIHN1YnRyZWU6IHRydWUsXG4gICAgYXR0cmlidXRlczogZmFsc2UsXG4gICAgY2hhcmFjdGVyRGF0YTogZmFsc2UsXG4gIH0pO1xufVxuXG4vKlxuICBsb29wTGF6eUJlaGF2aW9yTm9kZXNcblxuICBiTm9kZXMgLSBlbGVtZW50cyB0byBjaGVjayBmb3IgbGF6eSBiZWhhdmlvcnNcblxuICBMb29rcyBhdCB0aGUgbm9kZXMgdGhhdCBoYXZlIGxhenkgYmVoYXZpb3JzLCBjaGVja3NcbiAgaWYgdGhleSdyZSBpbnRlcnNlY3RpbmcsIG9wdGlvbmFsbHkgY2hlY2tzIHRoZSBicmVha3BvaW50XG4gIGFuZCBpbml0aWFsaXNlcyBpZiBuZWVkZWQuIENsZWFucyB1cCBhZnRlciBpdHNlbGYsIGJ5XG4gIHJlbW92aW5nIHRoZSBpbnRlcnNlY3Rpb24gb2JzZXJ2ZXIgb2JzZXJ2aW5nIG9mIHRoZSBub2RlXG4gIGlmIGFsbCBsYXp5IGJlaGF2aW9ycyBvbiBhIG5vZGUgaGF2ZSBiZWVuIGluaXRpYWxpc2VkXG4qL1xuXG5mdW5jdGlvbiBsb29wTGF6eUJlaGF2aW9yTm9kZXMoYk5vZGVzKSB7XG4gIGJOb2Rlcy5mb3JFYWNoKGJOb2RlID0+IHtcbiAgICAvLyBmaXJzdCwgY2hlY2sgaWYgdGhpcyBub2RlIGlzIGJlaW5nIGludGVyc2VjdGVkXG4gICAgaWYgKGludGVyc2VjdGluZy5nZXQoYk5vZGUpICE9PSB1bmRlZmluZWQgJiYgaW50ZXJzZWN0aW5nLmdldChiTm9kZSkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIG5vdyBjaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhbnkgbGF6eSBiZWhhdmlvciBuYW1lc1xuICAgIGxldCBsYXp5Qk5hbWVzID0gaW9FbnRyaWVzLmdldChiTm9kZSk7XG4gICAgaWYgKCFsYXp5Qk5hbWVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vXG4gICAgbGF6eUJOYW1lcy5mb3JFYWNoKChiTWVkaWEsIGJOYW1lKSA9PiB7XG4gICAgICAvLyBpZiBubyBsYXp5IGJlaGF2aW9yIGJyZWFrcG9pbnQgdHJpZ2dlcixcbiAgICAgIC8vIG9yIGlmIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbWF0Y2hlc1xuICAgICAgaWYgKCFiTWVkaWEgfHwgaXNCcmVha3BvaW50KGJNZWRpYSwgb3B0aW9ucy5icmVha3BvaW50cykpIHtcbiAgICAgICAgLy8gcnVuIGJlaGF2aW9yIG9uIG5vZGVcbiAgICAgICAgaW5pdEJlaGF2aW9yKGJOYW1lLCBiTm9kZSk7XG4gICAgICAgIC8vIHJlbW92ZSB0aGlzIGJlaGF2aW9yIGZyb20gdGhlIGxpc3Qgb2YgbGF6eSBiZWhhdmlvcnNcbiAgICAgICAgbGF6eUJOYW1lcy5kZWxldGUoYk5hbWUpO1xuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbm8gbW9yZSBsYXp5IGJlaGF2aW9ycyBsZWZ0IG9uIHRoZSBub2RlXG4gICAgICAgIC8vIHN0b3Agb2JzZXJ2aW5nIHRoZSBub2RlXG4gICAgICAgIC8vIGVsc2UgdXBkYXRlIHRoZSBpb0VudHJpZXNcbiAgICAgICAgaWYgKGxhenlCTmFtZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIGlvLnVub2JzZXJ2ZShiTm9kZSk7XG4gICAgICAgICAgaW9FbnRyaWVzLmRlbGV0ZShiTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW9FbnRyaWVzLnNldChiTm9kZSwgbGF6eUJOYW1lcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBlbmQgbG9vcExhenlCZWhhdmlvck5vZGVzIGJOb2RlcyBsb29wXG4gIH0pO1xufVxuXG4vKlxuICBpbnRlcnNlY3Rpb25cblxuICBlbnRyaWVzIC0gaW50ZXJzZWN0aW9uIG9ic2VydmVyIGVudHJpZXNcblxuICBUaGUgaW50ZXJzZWN0aW9uIG9ic2VydmVyIGNhbGwgYmFjayxcbiAgc2V0cyBhIHZhbHVlIGluIHRoZSBpbnRlcnNlY3RpbmcgbWFwIHRydWUvZmFsc2VcbiAgYW5kIGlmIGFuIGVudHJ5IGlzIGludGVyc2VjdGluZywgY2hlY2tzIGlmIG5lZWRzIHRvXG4gIGluaXQgYW55IGxhenkgYmVoYXZpb3JzXG4qL1xuZnVuY3Rpb24gaW50ZXJzZWN0aW9uKGVudHJpZXMpIHtcbiAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgIGludGVyc2VjdGluZy5zZXQoZW50cnkudGFyZ2V0LCB0cnVlKTtcbiAgICAgIGxvb3BMYXp5QmVoYXZpb3JOb2RlcyhbZW50cnkudGFyZ2V0XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludGVyc2VjdGluZy5zZXQoZW50cnkudGFyZ2V0LCBmYWxzZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLypcbiAgbWVkaWFRdWVyeVVwZGF0ZWRcblxuICBJZiBhIHJlc2l6ZSBoYXMgaGFwcGVuZWQgd2l0aCBlbm91Z2ggc2l6ZSB0aGF0IGFcbiAgYnJlYWtwb2ludCBoYXMgY2hhbmdlZCwgY2hlY2tzIHRvIHNlZSBpZiBhbnkgbGF6eVxuICBiZWhhdmlvcnMgbmVlZCB0byBiZSBpbml0aWFsaXNlZCBvciBub3RcbiovXG5mdW5jdGlvbiBtZWRpYVF1ZXJ5VXBkYXRlZCgpIHtcbiAgbG9vcExhenlCZWhhdmlvck5vZGVzKEFycmF5LmZyb20oaW9FbnRyaWVzLmtleXMoKSkpO1xufVxuXG5cbi8qIH5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fiBQdWJsaWMgbWV0aG9kcyAqL1xuXG4vKlxuICBpbml0QmVoYXZpb3JcblxuICBiTmFtZSAtIG5hbWUgb2YgYmVoYXZpb3JcbiAgYk5vZGUgLSBub2RlIHRvIGluaXRpYWxpc2UgYmVoYXZpb3Igb25cblxuICBJcyByZXR1cm5lZCBhcyBwdWJsaWMgbWV0aG9kXG5cbiAgUnVuIHRoZSBgaW5pdGAgbWV0aG9kIGluc2lkZSBvZiBhIGJlaGF2aW9yLFxuICB0aGUgaW50ZXJuYWwgb25lIGluIGBjcmVhdGVCZWhhdmlvcmAsIHdoaWNoIHRoZW5cbiAgcnVucyB0aGUgYmVoYXZpb3JzIGBpbml0YCBsaWZlIGN5Y2xlIG1ldGhvZFxuKi9cbmZ1bmN0aW9uIGluaXRCZWhhdmlvcihiTmFtZSwgYk5vZGUsIGNvbmZpZyA9IHt9KSB7XG4gIC8vIGZpcnN0IGNoZWNrIHdlIGhhdmUgYSBsb2FkZWQgYmVoYXZpb3JcbiAgaWYgKCFsb2FkZWRCZWhhdmlvcnNbYk5hbWVdKSB7XG4gICAgLy8gaWYgbm90LCBhdHRlbXB0IHRvIGltcG9ydCBpdFxuICAgIGltcG9ydEJlaGF2aW9yKGJOYW1lLCBiTm9kZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIG1lcmdlIGJyZWFrcG9pbnRzIGludG8gY29uZmlnXG4gIGNvbmZpZyA9IHtcbiAgICBicmVha3BvaW50czogb3B0aW9ucy5icmVha3BvaW50cyxcbiAgICAuLi5jb25maWdcbiAgfTtcbiAgLy8gbm93IGNoZWNrIHRoYXQgdGhpcyBiZWhhdmlvciBpc24ndCBhbHJlYWR5XG4gIC8vIHJ1bm5pbmcgb24gdGhpcyBub2RlXG4gIGNvbnN0IG5vZGVCZWhhdmlvcnMgPSBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKSB8fCB7fTtcbiAgaWYgKG5vZGVCZWhhdmlvcnMgPT09IHt9IHx8ICFub2RlQmVoYXZpb3JzW2JOYW1lXSkge1xuICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGxvYWRlZEJlaGF2aW9yc1tiTmFtZV0oYk5vZGUsIGNvbmZpZyk7XG4gICAgLy8gdXBkYXRlIGludGVybmFsIHN0b3JlIG9mIHdoYXRzIHJ1bm5pbmdcbiAgICBub2RlQmVoYXZpb3JzW2JOYW1lXSA9IGluc3RhbmNlO1xuICAgIGFjdGl2ZUJlaGF2aW9ycy5zZXQoYk5vZGUsIG5vZGVCZWhhdmlvcnMpO1xuICAgIC8vIGluaXQgbWV0aG9kIGluIHRoZSBiZWhhdmlvclxuICAgIGluc3RhbmNlLmluaXQoKTtcbiAgICAvL1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxufVxuXG4vKlxuICBhZGRCZWhhdmlvcnNcblxuICBiZWhhdmlvcnMgLSBiZWhhdmlvcnMgbW9kdWxlcywgbW9kdWxlIG9yIG9iamVjdFxuXG4gIElzIHJldHVybmVkIGFzIHB1YmxpYyBtZXRob2RcblxuICBDYW4gcGFzc1xuICAtIGEgc2luZ3VsYXIgYmVoYXZpb3IgYXMgY3JlYXRlZCBieSBgY3JlYXRlQmVoYXZpb3JgLFxuICAtIGEgYmVoYXZpb3Igb2JqZWN0IHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIGBjcmVhdGVCZWhhdmlvcmBcbiAgLSBhIGJlaGF2aW9yIG1vZHVsZVxuICAtIGEgY29sbGVjdGlvbiBvZiBiZWhhdmlvciBtb2R1bGVzXG5cbiAgQWRkcyBlYWNoIGJlaGF2aW9yIHRvIG1lbW9yeSwgdG8gYmUgaW5pdGlhbGlzZWQgdG8gYSBET00gbm9kZSB3aGVuIHRoZVxuICBjb3JyZXNwb25kaW5nIERPTSBub2RlIGV4aXN0c1xuKi9cbmZ1bmN0aW9uIGFkZEJlaGF2aW9ycyhiZWhhdmlvcnMpIHtcbiAgICAvLyBpZiBzaW5ndWxhciBiZWhhdmlvciBhZGRlZCwgc29ydCBpbnRvIG1vZHVsZSBsaWtlIHN0cnVjdHVyZVxuICAgIGlmICh0eXBlb2YgYmVoYXZpb3JzID09PSAnZnVuY3Rpb24nICYmIGJlaGF2aW9ycy5wcm90b3R5cGUuYmVoYXZpb3JOYW1lKSB7XG4gICAgICBiZWhhdmlvcnMgPSB7IFtiZWhhdmlvcnMucHJvdG90eXBlLmJlaGF2aW9yTmFtZV06IGJlaGF2aW9ycyB9O1xuICAgIH1cbiAgICAvLyBpZiBhbiB1bmNvbXBpbGVkIGJlaGF2aW9yIG9iamVjdCBpcyBwYXNzZWQsIGNyZWF0ZSBpdFxuICAgIGlmICh0eXBlb2YgYmVoYXZpb3JzID09PSAnc3RyaW5nJyAmJiBhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgYmVoYXZpb3JzID0geyBbYmVoYXZpb3JzXTogY3JlYXRlQmVoYXZpb3IoLi4uYXJndW1lbnRzKSB9O1xuICAgIH1cbiAgICAvLyBwcm9jZXNzXG4gICAgY29uc3QgdW5pcXVlID0gT2JqZWN0LmtleXMoYmVoYXZpb3JzKS5maWx0ZXIoKG8pID0+IGxvYWRlZEJlaGF2aW9yTmFtZXMuaW5kZXhPZihvKSA9PT0gLTEpO1xuICAgIGlmICh1bmlxdWUubGVuZ3RoKSB7XG4gICAgICAvLyB3ZSBoYXZlIG5ldyB1bmlxdWUgYmVoYXZpb3JzLCBzdG9yZSB0aGVtXG4gICAgICBsb2FkZWRCZWhhdmlvck5hbWVzID0gbG9hZGVkQmVoYXZpb3JOYW1lcy5jb25jYXQodW5pcXVlKTtcbiAgICAgIHVuaXF1ZS5mb3JFYWNoKGJOYW1lID0+IHtcbiAgICAgICAgbG9hZGVkQmVoYXZpb3JzW2JOYW1lXSA9IGJlaGF2aW9yc1tiTmFtZV07XG4gICAgICB9KTtcbiAgICAgIC8vIHRyeSBhbmQgYXBwbHkgYmVoYXZpb3JzIHRvIGFueSBET00gbm9kZSB0aGF0IG5lZWRzIHRoZW1cbiAgICAgIGNyZWF0ZUJlaGF2aW9ycyhkb2N1bWVudCk7XG4gICAgICAvLyBzdGFydCB0aGUgbXV0YXRpb24gb2JzZXJ2ZXIgbG9va2luZyBmb3IgRE9NIGNoYW5nZXNcbiAgICAgIGlmICghb2JzZXJ2aW5nQmVoYXZpb3JzKSB7XG4gICAgICAgIG9ic2VydmVCZWhhdmlvcnMoKTtcbiAgICAgIH1cbiAgICB9XG59XG5cbi8qXG4gIG5vZGVCZWhhdmlvcnNcblxuICBiTm9kZSAtIG5vZGUgb24gd2hpY2ggdG8gZ2V0IGFjdGl2ZSBiZWhhdmlvcnMgb25cblxuICBJcyByZXR1cm5lZCBhcyBwdWJsaWMgbWV0aG9kIHdoZW4gd2VicGFjayBpcyBzZXQgdG8gZGV2ZWxvcG1lbnQgbW9kZVxuXG4gIFJldHVybnMgYWxsIGFjdGl2ZSBiZWhhdmlvcnMgb24gYSBub2RlXG4qL1xuZnVuY3Rpb24gbm9kZUJlaGF2aW9ycyhiTm9kZSkge1xuICBjb25zdCBub2RlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSk7XG4gIGlmICghbm9kZUJlaGF2aW9ycykge1xuICAgIGNvbnNvbGUud2FybihgTm8gYmVoYXZpb3JzIG9uOmAsIGJOb2RlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbm9kZUJlaGF2aW9ycztcbiAgfVxufVxuXG4vKlxuICBiZWhhdmlvclByb3BlcnRpZXNcblxuICBiTmFtZSAtIG5hbWUgb2YgYmVoYXZpb3IgdG8gcmV0dXJuIHByb3BlcnRpZXMgb2ZcbiAgYk5vZGUgLSBub2RlIG9uIHdoaWNoIHRoZSBiZWhhdmlvciBpcyBydW5uaW5nXG5cbiAgSXMgcmV0dXJuZWQgYXMgcHVibGljIG1ldGhvZCB3aGVuIHdlYnBhY2sgaXMgc2V0IHRvIGRldmVsb3BtZW50IG1vZGVcblxuICBSZXR1cm5zIGFsbCBwcm9wZXJ0aWVzIG9mIGEgYmVoYXZpb3JcbiovXG5mdW5jdGlvbiBiZWhhdmlvclByb3BlcnRpZXMoYk5hbWUsIGJOb2RlKSB7XG4gIGNvbnN0IG5vZGVCZWhhdmlvcnMgPSBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKTtcbiAgaWYgKCFub2RlQmVoYXZpb3JzIHx8ICFub2RlQmVoYXZpb3JzW2JOYW1lXSkge1xuICAgIGNvbnNvbGUud2FybihgTm8gYmVoYXZpb3IgJyR7Yk5hbWV9JyBpbnN0YW5jZSBvbjpgLCBiTm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGFjdGl2ZUJlaGF2aW9ycy5nZXQoYk5vZGUpW2JOYW1lXTtcbiAgfVxufVxuXG4vKlxuICBiZWhhdmlvclByb3BcblxuICBiTmFtZSAtIG5hbWUgb2YgYmVoYXZpb3IgdG8gcmV0dXJuIHByb3BlcnRpZXMgb2ZcbiAgYk5vZGUgLSBub2RlIG9uIHdoaWNoIHRoZSBiZWhhdmlvciBpcyBydW5uaW5nXG4gIHByb3AgLSBwcm9wZXJ0eSB0byByZXR1cm4gb3Igc2V0XG4gIHZhbHVlIC0gdmFsdWUgdG8gc2V0XG5cbiAgSXMgcmV0dXJuZWQgYXMgcHVibGljIG1ldGhvZCB3aGVuIHdlYnBhY2sgaXMgc2V0IHRvIGRldmVsb3BtZW50IG1vZGVcblxuICBSZXR1cm5zIHNwZWNpZmljIHByb3BlcnR5IG9mIGEgYmVoYXZpb3Igb24gYSBub2RlLCBvciBydW5zIGEgbWV0aG9kXG4gIG9yIHNldHMgYSBwcm9wZXJ0eSBvbiBhIGJlaGF2aW9yIGlmIGEgdmFsdWUgaXMgc2V0LiBGb3IgZGVidWdnZ2luZy5cbiovXG5mdW5jdGlvbiBiZWhhdmlvclByb3AoYk5hbWUsIGJOb2RlLCBwcm9wLCB2YWx1ZSkge1xuICBjb25zdCBub2RlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSk7XG4gIGlmICghbm9kZUJlaGF2aW9ycyB8fCAhbm9kZUJlaGF2aW9yc1tiTmFtZV0pIHtcbiAgICBjb25zb2xlLndhcm4oYE5vIGJlaGF2aW9yICcke2JOYW1lfScgaW5zdGFuY2Ugb246YCwgYk5vZGUpO1xuICB9IGVsc2UgaWYgKGFjdGl2ZUJlaGF2aW9ycy5nZXQoYk5vZGUpW2JOYW1lXVtwcm9wXSkge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKVtiTmFtZV1bcHJvcF07XG4gICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSlbYk5hbWVdW3Byb3BdID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKVtiTmFtZV1bcHJvcF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUud2FybihgTm8gcHJvcGVydHkgJyR7cHJvcH0nIGluIGJlaGF2aW9yICcke2JOYW1lfScgaW5zdGFuY2Ugb246YCwgYk5vZGUpO1xuICB9XG59XG5cbi8qXG4gIGluaXRcblxuICBnZXRzIHRoaXMgc2hvdyBvbiB0aGUgcm9hZFxuXG4gIGxvYWRlZEJlaGF2aW9yc01vZHVsZSAtIG9wdGlvbmFsIGJlaGF2aW9ycyBtb2R1bGUgdG8gbG9hZCBvbiBpbml0XG4gIG9wdHMgLSBhbnkgb3B0aW9ucyBmb3IgdGhpcyBpbnN0YW5jZVxuKi9cblxuZnVuY3Rpb24gaW5pdChsb2FkZWRCZWhhdmlvcnNNb2R1bGUsIG9wdHMpIHtcbiAgb3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zLCAuLi5vcHRzXG4gIH07XG5cbiAgLy8gb24gcmVzaXplLCBjaGVja1xuICByZXNpemVkKCk7XG5cbiAgLy8gc2V0IHVwIGludGVyc2VjdGlvbiBvYnNlcnZlclxuICBpbyA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihpbnRlcnNlY3Rpb24sIG9wdGlvbnMuaW50ZXJzZWN0aW9uT3B0aW9ucyk7XG5cbiAgLy8gaWYgZm4gcnVuIHdpdGggc3VwcGxpZWQgYmVoYXZpb3JzLCBsZXRzIGFkZCB0aGVtIGFuZCBiZWdpblxuICBpZiAobG9hZGVkQmVoYXZpb3JzTW9kdWxlKSB7XG4gICAgYWRkQmVoYXZpb3JzKGxvYWRlZEJlaGF2aW9yc01vZHVsZSk7XG4gIH1cblxuICAvLyB3YXRjaCBmb3IgYnJlYWsgcG9pbnQgY2hhbmdlc1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVkaWFRdWVyeVVwZGF0ZWQnLCBtZWRpYVF1ZXJ5VXBkYXRlZCk7XG59XG5cbi8vIGV4cG9zZSBwdWJsaWMgbWV0aG9kcywgZXNzZW50aWFsbHkgcmV0dXJuaW5nXG5cbmxldCBleHBvcnRPYmogPSB7XG4gIGluaXQ6IGluaXQsXG4gIGFkZDogYWRkQmVoYXZpb3JzLFxuICBpbml0QmVoYXZpb3I6IGluaXRCZWhhdmlvcixcbiAgZ2V0IGN1cnJlbnRCcmVha3BvaW50KCkge1xuICAgIHJldHVybiBnZXRDdXJyZW50TWVkaWFRdWVyeSgpO1xuICB9XG59O1xuXG5pZiAocHJvY2Vzcy5lbnYuTU9ERSAmJiBwcm9jZXNzLmVudi5NT0RFID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRPYmosICdsb2FkZWQnLCB7XG4gICAgZ2V0OiAoKSA9PiB7XG4gICAgICByZXR1cm4gbG9hZGVkQmVoYXZpb3JOYW1lcztcbiAgICB9XG4gIH0pO1xuICBleHBvcnRPYmouYWN0aXZlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzO1xuICBleHBvcnRPYmouYWN0aXZlID0gYWN0aXZlQmVoYXZpb3JzO1xuICBleHBvcnRPYmouZ2V0QmVoYXZpb3JzID0gbm9kZUJlaGF2aW9ycztcbiAgZXhwb3J0T2JqLmdldFByb3BzID0gYmVoYXZpb3JQcm9wZXJ0aWVzO1xuICBleHBvcnRPYmouZ2V0UHJvcCA9IGJlaGF2aW9yUHJvcDtcbiAgZXhwb3J0T2JqLnNldFByb3AgPSBiZWhhdmlvclByb3A7XG4gIGV4cG9ydE9iai5jYWxsTWV0aG9kID0gYmVoYXZpb3JQcm9wO1xufVxuXG5leHBvcnQgeyBjcmVhdGVCZWhhdmlvciwgZXhwb3J0T2JqIGFzIG1hbmFnZUJlaGF2aW9ycyB9O1xuIiwidmFyIG1hcCA9IHtcblx0XCIuXCI6IFwiLi9ub2RlX21vZHVsZXMvQGFyZWExNy9hMTctYmVoYXZpb3JzL2Rpc3QvZXNtL2luZGV4LmpzXCIsXG5cdFwiLi9cIjogXCIuL25vZGVfbW9kdWxlcy9AYXJlYTE3L2ExNy1iZWhhdmlvcnMvZGlzdC9lc20vaW5kZXguanNcIixcblx0XCIuL2luZGV4XCI6IFwiLi9ub2RlX21vZHVsZXMvQGFyZWExNy9hMTctYmVoYXZpb3JzL2Rpc3QvZXNtL2luZGV4LmpzXCIsXG5cdFwiLi9pbmRleC5qc1wiOiBcIi4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbS9pbmRleC5qc1wiXG59O1xuXG5mdW5jdGlvbiB3ZWJwYWNrQXN5bmNDb250ZXh0KHJlcSkge1xuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhtYXAsIHJlcSkpIHtcblx0XHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXG5cdFx0dmFyIGlkID0gbWFwW3JlcV07XG5cdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oaWQpO1xuXHR9KTtcbn1cbndlYnBhY2tBc3luY0NvbnRleHQua2V5cyA9ICgpID0+IChPYmplY3Qua2V5cyhtYXApKTtcbndlYnBhY2tBc3luY0NvbnRleHQuaWQgPSBcIi4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbSBsYXp5IHJlY3Vyc2l2ZSBeLiouKi4qXFxcXC4uKiRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0FzeW5jQ29udGV4dDsiLCJ2YXIgbWFwID0ge1xuXHRcIi5cIjogXCIuL25vZGVfbW9kdWxlcy9AYXJlYTE3L2ExNy1iZWhhdmlvcnMvZGlzdC9lc20vaW5kZXguanNcIixcblx0XCIuL1wiOiBcIi4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbS9pbmRleC5qc1wiLFxuXHRcIi4vaW5kZXhcIjogXCIuL25vZGVfbW9kdWxlcy9AYXJlYTE3L2ExNy1iZWhhdmlvcnMvZGlzdC9lc20vaW5kZXguanNcIixcblx0XCIuL2luZGV4LmpzXCI6IFwiLi9ub2RlX21vZHVsZXMvQGFyZWExNy9hMTctYmVoYXZpb3JzL2Rpc3QvZXNtL2luZGV4LmpzXCJcbn07XG5cbmZ1bmN0aW9uIHdlYnBhY2tBc3luY0NvbnRleHQocmVxKSB7XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1hcCwgcmVxKSkge1xuXHRcdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgcmVxICsgXCInXCIpO1xuXHRcdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cblx0XHR2YXIgaWQgPSBtYXBbcmVxXTtcblx0XHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhpZCk7XG5cdH0pO1xufVxud2VicGFja0FzeW5jQ29udGV4dC5rZXlzID0gKCkgPT4gKE9iamVjdC5rZXlzKG1hcCkpO1xud2VicGFja0FzeW5jQ29udGV4dC5pZCA9IFwiLi9ub2RlX21vZHVsZXMvQGFyZWExNy9hMTctYmVoYXZpb3JzL2Rpc3QvZXNtIGxhenkgcmVjdXJzaXZlIF4uKi4qXFxcXC4uKiRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0FzeW5jQ29udGV4dDsiLCJleHBvcnQgeyBkZWZhdWx0IGFzIEFjY29yZGlvbiB9IGZyb20gJy4uLy4uLy4uL3ZpZXdzL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE1vZGFsIH0gZnJvbSAnLi4vLi4vLi4vdmlld3MvY29tcG9uZW50cy9tb2RhbC9tb2RhbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFZpZGVvQmFja2dyb3VuZCB9IGZyb20gJy4uLy4uLy4uL3ZpZXdzL2NvbXBvbmVudHMvdmlkZW8tYmFja2dyb3VuZC92aWRlby1iYWNrZ3JvdW5kJztcbiIsImltcG9ydCB7IG1hbmFnZUJlaGF2aW9ycyB9IGZyb20gJ0BhcmVhMTcvYTE3LWJlaGF2aW9ycyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvcnMgZnJvbSAnLi9iZWhhdmlvcnMnO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIG1hbmFnZUJlaGF2aW9ycyhCZWhhdmlvcnMsIHtcbiAgICAgICAgYnJlYWtwb2ludHM6IFsnc20nLCAnbWQnLCAnbGcnLCAneGwnLCAnMnhsJ11cbiAgICB9KTtcbn0pO1xuIiwiaW1wb3J0IHsgY3JlYXRlQmVoYXZpb3IgfSBmcm9tICdAYXJlYTE3L2ExNy1iZWhhdmlvcnMnO1xuXG5jb25zdCBBY2NvcmRpb24gPSBjcmVhdGVCZWhhdmlvcihcbiAgICAnQWNjb3JkaW9uJyxcbiAgICB7XG4gICAgICAgIHRvZ2dsZShlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZS5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1BY2NvcmRpb24taW5kZXgnKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2RhdGEuYWN0aXZlSW5kZXhlcy5pbmNsdWRlcyhpbmRleCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKGluZGV4KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEuYWN0aXZlSW5kZXhlcyA9IHRoaXMuX2RhdGEuYWN0aXZlSW5kZXhlcy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbSAhPT0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oaW5kZXgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEuYWN0aXZlSW5kZXhlcy5wdXNoKGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZShpbmRleCkge1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlVHJpZ2dlciA9IHRoaXMuJHRyaWdnZXJzW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZUljb24gPSB0aGlzLiR0cmlnZ2VySWNvbnNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlQ29udGVudCA9IHRoaXMuJGNvbnRlbnRzW2luZGV4XTtcblxuICAgICAgICAgICAgYWN0aXZlQ29udGVudC5zdHlsZS5oZWlnaHQgPSAnMHB4JztcblxuICAgICAgICAgICAgYWN0aXZlVHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIGFjdGl2ZUNvbnRlbnQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICAgICAgICBhY3RpdmVJY29uLmNsYXNzTGlzdC5yZW1vdmUoJ3JvdGF0ZS0xODAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuKGluZGV4KSB7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVUcmlnZ2VyID0gdGhpcy4kdHJpZ2dlcnNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlSWNvbiA9IHRoaXMuJHRyaWdnZXJJY29uc1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVDb250ZW50ID0gdGhpcy4kY29udGVudHNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlQ29udGVudElubmVyID0gdGhpcy4kY29udGVudElubmVyc1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBjb250ZW50SGVpZ2h0ID0gYWN0aXZlQ29udGVudElubmVyLm9mZnNldEhlaWdodDtcblxuICAgICAgICAgICAgYWN0aXZlQ29udGVudC5zdHlsZS5oZWlnaHQgPSBgJHtjb250ZW50SGVpZ2h0fXB4YDtcblxuICAgICAgICAgICAgYWN0aXZlVHJpZ2dlci5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICAgICAgYWN0aXZlQ29udGVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICBhY3RpdmVJY29uLmNsYXNzTGlzdC5hZGQoJ3JvdGF0ZS0xODAnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5hY3RpdmVJbmRleGVzID0gW107XG5cbiAgICAgICAgICAgIHRoaXMuJGluaXRPcGVuID0gdGhpcy5nZXRDaGlsZHJlbignaW5pdC1vcGVuJyk7XG4gICAgICAgICAgICB0aGlzLiR0cmlnZ2VycyA9IHRoaXMuZ2V0Q2hpbGRyZW4oJ3RyaWdnZXInKTtcbiAgICAgICAgICAgIHRoaXMuJHRyaWdnZXJJY29ucyA9IHRoaXMuZ2V0Q2hpbGRyZW4oJ3RyaWdnZXItaWNvbicpO1xuICAgICAgICAgICAgdGhpcy4kY29udGVudHMgPSB0aGlzLmdldENoaWxkcmVuKCdjb250ZW50Jyk7XG4gICAgICAgICAgICB0aGlzLiRjb250ZW50SW5uZXJzID0gdGhpcy5nZXRDaGlsZHJlbignY29udGVudC1pbm5lcicpO1xuXG4gICAgICAgICAgICB0aGlzLiR0cmlnZ2Vycy5mb3JFYWNoKCh0cmlnZ2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMudG9nZ2xlLCBmYWxzZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy4kaW5pdE9wZW4uZm9yRWFjaCgodHJpZ2dlcikgPT4ge1xuICAgICAgICAgICAgICAgIHRyaWdnZXIuY2xpY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBlbmFibGVkKCkge30sXG4gICAgICAgIHJlc2l6ZWQoKSB7fSxcbiAgICAgICAgbWVkaWFRdWVyeVVwZGF0ZWQoKSB7fSxcbiAgICAgICAgZGlzYWJsZWQoKSB7fSxcbiAgICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMuJHRyaWdnZXJzLmZvckVhY2goKHRyaWdnZXIpID0+IHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5leHBvcnQgZGVmYXVsdCBBY2NvcmRpb247XG4iLCJpbXBvcnQgeyBjcmVhdGVCZWhhdmlvciB9IGZyb20gJ0BhcmVhMTcvYTE3LWJlaGF2aW9ycyc7XG5pbXBvcnQgeyBkaXNhYmxlQm9keVNjcm9sbCwgZW5hYmxlQm9keVNjcm9sbCB9IGZyb20gJ2JvZHktc2Nyb2xsLWxvY2snO1xuaW1wb3J0ICogYXMgZm9jdXNUcmFwIGZyb20gJ2ZvY3VzLXRyYXAnO1xuXG5jb25zdCBNb2RhbCA9IGNyZWF0ZUJlaGF2aW9yKFxuICAgICdNb2RhbCcsXG4gICAge1xuICAgICAgICB0b2dnbGUoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fZGF0YS5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2UoZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RhdGEuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRub2RlLmNsYXNzTGlzdC5yZW1vdmUoLi4udGhpcy5fZGF0YS5hY3RpdmVDbGFzc2VzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhLmZvY3VzVHJhcC5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YS5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGVuYWJsZUJvZHlTY3JvbGwodGhpcy4kbm9kZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLiRub2RlLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdNb2RhbDpjbG9zZWQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3BlbigpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdNb2RhbDpjbG9zZUFsbCcpKTtcblxuICAgICAgICAgICAgdGhpcy4kbm9kZS5jbGFzc0xpc3QuYWRkKC4uLnRoaXMuX2RhdGEuYWN0aXZlQ2xhc3Nlcyk7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLmlzQWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YS5mb2N1c1RyYXAuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICBkaXNhYmxlQm9keVNjcm9sbCh0aGlzLiRub2RlKTtcbiAgICAgICAgICAgIH0sIDMwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlRXNjKGUpIHtcbiAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFuZGxlQ2xpY2tPdXRzaWRlKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5pZCA9PT0gdGhpcy4kbm9kZS5pZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkTGlzdGVuZXIoYXJyLCBmdW5jKSB7XG4gICAgICAgICAgICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcnJbaV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIoYXJyLCBmdW5jKSB7XG4gICAgICAgICAgICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcnJbaV0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy4kZm9jdXNUcmFwID0gdGhpcy5nZXRDaGlsZCgnZm9jdXMtdHJhcCcpO1xuICAgICAgICAgICAgdGhpcy4kY2xvc2VCdXR0b25zID0gdGhpcy5nZXRDaGlsZHJlbignY2xvc2UtdHJpZ2dlcicpO1xuICAgICAgICAgICAgdGhpcy4kaW5pdGlhbEZvY3VzID0gdGhpcy5nZXRDaGlsZCgnaW5pdGlhbC1mb2N1cycpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuJGluaXRpYWxGb2N1cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgJ05vIGluaXRpYWwgZm9jdXMgZWxlbWVudCBmb3VuZC4gQWRkIGEgYGgxYCB3aXRoIHRoZSBhdHRyaWJ1dGUgYGRhdGEtTW9kYWwtaW5pdGlhbC1mb2N1c2AuIFRoZSBgaDFgIHNob3VsZCBhbHNvIGhhdmUgYW4gaWQgdGhhdCBtYXRjaGVzIHRoZSBtb2RhbCBpZCB3aXRoIGBfdGl0bGVgIGFwcGVuZGVkJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2RhdGEuZm9jdXNUcmFwID0gZm9jdXNUcmFwLmNyZWF0ZUZvY3VzVHJhcCh0aGlzLiRmb2N1c1RyYXAsIHtcbiAgICAgICAgICAgICAgICBpbml0aWFsRm9jdXM6IHRoaXMuJGluaXRpYWxGb2N1c1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2RhdGEuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEuYWN0aXZlQ2xhc3NlcyA9IFsnYTE3LXRyYW5zLXNob3ctaGlkZS0tYWN0aXZlJ107XG5cbiAgICAgICAgICAgIGlmICh0aGlzLiRjbG9zZUJ1dHRvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZExpc3RlbmVyKHRoaXMuJGNsb3NlQnV0dG9ucywgdGhpcy5jbG9zZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignTW9kYWw6dG9nZ2xlJywgdGhpcy50b2dnbGUsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuJG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignTW9kYWw6b3BlbicsIHRoaXMub3BlbiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kbm9kZS5hZGRFdmVudExpc3RlbmVyKCdNb2RhbDpjbG9zZScsIHRoaXMuY2xvc2UsIGZhbHNlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ01vZGFsOmNsb3NlQWxsJywgdGhpcy5jbG9zZSwgZmFsc2UpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuaGFuZGxlRXNjLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIC8vIGFkZCBsaXN0ZW5lciB0byBtb2RhbCB0b2dnbGUgYnV0dG9uc1xuICAgICAgICAgICAgY29uc3QgbW9kYWxJZCA9IHRoaXMuJG5vZGUuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgICAgICAgICAgdGhpcy4kdHJpZ2dlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgIGBbZGF0YS1tb2RhbC10YXJnZXQ9XCIjJHttb2RhbElkfVwiXWBcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIodGhpcy4kdHJpZ2dlcnMsIHRoaXMudG9nZ2xlKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uc1sncGFuZWwnXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGlja091dHNpZGUsXG4gICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW5hYmxlZCgpIHt9LFxuICAgICAgICByZXNpemVkKCkge30sXG4gICAgICAgIG1lZGlhUXVlcnlVcGRhdGVkKCkge1xuICAgICAgICAgICAgLy8gY3VycmVudCBtZWRpYSBxdWVyeSBpczogQTE3LmN1cnJlbnRNZWRpYVF1ZXJ5XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2FibGVkKCkge30sXG4gICAgICAgIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLiRjbG9zZUJ1dHRvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHRoaXMuJGNsb3NlQnV0dG9ucywgdGhpcy5jbG9zZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuJG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignTW9kYWw6dG9nZ2xlJywgdGhpcy50b2dnbGUpO1xuICAgICAgICAgICAgdGhpcy4kbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdNb2RhbDpvcGVuJywgdGhpcy5vcGVuKTtcbiAgICAgICAgICAgIHRoaXMuJG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignTW9kYWw6Y2xvc2UnLCB0aGlzLmNsb3NlKTtcbiAgICAgICAgICAgIHRoaXMuJG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrT3V0c2lkZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdNb2RhbDpjbG9zZUFsbCcsIHRoaXMuY2xvc2UpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuaGFuZGxlRXNjKTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0aGlzLiR0cmlnZ2VycywgdGhpcy50b2dnbGUpO1xuICAgICAgICB9XG4gICAgfVxuKTtcblxuZXhwb3J0IGRlZmF1bHQgTW9kYWw7XG4iLCJpbXBvcnQgeyBjcmVhdGVCZWhhdmlvciB9IGZyb20gJ0BhcmVhMTcvYTE3LWJlaGF2aW9ycyc7XG5cbmNvbnN0IFZpZGVvQmFja2dyb3VuZCA9IGNyZWF0ZUJlaGF2aW9yKFxuICAgICdWaWRlb0JhY2tncm91bmQnLFxuICAgIHtcbiAgICAgICAgdG9nZ2xlKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYodGhpcy5pc1BsYXlpbmcpe1xuICAgICAgICAgICAgICAgIHRoaXMuJHBsYXllci5wYXVzZSgpO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgdGhpcy4kcGxheWVyLnBsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy51cGRhdGVCdXR0b24oKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlUGxheShlKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZVBhdXNlKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZUJ1dHRvbigpe1xuICAgICAgICAgICAgY29uc3QgYnV0dG9uVGV4dCA9IHRoaXMuaXNQbGF5aW5nID8gdGhpcy5idXR0b25UZXh0LnBsYXkgOiB0aGlzLmJ1dHRvblRleHQucGF1c2U7XG5cbiAgICAgICAgICAgIHRoaXMuJHBhdXNlQnV0dG9uLmlubmVyVGV4dCA9IGJ1dHRvblRleHQ7XG4gICAgICAgICAgICB0aGlzLiRwYXVzZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCBidXR0b25UZXh0KTtcbiAgICAgICAgICAgIHRoaXMuJHBhdXNlQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgdGhpcy5pc1BsYXlpbmcudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvblRleHQgPSB7XG4gICAgICAgICAgICAgICAgcGxheTogdGhpcy5vcHRpb25zWyd0ZXh0LXBsYXknXSxcbiAgICAgICAgICAgICAgICBwYXVzZTogdGhpcy5vcHRpb25zWyd0ZXh0LXBhdXNlJ10sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLiRwbGF5ZXIgPSB0aGlzLmdldENoaWxkKCdwbGF5ZXInKTtcbiAgICAgICAgICAgIHRoaXMuJHBhdXNlQnV0dG9uID0gdGhpcy5nZXRDaGlsZCgnY29udHJvbHMnKS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKTtcblxuICAgICAgICAgICAgdGhpcy4kcGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCB0aGlzLmhhbmRsZVBsYXksIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuJHBsYXllci5hZGRFdmVudExpc3RlbmVyKCdwYXVzZScsIHRoaXMuaGFuZGxlUGF1c2UsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuJHBhdXNlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGUsIGZhbHNlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5hYmxlZCgpIHt9LFxuICAgICAgICByZXNpemVkKCkge30sXG4gICAgICAgIG1lZGlhUXVlcnlVcGRhdGVkKCkge30sXG4gICAgICAgIGRpc2FibGVkKCkge30sXG4gICAgICAgIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICB0aGlzLiRwbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGxheScsIHRoaXMuaGFuZGxlUGxheSk7XG4gICAgICAgICAgICB0aGlzLiRwbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGF1c2UnLCB0aGlzLmhhbmRsZVBhdXNlKTtcbiAgICAgICAgICAgIHRoaXMuJHBhdXNlQnV0dG9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGUpO1xuICAgICAgICB9XG4gICAgfVxuKTtcblxuZXhwb3J0IGRlZmF1bHQgVmlkZW9CYWNrZ3JvdW5kO1xuIiwiZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8vIE9sZGVyIGJyb3dzZXJzIGRvbid0IHN1cHBvcnQgZXZlbnQgb3B0aW9ucywgZmVhdHVyZSBkZXRlY3QgaXQuXG5cbi8vIEFkb3B0ZWQgYW5kIG1vZGlmaWVkIHNvbHV0aW9uIGZyb20gQm9oZGFuIERpZHVraCAoMjAxNylcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQxNTk0OTk3L2lvcy0xMC1zYWZhcmktcHJldmVudC1zY3JvbGxpbmctYmVoaW5kLWEtZml4ZWQtb3ZlcmxheS1hbmQtbWFpbnRhaW4tc2Nyb2xsLXBvc2lcblxudmFyIGhhc1Bhc3NpdmVFdmVudHMgPSBmYWxzZTtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB2YXIgcGFzc2l2ZVRlc3RPcHRpb25zID0ge1xuICAgIGdldCBwYXNzaXZlKCkge1xuICAgICAgaGFzUGFzc2l2ZUV2ZW50cyA9IHRydWU7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlJywgbnVsbCwgcGFzc2l2ZVRlc3RPcHRpb25zKTtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlJywgbnVsbCwgcGFzc2l2ZVRlc3RPcHRpb25zKTtcbn1cblxudmFyIGlzSW9zRGV2aWNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICYmICgvaVAoYWR8aG9uZXxvZCkvLnRlc3Qod2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSkgfHwgd2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyAmJiB3aW5kb3cubmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMSk7XG5cblxudmFyIGxvY2tzID0gW107XG52YXIgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gZmFsc2U7XG52YXIgaW5pdGlhbENsaWVudFkgPSAtMTtcbnZhciBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPSB2b2lkIDA7XG52YXIgcHJldmlvdXNCb2R5UG9zaXRpb24gPSB2b2lkIDA7XG52YXIgcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ID0gdm9pZCAwO1xuXG4vLyByZXR1cm5zIHRydWUgaWYgYGVsYCBzaG91bGQgYmUgYWxsb3dlZCB0byByZWNlaXZlIHRvdWNobW92ZSBldmVudHMuXG52YXIgYWxsb3dUb3VjaE1vdmUgPSBmdW5jdGlvbiBhbGxvd1RvdWNoTW92ZShlbCkge1xuICByZXR1cm4gbG9ja3Muc29tZShmdW5jdGlvbiAobG9jaykge1xuICAgIGlmIChsb2NrLm9wdGlvbnMuYWxsb3dUb3VjaE1vdmUgJiYgbG9jay5vcHRpb25zLmFsbG93VG91Y2hNb3ZlKGVsKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn07XG5cbnZhciBwcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KHJhd0V2ZW50KSB7XG4gIHZhciBlID0gcmF3RXZlbnQgfHwgd2luZG93LmV2ZW50O1xuXG4gIC8vIEZvciB0aGUgY2FzZSB3aGVyZWJ5IGNvbnN1bWVycyBhZGRzIGEgdG91Y2htb3ZlIGV2ZW50IGxpc3RlbmVyIHRvIGRvY3VtZW50LlxuICAvLyBSZWNhbGwgdGhhdCB3ZSBkbyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBwcmV2ZW50RGVmYXVsdCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICAvLyBpbiBkaXNhYmxlQm9keVNjcm9sbCAtIHNvIGlmIHdlIHByb3ZpZGUgdGhpcyBvcHBvcnR1bml0eSB0byBhbGxvd1RvdWNoTW92ZSwgdGhlblxuICAvLyB0aGUgdG91Y2htb3ZlIGV2ZW50IG9uIGRvY3VtZW50IHdpbGwgYnJlYWsuXG4gIGlmIChhbGxvd1RvdWNoTW92ZShlLnRhcmdldCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIERvIG5vdCBwcmV2ZW50IGlmIHRoZSBldmVudCBoYXMgbW9yZSB0aGFuIG9uZSB0b3VjaCAodXN1YWxseSBtZWFuaW5nIHRoaXMgaXMgYSBtdWx0aSB0b3VjaCBnZXN0dXJlIGxpa2UgcGluY2ggdG8gem9vbSkuXG4gIGlmIChlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuIHRydWU7XG5cbiAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgc2V0T3ZlcmZsb3dIaWRkZW4gPSBmdW5jdGlvbiBzZXRPdmVyZmxvd0hpZGRlbihvcHRpb25zKSB7XG4gIC8vIElmIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCBpcyBhbHJlYWR5IHNldCwgZG9uJ3Qgc2V0IGl0IGFnYWluLlxuICBpZiAocHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgX3Jlc2VydmVTY3JvbGxCYXJHYXAgPSAhIW9wdGlvbnMgJiYgb3B0aW9ucy5yZXNlcnZlU2Nyb2xsQmFyR2FwID09PSB0cnVlO1xuICAgIHZhciBzY3JvbGxCYXJHYXAgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgIGlmIChfcmVzZXJ2ZVNjcm9sbEJhckdhcCAmJiBzY3JvbGxCYXJHYXAgPiAwKSB7XG4gICAgICB2YXIgY29tcHV0ZWRCb2R5UGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpLCAxMCk7XG4gICAgICBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodDtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gY29tcHV0ZWRCb2R5UGFkZGluZ1JpZ2h0ICsgc2Nyb2xsQmFyR2FwICsgJ3B4JztcbiAgICB9XG4gIH1cblxuICAvLyBJZiBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgaXMgYWxyZWFkeSBzZXQsIGRvbid0IHNldCBpdCBhZ2Fpbi5cbiAgaWYgKHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nID0gZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdztcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gIH1cbn07XG5cbnZhciByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nID0gZnVuY3Rpb24gcmVzdG9yZU92ZXJmbG93U2V0dGluZygpIHtcbiAgaWYgKHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQ7XG5cbiAgICAvLyBSZXN0b3JlIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCB0byB1bmRlZmluZWQgc28gc2V0T3ZlcmZsb3dIaWRkZW4ga25vd3MgaXRcbiAgICAvLyBjYW4gYmUgc2V0IGFnYWluLlxuICAgIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmIChwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmc7XG5cbiAgICAvLyBSZXN0b3JlIHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyB0byB1bmRlZmluZWRcbiAgICAvLyBzbyBzZXRPdmVyZmxvd0hpZGRlbiBrbm93cyBpdCBjYW4gYmUgc2V0IGFnYWluLlxuICAgIHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyA9IHVuZGVmaW5lZDtcbiAgfVxufTtcblxudmFyIHNldFBvc2l0aW9uRml4ZWQgPSBmdW5jdGlvbiBzZXRQb3NpdGlvbkZpeGVkKCkge1xuICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgLy8gSWYgcHJldmlvdXNCb2R5UG9zaXRpb24gaXMgYWxyZWFkeSBzZXQsIGRvbid0IHNldCBpdCBhZ2Fpbi5cbiAgICBpZiAocHJldmlvdXNCb2R5UG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJldmlvdXNCb2R5UG9zaXRpb24gPSB7XG4gICAgICAgIHBvc2l0aW9uOiBkb2N1bWVudC5ib2R5LnN0eWxlLnBvc2l0aW9uLFxuICAgICAgICB0b3A6IGRvY3VtZW50LmJvZHkuc3R5bGUudG9wLFxuICAgICAgICBsZWZ0OiBkb2N1bWVudC5ib2R5LnN0eWxlLmxlZnRcbiAgICAgIH07XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZG9tIGluc2lkZSBhbiBhbmltYXRpb24gZnJhbWUgXG4gICAgICB2YXIgX3dpbmRvdyA9IHdpbmRvdyxcbiAgICAgICAgICBzY3JvbGxZID0gX3dpbmRvdy5zY3JvbGxZLFxuICAgICAgICAgIHNjcm9sbFggPSBfd2luZG93LnNjcm9sbFgsXG4gICAgICAgICAgaW5uZXJIZWlnaHQgPSBfd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudG9wID0gLXNjcm9sbFk7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmxlZnQgPSAtc2Nyb2xsWDtcblxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBBdHRlbXB0IHRvIGNoZWNrIGlmIHRoZSBib3R0b20gYmFyIGFwcGVhcmVkIGR1ZSB0byB0aGUgcG9zaXRpb24gY2hhbmdlXG4gICAgICAgICAgdmFyIGJvdHRvbUJhckhlaWdodCA9IGlubmVySGVpZ2h0IC0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICAgIGlmIChib3R0b21CYXJIZWlnaHQgJiYgc2Nyb2xsWSA+PSBpbm5lckhlaWdodCkge1xuICAgICAgICAgICAgLy8gTW92ZSB0aGUgY29udGVudCBmdXJ0aGVyIHVwIHNvIHRoYXQgdGhlIGJvdHRvbSBiYXIgZG9lc24ndCBoaWRlIGl0XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnRvcCA9IC0oc2Nyb2xsWSArIGJvdHRvbUJhckhlaWdodCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMCk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciByZXN0b3JlUG9zaXRpb25TZXR0aW5nID0gZnVuY3Rpb24gcmVzdG9yZVBvc2l0aW9uU2V0dGluZygpIHtcbiAgaWYgKHByZXZpb3VzQm9keVBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBDb252ZXJ0IHRoZSBwb3NpdGlvbiBmcm9tIFwicHhcIiB0byBJbnRcbiAgICB2YXIgeSA9IC1wYXJzZUludChkb2N1bWVudC5ib2R5LnN0eWxlLnRvcCwgMTApO1xuICAgIHZhciB4ID0gLXBhcnNlSW50KGRvY3VtZW50LmJvZHkuc3R5bGUubGVmdCwgMTApO1xuXG4gICAgLy8gUmVzdG9yZSBzdHlsZXNcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBvc2l0aW9uID0gcHJldmlvdXNCb2R5UG9zaXRpb24ucG9zaXRpb247XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS50b3AgPSBwcmV2aW91c0JvZHlQb3NpdGlvbi50b3A7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5sZWZ0ID0gcHJldmlvdXNCb2R5UG9zaXRpb24ubGVmdDtcblxuICAgIC8vIFJlc3RvcmUgc2Nyb2xsXG4gICAgd2luZG93LnNjcm9sbFRvKHgsIHkpO1xuXG4gICAgcHJldmlvdXNCb2R5UG9zaXRpb24gPSB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L3Njcm9sbEhlaWdodCNQcm9ibGVtc19hbmRfc29sdXRpb25zXG52YXIgaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkID0gZnVuY3Rpb24gaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkKHRhcmdldEVsZW1lbnQpIHtcbiAgcmV0dXJuIHRhcmdldEVsZW1lbnQgPyB0YXJnZXRFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRhcmdldEVsZW1lbnQuc2Nyb2xsVG9wIDw9IHRhcmdldEVsZW1lbnQuY2xpZW50SGVpZ2h0IDogZmFsc2U7XG59O1xuXG52YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGV2ZW50LCB0YXJnZXRFbGVtZW50KSB7XG4gIHZhciBjbGllbnRZID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZIC0gaW5pdGlhbENsaWVudFk7XG5cbiAgaWYgKGFsbG93VG91Y2hNb3ZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGFyZ2V0RWxlbWVudCAmJiB0YXJnZXRFbGVtZW50LnNjcm9sbFRvcCA9PT0gMCAmJiBjbGllbnRZID4gMCkge1xuICAgIC8vIGVsZW1lbnQgaXMgYXQgdGhlIHRvcCBvZiBpdHMgc2Nyb2xsLlxuICAgIHJldHVybiBwcmV2ZW50RGVmYXVsdChldmVudCk7XG4gIH1cblxuICBpZiAoaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkKHRhcmdldEVsZW1lbnQpICYmIGNsaWVudFkgPCAwKSB7XG4gICAgLy8gZWxlbWVudCBpcyBhdCB0aGUgYm90dG9tIG9mIGl0cyBzY3JvbGwuXG4gICAgcmV0dXJuIHByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgfVxuXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmV4cG9ydCB2YXIgZGlzYWJsZUJvZHlTY3JvbGwgPSBmdW5jdGlvbiBkaXNhYmxlQm9keVNjcm9sbCh0YXJnZXRFbGVtZW50LCBvcHRpb25zKSB7XG4gIC8vIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZFxuICBpZiAoIXRhcmdldEVsZW1lbnQpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoJ2Rpc2FibGVCb2R5U2Nyb2xsIHVuc3VjY2Vzc2Z1bCAtIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZCB3aGVuIGNhbGxpbmcgZGlzYWJsZUJvZHlTY3JvbGwgb24gSU9TIGRldmljZXMuJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZGlzYWJsZUJvZHlTY3JvbGwgbXVzdCBub3QgaGF2ZSBiZWVuIGNhbGxlZCBvbiB0aGlzIHRhcmdldEVsZW1lbnQgYmVmb3JlXG4gIGlmIChsb2Nrcy5zb21lKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgcmV0dXJuIGxvY2sudGFyZ2V0RWxlbWVudCA9PT0gdGFyZ2V0RWxlbWVudDtcbiAgfSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbG9jayA9IHtcbiAgICB0YXJnZXRFbGVtZW50OiB0YXJnZXRFbGVtZW50LFxuICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge31cbiAgfTtcblxuICBsb2NrcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkobG9ja3MpLCBbbG9ja10pO1xuXG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIHNldFBvc2l0aW9uRml4ZWQoKTtcbiAgfSBlbHNlIHtcbiAgICBzZXRPdmVyZmxvd0hpZGRlbihvcHRpb25zKTtcbiAgfVxuXG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIHRhcmdldEVsZW1lbnQub250b3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gZGV0ZWN0IHNpbmdsZSB0b3VjaC5cbiAgICAgICAgaW5pdGlhbENsaWVudFkgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2htb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gZGV0ZWN0IHNpbmdsZSB0b3VjaC5cbiAgICAgICAgaGFuZGxlU2Nyb2xsKGV2ZW50LCB0YXJnZXRFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFkb2N1bWVudExpc3RlbmVyQWRkZWQpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBoYXNQYXNzaXZlRXZlbnRzID8geyBwYXNzaXZlOiBmYWxzZSB9IDogdW5kZWZpbmVkKTtcbiAgICAgIGRvY3VtZW50TGlzdGVuZXJBZGRlZCA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgdmFyIGNsZWFyQWxsQm9keVNjcm9sbExvY2tzID0gZnVuY3Rpb24gY2xlYXJBbGxCb2R5U2Nyb2xsTG9ja3MoKSB7XG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIC8vIENsZWFyIGFsbCBsb2NrcyBvbnRvdWNoc3RhcnQvb250b3VjaG1vdmUgaGFuZGxlcnMsIGFuZCB0aGUgcmVmZXJlbmNlcy5cbiAgICBsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgICBsb2NrLnRhcmdldEVsZW1lbnQub250b3VjaHN0YXJ0ID0gbnVsbDtcbiAgICAgIGxvY2sudGFyZ2V0RWxlbWVudC5vbnRvdWNobW92ZSA9IG51bGw7XG4gICAgfSk7XG5cbiAgICBpZiAoZG9jdW1lbnRMaXN0ZW5lckFkZGVkKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBwcmV2ZW50RGVmYXVsdCwgaGFzUGFzc2l2ZUV2ZW50cyA/IHsgcGFzc2l2ZTogZmFsc2UgfSA6IHVuZGVmaW5lZCk7XG4gICAgICBkb2N1bWVudExpc3RlbmVyQWRkZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBpbml0aWFsIGNsaWVudFkuXG4gICAgaW5pdGlhbENsaWVudFkgPSAtMTtcbiAgfVxuXG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIHJlc3RvcmVQb3NpdGlvblNldHRpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nKCk7XG4gIH1cblxuICBsb2NrcyA9IFtdO1xufTtcblxuZXhwb3J0IHZhciBlbmFibGVCb2R5U2Nyb2xsID0gZnVuY3Rpb24gZW5hYmxlQm9keVNjcm9sbCh0YXJnZXRFbGVtZW50KSB7XG4gIGlmICghdGFyZ2V0RWxlbWVudCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5lcnJvcignZW5hYmxlQm9keVNjcm9sbCB1bnN1Y2Nlc3NmdWwgLSB0YXJnZXRFbGVtZW50IG11c3QgYmUgcHJvdmlkZWQgd2hlbiBjYWxsaW5nIGVuYWJsZUJvZHlTY3JvbGwgb24gSU9TIGRldmljZXMuJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbG9ja3MgPSBsb2Nrcy5maWx0ZXIoZnVuY3Rpb24gKGxvY2spIHtcbiAgICByZXR1cm4gbG9jay50YXJnZXRFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50O1xuICB9KTtcblxuICBpZiAoaXNJb3NEZXZpY2UpIHtcbiAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2hzdGFydCA9IG51bGw7XG4gICAgdGFyZ2V0RWxlbWVudC5vbnRvdWNobW92ZSA9IG51bGw7XG5cbiAgICBpZiAoZG9jdW1lbnRMaXN0ZW5lckFkZGVkICYmIGxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcHJldmVudERlZmF1bHQsIGhhc1Bhc3NpdmVFdmVudHMgPyB7IHBhc3NpdmU6IGZhbHNlIH0gOiB1bmRlZmluZWQpO1xuICAgICAgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKGlzSW9zRGV2aWNlKSB7XG4gICAgcmVzdG9yZVBvc2l0aW9uU2V0dGluZygpO1xuICB9IGVsc2Uge1xuICAgIHJlc3RvcmVPdmVyZmxvd1NldHRpbmcoKTtcbiAgfVxufTtcblxuIiwiLyohXG4qIGZvY3VzLXRyYXAgNi42LjBcbiogQGxpY2Vuc2UgTUlULCBodHRwczovL2dpdGh1Yi5jb20vZm9jdXMtdHJhcC9mb2N1cy10cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiovXG5pbXBvcnQgeyB0YWJiYWJsZSwgaXNGb2N1c2FibGUgfSBmcm9tICd0YWJiYWJsZSc7XG5cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG5cbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtcblxuICAgIGlmIChlbnVtZXJhYmxlT25seSkge1xuICAgICAgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7XG4gIH1cblxuICByZXR1cm4ga2V5cztcbn1cblxuZnVuY3Rpb24gX29iamVjdFNwcmVhZDIodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG5cbiAgICBpZiAoaSAlIDIpIHtcbiAgICAgIG93bktleXMoT2JqZWN0KHNvdXJjZSksIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG52YXIgYWN0aXZlRm9jdXNUcmFwcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHRyYXBRdWV1ZSA9IFtdO1xuICByZXR1cm4ge1xuICAgIGFjdGl2YXRlVHJhcDogZnVuY3Rpb24gYWN0aXZhdGVUcmFwKHRyYXApIHtcbiAgICAgIGlmICh0cmFwUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgYWN0aXZlVHJhcCA9IHRyYXBRdWV1ZVt0cmFwUXVldWUubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgaWYgKGFjdGl2ZVRyYXAgIT09IHRyYXApIHtcbiAgICAgICAgICBhY3RpdmVUcmFwLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHRyYXBJbmRleCA9IHRyYXBRdWV1ZS5pbmRleE9mKHRyYXApO1xuXG4gICAgICBpZiAodHJhcEluZGV4ID09PSAtMSkge1xuICAgICAgICB0cmFwUXVldWUucHVzaCh0cmFwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG1vdmUgdGhpcyBleGlzdGluZyB0cmFwIHRvIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcbiAgICAgICAgdHJhcFF1ZXVlLnNwbGljZSh0cmFwSW5kZXgsIDEpO1xuICAgICAgICB0cmFwUXVldWUucHVzaCh0cmFwKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGRlYWN0aXZhdGVUcmFwOiBmdW5jdGlvbiBkZWFjdGl2YXRlVHJhcCh0cmFwKSB7XG4gICAgICB2YXIgdHJhcEluZGV4ID0gdHJhcFF1ZXVlLmluZGV4T2YodHJhcCk7XG5cbiAgICAgIGlmICh0cmFwSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRyYXBRdWV1ZS5zcGxpY2UodHJhcEluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyYXBRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRyYXBRdWV1ZVt0cmFwUXVldWUubGVuZ3RoIC0gMV0udW5wYXVzZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0oKTtcblxudmFyIGlzU2VsZWN0YWJsZUlucHV0ID0gZnVuY3Rpb24gaXNTZWxlY3RhYmxlSW5wdXQobm9kZSkge1xuICByZXR1cm4gbm9kZS50YWdOYW1lICYmIG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW5wdXQnICYmIHR5cGVvZiBub2RlLnNlbGVjdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbnZhciBpc0VzY2FwZUV2ZW50ID0gZnVuY3Rpb24gaXNFc2NhcGVFdmVudChlKSB7XG4gIHJldHVybiBlLmtleSA9PT0gJ0VzY2FwZScgfHwgZS5rZXkgPT09ICdFc2MnIHx8IGUua2V5Q29kZSA9PT0gMjc7XG59O1xuXG52YXIgaXNUYWJFdmVudCA9IGZ1bmN0aW9uIGlzVGFiRXZlbnQoZSkge1xuICByZXR1cm4gZS5rZXkgPT09ICdUYWInIHx8IGUua2V5Q29kZSA9PT0gOTtcbn07XG5cbnZhciBkZWxheSA9IGZ1bmN0aW9uIGRlbGF5KGZuKSB7XG4gIHJldHVybiBzZXRUaW1lb3V0KGZuLCAwKTtcbn07IC8vIEFycmF5LmZpbmQvZmluZEluZGV4KCkgYXJlIG5vdCBzdXBwb3J0ZWQgb24gSUU7IHRoaXMgcmVwbGljYXRlcyBlbm91Z2hcbi8vICBvZiBBcnJheS5maW5kSW5kZXgoKSBmb3Igb3VyIG5lZWRzXG5cblxudmFyIGZpbmRJbmRleCA9IGZ1bmN0aW9uIGZpbmRJbmRleChhcnIsIGZuKSB7XG4gIHZhciBpZHggPSAtMTtcbiAgYXJyLmV2ZXJ5KGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgIGlmIChmbih2YWx1ZSkpIHtcbiAgICAgIGlkeCA9IGk7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIGJyZWFrXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7IC8vIG5leHRcbiAgfSk7XG4gIHJldHVybiBpZHg7XG59O1xuLyoqXG4gKiBHZXQgYW4gb3B0aW9uJ3MgdmFsdWUgd2hlbiBpdCBjb3VsZCBiZSBhIHBsYWluIHZhbHVlLCBvciBhIGhhbmRsZXIgdGhhdCBwcm92aWRlc1xuICogIHRoZSB2YWx1ZS5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgT3B0aW9uJ3MgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0gey4uLip9IFtwYXJhbXNdIEFueSBwYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIGhhbmRsZXIsIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHsqfSBUaGUgYHZhbHVlYCwgb3IgdGhlIGhhbmRsZXIncyByZXR1cm5lZCB2YWx1ZS5cbiAqL1xuXG5cbnZhciB2YWx1ZU9ySGFuZGxlciA9IGZ1bmN0aW9uIHZhbHVlT3JIYW5kbGVyKHZhbHVlKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBwYXJhbXMgPSBuZXcgQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHBhcmFtc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID8gdmFsdWUuYXBwbHkodm9pZCAwLCBwYXJhbXMpIDogdmFsdWU7XG59O1xuXG52YXIgY3JlYXRlRm9jdXNUcmFwID0gZnVuY3Rpb24gY3JlYXRlRm9jdXNUcmFwKGVsZW1lbnRzLCB1c2VyT3B0aW9ucykge1xuICB2YXIgZG9jID0gZG9jdW1lbnQ7XG5cbiAgdmFyIGNvbmZpZyA9IF9vYmplY3RTcHJlYWQyKHtcbiAgICByZXR1cm5Gb2N1c09uRGVhY3RpdmF0ZTogdHJ1ZSxcbiAgICBlc2NhcGVEZWFjdGl2YXRlczogdHJ1ZSxcbiAgICBkZWxheUluaXRpYWxGb2N1czogdHJ1ZVxuICB9LCB1c2VyT3B0aW9ucyk7XG5cbiAgdmFyIHN0YXRlID0ge1xuICAgIC8vIEB0eXBlIHtBcnJheTxIVE1MRWxlbWVudD59XG4gICAgY29udGFpbmVyczogW10sXG4gICAgLy8gbGlzdCBvZiBvYmplY3RzIGlkZW50aWZ5aW5nIHRoZSBmaXJzdCBhbmQgbGFzdCB0YWJiYWJsZSBub2RlcyBpbiBhbGwgY29udGFpbmVycy9ncm91cHMgaW5cbiAgICAvLyAgdGhlIHRyYXBcbiAgICAvLyBOT1RFOiBpdCdzIHBvc3NpYmxlIHRoYXQgYSBncm91cCBoYXMgbm8gdGFiYmFibGUgbm9kZXMgaWYgbm9kZXMgZ2V0IHJlbW92ZWQgd2hpbGUgdGhlIHRyYXBcbiAgICAvLyAgaXMgYWN0aXZlLCBidXQgdGhlIHRyYXAgc2hvdWxkIG5ldmVyIGdldCB0byBhIHN0YXRlIHdoZXJlIHRoZXJlIGlzbid0IGF0IGxlYXN0IG9uZSBncm91cFxuICAgIC8vICB3aXRoIGF0IGxlYXN0IG9uZSB0YWJiYWJsZSBub2RlIGluIGl0ICh0aGF0IHdvdWxkIGxlYWQgdG8gYW4gZXJyb3IgY29uZGl0aW9uIHRoYXQgd291bGRcbiAgICAvLyAgcmVzdWx0IGluIGFuIGVycm9yIGJlaW5nIHRocm93bilcbiAgICAvLyBAdHlwZSB7QXJyYXk8eyBjb250YWluZXI6IEhUTUxFbGVtZW50LCBmaXJzdFRhYmJhYmxlTm9kZTogSFRNTEVsZW1lbnR8bnVsbCwgbGFzdFRhYmJhYmxlTm9kZTogSFRNTEVsZW1lbnR8bnVsbCB9Pn1cbiAgICB0YWJiYWJsZUdyb3VwczogW10sXG4gICAgbm9kZUZvY3VzZWRCZWZvcmVBY3RpdmF0aW9uOiBudWxsLFxuICAgIG1vc3RSZWNlbnRseUZvY3VzZWROb2RlOiBudWxsLFxuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgcGF1c2VkOiBmYWxzZSxcbiAgICAvLyB0aW1lciBJRCBmb3Igd2hlbiBkZWxheUluaXRpYWxGb2N1cyBpcyB0cnVlIGFuZCBpbml0aWFsIGZvY3VzIGluIHRoaXMgdHJhcFxuICAgIC8vICBoYXMgYmVlbiBkZWxheWVkIGR1cmluZyBhY3RpdmF0aW9uXG4gICAgZGVsYXlJbml0aWFsRm9jdXNUaW1lcjogdW5kZWZpbmVkXG4gIH07XG4gIHZhciB0cmFwOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHByZWZlci1jb25zdCAtLSBzb21lIHByaXZhdGUgZnVuY3Rpb25zIHJlZmVyZW5jZSBpdCwgYW5kIGl0cyBtZXRob2RzIHJlZmVyZW5jZSBwcml2YXRlIGZ1bmN0aW9ucywgc28gd2UgbXVzdCBkZWNsYXJlIGhlcmUgYW5kIGRlZmluZSBsYXRlclxuXG4gIHZhciBnZXRPcHRpb24gPSBmdW5jdGlvbiBnZXRPcHRpb24oY29uZmlnT3ZlcnJpZGVPcHRpb25zLCBvcHRpb25OYW1lLCBjb25maWdPcHRpb25OYW1lKSB7XG4gICAgcmV0dXJuIGNvbmZpZ092ZXJyaWRlT3B0aW9ucyAmJiBjb25maWdPdmVycmlkZU9wdGlvbnNbb3B0aW9uTmFtZV0gIT09IHVuZGVmaW5lZCA/IGNvbmZpZ092ZXJyaWRlT3B0aW9uc1tvcHRpb25OYW1lXSA6IGNvbmZpZ1tjb25maWdPcHRpb25OYW1lIHx8IG9wdGlvbk5hbWVdO1xuICB9O1xuXG4gIHZhciBjb250YWluZXJzQ29udGFpbiA9IGZ1bmN0aW9uIGNvbnRhaW5lcnNDb250YWluKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gc3RhdGUuY29udGFpbmVycy5zb21lKGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgIHJldHVybiBjb250YWluZXIuY29udGFpbnMoZWxlbWVudCk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIGdldE5vZGVGb3JPcHRpb24gPSBmdW5jdGlvbiBnZXROb2RlRm9yT3B0aW9uKG9wdGlvbk5hbWUpIHtcbiAgICB2YXIgb3B0aW9uVmFsdWUgPSBjb25maWdbb3B0aW9uTmFtZV07XG5cbiAgICBpZiAoIW9wdGlvblZhbHVlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IG9wdGlvblZhbHVlO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25WYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG5vZGUgPSBkb2MucXVlcnlTZWxlY3RvcihvcHRpb25WYWx1ZSk7XG5cbiAgICAgIGlmICghbm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgXCIuY29uY2F0KG9wdGlvbk5hbWUsIFwiYCByZWZlcnMgdG8gbm8ga25vd24gbm9kZVwiKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25WYWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbm9kZSA9IG9wdGlvblZhbHVlKCk7XG5cbiAgICAgIGlmICghbm9kZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgXCIuY29uY2F0KG9wdGlvbk5hbWUsIFwiYCBkaWQgbm90IHJldHVybiBhIG5vZGVcIikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIHZhciBnZXRJbml0aWFsRm9jdXNOb2RlID0gZnVuY3Rpb24gZ2V0SW5pdGlhbEZvY3VzTm9kZSgpIHtcbiAgICB2YXIgbm9kZTsgLy8gZmFsc2UgaW5kaWNhdGVzIHdlIHdhbnQgbm8gaW5pdGlhbEZvY3VzIGF0IGFsbFxuXG4gICAgaWYgKGdldE9wdGlvbih7fSwgJ2luaXRpYWxGb2N1cycpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChnZXROb2RlRm9yT3B0aW9uKCdpbml0aWFsRm9jdXMnKSAhPT0gbnVsbCkge1xuICAgICAgbm9kZSA9IGdldE5vZGVGb3JPcHRpb24oJ2luaXRpYWxGb2N1cycpO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbmVyc0NvbnRhaW4oZG9jLmFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICBub2RlID0gZG9jLmFjdGl2ZUVsZW1lbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmaXJzdFRhYmJhYmxlR3JvdXAgPSBzdGF0ZS50YWJiYWJsZUdyb3Vwc1swXTtcbiAgICAgIHZhciBmaXJzdFRhYmJhYmxlTm9kZSA9IGZpcnN0VGFiYmFibGVHcm91cCAmJiBmaXJzdFRhYmJhYmxlR3JvdXAuZmlyc3RUYWJiYWJsZU5vZGU7XG4gICAgICBub2RlID0gZmlyc3RUYWJiYWJsZU5vZGUgfHwgZ2V0Tm9kZUZvck9wdGlvbignZmFsbGJhY2tGb2N1cycpO1xuICAgIH1cblxuICAgIGlmICghbm9kZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIGZvY3VzLXRyYXAgbmVlZHMgdG8gaGF2ZSBhdCBsZWFzdCBvbmUgZm9jdXNhYmxlIGVsZW1lbnQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICB2YXIgdXBkYXRlVGFiYmFibGVOb2RlcyA9IGZ1bmN0aW9uIHVwZGF0ZVRhYmJhYmxlTm9kZXMoKSB7XG4gICAgc3RhdGUudGFiYmFibGVHcm91cHMgPSBzdGF0ZS5jb250YWluZXJzLm1hcChmdW5jdGlvbiAoY29udGFpbmVyKSB7XG4gICAgICB2YXIgdGFiYmFibGVOb2RlcyA9IHRhYmJhYmxlKGNvbnRhaW5lcik7XG5cbiAgICAgIGlmICh0YWJiYWJsZU5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICBmaXJzdFRhYmJhYmxlTm9kZTogdGFiYmFibGVOb2Rlc1swXSxcbiAgICAgICAgICBsYXN0VGFiYmFibGVOb2RlOiB0YWJiYWJsZU5vZGVzW3RhYmJhYmxlTm9kZXMubGVuZ3RoIC0gMV1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9KS5maWx0ZXIoZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICByZXR1cm4gISFncm91cDtcbiAgICB9KTsgLy8gcmVtb3ZlIGdyb3VwcyB3aXRoIG5vIHRhYmJhYmxlIG5vZGVzXG4gICAgLy8gdGhyb3cgaWYgbm8gZ3JvdXBzIGhhdmUgdGFiYmFibGUgbm9kZXMgYW5kIHdlIGRvbid0IGhhdmUgYSBmYWxsYmFjayBmb2N1cyBub2RlIGVpdGhlclxuXG4gICAgaWYgKHN0YXRlLnRhYmJhYmxlR3JvdXBzLmxlbmd0aCA8PSAwICYmICFnZXROb2RlRm9yT3B0aW9uKCdmYWxsYmFja0ZvY3VzJykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBmb2N1cy10cmFwIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgY29udGFpbmVyIHdpdGggYXQgbGVhc3Qgb25lIHRhYmJhYmxlIG5vZGUgaW4gaXQgYXQgYWxsIHRpbWVzJyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciB0cnlGb2N1cyA9IGZ1bmN0aW9uIHRyeUZvY3VzKG5vZGUpIHtcbiAgICBpZiAobm9kZSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobm9kZSA9PT0gZG9jLmFjdGl2ZUVsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW5vZGUgfHwgIW5vZGUuZm9jdXMpIHtcbiAgICAgIHRyeUZvY3VzKGdldEluaXRpYWxGb2N1c05vZGUoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9kZS5mb2N1cyh7XG4gICAgICBwcmV2ZW50U2Nyb2xsOiAhIWNvbmZpZy5wcmV2ZW50U2Nyb2xsXG4gICAgfSk7XG4gICAgc3RhdGUubW9zdFJlY2VudGx5Rm9jdXNlZE5vZGUgPSBub2RlO1xuXG4gICAgaWYgKGlzU2VsZWN0YWJsZUlucHV0KG5vZGUpKSB7XG4gICAgICBub2RlLnNlbGVjdCgpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgZ2V0UmV0dXJuRm9jdXNOb2RlID0gZnVuY3Rpb24gZ2V0UmV0dXJuRm9jdXNOb2RlKHByZXZpb3VzQWN0aXZlRWxlbWVudCkge1xuICAgIHZhciBub2RlID0gZ2V0Tm9kZUZvck9wdGlvbignc2V0UmV0dXJuRm9jdXMnKTtcbiAgICByZXR1cm4gbm9kZSA/IG5vZGUgOiBwcmV2aW91c0FjdGl2ZUVsZW1lbnQ7XG4gIH07IC8vIFRoaXMgbmVlZHMgdG8gYmUgZG9uZSBvbiBtb3VzZWRvd24gYW5kIHRvdWNoc3RhcnQgaW5zdGVhZCBvZiBjbGlja1xuICAvLyBzbyB0aGF0IGl0IHByZWNlZGVzIHRoZSBmb2N1cyBldmVudC5cblxuXG4gIHZhciBjaGVja1BvaW50ZXJEb3duID0gZnVuY3Rpb24gY2hlY2tQb2ludGVyRG93bihlKSB7XG4gICAgaWYgKGNvbnRhaW5lcnNDb250YWluKGUudGFyZ2V0KSkge1xuICAgICAgLy8gYWxsb3cgdGhlIGNsaWNrIHNpbmNlIGl0IG9jdXJyZWQgaW5zaWRlIHRoZSB0cmFwXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlT3JIYW5kbGVyKGNvbmZpZy5jbGlja091dHNpZGVEZWFjdGl2YXRlcywgZSkpIHtcbiAgICAgIC8vIGltbWVkaWF0ZWx5IGRlYWN0aXZhdGUgdGhlIHRyYXBcbiAgICAgIHRyYXAuZGVhY3RpdmF0ZSh7XG4gICAgICAgIC8vIGlmLCBvbiBkZWFjdGl2YXRpb24sIHdlIHNob3VsZCByZXR1cm4gZm9jdXMgdG8gdGhlIG5vZGUgb3JpZ2luYWxseS1mb2N1c2VkXG4gICAgICAgIC8vICB3aGVuIHRoZSB0cmFwIHdhcyBhY3RpdmF0ZWQgKG9yIHRoZSBjb25maWd1cmVkIGBzZXRSZXR1cm5Gb2N1c2Agbm9kZSksXG4gICAgICAgIC8vICB0aGVuIGFzc3VtZSBpdCdzIGFsc28gT0sgdG8gcmV0dXJuIGZvY3VzIHRvIHRoZSBvdXRzaWRlIG5vZGUgdGhhdCB3YXNcbiAgICAgICAgLy8gIGp1c3QgY2xpY2tlZCwgY2F1c2luZyBkZWFjdGl2YXRpb24sIGFzIGxvbmcgYXMgdGhhdCBub2RlIGlzIGZvY3VzYWJsZTtcbiAgICAgICAgLy8gIGlmIGl0IGlzbid0IGZvY3VzYWJsZSwgdGhlbiByZXR1cm4gZm9jdXMgdG8gdGhlIG9yaWdpbmFsIG5vZGUgZm9jdXNlZFxuICAgICAgICAvLyAgb24gYWN0aXZhdGlvbiAob3IgdGhlIGNvbmZpZ3VyZWQgYHNldFJldHVybkZvY3VzYCBub2RlKVxuICAgICAgICAvLyBOT1RFOiBieSBzZXR0aW5nIGByZXR1cm5Gb2N1czogZmFsc2VgLCBkZWFjdGl2YXRlKCkgd2lsbCBkbyBub3RoaW5nLFxuICAgICAgICAvLyAgd2hpY2ggd2lsbCByZXN1bHQgaW4gdGhlIG91dHNpZGUgY2xpY2sgc2V0dGluZyBmb2N1cyB0byB0aGUgbm9kZVxuICAgICAgICAvLyAgdGhhdCB3YXMgY2xpY2tlZCwgd2hldGhlciBpdCdzIGZvY3VzYWJsZSBvciBub3Q7IGJ5IHNldHRpbmdcbiAgICAgICAgLy8gIGByZXR1cm5Gb2N1czogdHJ1ZWAsIHdlJ2xsIGF0dGVtcHQgdG8gcmUtZm9jdXMgdGhlIG5vZGUgb3JpZ2luYWxseS1mb2N1c2VkXG4gICAgICAgIC8vICBvbiBhY3RpdmF0aW9uIChvciB0aGUgY29uZmlndXJlZCBgc2V0UmV0dXJuRm9jdXNgIG5vZGUpXG4gICAgICAgIHJldHVybkZvY3VzOiBjb25maWcucmV0dXJuRm9jdXNPbkRlYWN0aXZhdGUgJiYgIWlzRm9jdXNhYmxlKGUudGFyZ2V0KVxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBUaGlzIGlzIG5lZWRlZCBmb3IgbW9iaWxlIGRldmljZXMuXG4gICAgLy8gKElmIHdlJ2xsIG9ubHkgbGV0IGBjbGlja2AgZXZlbnRzIHRocm91Z2gsXG4gICAgLy8gdGhlbiBvbiBtb2JpbGUgdGhleSB3aWxsIGJlIGJsb2NrZWQgYW55d2F5cyBpZiBgdG91Y2hzdGFydGAgaXMgYmxvY2tlZC4pXG5cblxuICAgIGlmICh2YWx1ZU9ySGFuZGxlcihjb25maWcuYWxsb3dPdXRzaWRlQ2xpY2ssIGUpKSB7XG4gICAgICAvLyBhbGxvdyB0aGUgY2xpY2sgb3V0c2lkZSB0aGUgdHJhcCB0byB0YWtlIHBsYWNlXG4gICAgICByZXR1cm47XG4gICAgfSAvLyBvdGhlcndpc2UsIHByZXZlbnQgdGhlIGNsaWNrXG5cblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfTsgLy8gSW4gY2FzZSBmb2N1cyBlc2NhcGVzIHRoZSB0cmFwIGZvciBzb21lIHN0cmFuZ2UgcmVhc29uLCBwdWxsIGl0IGJhY2sgaW4uXG5cblxuICB2YXIgY2hlY2tGb2N1c0luID0gZnVuY3Rpb24gY2hlY2tGb2N1c0luKGUpIHtcbiAgICB2YXIgdGFyZ2V0Q29udGFpbmVkID0gY29udGFpbmVyc0NvbnRhaW4oZS50YXJnZXQpOyAvLyBJbiBGaXJlZm94IHdoZW4geW91IFRhYiBvdXQgb2YgYW4gaWZyYW1lIHRoZSBEb2N1bWVudCBpcyBicmllZmx5IGZvY3VzZWQuXG5cbiAgICBpZiAodGFyZ2V0Q29udGFpbmVkIHx8IGUudGFyZ2V0IGluc3RhbmNlb2YgRG9jdW1lbnQpIHtcbiAgICAgIGlmICh0YXJnZXRDb250YWluZWQpIHtcbiAgICAgICAgc3RhdGUubW9zdFJlY2VudGx5Rm9jdXNlZE5vZGUgPSBlLnRhcmdldDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXNjYXBlZCEgcHVsbCBpdCBiYWNrIGluIHRvIHdoZXJlIGl0IGp1c3QgbGVmdFxuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgIHRyeUZvY3VzKHN0YXRlLm1vc3RSZWNlbnRseUZvY3VzZWROb2RlIHx8IGdldEluaXRpYWxGb2N1c05vZGUoKSk7XG4gICAgfVxuICB9OyAvLyBIaWphY2sgVGFiIGV2ZW50cyBvbiB0aGUgZmlyc3QgYW5kIGxhc3QgZm9jdXNhYmxlIG5vZGVzIG9mIHRoZSB0cmFwLFxuICAvLyBpbiBvcmRlciB0byBwcmV2ZW50IGZvY3VzIGZyb20gZXNjYXBpbmcuIElmIGl0IGVzY2FwZXMgZm9yIGV2ZW4gYVxuICAvLyBtb21lbnQgaXQgY2FuIGVuZCB1cCBzY3JvbGxpbmcgdGhlIHBhZ2UgYW5kIGNhdXNpbmcgY29uZnVzaW9uIHNvIHdlXG4gIC8vIGtpbmQgb2YgbmVlZCB0byBjYXB0dXJlIHRoZSBhY3Rpb24gYXQgdGhlIGtleWRvd24gcGhhc2UuXG5cblxuICB2YXIgY2hlY2tUYWIgPSBmdW5jdGlvbiBjaGVja1RhYihlKSB7XG4gICAgdXBkYXRlVGFiYmFibGVOb2RlcygpO1xuICAgIHZhciBkZXN0aW5hdGlvbk5vZGUgPSBudWxsO1xuXG4gICAgaWYgKHN0YXRlLnRhYmJhYmxlR3JvdXBzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgdGFyZ2V0IGlzIGFjdHVhbGx5IGNvbnRhaW5lZCBpbiBhIGdyb3VwXG4gICAgICAvLyBOT1RFOiB0aGUgdGFyZ2V0IG1heSBhbHNvIGJlIHRoZSBjb250YWluZXIgaXRzZWxmIGlmIGl0J3MgdGFiYmFibGVcbiAgICAgIC8vICB3aXRoIHRhYkluZGV4PSctMScgYW5kIHdhcyBnaXZlbiBpbml0aWFsIGZvY3VzXG4gICAgICB2YXIgY29udGFpbmVySW5kZXggPSBmaW5kSW5kZXgoc3RhdGUudGFiYmFibGVHcm91cHMsIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgIHZhciBjb250YWluZXIgPSBfcmVmLmNvbnRhaW5lcjtcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5jb250YWlucyhlLnRhcmdldCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGNvbnRhaW5lckluZGV4IDwgMCkge1xuICAgICAgICAvLyB0YXJnZXQgbm90IGZvdW5kIGluIGFueSBncm91cDogcXVpdGUgcG9zc2libGUgZm9jdXMgaGFzIGVzY2FwZWQgdGhlIHRyYXAsXG4gICAgICAgIC8vICBzbyBicmluZyBpdCBiYWNrIGluIHRvLi4uXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgLy8gLi4udGhlIGxhc3Qgbm9kZSBpbiB0aGUgbGFzdCBncm91cFxuICAgICAgICAgIGRlc3RpbmF0aW9uTm9kZSA9IHN0YXRlLnRhYmJhYmxlR3JvdXBzW3N0YXRlLnRhYmJhYmxlR3JvdXBzLmxlbmd0aCAtIDFdLmxhc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gLi4udGhlIGZpcnN0IG5vZGUgaW4gdGhlIGZpcnN0IGdyb3VwXG4gICAgICAgICAgZGVzdGluYXRpb25Ob2RlID0gc3RhdGUudGFiYmFibGVHcm91cHNbMF0uZmlyc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAvLyBSRVZFUlNFXG4gICAgICAgIC8vIGlzIHRoZSB0YXJnZXQgdGhlIGZpcnN0IHRhYmJhYmxlIG5vZGUgaW4gYSBncm91cD9cbiAgICAgICAgdmFyIHN0YXJ0T2ZHcm91cEluZGV4ID0gZmluZEluZGV4KHN0YXRlLnRhYmJhYmxlR3JvdXBzLCBmdW5jdGlvbiAoX3JlZjIpIHtcbiAgICAgICAgICB2YXIgZmlyc3RUYWJiYWJsZU5vZGUgPSBfcmVmMi5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgICByZXR1cm4gZS50YXJnZXQgPT09IGZpcnN0VGFiYmFibGVOb2RlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3RhcnRPZkdyb3VwSW5kZXggPCAwICYmIHN0YXRlLnRhYmJhYmxlR3JvdXBzW2NvbnRhaW5lckluZGV4XS5jb250YWluZXIgPT09IGUudGFyZ2V0KSB7XG4gICAgICAgICAgLy8gYW4gZXhjZXB0aW9uIGNhc2Ugd2hlcmUgdGhlIHRhcmdldCBpcyB0aGUgY29udGFpbmVyIGl0c2VsZiwgaW4gd2hpY2hcbiAgICAgICAgICAvLyAgY2FzZSwgd2Ugc2hvdWxkIGhhbmRsZSBzaGlmdCt0YWIgYXMgaWYgZm9jdXMgd2VyZSBvbiB0aGUgY29udGFpbmVyJ3NcbiAgICAgICAgICAvLyAgZmlyc3QgdGFiYmFibGUgbm9kZSwgYW5kIGdvIHRvIHRoZSBsYXN0IHRhYmJhYmxlIG5vZGUgb2YgdGhlIExBU1QgZ3JvdXBcbiAgICAgICAgICBzdGFydE9mR3JvdXBJbmRleCA9IGNvbnRhaW5lckluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0YXJ0T2ZHcm91cEluZGV4ID49IDApIHtcbiAgICAgICAgICAvLyBZRVM6IHRoZW4gc2hpZnQrdGFiIHNob3VsZCBnbyB0byB0aGUgbGFzdCB0YWJiYWJsZSBub2RlIGluIHRoZVxuICAgICAgICAgIC8vICBwcmV2aW91cyBncm91cCAoYW5kIHdyYXAgYXJvdW5kIHRvIHRoZSBsYXN0IHRhYmJhYmxlIG5vZGUgb2ZcbiAgICAgICAgICAvLyAgdGhlIExBU1QgZ3JvdXAgaWYgaXQncyB0aGUgZmlyc3QgdGFiYmFibGUgbm9kZSBvZiB0aGUgRklSU1QgZ3JvdXApXG4gICAgICAgICAgdmFyIGRlc3RpbmF0aW9uR3JvdXBJbmRleCA9IHN0YXJ0T2ZHcm91cEluZGV4ID09PSAwID8gc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoIC0gMSA6IHN0YXJ0T2ZHcm91cEluZGV4IC0gMTtcbiAgICAgICAgICB2YXIgZGVzdGluYXRpb25Hcm91cCA9IHN0YXRlLnRhYmJhYmxlR3JvdXBzW2Rlc3RpbmF0aW9uR3JvdXBJbmRleF07XG4gICAgICAgICAgZGVzdGluYXRpb25Ob2RlID0gZGVzdGluYXRpb25Hcm91cC5sYXN0VGFiYmFibGVOb2RlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGT1JXQVJEXG4gICAgICAgIC8vIGlzIHRoZSB0YXJnZXQgdGhlIGxhc3QgdGFiYmFibGUgbm9kZSBpbiBhIGdyb3VwP1xuICAgICAgICB2YXIgbGFzdE9mR3JvdXBJbmRleCA9IGZpbmRJbmRleChzdGF0ZS50YWJiYWJsZUdyb3VwcywgZnVuY3Rpb24gKF9yZWYzKSB7XG4gICAgICAgICAgdmFyIGxhc3RUYWJiYWJsZU5vZGUgPSBfcmVmMy5sYXN0VGFiYmFibGVOb2RlO1xuICAgICAgICAgIHJldHVybiBlLnRhcmdldCA9PT0gbGFzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGxhc3RPZkdyb3VwSW5kZXggPCAwICYmIHN0YXRlLnRhYmJhYmxlR3JvdXBzW2NvbnRhaW5lckluZGV4XS5jb250YWluZXIgPT09IGUudGFyZ2V0KSB7XG4gICAgICAgICAgLy8gYW4gZXhjZXB0aW9uIGNhc2Ugd2hlcmUgdGhlIHRhcmdldCBpcyB0aGUgY29udGFpbmVyIGl0c2VsZiwgaW4gd2hpY2hcbiAgICAgICAgICAvLyAgY2FzZSwgd2Ugc2hvdWxkIGhhbmRsZSB0YWIgYXMgaWYgZm9jdXMgd2VyZSBvbiB0aGUgY29udGFpbmVyJ3NcbiAgICAgICAgICAvLyAgbGFzdCB0YWJiYWJsZSBub2RlLCBhbmQgZ28gdG8gdGhlIGZpcnN0IHRhYmJhYmxlIG5vZGUgb2YgdGhlIEZJUlNUIGdyb3VwXG4gICAgICAgICAgbGFzdE9mR3JvdXBJbmRleCA9IGNvbnRhaW5lckluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxhc3RPZkdyb3VwSW5kZXggPj0gMCkge1xuICAgICAgICAgIC8vIFlFUzogdGhlbiB0YWIgc2hvdWxkIGdvIHRvIHRoZSBmaXJzdCB0YWJiYWJsZSBub2RlIGluIHRoZSBuZXh0XG4gICAgICAgICAgLy8gIGdyb3VwIChhbmQgd3JhcCBhcm91bmQgdG8gdGhlIGZpcnN0IHRhYmJhYmxlIG5vZGUgb2YgdGhlIEZJUlNUXG4gICAgICAgICAgLy8gIGdyb3VwIGlmIGl0J3MgdGhlIGxhc3QgdGFiYmFibGUgbm9kZSBvZiB0aGUgTEFTVCBncm91cClcbiAgICAgICAgICB2YXIgX2Rlc3RpbmF0aW9uR3JvdXBJbmRleCA9IGxhc3RPZkdyb3VwSW5kZXggPT09IHN0YXRlLnRhYmJhYmxlR3JvdXBzLmxlbmd0aCAtIDEgPyAwIDogbGFzdE9mR3JvdXBJbmRleCArIDE7XG5cbiAgICAgICAgICB2YXIgX2Rlc3RpbmF0aW9uR3JvdXAgPSBzdGF0ZS50YWJiYWJsZUdyb3Vwc1tfZGVzdGluYXRpb25Hcm91cEluZGV4XTtcbiAgICAgICAgICBkZXN0aW5hdGlvbk5vZGUgPSBfZGVzdGluYXRpb25Hcm91cC5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZXN0aW5hdGlvbk5vZGUgPSBnZXROb2RlRm9yT3B0aW9uKCdmYWxsYmFja0ZvY3VzJyk7XG4gICAgfVxuXG4gICAgaWYgKGRlc3RpbmF0aW9uTm9kZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdHJ5Rm9jdXMoZGVzdGluYXRpb25Ob2RlKTtcbiAgICB9IC8vIGVsc2UsIGxldCB0aGUgYnJvd3NlciB0YWtlIGNhcmUgb2YgW3NoaWZ0K110YWIgYW5kIG1vdmUgdGhlIGZvY3VzXG5cbiAgfTtcblxuICB2YXIgY2hlY2tLZXkgPSBmdW5jdGlvbiBjaGVja0tleShlKSB7XG4gICAgaWYgKGlzRXNjYXBlRXZlbnQoZSkgJiYgdmFsdWVPckhhbmRsZXIoY29uZmlnLmVzY2FwZURlYWN0aXZhdGVzKSAhPT0gZmFsc2UpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRyYXAuZGVhY3RpdmF0ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChpc1RhYkV2ZW50KGUpKSB7XG4gICAgICBjaGVja1RhYihlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoZWNrQ2xpY2sgPSBmdW5jdGlvbiBjaGVja0NsaWNrKGUpIHtcbiAgICBpZiAodmFsdWVPckhhbmRsZXIoY29uZmlnLmNsaWNrT3V0c2lkZURlYWN0aXZhdGVzLCBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChjb250YWluZXJzQ29udGFpbihlLnRhcmdldCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVPckhhbmRsZXIoY29uZmlnLmFsbG93T3V0c2lkZUNsaWNrLCBlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICB9OyAvL1xuICAvLyBFVkVOVCBMSVNURU5FUlNcbiAgLy9cblxuXG4gIHZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFzdGF0ZS5hY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIFRoZXJlIGNhbiBiZSBvbmx5IG9uZSBsaXN0ZW5pbmcgZm9jdXMgdHJhcCBhdCBhIHRpbWVcblxuXG4gICAgYWN0aXZlRm9jdXNUcmFwcy5hY3RpdmF0ZVRyYXAodHJhcCk7IC8vIERlbGF5IGVuc3VyZXMgdGhhdCB0aGUgZm9jdXNlZCBlbGVtZW50IGRvZXNuJ3QgY2FwdHVyZSB0aGUgZXZlbnRcbiAgICAvLyB0aGF0IGNhdXNlZCB0aGUgZm9jdXMgdHJhcCBhY3RpdmF0aW9uLlxuXG4gICAgc3RhdGUuZGVsYXlJbml0aWFsRm9jdXNUaW1lciA9IGNvbmZpZy5kZWxheUluaXRpYWxGb2N1cyA/IGRlbGF5KGZ1bmN0aW9uICgpIHtcbiAgICAgIHRyeUZvY3VzKGdldEluaXRpYWxGb2N1c05vZGUoKSk7XG4gICAgfSkgOiB0cnlGb2N1cyhnZXRJbml0aWFsRm9jdXNOb2RlKCkpO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgY2hlY2tGb2N1c0luLCB0cnVlKTtcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgY2hlY2tQb2ludGVyRG93biwge1xuICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgIHBhc3NpdmU6IGZhbHNlXG4gICAgfSk7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBjaGVja1BvaW50ZXJEb3duLCB7XG4gICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgcGFzc2l2ZTogZmFsc2VcbiAgICB9KTtcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjaGVja0NsaWNrLCB7XG4gICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgcGFzc2l2ZTogZmFsc2VcbiAgICB9KTtcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNoZWNrS2V5LCB7XG4gICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgcGFzc2l2ZTogZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gdHJhcDtcbiAgfTtcblxuICB2YXIgcmVtb3ZlTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzKCkge1xuICAgIGlmICghc3RhdGUuYWN0aXZlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBjaGVja0ZvY3VzSW4sIHRydWUpO1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBjaGVja1BvaW50ZXJEb3duLCB0cnVlKTtcbiAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGNoZWNrUG9pbnRlckRvd24sIHRydWUpO1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNoZWNrQ2xpY2ssIHRydWUpO1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2hlY2tLZXksIHRydWUpO1xuICAgIHJldHVybiB0cmFwO1xuICB9OyAvL1xuICAvLyBUUkFQIERFRklOSVRJT05cbiAgLy9cblxuXG4gIHRyYXAgPSB7XG4gICAgYWN0aXZhdGU6IGZ1bmN0aW9uIGFjdGl2YXRlKGFjdGl2YXRlT3B0aW9ucykge1xuICAgICAgaWYgKHN0YXRlLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgdmFyIG9uQWN0aXZhdGUgPSBnZXRPcHRpb24oYWN0aXZhdGVPcHRpb25zLCAnb25BY3RpdmF0ZScpO1xuICAgICAgdmFyIG9uUG9zdEFjdGl2YXRlID0gZ2V0T3B0aW9uKGFjdGl2YXRlT3B0aW9ucywgJ29uUG9zdEFjdGl2YXRlJyk7XG4gICAgICB2YXIgY2hlY2tDYW5Gb2N1c1RyYXAgPSBnZXRPcHRpb24oYWN0aXZhdGVPcHRpb25zLCAnY2hlY2tDYW5Gb2N1c1RyYXAnKTtcblxuICAgICAgaWYgKCFjaGVja0NhbkZvY3VzVHJhcCkge1xuICAgICAgICB1cGRhdGVUYWJiYWJsZU5vZGVzKCk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRlLmFjdGl2ZSA9IHRydWU7XG4gICAgICBzdGF0ZS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIHN0YXRlLm5vZGVGb2N1c2VkQmVmb3JlQWN0aXZhdGlvbiA9IGRvYy5hY3RpdmVFbGVtZW50O1xuXG4gICAgICBpZiAob25BY3RpdmF0ZSkge1xuICAgICAgICBvbkFjdGl2YXRlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaW5pc2hBY3RpdmF0aW9uID0gZnVuY3Rpb24gZmluaXNoQWN0aXZhdGlvbigpIHtcbiAgICAgICAgaWYgKGNoZWNrQ2FuRm9jdXNUcmFwKSB7XG4gICAgICAgICAgdXBkYXRlVGFiYmFibGVOb2RlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgYWRkTGlzdGVuZXJzKCk7XG5cbiAgICAgICAgaWYgKG9uUG9zdEFjdGl2YXRlKSB7XG4gICAgICAgICAgb25Qb3N0QWN0aXZhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKGNoZWNrQ2FuRm9jdXNUcmFwKSB7XG4gICAgICAgIGNoZWNrQ2FuRm9jdXNUcmFwKHN0YXRlLmNvbnRhaW5lcnMuY29uY2F0KCkpLnRoZW4oZmluaXNoQWN0aXZhdGlvbiwgZmluaXNoQWN0aXZhdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBmaW5pc2hBY3RpdmF0aW9uKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGRlYWN0aXZhdGU6IGZ1bmN0aW9uIGRlYWN0aXZhdGUoZGVhY3RpdmF0ZU9wdGlvbnMpIHtcbiAgICAgIGlmICghc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBjbGVhclRpbWVvdXQoc3RhdGUuZGVsYXlJbml0aWFsRm9jdXNUaW1lcik7IC8vIG5vb3AgaWYgdW5kZWZpbmVkXG5cbiAgICAgIHN0YXRlLmRlbGF5SW5pdGlhbEZvY3VzVGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICByZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgIHN0YXRlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgc3RhdGUucGF1c2VkID0gZmFsc2U7XG4gICAgICBhY3RpdmVGb2N1c1RyYXBzLmRlYWN0aXZhdGVUcmFwKHRyYXApO1xuICAgICAgdmFyIG9uRGVhY3RpdmF0ZSA9IGdldE9wdGlvbihkZWFjdGl2YXRlT3B0aW9ucywgJ29uRGVhY3RpdmF0ZScpO1xuICAgICAgdmFyIG9uUG9zdERlYWN0aXZhdGUgPSBnZXRPcHRpb24oZGVhY3RpdmF0ZU9wdGlvbnMsICdvblBvc3REZWFjdGl2YXRlJyk7XG4gICAgICB2YXIgY2hlY2tDYW5SZXR1cm5Gb2N1cyA9IGdldE9wdGlvbihkZWFjdGl2YXRlT3B0aW9ucywgJ2NoZWNrQ2FuUmV0dXJuRm9jdXMnKTtcblxuICAgICAgaWYgKG9uRGVhY3RpdmF0ZSkge1xuICAgICAgICBvbkRlYWN0aXZhdGUoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJldHVybkZvY3VzID0gZ2V0T3B0aW9uKGRlYWN0aXZhdGVPcHRpb25zLCAncmV0dXJuRm9jdXMnLCAncmV0dXJuRm9jdXNPbkRlYWN0aXZhdGUnKTtcblxuICAgICAgdmFyIGZpbmlzaERlYWN0aXZhdGlvbiA9IGZ1bmN0aW9uIGZpbmlzaERlYWN0aXZhdGlvbigpIHtcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChyZXR1cm5Gb2N1cykge1xuICAgICAgICAgICAgdHJ5Rm9jdXMoZ2V0UmV0dXJuRm9jdXNOb2RlKHN0YXRlLm5vZGVGb2N1c2VkQmVmb3JlQWN0aXZhdGlvbikpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChvblBvc3REZWFjdGl2YXRlKSB7XG4gICAgICAgICAgICBvblBvc3REZWFjdGl2YXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGlmIChyZXR1cm5Gb2N1cyAmJiBjaGVja0NhblJldHVybkZvY3VzKSB7XG4gICAgICAgIGNoZWNrQ2FuUmV0dXJuRm9jdXMoZ2V0UmV0dXJuRm9jdXNOb2RlKHN0YXRlLm5vZGVGb2N1c2VkQmVmb3JlQWN0aXZhdGlvbikpLnRoZW4oZmluaXNoRGVhY3RpdmF0aW9uLCBmaW5pc2hEZWFjdGl2YXRpb24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgZmluaXNoRGVhY3RpdmF0aW9uKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHBhdXNlOiBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgIGlmIChzdGF0ZS5wYXVzZWQgfHwgIXN0YXRlLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgc3RhdGUucGF1c2VkID0gdHJ1ZTtcbiAgICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICB1bnBhdXNlOiBmdW5jdGlvbiB1bnBhdXNlKCkge1xuICAgICAgaWYgKCFzdGF0ZS5wYXVzZWQgfHwgIXN0YXRlLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgc3RhdGUucGF1c2VkID0gZmFsc2U7XG4gICAgICB1cGRhdGVUYWJiYWJsZU5vZGVzKCk7XG4gICAgICBhZGRMaXN0ZW5lcnMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgdXBkYXRlQ29udGFpbmVyRWxlbWVudHM6IGZ1bmN0aW9uIHVwZGF0ZUNvbnRhaW5lckVsZW1lbnRzKGNvbnRhaW5lckVsZW1lbnRzKSB7XG4gICAgICB2YXIgZWxlbWVudHNBc0FycmF5ID0gW10uY29uY2F0KGNvbnRhaW5lckVsZW1lbnRzKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICBzdGF0ZS5jb250YWluZXJzID0gZWxlbWVudHNBc0FycmF5Lm1hcChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnID8gZG9jLnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChzdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgdXBkYXRlVGFiYmFibGVOb2RlcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07IC8vIGluaXRpYWxpemUgY29udGFpbmVyIGVsZW1lbnRzXG5cbiAgdHJhcC51cGRhdGVDb250YWluZXJFbGVtZW50cyhlbGVtZW50cyk7XG4gIHJldHVybiB0cmFwO1xufTtcblxuZXhwb3J0IHsgY3JlYXRlRm9jdXNUcmFwIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1mb2N1cy10cmFwLmVzbS5qcy5tYXBcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiFcbiogdGFiYmFibGUgNS4yLjBcbiogQGxpY2Vuc2UgTUlULCBodHRwczovL2dpdGh1Yi5jb20vZm9jdXMtdHJhcC90YWJiYWJsZS9ibG9iL21hc3Rlci9MSUNFTlNFXG4qL1xudmFyIGNhbmRpZGF0ZVNlbGVjdG9ycyA9IFsnaW5wdXQnLCAnc2VsZWN0JywgJ3RleHRhcmVhJywgJ2FbaHJlZl0nLCAnYnV0dG9uJywgJ1t0YWJpbmRleF0nLCAnYXVkaW9bY29udHJvbHNdJywgJ3ZpZGVvW2NvbnRyb2xzXScsICdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScsICdkZXRhaWxzPnN1bW1hcnk6Zmlyc3Qtb2YtdHlwZScsICdkZXRhaWxzJ107XG52YXIgY2FuZGlkYXRlU2VsZWN0b3IgPSAvKiAjX19QVVJFX18gKi9jYW5kaWRhdGVTZWxlY3RvcnMuam9pbignLCcpO1xudmFyIG1hdGNoZXMgPSB0eXBlb2YgRWxlbWVudCA9PT0gJ3VuZGVmaW5lZCcgPyBmdW5jdGlvbiAoKSB7fSA6IEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgfHwgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuXG52YXIgZ2V0Q2FuZGlkYXRlcyA9IGZ1bmN0aW9uIGdldENhbmRpZGF0ZXMoZWwsIGluY2x1ZGVDb250YWluZXIsIGZpbHRlcikge1xuICB2YXIgY2FuZGlkYXRlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShlbC5xdWVyeVNlbGVjdG9yQWxsKGNhbmRpZGF0ZVNlbGVjdG9yKSk7XG5cbiAgaWYgKGluY2x1ZGVDb250YWluZXIgJiYgbWF0Y2hlcy5jYWxsKGVsLCBjYW5kaWRhdGVTZWxlY3RvcikpIHtcbiAgICBjYW5kaWRhdGVzLnVuc2hpZnQoZWwpO1xuICB9XG5cbiAgY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMuZmlsdGVyKGZpbHRlcik7XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcblxudmFyIGlzQ29udGVudEVkaXRhYmxlID0gZnVuY3Rpb24gaXNDb250ZW50RWRpdGFibGUobm9kZSkge1xuICByZXR1cm4gbm9kZS5jb250ZW50RWRpdGFibGUgPT09ICd0cnVlJztcbn07XG5cbnZhciBnZXRUYWJpbmRleCA9IGZ1bmN0aW9uIGdldFRhYmluZGV4KG5vZGUpIHtcbiAgdmFyIHRhYmluZGV4QXR0ciA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpLCAxMCk7XG5cbiAgaWYgKCFpc05hTih0YWJpbmRleEF0dHIpKSB7XG4gICAgcmV0dXJuIHRhYmluZGV4QXR0cjtcbiAgfSAvLyBCcm93c2VycyBkbyBub3QgcmV0dXJuIGB0YWJJbmRleGAgY29ycmVjdGx5IGZvciBjb250ZW50RWRpdGFibGUgbm9kZXM7XG4gIC8vIHNvIGlmIHRoZXkgZG9uJ3QgaGF2ZSBhIHRhYmluZGV4IGF0dHJpYnV0ZSBzcGVjaWZpY2FsbHkgc2V0LCBhc3N1bWUgaXQncyAwLlxuXG5cbiAgaWYgKGlzQ29udGVudEVkaXRhYmxlKG5vZGUpKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0gLy8gaW4gQ2hyb21lLCA8ZGV0YWlscy8+LCA8YXVkaW8gY29udHJvbHMvPiBhbmQgPHZpZGVvIGNvbnRyb2xzLz4gZWxlbWVudHMgZ2V0IGEgZGVmYXVsdFxuICAvLyAgYHRhYkluZGV4YCBvZiAtMSB3aGVuIHRoZSAndGFiaW5kZXgnIGF0dHJpYnV0ZSBpc24ndCBzcGVjaWZpZWQgaW4gdGhlIERPTSxcbiAgLy8gIHlldCB0aGV5IGFyZSBzdGlsbCBwYXJ0IG9mIHRoZSByZWd1bGFyIHRhYiBvcmRlcjsgaW4gRkYsIHRoZXkgZ2V0IGEgZGVmYXVsdFxuICAvLyAgYHRhYkluZGV4YCBvZiAwOyBzaW5jZSBDaHJvbWUgc3RpbGwgcHV0cyB0aG9zZSBlbGVtZW50cyBpbiB0aGUgcmVndWxhciB0YWJcbiAgLy8gIG9yZGVyLCBjb25zaWRlciB0aGVpciB0YWIgaW5kZXggdG8gYmUgMC5cblxuXG4gIGlmICgobm9kZS5ub2RlTmFtZSA9PT0gJ0FVRElPJyB8fCBub2RlLm5vZGVOYW1lID09PSAnVklERU8nIHx8IG5vZGUubm9kZU5hbWUgPT09ICdERVRBSUxTJykgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykgPT09IG51bGwpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHJldHVybiBub2RlLnRhYkluZGV4O1xufTtcblxudmFyIHNvcnRPcmRlcmVkVGFiYmFibGVzID0gZnVuY3Rpb24gc29ydE9yZGVyZWRUYWJiYWJsZXMoYSwgYikge1xuICByZXR1cm4gYS50YWJJbmRleCA9PT0gYi50YWJJbmRleCA/IGEuZG9jdW1lbnRPcmRlciAtIGIuZG9jdW1lbnRPcmRlciA6IGEudGFiSW5kZXggLSBiLnRhYkluZGV4O1xufTtcblxudmFyIGlzSW5wdXQgPSBmdW5jdGlvbiBpc0lucHV0KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZSA9PT0gJ0lOUFVUJztcbn07XG5cbnZhciBpc0hpZGRlbklucHV0ID0gZnVuY3Rpb24gaXNIaWRkZW5JbnB1dChub2RlKSB7XG4gIHJldHVybiBpc0lucHV0KG5vZGUpICYmIG5vZGUudHlwZSA9PT0gJ2hpZGRlbic7XG59O1xuXG52YXIgaXNEZXRhaWxzV2l0aFN1bW1hcnkgPSBmdW5jdGlvbiBpc0RldGFpbHNXaXRoU3VtbWFyeShub2RlKSB7XG4gIHZhciByID0gbm9kZS50YWdOYW1lID09PSAnREVUQUlMUycgJiYgQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG5vZGUuY2hpbGRyZW4pLnNvbWUoZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgcmV0dXJuIGNoaWxkLnRhZ05hbWUgPT09ICdTVU1NQVJZJztcbiAgfSk7XG4gIHJldHVybiByO1xufTtcblxudmFyIGdldENoZWNrZWRSYWRpbyA9IGZ1bmN0aW9uIGdldENoZWNrZWRSYWRpbyhub2RlcywgZm9ybSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5vZGVzW2ldLmNoZWNrZWQgJiYgbm9kZXNbaV0uZm9ybSA9PT0gZm9ybSkge1xuICAgICAgcmV0dXJuIG5vZGVzW2ldO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGlzVGFiYmFibGVSYWRpbyA9IGZ1bmN0aW9uIGlzVGFiYmFibGVSYWRpbyhub2RlKSB7XG4gIGlmICghbm9kZS5uYW1lKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgcmFkaW9TY29wZSA9IG5vZGUuZm9ybSB8fCBub2RlLm93bmVyRG9jdW1lbnQ7XG5cbiAgdmFyIHF1ZXJ5UmFkaW9zID0gZnVuY3Rpb24gcXVlcnlSYWRpb3MobmFtZSkge1xuICAgIHJldHVybiByYWRpb1Njb3BlLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwiJyArIG5hbWUgKyAnXCJdJyk7XG4gIH07XG5cbiAgdmFyIHJhZGlvU2V0O1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LkNTUyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5DU1MuZXNjYXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmFkaW9TZXQgPSBxdWVyeVJhZGlvcyh3aW5kb3cuQ1NTLmVzY2FwZShub2RlLm5hbWUpKTtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgcmFkaW9TZXQgPSBxdWVyeVJhZGlvcyhub2RlLm5hbWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvb2tzIGxpa2UgeW91IGhhdmUgYSByYWRpbyBidXR0b24gd2l0aCBhIG5hbWUgYXR0cmlidXRlIGNvbnRhaW5pbmcgaW52YWxpZCBDU1Mgc2VsZWN0b3IgY2hhcmFjdGVycyBhbmQgbmVlZCB0aGUgQ1NTLmVzY2FwZSBwb2x5ZmlsbDogJXMnLCBlcnIubWVzc2FnZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFyIGNoZWNrZWQgPSBnZXRDaGVja2VkUmFkaW8ocmFkaW9TZXQsIG5vZGUuZm9ybSk7XG4gIHJldHVybiAhY2hlY2tlZCB8fCBjaGVja2VkID09PSBub2RlO1xufTtcblxudmFyIGlzUmFkaW8gPSBmdW5jdGlvbiBpc1JhZGlvKG5vZGUpIHtcbiAgcmV0dXJuIGlzSW5wdXQobm9kZSkgJiYgbm9kZS50eXBlID09PSAncmFkaW8nO1xufTtcblxudmFyIGlzTm9uVGFiYmFibGVSYWRpbyA9IGZ1bmN0aW9uIGlzTm9uVGFiYmFibGVSYWRpbyhub2RlKSB7XG4gIHJldHVybiBpc1JhZGlvKG5vZGUpICYmICFpc1RhYmJhYmxlUmFkaW8obm9kZSk7XG59O1xuXG52YXIgaXNIaWRkZW4gPSBmdW5jdGlvbiBpc0hpZGRlbihub2RlLCBkaXNwbGF5Q2hlY2spIHtcbiAgaWYgKGdldENvbXB1dGVkU3R5bGUobm9kZSkudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBpc0RpcmVjdFN1bW1hcnkgPSBtYXRjaGVzLmNhbGwobm9kZSwgJ2RldGFpbHM+c3VtbWFyeTpmaXJzdC1vZi10eXBlJyk7XG4gIHZhciBub2RlVW5kZXJEZXRhaWxzID0gaXNEaXJlY3RTdW1tYXJ5ID8gbm9kZS5wYXJlbnRFbGVtZW50IDogbm9kZTtcblxuICBpZiAobWF0Y2hlcy5jYWxsKG5vZGVVbmRlckRldGFpbHMsICdkZXRhaWxzOm5vdChbb3Blbl0pIConKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKCFkaXNwbGF5Q2hlY2sgfHwgZGlzcGxheUNoZWNrID09PSAnZnVsbCcpIHtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgaWYgKGdldENvbXB1dGVkU3R5bGUobm9kZSkuZGlzcGxheSA9PT0gJ25vbmUnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIH1cbiAgfSBlbHNlIGlmIChkaXNwbGF5Q2hlY2sgPT09ICdub24temVyby1hcmVhJykge1xuICAgIHZhciBfbm9kZSRnZXRCb3VuZGluZ0NsaWUgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICB3aWR0aCA9IF9ub2RlJGdldEJvdW5kaW5nQ2xpZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gX25vZGUkZ2V0Qm91bmRpbmdDbGllLmhlaWdodDtcblxuICAgIHJldHVybiB3aWR0aCA9PT0gMCAmJiBoZWlnaHQgPT09IDA7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZSA9IGZ1bmN0aW9uIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUob3B0aW9ucywgbm9kZSkge1xuICBpZiAobm9kZS5kaXNhYmxlZCB8fCBpc0hpZGRlbklucHV0KG5vZGUpIHx8IGlzSGlkZGVuKG5vZGUsIG9wdGlvbnMuZGlzcGxheUNoZWNrKSB8fFxuICAvKiBGb3IgYSBkZXRhaWxzIGVsZW1lbnQgd2l0aCBhIHN1bW1hcnksIHRoZSBzdW1tYXJ5IGVsZW1lbnQgZ2V0cyB0aGUgZm9jdXNlZCAgKi9cbiAgaXNEZXRhaWxzV2l0aFN1bW1hcnkobm9kZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbnZhciBpc05vZGVNYXRjaGluZ1NlbGVjdG9yVGFiYmFibGUgPSBmdW5jdGlvbiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yVGFiYmFibGUob3B0aW9ucywgbm9kZSkge1xuICBpZiAoIWlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUob3B0aW9ucywgbm9kZSkgfHwgaXNOb25UYWJiYWJsZVJhZGlvKG5vZGUpIHx8IGdldFRhYmluZGV4KG5vZGUpIDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxudmFyIHRhYmJhYmxlID0gZnVuY3Rpb24gdGFiYmFibGUoZWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciByZWd1bGFyVGFiYmFibGVzID0gW107XG4gIHZhciBvcmRlcmVkVGFiYmFibGVzID0gW107XG4gIHZhciBjYW5kaWRhdGVzID0gZ2V0Q2FuZGlkYXRlcyhlbCwgb3B0aW9ucy5pbmNsdWRlQ29udGFpbmVyLCBpc05vZGVNYXRjaGluZ1NlbGVjdG9yVGFiYmFibGUuYmluZChudWxsLCBvcHRpb25zKSk7XG4gIGNhbmRpZGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAoY2FuZGlkYXRlLCBpKSB7XG4gICAgdmFyIGNhbmRpZGF0ZVRhYmluZGV4ID0gZ2V0VGFiaW5kZXgoY2FuZGlkYXRlKTtcblxuICAgIGlmIChjYW5kaWRhdGVUYWJpbmRleCA9PT0gMCkge1xuICAgICAgcmVndWxhclRhYmJhYmxlcy5wdXNoKGNhbmRpZGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9yZGVyZWRUYWJiYWJsZXMucHVzaCh7XG4gICAgICAgIGRvY3VtZW50T3JkZXI6IGksXG4gICAgICAgIHRhYkluZGV4OiBjYW5kaWRhdGVUYWJpbmRleCxcbiAgICAgICAgbm9kZTogY2FuZGlkYXRlXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICB2YXIgdGFiYmFibGVOb2RlcyA9IG9yZGVyZWRUYWJiYWJsZXMuc29ydChzb3J0T3JkZXJlZFRhYmJhYmxlcykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIGEubm9kZTtcbiAgfSkuY29uY2F0KHJlZ3VsYXJUYWJiYWJsZXMpO1xuICByZXR1cm4gdGFiYmFibGVOb2Rlcztcbn07XG5cbnZhciBmb2N1c2FibGUgPSBmdW5jdGlvbiBmb2N1c2FibGUoZWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBjYW5kaWRhdGVzID0gZ2V0Q2FuZGlkYXRlcyhlbCwgb3B0aW9ucy5pbmNsdWRlQ29udGFpbmVyLCBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlLmJpbmQobnVsbCwgb3B0aW9ucykpO1xuICByZXR1cm4gY2FuZGlkYXRlcztcbn07XG5cbnZhciBpc1RhYmJhYmxlID0gZnVuY3Rpb24gaXNUYWJiYWJsZShub2RlLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmICghbm9kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gbm9kZSBwcm92aWRlZCcpO1xuICB9XG5cbiAgaWYgKG1hdGNoZXMuY2FsbChub2RlLCBjYW5kaWRhdGVTZWxlY3RvcikgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZShvcHRpb25zLCBub2RlKTtcbn07XG5cbnZhciBmb2N1c2FibGVDYW5kaWRhdGVTZWxlY3RvciA9IC8qICNfX1BVUkVfXyAqL2NhbmRpZGF0ZVNlbGVjdG9ycy5jb25jYXQoJ2lmcmFtZScpLmpvaW4oJywnKTtcblxudmFyIGlzRm9jdXNhYmxlID0gZnVuY3Rpb24gaXNGb2N1c2FibGUobm9kZSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoIW5vZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIG5vZGUgcHJvdmlkZWQnKTtcbiAgfVxuXG4gIGlmIChtYXRjaGVzLmNhbGwobm9kZSwgZm9jdXNhYmxlQ2FuZGlkYXRlU2VsZWN0b3IpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlKG9wdGlvbnMsIG5vZGUpO1xufTtcblxuZXhwb3J0IHsgZm9jdXNhYmxlLCBpc0ZvY3VzYWJsZSwgaXNUYWJiYWJsZSwgdGFiYmFibGUgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmVzbS5qcy5tYXBcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiLy8gVGhlIGNodW5rIGxvYWRpbmcgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgY2h1bmtzXG4vLyBTaW5jZSBhbGwgcmVmZXJlbmNlZCBjaHVua3MgYXJlIGFscmVhZHkgaW5jbHVkZWRcbi8vIGluIHRoaXMgZmlsZSwgdGhpcyBmdW5jdGlvbiBpcyBlbXB0eSBoZXJlLlxuX193ZWJwYWNrX3JlcXVpcmVfXy5lID0gKCkgPT4gKFByb21pc2UucmVzb2x2ZSgpKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiL3B1YmxpYy9tYWluXCI6IDAsXG5cdFwicHVibGljL21haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRzW2ldXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua2ExN190b29sa2l0XCJdID0gc2VsZltcIndlYnBhY2tDaHVua2ExN190b29sa2l0XCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxuX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1wicHVibGljL21haW5cIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9yZXNvdXJjZXMvZnJvbnRlbmQvanMvbWFpbi5qc1wiKSkpXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInB1YmxpYy9tYWluXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vcmVzb3VyY2VzL2Zyb250ZW5kL2Nzcy9tYWluLmNzc1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbImRlZmF1bHQiLCJBY2NvcmRpb24iLCJNb2RhbCIsIlZpZGVvQmFja2dyb3VuZCIsIm1hbmFnZUJlaGF2aW9ycyIsIkJlaGF2aW9ycyIsImRvY3VtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImJyZWFrcG9pbnRzIiwiY3JlYXRlQmVoYXZpb3IiLCJ0b2dnbGUiLCJlIiwicHJldmVudERlZmF1bHQiLCJpbmRleCIsImN1cnJlbnRUYXJnZXQiLCJnZXRBdHRyaWJ1dGUiLCJfZGF0YSIsImFjdGl2ZUluZGV4ZXMiLCJpbmNsdWRlcyIsImNsb3NlIiwiZmlsdGVyIiwiaXRlbSIsIm9wZW4iLCJwdXNoIiwiYWN0aXZlVHJpZ2dlciIsIiR0cmlnZ2VycyIsImFjdGl2ZUljb24iLCIkdHJpZ2dlckljb25zIiwiYWN0aXZlQ29udGVudCIsIiRjb250ZW50cyIsInN0eWxlIiwiaGVpZ2h0Iiwic2V0QXR0cmlidXRlIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwiYWN0aXZlQ29udGVudElubmVyIiwiJGNvbnRlbnRJbm5lcnMiLCJjb250ZW50SGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0IiwiYWRkIiwiaW5pdCIsIiRpbml0T3BlbiIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsInRyaWdnZXIiLCJjbGljayIsImVuYWJsZWQiLCJyZXNpemVkIiwibWVkaWFRdWVyeVVwZGF0ZWQiLCJkaXNhYmxlZCIsImRlc3Ryb3kiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGlzYWJsZUJvZHlTY3JvbGwiLCJlbmFibGVCb2R5U2Nyb2xsIiwiZm9jdXNUcmFwIiwiaXNBY3RpdmUiLCIkbm9kZSIsImFjdGl2ZUNsYXNzZXMiLCJkZWFjdGl2YXRlIiwiZGlzcGF0Y2hFdmVudCIsIkN1c3RvbUV2ZW50Iiwic2V0VGltZW91dCIsImFjdGl2YXRlIiwiaGFuZGxlRXNjIiwia2V5IiwiaGFuZGxlQ2xpY2tPdXRzaWRlIiwidGFyZ2V0IiwiaWQiLCJhZGRMaXN0ZW5lciIsImFyciIsImZ1bmMiLCJhcnJMZW5ndGgiLCJsZW5ndGgiLCJpIiwicmVtb3ZlTGlzdGVuZXIiLCIkZm9jdXNUcmFwIiwiZ2V0Q2hpbGQiLCIkY2xvc2VCdXR0b25zIiwiJGluaXRpYWxGb2N1cyIsImNvbnNvbGUiLCJ3YXJuIiwiY3JlYXRlRm9jdXNUcmFwIiwiaW5pdGlhbEZvY3VzIiwibW9kYWxJZCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJvcHRpb25zIiwiaXNQbGF5aW5nIiwiJHBsYXllciIsInBhdXNlIiwicGxheSIsInVwZGF0ZUJ1dHRvbiIsImhhbmRsZVBsYXkiLCJoYW5kbGVQYXVzZSIsImJ1dHRvblRleHQiLCIkcGF1c2VCdXR0b24iLCJpbm5lclRleHQiLCJ0b1N0cmluZyIsInF1ZXJ5U2VsZWN0b3IiXSwic291cmNlUm9vdCI6IiJ9