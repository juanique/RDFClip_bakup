
# RDFClip

## Getting started

1. You may need to install Python 2.6, Django and other Python
   libs. See the requirements section to see how to install them.

2. Get the code

    git clone https://github.com/user99/RDFClip.git

3. Copy +local_settings.py.example+ to +local_settings.py+ and edit it
   according to your local config.

4. Run with

    python manage.py runserver

## System requirements

- Python 2.6
- Django 1.3

### Installation

1. Install Django

   Django 1.3 isn't as a package in current distributions of
   Debian/Ubuntu, so yo must install it using the tarball.

    wget http://www.djangoproject.com/download/1.3/tarball/
    tar xzvf Django-1.3.tar.gz
    cd Django-1.3
    sudo python setup.py install
    
2. Install Django pistons

    wget http://bitbucket.org/jespern/django-piston/downloads/django-piston-0.2.2.tar.gz
    tar -xvzf django-piston-0.2.2.tar.gz
    cd django-piston
    sudo python setup.py install

3. Install Beatiful Soup and Mechanize

   This packages are in current Debian/Ubuntu distributions so you can
   install them using the package manager.
   
    sudo apt-get install python-beautifulsoup python-mechanize php5-curl

### Database setup

RDFClip uses a relational database to (TODO: specify why).

### Apache configuration example (mod-python)

    <VirtualHost *>
        ServerName www.rdfclip.com

        SetHandler python-program
        PythonHandler django.core.handlers.modpython
        SetEnv DJANGO_SETTINGS_MODULE settings
        SetEnv DJANGO_SERVER_TYPE apache
        PythonPath "['/home/rdfclip','/home/rdfclip_git'] + sys.path"
    </VirtualHost>

    
### mod-wsgi
sudo apt-get install libapache2-mod-wsgi

<VirtualHost *>
    ServerName www.rdfclip.com
    WSGIScriptAlias / /home/user/RDFClip/django.wsgi

    <Directory /home/user/RDFclip>
		Order allow,deny
		allow from all
    </Directory>

    Alias /sparqlproxy/ "/home/user/RDFClip/proxy/"
    <Directory "/home/user/RDFClip/proxy/">
        Order deny,allow
        Allow from all
    </Directory>

</VirtualHost>


### Virtuoso
sudo apt-get install virtuoso-opensource 

Edit /etc/virtuoso-opensource-6.0/virtuoso.ini and add the settings.VIRTUOSO_WORK_DIR to the DirsAllowed variable
