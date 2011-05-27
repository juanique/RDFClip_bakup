<?php
ini_set('error_reporting', E_ALL);
ini_set('display_errors','On'); 

function customError($errno, $errstr){
    $response = array(
        "status" => "error",
        "errors" => array( 
            array ( 'reason' => 'unknown',
                    'message' => "ERROR $errno : $errstr")
        )
    );

    $d =  json_encode($response);
    echo $d;



    die();
    //echo "{reqId: 0, status:'error',errors:[{reason:'not_modified',message:'Data not modified'}]}";
    echo "google.visualization.Query.setResponse({reqId: 0, status:'error',errors:[{reason:'not_modified',message:'Data not modified'}]})";
    die();
    echo "google.visualization.Query.setResponse($d)";
    die();
} 

function noErrors($errno, $errstr){
}

set_error_handler("noErrors");

/**************************************************
author: Li Ding (http://www.cs.rpi.edu/~dingl)
created: October 35, 2009
modified: March 17, 2010



MIT License

Copyright (c) 2009 -2010

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
*/

////////////////////////////////
//configuration
////////////////////////////////

define("ME_NAME", "sparqlproxy");
define("ME_FILENAME", ME_NAME .".php");
define("ME_VERSION", "0.23");
define("ME_AUTHOR", "Li Ding");
define("ME_MODIFIED", "2009-03-17");


// SPARQL Endpoints
define("SPARQL_SERVICE_DEFAULT", "http://data-gov.tw.rpi.edu:8080/joseki/sparql");
define("SPARQL_DB_SERVICE_DEFAULT", "http://dbpedia.org/sparql");

// SPARQL query sample
define("SPARQL_QUERY_SAMPLE", "http://data-gov.tw.rpi.edu/sparql/stat_ten_triples_default.sparql");

// XSLT translation service
define("XSLT_SERVICE_URI", "http://data-gov.tw.rpi.edu/ws/xslt.php");

// OUTPUT Plug-in
define("OUTPUT_SPARQL_XML", "xml");  // the default output
define("OUTPUT_SPARQL_JSON", "json");

define("OUTPUT_SPARQL_HTML", "html");
define("OUTPUT_EXHIBIT_JSON", "exhibit");
define("OUTPUT_GVDS_JSON", 	 "gvds");
define("OUTPUT_CSV",  "csv");

define("OUTPUT_VALUES", 	
					OUTPUT_SPARQL_XML.",".
					OUTPUT_SPARQL_JSON.",".
					OUTPUT_EXHIBIT_JSON.",".
					OUTPUT_GVDS_JSON.",".
					OUTPUT_CSV.",".
					OUTPUT_SPARQL_HTML);


// INPUT KEYS
define("INPUT_QUERY", "query");  
define("INPUT_QUERY_URIS", "query-uri,sparql_uri" );  
define("INPUT_DEFAULT_GRAPH_URI", "default-graph-uri" );  
define("INPUT_SERVIC_URIS", "service-uri,service_uri" );  
define("INPUT_OUTPUT", "output");  
define("INPUT_DEBUG", "debug");  
define("INPUT_CALLBACK", "callback");  
define("INPUT_TQX", "tqx"); //just for google viz  

define("XSL_JSON_GVDS","sparqlxml2googlejson.xsl");
define("XSL_JSON_EXHIBIT","sparqlxml2exhibitjson.xsl");
define("XSL_CSV","sparqlxml2csv.xsl");
define("XSL_HTML","xml-to-html.xsl");
define("QUERY_FORMAT","query-format");
 
define("XSL_URLS", 	XSL_JSON_GVDS.",".
					XSL_JSON_EXHIBIT.",".
					XSL_CSV.",".
					XSL_HTML);


////////////////////////////////
// process input
////////////////////////////////

//load SPARQL query
$query = get_param(INPUT_QUERY);
//$query_isUri = get_param(QUERY_FORMAT) == "uri";

if (empty($query)){
	$query_uri = get_param(explode(",",INPUT_QUERY_URIS));
	
	if (!empty($query_uri)){
		$query=file_get_contents($query_uri);
	}		
}


