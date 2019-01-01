const Homey = require('homey');

class P1Driver extends Homey.Driver {
    onPairListDevices (data, callback) {
        let devices = [
            {
                "name": "P1 smart meter",
                "data": {
                    "id": "p1-smartmeter"
                },
            },
        ];
        callback(null, devices);
    }
}

module.exports = P1Driver;