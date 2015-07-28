/*--------------------------------------------------------------------------*/
/*  Copyright (c) 2015 by Chris Brandsma                                    */
/*  License: MIT                                                            */
/*--------------------------------------------------------------------------*/

/** @typedef {object} callbackReturn
 * @function add Adds a callback function to the queue
 *   @property func {function}
 *   @return {callbackReturn}
 * @function fire Executes the callback functions asynchronously
 * @function fireSync Executes the callback functions synchronously
 * @function firePop Executes the callback functions synchronously and removes them
 * @function clear Removes all callback handlers
 * @property handlers {array} List of all callback handlers
 * @function ifNoHandlers Executes specified callback handler in case no other callback handlers exist.
 * @function chain Secondary callback to execute after this callback has been executed
 * @function unload Unloads callback and all callback functions
 *
 */

/**
 * Callback/Promise pattern.
 * @param owner Function execution context
 * @param propName {?string} Used to attach a named "add" function to the owner (optional)
 * @returns {callbackReturn}
 * @requires underscore or lodash
 */
jsu.callback = function(owner, propName) {
	var handlers = [];
	var ifEmptyFunc = null;
	var chainCallback = null;
	var exports = {
		fire: fire,
		firePop:firePop,
		add: add,
		clear: clear,
		setOwner: setOwner,
		fireSync: fireSync,
		handlers:handlers,
		ifNoHandlers:ifNoHandlers,
		chain: chain,
		unload: unload
	};

	if (propName) {
		owner[propName] = add;
	}

	return exports;

	/** Executes callback/promise asynchronously */
	function fire() {
		var args = arguments;
		setTimeout(function(){
			exec(args);
		},1);
	}

	/** Executes callback/promise synchronously */
	function fireSync(){
		var args = arguments;
		exec(args);
	}

	/** Executes each callback function and removes them (call once) */
	function firePop(){
		var args = arguments;
		setTimeout(function(){
			execPop(args);
		},1);
	}

	/** Calls, and removes, the first event handler in the handlers list */
	function execPop(args){
		if (!_.any(handlers) && _.isFunction(ifEmptyFunc)){
			ifEmptyFunc.apply(owner, args);
		}
		var f = handlers.pop();
		if (_.isFunction(f)) {
			f.apply(owner, args);
		}
	}

	/** Calls all event handlers in the handlers list */
	function exec(args){
		if (ufw.array.isEmpty(handlers) && _.isFunction(ifEmptyFunc)){
			ifEmptyFunc.apply(owner, args);
		}
		for(var i=0;i<handlers.length;i++) {
			var f = handlers[i];
			if (f){
				f.apply(owner, args);
			}
		}
		if (chainCallback && chainCallback.fire){
			chainCallback.fire(args);
		}
	}

	/** adds a callback handler to the queue */
	function add(func) {
		handlers.push(func);
		return owner;
	}

	/** removes all callback handlers */
	function clear(){
		handlers = [];
	}

	/** sets the execution context of the callback */
	function setOwner(o){
		owner = o;
	}

	/** Configures default callback handler in case there are no other handlers */
	function ifNoHandlers(func){
		ifEmptyFunc = func;
		return exports;
	}

	/** used to call another callback once the current callback has executed */
	function chain(cb){
		chainCallback = cb;
		return exports;
	}

	/** unloads callback, removes handlers */
	function unload(){
		handlers = [];
		owner[propName] = null;
		owner = null;
	}

};
