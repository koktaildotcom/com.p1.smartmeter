# P1 smartmeter

## Introduction
This app adds the P1 smartmeter into Homey and add an api to update the data.

## Usage
1. Install the app `com.p1.smartmeter`.
2. Add device `p1 smartmeter`.
3. Use the endpoint `/update` to push data to Homey.

## Endpoint

#####POST: `/update`

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
## History
### v1.0.0 - 01.01.2019
  
## Final note ##
The repository is available at: https://github.com/koktaildotcom/com.p1.smartmeter