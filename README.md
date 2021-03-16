# P1 smartmeter

> NOTE: This app doesn't get information out of the `smartmeter`, you have to use an device (a raspberry pi for example) that push data to the app.

## Introduction
This app adds the P1 smartmeter into Homey and add an api to update the data.
The repository `https://github.com/koktaildotcom/com.p1.smartmeter-dsmr.reader` reads the data from the p1 and push it to the `com.p1.smartmeter` api.

### Requirements of the device that reads data from the smartmeter (a raspberry pi for example)
1. A working internet connection.
2. A serial (usb) connection with the p1 port of the p1 smartmeter.
3. Power.
4. Cli access to the device.

### Script for reading the data and push it to the api (Standalone)

> NOTE: This example is for DSMR 4.0 supported devices.
1. Install the script `https://github.com/koktaildotcom/com.p1.smartmeter-dsmr.reader` on the device connected to the serial p1.
2. Run `npm install`
3. Change the `HomeyId` as described in `src/p1.js`.
4. Change the `config.serialPort` for your situation (you should check your smartmeter or google around..)
5. Run the script by calling: `node src/p1.js`

### Script for reading the data and push it to the api (DSMR-Reader)

1. Install the script `https://gist.github.com/steffjenl/31bd083eeb9d0be04375b7695b9f2eaf` as plugin for DSM-Reader.
2. More information about installing plugin's can be found on `https://dsmr-reader.readthedocs.io/nl/v3/plugins.html`
3. Change the `HOMEY_ID` as described in `forward_raw_telegram_to_api.py`.
4. Execute as user dsmr in the dsmr directory `./post-deploy.sh`

### Usage of the Homey app
1. Install the app `com.p1.smartmeter`.
2. Add device `p1 smartmeter`.
3. Use the package `com.p1.smartmeter-dsmr.reader` to push data `com.p1.smartmeter`'s endpoint `/update` or `/update/dsmrreader`.

### Endpoint

#### POST: `/update`

   body:
   
   ```
   {
   	"electricity": {
   		"delivered": {
   			"tariff2": {
   				"reading": 0,
   				"unit": "kWh"
   			},
   			"actual": {
   				"reading": 0,
   				"unit": "kW"
   			},
   			"tariff1": {
   				"reading": 0,
   				"unit": "kWh"
   			}
   		},
   		"received": {
   			"tariff2": {
   				"reading": 0,
   				"unit": "kWh"
   			},
   			"actual": {
   				"reading": 0,
   				"unit": "kW"
   			},
   			"tariff1": {
   				"reading": 0,
   				"unit": "kWh"
   			}
   		}
   	},
   	"gas": {
   		"reading": 0,
   		"unit": "m3"
   	}
   }
   ```

#### POST: `/update/dsmrreader`

   body:
   
   ```
   {
   	"telegram": "RAW TELEGRAM MESSAGE"
   }
   ```

## History

### v2.0.0 - 01.01.2019
- initial commit

### v2.0.1 - 01.01.2019
- add brandcolor and community topic id

### v2.0.2 - 01.01.2019
- add repository description for DSMR 4.0

### v2.0.3 - 01.01.2019
- update current gas usage once per hour

### v3.0.0 - 15.10.2019
- Add support for Homey v3 Energy
- Added capability as it is needed for the power overview
- Hide total consumed/generated from device sensor overview

### v3.1.1 - 18.12.2019
- Add new p1 smartmeter implementation to work with the new com.p1.smartmeter-dsmr.reader
- Make the old p1-smartmeter deprecated

### v3.1.2 - 19.12.2019
- Bump version because of rejecting in store

### v3.1.4 - 14.05.2020
- Add endpoint for raw telegram messages
- Fixed translation issues https://github.com/koktaildotcom/com.p1.smartmeter/issues/15
- Removed deprecated driver `p1-smartmeter`.
- Fixed power consumed missing https://github.com/koktaildotcom/com.p1.smartmeter/issues/19 

### v4.0.0 - 02.10.2020
- Update to SDK 3

### v4.0.1 - 30.10.2020
- Update dependencies
- Fix removing gas meters
- Improve dsmrreader with reportedPeriod, timestamp and switched electricity
- Calculate gas per hour with timestamp and reportedPeriod from dsmr

### v4.0.2 - 02.03.2021
- bugfix missing L1, L2, L3

### v4.0.3 - 16.03.2021
- bugfix upgrade dsmr reader

## Final note ##
The repository is available at: https://github.com/koktaildotcom/com.p1.smartmeter
