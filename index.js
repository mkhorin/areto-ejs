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

function block (name, ...values) {
    let item = this[name];
    if (!Object.prototype.hasOwnProperty.call(this, name)) {
        item = this[name] = new Block;
    }
    if (values.length) {
        item.append(...values);
    }
    return item;
}

class Block {

    constructor () {
        this._data = [];
    }

    get () {
        return this._data;
    }

    append () {
        this._data.push(...arguments);
    }

    prepend () {
        this._data.unshift(...arguments);
    }

    replace () {
        this._data = [...arguments];
    }

    defaults () {
        if (!this._data.length) {
            this._data.push(...arguments);
        }
    }

    toString () {
        return this._data.join('\n');
    }
}