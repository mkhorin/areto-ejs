'use strict';

const ejs = require('ejs');
const path = require('path');

const renderFile = module.exports = function (file, options, fn) {

    if (!options.blocks) {
        const blocks = {
            scripts: new Block,
            stylesheets: new Block
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

        if (options._layoutOptions) {
            Object.assign(options, options._layoutOptions);
            delete options._layoutOptions;
        }
        const extension = '.' + (options.settings['view engine'] || 'ejs');
        if (path.extname(layout) !== extension) {
            layout += extension;
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

function layout (file, options) {
    this._layoutFile = file;
    this._layoutOptions = options;
}

function block (name, html, method = 'append') {
    let item = this[name];
    if (!Object.prototype.hasOwnProperty.call(this, name)) {
        item = this[name] = new Block;
    }
    if (html) {
        item[method](html);
    }
    return item;
}

function script (path, type) {
    if (path) {
        this.append('<script src="'+ path +'"'+ (type ? 'type="' + type + '"' : '')+ '></script>');
    }
    return this;
}

function stylesheet (path, media) {
    if (path) {
        this.append('<link rel="stylesheet" href="'+ path +'"'+ (media ? 'media="'+ media +'"' : '') +' />');
    }
    return this;
}

function Block () {
    this._data = [];
}

Object.assign(Block.prototype, {
    toString: function () {
        return this._data.join('\n');
    },
    append: function (value) {
        this._data.push(value);
    },
    prepend: function (value) {
        this._data.unshift(value);
    },
    replace: function (value) {
        this._data = [value];
    },
    get: function () {
        return this._data;
    },
    defaults: function (value) {
        if (!this._data.length) {
            this._data.push(value);
        }
    }
});