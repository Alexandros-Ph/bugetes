var server = require('./server');
var ds = server.dataSources.db;
var lbTables = ['MyUser', 'ACL', 'RoleMapping', 'Role', 'Product', 'Price', 'Review', 'Report', 'Order', 'Shop','AccessToken'];

ds.autoupdate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + lbTables + '] updated in ', ds.adapter.name);
  ds.disconnect();
});
