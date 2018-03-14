var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());

var Recipe = require('./Recipe');

router.get('/', function (req, res) {
  Recipe.find({}).populate('ingredients').exec(function (err, recipes) {
    if (err) return res.status(500).send("There was a problem finding the recipes.");
    res.status(200).send(recipes);
  });
});

router.get('/:id', function (req, res) {
  Recipe.findById(req.params.id, function (err, recipe) {
    if (err) return res.status(500).send("There was a problem finding the recipe.");
    if (!recipe) return res.status(404).send("No recipe found.");
    res.status(200).send(recipe);
  });
});

router.post('/', function (req, res) {
  Recipe.create(
  {
    name : req.body.name,
    label : req.body.label,
    ingredients: req.body.ingredients
  }, 
  function (err, recipe) {
    if (err) return res.status(500).send("There was a problem adding the information to the database." + err);
    res.status(200).send(recipe);
  }
  );
});

router.delete('/:id', function (req, res) {
  Recipe.findByIdAndRemove(req.params.id, function (err, recipe) {
    if (err) return res.status(500).send("There was a problem deleting the recipe.");
    res.status(200).send("Recipe "+ recipe.name +" was deleted.");
  });
});

router.put('/:id', function (req, res) {
  Recipe.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, recipe) {
    if (err) return res.status(500).send("There was a problem updating the recipe.");
    res.status(200).send(recipe);
  });
});

module.exports = router;