var fs = require('fs'),
    util = require('util'),
    merge = require('merge-recursive'),
	masterInstance = null;

/**
 *
 * @param {String} configDir
 * @constructor
 */
function ConfigLoader (configDir) {
    if (!fs.existsSync(configDir)) {
        throw new Error(util.format('Config directory %s does not exist', configDir));
    }
    this.configDir = configDir;
    this.finalOverrides = null;
    this.localConfigDir = this.configDir + '/local';
}

/**
 *
 * @param {String} configName
 * @return {Object}
 */
ConfigLoader.prototype.load = function load (configName) {
    var filename = util.format('%s/%s', this.configDir, configName),
        localFilename = util.format('%s/%s', this.localConfigDir, configName),
        config = require(filename),
        overrides = this.getFinalOverrides();

    // local config
	try {
		config = merge.recursive(config, require(localFilename));
	} catch (e) {}

    // local final override
    if (overrides.hasOwnProperty(configName)){
        config = merge.recursive(config, overrides[configName]);
    }

    return config;
};

/**
 *
 * @return {Object}
 */
ConfigLoader.prototype.getFinalOverrides = function () {
    var filename;

    if (!this.finalOverrides) {
        this.finalOverrides = {};
        filename = util.format('%s/config.json', this.localConfigDir);

        if (fs.existsSync(filename)) {
            this.finalOverrides = require(filename);
        }
    }

    return this.finalOverrides;
};

exports.ConfigLoader = ConfigLoader;

exports.create = function (configDir, registerAsMaster) {
	var loader = new ConfigLoader(configDir);
	if (registerAsMaster) {
		masterInstance = loader;
	}
	return loader;
};

exports.getMaster = function () {
	return masterInstance;
};