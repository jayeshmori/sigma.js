module.exports = function(sigma) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.canvas.extremities');

  /**
   * The default renderer for hovered edge extremities. It renders the edge
   * extremities as hovered.
   *
   * @param  {object}                   edge         The edge object.
   * @param  {object}                   source node  The edge source node.
   * @param  {object}                   target node  The edge target node.
   * @param  {CanvasRenderingContext2D} context      The canvas context.
   * @param  {configurable}             settings     The settings function.
   */
  sigma.canvas.extremities.def =
    function(edge, source, target, context, settings) {
    // Source Node:
    // Guarding against cases where the source and target nodes were deleted.
    (
      sigma.canvas.hovers[source && source.type || null] ||
      sigma.canvas.hovers.def
    ) (
      source, context, settings
    );

    // Target Node:
    (
      sigma.canvas.hovers[target && target.type || null] ||
      sigma.canvas.hovers.def
    ) (
      target, context, settings
    );
  };
};
