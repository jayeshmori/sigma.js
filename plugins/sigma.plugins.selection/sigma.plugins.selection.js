//TODO: Write test cases with QUNIT

(function (undefined) {
    'use strict';

    if (typeof sigma === 'undefined')
        throw 'sigma is not declared';

    // Initialize package:
    sigma.utils.pkg('sigma.plugins');

    var
        _instance = null,
        _graph = null,
        _selectedNodes,
        _selectedEdges,
        _selectedNodesCount,
        _selectedEdgesCount,
        _sigmaInstance;

    function setDefaults() {
        _selectedNodes = Object.create(null);
        _selectedEdges = Object.create(null);
        _selectedNodesCount = 0;
        _selectedEdgesCount = 0;
    }

    setDefaults();
    /**
     *  Keep the indexes up to date as the graph is being updated
     */

    function triggerNodeSelectEvent() {
        if (_instance != null) {
            _instance.dispatchEvent('selectNodes');
        }
    }

    function triggerEdgeSelectEvent() {
        if (_instance != null) {
            _instance.dispatchEvent('selectEdges');
        }
    }


    // keep the indexes up-to-date with sigma events

    sigma.classes.graph.attachBefore('clear', 'sigma.plugins.selection.clear', function () {
         setDefaults();
    });

    sigma.classes.graph.attach('addNode', 'sigma.plugins.selection.addNode', function (n) {
        if (n.selected) {
            _selectedNodes[n.id] = this.nodesIndex[n.id];
            _selectedNodesCount++;
            triggerNodeSelectEvent();
        }
    });

    sigma.classes.graph.attachBefore('dropNode', 'sigma.plugins.selection.dropNode', function (id) {
        if (this.nodesIndex[id] !== undefined && this.nodesIndex[id].selected) {
            delete _selectedNodes[id]
            _selectedNodesCount--;
            triggerNodeSelectEvent();
        }
    });

    sigma.classes.graph.attach('addEdge', 'sigma.plugins.selection.addEdge', function (e) {
        if (e.selected) {
            _selectedEdges[e.id] = this.edgesIndex[e.id];
            _selectedEdgesCount++;
            triggerEdgeSelectEvent();
        }
    });

    sigma.classes.graph.attachBefore('dropEdge', 'sigma.plugins.selection.dropEdge', function (id) {
        if (this.edgesIndex[id] !== undefined && this.edgesIndex[id].selected) {
            delete _selectedEdges[n.id]
            _selectedEdgesCount--;
            triggerEdgeSelectEvent();
        }
    });


    /**
     * Selection Plug-in
     * @param s
     * @constructor
     */

    function Selection(s) {
        _sigmaInstance = s;
        // attach event dispatcher
        sigma.classes.dispatcher.extend(this);

        _instance = this;
        _graph = _sigmaInstance.graph;

        // only initialize if not already, otherwise will loose all selections
        if (_selectedNodes === null) {
            _selectedNodes = Object.create(null);
            _selectedNodesCount = 0;
        }

        if (_selectedEdges === null) {
            _selectedEdges = Object.create(null);
            _selectedEdgesCount = 0;
        }

        // restore selection for existing graph
        _graph.nodes().forEach(function (n) {
            if (n.selected) {
                _selectedNodes[n.id] = n;
                _selectedNodesCount++;
            }
        });

        _graph.edges().forEach(function (e) {
            if (e.selected) {
                _selectedEdges[e.id] = e;
                _selectedEdgesCount++;
            }
        });

        // kill instance when Sigma is killed
        _sigmaInstance.bind('kill', function () {
            _instance.kill();
        });
    }

    Selection.prototype.kill = function() {
        this.unbind();
        _selectedNodes = null;
        _selectedEdges = null;
        _selectedNodesCount = 0;
        _selectedEdgesCount = 0;
        _graph = null;
        _instance = null;
    };

    /**
     * Add edge(s) to selection.
     * @param n
     */

    Selection.prototype.addEdge = function (eid) {

        if (arguments.length > 1) {
            throw new TypeError('Too many arguments.');
        }
        else if (typeof eid === 'string' || typeof eid === 'number') {
            var edge = _graph.edges(eid);
            edge.selected = true;
            _selectedEdges[eid] = edge;
        }
        else if (Array.isArray(eid)) {
            eid.forEach(function (oid) {
                var edge = _graph.edges(oid);
                edge.selected = true;
                _selectedEdges[oid] = edge;
            });
        }
        else if (!eid) {
            // select all nodes
            _graph.edges().forEach(function (o) {
                o.selected = true;
                _selectedEdges[o.id] = o;
            });
        }

        var _oldCount = _selectedEdgesCount;
        _selectedEdgesCount = Object.keys(_selectedEdges).length;

        if (_oldCount != _selectedEdgesCount) {
            triggerEdgeSelectEvent();
        }
        return this;
    }

    /**
     * Drop edges from selection.
     * @param n
     */

    Selection.prototype.dropEdge = function (eid) {

        if (arguments.length > 1) {
            throw new TypeError('Too many arguments.');
        }
        else if (typeof eid === 'string' || typeof eid === 'number') {
            var edge = _graph.edges(eid);
            edge.selected = false;
            delete _selectedEdges[eid];
        }
        else if (Array.isArray(eid)) {
            eid.forEach(function (oid) {
                var edge = _graph.edges(oid);
                edge.selected = false;
                delete _selectedEdges[oid];
            });
        }
        else if (!eid) {
            // select all nodes
            _graph.edges().forEach(function (o) {
                o.selected = false;
                delete _selectedEdges[o.id];
            });
        }

        var _oldCount = _selectedEdgesCount;
        _selectedEdgesCount = Object.keys(_selectedEdges).length;

        if (_oldCount != _selectedEdgesCount) {
            triggerEdgeSelectEvent();
        }

        return this;
    }

    /**
     * Add node(s) to selection.
     */

    Selection.prototype.addNode = function (nid) {

        if (arguments.length > 1) {
            throw new TypeError('Too many arguments.');
        }
        else if (typeof nid === 'string' || typeof nid === 'number') {
            var node = _graph.nodes(nid);
            node.selected = true;
            _selectedNodes[nid] = node;
        }
        else if (Array.isArray(nid)) {
            nid.forEach(function (oid) {
                var node = _graph.nodes(oid);
                if(!node.selected){
                    node.selected = true;
                    _selectedNodes[oid] = node;
                }
                else{
                    node.selected = false;
                    delete _selectedNodes[oid];
                }
            });
        }
        else if (!nid) {
            // select all nodes
            _graph.nodes().forEach(function (o) {
                o.selected = true;
                _selectedNodes[o.id] = o;
            });
        }

        var _oldCount = _selectedNodesCount;
        _selectedNodesCount = Object.keys(_selectedNodes).length;

        if (_oldCount != _selectedNodesCount) {
            triggerNodeSelectEvent();
        }
        return this;
    }

    /**
     *
     * @param n
     */
    Selection.prototype.dropNode = function (nid) {

        if (arguments.length > 1) {
            throw new TypeError('Too many arguments.');
        }
        else if (typeof nid === 'string' || typeof nid === 'number') {
            var node = _sigmaInstance.graph.nodes(nid);
            node.selected = false;
            delete _selectedNodes[nid];
        }
        else if (Array.isArray(nid)) {
            var nodes = _sigmaInstance.graph.nodes(nid);
            nodes.forEach(function (node) {
                node.selected = false;
                delete _selectedNodes[node.id];
            });
        }
        else if (!nid) {
            // select all nodes
            _sigmaInstance.graph.nodes().forEach(function (o) {
                o.selected = false;
                delete _selectedNodes[o.id];
            });
        }

        var _oldCount = _selectedNodesCount;
        _selectedNodesCount = Object.keys(_selectedNodes).length;

        //TODO: pass selected nodes to the selection event
        if (_oldCount != _selectedNodesCount) {
            triggerNodeSelectEvent(_instance);
        }

        return this;
    }

    Selection.prototype.selectDeselectNodes = function(nodeId) {
        var node = _graph.nodes(nodeId);
        if(_selectedNodes[nodeId]!=undefined && _selectedNodes[nodeId].selected==true) {
            node.selected = false;
            delete  _selectedNodes[nodeId];
        } else {
            node.selected = true;
            _selectedNodes[nodeId] = node;
        }
        return node.selected;
    }

    /**
     * Get all selected nodes
     */
    Selection.prototype.getNodes = function () {
        // create copy of the array as it is pass by ref
        var id, arr = [];
        for (id in _selectedNodes) {
            arr.push(_selectedNodes[id]);
        }
        return arr;
    }

    /**
     * Get all selected edges
     */
    Selection.prototype.getEdges = function () {
        // create copy of the array as it is pass by ref
        var id, arr = [];
        for (id in _selectedEdges) {
            arr.push(_selectedEdges[id]);
        }
        return arr;
    }

    /**
     * Get selected nodes count
     */
    Selection.prototype.getNodesCount = function () {
        var nodeCount;
        nodeCount = _selectedNodesCount;
        return nodeCount;
    }

    /**
     * Get selected edges count
     */
    Selection.prototype.getEdgesCount = function () {
        var edgeCount;
        edgeCount = _selectedEdgesCount;
        return edgeCount;
    }

    /**
     * invert selection
     */
    Selection.prototype.invertSelection = function() {
        _graph.nodes().forEach(function(o) {
            if (_selectedNodes[o.id]!=undefined && _selectedNodes[o.id].selected==true) {
                o.selected = false;
                delete _selectedNodes[o.id];
            } else {
                o.selected = true;
                _selectedNodes[o.id] = o;
            }
        });
    };

    /**
     * Interface
     * ------------------
     */

    /**
     * This plugin maintains the selection index of nodes and edges.
     *
     * @param  {sigma}                     s The related sigma instance.
     */
    sigma.plugins.selection = function (s) {
        // Create object if undefined
        if (!_instance) {
            _instance = new Selection(s);
        }
        return _instance;
    };

    /**
     *  This function kills the selection instance.
     *
     */
    sigma.plugins.killSelection = function () {
        if (_instance instanceof Selection) {
            _instance.kill();
            _instance = null;
        }
    };

}).call(this);
