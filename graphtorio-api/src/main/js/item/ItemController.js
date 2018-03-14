var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());

var Item = require('./Item');

router.get('/', function (req, res) {
  Item.find({}, function (err, items) {
    if (err) return res.status(500).send("There was a problem finding the items.");
    res.status(200).send(items);
  });
});

router.get('/:id', function (req, res) {
  Item.findById(req.params.id, function (err, item) {
    if (err) return res.status(500).send("There was a problem finding the item.");
    if (!item) return res.status(404).send("No item found.");
    res.status(200).send(item);
  });
});

router.post('/', function (req, res) {
  Item.create(
    {
      name : req.body.name,
      label: req.body.label
    }, 
    function (err, item) {
      if (err) return res.status(500).send("There was a problem adding the information to the database.");
      res.status(200).send(item);
    }
  );
});

router.put('/:id', function (req, res) {
  Item.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, item) {
    if (err) return res.status(500).send("There was a problem updating the item.");
    res.status(200).send(item);
  });
});

router.delete('/:id', function (req, res) {
  Item.findByIdAndRemove(req.params.id, function (err, item) {
    if (err) return res.status(500).send("There was a problem deleting the item.");
    res.status(200).send("Item "+ item.name +" was deleted.");
  });
});


module.exports = router;