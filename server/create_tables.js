var server = require('./server');
var ds = server.dataSources.db;
var lbTables = ['MyUser', 'AccessToken', 'ACL', 'RoleMapping', 'Role', 'Product', 'Price', 'Review', 'Report', 'Order', 'Shop'];

ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
  ds.disconnect();
});
