var models = require('./models');
var uuid = require('uuid');

var hosts = [];
var sessions = [];

function findHost(id) {
  for (var i in hosts) {
    if (hosts[i].id === id) {
      return hosts[i];
    }
  }
  return null;
}

function findHostBySocket(socket) {
  for (var i in hosts) {
    if (hosts[i].socket === socket) {
      return hosts[i];
    }
  }
  return null;
}

function findHostById(id) {
  for (var i in hosts) {
    if (hosts[i].id === id) {
      return hosts[i];
    }
  }
  return null;
}

function create(server) {
  var io = require('socket.io')(server);
  var request = require('request');

  var nsp = io.of('/host');
  var nsp_ara = io.of('/ara');
  nsp.on('connection', function(socket) {
    console.log('new connection');
    
    socket.on('disconnect', function() {
      console.log('close connection');
      for (var i in hosts) {
        if (hosts[i].socket === socket) {
          hosts.splice(i, 1);
          break;
        }
      }
    });

    socket.on('host_info', function(msg) {
      var host = findHostById(msg.id);
      if (!host) {
        host = {
          id: msg.id,
          socket: socket
        };
        hosts.push(host);
        /* check whether host already created before */
        request.get('http://apiv2.cloudwarehub.com/hosts/' + msg.id).on('response', function(response) {
          if (response.statusCode === 404) {
            /* 调用pyxis api, 创建新host */
            models.host.create(msg).then(function(model) {
              model.save();
              model.setDataValue('token', msg.token);
              nsp_ara.to('ara').emit('new_host', model.jsonapiSerialize());
            });
          } else {
            models.host.findById(msg.id).then(function(model) {
              model.setDataValue('token', msg.token);
              nsp_ara.to('ara').emit('new_host', model.jsonapiSerialize());
            });
          }
        });
      }
      
    });
    
    socket.on('runsuccess', function(msg) {
      for (var i in sessions) {
        if (sessions[i].token == msg.token) {
          sessions[i].callback(msg.port);
          break;
        }
      }
    });
  });

  nsp_ara.on('connection', function(socket) {
    console.log('new ara connection');
    socket.join('ara');
  });
}

function runCloudware(host, cmd, cb) {
  var sess = {
    token: uuid.v4(),
    callback: cb
  };
  sessions.push(sess);
  host.socket.emit('run', {cmd: cmd, token: sess.token});
}

module.exports = {
  create: create,
  findHost: findHost,
  runCloudware: runCloudware
}