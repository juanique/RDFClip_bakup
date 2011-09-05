import settings
from rdf import TripleStore, SparqlProxy

def get_triple_store():
   return TripleStore(settings.VIRTUOSO_HOST, settings.VIRTUOSO_USER, settings.VIRTUOSO_PASS, settings.VIRTUOSO_WORK_DIR)

def get_sparql_proxy():
    return SparqlProxy(settings.VIRTUOSO_ENDPOINT)
