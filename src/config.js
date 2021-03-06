// Module Configuration
// -----------

// The code contained herein is all example code and shouldn't be used verbatim.
// The example in this case is modified from the mimosa-minify module.

"use strict";

// The defaults function should return a JSON object containing the default
// config for your module. If your module has no config, the function can be
// removed or return null. Mimosa uses this function when applying default
// configuration to a user's config.

exports.defaults = function() {
  return {
    minify: {
      exclude: [/\.min\./]
    }
  };
};

// The validate function takes a config object (which is the entire
// mimosa-config) and a validators object which contains several useful
// validation methods. Using custom validation and validation provided
// via the validators, the validate method should find the module specific
// config, validate the settings and return a list of strings that are
// validation error messages. If there are no errors, return an empty
// array or return nothing.  Mimosa uses this function when Mimosa starts
// up to ensure the configuration has been set properly.

exports.validate = function(config, validators) {
  var errors = [];
  if (validators.ifExistsIsObject(errors, "minify config", config.minify)) {
    if (validators.ifExistsIsArray(errors, "minify.exclude", config.minify.exclude)) {
      var exls = config.minify.exclude;
      for (var _i = 0, _len = exls.length; _i < _len; _i++) {
        var ex = exls[_i];
        if (typeof ex !== "string") {
          errors.push("minify.exclude must be an array of strings");
          break;
        }
      }
    }
  }

  // The validate function is also an opportunity to do configuration massaging,
  // for instance, turning a list of strings into a single RegExp.  Changes
  // made to the config inside validate are permament and carried throughout
  // the currently running Mimosa process.

  if (errors.length === 0 && config.minify.exclude && config.minify.exclude.length > 0) {
    config.minify.exclude = new RegExp(config.minify.exclude.join("|"), "i");
  }

  return errors;
};

