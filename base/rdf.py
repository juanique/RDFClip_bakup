import tempfile
import time
import os
import pdb
from subprocess import call
from rdflib import Graph, Namespace, Literal

FILE = Namespace('http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#')
RDFS = Namespace('http://www.w3.org/2000/01/rdf-schema#')
RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
CLIP = Namespace('http://www.rdfclip.com/resource/')
CLIPS = Namespace('http://www.rdfclip.com/schema#')

hachoir_mapping = {
    'description' : RDFS['comment'],
    'duration' : FILE['duration'],
    'width' : FILE['horizontalResolution'],
    'height' : FILE['verticalResolution'],
    'frame_rate' : FILE['frameRate'],
    'bit_rate' : FILE['averageBitrate'],
    'comment' : RDFS['comment'],
    'compression' : FILE['codec'],
    'nb_channel' : FILE['channels'],
    'mime_type' : RDF['type'],

    #Classes by  mimetype
    'video/x-msvideo' : FILE['Video'],
}

class TripleStore:

    def __init__(self, hostname, username, password, work_dir):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.work_dir = work_dir

    def execute(self,script):
        call(["isql-vt", self.hostname, self.username, self.password, script])

    def load_file(self,filename, g):
        tf_query = tempfile.NamedTemporaryFile(dir=self.work_dir)
        virtuoso_command = "DB.DBA.RDF_LOAD_RDFXML_MT( file_to_string_output('%s'), '', '%s', 1 );" % (filename, g)
        tf_query.write(virtuoso_command)
        tf_query.flush()
        self.execute(tf_query.name)
        tf_query.close()

    def query(self, q):
        tf_query = tempfile.NamedTemporaryFile(dir=self.work_dir)
        tf_query.write(q)
        tf_query.flush()
        self.execute(tf_query.name)
        tf_query.close()

    def insert(self, g, data, p = None, o = None):
        if p is not None:
            s = data
            graph_data = Graph()
            graph_data.add((s,p,o))
            self.insert(g, graph_data )
        else:
            tf_data = tempfile.NamedTemporaryFile(dir=self.work_dir)
            tf_data.write(data.serialize(format='xml'))
            tf_data.flush()
            self.load_file(tf_data.name, g)

    def delete(self, g, triples, p = None, o = None):
        if p is not None:
            return self.delete([[triples,p,o]])

        lines = []
        for t in triples:
            if (isinstance(t[2],str) or isinstance(t[2],unicode)) and t[2][0] != '<':
                c = "FILTER regex(?o, '%s')" % t[2]
            else:
                c = "FILTER (?o = %s)" % t[2]

            #TODO: find a good way to delete literals!!
            sparql = """
                SPARQL MODIFY GRAPH <http://www.rdfclip.com/data>
                DELETE { ?s ?p ?o}
                INSERT {}
                FROM <http://www.rdfclip.com/data>
                WHERE
                { ?s ?p ?o .
                        FILTER (?s = %s) .
                        FILTER (?p = %s) .
                        %s . };
                """ % (t[0],t[1],c)
            self.query(sparql)
