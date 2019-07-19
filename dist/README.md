## Aga JSON Datasource For Grafana - IN DEVELOPMENT

It is built on top of simple-json-datasource with allowing more metrics to be defined
as different fields

Your backend needs to implement 4 urls:

 * `/` should return 200 ok. Used for "Test connection" on the datasource config page.
 * `/search` used by the find metric options on the query tab in panels.
 * `/query` should return metrics based on input.
 * `/annotations` should return annotations.
 
Those two urls are optional:

 * `/tag-keys` should return tag keys for ad hoc filters.
 * `/tag-values` should return tag values for ad hoc filters.

## Installation

To install this plugin using just copy dist folder to your grafana plugins folder
Copy the data source you want to `/public/app/plugins/datasource/`. Then restart grafana-server. The new data source should now be available in the data source type dropdown in the Add Data Source View.

### Search API
```

Searching goes in two stages:
- First it is asking you for target lists. This shoudl be list all your metrics that you export
- Once target is selected, then it will ask you all your additional fields/filters for this metric

```

First time it will request with empty target

Example request
``` javascript
{ target: '' }
```

Example response
``` javascript
[ { "text" :"Queue Calls", "value": "queuecalls"}, { "text" :"Agent Calls", "value": "agentcalls"} ]
```


Second time it will ask you for additional metric fields

Example request
``` javascript
{ target: 'queuecalls' }
```

Example response
``` javascript
[ 
  { "name": "queue_filter", "text" :"Choose queue", "value": "", "model" : "dropdown"}, 
  { "name": "agent_filter", "text" :"Choose agent", "value": "", "model" : "dropdown"}, 
  { "name": "callerid_filter", "text" :"Enter Callerid", "value": "", "model" : "input"}, 
  { "name": "talktime_filter", "text" :"Choose agent", "value": "", "model" : "conditioninput"}, 
]
```

For model dropdown it will ask you to return list same as for target list. 
So you will get for each dropdown search request with name associated
"value" field is used as default value or selected one if defined in following list

Example request
``` javascript
{ target: 'queue_filter' }
```

Example response
``` javascript
[ 
  { "text" :"NONE", "value": ""}, 
  { "text" :"Sales", "value": "sales"}, 
  { "text" :"Support", "value": "support"}
]
```



```
### Query API

Example `timeserie` request
``` javascript
{
  "panelId": 1,
  "range": {
    "from": "2016-10-31T06:33:44.866Z",
    "to": "2016-10-31T12:33:44.866Z",
    "raw": {
      "from": "now-6h",
      "to": "now"
    }
  },
  "rangeRaw": {
    "from": "now-6h",
    "to": "now"
  },
  "interval": "30s",
  "intervalMs": 30000,
  "targets": [
     { 
      "target": "upper_50", 
      "refId": "A", 
      "type": "timeserie" 
      "filters": [
        { "name": "queue", "operator": "=", "value": "Sales" },
        { "name": "agent", "operator": "=", "value": "bob" },
        { "name": "talktime", "operator": ">", "value": "10" },
      ]
     },
     { 
      "target": "upper_75", 
      "refId": "A", 
      "type": "timeserie" 
      "filters": [
        { "name": "agent", "operator": "=", "value": "julia" },
      ]
     }
  ],
  "adhocFilters": [{
    "key": "City",
    "operator": "=",
    "value": "Berlin"
  }],
  "format": "json",
  "maxDataPoints": 550
}
```

Example `timeserie` response
``` javascript
[
  {
    "target":"upper_75", // The field being queried for
    "datapoints":[
      [622,1450754160000],  // Metric value as a float , unixtimestamp in milliseconds
      [365,1450754220000]
    ]
  },
  {
    "target":"upper_90",
    "datapoints":[
      [861,1450754160000],
      [767,1450754220000]
    ]
  }
]
```

If the metric selected is `"type": "table"`, an example `table` response:
``` json
[
  {
    "columns":[
      {"text":"Time","type":"time"},
      {"text":"Country","type":"string"},
      {"text":"Number","type":"number"}
    ],
    "rows":[
      [1234567,"SE",123],
      [1234567,"DE",231],
      [1234567,"US",321]
    ],
    "type":"table"
  }
]
```


### Annotation API

The annotation request from the Simple JSON Datasource is a POST request to
the `/annotations` endpoint in your datasource. The JSON request body looks like this:
``` javascript
{
  "range": {
    "from": "2016-04-15T13:44:39.070Z",
    "to": "2016-04-15T14:44:39.070Z"
  },
  "rangeRaw": {
    "from": "now-1h",
    "to": "now"
  },
  "annotation": {
    "name": "deploy",
    "datasource": "Simple JSON Datasource",
    "iconColor": "rgba(255, 96, 96, 1)",
    "enable": true,
    "query": "#deploy"
  }
}
```

Grafana expects a response containing an array of annotation objects in the
following format:

``` javascript
[
  {
    annotation: annotation, // The original annotation sent from Grafana.
    time: time, // Time since UNIX Epoch in milliseconds. (required)
    title: title, // The title for the annotation tooltip. (required)
    tags: tags, // Tags for the annotation. (optional)
    text: text // Text for the annotation. (optional)
  }
]
```

Note: If the datasource is configured to connect directly to the backend, you
also need to implement an OPTIONS endpoint at `/annotations` that responds
with the correct CORS headers:

```
Access-Control-Allow-Headers:accept, content-type
Access-Control-Allow-Methods:POST
Access-Control-Allow-Origin:*
```


### Tag Keys API

Example request
``` javascript
{ }
```

The tag keys api returns:
```javascript
[
    {"type":"string","text":"City"},
    {"type":"string","text":"Country"}
]
```

### Tag Values API

Example request
``` javascript
{"key": "City"}
```

The tag values api returns:
```javascript
[
    {'text': 'Eins!'},
    {'text': 'Zwei'},
    {'text': 'Drei!'}
]
```

### Dev setup

This plugin requires node 6.10.0

```
npm install -g yarn
yarn install
npm run build
```