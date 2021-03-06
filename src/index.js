// Module Interface
// -----------

// The code contained herein is all example code and shouldn't be used verbatim.
// The example in this case is modified from the mimosa-minify module.
"use strict";

// Pulling in the <a href="./config.html">configuration management</a> code that is a
// part of the module.
var config = require('./config')
  , logger = null;

// The registration function is the key part of your module.  This function is called
// during Mimosa's startup and it allows your module to bind to one or many steps
// in a Mimosa's workflow.
//
// The arguments passed in are:
//
// 1. mimosaConfig: The full mimosa-config including added flags to indicate what
// sort of Mimosa command is being run and an added list of extensions being used by the
// application. You may decide based on the flags in the config to not register anything,
// which is fine. In the case of the minification example, if the isMinify flag isn't
// turned on then the minification module code isn't registered.
// 2. A register callback function which is used to inform what module function to call
// and under what circumstances to call it.
//
// The register function takes 4 parameters:
//
// 1. workflow types, an array of strings. Pick one-to-many types depending on the
// sort of task your module accomplishes. Possible values: preBuild, buildFile,
// buildExtension, postBuild, add, update, remove, preClean, cleanFile and postClean.
// 2. workflow step, a string. A workflow step for the selected workflow types.  For
// example, for the type 'update', you might choose to have your module code executed
// 'afterCompile', which makes sense for this example.  To help you figure out which
// step you might want to use, visit the <a href="http://mimosa.io/extend.html">Extend</a>
// page on the website.
// 3. The callback function.  The code to be executed during a Mimosa workflow.
// 4. An optional array of extensions upon which to execute the callback. If the file or
// extension being processed doesn't match one of these extensions, the callback will
// not be executed. The extensions refer to the original extension of the file being
// processed, so 'coffee' for instance. The mimosaConfig object has an extensions object
// you can use to cover all of the desired extensions.  The extensions object has
// 4 properties: javascript, css, template, and copy. In the case of this example,
// javascript minification, you would want to use the extensions available in
// mimosaConfig.extensions.javascript so that your module would apply to all possible
// JavaScript variations. If no extensions are provided, Mimosa will send all files
// through the module.

var registration = function(mimosaConfig, register) {
  if (config.isMinify) {

    // Pull the logger out for future use
    logger = mimosaConfig.log;

    var e = mimosaConfig.extensions;
    var slice = [].slice;
    register(['add', 'update', 'buildFile'], 'afterCompile', _minifyJS, slice.call(e.javascript));
    register(['add', 'update', 'buildExtension'], 'beforeWrite', _minifyJS, slice.call(e.template));
  }
};

// The _minifyJS function here represents your workflow callback function.  This function will be called
// during the workflow type and step you selected, if the file/extension being processed matches
// the registered extensions.  So given the example registration above, the _minifyJS function
// would be called after a JavaScript file is updated, during the 'afterCompile' step.  The 'compile' step is
// where, for instance, CoffeeScript is compiled to JavaScript, and you wouldn't want to minify CoffeeScript,
// so 'afterCompile' is appropriate.
//
// Your workflow callback is handed 3 arguments:
//
// 1. mimosaConfig: full mimosa-config enriched with all sorts of useful data beyond the default mimosa-config.
// 2. options: contains information about the asset(s) currently being processed.  Inside the options
// object is a 'files' array that is created early in the workflow. The array contains a list of file
// objects that are being processed. At different steps of the Mimosa workflow, those file objects are
// populated with the inputFileName, the outputFileName, the inputFileText, the outputFileText and some
// flags to indicate if the asset is a vendor asset, etc. The outputFileText is populated during the
// 'compile' step, so in the case of this example code, we'd want to run minification over each file in the
// files array, transforming the outputFileText to minified outputFileText.
// 3. next: a workflow callback. This callback must be called when your module has finished processing.  It
// tells Mimosa to execute the next step in the workflow.

var _minifyJS = function(mimosaConfig, options, next) {
  options.files.forEach(function(file) {
    file.outputFileText = minify(file.outputFileText);
  });
  next();
};

// The registerCommand function is used to register new Mimosa commands. If this function is implemented
// Mimosa will call it during startup so the module has an opportunity to respond to the command line.
//
// registerCommand is passed 2 arguments:
//
// 1. program, a commander.js program object, read more here: http://visionmedia.github.com/commander.js/
// Use this object to create a command, the flags for it, any input values, the help text and the callback
// for the command.
// 2. logger, a copy of Mimosa's logger
// 3. retrieveConfig, a function, use retrieveConfig to have Mimosa execute a build and get the mimosa-config
// before a module's code is executed.  retrieveConfig takes two parameters, the first is an object to which
// can include build flags. buildFirst forces Mimosa to run a build before the command is executed.  mdebug
// will force mimosa to run in debug mode.  You can also pass a run profile via the ops.
// Ex: opts.profile = "profile-name". The second retrieveConfig parameter is a callback that should contain the
// module's functionality.  That callback is passed the mimosa-config.

var registerCommand = function(program, logger, retrieveConfig) {
  program.command("foo")
    .description("Do something fooey")
    .action(function() {

      var opts = {
        buildFirst: false,
        mdebug: false;
      };

      retrieveConfig( opts, function( mimosaConfig ) {
        // Here is where your module's functionality would be executed
      });
    });
};

// The module.exports exposes module code to Mimosa.  The properties that
// are exported are Mimosa's hook to your module.  Mimosa will attempt
// to access functions that are placed into this exports matching these names:
//
// 1. registration: This function is called to bind your module to a Mimosa workflow.
// 2. registerCommand: This function is called to create a new Mimosa command.
// 3. defaults: This function is called to access the default configuration for your module.
// See <a href="./config.html">config.js</a>.
// 4. validate: This function is called during Mimosa's startup to validate the mimosa-config.
// This is your module's opportunity to ensure the configuration it will be given later is
// valid. See <a href="./config.html">config.js</a>.
//
// Any other functions exported will be ignored by Mimosa, but may be useful to you if you have
// multiple modules that need to talk to one another.

module.exports = {
  registration: registration,
  registerCommand: registerCommand,
  defaults: config.defaults,
  validate: config.validate
};
