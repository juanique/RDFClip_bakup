#!/bin/bash

#f = file(s), deben listarse todas entre comillas (listo)
#d = directorio, debe ser ruta completa (listo)
#g = grafo (listo)
#c = clean (listo)
#h = help
#r = recursividad (listo)

#Nota: Se deben usar rutas de archivo completas

host="localhost"
user="dba"
pass="abdhgdbf"



while getopts d:f:g:chr opcion
do
        case $opcion in
                d) 	
			directorio=$OPTARG
			if [ ${directorio:(-1)} = "/" ]; then
				directorio=${directorio:0:(${#directorio}-1)}
			fi
			flag_d="OK"
                ;;

                f)
			files=$OPTARG
			for i in $files
			do
				if [ "ttl" != "${i##*.}" ]; then
					echo "Todos los archivos deben ser en formato .ttl"
					echo "Error en $i"
					exit 1;
				fi
			done
			flag_f="OK"
                ;;

                g) 	
			grafo=$OPTARG
			if [ ${grafo:(-1)} = ">" ]; then
				grafo=${grafo:0:(${#grafo}-1)}
			fi
			if [ ${grafo:0:1} = "<" ]; then
				grafo=${grafo:1}
			fi
			flag_g="OK"
                ;;

		r) 	
			flag_r="OK"
                ;;


                c)
			flag_c="OK"
		;;

		h) 	echo
			echo "-------------------load_data help page--------------------"
			echo
			echo "General use: $0 [-h] [-c [-g graph]] [-d dir -g graph  [-r]] [-f \"file1 file2 ...\" -g graph]"
			echo
			echo "-c		Clean all RDF database. If -g option was especificated, Clean just indicated graph"
			echo "-h		This help page"
			echo "-r		Recursive mode, load all .ttl files in subdirectories too"
			echo "-d dir		Load all .ttl files in \"dir\" directory"
			echo "-f \"file1 ..\"	Load files you specified between \"\". Must be complete path"
			echo "-g graph	Graph where you want load the files in RDF database. This option must be especificated to load files (options -f or -d)"
			echo
			echo "---------------------------------------------------------"
			echo
		;;

                ?) echo "Bad argument, Use -h for help"
        esac
done

#Función para cargar datos de un directorio, filtra por .ttl
function carga_datos (){
	#$1 = directorio

	for file in $1/*
	do
		if [ "ttl" = "${file##*.}" ]; then
            echo "DB.DBA.TTLP_MT( file_to_string_output('__FILE__'), '', '__GRAPH__', 1 );" > load_data.sql
			cat load_data.sql | sed -e"s\\__FILE__\\$file\\" | sed -e"s\\__GRAPH__\\$grafo\\" > temp.sql
			isql-vt $host $user $pass temp.sql
			echo "Hecho para $file"
            rm -rf load_data.sql
		fi
		if [ "rdf" = "${file##*.}" ]; then
            echo "DB.DBA.RDF_LOAD_RDFXML_MT( file_to_string_output('__FILE__'), '', '__GRAPH__', 1 );" > load_data.sql
			cat load_data.sql | sed -e"s\\__FILE__\\$file\\" | sed -e"s\\__GRAPH__\\$grafo\\" > temp.sql
			isql-vt $host $user $pass temp.sql
			echo "Hecho para $file"
            rm -rf load_data.sql
		fi
		if [ "X$flag_r" = "XOK" ]; then
			if [ -d $file ]; then
				carga_datos $file
			fi
		fi
	done
	rm -rf temp.sql
}

#Clean
if [ "X$flag_c" = "XOK" ]; then
	if [ "X$flag_g" = "XOK" ]; then
		#Existe grafo
		#Validación de la acción de borrar
		echo -n "¿Está seguro de borrar el grafo $grafo? (y/n): "
		read -s -n 1 respuesta
		if [ $respuesta = 'n' ]; then
			echo "$respuesta"
			echo
			echo "Abortado"
			echo
		elif [ $respuesta = 'y' ]; then
			echo "$respuesta"
			echo
			echo -n "¿Está seguro de borrar el grafo $grafo? Esta acción no se puede revertir (y/n): "
			read -s -n 1 respuesta
			if [ $respuesta = 'n' ]; then
				echo "$respuesta"
				echo
				echo "Abortado"
				echo
			elif [ $respuesta = 'y' ]; then
				echo "$respuesta"
				echo
				echo "Borrando grafo"
				echo "sparql CLEAR GRAPH <$grafo>;" > temp.sql
				echo
				isql-vt $host $user $pass temp.sql
				rm -rf temp.sql
			else 
				echo "$respuesta"
				echo
				echo "Respuesta incorrecta debe introducir \"y\" o \"n\""
				echo
			fi
		else
			echo
			echo "Respuesta incorrecta debe introducir \"y\" o \"n\""
			echo
		fi
	else
		#Se quiere borrar la base de datos completa
		#Validación de la acción de borrar
		echo -n "¿Está seguro de ejecutar el comando? (y/n): "
		read -s -n 1 respuesta
		if [ $respuesta = 'n' ]; then
			echo "$respuesta"
			echo
			echo "Abortado"
			echo
		elif [ $respuesta = 'y' ]; then
			echo "$respuesta"
			echo
			echo -n "¿Está seguro de borrar la base de datos completa? Esta acción no se puede revertir (y/n): "
			read -s -n 1 respuesta
			if [ $respuesta = 'n' ]; then
				echo "$respuesta"
				echo
				echo "Abortado"
				echo
			elif [ $respuesta = 'y' ]; then
				echo "$respuesta"
				echo
				echo "Borrando base de datos completa"
				echo "RDF_GLOBAL_RESET ();" > temp.sql
				echo
				isql-vt $host $user $pass temp.sql
				rm -rf temp.sql
			else 
				echo "$respuesta"
				echo
				echo "Respuesta incorrecta debe introducir \"y\" o \"n\""
				echo
			fi
			
		else 
			echo "$respuesta"
			echo
			echo "Respuesta incorrecta debe introducir \"y\" o \"n\""
			echo
		fi
	fi
fi

#Cargar .ttl de un directorio
if [ "X$flag_d" = "XOK" ]; then
	if [ "X$flag_g" = "XOK" ]; then
		#Existe grafo
		carga_datos $directorio
	else
		echo "Error, falta nombre del grafo"
		exit 1
	fi
fi

#Cargar archivos .ttl especificados
if [ "X$flag_f" = "XOK" ]; then
	if [ "X$flag_g" = "XOK" ]; then
		#Existe grafo
		echo "ttlp( file_to_string_output('__FILE__'), '', '__GRAPH__', 1 );" > load_data.sql
		for i in $files
		do
			cat load_data.sql | sed -e"s\\__FILE__\\$i\\" | sed -e"s\\__GRAPH__\\$grafo\\" > temp.sql
			isql-vt $host $user $pass temp.sql
			echo "Hecho para $i"
		done
		rm -rf load_data.sql
	else
		echo "Debe especificar un grafo"
		exit 1
	fi
	rm -rf temp.sql
fi
