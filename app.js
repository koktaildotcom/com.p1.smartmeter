const Homey = require('homey');

class P1 extends Homey.App {
    onInit () {
        this.log('p1-smartmeter is running...');
    }
}

module.exports = P1