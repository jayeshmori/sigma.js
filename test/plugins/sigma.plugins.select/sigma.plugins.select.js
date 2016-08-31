module.exports = function(sigma) {
    'use strict';

    if (typeof sigma === 'undefined')
        throw 'sigma is not declared';

    // Initialize package:
    sigma.utils.pkg('sigma.plugins');

    var
        _instance = {}, // stores all instances of the plug-in by sigma instance id
        _body = undefined;

    /**
     * Selection Plug-in
     * @param s
     * @constructor
     */

    function Select(s, sel){
        sigma.classes.dispatcher.extend(this);
        var
            self = this,
            renderer = s.renderers[0],
            _dragFlag = false,
            _keyboard = null;

        /**
         * Utility function to make the difference between two arrays.
         * See https://github.com/lodash/lodash/blob/master/lodash.js#L1627
         *
         * @param  {array} array  The array to inspect.
         * @param  {array} values The values to exclude.
         * @return {array}        Returns the new array of filtered values.
         */
        function difference(array, values) {
            var length = array ? array.length : 0;
            if (!length) {
                return [];
            }
            var index = -1,
                result = [],
                valuesLength = values.length;

            outer:
                while (++index < length) {
                    var value = array[index];

                    if (value === value) {
                        var valuesIndex = valuesLength;
                        while (valuesIndex--) {
                            if (values[valuesIndex] === value) {
                                continue outer;
                            }
                        }
                        result.push(value);
                    }
                    else if (values.indexOf(value) < 0) {
                        result.push(value);
                    }
                }
            return result;
        }


        this.clickNodesHandler = function(e){

            // dragging - not click
            if(_dragFlag) return;

            var clicked = e.data.node.map(function(n) {
                return n.id;
            });

            // deselect all edges
            sel.dropEdge();

            var selectedNodes = sel.getNodes().map(function(n){
                return n.id;
            });

            var targets = difference(clicked, selectedNodes);

            // shift + clicking a selected node = deselect the node
            if(e.data.captor.shiftKey){
                var dropTargets = difference(clicked, targets);
                sel.dropNode(dropTargets);
            }

            if(targets.length > 0){

                // shift + clicking a new node = add to selection
                if(e.data.captor.shiftKey){

                    sel.addNode(targets);
                }
                else {
                    // clicking a new node = drop existing selection and select new node
                    sel.dropNode();
                    sel.addNode(targets);
                }
            }
            else {
                e.data.node.map(function(n) {
                    if(n.selected)
                        sel.dropNode(n.id);
                });
            }
            s.refresh({skipIndexation: true});
        }

        this.clickEdgesHandler = function(e){

            // dragging - not click
            if(_dragFlag) return;

            var clicked = e.data.edge.map(function(e) {
                return e.id;
            });

            // deselect all nodes
            sel.dropNode();

            var selectedEdges = sel.getEdges().map(function(e){
                return e.id;
            })

            var targets = difference(clicked, selectedEdges);

            // shift + clicking a selected node = deselect the node
            if(e.data.captor.shiftKey){
                var dropTargets = difference(clicked, targets);
                sel.dropEdge(dropTargets);
            }

            if(targets.length > 0){

                // shift + clicking a new node = add to selection
                if(e.data.captor.shiftKey){

                    sel.addEdge(targets);
                }
                else {
                    // clicking a new node = drop existing selection and select new node
                    sel.dropEdge();
                    sel.addEdge(targets);
                }
            }
            else {
                e.data.edge.map(function(e) {
                    if(e.selected)
                        sel.dropEdge(e.id);
                    // n.selected = !n.selected;
                });
            }
            s.refresh({skipIndexation: true});

        }

        this.bindKeyboard = function(keyboard){
            if (!keyboard) throw new Error('Missing parameter: "keyboard"');
            _keyboard = keyboard;
            _keyboard.bind('32+65 18+32+65', selectAllNodes);
            _keyboard.bind('32+68 18+32+85', deselectAllNodes);
            return this;
        }

        s.bind('clickNodes', this.clickNodesHandler);
        s.bind('clickEdges', this.clickEdgesHandler);


        function selectAllNodes(){
            sel.addNode();
            s.refresh({skipIndexation: true});
        }

        function deselectAllNodes(){
            sel.dropNode();
            sel.dropNode();
            s.refresh({skipIndexation: true});
        }

        /**
         * Detect drag event by listening to mousedown, mouseup and mousemove events.
         */

        renderer.container.lastChild.addEventListener('mousedown', mouseDown);
        renderer.container.lastChild.addEventListener('mouseup', mouseUp);

        function mouseDown(){
            _dragFlag = false;
            renderer.container.lastChild.addEventListener('mousemove', mouseMove);
        }

        function mouseUp(){
            _dragFlag = false;
            renderer.container.lastChild.removeEventListener('mousemove', mouseMove);
        }

        function mouseMove(){
            _dragFlag = true;
        }

        //TODO: finish this function and unbind all events to avoid memory leaks
        this.clear = function(){
            // unbind all events
            s.unbind('clickNodes', self.clickNodesHandler);
            s.unbind('clickEdges', self.clickEdgesHandler);

            // detach mouse events
            renderer.container.lastChild.removeEventListener('mousedown',mouseDown);
            renderer.container.lastChild.removeEventListener('mouseup',mouseUp);

            //unbind keyboard
            if(_keyboard){
                _keyboard.unbind('32+65 18+32+65', selectAllNodes);
                _keyboard.unbind('32+68 18+32+85', deselectAllNodes);
                _keyboard = null;
            }

            renderer = null;
        }
    }


    /**
     * Interface
     * ------------------
     */

    /**
     * This plugin enables the activation of nodes and edges by clicking on them
     * (i.e. selection). Multiple nodes or edges may be activated by holding the
     * Ctrl or Meta key while clicking on them (i.e. multi selection).
     *
     * @param  {sigma}                     s The related sigma instance.
     * @param  {sigma.plugins.activeState} a The activeState plugin instance.
     * @param  {?renderer}                 renderer The related renderer instance.
     *                                              Default value: s.renderers[0].
     */
    sigma.plugins.select = function(sigmaInstace, selectionInstance) {
        // Create object if undefined
        if (!_instance[sigmaInstace.id]) {
            _instance[sigmaInstace.id] = new Select(sigmaInstace, selectionInstance);

            sigmaInstace.bind('kill', function() {
                sigma.plugins.killSelect(sigmaInstace);
            });
        }
        return _instance[sigmaInstace.id];
    };

    /**
     *  This function kills the select instance.
     *
     * @param  {sigma} s The related sigma instance.
     */
    sigma.plugins.killSelect = function(s) {
        if (_instance[s.id] instanceof Select) {
            _instance[s.id].clear();
            delete _instance[s.id];
        }
    };
};
