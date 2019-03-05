if ["$#" -ne 3]; then
  echo "Correct usage is ./setup.sh <db name> <db username> <pswd> "
else
  echo '{
    "db": {
      "host": "localhost",
      "port": 3306,
      "database": "'"$1"'",
      "username": "'"$2"'",
      "password": "'"$3"'",
      "name": "db",
      "connector": "mysql"
    }
  }
  '> server/datasources.json
  node server/create_tables.js
  # mysql -p <"script.mysql"
fi
