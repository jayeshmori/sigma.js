;(function(undefined) {
    'use strict';

    if (typeof sigma === 'undefined')
        throw 'sigma is not declared';

    // initialize the package
    sigma.utils.pkg('sigma.settings');


    var settings = {

        /**
         * SELECT PLUGIN SETTINGS:
         * **********************
         */
        defaultSelectedNodeBorderColor: 'rgba(0,204,255,1)',
        //defaultSelectedNodeBorderColor: 'rgba(255,0,0,1.4)',
        // {string} Indicates how to choose the node selected color. Available values:
        //          "node", "default"
        selectedNodeBorderColor: 'default', // node or default as a value

        defaultSelectedNodeBorderSize: 5,
        // {string} Indicates how to choose the node selected color. Available values:
        //          "node", "default"
        selectedNodeBorderSize: 'default',

        defaultSelectedEdgeBorderColor: 'rgba(0,204,255,0.4)',
        // {string} Indicates how to choose the edge selected color. Available values:
        //          "edge", "default"
        selectedEdgeBorderColor: 'default', // node or default as a value

        defaultSelectedEdgeBorderSize: 5,

        selectedEdgeBorderSize: 'default'

        /**
         * NODE RENDERING SETTINGS:
         * **********************
         */

    };

    sigma.settings = sigma.utils.extend(sigma.settings || {}, settings);
})(this);
