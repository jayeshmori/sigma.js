module.exports = function (sigma) {
    'use strict';

    sigma.utils.pkg('sigma.canvas.nodes');

    /**
     * The default node renderer. It renders the node as a simple disc.
     *
     * @param  {object}                   node     The node object.
     * @param  {CanvasRenderingContext2D} context  The canvas context.
     * @param  {configurable}             settings The settings function.
     */
    sigma.canvas.nodes.def = function (node, context, settings) {

        var
            prefix = settings('prefix') || '',
            size = node && node[prefix + 'size'] || 1,
            x = node && node[prefix + 'x'] || 0,
            y = node && node[prefix + 'y'] || 0,
            borderSize = node && node.border_size || settings('borderSize'),
            borderColor = node && node.border_color || settings('defaultNodeBorderColor');


        var selectedNodeBorderColor = settings('selectedNodeBorderColor') === 'node' ? node && node.selected_border_color || settings('defaultSelectedNodeBorderColor') : settings('defaultSelectedNodeBorderColor'),
            selectedNodeBorderSize = settings('selectedNodeBorderSize') === 'node' ? node && node.selected_border_size || settings('defaultSelectedNodeBorderSize') : settings('defaultSelectedNodeBorderSize');

        if (node && node.selected) {

            // selection border
            if (selectedNodeBorderSize > 0) {

                context.beginPath();
                context.fillStyle = selectedNodeBorderColor;
                context.arc(x, y, size + borderSize + selectedNodeBorderSize + 2, 0, Math.PI * 2, true);
                context.closePath();
                context.fill();

                context.beginPath();
                context.fillStyle = '#fff';
                context.arc(x, y, size + borderSize + 2 , 0, Math.PI * 2, true);
                context.closePath();
                context.fill();


            }

        }

        // normal border
        if (borderSize > 0) {
            context.beginPath();
            context.fillStyle = borderColor;
            context.arc(x, y, size + borderSize, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }

        context.fillStyle = node && node.color || settings('defaultNodeColor');
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();


        // node icons
        if (node && node.icon) {
            // if node size is smaller than icon size, don't draw
            if (size < node.icon.size) return;
            var font = node.icon.font || 'FontAwesome',
                fColor = node.icon.color || '#FFF',
                text = node.icon.text || '?',
                px = node.icon.x || 0.5,
                py = node.icon.y || 0.5,
                fontSize = Math.round(size * 0.8);

            context.save();
            context.fillStyle = fColor;
            context.font = '' + fontSize + 'px ' + font;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, x, y);
            context.restore();
        }

    };
};