//continue process query
$debug = get_param(INPUT_DEBUG);
$output = get_param(INPUT_OUTPUT, OUTPUT_SPARQL_XML);
$service_uri = get_param(explode(",",INPUT_SERVIC_URIS), SPARQL_SERVICE_DEFAULT);
$default_graph_uri = get_param(INPUT_DEFAULT_GRAPH_URI);


if ($debug){
	echo "============begin debug============";
	echo $service_uri;
	echo $query;
	echo $output;
	echo "============end debug============";
}


////////////////////////////////
// render default if no query supplied
////////////////////////////////


// show default web content if query is empty
if (empty($query)){
	show_input();
	die();
}	

////////////////////////////////
// log query for study
////////////////////////////////

//TODO: log the actual query
log_query($query, $service_uri, $default_graph_uri, $_SERVER["REMOTE_ADDR"]);


////////////////////////////////
// render query results, dispatch query to different process options
////////////////////////////////

$params = array();
if (!empty($query_uri) && strcmp($service_uri, SPARQL_SERVICE_DEFAULT)==0){
  $params ["query-uri"] = $query_uri;
}else{
  $params ["query"] = $query;
}

if (!empty($default_graph_uri))
	$params ["default-graph-uri"] = $default_graph_uri;
	
switch (strtolower($output)){
	case OUTPUT_SPARQL_JSON:  
  		$params ["output"] = "json";
		process_sparql_json($params, $service_uri, $debug, get_param(INPUT_CALLBACK));
		break;
	case OUTPUT_SPARQL_HTML:  
		process_sparql_xml2xslt($params, $service_uri, XSL_HTML, $debug);
		break;
	case OUTPUT_EXHIBIT_JSON:  
		process_sparql_xml2xslt($params, $service_uri, XSL_JSON_EXHIBIT, $debug, get_param(INPUT_CALLBACK));
		break;
	case OUTPUT_GVDS_JSON:  
		$inputparams =array();
		if (get_param(INPUT_TQX))
			$inputparams[INPUT_TQX] = get_param(INPUT_TQX);

		process_sparql_xml2xslt($params, $service_uri, XSL_JSON_GVDS,  $debug, false, $inputparams);
		break;
	case OUTPUT_CSV:  
		process_sparql_xml2xslt($params, $service_uri, XSL_CSV, $debug);
		break;
	case OUTPUT_SPARQL_XML:  
	default:
		process_sparql_xml($params, $service_uri, $debug);
		break;
}


///////////////////////////////////////////////


