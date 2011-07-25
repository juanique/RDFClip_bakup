from rdflib import Graph, Literal
from base.rdf import CLIPS, RDF, RDFS
from scrapper.utils import imdb_movie
from django.template.defaultfilters import slugify

def new_triple(s,p,o):
    g = Graph()
    g.add((s,p,o))
    #If an imdb link is added, we need to get the basic movie metadata
    if p == CLIPS["movieContent"]:
        movie_info = imdb_movie(str(o))
        g.add((o, RDF["type"], CLIPS["IMDBLink"]))
        g.add((o, RDFS["label"], Literal(movie_info['title'])))
        g.add((o, CLIPS["prettyName"], Literal(movie_info['title'])))

    return g
