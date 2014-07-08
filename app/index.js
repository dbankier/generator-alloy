'use strict';
var util = require('util');
var path = require('path');
var fs   = require('fs');
var _ = require('underscore');
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
  },{
    type: 'confirm',
    name: 'jade',
    message: 'Would you like to include Jade for views?',
    default: true
  },{
    type: 'list',
    name: 'style',
    message: 'Which style engine would you like?',
    choices: ['stss', 'ltss', 'tss']
  },{
    type: 'confirm',
    name: 'coffee',
    message: 'Would you like to include coffeescript for controllers?',
    default: false
  }];

  this.prompt(prompts, function (props) {
    this.appId = props.appId;
    this.appName = props.appName;
    this.coffee = props.coffee;
    this.jade = props.jade;
    this.style = props.style;
    this.trackFiles = ['i18n/**'];
    this.builds = [];
    this.cleanFiles =['Resources/', 'build/'] 
    this.appGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}); // GUID one-liner: http://stackoverflow.com/a/2117523
    cb();
  }.bind(this));
};

JaltGenerator.prototype.app = function app() {
  var pkg = require("./templates/_package.json")
  this.copy("./jast/manifest","./manifest")
  this.copy("./jast/README.md","./README.md")
  this.copy("./jast/app/config.json","./app/config.json")
  this.copy("./jast/app/README","./app/README")
  this.mkdir("./app")
  this.mkdir("./spec")

  if (this.jade) {
    this.directory("./jast/app/views","./app/views");
    this.cleanFiles.push('app/views/**/*.xml');
    this.trackFiles.push('app/**/*.jade');
    this.builds.push('jade');
  } else {
    this.mkdir("./app/views");
    this.copy("./nonjast/index.xml", "./app/views/index.xml")
    delete pkg.devDependencies["grunt-contrib-jade"];
    this.trackFiles.push('app/**/*.xml');
  }
  if (this.style === "stss") { // stss
    this.directory("./jast/app/styles","./app/styles");
    this.cleanFiles.push('app/styles/**/*.tss');
    this.trackFiles.push('app/**/*.stss');
    this.builds.push('stss');
  } else if (this.style === "ltss") { //ltss
    this.cleanFiles.push('app/styles/**/*.tss');
    this.copy("./nonjast/index.ltss", "./app/styles/index.ltss")
    this.copy("./nonjast/bootstrap.ltss", "./app/styles/includes/bootstrap.ltss")
    this.trackFiles.push('app/**/*.ltss');
    delete pkg.devDependencies["grunt-stss"];
    pkg.devDependencies["grunt-ltss"] = "~0.1.2";
    this.builds.push('ltss');
  } else {
    this.mkdir("./app/styles");
    this.copy("./nonjast/index.tss", "./app/styles/index.tss")
    delete pkg.devDependencies["grunt-stss"];
    this.trackFiles.push('app/**/*.tss');
  }
  if (!this.coffee) {
    this.directory("./jast/app/controllers","./app/controllers");
    this.copy("./jast/app/alloy.js","./app/alloy.js")
    this.trackFiles.push('app/**/*.js');
  } else {
    this.mkdir("./app/controllers");
    this.copy("./nonjast/alloy.coffee","./app/alloy.coffee")
    this.copy("./nonjast/basic_spec.coffee","./spec/basic_spec.coffee")
    this.copy("./nonjast/index.coffee","./app/controllers/index.coffee")
    pkg.devDependencies["grunt-contrib-coffee"] = "~0.7.0";
    this.cleanFiles.push('app/controllers/**/*.js');
    this.trackFiles.push('app/**/*.coffee');
    this.builds.push('coffee');
  }
  this.directory("./jast/app/assets","./app/assets");
  this.directory("./jast/plugins","./plugins");

  this.write("package.json",_.template(JSON.stringify(pkg, null, "  "))(this));
  this.copy("_tiapp.xml","tiapp.xml");

  this.trackFiles = JSON.stringify(this.trackFiles);
  this.cleanFiles = JSON.stringify(this.cleanFiles);
  this.builds = JSON.stringify(this.builds)
  _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
  };
  this.write("Gruntfile.js",_.template(fs.readFileSync(path.join(__dirname,"templates","_Gruntfile.js")).toString())(this));
};

