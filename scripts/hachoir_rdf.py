import os

from sys import argv, stderr, exit
from rdflib import Graph, Namespace, Literal

from hachoir_core.error import HachoirError
from hachoir_core.cmd_line import unicodeFilename
from hachoir_parser import createParser
from hachoir_core.tools import makePrintable
from hachoir_metadata import extractMetadata
from hachoir_core.i18n import getTerminalCharset
from hashlib import md5

from rdf_base import FILE, RDFS, RDF, CLIP, hachoir_mapping


def get_metadata(filename):
    filename, realname = unicodeFilename(filename), filename
    parser = createParser(filename, realname)
    if not parser:
        print >>stderr, "Unable to parse file"
        exit(1)
    try:
        metadata = extractMetadata(parser)
    except HachoirError, err:
        print "Metadata extraction error: %s" % unicode(err)
        metadata = None
    if not metadata:
        print "Unable to extract metadata"
        exit(1)

    return metadata


def parse_meta(metadata):
    out = [] 
    for data in sorted(metadata):
        for value in data.values:
            obj = {
                    'key' : data.key,
                    'description' : data.description,
                    'value' : value.text
                  }
            out.append(obj)
    return out

def parse_multi_meta(metadata):
    data = parse_meta(metadata)
    for key, meta in metadata._MultipleMetadata__groups.iteritems():
        data += parse_meta(meta)
    return data

def rdfize(key, value):
    if key == 'mime_type':
        obj = hachoir_mapping[value]
    else:
        obj = Literal(value)
    return (hachoir_mapping[key], obj)

def preprocess(data):
    mime = None
    for prop in data:
        if prop['key'] == 'mime_type':
            mime = prop['value']
            break

    if mime == 'video/x-msvideo':
        new_data = []
        got_duration = False
        bitrate = 0

        for prop in data:

            if prop['key'] == 'duration':
                if not got_duration:
                    got_duration = True
                    new_data.append(prop)
            elif prop['key'] == 'bit_rate':
                val = prop['value']
                if val[-8:] == 'Kbit/sec':
                    bitrate += float(prop['value'].replace(' Kbit/sec',''))
                elif val[-8:] == 'Mbit/sec':
                    bitrate += 1024*float(prop['value'].replace(' Mbit/sec',''))
            else:
                new_data.append(prop)

        if bitrate != 0 :
            new_data.append( { 'key' : 'bit_rate', 'value' : '%lg Kbit/sec' % bitrate})

        data = new_data

    return data

#producer
#mimetype
#endian

def rdfize_file(abs_filename):
    graph = Graph()
    path = abs_filename.replace(' ','\\ ')
    filename = os.path.basename(abs_filename)

    f = os.popen('md5sum %s' % path)

    file_hash = f.readline().split(' ')[0]

    data = parse_multi_meta(get_metadata(abs_filename))
    data = preprocess(data)

    file_uri = CLIP[file_hash]
    graph.add( (file_uri, FILE['fileName'], Literal(filename)))
    for prop in data:
        try :
            graph.add( (file_uri,) + rdfize(prop['key'], prop['value']))
        except KeyError:
            pass
            #print prop['key'], ' - ', prop['value']


    return graph

if __name__ == "__main__":
    if len(argv) != 2:
        print >>stderr, "usage: %s filename" % argv[0]
        exit(1)

    filename = argv[1]
    print rdfize_file(filename).serialize(format='xml')