function show_input(){

?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
  <title><?php echo ME_NAME; ?></title>
  <link href="http://data-gov.tw.rpi.edu/2009/data-gov.css"  rel="stylesheet" type="text/css" />
</head>

<body>
<h3><?php echo ME_NAME; ?> Web Service (<?php echo ME_VERSION; ?>)</h3>
This service rewrites SPARQL SELECT query results into different format, e.g. JSON(Google Visualization, Exhibit), XML, HTML, CSV. We used the following XSLT to convert SPARQL XML output into different format:
<ul>
<?php 
  foreach (explode(",", XSL_URLS) as $url){
	echo "<li><a href=\"$url\">$url</a></li>";
  }
?>
</ul>

<fieldset>
<legend>Option1: Run SPARQL query</legend>
<form Method="GET" Action="<?php echo ME_FILENAME; ?>" >
 SPARQL query :<br/>
 <textarea name="query" cols=80 rows="10" /><?php echo file_get_contents(SPARQL_QUERY_SAMPLE); ?></textarea><br/>
 
 <input name="output" value="<?php echo OUTPUT_GVDS_JSON; ?>" type="radio" />Google Viz/JSON (default)
 <input name="output" value="<?php echo OUTPUT_EXHIBIT_JSON; ?>" type="radio" />Exhibit/JSON
 <input name="output" value="<?php echo OUTPUT_SPARQL_JSON; ?>" type="radio" />SPARQL/JSON
 <input name="output" value="<?php echo OUTPUT_SPARQL_XML; ?>" type="radio" />SPARQL/XML
 <input checked="checked" name="output" value="<?php echo OUTPUT_SPARQL_HTML; ?>" type="radio" />HTML
 <input name="output" value="<?php echo OUTPUT_CSV; ?>" type="radio" />CSV
<br/>

 output customization <input name="callback" value="" size="40" /> (callback, for non-google json output,e.g. <i>myfunction</i>)  
<br />
 output customization <input name="tqx" value="" size="40" /> (tqx, for google json output, e.g. <i>version:0.6;reqId:1;responseHandler:myQueryHandler</i>)
<br />

 default graph (url):<input name="default-graph-uri" size="100" value=""  />  <br/>

 SPARQL service (URL) <input name="service-uri" value="<?php echo SPARQL_DB_SERVICE_DEFAULT; ?>" size="60" /> 

 <input value="query" type="submit" /><br />
</form>
</fieldset>


<fieldset>
<legend>Option2: Run SPARQL query (by URI)</legend>
<form Method="GET" Action="<?php echo ME_FILENAME; ?>" >
 SPARQL query (url):<input name="query-uri" size="100" value="<?php echo SPARQL_QUERY_SAMPLE; ?>"  />  <br/>
 
 <input name="output" value="<?php echo OUTPUT_GVDS_JSON; ?>" type="radio" />Google Viz/JSON (default)
 <input name="output" value="<?php echo OUTPUT_EXHIBIT_JSON; ?>" type="radio" />Exhibit/JSON
 <input name="output" value="<?php echo OUTPUT_SPARQL_JSON; ?>" type="radio" />SPARQL/JSON
 <input name="output" value="<?php echo OUTPUT_SPARQL_XML; ?>" type="radio" />SPARQL/XML
 <input checked="checked" name="output" value="<?php echo OUTPUT_SPARQL_HTML; ?>" type="radio" />HTML
 <input name="output" value="<?php echo OUTPUT_CSV; ?>" type="radio" />CSV
<br/>

 output customization <input name="callback" value="" size="40" /> (callback, for non-google json output,e.g. <i>myfunction</i>)  
<br />
 output customization <input name="tqx" value="" size="40" /> (tqx, for google json output, e.g. <i>version:0.6;reqId:1;responseHandler:myQueryHandler</i>)
<br />

 default graph (url):<input name="default-graph-uri" size="100" value=""  />  <br/>
 SPARQL service (URL) <input name="service-uri" value="<?php echo SPARQL_DB_SERVICE_DEFAULT; ?>" size="60" /> 
<br />

 <input value="query" type="submit" /><br />
</form>
</fieldset>

<h3>RESTful Service Interface Description</h3>
Base service URI: &nbsp;http://data-gov.tw.rpi.edu/ws/sparqlproxy<br />
<table style="text-align: left; width: 699px; height: 91px;"
 border="1" cellpadding="2" cellspacing="2">
  <tbody>
    <tr>
      <td style="width: 111px; font-weight: bold;">parameter</td>
      <td style="width: 378px; font-weight: bold;">meaning</td>
    </tr>
    <tr>
      <td style="width: 111px;">query</td>
      <td style="width: 378px;">SPARQL query string</td>
    </tr>
    <tr>
      <td style="width: 111px;">query-uri</td>
      <td style="width: 378px;">URI of SPARQL query</td>
    </tr>
    <tr>
      <td style="width: 111px;">default-graph-uri</td>
      <td style="width: 378px;">URI of default graph (user may skip the use of FROM clause in SPARQL query)</td>
    </tr>
    <tr>
      <td style="width: 111px;">service-uri</td>
      <td style="width: 378px;">URI of SPARQL service, values: 
	<br/> with from clause -  <?php echo SPARQL_SERVICE_DEFAULT; ?>
	<br/> without from clause - <?php echo SPARQL_DB_SERVICE_DEFAULT; ?> </td>
    </tr>
    <tr>
      <td style="width: 111px;">callback</td>
      <td style="width: 378px;">callback function for <i><?php echo OUTPUT_EXHIBIT_JSON .", ". OUTPUT_SPARQL_JSON; ?></i> </td>
    </tr>
    <tr>
      <td style="width: 111px;">output (optional)</td>
      <td style="width: 378px;">the output format, values: <i><?php echo OUTPUT_VALUES;?></></td>
    </tr>
  </tbody>
</table>


<h3>Examples</h3>
<ul>
<li> Given a SPARQL endpoint http://data-gov.tw.rpi.edu/ws/sparql.php
     To convert the result of a SPARQL query (<a href="http://data-gov.tw.rpi.edu/sparql/stat_ten_triples.sparql">list 10 triples</a>) into json for google visulizaiton API,
     
     we use  <a href="http://data-gov.tw.rpi.edu/ws/sparqlproxy.php?query=%23+lists+10+triples+from+default+graph+or+named+graph%0D%0A%0D%0ASELECT+%3Fs+%3Fp+%3Fo+%3Fg+WHERE+{{%3Fs+%3Fp+%3Fo}+UNION+{GRAPH+%3Fg+{%3Fs+%3Fp+%3Fo}}}+limit+10++&output=gvds&service_uri=http%3A%2F%2Fdata-gov.tw.rpi.edu%2Fws%2Fsparql.php">this link</a>,   </li>
<li> Given the SPARQL endpoint  <a href="http://dbpedia.org/sparql">http://dbpedia.org/sparql</a>, we can run a simple query 
<pre>
select ?Concept where {[] a ?Concept} limit 10
</pre>
Here is the <a href="http://data-gov.tw.rpi.edu/ws/sparqlproxy.php?query=select+%3FConcept+where+{[]+a+%3FConcept}+limit+10&output=html&service_uri=http%3A%2F%2Fdbpedia.org%2Fsparql">
query result</a>
</li>

</ul>

<h3>Change Log</h3>
2010-08-06, version 0.24 (Li)
<pre>
* for default sparql service, we can directly pass the query-uri parameter (this is useful for very long sparql queries)
</pre>


2010-03-17, version 0.23 (Li)
<pre>
* add default-graph-uri parameter which was supported by joseki based sparql endpoint
</pre>

2009-12-08, version 0.22 (Li)
<pre>
* add callback function to sparql/json output
* make xslt transformation native function (require libxslt on server side)
</pre>

2009-11-16, version 0.21 (Li)
<pre>
* support google visluziation parameters "tqx" (see http://code.google.com/apis/visualization/documentation/dev/implementing_data_source.html)
* make xslt transformation native function (require libxslt on server side)
</pre>

2009-11-16, version 0.2 (Li)
<pre>
* add callback parameter according to http://code.google.com/p/data-gov-wiki/issues/detail?id=3, only for Exhibit and SPARQL JSON output.
* add CSV output support according to http://code.google.com/p/data-gov-wiki/issues/detail?id=2
* RESTful service changed from sparql_uri to query-uri
* RESTful service change from service_uri to service-uri
</pre>

<h3>Disclaimer</h3>
This service is in experimental status and the interface is subject to change, so please use it with caution and at your own risk.
Please also note that we are monitoring the usage of this service, 
and your service request will be recorded and (maybe publicized), e.g. on <a href="http://twitter.com/search?q=%23sparqlproxy">twitter</a>.
Should you have any concerns, please contact us or post an issue at <a href="http://code.google.com/p/data-gov-wiki/">http://code.google.com/p/data-gov-wiki/</a>  



<hr style="font-family: sans-serif;">
<p><font color="#008000"><i>This page is maintained by <a href="http://www.cs.rpi.edu/~dingl">Li Ding</a>. Page last updated on&nbsp; Oct 22, 2009

</i></font></p>
</body>
</html><?php  
}  



function normalize_name($value){
	$temp = $value;
	$temp = str_replace(' ', '_', trim(preg_replace('/\W+/',' ', $temp )));
	$temp = strtolower($temp);
	if (is_numeric($temp)){
		$temp = "num".$temp;
	}
	return $temp;
}

// get a the value of a key (mix)
function get_param($key, $default=false){
	if (is_array($key)){
		foreach ($key as $onekey){
			$ret = get_param($onekey);
			if ($ret)
				return $ret;
		}
	}else{	
		
		if ($_GET)
			if (array_key_exists($key,$_GET))
				return $_GET[$key];
		if ($_POST)
			if (array_key_exists($key,$_POST))
				return $_POST[$key];	
	}
	
	return $default;
}

function log_query($query, $service_uri, $default_graph_uri, $ip){
	//run twitter
	$filename_user_pass = "/work/data-gov/local/secrete/secrete_twitter1";
	$service_dereference_name = "#" . normalize_name($service_uri);
	$datetime = date("Y-m-d\TH:i:s\Z");
	
	$status = 	$service_dereference_name. " (see ". $service_uri. " ) was probed via #". ME_NAME;
	run_twitter($filename_user_pass, $status);
	
	if (!empty($default_graph_uri)){
		$status = 	$service_dereference_name. " (with data ". $default_graph_uri. " ) was probed via #". ME_NAME;
		run_twitter($filename_user_pass, $status);
	}
	
	$status = 	$service_dereference_name. " (mentioned by http://". $ip. " ) was probed via #sparqlproxy on $". ME_NAME;
	run_twitter($filename_user_pass, $status);
}

function run_twitter ($filename_user_pass,  $status){
	if (file_exists($filename_user_pass)){
		$user_pass = trim(file_get_contents($filename_user_pass));
		exec ("curl -u $user_pass -d \"status=$status\" http://twitter.com/statuses/update.xml" ); 
	}
}


function build_restful_url($url, $params, $debug){
   $url .="?";
   foreach ($params as $key=>$value){
      $url .=  "$key=".encode($value)."&";
   }
  
   if ($debug){
      echo $url;
      if (array_key_exists("query",$params)){
	    echo "<pre>";
    	echo $params["query"];
      	echo "</pre>";
      }
   }
      
   return $url;
}




function process_sparql_json($params, $service_uri, $debug, $callback){
  $url_xml = $service_uri;
  
  $url_xml .= build_restful_url($url, $params, $debug); 

  //$data = file_get_contents($url);

  $ch = curl_init();
  $url_xml .= "&format=application/json";

  curl_setopt($ch,CURLOPT_URL,$url_xml);
  curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);

  $data = curl_exec($ch);
  
  if ($callback){
	echo $callback."($data)";
  }else{
	  echo $data;
  }
  
}

   
   
