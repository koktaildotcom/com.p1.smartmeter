'use strict';

const Homey = require('homey');
const DsmrReader = require('./lib/dsmrreader');

class P1 extends Homey.App {

  onInit() {
    this.log('p1-smartmeter is running...');

    // Single API instance for all devices
    this.dsmrreader = new DsmrReader();
  }

}

module.exports = P1;
