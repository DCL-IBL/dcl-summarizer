const EventEmitter = require('events');

const statusEmitter = new EventEmitter(); // global event bus

module.exports = { statusEmitter };
