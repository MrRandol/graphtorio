process.env.NODE_ENV = 'test';

var chai = require('chai');
var mongoose = require('mongoose');  

var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
chai.use(chaiHttp);

var factories = require('../utils/factories');
var server = require('../../js/app');
var Recipe = require('../../js/recipe/Recipe')

describe('RECIPE CONTROLLER', function() {

  beforeEach(function(done) {
    mongoose.connection.dropDatabase(done);
  });

  it('should list no recipe on /recipes GET if db is empty', function(done) {
    chai.request(server)
    .get('/recipes')
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      expect(res.body).to.have.length(0);
      done();
    });
  });

  it('should list ALL recipes on /recipes GET', function(done) {
    Recipe.create(factories.recipeNoIngredient())
    .then(
      () => {Recipe.create(factories.recipeNoIngredient())}
    )
    .then(() => {
      chai.request(server)
      .get('/recipes')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        expect(res.body).to.have.length(2);
        done();
      });
    })
  });

  it('should return recipe /recipes/:id GET', function(done) {
    let recipe = factories.recipeNoIngredient();
    Recipe.create(recipe)
    .then((recipe) => {
      chai.request(server)
      .get('/recipes/' + recipe.id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.name.should.equal(recipe.name);
        res.body.label.should.equal(recipe.label);
        done();
      });
    })
  });

  it('should add a SINGLE recipe on /recipes POST', function(done) {
    let recipe = factories.recipeNoIngredient();
    chai.request(server)
    .post('/recipes')
    .send(recipe)
    .end(function(err, res){
      console.log(err)
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');

      res.body.should.have.property('name');
      res.body.should.have.property('label');
      res.body.should.have.property('_id');

      res.body.name.should.equal(recipe.name);
      res.body.label.should.equal(recipe.label);
      done();
    });
  });
  
  it('should update an recipe on /recipes PUT', function(done) {
    let it = factories.recipeNoIngredient()
    Recipe.create(it)
    .then(
      (recipe) => {
        return Recipe.findByIdAndUpdate(recipe.id, {name: "newName"}); 
      })
    .then((recipe) => {
      chai.request(server)
      .get('/recipes/' + recipe.id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('name');
        res.body.should.have.property('label');
        res.body.should.have.property('_id');

        res.body.name.should.equal("newName");
        res.body.label.should.equal(recipe.label);
        done();
      });
    })
  });

});