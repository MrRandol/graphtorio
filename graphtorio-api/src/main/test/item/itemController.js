process.env.NODE_ENV = 'test';

var chai = require('chai');
var mongoose = require('mongoose');  

var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
chai.use(chaiHttp);

var server = require('../../js/app');

var Item = require('../../js/item/Item')

describe('ITEM CONTROLLER', function() {

  beforeEach(function(done) {
    Item.collection.drop(() => {
      Item.ensureIndexes(done)
    });
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
    let item1 = {name: "item1", label: "item1"};
    let item2 = {name: "item2", label: "item2"};
    Item.create(item1)
    .then(() => {
      Item.create(item2)
    })
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

  it('should add a SINGLE item on /items POST', function(done) {
    let item1 = {name: "item1", label: "item1"};
    chai.request(server)
    .post('/items')
    .send(item1)
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');

      res.body.should.have.property('name');
      res.body.should.have.property('label');
      res.body.should.have.property('_id');

      res.body.name.should.equal(item1.name);
      res.body.label.should.equal(item1.label);
      done();
    });
  });
  
});