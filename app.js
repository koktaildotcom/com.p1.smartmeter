'use strict';

const Homey = require('homey');
const DsmrReader = require('./lib/dsmrreader');

class P1 extends Homey.App {

  onInit() {
    console.log('p1-smartmeter is running...');

    // Single API instance for all devices
    this.dsmrreader = new DsmrReader();
  }

  parseDSMRData(data) {
    return this.dsmrreader.parseData(data);
  }

}

module.exports = P1;
