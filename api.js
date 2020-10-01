'use strict';

const Homey = require('homey');

module.exports = {
  async postUpdate({ body }) {
    this.log('Handle new post data in p1 update');
    await this.homey.emit('update.data', body);

    return 'OK';
  },
  async postUpdateDsmrReader({ body }) {
    this.log('Handle new post data in p1 dsmrreader update');
    const DsmrReader = Homey.app.dsmrreader;
    await this.homey.emit('update.data', DsmrReader.parseData(body));

    return 'OK';
  },
};
