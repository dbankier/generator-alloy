'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var JaltGenerator = module.exports = function JaltGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JaltGenerator, yeoman.generators.Base);

JaltGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [{
    name: 'appName',
    message: 'Enter the application name:',
    default: 'Test App'
  },{
    name: 'appId',
    message: 'Enter the application id:',
    default: 'yy.test'
  }];

  this.prompt(prompts, function (props) {
    this.appId = props.appId;
    this.appName = props.appName;
    this.appGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}); // GUID one-liner: http://stackoverflow.com/a/2117523

    cb();
  }.bind(this));
};

JaltGenerator.prototype.app = function app() {
  this.directory("./jalt","./")
  this.copy("_package.json","package.json")
  this.copy("_tiapp.xml","tiapp.xml")
};

JaltGenerator.prototype.projectfiles = function projectfiles() {
};
