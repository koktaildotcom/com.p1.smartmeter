const Homey = require('homey');

module.exports = [
    {
        method: 'POST',
        path: '/update',
        public: true,
        fn: function (args, callback) {
            if (args.hasOwnProperty('body')) {
                Homey.emit('update.data', args.body);

                callback(null, 'OK');
            }

            return callback( new Error('Cannot find body.') );
        },
    },
];