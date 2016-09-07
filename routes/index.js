var express = require('express');
var router = express.Router();
var models = require('../models');
var regionSerializer = require('../serializers/region');
var clusterSerializer = require('../serializers/cluster');
var serializers = require('../serializers');
var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
var uuid = require('uuid');
var multer = require('multer');
var shortid = require('shortid');
var request = require('request');
var socketio = require('../socketio');


/**
 * regions
 */
router.get('/regions', function(req, res, next) {
  models.region.findAll({
    include: [models.cluster]
  }).then(function(regions) {
    var jsonapi = regionSerializer.serialize(regions);
    res.send(jsonapi);
  })
});
router.post('/regions', function(req, res) {
  new JSONAPIDeserializer().deserialize(req.body, function(err, data) {
    models.region.create(data).then(function(region) {
      region.save();
      res.send(serializers.region.serialize(region));
    })
  });
});
router.get('/regions/:region_id', function(req, res) {
  models.region.findById(req.params.region_id, {
    include: [models.cluster]
  }).then(function(region) {
    var jsonapi = regionSerializer.serialize(region);
    res.send(jsonapi);
  });
});
/**
 * clusters
 */
router.get('/clusters', function(req, res) {
  models.cluster.findAll({
    include: [models.host, models.region]
  }).then(function(clusters) {
    var jsonapi = clusterSerializer.serialize(clusters);
    res.send(jsonapi);
  });
});
router.get('/clusters/:id', function(req, res) {
  models.cluster.findById(req.params.id, {
    include: [models.host, models.region]
  }).then(function(cluster) {
    cluster.setDataValue('token', uuid.v4());
    res.send(cluster.jsonapiSerialize());
  });
});
router.post('/clusters', function(req, res) {
  models.cluster.jsonapiDeserialize(req.body, function(err, data) {
    models.cluster.create(data).then(function(model) {
      model.set('region_id', data.region.id);
      model.save();
      res.send(model.jsonapiSerialize());
    })
  });
});
/**
 * hosts
 */
router.get('/hosts', function(req, res) {
  models.host.findAll({
    include: [models.cluster]
  }).then(function(data) {
    var jsonapi = serializers.host.serialize(data);
    res.send(jsonapi);
  });
});
router.get('/hosts/:id', function(req, res) {
  models.host.findById(req.params.id, {
    include: [models.cluster, models.deployment]
  }).then(function(model) {
    if (model) {
      res.send(model.jsonapiSerialize());
    } else {
      res.send(404);
    }
  });
});
router.post('/hosts', function(req, res) {
  models.host.jsonapiDeserialize(req.body, function(err, data) {
    models.host.create(data).then(function(model) {
      model.set('cluster_id', data.cluster.id);
      model.save();
      res.send(model.jsonapiSerialize());
    })
  });
});
/**
 * cloudwares
 */
router.get('/cloudwares', function(req, res) {
  models.cloudware.findAll({
    include: [models.version]
  }).then(function(data) {
    var jsonapi = serializers.cloudware.serialize(data);
    res.send(jsonapi);
  });
});
router.get('/cloudwares/:id', function(req, res) {
  models.cloudware.findById(req.params.id, {
    include: [models.version]
  }).then(function(data) {
    var jsonapi = serializers.cloudware.serialize(data);
    res.send(jsonapi);
  });
});
router.post('/cloudwares', function(req, res) {
  models.cloudware.jsonapiDeserialize(req.body, function(err, data) {
    models.cloudware.create(data).then(function(model) {
      model.save();
      res.send(model.jsonapiSerialize());
    })
  })
});
var cloudware_storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, uuid.v4() + '.zip') //Appending .jpg
  }
});
var upload = multer({storage: cloudware_storage});
router.post('/cloudwares/upload', upload.single('file'), function(req, res) {
  res.send(req.file.filename);
});
/**
 * versions
 */
router.get('/versions/:id', function(req, res) {
  models.version.findById(req.params.id, {
    include: [models.cloudware]
  }).then(function(data) {
    var jsonapi = serializers.version.serialize(data);
    res.send(jsonapi);
  });
});

router.post('/versions', function(req, res) {
  models.version.jsonapiDeserialize(req.body, function(err, data) {
    models.version.create(data).then(function(model) {
      model.set('cloudware_id', data.cloudware.id);
      model.save();
      res.send(model.jsonapiSerialize());
    })
  })
});
/**
 * deployments
 */
router.get('/deployments', function(req, res) {
  models.deployment.findAll({
    include: [models.host, models.version]
  }).then(function(deployments) {
    res.send(serializers.deployment.serialize(deployments));
  });
});
router.get('/deployments/:id', function(req, res) {
  models.deployment.findById(req.params.id, {
    include: [{
      model: models.version,
      include: [models.cloudware]
    }, models.host]
  }).then(function(data) {
    console.log(data.toJSON())
    res.send(data.jsonapiSerialize());
  });
});
router.post('/deployments', function(req, res) {
  models.deployment.jsonapiDeserialize(req.body, function(err, data) {

    models.deployment.create(data).then(function(model) {
      model.set('host_id', data.host.id);
      model.set('version_id', data.version.id);
      model.save();
      res.send(model.jsonapiSerialize());
    })
  })
});
/**
 * instances
 */
var sessions = [];
router.post('/instances', function(req, res) {
  models.instance.jsonapiDeserialize(req.body, function(err, data) {
    models.version.findById(data.version.id, {
      include: [models.deployment]
    }).then(function(version) {
      var deployments = version.deployments;
      var deployment = deployments[0];
      deployment.getHost().then(function(host) {
        var sock_host = socketio.findHost(host.get('id'));
        if (sock_host) {
          socketio.runCloudware(sock_host, 'notepad', function(port) {
            var instance;
            models.instance.create({port: port}).then(function(inst) {
              instance = inst;
              return deployment.addInstance(inst, {});
            }).then(function() {
              models.sequelize.sync();
            }).then(function() {
              res.send(port + '');
            });
          })
        } else {
          res.send(500);
        }
      });
    })
  })
});
/**
 * upload
 */
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, uuid.v4() + '.jpg') //Appending .jpg
  }
});
var upload = multer({storage: storage}).single('file');
router.post('/upload', function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      return res.end('error uploading');
    }
    res.send(req.file.filename);
  });
});
module.exports = router;
