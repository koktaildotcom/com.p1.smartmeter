P1 smartmeter
NOTE: This app doesn't get information out of the smartmeter, you have to use an device (a raspberry pi for example) that push data to the app.
Introduction

This app adds the P1 smartmeter into Homey and add an api to update the data. The repository https://github.com/koktaildotcom/com.p1.smartmeter-dsmr.reader reads the data from the p1 and push it to the com.p1.smartmeter api.

Requirements of the device that reads data from the smartmeter (a raspberry pi for example)

A working internet connection.
A serial (usb) connection with the p1 port of the p1 smartmeter.
Power.
Cli access to the device.
Script for reading the data and push it to the api

NOTE: This example is for DSMR 4.0 supported devices.
Install the script https://github.com/koktaildotcom/com.p1.smartmeter-dsmr.reader on the device connected to the serial p1.
Run npm install
Change the HomeyId as described in src/p1.js.
Change the config.serialPort for your situation (you should check your smartmeter or google around..)
Run the script by calling: node src/p1.js
Usage of the Homey app

Install the app com.p1.smartmeter.
Add device p1 smartmeter.
Use the package com.p1.smartmeter-dsmr.reader to push data com.p1.smartmeter's endpoint /update.
Endpoint

POST: /update

body:

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
History

v2.0.0 - 01.01.2019
initial commit

v2.0.1 - 01.01.2019
add brandcolor and community topic id

v2.0.2 - 01.01.2019
add repository description for DSMR 4.0

v2.0.3 - 01.01.2019
update current gas usage once per hour

v3.0.0 - 15.10.2019
Add support for Homey v3 Energy
Added capability as it is needed for the power overview
Hide total consumed/generated from device sensor overview

v3.1.1 - 18.12.2019
Add new p1 smartmeter implementation to work with the new com.p1.smartmeter-dsmr.reader
Make the old p1-smartmeter deprecated

v3.1.2 - 19.12.2019
Bump version because of rejecting in store

Final note

The repository is available at: https://github.com/koktaildotcom/com.p1.smartmeter