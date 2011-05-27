<?xml version="1.0" encoding="UTF-8"?>
<!--

XSLT script to format SPARQL Query Results XML Format into csv

Version 1 : Li Ding (2009-11-16)


Acknowledgement:
* this script reused code from jeni tennison's original XSLT for handling Google visualization, http://www.jenitennison.com/visualisation/data/SRXtoGoogleVisData.xsl

Known issues:
* we simply remove double quote in literal string, is there a better option?

log:
* Nov 17, 2009, fixed bug, "extra comma in csv output"


MIT License

Copyright (c) 2009 

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
-->
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:sparql="http://www.w3.org/2005/sparql-results#">

<xsl:strip-space elements="*" />
<xsl:preserve-space elements="sparql:literal" />
<xsl:output method="text" />


<xsl:variable name="defaultNs">
  <xsl:call-template name="namespace">
    <xsl:with-param name="string" select="/rdf:RDF/rdf:Description[1]/rdf:type[1]/@rdf:resource" />
  </xsl:call-template>
</xsl:variable>

<xsl:template match="sparql:sparql">
  <xsl:apply-templates select="sparql:head" />
  <xsl:text>
</xsl:text>
  <xsl:apply-templates select="sparql:results" />
</xsl:template>

<xsl:template match="sparql:head">
  <xsl:for-each select="sparql:variable">
    <xsl:apply-templates select="." />
    <xsl:if test="position() != last()">,</xsl:if>

  </xsl:for-each>
</xsl:template>
  
<xsl:template match="sparql:variable">
  <xsl:variable name="name" select="@name" />
  <xsl:variable name="binding"
    select="(/sparql:sparql/sparql:results/sparql:result/sparql:binding[@name = $name])[1]" />

  <xsl:text>"</xsl:text>
  <xsl:value-of select="@name" />
  <xsl:text>"</xsl:text>
</xsl:template>

<xsl:template match="sparql:results">
  <xsl:for-each select="sparql:result">
    <xsl:apply-templates select="." />
  </xsl:for-each>
</xsl:template>

<xsl:template match="sparql:result">
  <xsl:variable name="result" select="." />
  <xsl:for-each select="/sparql:sparql/sparql:head/sparql:variable">
    <xsl:variable name="name" select="@name" />
    <xsl:apply-templates select="$result/sparql:binding[@name = $name]" />
    <xsl:if test="position() != last()">,</xsl:if>

  </xsl:for-each>
  <xsl:text>
</xsl:text>
</xsl:template>

<xsl:template match="sparql:binding">
  <xsl:text>"</xsl:text>
  <xsl:choose>
    <xsl:when test="sparql:uri">

      <xsl:value-of select="sparql:uri" />
    </xsl:when>
    <xsl:otherwise>
       <xsl:value-of select="translate(sparql:literal,'&quot;',' ')" />
    </xsl:otherwise>
  </xsl:choose>
  <xsl:text>"</xsl:text>
</xsl:template>

<xsl:template name="namespace">
  <xsl:param name="string" />
  <xsl:param name="namespace" />
  <xsl:choose>
    <xsl:when test="contains($string, '#')">
      <xsl:value-of select="concat(substring-before($string, '#'), '#')" />
    </xsl:when>
    <xsl:when test="contains($string, '/')">
      <xsl:call-template name="namespace">

        <xsl:with-param name="string" select="substring-after($string, '/')" />
        <xsl:with-param name="namespace"
          select="concat($namespace, substring-before($string, '/'), '/')" />
      </xsl:call-template>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$namespace" />
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


</xsl:stylesheet>
