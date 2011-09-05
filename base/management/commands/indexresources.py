from django.core.management.base import BaseCommand, CommandError
from api.models import RDFResource
from base.connection import get_sparql_proxy

from base.rdf import RDFS

import settings

class Command(BaseCommand):
    help = 'Loads schema data from virtuoso triple store to the relational database.'

    def handle(self, *args, **options):
        proxy = get_sparql_proxy()
        sparql = "SELECT DISTINCT ?res, ?label FROM <%s> WHERE { ?res <%s> ?label }" % (settings.SCHEMA_GRAPH, RDFS['label'])

        resultSet = proxy.query(sparql,output='ResultSet')
        while resultSet.can_read():
            row = resultSet.get_row()
            RDFResource.objects.get_or_create(uri=row['res'].value, label=row['label'].value)