function process_sparql_xml($params, $service_uri, $debug){
  $url = $service_uri;
  
  $url = build_restful_url($url, $params,$debug); 
 
  header ("Content-Type: application/xml");
  echo file_get_contents($url);
}



function process_sparql_xml2xslt($params, $service_uri, $url_xsl, $debug, $callback=false, $inputparams=false){
  $url = $service_uri;
  $url_xml = build_restful_url($url, $params, $debug); 

  $data = xslt_transform($url_xml, $url_xsl, $inputparams);

  if ($callback){
	echo $callback."($data)";
	return;
  }
  echo $data;
}


function encode($url){
	$url = urlencode($url);
	$pattern = array("%7B","%7D");
	$value = array("{","}");
	str_replace($pattern, $value, $url);
	return $url;
}


function xslt_transform($url_xml,$url_xsl,$params=false){
	# LOAD XML FILE

	$XML = new DOMDocument();
    if(!$XML->load( $url_xml )){
        //Handle error
        
        $ch = curl_init();
        $url_xml .= "&format=application/rdf+xml";

        curl_setopt($ch,CURLOPT_URL,$url_xml);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);

        $errstr = curl_exec($ch);

        customError(1,$errstr);
    }

    //$XML->loadXML($response);

	# LOAD XSL FILE
	$XSL = new DOMDocument();
	$XSL->load( $url_xsl , LIBXML_NOCDATA);

	# START XSLT
	$xslt = new XSLTProcessor();

	
	#load style sheet
	$xslt->importStylesheet( $XSL );
	
	#set params
	$xslt->setParameter("",$params);

	#transform
	$data = $xslt->transformToXML( $XML );
	return $data;
}

?>
