
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback, value) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            if (value === undefined) {
                callback(component.$$.ctx[index]);
            }
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.54.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const validEvents = [
        'Activate',
        'AddUndo',
        'BeforeAddUndo',
        'BeforeExecCommand',
        'BeforeGetContent',
        'BeforeRenderUI',
        'BeforeSetContent',
        'BeforePaste',
        'Blur',
        'Change',
        'ClearUndos',
        'Click',
        'ContextMenu',
        'Copy',
        'Cut',
        'Dblclick',
        'Deactivate',
        'Dirty',
        'Drag',
        'DragDrop',
        'DragEnd',
        'DragGesture',
        'DragOver',
        'Drop',
        'ExecCommand',
        'Focus',
        'FocusIn',
        'FocusOut',
        'GetContent',
        'Hide',
        'Init',
        'KeyDown',
        'KeyPress',
        'KeyUp',
        'LoadContent',
        'MouseDown',
        'MouseEnter',
        'MouseLeave',
        'MouseMove',
        'MouseOut',
        'MouseOver',
        'MouseUp',
        'NodeChange',
        'ObjectResizeStart',
        'ObjectResized',
        'ObjectSelected',
        'Paste',
        'PostProcess',
        'PostRender',
        'PreProcess',
        'ProgressState',
        'Redo',
        'Remove',
        'Reset',
        'ResizeEditor',
        'SaveContent',
        'SelectionChange',
        'SetAttrib',
        'SetContent',
        'Show',
        'Submit',
        'Undo',
        'VisualAid'
    ];
    const bindHandlers = (editor, dispatch) => {
        validEvents.forEach((eventName) => {
            editor.on(eventName, (e) => {
                dispatch(eventName.toLowerCase(), {
                    eventName,
                    event: e,
                    editor
                });
            });
        });
    };

    /* node_modules/@tinymce/tinymce-svelte/dist/component/Editor.svelte generated by Svelte v3.54.0 */

    const { Object: Object_1$1 } = globals;
    const file$l = "node_modules/@tinymce/tinymce-svelte/dist/component/Editor.svelte";

    // (129:2) {:else}
    function create_else_block$2(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "id", /*id*/ ctx[0]);
    			set_style(textarea, "visibility", "hidden");
    			add_location(textarea, file$l, 129, 4, 4108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			/*textarea_binding*/ ctx[18](textarea);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1) {
    				attr_dev(textarea, "id", /*id*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[18](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(129:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (127:2) {#if inline}
    function create_if_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", /*id*/ ctx[0]);
    			add_location(div, file$l, 127, 4, 4054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1) {
    				attr_dev(div, "id", /*id*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(127:2) {#if inline}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*inline*/ ctx[1]) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", /*cssClass*/ ctx[2]);
    			add_location(div, file$l, 125, 2, 3990);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			/*div_binding_1*/ ctx[19](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*cssClass*/ 4) {
    				attr_dev(div, "class", /*cssClass*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			/*div_binding_1*/ ctx[19](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const uuid = prefix => {
    	return prefix + '_' + Math.floor(Math.random() * 1000000000) + String(Date.now());
    };

    const createScriptLoader = () => {
    	let state = {
    		listeners: [],
    		scriptId: uuid('tiny-script'),
    		scriptLoaded: false,
    		injected: false
    	};

    	const injectScript = (scriptId, doc, url, cb) => {
    		state.injected = true;
    		const script = doc.createElement('script');
    		script.referrerPolicy = 'origin';
    		script.type = 'application/javascript';
    		script.src = url;

    		script.onload = () => {
    			cb();
    		};

    		if (doc.head) doc.head.appendChild(script);
    	};

    	const load = (doc, url, callback) => {
    		if (state.scriptLoaded) {
    			callback();
    		} else {
    			state.listeners.push(callback);

    			// check we can access doc
    			if (!state.injected) {
    				injectScript(state.scriptId, doc, url, () => {
    					state.listeners.forEach(fn => fn());
    					state.scriptLoaded = true;
    				});
    			}
    		}
    	};

    	return { load };
    };

    let scriptLoader = createScriptLoader();

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Editor', slots, []);
    	var _a;
    	let { id = uuid('tinymce-svelte') } = $$props;
    	let { inline = undefined } = $$props;
    	let { disabled = false } = $$props;
    	let { apiKey = 'no-api-key' } = $$props;
    	let { channel = '6' } = $$props;
    	let { scriptSrc = undefined } = $$props;
    	let { conf = {} } = $$props;
    	let { modelEvents = 'change input undo redo' } = $$props;
    	let { value = '' } = $$props;
    	let { text = '' } = $$props;
    	let { cssClass = 'tinymce-wrapper' } = $$props;
    	let container;
    	let element;
    	let editorRef;
    	let lastVal = '';
    	let disablindCache = disabled;
    	const dispatch = createEventDispatcher();

    	const getTinymce = () => {
    		const getSink = () => {
    			return typeof window !== 'undefined' ? window : global;
    		};

    		const sink = getSink();
    		return sink && sink.tinymce ? sink.tinymce : null;
    	};

    	const init = () => {
    		//
    		const finalInit = Object.assign(Object.assign({}, conf), {
    			target: element,
    			inline: inline !== undefined
    			? inline
    			: conf.inline !== undefined ? conf.inline : false,
    			readonly: disabled,
    			setup: editor => {
    				$$invalidate(14, editorRef = editor);

    				editor.on('init', () => {
    					editor.setContent(value);

    					// bind model events
    					editor.on(modelEvents, () => {
    						$$invalidate(15, lastVal = editor.getContent());

    						if (lastVal !== value) {
    							$$invalidate(5, value = lastVal);
    							$$invalidate(6, text = editor.getContent({ format: 'text' }));
    						}
    					});
    				});

    				bindHandlers(editor, dispatch);

    				if (typeof conf.setup === 'function') {
    					conf.setup(editor);
    				}
    			}
    		});

    		$$invalidate(4, element.style.visibility = '', element);
    		getTinymce().init(finalInit);
    	};

    	onMount(() => {
    		if (getTinymce() !== null) {
    			init();
    		} else {
    			const script = scriptSrc
    			? scriptSrc
    			: `https://cdn.tiny.cloud/1/${apiKey}/tinymce/${channel}/tinymce.min.js`;

    			scriptLoader.load(container.ownerDocument, script, () => {
    				init();
    			});
    		}
    	});

    	onDestroy(() => {
    		var _a;

    		if (editorRef) {
    			(_a = getTinymce()) === null || _a === void 0
    			? void 0
    			: _a.remove(editorRef);
    		}
    	});

    	const writable_props = [
    		'id',
    		'inline',
    		'disabled',
    		'apiKey',
    		'channel',
    		'scriptSrc',
    		'conf',
    		'modelEvents',
    		'value',
    		'text',
    		'cssClass'
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Editor> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('inline' in $$props) $$invalidate(1, inline = $$props.inline);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ('apiKey' in $$props) $$invalidate(8, apiKey = $$props.apiKey);
    		if ('channel' in $$props) $$invalidate(9, channel = $$props.channel);
    		if ('scriptSrc' in $$props) $$invalidate(10, scriptSrc = $$props.scriptSrc);
    		if ('conf' in $$props) $$invalidate(11, conf = $$props.conf);
    		if ('modelEvents' in $$props) $$invalidate(12, modelEvents = $$props.modelEvents);
    		if ('value' in $$props) $$invalidate(5, value = $$props.value);
    		if ('text' in $$props) $$invalidate(6, text = $$props.text);
    		if ('cssClass' in $$props) $$invalidate(2, cssClass = $$props.cssClass);
    	};

    	$$self.$capture_state = () => ({
    		uuid,
    		createScriptLoader,
    		scriptLoader,
    		_a,
    		onMount,
    		createEventDispatcher,
    		onDestroy,
    		bindHandlers,
    		id,
    		inline,
    		disabled,
    		apiKey,
    		channel,
    		scriptSrc,
    		conf,
    		modelEvents,
    		value,
    		text,
    		cssClass,
    		container,
    		element,
    		editorRef,
    		lastVal,
    		disablindCache,
    		dispatch,
    		getTinymce,
    		init
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) $$invalidate(13, _a = $$props._a);
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('inline' in $$props) $$invalidate(1, inline = $$props.inline);
    		if ('disabled' in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ('apiKey' in $$props) $$invalidate(8, apiKey = $$props.apiKey);
    		if ('channel' in $$props) $$invalidate(9, channel = $$props.channel);
    		if ('scriptSrc' in $$props) $$invalidate(10, scriptSrc = $$props.scriptSrc);
    		if ('conf' in $$props) $$invalidate(11, conf = $$props.conf);
    		if ('modelEvents' in $$props) $$invalidate(12, modelEvents = $$props.modelEvents);
    		if ('value' in $$props) $$invalidate(5, value = $$props.value);
    		if ('text' in $$props) $$invalidate(6, text = $$props.text);
    		if ('cssClass' in $$props) $$invalidate(2, cssClass = $$props.cssClass);
    		if ('container' in $$props) $$invalidate(3, container = $$props.container);
    		if ('element' in $$props) $$invalidate(4, element = $$props.element);
    		if ('editorRef' in $$props) $$invalidate(14, editorRef = $$props.editorRef);
    		if ('lastVal' in $$props) $$invalidate(15, lastVal = $$props.lastVal);
    		if ('disablindCache' in $$props) $$invalidate(16, disablindCache = $$props.disablindCache);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*editorRef, lastVal, value, disabled, disablindCache, _a*/ 123040) {
    			{
    				if (editorRef && lastVal !== value) {
    					editorRef.setContent(value);
    					$$invalidate(6, text = editorRef.getContent({ format: 'text' }));
    				}

    				if (editorRef && disabled !== disablindCache) {
    					$$invalidate(16, disablindCache = disabled);

    					if (typeof ($$invalidate(13, _a = editorRef.mode) === null || _a === void 0
    					? void 0
    					: _a.set) === 'function') {
    						editorRef.mode.set(disabled ? 'readonly' : 'design');
    					} else {
    						editorRef.setMode(disabled ? 'readonly' : 'design');
    					}
    				}
    			}
    		}
    	};

    	return [
    		id,
    		inline,
    		cssClass,
    		container,
    		element,
    		value,
    		text,
    		disabled,
    		apiKey,
    		channel,
    		scriptSrc,
    		conf,
    		modelEvents,
    		_a,
    		editorRef,
    		lastVal,
    		disablindCache,
    		div_binding,
    		textarea_binding,
    		div_binding_1
    	];
    }

    class Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			id: 0,
    			inline: 1,
    			disabled: 7,
    			apiKey: 8,
    			channel: 9,
    			scriptSrc: 10,
    			conf: 11,
    			modelEvents: 12,
    			value: 5,
    			text: 6,
    			cssClass: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Editor",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get id() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inline() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inline(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get apiKey() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiKey(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get channel() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set channel(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scriptSrc() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scriptSrc(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get conf() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set conf(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modelEvents() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modelEvents(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cssClass() {
    		throw new Error("<Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cssClass(value) {
    		throw new Error("<Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function imageSetup(editor) {
        const fileInput = document.createElement("input");
        fileInput.style.display = "none";
        fileInput.accept = "image/*";
        fileInput.type = "file";
        document.body.appendChild(fileInput);
        fileInput.addEventListener("change", (e) => {
            const target = e.target;
            if (!target || !target.files)
                return;
            const __file = target.files[0];
            const extMatch = __file.name.match(/(\.png|\.jpg|\.jpeg|\.JPG|\.JPEG|\.PNG)$/);
            if (!extMatch) {
                alert("지원되지 않는 포맷입니다. png,jpg,jpeg만 가능합니다.");
                return;
            }
            const url = URL.createObjectURL(__file);
            alert("이때, 이미지를 서버로 전송합니다.");
            editor.insertContent(`<figure><img class="user-import" src="${url}"/></figure>`);
            fileInput.value = "";
        });
        const isImageElement = (node) => {
            return node.nodeName.toLowerCase() === 'img';
        };
        const getImage = () => {
            var node = editor.selection.getNode();
            return isImageElement(node) ? node : null;
        };
        editor.ui.registry.addButton("image", {
            icon: "image",
            onAction: function (_) {
                fileInput.click();
            },
        });
        editor.ui.registry.addContextForm('link-form', {
            launch: {
                type: 'contextformbutton',
                text: 'link',
            },
            position: "node",
            predicate: isImageElement,
            initValue: () => {
                const image = getImage();
                return image.width;
            },
            commands: [
                {
                    type: 'contextformbutton',
                    tooltip: 'Link',
                    text: "확인",
                    primary: true,
                    onSetup: (api) => {
                        console.log(api);
                    },
                    onAction: (formApi) => {
                        const newWidth = Number(formApi.getValue());
                        console.log(editor.ui.registry.getAll().buttons.forecolor.onAction);
                        console.log(editor.ui.registry.getAll().buttons.forecolor.onItemAction);
                        console.log(editor.ui.registry.getAll().buttons.forecolor.select);
                        console.log(editor.ui.registry.getAll().buttons.forecolor);
                        if (isNaN(newWidth) || newWidth <= 0)
                            return;
                        const image = getImage();
                        const newHeight = (image.height / image.width) * newWidth;
                        const width = `${Math.ceil(newWidth)}px`;
                        const height = `${Math.ceil(newHeight)}px`;
                        editor.dom.setAttribs(image, { width, height });
                        editor.selection.collapse();
                        formApi.hide();
                    }
                },
            ]
        });
        // editor.on("click", (e: Event) => {
        //     const target = e.target as HTMLElement;
        //     if (target.classList.contains("user-import")) {
        //     }
        // });
    }

    /* src/mce/Link/LinkComposite.svelte generated by Svelte v3.54.0 */

    const file$k = "src/mce/Link/LinkComposite.svelte";

    function create_fragment$m(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			attr_dev(span, "class", "link-title svelte-1ln0l56");
    			add_location(span, file$k, 13, 2, 170);
    			attr_dev(input, "class", "link-input svelte-1ln0l56");
    			attr_dev(input, "type", "text");
    			add_location(input, file$k, 16, 2, 220);
    			attr_dev(div, "class", "link-box svelte-1ln0l56");
    			add_location(div, file$k, 12, 0, 145);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LinkComposite', slots, []);
    	let { title = "" } = $$props;
    	let { value = "" } = $$props;
    	const writable_props = ['title', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LinkComposite> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ title, value });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, title, input_input_handler];
    }

    class LinkComposite extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { title: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LinkComposite",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get title() {
    		throw new Error("<LinkComposite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<LinkComposite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<LinkComposite>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<LinkComposite>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/mce/Link/LinkTabSelector.svelte generated by Svelte v3.54.0 */

    const file$j = "src/mce/Link/LinkTabSelector.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (17:2) {#each targets as target}
    function create_each_block$2(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*target*/ ctx[4].displayValue + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", /*target*/ ctx[4].target);
    			input.__value = /*target*/ ctx[4].target;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-pgg4n3");
    			/*$$binding_groups*/ ctx[3][0].push(input);
    			add_location(input, file$j, 18, 6, 372);
    			attr_dev(label, "class", "svelte-pgg4n3");
    			toggle_class(label, "active", /*selectedTarget*/ ctx[0] === /*target*/ ctx[4].target);
    			add_location(label, file$j, 17, 4, 310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*selectedTarget*/ ctx[0];
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedTarget*/ 1) {
    				input.checked = input.__value === /*selectedTarget*/ ctx[0];
    			}

    			if (dirty & /*selectedTarget, targets*/ 3) {
    				toggle_class(label, "active", /*selectedTarget*/ ctx[0] === /*target*/ ctx[4].target);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[3][0].splice(/*$$binding_groups*/ ctx[3][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:2) {#each targets as target}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div;
    	let each_value = /*targets*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "input-target svelte-pgg4n3");
    			add_location(div, file$j, 15, 0, 251);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedTarget, targets*/ 3) {
    				each_value = /*targets*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LinkTabSelector', slots, []);
    	let { selectedTarget = "_blank" } = $$props;

    	//Constants
    	const targets = [
    		{ target: "_blank", displayValue: "새탭" },
    		{ target: "_self", displayValue: "현재 탭" }
    	];

    	const writable_props = ['selectedTarget'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LinkTabSelector> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		selectedTarget = this.__value;
    		$$invalidate(0, selectedTarget);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedTarget' in $$props) $$invalidate(0, selectedTarget = $$props.selectedTarget);
    	};

    	$$self.$capture_state = () => ({ selectedTarget, targets });

    	$$self.$inject_state = $$props => {
    		if ('selectedTarget' in $$props) $$invalidate(0, selectedTarget = $$props.selectedTarget);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedTarget, targets, input_change_handler, $$binding_groups];
    }

    class LinkTabSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { selectedTarget: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LinkTabSelector",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get selectedTarget() {
    		throw new Error("<LinkTabSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTarget(value) {
    		throw new Error("<LinkTabSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/mce/Link/LinkButtons.svelte generated by Svelte v3.54.0 */
    const file$i = "src/mce/Link/LinkButtons.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "취소";
    			t1 = space();
    			button1 = element("button");
    			t2 = text("확인");
    			attr_dev(button0, "class", "cancel svelte-a7ql0n");
    			add_location(button0, file$i, 20, 2, 339);
    			attr_dev(button1, "class", "save svelte-a7ql0n");
    			button1.disabled = /*saveButtonDisable*/ ctx[0];
    			add_location(button1, file$i, 21, 2, 396);
    			attr_dev(div, "class", "buttons svelte-a7ql0n");
    			add_location(div, file$i, 19, 0, 315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*cancel*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*save*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*saveButtonDisable*/ 1) {
    				prop_dev(button1, "disabled", /*saveButtonDisable*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LinkButtons', slots, []);
    	let { saveButtonDisable = false } = $$props;

    	//Constants
    	const dispatch = createEventDispatcher();

    	//Variables
    	//Functions
    	function cancel() {
    		dispatch("CANCEL");
    	}

    	function save() {
    		dispatch("SAVE");
    	}

    	const writable_props = ['saveButtonDisable'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LinkButtons> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('saveButtonDisable' in $$props) $$invalidate(0, saveButtonDisable = $$props.saveButtonDisable);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		saveButtonDisable,
    		dispatch,
    		cancel,
    		save
    	});

    	$$self.$inject_state = $$props => {
    		if ('saveButtonDisable' in $$props) $$invalidate(0, saveButtonDisable = $$props.saveButtonDisable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [saveButtonDisable, cancel, save];
    }

    class LinkButtons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { saveButtonDisable: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LinkButtons",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get saveButtonDisable() {
    		throw new Error("<LinkButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set saveButtonDisable(value) {
    		throw new Error("<LinkButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/mce/Link/Link.svelte generated by Svelte v3.54.0 */
    const file$h = "src/mce/Link/Link.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let linkcomposite0;
    	let updating_value;
    	let t0;
    	let linkcomposite1;
    	let updating_value_1;
    	let t1;
    	let linktabselector;
    	let updating_selectedTarget;
    	let t2;
    	let linkbuttons;
    	let current;

    	function linkcomposite0_value_binding(value) {
    		/*linkcomposite0_value_binding*/ ctx[7](value);
    	}

    	let linkcomposite0_props = { title: "URL" };

    	if (/*__url*/ ctx[1] !== void 0) {
    		linkcomposite0_props.value = /*__url*/ ctx[1];
    	}

    	linkcomposite0 = new LinkComposite({
    			props: linkcomposite0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(linkcomposite0, 'value', linkcomposite0_value_binding, /*__url*/ ctx[1]));

    	function linkcomposite1_value_binding(value) {
    		/*linkcomposite1_value_binding*/ ctx[8](value);
    	}

    	let linkcomposite1_props = { title: "텍스트" };

    	if (/*__displayValue*/ ctx[0] !== void 0) {
    		linkcomposite1_props.value = /*__displayValue*/ ctx[0];
    	}

    	linkcomposite1 = new LinkComposite({
    			props: linkcomposite1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(linkcomposite1, 'value', linkcomposite1_value_binding, /*__displayValue*/ ctx[0]));

    	function linktabselector_selectedTarget_binding(value) {
    		/*linktabselector_selectedTarget_binding*/ ctx[9](value);
    	}

    	let linktabselector_props = {};

    	if (/*target*/ ctx[2] !== void 0) {
    		linktabselector_props.selectedTarget = /*target*/ ctx[2];
    	}

    	linktabselector = new LinkTabSelector({
    			props: linktabselector_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(linktabselector, 'selectedTarget', linktabselector_selectedTarget_binding, /*target*/ ctx[2]));

    	linkbuttons = new LinkButtons({
    			props: {
    				saveButtonDisable: /*__url*/ ctx[1] === ""
    			},
    			$$inline: true
    		});

    	linkbuttons.$on("CANCEL", /*cancel*/ ctx[3]);
    	linkbuttons.$on("SAVE", /*save*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(linkcomposite0.$$.fragment);
    			t0 = space();
    			create_component(linkcomposite1.$$.fragment);
    			t1 = space();
    			create_component(linktabselector.$$.fragment);
    			t2 = space();
    			create_component(linkbuttons.$$.fragment);
    			attr_dev(div, "class", "link-container svelte-1g5hi9v");
    			add_location(div, file$h, 30, 0, 650);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(linkcomposite0, div, null);
    			append_dev(div, t0);
    			mount_component(linkcomposite1, div, null);
    			append_dev(div, t1);
    			mount_component(linktabselector, div, null);
    			append_dev(div, t2);
    			mount_component(linkbuttons, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const linkcomposite0_changes = {};

    			if (!updating_value && dirty & /*__url*/ 2) {
    				updating_value = true;
    				linkcomposite0_changes.value = /*__url*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			linkcomposite0.$set(linkcomposite0_changes);
    			const linkcomposite1_changes = {};

    			if (!updating_value_1 && dirty & /*__displayValue*/ 1) {
    				updating_value_1 = true;
    				linkcomposite1_changes.value = /*__displayValue*/ ctx[0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			linkcomposite1.$set(linkcomposite1_changes);
    			const linktabselector_changes = {};

    			if (!updating_selectedTarget && dirty & /*target*/ 4) {
    				updating_selectedTarget = true;
    				linktabselector_changes.selectedTarget = /*target*/ ctx[2];
    				add_flush_callback(() => updating_selectedTarget = false);
    			}

    			linktabselector.$set(linktabselector_changes);
    			const linkbuttons_changes = {};
    			if (dirty & /*__url*/ 2) linkbuttons_changes.saveButtonDisable = /*__url*/ ctx[1] === "";
    			linkbuttons.$set(linkbuttons_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linkcomposite0.$$.fragment, local);
    			transition_in(linkcomposite1.$$.fragment, local);
    			transition_in(linktabselector.$$.fragment, local);
    			transition_in(linkbuttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linkcomposite0.$$.fragment, local);
    			transition_out(linkcomposite1.$$.fragment, local);
    			transition_out(linktabselector.$$.fragment, local);
    			transition_out(linkbuttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(linkcomposite0);
    			destroy_component(linkcomposite1);
    			destroy_component(linktabselector);
    			destroy_component(linkbuttons);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, []);
    	let { displayValue = "" } = $$props;
    	let { url = "" } = $$props;

    	//Constants
    	const dispatch = createEventDispatcher();

    	//Variables
    	let __displayValue = displayValue;

    	let __url = url;
    	let target = "_blank";

    	//Functions
    	function cancel() {
    		dispatch("CANCEL");
    	}

    	function save() {
    		dispatch("SAVE", {
    			displayValue: __displayValue || "링크",
    			url: __url,
    			target
    		});
    	}

    	const writable_props = ['displayValue', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	function linkcomposite0_value_binding(value) {
    		__url = value;
    		$$invalidate(1, __url);
    	}

    	function linkcomposite1_value_binding(value) {
    		__displayValue = value;
    		$$invalidate(0, __displayValue);
    	}

    	function linktabselector_selectedTarget_binding(value) {
    		target = value;
    		$$invalidate(2, target);
    	}

    	$$self.$$set = $$props => {
    		if ('displayValue' in $$props) $$invalidate(5, displayValue = $$props.displayValue);
    		if ('url' in $$props) $$invalidate(6, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		LinkComposite,
    		createEventDispatcher,
    		LinkTabSelector,
    		LinkButtons,
    		displayValue,
    		url,
    		dispatch,
    		__displayValue,
    		__url,
    		target,
    		cancel,
    		save
    	});

    	$$self.$inject_state = $$props => {
    		if ('displayValue' in $$props) $$invalidate(5, displayValue = $$props.displayValue);
    		if ('url' in $$props) $$invalidate(6, url = $$props.url);
    		if ('__displayValue' in $$props) $$invalidate(0, __displayValue = $$props.__displayValue);
    		if ('__url' in $$props) $$invalidate(1, __url = $$props.__url);
    		if ('target' in $$props) $$invalidate(2, target = $$props.target);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		__displayValue,
    		__url,
    		target,
    		cancel,
    		save,
    		displayValue,
    		url,
    		linkcomposite0_value_binding,
    		linkcomposite1_value_binding,
    		linktabselector_selectedTarget_binding
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { displayValue: 5, url: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get displayValue() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayValue(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function linkSetup(editor) {
        let open = false;
        editor.ui.registry.addToggleButton("__link__", {
            icon: "link",
            onAction: function (buttonApi) {
                if (open)
                    return;
                const isActive = buttonApi.isActive();
                const area = getEditorArea$1();
                let text = editor.selection.getContent();
                let url = "";
                if (isActive) {
                    const node = editor.selection.getNode();
                    text = node.textContent;
                    url = node.href;
                    editor.selection.select(node);
                }
                editor.getBody().setAttribute('contenteditable', false);
                const linkComponent = new Link({
                    target: area,
                    props: { displayValue: text, url }
                });
                open = true;
                linkComponent.$on("CANCEL", () => {
                    open = false;
                    editor.getBody().setAttribute('contenteditable', true);
                    linkComponent.$destroy();
                });
                linkComponent.$on("SAVE", (e) => {
                    const a = `<a href="${e.detail.url}" target="${e.detail.target}">${e.detail.displayValue}</a>`;
                    editor.getBody().setAttribute('contenteditable', true);
                    editor.selection.setContent(a);
                    editor.insertContent("");
                    linkComponent.$destroy();
                    open = false;
                });
            },
            onSetup: function (buttonApi) {
                const editorEventCallback = function (eventApi) {
                    buttonApi.setActive(eventApi.element.nodeName.toLowerCase() === 'a');
                };
                editor.on('NodeChange', editorEventCallback);
            }
        });
    }
    function getEditorArea$1() {
        return document.querySelector("div.tox-edit-area");
    }

    var r={grad:.9,turn:360,rad:360/(2*Math.PI)},t$1=function(r){return "string"==typeof r?r.length>0:"number"==typeof r},n=function(r,t,n){return void 0===t&&(t=0),void 0===n&&(n=Math.pow(10,t)),Math.round(n*r)/n+0},e=function(r,t,n){return void 0===t&&(t=0),void 0===n&&(n=1),r>n?n:r>t?r:t},u=function(r){return (r=isFinite(r)?r%360:0)>0?r:r+360},a=function(r){return {r:e(r.r,0,255),g:e(r.g,0,255),b:e(r.b,0,255),a:e(r.a)}},o$1=function(r){return {r:n(r.r),g:n(r.g),b:n(r.b),a:n(r.a,3)}},i=/^#([0-9a-f]{3,8})$/i,s=function(r){var t=r.toString(16);return t.length<2?"0"+t:t},h=function(r){var t=r.r,n=r.g,e=r.b,u=r.a,a=Math.max(t,n,e),o=a-Math.min(t,n,e),i=o?a===t?(n-e)/o:a===n?2+(e-t)/o:4+(t-n)/o:0;return {h:60*(i<0?i+6:i),s:a?o/a*100:0,v:a/255*100,a:u}},b=function(r){var t=r.h,n=r.s,e=r.v,u=r.a;t=t/360*6,n/=100,e/=100;var a=Math.floor(t),o=e*(1-n),i=e*(1-(t-a)*n),s=e*(1-(1-t+a)*n),h=a%6;return {r:255*[e,i,o,o,s,e][h],g:255*[s,e,e,i,o,o][h],b:255*[o,o,s,e,e,i][h],a:u}},g=function(r){return {h:u(r.h),s:e(r.s,0,100),l:e(r.l,0,100),a:e(r.a)}},d=function(r){return {h:n(r.h),s:n(r.s),l:n(r.l),a:n(r.a,3)}},f=function(r){return b((n=(t=r).s,{h:t.h,s:(n*=((e=t.l)<50?e:100-e)/100)>0?2*n/(e+n)*100:0,v:e+n,a:t.a}));var t,n,e;},c=function(r){return {h:(t=h(r)).h,s:(u=(200-(n=t.s))*(e=t.v)/100)>0&&u<200?n*e/100/(u<=100?u:200-u)*100:0,l:u/2,a:t.a};var t,n,e,u;},l=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,p=/^hsla?\(\s*([+-]?\d*\.?\d+)(deg|rad|grad|turn)?\s+([+-]?\d*\.?\d+)%\s+([+-]?\d*\.?\d+)%\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,v=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*,\s*([+-]?\d*\.?\d+)(%)?\s*(?:,\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,m=/^rgba?\(\s*([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s+([+-]?\d*\.?\d+)(%)?\s*(?:\/\s*([+-]?\d*\.?\d+)(%)?\s*)?\)$/i,y={string:[[function(r){var t=i.exec(r);return t?(r=t[1]).length<=4?{r:parseInt(r[0]+r[0],16),g:parseInt(r[1]+r[1],16),b:parseInt(r[2]+r[2],16),a:4===r.length?n(parseInt(r[3]+r[3],16)/255,2):1}:6===r.length||8===r.length?{r:parseInt(r.substr(0,2),16),g:parseInt(r.substr(2,2),16),b:parseInt(r.substr(4,2),16),a:8===r.length?n(parseInt(r.substr(6,2),16)/255,2):1}:null:null},"hex"],[function(r){var t=v.exec(r)||m.exec(r);return t?t[2]!==t[4]||t[4]!==t[6]?null:a({r:Number(t[1])/(t[2]?100/255:1),g:Number(t[3])/(t[4]?100/255:1),b:Number(t[5])/(t[6]?100/255:1),a:void 0===t[7]?1:Number(t[7])/(t[8]?100:1)}):null},"rgb"],[function(t){var n=l.exec(t)||p.exec(t);if(!n)return null;var e,u,a=g({h:(e=n[1],u=n[2],void 0===u&&(u="deg"),Number(e)*(r[u]||1)),s:Number(n[3]),l:Number(n[4]),a:void 0===n[5]?1:Number(n[5])/(n[6]?100:1)});return f(a)},"hsl"]],object:[[function(r){var n=r.r,e=r.g,u=r.b,o=r.a,i=void 0===o?1:o;return t$1(n)&&t$1(e)&&t$1(u)?a({r:Number(n),g:Number(e),b:Number(u),a:Number(i)}):null},"rgb"],[function(r){var n=r.h,e=r.s,u=r.l,a=r.a,o=void 0===a?1:a;if(!t$1(n)||!t$1(e)||!t$1(u))return null;var i=g({h:Number(n),s:Number(e),l:Number(u),a:Number(o)});return f(i)},"hsl"],[function(r){var n=r.h,a=r.s,o=r.v,i=r.a,s=void 0===i?1:i;if(!t$1(n)||!t$1(a)||!t$1(o))return null;var h=function(r){return {h:u(r.h),s:e(r.s,0,100),v:e(r.v,0,100),a:e(r.a)}}({h:Number(n),s:Number(a),v:Number(o),a:Number(s)});return b(h)},"hsv"]]},N=function(r,t){for(var n=0;n<t.length;n++){var e=t[n][0](r);if(e)return [e,t[n][1]]}return [null,void 0]},x=function(r){return "string"==typeof r?N(r.trim(),y.string):"object"==typeof r&&null!==r?N(r,y.object):[null,void 0]},M=function(r,t){var n=c(r);return {h:n.h,s:e(n.s+100*t,0,100),l:n.l,a:n.a}},H=function(r){return (299*r.r+587*r.g+114*r.b)/1e3/255},$=function(r,t){var n=c(r);return {h:n.h,s:n.s,l:e(n.l+100*t,0,100),a:n.a}},j=function(){function r(r){this.parsed=x(r)[0],this.rgba=this.parsed||{r:0,g:0,b:0,a:1};}return r.prototype.isValid=function(){return null!==this.parsed},r.prototype.brightness=function(){return n(H(this.rgba),2)},r.prototype.isDark=function(){return H(this.rgba)<.5},r.prototype.isLight=function(){return H(this.rgba)>=.5},r.prototype.toHex=function(){return r=o$1(this.rgba),t=r.r,e=r.g,u=r.b,i=(a=r.a)<1?s(n(255*a)):"","#"+s(t)+s(e)+s(u)+i;var r,t,e,u,a,i;},r.prototype.toRgb=function(){return o$1(this.rgba)},r.prototype.toRgbString=function(){return r=o$1(this.rgba),t=r.r,n=r.g,e=r.b,(u=r.a)<1?"rgba("+t+", "+n+", "+e+", "+u+")":"rgb("+t+", "+n+", "+e+")";var r,t,n,e,u;},r.prototype.toHsl=function(){return d(c(this.rgba))},r.prototype.toHslString=function(){return r=d(c(this.rgba)),t=r.h,n=r.s,e=r.l,(u=r.a)<1?"hsla("+t+", "+n+"%, "+e+"%, "+u+")":"hsl("+t+", "+n+"%, "+e+"%)";var r,t,n,e,u;},r.prototype.toHsv=function(){return r=h(this.rgba),{h:n(r.h),s:n(r.s),v:n(r.v),a:n(r.a,3)};var r;},r.prototype.invert=function(){return w({r:255-(r=this.rgba).r,g:255-r.g,b:255-r.b,a:r.a});var r;},r.prototype.saturate=function(r){return void 0===r&&(r=.1),w(M(this.rgba,r))},r.prototype.desaturate=function(r){return void 0===r&&(r=.1),w(M(this.rgba,-r))},r.prototype.grayscale=function(){return w(M(this.rgba,-1))},r.prototype.lighten=function(r){return void 0===r&&(r=.1),w($(this.rgba,r))},r.prototype.darken=function(r){return void 0===r&&(r=.1),w($(this.rgba,-r))},r.prototype.rotate=function(r){return void 0===r&&(r=15),this.hue(this.hue()+r)},r.prototype.alpha=function(r){return "number"==typeof r?w({r:(t=this.rgba).r,g:t.g,b:t.b,a:r}):n(this.rgba.a,3);var t;},r.prototype.hue=function(r){var t=c(this.rgba);return "number"==typeof r?w({h:r,s:t.s,l:t.l,a:t.a}):n(t.h)},r.prototype.isEqual=function(r){return this.toHex()===w(r).toHex()},r}(),w=function(r){return r instanceof j?r:new j(r)},S=[],k=function(r){r.forEach(function(r){S.indexOf(r)<0&&(r(j,y),S.push(r));});};

    var o=function(o){var t=o/255;return t<.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)},t=function(t){return .2126*o(t.r)+.7152*o(t.g)+.0722*o(t.b)};function a11yPlugin(o){o.prototype.luminance=function(){return o=t(this.rgba),void 0===(r=2)&&(r=0),void 0===n&&(n=Math.pow(10,r)),Math.round(n*o)/n+0;var o,r,n;},o.prototype.contrast=function(r){void 0===r&&(r="#FFF");var n,a,i,e,v,u,d,c=r instanceof o?r:new o(r);return e=this.rgba,v=c.toRgb(),u=t(e),d=t(v),n=u>d?(u+.05)/(d+.05):(d+.05)/(u+.05),void 0===(a=2)&&(a=0),void 0===i&&(i=Math.pow(10,a)),Math.floor(i*n)/i+0},o.prototype.isReadable=function(o,t){return void 0===o&&(o="#FFF"),void 0===t&&(t={}),this.contrast(o)>=(e=void 0===(i=(r=t).size)?"normal":i,"AAA"===(a=void 0===(n=r.level)?"AA":n)&&"normal"===e?7:"AA"===a&&"large"===e?3:4.5);var r,n,a,i,e;};}

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /**
     * Store that keeps track of the keys pressed, updated by the ArrowKeyHandler component
     */
    const keyPressed = writable({
        ArrowLeft: 0,
        ArrowUp: 0,
        ArrowRight: 0,
        ArrowDown: 0
    });
    /**
     * Store that keeps track of the keys pressed, with utility horizontal / vertical attributes
     * updated by the ArrowKeyHandler component
     */
    const keyPressedCustom = derived(keyPressed, ($keyPressed) => {
        return {
            ...$keyPressed,
            ArrowV: $keyPressed.ArrowUp + $keyPressed.ArrowDown,
            ArrowH: $keyPressed.ArrowLeft + $keyPressed.ArrowRight,
            ArrowVH: $keyPressed.ArrowUp + $keyPressed.ArrowDown + $keyPressed.ArrowLeft + $keyPressed.ArrowRight
        };
    });

    /**
     * Ease in out sin base function
     * @param x - param, between 1 and infinity
     * @param min - starting return value, default .001
     * @param max ending return value, default .01
     * @returns a number between min and max
     */
    function easeInOutSin(x, min = 0.001, max = 0.01) {
        /**
         * after the delay, the ease in starts (i.e. after x = DELAY)*
         */
        const DELAY = 50;
        /**
         * Duration of the transition (i.e. bewteen x = DELAY and x = DELAY + DURATION)
         */
        const DURATION = 50;
        const X = Math.min(1, Math.max(1, x - DELAY) / DURATION);
        return min + ((max - min) / 2) * (1 - Math.cos(Math.PI * X));
    }

    /* node_modules/svelte-awesome-color-picker/components/Picker.svelte generated by Svelte v3.54.0 */

    const { window: window_1$2 } = globals;
    const file$g = "node_modules/svelte-awesome-color-picker/components/Picker.svelte";

    // (102:0) <svelte:component this={components.pickerWrapper} {focused} {toRight}>
    function create_default_slot$3(ctx) {
    	let div;
    	let switch_instance;
    	let div_aria_valuetext_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[2].pickerIndicator;

    	function switch_props(ctx) {
    		return {
    			props: {
    				pos: /*pos*/ ctx[9],
    				isDark: /*isDark*/ ctx[5],
    				hex: w({
    					h: /*h*/ ctx[3],
    					s: /*s*/ ctx[0],
    					v: /*v*/ ctx[1],
    					a: 1
    				}).toHex()
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "picker svelte-1uklvx3");
    			attr_dev(div, "tabindex", "0");
    			set_style(div, "--color-bg", /*colorBg*/ ctx[8]);
    			attr_dev(div, "aria-label", "saturation and brightness picker (arrow keyboard navigation)");
    			attr_dev(div, "aria-valuemin", 0);
    			attr_dev(div, "aria-valuemax", 100);
    			attr_dev(div, "aria-valuetext", div_aria_valuetext_value = "saturation " + /*pos*/ ctx[9].x?.toFixed() + "%, brightness " + /*pos*/ ctx[9].y?.toFixed() + "%");
    			add_location(div, file$g, 103, 1, 3152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			/*div_binding*/ ctx[18](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", stop_propagation(prevent_default(/*pickerMouseDown*/ ctx[10])), false, true, true),
    					listen_dev(div, "touchstart", /*touch*/ ctx[16], false, false, false),
    					listen_dev(div, "touchmove", stop_propagation(prevent_default(/*touch*/ ctx[16])), false, true, true),
    					listen_dev(div, "touchend", /*touch*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*pos*/ 512) switch_instance_changes.pos = /*pos*/ ctx[9];
    			if (dirty & /*isDark*/ 32) switch_instance_changes.isDark = /*isDark*/ ctx[5];

    			if (dirty & /*h, s, v*/ 11) switch_instance_changes.hex = w({
    				h: /*h*/ ctx[3],
    				s: /*s*/ ctx[0],
    				v: /*v*/ ctx[1],
    				a: 1
    			}).toHex();

    			if (switch_value !== (switch_value = /*components*/ ctx[2].pickerIndicator)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*colorBg*/ 256) {
    				set_style(div, "--color-bg", /*colorBg*/ ctx[8]);
    			}

    			if (!current || dirty & /*pos*/ 512 && div_aria_valuetext_value !== (div_aria_valuetext_value = "saturation " + /*pos*/ ctx[9].x?.toFixed() + "%, brightness " + /*pos*/ ctx[9].y?.toFixed() + "%")) {
    				attr_dev(div, "aria-valuetext", div_aria_valuetext_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			/*div_binding*/ ctx[18](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(102:0) <svelte:component this={components.pickerWrapper} {focused} {toRight}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[2].pickerWrapper;

    	function switch_props(ctx) {
    		return {
    			props: {
    				focused: /*focused*/ ctx[7],
    				toRight: /*toRight*/ ctx[4],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$2, "mouseup", /*mouseUp*/ ctx[11], false, false, false),
    					listen_dev(window_1$2, "mousedown", /*mouseDown*/ ctx[13], false, false, false),
    					listen_dev(window_1$2, "mousemove", /*mouseMove*/ ctx[12], false, false, false),
    					listen_dev(window_1$2, "keyup", /*keyup*/ ctx[14], false, false, false),
    					listen_dev(window_1$2, "keydown", /*keydown*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*focused*/ 128) switch_instance_changes.focused = /*focused*/ ctx[7];
    			if (dirty & /*toRight*/ 16) switch_instance_changes.toRight = /*toRight*/ ctx[4];

    			if (dirty & /*$$scope, colorBg, pos, picker, components, isDark, h, s, v*/ 67109743) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*components*/ ctx[2].pickerWrapper)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clamp(value, min, max) {
    	return Math.min(Math.max(min, value), max);
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $keyPressed;
    	let $keyPressedCustom;
    	validate_store(keyPressed, 'keyPressed');
    	component_subscribe($$self, keyPressed, $$value => $$invalidate(22, $keyPressed = $$value));
    	validate_store(keyPressedCustom, 'keyPressedCustom');
    	component_subscribe($$self, keyPressedCustom, $$value => $$invalidate(23, $keyPressedCustom = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Picker', slots, []);
    	let { components } = $$props;
    	let { h } = $$props;
    	let { s } = $$props;
    	let { v } = $$props;
    	let { isOpen } = $$props;
    	let { toRight } = $$props;
    	let { isDark } = $$props;
    	let picker;
    	let isMouseDown = false;
    	let focused = false;
    	let focusMovementIntervalId;
    	let focusMovementCounter;
    	let colorBg;
    	let pos = { x: 100, y: 0 };

    	function onClick(e) {
    		let mouse = { x: e.offsetX, y: e.offsetY };
    		let width = picker.getBoundingClientRect().width;
    		let height = picker.getBoundingClientRect().height;
    		$$invalidate(0, s = clamp(mouse.x / width, 0, 1) * 100);
    		$$invalidate(1, v = clamp((height - mouse.y) / height, 0, 1) * 100);
    	}

    	function pickerMouseDown(e) {
    		if (e.button === 0) {
    			isMouseDown = true;
    			onClick(e);
    		}
    	}

    	function mouseUp() {
    		isMouseDown = false;
    	}

    	function mouseMove(e) {
    		if (isMouseDown) onClick({
    			offsetX: Math.max(0, Math.min(picker.getBoundingClientRect().width, e.clientX - picker.getBoundingClientRect().left)),
    			offsetY: Math.max(0, Math.min(picker.getBoundingClientRect().height, e.clientY - picker.getBoundingClientRect().top))
    		});
    	}

    	function mouseDown(e) {
    		if (!e.target.isSameNode(picker)) $$invalidate(7, focused = false);
    	}

    	function keyup(e) {
    		if (e.key === 'Tab') $$invalidate(7, focused = !!document.activeElement?.isSameNode(picker));
    		if (!e.repeat && focused) move();
    	}

    	function keydown(e) {
    		if (focused && $keyPressedCustom.ArrowVH) {
    			e.preventDefault();
    			if (!e.repeat) move();
    		}
    	}

    	function move() {
    		if ($keyPressedCustom.ArrowVH) {
    			if (!focusMovementIntervalId) {
    				focusMovementCounter = 0;

    				focusMovementIntervalId = window.setInterval(
    					() => {
    						let focusMovementFactor = easeInOutSin(++focusMovementCounter);
    						$$invalidate(0, s = Math.min(100, Math.max(0, s + ($keyPressed.ArrowRight - $keyPressed.ArrowLeft) * focusMovementFactor * 100)));
    						$$invalidate(1, v = Math.min(100, Math.max(0, v + ($keyPressed.ArrowUp - $keyPressed.ArrowDown) * focusMovementFactor * 100)));
    					},
    					10
    				);
    			}
    		} else if (focusMovementIntervalId) {
    			clearInterval(focusMovementIntervalId);
    			focusMovementIntervalId = undefined;
    		}
    	}

    	function touch(e) {
    		e.preventDefault();

    		onClick({
    			offsetX: e.changedTouches[0].clientX - picker.getBoundingClientRect().left,
    			offsetY: e.changedTouches[0].clientY - picker.getBoundingClientRect().top
    		});
    	}

    	$$self.$$.on_mount.push(function () {
    		if (components === undefined && !('components' in $$props || $$self.$$.bound[$$self.$$.props['components']])) {
    			console.warn("<Picker> was created without expected prop 'components'");
    		}

    		if (h === undefined && !('h' in $$props || $$self.$$.bound[$$self.$$.props['h']])) {
    			console.warn("<Picker> was created without expected prop 'h'");
    		}

    		if (s === undefined && !('s' in $$props || $$self.$$.bound[$$self.$$.props['s']])) {
    			console.warn("<Picker> was created without expected prop 's'");
    		}

    		if (v === undefined && !('v' in $$props || $$self.$$.bound[$$self.$$.props['v']])) {
    			console.warn("<Picker> was created without expected prop 'v'");
    		}

    		if (isOpen === undefined && !('isOpen' in $$props || $$self.$$.bound[$$self.$$.props['isOpen']])) {
    			console.warn("<Picker> was created without expected prop 'isOpen'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<Picker> was created without expected prop 'toRight'");
    		}

    		if (isDark === undefined && !('isDark' in $$props || $$self.$$.bound[$$self.$$.props['isDark']])) {
    			console.warn("<Picker> was created without expected prop 'isDark'");
    		}
    	});

    	const writable_props = ['components', 'h', 's', 'v', 'isOpen', 'toRight', 'isDark'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Picker> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			picker = $$value;
    			$$invalidate(6, picker);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('components' in $$props) $$invalidate(2, components = $$props.components);
    		if ('h' in $$props) $$invalidate(3, h = $$props.h);
    		if ('s' in $$props) $$invalidate(0, s = $$props.s);
    		if ('v' in $$props) $$invalidate(1, v = $$props.v);
    		if ('isOpen' in $$props) $$invalidate(17, isOpen = $$props.isOpen);
    		if ('toRight' in $$props) $$invalidate(4, toRight = $$props.toRight);
    		if ('isDark' in $$props) $$invalidate(5, isDark = $$props.isDark);
    	};

    	$$self.$capture_state = () => ({
    		colord: w,
    		keyPressed,
    		keyPressedCustom,
    		easeInOutSin,
    		components,
    		h,
    		s,
    		v,
    		isOpen,
    		toRight,
    		isDark,
    		picker,
    		isMouseDown,
    		focused,
    		focusMovementIntervalId,
    		focusMovementCounter,
    		colorBg,
    		pos,
    		clamp,
    		onClick,
    		pickerMouseDown,
    		mouseUp,
    		mouseMove,
    		mouseDown,
    		keyup,
    		keydown,
    		move,
    		touch,
    		$keyPressed,
    		$keyPressedCustom
    	});

    	$$self.$inject_state = $$props => {
    		if ('components' in $$props) $$invalidate(2, components = $$props.components);
    		if ('h' in $$props) $$invalidate(3, h = $$props.h);
    		if ('s' in $$props) $$invalidate(0, s = $$props.s);
    		if ('v' in $$props) $$invalidate(1, v = $$props.v);
    		if ('isOpen' in $$props) $$invalidate(17, isOpen = $$props.isOpen);
    		if ('toRight' in $$props) $$invalidate(4, toRight = $$props.toRight);
    		if ('isDark' in $$props) $$invalidate(5, isDark = $$props.isDark);
    		if ('picker' in $$props) $$invalidate(6, picker = $$props.picker);
    		if ('isMouseDown' in $$props) isMouseDown = $$props.isMouseDown;
    		if ('focused' in $$props) $$invalidate(7, focused = $$props.focused);
    		if ('focusMovementIntervalId' in $$props) focusMovementIntervalId = $$props.focusMovementIntervalId;
    		if ('focusMovementCounter' in $$props) focusMovementCounter = $$props.focusMovementCounter;
    		if ('colorBg' in $$props) $$invalidate(8, colorBg = $$props.colorBg);
    		if ('pos' in $$props) $$invalidate(9, pos = $$props.pos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*h*/ 8) {
    			if (typeof h === 'number') $$invalidate(8, colorBg = w({ h, s: 100, v: 100, a: 1 }).toHex());
    		}

    		if ($$self.$$.dirty & /*s, v, picker*/ 67) {
    			if (typeof s === 'number' && typeof v === 'number' && picker) $$invalidate(9, pos = { x: s, y: 100 - v });
    		}
    	};

    	return [
    		s,
    		v,
    		components,
    		h,
    		toRight,
    		isDark,
    		picker,
    		focused,
    		colorBg,
    		pos,
    		pickerMouseDown,
    		mouseUp,
    		mouseMove,
    		mouseDown,
    		keyup,
    		keydown,
    		touch,
    		isOpen,
    		div_binding
    	];
    }

    class Picker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			components: 2,
    			h: 3,
    			s: 0,
    			v: 1,
    			isOpen: 17,
    			toRight: 4,
    			isDark: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Picker",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get components() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get h() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set h(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get s() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set s(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDark() {
    		throw new Error("<Picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDark(value) {
    		throw new Error("<Picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/Slider.svelte generated by Svelte v3.54.0 */

    const { window: window_1$1 } = globals;
    const file$f = "node_modules/svelte-awesome-color-picker/components/Slider.svelte";

    // (82:0) <svelte:component this={components.sliderWrapper} {focused} {toRight}>
    function create_default_slot$2(ctx) {
    	let div;
    	let switch_instance;
    	let div_aria_valuenow_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[1].sliderIndicator;

    	function switch_props(ctx) {
    		return {
    			props: {
    				pos: /*pos*/ ctx[4],
    				toRight: /*toRight*/ ctx[2]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "slider svelte-1rfxwri");
    			attr_dev(div, "tabindex", "0");
    			attr_dev(div, "aria-label", "hue picker (arrow keyboard navigation)");
    			attr_dev(div, "aria-valuemin", 0);
    			attr_dev(div, "aria-valuemax", 360);
    			attr_dev(div, "aria-valuenow", div_aria_valuenow_value = Math.round(/*h*/ ctx[0]));
    			toggle_class(div, "to-right", /*toRight*/ ctx[2]);
    			add_location(div, file$f, 83, 1, 2485);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			/*div_binding*/ ctx[12](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", stop_propagation(prevent_default(/*mouseDown*/ ctx[6])), false, true, true),
    					listen_dev(div, "touchstart", /*touch*/ ctx[11], false, false, false),
    					listen_dev(div, "touchmove", stop_propagation(prevent_default(/*touch*/ ctx[11])), false, true, true),
    					listen_dev(div, "touchend", /*touch*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*pos*/ 16) switch_instance_changes.pos = /*pos*/ ctx[4];
    			if (dirty & /*toRight*/ 4) switch_instance_changes.toRight = /*toRight*/ ctx[2];

    			if (switch_value !== (switch_value = /*components*/ ctx[1].sliderIndicator)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*h*/ 1 && div_aria_valuenow_value !== (div_aria_valuenow_value = Math.round(/*h*/ ctx[0]))) {
    				attr_dev(div, "aria-valuenow", div_aria_valuenow_value);
    			}

    			if (!current || dirty & /*toRight*/ 4) {
    				toggle_class(div, "to-right", /*toRight*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			/*div_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(82:0) <svelte:component this={components.sliderWrapper} {focused} {toRight}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[1].sliderWrapper;

    	function switch_props(ctx) {
    		return {
    			props: {
    				focused: /*focused*/ ctx[5],
    				toRight: /*toRight*/ ctx[2],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$1, "mouseup", /*mouseUp*/ ctx[7], false, false, false),
    					listen_dev(window_1$1, "mousemove", /*mouseMove*/ ctx[8], false, false, false),
    					listen_dev(window_1$1, "keyup", /*keyup*/ ctx[9], false, false, false),
    					listen_dev(window_1$1, "keydown", /*keydown*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*focused*/ 32) switch_instance_changes.focused = /*focused*/ ctx[5];
    			if (dirty & /*toRight*/ 4) switch_instance_changes.toRight = /*toRight*/ ctx[2];

    			if (dirty & /*$$scope, h, slider, toRight, components, pos*/ 1048607) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*components*/ ctx[1].sliderWrapper)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $keyPressed;
    	let $keyPressedCustom;
    	validate_store(keyPressed, 'keyPressed');
    	component_subscribe($$self, keyPressed, $$value => $$invalidate(16, $keyPressed = $$value));
    	validate_store(keyPressedCustom, 'keyPressedCustom');
    	component_subscribe($$self, keyPressedCustom, $$value => $$invalidate(17, $keyPressedCustom = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	let { components } = $$props;
    	let { toRight } = $$props;
    	let slider;
    	let isMouseDown = false;
    	let { h } = $$props;
    	let pos = 0;
    	let focused = false;
    	let focusMovementIntervalId;
    	let focusMovementCounter;

    	function onClick(pos) {
    		const size = toRight
    		? slider.getBoundingClientRect().width
    		: slider.getBoundingClientRect().height;

    		const boundedPos = Math.max(0, Math.min(size, pos));
    		$$invalidate(0, h = boundedPos / size * 360);
    	}

    	function mouseDown(e) {
    		if (e.button === 0) {
    			isMouseDown = true;
    			onClick(toRight ? e.offsetX : e.offsetY);
    		}
    	}

    	function mouseUp() {
    		isMouseDown = false;
    	}

    	function mouseMove(e) {
    		if (isMouseDown) onClick(toRight
    		? e.clientX - slider.getBoundingClientRect().left
    		: e.clientY - slider.getBoundingClientRect().top);
    	}

    	function keyup(e) {
    		if (e.key === 'Tab') $$invalidate(5, focused = !!document.activeElement?.isSameNode(slider));
    		if (!e.repeat && focused) move();
    	}

    	function keydown(e) {
    		if (focused && $keyPressedCustom.ArrowVH) {
    			e.preventDefault();
    			if (!e.repeat) move();
    		}
    	}

    	function move() {
    		if ($keyPressedCustom.ArrowVH) {
    			if (!focusMovementIntervalId) {
    				focusMovementCounter = 0;

    				focusMovementIntervalId = window.setInterval(
    					() => {
    						const focusMovementFactor = easeInOutSin(++focusMovementCounter);

    						const movement = toRight
    						? $keyPressed.ArrowRight - $keyPressed.ArrowLeft
    						: $keyPressed.ArrowDown - $keyPressed.ArrowUp;

    						$$invalidate(0, h = Math.min(360, Math.max(0, h + movement * 360 * focusMovementFactor)));
    					},
    					10
    				);
    			}
    		} else if (focusMovementIntervalId) {
    			clearInterval(focusMovementIntervalId);
    			focusMovementIntervalId = undefined;
    		}
    	}

    	function touch(e) {
    		e.preventDefault();

    		onClick(toRight
    		? e.changedTouches[0].clientX - slider.getBoundingClientRect().left
    		: e.changedTouches[0].clientY - slider.getBoundingClientRect().top);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (components === undefined && !('components' in $$props || $$self.$$.bound[$$self.$$.props['components']])) {
    			console.warn("<Slider> was created without expected prop 'components'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<Slider> was created without expected prop 'toRight'");
    		}

    		if (h === undefined && !('h' in $$props || $$self.$$.bound[$$self.$$.props['h']])) {
    			console.warn("<Slider> was created without expected prop 'h'");
    		}
    	});

    	const writable_props = ['components', 'toRight', 'h'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			slider = $$value;
    			$$invalidate(3, slider);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('components' in $$props) $$invalidate(1, components = $$props.components);
    		if ('toRight' in $$props) $$invalidate(2, toRight = $$props.toRight);
    		if ('h' in $$props) $$invalidate(0, h = $$props.h);
    	};

    	$$self.$capture_state = () => ({
    		keyPressed,
    		keyPressedCustom,
    		easeInOutSin,
    		components,
    		toRight,
    		slider,
    		isMouseDown,
    		h,
    		pos,
    		focused,
    		focusMovementIntervalId,
    		focusMovementCounter,
    		onClick,
    		mouseDown,
    		mouseUp,
    		mouseMove,
    		keyup,
    		keydown,
    		move,
    		touch,
    		$keyPressed,
    		$keyPressedCustom
    	});

    	$$self.$inject_state = $$props => {
    		if ('components' in $$props) $$invalidate(1, components = $$props.components);
    		if ('toRight' in $$props) $$invalidate(2, toRight = $$props.toRight);
    		if ('slider' in $$props) $$invalidate(3, slider = $$props.slider);
    		if ('isMouseDown' in $$props) isMouseDown = $$props.isMouseDown;
    		if ('h' in $$props) $$invalidate(0, h = $$props.h);
    		if ('pos' in $$props) $$invalidate(4, pos = $$props.pos);
    		if ('focused' in $$props) $$invalidate(5, focused = $$props.focused);
    		if ('focusMovementIntervalId' in $$props) focusMovementIntervalId = $$props.focusMovementIntervalId;
    		if ('focusMovementCounter' in $$props) focusMovementCounter = $$props.focusMovementCounter;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*h, slider*/ 9) {
    			if (typeof h === 'number' && slider) $$invalidate(4, pos = 100 * h / 360);
    		}
    	};

    	return [
    		h,
    		components,
    		toRight,
    		slider,
    		pos,
    		focused,
    		mouseDown,
    		mouseUp,
    		mouseMove,
    		keyup,
    		keydown,
    		touch,
    		div_binding
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { components: 1, toRight: 2, h: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get components() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get h() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set h(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/Alpha.svelte generated by Svelte v3.54.0 */

    const { window: window_1 } = globals;
    const file$e = "node_modules/svelte-awesome-color-picker/components/Alpha.svelte";

    // (85:0) <svelte:component this={components.alphaWrapper} {focused} {toRight}>
    function create_default_slot$1(ctx) {
    	let div;
    	let switch_instance;
    	let div_aria_valuenow_value;
    	let div_aria_valuetext_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[0].alphaIndicator;

    	function switch_props(ctx) {
    		return {
    			props: {
    				pos: /*pos*/ ctx[5],
    				toRight: /*toRight*/ ctx[2]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "alpha svelte-sh8y8x");
    			attr_dev(div, "tabindex", "0");
    			set_style(div, "--alpha-color", /*hex*/ ctx[1]?.substring(0, 7));
    			attr_dev(div, "aria-label", "transparency picker (arrow keyboard navigation)");
    			attr_dev(div, "aria-valuemin", 0);
    			attr_dev(div, "aria-valuemax", 100);
    			attr_dev(div, "aria-valuenow", div_aria_valuenow_value = Math.round(/*pos*/ ctx[5]));
    			attr_dev(div, "aria-valuetext", div_aria_valuetext_value = "" + (/*pos*/ ctx[5]?.toFixed() + "%"));
    			toggle_class(div, "to-right", /*toRight*/ ctx[2]);
    			add_location(div, file$e, 86, 1, 2524);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			/*div_binding*/ ctx[14](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", stop_propagation(prevent_default(/*mouseDown*/ ctx[6])), false, true, true),
    					listen_dev(div, "touchstart", /*touch*/ ctx[11], false, false, false),
    					listen_dev(div, "touchmove", stop_propagation(prevent_default(/*touch*/ ctx[11])), false, true, true),
    					listen_dev(div, "touchend", /*touch*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*pos*/ 32) switch_instance_changes.pos = /*pos*/ ctx[5];
    			if (dirty & /*toRight*/ 4) switch_instance_changes.toRight = /*toRight*/ ctx[2];

    			if (switch_value !== (switch_value = /*components*/ ctx[0].alphaIndicator)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*hex*/ 2) {
    				set_style(div, "--alpha-color", /*hex*/ ctx[1]?.substring(0, 7));
    			}

    			if (!current || dirty & /*pos*/ 32 && div_aria_valuenow_value !== (div_aria_valuenow_value = Math.round(/*pos*/ ctx[5]))) {
    				attr_dev(div, "aria-valuenow", div_aria_valuenow_value);
    			}

    			if (!current || dirty & /*pos*/ 32 && div_aria_valuetext_value !== (div_aria_valuetext_value = "" + (/*pos*/ ctx[5]?.toFixed() + "%"))) {
    				attr_dev(div, "aria-valuetext", div_aria_valuetext_value);
    			}

    			if (!current || dirty & /*toRight*/ 4) {
    				toggle_class(div, "to-right", /*toRight*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			/*div_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(85:0) <svelte:component this={components.alphaWrapper} {focused} {toRight}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[0].alphaWrapper;

    	function switch_props(ctx) {
    		return {
    			props: {
    				focused: /*focused*/ ctx[4],
    				toRight: /*toRight*/ ctx[2],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "mouseup", /*mouseUp*/ ctx[7], false, false, false),
    					listen_dev(window_1, "mousemove", /*mouseMove*/ ctx[8], false, false, false),
    					listen_dev(window_1, "keyup", /*keyup*/ ctx[9], false, false, false),
    					listen_dev(window_1, "keydown", /*keydown*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*focused*/ 16) switch_instance_changes.focused = /*focused*/ ctx[4];
    			if (dirty & /*toRight*/ 4) switch_instance_changes.toRight = /*toRight*/ ctx[2];

    			if (dirty & /*$$scope, hex, pos, alpha, toRight, components*/ 4194351) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*components*/ ctx[0].alphaWrapper)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $keyPressed;
    	let $keyPressedCustom;
    	validate_store(keyPressed, 'keyPressed');
    	component_subscribe($$self, keyPressed, $$value => $$invalidate(18, $keyPressed = $$value));
    	validate_store(keyPressedCustom, 'keyPressedCustom');
    	component_subscribe($$self, keyPressedCustom, $$value => $$invalidate(19, $keyPressedCustom = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Alpha', slots, []);
    	let { components } = $$props;
    	let { isOpen } = $$props;
    	let { a = 1 } = $$props;
    	let { hex } = $$props;
    	let { toRight } = $$props;
    	let alpha;
    	let isMouseDown = false;
    	let focused = false;
    	let focusMovementIntervalId;
    	let focusMovementCounter;
    	let pos;

    	function onClick(pos) {
    		const size = toRight
    		? alpha.getBoundingClientRect().width
    		: alpha.getBoundingClientRect().height;

    		const boundedPos = Math.max(0, Math.min(size, pos));
    		$$invalidate(12, a = boundedPos / size);
    	}

    	function mouseDown(e) {
    		if (e.button === 0) {
    			isMouseDown = true;
    			onClick(toRight ? e.offsetX : e.offsetY);
    		}
    	}

    	function mouseUp() {
    		isMouseDown = false;
    	}

    	function mouseMove(e) {
    		if (isMouseDown) onClick(toRight
    		? e.clientX - alpha.getBoundingClientRect().left
    		: e.clientY - alpha.getBoundingClientRect().top);
    	}

    	function keyup(e) {
    		if (e.key === 'Tab') $$invalidate(4, focused = !!document.activeElement?.isSameNode(alpha));
    		if (!e.repeat && focused) move();
    	}

    	function keydown(e) {
    		if (focused && $keyPressedCustom.ArrowVH) {
    			e.preventDefault();
    			if (!e.repeat) move();
    		}
    	}

    	function move() {
    		if ($keyPressedCustom.ArrowVH) {
    			if (!focusMovementIntervalId) {
    				focusMovementCounter = 0;

    				focusMovementIntervalId = window.setInterval(
    					() => {
    						const focusMovementFactor = easeInOutSin(++focusMovementCounter);

    						const movement = toRight
    						? $keyPressed.ArrowRight - $keyPressed.ArrowLeft
    						: $keyPressed.ArrowDown - $keyPressed.ArrowUp;

    						$$invalidate(12, a = Math.min(1, Math.max(0, a + movement * focusMovementFactor)));
    					},
    					10
    				);
    			}
    		} else if (focusMovementIntervalId) {
    			clearInterval(focusMovementIntervalId);
    			focusMovementIntervalId = undefined;
    		}
    	}

    	function touch(e) {
    		e.preventDefault();

    		onClick(toRight
    		? e.changedTouches[0].clientX - alpha.getBoundingClientRect().left
    		: e.changedTouches[0].clientY - alpha.getBoundingClientRect().top);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (components === undefined && !('components' in $$props || $$self.$$.bound[$$self.$$.props['components']])) {
    			console.warn("<Alpha> was created without expected prop 'components'");
    		}

    		if (isOpen === undefined && !('isOpen' in $$props || $$self.$$.bound[$$self.$$.props['isOpen']])) {
    			console.warn("<Alpha> was created without expected prop 'isOpen'");
    		}

    		if (hex === undefined && !('hex' in $$props || $$self.$$.bound[$$self.$$.props['hex']])) {
    			console.warn("<Alpha> was created without expected prop 'hex'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<Alpha> was created without expected prop 'toRight'");
    		}
    	});

    	const writable_props = ['components', 'isOpen', 'a', 'hex', 'toRight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Alpha> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			alpha = $$value;
    			$$invalidate(3, alpha);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('components' in $$props) $$invalidate(0, components = $$props.components);
    		if ('isOpen' in $$props) $$invalidate(13, isOpen = $$props.isOpen);
    		if ('a' in $$props) $$invalidate(12, a = $$props.a);
    		if ('hex' in $$props) $$invalidate(1, hex = $$props.hex);
    		if ('toRight' in $$props) $$invalidate(2, toRight = $$props.toRight);
    	};

    	$$self.$capture_state = () => ({
    		keyPressed,
    		keyPressedCustom,
    		easeInOutSin,
    		components,
    		isOpen,
    		a,
    		hex,
    		toRight,
    		alpha,
    		isMouseDown,
    		focused,
    		focusMovementIntervalId,
    		focusMovementCounter,
    		pos,
    		onClick,
    		mouseDown,
    		mouseUp,
    		mouseMove,
    		keyup,
    		keydown,
    		move,
    		touch,
    		$keyPressed,
    		$keyPressedCustom
    	});

    	$$self.$inject_state = $$props => {
    		if ('components' in $$props) $$invalidate(0, components = $$props.components);
    		if ('isOpen' in $$props) $$invalidate(13, isOpen = $$props.isOpen);
    		if ('a' in $$props) $$invalidate(12, a = $$props.a);
    		if ('hex' in $$props) $$invalidate(1, hex = $$props.hex);
    		if ('toRight' in $$props) $$invalidate(2, toRight = $$props.toRight);
    		if ('alpha' in $$props) $$invalidate(3, alpha = $$props.alpha);
    		if ('isMouseDown' in $$props) isMouseDown = $$props.isMouseDown;
    		if ('focused' in $$props) $$invalidate(4, focused = $$props.focused);
    		if ('focusMovementIntervalId' in $$props) focusMovementIntervalId = $$props.focusMovementIntervalId;
    		if ('focusMovementCounter' in $$props) focusMovementCounter = $$props.focusMovementCounter;
    		if ('pos' in $$props) $$invalidate(5, pos = $$props.pos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*a, alpha*/ 4104) {
    			if (typeof a === 'number' && alpha) $$invalidate(5, pos = 100 * a);
    		}
    	};

    	return [
    		components,
    		hex,
    		toRight,
    		alpha,
    		focused,
    		pos,
    		mouseDown,
    		mouseUp,
    		mouseMove,
    		keyup,
    		keydown,
    		touch,
    		a,
    		isOpen,
    		div_binding
    	];
    }

    class Alpha extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			components: 0,
    			isOpen: 13,
    			a: 12,
    			hex: 1,
    			toRight: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Alpha",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get components() {
    		throw new Error("<Alpha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<Alpha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Alpha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Alpha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a() {
    		throw new Error("<Alpha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a(value) {
    		throw new Error("<Alpha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<Alpha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<Alpha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<Alpha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<Alpha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/TextInput.svelte generated by Svelte v3.54.0 */

    const file$d = "node_modules/svelte-awesome-color-picker/components/variant/default/TextInput.svelte";

    // (85:1) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let input2;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*isAlpha*/ ctx[2] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			input2 = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(input0, "aria-label", "hue chanel color");
    			input0.value = /*h*/ ctx[8];
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "360");
    			attr_dev(input0, "class", "svelte-1capfim");
    			add_location(input0, file$d, 86, 3, 1830);
    			attr_dev(input1, "aria-label", "saturation chanel color");
    			input1.value = /*s*/ ctx[7];
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "class", "svelte-1capfim");
    			add_location(input1, file$d, 94, 3, 1968);
    			attr_dev(input2, "aria-label", "brightness chanel color");
    			input2.value = /*v*/ ctx[6];
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "100");
    			attr_dev(input2, "class", "svelte-1capfim");
    			add_location(input2, file$d, 102, 3, 2113);
    			attr_dev(div, "class", "input-container svelte-1capfim");
    			add_location(div, file$d, 85, 2, 1797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			append_dev(div, t1);
    			append_dev(div, input2);
    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*updateHsv*/ ctx[12]('h'), false, false, false),
    					listen_dev(input1, "input", /*updateHsv*/ ctx[12]('s'), false, false, false),
    					listen_dev(input2, "input", /*updateHsv*/ ctx[12]('v'), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*h*/ 256 && input0.value !== /*h*/ ctx[8]) {
    				prop_dev(input0, "value", /*h*/ ctx[8]);
    			}

    			if (dirty & /*s*/ 128 && input1.value !== /*s*/ ctx[7]) {
    				prop_dev(input1, "value", /*s*/ ctx[7]);
    			}

    			if (dirty & /*v*/ 64 && input2.value !== /*v*/ ctx[6]) {
    				prop_dev(input2, "value", /*v*/ ctx[6]);
    			}

    			if (/*isAlpha*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(85:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:22) 
    function create_if_block_3$1(ctx) {
    	let div;
    	let input0;
    	let input0_value_value;
    	let t0;
    	let input1;
    	let input1_value_value;
    	let t1;
    	let input2;
    	let input2_value_value;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*isAlpha*/ ctx[2] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			input2 = element("input");
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(input0, "aria-label", "red chanel color");
    			input0.value = input0_value_value = /*rgb*/ ctx[0].r;
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "255");
    			attr_dev(input0, "class", "svelte-1capfim");
    			add_location(input0, file$d, 48, 3, 1155);
    			attr_dev(input1, "aria-label", "green chanel color");
    			input1.value = input1_value_value = /*rgb*/ ctx[0].g;
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "255");
    			attr_dev(input1, "class", "svelte-1capfim");
    			add_location(input1, file$d, 56, 3, 1297);
    			attr_dev(input2, "aria-label", "blue chanel color");
    			input2.value = input2_value_value = /*rgb*/ ctx[0].b;
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "255");
    			attr_dev(input2, "class", "svelte-1capfim");
    			add_location(input2, file$d, 64, 3, 1441);
    			attr_dev(div, "class", "input-container svelte-1capfim");
    			add_location(div, file$d, 47, 2, 1122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			append_dev(div, t1);
    			append_dev(div, input2);
    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*updateRgb*/ ctx[11]('r'), false, false, false),
    					listen_dev(input1, "input", /*updateRgb*/ ctx[11]('g'), false, false, false),
    					listen_dev(input2, "input", /*updateRgb*/ ctx[11]('b'), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rgb*/ 1 && input0_value_value !== (input0_value_value = /*rgb*/ ctx[0].r) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*rgb*/ 1 && input1_value_value !== (input1_value_value = /*rgb*/ ctx[0].g) && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*rgb*/ 1 && input2_value_value !== (input2_value_value = /*rgb*/ ctx[0].b) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (/*isAlpha*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(47:22) ",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#if mode === 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let input;
    	let t;
    	let mounted;
    	let dispose;
    	let if_block = /*isAlpha*/ ctx[2] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			input.value = /*hex*/ ctx[1];
    			set_style(input, "flex", "3");
    			attr_dev(input, "class", "svelte-1capfim");
    			add_location(input, file$d, 33, 3, 841);
    			attr_dev(div, "class", "input-container svelte-1capfim");
    			add_location(div, file$d, 32, 2, 808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*updateHex*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hex*/ 2 && input.value !== /*hex*/ ctx[1]) {
    				prop_dev(input, "value", /*hex*/ ctx[1]);
    			}

    			if (/*isAlpha*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(32:1) {#if mode === 0}",
    		ctx
    	});

    	return block;
    }

    // (111:3) {#if isAlpha}
    function create_if_block_5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "aria-label", "transparency chanel color");
    			input.value = /*a*/ ctx[5];
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "1");
    			attr_dev(input, "step", "0.01");
    			attr_dev(input, "class", "svelte-1capfim");
    			add_location(input, file$d, 111, 4, 2276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*updateHsv*/ ctx[12]('a'), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*a*/ 32 && input.value !== /*a*/ ctx[5]) {
    				prop_dev(input, "value", /*a*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(111:3) {#if isAlpha}",
    		ctx
    	});

    	return block;
    }

    // (73:3) {#if isAlpha}
    function create_if_block_4(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "aria-label", "transparency chanel color");
    			input.value = /*a*/ ctx[5];
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "1");
    			attr_dev(input, "step", "0.01");
    			attr_dev(input, "class", "svelte-1capfim");
    			add_location(input, file$d, 73, 4, 1602);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*updateRgb*/ ctx[11]('a'), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*a*/ 32 && input.value !== /*a*/ ctx[5]) {
    				prop_dev(input, "value", /*a*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(73:3) {#if isAlpha}",
    		ctx
    	});

    	return block;
    }

    // (35:3) {#if isAlpha}
    function create_if_block_2$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "aria-label", "hexadecimal color");
    			input.value = /*a*/ ctx[5];
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "1");
    			attr_dev(input, "step", "0.01");
    			attr_dev(input, "class", "svelte-1capfim");
    			add_location(input, file$d, 35, 4, 921);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*updateRgb*/ ctx[11]('a'), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*a*/ 32 && input.value !== /*a*/ ctx[5]) {
    				prop_dev(input, "value", /*a*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(35:3) {#if isAlpha}",
    		ctx
    	});

    	return block;
    }

    // (125:1) {#if canChangeMode}
    function create_if_block$2(ctx) {
    	let button;
    	let t_value = /*modes*/ ctx[9][/*mode*/ ctx[4]] + "";
    	let t;
    	let button_aria_label_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "aria-label", button_aria_label_value = "change inputs to " + /*modes*/ ctx[9][(/*mode*/ ctx[4] + 1) % 3]);
    			attr_dev(button, "class", "svelte-1capfim");
    			add_location(button, file$d, 125, 2, 2491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mode*/ 16 && t_value !== (t_value = /*modes*/ ctx[9][/*mode*/ ctx[4]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*mode*/ 16 && button_aria_label_value !== (button_aria_label_value = "change inputs to " + /*modes*/ ctx[9][(/*mode*/ ctx[4] + 1) % 3])) {
    				attr_dev(button, "aria-label", button_aria_label_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(125:1) {#if canChangeMode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*mode*/ ctx[4] === 0) return create_if_block_1$1;
    		if (/*mode*/ ctx[4] === 1) return create_if_block_3$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*canChangeMode*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "text-input svelte-1capfim");
    			add_location(div, file$d, 30, 0, 763);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			}

    			if (/*canChangeMode*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{8})$/i;

    function instance$f($$self, $$props, $$invalidate) {
    	let h;
    	let s;
    	let v;
    	let a;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextInput', slots, []);
    	let { isAlpha } = $$props;
    	let { rgb } = $$props;
    	let { hsv } = $$props;
    	let { hex } = $$props;
    	let { canChangeMode } = $$props;
    	const modes = ['HEX', 'RGB', 'HSV'];
    	let mode = 0;

    	function updateHex(e) {
    		const target = e.target;

    		if (HEX_COLOR_REGEX.test(target.value)) {
    			$$invalidate(1, hex = target.value);
    		}
    	}

    	function updateRgb(property) {
    		return function (e) {
    			$$invalidate(0, rgb = {
    				...rgb,
    				[property]: parseFloat(e.target.value)
    			});
    		};
    	}

    	function updateHsv(property) {
    		return function (e) {
    			$$invalidate(13, hsv = {
    				...hsv,
    				[property]: parseFloat(e.target.value)
    			});
    		};
    	}

    	$$self.$$.on_mount.push(function () {
    		if (isAlpha === undefined && !('isAlpha' in $$props || $$self.$$.bound[$$self.$$.props['isAlpha']])) {
    			console.warn("<TextInput> was created without expected prop 'isAlpha'");
    		}

    		if (rgb === undefined && !('rgb' in $$props || $$self.$$.bound[$$self.$$.props['rgb']])) {
    			console.warn("<TextInput> was created without expected prop 'rgb'");
    		}

    		if (hsv === undefined && !('hsv' in $$props || $$self.$$.bound[$$self.$$.props['hsv']])) {
    			console.warn("<TextInput> was created without expected prop 'hsv'");
    		}

    		if (hex === undefined && !('hex' in $$props || $$self.$$.bound[$$self.$$.props['hex']])) {
    			console.warn("<TextInput> was created without expected prop 'hex'");
    		}

    		if (canChangeMode === undefined && !('canChangeMode' in $$props || $$self.$$.bound[$$self.$$.props['canChangeMode']])) {
    			console.warn("<TextInput> was created without expected prop 'canChangeMode'");
    		}
    	});

    	const writable_props = ['isAlpha', 'rgb', 'hsv', 'hex', 'canChangeMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextInput> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(4, mode = (mode + 1) % 3);

    	$$self.$$set = $$props => {
    		if ('isAlpha' in $$props) $$invalidate(2, isAlpha = $$props.isAlpha);
    		if ('rgb' in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ('hsv' in $$props) $$invalidate(13, hsv = $$props.hsv);
    		if ('hex' in $$props) $$invalidate(1, hex = $$props.hex);
    		if ('canChangeMode' in $$props) $$invalidate(3, canChangeMode = $$props.canChangeMode);
    	};

    	$$self.$capture_state = () => ({
    		isAlpha,
    		rgb,
    		hsv,
    		hex,
    		canChangeMode,
    		HEX_COLOR_REGEX,
    		modes,
    		mode,
    		updateHex,
    		updateRgb,
    		updateHsv,
    		a,
    		v,
    		s,
    		h
    	});

    	$$self.$inject_state = $$props => {
    		if ('isAlpha' in $$props) $$invalidate(2, isAlpha = $$props.isAlpha);
    		if ('rgb' in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ('hsv' in $$props) $$invalidate(13, hsv = $$props.hsv);
    		if ('hex' in $$props) $$invalidate(1, hex = $$props.hex);
    		if ('canChangeMode' in $$props) $$invalidate(3, canChangeMode = $$props.canChangeMode);
    		if ('mode' in $$props) $$invalidate(4, mode = $$props.mode);
    		if ('a' in $$props) $$invalidate(5, a = $$props.a);
    		if ('v' in $$props) $$invalidate(6, v = $$props.v);
    		if ('s' in $$props) $$invalidate(7, s = $$props.s);
    		if ('h' in $$props) $$invalidate(8, h = $$props.h);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*hsv*/ 8192) {
    			$$invalidate(8, h = Math.round(hsv.h));
    		}

    		if ($$self.$$.dirty & /*hsv*/ 8192) {
    			$$invalidate(7, s = Math.round(hsv.s));
    		}

    		if ($$self.$$.dirty & /*hsv*/ 8192) {
    			$$invalidate(6, v = Math.round(hsv.v));
    		}

    		if ($$self.$$.dirty & /*hsv*/ 8192) {
    			$$invalidate(5, a = hsv.a === undefined ? 1 : Math.round(hsv.a * 100) / 100);
    		}
    	};

    	return [
    		rgb,
    		hex,
    		isAlpha,
    		canChangeMode,
    		mode,
    		a,
    		v,
    		s,
    		h,
    		modes,
    		updateHex,
    		updateRgb,
    		updateHsv,
    		hsv,
    		click_handler
    	];
    }

    class TextInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			isAlpha: 2,
    			rgb: 0,
    			hsv: 13,
    			hex: 1,
    			canChangeMode: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextInput",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get isAlpha() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAlpha(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rgb() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rgb(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hsv() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hsv(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canChangeMode() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canChangeMode(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/SliderIndicator.svelte generated by Svelte v3.54.0 */

    const file$c = "node_modules/svelte-awesome-color-picker/components/variant/default/SliderIndicator.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "slider-indicator svelte-bosz7h");
    			attr_dev(div, "style", div_style_value = `top: calc(${/*pos*/ ctx[0] / 200 * 186}% + 2px);`);
    			add_location(div, file$c, 5, 0, 93);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pos*/ 1 && div_style_value !== (div_style_value = `top: calc(${/*pos*/ ctx[0] / 200 * 186}% + 2px);`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SliderIndicator', slots, []);
    	let { pos } = $$props;
    	let { toRight } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (pos === undefined && !('pos' in $$props || $$self.$$.bound[$$self.$$.props['pos']])) {
    			console.warn("<SliderIndicator> was created without expected prop 'pos'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<SliderIndicator> was created without expected prop 'toRight'");
    		}
    	});

    	const writable_props = ['pos', 'toRight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SliderIndicator> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('toRight' in $$props) $$invalidate(1, toRight = $$props.toRight);
    	};

    	$$self.$capture_state = () => ({ pos, toRight });

    	$$self.$inject_state = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('toRight' in $$props) $$invalidate(1, toRight = $$props.toRight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pos, toRight];
    }

    class SliderIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { pos: 0, toRight: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SliderIndicator",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get pos() {
    		throw new Error("<SliderIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pos(value) {
    		throw new Error("<SliderIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<SliderIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<SliderIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/PickerIndicator.svelte generated by Svelte v3.54.0 */

    const file$b = "node_modules/svelte-awesome-color-picker/components/variant/default/PickerIndicator.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "picker-indicator svelte-298zmp");
    			attr_dev(div, "style", div_style_value = `left: calc(${/*pos*/ ctx[0].x / 200 * 186}% + 2px); top: calc(${/*pos*/ ctx[0].y / 200 * 186}% + 2px); box-shadow: 0 0 4px ${/*isDark*/ ctx[1] ? 'white' : 'black'};`);
    			add_location(div, file$b, 6, 0, 108);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pos, isDark*/ 3 && div_style_value !== (div_style_value = `left: calc(${/*pos*/ ctx[0].x / 200 * 186}% + 2px); top: calc(${/*pos*/ ctx[0].y / 200 * 186}% + 2px); box-shadow: 0 0 4px ${/*isDark*/ ctx[1] ? 'white' : 'black'};`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PickerIndicator', slots, []);
    	let { pos } = $$props;
    	let { hex } = $$props;
    	let { isDark } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (pos === undefined && !('pos' in $$props || $$self.$$.bound[$$self.$$.props['pos']])) {
    			console.warn("<PickerIndicator> was created without expected prop 'pos'");
    		}

    		if (hex === undefined && !('hex' in $$props || $$self.$$.bound[$$self.$$.props['hex']])) {
    			console.warn("<PickerIndicator> was created without expected prop 'hex'");
    		}

    		if (isDark === undefined && !('isDark' in $$props || $$self.$$.bound[$$self.$$.props['isDark']])) {
    			console.warn("<PickerIndicator> was created without expected prop 'isDark'");
    		}
    	});

    	const writable_props = ['pos', 'hex', 'isDark'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PickerIndicator> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('isDark' in $$props) $$invalidate(1, isDark = $$props.isDark);
    	};

    	$$self.$capture_state = () => ({ pos, hex, isDark });

    	$$self.$inject_state = $$props => {
    		if ('pos' in $$props) $$invalidate(0, pos = $$props.pos);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('isDark' in $$props) $$invalidate(1, isDark = $$props.isDark);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pos, isDark, hex];
    }

    class PickerIndicator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { pos: 0, hex: 2, isDark: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PickerIndicator",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get pos() {
    		throw new Error("<PickerIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pos(value) {
    		throw new Error("<PickerIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<PickerIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<PickerIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDark() {
    		throw new Error("<PickerIndicator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDark(value) {
    		throw new Error("<PickerIndicator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/ArrowKeyHandler.svelte generated by Svelte v3.54.0 */

    function create_fragment$c(ctx) {
    	let mounted;
    	let dispose;

    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keyup", /*keyup*/ ctx[0], false, false, false),
    					listen_dev(window, "keydown", /*keydown*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $keyPressed;
    	validate_store(keyPressed, 'keyPressed');
    	component_subscribe($$self, keyPressed, $$value => $$invalidate(2, $keyPressed = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ArrowKeyHandler', slots, []);

    	function keyup(e) {
    		if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
    			set_store_value(keyPressed, $keyPressed[e.key] = 0, $keyPressed);
    			keyPressed.set($keyPressed);
    		}
    	}

    	function keydown(e) {
    		if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
    			if (!e.repeat) {
    				set_store_value(keyPressed, $keyPressed[e.key] = 1, $keyPressed);
    				keyPressed.set($keyPressed);
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ArrowKeyHandler> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ keyPressed, keyup, keydown, $keyPressed });
    	return [keyup, keydown];
    }

    class ArrowKeyHandler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArrowKeyHandler",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/PickerWrapper.svelte generated by Svelte v3.54.0 */

    const file$a = "node_modules/svelte-awesome-color-picker/components/variant/default/PickerWrapper.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "picker-wrapper svelte-1vr4c0x");
    			toggle_class(div, "focused", /*focused*/ ctx[0]);
    			add_location(div, file$a, 5, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*focused*/ 1) {
    				toggle_class(div, "focused", /*focused*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PickerWrapper', slots, ['default']);
    	let { focused } = $$props;
    	let { toRight } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (focused === undefined && !('focused' in $$props || $$self.$$.bound[$$self.$$.props['focused']])) {
    			console.warn("<PickerWrapper> was created without expected prop 'focused'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<PickerWrapper> was created without expected prop 'toRight'");
    		}
    	});

    	const writable_props = ['focused', 'toRight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PickerWrapper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('focused' in $$props) $$invalidate(0, focused = $$props.focused);
    		if ('toRight' in $$props) $$invalidate(1, toRight = $$props.toRight);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ focused, toRight });

    	$$self.$inject_state = $$props => {
    		if ('focused' in $$props) $$invalidate(0, focused = $$props.focused);
    		if ('toRight' in $$props) $$invalidate(1, toRight = $$props.toRight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [focused, toRight, $$scope, slots];
    }

    class PickerWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { focused: 0, toRight: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PickerWrapper",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get focused() {
    		throw new Error("<PickerWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<PickerWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<PickerWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<PickerWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/SliderWrapper.svelte generated by Svelte v3.54.0 */

    const file$9 = "node_modules/svelte-awesome-color-picker/components/variant/default/SliderWrapper.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "slider-wrapper svelte-1r2f1mj");
    			toggle_class(div, "focused", /*focused*/ ctx[0]);
    			add_location(div, file$9, 5, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*focused*/ 1) {
    				toggle_class(div, "focused", /*focused*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SliderWrapper', slots, ['default']);
    	let { focused } = $$props;
    	let { toRight } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (focused === undefined && !('focused' in $$props || $$self.$$.bound[$$self.$$.props['focused']])) {
    			console.warn("<SliderWrapper> was created without expected prop 'focused'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<SliderWrapper> was created without expected prop 'toRight'");
    		}
    	});

    	const writable_props = ['focused', 'toRight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SliderWrapper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('focused' in $$props) $$invalidate(0, focused = $$props.focused);
    		if ('toRight' in $$props) $$invalidate(1, toRight = $$props.toRight);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ focused, toRight });

    	$$self.$inject_state = $$props => {
    		if ('focused' in $$props) $$invalidate(0, focused = $$props.focused);
    		if ('toRight' in $$props) $$invalidate(1, toRight = $$props.toRight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [focused, toRight, $$scope, slots];
    }

    class SliderWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { focused: 0, toRight: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SliderWrapper",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get focused() {
    		throw new Error("<SliderWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focused(value) {
    		throw new Error("<SliderWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<SliderWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<SliderWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/Input.svelte generated by Svelte v3.54.0 */

    const file$8 = "node_modules/svelte-awesome-color-picker/components/variant/default/Input.svelte";

    function create_fragment$9(ctx) {
    	let label_1;
    	let div;
    	let input;
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "type", "color");
    			input.value = /*hex*/ ctx[1];
    			attr_dev(input, "aria-haspopup", "dialog");
    			attr_dev(input, "class", "svelte-a1g5oc");
    			add_location(input, file$8, 9, 2, 177);
    			attr_dev(div, "class", "svelte-a1g5oc");
    			add_location(div, file$8, 8, 1, 169);
    			attr_dev(label_1, "class", "svelte-a1g5oc");
    			add_location(label_1, file$8, 7, 0, 135);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, div);
    			append_dev(div, input);
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			/*label_1_binding*/ ctx[4](label_1);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hex*/ 2) {
    				prop_dev(input, "value", /*hex*/ ctx[1]);
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*label_1_binding*/ ctx[4](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = () => {
    	
    }; /**/

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, []);
    	let { labelWrapper } = $$props;
    	let { hex } = $$props;
    	let { label } = $$props;
    	let { isOpen } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (labelWrapper === undefined && !('labelWrapper' in $$props || $$self.$$.bound[$$self.$$.props['labelWrapper']])) {
    			console.warn("<Input> was created without expected prop 'labelWrapper'");
    		}

    		if (hex === undefined && !('hex' in $$props || $$self.$$.bound[$$self.$$.props['hex']])) {
    			console.warn("<Input> was created without expected prop 'hex'");
    		}

    		if (label === undefined && !('label' in $$props || $$self.$$.bound[$$self.$$.props['label']])) {
    			console.warn("<Input> was created without expected prop 'label'");
    		}

    		if (isOpen === undefined && !('isOpen' in $$props || $$self.$$.bound[$$self.$$.props['isOpen']])) {
    			console.warn("<Input> was created without expected prop 'isOpen'");
    		}
    	});

    	const writable_props = ['labelWrapper', 'hex', 'label', 'isOpen'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function label_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			labelWrapper = $$value;
    			$$invalidate(0, labelWrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('labelWrapper' in $$props) $$invalidate(0, labelWrapper = $$props.labelWrapper);
    		if ('hex' in $$props) $$invalidate(1, hex = $$props.hex);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('isOpen' in $$props) $$invalidate(3, isOpen = $$props.isOpen);
    	};

    	$$self.$capture_state = () => ({ labelWrapper, hex, label, isOpen });

    	$$self.$inject_state = $$props => {
    		if ('labelWrapper' in $$props) $$invalidate(0, labelWrapper = $$props.labelWrapper);
    		if ('hex' in $$props) $$invalidate(1, hex = $$props.hex);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('isOpen' in $$props) $$invalidate(3, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [labelWrapper, hex, label, isOpen, label_1_binding];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			labelWrapper: 0,
    			hex: 1,
    			label: 2,
    			isOpen: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get labelWrapper() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelWrapper(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/Wrapper.svelte generated by Svelte v3.54.0 */

    const file$7 = "node_modules/svelte-awesome-color-picker/components/variant/default/Wrapper.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let div_role_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "wrapper svelte-19cwu6x");
    			attr_dev(div, "role", div_role_value = /*isPopup*/ ctx[2] ? 'dialog' : undefined);
    			attr_dev(div, "aria-label", "color picker");
    			toggle_class(div, "isOpen", /*isOpen*/ ctx[1]);
    			toggle_class(div, "isPopup", /*isPopup*/ ctx[2]);
    			add_location(div, file$7, 7, 0, 136);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[6](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*isPopup*/ 4 && div_role_value !== (div_role_value = /*isPopup*/ ctx[2] ? 'dialog' : undefined)) {
    				attr_dev(div, "role", div_role_value);
    			}

    			if (!current || dirty & /*isOpen*/ 2) {
    				toggle_class(div, "isOpen", /*isOpen*/ ctx[1]);
    			}

    			if (!current || dirty & /*isPopup*/ 4) {
    				toggle_class(div, "isPopup", /*isPopup*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wrapper', slots, ['default']);
    	let { wrapper } = $$props;
    	let { isOpen } = $$props;
    	let { isPopup } = $$props;
    	let { toRight } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (wrapper === undefined && !('wrapper' in $$props || $$self.$$.bound[$$self.$$.props['wrapper']])) {
    			console.warn("<Wrapper> was created without expected prop 'wrapper'");
    		}

    		if (isOpen === undefined && !('isOpen' in $$props || $$self.$$.bound[$$self.$$.props['isOpen']])) {
    			console.warn("<Wrapper> was created without expected prop 'isOpen'");
    		}

    		if (isPopup === undefined && !('isPopup' in $$props || $$self.$$.bound[$$self.$$.props['isPopup']])) {
    			console.warn("<Wrapper> was created without expected prop 'isPopup'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<Wrapper> was created without expected prop 'toRight'");
    		}
    	});

    	const writable_props = ['wrapper', 'isOpen', 'isPopup', 'toRight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wrapper> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrapper = $$value;
    			$$invalidate(0, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('wrapper' in $$props) $$invalidate(0, wrapper = $$props.wrapper);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('isPopup' in $$props) $$invalidate(2, isPopup = $$props.isPopup);
    		if ('toRight' in $$props) $$invalidate(3, toRight = $$props.toRight);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ wrapper, isOpen, isPopup, toRight });

    	$$self.$inject_state = $$props => {
    		if ('wrapper' in $$props) $$invalidate(0, wrapper = $$props.wrapper);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('isPopup' in $$props) $$invalidate(2, isPopup = $$props.isPopup);
    		if ('toRight' in $$props) $$invalidate(3, toRight = $$props.toRight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wrapper, isOpen, isPopup, toRight, $$scope, slots, div_binding];
    }

    class Wrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			wrapper: 0,
    			isOpen: 1,
    			isPopup: 2,
    			toRight: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrapper",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get wrapper() {
    		throw new Error("<Wrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapper(value) {
    		throw new Error("<Wrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<Wrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Wrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isPopup() {
    		throw new Error("<Wrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPopup(value) {
    		throw new Error("<Wrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<Wrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<Wrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/A11yNotice.svelte generated by Svelte v3.54.0 */

    const file$6 = "node_modules/svelte-awesome-color-picker/components/variant/default/A11yNotice.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].hex;
    	child_ctx[9] = list[i].placeholder;
    	child_ctx[10] = list[i].reverse;
    	child_ctx[11] = list[i].size;
    	return child_ctx;
    }

    // (16:2) {#each a11yColors as { hex: a11yHex, placeholder, reverse, size }}
    function create_each_block$1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*components*/ ctx[0].a11ySingleNotice;

    	function switch_props(ctx) {
    		return {
    			props: {
    				contrast: /*color*/ ctx[3]?.contrast(/*a11yHex*/ ctx[8]),
    				textColor: /*reverse*/ ctx[10]
    				? /*a11yHex*/ ctx[8]
    				: /*hex*/ ctx[2],
    				bgColor: /*reverse*/ ctx[10]
    				? /*hex*/ ctx[2]
    				: /*a11yHex*/ ctx[8],
    				ph: /*placeholder*/ ctx[9],
    				size: /*size*/ ctx[11]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*color, a11yColors*/ 10) switch_instance_changes.contrast = /*color*/ ctx[3]?.contrast(/*a11yHex*/ ctx[8]);

    			if (dirty & /*a11yColors, hex*/ 6) switch_instance_changes.textColor = /*reverse*/ ctx[10]
    			? /*a11yHex*/ ctx[8]
    			: /*hex*/ ctx[2];

    			if (dirty & /*a11yColors, hex*/ 6) switch_instance_changes.bgColor = /*reverse*/ ctx[10]
    			? /*hex*/ ctx[2]
    			: /*a11yHex*/ ctx[8];

    			if (dirty & /*a11yColors*/ 2) switch_instance_changes.ph = /*placeholder*/ ctx[9];
    			if (dirty & /*a11yColors*/ 2) switch_instance_changes.size = /*size*/ ctx[11];

    			if (switch_value !== (switch_value = /*components*/ ctx[0].a11ySingleNotice)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(16:2) {#each a11yColors as { hex: a11yHex, placeholder, reverse, size }}",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if a11yGuidelines}
    function create_if_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "svelte-1p7g2tm");
    			add_location(span, file$6, 26, 3, 762);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = /*a11yGuidelines*/ ctx[4];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*a11yGuidelines*/ 16) span.innerHTML = /*a11yGuidelines*/ ctx[4];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(26:2) {#if a11yGuidelines}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let details;
    	let summary;
    	let switch_instance;
    	let summary_tabindex_value;
    	let t0;
    	let div;
    	let t1;
    	let details_class_value;
    	let current;
    	var switch_value = /*components*/ ctx[0].a11ySummary;

    	function switch_props(ctx) {
    		return {
    			props: {
    				a11yColors: /*a11yColors*/ ctx[1],
    				hex: /*hex*/ ctx[2]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	let each_value = /*a11yColors*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*a11yGuidelines*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			details = element("details");
    			summary = element("summary");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t0 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(summary, "tabindex", summary_tabindex_value = /*closable*/ ctx[6] ? -1 : undefined);
    			attr_dev(summary, "class", "svelte-1p7g2tm");
    			add_location(summary, file$6, 11, 1, 303);
    			attr_dev(div, "class", "svelte-1p7g2tm");
    			add_location(div, file$6, 14, 1, 435);
    			attr_dev(details, "class", details_class_value = "a11y-notice " + (/*closable*/ ctx[6] ? 'not-closable' : '') + " svelte-1p7g2tm");
    			details.open = /*isA11yOpen*/ ctx[5];
    			add_location(details, file$6, 10, 0, 221);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, details, anchor);
    			append_dev(details, summary);
    			if (switch_instance) mount_component(switch_instance, summary, null);
    			append_dev(details, t0);
    			append_dev(details, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = {};
    			if (dirty & /*a11yColors*/ 2) switch_instance_changes.a11yColors = /*a11yColors*/ ctx[1];
    			if (dirty & /*hex*/ 4) switch_instance_changes.hex = /*hex*/ ctx[2];

    			if (switch_value !== (switch_value = /*components*/ ctx[0].a11ySummary)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, summary, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*closable*/ 64 && summary_tabindex_value !== (summary_tabindex_value = /*closable*/ ctx[6] ? -1 : undefined)) {
    				attr_dev(summary, "tabindex", summary_tabindex_value);
    			}

    			if (dirty & /*components, color, a11yColors, hex*/ 15) {
    				each_value = /*a11yColors*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, t1);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*a11yGuidelines*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*closable*/ 64 && details_class_value !== (details_class_value = "a11y-notice " + (/*closable*/ ctx[6] ? 'not-closable' : '') + " svelte-1p7g2tm")) {
    				attr_dev(details, "class", details_class_value);
    			}

    			if (!current || dirty & /*isA11yOpen*/ 32) {
    				prop_dev(details, "open", /*isA11yOpen*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(details);
    			if (switch_instance) destroy_component(switch_instance);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let closable;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('A11yNotice', slots, []);
    	let { components } = $$props;
    	let { a11yColors } = $$props;
    	let { hex } = $$props;
    	let { color } = $$props;
    	let { a11yGuidelines } = $$props;
    	let { isA11yOpen } = $$props;
    	let { isA11yClosable } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (components === undefined && !('components' in $$props || $$self.$$.bound[$$self.$$.props['components']])) {
    			console.warn("<A11yNotice> was created without expected prop 'components'");
    		}

    		if (a11yColors === undefined && !('a11yColors' in $$props || $$self.$$.bound[$$self.$$.props['a11yColors']])) {
    			console.warn("<A11yNotice> was created without expected prop 'a11yColors'");
    		}

    		if (hex === undefined && !('hex' in $$props || $$self.$$.bound[$$self.$$.props['hex']])) {
    			console.warn("<A11yNotice> was created without expected prop 'hex'");
    		}

    		if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
    			console.warn("<A11yNotice> was created without expected prop 'color'");
    		}

    		if (a11yGuidelines === undefined && !('a11yGuidelines' in $$props || $$self.$$.bound[$$self.$$.props['a11yGuidelines']])) {
    			console.warn("<A11yNotice> was created without expected prop 'a11yGuidelines'");
    		}

    		if (isA11yOpen === undefined && !('isA11yOpen' in $$props || $$self.$$.bound[$$self.$$.props['isA11yOpen']])) {
    			console.warn("<A11yNotice> was created without expected prop 'isA11yOpen'");
    		}

    		if (isA11yClosable === undefined && !('isA11yClosable' in $$props || $$self.$$.bound[$$self.$$.props['isA11yClosable']])) {
    			console.warn("<A11yNotice> was created without expected prop 'isA11yClosable'");
    		}
    	});

    	const writable_props = [
    		'components',
    		'a11yColors',
    		'hex',
    		'color',
    		'a11yGuidelines',
    		'isA11yOpen',
    		'isA11yClosable'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<A11yNotice> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('components' in $$props) $$invalidate(0, components = $$props.components);
    		if ('a11yColors' in $$props) $$invalidate(1, a11yColors = $$props.a11yColors);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('a11yGuidelines' in $$props) $$invalidate(4, a11yGuidelines = $$props.a11yGuidelines);
    		if ('isA11yOpen' in $$props) $$invalidate(5, isA11yOpen = $$props.isA11yOpen);
    		if ('isA11yClosable' in $$props) $$invalidate(7, isA11yClosable = $$props.isA11yClosable);
    	};

    	$$self.$capture_state = () => ({
    		components,
    		a11yColors,
    		hex,
    		color,
    		a11yGuidelines,
    		isA11yOpen,
    		isA11yClosable,
    		closable
    	});

    	$$self.$inject_state = $$props => {
    		if ('components' in $$props) $$invalidate(0, components = $$props.components);
    		if ('a11yColors' in $$props) $$invalidate(1, a11yColors = $$props.a11yColors);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('a11yGuidelines' in $$props) $$invalidate(4, a11yGuidelines = $$props.a11yGuidelines);
    		if ('isA11yOpen' in $$props) $$invalidate(5, isA11yOpen = $$props.isA11yOpen);
    		if ('isA11yClosable' in $$props) $$invalidate(7, isA11yClosable = $$props.isA11yClosable);
    		if ('closable' in $$props) $$invalidate(6, closable = $$props.closable);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isA11yOpen, isA11yClosable*/ 160) {
    			$$invalidate(6, closable = isA11yOpen && !isA11yClosable);
    		}
    	};

    	return [
    		components,
    		a11yColors,
    		hex,
    		color,
    		a11yGuidelines,
    		isA11yOpen,
    		closable,
    		isA11yClosable
    	];
    }

    class A11yNotice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			components: 0,
    			a11yColors: 1,
    			hex: 2,
    			color: 3,
    			a11yGuidelines: 4,
    			isA11yOpen: 5,
    			isA11yClosable: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "A11yNotice",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get components() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11yColors() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11yColors(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11yGuidelines() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11yGuidelines(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isA11yOpen() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isA11yOpen(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isA11yClosable() {
    		throw new Error("<A11yNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isA11yClosable(value) {
    		throw new Error("<A11yNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/A11ySingleNotice.svelte generated by Svelte v3.54.0 */

    const file$5 = "node_modules/svelte-awesome-color-picker/components/variant/default/A11ySingleNotice.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let p0;
    	let t0_value = (/*ph*/ ctx[2] || 'Lorem Ipsum') + "";
    	let t0;
    	let p0_class_value;
    	let t1;
    	let div0;
    	let p1;
    	let t2;

    	let t3_value = (/*contrast*/ ctx[3] >= 10
    	? /*contrast*/ ctx[3].toFixed(1)
    	: /*contrast*/ ctx[3]) + "";

    	let t3;
    	let t4;
    	let span0;
    	let t6;
    	let span1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			p1 = element("p");
    			t2 = text("contrast: ");
    			t3 = text(t3_value);
    			t4 = space();
    			span0 = element("span");
    			span0.textContent = "AA";
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "AAA";
    			attr_dev(p0, "class", p0_class_value = "lorem " + (/*size*/ ctx[4] === 'large' && 'large') + " svelte-396htm");
    			set_style(p0, "color", /*textColor*/ ctx[0]);
    			set_style(p0, "background-color", /*bgColor*/ ctx[1]);
    			add_location(p0, file$5, 8, 1, 176);
    			attr_dev(p1, "class", "svelte-396htm");
    			add_location(p1, file$5, 15, 2, 339);
    			attr_dev(span0, "class", "grade svelte-396htm");
    			toggle_class(span0, "grade-ok", /*contrast*/ ctx[3] > (/*size*/ ctx[4] === 'large' ? 3 : 4.5));
    			add_location(span0, file$5, 16, 2, 408);
    			attr_dev(span1, "class", "grade svelte-396htm");
    			toggle_class(span1, "grade-ok", /*contrast*/ ctx[3] > (/*size*/ ctx[4] === 'large' ? 4.5 : 7));
    			add_location(span1, file$5, 17, 2, 497);
    			attr_dev(div0, "class", "score svelte-396htm");
    			add_location(div0, file$5, 14, 1, 317);
    			attr_dev(div1, "class", "a11y-single-notice svelte-396htm");
    			add_location(div1, file$5, 7, 0, 142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p1);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, span0);
    			append_dev(div0, t6);
    			append_dev(div0, span1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ph*/ 4 && t0_value !== (t0_value = (/*ph*/ ctx[2] || 'Lorem Ipsum') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*size*/ 16 && p0_class_value !== (p0_class_value = "lorem " + (/*size*/ ctx[4] === 'large' && 'large') + " svelte-396htm")) {
    				attr_dev(p0, "class", p0_class_value);
    			}

    			if (dirty & /*textColor*/ 1) {
    				set_style(p0, "color", /*textColor*/ ctx[0]);
    			}

    			if (dirty & /*bgColor*/ 2) {
    				set_style(p0, "background-color", /*bgColor*/ ctx[1]);
    			}

    			if (dirty & /*contrast*/ 8 && t3_value !== (t3_value = (/*contrast*/ ctx[3] >= 10
    			? /*contrast*/ ctx[3].toFixed(1)
    			: /*contrast*/ ctx[3]) + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*contrast, size*/ 24) {
    				toggle_class(span0, "grade-ok", /*contrast*/ ctx[3] > (/*size*/ ctx[4] === 'large' ? 3 : 4.5));
    			}

    			if (dirty & /*contrast, size*/ 24) {
    				toggle_class(span1, "grade-ok", /*contrast*/ ctx[3] > (/*size*/ ctx[4] === 'large' ? 4.5 : 7));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('A11ySingleNotice', slots, []);
    	let { textColor } = $$props;
    	let { bgColor } = $$props;
    	let { ph = undefined } = $$props;
    	let { contrast = 1 } = $$props;
    	let { size = undefined } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (textColor === undefined && !('textColor' in $$props || $$self.$$.bound[$$self.$$.props['textColor']])) {
    			console.warn("<A11ySingleNotice> was created without expected prop 'textColor'");
    		}

    		if (bgColor === undefined && !('bgColor' in $$props || $$self.$$.bound[$$self.$$.props['bgColor']])) {
    			console.warn("<A11ySingleNotice> was created without expected prop 'bgColor'");
    		}
    	});

    	const writable_props = ['textColor', 'bgColor', 'ph', 'contrast', 'size'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<A11ySingleNotice> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('textColor' in $$props) $$invalidate(0, textColor = $$props.textColor);
    		if ('bgColor' in $$props) $$invalidate(1, bgColor = $$props.bgColor);
    		if ('ph' in $$props) $$invalidate(2, ph = $$props.ph);
    		if ('contrast' in $$props) $$invalidate(3, contrast = $$props.contrast);
    		if ('size' in $$props) $$invalidate(4, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ textColor, bgColor, ph, contrast, size });

    	$$self.$inject_state = $$props => {
    		if ('textColor' in $$props) $$invalidate(0, textColor = $$props.textColor);
    		if ('bgColor' in $$props) $$invalidate(1, bgColor = $$props.bgColor);
    		if ('ph' in $$props) $$invalidate(2, ph = $$props.ph);
    		if ('contrast' in $$props) $$invalidate(3, contrast = $$props.contrast);
    		if ('size' in $$props) $$invalidate(4, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [textColor, bgColor, ph, contrast, size];
    }

    class A11ySingleNotice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			textColor: 0,
    			bgColor: 1,
    			ph: 2,
    			contrast: 3,
    			size: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "A11ySingleNotice",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get textColor() {
    		throw new Error("<A11ySingleNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<A11ySingleNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<A11ySingleNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<A11ySingleNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ph() {
    		throw new Error("<A11ySingleNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ph(value) {
    		throw new Error("<A11ySingleNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contrast() {
    		throw new Error("<A11ySingleNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contrast(value) {
    		throw new Error("<A11ySingleNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<A11ySingleNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<A11ySingleNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/variant/default/A11ySummary.svelte generated by Svelte v3.54.0 */

    function create_fragment$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*message*/ ctx[0]);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*message*/ 1) set_data_dev(t, /*message*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getNumberOfGradeFailed({ contrast, size }) {
    	if (!contrast) {
    		return 2;
    	}

    	if (size === 'large') {
    		return contrast < 3 ? 2 : contrast < 4.5 ? 1 : 0;
    	} else {
    		return contrast < 4.5 ? 2 : contrast < 7 ? 1 : 0;
    	}
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let count;
    	let message;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('A11ySummary', slots, []);
    	let { a11yColors } = $$props;
    	let { hex } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (a11yColors === undefined && !('a11yColors' in $$props || $$self.$$.bound[$$self.$$.props['a11yColors']])) {
    			console.warn("<A11ySummary> was created without expected prop 'a11yColors'");
    		}

    		if (hex === undefined && !('hex' in $$props || $$self.$$.bound[$$self.$$.props['hex']])) {
    			console.warn("<A11ySummary> was created without expected prop 'hex'");
    		}
    	});

    	const writable_props = ['a11yColors', 'hex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<A11ySummary> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('a11yColors' in $$props) $$invalidate(1, a11yColors = $$props.a11yColors);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    	};

    	$$self.$capture_state = () => ({
    		a11yColors,
    		hex,
    		getNumberOfGradeFailed,
    		count,
    		message
    	});

    	$$self.$inject_state = $$props => {
    		if ('a11yColors' in $$props) $$invalidate(1, a11yColors = $$props.a11yColors);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('count' in $$props) $$invalidate(3, count = $$props.count);
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*a11yColors*/ 2) {
    			$$invalidate(3, count = a11yColors.map(getNumberOfGradeFailed).reduce((acc, c) => acc + c));
    		}

    		if ($$self.$$.dirty & /*count*/ 8) {
    			$$invalidate(0, message = count
    			? `⚠️ ${count} contrast grade${count && 's'} fail`
    			: 'Contrast grade information');
    		}
    	};

    	return [message, a11yColors, hex, count];
    }

    class A11ySummary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { a11yColors: 1, hex: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "A11ySummary",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get a11yColors() {
    		throw new Error("<A11ySummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11yColors(value) {
    		throw new Error("<A11ySummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<A11ySummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<A11ySummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome-color-picker/components/ColorPicker.svelte generated by Svelte v3.54.0 */

    const { Object: Object_1 } = globals;
    const file$4 = "node_modules/svelte-awesome-color-picker/components/ColorPicker.svelte";

    // (159:1) {:else}
    function create_else_block(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "hidden");
    			input.value = /*hex*/ ctx[2];
    			add_location(input, file$4, 159, 2, 4981);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hex*/ 4) {
    				prop_dev(input, "value", /*hex*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(159:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (157:1) {#if isInput}
    function create_if_block_3(ctx) {
    	let switch_instance;
    	let updating_labelWrapper;
    	let updating_isOpen;
    	let switch_instance_anchor;
    	let current;

    	function switch_instance_labelWrapper_binding(value) {
    		/*switch_instance_labelWrapper_binding*/ ctx[26](value);
    	}

    	function switch_instance_isOpen_binding(value) {
    		/*switch_instance_isOpen_binding*/ ctx[27](value);
    	}

    	var switch_value = /*getComponents*/ ctx[21]().input;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			hex: /*hex*/ ctx[2],
    			label: /*label*/ ctx[6]
    		};

    		if (/*labelWrapper*/ ctx[19] !== void 0) {
    			switch_instance_props.labelWrapper = /*labelWrapper*/ ctx[19];
    		}

    		if (/*isOpen*/ ctx[3] !== void 0) {
    			switch_instance_props.isOpen = /*isOpen*/ ctx[3];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'labelWrapper', switch_instance_labelWrapper_binding, /*labelWrapper*/ ctx[19]));
    		binding_callbacks.push(() => bind(switch_instance, 'isOpen', switch_instance_isOpen_binding, /*isOpen*/ ctx[3]));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*hex*/ 4) switch_instance_changes.hex = /*hex*/ ctx[2];
    			if (dirty[0] & /*label*/ 64) switch_instance_changes.label = /*label*/ ctx[6];

    			if (!updating_labelWrapper && dirty[0] & /*labelWrapper*/ 524288) {
    				updating_labelWrapper = true;
    				switch_instance_changes.labelWrapper = /*labelWrapper*/ ctx[19];
    				add_flush_callback(() => updating_labelWrapper = false);
    			}

    			if (!updating_isOpen && dirty[0] & /*isOpen*/ 8) {
    				updating_isOpen = true;
    				switch_instance_changes.isOpen = /*isOpen*/ ctx[3];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			if (switch_value !== (switch_value = /*getComponents*/ ctx[21]().input)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'labelWrapper', switch_instance_labelWrapper_binding, /*labelWrapper*/ ctx[19]));
    					binding_callbacks.push(() => bind(switch_instance, 'isOpen', switch_instance_isOpen_binding, /*isOpen*/ ctx[3]));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(157:1) {#if isInput}",
    		ctx
    	});

    	return block;
    }

    // (174:2) {#if isAlpha}
    function create_if_block_2(ctx) {
    	let alpha;
    	let updating_a;
    	let updating_isOpen;
    	let current;

    	function alpha_a_binding(value) {
    		/*alpha_a_binding*/ ctx[32](value);
    	}

    	function alpha_isOpen_binding(value) {
    		/*alpha_isOpen_binding*/ ctx[33](value);
    	}

    	let alpha_props = {
    		components: /*getComponents*/ ctx[21](),
    		hex: /*hex*/ ctx[2],
    		toRight: /*toRight*/ ctx[17]
    	};

    	if (/*hsv*/ ctx[1].a !== void 0) {
    		alpha_props.a = /*hsv*/ ctx[1].a;
    	}

    	if (/*isOpen*/ ctx[3] !== void 0) {
    		alpha_props.isOpen = /*isOpen*/ ctx[3];
    	}

    	alpha = new Alpha({ props: alpha_props, $$inline: true });
    	binding_callbacks.push(() => bind(alpha, 'a', alpha_a_binding, /*hsv*/ ctx[1].a));
    	binding_callbacks.push(() => bind(alpha, 'isOpen', alpha_isOpen_binding, /*isOpen*/ ctx[3]));

    	const block = {
    		c: function create() {
    			create_component(alpha.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(alpha, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const alpha_changes = {};
    			if (dirty[0] & /*hex*/ 4) alpha_changes.hex = /*hex*/ ctx[2];
    			if (dirty[0] & /*toRight*/ 131072) alpha_changes.toRight = /*toRight*/ ctx[17];

    			if (!updating_a && dirty[0] & /*hsv*/ 2) {
    				updating_a = true;
    				alpha_changes.a = /*hsv*/ ctx[1].a;
    				add_flush_callback(() => updating_a = false);
    			}

    			if (!updating_isOpen && dirty[0] & /*isOpen*/ 8) {
    				updating_isOpen = true;
    				alpha_changes.isOpen = /*isOpen*/ ctx[3];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			alpha.$set(alpha_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(alpha.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(alpha.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(alpha, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(174:2) {#if isAlpha}",
    		ctx
    	});

    	return block;
    }

    // (177:2) {#if isTextInput}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let updating_hex;
    	let updating_rgb;
    	let updating_hsv;
    	let switch_instance_anchor;
    	let current;

    	function switch_instance_hex_binding(value) {
    		/*switch_instance_hex_binding*/ ctx[34](value);
    	}

    	function switch_instance_rgb_binding(value) {
    		/*switch_instance_rgb_binding*/ ctx[35](value);
    	}

    	function switch_instance_hsv_binding(value) {
    		/*switch_instance_hsv_binding*/ ctx[36](value);
    	}

    	var switch_value = /*getComponents*/ ctx[21]().textInput;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			isAlpha: /*isAlpha*/ ctx[7],
    			canChangeMode: /*canChangeMode*/ ctx[10]
    		};

    		if (/*hex*/ ctx[2] !== void 0) {
    			switch_instance_props.hex = /*hex*/ ctx[2];
    		}

    		if (/*rgb*/ ctx[0] !== void 0) {
    			switch_instance_props.rgb = /*rgb*/ ctx[0];
    		}

    		if (/*hsv*/ ctx[1] !== void 0) {
    			switch_instance_props.hsv = /*hsv*/ ctx[1];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'hex', switch_instance_hex_binding, /*hex*/ ctx[2]));
    		binding_callbacks.push(() => bind(switch_instance, 'rgb', switch_instance_rgb_binding, /*rgb*/ ctx[0]));
    		binding_callbacks.push(() => bind(switch_instance, 'hsv', switch_instance_hsv_binding, /*hsv*/ ctx[1]));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*isAlpha*/ 128) switch_instance_changes.isAlpha = /*isAlpha*/ ctx[7];
    			if (dirty[0] & /*canChangeMode*/ 1024) switch_instance_changes.canChangeMode = /*canChangeMode*/ ctx[10];

    			if (!updating_hex && dirty[0] & /*hex*/ 4) {
    				updating_hex = true;
    				switch_instance_changes.hex = /*hex*/ ctx[2];
    				add_flush_callback(() => updating_hex = false);
    			}

    			if (!updating_rgb && dirty[0] & /*rgb*/ 1) {
    				updating_rgb = true;
    				switch_instance_changes.rgb = /*rgb*/ ctx[0];
    				add_flush_callback(() => updating_rgb = false);
    			}

    			if (!updating_hsv && dirty[0] & /*hsv*/ 2) {
    				updating_hsv = true;
    				switch_instance_changes.hsv = /*hsv*/ ctx[1];
    				add_flush_callback(() => updating_hsv = false);
    			}

    			if (switch_value !== (switch_value = /*getComponents*/ ctx[21]().textInput)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'hex', switch_instance_hex_binding, /*hex*/ ctx[2]));
    					binding_callbacks.push(() => bind(switch_instance, 'rgb', switch_instance_rgb_binding, /*rgb*/ ctx[0]));
    					binding_callbacks.push(() => bind(switch_instance, 'hsv', switch_instance_hsv_binding, /*hsv*/ ctx[1]));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(177:2) {#if isTextInput}",
    		ctx
    	});

    	return block;
    }

    // (187:2) {#if isA11y}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*getComponents*/ ctx[21]().a11yNotice;

    	function switch_props(ctx) {
    		return {
    			props: {
    				components: /*getComponents*/ ctx[21](),
    				a11yColors: /*a11yColors*/ ctx[12],
    				color: /*color*/ ctx[4],
    				hex: /*hex*/ ctx[2],
    				a11yGuidelines: /*a11yGuidelines*/ ctx[13],
    				isA11yOpen: /*isA11yOpen*/ ctx[14],
    				isA11yClosable: /*isA11yClosable*/ ctx[15]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*a11yColors*/ 4096) switch_instance_changes.a11yColors = /*a11yColors*/ ctx[12];
    			if (dirty[0] & /*color*/ 16) switch_instance_changes.color = /*color*/ ctx[4];
    			if (dirty[0] & /*hex*/ 4) switch_instance_changes.hex = /*hex*/ ctx[2];
    			if (dirty[0] & /*a11yGuidelines*/ 8192) switch_instance_changes.a11yGuidelines = /*a11yGuidelines*/ ctx[13];
    			if (dirty[0] & /*isA11yOpen*/ 16384) switch_instance_changes.isA11yOpen = /*isA11yOpen*/ ctx[14];
    			if (dirty[0] & /*isA11yClosable*/ 32768) switch_instance_changes.isA11yClosable = /*isA11yClosable*/ ctx[15];

    			if (switch_value !== (switch_value = /*getComponents*/ ctx[21]().a11yNotice)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(187:2) {#if isA11y}",
    		ctx
    	});

    	return block;
    }

    // (163:1) <svelte:component this={getComponents().wrapper} bind:wrapper {isOpen} {isPopup} {toRight}>
    function create_default_slot(ctx) {
    	let picker;
    	let updating_s;
    	let updating_v;
    	let updating_isOpen;
    	let t0;
    	let slider;
    	let updating_h;
    	let t1;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;

    	function picker_s_binding(value) {
    		/*picker_s_binding*/ ctx[28](value);
    	}

    	function picker_v_binding(value) {
    		/*picker_v_binding*/ ctx[29](value);
    	}

    	function picker_isOpen_binding(value) {
    		/*picker_isOpen_binding*/ ctx[30](value);
    	}

    	let picker_props = {
    		components: /*getComponents*/ ctx[21](),
    		h: /*hsv*/ ctx[1].h,
    		toRight: /*toRight*/ ctx[17],
    		isDark: /*isDark*/ ctx[5]
    	};

    	if (/*hsv*/ ctx[1].s !== void 0) {
    		picker_props.s = /*hsv*/ ctx[1].s;
    	}

    	if (/*hsv*/ ctx[1].v !== void 0) {
    		picker_props.v = /*hsv*/ ctx[1].v;
    	}

    	if (/*isOpen*/ ctx[3] !== void 0) {
    		picker_props.isOpen = /*isOpen*/ ctx[3];
    	}

    	picker = new Picker({ props: picker_props, $$inline: true });
    	binding_callbacks.push(() => bind(picker, 's', picker_s_binding, /*hsv*/ ctx[1].s));
    	binding_callbacks.push(() => bind(picker, 'v', picker_v_binding, /*hsv*/ ctx[1].v));
    	binding_callbacks.push(() => bind(picker, 'isOpen', picker_isOpen_binding, /*isOpen*/ ctx[3]));

    	function slider_h_binding(value) {
    		/*slider_h_binding*/ ctx[31](value);
    	}

    	let slider_props = {
    		components: /*getComponents*/ ctx[21](),
    		toRight: /*toRight*/ ctx[17]
    	};

    	if (/*hsv*/ ctx[1].h !== void 0) {
    		slider_props.h = /*hsv*/ ctx[1].h;
    	}

    	slider = new Slider({ props: slider_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider, 'h', slider_h_binding, /*hsv*/ ctx[1].h));
    	let if_block0 = /*isAlpha*/ ctx[7] && create_if_block_2(ctx);
    	let if_block1 = /*isTextInput*/ ctx[9] && create_if_block_1(ctx);
    	let if_block2 = /*isA11y*/ ctx[11] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(picker.$$.fragment);
    			t0 = space();
    			create_component(slider.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(picker, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(slider, target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const picker_changes = {};
    			if (dirty[0] & /*hsv*/ 2) picker_changes.h = /*hsv*/ ctx[1].h;
    			if (dirty[0] & /*toRight*/ 131072) picker_changes.toRight = /*toRight*/ ctx[17];
    			if (dirty[0] & /*isDark*/ 32) picker_changes.isDark = /*isDark*/ ctx[5];

    			if (!updating_s && dirty[0] & /*hsv*/ 2) {
    				updating_s = true;
    				picker_changes.s = /*hsv*/ ctx[1].s;
    				add_flush_callback(() => updating_s = false);
    			}

    			if (!updating_v && dirty[0] & /*hsv*/ 2) {
    				updating_v = true;
    				picker_changes.v = /*hsv*/ ctx[1].v;
    				add_flush_callback(() => updating_v = false);
    			}

    			if (!updating_isOpen && dirty[0] & /*isOpen*/ 8) {
    				updating_isOpen = true;
    				picker_changes.isOpen = /*isOpen*/ ctx[3];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			picker.$set(picker_changes);
    			const slider_changes = {};
    			if (dirty[0] & /*toRight*/ 131072) slider_changes.toRight = /*toRight*/ ctx[17];

    			if (!updating_h && dirty[0] & /*hsv*/ 2) {
    				updating_h = true;
    				slider_changes.h = /*hsv*/ ctx[1].h;
    				add_flush_callback(() => updating_h = false);
    			}

    			slider.$set(slider_changes);

    			if (/*isAlpha*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*isAlpha*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isTextInput*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isTextInput*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*isA11y*/ ctx[11]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*isA11y*/ 2048) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(picker.$$.fragment, local);
    			transition_in(slider.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(picker.$$.fragment, local);
    			transition_out(slider.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(picker, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(slider, detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(163:1) <svelte:component this={getComponents().wrapper} bind:wrapper {isOpen} {isPopup} {toRight}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let arrowkeyhandler;
    	let t0;
    	let span_1;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let switch_instance;
    	let updating_wrapper;
    	let current;
    	let mounted;
    	let dispose;
    	arrowkeyhandler = new ArrowKeyHandler({ $$inline: true });
    	const if_block_creators = [create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isInput*/ ctx[8]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function switch_instance_wrapper_binding(value) {
    		/*switch_instance_wrapper_binding*/ ctx[37](value);
    	}

    	var switch_value = /*getComponents*/ ctx[21]().wrapper;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			isOpen: /*isOpen*/ ctx[3],
    			isPopup: /*isPopup*/ ctx[16],
    			toRight: /*toRight*/ ctx[17],
    			$$slots: { default: [create_default_slot] },
    			$$scope: { ctx }
    		};

    		if (/*wrapper*/ ctx[20] !== void 0) {
    			switch_instance_props.wrapper = /*wrapper*/ ctx[20];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'wrapper', switch_instance_wrapper_binding, /*wrapper*/ ctx[20]));
    	}

    	const block = {
    		c: function create() {
    			create_component(arrowkeyhandler.$$.fragment);
    			t0 = space();
    			span_1 = element("span");
    			if_block.c();
    			t1 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(span_1, "class", "color-picker svelte-1jtm271");
    			add_location(span_1, file$4, 155, 0, 4814);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(arrowkeyhandler, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span_1, anchor);
    			if_blocks[current_block_type_index].m(span_1, null);
    			append_dev(span_1, t1);
    			if (switch_instance) mount_component(switch_instance, span_1, null);
    			/*span_1_binding*/ ctx[38](span_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "mousedown", /*mousedown*/ ctx[22], false, false, false),
    					listen_dev(window, "keydown", /*keydown*/ ctx[24], false, false, false),
    					listen_dev(window, "keyup", /*keyup*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(span_1, t1);
    			}

    			const switch_instance_changes = {};
    			if (dirty[0] & /*isOpen*/ 8) switch_instance_changes.isOpen = /*isOpen*/ ctx[3];
    			if (dirty[0] & /*isPopup*/ 65536) switch_instance_changes.isPopup = /*isPopup*/ ctx[16];
    			if (dirty[0] & /*toRight*/ 131072) switch_instance_changes.toRight = /*toRight*/ ctx[17];

    			if (dirty[0] & /*a11yColors, color, hex, a11yGuidelines, isA11yOpen, isA11yClosable, isA11y, isAlpha, canChangeMode, rgb, hsv, isTextInput, toRight, isOpen, isDark*/ 196287 | dirty[1] & /*$$scope*/ 16384) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_wrapper && dirty[0] & /*wrapper*/ 1048576) {
    				updating_wrapper = true;
    				switch_instance_changes.wrapper = /*wrapper*/ ctx[20];
    				add_flush_callback(() => updating_wrapper = false);
    			}

    			if (switch_value !== (switch_value = /*getComponents*/ ctx[21]().wrapper)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'wrapper', switch_instance_wrapper_binding, /*wrapper*/ ctx[20]));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, span_1, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrowkeyhandler.$$.fragment, local);
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrowkeyhandler.$$.fragment, local);
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arrowkeyhandler, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span_1);
    			if_blocks[current_block_type_index].d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*span_1_binding*/ ctx[38](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorPicker', slots, []);
    	k([a11yPlugin]);
    	let { components = {} } = $$props;
    	const dispatch = createEventDispatcher();
    	let { label = 'Choose a color' } = $$props;
    	let { isAlpha = true } = $$props;
    	let { isInput = true } = $$props;
    	let { isTextInput = true } = $$props;
    	let { canChangeMode = true } = $$props;
    	let { isA11y = false } = $$props;
    	let { a11yColors = [{ hex: '#ffffff' }] } = $$props;
    	let { a11yGuidelines = '<p style="margin: 0; font-size: 12px;">Learn more at <a href="https://webaim.org/articles/contrast/" target="_blank">WebAIM contrast guide</a></p>' } = $$props;
    	let { isA11yOpen = false } = $$props;
    	let { isA11yClosable = true } = $$props;
    	let { isPopup = isInput } = $$props;
    	let { isOpen = !isInput } = $$props;
    	let { toRight = false } = $$props;
    	let { rgb = { r: 255, g: 0, b: 0, a: 1 } } = $$props;
    	let { hsv = { h: 0, s: 1, v: 1, a: 1 } } = $$props;
    	let { hex = '#ff0000' } = $$props;
    	let { color = undefined } = $$props;
    	let { isDark = false } = $$props;

    	/**
     * Internal old value to trigger color conversion
     */
    	let _rgb = { r: 255, g: 0, b: 0, a: 1 };

    	let _hsv = { h: 0, s: 1, v: 1, a: 1 };
    	let _hex = '#ff0000';
    	let span;

    	const default_components = {
    		sliderIndicator: SliderIndicator,
    		pickerIndicator: PickerIndicator,
    		alphaIndicator: SliderIndicator,
    		pickerWrapper: PickerWrapper,
    		sliderWrapper: SliderWrapper,
    		alphaWrapper: SliderWrapper,
    		textInput: TextInput,
    		a11yNotice: A11yNotice,
    		a11ySingleNotice: A11ySingleNotice,
    		a11ySummary: A11ySummary,
    		input: Input,
    		wrapper: Wrapper
    	};

    	function getComponents() {
    		return { ...default_components, ...components };
    	}

    	let labelWrapper;
    	let wrapper;

    	function mousedown({ target }) {
    		if (isInput) {
    			if (labelWrapper.contains(target) || labelWrapper.isSameNode(target)) {
    				$$invalidate(3, isOpen = !isOpen);
    			} else if (isOpen && !wrapper.contains(target)) {
    				$$invalidate(3, isOpen = false);
    			}
    		}
    	}

    	function keyup(e) {
    		if (e.key === 'Tab') {
    			$$invalidate(3, isOpen = span?.contains(document.activeElement));
    		}
    	}

    	/**
     * using a function seems to trigger the exported value change only once when all of them has been updated
     * and not just after the hsv change
     */
    	function updateColor() {
    		if (hsv.h === _hsv.h && hsv.s === _hsv.s && hsv.v === _hsv.v && hsv.a === _hsv.a && rgb.r === _rgb.r && rgb.g === _rgb.g && rgb.b === _rgb.b && rgb.a === _rgb.a && hex === _hex) {
    			return;
    		}

    		// reinitialize empty alpha values
    		if (hsv.a === undefined) $$invalidate(1, hsv.a = 1, hsv);

    		if (_hsv.a === undefined) _hsv.a = 1;
    		if (rgb.a === undefined) $$invalidate(0, rgb.a = 1, rgb);
    		if (_rgb.a === undefined) _rgb.a = 1;
    		if (hex?.substring(7) === 'ff') $$invalidate(2, hex = hex.substring(0, 7));
    		if (hex?.substring(7) === 'ff') $$invalidate(2, hex = hex.substring(0, 7));

    		// check which color format changed and updates the others accordingly
    		if (hsv.h !== _hsv.h || hsv.s !== _hsv.s || hsv.v !== _hsv.v || hsv.a !== _hsv.a) {
    			$$invalidate(4, color = w(hsv));
    			$$invalidate(0, rgb = color.toRgb());
    			$$invalidate(2, hex = color.toHex());
    		} else if (rgb.r !== _rgb.r || rgb.g !== _rgb.g || rgb.b !== _rgb.b || rgb.a !== _rgb.a) {
    			$$invalidate(4, color = w(rgb));
    			$$invalidate(2, hex = color.toHex());
    			$$invalidate(1, hsv = color.toHsv());
    		} else if (hex !== _hex) {
    			$$invalidate(4, color = w(hex));
    			$$invalidate(0, rgb = color.toRgb());
    			$$invalidate(1, hsv = color.toHsv());
    		}

    		if (color) {
    			$$invalidate(5, isDark = color.isDark());
    		}

    		// update old colors
    		_hsv = Object.assign({}, hsv);

    		_rgb = Object.assign({}, rgb);
    		_hex = hex;
    		dispatch('input', { color, hsv, rgb, hex });
    	}

    	function keydown(e) {
    		if (e.key === 'Tab') span.classList.add('has-been-tabbed');
    	}

    	const writable_props = [
    		'components',
    		'label',
    		'isAlpha',
    		'isInput',
    		'isTextInput',
    		'canChangeMode',
    		'isA11y',
    		'a11yColors',
    		'a11yGuidelines',
    		'isA11yOpen',
    		'isA11yClosable',
    		'isPopup',
    		'isOpen',
    		'toRight',
    		'rgb',
    		'hsv',
    		'hex',
    		'color',
    		'isDark'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	function switch_instance_labelWrapper_binding(value) {
    		labelWrapper = value;
    		$$invalidate(19, labelWrapper);
    	}

    	function switch_instance_isOpen_binding(value) {
    		isOpen = value;
    		$$invalidate(3, isOpen);
    	}

    	function picker_s_binding(value) {
    		if ($$self.$$.not_equal(hsv.s, value)) {
    			hsv.s = value;
    			$$invalidate(1, hsv);
    		}
    	}

    	function picker_v_binding(value) {
    		if ($$self.$$.not_equal(hsv.v, value)) {
    			hsv.v = value;
    			$$invalidate(1, hsv);
    		}
    	}

    	function picker_isOpen_binding(value) {
    		isOpen = value;
    		$$invalidate(3, isOpen);
    	}

    	function slider_h_binding(value) {
    		if ($$self.$$.not_equal(hsv.h, value)) {
    			hsv.h = value;
    			$$invalidate(1, hsv);
    		}
    	}

    	function alpha_a_binding(value) {
    		if ($$self.$$.not_equal(hsv.a, value)) {
    			hsv.a = value;
    			$$invalidate(1, hsv);
    		}
    	}

    	function alpha_isOpen_binding(value) {
    		isOpen = value;
    		$$invalidate(3, isOpen);
    	}

    	function switch_instance_hex_binding(value) {
    		hex = value;
    		$$invalidate(2, hex);
    	}

    	function switch_instance_rgb_binding(value) {
    		rgb = value;
    		$$invalidate(0, rgb);
    	}

    	function switch_instance_hsv_binding(value) {
    		hsv = value;
    		$$invalidate(1, hsv);
    	}

    	function switch_instance_wrapper_binding(value) {
    		wrapper = value;
    		$$invalidate(20, wrapper);
    	}

    	function span_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			span = $$value;
    			$$invalidate(18, span);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('components' in $$props) $$invalidate(25, components = $$props.components);
    		if ('label' in $$props) $$invalidate(6, label = $$props.label);
    		if ('isAlpha' in $$props) $$invalidate(7, isAlpha = $$props.isAlpha);
    		if ('isInput' in $$props) $$invalidate(8, isInput = $$props.isInput);
    		if ('isTextInput' in $$props) $$invalidate(9, isTextInput = $$props.isTextInput);
    		if ('canChangeMode' in $$props) $$invalidate(10, canChangeMode = $$props.canChangeMode);
    		if ('isA11y' in $$props) $$invalidate(11, isA11y = $$props.isA11y);
    		if ('a11yColors' in $$props) $$invalidate(12, a11yColors = $$props.a11yColors);
    		if ('a11yGuidelines' in $$props) $$invalidate(13, a11yGuidelines = $$props.a11yGuidelines);
    		if ('isA11yOpen' in $$props) $$invalidate(14, isA11yOpen = $$props.isA11yOpen);
    		if ('isA11yClosable' in $$props) $$invalidate(15, isA11yClosable = $$props.isA11yClosable);
    		if ('isPopup' in $$props) $$invalidate(16, isPopup = $$props.isPopup);
    		if ('isOpen' in $$props) $$invalidate(3, isOpen = $$props.isOpen);
    		if ('toRight' in $$props) $$invalidate(17, toRight = $$props.toRight);
    		if ('rgb' in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ('hsv' in $$props) $$invalidate(1, hsv = $$props.hsv);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('isDark' in $$props) $$invalidate(5, isDark = $$props.isDark);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		colord: w,
    		extend: k,
    		a11yPlugin,
    		Picker,
    		Slider,
    		Alpha,
    		TextInput,
    		SliderIndicator,
    		PickerIndicator,
    		ArrowKeyHandler,
    		PickerWrapper,
    		SliderWrapper,
    		Input,
    		Wrapper,
    		A11yNotice,
    		A11ySingleNotice,
    		A11ySummary,
    		components,
    		dispatch,
    		label,
    		isAlpha,
    		isInput,
    		isTextInput,
    		canChangeMode,
    		isA11y,
    		a11yColors,
    		a11yGuidelines,
    		isA11yOpen,
    		isA11yClosable,
    		isPopup,
    		isOpen,
    		toRight,
    		rgb,
    		hsv,
    		hex,
    		color,
    		isDark,
    		_rgb,
    		_hsv,
    		_hex,
    		span,
    		default_components,
    		getComponents,
    		labelWrapper,
    		wrapper,
    		mousedown,
    		keyup,
    		updateColor,
    		keydown
    	});

    	$$self.$inject_state = $$props => {
    		if ('components' in $$props) $$invalidate(25, components = $$props.components);
    		if ('label' in $$props) $$invalidate(6, label = $$props.label);
    		if ('isAlpha' in $$props) $$invalidate(7, isAlpha = $$props.isAlpha);
    		if ('isInput' in $$props) $$invalidate(8, isInput = $$props.isInput);
    		if ('isTextInput' in $$props) $$invalidate(9, isTextInput = $$props.isTextInput);
    		if ('canChangeMode' in $$props) $$invalidate(10, canChangeMode = $$props.canChangeMode);
    		if ('isA11y' in $$props) $$invalidate(11, isA11y = $$props.isA11y);
    		if ('a11yColors' in $$props) $$invalidate(12, a11yColors = $$props.a11yColors);
    		if ('a11yGuidelines' in $$props) $$invalidate(13, a11yGuidelines = $$props.a11yGuidelines);
    		if ('isA11yOpen' in $$props) $$invalidate(14, isA11yOpen = $$props.isA11yOpen);
    		if ('isA11yClosable' in $$props) $$invalidate(15, isA11yClosable = $$props.isA11yClosable);
    		if ('isPopup' in $$props) $$invalidate(16, isPopup = $$props.isPopup);
    		if ('isOpen' in $$props) $$invalidate(3, isOpen = $$props.isOpen);
    		if ('toRight' in $$props) $$invalidate(17, toRight = $$props.toRight);
    		if ('rgb' in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ('hsv' in $$props) $$invalidate(1, hsv = $$props.hsv);
    		if ('hex' in $$props) $$invalidate(2, hex = $$props.hex);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    		if ('isDark' in $$props) $$invalidate(5, isDark = $$props.isDark);
    		if ('_rgb' in $$props) _rgb = $$props._rgb;
    		if ('_hsv' in $$props) _hsv = $$props._hsv;
    		if ('_hex' in $$props) _hex = $$props._hex;
    		if ('span' in $$props) $$invalidate(18, span = $$props.span);
    		if ('labelWrapper' in $$props) $$invalidate(19, labelWrapper = $$props.labelWrapper);
    		if ('wrapper' in $$props) $$invalidate(20, wrapper = $$props.wrapper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*hsv, rgb, hex*/ 7) {
    			if (hsv || rgb || hex) {
    				updateColor();
    			}
    		}
    	};

    	return [
    		rgb,
    		hsv,
    		hex,
    		isOpen,
    		color,
    		isDark,
    		label,
    		isAlpha,
    		isInput,
    		isTextInput,
    		canChangeMode,
    		isA11y,
    		a11yColors,
    		a11yGuidelines,
    		isA11yOpen,
    		isA11yClosable,
    		isPopup,
    		toRight,
    		span,
    		labelWrapper,
    		wrapper,
    		getComponents,
    		mousedown,
    		keyup,
    		keydown,
    		components,
    		switch_instance_labelWrapper_binding,
    		switch_instance_isOpen_binding,
    		picker_s_binding,
    		picker_v_binding,
    		picker_isOpen_binding,
    		slider_h_binding,
    		alpha_a_binding,
    		alpha_isOpen_binding,
    		switch_instance_hex_binding,
    		switch_instance_rgb_binding,
    		switch_instance_hsv_binding,
    		switch_instance_wrapper_binding,
    		span_1_binding
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				components: 25,
    				label: 6,
    				isAlpha: 7,
    				isInput: 8,
    				isTextInput: 9,
    				canChangeMode: 10,
    				isA11y: 11,
    				a11yColors: 12,
    				a11yGuidelines: 13,
    				isA11yOpen: 14,
    				isA11yClosable: 15,
    				isPopup: 16,
    				isOpen: 3,
    				toRight: 17,
    				rgb: 0,
    				hsv: 1,
    				hex: 2,
    				color: 4,
    				isDark: 5
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get components() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set components(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isAlpha() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isAlpha(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isInput() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isInput(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isTextInput() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isTextInput(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canChangeMode() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canChangeMode(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isA11y() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isA11y(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11yColors() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11yColors(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get a11yGuidelines() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set a11yGuidelines(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isA11yOpen() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isA11yOpen(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isA11yClosable() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isA11yClosable(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isPopup() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPopup(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rgb() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rgb(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hsv() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hsv(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hex() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hex(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDark() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDark(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/mce/Forecolor/ForeColorWrapper.svelte generated by Svelte v3.54.0 */

    const file$3 = "src/mce/Forecolor/ForeColorWrapper.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let button0;
    	let t2;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "취소";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "확인";
    			attr_dev(button0, "class", "cancel svelte-ze9cao");
    			add_location(button0, file$3, 28, 4, 608);
    			attr_dev(button1, "class", "save svelte-ze9cao");
    			add_location(button1, file$3, 29, 4, 674);
    			attr_dev(div0, "class", "buttons svelte-ze9cao");
    			add_location(div0, file$3, 27, 2, 582);
    			attr_dev(div1, "class", "picker-wrapper svelte-ze9cao");
    			toggle_class(div1, "isOpen", /*isOpen*/ ctx[1]);
    			add_location(div1, file$3, 25, 0, 507);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t2);
    			append_dev(div0, button1);
    			/*div1_binding*/ ctx[8](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*cancelHandler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*saveHandler*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*isOpen*/ 2) {
    				toggle_class(div1, "isOpen", /*isOpen*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ForeColorWrapper', slots, ['default']);
    	let { wrapper } = $$props;
    	let { isOpen } = $$props;
    	let { isPopup } = $$props;
    	let { toRight } = $$props;

    	//Constants
    	//Variables
    	//Functions
    	function saveHandler() {
    		const event = new Event("SAVE");
    		const container = wrapper.parentElement.parentElement;
    		container.dispatchEvent(event);
    	} //

    	function cancelHandler() {
    		const event = new Event("CANCEL");
    		const container = wrapper.parentElement.parentElement;
    		container.dispatchEvent(event);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (wrapper === undefined && !('wrapper' in $$props || $$self.$$.bound[$$self.$$.props['wrapper']])) {
    			console.warn("<ForeColorWrapper> was created without expected prop 'wrapper'");
    		}

    		if (isOpen === undefined && !('isOpen' in $$props || $$self.$$.bound[$$self.$$.props['isOpen']])) {
    			console.warn("<ForeColorWrapper> was created without expected prop 'isOpen'");
    		}

    		if (isPopup === undefined && !('isPopup' in $$props || $$self.$$.bound[$$self.$$.props['isPopup']])) {
    			console.warn("<ForeColorWrapper> was created without expected prop 'isPopup'");
    		}

    		if (toRight === undefined && !('toRight' in $$props || $$self.$$.bound[$$self.$$.props['toRight']])) {
    			console.warn("<ForeColorWrapper> was created without expected prop 'toRight'");
    		}
    	});

    	const writable_props = ['wrapper', 'isOpen', 'isPopup', 'toRight'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ForeColorWrapper> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrapper = $$value;
    			$$invalidate(0, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('wrapper' in $$props) $$invalidate(0, wrapper = $$props.wrapper);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('isPopup' in $$props) $$invalidate(4, isPopup = $$props.isPopup);
    		if ('toRight' in $$props) $$invalidate(5, toRight = $$props.toRight);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		wrapper,
    		isOpen,
    		isPopup,
    		toRight,
    		saveHandler,
    		cancelHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('wrapper' in $$props) $$invalidate(0, wrapper = $$props.wrapper);
    		if ('isOpen' in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ('isPopup' in $$props) $$invalidate(4, isPopup = $$props.isPopup);
    		if ('toRight' in $$props) $$invalidate(5, toRight = $$props.toRight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		wrapper,
    		isOpen,
    		saveHandler,
    		cancelHandler,
    		isPopup,
    		toRight,
    		$$scope,
    		slots,
    		div1_binding
    	];
    }

    class ForeColorWrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			wrapper: 0,
    			isOpen: 1,
    			isPopup: 4,
    			toRight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ForeColorWrapper",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get wrapper() {
    		throw new Error("<ForeColorWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapper(value) {
    		throw new Error("<ForeColorWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<ForeColorWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<ForeColorWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isPopup() {
    		throw new Error("<ForeColorWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isPopup(value) {
    		throw new Error("<ForeColorWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toRight() {
    		throw new Error("<ForeColorWrapper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toRight(value) {
    		throw new Error("<ForeColorWrapper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/mce/Forecolor/ForeColor.svelte generated by Svelte v3.54.0 */
    const file$2 = "src/mce/Forecolor/ForeColor.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let colorpicker;
    	let updating_rgb;
    	let updating_isOpen;
    	let current;

    	function colorpicker_rgb_binding(value) {
    		/*colorpicker_rgb_binding*/ ctx[3](value);
    	}

    	function colorpicker_isOpen_binding(value) {
    		/*colorpicker_isOpen_binding*/ ctx[4](value);
    	}

    	let colorpicker_props = {
    		label: "asdsad",
    		isAlpha: false,
    		canChangeMode: false,
    		components: { wrapper: ForeColorWrapper }
    	};

    	if (/*rgb*/ ctx[1] !== void 0) {
    		colorpicker_props.rgb = /*rgb*/ ctx[1];
    	}

    	if (/*isOpen*/ ctx[0] !== void 0) {
    		colorpicker_props.isOpen = /*isOpen*/ ctx[0];
    	}

    	colorpicker = new ColorPicker({ props: colorpicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorpicker, 'rgb', colorpicker_rgb_binding, /*rgb*/ ctx[1]));
    	binding_callbacks.push(() => bind(colorpicker, 'isOpen', colorpicker_isOpen_binding, /*isOpen*/ ctx[0]));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(colorpicker.$$.fragment);
    			attr_dev(div, "id", "fore-color-container");
    			attr_dev(div, "class", "svelte-14t22gr");
    			add_location(div, file$2, 37, 0, 904);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(colorpicker, div, null);
    			/*div_binding*/ ctx[5](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const colorpicker_changes = {};

    			if (!updating_rgb && dirty & /*rgb*/ 2) {
    				updating_rgb = true;
    				colorpicker_changes.rgb = /*rgb*/ ctx[1];
    				add_flush_callback(() => updating_rgb = false);
    			}

    			if (!updating_isOpen && dirty & /*isOpen*/ 1) {
    				updating_isOpen = true;
    				colorpicker_changes.isOpen = /*isOpen*/ ctx[0];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			colorpicker.$set(colorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(colorpicker);
    			/*div_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function componentToHex(c) {
    	var hex = c.toString(16);
    	return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
    	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ForeColor', slots, []);
    	const dispatch = createEventDispatcher();

    	//Variables
    	let rgb;

    	let container;
    	let isOpen = true;

    	function saveHandler() {
    		const { r, g, b } = rgb;
    		dispatch("SAVE", rgbToHex(r, g, b));
    	}

    	function cancelHandler() {
    		dispatch("CANCEL");
    	}

    	onMount(() => {
    		container.addEventListener("SAVE", saveHandler);
    		container.addEventListener("CANCEL", cancelHandler);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ForeColor> was created with unknown prop '${key}'`);
    	});

    	function colorpicker_rgb_binding(value) {
    		rgb = value;
    		$$invalidate(1, rgb);
    	}

    	function colorpicker_isOpen_binding(value) {
    		isOpen = value;
    		$$invalidate(0, isOpen);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		ColorPicker,
    		ForeColorWrapper,
    		createEventDispatcher,
    		onMount,
    		dispatch,
    		rgb,
    		container,
    		isOpen,
    		componentToHex,
    		rgbToHex,
    		saveHandler,
    		cancelHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('rgb' in $$props) $$invalidate(1, rgb = $$props.rgb);
    		if ('container' in $$props) $$invalidate(2, container = $$props.container);
    		if ('isOpen' in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isOpen*/ 1) {
    			!isOpen && cancelHandler();
    		}
    	};

    	return [
    		isOpen,
    		rgb,
    		container,
    		colorpicker_rgb_binding,
    		colorpicker_isOpen_binding,
    		div_binding
    	];
    }

    class ForeColor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ForeColor",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var TextColor = "<svg style=\"width:24px;height:24px\"><g fill-rule=\"evenodd\"><path id=\"tox-icon-text-color__color\" d=\"M3 18h18v3H3z\" fill=\"#000000\"></path><path d=\"M8.7 16h-.8a.5.5 0 0 1-.5-.6l2.7-9c.1-.3.3-.4.5-.4h2.8c.2 0 .4.1.5.4l2.7 9a.5.5 0 0 1-.5.6h-.8a.5.5 0 0 1-.4-.4l-.7-2.2c0-.3-.3-.4-.5-.4h-3.4c-.2 0-.4.1-.5.4l-.7 2.2c0 .3-.2.4-.4.4Zm2.6-7.6-.6 2a.5.5 0 0 0 .5.6h1.6a.5.5 0 0 0 .5-.6l-.6-2c0-.3-.3-.4-.5-.4h-.4c-.2 0-.4.1-.5.4Z\"></path></g></svg>";

    const tooltip = `font-color`;
    const __colors = [
        "#46474B", "gray5",
        "#333338", "gray6",
        "#6D6F76", "gray4",
        "#BCBFC3", "gray3",
        "#D8D9DF", "gray2",
        "#E6E7ED", "gray1",
        "#E54848", "red",
        "#10C181", "green",
        "#FFCE00", "yellow",
        "#3C68D6", "blue_dark",
        "#6591FA", "blue_main",
        "#A5C1F9", "blue_light"
    ];
    function Forecolor(editor, colors = __colors, defaultColor = "#46474B") {
        const pickerValue = "picker";
        const addedColorNames = addColorIcons(editor, colors);
        const DEFAULT_TEXT_COLOR_ICON = "DEFAULT_TEXT_COLOR_ICON";
        let currentColor = defaultColor;
        editor.ui.registry.addIcon(DEFAULT_TEXT_COLOR_ICON, TextColor);
        editor.ui.registry.addSplitButton('color', {
            icon: DEFAULT_TEXT_COLOR_ICON,
            tooltip: tooltip,
            columns: 5,
            onAction: function () {
                editor.execCommand('ForeColor', false, currentColor);
            },
            onSetup: function (_) {
                setIconColor(currentColor);
            },
            onItemAction: function (api, value) {
                if (value === pickerValue) {
                    const editArea = getEditorArea();
                    const foreColorComponent = new ForeColor({
                        target: editArea
                    });
                    editor.getBody().setAttribute('contenteditable', false);
                    foreColorComponent.$on("SAVE", (e) => {
                        const { detail } = e;
                        editor.getBody().setAttribute('contenteditable', true);
                        editor.execCommand('ForeColor', false, detail);
                        currentColor = detail;
                        setIconColor(currentColor);
                        foreColorComponent.$destroy();
                    });
                    foreColorComponent.$on("CANCEL", () => {
                        editor.getBody().setAttribute('contenteditable', true);
                        foreColorComponent.$destroy();
                    });
                }
                else {
                    currentColor = value;
                    setIconColor(currentColor);
                    editor.execCommand('ForeColor', false, value);
                }
            },
            fetch: function (callback) {
                const items = addedColorNames.map((v) => {
                    return {
                        type: 'choiceitem',
                        icon: `${v.name}`,
                        value: v.hax,
                    };
                });
                const picker = {
                    type: "choiceitem",
                    icon: "color-picker",
                    value: pickerValue
                };
                callback([...items, picker]);
            }
        });
    }
    function addColorIcons(editor, colors) {
        const colorNames = [];
        for (let i = 0; i < colors.length; i += 2) {
            editor.ui.registry.addIcon(colors[i + 1], `<div style="width:24px;height:24px;background : ${colors[i]}" />`);
            colorNames.push({
                hax: colors[i],
                name: colors[i + 1]
            });
        }
        return colorNames;
    }
    function getEditorArea() {
        return document.querySelector("div.tox-edit-area");
    }
    function setIconColor(color) {
        const button = document.querySelector(`div[title=${tooltip}]`);
        const COLOR_ID = "tox-icon-text-color__color";
        const colorEL = button.querySelector("#" + COLOR_ID);
        colorEL.style.fill = color;
    }

    const style_formats = [
        { title: "제목", block: "h1" },
        { title: "부제목", block: "h2" },
        { title: "본문", block: "p", exact: true },
        { title: "주석", block: 'pre', classes: ["annotation"], exact: true }
    ];

    /* src/mce/MCE.svelte generated by Svelte v3.54.0 */
    const file$1 = "src/mce/MCE.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let editor;
    	let updating_value;
    	let current;

    	function editor_value_binding(value) {
    		/*editor_value_binding*/ ctx[2](value);
    	}

    	let editor_props = { apiKey, conf: /*conf*/ ctx[1] };

    	if (/*value*/ ctx[0] !== void 0) {
    		editor_props.value = /*value*/ ctx[0];
    	}

    	editor = new Editor({ props: editor_props, $$inline: true });
    	binding_callbacks.push(() => bind(editor, 'value', editor_value_binding, /*value*/ ctx[0]));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(editor.$$.fragment);
    			attr_dev(div, "class", "editor svelte-14k4bor");
    			add_location(div, file$1, 40, 0, 1085);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(editor, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const editor_changes = {};

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				editor_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			editor.$set(editor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(editor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(editor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(editor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiKey = "a0aiq41fhg206d5zmtkad4ybmqfiwtetptg2rncqpc900t6n";

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MCE', slots, []);
    	let { value = "" } = $$props;

    	const conf = {
    		menubar: false,
    		toolbar: "undo redo | styles | color | bold | alignleft aligncenter alignright | __link__ | image",
    		plugins: "autoresize paste",
    		resize: false,
    		statusbar: false,
    		height: "auto",
    		content_css: "/global.css",
    		object_resizing: "img",
    		a11y_advanced_options: true,
    		resize_img_proportional: true,
    		paste_enable_default_filters: false,
    		paste_webkit_styles: "color",
    		paste_as_text: true,
    		style_formats,
    		body_id: "HITIT-wiswig",
    		paste_block_drop: false,
    		setup: editor => {
    			imageSetup(editor);
    			linkSetup(editor);
    			Forecolor(editor);
    		}
    	};

    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MCE> was created with unknown prop '${key}'`);
    	});

    	function editor_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		Editor,
    		imageSetup,
    		linkSetup,
    		Forecolor,
    		style_formats,
    		value,
    		apiKey,
    		conf
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, conf, editor_value_binding];
    }

    class MCE extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MCE",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get value() {
    		throw new Error("<MCE>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<MCE>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.54.0 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (16:6) {#each selectedInputModes as target}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*target*/ ctx[8].displayValue + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", /*target*/ ctx[8].target);
    			input.__value = /*target*/ ctx[8].target;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-nuo3c5");
    			/*$$binding_groups*/ ctx[5][0].push(input);
    			add_location(input, file, 17, 10, 516);
    			attr_dev(label, "class", "svelte-nuo3c5");
    			toggle_class(label, "active", /*selectedInputMode*/ ctx[0] === /*target*/ ctx[8].target);
    			add_location(label, file, 16, 8, 447);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*selectedInputMode*/ ctx[0];
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedInputMode*/ 1) {
    				input.checked = input.__value === /*selectedInputMode*/ ctx[0];
    			}

    			if (dirty & /*selectedInputMode, selectedInputModes*/ 9) {
    				toggle_class(label, "active", /*selectedInputMode*/ ctx[0] === /*target*/ ctx[8].target);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[5][0].splice(/*$$binding_groups*/ ctx[5][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:6) {#each selectedInputModes as target}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h10;
    	let t1;
    	let div1;
    	let t2;
    	let div0;
    	let t3;
    	let div3;
    	let div2;
    	let t4;
    	let input;
    	let t5;
    	let mce;
    	let updating_value;
    	let t6;
    	let h11;
    	let t8;
    	let div10;
    	let div6;
    	let div4;
    	let t9;
    	let div5;
    	let t10;
    	let t11;
    	let div9;
    	let div7;
    	let t12;
    	let div8;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*selectedInputModes*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function mce_value_binding(value) {
    		/*mce_value_binding*/ ctx[7](value);
    	}

    	let mce_props = {};

    	if (/*answer*/ ctx[2] !== void 0) {
    		mce_props.value = /*answer*/ ctx[2];
    	}

    	mce = new MCE({ props: mce_props, $$inline: true });
    	binding_callbacks.push(() => bind(mce, 'value', mce_value_binding, /*answer*/ ctx[2]));

    	const block = {
    		c: function create() {
    			main = element("main");
    			h10 = element("h1");
    			h10.textContent = "Insert Here!";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("ModeChnage\n    ");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t4 = text("제목");
    			input = element("input");
    			t5 = space();
    			create_component(mce.$$.fragment);
    			t6 = space();
    			h11 = element("h1");
    			h11.textContent = "FAQ Result";
    			t8 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			t9 = space();
    			div5 = element("div");
    			t10 = text(/*title*/ ctx[1]);
    			t11 = space();
    			div9 = element("div");
    			div7 = element("div");
    			t12 = space();
    			div8 = element("div");
    			attr_dev(h10, "class", "svelte-nuo3c5");
    			add_location(h10, file, 11, 2, 300);
    			attr_dev(div0, "class", "input-target svelte-nuo3c5");
    			add_location(div0, file, 14, 4, 369);
    			attr_dev(div1, "class", "mode-change svelte-nuo3c5");
    			add_location(div1, file, 12, 2, 324);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-nuo3c5");
    			add_location(input, file, 30, 8, 854);
    			attr_dev(div2, "class", "title svelte-nuo3c5");
    			add_location(div2, file, 29, 4, 826);
    			attr_dev(div3, "class", "inputs svelte-nuo3c5");
    			toggle_class(div3, "faq", /*selectedInputMode*/ ctx[0] === "original");
    			add_location(div3, file, 28, 2, 756);
    			attr_dev(h11, "class", "svelte-nuo3c5");
    			add_location(h11, file, 35, 2, 950);
    			attr_dev(div4, "class", "img svelte-nuo3c5");
    			add_location(div4, file, 39, 6, 1050);
    			attr_dev(div5, "class", "text svelte-nuo3c5");
    			add_location(div5, file, 40, 6, 1076);
    			attr_dev(div6, "class", "question-box box svelte-nuo3c5");
    			add_location(div6, file, 38, 4, 1013);
    			attr_dev(div7, "class", "text svelte-nuo3c5");
    			attr_dev(div7, "id", "HITIT-wiswig");
    			add_location(div7, file, 45, 6, 1174);
    			attr_dev(div8, "class", "img svelte-nuo3c5");
    			add_location(div8, file, 48, 6, 1253);
    			attr_dev(div9, "class", "answer-box box svelte-nuo3c5");
    			add_location(div9, file, 44, 4, 1139);
    			attr_dev(div10, "class", "result-wrapper svelte-nuo3c5");
    			attr_dev(div10, "id", "H");
    			add_location(div10, file, 37, 2, 973);
    			attr_dev(main, "class", "svelte-nuo3c5");
    			add_location(main, file, 10, 0, 291);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h10);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(main, t3);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div2, input);
    			set_input_value(input, /*title*/ ctx[1]);
    			append_dev(div3, t5);
    			mount_component(mce, div3, null);
    			append_dev(main, t6);
    			append_dev(main, h11);
    			append_dev(main, t8);
    			append_dev(main, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, t10);
    			append_dev(div10, t11);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			div7.innerHTML = /*answer*/ ctx[2];
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedInputMode, selectedInputModes*/ 9) {
    				each_value = /*selectedInputModes*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*title*/ 2 && input.value !== /*title*/ ctx[1]) {
    				set_input_value(input, /*title*/ ctx[1]);
    			}

    			const mce_changes = {};

    			if (!updating_value && dirty & /*answer*/ 4) {
    				updating_value = true;
    				mce_changes.value = /*answer*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			mce.$set(mce_changes);

    			if (!current || dirty & /*selectedInputMode*/ 1) {
    				toggle_class(div3, "faq", /*selectedInputMode*/ ctx[0] === "original");
    			}

    			if (!current || dirty & /*title*/ 2) set_data_dev(t10, /*title*/ ctx[1]);
    			if (!current || dirty & /*answer*/ 4) div7.innerHTML = /*answer*/ ctx[2];		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mce.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mce.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			destroy_component(mce);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const selectedInputModes = [
    		{
    			target: "original",
    			displayValue: "FAQ 실제 인풋 크기"
    		},
    		{ target: "full", displayValue: "전체 화면" }
    	];

    	let selectedInputMode = "full";
    	let title = "힛잇 허브는 사용료나 약정이 어떻게 되나요?";
    	let answer = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		selectedInputMode = this.__value;
    		$$invalidate(0, selectedInputMode);
    	}

    	function input_input_handler() {
    		title = this.value;
    		$$invalidate(1, title);
    	}

    	function mce_value_binding(value) {
    		answer = value;
    		$$invalidate(2, answer);
    	}

    	$$self.$capture_state = () => ({
    		Mce: MCE,
    		selectedInputModes,
    		selectedInputMode,
    		title,
    		answer
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedInputMode' in $$props) $$invalidate(0, selectedInputMode = $$props.selectedInputMode);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('answer' in $$props) $$invalidate(2, answer = $$props.answer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedInputMode,
    		title,
    		answer,
    		selectedInputModes,
    		input_change_handler,
    		$$binding_groups,
    		input_input_handler,
    		mce_value_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*!
     * Quill Editor v1.3.7
     * https://quilljs.com/
     * Copyright (c) 2014, Jason Chen
     * Copyright (c) 2013, salesforce.com
     */

    var quill = createCommonjsModule(function (module, exports) {
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(typeof self !== 'undefined' ? self : commonjsGlobal, function() {
    return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};
    /******/
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId]) {
    /******/ 			return installedModules[moduleId].exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
    /******/ 			i: moduleId,
    /******/ 			l: false,
    /******/ 			exports: {}
    /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.l = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/
    /******/
    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;
    /******/
    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;
    /******/
    /******/ 	// define getter function for harmony exports
    /******/ 	__webpack_require__.d = function(exports, name, getter) {
    /******/ 		if(!__webpack_require__.o(exports, name)) {
    /******/ 			Object.defineProperty(exports, name, {
    /******/ 				configurable: false,
    /******/ 				enumerable: true,
    /******/ 				get: getter
    /******/ 			});
    /******/ 		}
    /******/ 	};
    /******/
    /******/ 	// getDefaultExport function for compatibility with non-harmony modules
    /******/ 	__webpack_require__.n = function(module) {
    /******/ 		var getter = module && module.__esModule ?
    /******/ 			function getDefault() { return module['default']; } :
    /******/ 			function getModuleExports() { return module; };
    /******/ 		__webpack_require__.d(getter, 'a', getter);
    /******/ 		return getter;
    /******/ 	};
    /******/
    /******/ 	// Object.prototype.hasOwnProperty.call
    /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
    /******/
    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";
    /******/
    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(__webpack_require__.s = 109);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var container_1 = __webpack_require__(17);
    var format_1 = __webpack_require__(18);
    var leaf_1 = __webpack_require__(19);
    var scroll_1 = __webpack_require__(45);
    var inline_1 = __webpack_require__(46);
    var block_1 = __webpack_require__(47);
    var embed_1 = __webpack_require__(48);
    var text_1 = __webpack_require__(49);
    var attributor_1 = __webpack_require__(12);
    var class_1 = __webpack_require__(32);
    var style_1 = __webpack_require__(33);
    var store_1 = __webpack_require__(31);
    var Registry = __webpack_require__(1);
    var Parchment = {
        Scope: Registry.Scope,
        create: Registry.create,
        find: Registry.find,
        query: Registry.query,
        register: Registry.register,
        Container: container_1.default,
        Format: format_1.default,
        Leaf: leaf_1.default,
        Embed: embed_1.default,
        Scroll: scroll_1.default,
        Block: block_1.default,
        Inline: inline_1.default,
        Text: text_1.default,
        Attributor: {
            Attribute: attributor_1.default,
            Class: class_1.default,
            Style: style_1.default,
            Store: store_1.default,
        },
    };
    exports.default = Parchment;


    /***/ }),
    /* 1 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var ParchmentError = /** @class */ (function (_super) {
        __extends(ParchmentError, _super);
        function ParchmentError(message) {
            var _this = this;
            message = '[Parchment] ' + message;
            _this = _super.call(this, message) || this;
            _this.message = message;
            _this.name = _this.constructor.name;
            return _this;
        }
        return ParchmentError;
    }(Error));
    exports.ParchmentError = ParchmentError;
    var attributes = {};
    var classes = {};
    var tags = {};
    var types = {};
    exports.DATA_KEY = '__blot';
    var Scope;
    (function (Scope) {
        Scope[Scope["TYPE"] = 3] = "TYPE";
        Scope[Scope["LEVEL"] = 12] = "LEVEL";
        Scope[Scope["ATTRIBUTE"] = 13] = "ATTRIBUTE";
        Scope[Scope["BLOT"] = 14] = "BLOT";
        Scope[Scope["INLINE"] = 7] = "INLINE";
        Scope[Scope["BLOCK"] = 11] = "BLOCK";
        Scope[Scope["BLOCK_BLOT"] = 10] = "BLOCK_BLOT";
        Scope[Scope["INLINE_BLOT"] = 6] = "INLINE_BLOT";
        Scope[Scope["BLOCK_ATTRIBUTE"] = 9] = "BLOCK_ATTRIBUTE";
        Scope[Scope["INLINE_ATTRIBUTE"] = 5] = "INLINE_ATTRIBUTE";
        Scope[Scope["ANY"] = 15] = "ANY";
    })(Scope = exports.Scope || (exports.Scope = {}));
    function create(input, value) {
        var match = query(input);
        if (match == null) {
            throw new ParchmentError("Unable to create " + input + " blot");
        }
        var BlotClass = match;
        var node = 
        // @ts-ignore
        input instanceof Node || input['nodeType'] === Node.TEXT_NODE ? input : BlotClass.create(value);
        return new BlotClass(node, value);
    }
    exports.create = create;
    function find(node, bubble) {
        if (bubble === void 0) { bubble = false; }
        if (node == null)
            return null;
        // @ts-ignore
        if (node[exports.DATA_KEY] != null)
            return node[exports.DATA_KEY].blot;
        if (bubble)
            return find(node.parentNode, bubble);
        return null;
    }
    exports.find = find;
    function query(query, scope) {
        if (scope === void 0) { scope = Scope.ANY; }
        var match;
        if (typeof query === 'string') {
            match = types[query] || attributes[query];
            // @ts-ignore
        }
        else if (query instanceof Text || query['nodeType'] === Node.TEXT_NODE) {
            match = types['text'];
        }
        else if (typeof query === 'number') {
            if (query & Scope.LEVEL & Scope.BLOCK) {
                match = types['block'];
            }
            else if (query & Scope.LEVEL & Scope.INLINE) {
                match = types['inline'];
            }
        }
        else if (query instanceof HTMLElement) {
            var names = (query.getAttribute('class') || '').split(/\s+/);
            for (var i in names) {
                match = classes[names[i]];
                if (match)
                    break;
            }
            match = match || tags[query.tagName];
        }
        if (match == null)
            return null;
        // @ts-ignore
        if (scope & Scope.LEVEL & match.scope && scope & Scope.TYPE & match.scope)
            return match;
        return null;
    }
    exports.query = query;
    function register() {
        var Definitions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            Definitions[_i] = arguments[_i];
        }
        if (Definitions.length > 1) {
            return Definitions.map(function (d) {
                return register(d);
            });
        }
        var Definition = Definitions[0];
        if (typeof Definition.blotName !== 'string' && typeof Definition.attrName !== 'string') {
            throw new ParchmentError('Invalid definition');
        }
        else if (Definition.blotName === 'abstract') {
            throw new ParchmentError('Cannot register abstract class');
        }
        types[Definition.blotName || Definition.attrName] = Definition;
        if (typeof Definition.keyName === 'string') {
            attributes[Definition.keyName] = Definition;
        }
        else {
            if (Definition.className != null) {
                classes[Definition.className] = Definition;
            }
            if (Definition.tagName != null) {
                if (Array.isArray(Definition.tagName)) {
                    Definition.tagName = Definition.tagName.map(function (tagName) {
                        return tagName.toUpperCase();
                    });
                }
                else {
                    Definition.tagName = Definition.tagName.toUpperCase();
                }
                var tagNames = Array.isArray(Definition.tagName) ? Definition.tagName : [Definition.tagName];
                tagNames.forEach(function (tag) {
                    if (tags[tag] == null || Definition.className == null) {
                        tags[tag] = Definition;
                    }
                });
            }
        }
        return Definition;
    }
    exports.register = register;


    /***/ }),
    /* 2 */
    /***/ (function(module, exports, __webpack_require__) {

    var diff = __webpack_require__(51);
    var equal = __webpack_require__(11);
    var extend = __webpack_require__(3);
    var op = __webpack_require__(20);


    var NULL_CHARACTER = String.fromCharCode(0);  // Placeholder char for embed in diff()


    var Delta = function (ops) {
      // Assume we are given a well formed ops
      if (Array.isArray(ops)) {
        this.ops = ops;
      } else if (ops != null && Array.isArray(ops.ops)) {
        this.ops = ops.ops;
      } else {
        this.ops = [];
      }
    };


    Delta.prototype.insert = function (text, attributes) {
      var newOp = {};
      if (text.length === 0) return this;
      newOp.insert = text;
      if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
        newOp.attributes = attributes;
      }
      return this.push(newOp);
    };

    Delta.prototype['delete'] = function (length) {
      if (length <= 0) return this;
      return this.push({ 'delete': length });
    };

    Delta.prototype.retain = function (length, attributes) {
      if (length <= 0) return this;
      var newOp = { retain: length };
      if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
        newOp.attributes = attributes;
      }
      return this.push(newOp);
    };

    Delta.prototype.push = function (newOp) {
      var index = this.ops.length;
      var lastOp = this.ops[index - 1];
      newOp = extend(true, {}, newOp);
      if (typeof lastOp === 'object') {
        if (typeof newOp['delete'] === 'number' && typeof lastOp['delete'] === 'number') {
          this.ops[index - 1] = { 'delete': lastOp['delete'] + newOp['delete'] };
          return this;
        }
        // Since it does not matter if we insert before or after deleting at the same index,
        // always prefer to insert first
        if (typeof lastOp['delete'] === 'number' && newOp.insert != null) {
          index -= 1;
          lastOp = this.ops[index - 1];
          if (typeof lastOp !== 'object') {
            this.ops.unshift(newOp);
            return this;
          }
        }
        if (equal(newOp.attributes, lastOp.attributes)) {
          if (typeof newOp.insert === 'string' && typeof lastOp.insert === 'string') {
            this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
            if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
            return this;
          } else if (typeof newOp.retain === 'number' && typeof lastOp.retain === 'number') {
            this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
            if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes;
            return this;
          }
        }
      }
      if (index === this.ops.length) {
        this.ops.push(newOp);
      } else {
        this.ops.splice(index, 0, newOp);
      }
      return this;
    };

    Delta.prototype.chop = function () {
      var lastOp = this.ops[this.ops.length - 1];
      if (lastOp && lastOp.retain && !lastOp.attributes) {
        this.ops.pop();
      }
      return this;
    };

    Delta.prototype.filter = function (predicate) {
      return this.ops.filter(predicate);
    };

    Delta.prototype.forEach = function (predicate) {
      this.ops.forEach(predicate);
    };

    Delta.prototype.map = function (predicate) {
      return this.ops.map(predicate);
    };

    Delta.prototype.partition = function (predicate) {
      var passed = [], failed = [];
      this.forEach(function(op) {
        var target = predicate(op) ? passed : failed;
        target.push(op);
      });
      return [passed, failed];
    };

    Delta.prototype.reduce = function (predicate, initial) {
      return this.ops.reduce(predicate, initial);
    };

    Delta.prototype.changeLength = function () {
      return this.reduce(function (length, elem) {
        if (elem.insert) {
          return length + op.length(elem);
        } else if (elem.delete) {
          return length - elem.delete;
        }
        return length;
      }, 0);
    };

    Delta.prototype.length = function () {
      return this.reduce(function (length, elem) {
        return length + op.length(elem);
      }, 0);
    };

    Delta.prototype.slice = function (start, end) {
      start = start || 0;
      if (typeof end !== 'number') end = Infinity;
      var ops = [];
      var iter = op.iterator(this.ops);
      var index = 0;
      while (index < end && iter.hasNext()) {
        var nextOp;
        if (index < start) {
          nextOp = iter.next(start - index);
        } else {
          nextOp = iter.next(end - index);
          ops.push(nextOp);
        }
        index += op.length(nextOp);
      }
      return new Delta(ops);
    };


    Delta.prototype.compose = function (other) {
      var thisIter = op.iterator(this.ops);
      var otherIter = op.iterator(other.ops);
      var ops = [];
      var firstOther = otherIter.peek();
      if (firstOther != null && typeof firstOther.retain === 'number' && firstOther.attributes == null) {
        var firstLeft = firstOther.retain;
        while (thisIter.peekType() === 'insert' && thisIter.peekLength() <= firstLeft) {
          firstLeft -= thisIter.peekLength();
          ops.push(thisIter.next());
        }
        if (firstOther.retain - firstLeft > 0) {
          otherIter.next(firstOther.retain - firstLeft);
        }
      }
      var delta = new Delta(ops);
      while (thisIter.hasNext() || otherIter.hasNext()) {
        if (otherIter.peekType() === 'insert') {
          delta.push(otherIter.next());
        } else if (thisIter.peekType() === 'delete') {
          delta.push(thisIter.next());
        } else {
          var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
          var thisOp = thisIter.next(length);
          var otherOp = otherIter.next(length);
          if (typeof otherOp.retain === 'number') {
            var newOp = {};
            if (typeof thisOp.retain === 'number') {
              newOp.retain = length;
            } else {
              newOp.insert = thisOp.insert;
            }
            // Preserve null when composing with a retain, otherwise remove it for inserts
            var attributes = op.attributes.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === 'number');
            if (attributes) newOp.attributes = attributes;
            delta.push(newOp);

            // Optimization if rest of other is just retain
            if (!otherIter.hasNext() && equal(delta.ops[delta.ops.length - 1], newOp)) {
              var rest = new Delta(thisIter.rest());
              return delta.concat(rest).chop();
            }

          // Other op should be delete, we could be an insert or retain
          // Insert + delete cancels out
          } else if (typeof otherOp['delete'] === 'number' && typeof thisOp.retain === 'number') {
            delta.push(otherOp);
          }
        }
      }
      return delta.chop();
    };

    Delta.prototype.concat = function (other) {
      var delta = new Delta(this.ops.slice());
      if (other.ops.length > 0) {
        delta.push(other.ops[0]);
        delta.ops = delta.ops.concat(other.ops.slice(1));
      }
      return delta;
    };

    Delta.prototype.diff = function (other, index) {
      if (this.ops === other.ops) {
        return new Delta();
      }
      var strings = [this, other].map(function (delta) {
        return delta.map(function (op) {
          if (op.insert != null) {
            return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
          }
          var prep = (delta === other) ? 'on' : 'with';
          throw new Error('diff() called ' + prep + ' non-document');
        }).join('');
      });
      var delta = new Delta();
      var diffResult = diff(strings[0], strings[1], index);
      var thisIter = op.iterator(this.ops);
      var otherIter = op.iterator(other.ops);
      diffResult.forEach(function (component) {
        var length = component[1].length;
        while (length > 0) {
          var opLength = 0;
          switch (component[0]) {
            case diff.INSERT:
              opLength = Math.min(otherIter.peekLength(), length);
              delta.push(otherIter.next(opLength));
              break;
            case diff.DELETE:
              opLength = Math.min(length, thisIter.peekLength());
              thisIter.next(opLength);
              delta['delete'](opLength);
              break;
            case diff.EQUAL:
              opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
              var thisOp = thisIter.next(opLength);
              var otherOp = otherIter.next(opLength);
              if (equal(thisOp.insert, otherOp.insert)) {
                delta.retain(opLength, op.attributes.diff(thisOp.attributes, otherOp.attributes));
              } else {
                delta.push(otherOp)['delete'](opLength);
              }
              break;
          }
          length -= opLength;
        }
      });
      return delta.chop();
    };

    Delta.prototype.eachLine = function (predicate, newline) {
      newline = newline || '\n';
      var iter = op.iterator(this.ops);
      var line = new Delta();
      var i = 0;
      while (iter.hasNext()) {
        if (iter.peekType() !== 'insert') return;
        var thisOp = iter.peek();
        var start = op.length(thisOp) - iter.peekLength();
        var index = typeof thisOp.insert === 'string' ?
          thisOp.insert.indexOf(newline, start) - start : -1;
        if (index < 0) {
          line.push(iter.next());
        } else if (index > 0) {
          line.push(iter.next(index));
        } else {
          if (predicate(line, iter.next(1).attributes || {}, i) === false) {
            return;
          }
          i += 1;
          line = new Delta();
        }
      }
      if (line.length() > 0) {
        predicate(line, {}, i);
      }
    };

    Delta.prototype.transform = function (other, priority) {
      priority = !!priority;
      if (typeof other === 'number') {
        return this.transformPosition(other, priority);
      }
      var thisIter = op.iterator(this.ops);
      var otherIter = op.iterator(other.ops);
      var delta = new Delta();
      while (thisIter.hasNext() || otherIter.hasNext()) {
        if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
          delta.retain(op.length(thisIter.next()));
        } else if (otherIter.peekType() === 'insert') {
          delta.push(otherIter.next());
        } else {
          var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
          var thisOp = thisIter.next(length);
          var otherOp = otherIter.next(length);
          if (thisOp['delete']) {
            // Our delete either makes their delete redundant or removes their retain
            continue;
          } else if (otherOp['delete']) {
            delta.push(otherOp);
          } else {
            // We retain either their retain or insert
            delta.retain(length, op.attributes.transform(thisOp.attributes, otherOp.attributes, priority));
          }
        }
      }
      return delta.chop();
    };

    Delta.prototype.transformPosition = function (index, priority) {
      priority = !!priority;
      var thisIter = op.iterator(this.ops);
      var offset = 0;
      while (thisIter.hasNext() && offset <= index) {
        var length = thisIter.peekLength();
        var nextType = thisIter.peekType();
        thisIter.next();
        if (nextType === 'delete') {
          index -= Math.min(length, index - offset);
          continue;
        } else if (nextType === 'insert' && (offset < index || !priority)) {
          index += length;
        }
        offset += length;
      }
      return index;
    };


    module.exports = Delta;


    /***/ }),
    /* 3 */
    /***/ (function(module, exports) {

    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var defineProperty = Object.defineProperty;
    var gOPD = Object.getOwnPropertyDescriptor;

    var isArray = function isArray(arr) {
    	if (typeof Array.isArray === 'function') {
    		return Array.isArray(arr);
    	}

    	return toStr.call(arr) === '[object Array]';
    };

    var isPlainObject = function isPlainObject(obj) {
    	if (!obj || toStr.call(obj) !== '[object Object]') {
    		return false;
    	}

    	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    	// Not own constructor property must be Object
    	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    		return false;
    	}

    	// Own properties are enumerated firstly, so to speed up,
    	// if last one is own, then all properties are own.
    	var key;
    	for (key in obj) { /**/ }

    	return typeof key === 'undefined' || hasOwn.call(obj, key);
    };

    // If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
    var setProperty = function setProperty(target, options) {
    	if (defineProperty && options.name === '__proto__') {
    		defineProperty(target, options.name, {
    			enumerable: true,
    			configurable: true,
    			value: options.newValue,
    			writable: true
    		});
    	} else {
    		target[options.name] = options.newValue;
    	}
    };

    // Return undefined instead of __proto__ if '__proto__' is not an own property
    var getProperty = function getProperty(obj, name) {
    	if (name === '__proto__') {
    		if (!hasOwn.call(obj, name)) {
    			return void 0;
    		} else if (gOPD) {
    			// In early versions of node, obj['__proto__'] is buggy when obj has
    			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
    			return gOPD(obj, name).value;
    		}
    	}

    	return obj[name];
    };

    module.exports = function extend() {
    	var options, name, src, copy, copyIsArray, clone;
    	var target = arguments[0];
    	var i = 1;
    	var length = arguments.length;
    	var deep = false;

    	// Handle a deep copy situation
    	if (typeof target === 'boolean') {
    		deep = target;
    		target = arguments[1] || {};
    		// skip the boolean and the target
    		i = 2;
    	}
    	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
    		target = {};
    	}

    	for (; i < length; ++i) {
    		options = arguments[i];
    		// Only deal with non-null/undefined values
    		if (options != null) {
    			// Extend the base object
    			for (name in options) {
    				src = getProperty(target, name);
    				copy = getProperty(options, name);

    				// Prevent never-ending loop
    				if (target !== copy) {
    					// Recurse if we're merging plain objects or arrays
    					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
    						if (copyIsArray) {
    							copyIsArray = false;
    							clone = src && isArray(src) ? src : [];
    						} else {
    							clone = src && isPlainObject(src) ? src : {};
    						}

    						// Never move original objects, clone them
    						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

    					// Don't bring in undefined values
    					} else if (typeof copy !== 'undefined') {
    						setProperty(target, { name: name, newValue: copy });
    					}
    				}
    			}
    		}
    	}

    	// Return the modified object
    	return target;
    };


    /***/ }),
    /* 4 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.BlockEmbed = exports.bubbleFormats = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var NEWLINE_LENGTH = 1;

    var BlockEmbed = function (_Parchment$Embed) {
      _inherits(BlockEmbed, _Parchment$Embed);

      function BlockEmbed() {
        _classCallCheck(this, BlockEmbed);

        return _possibleConstructorReturn(this, (BlockEmbed.__proto__ || Object.getPrototypeOf(BlockEmbed)).apply(this, arguments));
      }

      _createClass(BlockEmbed, [{
        key: 'attach',
        value: function attach() {
          _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'attach', this).call(this);
          this.attributes = new _parchment2.default.Attributor.Store(this.domNode);
        }
      }, {
        key: 'delta',
        value: function delta() {
          return new _quillDelta2.default().insert(this.value(), (0, _extend2.default)(this.formats(), this.attributes.values()));
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          var attribute = _parchment2.default.query(name, _parchment2.default.Scope.BLOCK_ATTRIBUTE);
          if (attribute != null) {
            this.attributes.attribute(attribute, value);
          }
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          this.format(name, value);
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (typeof value === 'string' && value.endsWith('\n')) {
            var block = _parchment2.default.create(Block.blotName);
            this.parent.insertBefore(block, index === 0 ? this : this.next);
            block.insertAt(0, value.slice(0, -1));
          } else {
            _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'insertAt', this).call(this, index, value, def);
          }
        }
      }]);

      return BlockEmbed;
    }(_parchment2.default.Embed);

    BlockEmbed.scope = _parchment2.default.Scope.BLOCK_BLOT;
    // It is important for cursor behavior BlockEmbeds use tags that are block level elements


    var Block = function (_Parchment$Block) {
      _inherits(Block, _Parchment$Block);

      function Block(domNode) {
        _classCallCheck(this, Block);

        var _this2 = _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this, domNode));

        _this2.cache = {};
        return _this2;
      }

      _createClass(Block, [{
        key: 'delta',
        value: function delta() {
          if (this.cache.delta == null) {
            this.cache.delta = this.descendants(_parchment2.default.Leaf).reduce(function (delta, leaf) {
              if (leaf.length() === 0) {
                return delta;
              } else {
                return delta.insert(leaf.value(), bubbleFormats(leaf));
              }
            }, new _quillDelta2.default()).insert('\n', bubbleFormats(this));
          }
          return this.cache.delta;
        }
      }, {
        key: 'deleteAt',
        value: function deleteAt(index, length) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'deleteAt', this).call(this, index, length);
          this.cache = {};
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          if (length <= 0) return;
          if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
            if (index + length === this.length()) {
              this.format(name, value);
            }
          } else {
            _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'formatAt', this).call(this, index, Math.min(length, this.length() - index - 1), name, value);
          }
          this.cache = {};
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (def != null) return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, index, value, def);
          if (value.length === 0) return;
          var lines = value.split('\n');
          var text = lines.shift();
          if (text.length > 0) {
            if (index < this.length() - 1 || this.children.tail == null) {
              _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, Math.min(index, this.length() - 1), text);
            } else {
              this.children.tail.insertAt(this.children.tail.length(), text);
            }
            this.cache = {};
          }
          var block = this;
          lines.reduce(function (index, line) {
            block = block.split(index, true);
            block.insertAt(0, line);
            return line.length;
          }, index + text.length);
        }
      }, {
        key: 'insertBefore',
        value: function insertBefore(blot, ref) {
          var head = this.children.head;
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertBefore', this).call(this, blot, ref);
          if (head instanceof _break2.default) {
            head.remove();
          }
          this.cache = {};
        }
      }, {
        key: 'length',
        value: function length() {
          if (this.cache.length == null) {
            this.cache.length = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'length', this).call(this) + NEWLINE_LENGTH;
          }
          return this.cache.length;
        }
      }, {
        key: 'moveChildren',
        value: function moveChildren(target, ref) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'moveChildren', this).call(this, target, ref);
          this.cache = {};
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'optimize', this).call(this, context);
          this.cache = {};
        }
      }, {
        key: 'path',
        value: function path(index) {
          return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'path', this).call(this, index, true);
        }
      }, {
        key: 'removeChild',
        value: function removeChild(child) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'removeChild', this).call(this, child);
          this.cache = {};
        }
      }, {
        key: 'split',
        value: function split(index) {
          var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (force && (index === 0 || index >= this.length() - NEWLINE_LENGTH)) {
            var clone = this.clone();
            if (index === 0) {
              this.parent.insertBefore(clone, this);
              return this;
            } else {
              this.parent.insertBefore(clone, this.next);
              return clone;
            }
          } else {
            var next = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'split', this).call(this, index, force);
            this.cache = {};
            return next;
          }
        }
      }]);

      return Block;
    }(_parchment2.default.Block);

    Block.blotName = 'block';
    Block.tagName = 'P';
    Block.defaultChild = 'break';
    Block.allowedChildren = [_inline2.default, _parchment2.default.Embed, _text2.default];

    function bubbleFormats(blot) {
      var formats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (blot == null) return formats;
      if (typeof blot.formats === 'function') {
        formats = (0, _extend2.default)(formats, blot.formats());
      }
      if (blot.parent == null || blot.parent.blotName == 'scroll' || blot.parent.statics.scope !== blot.statics.scope) {
        return formats;
      }
      return bubbleFormats(blot.parent, formats);
    }

    exports.bubbleFormats = bubbleFormats;
    exports.BlockEmbed = BlockEmbed;
    exports.default = Block;

    /***/ }),
    /* 5 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.overload = exports.expandConfig = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    __webpack_require__(50);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _editor = __webpack_require__(14);

    var _editor2 = _interopRequireDefault(_editor);

    var _emitter3 = __webpack_require__(8);

    var _emitter4 = _interopRequireDefault(_emitter3);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _selection = __webpack_require__(15);

    var _selection2 = _interopRequireDefault(_selection);

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _theme = __webpack_require__(34);

    var _theme2 = _interopRequireDefault(_theme);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var debug = (0, _logger2.default)('quill');

    var Quill = function () {
      _createClass(Quill, null, [{
        key: 'debug',
        value: function debug(limit) {
          if (limit === true) {
            limit = 'log';
          }
          _logger2.default.level(limit);
        }
      }, {
        key: 'find',
        value: function find(node) {
          return node.__quill || _parchment2.default.find(node);
        }
      }, {
        key: 'import',
        value: function _import(name) {
          if (this.imports[name] == null) {
            debug.error('Cannot import ' + name + '. Are you sure it was registered?');
          }
          return this.imports[name];
        }
      }, {
        key: 'register',
        value: function register(path, target) {
          var _this = this;

          var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

          if (typeof path !== 'string') {
            var name = path.attrName || path.blotName;
            if (typeof name === 'string') {
              // register(Blot | Attributor, overwrite)
              this.register('formats/' + name, path, target);
            } else {
              Object.keys(path).forEach(function (key) {
                _this.register(key, path[key], target);
              });
            }
          } else {
            if (this.imports[path] != null && !overwrite) {
              debug.warn('Overwriting ' + path + ' with', target);
            }
            this.imports[path] = target;
            if ((path.startsWith('blots/') || path.startsWith('formats/')) && target.blotName !== 'abstract') {
              _parchment2.default.register(target);
            } else if (path.startsWith('modules') && typeof target.register === 'function') {
              target.register();
            }
          }
        }
      }]);

      function Quill(container) {
        var _this2 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Quill);

        this.options = expandConfig(container, options);
        this.container = this.options.container;
        if (this.container == null) {
          return debug.error('Invalid Quill container', container);
        }
        if (this.options.debug) {
          Quill.debug(this.options.debug);
        }
        var html = this.container.innerHTML.trim();
        this.container.classList.add('ql-container');
        this.container.innerHTML = '';
        this.container.__quill = this;
        this.root = this.addContainer('ql-editor');
        this.root.classList.add('ql-blank');
        this.root.setAttribute('data-gramm', false);
        this.scrollingContainer = this.options.scrollingContainer || this.root;
        this.emitter = new _emitter4.default();
        this.scroll = _parchment2.default.create(this.root, {
          emitter: this.emitter,
          whitelist: this.options.formats
        });
        this.editor = new _editor2.default(this.scroll);
        this.selection = new _selection2.default(this.scroll, this.emitter);
        this.theme = new this.options.theme(this, this.options);
        this.keyboard = this.theme.addModule('keyboard');
        this.clipboard = this.theme.addModule('clipboard');
        this.history = this.theme.addModule('history');
        this.theme.init();
        this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type) {
          if (type === _emitter4.default.events.TEXT_CHANGE) {
            _this2.root.classList.toggle('ql-blank', _this2.editor.isBlank());
          }
        });
        this.emitter.on(_emitter4.default.events.SCROLL_UPDATE, function (source, mutations) {
          var range = _this2.selection.lastRange;
          var index = range && range.length === 0 ? range.index : undefined;
          modify.call(_this2, function () {
            return _this2.editor.update(null, mutations, index);
          }, source);
        });
        var contents = this.clipboard.convert('<div class=\'ql-editor\' style="white-space: normal;">' + html + '<p><br></p></div>');
        this.setContents(contents);
        this.history.clear();
        if (this.options.placeholder) {
          this.root.setAttribute('data-placeholder', this.options.placeholder);
        }
        if (this.options.readOnly) {
          this.disable();
        }
      }

      _createClass(Quill, [{
        key: 'addContainer',
        value: function addContainer(container) {
          var refNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          if (typeof container === 'string') {
            var className = container;
            container = document.createElement('div');
            container.classList.add(className);
          }
          this.container.insertBefore(container, refNode);
          return container;
        }
      }, {
        key: 'blur',
        value: function blur() {
          this.selection.setRange(null);
        }
      }, {
        key: 'deleteText',
        value: function deleteText(index, length, source) {
          var _this3 = this;

          var _overload = overload(index, length, source);

          var _overload2 = _slicedToArray(_overload, 4);

          index = _overload2[0];
          length = _overload2[1];
          source = _overload2[3];

          return modify.call(this, function () {
            return _this3.editor.deleteText(index, length);
          }, source, index, -1 * length);
        }
      }, {
        key: 'disable',
        value: function disable() {
          this.enable(false);
        }
      }, {
        key: 'enable',
        value: function enable() {
          var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          this.scroll.enable(enabled);
          this.container.classList.toggle('ql-disabled', !enabled);
        }
      }, {
        key: 'focus',
        value: function focus() {
          var scrollTop = this.scrollingContainer.scrollTop;
          this.selection.focus();
          this.scrollingContainer.scrollTop = scrollTop;
          this.scrollIntoView();
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          var _this4 = this;

          var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

          return modify.call(this, function () {
            var range = _this4.getSelection(true);
            var change = new _quillDelta2.default();
            if (range == null) {
              return change;
            } else if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
              change = _this4.editor.formatLine(range.index, range.length, _defineProperty({}, name, value));
            } else if (range.length === 0) {
              _this4.selection.format(name, value);
              return change;
            } else {
              change = _this4.editor.formatText(range.index, range.length, _defineProperty({}, name, value));
            }
            _this4.setSelection(range, _emitter4.default.sources.SILENT);
            return change;
          }, source);
        }
      }, {
        key: 'formatLine',
        value: function formatLine(index, length, name, value, source) {
          var _this5 = this;

          var formats = void 0;

          var _overload3 = overload(index, length, name, value, source);

          var _overload4 = _slicedToArray(_overload3, 4);

          index = _overload4[0];
          length = _overload4[1];
          formats = _overload4[2];
          source = _overload4[3];

          return modify.call(this, function () {
            return _this5.editor.formatLine(index, length, formats);
          }, source, index, 0);
        }
      }, {
        key: 'formatText',
        value: function formatText(index, length, name, value, source) {
          var _this6 = this;

          var formats = void 0;

          var _overload5 = overload(index, length, name, value, source);

          var _overload6 = _slicedToArray(_overload5, 4);

          index = _overload6[0];
          length = _overload6[1];
          formats = _overload6[2];
          source = _overload6[3];

          return modify.call(this, function () {
            return _this6.editor.formatText(index, length, formats);
          }, source, index, 0);
        }
      }, {
        key: 'getBounds',
        value: function getBounds(index) {
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var bounds = void 0;
          if (typeof index === 'number') {
            bounds = this.selection.getBounds(index, length);
          } else {
            bounds = this.selection.getBounds(index.index, index.length);
          }
          var containerBounds = this.container.getBoundingClientRect();
          return {
            bottom: bounds.bottom - containerBounds.top,
            height: bounds.height,
            left: bounds.left - containerBounds.left,
            right: bounds.right - containerBounds.left,
            top: bounds.top - containerBounds.top,
            width: bounds.width
          };
        }
      }, {
        key: 'getContents',
        value: function getContents() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

          var _overload7 = overload(index, length);

          var _overload8 = _slicedToArray(_overload7, 2);

          index = _overload8[0];
          length = _overload8[1];

          return this.editor.getContents(index, length);
        }
      }, {
        key: 'getFormat',
        value: function getFormat() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getSelection(true);
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          if (typeof index === 'number') {
            return this.editor.getFormat(index, length);
          } else {
            return this.editor.getFormat(index.index, index.length);
          }
        }
      }, {
        key: 'getIndex',
        value: function getIndex(blot) {
          return blot.offset(this.scroll);
        }
      }, {
        key: 'getLength',
        value: function getLength() {
          return this.scroll.length();
        }
      }, {
        key: 'getLeaf',
        value: function getLeaf(index) {
          return this.scroll.leaf(index);
        }
      }, {
        key: 'getLine',
        value: function getLine(index) {
          return this.scroll.line(index);
        }
      }, {
        key: 'getLines',
        value: function getLines() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

          if (typeof index !== 'number') {
            return this.scroll.lines(index.index, index.length);
          } else {
            return this.scroll.lines(index, length);
          }
        }
      }, {
        key: 'getModule',
        value: function getModule(name) {
          return this.theme.modules[name];
        }
      }, {
        key: 'getSelection',
        value: function getSelection() {
          var focus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          if (focus) this.focus();
          this.update(); // Make sure we access getRange with editor in consistent state
          return this.selection.getRange()[0];
        }
      }, {
        key: 'getText',
        value: function getText() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

          var _overload9 = overload(index, length);

          var _overload10 = _slicedToArray(_overload9, 2);

          index = _overload10[0];
          length = _overload10[1];

          return this.editor.getText(index, length);
        }
      }, {
        key: 'hasFocus',
        value: function hasFocus() {
          return this.selection.hasFocus();
        }
      }, {
        key: 'insertEmbed',
        value: function insertEmbed(index, embed, value) {
          var _this7 = this;

          var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Quill.sources.API;

          return modify.call(this, function () {
            return _this7.editor.insertEmbed(index, embed, value);
          }, source, index);
        }
      }, {
        key: 'insertText',
        value: function insertText(index, text, name, value, source) {
          var _this8 = this;

          var formats = void 0;

          var _overload11 = overload(index, 0, name, value, source);

          var _overload12 = _slicedToArray(_overload11, 4);

          index = _overload12[0];
          formats = _overload12[2];
          source = _overload12[3];

          return modify.call(this, function () {
            return _this8.editor.insertText(index, text, formats);
          }, source, index, text.length);
        }
      }, {
        key: 'isEnabled',
        value: function isEnabled() {
          return !this.container.classList.contains('ql-disabled');
        }
      }, {
        key: 'off',
        value: function off() {
          return this.emitter.off.apply(this.emitter, arguments);
        }
      }, {
        key: 'on',
        value: function on() {
          return this.emitter.on.apply(this.emitter, arguments);
        }
      }, {
        key: 'once',
        value: function once() {
          return this.emitter.once.apply(this.emitter, arguments);
        }
      }, {
        key: 'pasteHTML',
        value: function pasteHTML(index, html, source) {
          this.clipboard.dangerouslyPasteHTML(index, html, source);
        }
      }, {
        key: 'removeFormat',
        value: function removeFormat(index, length, source) {
          var _this9 = this;

          var _overload13 = overload(index, length, source);

          var _overload14 = _slicedToArray(_overload13, 4);

          index = _overload14[0];
          length = _overload14[1];
          source = _overload14[3];

          return modify.call(this, function () {
            return _this9.editor.removeFormat(index, length);
          }, source, index);
        }
      }, {
        key: 'scrollIntoView',
        value: function scrollIntoView() {
          this.selection.scrollIntoView(this.scrollingContainer);
        }
      }, {
        key: 'setContents',
        value: function setContents(delta) {
          var _this10 = this;

          var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

          return modify.call(this, function () {
            delta = new _quillDelta2.default(delta);
            var length = _this10.getLength();
            var deleted = _this10.editor.deleteText(0, length);
            var applied = _this10.editor.applyDelta(delta);
            var lastOp = applied.ops[applied.ops.length - 1];
            if (lastOp != null && typeof lastOp.insert === 'string' && lastOp.insert[lastOp.insert.length - 1] === '\n') {
              _this10.editor.deleteText(_this10.getLength() - 1, 1);
              applied.delete(1);
            }
            var ret = deleted.compose(applied);
            return ret;
          }, source);
        }
      }, {
        key: 'setSelection',
        value: function setSelection(index, length, source) {
          if (index == null) {
            this.selection.setRange(null, length || Quill.sources.API);
          } else {
            var _overload15 = overload(index, length, source);

            var _overload16 = _slicedToArray(_overload15, 4);

            index = _overload16[0];
            length = _overload16[1];
            source = _overload16[3];

            this.selection.setRange(new _selection.Range(index, length), source);
            if (source !== _emitter4.default.sources.SILENT) {
              this.selection.scrollIntoView(this.scrollingContainer);
            }
          }
        }
      }, {
        key: 'setText',
        value: function setText(text) {
          var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

          var delta = new _quillDelta2.default().insert(text);
          return this.setContents(delta, source);
        }
      }, {
        key: 'update',
        value: function update() {
          var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

          var change = this.scroll.update(source); // Will update selection before selection.update() does if text changes
          this.selection.update(source);
          return change;
        }
      }, {
        key: 'updateContents',
        value: function updateContents(delta) {
          var _this11 = this;

          var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

          return modify.call(this, function () {
            delta = new _quillDelta2.default(delta);
            return _this11.editor.applyDelta(delta, source);
          }, source, true);
        }
      }]);

      return Quill;
    }();

    Quill.DEFAULTS = {
      bounds: null,
      formats: null,
      modules: {},
      placeholder: '',
      readOnly: false,
      scrollingContainer: null,
      strict: true,
      theme: 'default'
    };
    Quill.events = _emitter4.default.events;
    Quill.sources = _emitter4.default.sources;
    // eslint-disable-next-line no-undef
    Quill.version =  "1.3.7";

    Quill.imports = {
      'delta': _quillDelta2.default,
      'parchment': _parchment2.default,
      'core/module': _module2.default,
      'core/theme': _theme2.default
    };

    function expandConfig(container, userConfig) {
      userConfig = (0, _extend2.default)(true, {
        container: container,
        modules: {
          clipboard: true,
          keyboard: true,
          history: true
        }
      }, userConfig);
      if (!userConfig.theme || userConfig.theme === Quill.DEFAULTS.theme) {
        userConfig.theme = _theme2.default;
      } else {
        userConfig.theme = Quill.import('themes/' + userConfig.theme);
        if (userConfig.theme == null) {
          throw new Error('Invalid theme ' + userConfig.theme + '. Did you register it?');
        }
      }
      var themeConfig = (0, _extend2.default)(true, {}, userConfig.theme.DEFAULTS);
      [themeConfig, userConfig].forEach(function (config) {
        config.modules = config.modules || {};
        Object.keys(config.modules).forEach(function (module) {
          if (config.modules[module] === true) {
            config.modules[module] = {};
          }
        });
      });
      var moduleNames = Object.keys(themeConfig.modules).concat(Object.keys(userConfig.modules));
      var moduleConfig = moduleNames.reduce(function (config, name) {
        var moduleClass = Quill.import('modules/' + name);
        if (moduleClass == null) {
          debug.error('Cannot load ' + name + ' module. Are you sure you registered it?');
        } else {
          config[name] = moduleClass.DEFAULTS || {};
        }
        return config;
      }, {});
      // Special case toolbar shorthand
      if (userConfig.modules != null && userConfig.modules.toolbar && userConfig.modules.toolbar.constructor !== Object) {
        userConfig.modules.toolbar = {
          container: userConfig.modules.toolbar
        };
      }
      userConfig = (0, _extend2.default)(true, {}, Quill.DEFAULTS, { modules: moduleConfig }, themeConfig, userConfig);
      ['bounds', 'container', 'scrollingContainer'].forEach(function (key) {
        if (typeof userConfig[key] === 'string') {
          userConfig[key] = document.querySelector(userConfig[key]);
        }
      });
      userConfig.modules = Object.keys(userConfig.modules).reduce(function (config, name) {
        if (userConfig.modules[name]) {
          config[name] = userConfig.modules[name];
        }
        return config;
      }, {});
      return userConfig;
    }

    // Handle selection preservation and TEXT_CHANGE emission
    // common to modification APIs
    function modify(modifier, source, index, shift) {
      if (this.options.strict && !this.isEnabled() && source === _emitter4.default.sources.USER) {
        return new _quillDelta2.default();
      }
      var range = index == null ? null : this.getSelection();
      var oldDelta = this.editor.delta;
      var change = modifier();
      if (range != null) {
        if (index === true) index = range.index;
        if (shift == null) {
          range = shiftRange(range, change, source);
        } else if (shift !== 0) {
          range = shiftRange(range, index, shift, source);
        }
        this.setSelection(range, _emitter4.default.sources.SILENT);
      }
      if (change.length() > 0) {
        var _emitter;

        var args = [_emitter4.default.events.TEXT_CHANGE, change, oldDelta, source];
        (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
        if (source !== _emitter4.default.sources.SILENT) {
          var _emitter2;

          (_emitter2 = this.emitter).emit.apply(_emitter2, args);
        }
      }
      return change;
    }

    function overload(index, length, name, value, source) {
      var formats = {};
      if (typeof index.index === 'number' && typeof index.length === 'number') {
        // Allow for throwaway end (used by insertText/insertEmbed)
        if (typeof length !== 'number') {
          source = value, value = name, name = length, length = index.length, index = index.index;
        } else {
          length = index.length, index = index.index;
        }
      } else if (typeof length !== 'number') {
        source = value, value = name, name = length, length = 0;
      }
      // Handle format being object, two format name/value strings or excluded
      if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
        formats = name;
        source = value;
      } else if (typeof name === 'string') {
        if (value != null) {
          formats[name] = value;
        } else {
          source = name;
        }
      }
      // Handle optional source
      source = source || _emitter4.default.sources.API;
      return [index, length, formats, source];
    }

    function shiftRange(range, index, length, source) {
      if (range == null) return null;
      var start = void 0,
          end = void 0;
      if (index instanceof _quillDelta2.default) {
        var _map = [range.index, range.index + range.length].map(function (pos) {
          return index.transformPosition(pos, source !== _emitter4.default.sources.USER);
        });

        var _map2 = _slicedToArray(_map, 2);

        start = _map2[0];
        end = _map2[1];
      } else {
        var _map3 = [range.index, range.index + range.length].map(function (pos) {
          if (pos < index || pos === index && source === _emitter4.default.sources.USER) return pos;
          if (length >= 0) {
            return pos + length;
          } else {
            return Math.max(index, pos + length);
          }
        });

        var _map4 = _slicedToArray(_map3, 2);

        start = _map4[0];
        end = _map4[1];
      }
      return new _selection.Range(start, end - start);
    }

    exports.expandConfig = expandConfig;
    exports.overload = overload;
    exports.default = Quill;

    /***/ }),
    /* 6 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Inline = function (_Parchment$Inline) {
      _inherits(Inline, _Parchment$Inline);

      function Inline() {
        _classCallCheck(this, Inline);

        return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
      }

      _createClass(Inline, [{
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          if (Inline.compare(this.statics.blotName, name) < 0 && _parchment2.default.query(name, _parchment2.default.Scope.BLOT)) {
            var blot = this.isolate(index, length);
            if (value) {
              blot.wrap(name, value);
            }
          } else {
            _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'formatAt', this).call(this, index, length, name, value);
          }
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'optimize', this).call(this, context);
          if (this.parent instanceof Inline && Inline.compare(this.statics.blotName, this.parent.statics.blotName) > 0) {
            var parent = this.parent.isolate(this.offset(), this.length());
            this.moveChildren(parent);
            parent.wrap(this);
          }
        }
      }], [{
        key: 'compare',
        value: function compare(self, other) {
          var selfIndex = Inline.order.indexOf(self);
          var otherIndex = Inline.order.indexOf(other);
          if (selfIndex >= 0 || otherIndex >= 0) {
            return selfIndex - otherIndex;
          } else if (self === other) {
            return 0;
          } else if (self < other) {
            return -1;
          } else {
            return 1;
          }
        }
      }]);

      return Inline;
    }(_parchment2.default.Inline);

    Inline.allowedChildren = [Inline, _parchment2.default.Embed, _text2.default];
    // Lower index means deeper in the DOM tree, since not found (-1) is for embeds
    Inline.order = ['cursor', 'inline', // Must be lower
    'underline', 'strike', 'italic', 'bold', 'script', 'link', 'code' // Must be higher
    ];

    exports.default = Inline;

    /***/ }),
    /* 7 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TextBlot = function (_Parchment$Text) {
      _inherits(TextBlot, _Parchment$Text);

      function TextBlot() {
        _classCallCheck(this, TextBlot);

        return _possibleConstructorReturn(this, (TextBlot.__proto__ || Object.getPrototypeOf(TextBlot)).apply(this, arguments));
      }

      return TextBlot;
    }(_parchment2.default.Text);

    exports.default = TextBlot;

    /***/ }),
    /* 8 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _eventemitter = __webpack_require__(54);

    var _eventemitter2 = _interopRequireDefault(_eventemitter);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:events');

    var EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

    EVENTS.forEach(function (eventName) {
      document.addEventListener(eventName, function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        [].slice.call(document.querySelectorAll('.ql-container')).forEach(function (node) {
          // TODO use WeakMap
          if (node.__quill && node.__quill.emitter) {
            var _node$__quill$emitter;

            (_node$__quill$emitter = node.__quill.emitter).handleDOM.apply(_node$__quill$emitter, args);
          }
        });
      });
    });

    var Emitter = function (_EventEmitter) {
      _inherits(Emitter, _EventEmitter);

      function Emitter() {
        _classCallCheck(this, Emitter);

        var _this = _possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

        _this.listeners = {};
        _this.on('error', debug.error);
        return _this;
      }

      _createClass(Emitter, [{
        key: 'emit',
        value: function emit() {
          debug.log.apply(debug, arguments);
          _get(Emitter.prototype.__proto__ || Object.getPrototypeOf(Emitter.prototype), 'emit', this).apply(this, arguments);
        }
      }, {
        key: 'handleDOM',
        value: function handleDOM(event) {
          for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          (this.listeners[event.type] || []).forEach(function (_ref) {
            var node = _ref.node,
                handler = _ref.handler;

            if (event.target === node || node.contains(event.target)) {
              handler.apply(undefined, [event].concat(args));
            }
          });
        }
      }, {
        key: 'listenDOM',
        value: function listenDOM(eventName, node, handler) {
          if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
          }
          this.listeners[eventName].push({ node: node, handler: handler });
        }
      }]);

      return Emitter;
    }(_eventemitter2.default);

    Emitter.events = {
      EDITOR_CHANGE: 'editor-change',
      SCROLL_BEFORE_UPDATE: 'scroll-before-update',
      SCROLL_OPTIMIZE: 'scroll-optimize',
      SCROLL_UPDATE: 'scroll-update',
      SELECTION_CHANGE: 'selection-change',
      TEXT_CHANGE: 'text-change'
    };
    Emitter.sources = {
      API: 'api',
      SILENT: 'silent',
      USER: 'user'
    };

    exports.default = Emitter;

    /***/ }),
    /* 9 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Module = function Module(quill) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Module);

      this.quill = quill;
      this.options = options;
    };

    Module.DEFAULTS = {};

    exports.default = Module;

    /***/ }),
    /* 10 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var levels = ['error', 'warn', 'log', 'info'];
    var level = 'warn';

    function debug(method) {
      if (levels.indexOf(method) <= levels.indexOf(level)) {
        var _console;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        (_console = console)[method].apply(_console, args); // eslint-disable-line no-console
      }
    }

    function namespace(ns) {
      return levels.reduce(function (logger, method) {
        logger[method] = debug.bind(console, method, ns);
        return logger;
      }, {});
    }

    debug.level = namespace.level = function (newLevel) {
      level = newLevel;
    };

    exports.default = namespace;

    /***/ }),
    /* 11 */
    /***/ (function(module, exports, __webpack_require__) {

    var pSlice = Array.prototype.slice;
    var objectKeys = __webpack_require__(52);
    var isArguments = __webpack_require__(53);

    var deepEqual = module.exports = function (actual, expected, opts) {
      if (!opts) opts = {};
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == 'object',
      // equivalence is determined by ==.
      } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
        return opts.strict ? actual === expected : actual == expected;

      // 7.4. For all other Object pairs, including Array objects, equivalence is
      // determined by having the same number of owned properties (as verified
      // with Object.prototype.hasOwnProperty.call), the same set of keys
      // (although not necessarily the same order), equivalent values for every
      // corresponding key, and an identical 'prototype' property. Note: this
      // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected, opts);
      }
    };

    function isUndefinedOrNull(value) {
      return value === null || value === undefined;
    }

    function isBuffer (x) {
      if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
      if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== 'number') return false;
      return true;
    }

    function objEquiv(a, b, opts) {
      var i, key;
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
        return false;
      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;
      //~~~I've managed to break Object.keys through screwy arguments passing.
      //   Converting to array solves the problem.
      if (isArguments(a)) {
        if (!isArguments(b)) {
          return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return deepEqual(a, b, opts);
      }
      if (isBuffer(a)) {
        if (!isBuffer(b)) {
          return false;
        }
        if (a.length !== b.length) return false;
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
      try {
        var ka = objectKeys(a),
            kb = objectKeys(b);
      } catch (e) {//happens when one is a string literal and the other isn't
        return false;
      }
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) return false;
      }
      return typeof a === typeof b;
    }


    /***/ }),
    /* 12 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var Registry = __webpack_require__(1);
    var Attributor = /** @class */ (function () {
        function Attributor(attrName, keyName, options) {
            if (options === void 0) { options = {}; }
            this.attrName = attrName;
            this.keyName = keyName;
            var attributeBit = Registry.Scope.TYPE & Registry.Scope.ATTRIBUTE;
            if (options.scope != null) {
                // Ignore type bits, force attribute bit
                this.scope = (options.scope & Registry.Scope.LEVEL) | attributeBit;
            }
            else {
                this.scope = Registry.Scope.ATTRIBUTE;
            }
            if (options.whitelist != null)
                this.whitelist = options.whitelist;
        }
        Attributor.keys = function (node) {
            return [].map.call(node.attributes, function (item) {
                return item.name;
            });
        };
        Attributor.prototype.add = function (node, value) {
            if (!this.canAdd(node, value))
                return false;
            node.setAttribute(this.keyName, value);
            return true;
        };
        Attributor.prototype.canAdd = function (node, value) {
            var match = Registry.query(node, Registry.Scope.BLOT & (this.scope | Registry.Scope.TYPE));
            if (match == null)
                return false;
            if (this.whitelist == null)
                return true;
            if (typeof value === 'string') {
                return this.whitelist.indexOf(value.replace(/["']/g, '')) > -1;
            }
            else {
                return this.whitelist.indexOf(value) > -1;
            }
        };
        Attributor.prototype.remove = function (node) {
            node.removeAttribute(this.keyName);
        };
        Attributor.prototype.value = function (node) {
            var value = node.getAttribute(this.keyName);
            if (this.canAdd(node, value) && value) {
                return value;
            }
            return '';
        };
        return Attributor;
    }());
    exports.default = Attributor;


    /***/ }),
    /* 13 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.Code = undefined;

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Code = function (_Inline) {
      _inherits(Code, _Inline);

      function Code() {
        _classCallCheck(this, Code);

        return _possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).apply(this, arguments));
      }

      return Code;
    }(_inline2.default);

    Code.blotName = 'code';
    Code.tagName = 'CODE';

    var CodeBlock = function (_Block) {
      _inherits(CodeBlock, _Block);

      function CodeBlock() {
        _classCallCheck(this, CodeBlock);

        return _possibleConstructorReturn(this, (CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock)).apply(this, arguments));
      }

      _createClass(CodeBlock, [{
        key: 'delta',
        value: function delta() {
          var _this3 = this;

          var text = this.domNode.textContent;
          if (text.endsWith('\n')) {
            // Should always be true
            text = text.slice(0, -1);
          }
          return text.split('\n').reduce(function (delta, frag) {
            return delta.insert(frag).insert('\n', _this3.formats());
          }, new _quillDelta2.default());
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          if (name === this.statics.blotName && value) return;

          var _descendant = this.descendant(_text2.default, this.length() - 1),
              _descendant2 = _slicedToArray(_descendant, 1),
              text = _descendant2[0];

          if (text != null) {
            text.deleteAt(text.length() - 1, 1);
          }
          _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'format', this).call(this, name, value);
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, name, value) {
          if (length === 0) return;
          if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK) == null || name === this.statics.blotName && value === this.statics.formats(this.domNode)) {
            return;
          }
          var nextNewline = this.newlineIndex(index);
          if (nextNewline < 0 || nextNewline >= index + length) return;
          var prevNewline = this.newlineIndex(index, true) + 1;
          var isolateLength = nextNewline - prevNewline + 1;
          var blot = this.isolate(prevNewline, isolateLength);
          var next = blot.next;
          blot.format(name, value);
          if (next instanceof CodeBlock) {
            next.formatAt(0, index - prevNewline + length - isolateLength, name, value);
          }
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (def != null) return;

          var _descendant3 = this.descendant(_text2.default, index),
              _descendant4 = _slicedToArray(_descendant3, 2),
              text = _descendant4[0],
              offset = _descendant4[1];

          text.insertAt(offset, value);
        }
      }, {
        key: 'length',
        value: function length() {
          var length = this.domNode.textContent.length;
          if (!this.domNode.textContent.endsWith('\n')) {
            return length + 1;
          }
          return length;
        }
      }, {
        key: 'newlineIndex',
        value: function newlineIndex(searchIndex) {
          var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          if (!reverse) {
            var offset = this.domNode.textContent.slice(searchIndex).indexOf('\n');
            return offset > -1 ? searchIndex + offset : -1;
          } else {
            return this.domNode.textContent.slice(0, searchIndex).lastIndexOf('\n');
          }
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          if (!this.domNode.textContent.endsWith('\n')) {
            this.appendChild(_parchment2.default.create('text', '\n'));
          }
          _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'optimize', this).call(this, context);
          var next = this.next;
          if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && this.statics.formats(this.domNode) === next.statics.formats(next.domNode)) {
            next.optimize(context);
            next.moveChildren(this);
            next.remove();
          }
        }
      }, {
        key: 'replace',
        value: function replace(target) {
          _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'replace', this).call(this, target);
          [].slice.call(this.domNode.querySelectorAll('*')).forEach(function (node) {
            var blot = _parchment2.default.find(node);
            if (blot == null) {
              node.parentNode.removeChild(node);
            } else if (blot instanceof _parchment2.default.Embed) {
              blot.remove();
            } else {
              blot.unwrap();
            }
          });
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var domNode = _get(CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock), 'create', this).call(this, value);
          domNode.setAttribute('spellcheck', false);
          return domNode;
        }
      }, {
        key: 'formats',
        value: function formats() {
          return true;
        }
      }]);

      return CodeBlock;
    }(_block2.default);

    CodeBlock.blotName = 'code-block';
    CodeBlock.tagName = 'PRE';
    CodeBlock.TAB = '  ';

    exports.Code = Code;
    exports.default = CodeBlock;

    /***/ }),
    /* 14 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _op = __webpack_require__(20);

    var _op2 = _interopRequireDefault(_op);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _cursor = __webpack_require__(24);

    var _cursor2 = _interopRequireDefault(_cursor);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _clone = __webpack_require__(21);

    var _clone2 = _interopRequireDefault(_clone);

    var _deepEqual = __webpack_require__(11);

    var _deepEqual2 = _interopRequireDefault(_deepEqual);

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var ASCII = /^[ -~]*$/;

    var Editor = function () {
      function Editor(scroll) {
        _classCallCheck(this, Editor);

        this.scroll = scroll;
        this.delta = this.getDelta();
      }

      _createClass(Editor, [{
        key: 'applyDelta',
        value: function applyDelta(delta) {
          var _this = this;

          var consumeNextNewline = false;
          this.scroll.update();
          var scrollLength = this.scroll.length();
          this.scroll.batchStart();
          delta = normalizeDelta(delta);
          delta.reduce(function (index, op) {
            var length = op.retain || op.delete || op.insert.length || 1;
            var attributes = op.attributes || {};
            if (op.insert != null) {
              if (typeof op.insert === 'string') {
                var text = op.insert;
                if (text.endsWith('\n') && consumeNextNewline) {
                  consumeNextNewline = false;
                  text = text.slice(0, -1);
                }
                if (index >= scrollLength && !text.endsWith('\n')) {
                  consumeNextNewline = true;
                }
                _this.scroll.insertAt(index, text);

                var _scroll$line = _this.scroll.line(index),
                    _scroll$line2 = _slicedToArray(_scroll$line, 2),
                    line = _scroll$line2[0],
                    offset = _scroll$line2[1];

                var formats = (0, _extend2.default)({}, (0, _block.bubbleFormats)(line));
                if (line instanceof _block2.default) {
                  var _line$descendant = line.descendant(_parchment2.default.Leaf, offset),
                      _line$descendant2 = _slicedToArray(_line$descendant, 1),
                      leaf = _line$descendant2[0];

                  formats = (0, _extend2.default)(formats, (0, _block.bubbleFormats)(leaf));
                }
                attributes = _op2.default.attributes.diff(formats, attributes) || {};
              } else if (_typeof(op.insert) === 'object') {
                var key = Object.keys(op.insert)[0]; // There should only be one key
                if (key == null) return index;
                _this.scroll.insertAt(index, key, op.insert[key]);
              }
              scrollLength += length;
            }
            Object.keys(attributes).forEach(function (name) {
              _this.scroll.formatAt(index, length, name, attributes[name]);
            });
            return index + length;
          }, 0);
          delta.reduce(function (index, op) {
            if (typeof op.delete === 'number') {
              _this.scroll.deleteAt(index, op.delete);
              return index;
            }
            return index + (op.retain || op.insert.length || 1);
          }, 0);
          this.scroll.batchEnd();
          return this.update(delta);
        }
      }, {
        key: 'deleteText',
        value: function deleteText(index, length) {
          this.scroll.deleteAt(index, length);
          return this.update(new _quillDelta2.default().retain(index).delete(length));
        }
      }, {
        key: 'formatLine',
        value: function formatLine(index, length) {
          var _this2 = this;

          var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          this.scroll.update();
          Object.keys(formats).forEach(function (format) {
            if (_this2.scroll.whitelist != null && !_this2.scroll.whitelist[format]) return;
            var lines = _this2.scroll.lines(index, Math.max(length, 1));
            var lengthRemaining = length;
            lines.forEach(function (line) {
              var lineLength = line.length();
              if (!(line instanceof _code2.default)) {
                line.format(format, formats[format]);
              } else {
                var codeIndex = index - line.offset(_this2.scroll);
                var codeLength = line.newlineIndex(codeIndex + lengthRemaining) - codeIndex + 1;
                line.formatAt(codeIndex, codeLength, format, formats[format]);
              }
              lengthRemaining -= lineLength;
            });
          });
          this.scroll.optimize();
          return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
        }
      }, {
        key: 'formatText',
        value: function formatText(index, length) {
          var _this3 = this;

          var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          Object.keys(formats).forEach(function (format) {
            _this3.scroll.formatAt(index, length, format, formats[format]);
          });
          return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
        }
      }, {
        key: 'getContents',
        value: function getContents(index, length) {
          return this.delta.slice(index, index + length);
        }
      }, {
        key: 'getDelta',
        value: function getDelta() {
          return this.scroll.lines().reduce(function (delta, line) {
            return delta.concat(line.delta());
          }, new _quillDelta2.default());
        }
      }, {
        key: 'getFormat',
        value: function getFormat(index) {
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var lines = [],
              leaves = [];
          if (length === 0) {
            this.scroll.path(index).forEach(function (path) {
              var _path = _slicedToArray(path, 1),
                  blot = _path[0];

              if (blot instanceof _block2.default) {
                lines.push(blot);
              } else if (blot instanceof _parchment2.default.Leaf) {
                leaves.push(blot);
              }
            });
          } else {
            lines = this.scroll.lines(index, length);
            leaves = this.scroll.descendants(_parchment2.default.Leaf, index, length);
          }
          var formatsArr = [lines, leaves].map(function (blots) {
            if (blots.length === 0) return {};
            var formats = (0, _block.bubbleFormats)(blots.shift());
            while (Object.keys(formats).length > 0) {
              var blot = blots.shift();
              if (blot == null) return formats;
              formats = combineFormats((0, _block.bubbleFormats)(blot), formats);
            }
            return formats;
          });
          return _extend2.default.apply(_extend2.default, formatsArr);
        }
      }, {
        key: 'getText',
        value: function getText(index, length) {
          return this.getContents(index, length).filter(function (op) {
            return typeof op.insert === 'string';
          }).map(function (op) {
            return op.insert;
          }).join('');
        }
      }, {
        key: 'insertEmbed',
        value: function insertEmbed(index, embed, value) {
          this.scroll.insertAt(index, embed, value);
          return this.update(new _quillDelta2.default().retain(index).insert(_defineProperty({}, embed, value)));
        }
      }, {
        key: 'insertText',
        value: function insertText(index, text) {
          var _this4 = this;

          var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          this.scroll.insertAt(index, text);
          Object.keys(formats).forEach(function (format) {
            _this4.scroll.formatAt(index, text.length, format, formats[format]);
          });
          return this.update(new _quillDelta2.default().retain(index).insert(text, (0, _clone2.default)(formats)));
        }
      }, {
        key: 'isBlank',
        value: function isBlank() {
          if (this.scroll.children.length == 0) return true;
          if (this.scroll.children.length > 1) return false;
          var block = this.scroll.children.head;
          if (block.statics.blotName !== _block2.default.blotName) return false;
          if (block.children.length > 1) return false;
          return block.children.head instanceof _break2.default;
        }
      }, {
        key: 'removeFormat',
        value: function removeFormat(index, length) {
          var text = this.getText(index, length);

          var _scroll$line3 = this.scroll.line(index + length),
              _scroll$line4 = _slicedToArray(_scroll$line3, 2),
              line = _scroll$line4[0],
              offset = _scroll$line4[1];

          var suffixLength = 0,
              suffix = new _quillDelta2.default();
          if (line != null) {
            if (!(line instanceof _code2.default)) {
              suffixLength = line.length() - offset;
            } else {
              suffixLength = line.newlineIndex(offset) - offset + 1;
            }
            suffix = line.delta().slice(offset, offset + suffixLength - 1).insert('\n');
          }
          var contents = this.getContents(index, length + suffixLength);
          var diff = contents.diff(new _quillDelta2.default().insert(text).concat(suffix));
          var delta = new _quillDelta2.default().retain(index).concat(diff);
          return this.applyDelta(delta);
        }
      }, {
        key: 'update',
        value: function update(change) {
          var mutations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
          var cursorIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

          var oldDelta = this.delta;
          if (mutations.length === 1 && mutations[0].type === 'characterData' && mutations[0].target.data.match(ASCII) && _parchment2.default.find(mutations[0].target)) {
            // Optimization for character changes
            var textBlot = _parchment2.default.find(mutations[0].target);
            var formats = (0, _block.bubbleFormats)(textBlot);
            var index = textBlot.offset(this.scroll);
            var oldValue = mutations[0].oldValue.replace(_cursor2.default.CONTENTS, '');
            var oldText = new _quillDelta2.default().insert(oldValue);
            var newText = new _quillDelta2.default().insert(textBlot.value());
            var diffDelta = new _quillDelta2.default().retain(index).concat(oldText.diff(newText, cursorIndex));
            change = diffDelta.reduce(function (delta, op) {
              if (op.insert) {
                return delta.insert(op.insert, formats);
              } else {
                return delta.push(op);
              }
            }, new _quillDelta2.default());
            this.delta = oldDelta.compose(change);
          } else {
            this.delta = this.getDelta();
            if (!change || !(0, _deepEqual2.default)(oldDelta.compose(change), this.delta)) {
              change = oldDelta.diff(this.delta, cursorIndex);
            }
          }
          return change;
        }
      }]);

      return Editor;
    }();

    function combineFormats(formats, combined) {
      return Object.keys(combined).reduce(function (merged, name) {
        if (formats[name] == null) return merged;
        if (combined[name] === formats[name]) {
          merged[name] = combined[name];
        } else if (Array.isArray(combined[name])) {
          if (combined[name].indexOf(formats[name]) < 0) {
            merged[name] = combined[name].concat([formats[name]]);
          }
        } else {
          merged[name] = [combined[name], formats[name]];
        }
        return merged;
      }, {});
    }

    function normalizeDelta(delta) {
      return delta.reduce(function (delta, op) {
        if (op.insert === 1) {
          var attributes = (0, _clone2.default)(op.attributes);
          delete attributes['image'];
          return delta.insert({ image: op.attributes.image }, attributes);
        }
        if (op.attributes != null && (op.attributes.list === true || op.attributes.bullet === true)) {
          op = (0, _clone2.default)(op);
          if (op.attributes.list) {
            op.attributes.list = 'ordered';
          } else {
            op.attributes.list = 'bullet';
            delete op.attributes.bullet;
          }
        }
        if (typeof op.insert === 'string') {
          var text = op.insert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          return delta.insert(text, op.attributes);
        }
        return delta.push(op);
      }, new _quillDelta2.default());
    }

    exports.default = Editor;

    /***/ }),
    /* 15 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.Range = undefined;

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _clone = __webpack_require__(21);

    var _clone2 = _interopRequireDefault(_clone);

    var _deepEqual = __webpack_require__(11);

    var _deepEqual2 = _interopRequireDefault(_deepEqual);

    var _emitter3 = __webpack_require__(8);

    var _emitter4 = _interopRequireDefault(_emitter3);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var debug = (0, _logger2.default)('quill:selection');

    var Range = function Range(index) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      _classCallCheck(this, Range);

      this.index = index;
      this.length = length;
    };

    var Selection = function () {
      function Selection(scroll, emitter) {
        var _this = this;

        _classCallCheck(this, Selection);

        this.emitter = emitter;
        this.scroll = scroll;
        this.composing = false;
        this.mouseDown = false;
        this.root = this.scroll.domNode;
        this.cursor = _parchment2.default.create('cursor', this);
        // savedRange is last non-null range
        this.lastRange = this.savedRange = new Range(0, 0);
        this.handleComposition();
        this.handleDragging();
        this.emitter.listenDOM('selectionchange', document, function () {
          if (!_this.mouseDown) {
            setTimeout(_this.update.bind(_this, _emitter4.default.sources.USER), 1);
          }
        });
        this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type, delta) {
          if (type === _emitter4.default.events.TEXT_CHANGE && delta.length() > 0) {
            _this.update(_emitter4.default.sources.SILENT);
          }
        });
        this.emitter.on(_emitter4.default.events.SCROLL_BEFORE_UPDATE, function () {
          if (!_this.hasFocus()) return;
          var native = _this.getNativeRange();
          if (native == null) return;
          if (native.start.node === _this.cursor.textNode) return; // cursor.restore() will handle
          // TODO unclear if this has negative side effects
          _this.emitter.once(_emitter4.default.events.SCROLL_UPDATE, function () {
            try {
              _this.setNativeRange(native.start.node, native.start.offset, native.end.node, native.end.offset);
            } catch (ignored) {}
          });
        });
        this.emitter.on(_emitter4.default.events.SCROLL_OPTIMIZE, function (mutations, context) {
          if (context.range) {
            var _context$range = context.range,
                startNode = _context$range.startNode,
                startOffset = _context$range.startOffset,
                endNode = _context$range.endNode,
                endOffset = _context$range.endOffset;

            _this.setNativeRange(startNode, startOffset, endNode, endOffset);
          }
        });
        this.update(_emitter4.default.sources.SILENT);
      }

      _createClass(Selection, [{
        key: 'handleComposition',
        value: function handleComposition() {
          var _this2 = this;

          this.root.addEventListener('compositionstart', function () {
            _this2.composing = true;
          });
          this.root.addEventListener('compositionend', function () {
            _this2.composing = false;
            if (_this2.cursor.parent) {
              var range = _this2.cursor.restore();
              if (!range) return;
              setTimeout(function () {
                _this2.setNativeRange(range.startNode, range.startOffset, range.endNode, range.endOffset);
              }, 1);
            }
          });
        }
      }, {
        key: 'handleDragging',
        value: function handleDragging() {
          var _this3 = this;

          this.emitter.listenDOM('mousedown', document.body, function () {
            _this3.mouseDown = true;
          });
          this.emitter.listenDOM('mouseup', document.body, function () {
            _this3.mouseDown = false;
            _this3.update(_emitter4.default.sources.USER);
          });
        }
      }, {
        key: 'focus',
        value: function focus() {
          if (this.hasFocus()) return;
          this.root.focus();
          this.setRange(this.savedRange);
        }
      }, {
        key: 'format',
        value: function format(_format, value) {
          if (this.scroll.whitelist != null && !this.scroll.whitelist[_format]) return;
          this.scroll.update();
          var nativeRange = this.getNativeRange();
          if (nativeRange == null || !nativeRange.native.collapsed || _parchment2.default.query(_format, _parchment2.default.Scope.BLOCK)) return;
          if (nativeRange.start.node !== this.cursor.textNode) {
            var blot = _parchment2.default.find(nativeRange.start.node, false);
            if (blot == null) return;
            // TODO Give blot ability to not split
            if (blot instanceof _parchment2.default.Leaf) {
              var after = blot.split(nativeRange.start.offset);
              blot.parent.insertBefore(this.cursor, after);
            } else {
              blot.insertBefore(this.cursor, nativeRange.start.node); // Should never happen
            }
            this.cursor.attach();
          }
          this.cursor.format(_format, value);
          this.scroll.optimize();
          this.setNativeRange(this.cursor.textNode, this.cursor.textNode.data.length);
          this.update();
        }
      }, {
        key: 'getBounds',
        value: function getBounds(index) {
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          var scrollLength = this.scroll.length();
          index = Math.min(index, scrollLength - 1);
          length = Math.min(index + length, scrollLength - 1) - index;
          var node = void 0,
              _scroll$leaf = this.scroll.leaf(index),
              _scroll$leaf2 = _slicedToArray(_scroll$leaf, 2),
              leaf = _scroll$leaf2[0],
              offset = _scroll$leaf2[1];
          if (leaf == null) return null;

          var _leaf$position = leaf.position(offset, true);

          var _leaf$position2 = _slicedToArray(_leaf$position, 2);

          node = _leaf$position2[0];
          offset = _leaf$position2[1];

          var range = document.createRange();
          if (length > 0) {
            range.setStart(node, offset);

            var _scroll$leaf3 = this.scroll.leaf(index + length);

            var _scroll$leaf4 = _slicedToArray(_scroll$leaf3, 2);

            leaf = _scroll$leaf4[0];
            offset = _scroll$leaf4[1];

            if (leaf == null) return null;

            var _leaf$position3 = leaf.position(offset, true);

            var _leaf$position4 = _slicedToArray(_leaf$position3, 2);

            node = _leaf$position4[0];
            offset = _leaf$position4[1];

            range.setEnd(node, offset);
            return range.getBoundingClientRect();
          } else {
            var side = 'left';
            var rect = void 0;
            if (node instanceof Text) {
              if (offset < node.data.length) {
                range.setStart(node, offset);
                range.setEnd(node, offset + 1);
              } else {
                range.setStart(node, offset - 1);
                range.setEnd(node, offset);
                side = 'right';
              }
              rect = range.getBoundingClientRect();
            } else {
              rect = leaf.domNode.getBoundingClientRect();
              if (offset > 0) side = 'right';
            }
            return {
              bottom: rect.top + rect.height,
              height: rect.height,
              left: rect[side],
              right: rect[side],
              top: rect.top,
              width: 0
            };
          }
        }
      }, {
        key: 'getNativeRange',
        value: function getNativeRange() {
          var selection = document.getSelection();
          if (selection == null || selection.rangeCount <= 0) return null;
          var nativeRange = selection.getRangeAt(0);
          if (nativeRange == null) return null;
          var range = this.normalizeNative(nativeRange);
          debug.info('getNativeRange', range);
          return range;
        }
      }, {
        key: 'getRange',
        value: function getRange() {
          var normalized = this.getNativeRange();
          if (normalized == null) return [null, null];
          var range = this.normalizedToRange(normalized);
          return [range, normalized];
        }
      }, {
        key: 'hasFocus',
        value: function hasFocus() {
          return document.activeElement === this.root;
        }
      }, {
        key: 'normalizedToRange',
        value: function normalizedToRange(range) {
          var _this4 = this;

          var positions = [[range.start.node, range.start.offset]];
          if (!range.native.collapsed) {
            positions.push([range.end.node, range.end.offset]);
          }
          var indexes = positions.map(function (position) {
            var _position = _slicedToArray(position, 2),
                node = _position[0],
                offset = _position[1];

            var blot = _parchment2.default.find(node, true);
            var index = blot.offset(_this4.scroll);
            if (offset === 0) {
              return index;
            } else if (blot instanceof _parchment2.default.Container) {
              return index + blot.length();
            } else {
              return index + blot.index(node, offset);
            }
          });
          var end = Math.min(Math.max.apply(Math, _toConsumableArray(indexes)), this.scroll.length() - 1);
          var start = Math.min.apply(Math, [end].concat(_toConsumableArray(indexes)));
          return new Range(start, end - start);
        }
      }, {
        key: 'normalizeNative',
        value: function normalizeNative(nativeRange) {
          if (!contains(this.root, nativeRange.startContainer) || !nativeRange.collapsed && !contains(this.root, nativeRange.endContainer)) {
            return null;
          }
          var range = {
            start: { node: nativeRange.startContainer, offset: nativeRange.startOffset },
            end: { node: nativeRange.endContainer, offset: nativeRange.endOffset },
            native: nativeRange
          };
          [range.start, range.end].forEach(function (position) {
            var node = position.node,
                offset = position.offset;
            while (!(node instanceof Text) && node.childNodes.length > 0) {
              if (node.childNodes.length > offset) {
                node = node.childNodes[offset];
                offset = 0;
              } else if (node.childNodes.length === offset) {
                node = node.lastChild;
                offset = node instanceof Text ? node.data.length : node.childNodes.length + 1;
              } else {
                break;
              }
            }
            position.node = node, position.offset = offset;
          });
          return range;
        }
      }, {
        key: 'rangeToNative',
        value: function rangeToNative(range) {
          var _this5 = this;

          var indexes = range.collapsed ? [range.index] : [range.index, range.index + range.length];
          var args = [];
          var scrollLength = this.scroll.length();
          indexes.forEach(function (index, i) {
            index = Math.min(scrollLength - 1, index);
            var node = void 0,
                _scroll$leaf5 = _this5.scroll.leaf(index),
                _scroll$leaf6 = _slicedToArray(_scroll$leaf5, 2),
                leaf = _scroll$leaf6[0],
                offset = _scroll$leaf6[1];
            var _leaf$position5 = leaf.position(offset, i !== 0);

            var _leaf$position6 = _slicedToArray(_leaf$position5, 2);

            node = _leaf$position6[0];
            offset = _leaf$position6[1];

            args.push(node, offset);
          });
          if (args.length < 2) {
            args = args.concat(args);
          }
          return args;
        }
      }, {
        key: 'scrollIntoView',
        value: function scrollIntoView(scrollingContainer) {
          var range = this.lastRange;
          if (range == null) return;
          var bounds = this.getBounds(range.index, range.length);
          if (bounds == null) return;
          var limit = this.scroll.length() - 1;

          var _scroll$line = this.scroll.line(Math.min(range.index, limit)),
              _scroll$line2 = _slicedToArray(_scroll$line, 1),
              first = _scroll$line2[0];

          var last = first;
          if (range.length > 0) {
            var _scroll$line3 = this.scroll.line(Math.min(range.index + range.length, limit));

            var _scroll$line4 = _slicedToArray(_scroll$line3, 1);

            last = _scroll$line4[0];
          }
          if (first == null || last == null) return;
          var scrollBounds = scrollingContainer.getBoundingClientRect();
          if (bounds.top < scrollBounds.top) {
            scrollingContainer.scrollTop -= scrollBounds.top - bounds.top;
          } else if (bounds.bottom > scrollBounds.bottom) {
            scrollingContainer.scrollTop += bounds.bottom - scrollBounds.bottom;
          }
        }
      }, {
        key: 'setNativeRange',
        value: function setNativeRange(startNode, startOffset) {
          var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : startNode;
          var endOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : startOffset;
          var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

          debug.info('setNativeRange', startNode, startOffset, endNode, endOffset);
          if (startNode != null && (this.root.parentNode == null || startNode.parentNode == null || endNode.parentNode == null)) {
            return;
          }
          var selection = document.getSelection();
          if (selection == null) return;
          if (startNode != null) {
            if (!this.hasFocus()) this.root.focus();
            var native = (this.getNativeRange() || {}).native;
            if (native == null || force || startNode !== native.startContainer || startOffset !== native.startOffset || endNode !== native.endContainer || endOffset !== native.endOffset) {

              if (startNode.tagName == "BR") {
                startOffset = [].indexOf.call(startNode.parentNode.childNodes, startNode);
                startNode = startNode.parentNode;
              }
              if (endNode.tagName == "BR") {
                endOffset = [].indexOf.call(endNode.parentNode.childNodes, endNode);
                endNode = endNode.parentNode;
              }
              var range = document.createRange();
              range.setStart(startNode, startOffset);
              range.setEnd(endNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            selection.removeAllRanges();
            this.root.blur();
            document.body.focus(); // root.blur() not enough on IE11+Travis+SauceLabs (but not local VMs)
          }
        }
      }, {
        key: 'setRange',
        value: function setRange(range) {
          var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

          if (typeof force === 'string') {
            source = force;
            force = false;
          }
          debug.info('setRange', range);
          if (range != null) {
            var args = this.rangeToNative(range);
            this.setNativeRange.apply(this, _toConsumableArray(args).concat([force]));
          } else {
            this.setNativeRange(null);
          }
          this.update(source);
        }
      }, {
        key: 'update',
        value: function update() {
          var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

          var oldRange = this.lastRange;

          var _getRange = this.getRange(),
              _getRange2 = _slicedToArray(_getRange, 2),
              lastRange = _getRange2[0],
              nativeRange = _getRange2[1];

          this.lastRange = lastRange;
          if (this.lastRange != null) {
            this.savedRange = this.lastRange;
          }
          if (!(0, _deepEqual2.default)(oldRange, this.lastRange)) {
            var _emitter;

            if (!this.composing && nativeRange != null && nativeRange.native.collapsed && nativeRange.start.node !== this.cursor.textNode) {
              this.cursor.restore();
            }
            var args = [_emitter4.default.events.SELECTION_CHANGE, (0, _clone2.default)(this.lastRange), (0, _clone2.default)(oldRange), source];
            (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
            if (source !== _emitter4.default.sources.SILENT) {
              var _emitter2;

              (_emitter2 = this.emitter).emit.apply(_emitter2, args);
            }
          }
        }
      }]);

      return Selection;
    }();

    function contains(parent, descendant) {
      try {
        // Firefox inserts inaccessible nodes around video elements
        descendant.parentNode;
      } catch (e) {
        return false;
      }
      // IE11 has bug with Text nodes
      // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
      if (descendant instanceof Text) {
        descendant = descendant.parentNode;
      }
      return parent.contains(descendant);
    }

    exports.Range = Range;
    exports.default = Selection;

    /***/ }),
    /* 16 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Break = function (_Parchment$Embed) {
      _inherits(Break, _Parchment$Embed);

      function Break() {
        _classCallCheck(this, Break);

        return _possibleConstructorReturn(this, (Break.__proto__ || Object.getPrototypeOf(Break)).apply(this, arguments));
      }

      _createClass(Break, [{
        key: 'insertInto',
        value: function insertInto(parent, ref) {
          if (parent.children.length === 0) {
            _get(Break.prototype.__proto__ || Object.getPrototypeOf(Break.prototype), 'insertInto', this).call(this, parent, ref);
          } else {
            this.remove();
          }
        }
      }, {
        key: 'length',
        value: function length() {
          return 0;
        }
      }, {
        key: 'value',
        value: function value() {
          return '';
        }
      }], [{
        key: 'value',
        value: function value() {
          return undefined;
        }
      }]);

      return Break;
    }(_parchment2.default.Embed);

    Break.blotName = 'break';
    Break.tagName = 'BR';

    exports.default = Break;

    /***/ }),
    /* 17 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var linked_list_1 = __webpack_require__(44);
    var shadow_1 = __webpack_require__(30);
    var Registry = __webpack_require__(1);
    var ContainerBlot = /** @class */ (function (_super) {
        __extends(ContainerBlot, _super);
        function ContainerBlot(domNode) {
            var _this = _super.call(this, domNode) || this;
            _this.build();
            return _this;
        }
        ContainerBlot.prototype.appendChild = function (other) {
            this.insertBefore(other);
        };
        ContainerBlot.prototype.attach = function () {
            _super.prototype.attach.call(this);
            this.children.forEach(function (child) {
                child.attach();
            });
        };
        ContainerBlot.prototype.build = function () {
            var _this = this;
            this.children = new linked_list_1.default();
            // Need to be reversed for if DOM nodes already in order
            [].slice
                .call(this.domNode.childNodes)
                .reverse()
                .forEach(function (node) {
                try {
                    var child = makeBlot(node);
                    _this.insertBefore(child, _this.children.head || undefined);
                }
                catch (err) {
                    if (err instanceof Registry.ParchmentError)
                        return;
                    else
                        throw err;
                }
            });
        };
        ContainerBlot.prototype.deleteAt = function (index, length) {
            if (index === 0 && length === this.length()) {
                return this.remove();
            }
            this.children.forEachAt(index, length, function (child, offset, length) {
                child.deleteAt(offset, length);
            });
        };
        ContainerBlot.prototype.descendant = function (criteria, index) {
            var _a = this.children.find(index), child = _a[0], offset = _a[1];
            if ((criteria.blotName == null && criteria(child)) ||
                (criteria.blotName != null && child instanceof criteria)) {
                return [child, offset];
            }
            else if (child instanceof ContainerBlot) {
                return child.descendant(criteria, offset);
            }
            else {
                return [null, -1];
            }
        };
        ContainerBlot.prototype.descendants = function (criteria, index, length) {
            if (index === void 0) { index = 0; }
            if (length === void 0) { length = Number.MAX_VALUE; }
            var descendants = [];
            var lengthLeft = length;
            this.children.forEachAt(index, length, function (child, index, length) {
                if ((criteria.blotName == null && criteria(child)) ||
                    (criteria.blotName != null && child instanceof criteria)) {
                    descendants.push(child);
                }
                if (child instanceof ContainerBlot) {
                    descendants = descendants.concat(child.descendants(criteria, index, lengthLeft));
                }
                lengthLeft -= length;
            });
            return descendants;
        };
        ContainerBlot.prototype.detach = function () {
            this.children.forEach(function (child) {
                child.detach();
            });
            _super.prototype.detach.call(this);
        };
        ContainerBlot.prototype.formatAt = function (index, length, name, value) {
            this.children.forEachAt(index, length, function (child, offset, length) {
                child.formatAt(offset, length, name, value);
            });
        };
        ContainerBlot.prototype.insertAt = function (index, value, def) {
            var _a = this.children.find(index), child = _a[0], offset = _a[1];
            if (child) {
                child.insertAt(offset, value, def);
            }
            else {
                var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
                this.appendChild(blot);
            }
        };
        ContainerBlot.prototype.insertBefore = function (childBlot, refBlot) {
            if (this.statics.allowedChildren != null &&
                !this.statics.allowedChildren.some(function (child) {
                    return childBlot instanceof child;
                })) {
                throw new Registry.ParchmentError("Cannot insert " + childBlot.statics.blotName + " into " + this.statics.blotName);
            }
            childBlot.insertInto(this, refBlot);
        };
        ContainerBlot.prototype.length = function () {
            return this.children.reduce(function (memo, child) {
                return memo + child.length();
            }, 0);
        };
        ContainerBlot.prototype.moveChildren = function (targetParent, refNode) {
            this.children.forEach(function (child) {
                targetParent.insertBefore(child, refNode);
            });
        };
        ContainerBlot.prototype.optimize = function (context) {
            _super.prototype.optimize.call(this, context);
            if (this.children.length === 0) {
                if (this.statics.defaultChild != null) {
                    var child = Registry.create(this.statics.defaultChild);
                    this.appendChild(child);
                    child.optimize(context);
                }
                else {
                    this.remove();
                }
            }
        };
        ContainerBlot.prototype.path = function (index, inclusive) {
            if (inclusive === void 0) { inclusive = false; }
            var _a = this.children.find(index, inclusive), child = _a[0], offset = _a[1];
            var position = [[this, index]];
            if (child instanceof ContainerBlot) {
                return position.concat(child.path(offset, inclusive));
            }
            else if (child != null) {
                position.push([child, offset]);
            }
            return position;
        };
        ContainerBlot.prototype.removeChild = function (child) {
            this.children.remove(child);
        };
        ContainerBlot.prototype.replace = function (target) {
            if (target instanceof ContainerBlot) {
                target.moveChildren(this);
            }
            _super.prototype.replace.call(this, target);
        };
        ContainerBlot.prototype.split = function (index, force) {
            if (force === void 0) { force = false; }
            if (!force) {
                if (index === 0)
                    return this;
                if (index === this.length())
                    return this.next;
            }
            var after = this.clone();
            this.parent.insertBefore(after, this.next);
            this.children.forEachAt(index, this.length(), function (child, offset, length) {
                child = child.split(offset, force);
                after.appendChild(child);
            });
            return after;
        };
        ContainerBlot.prototype.unwrap = function () {
            this.moveChildren(this.parent, this.next);
            this.remove();
        };
        ContainerBlot.prototype.update = function (mutations, context) {
            var _this = this;
            var addedNodes = [];
            var removedNodes = [];
            mutations.forEach(function (mutation) {
                if (mutation.target === _this.domNode && mutation.type === 'childList') {
                    addedNodes.push.apply(addedNodes, mutation.addedNodes);
                    removedNodes.push.apply(removedNodes, mutation.removedNodes);
                }
            });
            removedNodes.forEach(function (node) {
                // Check node has actually been removed
                // One exception is Chrome does not immediately remove IFRAMEs
                // from DOM but MutationRecord is correct in its reported removal
                if (node.parentNode != null &&
                    // @ts-ignore
                    node.tagName !== 'IFRAME' &&
                    document.body.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                    return;
                }
                var blot = Registry.find(node);
                if (blot == null)
                    return;
                if (blot.domNode.parentNode == null || blot.domNode.parentNode === _this.domNode) {
                    blot.detach();
                }
            });
            addedNodes
                .filter(function (node) {
                return node.parentNode == _this.domNode;
            })
                .sort(function (a, b) {
                if (a === b)
                    return 0;
                if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    return 1;
                }
                return -1;
            })
                .forEach(function (node) {
                var refBlot = null;
                if (node.nextSibling != null) {
                    refBlot = Registry.find(node.nextSibling);
                }
                var blot = makeBlot(node);
                if (blot.next != refBlot || blot.next == null) {
                    if (blot.parent != null) {
                        blot.parent.removeChild(_this);
                    }
                    _this.insertBefore(blot, refBlot || undefined);
                }
            });
        };
        return ContainerBlot;
    }(shadow_1.default));
    function makeBlot(node) {
        var blot = Registry.find(node);
        if (blot == null) {
            try {
                blot = Registry.create(node);
            }
            catch (e) {
                blot = Registry.create(Registry.Scope.INLINE);
                [].slice.call(node.childNodes).forEach(function (child) {
                    // @ts-ignore
                    blot.domNode.appendChild(child);
                });
                if (node.parentNode) {
                    node.parentNode.replaceChild(blot.domNode, node);
                }
                blot.attach();
            }
        }
        return blot;
    }
    exports.default = ContainerBlot;


    /***/ }),
    /* 18 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    var store_1 = __webpack_require__(31);
    var container_1 = __webpack_require__(17);
    var Registry = __webpack_require__(1);
    var FormatBlot = /** @class */ (function (_super) {
        __extends(FormatBlot, _super);
        function FormatBlot(domNode) {
            var _this = _super.call(this, domNode) || this;
            _this.attributes = new store_1.default(_this.domNode);
            return _this;
        }
        FormatBlot.formats = function (domNode) {
            if (typeof this.tagName === 'string') {
                return true;
            }
            else if (Array.isArray(this.tagName)) {
                return domNode.tagName.toLowerCase();
            }
            return undefined;
        };
        FormatBlot.prototype.format = function (name, value) {
            var format = Registry.query(name);
            if (format instanceof attributor_1.default) {
                this.attributes.attribute(format, value);
            }
            else if (value) {
                if (format != null && (name !== this.statics.blotName || this.formats()[name] !== value)) {
                    this.replaceWith(name, value);
                }
            }
        };
        FormatBlot.prototype.formats = function () {
            var formats = this.attributes.values();
            var format = this.statics.formats(this.domNode);
            if (format != null) {
                formats[this.statics.blotName] = format;
            }
            return formats;
        };
        FormatBlot.prototype.replaceWith = function (name, value) {
            var replacement = _super.prototype.replaceWith.call(this, name, value);
            this.attributes.copy(replacement);
            return replacement;
        };
        FormatBlot.prototype.update = function (mutations, context) {
            var _this = this;
            _super.prototype.update.call(this, mutations, context);
            if (mutations.some(function (mutation) {
                return mutation.target === _this.domNode && mutation.type === 'attributes';
            })) {
                this.attributes.build();
            }
        };
        FormatBlot.prototype.wrap = function (name, value) {
            var wrapper = _super.prototype.wrap.call(this, name, value);
            if (wrapper instanceof FormatBlot && wrapper.statics.scope === this.statics.scope) {
                this.attributes.move(wrapper);
            }
            return wrapper;
        };
        return FormatBlot;
    }(container_1.default));
    exports.default = FormatBlot;


    /***/ }),
    /* 19 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var shadow_1 = __webpack_require__(30);
    var Registry = __webpack_require__(1);
    var LeafBlot = /** @class */ (function (_super) {
        __extends(LeafBlot, _super);
        function LeafBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LeafBlot.value = function (domNode) {
            return true;
        };
        LeafBlot.prototype.index = function (node, offset) {
            if (this.domNode === node ||
                this.domNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                return Math.min(offset, 1);
            }
            return -1;
        };
        LeafBlot.prototype.position = function (index, inclusive) {
            var offset = [].indexOf.call(this.parent.domNode.childNodes, this.domNode);
            if (index > 0)
                offset += 1;
            return [this.parent.domNode, offset];
        };
        LeafBlot.prototype.value = function () {
            var _a;
            return _a = {}, _a[this.statics.blotName] = this.statics.value(this.domNode) || true, _a;
        };
        LeafBlot.scope = Registry.Scope.INLINE_BLOT;
        return LeafBlot;
    }(shadow_1.default));
    exports.default = LeafBlot;


    /***/ }),
    /* 20 */
    /***/ (function(module, exports, __webpack_require__) {

    var equal = __webpack_require__(11);
    var extend = __webpack_require__(3);


    var lib = {
      attributes: {
        compose: function (a, b, keepNull) {
          if (typeof a !== 'object') a = {};
          if (typeof b !== 'object') b = {};
          var attributes = extend(true, {}, b);
          if (!keepNull) {
            attributes = Object.keys(attributes).reduce(function (copy, key) {
              if (attributes[key] != null) {
                copy[key] = attributes[key];
              }
              return copy;
            }, {});
          }
          for (var key in a) {
            if (a[key] !== undefined && b[key] === undefined) {
              attributes[key] = a[key];
            }
          }
          return Object.keys(attributes).length > 0 ? attributes : undefined;
        },

        diff: function(a, b) {
          if (typeof a !== 'object') a = {};
          if (typeof b !== 'object') b = {};
          var attributes = Object.keys(a).concat(Object.keys(b)).reduce(function (attributes, key) {
            if (!equal(a[key], b[key])) {
              attributes[key] = b[key] === undefined ? null : b[key];
            }
            return attributes;
          }, {});
          return Object.keys(attributes).length > 0 ? attributes : undefined;
        },

        transform: function (a, b, priority) {
          if (typeof a !== 'object') return b;
          if (typeof b !== 'object') return undefined;
          if (!priority) return b;  // b simply overwrites us without priority
          var attributes = Object.keys(b).reduce(function (attributes, key) {
            if (a[key] === undefined) attributes[key] = b[key];  // null is a valid value
            return attributes;
          }, {});
          return Object.keys(attributes).length > 0 ? attributes : undefined;
        }
      },

      iterator: function (ops) {
        return new Iterator(ops);
      },

      length: function (op) {
        if (typeof op['delete'] === 'number') {
          return op['delete'];
        } else if (typeof op.retain === 'number') {
          return op.retain;
        } else {
          return typeof op.insert === 'string' ? op.insert.length : 1;
        }
      }
    };


    function Iterator(ops) {
      this.ops = ops;
      this.index = 0;
      this.offset = 0;
    }
    Iterator.prototype.hasNext = function () {
      return this.peekLength() < Infinity;
    };

    Iterator.prototype.next = function (length) {
      if (!length) length = Infinity;
      var nextOp = this.ops[this.index];
      if (nextOp) {
        var offset = this.offset;
        var opLength = lib.length(nextOp);
        if (length >= opLength - offset) {
          length = opLength - offset;
          this.index += 1;
          this.offset = 0;
        } else {
          this.offset += length;
        }
        if (typeof nextOp['delete'] === 'number') {
          return { 'delete': length };
        } else {
          var retOp = {};
          if (nextOp.attributes) {
            retOp.attributes = nextOp.attributes;
          }
          if (typeof nextOp.retain === 'number') {
            retOp.retain = length;
          } else if (typeof nextOp.insert === 'string') {
            retOp.insert = nextOp.insert.substr(offset, length);
          } else {
            // offset should === 0, length should === 1
            retOp.insert = nextOp.insert;
          }
          return retOp;
        }
      } else {
        return { retain: Infinity };
      }
    };

    Iterator.prototype.peek = function () {
      return this.ops[this.index];
    };

    Iterator.prototype.peekLength = function () {
      if (this.ops[this.index]) {
        // Should never return 0 if our index is being managed correctly
        return lib.length(this.ops[this.index]) - this.offset;
      } else {
        return Infinity;
      }
    };

    Iterator.prototype.peekType = function () {
      if (this.ops[this.index]) {
        if (typeof this.ops[this.index]['delete'] === 'number') {
          return 'delete';
        } else if (typeof this.ops[this.index].retain === 'number') {
          return 'retain';
        } else {
          return 'insert';
        }
      }
      return 'retain';
    };

    Iterator.prototype.rest = function () {
      if (!this.hasNext()) {
        return [];
      } else if (this.offset === 0) {
        return this.ops.slice(this.index);
      } else {
        var offset = this.offset;
        var index = this.index;
        var next = this.next();
        var rest = this.ops.slice(this.index);
        this.offset = offset;
        this.index = index;
        return [next].concat(rest);
      }
    };


    module.exports = lib;


    /***/ }),
    /* 21 */
    /***/ (function(module, exports) {

    var clone = (function() {

    function _instanceof(obj, type) {
      return type != null && obj instanceof type;
    }

    var nativeMap;
    try {
      nativeMap = Map;
    } catch(_) {
      // maybe a reference error because no `Map`. Give it a dummy value that no
      // value will ever be an instanceof.
      nativeMap = function() {};
    }

    var nativeSet;
    try {
      nativeSet = Set;
    } catch(_) {
      nativeSet = function() {};
    }

    var nativePromise;
    try {
      nativePromise = Promise;
    } catch(_) {
      nativePromise = function() {};
    }

    /**
     * Clones (copies) an Object using deep copying.
     *
     * This function supports circular references by default, but if you are certain
     * there are no circular references in your object, you can save some CPU time
     * by calling clone(obj, false).
     *
     * Caution: if `circular` is false and `parent` contains circular references,
     * your program may enter an infinite loop and crash.
     *
     * @param `parent` - the object to be cloned
     * @param `circular` - set to true if the object to be cloned may contain
     *    circular references. (optional - true by default)
     * @param `depth` - set to a number if the object is only to be cloned to
     *    a particular depth. (optional - defaults to Infinity)
     * @param `prototype` - sets the prototype to be used when cloning an object.
     *    (optional - defaults to parent prototype).
     * @param `includeNonEnumerable` - set to true if the non-enumerable properties
     *    should be cloned as well. Non-enumerable properties on the prototype
     *    chain will be ignored. (optional - false by default)
    */
    function clone(parent, circular, depth, prototype, includeNonEnumerable) {
      if (typeof circular === 'object') {
        depth = circular.depth;
        prototype = circular.prototype;
        includeNonEnumerable = circular.includeNonEnumerable;
        circular = circular.circular;
      }
      // maintain two arrays for circular references, where corresponding parents
      // and children have the same index
      var allParents = [];
      var allChildren = [];

      var useBuffer = typeof Buffer != 'undefined';

      if (typeof circular == 'undefined')
        circular = true;

      if (typeof depth == 'undefined')
        depth = Infinity;

      // recurse this function so we don't reset allParents and allChildren
      function _clone(parent, depth) {
        // cloning null always returns null
        if (parent === null)
          return null;

        if (depth === 0)
          return parent;

        var child;
        var proto;
        if (typeof parent != 'object') {
          return parent;
        }

        if (_instanceof(parent, nativeMap)) {
          child = new nativeMap();
        } else if (_instanceof(parent, nativeSet)) {
          child = new nativeSet();
        } else if (_instanceof(parent, nativePromise)) {
          child = new nativePromise(function (resolve, reject) {
            parent.then(function(value) {
              resolve(_clone(value, depth - 1));
            }, function(err) {
              reject(_clone(err, depth - 1));
            });
          });
        } else if (clone.__isArray(parent)) {
          child = [];
        } else if (clone.__isRegExp(parent)) {
          child = new RegExp(parent.source, __getRegExpFlags(parent));
          if (parent.lastIndex) child.lastIndex = parent.lastIndex;
        } else if (clone.__isDate(parent)) {
          child = new Date(parent.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent)) {
          if (Buffer.allocUnsafe) {
            // Node.js >= 4.5.0
            child = Buffer.allocUnsafe(parent.length);
          } else {
            // Older Node.js versions
            child = new Buffer(parent.length);
          }
          parent.copy(child);
          return child;
        } else if (_instanceof(parent, Error)) {
          child = Object.create(parent);
        } else {
          if (typeof prototype == 'undefined') {
            proto = Object.getPrototypeOf(parent);
            child = Object.create(proto);
          }
          else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }

        if (circular) {
          var index = allParents.indexOf(parent);

          if (index != -1) {
            return allChildren[index];
          }
          allParents.push(parent);
          allChildren.push(child);
        }

        if (_instanceof(parent, nativeMap)) {
          parent.forEach(function(value, key) {
            var keyChild = _clone(key, depth - 1);
            var valueChild = _clone(value, depth - 1);
            child.set(keyChild, valueChild);
          });
        }
        if (_instanceof(parent, nativeSet)) {
          parent.forEach(function(value) {
            var entryChild = _clone(value, depth - 1);
            child.add(entryChild);
          });
        }

        for (var i in parent) {
          var attrs;
          if (proto) {
            attrs = Object.getOwnPropertyDescriptor(proto, i);
          }

          if (attrs && attrs.set == null) {
            continue;
          }
          child[i] = _clone(parent[i], depth - 1);
        }

        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(parent);
          for (var i = 0; i < symbols.length; i++) {
            // Don't need to worry about cloning a symbol because it is a primitive,
            // like a number or string.
            var symbol = symbols[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
            if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
              continue;
            }
            child[symbol] = _clone(parent[symbol], depth - 1);
            if (!descriptor.enumerable) {
              Object.defineProperty(child, symbol, {
                enumerable: false
              });
            }
          }
        }

        if (includeNonEnumerable) {
          var allPropertyNames = Object.getOwnPropertyNames(parent);
          for (var i = 0; i < allPropertyNames.length; i++) {
            var propertyName = allPropertyNames[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
            if (descriptor && descriptor.enumerable) {
              continue;
            }
            child[propertyName] = _clone(parent[propertyName], depth - 1);
            Object.defineProperty(child, propertyName, {
              enumerable: false
            });
          }
        }

        return child;
      }

      return _clone(parent, depth);
    }

    /**
     * Simple flat clone using prototype, accepts only objects, usefull for property
     * override on FLAT configuration object (no nested props).
     *
     * USE WITH CAUTION! This may not behave as you wish if you do not know how this
     * works.
     */
    clone.clonePrototype = function clonePrototype(parent) {
      if (parent === null)
        return null;

      var c = function () {};
      c.prototype = parent;
      return new c();
    };

    // private utility functions

    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    clone.__objToStr = __objToStr;

    function __isDate(o) {
      return typeof o === 'object' && __objToStr(o) === '[object Date]';
    }
    clone.__isDate = __isDate;

    function __isArray(o) {
      return typeof o === 'object' && __objToStr(o) === '[object Array]';
    }
    clone.__isArray = __isArray;

    function __isRegExp(o) {
      return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
    }
    clone.__isRegExp = __isRegExp;

    function __getRegExpFlags(re) {
      var flags = '';
      if (re.global) flags += 'g';
      if (re.ignoreCase) flags += 'i';
      if (re.multiline) flags += 'm';
      return flags;
    }
    clone.__getRegExpFlags = __getRegExpFlags;

    return clone;
    })();

    if (typeof module === 'object' && module.exports) {
      module.exports = clone;
    }


    /***/ }),
    /* 22 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _container = __webpack_require__(25);

    var _container2 = _interopRequireDefault(_container);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    function isLine(blot) {
      return blot instanceof _block2.default || blot instanceof _block.BlockEmbed;
    }

    var Scroll = function (_Parchment$Scroll) {
      _inherits(Scroll, _Parchment$Scroll);

      function Scroll(domNode, config) {
        _classCallCheck(this, Scroll);

        var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this, domNode));

        _this.emitter = config.emitter;
        if (Array.isArray(config.whitelist)) {
          _this.whitelist = config.whitelist.reduce(function (whitelist, format) {
            whitelist[format] = true;
            return whitelist;
          }, {});
        }
        // Some reason fixes composition issues with character languages in Windows/Chrome, Safari
        _this.domNode.addEventListener('DOMNodeInserted', function () {});
        _this.optimize();
        _this.enable();
        return _this;
      }

      _createClass(Scroll, [{
        key: 'batchStart',
        value: function batchStart() {
          this.batch = true;
        }
      }, {
        key: 'batchEnd',
        value: function batchEnd() {
          this.batch = false;
          this.optimize();
        }
      }, {
        key: 'deleteAt',
        value: function deleteAt(index, length) {
          var _line = this.line(index),
              _line2 = _slicedToArray(_line, 2),
              first = _line2[0],
              offset = _line2[1];

          var _line3 = this.line(index + length),
              _line4 = _slicedToArray(_line3, 1),
              last = _line4[0];

          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'deleteAt', this).call(this, index, length);
          if (last != null && first !== last && offset > 0) {
            if (first instanceof _block.BlockEmbed || last instanceof _block.BlockEmbed) {
              this.optimize();
              return;
            }
            if (first instanceof _code2.default) {
              var newlineIndex = first.newlineIndex(first.length(), true);
              if (newlineIndex > -1) {
                first = first.split(newlineIndex + 1);
                if (first === last) {
                  this.optimize();
                  return;
                }
              }
            } else if (last instanceof _code2.default) {
              var _newlineIndex = last.newlineIndex(0);
              if (_newlineIndex > -1) {
                last.split(_newlineIndex + 1);
              }
            }
            var ref = last.children.head instanceof _break2.default ? null : last.children.head;
            first.moveChildren(last, ref);
            first.remove();
          }
          this.optimize();
        }
      }, {
        key: 'enable',
        value: function enable() {
          var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

          this.domNode.setAttribute('contenteditable', enabled);
        }
      }, {
        key: 'formatAt',
        value: function formatAt(index, length, format, value) {
          if (this.whitelist != null && !this.whitelist[format]) return;
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'formatAt', this).call(this, index, length, format, value);
          this.optimize();
        }
      }, {
        key: 'insertAt',
        value: function insertAt(index, value, def) {
          if (def != null && this.whitelist != null && !this.whitelist[value]) return;
          if (index >= this.length()) {
            if (def == null || _parchment2.default.query(value, _parchment2.default.Scope.BLOCK) == null) {
              var blot = _parchment2.default.create(this.statics.defaultChild);
              this.appendChild(blot);
              if (def == null && value.endsWith('\n')) {
                value = value.slice(0, -1);
              }
              blot.insertAt(0, value, def);
            } else {
              var embed = _parchment2.default.create(value, def);
              this.appendChild(embed);
            }
          } else {
            _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertAt', this).call(this, index, value, def);
          }
          this.optimize();
        }
      }, {
        key: 'insertBefore',
        value: function insertBefore(blot, ref) {
          if (blot.statics.scope === _parchment2.default.Scope.INLINE_BLOT) {
            var wrapper = _parchment2.default.create(this.statics.defaultChild);
            wrapper.appendChild(blot);
            blot = wrapper;
          }
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertBefore', this).call(this, blot, ref);
        }
      }, {
        key: 'leaf',
        value: function leaf(index) {
          return this.path(index).pop() || [null, -1];
        }
      }, {
        key: 'line',
        value: function line(index) {
          if (index === this.length()) {
            return this.line(index - 1);
          }
          return this.descendant(isLine, index);
        }
      }, {
        key: 'lines',
        value: function lines() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

          var getLines = function getLines(blot, index, length) {
            var lines = [],
                lengthLeft = length;
            blot.children.forEachAt(index, length, function (child, index, length) {
              if (isLine(child)) {
                lines.push(child);
              } else if (child instanceof _parchment2.default.Container) {
                lines = lines.concat(getLines(child, index, lengthLeft));
              }
              lengthLeft -= length;
            });
            return lines;
          };
          return getLines(this, index, length);
        }
      }, {
        key: 'optimize',
        value: function optimize() {
          var mutations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          if (this.batch === true) return;
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'optimize', this).call(this, mutations, context);
          if (mutations.length > 0) {
            this.emitter.emit(_emitter2.default.events.SCROLL_OPTIMIZE, mutations, context);
          }
        }
      }, {
        key: 'path',
        value: function path(index) {
          return _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'path', this).call(this, index).slice(1); // Exclude self
        }
      }, {
        key: 'update',
        value: function update(mutations) {
          if (this.batch === true) return;
          var source = _emitter2.default.sources.USER;
          if (typeof mutations === 'string') {
            source = mutations;
          }
          if (!Array.isArray(mutations)) {
            mutations = this.observer.takeRecords();
          }
          if (mutations.length > 0) {
            this.emitter.emit(_emitter2.default.events.SCROLL_BEFORE_UPDATE, source, mutations);
          }
          _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'update', this).call(this, mutations.concat([])); // pass copy
          if (mutations.length > 0) {
            this.emitter.emit(_emitter2.default.events.SCROLL_UPDATE, source, mutations);
          }
        }
      }]);

      return Scroll;
    }(_parchment2.default.Scroll);

    Scroll.blotName = 'scroll';
    Scroll.className = 'ql-editor';
    Scroll.tagName = 'DIV';
    Scroll.defaultChild = 'block';
    Scroll.allowedChildren = [_block2.default, _block.BlockEmbed, _container2.default];

    exports.default = Scroll;

    /***/ }),
    /* 23 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SHORTKEY = exports.default = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _clone = __webpack_require__(21);

    var _clone2 = _interopRequireDefault(_clone);

    var _deepEqual = __webpack_require__(11);

    var _deepEqual2 = _interopRequireDefault(_deepEqual);

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _op = __webpack_require__(20);

    var _op2 = _interopRequireDefault(_op);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:keyboard');

    var SHORTKEY = /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';

    var Keyboard = function (_Module) {
      _inherits(Keyboard, _Module);

      _createClass(Keyboard, null, [{
        key: 'match',
        value: function match(evt, binding) {
          binding = normalize(binding);
          if (['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(function (key) {
            return !!binding[key] !== evt[key] && binding[key] !== null;
          })) {
            return false;
          }
          return binding.key === (evt.which || evt.keyCode);
        }
      }]);

      function Keyboard(quill, options) {
        _classCallCheck(this, Keyboard);

        var _this = _possibleConstructorReturn(this, (Keyboard.__proto__ || Object.getPrototypeOf(Keyboard)).call(this, quill, options));

        _this.bindings = {};
        Object.keys(_this.options.bindings).forEach(function (name) {
          if (name === 'list autofill' && quill.scroll.whitelist != null && !quill.scroll.whitelist['list']) {
            return;
          }
          if (_this.options.bindings[name]) {
            _this.addBinding(_this.options.bindings[name]);
          }
        });
        _this.addBinding({ key: Keyboard.keys.ENTER, shiftKey: null }, handleEnter);
        _this.addBinding({ key: Keyboard.keys.ENTER, metaKey: null, ctrlKey: null, altKey: null }, function () {});
        if (/Firefox/i.test(navigator.userAgent)) {
          // Need to handle delete and backspace for Firefox in the general case #1171
          _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true }, handleBackspace);
          _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true }, handleDelete);
        } else {
          _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true, prefix: /^.?$/ }, handleBackspace);
          _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true, suffix: /^.?$/ }, handleDelete);
        }
        _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: false }, handleDeleteRange);
        _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: false }, handleDeleteRange);
        _this.addBinding({ key: Keyboard.keys.BACKSPACE, altKey: null, ctrlKey: null, metaKey: null, shiftKey: null }, { collapsed: true, offset: 0 }, handleBackspace);
        _this.listen();
        return _this;
      }

      _createClass(Keyboard, [{
        key: 'addBinding',
        value: function addBinding(key) {
          var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          var binding = normalize(key);
          if (binding == null || binding.key == null) {
            return debug.warn('Attempted to add invalid keyboard binding', binding);
          }
          if (typeof context === 'function') {
            context = { handler: context };
          }
          if (typeof handler === 'function') {
            handler = { handler: handler };
          }
          binding = (0, _extend2.default)(binding, context, handler);
          this.bindings[binding.key] = this.bindings[binding.key] || [];
          this.bindings[binding.key].push(binding);
        }
      }, {
        key: 'listen',
        value: function listen() {
          var _this2 = this;

          this.quill.root.addEventListener('keydown', function (evt) {
            if (evt.defaultPrevented) return;
            var which = evt.which || evt.keyCode;
            var bindings = (_this2.bindings[which] || []).filter(function (binding) {
              return Keyboard.match(evt, binding);
            });
            if (bindings.length === 0) return;
            var range = _this2.quill.getSelection();
            if (range == null || !_this2.quill.hasFocus()) return;

            var _quill$getLine = _this2.quill.getLine(range.index),
                _quill$getLine2 = _slicedToArray(_quill$getLine, 2),
                line = _quill$getLine2[0],
                offset = _quill$getLine2[1];

            var _quill$getLeaf = _this2.quill.getLeaf(range.index),
                _quill$getLeaf2 = _slicedToArray(_quill$getLeaf, 2),
                leafStart = _quill$getLeaf2[0],
                offsetStart = _quill$getLeaf2[1];

            var _ref = range.length === 0 ? [leafStart, offsetStart] : _this2.quill.getLeaf(range.index + range.length),
                _ref2 = _slicedToArray(_ref, 2),
                leafEnd = _ref2[0],
                offsetEnd = _ref2[1];

            var prefixText = leafStart instanceof _parchment2.default.Text ? leafStart.value().slice(0, offsetStart) : '';
            var suffixText = leafEnd instanceof _parchment2.default.Text ? leafEnd.value().slice(offsetEnd) : '';
            var curContext = {
              collapsed: range.length === 0,
              empty: range.length === 0 && line.length() <= 1,
              format: _this2.quill.getFormat(range),
              offset: offset,
              prefix: prefixText,
              suffix: suffixText
            };
            var prevented = bindings.some(function (binding) {
              if (binding.collapsed != null && binding.collapsed !== curContext.collapsed) return false;
              if (binding.empty != null && binding.empty !== curContext.empty) return false;
              if (binding.offset != null && binding.offset !== curContext.offset) return false;
              if (Array.isArray(binding.format)) {
                // any format is present
                if (binding.format.every(function (name) {
                  return curContext.format[name] == null;
                })) {
                  return false;
                }
              } else if (_typeof(binding.format) === 'object') {
                // all formats must match
                if (!Object.keys(binding.format).every(function (name) {
                  if (binding.format[name] === true) return curContext.format[name] != null;
                  if (binding.format[name] === false) return curContext.format[name] == null;
                  return (0, _deepEqual2.default)(binding.format[name], curContext.format[name]);
                })) {
                  return false;
                }
              }
              if (binding.prefix != null && !binding.prefix.test(curContext.prefix)) return false;
              if (binding.suffix != null && !binding.suffix.test(curContext.suffix)) return false;
              return binding.handler.call(_this2, range, curContext) !== true;
            });
            if (prevented) {
              evt.preventDefault();
            }
          });
        }
      }]);

      return Keyboard;
    }(_module2.default);

    Keyboard.keys = {
      BACKSPACE: 8,
      TAB: 9,
      ENTER: 13,
      ESCAPE: 27,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      DELETE: 46
    };

    Keyboard.DEFAULTS = {
      bindings: {
        'bold': makeFormatHandler('bold'),
        'italic': makeFormatHandler('italic'),
        'underline': makeFormatHandler('underline'),
        'indent': {
          // highlight tab or tab at beginning of list, indent or blockquote
          key: Keyboard.keys.TAB,
          format: ['blockquote', 'indent', 'list'],
          handler: function handler(range, context) {
            if (context.collapsed && context.offset !== 0) return true;
            this.quill.format('indent', '+1', _quill2.default.sources.USER);
          }
        },
        'outdent': {
          key: Keyboard.keys.TAB,
          shiftKey: true,
          format: ['blockquote', 'indent', 'list'],
          // highlight tab or tab at beginning of list, indent or blockquote
          handler: function handler(range, context) {
            if (context.collapsed && context.offset !== 0) return true;
            this.quill.format('indent', '-1', _quill2.default.sources.USER);
          }
        },
        'outdent backspace': {
          key: Keyboard.keys.BACKSPACE,
          collapsed: true,
          shiftKey: null,
          metaKey: null,
          ctrlKey: null,
          altKey: null,
          format: ['indent', 'list'],
          offset: 0,
          handler: function handler(range, context) {
            if (context.format.indent != null) {
              this.quill.format('indent', '-1', _quill2.default.sources.USER);
            } else if (context.format.list != null) {
              this.quill.format('list', false, _quill2.default.sources.USER);
            }
          }
        },
        'indent code-block': makeCodeBlockHandler(true),
        'outdent code-block': makeCodeBlockHandler(false),
        'remove tab': {
          key: Keyboard.keys.TAB,
          shiftKey: true,
          collapsed: true,
          prefix: /\t$/,
          handler: function handler(range) {
            this.quill.deleteText(range.index - 1, 1, _quill2.default.sources.USER);
          }
        },
        'tab': {
          key: Keyboard.keys.TAB,
          handler: function handler(range) {
            this.quill.history.cutoff();
            var delta = new _quillDelta2.default().retain(range.index).delete(range.length).insert('\t');
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.history.cutoff();
            this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
          }
        },
        'list empty enter': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: ['list'],
          empty: true,
          handler: function handler(range, context) {
            this.quill.format('list', false, _quill2.default.sources.USER);
            if (context.format.indent) {
              this.quill.format('indent', false, _quill2.default.sources.USER);
            }
          }
        },
        'checklist enter': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: { list: 'checked' },
          handler: function handler(range) {
            var _quill$getLine3 = this.quill.getLine(range.index),
                _quill$getLine4 = _slicedToArray(_quill$getLine3, 2),
                line = _quill$getLine4[0],
                offset = _quill$getLine4[1];

            var formats = (0, _extend2.default)({}, line.formats(), { list: 'checked' });
            var delta = new _quillDelta2.default().retain(range.index).insert('\n', formats).retain(line.length() - offset - 1).retain(1, { list: 'unchecked' });
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
            this.quill.scrollIntoView();
          }
        },
        'header enter': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: ['header'],
          suffix: /^$/,
          handler: function handler(range, context) {
            var _quill$getLine5 = this.quill.getLine(range.index),
                _quill$getLine6 = _slicedToArray(_quill$getLine5, 2),
                line = _quill$getLine6[0],
                offset = _quill$getLine6[1];

            var delta = new _quillDelta2.default().retain(range.index).insert('\n', context.format).retain(line.length() - offset - 1).retain(1, { header: null });
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
            this.quill.scrollIntoView();
          }
        },
        'list autofill': {
          key: ' ',
          collapsed: true,
          format: { list: false },
          prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
          handler: function handler(range, context) {
            var length = context.prefix.length;

            var _quill$getLine7 = this.quill.getLine(range.index),
                _quill$getLine8 = _slicedToArray(_quill$getLine7, 2),
                line = _quill$getLine8[0],
                offset = _quill$getLine8[1];

            if (offset > length) return true;
            var value = void 0;
            switch (context.prefix.trim()) {
              case '[]':case '[ ]':
                value = 'unchecked';
                break;
              case '[x]':
                value = 'checked';
                break;
              case '-':case '*':
                value = 'bullet';
                break;
              default:
                value = 'ordered';
            }
            this.quill.insertText(range.index, ' ', _quill2.default.sources.USER);
            this.quill.history.cutoff();
            var delta = new _quillDelta2.default().retain(range.index - offset).delete(length + 1).retain(line.length() - 2 - offset).retain(1, { list: value });
            this.quill.updateContents(delta, _quill2.default.sources.USER);
            this.quill.history.cutoff();
            this.quill.setSelection(range.index - length, _quill2.default.sources.SILENT);
          }
        },
        'code exit': {
          key: Keyboard.keys.ENTER,
          collapsed: true,
          format: ['code-block'],
          prefix: /\n\n$/,
          suffix: /^\s+$/,
          handler: function handler(range) {
            var _quill$getLine9 = this.quill.getLine(range.index),
                _quill$getLine10 = _slicedToArray(_quill$getLine9, 2),
                line = _quill$getLine10[0],
                offset = _quill$getLine10[1];

            var delta = new _quillDelta2.default().retain(range.index + line.length() - offset - 2).retain(1, { 'code-block': null }).delete(1);
            this.quill.updateContents(delta, _quill2.default.sources.USER);
          }
        },
        'embed left': makeEmbedArrowHandler(Keyboard.keys.LEFT, false),
        'embed left shift': makeEmbedArrowHandler(Keyboard.keys.LEFT, true),
        'embed right': makeEmbedArrowHandler(Keyboard.keys.RIGHT, false),
        'embed right shift': makeEmbedArrowHandler(Keyboard.keys.RIGHT, true)
      }
    };

    function makeEmbedArrowHandler(key, shiftKey) {
      var _ref3;

      var where = key === Keyboard.keys.LEFT ? 'prefix' : 'suffix';
      return _ref3 = {
        key: key,
        shiftKey: shiftKey,
        altKey: null
      }, _defineProperty(_ref3, where, /^$/), _defineProperty(_ref3, 'handler', function handler(range) {
        var index = range.index;
        if (key === Keyboard.keys.RIGHT) {
          index += range.length + 1;
        }

        var _quill$getLeaf3 = this.quill.getLeaf(index),
            _quill$getLeaf4 = _slicedToArray(_quill$getLeaf3, 1),
            leaf = _quill$getLeaf4[0];

        if (!(leaf instanceof _parchment2.default.Embed)) return true;
        if (key === Keyboard.keys.LEFT) {
          if (shiftKey) {
            this.quill.setSelection(range.index - 1, range.length + 1, _quill2.default.sources.USER);
          } else {
            this.quill.setSelection(range.index - 1, _quill2.default.sources.USER);
          }
        } else {
          if (shiftKey) {
            this.quill.setSelection(range.index, range.length + 1, _quill2.default.sources.USER);
          } else {
            this.quill.setSelection(range.index + range.length + 1, _quill2.default.sources.USER);
          }
        }
        return false;
      }), _ref3;
    }

    function handleBackspace(range, context) {
      if (range.index === 0 || this.quill.getLength() <= 1) return;

      var _quill$getLine11 = this.quill.getLine(range.index),
          _quill$getLine12 = _slicedToArray(_quill$getLine11, 1),
          line = _quill$getLine12[0];

      var formats = {};
      if (context.offset === 0) {
        var _quill$getLine13 = this.quill.getLine(range.index - 1),
            _quill$getLine14 = _slicedToArray(_quill$getLine13, 1),
            prev = _quill$getLine14[0];

        if (prev != null && prev.length() > 1) {
          var curFormats = line.formats();
          var prevFormats = this.quill.getFormat(range.index - 1, 1);
          formats = _op2.default.attributes.diff(curFormats, prevFormats) || {};
        }
      }
      // Check for astral symbols
      var length = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(context.prefix) ? 2 : 1;
      this.quill.deleteText(range.index - length, length, _quill2.default.sources.USER);
      if (Object.keys(formats).length > 0) {
        this.quill.formatLine(range.index - length, length, formats, _quill2.default.sources.USER);
      }
      this.quill.focus();
    }

    function handleDelete(range, context) {
      // Check for astral symbols
      var length = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(context.suffix) ? 2 : 1;
      if (range.index >= this.quill.getLength() - length) return;
      var formats = {},
          nextLength = 0;

      var _quill$getLine15 = this.quill.getLine(range.index),
          _quill$getLine16 = _slicedToArray(_quill$getLine15, 1),
          line = _quill$getLine16[0];

      if (context.offset >= line.length() - 1) {
        var _quill$getLine17 = this.quill.getLine(range.index + 1),
            _quill$getLine18 = _slicedToArray(_quill$getLine17, 1),
            next = _quill$getLine18[0];

        if (next) {
          var curFormats = line.formats();
          var nextFormats = this.quill.getFormat(range.index, 1);
          formats = _op2.default.attributes.diff(curFormats, nextFormats) || {};
          nextLength = next.length();
        }
      }
      this.quill.deleteText(range.index, length, _quill2.default.sources.USER);
      if (Object.keys(formats).length > 0) {
        this.quill.formatLine(range.index + nextLength - 1, length, formats, _quill2.default.sources.USER);
      }
    }

    function handleDeleteRange(range) {
      var lines = this.quill.getLines(range);
      var formats = {};
      if (lines.length > 1) {
        var firstFormats = lines[0].formats();
        var lastFormats = lines[lines.length - 1].formats();
        formats = _op2.default.attributes.diff(lastFormats, firstFormats) || {};
      }
      this.quill.deleteText(range, _quill2.default.sources.USER);
      if (Object.keys(formats).length > 0) {
        this.quill.formatLine(range.index, 1, formats, _quill2.default.sources.USER);
      }
      this.quill.setSelection(range.index, _quill2.default.sources.SILENT);
      this.quill.focus();
    }

    function handleEnter(range, context) {
      var _this3 = this;

      if (range.length > 0) {
        this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
      }
      var lineFormats = Object.keys(context.format).reduce(function (lineFormats, format) {
        if (_parchment2.default.query(format, _parchment2.default.Scope.BLOCK) && !Array.isArray(context.format[format])) {
          lineFormats[format] = context.format[format];
        }
        return lineFormats;
      }, {});
      this.quill.insertText(range.index, '\n', lineFormats, _quill2.default.sources.USER);
      // Earlier scroll.deleteAt might have messed up our selection,
      // so insertText's built in selection preservation is not reliable
      this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
      this.quill.focus();
      Object.keys(context.format).forEach(function (name) {
        if (lineFormats[name] != null) return;
        if (Array.isArray(context.format[name])) return;
        if (name === 'link') return;
        _this3.quill.format(name, context.format[name], _quill2.default.sources.USER);
      });
    }

    function makeCodeBlockHandler(indent) {
      return {
        key: Keyboard.keys.TAB,
        shiftKey: !indent,
        format: { 'code-block': true },
        handler: function handler(range) {
          var CodeBlock = _parchment2.default.query('code-block');
          var index = range.index,
              length = range.length;

          var _quill$scroll$descend = this.quill.scroll.descendant(CodeBlock, index),
              _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
              block = _quill$scroll$descend2[0],
              offset = _quill$scroll$descend2[1];

          if (block == null) return;
          var scrollIndex = this.quill.getIndex(block);
          var start = block.newlineIndex(offset, true) + 1;
          var end = block.newlineIndex(scrollIndex + offset + length);
          var lines = block.domNode.textContent.slice(start, end).split('\n');
          offset = 0;
          lines.forEach(function (line, i) {
            if (indent) {
              block.insertAt(start + offset, CodeBlock.TAB);
              offset += CodeBlock.TAB.length;
              if (i === 0) {
                index += CodeBlock.TAB.length;
              } else {
                length += CodeBlock.TAB.length;
              }
            } else if (line.startsWith(CodeBlock.TAB)) {
              block.deleteAt(start + offset, CodeBlock.TAB.length);
              offset -= CodeBlock.TAB.length;
              if (i === 0) {
                index -= CodeBlock.TAB.length;
              } else {
                length -= CodeBlock.TAB.length;
              }
            }
            offset += line.length + 1;
          });
          this.quill.update(_quill2.default.sources.USER);
          this.quill.setSelection(index, length, _quill2.default.sources.SILENT);
        }
      };
    }

    function makeFormatHandler(format) {
      return {
        key: format[0].toUpperCase(),
        shortKey: true,
        handler: function handler(range, context) {
          this.quill.format(format, !context.format[format], _quill2.default.sources.USER);
        }
      };
    }

    function normalize(binding) {
      if (typeof binding === 'string' || typeof binding === 'number') {
        return normalize({ key: binding });
      }
      if ((typeof binding === 'undefined' ? 'undefined' : _typeof(binding)) === 'object') {
        binding = (0, _clone2.default)(binding, false);
      }
      if (typeof binding.key === 'string') {
        if (Keyboard.keys[binding.key.toUpperCase()] != null) {
          binding.key = Keyboard.keys[binding.key.toUpperCase()];
        } else if (binding.key.length === 1) {
          binding.key = binding.key.toUpperCase().charCodeAt(0);
        } else {
          return null;
        }
      }
      if (binding.shortKey) {
        binding[SHORTKEY] = binding.shortKey;
        delete binding.shortKey;
      }
      return binding;
    }

    exports.default = Keyboard;
    exports.SHORTKEY = SHORTKEY;

    /***/ }),
    /* 24 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Cursor = function (_Parchment$Embed) {
      _inherits(Cursor, _Parchment$Embed);

      _createClass(Cursor, null, [{
        key: 'value',
        value: function value() {
          return undefined;
        }
      }]);

      function Cursor(domNode, selection) {
        _classCallCheck(this, Cursor);

        var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this, domNode));

        _this.selection = selection;
        _this.textNode = document.createTextNode(Cursor.CONTENTS);
        _this.domNode.appendChild(_this.textNode);
        _this._length = 0;
        return _this;
      }

      _createClass(Cursor, [{
        key: 'detach',
        value: function detach() {
          // super.detach() will also clear domNode.__blot
          if (this.parent != null) this.parent.removeChild(this);
        }
      }, {
        key: 'format',
        value: function format(name, value) {
          if (this._length !== 0) {
            return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'format', this).call(this, name, value);
          }
          var target = this,
              index = 0;
          while (target != null && target.statics.scope !== _parchment2.default.Scope.BLOCK_BLOT) {
            index += target.offset(target.parent);
            target = target.parent;
          }
          if (target != null) {
            this._length = Cursor.CONTENTS.length;
            target.optimize();
            target.formatAt(index, Cursor.CONTENTS.length, name, value);
            this._length = 0;
          }
        }
      }, {
        key: 'index',
        value: function index(node, offset) {
          if (node === this.textNode) return 0;
          return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'index', this).call(this, node, offset);
        }
      }, {
        key: 'length',
        value: function length() {
          return this._length;
        }
      }, {
        key: 'position',
        value: function position() {
          return [this.textNode, this.textNode.data.length];
        }
      }, {
        key: 'remove',
        value: function remove() {
          _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'remove', this).call(this);
          this.parent = null;
        }
      }, {
        key: 'restore',
        value: function restore() {
          if (this.selection.composing || this.parent == null) return;
          var textNode = this.textNode;
          var range = this.selection.getNativeRange();
          var restoreText = void 0,
              start = void 0,
              end = void 0;
          if (range != null && range.start.node === textNode && range.end.node === textNode) {
            var _ref = [textNode, range.start.offset, range.end.offset];
            restoreText = _ref[0];
            start = _ref[1];
            end = _ref[2];
          }
          // Link format will insert text outside of anchor tag
          while (this.domNode.lastChild != null && this.domNode.lastChild !== this.textNode) {
            this.domNode.parentNode.insertBefore(this.domNode.lastChild, this.domNode);
          }
          if (this.textNode.data !== Cursor.CONTENTS) {
            var text = this.textNode.data.split(Cursor.CONTENTS).join('');
            if (this.next instanceof _text2.default) {
              restoreText = this.next.domNode;
              this.next.insertAt(0, text);
              this.textNode.data = Cursor.CONTENTS;
            } else {
              this.textNode.data = text;
              this.parent.insertBefore(_parchment2.default.create(this.textNode), this);
              this.textNode = document.createTextNode(Cursor.CONTENTS);
              this.domNode.appendChild(this.textNode);
            }
          }
          this.remove();
          if (start != null) {
            var _map = [start, end].map(function (offset) {
              return Math.max(0, Math.min(restoreText.data.length, offset - 1));
            });

            var _map2 = _slicedToArray(_map, 2);

            start = _map2[0];
            end = _map2[1];

            return {
              startNode: restoreText,
              startOffset: start,
              endNode: restoreText,
              endOffset: end
            };
          }
        }
      }, {
        key: 'update',
        value: function update(mutations, context) {
          var _this2 = this;

          if (mutations.some(function (mutation) {
            return mutation.type === 'characterData' && mutation.target === _this2.textNode;
          })) {
            var range = this.restore();
            if (range) context.range = range;
          }
        }
      }, {
        key: 'value',
        value: function value() {
          return '';
        }
      }]);

      return Cursor;
    }(_parchment2.default.Embed);

    Cursor.blotName = 'cursor';
    Cursor.className = 'ql-cursor';
    Cursor.tagName = 'span';
    Cursor.CONTENTS = '\uFEFF'; // Zero width no break space


    exports.default = Cursor;

    /***/ }),
    /* 25 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Container = function (_Parchment$Container) {
      _inherits(Container, _Parchment$Container);

      function Container() {
        _classCallCheck(this, Container);

        return _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).apply(this, arguments));
      }

      return Container;
    }(_parchment2.default.Container);

    Container.allowedChildren = [_block2.default, _block.BlockEmbed, Container];

    exports.default = Container;

    /***/ }),
    /* 26 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ColorStyle = exports.ColorClass = exports.ColorAttributor = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ColorAttributor = function (_Parchment$Attributor) {
      _inherits(ColorAttributor, _Parchment$Attributor);

      function ColorAttributor() {
        _classCallCheck(this, ColorAttributor);

        return _possibleConstructorReturn(this, (ColorAttributor.__proto__ || Object.getPrototypeOf(ColorAttributor)).apply(this, arguments));
      }

      _createClass(ColorAttributor, [{
        key: 'value',
        value: function value(domNode) {
          var value = _get(ColorAttributor.prototype.__proto__ || Object.getPrototypeOf(ColorAttributor.prototype), 'value', this).call(this, domNode);
          if (!value.startsWith('rgb(')) return value;
          value = value.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
          return '#' + value.split(',').map(function (component) {
            return ('00' + parseInt(component).toString(16)).slice(-2);
          }).join('');
        }
      }]);

      return ColorAttributor;
    }(_parchment2.default.Attributor.Style);

    var ColorClass = new _parchment2.default.Attributor.Class('color', 'ql-color', {
      scope: _parchment2.default.Scope.INLINE
    });
    var ColorStyle = new ColorAttributor('color', 'color', {
      scope: _parchment2.default.Scope.INLINE
    });

    exports.ColorAttributor = ColorAttributor;
    exports.ColorClass = ColorClass;
    exports.ColorStyle = ColorStyle;

    /***/ }),
    /* 27 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.sanitize = exports.default = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Link = function (_Inline) {
      _inherits(Link, _Inline);

      function Link() {
        _classCallCheck(this, Link);

        return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
      }

      _createClass(Link, [{
        key: 'format',
        value: function format(name, value) {
          if (name !== this.statics.blotName || !value) return _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), 'format', this).call(this, name, value);
          value = this.constructor.sanitize(value);
          this.domNode.setAttribute('href', value);
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var node = _get(Link.__proto__ || Object.getPrototypeOf(Link), 'create', this).call(this, value);
          value = this.sanitize(value);
          node.setAttribute('href', value);
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          return domNode.getAttribute('href');
        }
      }, {
        key: 'sanitize',
        value: function sanitize(url) {
          return _sanitize(url, this.PROTOCOL_WHITELIST) ? url : this.SANITIZED_URL;
        }
      }]);

      return Link;
    }(_inline2.default);

    Link.blotName = 'link';
    Link.tagName = 'A';
    Link.SANITIZED_URL = 'about:blank';
    Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel'];

    function _sanitize(url, protocols) {
      var anchor = document.createElement('a');
      anchor.href = url;
      var protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
      return protocols.indexOf(protocol) > -1;
    }

    exports.default = Link;
    exports.sanitize = _sanitize;

    /***/ }),
    /* 28 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _keyboard = __webpack_require__(23);

    var _keyboard2 = _interopRequireDefault(_keyboard);

    var _dropdown = __webpack_require__(107);

    var _dropdown2 = _interopRequireDefault(_dropdown);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var optionsCounter = 0;

    function toggleAriaAttribute(element, attribute) {
      element.setAttribute(attribute, !(element.getAttribute(attribute) === 'true'));
    }

    var Picker = function () {
      function Picker(select) {
        var _this = this;

        _classCallCheck(this, Picker);

        this.select = select;
        this.container = document.createElement('span');
        this.buildPicker();
        this.select.style.display = 'none';
        this.select.parentNode.insertBefore(this.container, this.select);

        this.label.addEventListener('mousedown', function () {
          _this.togglePicker();
        });
        this.label.addEventListener('keydown', function (event) {
          switch (event.keyCode) {
            // Allows the "Enter" key to open the picker
            case _keyboard2.default.keys.ENTER:
              _this.togglePicker();
              break;

            // Allows the "Escape" key to close the picker
            case _keyboard2.default.keys.ESCAPE:
              _this.escape();
              event.preventDefault();
              break;
          }
        });
        this.select.addEventListener('change', this.update.bind(this));
      }

      _createClass(Picker, [{
        key: 'togglePicker',
        value: function togglePicker() {
          this.container.classList.toggle('ql-expanded');
          // Toggle aria-expanded and aria-hidden to make the picker accessible
          toggleAriaAttribute(this.label, 'aria-expanded');
          toggleAriaAttribute(this.options, 'aria-hidden');
        }
      }, {
        key: 'buildItem',
        value: function buildItem(option) {
          var _this2 = this;

          var item = document.createElement('span');
          item.tabIndex = '0';
          item.setAttribute('role', 'button');

          item.classList.add('ql-picker-item');
          if (option.hasAttribute('value')) {
            item.setAttribute('data-value', option.getAttribute('value'));
          }
          if (option.textContent) {
            item.setAttribute('data-label', option.textContent);
          }
          item.addEventListener('click', function () {
            _this2.selectItem(item, true);
          });
          item.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
              // Allows the "Enter" key to select an item
              case _keyboard2.default.keys.ENTER:
                _this2.selectItem(item, true);
                event.preventDefault();
                break;

              // Allows the "Escape" key to close the picker
              case _keyboard2.default.keys.ESCAPE:
                _this2.escape();
                event.preventDefault();
                break;
            }
          });

          return item;
        }
      }, {
        key: 'buildLabel',
        value: function buildLabel() {
          var label = document.createElement('span');
          label.classList.add('ql-picker-label');
          label.innerHTML = _dropdown2.default;
          label.tabIndex = '0';
          label.setAttribute('role', 'button');
          label.setAttribute('aria-expanded', 'false');
          this.container.appendChild(label);
          return label;
        }
      }, {
        key: 'buildOptions',
        value: function buildOptions() {
          var _this3 = this;

          var options = document.createElement('span');
          options.classList.add('ql-picker-options');

          // Don't want screen readers to read this until options are visible
          options.setAttribute('aria-hidden', 'true');
          options.tabIndex = '-1';

          // Need a unique id for aria-controls
          options.id = 'ql-picker-options-' + optionsCounter;
          optionsCounter += 1;
          this.label.setAttribute('aria-controls', options.id);

          this.options = options;

          [].slice.call(this.select.options).forEach(function (option) {
            var item = _this3.buildItem(option);
            options.appendChild(item);
            if (option.selected === true) {
              _this3.selectItem(item);
            }
          });
          this.container.appendChild(options);
        }
      }, {
        key: 'buildPicker',
        value: function buildPicker() {
          var _this4 = this;

          [].slice.call(this.select.attributes).forEach(function (item) {
            _this4.container.setAttribute(item.name, item.value);
          });
          this.container.classList.add('ql-picker');
          this.label = this.buildLabel();
          this.buildOptions();
        }
      }, {
        key: 'escape',
        value: function escape() {
          var _this5 = this;

          // Close menu and return focus to trigger label
          this.close();
          // Need setTimeout for accessibility to ensure that the browser executes
          // focus on the next process thread and after any DOM content changes
          setTimeout(function () {
            return _this5.label.focus();
          }, 1);
        }
      }, {
        key: 'close',
        value: function close() {
          this.container.classList.remove('ql-expanded');
          this.label.setAttribute('aria-expanded', 'false');
          this.options.setAttribute('aria-hidden', 'true');
        }
      }, {
        key: 'selectItem',
        value: function selectItem(item) {
          var trigger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          var selected = this.container.querySelector('.ql-selected');
          if (item === selected) return;
          if (selected != null) {
            selected.classList.remove('ql-selected');
          }
          if (item == null) return;
          item.classList.add('ql-selected');
          this.select.selectedIndex = [].indexOf.call(item.parentNode.children, item);
          if (item.hasAttribute('data-value')) {
            this.label.setAttribute('data-value', item.getAttribute('data-value'));
          } else {
            this.label.removeAttribute('data-value');
          }
          if (item.hasAttribute('data-label')) {
            this.label.setAttribute('data-label', item.getAttribute('data-label'));
          } else {
            this.label.removeAttribute('data-label');
          }
          if (trigger) {
            if (typeof Event === 'function') {
              this.select.dispatchEvent(new Event('change'));
            } else if ((typeof Event === 'undefined' ? 'undefined' : _typeof(Event)) === 'object') {
              // IE11
              var event = document.createEvent('Event');
              event.initEvent('change', true, true);
              this.select.dispatchEvent(event);
            }
            this.close();
          }
        }
      }, {
        key: 'update',
        value: function update() {
          var option = void 0;
          if (this.select.selectedIndex > -1) {
            var item = this.container.querySelector('.ql-picker-options').children[this.select.selectedIndex];
            option = this.select.options[this.select.selectedIndex];
            this.selectItem(item);
          } else {
            this.selectItem(null);
          }
          var isActive = option != null && option !== this.select.querySelector('option[selected]');
          this.label.classList.toggle('ql-active', isActive);
        }
      }]);

      return Picker;
    }();

    exports.default = Picker;

    /***/ }),
    /* 29 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _break = __webpack_require__(16);

    var _break2 = _interopRequireDefault(_break);

    var _container = __webpack_require__(25);

    var _container2 = _interopRequireDefault(_container);

    var _cursor = __webpack_require__(24);

    var _cursor2 = _interopRequireDefault(_cursor);

    var _embed = __webpack_require__(35);

    var _embed2 = _interopRequireDefault(_embed);

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    var _scroll = __webpack_require__(22);

    var _scroll2 = _interopRequireDefault(_scroll);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    var _clipboard = __webpack_require__(55);

    var _clipboard2 = _interopRequireDefault(_clipboard);

    var _history = __webpack_require__(42);

    var _history2 = _interopRequireDefault(_history);

    var _keyboard = __webpack_require__(23);

    var _keyboard2 = _interopRequireDefault(_keyboard);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    _quill2.default.register({
      'blots/block': _block2.default,
      'blots/block/embed': _block.BlockEmbed,
      'blots/break': _break2.default,
      'blots/container': _container2.default,
      'blots/cursor': _cursor2.default,
      'blots/embed': _embed2.default,
      'blots/inline': _inline2.default,
      'blots/scroll': _scroll2.default,
      'blots/text': _text2.default,

      'modules/clipboard': _clipboard2.default,
      'modules/history': _history2.default,
      'modules/keyboard': _keyboard2.default
    });

    _parchment2.default.register(_block2.default, _break2.default, _cursor2.default, _inline2.default, _scroll2.default, _text2.default);

    exports.default = _quill2.default;

    /***/ }),
    /* 30 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var Registry = __webpack_require__(1);
    var ShadowBlot = /** @class */ (function () {
        function ShadowBlot(domNode) {
            this.domNode = domNode;
            // @ts-ignore
            this.domNode[Registry.DATA_KEY] = { blot: this };
        }
        Object.defineProperty(ShadowBlot.prototype, "statics", {
            // Hack for accessing inherited static methods
            get: function () {
                return this.constructor;
            },
            enumerable: true,
            configurable: true
        });
        ShadowBlot.create = function (value) {
            if (this.tagName == null) {
                throw new Registry.ParchmentError('Blot definition missing tagName');
            }
            var node;
            if (Array.isArray(this.tagName)) {
                if (typeof value === 'string') {
                    value = value.toUpperCase();
                    if (parseInt(value).toString() === value) {
                        value = parseInt(value);
                    }
                }
                if (typeof value === 'number') {
                    node = document.createElement(this.tagName[value - 1]);
                }
                else if (this.tagName.indexOf(value) > -1) {
                    node = document.createElement(value);
                }
                else {
                    node = document.createElement(this.tagName[0]);
                }
            }
            else {
                node = document.createElement(this.tagName);
            }
            if (this.className) {
                node.classList.add(this.className);
            }
            return node;
        };
        ShadowBlot.prototype.attach = function () {
            if (this.parent != null) {
                this.scroll = this.parent.scroll;
            }
        };
        ShadowBlot.prototype.clone = function () {
            var domNode = this.domNode.cloneNode(false);
            return Registry.create(domNode);
        };
        ShadowBlot.prototype.detach = function () {
            if (this.parent != null)
                this.parent.removeChild(this);
            // @ts-ignore
            delete this.domNode[Registry.DATA_KEY];
        };
        ShadowBlot.prototype.deleteAt = function (index, length) {
            var blot = this.isolate(index, length);
            blot.remove();
        };
        ShadowBlot.prototype.formatAt = function (index, length, name, value) {
            var blot = this.isolate(index, length);
            if (Registry.query(name, Registry.Scope.BLOT) != null && value) {
                blot.wrap(name, value);
            }
            else if (Registry.query(name, Registry.Scope.ATTRIBUTE) != null) {
                var parent = Registry.create(this.statics.scope);
                blot.wrap(parent);
                parent.format(name, value);
            }
        };
        ShadowBlot.prototype.insertAt = function (index, value, def) {
            var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
            var ref = this.split(index);
            this.parent.insertBefore(blot, ref);
        };
        ShadowBlot.prototype.insertInto = function (parentBlot, refBlot) {
            if (refBlot === void 0) { refBlot = null; }
            if (this.parent != null) {
                this.parent.children.remove(this);
            }
            var refDomNode = null;
            parentBlot.children.insertBefore(this, refBlot);
            if (refBlot != null) {
                refDomNode = refBlot.domNode;
            }
            if (this.domNode.parentNode != parentBlot.domNode ||
                this.domNode.nextSibling != refDomNode) {
                parentBlot.domNode.insertBefore(this.domNode, refDomNode);
            }
            this.parent = parentBlot;
            this.attach();
        };
        ShadowBlot.prototype.isolate = function (index, length) {
            var target = this.split(index);
            target.split(length);
            return target;
        };
        ShadowBlot.prototype.length = function () {
            return 1;
        };
        ShadowBlot.prototype.offset = function (root) {
            if (root === void 0) { root = this.parent; }
            if (this.parent == null || this == root)
                return 0;
            return this.parent.children.offset(this) + this.parent.offset(root);
        };
        ShadowBlot.prototype.optimize = function (context) {
            // TODO clean up once we use WeakMap
            // @ts-ignore
            if (this.domNode[Registry.DATA_KEY] != null) {
                // @ts-ignore
                delete this.domNode[Registry.DATA_KEY].mutations;
            }
        };
        ShadowBlot.prototype.remove = function () {
            if (this.domNode.parentNode != null) {
                this.domNode.parentNode.removeChild(this.domNode);
            }
            this.detach();
        };
        ShadowBlot.prototype.replace = function (target) {
            if (target.parent == null)
                return;
            target.parent.insertBefore(this, target.next);
            target.remove();
        };
        ShadowBlot.prototype.replaceWith = function (name, value) {
            var replacement = typeof name === 'string' ? Registry.create(name, value) : name;
            replacement.replace(this);
            return replacement;
        };
        ShadowBlot.prototype.split = function (index, force) {
            return index === 0 ? this : this.next;
        };
        ShadowBlot.prototype.update = function (mutations, context) {
            // Nothing to do by default
        };
        ShadowBlot.prototype.wrap = function (name, value) {
            var wrapper = typeof name === 'string' ? Registry.create(name, value) : name;
            if (this.parent != null) {
                this.parent.insertBefore(wrapper, this.next);
            }
            wrapper.appendChild(this);
            return wrapper;
        };
        ShadowBlot.blotName = 'abstract';
        return ShadowBlot;
    }());
    exports.default = ShadowBlot;


    /***/ }),
    /* 31 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    var class_1 = __webpack_require__(32);
    var style_1 = __webpack_require__(33);
    var Registry = __webpack_require__(1);
    var AttributorStore = /** @class */ (function () {
        function AttributorStore(domNode) {
            this.attributes = {};
            this.domNode = domNode;
            this.build();
        }
        AttributorStore.prototype.attribute = function (attribute, value) {
            // verb
            if (value) {
                if (attribute.add(this.domNode, value)) {
                    if (attribute.value(this.domNode) != null) {
                        this.attributes[attribute.attrName] = attribute;
                    }
                    else {
                        delete this.attributes[attribute.attrName];
                    }
                }
            }
            else {
                attribute.remove(this.domNode);
                delete this.attributes[attribute.attrName];
            }
        };
        AttributorStore.prototype.build = function () {
            var _this = this;
            this.attributes = {};
            var attributes = attributor_1.default.keys(this.domNode);
            var classes = class_1.default.keys(this.domNode);
            var styles = style_1.default.keys(this.domNode);
            attributes
                .concat(classes)
                .concat(styles)
                .forEach(function (name) {
                var attr = Registry.query(name, Registry.Scope.ATTRIBUTE);
                if (attr instanceof attributor_1.default) {
                    _this.attributes[attr.attrName] = attr;
                }
            });
        };
        AttributorStore.prototype.copy = function (target) {
            var _this = this;
            Object.keys(this.attributes).forEach(function (key) {
                var value = _this.attributes[key].value(_this.domNode);
                target.format(key, value);
            });
        };
        AttributorStore.prototype.move = function (target) {
            var _this = this;
            this.copy(target);
            Object.keys(this.attributes).forEach(function (key) {
                _this.attributes[key].remove(_this.domNode);
            });
            this.attributes = {};
        };
        AttributorStore.prototype.values = function () {
            var _this = this;
            return Object.keys(this.attributes).reduce(function (attributes, name) {
                attributes[name] = _this.attributes[name].value(_this.domNode);
                return attributes;
            }, {});
        };
        return AttributorStore;
    }());
    exports.default = AttributorStore;


    /***/ }),
    /* 32 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    function match(node, prefix) {
        var className = node.getAttribute('class') || '';
        return className.split(/\s+/).filter(function (name) {
            return name.indexOf(prefix + "-") === 0;
        });
    }
    var ClassAttributor = /** @class */ (function (_super) {
        __extends(ClassAttributor, _super);
        function ClassAttributor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClassAttributor.keys = function (node) {
            return (node.getAttribute('class') || '').split(/\s+/).map(function (name) {
                return name
                    .split('-')
                    .slice(0, -1)
                    .join('-');
            });
        };
        ClassAttributor.prototype.add = function (node, value) {
            if (!this.canAdd(node, value))
                return false;
            this.remove(node);
            node.classList.add(this.keyName + "-" + value);
            return true;
        };
        ClassAttributor.prototype.remove = function (node) {
            var matches = match(node, this.keyName);
            matches.forEach(function (name) {
                node.classList.remove(name);
            });
            if (node.classList.length === 0) {
                node.removeAttribute('class');
            }
        };
        ClassAttributor.prototype.value = function (node) {
            var result = match(node, this.keyName)[0] || '';
            var value = result.slice(this.keyName.length + 1); // +1 for hyphen
            return this.canAdd(node, value) ? value : '';
        };
        return ClassAttributor;
    }(attributor_1.default));
    exports.default = ClassAttributor;


    /***/ }),
    /* 33 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var attributor_1 = __webpack_require__(12);
    function camelize(name) {
        var parts = name.split('-');
        var rest = parts
            .slice(1)
            .map(function (part) {
            return part[0].toUpperCase() + part.slice(1);
        })
            .join('');
        return parts[0] + rest;
    }
    var StyleAttributor = /** @class */ (function (_super) {
        __extends(StyleAttributor, _super);
        function StyleAttributor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StyleAttributor.keys = function (node) {
            return (node.getAttribute('style') || '').split(';').map(function (value) {
                var arr = value.split(':');
                return arr[0].trim();
            });
        };
        StyleAttributor.prototype.add = function (node, value) {
            if (!this.canAdd(node, value))
                return false;
            // @ts-ignore
            node.style[camelize(this.keyName)] = value;
            return true;
        };
        StyleAttributor.prototype.remove = function (node) {
            // @ts-ignore
            node.style[camelize(this.keyName)] = '';
            if (!node.getAttribute('style')) {
                node.removeAttribute('style');
            }
        };
        StyleAttributor.prototype.value = function (node) {
            // @ts-ignore
            var value = node.style[camelize(this.keyName)];
            return this.canAdd(node, value) ? value : '';
        };
        return StyleAttributor;
    }(attributor_1.default));
    exports.default = StyleAttributor;


    /***/ }),
    /* 34 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Theme = function () {
      function Theme(quill, options) {
        _classCallCheck(this, Theme);

        this.quill = quill;
        this.options = options;
        this.modules = {};
      }

      _createClass(Theme, [{
        key: 'init',
        value: function init() {
          var _this = this;

          Object.keys(this.options.modules).forEach(function (name) {
            if (_this.modules[name] == null) {
              _this.addModule(name);
            }
          });
        }
      }, {
        key: 'addModule',
        value: function addModule(name) {
          var moduleClass = this.quill.constructor.import('modules/' + name);
          this.modules[name] = new moduleClass(this.quill, this.options.modules[name] || {});
          return this.modules[name];
        }
      }]);

      return Theme;
    }();

    Theme.DEFAULTS = {
      modules: {}
    };
    Theme.themes = {
      'default': Theme
    };

    exports.default = Theme;

    /***/ }),
    /* 35 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _text = __webpack_require__(7);

    var _text2 = _interopRequireDefault(_text);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var GUARD_TEXT = '\uFEFF';

    var Embed = function (_Parchment$Embed) {
      _inherits(Embed, _Parchment$Embed);

      function Embed(node) {
        _classCallCheck(this, Embed);

        var _this = _possibleConstructorReturn(this, (Embed.__proto__ || Object.getPrototypeOf(Embed)).call(this, node));

        _this.contentNode = document.createElement('span');
        _this.contentNode.setAttribute('contenteditable', false);
        [].slice.call(_this.domNode.childNodes).forEach(function (childNode) {
          _this.contentNode.appendChild(childNode);
        });
        _this.leftGuard = document.createTextNode(GUARD_TEXT);
        _this.rightGuard = document.createTextNode(GUARD_TEXT);
        _this.domNode.appendChild(_this.leftGuard);
        _this.domNode.appendChild(_this.contentNode);
        _this.domNode.appendChild(_this.rightGuard);
        return _this;
      }

      _createClass(Embed, [{
        key: 'index',
        value: function index(node, offset) {
          if (node === this.leftGuard) return 0;
          if (node === this.rightGuard) return 1;
          return _get(Embed.prototype.__proto__ || Object.getPrototypeOf(Embed.prototype), 'index', this).call(this, node, offset);
        }
      }, {
        key: 'restore',
        value: function restore(node) {
          var range = void 0,
              textNode = void 0;
          var text = node.data.split(GUARD_TEXT).join('');
          if (node === this.leftGuard) {
            if (this.prev instanceof _text2.default) {
              var prevLength = this.prev.length();
              this.prev.insertAt(prevLength, text);
              range = {
                startNode: this.prev.domNode,
                startOffset: prevLength + text.length
              };
            } else {
              textNode = document.createTextNode(text);
              this.parent.insertBefore(_parchment2.default.create(textNode), this);
              range = {
                startNode: textNode,
                startOffset: text.length
              };
            }
          } else if (node === this.rightGuard) {
            if (this.next instanceof _text2.default) {
              this.next.insertAt(0, text);
              range = {
                startNode: this.next.domNode,
                startOffset: text.length
              };
            } else {
              textNode = document.createTextNode(text);
              this.parent.insertBefore(_parchment2.default.create(textNode), this.next);
              range = {
                startNode: textNode,
                startOffset: text.length
              };
            }
          }
          node.data = GUARD_TEXT;
          return range;
        }
      }, {
        key: 'update',
        value: function update(mutations, context) {
          var _this2 = this;

          mutations.forEach(function (mutation) {
            if (mutation.type === 'characterData' && (mutation.target === _this2.leftGuard || mutation.target === _this2.rightGuard)) {
              var range = _this2.restore(mutation.target);
              if (range) context.range = range;
            }
          });
        }
      }]);

      return Embed;
    }(_parchment2.default.Embed);

    exports.default = Embed;

    /***/ }),
    /* 36 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.AlignStyle = exports.AlignClass = exports.AlignAttribute = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var config = {
      scope: _parchment2.default.Scope.BLOCK,
      whitelist: ['right', 'center', 'justify']
    };

    var AlignAttribute = new _parchment2.default.Attributor.Attribute('align', 'align', config);
    var AlignClass = new _parchment2.default.Attributor.Class('align', 'ql-align', config);
    var AlignStyle = new _parchment2.default.Attributor.Style('align', 'text-align', config);

    exports.AlignAttribute = AlignAttribute;
    exports.AlignClass = AlignClass;
    exports.AlignStyle = AlignStyle;

    /***/ }),
    /* 37 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BackgroundStyle = exports.BackgroundClass = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _color = __webpack_require__(26);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var BackgroundClass = new _parchment2.default.Attributor.Class('background', 'ql-bg', {
      scope: _parchment2.default.Scope.INLINE
    });
    var BackgroundStyle = new _color.ColorAttributor('background', 'background-color', {
      scope: _parchment2.default.Scope.INLINE
    });

    exports.BackgroundClass = BackgroundClass;
    exports.BackgroundStyle = BackgroundStyle;

    /***/ }),
    /* 38 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.DirectionStyle = exports.DirectionClass = exports.DirectionAttribute = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var config = {
      scope: _parchment2.default.Scope.BLOCK,
      whitelist: ['rtl']
    };

    var DirectionAttribute = new _parchment2.default.Attributor.Attribute('direction', 'dir', config);
    var DirectionClass = new _parchment2.default.Attributor.Class('direction', 'ql-direction', config);
    var DirectionStyle = new _parchment2.default.Attributor.Style('direction', 'direction', config);

    exports.DirectionAttribute = DirectionAttribute;
    exports.DirectionClass = DirectionClass;
    exports.DirectionStyle = DirectionStyle;

    /***/ }),
    /* 39 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.FontClass = exports.FontStyle = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var config = {
      scope: _parchment2.default.Scope.INLINE,
      whitelist: ['serif', 'monospace']
    };

    var FontClass = new _parchment2.default.Attributor.Class('font', 'ql-font', config);

    var FontStyleAttributor = function (_Parchment$Attributor) {
      _inherits(FontStyleAttributor, _Parchment$Attributor);

      function FontStyleAttributor() {
        _classCallCheck(this, FontStyleAttributor);

        return _possibleConstructorReturn(this, (FontStyleAttributor.__proto__ || Object.getPrototypeOf(FontStyleAttributor)).apply(this, arguments));
      }

      _createClass(FontStyleAttributor, [{
        key: 'value',
        value: function value(node) {
          return _get(FontStyleAttributor.prototype.__proto__ || Object.getPrototypeOf(FontStyleAttributor.prototype), 'value', this).call(this, node).replace(/["']/g, '');
        }
      }]);

      return FontStyleAttributor;
    }(_parchment2.default.Attributor.Style);

    var FontStyle = new FontStyleAttributor('font', 'font-family', config);

    exports.FontStyle = FontStyle;
    exports.FontClass = FontClass;

    /***/ }),
    /* 40 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SizeStyle = exports.SizeClass = undefined;

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    var SizeClass = new _parchment2.default.Attributor.Class('size', 'ql-size', {
      scope: _parchment2.default.Scope.INLINE,
      whitelist: ['small', 'large', 'huge']
    });
    var SizeStyle = new _parchment2.default.Attributor.Style('size', 'font-size', {
      scope: _parchment2.default.Scope.INLINE,
      whitelist: ['10px', '18px', '32px']
    });

    exports.SizeClass = SizeClass;
    exports.SizeStyle = SizeStyle;

    /***/ }),
    /* 41 */
    /***/ (function(module, exports, __webpack_require__) {


    module.exports = {
      'align': {
        '': __webpack_require__(76),
        'center': __webpack_require__(77),
        'right': __webpack_require__(78),
        'justify': __webpack_require__(79)
      },
      'background': __webpack_require__(80),
      'blockquote': __webpack_require__(81),
      'bold': __webpack_require__(82),
      'clean': __webpack_require__(83),
      'code': __webpack_require__(58),
      'code-block': __webpack_require__(58),
      'color': __webpack_require__(84),
      'direction': {
        '': __webpack_require__(85),
        'rtl': __webpack_require__(86)
      },
      'float': {
        'center': __webpack_require__(87),
        'full': __webpack_require__(88),
        'left': __webpack_require__(89),
        'right': __webpack_require__(90)
      },
      'formula': __webpack_require__(91),
      'header': {
        '1': __webpack_require__(92),
        '2': __webpack_require__(93)
      },
      'italic': __webpack_require__(94),
      'image': __webpack_require__(95),
      'indent': {
        '+1': __webpack_require__(96),
        '-1': __webpack_require__(97)
      },
      'link': __webpack_require__(98),
      'list': {
        'ordered': __webpack_require__(99),
        'bullet': __webpack_require__(100),
        'check': __webpack_require__(101)
      },
      'script': {
        'sub': __webpack_require__(102),
        'super': __webpack_require__(103)
      },
      'strike': __webpack_require__(104),
      'underline': __webpack_require__(105),
      'video': __webpack_require__(106)
    };

    /***/ }),
    /* 42 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getLastChangeIndex = exports.default = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var History = function (_Module) {
      _inherits(History, _Module);

      function History(quill, options) {
        _classCallCheck(this, History);

        var _this = _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).call(this, quill, options));

        _this.lastRecorded = 0;
        _this.ignoreChange = false;
        _this.clear();
        _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (eventName, delta, oldDelta, source) {
          if (eventName !== _quill2.default.events.TEXT_CHANGE || _this.ignoreChange) return;
          if (!_this.options.userOnly || source === _quill2.default.sources.USER) {
            _this.record(delta, oldDelta);
          } else {
            _this.transform(delta);
          }
        });
        _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true }, _this.undo.bind(_this));
        _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true, shiftKey: true }, _this.redo.bind(_this));
        if (/Win/i.test(navigator.platform)) {
          _this.quill.keyboard.addBinding({ key: 'Y', shortKey: true }, _this.redo.bind(_this));
        }
        return _this;
      }

      _createClass(History, [{
        key: 'change',
        value: function change(source, dest) {
          if (this.stack[source].length === 0) return;
          var delta = this.stack[source].pop();
          this.stack[dest].push(delta);
          this.lastRecorded = 0;
          this.ignoreChange = true;
          this.quill.updateContents(delta[source], _quill2.default.sources.USER);
          this.ignoreChange = false;
          var index = getLastChangeIndex(delta[source]);
          this.quill.setSelection(index);
        }
      }, {
        key: 'clear',
        value: function clear() {
          this.stack = { undo: [], redo: [] };
        }
      }, {
        key: 'cutoff',
        value: function cutoff() {
          this.lastRecorded = 0;
        }
      }, {
        key: 'record',
        value: function record(changeDelta, oldDelta) {
          if (changeDelta.ops.length === 0) return;
          this.stack.redo = [];
          var undoDelta = this.quill.getContents().diff(oldDelta);
          var timestamp = Date.now();
          if (this.lastRecorded + this.options.delay > timestamp && this.stack.undo.length > 0) {
            var delta = this.stack.undo.pop();
            undoDelta = undoDelta.compose(delta.undo);
            changeDelta = delta.redo.compose(changeDelta);
          } else {
            this.lastRecorded = timestamp;
          }
          this.stack.undo.push({
            redo: changeDelta,
            undo: undoDelta
          });
          if (this.stack.undo.length > this.options.maxStack) {
            this.stack.undo.shift();
          }
        }
      }, {
        key: 'redo',
        value: function redo() {
          this.change('redo', 'undo');
        }
      }, {
        key: 'transform',
        value: function transform(delta) {
          this.stack.undo.forEach(function (change) {
            change.undo = delta.transform(change.undo, true);
            change.redo = delta.transform(change.redo, true);
          });
          this.stack.redo.forEach(function (change) {
            change.undo = delta.transform(change.undo, true);
            change.redo = delta.transform(change.redo, true);
          });
        }
      }, {
        key: 'undo',
        value: function undo() {
          this.change('undo', 'redo');
        }
      }]);

      return History;
    }(_module2.default);

    History.DEFAULTS = {
      delay: 1000,
      maxStack: 100,
      userOnly: false
    };

    function endsWithNewlineChange(delta) {
      var lastOp = delta.ops[delta.ops.length - 1];
      if (lastOp == null) return false;
      if (lastOp.insert != null) {
        return typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n');
      }
      if (lastOp.attributes != null) {
        return Object.keys(lastOp.attributes).some(function (attr) {
          return _parchment2.default.query(attr, _parchment2.default.Scope.BLOCK) != null;
        });
      }
      return false;
    }

    function getLastChangeIndex(delta) {
      var deleteLength = delta.reduce(function (length, op) {
        length += op.delete || 0;
        return length;
      }, 0);
      var changeIndex = delta.length() - deleteLength;
      if (endsWithNewlineChange(delta)) {
        changeIndex -= 1;
      }
      return changeIndex;
    }

    exports.default = History;
    exports.getLastChangeIndex = getLastChangeIndex;

    /***/ }),
    /* 43 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.BaseTooltip = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _keyboard = __webpack_require__(23);

    var _keyboard2 = _interopRequireDefault(_keyboard);

    var _theme = __webpack_require__(34);

    var _theme2 = _interopRequireDefault(_theme);

    var _colorPicker = __webpack_require__(59);

    var _colorPicker2 = _interopRequireDefault(_colorPicker);

    var _iconPicker = __webpack_require__(60);

    var _iconPicker2 = _interopRequireDefault(_iconPicker);

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    var _tooltip = __webpack_require__(61);

    var _tooltip2 = _interopRequireDefault(_tooltip);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ALIGNS = [false, 'center', 'right', 'justify'];

    var COLORS = ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"];

    var FONTS = [false, 'serif', 'monospace'];

    var HEADERS = ['1', '2', '3', false];

    var SIZES = ['small', false, 'large', 'huge'];

    var BaseTheme = function (_Theme) {
      _inherits(BaseTheme, _Theme);

      function BaseTheme(quill, options) {
        _classCallCheck(this, BaseTheme);

        var _this = _possibleConstructorReturn(this, (BaseTheme.__proto__ || Object.getPrototypeOf(BaseTheme)).call(this, quill, options));

        var listener = function listener(e) {
          if (!document.body.contains(quill.root)) {
            return document.body.removeEventListener('click', listener);
          }
          if (_this.tooltip != null && !_this.tooltip.root.contains(e.target) && document.activeElement !== _this.tooltip.textbox && !_this.quill.hasFocus()) {
            _this.tooltip.hide();
          }
          if (_this.pickers != null) {
            _this.pickers.forEach(function (picker) {
              if (!picker.container.contains(e.target)) {
                picker.close();
              }
            });
          }
        };
        quill.emitter.listenDOM('click', document.body, listener);
        return _this;
      }

      _createClass(BaseTheme, [{
        key: 'addModule',
        value: function addModule(name) {
          var module = _get(BaseTheme.prototype.__proto__ || Object.getPrototypeOf(BaseTheme.prototype), 'addModule', this).call(this, name);
          if (name === 'toolbar') {
            this.extendToolbar(module);
          }
          return module;
        }
      }, {
        key: 'buildButtons',
        value: function buildButtons(buttons, icons) {
          buttons.forEach(function (button) {
            var className = button.getAttribute('class') || '';
            className.split(/\s+/).forEach(function (name) {
              if (!name.startsWith('ql-')) return;
              name = name.slice('ql-'.length);
              if (icons[name] == null) return;
              if (name === 'direction') {
                button.innerHTML = icons[name][''] + icons[name]['rtl'];
              } else if (typeof icons[name] === 'string') {
                button.innerHTML = icons[name];
              } else {
                var value = button.value || '';
                if (value != null && icons[name][value]) {
                  button.innerHTML = icons[name][value];
                }
              }
            });
          });
        }
      }, {
        key: 'buildPickers',
        value: function buildPickers(selects, icons) {
          var _this2 = this;

          this.pickers = selects.map(function (select) {
            if (select.classList.contains('ql-align')) {
              if (select.querySelector('option') == null) {
                fillSelect(select, ALIGNS);
              }
              return new _iconPicker2.default(select, icons.align);
            } else if (select.classList.contains('ql-background') || select.classList.contains('ql-color')) {
              var format = select.classList.contains('ql-background') ? 'background' : 'color';
              if (select.querySelector('option') == null) {
                fillSelect(select, COLORS, format === 'background' ? '#ffffff' : '#000000');
              }
              return new _colorPicker2.default(select, icons[format]);
            } else {
              if (select.querySelector('option') == null) {
                if (select.classList.contains('ql-font')) {
                  fillSelect(select, FONTS);
                } else if (select.classList.contains('ql-header')) {
                  fillSelect(select, HEADERS);
                } else if (select.classList.contains('ql-size')) {
                  fillSelect(select, SIZES);
                }
              }
              return new _picker2.default(select);
            }
          });
          var update = function update() {
            _this2.pickers.forEach(function (picker) {
              picker.update();
            });
          };
          this.quill.on(_emitter2.default.events.EDITOR_CHANGE, update);
        }
      }]);

      return BaseTheme;
    }(_theme2.default);

    BaseTheme.DEFAULTS = (0, _extend2.default)(true, {}, _theme2.default.DEFAULTS, {
      modules: {
        toolbar: {
          handlers: {
            formula: function formula() {
              this.quill.theme.tooltip.edit('formula');
            },
            image: function image() {
              var _this3 = this;

              var fileInput = this.container.querySelector('input.ql-image[type=file]');
              if (fileInput == null) {
                fileInput = document.createElement('input');
                fileInput.setAttribute('type', 'file');
                fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
                fileInput.classList.add('ql-image');
                fileInput.addEventListener('change', function () {
                  if (fileInput.files != null && fileInput.files[0] != null) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                      var range = _this3.quill.getSelection(true);
                      _this3.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert({ image: e.target.result }), _emitter2.default.sources.USER);
                      _this3.quill.setSelection(range.index + 1, _emitter2.default.sources.SILENT);
                      fileInput.value = "";
                    };
                    reader.readAsDataURL(fileInput.files[0]);
                  }
                });
                this.container.appendChild(fileInput);
              }
              fileInput.click();
            },
            video: function video() {
              this.quill.theme.tooltip.edit('video');
            }
          }
        }
      }
    });

    var BaseTooltip = function (_Tooltip) {
      _inherits(BaseTooltip, _Tooltip);

      function BaseTooltip(quill, boundsContainer) {
        _classCallCheck(this, BaseTooltip);

        var _this4 = _possibleConstructorReturn(this, (BaseTooltip.__proto__ || Object.getPrototypeOf(BaseTooltip)).call(this, quill, boundsContainer));

        _this4.textbox = _this4.root.querySelector('input[type="text"]');
        _this4.listen();
        return _this4;
      }

      _createClass(BaseTooltip, [{
        key: 'listen',
        value: function listen() {
          var _this5 = this;

          this.textbox.addEventListener('keydown', function (event) {
            if (_keyboard2.default.match(event, 'enter')) {
              _this5.save();
              event.preventDefault();
            } else if (_keyboard2.default.match(event, 'escape')) {
              _this5.cancel();
              event.preventDefault();
            }
          });
        }
      }, {
        key: 'cancel',
        value: function cancel() {
          this.hide();
        }
      }, {
        key: 'edit',
        value: function edit() {
          var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'link';
          var preview = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

          this.root.classList.remove('ql-hidden');
          this.root.classList.add('ql-editing');
          if (preview != null) {
            this.textbox.value = preview;
          } else if (mode !== this.root.getAttribute('data-mode')) {
            this.textbox.value = '';
          }
          this.position(this.quill.getBounds(this.quill.selection.savedRange));
          this.textbox.select();
          this.textbox.setAttribute('placeholder', this.textbox.getAttribute('data-' + mode) || '');
          this.root.setAttribute('data-mode', mode);
        }
      }, {
        key: 'restoreFocus',
        value: function restoreFocus() {
          var scrollTop = this.quill.scrollingContainer.scrollTop;
          this.quill.focus();
          this.quill.scrollingContainer.scrollTop = scrollTop;
        }
      }, {
        key: 'save',
        value: function save() {
          var value = this.textbox.value;
          switch (this.root.getAttribute('data-mode')) {
            case 'link':
              {
                var scrollTop = this.quill.root.scrollTop;
                if (this.linkRange) {
                  this.quill.formatText(this.linkRange, 'link', value, _emitter2.default.sources.USER);
                  delete this.linkRange;
                } else {
                  this.restoreFocus();
                  this.quill.format('link', value, _emitter2.default.sources.USER);
                }
                this.quill.root.scrollTop = scrollTop;
                break;
              }
            case 'video':
              {
                value = extractVideoUrl(value);
              } // eslint-disable-next-line no-fallthrough
            case 'formula':
              {
                if (!value) break;
                var range = this.quill.getSelection(true);
                if (range != null) {
                  var index = range.index + range.length;
                  this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value, _emitter2.default.sources.USER);
                  if (this.root.getAttribute('data-mode') === 'formula') {
                    this.quill.insertText(index + 1, ' ', _emitter2.default.sources.USER);
                  }
                  this.quill.setSelection(index + 2, _emitter2.default.sources.USER);
                }
                break;
              }
          }
          this.textbox.value = '';
          this.hide();
        }
      }]);

      return BaseTooltip;
    }(_tooltip2.default);

    function extractVideoUrl(url) {
      var match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return (match[1] || 'https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
      }
      if (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)) {
        // eslint-disable-line no-cond-assign
        return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/';
      }
      return url;
    }

    function fillSelect(select, values) {
      var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      values.forEach(function (value) {
        var option = document.createElement('option');
        if (value === defaultValue) {
          option.setAttribute('selected', 'selected');
        } else {
          option.setAttribute('value', value);
        }
        select.appendChild(option);
      });
    }

    exports.BaseTooltip = BaseTooltip;
    exports.default = BaseTheme;

    /***/ }),
    /* 44 */
    /***/ (function(module, exports, __webpack_require__) {

    Object.defineProperty(exports, "__esModule", { value: true });
    var LinkedList = /** @class */ (function () {
        function LinkedList() {
            this.head = this.tail = null;
            this.length = 0;
        }
        LinkedList.prototype.append = function () {
            var nodes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                nodes[_i] = arguments[_i];
            }
            this.insertBefore(nodes[0], null);
            if (nodes.length > 1) {
                this.append.apply(this, nodes.slice(1));
            }
        };
        LinkedList.prototype.contains = function (node) {
            var cur, next = this.iterator();
            while ((cur = next())) {
                if (cur === node)
                    return true;
            }
            return false;
        };
        LinkedList.prototype.insertBefore = function (node, refNode) {
            if (!node)
                return;
            node.next = refNode;
            if (refNode != null) {
                node.prev = refNode.prev;
                if (refNode.prev != null) {
                    refNode.prev.next = node;
                }
                refNode.prev = node;
                if (refNode === this.head) {
                    this.head = node;
                }
            }
            else if (this.tail != null) {
                this.tail.next = node;
                node.prev = this.tail;
                this.tail = node;
            }
            else {
                node.prev = null;
                this.head = this.tail = node;
            }
            this.length += 1;
        };
        LinkedList.prototype.offset = function (target) {
            var index = 0, cur = this.head;
            while (cur != null) {
                if (cur === target)
                    return index;
                index += cur.length();
                cur = cur.next;
            }
            return -1;
        };
        LinkedList.prototype.remove = function (node) {
            if (!this.contains(node))
                return;
            if (node.prev != null)
                node.prev.next = node.next;
            if (node.next != null)
                node.next.prev = node.prev;
            if (node === this.head)
                this.head = node.next;
            if (node === this.tail)
                this.tail = node.prev;
            this.length -= 1;
        };
        LinkedList.prototype.iterator = function (curNode) {
            if (curNode === void 0) { curNode = this.head; }
            // TODO use yield when we can
            return function () {
                var ret = curNode;
                if (curNode != null)
                    curNode = curNode.next;
                return ret;
            };
        };
        LinkedList.prototype.find = function (index, inclusive) {
            if (inclusive === void 0) { inclusive = false; }
            var cur, next = this.iterator();
            while ((cur = next())) {
                var length = cur.length();
                if (index < length ||
                    (inclusive && index === length && (cur.next == null || cur.next.length() !== 0))) {
                    return [cur, index];
                }
                index -= length;
            }
            return [null, 0];
        };
        LinkedList.prototype.forEach = function (callback) {
            var cur, next = this.iterator();
            while ((cur = next())) {
                callback(cur);
            }
        };
        LinkedList.prototype.forEachAt = function (index, length, callback) {
            if (length <= 0)
                return;
            var _a = this.find(index), startNode = _a[0], offset = _a[1];
            var cur, curIndex = index - offset, next = this.iterator(startNode);
            while ((cur = next()) && curIndex < index + length) {
                var curLength = cur.length();
                if (index > curIndex) {
                    callback(cur, index - curIndex, Math.min(length, curIndex + curLength - index));
                }
                else {
                    callback(cur, 0, Math.min(curLength, index + length - curIndex));
                }
                curIndex += curLength;
            }
        };
        LinkedList.prototype.map = function (callback) {
            return this.reduce(function (memo, cur) {
                memo.push(callback(cur));
                return memo;
            }, []);
        };
        LinkedList.prototype.reduce = function (callback, memo) {
            var cur, next = this.iterator();
            while ((cur = next())) {
                memo = callback(memo, cur);
            }
            return memo;
        };
        return LinkedList;
    }());
    exports.default = LinkedList;


    /***/ }),
    /* 45 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var container_1 = __webpack_require__(17);
    var Registry = __webpack_require__(1);
    var OBSERVER_CONFIG = {
        attributes: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    };
    var MAX_OPTIMIZE_ITERATIONS = 100;
    var ScrollBlot = /** @class */ (function (_super) {
        __extends(ScrollBlot, _super);
        function ScrollBlot(node) {
            var _this = _super.call(this, node) || this;
            _this.scroll = _this;
            _this.observer = new MutationObserver(function (mutations) {
                _this.update(mutations);
            });
            _this.observer.observe(_this.domNode, OBSERVER_CONFIG);
            _this.attach();
            return _this;
        }
        ScrollBlot.prototype.detach = function () {
            _super.prototype.detach.call(this);
            this.observer.disconnect();
        };
        ScrollBlot.prototype.deleteAt = function (index, length) {
            this.update();
            if (index === 0 && length === this.length()) {
                this.children.forEach(function (child) {
                    child.remove();
                });
            }
            else {
                _super.prototype.deleteAt.call(this, index, length);
            }
        };
        ScrollBlot.prototype.formatAt = function (index, length, name, value) {
            this.update();
            _super.prototype.formatAt.call(this, index, length, name, value);
        };
        ScrollBlot.prototype.insertAt = function (index, value, def) {
            this.update();
            _super.prototype.insertAt.call(this, index, value, def);
        };
        ScrollBlot.prototype.optimize = function (mutations, context) {
            var _this = this;
            if (mutations === void 0) { mutations = []; }
            if (context === void 0) { context = {}; }
            _super.prototype.optimize.call(this, context);
            // We must modify mutations directly, cannot make copy and then modify
            var records = [].slice.call(this.observer.takeRecords());
            // Array.push currently seems to be implemented by a non-tail recursive function
            // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
            while (records.length > 0)
                mutations.push(records.pop());
            // TODO use WeakMap
            var mark = function (blot, markParent) {
                if (markParent === void 0) { markParent = true; }
                if (blot == null || blot === _this)
                    return;
                if (blot.domNode.parentNode == null)
                    return;
                // @ts-ignore
                if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations = [];
                }
                if (markParent)
                    mark(blot.parent);
            };
            var optimize = function (blot) {
                // Post-order traversal
                if (
                // @ts-ignore
                blot.domNode[Registry.DATA_KEY] == null ||
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations == null) {
                    return;
                }
                if (blot instanceof container_1.default) {
                    blot.children.forEach(optimize);
                }
                blot.optimize(context);
            };
            var remaining = mutations;
            for (var i = 0; remaining.length > 0; i += 1) {
                if (i >= MAX_OPTIMIZE_ITERATIONS) {
                    throw new Error('[Parchment] Maximum optimize iterations reached');
                }
                remaining.forEach(function (mutation) {
                    var blot = Registry.find(mutation.target, true);
                    if (blot == null)
                        return;
                    if (blot.domNode === mutation.target) {
                        if (mutation.type === 'childList') {
                            mark(Registry.find(mutation.previousSibling, false));
                            [].forEach.call(mutation.addedNodes, function (node) {
                                var child = Registry.find(node, false);
                                mark(child, false);
                                if (child instanceof container_1.default) {
                                    child.children.forEach(function (grandChild) {
                                        mark(grandChild, false);
                                    });
                                }
                            });
                        }
                        else if (mutation.type === 'attributes') {
                            mark(blot.prev);
                        }
                    }
                    mark(blot);
                });
                this.children.forEach(optimize);
                remaining = [].slice.call(this.observer.takeRecords());
                records = remaining.slice();
                while (records.length > 0)
                    mutations.push(records.pop());
            }
        };
        ScrollBlot.prototype.update = function (mutations, context) {
            var _this = this;
            if (context === void 0) { context = {}; }
            mutations = mutations || this.observer.takeRecords();
            // TODO use WeakMap
            mutations
                .map(function (mutation) {
                var blot = Registry.find(mutation.target, true);
                if (blot == null)
                    return null;
                // @ts-ignore
                if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations = [mutation];
                    return blot;
                }
                else {
                    // @ts-ignore
                    blot.domNode[Registry.DATA_KEY].mutations.push(mutation);
                    return null;
                }
            })
                .forEach(function (blot) {
                if (blot == null ||
                    blot === _this ||
                    //@ts-ignore
                    blot.domNode[Registry.DATA_KEY] == null)
                    return;
                // @ts-ignore
                blot.update(blot.domNode[Registry.DATA_KEY].mutations || [], context);
            });
            // @ts-ignore
            if (this.domNode[Registry.DATA_KEY].mutations != null) {
                // @ts-ignore
                _super.prototype.update.call(this, this.domNode[Registry.DATA_KEY].mutations, context);
            }
            this.optimize(mutations, context);
        };
        ScrollBlot.blotName = 'scroll';
        ScrollBlot.defaultChild = 'block';
        ScrollBlot.scope = Registry.Scope.BLOCK_BLOT;
        ScrollBlot.tagName = 'DIV';
        return ScrollBlot;
    }(container_1.default));
    exports.default = ScrollBlot;


    /***/ }),
    /* 46 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = __webpack_require__(18);
    var Registry = __webpack_require__(1);
    // Shallow object comparison
    function isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length)
            return false;
        // @ts-ignore
        for (var prop in obj1) {
            // @ts-ignore
            if (obj1[prop] !== obj2[prop])
                return false;
        }
        return true;
    }
    var InlineBlot = /** @class */ (function (_super) {
        __extends(InlineBlot, _super);
        function InlineBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InlineBlot.formats = function (domNode) {
            if (domNode.tagName === InlineBlot.tagName)
                return undefined;
            return _super.formats.call(this, domNode);
        };
        InlineBlot.prototype.format = function (name, value) {
            var _this = this;
            if (name === this.statics.blotName && !value) {
                this.children.forEach(function (child) {
                    if (!(child instanceof format_1.default)) {
                        child = child.wrap(InlineBlot.blotName, true);
                    }
                    _this.attributes.copy(child);
                });
                this.unwrap();
            }
            else {
                _super.prototype.format.call(this, name, value);
            }
        };
        InlineBlot.prototype.formatAt = function (index, length, name, value) {
            if (this.formats()[name] != null || Registry.query(name, Registry.Scope.ATTRIBUTE)) {
                var blot = this.isolate(index, length);
                blot.format(name, value);
            }
            else {
                _super.prototype.formatAt.call(this, index, length, name, value);
            }
        };
        InlineBlot.prototype.optimize = function (context) {
            _super.prototype.optimize.call(this, context);
            var formats = this.formats();
            if (Object.keys(formats).length === 0) {
                return this.unwrap(); // unformatted span
            }
            var next = this.next;
            if (next instanceof InlineBlot && next.prev === this && isEqual(formats, next.formats())) {
                next.moveChildren(this);
                next.remove();
            }
        };
        InlineBlot.blotName = 'inline';
        InlineBlot.scope = Registry.Scope.INLINE_BLOT;
        InlineBlot.tagName = 'SPAN';
        return InlineBlot;
    }(format_1.default));
    exports.default = InlineBlot;


    /***/ }),
    /* 47 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = __webpack_require__(18);
    var Registry = __webpack_require__(1);
    var BlockBlot = /** @class */ (function (_super) {
        __extends(BlockBlot, _super);
        function BlockBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BlockBlot.formats = function (domNode) {
            var tagName = Registry.query(BlockBlot.blotName).tagName;
            if (domNode.tagName === tagName)
                return undefined;
            return _super.formats.call(this, domNode);
        };
        BlockBlot.prototype.format = function (name, value) {
            if (Registry.query(name, Registry.Scope.BLOCK) == null) {
                return;
            }
            else if (name === this.statics.blotName && !value) {
                this.replaceWith(BlockBlot.blotName);
            }
            else {
                _super.prototype.format.call(this, name, value);
            }
        };
        BlockBlot.prototype.formatAt = function (index, length, name, value) {
            if (Registry.query(name, Registry.Scope.BLOCK) != null) {
                this.format(name, value);
            }
            else {
                _super.prototype.formatAt.call(this, index, length, name, value);
            }
        };
        BlockBlot.prototype.insertAt = function (index, value, def) {
            if (def == null || Registry.query(value, Registry.Scope.INLINE) != null) {
                // Insert text or inline
                _super.prototype.insertAt.call(this, index, value, def);
            }
            else {
                var after = this.split(index);
                var blot = Registry.create(value, def);
                after.parent.insertBefore(blot, after);
            }
        };
        BlockBlot.prototype.update = function (mutations, context) {
            if (navigator.userAgent.match(/Trident/)) {
                this.build();
            }
            else {
                _super.prototype.update.call(this, mutations, context);
            }
        };
        BlockBlot.blotName = 'block';
        BlockBlot.scope = Registry.Scope.BLOCK_BLOT;
        BlockBlot.tagName = 'P';
        return BlockBlot;
    }(format_1.default));
    exports.default = BlockBlot;


    /***/ }),
    /* 48 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var leaf_1 = __webpack_require__(19);
    var EmbedBlot = /** @class */ (function (_super) {
        __extends(EmbedBlot, _super);
        function EmbedBlot() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmbedBlot.formats = function (domNode) {
            return undefined;
        };
        EmbedBlot.prototype.format = function (name, value) {
            // super.formatAt wraps, which is what we want in general,
            // but this allows subclasses to overwrite for formats
            // that just apply to particular embeds
            _super.prototype.formatAt.call(this, 0, this.length(), name, value);
        };
        EmbedBlot.prototype.formatAt = function (index, length, name, value) {
            if (index === 0 && length === this.length()) {
                this.format(name, value);
            }
            else {
                _super.prototype.formatAt.call(this, index, length, name, value);
            }
        };
        EmbedBlot.prototype.formats = function () {
            return this.statics.formats(this.domNode);
        };
        return EmbedBlot;
    }(leaf_1.default));
    exports.default = EmbedBlot;


    /***/ }),
    /* 49 */
    /***/ (function(module, exports, __webpack_require__) {

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var leaf_1 = __webpack_require__(19);
    var Registry = __webpack_require__(1);
    var TextBlot = /** @class */ (function (_super) {
        __extends(TextBlot, _super);
        function TextBlot(node) {
            var _this = _super.call(this, node) || this;
            _this.text = _this.statics.value(_this.domNode);
            return _this;
        }
        TextBlot.create = function (value) {
            return document.createTextNode(value);
        };
        TextBlot.value = function (domNode) {
            var text = domNode.data;
            // @ts-ignore
            if (text['normalize'])
                text = text['normalize']();
            return text;
        };
        TextBlot.prototype.deleteAt = function (index, length) {
            this.domNode.data = this.text = this.text.slice(0, index) + this.text.slice(index + length);
        };
        TextBlot.prototype.index = function (node, offset) {
            if (this.domNode === node) {
                return offset;
            }
            return -1;
        };
        TextBlot.prototype.insertAt = function (index, value, def) {
            if (def == null) {
                this.text = this.text.slice(0, index) + value + this.text.slice(index);
                this.domNode.data = this.text;
            }
            else {
                _super.prototype.insertAt.call(this, index, value, def);
            }
        };
        TextBlot.prototype.length = function () {
            return this.text.length;
        };
        TextBlot.prototype.optimize = function (context) {
            _super.prototype.optimize.call(this, context);
            this.text = this.statics.value(this.domNode);
            if (this.text.length === 0) {
                this.remove();
            }
            else if (this.next instanceof TextBlot && this.next.prev === this) {
                this.insertAt(this.length(), this.next.value());
                this.next.remove();
            }
        };
        TextBlot.prototype.position = function (index, inclusive) {
            return [this.domNode, index];
        };
        TextBlot.prototype.split = function (index, force) {
            if (force === void 0) { force = false; }
            if (!force) {
                if (index === 0)
                    return this;
                if (index === this.length())
                    return this.next;
            }
            var after = Registry.create(this.domNode.splitText(index));
            this.parent.insertBefore(after, this.next);
            this.text = this.statics.value(this.domNode);
            return after;
        };
        TextBlot.prototype.update = function (mutations, context) {
            var _this = this;
            if (mutations.some(function (mutation) {
                return mutation.type === 'characterData' && mutation.target === _this.domNode;
            })) {
                this.text = this.statics.value(this.domNode);
            }
        };
        TextBlot.prototype.value = function () {
            return this.text;
        };
        TextBlot.blotName = 'text';
        TextBlot.scope = Registry.Scope.INLINE_BLOT;
        return TextBlot;
    }(leaf_1.default));
    exports.default = TextBlot;


    /***/ }),
    /* 50 */
    /***/ (function(module, exports, __webpack_require__) {


    var elem = document.createElement('div');
    elem.classList.toggle('test-class', false);
    if (elem.classList.contains('test-class')) {
      var _toggle = DOMTokenList.prototype.toggle;
      DOMTokenList.prototype.toggle = function (token, force) {
        if (arguments.length > 1 && !this.contains(token) === !force) {
          return force;
        } else {
          return _toggle.call(this, token);
        }
      };
    }

    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
      };
    }

    if (!String.prototype.endsWith) {
      String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    if (!Array.prototype.find) {
      Object.defineProperty(Array.prototype, "find", {
        value: function value(predicate) {
          if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }
          if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
          }
          var list = Object(this);
          var length = list.length >>> 0;
          var thisArg = arguments[1];
          var value;

          for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
              return value;
            }
          }
          return undefined;
        }
      });
    }

    document.addEventListener("DOMContentLoaded", function () {
      // Disable resizing in Firefox
      document.execCommand("enableObjectResizing", false, false);
      // Disable automatic linkifying in IE11
      document.execCommand("autoUrlDetect", false, false);
    });

    /***/ }),
    /* 51 */
    /***/ (function(module, exports) {

    /**
     * This library modifies the diff-patch-match library by Neil Fraser
     * by removing the patch and match functionality and certain advanced
     * options in the diff function. The original license is as follows:
     *
     * ===
     *
     * Diff Match and Patch
     *
     * Copyright 2006 Google Inc.
     * http://code.google.com/p/google-diff-match-patch/
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */


    /**
     * The data structure representing a diff is an array of tuples:
     * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
     * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
     */
    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;


    /**
     * Find the differences between two texts.  Simplifies the problem by stripping
     * any common prefix or suffix off the texts before diffing.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {Int} cursor_pos Expected edit position in text1 (optional)
     * @return {Array} Array of diff tuples.
     */
    function diff_main(text1, text2, cursor_pos) {
      // Check for equality (speedup).
      if (text1 == text2) {
        if (text1) {
          return [[DIFF_EQUAL, text1]];
        }
        return [];
      }

      // Check cursor_pos within bounds
      if (cursor_pos < 0 || text1.length < cursor_pos) {
        cursor_pos = null;
      }

      // Trim off common prefix (speedup).
      var commonlength = diff_commonPrefix(text1, text2);
      var commonprefix = text1.substring(0, commonlength);
      text1 = text1.substring(commonlength);
      text2 = text2.substring(commonlength);

      // Trim off common suffix (speedup).
      commonlength = diff_commonSuffix(text1, text2);
      var commonsuffix = text1.substring(text1.length - commonlength);
      text1 = text1.substring(0, text1.length - commonlength);
      text2 = text2.substring(0, text2.length - commonlength);

      // Compute the diff on the middle block.
      var diffs = diff_compute_(text1, text2);

      // Restore the prefix and suffix.
      if (commonprefix) {
        diffs.unshift([DIFF_EQUAL, commonprefix]);
      }
      if (commonsuffix) {
        diffs.push([DIFF_EQUAL, commonsuffix]);
      }
      diff_cleanupMerge(diffs);
      if (cursor_pos != null) {
        diffs = fix_cursor(diffs, cursor_pos);
      }
      diffs = fix_emoji(diffs);
      return diffs;
    }

    /**
     * Find the differences between two texts.  Assumes that the texts do not
     * have any common prefix or suffix.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @return {Array} Array of diff tuples.
     */
    function diff_compute_(text1, text2) {
      var diffs;

      if (!text1) {
        // Just add some text (speedup).
        return [[DIFF_INSERT, text2]];
      }

      if (!text2) {
        // Just delete some text (speedup).
        return [[DIFF_DELETE, text1]];
      }

      var longtext = text1.length > text2.length ? text1 : text2;
      var shorttext = text1.length > text2.length ? text2 : text1;
      var i = longtext.indexOf(shorttext);
      if (i != -1) {
        // Shorter text is inside the longer text (speedup).
        diffs = [[DIFF_INSERT, longtext.substring(0, i)],
                 [DIFF_EQUAL, shorttext],
                 [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
        // Swap insertions for deletions if diff is reversed.
        if (text1.length > text2.length) {
          diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }
        return diffs;
      }

      if (shorttext.length == 1) {
        // Single character string.
        // After the previous speedup, the character can't be an equality.
        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
      }

      // Check to see if the problem can be split in two.
      var hm = diff_halfMatch_(text1, text2);
      if (hm) {
        // A half-match was found, sort out the return data.
        var text1_a = hm[0];
        var text1_b = hm[1];
        var text2_a = hm[2];
        var text2_b = hm[3];
        var mid_common = hm[4];
        // Send both pairs off for separate processing.
        var diffs_a = diff_main(text1_a, text2_a);
        var diffs_b = diff_main(text1_b, text2_b);
        // Merge the results.
        return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
      }

      return diff_bisect_(text1, text2);
    }

    /**
     * Find the 'middle snake' of a diff, split the problem in two
     * and return the recursively constructed diff.
     * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @return {Array} Array of diff tuples.
     * @private
     */
    function diff_bisect_(text1, text2) {
      // Cache the text lengths to prevent multiple calls.
      var text1_length = text1.length;
      var text2_length = text2.length;
      var max_d = Math.ceil((text1_length + text2_length) / 2);
      var v_offset = max_d;
      var v_length = 2 * max_d;
      var v1 = new Array(v_length);
      var v2 = new Array(v_length);
      // Setting all elements to -1 is faster in Chrome & Firefox than mixing
      // integers and undefined.
      for (var x = 0; x < v_length; x++) {
        v1[x] = -1;
        v2[x] = -1;
      }
      v1[v_offset + 1] = 0;
      v2[v_offset + 1] = 0;
      var delta = text1_length - text2_length;
      // If the total number of characters is odd, then the front path will collide
      // with the reverse path.
      var front = (delta % 2 != 0);
      // Offsets for start and end of k loop.
      // Prevents mapping of space beyond the grid.
      var k1start = 0;
      var k1end = 0;
      var k2start = 0;
      var k2end = 0;
      for (var d = 0; d < max_d; d++) {
        // Walk the front path one step.
        for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
          var k1_offset = v_offset + k1;
          var x1;
          if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
            x1 = v1[k1_offset + 1];
          } else {
            x1 = v1[k1_offset - 1] + 1;
          }
          var y1 = x1 - k1;
          while (x1 < text1_length && y1 < text2_length &&
                 text1.charAt(x1) == text2.charAt(y1)) {
            x1++;
            y1++;
          }
          v1[k1_offset] = x1;
          if (x1 > text1_length) {
            // Ran off the right of the graph.
            k1end += 2;
          } else if (y1 > text2_length) {
            // Ran off the bottom of the graph.
            k1start += 2;
          } else if (front) {
            var k2_offset = v_offset + delta - k1;
            if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
              // Mirror x2 onto top-left coordinate system.
              var x2 = text1_length - v2[k2_offset];
              if (x1 >= x2) {
                // Overlap detected.
                return diff_bisectSplit_(text1, text2, x1, y1);
              }
            }
          }
        }

        // Walk the reverse path one step.
        for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
          var k2_offset = v_offset + k2;
          var x2;
          if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
            x2 = v2[k2_offset + 1];
          } else {
            x2 = v2[k2_offset - 1] + 1;
          }
          var y2 = x2 - k2;
          while (x2 < text1_length && y2 < text2_length &&
                 text1.charAt(text1_length - x2 - 1) ==
                 text2.charAt(text2_length - y2 - 1)) {
            x2++;
            y2++;
          }
          v2[k2_offset] = x2;
          if (x2 > text1_length) {
            // Ran off the left of the graph.
            k2end += 2;
          } else if (y2 > text2_length) {
            // Ran off the top of the graph.
            k2start += 2;
          } else if (!front) {
            var k1_offset = v_offset + delta - k2;
            if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
              var x1 = v1[k1_offset];
              var y1 = v_offset + x1 - k1_offset;
              // Mirror x2 onto top-left coordinate system.
              x2 = text1_length - x2;
              if (x1 >= x2) {
                // Overlap detected.
                return diff_bisectSplit_(text1, text2, x1, y1);
              }
            }
          }
        }
      }
      // Diff took too long and hit the deadline or
      // number of diffs equals number of characters, no commonality at all.
      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
    }

    /**
     * Given the location of the 'middle snake', split the diff in two parts
     * and recurse.
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} x Index of split point in text1.
     * @param {number} y Index of split point in text2.
     * @return {Array} Array of diff tuples.
     */
    function diff_bisectSplit_(text1, text2, x, y) {
      var text1a = text1.substring(0, x);
      var text2a = text2.substring(0, y);
      var text1b = text1.substring(x);
      var text2b = text2.substring(y);

      // Compute both diffs serially.
      var diffs = diff_main(text1a, text2a);
      var diffsb = diff_main(text1b, text2b);

      return diffs.concat(diffsb);
    }

    /**
     * Determine the common prefix of two strings.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the start of each
     *     string.
     */
    function diff_commonPrefix(text1, text2) {
      // Quick check for common null cases.
      if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
        return 0;
      }
      // Binary search.
      // Performance analysis: http://neil.fraser.name/news/2007/10/09/
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text2.length);
      var pointermid = pointermax;
      var pointerstart = 0;
      while (pointermin < pointermid) {
        if (text1.substring(pointerstart, pointermid) ==
            text2.substring(pointerstart, pointermid)) {
          pointermin = pointermid;
          pointerstart = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      return pointermid;
    }

    /**
     * Determine the common suffix of two strings.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {number} The number of characters common to the end of each string.
     */
    function diff_commonSuffix(text1, text2) {
      // Quick check for common null cases.
      if (!text1 || !text2 ||
          text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
        return 0;
      }
      // Binary search.
      // Performance analysis: http://neil.fraser.name/news/2007/10/09/
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text2.length);
      var pointermid = pointermax;
      var pointerend = 0;
      while (pointermin < pointermid) {
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
            text2.substring(text2.length - pointermid, text2.length - pointerend)) {
          pointermin = pointermid;
          pointerend = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      return pointermid;
    }

    /**
     * Do the two texts share a substring which is at least half the length of the
     * longer text?
     * This speedup can produce non-minimal diffs.
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @return {Array.<string>} Five element Array, containing the prefix of
     *     text1, the suffix of text1, the prefix of text2, the suffix of
     *     text2 and the common middle.  Or null if there was no match.
     */
    function diff_halfMatch_(text1, text2) {
      var longtext = text1.length > text2.length ? text1 : text2;
      var shorttext = text1.length > text2.length ? text2 : text1;
      if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null;  // Pointless.
      }

      /**
       * Does a substring of shorttext exist within longtext such that the substring
       * is at least half the length of longtext?
       * Closure, but does not reference any external variables.
       * @param {string} longtext Longer string.
       * @param {string} shorttext Shorter string.
       * @param {number} i Start index of quarter length substring within longtext.
       * @return {Array.<string>} Five element Array, containing the prefix of
       *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
       *     of shorttext and the common middle.  Or null if there was no match.
       * @private
       */
      function diff_halfMatchI_(longtext, shorttext, i) {
        // Start with a 1/4 length substring at position i as a seed.
        var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
        var j = -1;
        var best_common = '';
        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
        while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
          var prefixLength = diff_commonPrefix(longtext.substring(i),
                                               shorttext.substring(j));
          var suffixLength = diff_commonSuffix(longtext.substring(0, i),
                                               shorttext.substring(0, j));
          if (best_common.length < suffixLength + prefixLength) {
            best_common = shorttext.substring(j - suffixLength, j) +
                shorttext.substring(j, j + prefixLength);
            best_longtext_a = longtext.substring(0, i - suffixLength);
            best_longtext_b = longtext.substring(i + prefixLength);
            best_shorttext_a = shorttext.substring(0, j - suffixLength);
            best_shorttext_b = shorttext.substring(j + prefixLength);
          }
        }
        if (best_common.length * 2 >= longtext.length) {
          return [best_longtext_a, best_longtext_b,
                  best_shorttext_a, best_shorttext_b, best_common];
        } else {
          return null;
        }
      }

      // First check if the second quarter is the seed for a half-match.
      var hm1 = diff_halfMatchI_(longtext, shorttext,
                                 Math.ceil(longtext.length / 4));
      // Check again based on the third quarter.
      var hm2 = diff_halfMatchI_(longtext, shorttext,
                                 Math.ceil(longtext.length / 2));
      var hm;
      if (!hm1 && !hm2) {
        return null;
      } else if (!hm2) {
        hm = hm1;
      } else if (!hm1) {
        hm = hm2;
      } else {
        // Both matched.  Select the longest.
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
      }

      // A half-match was found, sort out the return data.
      var text1_a, text1_b, text2_a, text2_b;
      if (text1.length > text2.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
      } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
      }
      var mid_common = hm[4];
      return [text1_a, text1_b, text2_a, text2_b, mid_common];
    }

    /**
     * Reorder and merge like edit sections.  Merge equalities.
     * Any edit section can move as long as it doesn't cross an equality.
     * @param {Array} diffs Array of diff tuples.
     */
    function diff_cleanupMerge(diffs) {
      diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
      var pointer = 0;
      var count_delete = 0;
      var count_insert = 0;
      var text_delete = '';
      var text_insert = '';
      var commonlength;
      while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            count_insert++;
            text_insert += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_DELETE:
            count_delete++;
            text_delete += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_EQUAL:
            // Upon reaching an equality, check for prior redundancies.
            if (count_delete + count_insert > 1) {
              if (count_delete !== 0 && count_insert !== 0) {
                // Factor out any common prefixies.
                commonlength = diff_commonPrefix(text_insert, text_delete);
                if (commonlength !== 0) {
                  if ((pointer - count_delete - count_insert) > 0 &&
                      diffs[pointer - count_delete - count_insert - 1][0] ==
                      DIFF_EQUAL) {
                    diffs[pointer - count_delete - count_insert - 1][1] +=
                        text_insert.substring(0, commonlength);
                  } else {
                    diffs.splice(0, 0, [DIFF_EQUAL,
                                        text_insert.substring(0, commonlength)]);
                    pointer++;
                  }
                  text_insert = text_insert.substring(commonlength);
                  text_delete = text_delete.substring(commonlength);
                }
                // Factor out any common suffixies.
                commonlength = diff_commonSuffix(text_insert, text_delete);
                if (commonlength !== 0) {
                  diffs[pointer][1] = text_insert.substring(text_insert.length -
                      commonlength) + diffs[pointer][1];
                  text_insert = text_insert.substring(0, text_insert.length -
                      commonlength);
                  text_delete = text_delete.substring(0, text_delete.length -
                      commonlength);
                }
              }
              // Delete the offending records and add the merged ones.
              if (count_delete === 0) {
                diffs.splice(pointer - count_insert,
                    count_delete + count_insert, [DIFF_INSERT, text_insert]);
              } else if (count_insert === 0) {
                diffs.splice(pointer - count_delete,
                    count_delete + count_insert, [DIFF_DELETE, text_delete]);
              } else {
                diffs.splice(pointer - count_delete - count_insert,
                    count_delete + count_insert, [DIFF_DELETE, text_delete],
                    [DIFF_INSERT, text_insert]);
              }
              pointer = pointer - count_delete - count_insert +
                        (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
            } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
              // Merge this equality with the previous one.
              diffs[pointer - 1][1] += diffs[pointer][1];
              diffs.splice(pointer, 1);
            } else {
              pointer++;
            }
            count_insert = 0;
            count_delete = 0;
            text_delete = '';
            text_insert = '';
            break;
        }
      }
      if (diffs[diffs.length - 1][1] === '') {
        diffs.pop();  // Remove the dummy entry at the end.
      }

      // Second pass: look for single edits surrounded on both sides by equalities
      // which can be shifted sideways to eliminate an equality.
      // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
      var changes = false;
      pointer = 1;
      // Intentionally ignore the first and last element (don't need checking).
      while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] == DIFF_EQUAL &&
            diffs[pointer + 1][0] == DIFF_EQUAL) {
          // This is a single edit surrounded by equalities.
          if (diffs[pointer][1].substring(diffs[pointer][1].length -
              diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
            // Shift the edit over the previous equality.
            diffs[pointer][1] = diffs[pointer - 1][1] +
                diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                            diffs[pointer - 1][1].length);
            diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
            diffs.splice(pointer - 1, 1);
            changes = true;
          } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
              diffs[pointer + 1][1]) {
            // Shift the edit over the next equality.
            diffs[pointer - 1][1] += diffs[pointer + 1][1];
            diffs[pointer][1] =
                diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
                diffs[pointer + 1][1];
            diffs.splice(pointer + 1, 1);
            changes = true;
          }
        }
        pointer++;
      }
      // If shifts were made, the diff needs reordering and another shift sweep.
      if (changes) {
        diff_cleanupMerge(diffs);
      }
    }

    var diff = diff_main;
    diff.INSERT = DIFF_INSERT;
    diff.DELETE = DIFF_DELETE;
    diff.EQUAL = DIFF_EQUAL;

    module.exports = diff;

    /*
     * Modify a diff such that the cursor position points to the start of a change:
     * E.g.
     *   cursor_normalize_diff([[DIFF_EQUAL, 'abc']], 1)
     *     => [1, [[DIFF_EQUAL, 'a'], [DIFF_EQUAL, 'bc']]]
     *   cursor_normalize_diff([[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xyz']], 2)
     *     => [2, [[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xy'], [DIFF_DELETE, 'z']]]
     *
     * @param {Array} diffs Array of diff tuples
     * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
     * @return {Array} A tuple [cursor location in the modified diff, modified diff]
     */
    function cursor_normalize_diff (diffs, cursor_pos) {
      if (cursor_pos === 0) {
        return [DIFF_EQUAL, diffs];
      }
      for (var current_pos = 0, i = 0; i < diffs.length; i++) {
        var d = diffs[i];
        if (d[0] === DIFF_DELETE || d[0] === DIFF_EQUAL) {
          var next_pos = current_pos + d[1].length;
          if (cursor_pos === next_pos) {
            return [i + 1, diffs];
          } else if (cursor_pos < next_pos) {
            // copy to prevent side effects
            diffs = diffs.slice();
            // split d into two diff changes
            var split_pos = cursor_pos - current_pos;
            var d_left = [d[0], d[1].slice(0, split_pos)];
            var d_right = [d[0], d[1].slice(split_pos)];
            diffs.splice(i, 1, d_left, d_right);
            return [i + 1, diffs];
          } else {
            current_pos = next_pos;
          }
        }
      }
      throw new Error('cursor_pos is out of bounds!')
    }

    /*
     * Modify a diff such that the edit position is "shifted" to the proposed edit location (cursor_position).
     *
     * Case 1)
     *   Check if a naive shift is possible:
     *     [0, X], [ 1, Y] -> [ 1, Y], [0, X]    (if X + Y === Y + X)
     *     [0, X], [-1, Y] -> [-1, Y], [0, X]    (if X + Y === Y + X) - holds same result
     * Case 2)
     *   Check if the following shifts are possible:
     *     [0, 'pre'], [ 1, 'prefix'] -> [ 1, 'pre'], [0, 'pre'], [ 1, 'fix']
     *     [0, 'pre'], [-1, 'prefix'] -> [-1, 'pre'], [0, 'pre'], [-1, 'fix']
     *         ^            ^
     *         d          d_next
     *
     * @param {Array} diffs Array of diff tuples
     * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
     * @return {Array} Array of diff tuples
     */
    function fix_cursor (diffs, cursor_pos) {
      var norm = cursor_normalize_diff(diffs, cursor_pos);
      var ndiffs = norm[1];
      var cursor_pointer = norm[0];
      var d = ndiffs[cursor_pointer];
      var d_next = ndiffs[cursor_pointer + 1];

      if (d == null) {
        // Text was deleted from end of original string,
        // cursor is now out of bounds in new string
        return diffs;
      } else if (d[0] !== DIFF_EQUAL) {
        // A modification happened at the cursor location.
        // This is the expected outcome, so we can return the original diff.
        return diffs;
      } else {
        if (d_next != null && d[1] + d_next[1] === d_next[1] + d[1]) {
          // Case 1)
          // It is possible to perform a naive shift
          ndiffs.splice(cursor_pointer, 2, d_next, d);
          return merge_tuples(ndiffs, cursor_pointer, 2)
        } else if (d_next != null && d_next[1].indexOf(d[1]) === 0) {
          // Case 2)
          // d[1] is a prefix of d_next[1]
          // We can assume that d_next[0] !== 0, since d[0] === 0
          // Shift edit locations..
          ndiffs.splice(cursor_pointer, 2, [d_next[0], d[1]], [0, d[1]]);
          var suffix = d_next[1].slice(d[1].length);
          if (suffix.length > 0) {
            ndiffs.splice(cursor_pointer + 2, 0, [d_next[0], suffix]);
          }
          return merge_tuples(ndiffs, cursor_pointer, 3)
        } else {
          // Not possible to perform any modification
          return diffs;
        }
      }
    }

    /*
     * Check diff did not split surrogate pairs.
     * Ex. [0, '\uD83D'], [-1, '\uDC36'], [1, '\uDC2F'] -> [-1, '\uD83D\uDC36'], [1, '\uD83D\uDC2F']
     *     '\uD83D\uDC36' === '🐶', '\uD83D\uDC2F' === '🐯'
     *
     * @param {Array} diffs Array of diff tuples
     * @return {Array} Array of diff tuples
     */
    function fix_emoji (diffs) {
      var compact = false;
      var starts_with_pair_end = function(str) {
        return str.charCodeAt(0) >= 0xDC00 && str.charCodeAt(0) <= 0xDFFF;
      };
      var ends_with_pair_start = function(str) {
        return str.charCodeAt(str.length-1) >= 0xD800 && str.charCodeAt(str.length-1) <= 0xDBFF;
      };
      for (var i = 2; i < diffs.length; i += 1) {
        if (diffs[i-2][0] === DIFF_EQUAL && ends_with_pair_start(diffs[i-2][1]) &&
            diffs[i-1][0] === DIFF_DELETE && starts_with_pair_end(diffs[i-1][1]) &&
            diffs[i][0] === DIFF_INSERT && starts_with_pair_end(diffs[i][1])) {
          compact = true;

          diffs[i-1][1] = diffs[i-2][1].slice(-1) + diffs[i-1][1];
          diffs[i][1] = diffs[i-2][1].slice(-1) + diffs[i][1];

          diffs[i-2][1] = diffs[i-2][1].slice(0, -1);
        }
      }
      if (!compact) {
        return diffs;
      }
      var fixed_diffs = [];
      for (var i = 0; i < diffs.length; i += 1) {
        if (diffs[i][1].length > 0) {
          fixed_diffs.push(diffs[i]);
        }
      }
      return fixed_diffs;
    }

    /*
     * Try to merge tuples with their neigbors in a given range.
     * E.g. [0, 'a'], [0, 'b'] -> [0, 'ab']
     *
     * @param {Array} diffs Array of diff tuples.
     * @param {Int} start Position of the first element to merge (diffs[start] is also merged with diffs[start - 1]).
     * @param {Int} length Number of consecutive elements to check.
     * @return {Array} Array of merged diff tuples.
     */
    function merge_tuples (diffs, start, length) {
      // Check from (start-1) to (start+length).
      for (var i = start + length - 1; i >= 0 && i >= start - 1; i--) {
        if (i + 1 < diffs.length) {
          var left_d = diffs[i];
          var right_d = diffs[i+1];
          if (left_d[0] === right_d[1]) {
            diffs.splice(i, 2, [left_d[0], left_d[1] + right_d[1]]);
          }
        }
      }
      return diffs;
    }


    /***/ }),
    /* 52 */
    /***/ (function(module, exports) {

    exports = module.exports = typeof Object.keys === 'function'
      ? Object.keys : shim;

    exports.shim = shim;
    function shim (obj) {
      var keys = [];
      for (var key in obj) keys.push(key);
      return keys;
    }


    /***/ }),
    /* 53 */
    /***/ (function(module, exports) {

    var supportsArgumentsClass = (function(){
      return Object.prototype.toString.call(arguments)
    })() == '[object Arguments]';

    exports = module.exports = supportsArgumentsClass ? supported : unsupported;

    exports.supported = supported;
    function supported(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }
    exports.unsupported = unsupported;
    function unsupported(object){
      return object &&
        typeof object == 'object' &&
        typeof object.length == 'number' &&
        Object.prototype.hasOwnProperty.call(object, 'callee') &&
        !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
        false;
    }

    /***/ }),
    /* 54 */
    /***/ (function(module, exports) {

    var has = Object.prototype.hasOwnProperty
      , prefix = '~';

    /**
     * Constructor to create a storage for our `EE` objects.
     * An `Events` instance is a plain object whose properties are event names.
     *
     * @constructor
     * @api private
     */
    function Events() {}

    //
    // We try to not inherit from `Object.prototype`. In some engines creating an
    // instance in this way is faster than calling `Object.create(null)` directly.
    // If `Object.create(null)` is not supported we prefix the event names with a
    // character to make sure that the built-in object properties are not
    // overridden or used as an attack vector.
    //
    if (Object.create) {
      Events.prototype = Object.create(null);

      //
      // This hack is needed because the `__proto__` property is still inherited in
      // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
      //
      if (!new Events().__proto__) prefix = false;
    }

    /**
     * Representation of a single event listener.
     *
     * @param {Function} fn The listener function.
     * @param {Mixed} context The context to invoke the listener with.
     * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
     * @constructor
     * @api private
     */
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }

    /**
     * Minimal `EventEmitter` interface that is molded against the Node.js
     * `EventEmitter` interface.
     *
     * @constructor
     * @api public
     */
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @api public
     */
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = []
        , events
        , name;

      if (this._eventsCount === 0) return names;

      for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }

      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }

      return names;
    };

    /**
     * Return the listeners registered for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Boolean} exists Only check if there are listeners.
     * @returns {Array|Boolean}
     * @api public
     */
    EventEmitter.prototype.listeners = function listeners(event, exists) {
      var evt = prefix ? prefix + event : event
        , available = this._events[evt];

      if (exists) return !!available;
      if (!available) return [];
      if (available.fn) return [available.fn];

      for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
        ee[i] = available[i].fn;
      }

      return ee;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @api public
     */
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return false;

      var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
          case 1: return listeners.fn.call(listeners.context), true;
          case 2: return listeners.fn.call(listeners.context, a1), true;
          case 3: return listeners.fn.call(listeners.context, a1, a2), true;
          case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length
          , j;

        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

          switch (len) {
            case 1: listeners[i].fn.call(listeners[i].context); break;
            case 2: listeners[i].fn.call(listeners[i].context, a1); break;
            case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
            case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
            default:
              if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                args[j - 1] = arguments[j];
              }

              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }

      return true;
    };

    /**
     * Add a listener for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Function} fn The listener function.
     * @param {Mixed} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.on = function on(event, fn, context) {
      var listener = new EE(fn, context || this)
        , evt = prefix ? prefix + event : event;

      if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
      else if (!this._events[evt].fn) this._events[evt].push(listener);
      else this._events[evt] = [this._events[evt], listener];

      return this;
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Function} fn The listener function.
     * @param {Mixed} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.once = function once(event, fn, context) {
      var listener = new EE(fn, context || this, true)
        , evt = prefix ? prefix + event : event;

      if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
      else if (!this._events[evt].fn) this._events[evt].push(listener);
      else this._events[evt] = [this._events[evt], listener];

      return this;
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {String|Symbol} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {Mixed} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return this;
      if (!fn) {
        if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
        return this;
      }

      var listeners = this._events[evt];

      if (listeners.fn) {
        if (
             listeners.fn === fn
          && (!once || listeners.once)
          && (!context || listeners.context === context)
        ) {
          if (--this._eventsCount === 0) this._events = new Events();
          else delete this._events[evt];
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (
               listeners[i].fn !== fn
            || (once && !listeners[i].once)
            || (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else if (--this._eventsCount === 0) this._events = new Events();
        else delete this._events[evt];
      }

      return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {String|Symbol} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @api public
     */
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;

      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) {
          if (--this._eventsCount === 0) this._events = new Events();
          else delete this._events[evt];
        }
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }

      return this;
    };

    //
    // Alias methods names because people roll like that.
    //
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    //
    // This function doesn't apply anymore.
    //
    EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
      return this;
    };

    //
    // Expose the prefix.
    //
    EventEmitter.prefixed = prefix;

    //
    // Allow `EventEmitter` to be imported as module namespace.
    //
    EventEmitter.EventEmitter = EventEmitter;

    //
    // Expose the module.
    //
    if ('undefined' !== typeof module) {
      module.exports = EventEmitter;
    }


    /***/ }),
    /* 55 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.matchText = exports.matchSpacing = exports.matchNewline = exports.matchBlot = exports.matchAttributor = exports.default = undefined;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _extend2 = __webpack_require__(3);

    var _extend3 = _interopRequireDefault(_extend2);

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    var _align = __webpack_require__(36);

    var _background = __webpack_require__(37);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _color = __webpack_require__(26);

    var _direction = __webpack_require__(38);

    var _font = __webpack_require__(39);

    var _size = __webpack_require__(40);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:clipboard');

    var DOM_KEY = '__ql-matcher';

    var CLIPBOARD_CONFIG = [[Node.TEXT_NODE, matchText], [Node.TEXT_NODE, matchNewline], ['br', matchBreak], [Node.ELEMENT_NODE, matchNewline], [Node.ELEMENT_NODE, matchBlot], [Node.ELEMENT_NODE, matchSpacing], [Node.ELEMENT_NODE, matchAttributor], [Node.ELEMENT_NODE, matchStyles], ['li', matchIndent], ['b', matchAlias.bind(matchAlias, 'bold')], ['i', matchAlias.bind(matchAlias, 'italic')], ['style', matchIgnore]];

    var ATTRIBUTE_ATTRIBUTORS = [_align.AlignAttribute, _direction.DirectionAttribute].reduce(function (memo, attr) {
      memo[attr.keyName] = attr;
      return memo;
    }, {});

    var STYLE_ATTRIBUTORS = [_align.AlignStyle, _background.BackgroundStyle, _color.ColorStyle, _direction.DirectionStyle, _font.FontStyle, _size.SizeStyle].reduce(function (memo, attr) {
      memo[attr.keyName] = attr;
      return memo;
    }, {});

    var Clipboard = function (_Module) {
      _inherits(Clipboard, _Module);

      function Clipboard(quill, options) {
        _classCallCheck(this, Clipboard);

        var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this, quill, options));

        _this.quill.root.addEventListener('paste', _this.onPaste.bind(_this));
        _this.container = _this.quill.addContainer('ql-clipboard');
        _this.container.setAttribute('contenteditable', true);
        _this.container.setAttribute('tabindex', -1);
        _this.matchers = [];
        CLIPBOARD_CONFIG.concat(_this.options.matchers).forEach(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              selector = _ref2[0],
              matcher = _ref2[1];

          if (!options.matchVisual && matcher === matchSpacing) return;
          _this.addMatcher(selector, matcher);
        });
        return _this;
      }

      _createClass(Clipboard, [{
        key: 'addMatcher',
        value: function addMatcher(selector, matcher) {
          this.matchers.push([selector, matcher]);
        }
      }, {
        key: 'convert',
        value: function convert(html) {
          if (typeof html === 'string') {
            this.container.innerHTML = html.replace(/\>\r?\n +\</g, '><'); // Remove spaces between tags
            return this.convert();
          }
          var formats = this.quill.getFormat(this.quill.selection.savedRange.index);
          if (formats[_code2.default.blotName]) {
            var text = this.container.innerText;
            this.container.innerHTML = '';
            return new _quillDelta2.default().insert(text, _defineProperty({}, _code2.default.blotName, formats[_code2.default.blotName]));
          }

          var _prepareMatching = this.prepareMatching(),
              _prepareMatching2 = _slicedToArray(_prepareMatching, 2),
              elementMatchers = _prepareMatching2[0],
              textMatchers = _prepareMatching2[1];

          var delta = traverse(this.container, elementMatchers, textMatchers);
          // Remove trailing newline
          if (deltaEndsWith(delta, '\n') && delta.ops[delta.ops.length - 1].attributes == null) {
            delta = delta.compose(new _quillDelta2.default().retain(delta.length() - 1).delete(1));
          }
          debug.log('convert', this.container.innerHTML, delta);
          this.container.innerHTML = '';
          return delta;
        }
      }, {
        key: 'dangerouslyPasteHTML',
        value: function dangerouslyPasteHTML(index, html) {
          var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _quill2.default.sources.API;

          if (typeof index === 'string') {
            this.quill.setContents(this.convert(index), html);
            this.quill.setSelection(0, _quill2.default.sources.SILENT);
          } else {
            var paste = this.convert(html);
            this.quill.updateContents(new _quillDelta2.default().retain(index).concat(paste), source);
            this.quill.setSelection(index + paste.length(), _quill2.default.sources.SILENT);
          }
        }
      }, {
        key: 'onPaste',
        value: function onPaste(e) {
          var _this2 = this;

          if (e.defaultPrevented || !this.quill.isEnabled()) return;
          var range = this.quill.getSelection();
          var delta = new _quillDelta2.default().retain(range.index);
          var scrollTop = this.quill.scrollingContainer.scrollTop;
          this.container.focus();
          this.quill.selection.update(_quill2.default.sources.SILENT);
          setTimeout(function () {
            delta = delta.concat(_this2.convert()).delete(range.length);
            _this2.quill.updateContents(delta, _quill2.default.sources.USER);
            // range.length contributes to delta.length()
            _this2.quill.setSelection(delta.length() - range.length, _quill2.default.sources.SILENT);
            _this2.quill.scrollingContainer.scrollTop = scrollTop;
            _this2.quill.focus();
          }, 1);
        }
      }, {
        key: 'prepareMatching',
        value: function prepareMatching() {
          var _this3 = this;

          var elementMatchers = [],
              textMatchers = [];
          this.matchers.forEach(function (pair) {
            var _pair = _slicedToArray(pair, 2),
                selector = _pair[0],
                matcher = _pair[1];

            switch (selector) {
              case Node.TEXT_NODE:
                textMatchers.push(matcher);
                break;
              case Node.ELEMENT_NODE:
                elementMatchers.push(matcher);
                break;
              default:
                [].forEach.call(_this3.container.querySelectorAll(selector), function (node) {
                  // TODO use weakmap
                  node[DOM_KEY] = node[DOM_KEY] || [];
                  node[DOM_KEY].push(matcher);
                });
                break;
            }
          });
          return [elementMatchers, textMatchers];
        }
      }]);

      return Clipboard;
    }(_module2.default);

    Clipboard.DEFAULTS = {
      matchers: [],
      matchVisual: true
    };

    function applyFormat(delta, format, value) {
      if ((typeof format === 'undefined' ? 'undefined' : _typeof(format)) === 'object') {
        return Object.keys(format).reduce(function (delta, key) {
          return applyFormat(delta, key, format[key]);
        }, delta);
      } else {
        return delta.reduce(function (delta, op) {
          if (op.attributes && op.attributes[format]) {
            return delta.push(op);
          } else {
            return delta.insert(op.insert, (0, _extend3.default)({}, _defineProperty({}, format, value), op.attributes));
          }
        }, new _quillDelta2.default());
      }
    }

    function computeStyle(node) {
      if (node.nodeType !== Node.ELEMENT_NODE) return {};
      var DOM_KEY = '__ql-computed-style';
      return node[DOM_KEY] || (node[DOM_KEY] = window.getComputedStyle(node));
    }

    function deltaEndsWith(delta, text) {
      var endText = "";
      for (var i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
        var op = delta.ops[i];
        if (typeof op.insert !== 'string') break;
        endText = op.insert + endText;
      }
      return endText.slice(-1 * text.length) === text;
    }

    function isLine(node) {
      if (node.childNodes.length === 0) return false; // Exclude embed blocks
      var style = computeStyle(node);
      return ['block', 'list-item'].indexOf(style.display) > -1;
    }

    function traverse(node, elementMatchers, textMatchers) {
      // Post-order
      if (node.nodeType === node.TEXT_NODE) {
        return textMatchers.reduce(function (delta, matcher) {
          return matcher(node, delta);
        }, new _quillDelta2.default());
      } else if (node.nodeType === node.ELEMENT_NODE) {
        return [].reduce.call(node.childNodes || [], function (delta, childNode) {
          var childrenDelta = traverse(childNode, elementMatchers, textMatchers);
          if (childNode.nodeType === node.ELEMENT_NODE) {
            childrenDelta = elementMatchers.reduce(function (childrenDelta, matcher) {
              return matcher(childNode, childrenDelta);
            }, childrenDelta);
            childrenDelta = (childNode[DOM_KEY] || []).reduce(function (childrenDelta, matcher) {
              return matcher(childNode, childrenDelta);
            }, childrenDelta);
          }
          return delta.concat(childrenDelta);
        }, new _quillDelta2.default());
      } else {
        return new _quillDelta2.default();
      }
    }

    function matchAlias(format, node, delta) {
      return applyFormat(delta, format, true);
    }

    function matchAttributor(node, delta) {
      var attributes = _parchment2.default.Attributor.Attribute.keys(node);
      var classes = _parchment2.default.Attributor.Class.keys(node);
      var styles = _parchment2.default.Attributor.Style.keys(node);
      var formats = {};
      attributes.concat(classes).concat(styles).forEach(function (name) {
        var attr = _parchment2.default.query(name, _parchment2.default.Scope.ATTRIBUTE);
        if (attr != null) {
          formats[attr.attrName] = attr.value(node);
          if (formats[attr.attrName]) return;
        }
        attr = ATTRIBUTE_ATTRIBUTORS[name];
        if (attr != null && (attr.attrName === name || attr.keyName === name)) {
          formats[attr.attrName] = attr.value(node) || undefined;
        }
        attr = STYLE_ATTRIBUTORS[name];
        if (attr != null && (attr.attrName === name || attr.keyName === name)) {
          attr = STYLE_ATTRIBUTORS[name];
          formats[attr.attrName] = attr.value(node) || undefined;
        }
      });
      if (Object.keys(formats).length > 0) {
        delta = applyFormat(delta, formats);
      }
      return delta;
    }

    function matchBlot(node, delta) {
      var match = _parchment2.default.query(node);
      if (match == null) return delta;
      if (match.prototype instanceof _parchment2.default.Embed) {
        var embed = {};
        var value = match.value(node);
        if (value != null) {
          embed[match.blotName] = value;
          delta = new _quillDelta2.default().insert(embed, match.formats(node));
        }
      } else if (typeof match.formats === 'function') {
        delta = applyFormat(delta, match.blotName, match.formats(node));
      }
      return delta;
    }

    function matchBreak(node, delta) {
      if (!deltaEndsWith(delta, '\n')) {
        delta.insert('\n');
      }
      return delta;
    }

    function matchIgnore() {
      return new _quillDelta2.default();
    }

    function matchIndent(node, delta) {
      var match = _parchment2.default.query(node);
      if (match == null || match.blotName !== 'list-item' || !deltaEndsWith(delta, '\n')) {
        return delta;
      }
      var indent = -1,
          parent = node.parentNode;
      while (!parent.classList.contains('ql-clipboard')) {
        if ((_parchment2.default.query(parent) || {}).blotName === 'list') {
          indent += 1;
        }
        parent = parent.parentNode;
      }
      if (indent <= 0) return delta;
      return delta.compose(new _quillDelta2.default().retain(delta.length() - 1).retain(1, { indent: indent }));
    }

    function matchNewline(node, delta) {
      if (!deltaEndsWith(delta, '\n')) {
        if (isLine(node) || delta.length() > 0 && node.nextSibling && isLine(node.nextSibling)) {
          delta.insert('\n');
        }
      }
      return delta;
    }

    function matchSpacing(node, delta) {
      if (isLine(node) && node.nextElementSibling != null && !deltaEndsWith(delta, '\n\n')) {
        var nodeHeight = node.offsetHeight + parseFloat(computeStyle(node).marginTop) + parseFloat(computeStyle(node).marginBottom);
        if (node.nextElementSibling.offsetTop > node.offsetTop + nodeHeight * 1.5) {
          delta.insert('\n');
        }
      }
      return delta;
    }

    function matchStyles(node, delta) {
      var formats = {};
      var style = node.style || {};
      if (style.fontStyle && computeStyle(node).fontStyle === 'italic') {
        formats.italic = true;
      }
      if (style.fontWeight && (computeStyle(node).fontWeight.startsWith('bold') || parseInt(computeStyle(node).fontWeight) >= 700)) {
        formats.bold = true;
      }
      if (Object.keys(formats).length > 0) {
        delta = applyFormat(delta, formats);
      }
      if (parseFloat(style.textIndent || 0) > 0) {
        // Could be 0.5in
        delta = new _quillDelta2.default().insert('\t').concat(delta);
      }
      return delta;
    }

    function matchText(node, delta) {
      var text = node.data;
      // Word represents empty line with <o:p>&nbsp;</o:p>
      if (node.parentNode.tagName === 'O:P') {
        return delta.insert(text.trim());
      }
      if (text.trim().length === 0 && node.parentNode.classList.contains('ql-clipboard')) {
        return delta;
      }
      if (!computeStyle(node.parentNode).whiteSpace.startsWith('pre')) {
        // eslint-disable-next-line func-style
        var replacer = function replacer(collapse, match) {
          match = match.replace(/[^\u00a0]/g, ''); // \u00a0 is nbsp;
          return match.length < 1 && collapse ? ' ' : match;
        };
        text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
        text = text.replace(/\s\s+/g, replacer.bind(replacer, true)); // collapse whitespace
        if (node.previousSibling == null && isLine(node.parentNode) || node.previousSibling != null && isLine(node.previousSibling)) {
          text = text.replace(/^\s+/, replacer.bind(replacer, false));
        }
        if (node.nextSibling == null && isLine(node.parentNode) || node.nextSibling != null && isLine(node.nextSibling)) {
          text = text.replace(/\s+$/, replacer.bind(replacer, false));
        }
      }
      return delta.insert(text);
    }

    exports.default = Clipboard;
    exports.matchAttributor = matchAttributor;
    exports.matchBlot = matchBlot;
    exports.matchNewline = matchNewline;
    exports.matchSpacing = matchSpacing;
    exports.matchText = matchText;

    /***/ }),
    /* 56 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Bold = function (_Inline) {
      _inherits(Bold, _Inline);

      function Bold() {
        _classCallCheck(this, Bold);

        return _possibleConstructorReturn(this, (Bold.__proto__ || Object.getPrototypeOf(Bold)).apply(this, arguments));
      }

      _createClass(Bold, [{
        key: 'optimize',
        value: function optimize(context) {
          _get(Bold.prototype.__proto__ || Object.getPrototypeOf(Bold.prototype), 'optimize', this).call(this, context);
          if (this.domNode.tagName !== this.statics.tagName[0]) {
            this.replaceWith(this.statics.blotName);
          }
        }
      }], [{
        key: 'create',
        value: function create() {
          return _get(Bold.__proto__ || Object.getPrototypeOf(Bold), 'create', this).call(this);
        }
      }, {
        key: 'formats',
        value: function formats() {
          return true;
        }
      }]);

      return Bold;
    }(_inline2.default);

    Bold.blotName = 'bold';
    Bold.tagName = ['STRONG', 'B'];

    exports.default = Bold;

    /***/ }),
    /* 57 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.addControls = exports.default = undefined;

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _quillDelta = __webpack_require__(2);

    var _quillDelta2 = _interopRequireDefault(_quillDelta);

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _logger = __webpack_require__(10);

    var _logger2 = _interopRequireDefault(_logger);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var debug = (0, _logger2.default)('quill:toolbar');

    var Toolbar = function (_Module) {
      _inherits(Toolbar, _Module);

      function Toolbar(quill, options) {
        _classCallCheck(this, Toolbar);

        var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, quill, options));

        if (Array.isArray(_this.options.container)) {
          var container = document.createElement('div');
          addControls(container, _this.options.container);
          quill.container.parentNode.insertBefore(container, quill.container);
          _this.container = container;
        } else if (typeof _this.options.container === 'string') {
          _this.container = document.querySelector(_this.options.container);
        } else {
          _this.container = _this.options.container;
        }
        if (!(_this.container instanceof HTMLElement)) {
          var _ret;

          return _ret = debug.error('Container required for toolbar', _this.options), _possibleConstructorReturn(_this, _ret);
        }
        _this.container.classList.add('ql-toolbar');
        _this.controls = [];
        _this.handlers = {};
        Object.keys(_this.options.handlers).forEach(function (format) {
          _this.addHandler(format, _this.options.handlers[format]);
        });
        [].forEach.call(_this.container.querySelectorAll('button, select'), function (input) {
          _this.attach(input);
        });
        _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (type, range) {
          if (type === _quill2.default.events.SELECTION_CHANGE) {
            _this.update(range);
          }
        });
        _this.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
          var _this$quill$selection = _this.quill.selection.getRange(),
              _this$quill$selection2 = _slicedToArray(_this$quill$selection, 1),
              range = _this$quill$selection2[0]; // quill.getSelection triggers update


          _this.update(range);
        });
        return _this;
      }

      _createClass(Toolbar, [{
        key: 'addHandler',
        value: function addHandler(format, handler) {
          this.handlers[format] = handler;
        }
      }, {
        key: 'attach',
        value: function attach(input) {
          var _this2 = this;

          var format = [].find.call(input.classList, function (className) {
            return className.indexOf('ql-') === 0;
          });
          if (!format) return;
          format = format.slice('ql-'.length);
          if (input.tagName === 'BUTTON') {
            input.setAttribute('type', 'button');
          }
          if (this.handlers[format] == null) {
            if (this.quill.scroll.whitelist != null && this.quill.scroll.whitelist[format] == null) {
              debug.warn('ignoring attaching to disabled format', format, input);
              return;
            }
            if (_parchment2.default.query(format) == null) {
              debug.warn('ignoring attaching to nonexistent format', format, input);
              return;
            }
          }
          var eventName = input.tagName === 'SELECT' ? 'change' : 'click';
          input.addEventListener(eventName, function (e) {
            var value = void 0;
            if (input.tagName === 'SELECT') {
              if (input.selectedIndex < 0) return;
              var selected = input.options[input.selectedIndex];
              if (selected.hasAttribute('selected')) {
                value = false;
              } else {
                value = selected.value || false;
              }
            } else {
              if (input.classList.contains('ql-active')) {
                value = false;
              } else {
                value = input.value || !input.hasAttribute('value');
              }
              e.preventDefault();
            }
            _this2.quill.focus();

            var _quill$selection$getR = _this2.quill.selection.getRange(),
                _quill$selection$getR2 = _slicedToArray(_quill$selection$getR, 1),
                range = _quill$selection$getR2[0];

            if (_this2.handlers[format] != null) {
              _this2.handlers[format].call(_this2, value);
            } else if (_parchment2.default.query(format).prototype instanceof _parchment2.default.Embed) {
              value = prompt('Enter ' + format);
              if (!value) return;
              _this2.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert(_defineProperty({}, format, value)), _quill2.default.sources.USER);
            } else {
              _this2.quill.format(format, value, _quill2.default.sources.USER);
            }
            _this2.update(range);
          });
          // TODO use weakmap
          this.controls.push([format, input]);
        }
      }, {
        key: 'update',
        value: function update(range) {
          var formats = range == null ? {} : this.quill.getFormat(range);
          this.controls.forEach(function (pair) {
            var _pair = _slicedToArray(pair, 2),
                format = _pair[0],
                input = _pair[1];

            if (input.tagName === 'SELECT') {
              var option = void 0;
              if (range == null) {
                option = null;
              } else if (formats[format] == null) {
                option = input.querySelector('option[selected]');
              } else if (!Array.isArray(formats[format])) {
                var value = formats[format];
                if (typeof value === 'string') {
                  value = value.replace(/\"/g, '\\"');
                }
                option = input.querySelector('option[value="' + value + '"]');
              }
              if (option == null) {
                input.value = ''; // TODO make configurable?
                input.selectedIndex = -1;
              } else {
                option.selected = true;
              }
            } else {
              if (range == null) {
                input.classList.remove('ql-active');
              } else if (input.hasAttribute('value')) {
                // both being null should match (default values)
                // '1' should match with 1 (headers)
                var isActive = formats[format] === input.getAttribute('value') || formats[format] != null && formats[format].toString() === input.getAttribute('value') || formats[format] == null && !input.getAttribute('value');
                input.classList.toggle('ql-active', isActive);
              } else {
                input.classList.toggle('ql-active', formats[format] != null);
              }
            }
          });
        }
      }]);

      return Toolbar;
    }(_module2.default);

    Toolbar.DEFAULTS = {};

    function addButton(container, format, value) {
      var input = document.createElement('button');
      input.setAttribute('type', 'button');
      input.classList.add('ql-' + format);
      if (value != null) {
        input.value = value;
      }
      container.appendChild(input);
    }

    function addControls(container, groups) {
      if (!Array.isArray(groups[0])) {
        groups = [groups];
      }
      groups.forEach(function (controls) {
        var group = document.createElement('span');
        group.classList.add('ql-formats');
        controls.forEach(function (control) {
          if (typeof control === 'string') {
            addButton(group, control);
          } else {
            var format = Object.keys(control)[0];
            var value = control[format];
            if (Array.isArray(value)) {
              addSelect(group, format, value);
            } else {
              addButton(group, format, value);
            }
          }
        });
        container.appendChild(group);
      });
    }

    function addSelect(container, format, values) {
      var input = document.createElement('select');
      input.classList.add('ql-' + format);
      values.forEach(function (value) {
        var option = document.createElement('option');
        if (value !== false) {
          option.setAttribute('value', value);
        } else {
          option.setAttribute('selected', 'selected');
        }
        input.appendChild(option);
      });
      container.appendChild(input);
    }

    Toolbar.DEFAULTS = {
      container: null,
      handlers: {
        clean: function clean() {
          var _this3 = this;

          var range = this.quill.getSelection();
          if (range == null) return;
          if (range.length == 0) {
            var formats = this.quill.getFormat();
            Object.keys(formats).forEach(function (name) {
              // Clean functionality in existing apps only clean inline formats
              if (_parchment2.default.query(name, _parchment2.default.Scope.INLINE) != null) {
                _this3.quill.format(name, false);
              }
            });
          } else {
            this.quill.removeFormat(range, _quill2.default.sources.USER);
          }
        },
        direction: function direction(value) {
          var align = this.quill.getFormat()['align'];
          if (value === 'rtl' && align == null) {
            this.quill.format('align', 'right', _quill2.default.sources.USER);
          } else if (!value && align === 'right') {
            this.quill.format('align', false, _quill2.default.sources.USER);
          }
          this.quill.format('direction', value, _quill2.default.sources.USER);
        },
        indent: function indent(value) {
          var range = this.quill.getSelection();
          var formats = this.quill.getFormat(range);
          var indent = parseInt(formats.indent || 0);
          if (value === '+1' || value === '-1') {
            var modifier = value === '+1' ? 1 : -1;
            if (formats.direction === 'rtl') modifier *= -1;
            this.quill.format('indent', indent + modifier, _quill2.default.sources.USER);
          }
        },
        link: function link(value) {
          if (value === true) {
            value = prompt('Enter link URL:');
          }
          this.quill.format('link', value, _quill2.default.sources.USER);
        },
        list: function list(value) {
          var range = this.quill.getSelection();
          var formats = this.quill.getFormat(range);
          if (value === 'check') {
            if (formats['list'] === 'checked' || formats['list'] === 'unchecked') {
              this.quill.format('list', false, _quill2.default.sources.USER);
            } else {
              this.quill.format('list', 'unchecked', _quill2.default.sources.USER);
            }
          } else {
            this.quill.format('list', value, _quill2.default.sources.USER);
          }
        }
      }
    };

    exports.default = Toolbar;
    exports.addControls = addControls;

    /***/ }),
    /* 58 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polyline class=\"ql-even ql-stroke\" points=\"5 7 3 9 5 11\"></polyline> <polyline class=\"ql-even ql-stroke\" points=\"13 7 15 9 13 11\"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>";

    /***/ }),
    /* 59 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ColorPicker = function (_Picker) {
      _inherits(ColorPicker, _Picker);

      function ColorPicker(select, label) {
        _classCallCheck(this, ColorPicker);

        var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, select));

        _this.label.innerHTML = label;
        _this.container.classList.add('ql-color-picker');
        [].slice.call(_this.container.querySelectorAll('.ql-picker-item'), 0, 7).forEach(function (item) {
          item.classList.add('ql-primary');
        });
        return _this;
      }

      _createClass(ColorPicker, [{
        key: 'buildItem',
        value: function buildItem(option) {
          var item = _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'buildItem', this).call(this, option);
          item.style.backgroundColor = option.getAttribute('value') || '';
          return item;
        }
      }, {
        key: 'selectItem',
        value: function selectItem(item, trigger) {
          _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'selectItem', this).call(this, item, trigger);
          var colorLabel = this.label.querySelector('.ql-color-label');
          var value = item ? item.getAttribute('data-value') || '' : '';
          if (colorLabel) {
            if (colorLabel.tagName === 'line') {
              colorLabel.style.stroke = value;
            } else {
              colorLabel.style.fill = value;
            }
          }
        }
      }]);

      return ColorPicker;
    }(_picker2.default);

    exports.default = ColorPicker;

    /***/ }),
    /* 60 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var IconPicker = function (_Picker) {
      _inherits(IconPicker, _Picker);

      function IconPicker(select, icons) {
        _classCallCheck(this, IconPicker);

        var _this = _possibleConstructorReturn(this, (IconPicker.__proto__ || Object.getPrototypeOf(IconPicker)).call(this, select));

        _this.container.classList.add('ql-icon-picker');
        [].forEach.call(_this.container.querySelectorAll('.ql-picker-item'), function (item) {
          item.innerHTML = icons[item.getAttribute('data-value') || ''];
        });
        _this.defaultItem = _this.container.querySelector('.ql-selected');
        _this.selectItem(_this.defaultItem);
        return _this;
      }

      _createClass(IconPicker, [{
        key: 'selectItem',
        value: function selectItem(item, trigger) {
          _get(IconPicker.prototype.__proto__ || Object.getPrototypeOf(IconPicker.prototype), 'selectItem', this).call(this, item, trigger);
          item = item || this.defaultItem;
          this.label.innerHTML = item.innerHTML;
        }
      }]);

      return IconPicker;
    }(_picker2.default);

    exports.default = IconPicker;

    /***/ }),
    /* 61 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Tooltip = function () {
      function Tooltip(quill, boundsContainer) {
        var _this = this;

        _classCallCheck(this, Tooltip);

        this.quill = quill;
        this.boundsContainer = boundsContainer || document.body;
        this.root = quill.addContainer('ql-tooltip');
        this.root.innerHTML = this.constructor.TEMPLATE;
        if (this.quill.root === this.quill.scrollingContainer) {
          this.quill.root.addEventListener('scroll', function () {
            _this.root.style.marginTop = -1 * _this.quill.root.scrollTop + 'px';
          });
        }
        this.hide();
      }

      _createClass(Tooltip, [{
        key: 'hide',
        value: function hide() {
          this.root.classList.add('ql-hidden');
        }
      }, {
        key: 'position',
        value: function position(reference) {
          var left = reference.left + reference.width / 2 - this.root.offsetWidth / 2;
          // root.scrollTop should be 0 if scrollContainer !== root
          var top = reference.bottom + this.quill.root.scrollTop;
          this.root.style.left = left + 'px';
          this.root.style.top = top + 'px';
          this.root.classList.remove('ql-flip');
          var containerBounds = this.boundsContainer.getBoundingClientRect();
          var rootBounds = this.root.getBoundingClientRect();
          var shift = 0;
          if (rootBounds.right > containerBounds.right) {
            shift = containerBounds.right - rootBounds.right;
            this.root.style.left = left + shift + 'px';
          }
          if (rootBounds.left < containerBounds.left) {
            shift = containerBounds.left - rootBounds.left;
            this.root.style.left = left + shift + 'px';
          }
          if (rootBounds.bottom > containerBounds.bottom) {
            var height = rootBounds.bottom - rootBounds.top;
            var verticalShift = reference.bottom - reference.top + height;
            this.root.style.top = top - verticalShift + 'px';
            this.root.classList.add('ql-flip');
          }
          return shift;
        }
      }, {
        key: 'show',
        value: function show() {
          this.root.classList.remove('ql-editing');
          this.root.classList.remove('ql-hidden');
        }
      }]);

      return Tooltip;
    }();

    exports.default = Tooltip;

    /***/ }),
    /* 62 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _base = __webpack_require__(43);

    var _base2 = _interopRequireDefault(_base);

    var _link = __webpack_require__(27);

    var _link2 = _interopRequireDefault(_link);

    var _selection = __webpack_require__(15);

    var _icons = __webpack_require__(41);

    var _icons2 = _interopRequireDefault(_icons);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TOOLBAR_CONFIG = [[{ header: ['1', '2', '3', false] }], ['bold', 'italic', 'underline', 'link'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']];

    var SnowTheme = function (_BaseTheme) {
      _inherits(SnowTheme, _BaseTheme);

      function SnowTheme(quill, options) {
        _classCallCheck(this, SnowTheme);

        if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
          options.modules.toolbar.container = TOOLBAR_CONFIG;
        }

        var _this = _possibleConstructorReturn(this, (SnowTheme.__proto__ || Object.getPrototypeOf(SnowTheme)).call(this, quill, options));

        _this.quill.container.classList.add('ql-snow');
        return _this;
      }

      _createClass(SnowTheme, [{
        key: 'extendToolbar',
        value: function extendToolbar(toolbar) {
          toolbar.container.classList.add('ql-snow');
          this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
          this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
          this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
          if (toolbar.container.querySelector('.ql-link')) {
            this.quill.keyboard.addBinding({ key: 'K', shortKey: true }, function (range, context) {
              toolbar.handlers['link'].call(toolbar, !context.format.link);
            });
          }
        }
      }]);

      return SnowTheme;
    }(_base2.default);

    SnowTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
      modules: {
        toolbar: {
          handlers: {
            link: function link(value) {
              if (value) {
                var range = this.quill.getSelection();
                if (range == null || range.length == 0) return;
                var preview = this.quill.getText(range);
                if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
                  preview = 'mailto:' + preview;
                }
                var tooltip = this.quill.theme.tooltip;
                tooltip.edit('link', preview);
              } else {
                this.quill.format('link', false);
              }
            }
          }
        }
      }
    });

    var SnowTooltip = function (_BaseTooltip) {
      _inherits(SnowTooltip, _BaseTooltip);

      function SnowTooltip(quill, bounds) {
        _classCallCheck(this, SnowTooltip);

        var _this2 = _possibleConstructorReturn(this, (SnowTooltip.__proto__ || Object.getPrototypeOf(SnowTooltip)).call(this, quill, bounds));

        _this2.preview = _this2.root.querySelector('a.ql-preview');
        return _this2;
      }

      _createClass(SnowTooltip, [{
        key: 'listen',
        value: function listen() {
          var _this3 = this;

          _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'listen', this).call(this);
          this.root.querySelector('a.ql-action').addEventListener('click', function (event) {
            if (_this3.root.classList.contains('ql-editing')) {
              _this3.save();
            } else {
              _this3.edit('link', _this3.preview.textContent);
            }
            event.preventDefault();
          });
          this.root.querySelector('a.ql-remove').addEventListener('click', function (event) {
            if (_this3.linkRange != null) {
              var range = _this3.linkRange;
              _this3.restoreFocus();
              _this3.quill.formatText(range, 'link', false, _emitter2.default.sources.USER);
              delete _this3.linkRange;
            }
            event.preventDefault();
            _this3.hide();
          });
          this.quill.on(_emitter2.default.events.SELECTION_CHANGE, function (range, oldRange, source) {
            if (range == null) return;
            if (range.length === 0 && source === _emitter2.default.sources.USER) {
              var _quill$scroll$descend = _this3.quill.scroll.descendant(_link2.default, range.index),
                  _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
                  link = _quill$scroll$descend2[0],
                  offset = _quill$scroll$descend2[1];

              if (link != null) {
                _this3.linkRange = new _selection.Range(range.index - offset, link.length());
                var preview = _link2.default.formats(link.domNode);
                _this3.preview.textContent = preview;
                _this3.preview.setAttribute('href', preview);
                _this3.show();
                _this3.position(_this3.quill.getBounds(_this3.linkRange));
                return;
              }
            } else {
              delete _this3.linkRange;
            }
            _this3.hide();
          });
        }
      }, {
        key: 'show',
        value: function show() {
          _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'show', this).call(this);
          this.root.removeAttribute('data-mode');
        }
      }]);

      return SnowTooltip;
    }(_base.BaseTooltip);

    SnowTooltip.TEMPLATE = ['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-action"></a>', '<a class="ql-remove"></a>'].join('');

    exports.default = SnowTheme;

    /***/ }),
    /* 63 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _core = __webpack_require__(29);

    var _core2 = _interopRequireDefault(_core);

    var _align = __webpack_require__(36);

    var _direction = __webpack_require__(38);

    var _indent = __webpack_require__(64);

    var _blockquote = __webpack_require__(65);

    var _blockquote2 = _interopRequireDefault(_blockquote);

    var _header = __webpack_require__(66);

    var _header2 = _interopRequireDefault(_header);

    var _list = __webpack_require__(67);

    var _list2 = _interopRequireDefault(_list);

    var _background = __webpack_require__(37);

    var _color = __webpack_require__(26);

    var _font = __webpack_require__(39);

    var _size = __webpack_require__(40);

    var _bold = __webpack_require__(56);

    var _bold2 = _interopRequireDefault(_bold);

    var _italic = __webpack_require__(68);

    var _italic2 = _interopRequireDefault(_italic);

    var _link = __webpack_require__(27);

    var _link2 = _interopRequireDefault(_link);

    var _script = __webpack_require__(69);

    var _script2 = _interopRequireDefault(_script);

    var _strike = __webpack_require__(70);

    var _strike2 = _interopRequireDefault(_strike);

    var _underline = __webpack_require__(71);

    var _underline2 = _interopRequireDefault(_underline);

    var _image = __webpack_require__(72);

    var _image2 = _interopRequireDefault(_image);

    var _video = __webpack_require__(73);

    var _video2 = _interopRequireDefault(_video);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    var _formula = __webpack_require__(74);

    var _formula2 = _interopRequireDefault(_formula);

    var _syntax = __webpack_require__(75);

    var _syntax2 = _interopRequireDefault(_syntax);

    var _toolbar = __webpack_require__(57);

    var _toolbar2 = _interopRequireDefault(_toolbar);

    var _icons = __webpack_require__(41);

    var _icons2 = _interopRequireDefault(_icons);

    var _picker = __webpack_require__(28);

    var _picker2 = _interopRequireDefault(_picker);

    var _colorPicker = __webpack_require__(59);

    var _colorPicker2 = _interopRequireDefault(_colorPicker);

    var _iconPicker = __webpack_require__(60);

    var _iconPicker2 = _interopRequireDefault(_iconPicker);

    var _tooltip = __webpack_require__(61);

    var _tooltip2 = _interopRequireDefault(_tooltip);

    var _bubble = __webpack_require__(108);

    var _bubble2 = _interopRequireDefault(_bubble);

    var _snow = __webpack_require__(62);

    var _snow2 = _interopRequireDefault(_snow);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    _core2.default.register({
      'attributors/attribute/direction': _direction.DirectionAttribute,

      'attributors/class/align': _align.AlignClass,
      'attributors/class/background': _background.BackgroundClass,
      'attributors/class/color': _color.ColorClass,
      'attributors/class/direction': _direction.DirectionClass,
      'attributors/class/font': _font.FontClass,
      'attributors/class/size': _size.SizeClass,

      'attributors/style/align': _align.AlignStyle,
      'attributors/style/background': _background.BackgroundStyle,
      'attributors/style/color': _color.ColorStyle,
      'attributors/style/direction': _direction.DirectionStyle,
      'attributors/style/font': _font.FontStyle,
      'attributors/style/size': _size.SizeStyle
    }, true);

    _core2.default.register({
      'formats/align': _align.AlignClass,
      'formats/direction': _direction.DirectionClass,
      'formats/indent': _indent.IndentClass,

      'formats/background': _background.BackgroundStyle,
      'formats/color': _color.ColorStyle,
      'formats/font': _font.FontClass,
      'formats/size': _size.SizeClass,

      'formats/blockquote': _blockquote2.default,
      'formats/code-block': _code2.default,
      'formats/header': _header2.default,
      'formats/list': _list2.default,

      'formats/bold': _bold2.default,
      'formats/code': _code.Code,
      'formats/italic': _italic2.default,
      'formats/link': _link2.default,
      'formats/script': _script2.default,
      'formats/strike': _strike2.default,
      'formats/underline': _underline2.default,

      'formats/image': _image2.default,
      'formats/video': _video2.default,

      'formats/list/item': _list.ListItem,

      'modules/formula': _formula2.default,
      'modules/syntax': _syntax2.default,
      'modules/toolbar': _toolbar2.default,

      'themes/bubble': _bubble2.default,
      'themes/snow': _snow2.default,

      'ui/icons': _icons2.default,
      'ui/picker': _picker2.default,
      'ui/icon-picker': _iconPicker2.default,
      'ui/color-picker': _colorPicker2.default,
      'ui/tooltip': _tooltip2.default
    }, true);

    exports.default = _core2.default;

    /***/ }),
    /* 64 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.IndentClass = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var IdentAttributor = function (_Parchment$Attributor) {
      _inherits(IdentAttributor, _Parchment$Attributor);

      function IdentAttributor() {
        _classCallCheck(this, IdentAttributor);

        return _possibleConstructorReturn(this, (IdentAttributor.__proto__ || Object.getPrototypeOf(IdentAttributor)).apply(this, arguments));
      }

      _createClass(IdentAttributor, [{
        key: 'add',
        value: function add(node, value) {
          if (value === '+1' || value === '-1') {
            var indent = this.value(node) || 0;
            value = value === '+1' ? indent + 1 : indent - 1;
          }
          if (value === 0) {
            this.remove(node);
            return true;
          } else {
            return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'add', this).call(this, node, value);
          }
        }
      }, {
        key: 'canAdd',
        value: function canAdd(node, value) {
          return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, value) || _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, parseInt(value));
        }
      }, {
        key: 'value',
        value: function value(node) {
          return parseInt(_get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'value', this).call(this, node)) || undefined; // Don't return NaN
        }
      }]);

      return IdentAttributor;
    }(_parchment2.default.Attributor.Class);

    var IndentClass = new IdentAttributor('indent', 'ql-indent', {
      scope: _parchment2.default.Scope.BLOCK,
      whitelist: [1, 2, 3, 4, 5, 6, 7, 8]
    });

    exports.IndentClass = IndentClass;

    /***/ }),
    /* 65 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Blockquote = function (_Block) {
      _inherits(Blockquote, _Block);

      function Blockquote() {
        _classCallCheck(this, Blockquote);

        return _possibleConstructorReturn(this, (Blockquote.__proto__ || Object.getPrototypeOf(Blockquote)).apply(this, arguments));
      }

      return Blockquote;
    }(_block2.default);

    Blockquote.blotName = 'blockquote';
    Blockquote.tagName = 'blockquote';

    exports.default = Blockquote;

    /***/ }),
    /* 66 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Header = function (_Block) {
      _inherits(Header, _Block);

      function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
      }

      _createClass(Header, null, [{
        key: 'formats',
        value: function formats(domNode) {
          return this.tagName.indexOf(domNode.tagName) + 1;
        }
      }]);

      return Header;
    }(_block2.default);

    Header.blotName = 'header';
    Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    exports.default = Header;

    /***/ }),
    /* 67 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.ListItem = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _block = __webpack_require__(4);

    var _block2 = _interopRequireDefault(_block);

    var _container = __webpack_require__(25);

    var _container2 = _interopRequireDefault(_container);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ListItem = function (_Block) {
      _inherits(ListItem, _Block);

      function ListItem() {
        _classCallCheck(this, ListItem);

        return _possibleConstructorReturn(this, (ListItem.__proto__ || Object.getPrototypeOf(ListItem)).apply(this, arguments));
      }

      _createClass(ListItem, [{
        key: 'format',
        value: function format(name, value) {
          if (name === List.blotName && !value) {
            this.replaceWith(_parchment2.default.create(this.statics.scope));
          } else {
            _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'format', this).call(this, name, value);
          }
        }
      }, {
        key: 'remove',
        value: function remove() {
          if (this.prev == null && this.next == null) {
            this.parent.remove();
          } else {
            _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'remove', this).call(this);
          }
        }
      }, {
        key: 'replaceWith',
        value: function replaceWith(name, value) {
          this.parent.isolate(this.offset(this.parent), this.length());
          if (name === this.parent.statics.blotName) {
            this.parent.replaceWith(name, value);
            return this;
          } else {
            this.parent.unwrap();
            return _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'replaceWith', this).call(this, name, value);
          }
        }
      }], [{
        key: 'formats',
        value: function formats(domNode) {
          return domNode.tagName === this.tagName ? undefined : _get(ListItem.__proto__ || Object.getPrototypeOf(ListItem), 'formats', this).call(this, domNode);
        }
      }]);

      return ListItem;
    }(_block2.default);

    ListItem.blotName = 'list-item';
    ListItem.tagName = 'LI';

    var List = function (_Container) {
      _inherits(List, _Container);

      _createClass(List, null, [{
        key: 'create',
        value: function create(value) {
          var tagName = value === 'ordered' ? 'OL' : 'UL';
          var node = _get(List.__proto__ || Object.getPrototypeOf(List), 'create', this).call(this, tagName);
          if (value === 'checked' || value === 'unchecked') {
            node.setAttribute('data-checked', value === 'checked');
          }
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          if (domNode.tagName === 'OL') return 'ordered';
          if (domNode.tagName === 'UL') {
            if (domNode.hasAttribute('data-checked')) {
              return domNode.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked';
            } else {
              return 'bullet';
            }
          }
          return undefined;
        }
      }]);

      function List(domNode) {
        _classCallCheck(this, List);

        var _this2 = _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, domNode));

        var listEventHandler = function listEventHandler(e) {
          if (e.target.parentNode !== domNode) return;
          var format = _this2.statics.formats(domNode);
          var blot = _parchment2.default.find(e.target);
          if (format === 'checked') {
            blot.format('list', 'unchecked');
          } else if (format === 'unchecked') {
            blot.format('list', 'checked');
          }
        };

        domNode.addEventListener('touchstart', listEventHandler);
        domNode.addEventListener('mousedown', listEventHandler);
        return _this2;
      }

      _createClass(List, [{
        key: 'format',
        value: function format(name, value) {
          if (this.children.length > 0) {
            this.children.tail.format(name, value);
          }
        }
      }, {
        key: 'formats',
        value: function formats() {
          // We don't inherit from FormatBlot
          return _defineProperty({}, this.statics.blotName, this.statics.formats(this.domNode));
        }
      }, {
        key: 'insertBefore',
        value: function insertBefore(blot, ref) {
          if (blot instanceof ListItem) {
            _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'insertBefore', this).call(this, blot, ref);
          } else {
            var index = ref == null ? this.length() : ref.offset(this);
            var after = this.split(index);
            after.parent.insertBefore(blot, after);
          }
        }
      }, {
        key: 'optimize',
        value: function optimize(context) {
          _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'optimize', this).call(this, context);
          var next = this.next;
          if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName && next.domNode.getAttribute('data-checked') === this.domNode.getAttribute('data-checked')) {
            next.moveChildren(this);
            next.remove();
          }
        }
      }, {
        key: 'replace',
        value: function replace(target) {
          if (target.statics.blotName !== this.statics.blotName) {
            var item = _parchment2.default.create(this.statics.defaultChild);
            target.moveChildren(item);
            this.appendChild(item);
          }
          _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'replace', this).call(this, target);
        }
      }]);

      return List;
    }(_container2.default);

    List.blotName = 'list';
    List.scope = _parchment2.default.Scope.BLOCK_BLOT;
    List.tagName = ['OL', 'UL'];
    List.defaultChild = 'list-item';
    List.allowedChildren = [ListItem];

    exports.ListItem = ListItem;
    exports.default = List;

    /***/ }),
    /* 68 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _bold = __webpack_require__(56);

    var _bold2 = _interopRequireDefault(_bold);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Italic = function (_Bold) {
      _inherits(Italic, _Bold);

      function Italic() {
        _classCallCheck(this, Italic);

        return _possibleConstructorReturn(this, (Italic.__proto__ || Object.getPrototypeOf(Italic)).apply(this, arguments));
      }

      return Italic;
    }(_bold2.default);

    Italic.blotName = 'italic';
    Italic.tagName = ['EM', 'I'];

    exports.default = Italic;

    /***/ }),
    /* 69 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Script = function (_Inline) {
      _inherits(Script, _Inline);

      function Script() {
        _classCallCheck(this, Script);

        return _possibleConstructorReturn(this, (Script.__proto__ || Object.getPrototypeOf(Script)).apply(this, arguments));
      }

      _createClass(Script, null, [{
        key: 'create',
        value: function create(value) {
          if (value === 'super') {
            return document.createElement('sup');
          } else if (value === 'sub') {
            return document.createElement('sub');
          } else {
            return _get(Script.__proto__ || Object.getPrototypeOf(Script), 'create', this).call(this, value);
          }
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          if (domNode.tagName === 'SUB') return 'sub';
          if (domNode.tagName === 'SUP') return 'super';
          return undefined;
        }
      }]);

      return Script;
    }(_inline2.default);

    Script.blotName = 'script';
    Script.tagName = ['SUB', 'SUP'];

    exports.default = Script;

    /***/ }),
    /* 70 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Strike = function (_Inline) {
      _inherits(Strike, _Inline);

      function Strike() {
        _classCallCheck(this, Strike);

        return _possibleConstructorReturn(this, (Strike.__proto__ || Object.getPrototypeOf(Strike)).apply(this, arguments));
      }

      return Strike;
    }(_inline2.default);

    Strike.blotName = 'strike';
    Strike.tagName = 'S';

    exports.default = Strike;

    /***/ }),
    /* 71 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _inline = __webpack_require__(6);

    var _inline2 = _interopRequireDefault(_inline);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var Underline = function (_Inline) {
      _inherits(Underline, _Inline);

      function Underline() {
        _classCallCheck(this, Underline);

        return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).apply(this, arguments));
      }

      return Underline;
    }(_inline2.default);

    Underline.blotName = 'underline';
    Underline.tagName = 'U';

    exports.default = Underline;

    /***/ }),
    /* 72 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _link = __webpack_require__(27);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ATTRIBUTES = ['alt', 'height', 'width'];

    var Image = function (_Parchment$Embed) {
      _inherits(Image, _Parchment$Embed);

      function Image() {
        _classCallCheck(this, Image);

        return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
      }

      _createClass(Image, [{
        key: 'format',
        value: function format(name, value) {
          if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
              this.domNode.setAttribute(name, value);
            } else {
              this.domNode.removeAttribute(name);
            }
          } else {
            _get(Image.prototype.__proto__ || Object.getPrototypeOf(Image.prototype), 'format', this).call(this, name, value);
          }
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var node = _get(Image.__proto__ || Object.getPrototypeOf(Image), 'create', this).call(this, value);
          if (typeof value === 'string') {
            node.setAttribute('src', this.sanitize(value));
          }
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          return ATTRIBUTES.reduce(function (formats, attribute) {
            if (domNode.hasAttribute(attribute)) {
              formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
          }, {});
        }
      }, {
        key: 'match',
        value: function match(url) {
          return (/\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url)
          );
        }
      }, {
        key: 'sanitize',
        value: function sanitize(url) {
          return (0, _link.sanitize)(url, ['http', 'https', 'data']) ? url : '//:0';
        }
      }, {
        key: 'value',
        value: function value(domNode) {
          return domNode.getAttribute('src');
        }
      }]);

      return Image;
    }(_parchment2.default.Embed);

    Image.blotName = 'image';
    Image.tagName = 'IMG';

    exports.default = Image;

    /***/ }),
    /* 73 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _block = __webpack_require__(4);

    var _link = __webpack_require__(27);

    var _link2 = _interopRequireDefault(_link);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var ATTRIBUTES = ['height', 'width'];

    var Video = function (_BlockEmbed) {
      _inherits(Video, _BlockEmbed);

      function Video() {
        _classCallCheck(this, Video);

        return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
      }

      _createClass(Video, [{
        key: 'format',
        value: function format(name, value) {
          if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
              this.domNode.setAttribute(name, value);
            } else {
              this.domNode.removeAttribute(name);
            }
          } else {
            _get(Video.prototype.__proto__ || Object.getPrototypeOf(Video.prototype), 'format', this).call(this, name, value);
          }
        }
      }], [{
        key: 'create',
        value: function create(value) {
          var node = _get(Video.__proto__ || Object.getPrototypeOf(Video), 'create', this).call(this, value);
          node.setAttribute('frameborder', '0');
          node.setAttribute('allowfullscreen', true);
          node.setAttribute('src', this.sanitize(value));
          return node;
        }
      }, {
        key: 'formats',
        value: function formats(domNode) {
          return ATTRIBUTES.reduce(function (formats, attribute) {
            if (domNode.hasAttribute(attribute)) {
              formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
          }, {});
        }
      }, {
        key: 'sanitize',
        value: function sanitize(url) {
          return _link2.default.sanitize(url);
        }
      }, {
        key: 'value',
        value: function value(domNode) {
          return domNode.getAttribute('src');
        }
      }]);

      return Video;
    }(_block.BlockEmbed);

    Video.blotName = 'video';
    Video.className = 'ql-video';
    Video.tagName = 'IFRAME';

    exports.default = Video;

    /***/ }),
    /* 74 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.FormulaBlot = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _embed = __webpack_require__(35);

    var _embed2 = _interopRequireDefault(_embed);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var FormulaBlot = function (_Embed) {
      _inherits(FormulaBlot, _Embed);

      function FormulaBlot() {
        _classCallCheck(this, FormulaBlot);

        return _possibleConstructorReturn(this, (FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot)).apply(this, arguments));
      }

      _createClass(FormulaBlot, null, [{
        key: 'create',
        value: function create(value) {
          var node = _get(FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot), 'create', this).call(this, value);
          if (typeof value === 'string') {
            window.katex.render(value, node, {
              throwOnError: false,
              errorColor: '#f00'
            });
            node.setAttribute('data-value', value);
          }
          return node;
        }
      }, {
        key: 'value',
        value: function value(domNode) {
          return domNode.getAttribute('data-value');
        }
      }]);

      return FormulaBlot;
    }(_embed2.default);

    FormulaBlot.blotName = 'formula';
    FormulaBlot.className = 'ql-formula';
    FormulaBlot.tagName = 'SPAN';

    var Formula = function (_Module) {
      _inherits(Formula, _Module);

      _createClass(Formula, null, [{
        key: 'register',
        value: function register() {
          _quill2.default.register(FormulaBlot, true);
        }
      }]);

      function Formula() {
        _classCallCheck(this, Formula);

        var _this2 = _possibleConstructorReturn(this, (Formula.__proto__ || Object.getPrototypeOf(Formula)).call(this));

        if (window.katex == null) {
          throw new Error('Formula module requires KaTeX.');
        }
        return _this2;
      }

      return Formula;
    }(_module2.default);

    exports.FormulaBlot = FormulaBlot;
    exports.default = Formula;

    /***/ }),
    /* 75 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.CodeToken = exports.CodeBlock = undefined;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _parchment = __webpack_require__(0);

    var _parchment2 = _interopRequireDefault(_parchment);

    var _quill = __webpack_require__(5);

    var _quill2 = _interopRequireDefault(_quill);

    var _module = __webpack_require__(9);

    var _module2 = _interopRequireDefault(_module);

    var _code = __webpack_require__(13);

    var _code2 = _interopRequireDefault(_code);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var SyntaxCodeBlock = function (_CodeBlock) {
      _inherits(SyntaxCodeBlock, _CodeBlock);

      function SyntaxCodeBlock() {
        _classCallCheck(this, SyntaxCodeBlock);

        return _possibleConstructorReturn(this, (SyntaxCodeBlock.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock)).apply(this, arguments));
      }

      _createClass(SyntaxCodeBlock, [{
        key: 'replaceWith',
        value: function replaceWith(block) {
          this.domNode.textContent = this.domNode.textContent;
          this.attach();
          _get(SyntaxCodeBlock.prototype.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock.prototype), 'replaceWith', this).call(this, block);
        }
      }, {
        key: 'highlight',
        value: function highlight(_highlight) {
          var text = this.domNode.textContent;
          if (this.cachedText !== text) {
            if (text.trim().length > 0 || this.cachedText == null) {
              this.domNode.innerHTML = _highlight(text);
              this.domNode.normalize();
              this.attach();
            }
            this.cachedText = text;
          }
        }
      }]);

      return SyntaxCodeBlock;
    }(_code2.default);

    SyntaxCodeBlock.className = 'ql-syntax';

    var CodeToken = new _parchment2.default.Attributor.Class('token', 'hljs', {
      scope: _parchment2.default.Scope.INLINE
    });

    var Syntax = function (_Module) {
      _inherits(Syntax, _Module);

      _createClass(Syntax, null, [{
        key: 'register',
        value: function register() {
          _quill2.default.register(CodeToken, true);
          _quill2.default.register(SyntaxCodeBlock, true);
        }
      }]);

      function Syntax(quill, options) {
        _classCallCheck(this, Syntax);

        var _this2 = _possibleConstructorReturn(this, (Syntax.__proto__ || Object.getPrototypeOf(Syntax)).call(this, quill, options));

        if (typeof _this2.options.highlight !== 'function') {
          throw new Error('Syntax module requires highlight.js. Please include the library on the page before Quill.');
        }
        var timer = null;
        _this2.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            _this2.highlight();
            timer = null;
          }, _this2.options.interval);
        });
        _this2.highlight();
        return _this2;
      }

      _createClass(Syntax, [{
        key: 'highlight',
        value: function highlight() {
          var _this3 = this;

          if (this.quill.selection.composing) return;
          this.quill.update(_quill2.default.sources.USER);
          var range = this.quill.getSelection();
          this.quill.scroll.descendants(SyntaxCodeBlock).forEach(function (code) {
            code.highlight(_this3.options.highlight);
          });
          this.quill.update(_quill2.default.sources.SILENT);
          if (range != null) {
            this.quill.setSelection(range, _quill2.default.sources.SILENT);
          }
        }
      }]);

      return Syntax;
    }(_module2.default);

    Syntax.DEFAULTS = {
      highlight: function () {
        if (window.hljs == null) return null;
        return function (text) {
          var result = window.hljs.highlightAuto(text);
          return result.value;
        };
      }(),
      interval: 1000
    };

    exports.CodeBlock = SyntaxCodeBlock;
    exports.CodeToken = CodeToken;
    exports.default = Syntax;

    /***/ }),
    /* 76 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 77 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 78 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 79 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>";

    /***/ }),
    /* 80 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <g class=\"ql-fill ql-color-label\"> <polygon points=\"6 6.868 6 6 5 6 5 7 5.942 7 6 6.868\"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points=\"6.817 5 6 5 6 6 6.38 6 6.817 5\"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points=\"4 11.439 4 11 3 11 3 12 3.755 12 4 11.439\"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points=\"4.63 10 4 10 4 11 4.192 11 4.63 10\"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points=\"13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174\"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points=\"12 6.868 12 6 11.62 6 12 6.868\"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points=\"12.933 9 13 9 13 8 12.495 8 12.933 9\"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points=\"5.5 13 9 5 12.5 13\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>";

    /***/ }),
    /* 81 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=4 y=5></rect> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=11 y=5></rect> <path class=\"ql-even ql-fill ql-stroke\" d=M7,8c0,4.031-3,5-3,5></path> <path class=\"ql-even ql-fill ql-stroke\" d=M14,8c0,4.031-3,5-3,5></path> </svg>";

    /***/ }),
    /* 82 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>";

    /***/ }),
    /* 83 */
    /***/ (function(module, exports) {

    module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>";

    /***/ }),
    /* 84 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-color-label ql-stroke ql-transparent\" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points=\"5.5 11 9 3 12.5 11\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>";

    /***/ }),
    /* 85 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"3 11 5 9 3 7 3 11\"></polygon> <line class=\"ql-stroke ql-fill\" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>";

    /***/ }),
    /* 86 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"15 12 13 10 15 8 15 12\"></polygon> <line class=\"ql-stroke ql-fill\" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>";

    /***/ }),
    /* 87 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>";

    /***/ }),
    /* 88 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>";

    /***/ }),
    /* 89 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>";

    /***/ }),
    /* 90 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform=\"translate(24 18) rotate(-180)\"/> </svg>";

    /***/ }),
    /* 91 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>";

    /***/ }),
    /* 92 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>";

    /***/ }),
    /* 93 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>";

    /***/ }),
    /* 94 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>";

    /***/ }),
    /* 95 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class=\"ql-even ql-fill\" points=\"5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12\"></polyline> </svg>";

    /***/ }),
    /* 96 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=\"ql-fill ql-stroke\" points=\"3 7 3 11 5 9 3 7\"></polyline> </svg>";

    /***/ }),
    /* 97 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"5 7 5 11 3 9 5 7\"></polyline> </svg>";

    /***/ }),
    /* 98 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class=\"ql-even ql-stroke\" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class=\"ql-even ql-stroke\" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>";

    /***/ }),
    /* 99 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class=\"ql-stroke ql-thin\" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class=\"ql-stroke ql-thin\" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class=\"ql-stroke ql-thin\" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>";

    /***/ }),
    /* 100 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>";

    /***/ }),
    /* 101 */
    /***/ (function(module, exports) {

    module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points=\"3 4 4 5 6 3\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points=\"3 14 4 15 6 13\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"3 9 4 10 6 8\"></polyline> </svg>";

    /***/ }),
    /* 102 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>";

    /***/ }),
    /* 103 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>";

    /***/ }),
    /* 104 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-stroke ql-thin\" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>";

    /***/ }),
    /* 105 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>";

    /***/ }),
    /* 106 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>";

    /***/ }),
    /* 107 */
    /***/ (function(module, exports) {

    module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=ql-stroke points=\"7 11 9 13 11 11 7 11\"></polygon> <polygon class=ql-stroke points=\"7 7 9 5 11 7 7 7\"></polygon> </svg>";

    /***/ }),
    /* 108 */
    /***/ (function(module, exports, __webpack_require__) {


    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.BubbleTooltip = undefined;

    var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    var _extend = __webpack_require__(3);

    var _extend2 = _interopRequireDefault(_extend);

    var _emitter = __webpack_require__(8);

    var _emitter2 = _interopRequireDefault(_emitter);

    var _base = __webpack_require__(43);

    var _base2 = _interopRequireDefault(_base);

    var _selection = __webpack_require__(15);

    var _icons = __webpack_require__(41);

    var _icons2 = _interopRequireDefault(_icons);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    var TOOLBAR_CONFIG = [['bold', 'italic', 'link'], [{ header: 1 }, { header: 2 }, 'blockquote']];

    var BubbleTheme = function (_BaseTheme) {
      _inherits(BubbleTheme, _BaseTheme);

      function BubbleTheme(quill, options) {
        _classCallCheck(this, BubbleTheme);

        if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
          options.modules.toolbar.container = TOOLBAR_CONFIG;
        }

        var _this = _possibleConstructorReturn(this, (BubbleTheme.__proto__ || Object.getPrototypeOf(BubbleTheme)).call(this, quill, options));

        _this.quill.container.classList.add('ql-bubble');
        return _this;
      }

      _createClass(BubbleTheme, [{
        key: 'extendToolbar',
        value: function extendToolbar(toolbar) {
          this.tooltip = new BubbleTooltip(this.quill, this.options.bounds);
          this.tooltip.root.appendChild(toolbar.container);
          this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
          this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
        }
      }]);

      return BubbleTheme;
    }(_base2.default);

    BubbleTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
      modules: {
        toolbar: {
          handlers: {
            link: function link(value) {
              if (!value) {
                this.quill.format('link', false);
              } else {
                this.quill.theme.tooltip.edit();
              }
            }
          }
        }
      }
    });

    var BubbleTooltip = function (_BaseTooltip) {
      _inherits(BubbleTooltip, _BaseTooltip);

      function BubbleTooltip(quill, bounds) {
        _classCallCheck(this, BubbleTooltip);

        var _this2 = _possibleConstructorReturn(this, (BubbleTooltip.__proto__ || Object.getPrototypeOf(BubbleTooltip)).call(this, quill, bounds));

        _this2.quill.on(_emitter2.default.events.EDITOR_CHANGE, function (type, range, oldRange, source) {
          if (type !== _emitter2.default.events.SELECTION_CHANGE) return;
          if (range != null && range.length > 0 && source === _emitter2.default.sources.USER) {
            _this2.show();
            // Lock our width so we will expand beyond our offsetParent boundaries
            _this2.root.style.left = '0px';
            _this2.root.style.width = '';
            _this2.root.style.width = _this2.root.offsetWidth + 'px';
            var lines = _this2.quill.getLines(range.index, range.length);
            if (lines.length === 1) {
              _this2.position(_this2.quill.getBounds(range));
            } else {
              var lastLine = lines[lines.length - 1];
              var index = _this2.quill.getIndex(lastLine);
              var length = Math.min(lastLine.length() - 1, range.index + range.length - index);
              var _bounds = _this2.quill.getBounds(new _selection.Range(index, length));
              _this2.position(_bounds);
            }
          } else if (document.activeElement !== _this2.textbox && _this2.quill.hasFocus()) {
            _this2.hide();
          }
        });
        return _this2;
      }

      _createClass(BubbleTooltip, [{
        key: 'listen',
        value: function listen() {
          var _this3 = this;

          _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'listen', this).call(this);
          this.root.querySelector('.ql-close').addEventListener('click', function () {
            _this3.root.classList.remove('ql-editing');
          });
          this.quill.on(_emitter2.default.events.SCROLL_OPTIMIZE, function () {
            // Let selection be restored by toolbar handlers before repositioning
            setTimeout(function () {
              if (_this3.root.classList.contains('ql-hidden')) return;
              var range = _this3.quill.getSelection();
              if (range != null) {
                _this3.position(_this3.quill.getBounds(range));
              }
            }, 1);
          });
        }
      }, {
        key: 'cancel',
        value: function cancel() {
          this.show();
        }
      }, {
        key: 'position',
        value: function position(reference) {
          var shift = _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'position', this).call(this, reference);
          var arrow = this.root.querySelector('.ql-tooltip-arrow');
          arrow.style.marginLeft = '';
          if (shift === 0) return shift;
          arrow.style.marginLeft = -1 * shift - arrow.offsetWidth / 2 + 'px';
        }
      }]);

      return BubbleTooltip;
    }(_base.BaseTooltip);

    BubbleTooltip.TEMPLATE = ['<span class="ql-tooltip-arrow"></span>', '<div class="ql-tooltip-editor">', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-close"></a>', '</div>'].join('');

    exports.BubbleTooltip = BubbleTooltip;
    exports.default = BubbleTheme;

    /***/ }),
    /* 109 */
    /***/ (function(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(63);


    /***/ })
    /******/ ])["default"];
    });
    });

    createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t(quill);}(window,(function(e){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){
    /*! @license DOMPurify | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.2.2/LICENSE */
    e.exports=function(){var e=Object.hasOwnProperty,t=Object.setPrototypeOf,n=Object.isFrozen,o=Object.getPrototypeOf,r=Object.getOwnPropertyDescriptor,i=Object.freeze,a=Object.seal,u=Object.create,l="undefined"!=typeof Reflect&&Reflect,s=l.apply,c=l.construct;s||(s=function(e,t,n){return e.apply(t,n)}),i||(i=function(e){return e}),a||(a=function(e){return e}),c||(c=function(e,t){return new(Function.prototype.bind.apply(e,[null].concat(function(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}(t))))});var f,d=F(Array.prototype.forEach),p=F(Array.prototype.pop),m=F(Array.prototype.push),h=F(String.prototype.toLowerCase),y=F(String.prototype.match),g=F(String.prototype.replace),b=F(String.prototype.indexOf),v=F(String.prototype.trim),A=F(RegExp.prototype.test),D=(f=TypeError,function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return c(f,t)});function F(e){return function(t){for(var n=arguments.length,o=Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];return s(e,t,o)}}function T(e,o){t&&t(e,null);for(var r=o.length;r--;){var i=o[r];if("string"==typeof i){var a=h(i);a!==i&&(n(o)||(o[r]=a),i=a);}e[i]=!0;}return e}function S(t){var n=u(null),o=void 0;for(o in t)s(e,t,[o])&&(n[o]=t[o]);return n}function L(e,t){for(;null!==e;){var n=r(e,t);if(n){if(n.get)return F(n.get);if("function"==typeof n.value)return F(n.value)}e=o(e);}return function(e){return console.warn("fallback value for",e),null}}var E=i(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),O=i(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),k=i(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),w=i(["animate","color-profile","cursor","discard","fedropshadow","feimage","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),_=i(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]),x=i(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),R=i(["#text"]),M=i(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),N=i(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),z=i(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),C=i(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),W=a(/\{\{[\s\S]*|[\s\S]*\}\}/gm),H=a(/<%[\s\S]*|[\s\S]*%>/gm),j=a(/^data-[\-\w.\u00B7-\uFFFF]/),P=a(/^aria-[\-\w]+$/),G=a(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),B=a(/^(?:\w+script|data):/i),I=a(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),U="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};function q(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}var K=function(){return "undefined"==typeof window?null:window},V=function(e,t){if("object"!==(void 0===e?"undefined":U(e))||"function"!=typeof e.createPolicy)return null;var n=null;t.currentScript&&t.currentScript.hasAttribute("data-tt-policy-suffix")&&(n=t.currentScript.getAttribute("data-tt-policy-suffix"));var o="dompurify"+(n?"#"+n:"");try{return e.createPolicy(o,{createHTML:function(e){return e}})}catch(e){return console.warn("TrustedTypes policy "+o+" could not be created."),null}};return function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:K(),n=function(t){return e(t)};if(n.version="2.2.9",n.removed=[],!t||!t.document||9!==t.document.nodeType)return n.isSupported=!1,n;var o=t.document,r=t.document,a=t.DocumentFragment,u=t.HTMLTemplateElement,l=t.Node,s=t.Element,c=t.NodeFilter,f=t.NamedNodeMap,F=void 0===f?t.NamedNodeMap||t.MozNamedAttrMap:f,Q=t.Text,Y=t.Comment,$=t.DOMParser,X=t.trustedTypes,Z=s.prototype,J=L(Z,"cloneNode"),ee=L(Z,"nextSibling"),te=L(Z,"childNodes"),ne=L(Z,"parentNode");if("function"==typeof u){var oe=r.createElement("template");oe.content&&oe.content.ownerDocument&&(r=oe.content.ownerDocument);}var re=V(X,o),ie=re&&Ce?re.createHTML(""):"",ae=r,ue=ae.implementation,le=ae.createNodeIterator,se=ae.createDocumentFragment,ce=o.importNode,fe={};try{fe=S(r).documentMode?r.documentMode:{};}catch(e){}var de={};n.isSupported="function"==typeof ne&&ue&&void 0!==ue.createHTMLDocument&&9!==fe;var pe=W,me=H,he=j,ye=P,ge=B,be=I,ve=G,Ae=null,De=T({},[].concat(q(E),q(O),q(k),q(_),q(R))),Fe=null,Te=T({},[].concat(q(M),q(N),q(z),q(C))),Se=null,Le=null,Ee=!0,Oe=!0,ke=!1,we=!1,_e=!1,xe=!1,Re=!1,Me=!1,Ne=!1,ze=!0,Ce=!1,We=!0,He=!0,je=!1,Pe={},Ge=T({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Be=null,Ie=T({},["audio","video","img","source","image","track"]),Ue=null,qe=T({},["alt","class","for","id","label","name","pattern","placeholder","summary","title","value","style","xmlns"]),Ke="http://www.w3.org/1998/Math/MathML",Ve="http://www.w3.org/2000/svg",Qe="http://www.w3.org/1999/xhtml",Ye=Qe,$e=!1,Xe=null,Ze=r.createElement("form"),Je=function(e){Xe&&Xe===e||(e&&"object"===(void 0===e?"undefined":U(e))||(e={}),e=S(e),Ae="ALLOWED_TAGS"in e?T({},e.ALLOWED_TAGS):De,Fe="ALLOWED_ATTR"in e?T({},e.ALLOWED_ATTR):Te,Ue="ADD_URI_SAFE_ATTR"in e?T(S(qe),e.ADD_URI_SAFE_ATTR):qe,Be="ADD_DATA_URI_TAGS"in e?T(S(Ie),e.ADD_DATA_URI_TAGS):Ie,Se="FORBID_TAGS"in e?T({},e.FORBID_TAGS):{},Le="FORBID_ATTR"in e?T({},e.FORBID_ATTR):{},Pe="USE_PROFILES"in e&&e.USE_PROFILES,Ee=!1!==e.ALLOW_ARIA_ATTR,Oe=!1!==e.ALLOW_DATA_ATTR,ke=e.ALLOW_UNKNOWN_PROTOCOLS||!1,we=e.SAFE_FOR_TEMPLATES||!1,_e=e.WHOLE_DOCUMENT||!1,Me=e.RETURN_DOM||!1,Ne=e.RETURN_DOM_FRAGMENT||!1,ze=!1!==e.RETURN_DOM_IMPORT,Ce=e.RETURN_TRUSTED_TYPE||!1,Re=e.FORCE_BODY||!1,We=!1!==e.SANITIZE_DOM,He=!1!==e.KEEP_CONTENT,je=e.IN_PLACE||!1,ve=e.ALLOWED_URI_REGEXP||ve,Ye=e.NAMESPACE||Qe,we&&(Oe=!1),Ne&&(Me=!0),Pe&&(Ae=T({},[].concat(q(R))),Fe=[],!0===Pe.html&&(T(Ae,E),T(Fe,M)),!0===Pe.svg&&(T(Ae,O),T(Fe,N),T(Fe,C)),!0===Pe.svgFilters&&(T(Ae,k),T(Fe,N),T(Fe,C)),!0===Pe.mathMl&&(T(Ae,_),T(Fe,z),T(Fe,C))),e.ADD_TAGS&&(Ae===De&&(Ae=S(Ae)),T(Ae,e.ADD_TAGS)),e.ADD_ATTR&&(Fe===Te&&(Fe=S(Fe)),T(Fe,e.ADD_ATTR)),e.ADD_URI_SAFE_ATTR&&T(Ue,e.ADD_URI_SAFE_ATTR),He&&(Ae["#text"]=!0),_e&&T(Ae,["html","head","body"]),Ae.table&&(T(Ae,["tbody"]),delete Se.tbody),i&&i(e),Xe=e);},et=T({},["mi","mo","mn","ms","mtext"]),tt=T({},["foreignobject","desc","title","annotation-xml"]),nt=T({},O);T(nt,k),T(nt,w);var ot=T({},_);T(ot,x);var rt=function(e){var t=ne(e);t&&t.tagName||(t={namespaceURI:Qe,tagName:"template"});var n=h(e.tagName),o=h(t.tagName);if(e.namespaceURI===Ve)return t.namespaceURI===Qe?"svg"===n:t.namespaceURI===Ke?"svg"===n&&("annotation-xml"===o||et[o]):Boolean(nt[n]);if(e.namespaceURI===Ke)return t.namespaceURI===Qe?"math"===n:t.namespaceURI===Ve?"math"===n&&tt[o]:Boolean(ot[n]);if(e.namespaceURI===Qe){if(t.namespaceURI===Ve&&!tt[o])return !1;if(t.namespaceURI===Ke&&!et[o])return !1;var r=T({},["title","style","font","a","script"]);return !ot[n]&&(r[n]||!nt[n])}return !1},it=function(e){m(n.removed,{element:e});try{e.parentNode.removeChild(e);}catch(t){try{e.outerHTML=ie;}catch(t){e.remove();}}},at=function(e,t){try{m(n.removed,{attribute:t.getAttributeNode(e),from:t});}catch(e){m(n.removed,{attribute:null,from:t});}if(t.removeAttribute(e),"is"===e&&!Fe[e])if(Me||Ne)try{it(t);}catch(e){}else try{t.setAttribute(e,"");}catch(e){}},ut=function(e){var t=void 0,n=void 0;if(Re)e="<remove></remove>"+e;else {var o=y(e,/^[\r\n\t ]+/);n=o&&o[0];}var i=re?re.createHTML(e):e;if(Ye===Qe)try{t=(new $).parseFromString(i,"text/html");}catch(e){}if(!t||!t.documentElement){t=ue.createDocument(Ye,"template",null);try{t.documentElement.innerHTML=$e?"":i;}catch(e){}}var a=t.body||t.documentElement;return e&&n&&a.insertBefore(r.createTextNode(n),a.childNodes[0]||null),_e?t.documentElement:a},lt=function(e){return le.call(e.ownerDocument||e,e,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT,null,!1)},st=function(e){return !(e instanceof Q||e instanceof Y||"string"==typeof e.nodeName&&"string"==typeof e.textContent&&"function"==typeof e.removeChild&&e.attributes instanceof F&&"function"==typeof e.removeAttribute&&"function"==typeof e.setAttribute&&"string"==typeof e.namespaceURI&&"function"==typeof e.insertBefore)},ct=function(e){return "object"===(void 0===l?"undefined":U(l))?e instanceof l:e&&"object"===(void 0===e?"undefined":U(e))&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName},ft=function(e,t,o){de[e]&&d(de[e],(function(e){e.call(n,t,o,Xe);}));},dt=function(e){var t=void 0;if(ft("beforeSanitizeElements",e,null),st(e))return it(e),!0;if(y(e.nodeName,/[\u0080-\uFFFF]/))return it(e),!0;var o=h(e.nodeName);if(ft("uponSanitizeElement",e,{tagName:o,allowedTags:Ae}),!ct(e.firstElementChild)&&(!ct(e.content)||!ct(e.content.firstElementChild))&&A(/<[/\w]/g,e.innerHTML)&&A(/<[/\w]/g,e.textContent))return it(e),!0;if(!Ae[o]||Se[o]){if(He&&!Ge[o]){var r=ne(e)||e.parentNode,i=te(e)||e.childNodes;if(i&&r)for(var a=i.length-1;a>=0;--a)r.insertBefore(J(i[a],!0),ee(e));}return it(e),!0}return e instanceof s&&!rt(e)?(it(e),!0):"noscript"!==o&&"noembed"!==o||!A(/<\/no(script|embed)/i,e.innerHTML)?(we&&3===e.nodeType&&(t=e.textContent,t=g(t,pe," "),t=g(t,me," "),e.textContent!==t&&(m(n.removed,{element:e.cloneNode()}),e.textContent=t)),ft("afterSanitizeElements",e,null),!1):(it(e),!0)},pt=function(e,t,n){if(We&&("id"===t||"name"===t)&&(n in r||n in Ze))return !1;if(Oe&&A(he,t));else if(Ee&&A(ye,t));else {if(!Fe[t]||Le[t])return !1;if(Ue[t]);else if(A(ve,g(n,be,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==b(n,"data:")||!Be[e])if(ke&&!A(ge,g(n,be,"")));else if(n)return !1}return !0},mt=function(e){var t=void 0,o=void 0,r=void 0,i=void 0;ft("beforeSanitizeAttributes",e,null);var a=e.attributes;if(a){var u={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:Fe};for(i=a.length;i--;){var l=t=a[i],s=l.name,c=l.namespaceURI;if(o=v(t.value),r=h(s),u.attrName=r,u.attrValue=o,u.keepAttr=!0,u.forceKeepAttr=void 0,ft("uponSanitizeAttribute",e,u),o=u.attrValue,!u.forceKeepAttr&&(at(s,e),u.keepAttr))if(A(/\/>/i,o))at(s,e);else {we&&(o=g(o,pe," "),o=g(o,me," "));var f=e.nodeName.toLowerCase();if(pt(f,r,o))try{c?e.setAttributeNS(c,s,o):e.setAttribute(s,o),p(n.removed);}catch(e){}}}ft("afterSanitizeAttributes",e,null);}},ht=function e(t){var n=void 0,o=lt(t);for(ft("beforeSanitizeShadowDOM",t,null);n=o.nextNode();)ft("uponSanitizeShadowNode",n,null),dt(n)||(n.content instanceof a&&e(n.content),mt(n));ft("afterSanitizeShadowDOM",t,null);};return n.sanitize=function(e,r){var i=void 0,u=void 0,s=void 0,c=void 0,f=void 0;if(($e=!e)&&(e="\x3c!--\x3e"),"string"!=typeof e&&!ct(e)){if("function"!=typeof e.toString)throw D("toString is not a function");if("string"!=typeof(e=e.toString()))throw D("dirty is not a string, aborting")}if(!n.isSupported){if("object"===U(t.toStaticHTML)||"function"==typeof t.toStaticHTML){if("string"==typeof e)return t.toStaticHTML(e);if(ct(e))return t.toStaticHTML(e.outerHTML)}return e}if(xe||Je(r),n.removed=[],"string"==typeof e&&(je=!1),je);else if(e instanceof l)1===(u=(i=ut("\x3c!----\x3e")).ownerDocument.importNode(e,!0)).nodeType&&"BODY"===u.nodeName||"HTML"===u.nodeName?i=u:i.appendChild(u);else {if(!Me&&!we&&!_e&&-1===e.indexOf("<"))return re&&Ce?re.createHTML(e):e;if(!(i=ut(e)))return Me?null:ie}i&&Re&&it(i.firstChild);for(var d=lt(je?e:i);s=d.nextNode();)3===s.nodeType&&s===c||dt(s)||(s.content instanceof a&&ht(s.content),mt(s),c=s);if(c=null,je)return e;if(Me){if(Ne)for(f=se.call(i.ownerDocument);i.firstChild;)f.appendChild(i.firstChild);else f=i;return ze&&(f=ce.call(o,f,!0)),f}var p=_e?i.outerHTML:i.innerHTML;return we&&(p=g(p,pe," "),p=g(p,me," ")),re&&Ce?re.createHTML(p):p},n.setConfig=function(e){Je(e),xe=!0;},n.clearConfig=function(){Xe=null,xe=!1;},n.isValidAttribute=function(e,t,n){Xe||Je({});var o=h(e),r=h(t);return pt(o,r,n)},n.addHook=function(e,t){"function"==typeof t&&(de[e]=de[e]||[],m(de[e],t));},n.removeHook=function(e){de[e]&&p(de[e]);},n.removeHooks=function(e){de[e]&&(de[e]=[]);},n.removeAllHooks=function(){de={};},n}()}();},function(t,n){t.exports=e;},function(e,t,n){n.r(t);var o=n(1),r=n.n(o),i=n(0),a=n.n(i);function u(e){return (u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o);}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){c(e,t,n[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t));}));}return e}function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function f(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o);}}function d(e,t){return (d=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function p(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var n,o=h(e);if(t){var r=h(this).constructor;n=Reflect.construct(o,arguments,r);}else n=o.apply(this,arguments);return m(this,n)}}function m(e,t){return !t||"object"!==u(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function h(e){return (h=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var y=r.a.import("modules/clipboard"),g=r.a.import("delta"),b=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&d(e,t);}(u,e);var t,n,i=p(u);function u(e,t){var n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,u),(n=i.call(this,e,t)).allowed=t.allowed,n.keepSelection=t.keepSelection,n.substituteBlockElements=t.substituteBlockElements,n.magicPasteLinks=t.magicPasteLinks,n.hooks=t.hooks,n}return t=u,(n=[{key:"onPaste",value:function(e){var t=this;e.preventDefault();var n,o,i,u,l,s=this.quill.getSelection();e.clipboardData&&e.clipboardData.getData||!window.clipboardData||!window.clipboardData.getData?(n=e.clipboardData.getData("text/plain"),o=e.clipboardData.getData("text/html"),i=null===(u=e.clipboardData)||void 0===u||null===(l=u.items)||void 0===l?void 0:l[0]):n=window.clipboardData.getData("Text");var c,f,d,p,m,h,y,b,v,A=(new g).retain(s.index).delete(s.length),D=this.getDOMPurifyOptions(),F=n;if(o)"function"==typeof(null===(c=this.hooks)||void 0===c?void 0:c.beforeSanitizeElements)&&a.a.addHook("beforeSanitizeElements",this.hooks.beforeSanitizeElements),"function"==typeof(null===(f=this.hooks)||void 0===f?void 0:f.uponSanitizeElement)&&a.a.addHook("uponSanitizeElement",this.hooks.uponSanitizeElement),"function"==typeof(null===(d=this.hooks)||void 0===d?void 0:d.afterSanitizeElements)&&a.a.addHook("afterSanitizeElements",this.hooks.afterSanitizeElements),"function"==typeof(null===(p=this.hooks)||void 0===p?void 0:p.beforeSanitizeAttributes)&&a.a.addHook("beforeSanitizeAttributes",this.hooks.beforeSanitizeAttributes),"function"==typeof(null===(m=this.hooks)||void 0===m?void 0:m.uponSanitizeAttribute)&&a.a.addHook("uponSanitizeAttribute",this.hooks.uponSanitizeAttribute),"function"==typeof(null===(h=this.hooks)||void 0===h?void 0:h.afterSanitizeAttributes)&&a.a.addHook("afterSanitizeAttributes",this.hooks.afterSanitizeAttributes),"function"==typeof(null===(y=this.hooks)||void 0===y?void 0:y.beforeSanitizeShadowDOM)&&a.a.addHook("beforeSanitizeShadowDOM",this.hooks.beforeSanitizeShadowDOM),"function"==typeof(null===(b=this.hooks)||void 0===b?void 0:b.uponSanitizeShadowNode)&&a.a.addHook("uponSanitizeShadowNode",this.hooks.uponSanitizeShadowNode),"function"==typeof(null===(v=this.hooks)||void 0===v?void 0:v.afterSanitizeShadowDOM)&&a.a.addHook("afterSanitizeShadowDOM",this.hooks.afterSanitizeShadowDOM),F=!1!==this.substituteBlockElements?(o=this.substitute(o,D)).innerHTML:a.a.sanitize(o,D),A=A.concat(this.convert(F));else if(D.ALLOWED_TAGS.includes("a")&&this.isURL(n)&&s.length>0&&this.magicPasteLinks)F=this.quill.getText(s.index,s.length),A=A.insert(F,{link:n});else if(D.ALLOWED_TAGS.includes("img")&&i&&"file"===i.kind&&i.type.match(/^image\//i)){var T=i.getAsFile(),S=new FileReader;S.onload=function(e){t.quill.insertEmbed(s.index,"image",e.target.result),t.keepSelection||t.quill.setSelection(s.index+1);},S.readAsDataURL(T);}else A=A.insert(F);this.quill.updateContents(A,r.a.sources.USER),A=this.convert(F),this.keepSelection?this.quill.setSelection(s.index,A.length(),r.a.sources.SILENT):this.quill.setSelection(s.index+A.length(),r.a.sources.SILENT),this.quill.scrollIntoView(),a.a.removeAllHooks();}},{key:"getDOMPurifyOptions",value:function(){var e,t,n={};if(null!==(e=this.allowed)&&void 0!==e&&e.tags&&(n.ALLOWED_TAGS=this.allowed.tags),null!==(t=this.allowed)&&void 0!==t&&t.attributes&&(n.ALLOWED_ATTR=this.allowed.attributes),void 0===n.ALLOWED_TAGS||void 0===n.ALLOWED_ATTR){var o,r=!1;void 0===n.ALLOWED_TAGS&&(r=!0,n.ALLOWED_TAGS=["p","br","span"]);var i=!1;void 0===n.ALLOWED_ATTR&&(i=!0,n.ALLOWED_ATTR=["class"]);var a=this.quill.getModule("toolbar");null==a||null===(o=a.controls)||void 0===o||o.forEach((function(e){switch(e[0]){case"bold":r&&(n.ALLOWED_TAGS.push("b"),n.ALLOWED_TAGS.push("strong"));break;case"italic":r&&(n.ALLOWED_TAGS.push("i"),n.ALLOWED_TAGS.push("em"));break;case"underline":r&&n.ALLOWED_TAGS.push("u");break;case"strike":r&&n.ALLOWED_TAGS.push("s");break;case"color":case"background":i&&n.ALLOWED_ATTR.push("style");break;case"script":r&&("super"===e[1].value?n.ALLOWED_TAGS.push("sup"):"sub"===e[1].value&&n.ALLOWED_TAGS.push("sub"));break;case"header":if(r){var t=function(e){"1"===e?n.ALLOWED_TAGS.push("h1"):"2"===e?n.ALLOWED_TAGS.push("h2"):"3"===e?n.ALLOWED_TAGS.push("h3"):"4"===e?n.ALLOWED_TAGS.push("h4"):"5"===e?n.ALLOWED_TAGS.push("h5"):"6"===e&&n.ALLOWED_TAGS.push("h6");};e[1].value?t(e[1].value):e[1].options&&e[1].options.length&&[].forEach.call(e[1].options,(function(e){e.value&&t(e.value);}));}break;case"code-block":r&&n.ALLOWED_TAGS.push("pre"),i&&n.ALLOWED_ATTR.push("spellcheck");break;case"list":r&&("ordered"===e[1].value?n.ALLOWED_TAGS.push("ol"):"bullet"===e[1].value&&n.ALLOWED_TAGS.push("ul"),n.ALLOWED_TAGS.push("li"));break;case"link":r&&n.ALLOWED_TAGS.push("a"),i&&(n.ALLOWED_ATTR.push("href"),n.ALLOWED_ATTR.push("target"),n.ALLOWED_ATTR.push("rel"));break;case"image":r&&n.ALLOWED_TAGS.push("img"),i&&(n.ALLOWED_ATTR.push("src"),n.ALLOWED_ATTR.push("title"),n.ALLOWED_ATTR.push("alt"));break;case"video":r&&n.ALLOWED_TAGS.push("iframe"),i&&(n.ALLOWED_ATTR.push("frameborder"),n.ALLOWED_ATTR.push("allowfullscreen"),n.ALLOWED_ATTR.push("src"));break;case"blockquote":r&&n.ALLOWED_TAGS.push(e[0]);}}));}return n}},{key:"substitute",value:function(e,t){var n,o=["h1","h2","h3","h4","h5","h6"],r=["p","div","section","article","fieldset","address","aside","blockquote","canvas","dl","figcaption","figure","footer","form","header","main","nav","noscript","ol","pre","table","tfoot","ul","video"],i=["li","dt","dd","hr"];a.a.addHook("uponSanitizeElement",(function(e,a,u){for(var l=0;!n&&l<3;)t.ALLOWED_TAGS.includes(r[l])&&(n=r[l]),++l;if(n&&e.tagName&&!t.ALLOWED_TAGS.includes(e.tagName.toLowerCase())){var s=e.tagName.toLowerCase();o.includes(s)?e.innerHTML="<".concat(n,"><b>").concat(e.innerHTML,"</b></").concat(n,">"):r.includes(s)?e.innerHTML="<".concat(n,">").concat(e.innerHTML,"</").concat(n,">"):i.includes(s)&&(e.innerHTML="".concat(e.innerHTML,"<br>"));}})),e=a.a.sanitize(e,s(s({},t),{RETURN_DOM:!0,WHOLE_DOCUMENT:!1})),a.a.removeAllHooks();var u,l=0,c=document.createElement("body");return function e(t,n){for(n(t,l),t=l<=1?t.firstChild:void 0;t;)++l,e(t,n),t=t.nextSibling;--l;}(e,(function(e,t){if(1===t)if(e.tagName&&r.includes(e.tagName.toLowerCase())){u&&(u=void 0);var o=document.createElement(e.tagName.toLowerCase());o.innerHTML=e.innerHTML,c.appendChild(o);}else if(void 0===u&&(u=document.createElement(n),c.appendChild(u)),e.tagName){var i=document.createElement(e.tagName.toLowerCase()),a=e.attributes;a.length&&Array.from(a).forEach((function(e){return i.setAttribute(e.nodeName,e.value)})),e.innerHTML&&(i.innerHTML=e.innerHTML),u.appendChild(i);}else {var l=document.createTextNode(e.textContent);u.appendChild(l);}})),c}},{key:"isURL",value:function(e){return !!/^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\x2D?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\x2D?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:(?![\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S])*)?$/i.test(e)}}])&&f(t.prototype,n),u}(y);r.a.register("modules/clipboard",b,!0),t.default=b;}])}));
    });

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})();
//# sourceMappingURL=main.js.map
