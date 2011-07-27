from BeautifulSoup import BeautifulSoup as Soup
from BeautifulSoup import NavigableString
from BeautifulSoup import BeautifulStoneSoup
from soupselect import select
import re
import copy
import sys
import urllib
import mechanize
import cookielib
import operator

hexentityMassage = [(re.compile('&#x([^;]+);'), lambda m: '&#%d;' % int(m.group(1), 16))]

def open_url(url, html = True):
    br = mechanize.Browser()
    cj = cookielib.LWPCookieJar()
    br.set_cookiejar(cj)
    br.set_handle_equiv(True)
    #br.set_handle_gzip(True)
    br.set_handle_redirect(True)
    br.set_handle_referer(True)
    br.set_handle_robots(False)
    br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)
    br.addheaders = [('User-agent', 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.1) Gecko/2008071615 Fedora/3.0.1-1.fc9 Firefox/3.0.1')]
    r = br.open(url)
    if html:
        return r.read()
    else:
        return r


def scene_cleanup(result):
    ignore_exps = ['dvdscreener','1080p','h264','dvdrip','DVDSCR','NoSCR','XviD','DivX','DVDRip','DTS', '720p','Bluray','x264','\d{4}','aXXo','FXG','CVCD','DTL','FanCluBT','bdrip','KonzillaRG','NoGRP','Extended Edition','HomeCinema','proper','hdlite','\.avi$','\.mpg$','\.mp4','\.mkv','\[.+\]']
    ignore_words = ['SAPHiRE','LiMiTED','SEPTiC','DoNE','WHOCARES','KingBen','SUNSPOT','FraMeSToR','dxva','SAMPLE','BDRip','ARROW','CAM','IMAGiNE','CROSSBOW','DiVERSiTY','TDP','HR']
    ignore_symbols = ['.','-','[',']','_','()']

    for w in ignore_exps:
        pattern = re.compile(w,re.IGNORECASE)
        result = pattern.sub('',result).replace('  ',' ')
    for s in ignore_symbols + ignore_words:
        result = result.replace(s,' ')
    result = result.rstrip().lstrip()

    return result

def imdb_search(q):
    #Query the imdb search engine and get the results HTML
    response = open_url('http://www.imdb.com/find?s=all&q=%s' % urllib.quote(q), html=False)
    title_url = 'http://www.imdb.com/title/'
    if response.geturl()[:len(title_url)] == title_url:
        return [(response.geturl(), q)]

    soup = Soup(response.read(), convertEntities='html', markupMassage=hexentityMassage)

    #Parse the HTML, fetch movie names and their corresponding page URLs
    anchors = filter(lambda a : a.parent.name == 'td' and type(a.contents[0]) == NavigableString, select(soup,'a[href^/title/]'))
    results = [('http://www.imdb.com%s' % a.attrMap['href'], unicode(a.contents[0])) for a in anchors]

    return results

def isohunt_search(q):
    #Query the isohunt search engine and get the results HTML
    q = urllib.quote(q)
    soup = Soup(open_url('http://isohunt.com/torrents/?ihq=%s' % q), convertEntities='html', markupMassage=hexentityMassage)
    anchors = select(soup,'a[id^link]')
    anchors = filter(lambda a : a.parent.name == 'td', anchors)
    results = {}
    for a in anchors:
        if str(a.contents[0]) != '0':
            a = Soup(a.renderContents().split("<br />").pop())
            result = ' '.join([unicode(node.renderContents()) if type(node) != NavigableString else unicode(node) for node in a.contents])
            result = scene_cleanup(result)
            if result not in results.keys():
                results[result] = 1
            else:
                results[result] += 1

    results = sorted(results.iteritems(), key=operator.itemgetter(1))
    res = []
    for r in results:
        res = [r[0]] + res
    return res

def imdb_movie(url):
    response = open_url(url, html=False)
    soup = Soup(response.read(), convertEntities='html', markupMassage=hexentityMassage)

    #Parse the HTML, fetch movie names and their corresponding page URLs
    h1 = select(soup,'h1.header')
    return {
            'url' : url,
            'title' : h1[0].contents[0].strip()
    }
