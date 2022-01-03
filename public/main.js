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
    __webpack_require__("./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*\\/.*\\/.*\\..*$")(`${process.env.BEHAVIORS_PATH}/${(process.env.BEHAVIORS_COMPONENT_PATHS[bName]||'').replace(/^\/|\/$/ig,'')}/${bName}.${process.env.BEHAVIORS_EXTENSION }`).then(module => {
      behaviorImported(bName, bNode, module);
    }).catch(err => {
      console.warn(`No loaded behavior called: ${bName}`);
      // fail, clean up
      importFailed(bName);
    });
  } catch(err1) {
    try {
      __webpack_require__("./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*\\/.*\\..*$")(`${process.env.BEHAVIORS_PATH}/${bName}.${process.env.BEHAVIORS_EXTENSION}`).then(module => {
        behaviorImported(bName, bNode, module);
      }).catch(err => {
        console.warn(`No loaded behavior called: ${bName}`);
        // fail, clean up
        importFailed(bName);
      });
    } catch(err2) {
      console.warn(`Unknown behavior called: ${bName}. \nIt maybe the behavior doesn't exist, check for typos and check Webpack has generated your file. \nIf you are using dynamically imported behaviors, you may also want to check your webpack config. See https://github.com/area17/a17-behaviors/wiki/Setup#webpack-config`);
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

/***/ "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*\\/.*\\..*$":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@area17/a17-behaviors/dist/esm/ lazy ^.*\/.*\..*$ namespace object ***!
  \*****************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
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
webpackAsyncContext.id = "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*\\/.*\\..*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*\\/.*\\/.*\\..*$":
/*!*********************************************************************************************!*\
  !*** ./node_modules/@area17/a17-behaviors/dist/esm/ lazy ^.*\/.*\/.*\..*$ namespace object ***!
  \*********************************************************************************************/
/***/ ((module) => {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(() => {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = () => ([]);
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./node_modules/@area17/a17-behaviors/dist/esm lazy recursive ^.*\\/.*\\/.*\\..*$";
module.exports = webpackEmptyAsyncContext;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLE1BQU07QUFDdkMsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxNQUFNO0FBQ3ZDLElBQUk7QUFDSjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxJQUFJO0FBQ0osaUNBQWlDLEtBQUssaUJBQWlCLE1BQU07QUFDN0Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSSxJQUFzRDtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUV3RDs7Ozs7Ozs7Ozs7QUMxN0J4RDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1pBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ0RBO0FBQ0E7QUFFQU0sUUFBUSxDQUFDQyxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBWTtBQUN0REgsRUFBQUEsc0VBQWUsQ0FBQ0MsdUNBQUQsRUFBWTtBQUN2QkcsSUFBQUEsV0FBVyxFQUFFLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLEVBQW1CLElBQW5CLEVBQXlCLEtBQXpCO0FBRFUsR0FBWixDQUFmO0FBR0gsQ0FKRDs7Ozs7Ozs7Ozs7Ozs7OztBQ0hBO0FBRUEsSUFBTVAsU0FBUyxHQUFHUSxxRUFBYyxDQUM1QixXQUQ0QixFQUU1QjtBQUNJQyxFQUFBQSxNQURKLGtCQUNXQyxDQURYLEVBQ2M7QUFDTkEsSUFBQUEsQ0FBQyxDQUFDQyxjQUFGO0FBRUEsUUFBTUMsS0FBSyxHQUFHRixDQUFDLENBQUNHLGFBQUYsQ0FBZ0JDLFlBQWhCLENBQTZCLHNCQUE3QixDQUFkOztBQUVBLFFBQUksS0FBS0MsS0FBTCxDQUFXQyxhQUFYLENBQXlCQyxRQUF6QixDQUFrQ0wsS0FBbEMsQ0FBSixFQUE4QztBQUMxQyxXQUFLTSxLQUFMLENBQVdOLEtBQVg7QUFFQSxXQUFLRyxLQUFMLENBQVdDLGFBQVgsR0FBMkIsS0FBS0QsS0FBTCxDQUFXQyxhQUFYLENBQXlCRyxNQUF6QixDQUN2QixVQUFDQyxJQUFELEVBQVU7QUFDTixlQUFPQSxJQUFJLEtBQUtSLEtBQWhCO0FBQ0gsT0FIc0IsQ0FBM0I7QUFLSCxLQVJELE1BUU87QUFDSCxXQUFLUyxJQUFMLENBQVVULEtBQVY7O0FBQ0EsV0FBS0csS0FBTCxDQUFXQyxhQUFYLENBQXlCTSxJQUF6QixDQUE4QlYsS0FBOUI7QUFDSDtBQUNKLEdBbEJMO0FBb0JJTSxFQUFBQSxLQXBCSixpQkFvQlVOLEtBcEJWLEVBb0JpQjtBQUNULFFBQU1XLGFBQWEsR0FBRyxLQUFLQyxTQUFMLENBQWVaLEtBQWYsQ0FBdEI7QUFDQSxRQUFNYSxVQUFVLEdBQUcsS0FBS0MsYUFBTCxDQUFtQmQsS0FBbkIsQ0FBbkI7QUFDQSxRQUFNZSxhQUFhLEdBQUcsS0FBS0MsU0FBTCxDQUFlaEIsS0FBZixDQUF0QjtBQUVBZSxJQUFBQSxhQUFhLENBQUNFLEtBQWQsQ0FBb0JDLE1BQXBCLEdBQTZCLEtBQTdCO0FBRUFQLElBQUFBLGFBQWEsQ0FBQ1EsWUFBZCxDQUEyQixlQUEzQixFQUE0QyxPQUE1QztBQUNBSixJQUFBQSxhQUFhLENBQUNJLFlBQWQsQ0FBMkIsYUFBM0IsRUFBMEMsTUFBMUM7QUFDQU4sSUFBQUEsVUFBVSxDQUFDTyxTQUFYLENBQXFCQyxNQUFyQixDQUE0QixZQUE1QjtBQUNILEdBOUJMO0FBZ0NJWixFQUFBQSxJQWhDSixnQkFnQ1NULEtBaENULEVBZ0NnQjtBQUNSLFFBQU1XLGFBQWEsR0FBRyxLQUFLQyxTQUFMLENBQWVaLEtBQWYsQ0FBdEI7QUFDQSxRQUFNYSxVQUFVLEdBQUcsS0FBS0MsYUFBTCxDQUFtQmQsS0FBbkIsQ0FBbkI7QUFDQSxRQUFNZSxhQUFhLEdBQUcsS0FBS0MsU0FBTCxDQUFlaEIsS0FBZixDQUF0QjtBQUNBLFFBQU1zQixrQkFBa0IsR0FBRyxLQUFLQyxjQUFMLENBQW9CdkIsS0FBcEIsQ0FBM0I7QUFDQSxRQUFNd0IsYUFBYSxHQUFHRixrQkFBa0IsQ0FBQ0csWUFBekM7QUFFQVYsSUFBQUEsYUFBYSxDQUFDRSxLQUFkLENBQW9CQyxNQUFwQixhQUFnQ00sYUFBaEM7QUFFQWIsSUFBQUEsYUFBYSxDQUFDUSxZQUFkLENBQTJCLGVBQTNCLEVBQTRDLE1BQTVDO0FBQ0FKLElBQUFBLGFBQWEsQ0FBQ0ksWUFBZCxDQUEyQixhQUEzQixFQUEwQyxPQUExQztBQUNBTixJQUFBQSxVQUFVLENBQUNPLFNBQVgsQ0FBcUJNLEdBQXJCLENBQXlCLFlBQXpCO0FBQ0g7QUE1Q0wsQ0FGNEIsRUFnRDVCO0FBQ0lDLEVBQUFBLElBREosa0JBQ1c7QUFBQTs7QUFDSCxTQUFLeEIsS0FBTCxDQUFXQyxhQUFYLEdBQTJCLEVBQTNCO0FBRUEsU0FBS3dCLFNBQUwsR0FBaUIsS0FBS0MsV0FBTCxDQUFpQixXQUFqQixDQUFqQjtBQUNBLFNBQUtqQixTQUFMLEdBQWlCLEtBQUtpQixXQUFMLENBQWlCLFNBQWpCLENBQWpCO0FBQ0EsU0FBS2YsYUFBTCxHQUFxQixLQUFLZSxXQUFMLENBQWlCLGNBQWpCLENBQXJCO0FBQ0EsU0FBS2IsU0FBTCxHQUFpQixLQUFLYSxXQUFMLENBQWlCLFNBQWpCLENBQWpCO0FBQ0EsU0FBS04sY0FBTCxHQUFzQixLQUFLTSxXQUFMLENBQWlCLGVBQWpCLENBQXRCO0FBRUEsU0FBS2pCLFNBQUwsQ0FBZWtCLE9BQWYsQ0FBdUIsVUFBQ0MsT0FBRCxFQUFhO0FBQ2hDQSxNQUFBQSxPQUFPLENBQUNyQyxnQkFBUixDQUF5QixPQUF6QixFQUFrQyxLQUFJLENBQUNHLE1BQXZDLEVBQStDLEtBQS9DO0FBQ0gsS0FGRDtBQUlBLFNBQUsrQixTQUFMLENBQWVFLE9BQWYsQ0FBdUIsVUFBQ0MsT0FBRCxFQUFhO0FBQ2hDQSxNQUFBQSxPQUFPLENBQUNDLEtBQVI7QUFDSCxLQUZEO0FBR0gsR0FqQkw7QUFrQklDLEVBQUFBLE9BbEJKLHFCQWtCYyxDQUFFLENBbEJoQjtBQW1CSUMsRUFBQUEsT0FuQkoscUJBbUJjLENBQUUsQ0FuQmhCO0FBb0JJQyxFQUFBQSxpQkFwQkosK0JBb0J3QixDQUFFLENBcEIxQjtBQXFCSUMsRUFBQUEsUUFyQkosc0JBcUJlLENBQUUsQ0FyQmpCO0FBc0JJQyxFQUFBQSxPQXRCSixxQkFzQmM7QUFBQTs7QUFDTixTQUFLekIsU0FBTCxDQUFla0IsT0FBZixDQUF1QixVQUFDQyxPQUFELEVBQWE7QUFDaENBLE1BQUFBLE9BQU8sQ0FBQ08sbUJBQVIsQ0FBNEIsT0FBNUIsRUFBcUMsTUFBSSxDQUFDekMsTUFBMUM7QUFDSCxLQUZEO0FBR0g7QUExQkwsQ0FoRDRCLENBQWhDO0FBOEVBLGlFQUFlVCxTQUFmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoRkE7QUFDQTtBQUNBO0FBRUEsSUFBTUMsS0FBSyxHQUFHTyxxRUFBYyxDQUN4QixPQUR3QixFQUV4QjtBQUNJQyxFQUFBQSxNQURKLGtCQUNXQyxDQURYLEVBQ2M7QUFDTkEsSUFBQUEsQ0FBQyxDQUFDQyxjQUFGOztBQUVBLFFBQUksS0FBS0ksS0FBTCxDQUFXdUMsUUFBZixFQUF5QjtBQUNyQixXQUFLcEMsS0FBTDtBQUNILEtBRkQsTUFFTztBQUNILFdBQUtHLElBQUw7QUFDSDtBQUNKLEdBVEw7QUFXSUgsRUFBQUEsS0FYSixpQkFXVVIsQ0FYVixFQVdhO0FBQ0wsUUFBSSxLQUFLSyxLQUFMLENBQVd1QyxRQUFmLEVBQXlCO0FBQUE7O0FBQ3JCLG9DQUFLQyxLQUFMLENBQVd2QixTQUFYLEVBQXFCQyxNQUFyQixpREFBK0IsS0FBS2xCLEtBQUwsQ0FBV3lDLGFBQTFDOztBQUNBLFdBQUt6QyxLQUFMLENBQVdzQyxTQUFYLENBQXFCSSxVQUFyQjs7QUFDQSxXQUFLMUMsS0FBTCxDQUFXdUMsUUFBWCxHQUFzQixLQUF0QjtBQUNBRixNQUFBQSxrRUFBZ0IsQ0FBQyxLQUFLRyxLQUFOLENBQWhCO0FBRUEsV0FBS0EsS0FBTCxDQUFXRyxhQUFYLENBQXlCLElBQUlDLFdBQUosQ0FBZ0IsY0FBaEIsQ0FBekI7QUFDSDtBQUNKLEdBcEJMO0FBc0JJdEMsRUFBQUEsSUF0Qkosa0JBc0JXO0FBQUE7QUFBQTs7QUFDSGhCLElBQUFBLFFBQVEsQ0FBQ3FELGFBQVQsQ0FBdUIsSUFBSUMsV0FBSixDQUFnQixnQkFBaEIsQ0FBdkI7O0FBRUEsbUNBQUtKLEtBQUwsQ0FBV3ZCLFNBQVgsRUFBcUJNLEdBQXJCLGtEQUE0QixLQUFLdkIsS0FBTCxDQUFXeUMsYUFBdkM7O0FBQ0EsU0FBS3pDLEtBQUwsQ0FBV3VDLFFBQVgsR0FBc0IsSUFBdEI7QUFFQU0sSUFBQUEsVUFBVSxDQUFDLFlBQU07QUFDYixXQUFJLENBQUM3QyxLQUFMLENBQVdzQyxTQUFYLENBQXFCUSxRQUFyQjs7QUFDQVYsTUFBQUEsbUVBQWlCLENBQUMsS0FBSSxDQUFDSSxLQUFOLENBQWpCO0FBQ0gsS0FIUyxFQUdQLEdBSE8sQ0FBVjtBQUlILEdBaENMO0FBa0NJTyxFQUFBQSxTQWxDSixxQkFrQ2NwRCxDQWxDZCxFQWtDaUI7QUFDVCxRQUFJQSxDQUFDLENBQUNxRCxHQUFGLEtBQVUsUUFBZCxFQUF3QjtBQUNwQixXQUFLN0MsS0FBTDtBQUNIO0FBQ0osR0F0Q0w7QUF3Q0k4QyxFQUFBQSxrQkF4Q0osOEJBd0N1QnRELENBeEN2QixFQXdDMEI7QUFDbEIsUUFBSUEsQ0FBQyxDQUFDdUQsTUFBRixDQUFTQyxFQUFULEtBQWdCLEtBQUtYLEtBQUwsQ0FBV1csRUFBL0IsRUFBbUM7QUFDL0IsV0FBS2hELEtBQUwsQ0FBV1IsQ0FBWDtBQUNIO0FBQ0osR0E1Q0w7QUE4Q0l5RCxFQUFBQSxXQTlDSix1QkE4Q2dCQyxHQTlDaEIsRUE4Q3FCQyxJQTlDckIsRUE4QzJCO0FBQ25CLFFBQUlDLFNBQVMsR0FBR0YsR0FBRyxDQUFDRyxNQUFwQjs7QUFDQSxTQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdGLFNBQXBCLEVBQStCRSxDQUFDLEVBQWhDLEVBQW9DO0FBQ2hDSixNQUFBQSxHQUFHLENBQUNJLENBQUQsQ0FBSCxDQUFPbEUsZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUMrRCxJQUFqQyxFQUF1QyxLQUF2QztBQUNIO0FBQ0osR0FuREw7QUFxRElJLEVBQUFBLGNBckRKLDBCQXFEbUJMLEdBckRuQixFQXFEd0JDLElBckR4QixFQXFEOEI7QUFDdEIsUUFBSUMsU0FBUyxHQUFHRixHQUFHLENBQUNHLE1BQXBCOztBQUNBLFNBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0YsU0FBcEIsRUFBK0JFLENBQUMsRUFBaEMsRUFBb0M7QUFDaENKLE1BQUFBLEdBQUcsQ0FBQ0ksQ0FBRCxDQUFILENBQU90QixtQkFBUCxDQUEyQixPQUEzQixFQUFvQ21CLElBQXBDO0FBQ0g7QUFDSjtBQTFETCxDQUZ3QixFQThEeEI7QUFDSTlCLEVBQUFBLElBREosa0JBQ1c7QUFDSCxTQUFLbUMsVUFBTCxHQUFrQixLQUFLQyxRQUFMLENBQWMsWUFBZCxDQUFsQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsS0FBS25DLFdBQUwsQ0FBaUIsZUFBakIsQ0FBckI7QUFDQSxTQUFLb0MsYUFBTCxHQUFxQixLQUFLRixRQUFMLENBQWMsZUFBZCxDQUFyQjs7QUFFQSxRQUFJLENBQUMsS0FBS0UsYUFBVixFQUF5QjtBQUNyQkMsTUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQ0ksNEtBREo7QUFHSDs7QUFFRCxTQUFLaEUsS0FBTCxDQUFXc0MsU0FBWCxHQUF1QkEsdURBQUEsQ0FBMEIsS0FBS3FCLFVBQS9CLEVBQTJDO0FBQzlETyxNQUFBQSxZQUFZLEVBQUUsS0FBS0o7QUFEMkMsS0FBM0MsQ0FBdkI7QUFJQSxTQUFLOUQsS0FBTCxDQUFXdUMsUUFBWCxHQUFzQixLQUF0QjtBQUNBLFNBQUt2QyxLQUFMLENBQVd5QyxhQUFYLEdBQTJCLENBQUMsNkJBQUQsQ0FBM0I7O0FBRUEsUUFBSSxLQUFLb0IsYUFBVCxFQUF3QjtBQUNwQixXQUFLVCxXQUFMLENBQWlCLEtBQUtTLGFBQXRCLEVBQXFDLEtBQUsxRCxLQUExQztBQUNIOztBQUVELFNBQUtxQyxLQUFMLENBQVdqRCxnQkFBWCxDQUE0QixjQUE1QixFQUE0QyxLQUFLRyxNQUFqRCxFQUF5RCxLQUF6RDtBQUNBLFNBQUs4QyxLQUFMLENBQVdqRCxnQkFBWCxDQUE0QixZQUE1QixFQUEwQyxLQUFLZSxJQUEvQyxFQUFxRCxLQUFyRDtBQUNBLFNBQUtrQyxLQUFMLENBQVdqRCxnQkFBWCxDQUE0QixhQUE1QixFQUEyQyxLQUFLWSxLQUFoRCxFQUF1RCxLQUF2RDtBQUNBYixJQUFBQSxRQUFRLENBQUNDLGdCQUFULENBQTBCLGdCQUExQixFQUE0QyxLQUFLWSxLQUFqRCxFQUF3RCxLQUF4RDtBQUVBYixJQUFBQSxRQUFRLENBQUNDLGdCQUFULENBQTBCLE9BQTFCLEVBQW1DLEtBQUt3RCxTQUF4QyxFQUFtRCxLQUFuRCxFQTNCRyxDQTZCSDs7QUFDQSxRQUFNb0IsT0FBTyxHQUFHLEtBQUszQixLQUFMLENBQVd6QyxZQUFYLENBQXdCLElBQXhCLENBQWhCO0FBQ0EsU0FBS1UsU0FBTCxHQUFpQm5CLFFBQVEsQ0FBQzhFLGdCQUFULGlDQUNXRCxPQURYLFNBQWpCO0FBSUEsU0FBS2YsV0FBTCxDQUFpQixLQUFLM0MsU0FBdEIsRUFBaUMsS0FBS2YsTUFBdEM7O0FBRUEsUUFBSSxLQUFLMkUsT0FBTCxDQUFhLE9BQWIsQ0FBSixFQUEyQjtBQUN2QixXQUFLN0IsS0FBTCxDQUFXakQsZ0JBQVgsQ0FDSSxPQURKLEVBRUksS0FBSzBELGtCQUZULEVBR0ksS0FISjtBQUtIO0FBQ0osR0E3Q0w7QUE4Q0luQixFQUFBQSxPQTlDSixxQkE4Q2MsQ0FBRSxDQTlDaEI7QUErQ0lDLEVBQUFBLE9BL0NKLHFCQStDYyxDQUFFLENBL0NoQjtBQWdESUMsRUFBQUEsaUJBaERKLCtCQWdEd0IsQ0FDaEI7QUFDSCxHQWxETDtBQW1ESUMsRUFBQUEsUUFuREosc0JBbURlLENBQUUsQ0FuRGpCO0FBb0RJQyxFQUFBQSxPQXBESixxQkFvRGM7QUFDTixTQUFLL0IsS0FBTDs7QUFFQSxRQUFJLEtBQUswRCxhQUFULEVBQXdCO0FBQ3BCLFdBQUtILGNBQUwsQ0FBb0IsS0FBS0csYUFBekIsRUFBd0MsS0FBSzFELEtBQTdDO0FBQ0g7O0FBRUQsU0FBS3FDLEtBQUwsQ0FBV0wsbUJBQVgsQ0FBK0IsY0FBL0IsRUFBK0MsS0FBS3pDLE1BQXBEO0FBQ0EsU0FBSzhDLEtBQUwsQ0FBV0wsbUJBQVgsQ0FBK0IsWUFBL0IsRUFBNkMsS0FBSzdCLElBQWxEO0FBQ0EsU0FBS2tDLEtBQUwsQ0FBV0wsbUJBQVgsQ0FBK0IsYUFBL0IsRUFBOEMsS0FBS2hDLEtBQW5EO0FBQ0EsU0FBS3FDLEtBQUwsQ0FBV0wsbUJBQVgsQ0FBK0IsT0FBL0IsRUFBd0MsS0FBS2Msa0JBQTdDO0FBQ0EzRCxJQUFBQSxRQUFRLENBQUM2QyxtQkFBVCxDQUE2QixnQkFBN0IsRUFBK0MsS0FBS2hDLEtBQXBEO0FBRUFiLElBQUFBLFFBQVEsQ0FBQzZDLG1CQUFULENBQTZCLE9BQTdCLEVBQXNDLEtBQUtZLFNBQTNDO0FBRUEsU0FBS1csY0FBTCxDQUFvQixLQUFLakQsU0FBekIsRUFBb0MsS0FBS2YsTUFBekM7QUFDSDtBQXBFTCxDQTlEd0IsQ0FBNUI7QUFzSUEsaUVBQWVSLEtBQWY7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxSUE7QUFFQSxJQUFNQyxlQUFlLEdBQUdNLHFFQUFjLENBQ2xDLGlCQURrQyxFQUVsQztBQUNJQyxFQUFBQSxNQURKLGtCQUNXQyxDQURYLEVBQ2M7QUFDTkEsSUFBQUEsQ0FBQyxDQUFDQyxjQUFGOztBQUVBLFFBQUcsS0FBSzBFLFNBQVIsRUFBa0I7QUFDZCxXQUFLQyxPQUFMLENBQWFDLEtBQWI7QUFDSCxLQUZELE1BRUs7QUFDRCxXQUFLRCxPQUFMLENBQWFFLElBQWI7QUFDSDs7QUFFRCxTQUFLQyxZQUFMO0FBQ0gsR0FYTDtBQVlJQyxFQUFBQSxVQVpKLHNCQVllaEYsQ0FaZixFQVlrQjtBQUNWLFNBQUsyRSxTQUFMLEdBQWlCLElBQWpCO0FBQ0gsR0FkTDtBQWVJTSxFQUFBQSxXQWZKLHVCQWVnQmpGLENBZmhCLEVBZW1CO0FBQ1gsU0FBSzJFLFNBQUwsR0FBaUIsS0FBakI7QUFDSCxHQWpCTDtBQWtCSUksRUFBQUEsWUFsQkosMEJBa0JrQjtBQUNWLFFBQU1HLFVBQVUsR0FBRyxLQUFLUCxTQUFMLEdBQWlCLEtBQUtPLFVBQUwsQ0FBZ0JKLElBQWpDLEdBQXdDLEtBQUtJLFVBQUwsQ0FBZ0JMLEtBQTNFO0FBRUEsU0FBS00sWUFBTCxDQUFrQkMsU0FBbEIsR0FBOEJGLFVBQTlCO0FBQ0EsU0FBS0MsWUFBTCxDQUFrQjlELFlBQWxCLENBQStCLFlBQS9CLEVBQTZDNkQsVUFBN0M7QUFDQSxTQUFLQyxZQUFMLENBQWtCOUQsWUFBbEIsQ0FBK0IsY0FBL0IsRUFBK0MsS0FBS3NELFNBQUwsQ0FBZVUsUUFBZixFQUEvQztBQUNIO0FBeEJMLENBRmtDLEVBNEJsQztBQUNJeEQsRUFBQUEsSUFESixrQkFDVztBQUNILFNBQUs4QyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsU0FBS08sVUFBTCxHQUFrQjtBQUNkSixNQUFBQSxJQUFJLEVBQUUsS0FBS0osT0FBTCxDQUFhLFdBQWIsQ0FEUTtBQUVkRyxNQUFBQSxLQUFLLEVBQUUsS0FBS0gsT0FBTCxDQUFhLFlBQWI7QUFGTyxLQUFsQjtBQUtBLFNBQUtFLE9BQUwsR0FBZSxLQUFLWCxRQUFMLENBQWMsUUFBZCxDQUFmO0FBQ0EsU0FBS2tCLFlBQUwsR0FBb0IsS0FBS2xCLFFBQUwsQ0FBYyxVQUFkLEVBQTBCcUIsYUFBMUIsQ0FBd0MsUUFBeEMsQ0FBcEI7QUFFQSxTQUFLVixPQUFMLENBQWFoRixnQkFBYixDQUE4QixNQUE5QixFQUFzQyxLQUFLb0YsVUFBM0MsRUFBdUQsS0FBdkQ7QUFDQSxTQUFLSixPQUFMLENBQWFoRixnQkFBYixDQUE4QixPQUE5QixFQUF1QyxLQUFLcUYsV0FBNUMsRUFBeUQsS0FBekQ7QUFDQSxTQUFLRSxZQUFMLENBQWtCdkYsZ0JBQWxCLENBQW1DLE9BQW5DLEVBQTRDLEtBQUtHLE1BQWpELEVBQXlELEtBQXpEO0FBQ0gsR0FkTDtBQWVJb0MsRUFBQUEsT0FmSixxQkFlYyxDQUFFLENBZmhCO0FBZ0JJQyxFQUFBQSxPQWhCSixxQkFnQmMsQ0FBRSxDQWhCaEI7QUFpQklDLEVBQUFBLGlCQWpCSiwrQkFpQndCLENBQUUsQ0FqQjFCO0FBa0JJQyxFQUFBQSxRQWxCSixzQkFrQmUsQ0FBRSxDQWxCakI7QUFtQklDLEVBQUFBLE9BbkJKLHFCQW1CYztBQUNOLFNBQUtxQyxPQUFMLENBQWFwQyxtQkFBYixDQUFpQyxNQUFqQyxFQUF5QyxLQUFLd0MsVUFBOUM7QUFDQSxTQUFLSixPQUFMLENBQWFwQyxtQkFBYixDQUFpQyxPQUFqQyxFQUEwQyxLQUFLeUMsV0FBL0M7QUFDQSxTQUFLRSxZQUFMLENBQWtCM0MsbUJBQWxCLENBQXNDLE9BQXRDLEVBQStDLEtBQUt6QyxNQUFwRDtBQUNIO0FBdkJMLENBNUJrQyxDQUF0QztBQXVEQSxpRUFBZVAsZUFBZjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6REEsbUNBQW1DLDBCQUEwQiwwQ0FBMEMsZ0JBQWdCLE9BQU8sb0JBQW9CLGVBQWUsT0FBTzs7QUFFeEs7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxnRkFBZ0YsZ0JBQWdCO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrRkFBa0YsaUJBQWlCO0FBQ25HO0FBQ0E7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSxxRkFBcUYsaUJBQWlCO0FBQ3RHO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxxRkFBcUYsaUJBQWlCO0FBQ3RHO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ2lEOztBQUVqRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQixzQkFBc0I7QUFDeEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHLG1EQUFtRDtBQUN0RDs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjs7QUFFQSxpQkFBaUI7QUFDakIsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxXQUFXLE1BQU07QUFDakIsYUFBYSxHQUFHO0FBQ2hCOzs7QUFHQTtBQUNBLDJGQUEyRixhQUFhO0FBQ3hHO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUSxpR0FBaUc7QUFDdkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsY0FBYzs7QUFFZCxvQkFBb0I7QUFDcEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEIsa0RBQVE7O0FBRWxDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSyxHQUFHO0FBQ1I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2REFBNkQ7QUFDN0Q7QUFDQTtBQUNBLHdEQUF3RCxxREFBVztBQUNuRSxPQUFPO0FBQ1A7QUFDQSxNQUFNO0FBQ047QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7O0FBR047QUFDQSxLQUFLOzs7QUFHTDtBQUNBLHVEQUF1RDs7QUFFdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNOztBQUVOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxNQUFNOzs7QUFHTix5Q0FBeUM7QUFDekM7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtEQUFrRDs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRTJCO0FBQzNCOzs7Ozs7Ozs7Ozs7O0FDcm5CQTs7Ozs7Ozs7Ozs7QUNBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHNCQUFzQjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0NBQXND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Ozs7O1VFakRBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbS9pbmRleC5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy9AYXJlYTE3L2ExNy1iZWhhdmlvcnMvZGlzdC9lc218bGF6eXwvXi4qXFwvLipcXC4uKiQvfGdyb3VwT3B0aW9uczoge318bmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy9AYXJlYTE3L2ExNy1iZWhhdmlvcnMvZGlzdC9lc218bGF6eXwvXi4qXFwvLipcXC8uKlxcLi4qJC98Z3JvdXBPcHRpb25zOiB7fXxuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vcmVzb3VyY2VzL2Zyb250ZW5kL2pzL2JlaGF2aW9ycy9pbmRleC5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL3Jlc291cmNlcy9mcm9udGVuZC9qcy9tYWluLmpzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vcmVzb3VyY2VzL3ZpZXdzL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FjY29yZGlvbi5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL3Jlc291cmNlcy92aWV3cy9jb21wb25lbnRzL21vZGFsL21vZGFsLmpzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vcmVzb3VyY2VzL3ZpZXdzL2NvbXBvbmVudHMvdmlkZW8tYmFja2dyb3VuZC92aWRlby1iYWNrZ3JvdW5kLmpzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL2JvZHktc2Nyb2xsLWxvY2svbGliL2JvZHlTY3JvbGxMb2NrLmVzbS5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy9mb2N1cy10cmFwL2Rpc3QvZm9jdXMtdHJhcC5lc20uanMiLCJ3ZWJwYWNrOi8vYTE3LXRvb2xraXQvLi9yZXNvdXJjZXMvZnJvbnRlbmQvY3NzL21haW4uY3NzIiwid2VicGFjazovL2ExNy10b29sa2l0Ly4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC8uL25vZGVfbW9kdWxlcy90YWJiYWJsZS9kaXN0L2luZGV4LmVzbS5qcyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL2ExNy10b29sa2l0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL3J1bnRpbWUvZW5zdXJlIGNodW5rIiwid2VicGFjazovL2ExNy10b29sa2l0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYTE3LXRvb2xraXQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2ExNy10b29sa2l0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9hMTctdG9vbGtpdC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGdldEN1cnJlbnRNZWRpYVF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gIC8vIERvYzogaHR0cHM6Ly9jb2RlLmFyZWExNy5jb20vYTE3L2ExNy1oZWxwZXJzL3dpa2lzL2dldEN1cnJlbnRNZWRpYVF1ZXJ5XG5cbiAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKCctLWJyZWFrcG9pbnQnKS50cmltKCkucmVwbGFjZSgvXCIvZywgJycpO1xufTtcblxudmFyIHJlc2l6ZWQgPSBmdW5jdGlvbigpIHtcbiAgLy8gRG9jOiBodHRwczovL2NvZGUuYXJlYTE3LmNvbS9hMTcvYTE3LWhlbHBlcnMvd2lraXMvcmVzaXplZFxuXG4gIHZhciByZXNpemVUaW1lcjtcbiAgdmFyIG1lZGlhUXVlcnkgPSBnZXRDdXJyZW50TWVkaWFRdWVyeSgpO1xuXG4gIGZ1bmN0aW9uIGluZm9ybUFwcCgpIHtcbiAgICAvLyBjaGVjayBtZWRpYSBxdWVyeVxuICAgIHZhciBuZXdNZWRpYVF1ZXJ5ID0gZ2V0Q3VycmVudE1lZGlhUXVlcnkoKTtcblxuICAgIC8vIHRlbGwgZXZlcnl0aGluZyByZXNpemVkIGhhcHBlbmVkXG4gICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdyZXNpemVkJywge1xuICAgICAgZGV0YWlsOiB7XG4gICAgICAgIGJyZWFrcG9pbnQ6IG5ld01lZGlhUXVlcnlcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICAvLyBpZiBtZWRpYSBxdWVyeSBjaGFuZ2VkLCB0ZWxsIGV2ZXJ5dGhpbmdcbiAgICBpZiAobmV3TWVkaWFRdWVyeSAhPT0gbWVkaWFRdWVyeSkge1xuICAgICAgaWYgKHdpbmRvdy5BMTcpIHtcbiAgICAgICAgd2luZG93LkExNy5jdXJyZW50TWVkaWFRdWVyeSA9IG5ld01lZGlhUXVlcnk7XG4gICAgICB9XG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ21lZGlhUXVlcnlVcGRhdGVkJywge1xuICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICBicmVha3BvaW50OiBuZXdNZWRpYVF1ZXJ5LFxuICAgICAgICAgIHByZXZCcmVha3BvaW50OiBtZWRpYVF1ZXJ5XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIG1lZGlhUXVlcnkgPSBuZXdNZWRpYVF1ZXJ5O1xuICAgIH1cbiAgfVxuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQocmVzaXplVGltZXIpO1xuICAgIHJlc2l6ZVRpbWVyID0gc2V0VGltZW91dChpbmZvcm1BcHAsIDI1MCk7XG4gIH0pO1xuXG4gIGlmIChtZWRpYVF1ZXJ5ID09PSAnJykge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaW5mb3JtQXBwKTtcbiAgfSBlbHNlIGlmICh3aW5kb3cuQTE3KSB7XG4gICAgd2luZG93LkExNy5jdXJyZW50TWVkaWFRdWVyeSA9IG1lZGlhUXVlcnk7XG4gIH1cbn07XG5cbmNvbnN0IGlzQnJlYWtwb2ludCA9IGZ1bmN0aW9uIChicmVha3BvaW50LCBicmVha3BvaW50cykge1xuICAvLyBEb2M6IGh0dHBzOi8vY29kZS5hcmVhMTcuY29tL2ExNy9hMTctaGVscGVycy93aWtpcy9pc0JyZWFrcG9pbnRcblxuICAvLyBiYWlsIGlmIG5vIGJyZWFrcG9pbnQgaXMgcGFzc2VkXG4gIGlmICghYnJlYWtwb2ludCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1lvdSBuZWVkIHRvIHBhc3MgYSBicmVha3BvaW50IG5hbWUhJyk7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyB3ZSBvbmx5IHdhbnQgdG8gbG9vayBmb3IgYSBzcGVjaWZpYyBtb2RpZmllciBhbmQgbWFrZSBzdXJlIGl0IGlzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZ1xuICBjb25zdCByZWdFeHAgPSBuZXcgUmVnRXhwKCdcXFxcKyR8XFxcXC0kJyk7XG5cbiAgLy8gYnBzIG11c3QgYmUgaW4gb3JkZXIgZnJvbSBzbWFsbGVzdCB0byBsYXJnZXN0XG4gIGxldCBicHMgPSBbJ3hzJywgJ3NtJywgJ21kJywgJ2xnJywgJ3hsJywgJ3h4bCddO1xuXG4gIC8vIG92ZXJyaWRlIHRoZSBicmVha3BvaW50cyBpZiB0aGUgb3B0aW9uIGlzIHNldCBvbiB0aGUgZ2xvYmFsIEExNyBvYmplY3RcbiAgaWYgKHdpbmRvdy5BMTcgJiYgd2luZG93LkExNy5icmVha3BvaW50cykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHdpbmRvdy5BMTcuYnJlYWtwb2ludHMpKSB7XG4gICAgICBicHMgPSB3aW5kb3cuQTE3LmJyZWFrcG9pbnRzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0ExNy5icmVha3BvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkuIFVzaW5nIGRlZmF1bHRzLicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIG92ZXJyaWRlIHRoZSBicmVha3BvaW50cyBpZiBhIHNldCBvZiBicmVha3BvaW50cyBpcyBwYXNzZWQgdGhyb3VnaCBhcyBhIHBhcmFtZXRlciAoYWRkZWQgZm9yIEExNy1iZWhhdmlvcnMgdG8gYWxsb3cgdXNhZ2Ugd2l0aCBubyBnbG9iYWxzKVxuICBpZiAoYnJlYWtwb2ludHMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShicmVha3BvaW50cykpIHtcbiAgICAgIGJwcyA9IGJyZWFrcG9pbnRzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ2lzQnJlYWtwb2ludCBicmVha3BvaW50cyBzaG91bGQgYmUgYW4gYXJyYXkuIFVzaW5nIGRlZmF1bHRzLicpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHN0b3JlIGN1cnJlbnQgYnJlYWtwb2ludCBpbiB1c2VcbiAgY29uc3QgY3VycmVudEJwID0gZ2V0Q3VycmVudE1lZGlhUXVlcnkoKTtcblxuICAvLyBzdG9yZSB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludFxuICBjb25zdCBjdXJyZW50QnBJbmRleCA9IGJwcy5pbmRleE9mKGN1cnJlbnRCcCk7XG5cbiAgLy8gY2hlY2sgdG8gc2VlIGlmIGJwIGhhcyBhICsgb3IgLSBtb2RpZmllclxuICBjb25zdCBoYXNNb2RpZmllciA9IHJlZ0V4cC5leGVjKGJyZWFrcG9pbnQpO1xuXG4gIC8vIHN0b3JlIG1vZGlmaWVyIHZhbHVlXG4gIGNvbnN0IG1vZGlmaWVyID0gaGFzTW9kaWZpZXIgPyBoYXNNb2RpZmllclswXSA6IGZhbHNlO1xuXG4gIC8vIHN0b3JlIHRoZSB0cmltbWVkIGJyZWFrcG9pbnQgbmFtZSBpZiBhIG1vZGlmaWVyIGV4aXN0cywgaWYgbm90LCBzdG9yZSB0aGUgZnVsbCBxdWVyaWVkIGJyZWFrcG9pbnQgbmFtZVxuICBjb25zdCBicE5hbWUgPSBoYXNNb2RpZmllciA/IGJyZWFrcG9pbnQuc2xpY2UoMCwgLTEpIDogYnJlYWtwb2ludDtcblxuICAvLyBzdG9yZSB0aGUgaW5kZXggb2YgdGhlIHF1ZXJpZWQgYnJlYWtwb2ludFxuICBjb25zdCBicEluZGV4ID0gYnBzLmluZGV4T2YoYnBOYW1lKTtcblxuICAvLyBsZXQgcGVvcGxlIGtub3cgaWYgdGhlIGJyZWFrcG9pbnQgbmFtZSBpcyB1bnJlY29nbml6ZWRcbiAgaWYgKGJwSW5kZXggPCAwKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1VucmVjb2duaXplZCBicmVha3BvaW50LiBTdXBwb3J0ZWQgYnJlYWtwb2ludHMgYXJlOiAnICsgYnBzLmpvaW4oJywgJylcbiAgICApO1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gY29tcGFyZSB0aGUgbW9kaWZpZXIgd2l0aCB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBpbiB0aGUgYnBzIGFycmF5IHdpdGggdGhlIGluZGV4IG9mIHRoZSBxdWVyaWVkIGJyZWFrcG9pbnQuXG4gIC8vIGlmIG5vIG1vZGlmaWVyIGlzIHNldCwgY29tcGFyZSB0aGUgcXVlcmllZCBicmVha3BvaW50IG5hbWUgd2l0aCB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWVcbiAgaWYgKFxuICAgIChtb2RpZmllciA9PT0gJysnICYmIGN1cnJlbnRCcEluZGV4ID49IGJwSW5kZXgpIHx8XG4gICAgKG1vZGlmaWVyID09PSAnLScgJiYgY3VycmVudEJwSW5kZXggPD0gYnBJbmRleCkgfHxcbiAgICAoIW1vZGlmaWVyICYmIGJyZWFrcG9pbnQgPT09IGN1cnJlbnRCcClcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgaXNu4oCZdCB0aGUgb25lIHlvdeKAmXJlIGxvb2tpbmcgZm9yXG4gIHJldHVybiBmYWxzZVxufTtcblxudmFyIHB1cmdlUHJvcGVydGllcyA9IGZ1bmN0aW9uKG9iaikge1xuICAvLyBEb2M6IGh0dHBzOi8vY29kZS5hcmVhMTcuY29tL2ExNy9hMTctaGVscGVycy93aWtpcy9wdXJnZVByb3BlcnRpZXNcbiAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICBkZWxldGUgb2JqW3Byb3BdO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFsdGVybmF0aXZlcyBjb25zaWRlcmVkOiBodHRwczovL2pzcGVyZi5jb20vZGVsZXRpbmctcHJvcGVydGllcy1mcm9tLWFuLW9iamVjdFxufTtcblxuZnVuY3Rpb24gQmVoYXZpb3Iobm9kZSwgY29uZmlnID0ge30pIHtcbiAgaWYgKCFub2RlIHx8ICEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlIGFyZ3VtZW50IGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICB0aGlzLiRub2RlID0gbm9kZTtcbiAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgaW50ZXJzZWN0aW9uT3B0aW9uczoge1xuICAgICAgcm9vdE1hcmdpbjogJzIwJScsXG4gICAgfVxuICB9LCBjb25maWcub3B0aW9ucyB8fCB7fSk7XG5cbiAgdGhpcy5fX2lzRW5hYmxlZCA9IGZhbHNlO1xuICB0aGlzLl9fY2hpbGRyZW4gPSBjb25maWcuY2hpbGRyZW47XG4gIHRoaXMuX19icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cztcblxuICAvLyBBdXRvLWJpbmQgYWxsIGN1c3RvbSBtZXRob2RzIHRvIFwidGhpc1wiXG4gIHRoaXMuY3VzdG9tTWV0aG9kTmFtZXMuZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICB0aGlzW21ldGhvZE5hbWVdID0gdGhpc1ttZXRob2ROYW1lXS5iaW5kKHRoaXMpO1xuICB9KTtcblxuICB0aGlzLl9iaW5kcyA9IHt9O1xuICB0aGlzLl9kYXRhID0gbmV3IFByb3h5KHRoaXMuX2JpbmRzLCB7XG4gICAgICBzZXQ6ICh0YXJnZXQsIGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUJpbmRzKGtleSwgdmFsdWUpO1xuICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gIH0pO1xuXG4gIHRoaXMuX19pc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuICB0aGlzLl9faW50ZXJzZWN0aW9uT2JzZXJ2ZXI7XG5cbiAgcmV0dXJuIHRoaXM7XG59XG5cbkJlaGF2aW9yLnByb3RvdHlwZSA9IE9iamVjdC5mcmVlemUoe1xuICB1cGRhdGVCaW5kcyhrZXksIHZhbHVlKSB7XG4gICAgICAvLyBUT0RPOiBjYWNoZSB0aGVzZSBiZWZvcmUgaGFuZD9cbiAgICAgIGNvbnN0IHRhcmdldEVscyA9IHRoaXMuJG5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtJyArIHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJy1iaW5kZWwqPScgKyBrZXkgKyAnXScpO1xuICAgICAgdGFyZ2V0RWxzLmZvckVhY2goKHRhcmdldCkgPT4ge1xuICAgICAgICAgIHRhcmdldC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgLy8gVE9ETzogY2FjaGUgdGhlc2UgYmVmb3JlIGhhbmQ/XG4gICAgICBjb25zdCB0YXJnZXRBdHRycyA9IHRoaXMuJG5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtJyArIHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJy1iaW5kYXR0cio9XCInICsga2V5ICsgJzpcIl0nKTtcbiAgICAgIHRhcmdldEF0dHJzLmZvckVhY2goKHRhcmdldCkgPT4ge1xuICAgICAgICAgIGxldCBiaW5kaW5ncyA9IHRhcmdldC5kYXRhc2V0W3RoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJ0JpbmRhdHRyJ107XG4gICAgICAgICAgYmluZGluZ3Muc3BsaXQoJywnKS5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgICAgICAgICAgIHBhaXIgPSBwYWlyLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAgIGlmIChwYWlyWzBdID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChwYWlyWzFdID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZHMgdG8ga25vdyB3aGF0IHRoZSBpbml0aWFsIGNsYXNzIHdhcyB0byByZW1vdmUgaXQgLSBmaXg/XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2JpbmRzW2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX2JpbmRzW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShwYWlyWzFdLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9LFxuICBpbml0KCkge1xuICAgIC8vIEdldCBvcHRpb25zIGZyb20gZGF0YSBhdHRyaWJ1dGVzIG9uIG5vZGVcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ15kYXRhLScgKyB0aGlzLm5hbWUgKyAnLSguKiknLCAnaScpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy4kbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHRyID0gdGhpcy4kbm9kZS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoYXR0ci5ub2RlTmFtZSk7XG5cbiAgICAgIGlmIChtYXRjaGVzICE9IG51bGwgJiYgbWF0Y2hlcy5sZW5ndGggPj0gMikge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zW21hdGNoZXNbMV1dKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgYElnbm9yaW5nICR7XG4gICAgICAgICAgICAgIG1hdGNoZXNbMV1cbiAgICAgICAgICAgIH0gb3B0aW9uLCBhcyBpdCBhbHJlYWR5IGV4aXN0cyBvbiB0aGUgJHtuYW1lfSBiZWhhdmlvci4gUGxlYXNlIGNob29zZSBhbm90aGVyIG5hbWUuYFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vcHRpb25zW21hdGNoZXNbMV1dID0gYXR0ci52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBCZWhhdmlvci1zcGVjaWZpYyBsaWZlY3ljbGVcbiAgICBpZiAodGhpcy5saWZlY3ljbGUuaW5pdCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5pbml0LmNhbGwodGhpcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubGlmZWN5Y2xlLnJlc2l6ZWQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fX3Jlc2l6ZWRCaW5kID0gdGhpcy5fX3Jlc2l6ZWQuYmluZCh0aGlzKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemVkJywgdGhpcy5fX3Jlc2l6ZWRCaW5kKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saWZlY3ljbGUubWVkaWFRdWVyeVVwZGF0ZWQgIT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMubWVkaWEpIHtcbiAgICAgIHRoaXMuX19tZWRpYVF1ZXJ5VXBkYXRlZEJpbmQgPSB0aGlzLl9fbWVkaWFRdWVyeVVwZGF0ZWQuYmluZCh0aGlzKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZWRpYVF1ZXJ5VXBkYXRlZCcsIHRoaXMuX19tZWRpYVF1ZXJ5VXBkYXRlZEJpbmQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWVkaWEpIHtcbiAgICAgIHRoaXMuX190b2dnbGVFbmFibGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2ludGVyc2VjdGlvbnMoKTtcbiAgfSxcbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fX2lzRW5hYmxlZCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5kaXNhYmxlKCk7XG4gICAgfVxuXG4gICAgLy8gQmVoYXZpb3Itc3BlY2lmaWMgbGlmZWN5Y2xlXG4gICAgaWYgKHRoaXMubGlmZWN5Y2xlLmRlc3Ryb3kgIT0gbnVsbCkge1xuICAgICAgdGhpcy5saWZlY3ljbGUuZGVzdHJveS5jYWxsKHRoaXMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxpZmVjeWNsZS5yZXNpemVkICE9IG51bGwpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemVkJywgdGhpcy5fX3Jlc2l6ZWRCaW5kKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saWZlY3ljbGUubWVkaWFRdWVyeVVwZGF0ZWQgIT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMubWVkaWEpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZWRpYVF1ZXJ5VXBkYXRlZCcsIHRoaXMuX19tZWRpYVF1ZXJ5VXBkYXRlZEJpbmQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxpZmVjeWNsZS5pbnRlcnNlY3Rpb25JbiAhPSBudWxsIHx8IHRoaXMubGlmZWN5Y2xlLmludGVyc2VjdGlvbk91dCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9faW50ZXJzZWN0aW9uT2JzZXJ2ZXIudW5vYnNlcnZlKHRoaXMuJG5vZGUpO1xuICAgICAgdGhpcy5fX2ludGVyc2VjdGlvbk9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBwdXJnZVByb3BlcnRpZXModGhpcyk7XG4gIH0sXG4gIGdldENoaWxkKGNoaWxkTmFtZSwgY29udGV4dCwgbXVsdGkgPSBmYWxzZSkge1xuICAgIGlmIChjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzLiRub2RlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fX2NoaWxkcmVuICE9IG51bGwgJiYgdGhpcy5fX2NoaWxkcmVuW2NoaWxkTmFtZV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19jaGlsZHJlbltjaGlsZE5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dFttdWx0aSA/ICdxdWVyeVNlbGVjdG9yQWxsJyA6ICdxdWVyeVNlbGVjdG9yJ10oXG4gICAgICAnW2RhdGEtJyArIHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpICsgJy0nICsgY2hpbGROYW1lLnRvTG93ZXJDYXNlKCkgKyAnXSdcbiAgICApO1xuICB9LFxuICBnZXRDaGlsZHJlbihjaGlsZE5hbWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDaGlsZChjaGlsZE5hbWUsIGNvbnRleHQsIHRydWUpO1xuICB9LFxuICBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19pc0VuYWJsZWQ7XG4gIH0sXG4gIGVuYWJsZSgpIHtcbiAgICB0aGlzLl9faXNFbmFibGVkID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5saWZlY3ljbGUuZW5hYmxlZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5lbmFibGVkLmNhbGwodGhpcyk7XG4gICAgfVxuICB9LFxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuX19pc0VuYWJsZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5saWZlY3ljbGUuZGlzYWJsZWQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5saWZlY3ljbGUuZGlzYWJsZWQuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH0sXG4gIGFkZFN1YkJlaGF2aW9yKFN1YkJlaGF2aW9yLCBub2RlID0gdGhpcy4kbm9kZSwgY29uZmlnID0ge30pIHtcbiAgICBjb25zdCBtYiA9IGV4cG9ydE9iajtcbiAgICBpZiAodHlwZW9mIFN1YkJlaGF2aW9yID09PSAnc3RyaW5nJykge1xuICAgICAgbWIuaW5pdEJlaGF2aW9yKFN1YkJlaGF2aW9yLCBub2RlLCBjb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYi5hZGQoU3ViQmVoYXZpb3IpO1xuICAgICAgbWIuaW5pdEJlaGF2aW9yKFN1YkJlaGF2aW9yLnByb3RvdHlwZS5iZWhhdmlvck5hbWUsIG5vZGUsIGNvbmZpZyk7XG4gICAgfVxuICB9LFxuICBpc0JyZWFrcG9pbnQoYnApIHtcbiAgICByZXR1cm4gaXNCcmVha3BvaW50KGJwLCB0aGlzLl9fYnJlYWtwb2ludHMpO1xuICB9LFxuICBfX3RvZ2dsZUVuYWJsZWQoKSB7XG4gICAgY29uc3QgaXNWYWxpZE1RID0gaXNCcmVha3BvaW50KHRoaXMub3B0aW9ucy5tZWRpYSwgdGhpcy5fX2JyZWFrcG9pbnRzKTtcbiAgICBpZiAoaXNWYWxpZE1RICYmICF0aGlzLl9faXNFbmFibGVkKSB7XG4gICAgICB0aGlzLmVuYWJsZSgpO1xuICAgIH0gZWxzZSBpZiAoIWlzVmFsaWRNUSAmJiB0aGlzLl9faXNFbmFibGVkKSB7XG4gICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICB9XG4gIH0sXG4gIF9fbWVkaWFRdWVyeVVwZGF0ZWQoZSkge1xuICAgIGlmICh0aGlzLmxpZmVjeWNsZS5tZWRpYVF1ZXJ5VXBkYXRlZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5tZWRpYVF1ZXJ5VXBkYXRlZC5jYWxsKHRoaXMsIGUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm1lZGlhKSB7XG4gICAgICB0aGlzLl9fdG9nZ2xlRW5hYmxlZCgpO1xuICAgIH1cbiAgfSxcbiAgX19yZXNpemVkKGUpIHtcbiAgICBpZiAodGhpcy5saWZlY3ljbGUucmVzaXplZCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmxpZmVjeWNsZS5yZXNpemVkLmNhbGwodGhpcywgZSk7XG4gICAgfVxuICB9LFxuICBfX2ludGVyc2VjdGlvbnMoKSB7XG4gICAgaWYgKHRoaXMubGlmZWN5Y2xlLmludGVyc2VjdGlvbkluICE9IG51bGwgfHwgdGhpcy5saWZlY3ljbGUuaW50ZXJzZWN0aW9uT3V0ICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX19pbnRlcnNlY3Rpb25PYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihlbnRyaWVzID0+IHtcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgICBpZiAoZW50cnkudGFyZ2V0ID09PSB0aGlzLiRub2RlKSB7XG4gICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgICAgaWYgKCF0aGlzLl9faXNJbnRlcnNlY3RpbmcgJiYgdGhpcy5saWZlY3ljbGUuaW50ZXJzZWN0aW9uSW4gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19pc0ludGVyc2VjdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5saWZlY3ljbGUuaW50ZXJzZWN0aW9uSW4uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuX19pc0ludGVyc2VjdGluZyAmJiB0aGlzLmxpZmVjeWNsZS5pbnRlcnNlY3Rpb25PdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX19pc0ludGVyc2VjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMubGlmZWN5Y2xlLmludGVyc2VjdGlvbk91dC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMub3B0aW9ucy5pbnRlcnNlY3Rpb25PcHRpb25zKTtcbiAgICAgIHRoaXMuX19pbnRlcnNlY3Rpb25PYnNlcnZlci5vYnNlcnZlKHRoaXMuJG5vZGUpO1xuICAgIH1cbiAgfVxufSk7XG5cbmNvbnN0IGNyZWF0ZUJlaGF2aW9yID0gKG5hbWUsIGRlZiwgbGlmZWN5Y2xlID0ge30pID0+IHtcbiAgY29uc3QgZm4gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgQmVoYXZpb3IuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG5cbiAgY29uc3QgY3VzdG9tTWV0aG9kTmFtZXMgPSBbXTtcblxuICBjb25zdCBjdXN0b21Qcm9wZXJ0aWVzID0ge1xuICAgIG5hbWU6IHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmVoYXZpb3JOYW1lO1xuICAgICAgfSxcbiAgICB9LFxuICAgIGJlaGF2aW9yTmFtZToge1xuICAgICAgdmFsdWU6IG5hbWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9LFxuICAgIGxpZmVjeWNsZToge1xuICAgICAgdmFsdWU6IGxpZmVjeWNsZSxcbiAgICB9LFxuICAgIGN1c3RvbU1ldGhvZE5hbWVzOiB7XG4gICAgICB2YWx1ZTogY3VzdG9tTWV0aG9kTmFtZXMsXG4gICAgfSxcbiAgfTtcblxuICAvLyBFeHBvc2UgdGhlIGRlZmluaXRpb24gcHJvcGVydGllcyBhcyAndGhpc1ttZXRob2ROYW1lXSdcbiAgY29uc3QgZGVmS2V5cyA9IE9iamVjdC5rZXlzKGRlZik7XG4gIGRlZktleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgIGN1c3RvbU1ldGhvZE5hbWVzLnB1c2goa2V5KTtcbiAgICBjdXN0b21Qcm9wZXJ0aWVzW2tleV0gPSB7XG4gICAgICB2YWx1ZTogZGVmW2tleV0sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9O1xuICB9KTtcblxuICBmbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJlaGF2aW9yLnByb3RvdHlwZSwgY3VzdG9tUHJvcGVydGllcyk7XG4gIHJldHVybiBmbjtcbn07XG5cbmxldCBvcHRpb25zID0ge1xuICBkYXRhQXR0cjogJ2JlaGF2aW9yJyxcbiAgbGF6eUF0dHI6ICdiZWhhdmlvci1sYXp5JyxcbiAgaW50ZXJzZWN0aW9uT3B0aW9uczoge1xuICAgIHJvb3RNYXJnaW46ICcyMCUnLFxuICB9LFxuICBicmVha3BvaW50czogWyd4cycsICdzbScsICdtZCcsICdsZycsICd4bCcsICd4eGwnXVxufTtcbmxldCBsb2FkZWRCZWhhdmlvck5hbWVzID0gW107XG5sZXQgb2JzZXJ2aW5nQmVoYXZpb3JzID0gZmFsc2U7XG5jb25zdCBsb2FkZWRCZWhhdmlvcnMgPSB7fTtcbmNvbnN0IGFjdGl2ZUJlaGF2aW9ycyA9IG5ldyBNYXAoKTtcbmNvbnN0IGJlaGF2aW9yc0F3YWl0aW5nSW1wb3J0ID0gbmV3IE1hcCgpO1xubGV0IGlvO1xuY29uc3QgaW9FbnRyaWVzID0gbmV3IE1hcCgpOyAvLyBuZWVkIHRvIGtlZXAgYSBzZXBhcmF0ZSBtYXAgb2YgaW50ZXJzZWN0aW9uIG9ic2VydmVyIGVudHJpZXMgYXMgYGlvLnRha2VSZWNvcmRzKClgIGFsd2F5cyByZXR1cm5zIGFuIGVtcHR5IGFycmF5LCBzZWVtcyBicm9rZW4gaW4gYWxsIGJyb3dzZXJzIPCfpLfwn4+74oCN4pmC77iPXG5jb25zdCBpbnRlcnNlY3RpbmcgPSBuZXcgTWFwKCk7XG5cbi8qXG4gIGdldEJlaGF2aW9yTmFtZXNcblxuICBEYXRhIGF0dHJpYnV0ZSBuYW1lcyBjYW4gYmUgd3JpdHRlbiBpbiBhbnkgY2FzZSxcbiAgYnV0IGBub2RlLmRhdGFzZXRgIG5hbWVzIGFyZSBsb3dlcmNhc2VcbiAgd2l0aCBjYW1lbCBjYXNpbmcgZm9yIG5hbWVzIHNwbGl0IGJ5IC1cbiAgZWc6IGBkYXRhLWZvby1iYXJgIGJlY29tZXMgYG5vZGUuZGF0YXNldC5mb29CYXJgXG5cbiAgYk5vZGUgLSBub2RlIHRvIGdyYWIgYmVoYXZpb3IgbmFtZXMgZnJvbVxuICBhdHRyIC0gbmFtZSBvZiBhdHRyaWJ1dGUgdG8gcGlja1xuKi9cbmZ1bmN0aW9uIGdldEJlaGF2aW9yTmFtZXMoYk5vZGUsIGF0dHIpIHtcbiAgYXR0ciA9IGF0dHIudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8tKFthLXpBLVowLTldKS9pZywgKG1hdGNoLCBwMSkgPT4ge1xuICAgIHJldHVybiBwMS50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbiAgaWYgKGJOb2RlLmRhdGFzZXQgJiYgYk5vZGUuZGF0YXNldFthdHRyXSkge1xuICAgIHJldHVybiBiTm9kZS5kYXRhc2V0ICYmIGJOb2RlLmRhdGFzZXRbYXR0cl0gJiYgYk5vZGUuZGF0YXNldFthdHRyXS5zcGxpdCgnICcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG4vKlxuICBpbXBvcnRGYWlsZWRcblxuICBiTmFtZSAtIG5hbWUgb2YgYmVoYXZpb3IgdGhhdCBmYWlsZWQgdG8gaW1wb3J0XG5cbiAgRWl0aGVyIHRoZSBpbXBvcnRlZCBtb2R1bGUgZGlkbid0IGxvb2sgbGlrZSBhIGJlaGF2aW9yIG1vZHVsZVxuICBvciBub3RoaW5nIGNvdWxkIGJlIGZvdW5kIHRvIGltcG9ydFxuKi9cbmZ1bmN0aW9uIGltcG9ydEZhaWxlZChiTmFtZSkge1xuICAvLyByZW1vdmUgbmFtZSBmcm9tIGxvYWRlZCBiZWhhdmlvciBuYW1lcyBpbmRleFxuICAvLyBtYXliZSBpdCdsbCBiZSBpbmNsdWRlZCB2aWEgYSBzY3JpcHQgdGFnIGxhdGVyXG4gIGNvbnN0IGJOYW1lSW5kZXggPSBsb2FkZWRCZWhhdmlvck5hbWVzLmluZGV4T2YoYk5hbWUpO1xuICBpZiAoYk5hbWVJbmRleCA+IC0xKSB7XG4gICAgbG9hZGVkQmVoYXZpb3JOYW1lcy5zcGxpY2UoYk5hbWVJbmRleCwgMSk7XG4gIH1cbn1cblxuLypcbiAgZGVzdHJveUJlaGF2aW9yXG5cbiAgQWxsIGdvb2QgdGhpbmdzIG11c3QgY29tZSB0byBhbiBlbmQuLi5cbiAgT2sgc28gbGlrZWx5IHRoZSBub2RlIGhhcyBiZWVuIHJlbW92ZWQsIHBvc3NpYmx5IGJ5XG4gIGEgZGVsZXRpb24gb3IgYWpheCB0eXBlIHBhZ2UgY2hhbmdlXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yIHRvIGRlc3Ryb3lcbiAgYk5vZGUgLSBub2RlIHRvIGRlc3Ryb3kgYmVoYXZpb3Igb25cblxuICBgZGVzdHJveSgpYCBpcyBhbiBpbnRlcm5hbCBtZXRob2Qgb2YgYSBiZWhhdmlvclxuICBpbiBgY3JlYXRlQmVoYXZpb3JgLiBJbmRpdmlkdWFsIGJlaGF2aW9ycyBtYXlcbiAgYWxzbyBoYXZlIHRoZWlyIG93biBgZGVzdHJveWAgbWV0aG9kcyAoY2FsbGVkIGJ5XG4gIHRoZSBgY3JlYXRlQmVoYXZpb3JgIGBkZXN0cm95YClcbiovXG5mdW5jdGlvbiBkZXN0cm95QmVoYXZpb3IoYk5hbWUsIGJOb2RlKSB7XG4gIGNvbnN0IG5vZGVCZWhhdmlvcnMgPSBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKTtcbiAgaWYgKCFub2RlQmVoYXZpb3JzIHx8ICFub2RlQmVoYXZpb3JzW2JOYW1lXSkge1xuICAgIGNvbnNvbGUud2FybihgTm8gYmVoYXZpb3IgJyR7Yk5hbWV9JyBpbnN0YW5jZSBvbjpgLCBiTm9kZSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHJ1biBkZXN0cm95IG1ldGhvZCwgcmVtb3ZlLCBkZWxldGVcbiAgbm9kZUJlaGF2aW9yc1tiTmFtZV0uZGVzdHJveSgpO1xuICBkZWxldGUgbm9kZUJlaGF2aW9yc1tiTmFtZV07XG4gIGlmIChPYmplY3Qua2V5cyhub2RlQmVoYXZpb3JzKS5sZW5ndGggPT09IDApIHtcbiAgICBhY3RpdmVCZWhhdmlvcnMuZGVsZXRlKGJOb2RlKTtcbiAgfVxufVxuXG4vKlxuICBkZXN0cm95QmVoYXZpb3JzXG5cbiAgck5vZGUgLSBub2RlIHRvIGRlc3Ryb3kgYmVoYXZpb3JzIG9uIChhbmQgaW5zaWRlIG9mKVxuXG4gIGlmIGEgbm9kZSB3aXRoIGJlaGF2aW9ycyBpcyByZW1vdmVkIGZyb20gdGhlIERPTSxcbiAgY2xlYW4gdXAgdG8gc2F2ZSByZXNvdXJjZXNcbiovXG5mdW5jdGlvbiBkZXN0cm95QmVoYXZpb3JzKHJOb2RlKSB7XG4gIGNvbnN0IGJOb2RlcyA9IEFycmF5LmZyb20oYWN0aXZlQmVoYXZpb3JzLmtleXMoKSk7XG4gIGJOb2Rlcy5wdXNoKHJOb2RlKTtcbiAgYk5vZGVzLmZvckVhY2goYk5vZGUgPT4ge1xuICAgIC8vIGlzIHRoZSBhY3RpdmUgbm9kZSB0aGUgcmVtb3ZlZCBub2RlXG4gICAgLy8gb3IgZG9lcyB0aGUgcmVtb3ZlZCBub2RlIGNvbnRhaW4gdGhlIGFjdGl2ZSBub2RlP1xuICAgIGlmIChyTm9kZSA9PT0gYk5vZGUgfHwgck5vZGUuY29udGFpbnMoYk5vZGUpKSB7XG4gICAgICAvLyBnZXQgYmVoYXZpb3JzIG9uIG5vZGVcbiAgICAgIGNvbnN0IGJOb2RlQWN0aXZlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSk7XG4gICAgICAvLyBpZiBzb21lLCBkZXN0cm95XG4gICAgICBpZiAoYk5vZGVBY3RpdmVCZWhhdmlvcnMpIHtcbiAgICAgICAgT2JqZWN0LmtleXMoYk5vZGVBY3RpdmVCZWhhdmlvcnMpLmZvckVhY2goYk5hbWUgPT4ge1xuICAgICAgICAgIGRlc3Ryb3lCZWhhdmlvcihiTmFtZSwgYk5vZGUpO1xuICAgICAgICAgIC8vIHN0b3AgaW50ZXJzZWN0aW9uIG9ic2VydmVyIGZyb20gd2F0Y2hpbmcgbm9kZVxuICAgICAgICAgIGlvLnVub2JzZXJ2ZShiTm9kZSk7XG4gICAgICAgICAgaW9FbnRyaWVzLmRlbGV0ZShiTm9kZSk7XG4gICAgICAgICAgaW50ZXJzZWN0aW5nLmRlbGV0ZShiTm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qXG4gIGltcG9ydEJlaGF2aW9yXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yXG4gIGJOb2RlIC0gbm9kZSB0byBpbml0aWFsaXNlIGJlaGF2aW9yIG9uXG5cbiAgVXNlIGBpbXBvcnRgIHRvIGJyaW5nIGluIGEgYmVoYXZpb3IgbW9kdWxlIGFuZCBydW4gaXQuXG4gIFRoaXMgcnVucyBpZiB0aGVyZSBpcyBubyBsb2FkZWQgYmVoYXZpb3Igb2YgdGhpcyBuYW1lLlxuICBBZnRlciBpbXBvcnQsIHRoZSBiZWhhdmlvciBpcyBpbml0aWFsaXNlZCBvbiB0aGUgbm9kZVxuKi9cbmZ1bmN0aW9uIGltcG9ydEJlaGF2aW9yKGJOYW1lLCBiTm9kZSkge1xuICAvLyBmaXJzdCBjaGVjayB3ZSBoYXZlbid0IGFscmVhZHkgZ290IHRoaXMgYmVoYXZpb3IgbW9kdWxlXG4gIGlmIChsb2FkZWRCZWhhdmlvck5hbWVzLmluZGV4T2YoYk5hbWUpID4gLTEpIHtcbiAgICAvLyBpZiBubywgc3RvcmUgYSBsaXN0IG9mIG5vZGVzIGF3YWl0aW5nIHRoaXMgYmVoYXZpb3IgdG8gbG9hZFxuICAgIGNvbnN0IGF3YWl0aW5nSW1wb3J0ID0gYmVoYXZpb3JzQXdhaXRpbmdJbXBvcnQuZ2V0KGJOYW1lKSB8fCBbXTtcbiAgICBpZiAoIWF3YWl0aW5nSW1wb3J0LmluY2x1ZGVzKGJOb2RlKSkge1xuICAgICAgYXdhaXRpbmdJbXBvcnQucHVzaChiTm9kZSk7XG4gICAgfVxuICAgIGJlaGF2aW9yc0F3YWl0aW5nSW1wb3J0LnNldChiTmFtZSwgYXdhaXRpbmdJbXBvcnQpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBwdXNoIHRvIG91ciBzdG9yZSBvZiBsb2FkZWQgYmVoYXZpb3JzXG4gIGxvYWRlZEJlaGF2aW9yTmFtZXMucHVzaChiTmFtZSk7XG4gIC8vIGltcG9ydFxuICAvLyB3ZWJwYWNrIGludGVycHJldHMgdGhpcywgZG9lcyBzb21lIG1hZ2ljXG4gIC8vIHByb2Nlc3MuZW52IHZhcmlhYmxlcyBzZXQgaW4gd2VicGFjayBjb25maWdcbiAgdHJ5IHtcbiAgICBpbXBvcnQoYCR7cHJvY2Vzcy5lbnYuQkVIQVZJT1JTX1BBVEh9LyR7KHByb2Nlc3MuZW52LkJFSEFWSU9SU19DT01QT05FTlRfUEFUSFNbYk5hbWVdfHwnJykucmVwbGFjZSgvXlxcL3xcXC8kL2lnLCcnKX0vJHtiTmFtZX0uJHtwcm9jZXNzLmVudi5CRUhBVklPUlNfRVhURU5TSU9OIH1gKS50aGVuKG1vZHVsZSA9PiB7XG4gICAgICBiZWhhdmlvckltcG9ydGVkKGJOYW1lLCBiTm9kZSwgbW9kdWxlKTtcbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgY29uc29sZS53YXJuKGBObyBsb2FkZWQgYmVoYXZpb3IgY2FsbGVkOiAke2JOYW1lfWApO1xuICAgICAgLy8gZmFpbCwgY2xlYW4gdXBcbiAgICAgIGltcG9ydEZhaWxlZChiTmFtZSk7XG4gICAgfSk7XG4gIH0gY2F0Y2goZXJyMSkge1xuICAgIHRyeSB7XG4gICAgICBpbXBvcnQoYCR7cHJvY2Vzcy5lbnYuQkVIQVZJT1JTX1BBVEh9LyR7Yk5hbWV9LiR7cHJvY2Vzcy5lbnYuQkVIQVZJT1JTX0VYVEVOU0lPTn1gKS50aGVuKG1vZHVsZSA9PiB7XG4gICAgICAgIGJlaGF2aW9ySW1wb3J0ZWQoYk5hbWUsIGJOb2RlLCBtb2R1bGUpO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKGBObyBsb2FkZWQgYmVoYXZpb3IgY2FsbGVkOiAke2JOYW1lfWApO1xuICAgICAgICAvLyBmYWlsLCBjbGVhbiB1cFxuICAgICAgICBpbXBvcnRGYWlsZWQoYk5hbWUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaChlcnIyKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFVua25vd24gYmVoYXZpb3IgY2FsbGVkOiAke2JOYW1lfS4gXFxuSXQgbWF5YmUgdGhlIGJlaGF2aW9yIGRvZXNuJ3QgZXhpc3QsIGNoZWNrIGZvciB0eXBvcyBhbmQgY2hlY2sgV2VicGFjayBoYXMgZ2VuZXJhdGVkIHlvdXIgZmlsZS4gXFxuSWYgeW91IGFyZSB1c2luZyBkeW5hbWljYWxseSBpbXBvcnRlZCBiZWhhdmlvcnMsIHlvdSBtYXkgYWxzbyB3YW50IHRvIGNoZWNrIHlvdXIgd2VicGFjayBjb25maWcuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYXJlYTE3L2ExNy1iZWhhdmlvcnMvd2lraS9TZXR1cCN3ZWJwYWNrLWNvbmZpZ2ApO1xuICAgICAgLy8gZmFpbCwgY2xlYW4gdXBcbiAgICAgIGltcG9ydEZhaWxlZChiTmFtZSk7XG4gICAgfVxuICB9XG59XG5cbi8qXG4gIGJlaGF2aW9ySW1wb3J0ZWRcblxuICBiTmFtZSAtIG5hbWUgb2YgYmVoYXZpb3JcbiAgYk5vZGUgLSBub2RlIHRvIGluaXRpYWxpc2UgYmVoYXZpb3Igb25cbiAgbW9kdWxlIC0gaW1wb3J0ZWQgYmVoYXZpb3IgbW9kdWxlXG5cbiAgUnVuIHdoZW4gYSBkeW5hbWljIGltcG9ydCBpcyBzdWNjZXNzZnVsbHkgaW1wb3J0ZWQsXG4gIHNldHMgdXAgYW5kIHJ1bnMgdGhlIGJlaGF2aW9yIG9uIHRoZSBub2RlXG4qL1xuZnVuY3Rpb24gYmVoYXZpb3JJbXBvcnRlZChiTmFtZSwgYk5vZGUsIG1vZHVsZSkge1xuICAvLyBkb2VzIHdoYXQgd2UgbG9hZGVkIGxvb2sgcmlnaHQ/XG4gIGlmIChtb2R1bGUuZGVmYXVsdCAmJiB0eXBlb2YgbW9kdWxlLmRlZmF1bHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBpbXBvcnQgY29tcGxldGUsIGdvIGdvIGdvXG4gICAgbG9hZGVkQmVoYXZpb3JzW2JOYW1lXSA9IG1vZHVsZS5kZWZhdWx0O1xuICAgIGluaXRCZWhhdmlvcihiTmFtZSwgYk5vZGUpO1xuICAgIC8vIGNoZWNrIGZvciBvdGhlciBpbnN0YW5jZXMgb2YgdGhpcyBiZWhhdmlvciB0aGF0IHdoZXJlIGF3YWl0aW5nIGxvYWRcbiAgICBpZiAoYmVoYXZpb3JzQXdhaXRpbmdJbXBvcnQuZ2V0KGJOYW1lKSkge1xuICAgICAgYmVoYXZpb3JzQXdhaXRpbmdJbXBvcnQuZ2V0KGJOYW1lKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBpbml0QmVoYXZpb3IoYk5hbWUsIG5vZGUpO1xuICAgICAgfSk7XG4gICAgICBiZWhhdmlvcnNBd2FpdGluZ0ltcG9ydC5kZWxldGUoYk5hbWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLndhcm4oYFRyaWVkIHRvIGltcG9ydCAke2JOYW1lfSwgYnV0IGl0IHNlZW1zIHRvIG5vdCBiZSBhIGJlaGF2aW9yYCk7XG4gICAgLy8gZmFpbCwgY2xlYW4gdXBcbiAgICBpbXBvcnRGYWlsZWQoYk5hbWUpO1xuICB9XG59XG5cbi8qXG4gIGNyZWF0ZUJlaGF2aW9yc1xuXG4gIG5vZGUgLSBub2RlIHRvIGNoZWNrIGZvciBiZWhhdmlvcnMgb24gZWxlbWVudHNcblxuICBhc3NpZ24gYmVoYXZpb3JzIHRvIG5vZGVzXG4qL1xuZnVuY3Rpb24gY3JlYXRlQmVoYXZpb3JzKG5vZGUpIHtcbiAgLy8gSWdub3JlIHRleHQgb3IgY29tbWVudCBub2Rlc1xuICBpZiAoISgncXVlcnlTZWxlY3RvckFsbCcgaW4gbm9kZSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBmaXJzdCBjaGVjayBmb3IgXCJjcml0aWNhbFwiIGJlaGF2aW9yIG5vZGVzXG4gIC8vIHRoZXNlIHdpbGwgYmUgcnVuIGltbWVkaWF0ZWx5IG9uIGRpc2NvdmVyeVxuICBjb25zdCBiZWhhdmlvck5vZGVzID0gW25vZGUsIC4uLm5vZGUucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtvcHRpb25zLmRhdGFBdHRyfV1gKV07XG4gIGJlaGF2aW9yTm9kZXMuZm9yRWFjaChiTm9kZSA9PiB7XG4gICAgLy8gYW4gZWxlbWVudCBjYW4gaGF2ZSBtdWx0aXBsZSBiZWhhdmlvcnNcbiAgICBjb25zdCBiTmFtZXMgPSBnZXRCZWhhdmlvck5hbWVzKGJOb2RlLCBvcHRpb25zLmRhdGFBdHRyKTtcbiAgICAvLyBsb29wIHRoZW1cbiAgICBpZiAoYk5hbWVzKSB7XG4gICAgICBiTmFtZXMuZm9yRWFjaChiTmFtZSA9PiB7XG4gICAgICAgIGluaXRCZWhhdmlvcihiTmFtZSwgYk5vZGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICAvLyBub3cgY2hlY2sgZm9yIFwibGF6eVwiIGJlaGF2aW9yc1xuICAvLyB0aGVzZSBhcmUgdHJpZ2dlcmVkIHZpYSBhbiBpbnRlcnNlY3Rpb24gb2JzZXJ2ZXJcbiAgLy8gdGhlc2UgaGF2ZSBvcHRpb25hbCBicmVha3BvaW50cyBhdCB3aGljaCB0byB0cmlnZ2VyXG4gIGNvbnN0IGxhenlCZWhhdmlvck5vZGVzID0gW25vZGUsIC4uLm5vZGUucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtvcHRpb25zLmxhenlBdHRyfV1gKV07XG4gIGxhenlCZWhhdmlvck5vZGVzLmZvckVhY2goYk5vZGUgPT4ge1xuICAgIC8vIGxvb2sgZm9yIGxhenkgYmVoYXZpb3IgbmFtZXNcbiAgICBjb25zdCBiTmFtZXMgPSBnZXRCZWhhdmlvck5hbWVzKGJOb2RlLCBvcHRpb25zLmxhenlBdHRyKTtcbiAgICBjb25zdCBiTWFwID0gbmV3IE1hcCgpO1xuICAgIGJOYW1lcy5mb3JFYWNoKGJOYW1lID0+IHtcbiAgICAgIC8vIGNoZWNrIGZvciBhIGxhenkgYmVoYXZpb3IgYnJlYWtwb2ludCB0cmlnZ2VyXG4gICAgICBjb25zdCBiZWhhdmlvck1lZGlhID0gYk5vZGUuZGF0YXNldFtgJHtiTmFtZS50b0xvd2VyQ2FzZSgpfUxhenltZWRpYWBdO1xuICAgICAgLy8gc3RvcmVcbiAgICAgIGJNYXAuc2V0KGJOYW1lLCBiZWhhdmlvck1lZGlhIHx8IGZhbHNlKTtcbiAgICB9KTtcbiAgICAvLyBzdG9yZSBhbmQgb2JzZXJ2ZVxuICAgIGlmIChiTm9kZSAhPT0gZG9jdW1lbnQpIHtcbiAgICAgIGlvRW50cmllcy5zZXQoYk5vZGUsIGJNYXApO1xuICAgICAgaW50ZXJzZWN0aW5nLnNldChiTm9kZSwgZmFsc2UpO1xuICAgICAgaW8ub2JzZXJ2ZShiTm9kZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLypcbiAgb2JzZXJ2ZUJlaGF2aW9yc1xuXG4gIHJ1bnMgYSBgTXV0YXRpb25PYnNlcnZlcmAsIHdoaWNoIHdhdGNoZXMgZm9yIERPTSBjaGFuZ2VzXG4gIHdoZW4gYSBET00gY2hhbmdlIGhhcHBlbnMsIGluc2VydGlvbiBvciBkZWxldGlvbixcbiAgdGhlIGNhbGwgYmFjayBydW5zLCBpbmZvcm1pbmcgdXMgb2Ygd2hhdCBjaGFuZ2VkXG4qL1xuZnVuY3Rpb24gb2JzZXJ2ZUJlaGF2aW9ycygpIHtcbiAgLy8gZmxhZyB0byBzdG9wIG11bHRpcGxlIE11dGF0aW9uT2JzZXJ2ZXJcbiAgb2JzZXJ2aW5nQmVoYXZpb3JzID0gdHJ1ZTtcbiAgLy8gc2V0IHVwIE11dGF0aW9uT2JzZXJ2ZXJcbiAgY29uc3QgbW8gPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgIC8vIHJlcG9ydCBvbiB3aGF0IGNoYW5nZWRcbiAgICBtdXRhdGlvbnMuZm9yRWFjaChtdXRhdGlvbiA9PiB7XG4gICAgICBtdXRhdGlvbi5yZW1vdmVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgZGVzdHJveUJlaGF2aW9ycyhub2RlKTtcbiAgICAgIH0pO1xuICAgICAgbXV0YXRpb24uYWRkZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBjcmVhdGVCZWhhdmlvcnMobm9kZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIC8vIG9ic2VydmUgY2hhbmdlcyB0byB0aGUgZW50aXJlIGRvY3VtZW50XG4gIG1vLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBzdWJ0cmVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgIGNoYXJhY3RlckRhdGE6IGZhbHNlLFxuICB9KTtcbn1cblxuLypcbiAgbG9vcExhenlCZWhhdmlvck5vZGVzXG5cbiAgYk5vZGVzIC0gZWxlbWVudHMgdG8gY2hlY2sgZm9yIGxhenkgYmVoYXZpb3JzXG5cbiAgTG9va3MgYXQgdGhlIG5vZGVzIHRoYXQgaGF2ZSBsYXp5IGJlaGF2aW9ycywgY2hlY2tzXG4gIGlmIHRoZXkncmUgaW50ZXJzZWN0aW5nLCBvcHRpb25hbGx5IGNoZWNrcyB0aGUgYnJlYWtwb2ludFxuICBhbmQgaW5pdGlhbGlzZXMgaWYgbmVlZGVkLiBDbGVhbnMgdXAgYWZ0ZXIgaXRzZWxmLCBieVxuICByZW1vdmluZyB0aGUgaW50ZXJzZWN0aW9uIG9ic2VydmVyIG9ic2VydmluZyBvZiB0aGUgbm9kZVxuICBpZiBhbGwgbGF6eSBiZWhhdmlvcnMgb24gYSBub2RlIGhhdmUgYmVlbiBpbml0aWFsaXNlZFxuKi9cblxuZnVuY3Rpb24gbG9vcExhenlCZWhhdmlvck5vZGVzKGJOb2Rlcykge1xuICBiTm9kZXMuZm9yRWFjaChiTm9kZSA9PiB7XG4gICAgLy8gZmlyc3QsIGNoZWNrIGlmIHRoaXMgbm9kZSBpcyBiZWluZyBpbnRlcnNlY3RlZFxuICAgIGlmIChpbnRlcnNlY3RpbmcuZ2V0KGJOb2RlKSAhPT0gdW5kZWZpbmVkICYmIGludGVyc2VjdGluZy5nZXQoYk5vZGUpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBub3cgY2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYW55IGxhenkgYmVoYXZpb3IgbmFtZXNcbiAgICBsZXQgbGF6eUJOYW1lcyA9IGlvRW50cmllcy5nZXQoYk5vZGUpO1xuICAgIGlmICghbGF6eUJOYW1lcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvL1xuICAgIGxhenlCTmFtZXMuZm9yRWFjaCgoYk1lZGlhLCBiTmFtZSkgPT4ge1xuICAgICAgLy8gaWYgbm8gbGF6eSBiZWhhdmlvciBicmVha3BvaW50IHRyaWdnZXIsXG4gICAgICAvLyBvciBpZiB0aGUgY3VycmVudCBicmVha3BvaW50IG1hdGNoZXNcbiAgICAgIGlmICghYk1lZGlhIHx8IGlzQnJlYWtwb2ludChiTWVkaWEsIG9wdGlvbnMuYnJlYWtwb2ludHMpKSB7XG4gICAgICAgIC8vIHJ1biBiZWhhdmlvciBvbiBub2RlXG4gICAgICAgIGluaXRCZWhhdmlvcihiTmFtZSwgYk5vZGUpO1xuICAgICAgICAvLyByZW1vdmUgdGhpcyBiZWhhdmlvciBmcm9tIHRoZSBsaXN0IG9mIGxhenkgYmVoYXZpb3JzXG4gICAgICAgIGxhenlCTmFtZXMuZGVsZXRlKGJOYW1lKTtcbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIG1vcmUgbGF6eSBiZWhhdmlvcnMgbGVmdCBvbiB0aGUgbm9kZVxuICAgICAgICAvLyBzdG9wIG9ic2VydmluZyB0aGUgbm9kZVxuICAgICAgICAvLyBlbHNlIHVwZGF0ZSB0aGUgaW9FbnRyaWVzXG4gICAgICAgIGlmIChsYXp5Qk5hbWVzLnNpemUgPT09IDApIHtcbiAgICAgICAgICBpby51bm9ic2VydmUoYk5vZGUpO1xuICAgICAgICAgIGlvRW50cmllcy5kZWxldGUoYk5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlvRW50cmllcy5zZXQoYk5vZGUsIGxhenlCTmFtZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gZW5kIGxvb3BMYXp5QmVoYXZpb3JOb2RlcyBiTm9kZXMgbG9vcFxuICB9KTtcbn1cblxuLypcbiAgaW50ZXJzZWN0aW9uXG5cbiAgZW50cmllcyAtIGludGVyc2VjdGlvbiBvYnNlcnZlciBlbnRyaWVzXG5cbiAgVGhlIGludGVyc2VjdGlvbiBvYnNlcnZlciBjYWxsIGJhY2ssXG4gIHNldHMgYSB2YWx1ZSBpbiB0aGUgaW50ZXJzZWN0aW5nIG1hcCB0cnVlL2ZhbHNlXG4gIGFuZCBpZiBhbiBlbnRyeSBpcyBpbnRlcnNlY3RpbmcsIGNoZWNrcyBpZiBuZWVkcyB0b1xuICBpbml0IGFueSBsYXp5IGJlaGF2aW9yc1xuKi9cbmZ1bmN0aW9uIGludGVyc2VjdGlvbihlbnRyaWVzKSB7XG4gIGVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICBpbnRlcnNlY3Rpbmcuc2V0KGVudHJ5LnRhcmdldCwgdHJ1ZSk7XG4gICAgICBsb29wTGF6eUJlaGF2aW9yTm9kZXMoW2VudHJ5LnRhcmdldF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnRlcnNlY3Rpbmcuc2V0KGVudHJ5LnRhcmdldCwgZmFsc2UpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qXG4gIG1lZGlhUXVlcnlVcGRhdGVkXG5cbiAgSWYgYSByZXNpemUgaGFzIGhhcHBlbmVkIHdpdGggZW5vdWdoIHNpemUgdGhhdCBhXG4gIGJyZWFrcG9pbnQgaGFzIGNoYW5nZWQsIGNoZWNrcyB0byBzZWUgaWYgYW55IGxhenlcbiAgYmVoYXZpb3JzIG5lZWQgdG8gYmUgaW5pdGlhbGlzZWQgb3Igbm90XG4qL1xuZnVuY3Rpb24gbWVkaWFRdWVyeVVwZGF0ZWQoKSB7XG4gIGxvb3BMYXp5QmVoYXZpb3JOb2RlcyhBcnJheS5mcm9tKGlvRW50cmllcy5rZXlzKCkpKTtcbn1cblxuXG4vKiB+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn4gUHVibGljIG1ldGhvZHMgKi9cblxuLypcbiAgaW5pdEJlaGF2aW9yXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yXG4gIGJOb2RlIC0gbm9kZSB0byBpbml0aWFsaXNlIGJlaGF2aW9yIG9uXG5cbiAgSXMgcmV0dXJuZWQgYXMgcHVibGljIG1ldGhvZFxuXG4gIFJ1biB0aGUgYGluaXRgIG1ldGhvZCBpbnNpZGUgb2YgYSBiZWhhdmlvcixcbiAgdGhlIGludGVybmFsIG9uZSBpbiBgY3JlYXRlQmVoYXZpb3JgLCB3aGljaCB0aGVuXG4gIHJ1bnMgdGhlIGJlaGF2aW9ycyBgaW5pdGAgbGlmZSBjeWNsZSBtZXRob2RcbiovXG5mdW5jdGlvbiBpbml0QmVoYXZpb3IoYk5hbWUsIGJOb2RlLCBjb25maWcgPSB7fSkge1xuICAvLyBmaXJzdCBjaGVjayB3ZSBoYXZlIGEgbG9hZGVkIGJlaGF2aW9yXG4gIGlmICghbG9hZGVkQmVoYXZpb3JzW2JOYW1lXSkge1xuICAgIC8vIGlmIG5vdCwgYXR0ZW1wdCB0byBpbXBvcnQgaXRcbiAgICBpbXBvcnRCZWhhdmlvcihiTmFtZSwgYk5vZGUpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBtZXJnZSBicmVha3BvaW50cyBpbnRvIGNvbmZpZ1xuICBjb25maWcgPSB7XG4gICAgYnJlYWtwb2ludHM6IG9wdGlvbnMuYnJlYWtwb2ludHMsXG4gICAgLi4uY29uZmlnXG4gIH07XG4gIC8vIG5vdyBjaGVjayB0aGF0IHRoaXMgYmVoYXZpb3IgaXNuJ3QgYWxyZWFkeVxuICAvLyBydW5uaW5nIG9uIHRoaXMgbm9kZVxuICBjb25zdCBub2RlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSkgfHwge307XG4gIGlmIChub2RlQmVoYXZpb3JzID09PSB7fSB8fCAhbm9kZUJlaGF2aW9yc1tiTmFtZV0pIHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBsb2FkZWRCZWhhdmlvcnNbYk5hbWVdKGJOb2RlLCBjb25maWcpO1xuICAgIC8vIHVwZGF0ZSBpbnRlcm5hbCBzdG9yZSBvZiB3aGF0cyBydW5uaW5nXG4gICAgbm9kZUJlaGF2aW9yc1tiTmFtZV0gPSBpbnN0YW5jZTtcbiAgICBhY3RpdmVCZWhhdmlvcnMuc2V0KGJOb2RlLCBub2RlQmVoYXZpb3JzKTtcbiAgICAvLyBpbml0IG1ldGhvZCBpbiB0aGUgYmVoYXZpb3JcbiAgICBpbnN0YW5jZS5pbml0KCk7XG4gICAgLy9cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cbn1cblxuLypcbiAgYWRkQmVoYXZpb3JzXG5cbiAgYmVoYXZpb3JzIC0gYmVoYXZpb3JzIG1vZHVsZXMsIG1vZHVsZSBvciBvYmplY3RcblxuICBJcyByZXR1cm5lZCBhcyBwdWJsaWMgbWV0aG9kXG5cbiAgQ2FuIHBhc3NcbiAgLSBhIHNpbmd1bGFyIGJlaGF2aW9yIGFzIGNyZWF0ZWQgYnkgYGNyZWF0ZUJlaGF2aW9yYCxcbiAgLSBhIGJlaGF2aW9yIG9iamVjdCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byBgY3JlYXRlQmVoYXZpb3JgXG4gIC0gYSBiZWhhdmlvciBtb2R1bGVcbiAgLSBhIGNvbGxlY3Rpb24gb2YgYmVoYXZpb3IgbW9kdWxlc1xuXG4gIEFkZHMgZWFjaCBiZWhhdmlvciB0byBtZW1vcnksIHRvIGJlIGluaXRpYWxpc2VkIHRvIGEgRE9NIG5vZGUgd2hlbiB0aGVcbiAgY29ycmVzcG9uZGluZyBET00gbm9kZSBleGlzdHNcbiovXG5mdW5jdGlvbiBhZGRCZWhhdmlvcnMoYmVoYXZpb3JzKSB7XG4gICAgLy8gaWYgc2luZ3VsYXIgYmVoYXZpb3IgYWRkZWQsIHNvcnQgaW50byBtb2R1bGUgbGlrZSBzdHJ1Y3R1cmVcbiAgICBpZiAodHlwZW9mIGJlaGF2aW9ycyA9PT0gJ2Z1bmN0aW9uJyAmJiBiZWhhdmlvcnMucHJvdG90eXBlLmJlaGF2aW9yTmFtZSkge1xuICAgICAgYmVoYXZpb3JzID0geyBbYmVoYXZpb3JzLnByb3RvdHlwZS5iZWhhdmlvck5hbWVdOiBiZWhhdmlvcnMgfTtcbiAgICB9XG4gICAgLy8gaWYgYW4gdW5jb21waWxlZCBiZWhhdmlvciBvYmplY3QgaXMgcGFzc2VkLCBjcmVhdGUgaXRcbiAgICBpZiAodHlwZW9mIGJlaGF2aW9ycyA9PT0gJ3N0cmluZycgJiYgYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGJlaGF2aW9ycyA9IHsgW2JlaGF2aW9yc106IGNyZWF0ZUJlaGF2aW9yKC4uLmFyZ3VtZW50cykgfTtcbiAgICB9XG4gICAgLy8gcHJvY2Vzc1xuICAgIGNvbnN0IHVuaXF1ZSA9IE9iamVjdC5rZXlzKGJlaGF2aW9ycykuZmlsdGVyKChvKSA9PiBsb2FkZWRCZWhhdmlvck5hbWVzLmluZGV4T2YobykgPT09IC0xKTtcbiAgICBpZiAodW5pcXVlLmxlbmd0aCkge1xuICAgICAgLy8gd2UgaGF2ZSBuZXcgdW5pcXVlIGJlaGF2aW9ycywgc3RvcmUgdGhlbVxuICAgICAgbG9hZGVkQmVoYXZpb3JOYW1lcyA9IGxvYWRlZEJlaGF2aW9yTmFtZXMuY29uY2F0KHVuaXF1ZSk7XG4gICAgICB1bmlxdWUuZm9yRWFjaChiTmFtZSA9PiB7XG4gICAgICAgIGxvYWRlZEJlaGF2aW9yc1tiTmFtZV0gPSBiZWhhdmlvcnNbYk5hbWVdO1xuICAgICAgfSk7XG4gICAgICAvLyB0cnkgYW5kIGFwcGx5IGJlaGF2aW9ycyB0byBhbnkgRE9NIG5vZGUgdGhhdCBuZWVkcyB0aGVtXG4gICAgICBjcmVhdGVCZWhhdmlvcnMoZG9jdW1lbnQpO1xuICAgICAgLy8gc3RhcnQgdGhlIG11dGF0aW9uIG9ic2VydmVyIGxvb2tpbmcgZm9yIERPTSBjaGFuZ2VzXG4gICAgICBpZiAoIW9ic2VydmluZ0JlaGF2aW9ycykge1xuICAgICAgICBvYnNlcnZlQmVoYXZpb3JzKCk7XG4gICAgICB9XG4gICAgfVxufVxuXG4vKlxuICBub2RlQmVoYXZpb3JzXG5cbiAgYk5vZGUgLSBub2RlIG9uIHdoaWNoIHRvIGdldCBhY3RpdmUgYmVoYXZpb3JzIG9uXG5cbiAgSXMgcmV0dXJuZWQgYXMgcHVibGljIG1ldGhvZCB3aGVuIHdlYnBhY2sgaXMgc2V0IHRvIGRldmVsb3BtZW50IG1vZGVcblxuICBSZXR1cm5zIGFsbCBhY3RpdmUgYmVoYXZpb3JzIG9uIGEgbm9kZVxuKi9cbmZ1bmN0aW9uIG5vZGVCZWhhdmlvcnMoYk5vZGUpIHtcbiAgY29uc3Qgbm9kZUJlaGF2aW9ycyA9IGFjdGl2ZUJlaGF2aW9ycy5nZXQoYk5vZGUpO1xuICBpZiAoIW5vZGVCZWhhdmlvcnMpIHtcbiAgICBjb25zb2xlLndhcm4oYE5vIGJlaGF2aW9ycyBvbjpgLCBiTm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5vZGVCZWhhdmlvcnM7XG4gIH1cbn1cblxuLypcbiAgYmVoYXZpb3JQcm9wZXJ0aWVzXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yIHRvIHJldHVybiBwcm9wZXJ0aWVzIG9mXG4gIGJOb2RlIC0gbm9kZSBvbiB3aGljaCB0aGUgYmVoYXZpb3IgaXMgcnVubmluZ1xuXG4gIElzIHJldHVybmVkIGFzIHB1YmxpYyBtZXRob2Qgd2hlbiB3ZWJwYWNrIGlzIHNldCB0byBkZXZlbG9wbWVudCBtb2RlXG5cbiAgUmV0dXJucyBhbGwgcHJvcGVydGllcyBvZiBhIGJlaGF2aW9yXG4qL1xuZnVuY3Rpb24gYmVoYXZpb3JQcm9wZXJ0aWVzKGJOYW1lLCBiTm9kZSkge1xuICBjb25zdCBub2RlQmVoYXZpb3JzID0gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSk7XG4gIGlmICghbm9kZUJlaGF2aW9ycyB8fCAhbm9kZUJlaGF2aW9yc1tiTmFtZV0pIHtcbiAgICBjb25zb2xlLndhcm4oYE5vIGJlaGF2aW9yICcke2JOYW1lfScgaW5zdGFuY2Ugb246YCwgYk5vZGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKVtiTmFtZV07XG4gIH1cbn1cblxuLypcbiAgYmVoYXZpb3JQcm9wXG5cbiAgYk5hbWUgLSBuYW1lIG9mIGJlaGF2aW9yIHRvIHJldHVybiBwcm9wZXJ0aWVzIG9mXG4gIGJOb2RlIC0gbm9kZSBvbiB3aGljaCB0aGUgYmVoYXZpb3IgaXMgcnVubmluZ1xuICBwcm9wIC0gcHJvcGVydHkgdG8gcmV0dXJuIG9yIHNldFxuICB2YWx1ZSAtIHZhbHVlIHRvIHNldFxuXG4gIElzIHJldHVybmVkIGFzIHB1YmxpYyBtZXRob2Qgd2hlbiB3ZWJwYWNrIGlzIHNldCB0byBkZXZlbG9wbWVudCBtb2RlXG5cbiAgUmV0dXJucyBzcGVjaWZpYyBwcm9wZXJ0eSBvZiBhIGJlaGF2aW9yIG9uIGEgbm9kZSwgb3IgcnVucyBhIG1ldGhvZFxuICBvciBzZXRzIGEgcHJvcGVydHkgb24gYSBiZWhhdmlvciBpZiBhIHZhbHVlIGlzIHNldC4gRm9yIGRlYnVnZ2dpbmcuXG4qL1xuZnVuY3Rpb24gYmVoYXZpb3JQcm9wKGJOYW1lLCBiTm9kZSwgcHJvcCwgdmFsdWUpIHtcbiAgY29uc3Qgbm9kZUJlaGF2aW9ycyA9IGFjdGl2ZUJlaGF2aW9ycy5nZXQoYk5vZGUpO1xuICBpZiAoIW5vZGVCZWhhdmlvcnMgfHwgIW5vZGVCZWhhdmlvcnNbYk5hbWVdKSB7XG4gICAgY29uc29sZS53YXJuKGBObyBiZWhhdmlvciAnJHtiTmFtZX0nIGluc3RhbmNlIG9uOmAsIGJOb2RlKTtcbiAgfSBlbHNlIGlmIChhY3RpdmVCZWhhdmlvcnMuZ2V0KGJOb2RlKVtiTmFtZV1bcHJvcF0pIHtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSlbYk5hbWVdW3Byb3BdO1xuICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgIGFjdGl2ZUJlaGF2aW9ycy5nZXQoYk5vZGUpW2JOYW1lXVtwcm9wXSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWN0aXZlQmVoYXZpb3JzLmdldChiTm9kZSlbYk5hbWVdW3Byb3BdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLndhcm4oYE5vIHByb3BlcnR5ICcke3Byb3B9JyBpbiBiZWhhdmlvciAnJHtiTmFtZX0nIGluc3RhbmNlIG9uOmAsIGJOb2RlKTtcbiAgfVxufVxuXG4vKlxuICBpbml0XG5cbiAgZ2V0cyB0aGlzIHNob3cgb24gdGhlIHJvYWRcblxuICBsb2FkZWRCZWhhdmlvcnNNb2R1bGUgLSBvcHRpb25hbCBiZWhhdmlvcnMgbW9kdWxlIHRvIGxvYWQgb24gaW5pdFxuICBvcHRzIC0gYW55IG9wdGlvbnMgZm9yIHRoaXMgaW5zdGFuY2VcbiovXG5cbmZ1bmN0aW9uIGluaXQobG9hZGVkQmVoYXZpb3JzTW9kdWxlLCBvcHRzKSB7XG4gIG9wdGlvbnMgPSB7XG4gICAgLi4ub3B0aW9ucywgLi4ub3B0c1xuICB9O1xuXG4gIC8vIG9uIHJlc2l6ZSwgY2hlY2tcbiAgcmVzaXplZCgpO1xuXG4gIC8vIHNldCB1cCBpbnRlcnNlY3Rpb24gb2JzZXJ2ZXJcbiAgaW8gPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoaW50ZXJzZWN0aW9uLCBvcHRpb25zLmludGVyc2VjdGlvbk9wdGlvbnMpO1xuXG4gIC8vIGlmIGZuIHJ1biB3aXRoIHN1cHBsaWVkIGJlaGF2aW9ycywgbGV0cyBhZGQgdGhlbSBhbmQgYmVnaW5cbiAgaWYgKGxvYWRlZEJlaGF2aW9yc01vZHVsZSkge1xuICAgIGFkZEJlaGF2aW9ycyhsb2FkZWRCZWhhdmlvcnNNb2R1bGUpO1xuICB9XG5cbiAgLy8gd2F0Y2ggZm9yIGJyZWFrIHBvaW50IGNoYW5nZXNcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lZGlhUXVlcnlVcGRhdGVkJywgbWVkaWFRdWVyeVVwZGF0ZWQpO1xufVxuXG4vLyBleHBvc2UgcHVibGljIG1ldGhvZHMsIGVzc2VudGlhbGx5IHJldHVybmluZ1xuXG5sZXQgZXhwb3J0T2JqID0ge1xuICBpbml0OiBpbml0LFxuICBhZGQ6IGFkZEJlaGF2aW9ycyxcbiAgaW5pdEJlaGF2aW9yOiBpbml0QmVoYXZpb3IsXG4gIGdldCBjdXJyZW50QnJlYWtwb2ludCgpIHtcbiAgICByZXR1cm4gZ2V0Q3VycmVudE1lZGlhUXVlcnkoKTtcbiAgfVxufTtcblxuaWYgKHByb2Nlc3MuZW52Lk1PREUgJiYgcHJvY2Vzcy5lbnYuTU9ERSA9PT0gJ2RldmVsb3BtZW50Jykge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0T2JqLCAnbG9hZGVkJywge1xuICAgIGdldDogKCkgPT4ge1xuICAgICAgcmV0dXJuIGxvYWRlZEJlaGF2aW9yTmFtZXM7XG4gICAgfVxuICB9KTtcbiAgZXhwb3J0T2JqLmFjdGl2ZUJlaGF2aW9ycyA9IGFjdGl2ZUJlaGF2aW9ycztcbiAgZXhwb3J0T2JqLmFjdGl2ZSA9IGFjdGl2ZUJlaGF2aW9ycztcbiAgZXhwb3J0T2JqLmdldEJlaGF2aW9ycyA9IG5vZGVCZWhhdmlvcnM7XG4gIGV4cG9ydE9iai5nZXRQcm9wcyA9IGJlaGF2aW9yUHJvcGVydGllcztcbiAgZXhwb3J0T2JqLmdldFByb3AgPSBiZWhhdmlvclByb3A7XG4gIGV4cG9ydE9iai5zZXRQcm9wID0gYmVoYXZpb3JQcm9wO1xuICBleHBvcnRPYmouY2FsbE1ldGhvZCA9IGJlaGF2aW9yUHJvcDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlQmVoYXZpb3IsIGV4cG9ydE9iaiBhcyBtYW5hZ2VCZWhhdmlvcnMgfTtcbiIsInZhciBtYXAgPSB7XG5cdFwiLi9pbmRleC5qc1wiOiBcIi4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbS9pbmRleC5qc1wiXG59O1xuXG5mdW5jdGlvbiB3ZWJwYWNrQXN5bmNDb250ZXh0KHJlcSkge1xuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhtYXAsIHJlcSkpIHtcblx0XHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXG5cdFx0dmFyIGlkID0gbWFwW3JlcV07XG5cdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oaWQpO1xuXHR9KTtcbn1cbndlYnBhY2tBc3luY0NvbnRleHQua2V5cyA9ICgpID0+IChPYmplY3Qua2V5cyhtYXApKTtcbndlYnBhY2tBc3luY0NvbnRleHQuaWQgPSBcIi4vbm9kZV9tb2R1bGVzL0BhcmVhMTcvYTE3LWJlaGF2aW9ycy9kaXN0L2VzbSBsYXp5IHJlY3Vyc2l2ZSBeLipcXFxcLy4qXFxcXC4uKiRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0FzeW5jQ29udGV4dDsiLCJmdW5jdGlvbiB3ZWJwYWNrRW1wdHlBc3luY0NvbnRleHQocmVxKSB7XG5cdC8vIEhlcmUgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigpIGlzIHVzZWQgaW5zdGVhZCBvZiBuZXcgUHJvbWlzZSgpIHRvIHByZXZlbnRcblx0Ly8gdW5jYXVnaHQgZXhjZXB0aW9uIHBvcHBpbmcgdXAgaW4gZGV2dG9vbHNcblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fSk7XG59XG53ZWJwYWNrRW1wdHlBc3luY0NvbnRleHQua2V5cyA9ICgpID0+IChbXSk7XG53ZWJwYWNrRW1wdHlBc3luY0NvbnRleHQucmVzb2x2ZSA9IHdlYnBhY2tFbXB0eUFzeW5jQ29udGV4dDtcbndlYnBhY2tFbXB0eUFzeW5jQ29udGV4dC5pZCA9IFwiLi9ub2RlX21vZHVsZXMvQGFyZWExNy9hMTctYmVoYXZpb3JzL2Rpc3QvZXNtIGxhenkgcmVjdXJzaXZlIF4uKlxcXFwvLipcXFxcLy4qXFxcXC4uKiRcIjtcbm1vZHVsZS5leHBvcnRzID0gd2VicGFja0VtcHR5QXN5bmNDb250ZXh0OyIsImV4cG9ydCB7IGRlZmF1bHQgYXMgQWNjb3JkaW9uIH0gZnJvbSAnLi4vLi4vLi4vdmlld3MvY29tcG9uZW50cy9hY2NvcmRpb24vYWNjb3JkaW9uJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTW9kYWwgfSBmcm9tICcuLi8uLi8uLi92aWV3cy9jb21wb25lbnRzL21vZGFsL21vZGFsJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVmlkZW9CYWNrZ3JvdW5kIH0gZnJvbSAnLi4vLi4vLi4vdmlld3MvY29tcG9uZW50cy92aWRlby1iYWNrZ3JvdW5kL3ZpZGVvLWJhY2tncm91bmQnO1xuIiwiaW1wb3J0IHsgbWFuYWdlQmVoYXZpb3JzIH0gZnJvbSAnQGFyZWExNy9hMTctYmVoYXZpb3JzJztcbmltcG9ydCAqIGFzIEJlaGF2aW9ycyBmcm9tICcuL2JlaGF2aW9ycyc7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgbWFuYWdlQmVoYXZpb3JzKEJlaGF2aW9ycywge1xuICAgICAgICBicmVha3BvaW50czogWydzbScsICdtZCcsICdsZycsICd4bCcsICcyeGwnXVxuICAgIH0pO1xufSk7XG4iLCJpbXBvcnQgeyBjcmVhdGVCZWhhdmlvciB9IGZyb20gJ0BhcmVhMTcvYTE3LWJlaGF2aW9ycyc7XG5cbmNvbnN0IEFjY29yZGlvbiA9IGNyZWF0ZUJlaGF2aW9yKFxuICAgICdBY2NvcmRpb24nLFxuICAgIHtcbiAgICAgICAgdG9nZ2xlKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBlLmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLUFjY29yZGlvbi1pbmRleCcpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fZGF0YS5hY3RpdmVJbmRleGVzLmluY2x1ZGVzKGluZGV4KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoaW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YS5hY3RpdmVJbmRleGVzID0gdGhpcy5fZGF0YS5hY3RpdmVJbmRleGVzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtICE9PSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlbihpbmRleCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGF0YS5hY3RpdmVJbmRleGVzLnB1c2goaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlKGluZGV4KSB7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVUcmlnZ2VyID0gdGhpcy4kdHJpZ2dlcnNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlSWNvbiA9IHRoaXMuJHRyaWdnZXJJY29uc1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVDb250ZW50ID0gdGhpcy4kY29udGVudHNbaW5kZXhdO1xuXG4gICAgICAgICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuXG4gICAgICAgICAgICBhY3RpdmVUcmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgICAgICAgYWN0aXZlQ29udGVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgICAgIGFjdGl2ZUljb24uY2xhc3NMaXN0LnJlbW92ZSgncm90YXRlLTE4MCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9wZW4oaW5kZXgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVRyaWdnZXIgPSB0aGlzLiR0cmlnZ2Vyc1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVJY29uID0gdGhpcy4kdHJpZ2dlckljb25zW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZUNvbnRlbnQgPSB0aGlzLiRjb250ZW50c1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVDb250ZW50SW5uZXIgPSB0aGlzLiRjb250ZW50SW5uZXJzW2luZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSBhY3RpdmVDb250ZW50SW5uZXIub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgICAgICBhY3RpdmVDb250ZW50LnN0eWxlLmhlaWdodCA9IGAke2NvbnRlbnRIZWlnaHR9cHhgO1xuXG4gICAgICAgICAgICBhY3RpdmVUcmlnZ2VyLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICBhY3RpdmVDb250ZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIGFjdGl2ZUljb24uY2xhc3NMaXN0LmFkZCgncm90YXRlLTE4MCcpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLmFjdGl2ZUluZGV4ZXMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy4kaW5pdE9wZW4gPSB0aGlzLmdldENoaWxkcmVuKCdpbml0LW9wZW4nKTtcbiAgICAgICAgICAgIHRoaXMuJHRyaWdnZXJzID0gdGhpcy5nZXRDaGlsZHJlbigndHJpZ2dlcicpO1xuICAgICAgICAgICAgdGhpcy4kdHJpZ2dlckljb25zID0gdGhpcy5nZXRDaGlsZHJlbigndHJpZ2dlci1pY29uJyk7XG4gICAgICAgICAgICB0aGlzLiRjb250ZW50cyA9IHRoaXMuZ2V0Q2hpbGRyZW4oJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgIHRoaXMuJGNvbnRlbnRJbm5lcnMgPSB0aGlzLmdldENoaWxkcmVuKCdjb250ZW50LWlubmVyJyk7XG5cbiAgICAgICAgICAgIHRoaXMuJHRyaWdnZXJzLmZvckVhY2goKHRyaWdnZXIpID0+IHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGUsIGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLiRpbml0T3Blbi5mb3JFYWNoKCh0cmlnZ2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJpZ2dlci5jbGljaygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVuYWJsZWQoKSB7fSxcbiAgICAgICAgcmVzaXplZCgpIHt9LFxuICAgICAgICBtZWRpYVF1ZXJ5VXBkYXRlZCgpIHt9LFxuICAgICAgICBkaXNhYmxlZCgpIHt9LFxuICAgICAgICBkZXN0cm95KCkge1xuICAgICAgICAgICAgdGhpcy4kdHJpZ2dlcnMuZm9yRWFjaCgodHJpZ2dlcikgPT4ge1xuICAgICAgICAgICAgICAgIHRyaWdnZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnRvZ2dsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbik7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY29yZGlvbjtcbiIsImltcG9ydCB7IGNyZWF0ZUJlaGF2aW9yIH0gZnJvbSAnQGFyZWExNy9hMTctYmVoYXZpb3JzJztcbmltcG9ydCB7IGRpc2FibGVCb2R5U2Nyb2xsLCBlbmFibGVCb2R5U2Nyb2xsIH0gZnJvbSAnYm9keS1zY3JvbGwtbG9jayc7XG5pbXBvcnQgKiBhcyBmb2N1c1RyYXAgZnJvbSAnZm9jdXMtdHJhcCc7XG5cbmNvbnN0IE1vZGFsID0gY3JlYXRlQmVoYXZpb3IoXG4gICAgJ01vZGFsJyxcbiAgICB7XG4gICAgICAgIHRvZ2dsZShlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9kYXRhLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZShlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZGF0YS5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJG5vZGUuY2xhc3NMaXN0LnJlbW92ZSguLi50aGlzLl9kYXRhLmFjdGl2ZUNsYXNzZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RhdGEuZm9jdXNUcmFwLmRlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZW5hYmxlQm9keVNjcm9sbCh0aGlzLiRub2RlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuJG5vZGUuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ01vZGFsOmNsb3NlZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuKCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ01vZGFsOmNsb3NlQWxsJykpO1xuXG4gICAgICAgICAgICB0aGlzLiRub2RlLmNsYXNzTGlzdC5hZGQoLi4udGhpcy5fZGF0YS5hY3RpdmVDbGFzc2VzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEuaXNBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kYXRhLmZvY3VzVHJhcC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIGRpc2FibGVCb2R5U2Nyb2xsKHRoaXMuJG5vZGUpO1xuICAgICAgICAgICAgfSwgMzAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYW5kbGVFc2MoZSkge1xuICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBoYW5kbGVDbGlja091dHNpZGUoZSkge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSB0aGlzLiRub2RlLmlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZShlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGRMaXN0ZW5lcihhcnIsIGZ1bmMpIHtcbiAgICAgICAgICAgIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycltpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmMsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVMaXN0ZW5lcihhcnIsIGZ1bmMpIHtcbiAgICAgICAgICAgIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycltpXS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLiRmb2N1c1RyYXAgPSB0aGlzLmdldENoaWxkKCdmb2N1cy10cmFwJyk7XG4gICAgICAgICAgICB0aGlzLiRjbG9zZUJ1dHRvbnMgPSB0aGlzLmdldENoaWxkcmVuKCdjbG9zZS10cmlnZ2VyJyk7XG4gICAgICAgICAgICB0aGlzLiRpbml0aWFsRm9jdXMgPSB0aGlzLmdldENoaWxkKCdpbml0aWFsLWZvY3VzJyk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy4kaW5pdGlhbEZvY3VzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAnTm8gaW5pdGlhbCBmb2N1cyBlbGVtZW50IGZvdW5kLiBBZGQgYSBgaDFgIHdpdGggdGhlIGF0dHJpYnV0ZSBgZGF0YS1Nb2RhbC1pbml0aWFsLWZvY3VzYC4gVGhlIGBoMWAgc2hvdWxkIGFsc28gaGF2ZSBhbiBpZCB0aGF0IG1hdGNoZXMgdGhlIG1vZGFsIGlkIHdpdGggYF90aXRsZWAgYXBwZW5kZWQnXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGF0YS5mb2N1c1RyYXAgPSBmb2N1c1RyYXAuY3JlYXRlRm9jdXNUcmFwKHRoaXMuJGZvY3VzVHJhcCwge1xuICAgICAgICAgICAgICAgIGluaXRpYWxGb2N1czogdGhpcy4kaW5pdGlhbEZvY3VzXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5fZGF0YS5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5hY3RpdmVDbGFzc2VzID0gWydhMTctdHJhbnMtc2hvdy1oaWRlLS1hY3RpdmUnXTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuJGNsb3NlQnV0dG9ucykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIodGhpcy4kY2xvc2VCdXR0b25zLCB0aGlzLmNsb3NlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kbm9kZS5hZGRFdmVudExpc3RlbmVyKCdNb2RhbDp0b2dnbGUnLCB0aGlzLnRvZ2dsZSwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kbm9kZS5hZGRFdmVudExpc3RlbmVyKCdNb2RhbDpvcGVuJywgdGhpcy5vcGVuLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLiRub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ01vZGFsOmNsb3NlJywgdGhpcy5jbG9zZSwgZmFsc2UpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignTW9kYWw6Y2xvc2VBbGwnLCB0aGlzLmNsb3NlLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVFc2MsIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gYWRkIGxpc3RlbmVyIHRvIG1vZGFsIHRvZ2dsZSBidXR0b25zXG4gICAgICAgICAgICBjb25zdCBtb2RhbElkID0gdGhpcy4kbm9kZS5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgICB0aGlzLiR0cmlnZ2VycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgYFtkYXRhLW1vZGFsLXRhcmdldD1cIiMke21vZGFsSWR9XCJdYFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcih0aGlzLiR0cmlnZ2VycywgdGhpcy50b2dnbGUpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zWydwYW5lbCddKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kbm9kZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWNrT3V0c2lkZSxcbiAgICAgICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmFibGVkKCkge30sXG4gICAgICAgIHJlc2l6ZWQoKSB7fSxcbiAgICAgICAgbWVkaWFRdWVyeVVwZGF0ZWQoKSB7XG4gICAgICAgICAgICAvLyBjdXJyZW50IG1lZGlhIHF1ZXJ5IGlzOiBBMTcuY3VycmVudE1lZGlhUXVlcnlcbiAgICAgICAgfSxcbiAgICAgICAgZGlzYWJsZWQoKSB7fSxcbiAgICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuJGNsb3NlQnV0dG9ucykge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodGhpcy4kY2xvc2VCdXR0b25zLCB0aGlzLmNsb3NlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdNb2RhbDp0b2dnbGUnLCB0aGlzLnRvZ2dsZSk7XG4gICAgICAgICAgICB0aGlzLiRub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ01vZGFsOm9wZW4nLCB0aGlzLm9wZW4pO1xuICAgICAgICAgICAgdGhpcy4kbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdNb2RhbDpjbG9zZScsIHRoaXMuY2xvc2UpO1xuICAgICAgICAgICAgdGhpcy4kbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2tPdXRzaWRlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ01vZGFsOmNsb3NlQWxsJywgdGhpcy5jbG9zZSk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5oYW5kbGVFc2MpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHRoaXMuJHRyaWdnZXJzLCB0aGlzLnRvZ2dsZSk7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5leHBvcnQgZGVmYXVsdCBNb2RhbDtcbiIsImltcG9ydCB7IGNyZWF0ZUJlaGF2aW9yIH0gZnJvbSAnQGFyZWExNy9hMTctYmVoYXZpb3JzJztcblxuY29uc3QgVmlkZW9CYWNrZ3JvdW5kID0gY3JlYXRlQmVoYXZpb3IoXG4gICAgJ1ZpZGVvQmFja2dyb3VuZCcsXG4gICAge1xuICAgICAgICB0b2dnbGUoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmlzUGxheWluZyl7XG4gICAgICAgICAgICAgICAgdGhpcy4kcGxheWVyLnBhdXNlKCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICB0aGlzLiRwbGF5ZXIucGxheSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJ1dHRvbigpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVQbGF5KGUpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlUGF1c2UoZSkge1xuICAgICAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlQnV0dG9uKCl7XG4gICAgICAgICAgICBjb25zdCBidXR0b25UZXh0ID0gdGhpcy5pc1BsYXlpbmcgPyB0aGlzLmJ1dHRvblRleHQucGxheSA6IHRoaXMuYnV0dG9uVGV4dC5wYXVzZTtcblxuICAgICAgICAgICAgdGhpcy4kcGF1c2VCdXR0b24uaW5uZXJUZXh0ID0gYnV0dG9uVGV4dDtcbiAgICAgICAgICAgIHRoaXMuJHBhdXNlQnV0dG9uLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcsIGJ1dHRvblRleHQpO1xuICAgICAgICAgICAgdGhpcy4kcGF1c2VCdXR0b24uc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLmlzUGxheWluZy50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uVGV4dCA9IHtcbiAgICAgICAgICAgICAgICBwbGF5OiB0aGlzLm9wdGlvbnNbJ3RleHQtcGxheSddLFxuICAgICAgICAgICAgICAgIHBhdXNlOiB0aGlzLm9wdGlvbnNbJ3RleHQtcGF1c2UnXSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuJHBsYXllciA9IHRoaXMuZ2V0Q2hpbGQoJ3BsYXllcicpO1xuICAgICAgICAgICAgdGhpcy4kcGF1c2VCdXR0b24gPSB0aGlzLmdldENoaWxkKCdjb250cm9scycpLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpO1xuXG4gICAgICAgICAgICB0aGlzLiRwbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIHRoaXMuaGFuZGxlUGxheSwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kcGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3BhdXNlJywgdGhpcy5oYW5kbGVQYXVzZSwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy4kcGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnRvZ2dsZSwgZmFsc2UpO1xuICAgICAgICB9LFxuICAgICAgICBlbmFibGVkKCkge30sXG4gICAgICAgIHJlc2l6ZWQoKSB7fSxcbiAgICAgICAgbWVkaWFRdWVyeVVwZGF0ZWQoKSB7fSxcbiAgICAgICAgZGlzYWJsZWQoKSB7fSxcbiAgICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMuJHBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdwbGF5JywgdGhpcy5oYW5kbGVQbGF5KTtcbiAgICAgICAgICAgIHRoaXMuJHBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdwYXVzZScsIHRoaXMuaGFuZGxlUGF1c2UpO1xuICAgICAgICAgICAgdGhpcy4kcGF1c2VCdXR0b24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnRvZ2dsZSk7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5leHBvcnQgZGVmYXVsdCBWaWRlb0JhY2tncm91bmQ7XG4iLCJmdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLy8gT2xkZXIgYnJvd3NlcnMgZG9uJ3Qgc3VwcG9ydCBldmVudCBvcHRpb25zLCBmZWF0dXJlIGRldGVjdCBpdC5cblxuLy8gQWRvcHRlZCBhbmQgbW9kaWZpZWQgc29sdXRpb24gZnJvbSBCb2hkYW4gRGlkdWtoICgyMDE3KVxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDE1OTQ5OTcvaW9zLTEwLXNhZmFyaS1wcmV2ZW50LXNjcm9sbGluZy1iZWhpbmQtYS1maXhlZC1vdmVybGF5LWFuZC1tYWludGFpbi1zY3JvbGwtcG9zaVxuXG52YXIgaGFzUGFzc2l2ZUV2ZW50cyA9IGZhbHNlO1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHZhciBwYXNzaXZlVGVzdE9wdGlvbnMgPSB7XG4gICAgZ2V0IHBhc3NpdmUoKSB7XG4gICAgICBoYXNQYXNzaXZlRXZlbnRzID0gdHJ1ZTtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdFBhc3NpdmUnLCBudWxsLCBwYXNzaXZlVGVzdE9wdGlvbnMpO1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGVzdFBhc3NpdmUnLCBudWxsLCBwYXNzaXZlVGVzdE9wdGlvbnMpO1xufVxuXG52YXIgaXNJb3NEZXZpY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubmF2aWdhdG9yICYmIHdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gJiYgKC9pUChhZHxob25lfG9kKS8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtKSB8fCB3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtID09PSAnTWFjSW50ZWwnICYmIHdpbmRvdy5uYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAxKTtcblxuXG52YXIgbG9ja3MgPSBbXTtcbnZhciBkb2N1bWVudExpc3RlbmVyQWRkZWQgPSBmYWxzZTtcbnZhciBpbml0aWFsQ2xpZW50WSA9IC0xO1xudmFyIHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyA9IHZvaWQgMDtcbnZhciBwcmV2aW91c0JvZHlQb3NpdGlvbiA9IHZvaWQgMDtcbnZhciBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgPSB2b2lkIDA7XG5cbi8vIHJldHVybnMgdHJ1ZSBpZiBgZWxgIHNob3VsZCBiZSBhbGxvd2VkIHRvIHJlY2VpdmUgdG91Y2htb3ZlIGV2ZW50cy5cbnZhciBhbGxvd1RvdWNoTW92ZSA9IGZ1bmN0aW9uIGFsbG93VG91Y2hNb3ZlKGVsKSB7XG4gIHJldHVybiBsb2Nrcy5zb21lKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgaWYgKGxvY2sub3B0aW9ucy5hbGxvd1RvdWNoTW92ZSAmJiBsb2NrLm9wdGlvbnMuYWxsb3dUb3VjaE1vdmUoZWwpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xufTtcblxudmFyIHByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gcHJldmVudERlZmF1bHQocmF3RXZlbnQpIHtcbiAgdmFyIGUgPSByYXdFdmVudCB8fCB3aW5kb3cuZXZlbnQ7XG5cbiAgLy8gRm9yIHRoZSBjYXNlIHdoZXJlYnkgY29uc3VtZXJzIGFkZHMgYSB0b3VjaG1vdmUgZXZlbnQgbGlzdGVuZXIgdG8gZG9jdW1lbnQuXG4gIC8vIFJlY2FsbCB0aGF0IHdlIGRvIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIC8vIGluIGRpc2FibGVCb2R5U2Nyb2xsIC0gc28gaWYgd2UgcHJvdmlkZSB0aGlzIG9wcG9ydHVuaXR5IHRvIGFsbG93VG91Y2hNb3ZlLCB0aGVuXG4gIC8vIHRoZSB0b3VjaG1vdmUgZXZlbnQgb24gZG9jdW1lbnQgd2lsbCBicmVhay5cbiAgaWYgKGFsbG93VG91Y2hNb3ZlKGUudGFyZ2V0KSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gRG8gbm90IHByZXZlbnQgaWYgdGhlIGV2ZW50IGhhcyBtb3JlIHRoYW4gb25lIHRvdWNoICh1c3VhbGx5IG1lYW5pbmcgdGhpcyBpcyBhIG11bHRpIHRvdWNoIGdlc3R1cmUgbGlrZSBwaW5jaCB0byB6b29tKS5cbiAgaWYgKGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm4gdHJ1ZTtcblxuICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBzZXRPdmVyZmxvd0hpZGRlbiA9IGZ1bmN0aW9uIHNldE92ZXJmbG93SGlkZGVuKG9wdGlvbnMpIHtcbiAgLy8gSWYgcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0IGlzIGFscmVhZHkgc2V0LCBkb24ndCBzZXQgaXQgYWdhaW4uXG4gIGlmIChwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBfcmVzZXJ2ZVNjcm9sbEJhckdhcCA9ICEhb3B0aW9ucyAmJiBvcHRpb25zLnJlc2VydmVTY3JvbGxCYXJHYXAgPT09IHRydWU7XG4gICAgdmFyIHNjcm9sbEJhckdhcCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgaWYgKF9yZXNlcnZlU2Nyb2xsQmFyR2FwICYmIHNjcm9sbEJhckdhcCA+IDApIHtcbiAgICAgIHZhciBjb21wdXRlZEJvZHlQYWRkaW5nUmlnaHQgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLXJpZ2h0JyksIDEwKTtcbiAgICAgIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCA9IGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0O1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBjb21wdXRlZEJvZHlQYWRkaW5nUmlnaHQgKyBzY3JvbGxCYXJHYXAgKyAncHgnO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyBpcyBhbHJlYWR5IHNldCwgZG9uJ3Qgc2V0IGl0IGFnYWluLlxuICBpZiAocHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nID09PSB1bmRlZmluZWQpIHtcbiAgICBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPSBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93O1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgfVxufTtcblxudmFyIHJlc3RvcmVPdmVyZmxvd1NldHRpbmcgPSBmdW5jdGlvbiByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nKCkge1xuICBpZiAocHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IHByZXZpb3VzQm9keVBhZGRpbmdSaWdodDtcblxuICAgIC8vIFJlc3RvcmUgcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0IHRvIHVuZGVmaW5lZCBzbyBzZXRPdmVyZmxvd0hpZGRlbiBrbm93cyBpdFxuICAgIC8vIGNhbiBiZSBzZXQgYWdhaW4uXG4gICAgcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZztcblxuICAgIC8vIFJlc3RvcmUgcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nIHRvIHVuZGVmaW5lZFxuICAgIC8vIHNvIHNldE92ZXJmbG93SGlkZGVuIGtub3dzIGl0IGNhbiBiZSBzZXQgYWdhaW4uXG4gICAgcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nID0gdW5kZWZpbmVkO1xuICB9XG59O1xuXG52YXIgc2V0UG9zaXRpb25GaXhlZCA9IGZ1bmN0aW9uIHNldFBvc2l0aW9uRml4ZWQoKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJZiBwcmV2aW91c0JvZHlQb3NpdGlvbiBpcyBhbHJlYWR5IHNldCwgZG9uJ3Qgc2V0IGl0IGFnYWluLlxuICAgIGlmIChwcmV2aW91c0JvZHlQb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcmV2aW91c0JvZHlQb3NpdGlvbiA9IHtcbiAgICAgICAgcG9zaXRpb246IGRvY3VtZW50LmJvZHkuc3R5bGUucG9zaXRpb24sXG4gICAgICAgIHRvcDogZG9jdW1lbnQuYm9keS5zdHlsZS50b3AsXG4gICAgICAgIGxlZnQ6IGRvY3VtZW50LmJvZHkuc3R5bGUubGVmdFxuICAgICAgfTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBkb20gaW5zaWRlIGFuIGFuaW1hdGlvbiBmcmFtZSBcbiAgICAgIHZhciBfd2luZG93ID0gd2luZG93LFxuICAgICAgICAgIHNjcm9sbFkgPSBfd2luZG93LnNjcm9sbFksXG4gICAgICAgICAgc2Nyb2xsWCA9IF93aW5kb3cuc2Nyb2xsWCxcbiAgICAgICAgICBpbm5lckhlaWdodCA9IF93aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS50b3AgPSAtc2Nyb2xsWTtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubGVmdCA9IC1zY3JvbGxYO1xuXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIEF0dGVtcHQgdG8gY2hlY2sgaWYgdGhlIGJvdHRvbSBiYXIgYXBwZWFyZWQgZHVlIHRvIHRoZSBwb3NpdGlvbiBjaGFuZ2VcbiAgICAgICAgICB2YXIgYm90dG9tQmFySGVpZ2h0ID0gaW5uZXJIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgICAgaWYgKGJvdHRvbUJhckhlaWdodCAmJiBzY3JvbGxZID49IGlubmVySGVpZ2h0KSB7XG4gICAgICAgICAgICAvLyBNb3ZlIHRoZSBjb250ZW50IGZ1cnRoZXIgdXAgc28gdGhhdCB0aGUgYm90dG9tIGJhciBkb2Vzbid0IGhpZGUgaXRcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudG9wID0gLShzY3JvbGxZICsgYm90dG9tQmFySGVpZ2h0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgMzAwKTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIHJlc3RvcmVQb3NpdGlvblNldHRpbmcgPSBmdW5jdGlvbiByZXN0b3JlUG9zaXRpb25TZXR0aW5nKCkge1xuICBpZiAocHJldmlvdXNCb2R5UG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIENvbnZlcnQgdGhlIHBvc2l0aW9uIGZyb20gXCJweFwiIHRvIEludFxuICAgIHZhciB5ID0gLXBhcnNlSW50KGRvY3VtZW50LmJvZHkuc3R5bGUudG9wLCAxMCk7XG4gICAgdmFyIHggPSAtcGFyc2VJbnQoZG9jdW1lbnQuYm9keS5zdHlsZS5sZWZ0LCAxMCk7XG5cbiAgICAvLyBSZXN0b3JlIHN0eWxlc1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucG9zaXRpb24gPSBwcmV2aW91c0JvZHlQb3NpdGlvbi5wb3NpdGlvbjtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnRvcCA9IHByZXZpb3VzQm9keVBvc2l0aW9uLnRvcDtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmxlZnQgPSBwcmV2aW91c0JvZHlQb3NpdGlvbi5sZWZ0O1xuXG4gICAgLy8gUmVzdG9yZSBzY3JvbGxcbiAgICB3aW5kb3cuc2Nyb2xsVG8oeCwgeSk7XG5cbiAgICBwcmV2aW91c0JvZHlQb3NpdGlvbiA9IHVuZGVmaW5lZDtcbiAgfVxufTtcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvc2Nyb2xsSGVpZ2h0I1Byb2JsZW1zX2FuZF9zb2x1dGlvbnNcbnZhciBpc1RhcmdldEVsZW1lbnRUb3RhbGx5U2Nyb2xsZWQgPSBmdW5jdGlvbiBpc1RhcmdldEVsZW1lbnRUb3RhbGx5U2Nyb2xsZWQodGFyZ2V0RWxlbWVudCkge1xuICByZXR1cm4gdGFyZ2V0RWxlbWVudCA/IHRhcmdldEVsZW1lbnQuc2Nyb2xsSGVpZ2h0IC0gdGFyZ2V0RWxlbWVudC5zY3JvbGxUb3AgPD0gdGFyZ2V0RWxlbWVudC5jbGllbnRIZWlnaHQgOiBmYWxzZTtcbn07XG5cbnZhciBoYW5kbGVTY3JvbGwgPSBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoZXZlbnQsIHRhcmdldEVsZW1lbnQpIHtcbiAgdmFyIGNsaWVudFkgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFkgLSBpbml0aWFsQ2xpZW50WTtcblxuICBpZiAoYWxsb3dUb3VjaE1vdmUoZXZlbnQudGFyZ2V0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0YXJnZXRFbGVtZW50ICYmIHRhcmdldEVsZW1lbnQuc2Nyb2xsVG9wID09PSAwICYmIGNsaWVudFkgPiAwKSB7XG4gICAgLy8gZWxlbWVudCBpcyBhdCB0aGUgdG9wIG9mIGl0cyBzY3JvbGwuXG4gICAgcmV0dXJuIHByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgfVxuXG4gIGlmIChpc1RhcmdldEVsZW1lbnRUb3RhbGx5U2Nyb2xsZWQodGFyZ2V0RWxlbWVudCkgJiYgY2xpZW50WSA8IDApIHtcbiAgICAvLyBlbGVtZW50IGlzIGF0IHRoZSBib3R0b20gb2YgaXRzIHNjcm9sbC5cbiAgICByZXR1cm4gcHJldmVudERlZmF1bHQoZXZlbnQpO1xuICB9XG5cbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIHJldHVybiB0cnVlO1xufTtcblxuZXhwb3J0IHZhciBkaXNhYmxlQm9keVNjcm9sbCA9IGZ1bmN0aW9uIGRpc2FibGVCb2R5U2Nyb2xsKHRhcmdldEVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgLy8gdGFyZ2V0RWxlbWVudCBtdXN0IGJlIHByb3ZpZGVkXG4gIGlmICghdGFyZ2V0RWxlbWVudCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5lcnJvcignZGlzYWJsZUJvZHlTY3JvbGwgdW5zdWNjZXNzZnVsIC0gdGFyZ2V0RWxlbWVudCBtdXN0IGJlIHByb3ZpZGVkIHdoZW4gY2FsbGluZyBkaXNhYmxlQm9keVNjcm9sbCBvbiBJT1MgZGV2aWNlcy4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBkaXNhYmxlQm9keVNjcm9sbCBtdXN0IG5vdCBoYXZlIGJlZW4gY2FsbGVkIG9uIHRoaXMgdGFyZ2V0RWxlbWVudCBiZWZvcmVcbiAgaWYgKGxvY2tzLnNvbWUoZnVuY3Rpb24gKGxvY2spIHtcbiAgICByZXR1cm4gbG9jay50YXJnZXRFbGVtZW50ID09PSB0YXJnZXRFbGVtZW50O1xuICB9KSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBsb2NrID0ge1xuICAgIHRhcmdldEVsZW1lbnQ6IHRhcmdldEVsZW1lbnQsXG4gICAgb3B0aW9uczogb3B0aW9ucyB8fCB7fVxuICB9O1xuXG4gIGxvY2tzID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShsb2NrcyksIFtsb2NrXSk7XG5cbiAgaWYgKGlzSW9zRGV2aWNlKSB7XG4gICAgc2V0UG9zaXRpb25GaXhlZCgpO1xuICB9IGVsc2Uge1xuICAgIHNldE92ZXJmbG93SGlkZGVuKG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKGlzSW9zRGV2aWNlKSB7XG4gICAgdGFyZ2V0RWxlbWVudC5vbnRvdWNoc3RhcnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBkZXRlY3Qgc2luZ2xlIHRvdWNoLlxuICAgICAgICBpbml0aWFsQ2xpZW50WSA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRhcmdldEVsZW1lbnQub250b3VjaG1vdmUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBkZXRlY3Qgc2luZ2xlIHRvdWNoLlxuICAgICAgICBoYW5kbGVTY3JvbGwoZXZlbnQsIHRhcmdldEVsZW1lbnQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIWRvY3VtZW50TGlzdGVuZXJBZGRlZCkge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcHJldmVudERlZmF1bHQsIGhhc1Bhc3NpdmVFdmVudHMgPyB7IHBhc3NpdmU6IGZhbHNlIH0gOiB1bmRlZmluZWQpO1xuICAgICAgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgY2xlYXJBbGxCb2R5U2Nyb2xsTG9ja3MgPSBmdW5jdGlvbiBjbGVhckFsbEJvZHlTY3JvbGxMb2NrcygpIHtcbiAgaWYgKGlzSW9zRGV2aWNlKSB7XG4gICAgLy8gQ2xlYXIgYWxsIGxvY2tzIG9udG91Y2hzdGFydC9vbnRvdWNobW92ZSBoYW5kbGVycywgYW5kIHRoZSByZWZlcmVuY2VzLlxuICAgIGxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxvY2spIHtcbiAgICAgIGxvY2sudGFyZ2V0RWxlbWVudC5vbnRvdWNoc3RhcnQgPSBudWxsO1xuICAgICAgbG9jay50YXJnZXRFbGVtZW50Lm9udG91Y2htb3ZlID0gbnVsbDtcbiAgICB9KTtcblxuICAgIGlmIChkb2N1bWVudExpc3RlbmVyQWRkZWQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBoYXNQYXNzaXZlRXZlbnRzID8geyBwYXNzaXZlOiBmYWxzZSB9IDogdW5kZWZpbmVkKTtcbiAgICAgIGRvY3VtZW50TGlzdGVuZXJBZGRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IGluaXRpYWwgY2xpZW50WS5cbiAgICBpbml0aWFsQ2xpZW50WSA9IC0xO1xuICB9XG5cbiAgaWYgKGlzSW9zRGV2aWNlKSB7XG4gICAgcmVzdG9yZVBvc2l0aW9uU2V0dGluZygpO1xuICB9IGVsc2Uge1xuICAgIHJlc3RvcmVPdmVyZmxvd1NldHRpbmcoKTtcbiAgfVxuXG4gIGxvY2tzID0gW107XG59O1xuXG5leHBvcnQgdmFyIGVuYWJsZUJvZHlTY3JvbGwgPSBmdW5jdGlvbiBlbmFibGVCb2R5U2Nyb2xsKHRhcmdldEVsZW1lbnQpIHtcbiAgaWYgKCF0YXJnZXRFbGVtZW50KSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmVycm9yKCdlbmFibGVCb2R5U2Nyb2xsIHVuc3VjY2Vzc2Z1bCAtIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZCB3aGVuIGNhbGxpbmcgZW5hYmxlQm9keVNjcm9sbCBvbiBJT1MgZGV2aWNlcy4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsb2NrcyA9IGxvY2tzLmZpbHRlcihmdW5jdGlvbiAobG9jaykge1xuICAgIHJldHVybiBsb2NrLnRhcmdldEVsZW1lbnQgIT09IHRhcmdldEVsZW1lbnQ7XG4gIH0pO1xuXG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIHRhcmdldEVsZW1lbnQub250b3VjaHN0YXJ0ID0gbnVsbDtcbiAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2htb3ZlID0gbnVsbDtcblxuICAgIGlmIChkb2N1bWVudExpc3RlbmVyQWRkZWQgJiYgbG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBwcmV2ZW50RGVmYXVsdCwgaGFzUGFzc2l2ZUV2ZW50cyA/IHsgcGFzc2l2ZTogZmFsc2UgfSA6IHVuZGVmaW5lZCk7XG4gICAgICBkb2N1bWVudExpc3RlbmVyQWRkZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoaXNJb3NEZXZpY2UpIHtcbiAgICByZXN0b3JlUG9zaXRpb25TZXR0aW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdG9yZU92ZXJmbG93U2V0dGluZygpO1xuICB9XG59O1xuXG4iLCIvKiFcbiogZm9jdXMtdHJhcCA2LjYuMFxuKiBAbGljZW5zZSBNSVQsIGh0dHBzOi8vZ2l0aHViLmNvbS9mb2N1cy10cmFwL2ZvY3VzLXRyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRVxuKi9cbmltcG9ydCB7IHRhYmJhYmxlLCBpc0ZvY3VzYWJsZSB9IGZyb20gJ3RhYmJhYmxlJztcblxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcblxuICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpO1xuXG4gICAgaWYgKGVudW1lcmFibGVPbmx5KSB7XG4gICAgICBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTtcbiAgfVxuXG4gIHJldHVybiBrZXlzO1xufVxuXG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkMih0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldICE9IG51bGwgPyBhcmd1bWVudHNbaV0gOiB7fTtcblxuICAgIGlmIChpICUgMikge1xuICAgICAgb3duS2V5cyhPYmplY3Qoc291cmNlKSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3duS2V5cyhPYmplY3Qoc291cmNlKSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbnZhciBhY3RpdmVGb2N1c1RyYXBzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdHJhcFF1ZXVlID0gW107XG4gIHJldHVybiB7XG4gICAgYWN0aXZhdGVUcmFwOiBmdW5jdGlvbiBhY3RpdmF0ZVRyYXAodHJhcCkge1xuICAgICAgaWYgKHRyYXBRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBhY3RpdmVUcmFwID0gdHJhcFF1ZXVlW3RyYXBRdWV1ZS5sZW5ndGggLSAxXTtcblxuICAgICAgICBpZiAoYWN0aXZlVHJhcCAhPT0gdHJhcCkge1xuICAgICAgICAgIGFjdGl2ZVRyYXAucGF1c2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgdHJhcEluZGV4ID0gdHJhcFF1ZXVlLmluZGV4T2YodHJhcCk7XG5cbiAgICAgIGlmICh0cmFwSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRyYXBRdWV1ZS5wdXNoKHRyYXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbW92ZSB0aGlzIGV4aXN0aW5nIHRyYXAgdG8gdGhlIGZyb250IG9mIHRoZSBxdWV1ZVxuICAgICAgICB0cmFwUXVldWUuc3BsaWNlKHRyYXBJbmRleCwgMSk7XG4gICAgICAgIHRyYXBRdWV1ZS5wdXNoKHRyYXApO1xuICAgICAgfVxuICAgIH0sXG4gICAgZGVhY3RpdmF0ZVRyYXA6IGZ1bmN0aW9uIGRlYWN0aXZhdGVUcmFwKHRyYXApIHtcbiAgICAgIHZhciB0cmFwSW5kZXggPSB0cmFwUXVldWUuaW5kZXhPZih0cmFwKTtcblxuICAgICAgaWYgKHRyYXBJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdHJhcFF1ZXVlLnNwbGljZSh0cmFwSW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhcFF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHJhcFF1ZXVlW3RyYXBRdWV1ZS5sZW5ndGggLSAxXS51bnBhdXNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufSgpO1xuXG52YXIgaXNTZWxlY3RhYmxlSW5wdXQgPSBmdW5jdGlvbiBpc1NlbGVjdGFibGVJbnB1dChub2RlKSB7XG4gIHJldHVybiBub2RlLnRhZ05hbWUgJiYgbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCcgJiYgdHlwZW9mIG5vZGUuc2VsZWN0ID09PSAnZnVuY3Rpb24nO1xufTtcblxudmFyIGlzRXNjYXBlRXZlbnQgPSBmdW5jdGlvbiBpc0VzY2FwZUV2ZW50KGUpIHtcbiAgcmV0dXJuIGUua2V5ID09PSAnRXNjYXBlJyB8fCBlLmtleSA9PT0gJ0VzYycgfHwgZS5rZXlDb2RlID09PSAyNztcbn07XG5cbnZhciBpc1RhYkV2ZW50ID0gZnVuY3Rpb24gaXNUYWJFdmVudChlKSB7XG4gIHJldHVybiBlLmtleSA9PT0gJ1RhYicgfHwgZS5rZXlDb2RlID09PSA5O1xufTtcblxudmFyIGRlbGF5ID0gZnVuY3Rpb24gZGVsYXkoZm4pIHtcbiAgcmV0dXJuIHNldFRpbWVvdXQoZm4sIDApO1xufTsgLy8gQXJyYXkuZmluZC9maW5kSW5kZXgoKSBhcmUgbm90IHN1cHBvcnRlZCBvbiBJRTsgdGhpcyByZXBsaWNhdGVzIGVub3VnaFxuLy8gIG9mIEFycmF5LmZpbmRJbmRleCgpIGZvciBvdXIgbmVlZHNcblxuXG52YXIgZmluZEluZGV4ID0gZnVuY3Rpb24gZmluZEluZGV4KGFyciwgZm4pIHtcbiAgdmFyIGlkeCA9IC0xO1xuICBhcnIuZXZlcnkoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgaWYgKGZuKHZhbHVlKSkge1xuICAgICAgaWR4ID0gaTtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gYnJlYWtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTsgLy8gbmV4dFxuICB9KTtcbiAgcmV0dXJuIGlkeDtcbn07XG4vKipcbiAqIEdldCBhbiBvcHRpb24ncyB2YWx1ZSB3aGVuIGl0IGNvdWxkIGJlIGEgcGxhaW4gdmFsdWUsIG9yIGEgaGFuZGxlciB0aGF0IHByb3ZpZGVzXG4gKiAgdGhlIHZhbHVlLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBPcHRpb24ncyB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7Li4uKn0gW3BhcmFtc10gQW55IHBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgaGFuZGxlciwgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICogQHJldHVybnMgeyp9IFRoZSBgdmFsdWVgLCBvciB0aGUgaGFuZGxlcidzIHJldHVybmVkIHZhbHVlLlxuICovXG5cblxudmFyIHZhbHVlT3JIYW5kbGVyID0gZnVuY3Rpb24gdmFsdWVPckhhbmRsZXIodmFsdWUpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHBhcmFtcyA9IG5ldyBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgcGFyYW1zW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgPyB2YWx1ZS5hcHBseSh2b2lkIDAsIHBhcmFtcykgOiB2YWx1ZTtcbn07XG5cbnZhciBjcmVhdGVGb2N1c1RyYXAgPSBmdW5jdGlvbiBjcmVhdGVGb2N1c1RyYXAoZWxlbWVudHMsIHVzZXJPcHRpb25zKSB7XG4gIHZhciBkb2MgPSBkb2N1bWVudDtcblxuICB2YXIgY29uZmlnID0gX29iamVjdFNwcmVhZDIoe1xuICAgIHJldHVybkZvY3VzT25EZWFjdGl2YXRlOiB0cnVlLFxuICAgIGVzY2FwZURlYWN0aXZhdGVzOiB0cnVlLFxuICAgIGRlbGF5SW5pdGlhbEZvY3VzOiB0cnVlXG4gIH0sIHVzZXJPcHRpb25zKTtcblxuICB2YXIgc3RhdGUgPSB7XG4gICAgLy8gQHR5cGUge0FycmF5PEhUTUxFbGVtZW50Pn1cbiAgICBjb250YWluZXJzOiBbXSxcbiAgICAvLyBsaXN0IG9mIG9iamVjdHMgaWRlbnRpZnlpbmcgdGhlIGZpcnN0IGFuZCBsYXN0IHRhYmJhYmxlIG5vZGVzIGluIGFsbCBjb250YWluZXJzL2dyb3VwcyBpblxuICAgIC8vICB0aGUgdHJhcFxuICAgIC8vIE5PVEU6IGl0J3MgcG9zc2libGUgdGhhdCBhIGdyb3VwIGhhcyBubyB0YWJiYWJsZSBub2RlcyBpZiBub2RlcyBnZXQgcmVtb3ZlZCB3aGlsZSB0aGUgdHJhcFxuICAgIC8vICBpcyBhY3RpdmUsIGJ1dCB0aGUgdHJhcCBzaG91bGQgbmV2ZXIgZ2V0IHRvIGEgc3RhdGUgd2hlcmUgdGhlcmUgaXNuJ3QgYXQgbGVhc3Qgb25lIGdyb3VwXG4gICAgLy8gIHdpdGggYXQgbGVhc3Qgb25lIHRhYmJhYmxlIG5vZGUgaW4gaXQgKHRoYXQgd291bGQgbGVhZCB0byBhbiBlcnJvciBjb25kaXRpb24gdGhhdCB3b3VsZFxuICAgIC8vICByZXN1bHQgaW4gYW4gZXJyb3IgYmVpbmcgdGhyb3duKVxuICAgIC8vIEB0eXBlIHtBcnJheTx7IGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGZpcnN0VGFiYmFibGVOb2RlOiBIVE1MRWxlbWVudHxudWxsLCBsYXN0VGFiYmFibGVOb2RlOiBIVE1MRWxlbWVudHxudWxsIH0+fVxuICAgIHRhYmJhYmxlR3JvdXBzOiBbXSxcbiAgICBub2RlRm9jdXNlZEJlZm9yZUFjdGl2YXRpb246IG51bGwsXG4gICAgbW9zdFJlY2VudGx5Rm9jdXNlZE5vZGU6IG51bGwsXG4gICAgYWN0aXZlOiBmYWxzZSxcbiAgICBwYXVzZWQ6IGZhbHNlLFxuICAgIC8vIHRpbWVyIElEIGZvciB3aGVuIGRlbGF5SW5pdGlhbEZvY3VzIGlzIHRydWUgYW5kIGluaXRpYWwgZm9jdXMgaW4gdGhpcyB0cmFwXG4gICAgLy8gIGhhcyBiZWVuIGRlbGF5ZWQgZHVyaW5nIGFjdGl2YXRpb25cbiAgICBkZWxheUluaXRpYWxGb2N1c1RpbWVyOiB1bmRlZmluZWRcbiAgfTtcbiAgdmFyIHRyYXA7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcHJlZmVyLWNvbnN0IC0tIHNvbWUgcHJpdmF0ZSBmdW5jdGlvbnMgcmVmZXJlbmNlIGl0LCBhbmQgaXRzIG1ldGhvZHMgcmVmZXJlbmNlIHByaXZhdGUgZnVuY3Rpb25zLCBzbyB3ZSBtdXN0IGRlY2xhcmUgaGVyZSBhbmQgZGVmaW5lIGxhdGVyXG5cbiAgdmFyIGdldE9wdGlvbiA9IGZ1bmN0aW9uIGdldE9wdGlvbihjb25maWdPdmVycmlkZU9wdGlvbnMsIG9wdGlvbk5hbWUsIGNvbmZpZ09wdGlvbk5hbWUpIHtcbiAgICByZXR1cm4gY29uZmlnT3ZlcnJpZGVPcHRpb25zICYmIGNvbmZpZ092ZXJyaWRlT3B0aW9uc1tvcHRpb25OYW1lXSAhPT0gdW5kZWZpbmVkID8gY29uZmlnT3ZlcnJpZGVPcHRpb25zW29wdGlvbk5hbWVdIDogY29uZmlnW2NvbmZpZ09wdGlvbk5hbWUgfHwgb3B0aW9uTmFtZV07XG4gIH07XG5cbiAgdmFyIGNvbnRhaW5lcnNDb250YWluID0gZnVuY3Rpb24gY29udGFpbmVyc0NvbnRhaW4oZWxlbWVudCkge1xuICAgIHJldHVybiBzdGF0ZS5jb250YWluZXJzLnNvbWUoZnVuY3Rpb24gKGNvbnRhaW5lcikge1xuICAgICAgcmV0dXJuIGNvbnRhaW5lci5jb250YWlucyhlbGVtZW50KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgZ2V0Tm9kZUZvck9wdGlvbiA9IGZ1bmN0aW9uIGdldE5vZGVGb3JPcHRpb24ob3B0aW9uTmFtZSkge1xuICAgIHZhciBvcHRpb25WYWx1ZSA9IGNvbmZpZ1tvcHRpb25OYW1lXTtcblxuICAgIGlmICghb3B0aW9uVmFsdWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gb3B0aW9uVmFsdWU7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvblZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgbm9kZSA9IGRvYy5xdWVyeVNlbGVjdG9yKG9wdGlvblZhbHVlKTtcblxuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImBcIi5jb25jYXQob3B0aW9uTmFtZSwgXCJgIHJlZmVycyB0byBubyBrbm93biBub2RlXCIpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvblZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBub2RlID0gb3B0aW9uVmFsdWUoKTtcblxuICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImBcIi5jb25jYXQob3B0aW9uTmFtZSwgXCJgIGRpZCBub3QgcmV0dXJuIGEgbm9kZVwiKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgdmFyIGdldEluaXRpYWxGb2N1c05vZGUgPSBmdW5jdGlvbiBnZXRJbml0aWFsRm9jdXNOb2RlKCkge1xuICAgIHZhciBub2RlOyAvLyBmYWxzZSBpbmRpY2F0ZXMgd2Ugd2FudCBubyBpbml0aWFsRm9jdXMgYXQgYWxsXG5cbiAgICBpZiAoZ2V0T3B0aW9uKHt9LCAnaW5pdGlhbEZvY3VzJykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGdldE5vZGVGb3JPcHRpb24oJ2luaXRpYWxGb2N1cycpICE9PSBudWxsKSB7XG4gICAgICBub2RlID0gZ2V0Tm9kZUZvck9wdGlvbignaW5pdGlhbEZvY3VzJyk7XG4gICAgfSBlbHNlIGlmIChjb250YWluZXJzQ29udGFpbihkb2MuYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgIG5vZGUgPSBkb2MuYWN0aXZlRWxlbWVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZpcnN0VGFiYmFibGVHcm91cCA9IHN0YXRlLnRhYmJhYmxlR3JvdXBzWzBdO1xuICAgICAgdmFyIGZpcnN0VGFiYmFibGVOb2RlID0gZmlyc3RUYWJiYWJsZUdyb3VwICYmIGZpcnN0VGFiYmFibGVHcm91cC5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgIG5vZGUgPSBmaXJzdFRhYmJhYmxlTm9kZSB8fCBnZXROb2RlRm9yT3B0aW9uKCdmYWxsYmFja0ZvY3VzJyk7XG4gICAgfVxuXG4gICAgaWYgKCFub2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdXIgZm9jdXMtdHJhcCBuZWVkcyB0byBoYXZlIGF0IGxlYXN0IG9uZSBmb2N1c2FibGUgZWxlbWVudCcpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIHZhciB1cGRhdGVUYWJiYWJsZU5vZGVzID0gZnVuY3Rpb24gdXBkYXRlVGFiYmFibGVOb2RlcygpIHtcbiAgICBzdGF0ZS50YWJiYWJsZUdyb3VwcyA9IHN0YXRlLmNvbnRhaW5lcnMubWFwKGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgIHZhciB0YWJiYWJsZU5vZGVzID0gdGFiYmFibGUoY29udGFpbmVyKTtcblxuICAgICAgaWYgKHRhYmJhYmxlTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgIGZpcnN0VGFiYmFibGVOb2RlOiB0YWJiYWJsZU5vZGVzWzBdLFxuICAgICAgICAgIGxhc3RUYWJiYWJsZU5vZGU6IHRhYmJhYmxlTm9kZXNbdGFiYmFibGVOb2Rlcy5sZW5ndGggLSAxXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pLmZpbHRlcihmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgIHJldHVybiAhIWdyb3VwO1xuICAgIH0pOyAvLyByZW1vdmUgZ3JvdXBzIHdpdGggbm8gdGFiYmFibGUgbm9kZXNcbiAgICAvLyB0aHJvdyBpZiBubyBncm91cHMgaGF2ZSB0YWJiYWJsZSBub2RlcyBhbmQgd2UgZG9uJ3QgaGF2ZSBhIGZhbGxiYWNrIGZvY3VzIG5vZGUgZWl0aGVyXG5cbiAgICBpZiAoc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoIDw9IDAgJiYgIWdldE5vZGVGb3JPcHRpb24oJ2ZhbGxiYWNrRm9jdXMnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIGZvY3VzLXRyYXAgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBjb250YWluZXIgd2l0aCBhdCBsZWFzdCBvbmUgdGFiYmFibGUgbm9kZSBpbiBpdCBhdCBhbGwgdGltZXMnKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHRyeUZvY3VzID0gZnVuY3Rpb24gdHJ5Rm9jdXMobm9kZSkge1xuICAgIGlmIChub2RlID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChub2RlID09PSBkb2MuYWN0aXZlRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbm9kZSB8fCAhbm9kZS5mb2N1cykge1xuICAgICAgdHJ5Rm9jdXMoZ2V0SW5pdGlhbEZvY3VzTm9kZSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBub2RlLmZvY3VzKHtcbiAgICAgIHByZXZlbnRTY3JvbGw6ICEhY29uZmlnLnByZXZlbnRTY3JvbGxcbiAgICB9KTtcbiAgICBzdGF0ZS5tb3N0UmVjZW50bHlGb2N1c2VkTm9kZSA9IG5vZGU7XG5cbiAgICBpZiAoaXNTZWxlY3RhYmxlSW5wdXQobm9kZSkpIHtcbiAgICAgIG5vZGUuc2VsZWN0KCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBnZXRSZXR1cm5Gb2N1c05vZGUgPSBmdW5jdGlvbiBnZXRSZXR1cm5Gb2N1c05vZGUocHJldmlvdXNBY3RpdmVFbGVtZW50KSB7XG4gICAgdmFyIG5vZGUgPSBnZXROb2RlRm9yT3B0aW9uKCdzZXRSZXR1cm5Gb2N1cycpO1xuICAgIHJldHVybiBub2RlID8gbm9kZSA6IHByZXZpb3VzQWN0aXZlRWxlbWVudDtcbiAgfTsgLy8gVGhpcyBuZWVkcyB0byBiZSBkb25lIG9uIG1vdXNlZG93biBhbmQgdG91Y2hzdGFydCBpbnN0ZWFkIG9mIGNsaWNrXG4gIC8vIHNvIHRoYXQgaXQgcHJlY2VkZXMgdGhlIGZvY3VzIGV2ZW50LlxuXG5cbiAgdmFyIGNoZWNrUG9pbnRlckRvd24gPSBmdW5jdGlvbiBjaGVja1BvaW50ZXJEb3duKGUpIHtcbiAgICBpZiAoY29udGFpbmVyc0NvbnRhaW4oZS50YXJnZXQpKSB7XG4gICAgICAvLyBhbGxvdyB0aGUgY2xpY2sgc2luY2UgaXQgb2N1cnJlZCBpbnNpZGUgdGhlIHRyYXBcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVPckhhbmRsZXIoY29uZmlnLmNsaWNrT3V0c2lkZURlYWN0aXZhdGVzLCBlKSkge1xuICAgICAgLy8gaW1tZWRpYXRlbHkgZGVhY3RpdmF0ZSB0aGUgdHJhcFxuICAgICAgdHJhcC5kZWFjdGl2YXRlKHtcbiAgICAgICAgLy8gaWYsIG9uIGRlYWN0aXZhdGlvbiwgd2Ugc2hvdWxkIHJldHVybiBmb2N1cyB0byB0aGUgbm9kZSBvcmlnaW5hbGx5LWZvY3VzZWRcbiAgICAgICAgLy8gIHdoZW4gdGhlIHRyYXAgd2FzIGFjdGl2YXRlZCAob3IgdGhlIGNvbmZpZ3VyZWQgYHNldFJldHVybkZvY3VzYCBub2RlKSxcbiAgICAgICAgLy8gIHRoZW4gYXNzdW1lIGl0J3MgYWxzbyBPSyB0byByZXR1cm4gZm9jdXMgdG8gdGhlIG91dHNpZGUgbm9kZSB0aGF0IHdhc1xuICAgICAgICAvLyAganVzdCBjbGlja2VkLCBjYXVzaW5nIGRlYWN0aXZhdGlvbiwgYXMgbG9uZyBhcyB0aGF0IG5vZGUgaXMgZm9jdXNhYmxlO1xuICAgICAgICAvLyAgaWYgaXQgaXNuJ3QgZm9jdXNhYmxlLCB0aGVuIHJldHVybiBmb2N1cyB0byB0aGUgb3JpZ2luYWwgbm9kZSBmb2N1c2VkXG4gICAgICAgIC8vICBvbiBhY3RpdmF0aW9uIChvciB0aGUgY29uZmlndXJlZCBgc2V0UmV0dXJuRm9jdXNgIG5vZGUpXG4gICAgICAgIC8vIE5PVEU6IGJ5IHNldHRpbmcgYHJldHVybkZvY3VzOiBmYWxzZWAsIGRlYWN0aXZhdGUoKSB3aWxsIGRvIG5vdGhpbmcsXG4gICAgICAgIC8vICB3aGljaCB3aWxsIHJlc3VsdCBpbiB0aGUgb3V0c2lkZSBjbGljayBzZXR0aW5nIGZvY3VzIHRvIHRoZSBub2RlXG4gICAgICAgIC8vICB0aGF0IHdhcyBjbGlja2VkLCB3aGV0aGVyIGl0J3MgZm9jdXNhYmxlIG9yIG5vdDsgYnkgc2V0dGluZ1xuICAgICAgICAvLyAgYHJldHVybkZvY3VzOiB0cnVlYCwgd2UnbGwgYXR0ZW1wdCB0byByZS1mb2N1cyB0aGUgbm9kZSBvcmlnaW5hbGx5LWZvY3VzZWRcbiAgICAgICAgLy8gIG9uIGFjdGl2YXRpb24gKG9yIHRoZSBjb25maWd1cmVkIGBzZXRSZXR1cm5Gb2N1c2Agbm9kZSlcbiAgICAgICAgcmV0dXJuRm9jdXM6IGNvbmZpZy5yZXR1cm5Gb2N1c09uRGVhY3RpdmF0ZSAmJiAhaXNGb2N1c2FibGUoZS50YXJnZXQpXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIFRoaXMgaXMgbmVlZGVkIGZvciBtb2JpbGUgZGV2aWNlcy5cbiAgICAvLyAoSWYgd2UnbGwgb25seSBsZXQgYGNsaWNrYCBldmVudHMgdGhyb3VnaCxcbiAgICAvLyB0aGVuIG9uIG1vYmlsZSB0aGV5IHdpbGwgYmUgYmxvY2tlZCBhbnl3YXlzIGlmIGB0b3VjaHN0YXJ0YCBpcyBibG9ja2VkLilcblxuXG4gICAgaWYgKHZhbHVlT3JIYW5kbGVyKGNvbmZpZy5hbGxvd091dHNpZGVDbGljaywgZSkpIHtcbiAgICAgIC8vIGFsbG93IHRoZSBjbGljayBvdXRzaWRlIHRoZSB0cmFwIHRvIHRha2UgcGxhY2VcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIG90aGVyd2lzZSwgcHJldmVudCB0aGUgY2xpY2tcblxuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9OyAvLyBJbiBjYXNlIGZvY3VzIGVzY2FwZXMgdGhlIHRyYXAgZm9yIHNvbWUgc3RyYW5nZSByZWFzb24sIHB1bGwgaXQgYmFjayBpbi5cblxuXG4gIHZhciBjaGVja0ZvY3VzSW4gPSBmdW5jdGlvbiBjaGVja0ZvY3VzSW4oZSkge1xuICAgIHZhciB0YXJnZXRDb250YWluZWQgPSBjb250YWluZXJzQ29udGFpbihlLnRhcmdldCk7IC8vIEluIEZpcmVmb3ggd2hlbiB5b3UgVGFiIG91dCBvZiBhbiBpZnJhbWUgdGhlIERvY3VtZW50IGlzIGJyaWVmbHkgZm9jdXNlZC5cblxuICAgIGlmICh0YXJnZXRDb250YWluZWQgfHwgZS50YXJnZXQgaW5zdGFuY2VvZiBEb2N1bWVudCkge1xuICAgICAgaWYgKHRhcmdldENvbnRhaW5lZCkge1xuICAgICAgICBzdGF0ZS5tb3N0UmVjZW50bHlGb2N1c2VkTm9kZSA9IGUudGFyZ2V0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlc2NhcGVkISBwdWxsIGl0IGJhY2sgaW4gdG8gd2hlcmUgaXQganVzdCBsZWZ0XG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgdHJ5Rm9jdXMoc3RhdGUubW9zdFJlY2VudGx5Rm9jdXNlZE5vZGUgfHwgZ2V0SW5pdGlhbEZvY3VzTm9kZSgpKTtcbiAgICB9XG4gIH07IC8vIEhpamFjayBUYWIgZXZlbnRzIG9uIHRoZSBmaXJzdCBhbmQgbGFzdCBmb2N1c2FibGUgbm9kZXMgb2YgdGhlIHRyYXAsXG4gIC8vIGluIG9yZGVyIHRvIHByZXZlbnQgZm9jdXMgZnJvbSBlc2NhcGluZy4gSWYgaXQgZXNjYXBlcyBmb3IgZXZlbiBhXG4gIC8vIG1vbWVudCBpdCBjYW4gZW5kIHVwIHNjcm9sbGluZyB0aGUgcGFnZSBhbmQgY2F1c2luZyBjb25mdXNpb24gc28gd2VcbiAgLy8ga2luZCBvZiBuZWVkIHRvIGNhcHR1cmUgdGhlIGFjdGlvbiBhdCB0aGUga2V5ZG93biBwaGFzZS5cblxuXG4gIHZhciBjaGVja1RhYiA9IGZ1bmN0aW9uIGNoZWNrVGFiKGUpIHtcbiAgICB1cGRhdGVUYWJiYWJsZU5vZGVzKCk7XG4gICAgdmFyIGRlc3RpbmF0aW9uTm9kZSA9IG51bGw7XG5cbiAgICBpZiAoc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gbWFrZSBzdXJlIHRoZSB0YXJnZXQgaXMgYWN0dWFsbHkgY29udGFpbmVkIGluIGEgZ3JvdXBcbiAgICAgIC8vIE5PVEU6IHRoZSB0YXJnZXQgbWF5IGFsc28gYmUgdGhlIGNvbnRhaW5lciBpdHNlbGYgaWYgaXQncyB0YWJiYWJsZVxuICAgICAgLy8gIHdpdGggdGFiSW5kZXg9Jy0xJyBhbmQgd2FzIGdpdmVuIGluaXRpYWwgZm9jdXNcbiAgICAgIHZhciBjb250YWluZXJJbmRleCA9IGZpbmRJbmRleChzdGF0ZS50YWJiYWJsZUdyb3VwcywgZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IF9yZWYuY29udGFpbmVyO1xuICAgICAgICByZXR1cm4gY29udGFpbmVyLmNvbnRhaW5zKGUudGFyZ2V0KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY29udGFpbmVySW5kZXggPCAwKSB7XG4gICAgICAgIC8vIHRhcmdldCBub3QgZm91bmQgaW4gYW55IGdyb3VwOiBxdWl0ZSBwb3NzaWJsZSBmb2N1cyBoYXMgZXNjYXBlZCB0aGUgdHJhcCxcbiAgICAgICAgLy8gIHNvIGJyaW5nIGl0IGJhY2sgaW4gdG8uLi5cbiAgICAgICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAvLyAuLi50aGUgbGFzdCBub2RlIGluIHRoZSBsYXN0IGdyb3VwXG4gICAgICAgICAgZGVzdGluYXRpb25Ob2RlID0gc3RhdGUudGFiYmFibGVHcm91cHNbc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoIC0gMV0ubGFzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAuLi50aGUgZmlyc3Qgbm9kZSBpbiB0aGUgZmlyc3QgZ3JvdXBcbiAgICAgICAgICBkZXN0aW5hdGlvbk5vZGUgPSBzdGF0ZS50YWJiYWJsZUdyb3Vwc1swXS5maXJzdFRhYmJhYmxlTm9kZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLnNoaWZ0S2V5KSB7XG4gICAgICAgIC8vIFJFVkVSU0VcbiAgICAgICAgLy8gaXMgdGhlIHRhcmdldCB0aGUgZmlyc3QgdGFiYmFibGUgbm9kZSBpbiBhIGdyb3VwP1xuICAgICAgICB2YXIgc3RhcnRPZkdyb3VwSW5kZXggPSBmaW5kSW5kZXgoc3RhdGUudGFiYmFibGVHcm91cHMsIGZ1bmN0aW9uIChfcmVmMikge1xuICAgICAgICAgIHZhciBmaXJzdFRhYmJhYmxlTm9kZSA9IF9yZWYyLmZpcnN0VGFiYmFibGVOb2RlO1xuICAgICAgICAgIHJldHVybiBlLnRhcmdldCA9PT0gZmlyc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzdGFydE9mR3JvdXBJbmRleCA8IDAgJiYgc3RhdGUudGFiYmFibGVHcm91cHNbY29udGFpbmVySW5kZXhdLmNvbnRhaW5lciA9PT0gZS50YXJnZXQpIHtcbiAgICAgICAgICAvLyBhbiBleGNlcHRpb24gY2FzZSB3aGVyZSB0aGUgdGFyZ2V0IGlzIHRoZSBjb250YWluZXIgaXRzZWxmLCBpbiB3aGljaFxuICAgICAgICAgIC8vICBjYXNlLCB3ZSBzaG91bGQgaGFuZGxlIHNoaWZ0K3RhYiBhcyBpZiBmb2N1cyB3ZXJlIG9uIHRoZSBjb250YWluZXInc1xuICAgICAgICAgIC8vICBmaXJzdCB0YWJiYWJsZSBub2RlLCBhbmQgZ28gdG8gdGhlIGxhc3QgdGFiYmFibGUgbm9kZSBvZiB0aGUgTEFTVCBncm91cFxuICAgICAgICAgIHN0YXJ0T2ZHcm91cEluZGV4ID0gY29udGFpbmVySW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RhcnRPZkdyb3VwSW5kZXggPj0gMCkge1xuICAgICAgICAgIC8vIFlFUzogdGhlbiBzaGlmdCt0YWIgc2hvdWxkIGdvIHRvIHRoZSBsYXN0IHRhYmJhYmxlIG5vZGUgaW4gdGhlXG4gICAgICAgICAgLy8gIHByZXZpb3VzIGdyb3VwIChhbmQgd3JhcCBhcm91bmQgdG8gdGhlIGxhc3QgdGFiYmFibGUgbm9kZSBvZlxuICAgICAgICAgIC8vICB0aGUgTEFTVCBncm91cCBpZiBpdCdzIHRoZSBmaXJzdCB0YWJiYWJsZSBub2RlIG9mIHRoZSBGSVJTVCBncm91cClcbiAgICAgICAgICB2YXIgZGVzdGluYXRpb25Hcm91cEluZGV4ID0gc3RhcnRPZkdyb3VwSW5kZXggPT09IDAgPyBzdGF0ZS50YWJiYWJsZUdyb3Vwcy5sZW5ndGggLSAxIDogc3RhcnRPZkdyb3VwSW5kZXggLSAxO1xuICAgICAgICAgIHZhciBkZXN0aW5hdGlvbkdyb3VwID0gc3RhdGUudGFiYmFibGVHcm91cHNbZGVzdGluYXRpb25Hcm91cEluZGV4XTtcbiAgICAgICAgICBkZXN0aW5hdGlvbk5vZGUgPSBkZXN0aW5hdGlvbkdyb3VwLmxhc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZPUldBUkRcbiAgICAgICAgLy8gaXMgdGhlIHRhcmdldCB0aGUgbGFzdCB0YWJiYWJsZSBub2RlIGluIGEgZ3JvdXA/XG4gICAgICAgIHZhciBsYXN0T2ZHcm91cEluZGV4ID0gZmluZEluZGV4KHN0YXRlLnRhYmJhYmxlR3JvdXBzLCBmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICAgICAgICB2YXIgbGFzdFRhYmJhYmxlTm9kZSA9IF9yZWYzLmxhc3RUYWJiYWJsZU5vZGU7XG4gICAgICAgICAgcmV0dXJuIGUudGFyZ2V0ID09PSBsYXN0VGFiYmFibGVOb2RlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAobGFzdE9mR3JvdXBJbmRleCA8IDAgJiYgc3RhdGUudGFiYmFibGVHcm91cHNbY29udGFpbmVySW5kZXhdLmNvbnRhaW5lciA9PT0gZS50YXJnZXQpIHtcbiAgICAgICAgICAvLyBhbiBleGNlcHRpb24gY2FzZSB3aGVyZSB0aGUgdGFyZ2V0IGlzIHRoZSBjb250YWluZXIgaXRzZWxmLCBpbiB3aGljaFxuICAgICAgICAgIC8vICBjYXNlLCB3ZSBzaG91bGQgaGFuZGxlIHRhYiBhcyBpZiBmb2N1cyB3ZXJlIG9uIHRoZSBjb250YWluZXInc1xuICAgICAgICAgIC8vICBsYXN0IHRhYmJhYmxlIG5vZGUsIGFuZCBnbyB0byB0aGUgZmlyc3QgdGFiYmFibGUgbm9kZSBvZiB0aGUgRklSU1QgZ3JvdXBcbiAgICAgICAgICBsYXN0T2ZHcm91cEluZGV4ID0gY29udGFpbmVySW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGFzdE9mR3JvdXBJbmRleCA+PSAwKSB7XG4gICAgICAgICAgLy8gWUVTOiB0aGVuIHRhYiBzaG91bGQgZ28gdG8gdGhlIGZpcnN0IHRhYmJhYmxlIG5vZGUgaW4gdGhlIG5leHRcbiAgICAgICAgICAvLyAgZ3JvdXAgKGFuZCB3cmFwIGFyb3VuZCB0byB0aGUgZmlyc3QgdGFiYmFibGUgbm9kZSBvZiB0aGUgRklSU1RcbiAgICAgICAgICAvLyAgZ3JvdXAgaWYgaXQncyB0aGUgbGFzdCB0YWJiYWJsZSBub2RlIG9mIHRoZSBMQVNUIGdyb3VwKVxuICAgICAgICAgIHZhciBfZGVzdGluYXRpb25Hcm91cEluZGV4ID0gbGFzdE9mR3JvdXBJbmRleCA9PT0gc3RhdGUudGFiYmFibGVHcm91cHMubGVuZ3RoIC0gMSA/IDAgOiBsYXN0T2ZHcm91cEluZGV4ICsgMTtcblxuICAgICAgICAgIHZhciBfZGVzdGluYXRpb25Hcm91cCA9IHN0YXRlLnRhYmJhYmxlR3JvdXBzW19kZXN0aW5hdGlvbkdyb3VwSW5kZXhdO1xuICAgICAgICAgIGRlc3RpbmF0aW9uTm9kZSA9IF9kZXN0aW5hdGlvbkdyb3VwLmZpcnN0VGFiYmFibGVOb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlc3RpbmF0aW9uTm9kZSA9IGdldE5vZGVGb3JPcHRpb24oJ2ZhbGxiYWNrRm9jdXMnKTtcbiAgICB9XG5cbiAgICBpZiAoZGVzdGluYXRpb25Ob2RlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB0cnlGb2N1cyhkZXN0aW5hdGlvbk5vZGUpO1xuICAgIH0gLy8gZWxzZSwgbGV0IHRoZSBicm93c2VyIHRha2UgY2FyZSBvZiBbc2hpZnQrXXRhYiBhbmQgbW92ZSB0aGUgZm9jdXNcblxuICB9O1xuXG4gIHZhciBjaGVja0tleSA9IGZ1bmN0aW9uIGNoZWNrS2V5KGUpIHtcbiAgICBpZiAoaXNFc2NhcGVFdmVudChlKSAmJiB2YWx1ZU9ySGFuZGxlcihjb25maWcuZXNjYXBlRGVhY3RpdmF0ZXMpICE9PSBmYWxzZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdHJhcC5kZWFjdGl2YXRlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGlzVGFiRXZlbnQoZSkpIHtcbiAgICAgIGNoZWNrVGFiKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICB2YXIgY2hlY2tDbGljayA9IGZ1bmN0aW9uIGNoZWNrQ2xpY2soZSkge1xuICAgIGlmICh2YWx1ZU9ySGFuZGxlcihjb25maWcuY2xpY2tPdXRzaWRlRGVhY3RpdmF0ZXMsIGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbnRhaW5lcnNDb250YWluKGUudGFyZ2V0KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZU9ySGFuZGxlcihjb25maWcuYWxsb3dPdXRzaWRlQ2xpY2ssIGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gIH07IC8vXG4gIC8vIEVWRU5UIExJU1RFTkVSU1xuICAvL1xuXG5cbiAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVycygpIHtcbiAgICBpZiAoIXN0YXRlLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gVGhlcmUgY2FuIGJlIG9ubHkgb25lIGxpc3RlbmluZyBmb2N1cyB0cmFwIGF0IGEgdGltZVxuXG5cbiAgICBhY3RpdmVGb2N1c1RyYXBzLmFjdGl2YXRlVHJhcCh0cmFwKTsgLy8gRGVsYXkgZW5zdXJlcyB0aGF0IHRoZSBmb2N1c2VkIGVsZW1lbnQgZG9lc24ndCBjYXB0dXJlIHRoZSBldmVudFxuICAgIC8vIHRoYXQgY2F1c2VkIHRoZSBmb2N1cyB0cmFwIGFjdGl2YXRpb24uXG5cbiAgICBzdGF0ZS5kZWxheUluaXRpYWxGb2N1c1RpbWVyID0gY29uZmlnLmRlbGF5SW5pdGlhbEZvY3VzID8gZGVsYXkoZnVuY3Rpb24gKCkge1xuICAgICAgdHJ5Rm9jdXMoZ2V0SW5pdGlhbEZvY3VzTm9kZSgpKTtcbiAgICB9KSA6IHRyeUZvY3VzKGdldEluaXRpYWxGb2N1c05vZGUoKSk7XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBjaGVja0ZvY3VzSW4sIHRydWUpO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBjaGVja1BvaW50ZXJEb3duLCB7XG4gICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgcGFzc2l2ZTogZmFsc2VcbiAgICB9KTtcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGNoZWNrUG9pbnRlckRvd24sIHtcbiAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICBwYXNzaXZlOiBmYWxzZVxuICAgIH0pO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNoZWNrQ2xpY2ssIHtcbiAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICBwYXNzaXZlOiBmYWxzZVxuICAgIH0pO1xuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2hlY2tLZXksIHtcbiAgICAgIGNhcHR1cmU6IHRydWUsXG4gICAgICBwYXNzaXZlOiBmYWxzZVxuICAgIH0pO1xuICAgIHJldHVybiB0cmFwO1xuICB9O1xuXG4gIHZhciByZW1vdmVMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFzdGF0ZS5hY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIGNoZWNrRm9jdXNJbiwgdHJ1ZSk7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGNoZWNrUG9pbnRlckRvd24sIHRydWUpO1xuICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgY2hlY2tQb2ludGVyRG93biwgdHJ1ZSk7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2hlY2tDbGljaywgdHJ1ZSk7XG4gICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjaGVja0tleSwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRyYXA7XG4gIH07IC8vXG4gIC8vIFRSQVAgREVGSU5JVElPTlxuICAvL1xuXG5cbiAgdHJhcCA9IHtcbiAgICBhY3RpdmF0ZTogZnVuY3Rpb24gYWN0aXZhdGUoYWN0aXZhdGVPcHRpb25zKSB7XG4gICAgICBpZiAoc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgb25BY3RpdmF0ZSA9IGdldE9wdGlvbihhY3RpdmF0ZU9wdGlvbnMsICdvbkFjdGl2YXRlJyk7XG4gICAgICB2YXIgb25Qb3N0QWN0aXZhdGUgPSBnZXRPcHRpb24oYWN0aXZhdGVPcHRpb25zLCAnb25Qb3N0QWN0aXZhdGUnKTtcbiAgICAgIHZhciBjaGVja0NhbkZvY3VzVHJhcCA9IGdldE9wdGlvbihhY3RpdmF0ZU9wdGlvbnMsICdjaGVja0NhbkZvY3VzVHJhcCcpO1xuXG4gICAgICBpZiAoIWNoZWNrQ2FuRm9jdXNUcmFwKSB7XG4gICAgICAgIHVwZGF0ZVRhYmJhYmxlTm9kZXMoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgIHN0YXRlLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgc3RhdGUubm9kZUZvY3VzZWRCZWZvcmVBY3RpdmF0aW9uID0gZG9jLmFjdGl2ZUVsZW1lbnQ7XG5cbiAgICAgIGlmIChvbkFjdGl2YXRlKSB7XG4gICAgICAgIG9uQWN0aXZhdGUoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpbmlzaEFjdGl2YXRpb24gPSBmdW5jdGlvbiBmaW5pc2hBY3RpdmF0aW9uKCkge1xuICAgICAgICBpZiAoY2hlY2tDYW5Gb2N1c1RyYXApIHtcbiAgICAgICAgICB1cGRhdGVUYWJiYWJsZU5vZGVzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcnMoKTtcblxuICAgICAgICBpZiAob25Qb3N0QWN0aXZhdGUpIHtcbiAgICAgICAgICBvblBvc3RBY3RpdmF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAoY2hlY2tDYW5Gb2N1c1RyYXApIHtcbiAgICAgICAgY2hlY2tDYW5Gb2N1c1RyYXAoc3RhdGUuY29udGFpbmVycy5jb25jYXQoKSkudGhlbihmaW5pc2hBY3RpdmF0aW9uLCBmaW5pc2hBY3RpdmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGZpbmlzaEFjdGl2YXRpb24oKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24gZGVhY3RpdmF0ZShkZWFjdGl2YXRlT3B0aW9ucykge1xuICAgICAgaWYgKCFzdGF0ZS5hY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyVGltZW91dChzdGF0ZS5kZWxheUluaXRpYWxGb2N1c1RpbWVyKTsgLy8gbm9vcCBpZiB1bmRlZmluZWRcblxuICAgICAgc3RhdGUuZGVsYXlJbml0aWFsRm9jdXNUaW1lciA9IHVuZGVmaW5lZDtcbiAgICAgIHJlbW92ZUxpc3RlbmVycygpO1xuICAgICAgc3RhdGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICBzdGF0ZS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIGFjdGl2ZUZvY3VzVHJhcHMuZGVhY3RpdmF0ZVRyYXAodHJhcCk7XG4gICAgICB2YXIgb25EZWFjdGl2YXRlID0gZ2V0T3B0aW9uKGRlYWN0aXZhdGVPcHRpb25zLCAnb25EZWFjdGl2YXRlJyk7XG4gICAgICB2YXIgb25Qb3N0RGVhY3RpdmF0ZSA9IGdldE9wdGlvbihkZWFjdGl2YXRlT3B0aW9ucywgJ29uUG9zdERlYWN0aXZhdGUnKTtcbiAgICAgIHZhciBjaGVja0NhblJldHVybkZvY3VzID0gZ2V0T3B0aW9uKGRlYWN0aXZhdGVPcHRpb25zLCAnY2hlY2tDYW5SZXR1cm5Gb2N1cycpO1xuXG4gICAgICBpZiAob25EZWFjdGl2YXRlKSB7XG4gICAgICAgIG9uRGVhY3RpdmF0ZSgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmV0dXJuRm9jdXMgPSBnZXRPcHRpb24oZGVhY3RpdmF0ZU9wdGlvbnMsICdyZXR1cm5Gb2N1cycsICdyZXR1cm5Gb2N1c09uRGVhY3RpdmF0ZScpO1xuXG4gICAgICB2YXIgZmluaXNoRGVhY3RpdmF0aW9uID0gZnVuY3Rpb24gZmluaXNoRGVhY3RpdmF0aW9uKCkge1xuICAgICAgICBkZWxheShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHJldHVybkZvY3VzKSB7XG4gICAgICAgICAgICB0cnlGb2N1cyhnZXRSZXR1cm5Gb2N1c05vZGUoc3RhdGUubm9kZUZvY3VzZWRCZWZvcmVBY3RpdmF0aW9uKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9uUG9zdERlYWN0aXZhdGUpIHtcbiAgICAgICAgICAgIG9uUG9zdERlYWN0aXZhdGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgaWYgKHJldHVybkZvY3VzICYmIGNoZWNrQ2FuUmV0dXJuRm9jdXMpIHtcbiAgICAgICAgY2hlY2tDYW5SZXR1cm5Gb2N1cyhnZXRSZXR1cm5Gb2N1c05vZGUoc3RhdGUubm9kZUZvY3VzZWRCZWZvcmVBY3RpdmF0aW9uKSkudGhlbihmaW5pc2hEZWFjdGl2YXRpb24sIGZpbmlzaERlYWN0aXZhdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBmaW5pc2hEZWFjdGl2YXRpb24oKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgcGF1c2U6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgaWYgKHN0YXRlLnBhdXNlZCB8fCAhc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZS5wYXVzZWQgPSB0cnVlO1xuICAgICAgcmVtb3ZlTGlzdGVuZXJzKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHVucGF1c2U6IGZ1bmN0aW9uIHVucGF1c2UoKSB7XG4gICAgICBpZiAoIXN0YXRlLnBhdXNlZCB8fCAhc3RhdGUuYWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBzdGF0ZS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgIHVwZGF0ZVRhYmJhYmxlTm9kZXMoKTtcbiAgICAgIGFkZExpc3RlbmVycygpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICB1cGRhdGVDb250YWluZXJFbGVtZW50czogZnVuY3Rpb24gdXBkYXRlQ29udGFpbmVyRWxlbWVudHMoY29udGFpbmVyRWxlbWVudHMpIHtcbiAgICAgIHZhciBlbGVtZW50c0FzQXJyYXkgPSBbXS5jb25jYXQoY29udGFpbmVyRWxlbWVudHMpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIHN0YXRlLmNvbnRhaW5lcnMgPSBlbGVtZW50c0FzQXJyYXkubWFwKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgPyBkb2MucXVlcnlTZWxlY3RvcihlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHN0YXRlLmFjdGl2ZSkge1xuICAgICAgICB1cGRhdGVUYWJiYWJsZU5vZGVzKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTsgLy8gaW5pdGlhbGl6ZSBjb250YWluZXIgZWxlbWVudHNcblxuICB0cmFwLnVwZGF0ZUNvbnRhaW5lckVsZW1lbnRzKGVsZW1lbnRzKTtcbiAgcmV0dXJuIHRyYXA7XG59O1xuXG5leHBvcnQgeyBjcmVhdGVGb2N1c1RyYXAgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvY3VzLXRyYXAuZXNtLmpzLm1hcFxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qIVxuKiB0YWJiYWJsZSA1LjIuMFxuKiBAbGljZW5zZSBNSVQsIGh0dHBzOi8vZ2l0aHViLmNvbS9mb2N1cy10cmFwL3RhYmJhYmxlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiovXG52YXIgY2FuZGlkYXRlU2VsZWN0b3JzID0gWydpbnB1dCcsICdzZWxlY3QnLCAndGV4dGFyZWEnLCAnYVtocmVmXScsICdidXR0b24nLCAnW3RhYmluZGV4XScsICdhdWRpb1tjb250cm9sc10nLCAndmlkZW9bY29udHJvbHNdJywgJ1tjb250ZW50ZWRpdGFibGVdOm5vdChbY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIl0pJywgJ2RldGFpbHM+c3VtbWFyeTpmaXJzdC1vZi10eXBlJywgJ2RldGFpbHMnXTtcbnZhciBjYW5kaWRhdGVTZWxlY3RvciA9IC8qICNfX1BVUkVfXyAqL2NhbmRpZGF0ZVNlbGVjdG9ycy5qb2luKCcsJyk7XG52YXIgbWF0Y2hlcyA9IHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyA/IGZ1bmN0aW9uICgpIHt9IDogRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyB8fCBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG5cbnZhciBnZXRDYW5kaWRhdGVzID0gZnVuY3Rpb24gZ2V0Q2FuZGlkYXRlcyhlbCwgaW5jbHVkZUNvbnRhaW5lciwgZmlsdGVyKSB7XG4gIHZhciBjYW5kaWRhdGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGVsLnF1ZXJ5U2VsZWN0b3JBbGwoY2FuZGlkYXRlU2VsZWN0b3IpKTtcblxuICBpZiAoaW5jbHVkZUNvbnRhaW5lciAmJiBtYXRjaGVzLmNhbGwoZWwsIGNhbmRpZGF0ZVNlbGVjdG9yKSkge1xuICAgIGNhbmRpZGF0ZXMudW5zaGlmdChlbCk7XG4gIH1cblxuICBjYW5kaWRhdGVzID0gY2FuZGlkYXRlcy5maWx0ZXIoZmlsdGVyKTtcbiAgcmV0dXJuIGNhbmRpZGF0ZXM7XG59O1xuXG52YXIgaXNDb250ZW50RWRpdGFibGUgPSBmdW5jdGlvbiBpc0NvbnRlbnRFZGl0YWJsZShub2RlKSB7XG4gIHJldHVybiBub2RlLmNvbnRlbnRFZGl0YWJsZSA9PT0gJ3RydWUnO1xufTtcblxudmFyIGdldFRhYmluZGV4ID0gZnVuY3Rpb24gZ2V0VGFiaW5kZXgobm9kZSkge1xuICB2YXIgdGFiaW5kZXhBdHRyID0gcGFyc2VJbnQobm9kZS5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JyksIDEwKTtcblxuICBpZiAoIWlzTmFOKHRhYmluZGV4QXR0cikpIHtcbiAgICByZXR1cm4gdGFiaW5kZXhBdHRyO1xuICB9IC8vIEJyb3dzZXJzIGRvIG5vdCByZXR1cm4gYHRhYkluZGV4YCBjb3JyZWN0bHkgZm9yIGNvbnRlbnRFZGl0YWJsZSBub2RlcztcbiAgLy8gc28gaWYgdGhleSBkb24ndCBoYXZlIGEgdGFiaW5kZXggYXR0cmlidXRlIHNwZWNpZmljYWxseSBzZXQsIGFzc3VtZSBpdCdzIDAuXG5cblxuICBpZiAoaXNDb250ZW50RWRpdGFibGUobm9kZSkpIHtcbiAgICByZXR1cm4gMDtcbiAgfSAvLyBpbiBDaHJvbWUsIDxkZXRhaWxzLz4sIDxhdWRpbyBjb250cm9scy8+IGFuZCA8dmlkZW8gY29udHJvbHMvPiBlbGVtZW50cyBnZXQgYSBkZWZhdWx0XG4gIC8vICBgdGFiSW5kZXhgIG9mIC0xIHdoZW4gdGhlICd0YWJpbmRleCcgYXR0cmlidXRlIGlzbid0IHNwZWNpZmllZCBpbiB0aGUgRE9NLFxuICAvLyAgeWV0IHRoZXkgYXJlIHN0aWxsIHBhcnQgb2YgdGhlIHJlZ3VsYXIgdGFiIG9yZGVyOyBpbiBGRiwgdGhleSBnZXQgYSBkZWZhdWx0XG4gIC8vICBgdGFiSW5kZXhgIG9mIDA7IHNpbmNlIENocm9tZSBzdGlsbCBwdXRzIHRob3NlIGVsZW1lbnRzIGluIHRoZSByZWd1bGFyIHRhYlxuICAvLyAgb3JkZXIsIGNvbnNpZGVyIHRoZWlyIHRhYiBpbmRleCB0byBiZSAwLlxuXG5cbiAgaWYgKChub2RlLm5vZGVOYW1lID09PSAnQVVESU8nIHx8IG5vZGUubm9kZU5hbWUgPT09ICdWSURFTycgfHwgbm9kZS5ub2RlTmFtZSA9PT0gJ0RFVEFJTFMnKSAmJiBub2RlLmdldEF0dHJpYnV0ZSgndGFiaW5kZXgnKSA9PT0gbnVsbCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgcmV0dXJuIG5vZGUudGFiSW5kZXg7XG59O1xuXG52YXIgc29ydE9yZGVyZWRUYWJiYWJsZXMgPSBmdW5jdGlvbiBzb3J0T3JkZXJlZFRhYmJhYmxlcyhhLCBiKSB7XG4gIHJldHVybiBhLnRhYkluZGV4ID09PSBiLnRhYkluZGV4ID8gYS5kb2N1bWVudE9yZGVyIC0gYi5kb2N1bWVudE9yZGVyIDogYS50YWJJbmRleCAtIGIudGFiSW5kZXg7XG59O1xuXG52YXIgaXNJbnB1dCA9IGZ1bmN0aW9uIGlzSW5wdXQobm9kZSkge1xuICByZXR1cm4gbm9kZS50YWdOYW1lID09PSAnSU5QVVQnO1xufTtcblxudmFyIGlzSGlkZGVuSW5wdXQgPSBmdW5jdGlvbiBpc0hpZGRlbklucHV0KG5vZGUpIHtcbiAgcmV0dXJuIGlzSW5wdXQobm9kZSkgJiYgbm9kZS50eXBlID09PSAnaGlkZGVuJztcbn07XG5cbnZhciBpc0RldGFpbHNXaXRoU3VtbWFyeSA9IGZ1bmN0aW9uIGlzRGV0YWlsc1dpdGhTdW1tYXJ5KG5vZGUpIHtcbiAgdmFyIHIgPSBub2RlLnRhZ05hbWUgPT09ICdERVRBSUxTJyAmJiBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkobm9kZS5jaGlsZHJlbikuc29tZShmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXR1cm4gY2hpbGQudGFnTmFtZSA9PT0gJ1NVTU1BUlknO1xuICB9KTtcbiAgcmV0dXJuIHI7XG59O1xuXG52YXIgZ2V0Q2hlY2tlZFJhZGlvID0gZnVuY3Rpb24gZ2V0Q2hlY2tlZFJhZGlvKG5vZGVzLCBmb3JtKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobm9kZXNbaV0uY2hlY2tlZCAmJiBub2Rlc1tpXS5mb3JtID09PSBmb3JtKSB7XG4gICAgICByZXR1cm4gbm9kZXNbaV07XG4gICAgfVxuICB9XG59O1xuXG52YXIgaXNUYWJiYWJsZVJhZGlvID0gZnVuY3Rpb24gaXNUYWJiYWJsZVJhZGlvKG5vZGUpIHtcbiAgaWYgKCFub2RlLm5hbWUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciByYWRpb1Njb3BlID0gbm9kZS5mb3JtIHx8IG5vZGUub3duZXJEb2N1bWVudDtcblxuICB2YXIgcXVlcnlSYWRpb3MgPSBmdW5jdGlvbiBxdWVyeVJhZGlvcyhuYW1lKSB7XG4gICAgcmV0dXJuIHJhZGlvU2NvcGUucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cInJhZGlvXCJdW25hbWU9XCInICsgbmFtZSArICdcIl0nKTtcbiAgfTtcblxuICB2YXIgcmFkaW9TZXQ7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuQ1NTICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LkNTUy5lc2NhcGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByYWRpb1NldCA9IHF1ZXJ5UmFkaW9zKHdpbmRvdy5DU1MuZXNjYXBlKG5vZGUubmFtZSkpO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICByYWRpb1NldCA9IHF1ZXJ5UmFkaW9zKG5vZGUubmFtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS5lcnJvcignTG9va3MgbGlrZSB5b3UgaGF2ZSBhIHJhZGlvIGJ1dHRvbiB3aXRoIGEgbmFtZSBhdHRyaWJ1dGUgY29udGFpbmluZyBpbnZhbGlkIENTUyBzZWxlY3RvciBjaGFyYWN0ZXJzIGFuZCBuZWVkIHRoZSBDU1MuZXNjYXBlIHBvbHlmaWxsOiAlcycsIGVyci5tZXNzYWdlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB2YXIgY2hlY2tlZCA9IGdldENoZWNrZWRSYWRpbyhyYWRpb1NldCwgbm9kZS5mb3JtKTtcbiAgcmV0dXJuICFjaGVja2VkIHx8IGNoZWNrZWQgPT09IG5vZGU7XG59O1xuXG52YXIgaXNSYWRpbyA9IGZ1bmN0aW9uIGlzUmFkaW8obm9kZSkge1xuICByZXR1cm4gaXNJbnB1dChub2RlKSAmJiBub2RlLnR5cGUgPT09ICdyYWRpbyc7XG59O1xuXG52YXIgaXNOb25UYWJiYWJsZVJhZGlvID0gZnVuY3Rpb24gaXNOb25UYWJiYWJsZVJhZGlvKG5vZGUpIHtcbiAgcmV0dXJuIGlzUmFkaW8obm9kZSkgJiYgIWlzVGFiYmFibGVSYWRpbyhub2RlKTtcbn07XG5cbnZhciBpc0hpZGRlbiA9IGZ1bmN0aW9uIGlzSGlkZGVuKG5vZGUsIGRpc3BsYXlDaGVjaykge1xuICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGlzRGlyZWN0U3VtbWFyeSA9IG1hdGNoZXMuY2FsbChub2RlLCAnZGV0YWlscz5zdW1tYXJ5OmZpcnN0LW9mLXR5cGUnKTtcbiAgdmFyIG5vZGVVbmRlckRldGFpbHMgPSBpc0RpcmVjdFN1bW1hcnkgPyBub2RlLnBhcmVudEVsZW1lbnQgOiBub2RlO1xuXG4gIGlmIChtYXRjaGVzLmNhbGwobm9kZVVuZGVyRGV0YWlscywgJ2RldGFpbHM6bm90KFtvcGVuXSkgKicpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoIWRpc3BsYXlDaGVjayB8fCBkaXNwbGF5Q2hlY2sgPT09ICdmdWxsJykge1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS5kaXNwbGF5ID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRpc3BsYXlDaGVjayA9PT0gJ25vbi16ZXJvLWFyZWEnKSB7XG4gICAgdmFyIF9ub2RlJGdldEJvdW5kaW5nQ2xpZSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgIHdpZHRoID0gX25vZGUkZ2V0Qm91bmRpbmdDbGllLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSBfbm9kZSRnZXRCb3VuZGluZ0NsaWUuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIHdpZHRoID09PSAwICYmIGhlaWdodCA9PT0gMDtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBpc05vZGVNYXRjaGluZ1NlbGVjdG9yRm9jdXNhYmxlID0gZnVuY3Rpb24gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZShvcHRpb25zLCBub2RlKSB7XG4gIGlmIChub2RlLmRpc2FibGVkIHx8IGlzSGlkZGVuSW5wdXQobm9kZSkgfHwgaXNIaWRkZW4obm9kZSwgb3B0aW9ucy5kaXNwbGF5Q2hlY2spIHx8XG4gIC8qIEZvciBhIGRldGFpbHMgZWxlbWVudCB3aXRoIGEgc3VtbWFyeSwgdGhlIHN1bW1hcnkgZWxlbWVudCBnZXRzIHRoZSBmb2N1c2VkICAqL1xuICBpc0RldGFpbHNXaXRoU3VtbWFyeShub2RlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxudmFyIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZSA9IGZ1bmN0aW9uIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZShvcHRpb25zLCBub2RlKSB7XG4gIGlmICghaXNOb2RlTWF0Y2hpbmdTZWxlY3RvckZvY3VzYWJsZShvcHRpb25zLCBub2RlKSB8fCBpc05vblRhYmJhYmxlUmFkaW8obm9kZSkgfHwgZ2V0VGFiaW5kZXgobm9kZSkgPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG52YXIgdGFiYmFibGUgPSBmdW5jdGlvbiB0YWJiYWJsZShlbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHJlZ3VsYXJUYWJiYWJsZXMgPSBbXTtcbiAgdmFyIG9yZGVyZWRUYWJiYWJsZXMgPSBbXTtcbiAgdmFyIGNhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzKGVsLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JUYWJiYWJsZS5iaW5kKG51bGwsIG9wdGlvbnMpKTtcbiAgY2FuZGlkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChjYW5kaWRhdGUsIGkpIHtcbiAgICB2YXIgY2FuZGlkYXRlVGFiaW5kZXggPSBnZXRUYWJpbmRleChjYW5kaWRhdGUpO1xuXG4gICAgaWYgKGNhbmRpZGF0ZVRhYmluZGV4ID09PSAwKSB7XG4gICAgICByZWd1bGFyVGFiYmFibGVzLnB1c2goY2FuZGlkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3JkZXJlZFRhYmJhYmxlcy5wdXNoKHtcbiAgICAgICAgZG9jdW1lbnRPcmRlcjogaSxcbiAgICAgICAgdGFiSW5kZXg6IGNhbmRpZGF0ZVRhYmluZGV4LFxuICAgICAgICBub2RlOiBjYW5kaWRhdGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHZhciB0YWJiYWJsZU5vZGVzID0gb3JkZXJlZFRhYmJhYmxlcy5zb3J0KHNvcnRPcmRlcmVkVGFiYmFibGVzKS5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gYS5ub2RlO1xuICB9KS5jb25jYXQocmVndWxhclRhYmJhYmxlcyk7XG4gIHJldHVybiB0YWJiYWJsZU5vZGVzO1xufTtcblxudmFyIGZvY3VzYWJsZSA9IGZ1bmN0aW9uIGZvY3VzYWJsZShlbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIGNhbmRpZGF0ZXMgPSBnZXRDYW5kaWRhdGVzKGVsLCBvcHRpb25zLmluY2x1ZGVDb250YWluZXIsIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUuYmluZChudWxsLCBvcHRpb25zKSk7XG4gIHJldHVybiBjYW5kaWRhdGVzO1xufTtcblxudmFyIGlzVGFiYmFibGUgPSBmdW5jdGlvbiBpc1RhYmJhYmxlKG5vZGUsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgaWYgKCFub2RlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBub2RlIHByb3ZpZGVkJyk7XG4gIH1cblxuICBpZiAobWF0Y2hlcy5jYWxsKG5vZGUsIGNhbmRpZGF0ZVNlbGVjdG9yKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gaXNOb2RlTWF0Y2hpbmdTZWxlY3RvclRhYmJhYmxlKG9wdGlvbnMsIG5vZGUpO1xufTtcblxudmFyIGZvY3VzYWJsZUNhbmRpZGF0ZVNlbGVjdG9yID0gLyogI19fUFVSRV9fICovY2FuZGlkYXRlU2VsZWN0b3JzLmNvbmNhdCgnaWZyYW1lJykuam9pbignLCcpO1xuXG52YXIgaXNGb2N1c2FibGUgPSBmdW5jdGlvbiBpc0ZvY3VzYWJsZShub2RlLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmICghbm9kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gbm9kZSBwcm92aWRlZCcpO1xuICB9XG5cbiAgaWYgKG1hdGNoZXMuY2FsbChub2RlLCBmb2N1c2FibGVDYW5kaWRhdGVTZWxlY3RvcikgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGlzTm9kZU1hdGNoaW5nU2VsZWN0b3JGb2N1c2FibGUob3B0aW9ucywgbm9kZSk7XG59O1xuXG5leHBvcnQgeyBmb2N1c2FibGUsIGlzRm9jdXNhYmxlLCBpc1RhYmJhYmxlLCB0YWJiYWJsZSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguZXNtLmpzLm1hcFxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCIvLyBUaGUgY2h1bmsgbG9hZGluZyBmdW5jdGlvbiBmb3IgYWRkaXRpb25hbCBjaHVua3Ncbi8vIFNpbmNlIGFsbCByZWZlcmVuY2VkIGNodW5rcyBhcmUgYWxyZWFkeSBpbmNsdWRlZFxuLy8gaW4gdGhpcyBmaWxlLCB0aGlzIGZ1bmN0aW9uIGlzIGVtcHR5IGhlcmUuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmUgPSAoKSA9PiAoUHJvbWlzZS5yZXNvbHZlKCkpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCIvcHVibGljL21haW5cIjogMCxcblx0XCJwdWJsaWMvbWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZHNbaV1dID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rYTE3X3Rvb2xraXRcIl0gPSBzZWxmW1wid2VicGFja0NodW5rYTE3X3Rvb2xraXRcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJwdWJsaWMvbWFpblwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3Jlc291cmNlcy9mcm9udGVuZC9qcy9tYWluLmpzXCIpKSlcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1wicHVibGljL21haW5cIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9yZXNvdXJjZXMvZnJvbnRlbmQvY3NzL21haW4uY3NzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOlsiZGVmYXVsdCIsIkFjY29yZGlvbiIsIk1vZGFsIiwiVmlkZW9CYWNrZ3JvdW5kIiwibWFuYWdlQmVoYXZpb3JzIiwiQmVoYXZpb3JzIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiYnJlYWtwb2ludHMiLCJjcmVhdGVCZWhhdmlvciIsInRvZ2dsZSIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImluZGV4IiwiY3VycmVudFRhcmdldCIsImdldEF0dHJpYnV0ZSIsIl9kYXRhIiwiYWN0aXZlSW5kZXhlcyIsImluY2x1ZGVzIiwiY2xvc2UiLCJmaWx0ZXIiLCJpdGVtIiwib3BlbiIsInB1c2giLCJhY3RpdmVUcmlnZ2VyIiwiJHRyaWdnZXJzIiwiYWN0aXZlSWNvbiIsIiR0cmlnZ2VySWNvbnMiLCJhY3RpdmVDb250ZW50IiwiJGNvbnRlbnRzIiwic3R5bGUiLCJoZWlnaHQiLCJzZXRBdHRyaWJ1dGUiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJhY3RpdmVDb250ZW50SW5uZXIiLCIkY29udGVudElubmVycyIsImNvbnRlbnRIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJhZGQiLCJpbml0IiwiJGluaXRPcGVuIiwiZ2V0Q2hpbGRyZW4iLCJmb3JFYWNoIiwidHJpZ2dlciIsImNsaWNrIiwiZW5hYmxlZCIsInJlc2l6ZWQiLCJtZWRpYVF1ZXJ5VXBkYXRlZCIsImRpc2FibGVkIiwiZGVzdHJveSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkaXNhYmxlQm9keVNjcm9sbCIsImVuYWJsZUJvZHlTY3JvbGwiLCJmb2N1c1RyYXAiLCJpc0FjdGl2ZSIsIiRub2RlIiwiYWN0aXZlQ2xhc3NlcyIsImRlYWN0aXZhdGUiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJzZXRUaW1lb3V0IiwiYWN0aXZhdGUiLCJoYW5kbGVFc2MiLCJrZXkiLCJoYW5kbGVDbGlja091dHNpZGUiLCJ0YXJnZXQiLCJpZCIsImFkZExpc3RlbmVyIiwiYXJyIiwiZnVuYyIsImFyckxlbmd0aCIsImxlbmd0aCIsImkiLCJyZW1vdmVMaXN0ZW5lciIsIiRmb2N1c1RyYXAiLCJnZXRDaGlsZCIsIiRjbG9zZUJ1dHRvbnMiLCIkaW5pdGlhbEZvY3VzIiwiY29uc29sZSIsIndhcm4iLCJjcmVhdGVGb2N1c1RyYXAiLCJpbml0aWFsRm9jdXMiLCJtb2RhbElkIiwicXVlcnlTZWxlY3RvckFsbCIsIm9wdGlvbnMiLCJpc1BsYXlpbmciLCIkcGxheWVyIiwicGF1c2UiLCJwbGF5IiwidXBkYXRlQnV0dG9uIiwiaGFuZGxlUGxheSIsImhhbmRsZVBhdXNlIiwiYnV0dG9uVGV4dCIsIiRwYXVzZUJ1dHRvbiIsImlubmVyVGV4dCIsInRvU3RyaW5nIiwicXVlcnlTZWxlY3RvciJdLCJzb3VyY2VSb290IjoiIn0=