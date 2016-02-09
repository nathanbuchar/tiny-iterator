/**
 * @fileoverview Iterator singleton definition.
 * @author Nathan Buchar
 */

'use strict';

module.exports = (function () {

  function noop() {}

  let internals = {

    /**
     * The array of items the user wishes to iterate through.
     *
     * @type {Array}
     * @private
     */
    items: null,

    /**
     * The intermediate function that all items will pass through.
     *
     * @type {Function}
     * @private
     */
    fn: null,

    /**
     * The callback function that will be called when all items have been
     * iterated through
     *
     * @type {Function}
     * @private
     */
    done: null,

    /**
     * Whether or not we have aborted the iterator. This helps ensure that we
     * don't continue to iterate if the user has implemented the "next" method
     * incorrectly. For example, if they write a next.abort() without returning
     * followed by a next(). No good.
     *
     * @type {boolean}
     * @private
     */
    isAborted: false,

    /**
     * Calls the intermediary function with the item at the current index. This
     * method is called recursively with incrementing indeces.
     *
     * @param {number} i
     * @private
     */
    iterate(i) {
      internals.fn(i, internals.items[i], internals.step(i));
    },

    /**
     * Wraps the public-facing next function. When the returned function is
     * called, we update the value of the current item, then iterate to the next
     * item if we haven't reached the end, otherwise call the finish method.
     *
     * @param {number} i
     * @returns {Function} next
     * @private
     */
    step(i) {
      next.abort = internals.abort(i);

      function next(newVal) {
        if (!internals.isAborted) {
          internals.updateVal(i++, newVal);

          if (i < internals.items.length) {
            internals.iterate(i);
          } else {
            internals.finish();
          }
        }
      }

      return next;
    },

    /**
     * Updates the value of the item and the given index.
     *
     * @param {number} i
     * @param {mixed} [newVal]
     * @private
     */
    updateVal(i, newVal) {
      if (typeof newVal !== 'undefined') {
        internals.items[i] = newVal;
      }
    },

    /**
     * Wraps the public-facing abort function. The returned function is called
     * when the user aborts the iteration.
     *
     * @param {number} i
     * @returns {Function} abort
     * @private
     */
    abort(i) {
      return function abort(newVal) {
        internals.isAborted = true;

        internals.updateVal(i, newVal);
        internals.finish();
      };
    },

    /**
     * Called when the iteration has finished naturally or was aborted. Calls
     * the done method.
     *
     * @private
     */
    finish() {
      internals.done(internals.items);
    },

    /**
     * Resets the internal references.
     *
     * @private
     */
    reset() {
      internals.items = null;
      internals.fn = null;
      internals.done = null;
      internals.isAborted = false;
    },

    /**
     * Validates that the items param is an array.
     *
     * @param {Array} items
     * @returns {Array} items
     * @throws
     */
    validateItemsParam(items) {
      if (!Array.isArray(items)) {
        throw new TypeError(
          '"items" must be an array. Got "' + typeof items + '"');
      }

      return items;
    },

    /**
     * Validates that the fn param is a function.
     *
     * @param {Function} fn
     * @returns {Function} fn
     * @throws
     */
    validateFnParam(fn) {
      if (typeof fn !== 'function') {
        throw new TypeError(
          '"fn" must be a function. Got "' + typeof fn + '"');
      }

      return fn;
    },

    /**
     * Validates that the done param is a function, if it exists.
     *
     * @param {Function} done
     * @returns {Function} done
     * @throws
     */
    validateDoneParam(done) {
      if (typeof done !== 'undefined') {
        if (typeof done !== 'function') {
          throw new TypeError(
            '"done" must be a function. Got "' + typeof done + '"');
        }

        return done;
      }

      return noop;
    }
  };

  return {

    /**
     * Public-facing iterate function. Calls the internal iterate method with
     * the chosen options.
     *
     * @param {Array} items - The array of items.
     * @param {Function} fn - The intermediate function.
     * @param {Function} [done] - The callback function.
     * @access public
     */
    iterate(items, fn, done) {
      internals.reset();

      internals.items = internals.validateItemsParam(items);
      internals.fn = internals.validateFnParam(fn);
      internals.done = internals.validateDoneParam(done);

      // Start the iteration process, starting at index 0.
      if (items.length) {
        internals.iterate(0);
      }
    }
  };
}());