const Homey = require('homey');
const DsmrReader = require('./lib/dsmrreader');

class P1 extends Homey.App {
    onInit () {
        // Single API instance for all devices
        this.dsmrreader = new DsmrReader();

        this.log('p1-smartmeter is running...');
    }
}

module.exports = P1
