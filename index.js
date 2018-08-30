'use strict';

const ejs = require('ejs');
const path = require('path');

const renderFile = module.exports = function (file, options, fn) {

    if (!options.blocks) {
        let blocks = {
            'scripts': new Block,
            'stylesheets': new Block
        };
        options.blocks = blocks;
        options.scripts = blocks.scripts;
        options.stylesheets = blocks.stylesheets;
        options.block = block.bind(blocks);
        options.stylesheet = stylesheet.bind(blocks.stylesheets);
        options.script = script.bind(blocks.scripts);
    }
    options.layout = layout.bind(options);

    ejs.renderFile(file, options, function (err, html) {
        if (err) {
            return fn(err, html);
        }
        let layout = options._layoutFile;
        if (!layout) {
            return fn(null, html);
        }
        delete options._layoutFile;

        let engine = options.settings['view engine'] || 'ejs';
        let desiredExt = '.' + engine;
        if (layout === true) {
            layout = path.sep + 'layout' + desiredExt;
        }
        if (path.extname(layout) !== desiredExt) {
            layout += desiredExt;
        }
        if (layout.length > 0 && layout[0] === path.sep) {
            layout = path.join(options.settings.views, layout.slice(1));
        } else {
            layout = path.resolve(path.dirname(file), layout);
        }
        options.body = html;
        renderFile(layout, options, fn);
    });
};

function layout (view) {
    this._layoutFile = view;
}

function block (name, html) {
    let blk = this[name];
    if (!blk) {
        blk = this[name] = new Block();
    }
    if (html) {
        blk.append(html);
    }
    return blk;
}

function script (path, type) {
    if (path) {
        this.append('<script src="' + path + '"' + (type ? 'type="' + type + '"' : '') + '></script>');
    }
    return this;
}

function stylesheet (path, media) {
    if (path) {
        this.append('<link rel="stylesheet" href="' + path + '"' + (media ? 'media="' + media + '"' : '') + ' />');
    }
    return this;
}

function Block () {
    this.html = [];
}

Object.assign(Block.prototype, {
    toString: function () {
        return this.html.join('\n');
    },
    append: function (more) {
        this.html.push(more);
    },
    prepend: function (more) {
        this.html.unshift(more);
    },
    replace: function (instead) {
        this.html = [instead];
    }
});