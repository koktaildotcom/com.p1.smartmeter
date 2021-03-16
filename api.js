'use strict';

const Homey = require('homey');
const DsmrReader = require('./lib/dsmrreader');

module.exports = {

  async postUpdate({ homey, body }) {
    return homey.emit('update.data', body);
  },

  async postUpdateDsmrReader({ homey, body }) {
    return homey.emit('update.data', DsmrReader.parseData(body));
  },

};
