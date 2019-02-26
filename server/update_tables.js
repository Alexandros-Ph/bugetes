var server = require('./server');
var ds = server.dataSources.db;
var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', 'Product', 'Price', 'Review', 'Report', 'Order', 'Shop'];

ds.autoupdate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' - lbTables - '] updated in ', ds.adapter.name);
  ds.disconnect();
});
