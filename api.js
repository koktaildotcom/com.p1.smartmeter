'use strict';

const Homey = require('homey');

module.exports = {

  async postUpdate({ homey, body }) {
    return homey.emit('update.data', body);
  },

  async postUpdateDsmrReader({ homey, body }) {
    const DsmrReader = Homey.app.dsmrreader;
    return homey.emit('update.data', DsmrReader.parseData(body));
  },

};
