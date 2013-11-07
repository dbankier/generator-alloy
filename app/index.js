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
    type: 'confirm',
    name: 'ltss',
    message: 'Would you like to include ltss for styles?',
    default: true
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
    this.ltss = props.ltss;
    this.trackFiles = [];
    this.builds = [];
    this.cleanFiles =['Resources/', 'build/'] 
    this.appGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}); // GUID one-liner: http://stackoverflow.com/a/2117523
    cb();
  }.bind(this));
};

JaltGenerator.prototype.app = function app() {
  var pkg = require("./templates/_package.json")
  this.copy("./jalt/manifest","./manifest")
  this.copy("./jalt/README.md","./README.md")
  this.copy("./jalt/app/config.json","./app/config.json")
  this.copy("./jalt/app/README","./app/README")
  this.mkdir("./app")
  this.mkdir("./spec")

// ['app/views/**/*.xml', 'app/styles/**/*.tss', 'Resources/', 'build/']
  if (this.jade) {
    this.directory("./jalt/app/views","./app/views");
    this.cleanFiles.push('app/views/**/*.xml');
    this.trackFiles.push('app/views/**/*.jade');
    this.builds.push('jade');
  } else {
    this.mkdir("./app/views");
    this.copy("./nonjalt/index.xml", "./app/views/index.xml")
    delete pkg.devDependencies["grunt-contrib-jade"];
    this.trackFiles.push('app/views/**/*.xml');
  }
  if (this.ltss) {
    this.directory("./jalt/app/styles","./app/styles");
    this.cleanFiles.push('app/styles/**/*.tss');
    this.trackFiles.push('app/styles/**/*.ltss');
    this.builds.push('ltss');
  } else {
    this.mkdir("./app/styles");
    this.copy("./nonjalt/index.tss", "./app/styles/index.tss")
    delete pkg.devDependencies["grunt-ltss"];
    this.trackFiles.push('app/styles/**/*.tss');
  }
  if (!this.coffee) {
    this.directory("./jalt/app/controllers","./app/controllers");
    this.copy("./jalt/app/alloy.js","./app/alloy.js")
    this.trackFiles.push('app/controllers/**/*.js');
  } else {
    this.mkdir("./app/controllers");
    this.copy("./nonjalt/alloy.coffee","./app/alloy.coffee")
    this.copy("./nonjalt/basic_spec.coffee","./spec/basic_spec.coffee")
    this.copy("./nonjalt/index.coffee","./app/controllers/index.coffee")
    pkg.devDependencies["grunt-contrib-coffee"] = "~0.7.0";
    this.cleanFiles.push('app/controllers/**/*.js');
    this.trackFiles.push('app/controllers/**/*.coffee');
    this.builds.push('coffee');
  }
  this.directory("./jalt/app/assets","./app/assets");
  this.directory("./jalt/plugins","./plugins");

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

