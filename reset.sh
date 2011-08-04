#!/bin/bash
dbname=`cat local_settings.py | grep '#-DBNAME' | sed -re"s/^.+:[^']'([^']+)'.*$/\1/"`
dbuser=`cat local_settings.py | grep '#-DBUSER' | sed -re"s/^.+:[^']'([^']+)'.*$/\1/"`
dbpass=`cat local_settings.py | grep '#-DBPASS' | sed -re"s/^.+:[^']'([^']+)'.*$/\1/"`
virtuoso_config=`cat local_settings.py | grep '#-VIRTUOSOINI' | sed -re"s/^.+=[^']'([^']+)'.*$/\1/"`
virtuoso_work=`cat local_settings.py | grep '#-VIRTUOSOWORK' | sed -re"s/^.+=[^']'([^']+)'.*$/\1/"`
schema_graph=`cat local_settings.py | grep '#-SCHEMAGRAPH' | sed -re"s/^.+=[^']'([^']+)'.*$/\1/"`
data_graph=`cat local_settings.py | grep '#-DATAGRAPH' | sed -re"s/^.+=[^']'([^']+)'.*$/\1/"`


if [ $# -lt 1 ]; then
    echo "Available commands:"
    echo "mysql-create-db"
    echo "virtuoso-(add|remove)-dir <path>"
    echo "virtuoso-(list|autoset)-dir"
    echo "clip-(load|clean|reset)[-schema|-data]"
else
    if [ $1 = "mysql-create-db" ]; then
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
    if [ $1 = "virtuoso-list-dir" ]; then
        cat $virtuoso_config | grep DirsAllowed
    fi
    if [ $1 = "virtuoso-add-dir" ]; then
        new_dir=$2
        if [ -d "$new_dir" ]; then
            new_dirs_allowed=`cat $virtuoso_config | grep DirsAllowed | sed -re"s:,?$:, $new_dir:"`
            sudo sed -i -re"s:^DirsAllowed.*:$new_dirs_allowed:" $virtuoso_config
            echo $new_dirs_allowed
        else
            echo "ERROR: directory '$new_dir' does not exists."
        fi
    fi
    if [ $1 = "virtuoso-remove-dir" ]; then
        dir=$2
        new_dirs_allowed=`cat $virtuoso_config | grep DirsAllowed | sed -re"s: *$dir *,*::g" | sed -re"s:,,:,:g"`

        sudo sed -i -re"s:^DirsAllowed.*:$new_dirs_allowed:" $virtuoso_config
        echo $new_dirs_allowed

    fi
    if [ $1 = "virtuoso-autoset-dir" ]; then
        ./$0 virtuoso-remove-dir $virtuoso_work
        ./$0 virtuoso-remove-dir `pwd`/data
        ./$0 virtuoso-add-dir $virtuoso_work
        ./$0 virtuoso-add-dir `pwd`/data
    fi
    if [ $1 = "clip-load-schema" ]; then
        ./scripts/load_data.sh -g $schema_graph -d `pwd`/data/schema
    fi
    if [ $1 = "clip-load-data" ]; then
        ./scripts/load_data.sh -g $data_graph -d `pwd`/data/data
    fi
    if [ $1 = "clip-clean-schema" ]; then
        ./scripts/load_data.sh -c $schema_graph
    fi
    if [ $1 = "clip-clean-data" ]; then
        ./scripts/load_data.sh -c $data_graph
    fi
    if [ $1 = "clip-reset-schema" ]; then
        ./scripts/load_data.sh -c -g $schema_graph -d `pwd`/data/schema
    fi
    if [ $1 = "clip-reset-data" ]; then
        ./scripts/load_data.sh -c -g $data_graph -d `pwd`/data/data
    fi
    if [ $1 = "clip-clean" ]; then
        ./$0 clip-clean-data
        ./$0 clip-clean-schema
    fi
    if [ $1 = "clip-load" ]; then
        ./$0 clip-load-data
        ./$0 clip-load-schema
    fi
    if [ $1 = "clip-reset" ]; then
        ./$0 clip-reset-data
        ./$0 clip-reset-schema
    fi
fi

