var expect = require('chai').expect;
 
var Item = require('../../js/item/Item');
 
describe('ITEM', function() {
    it('should be invalid if required fields are empty', function(done) {
        var item = new Item();
 
        item.validate(function(err) {
            expect(err.errors.name).to.exist;
            expect(err.errors.label).to.exist;
            done();
        });
    });
});