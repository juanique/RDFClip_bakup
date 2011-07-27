import settings
from rdf import TripleStore

def get_triple_store():
   return TripleStore(settings.VIRTUOSO_HOST, settings.VIRTUOSO_USER, settings.VIRTUOSO_PASS, settings.VIRTUOSO_WORK_DIR)
