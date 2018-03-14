process.env.NODE_ENV = 'test';

var chai = require('chai');
var mongoose = require('mongoose');  

var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
chai.use(chaiHttp);

var factories = require('../utils/factories');
var server = require('../../js/app');
var Item = require('../../js/item/Item')

describe('ITEM CONTROLLER', function() {

  beforeEach(function(done) {
    mongoose.connection.dropDatabase(done);
  });

  it('should list no item on /items GET if db is empty', function(done) {
    chai.request(server)
    .get('/items')
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      expect(res.body).to.have.length(0);
      done();
    });
  });

  it('should list ALL items on /items GET', function(done) {
    Item.create(factories.validItem())
    .then(
      () => {Item.create(factories.validItem())}
    )
    .then(() => {
      chai.request(server)
      .get('/items')
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        expect(res.body).to.have.length(2);
        done();
      });
    })
  });

  it('should return item /items/:id GET', function(done) {
    let item = factories.validItem();
    Item.create(item)
    .then((item) => {
      chai.request(server)
      .get('/items/' + item.id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.name.should.equal(item.name);
        res.body.label.should.equal(item.label);
        done();
      });
    })
  });

  it('should add a SINGLE item on /items POST', function(done) {
    let item = factories.validItem();
    chai.request(server)
    .post('/items')
    .send(item)
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');

      res.body.should.have.property('name');
      res.body.should.have.property('label');
      res.body.should.have.property('_id');

      res.body.name.should.equal(item.name);
      res.body.label.should.equal(item.label);
      done();
    });
  });
  
  it('should update an item on /items PUT', function(done) {
    let it = factories.validItem()
    Item.create(it)
    .then(
      (item) => {
        return Item.findByIdAndUpdate(item.id, {name: "newName"}); 
      })
    .then((item) => {
      chai.request(server)
      .get('/items/' + item.id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');

        res.body.should.have.property('name');
        res.body.should.have.property('label');
        res.body.should.have.property('_id');

        res.body.name.should.equal("newName");
        res.body.label.should.equal(item.label);
        done();
      });
    })
  });

});