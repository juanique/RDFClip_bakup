#!/bin/bash
dbname=`cat local_settings.py | grep '#-DBNAME' | sed -re"s/^.+:[^']'([^']+)'.*$/\1/"`
dbuser=`cat local_settings.py | grep '#-DBUSER' | sed -re"s/^.+:[^']'([^']+)'.*$/\1/"`
dbpass=`cat local_settings.py | grep '#-DBPASS' | sed -re"s/^.+:[^']'([^']+)'.*$/\1/"`

if [ $# -ne 1 ]; then
    echo "Available commands:"
    echo "create-db"
else
    if [ $1 = "create-db" ]; then
        read -p "MySQL root password? " pass

        q="GRANT USAGE ON *.* TO '$dbuser'@'localhost';"
        q0="DROP USER $dbuser@localhost;"
        q1="DROP DATABASE IF EXISTS $dbname;"
        q2="FLUSH PRIVILEGES;"
        q3="CREATE USER '$dbuser'@'localhost' IDENTIFIED BY '$dbpass';"
        q4="CREATE DATABASE $dbname;"
        q5="GRANT ALL ON $dbname.* TO '$dbuser'@'localhost' WITH GRANT OPTION;"
        q6="FLUSH PRIVILEGES;"

        SQL="$q $q0 $q1 $q2 $q3 $q4 $q5 $q6"
        #echo $SQL
        
        mysql --user=root --password=$pass -e "$SQL" mysql
    fi
fi

python manage.py syncdb
