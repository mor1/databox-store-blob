[![Build Status](https://travis-ci.org/me-box/databox-store-blob.svg?branch=master)](https://travis-ci.org/me-box/databox-store-blob)

# databox-store-blob

Databox Store for JSON data blobs handles time series and key value data. 

The datastore exposes an HTTP-based API on port 8080 and a WebSocket based API for live data.


#Read API 

###Time series data   
    Method: POST
    URL: /read/ts/<datasourceid>/latest
    Parameters: <datasourceid> the datasourceid to get data for.
    Notes: will return the latest data based on the datasourceid 
    
    Method: POST
    URL: /read/ts/<datasourceid>/since
    Parameters: <datasourceid> the datasourceid to get data for.
    Post data: Raw JSON body containing elements as follows {timestamp: <timestamp in ms>}
    Notes: will return the all data since the provided timestamp for the databox wide sensor_id
    
    Method: POST
    URL: /read/ts/<datasourceid>/range
    Parameters: <datasourceid> the datasourceid to get data for.
    Post data:  Raw JSON body containing elements as follows {start: <start timestamp>, end: <end timestamp>}
    Notes: will return the all data since the provided timestamp for the databox wide sensor_id
    
###Key value pairs

    Method: GET
    URL: /read/key/<key>
    Parameters: replace <key> with document key 
    Notes: will return the data stored with that key. Returns an empty array 404 {status:404,error:"Document not found."} if no data is stored

###Websockets 

Connect to a websocket client to port 8080. Then subscribe for data using: 

    For time serries:  

    Method: GET
    URL: /sub/ts/<datasourceid>
    Parameters: replace <datasourceid> with datasourceid 
    Notes: Will broadcast over the websocket the data stored by datasourceid when data is added. 

    
    For key value:  

    Method: GET
    URL: /sub/key/<key>
    Parameters: replace <key> with document key 
    Notes:  Will broadcast over the websocket the data stored with that key when it is add or updated. 

#Write API

###Managing the data source catalog
    Method: POST
    URL: /cat/add/<datasourceid> 
    Parameters: Raw JSON body containing elements as follows {vendor: <vendor name>, unit: <measurement unit>, location: <datasource location>, description:<human readable description>}
    Notes: This data is used to populate the Items in the Hypercat catalog. The datasourceid is managed by the driver and must be unique to this store. 
    
###Time series data
    Method: POST
    URL: /write/ts/<datasourceid>
    Parameters: Raw JSON body containing elements as follows {data: <json blob to store>}
    Notes: Stores a value a timestamp is added on insertion
    
###Key value pairs

    Method: POST
    URL: /write/key/<key>
    Parameters: Raw JSON body containing elements as follows {<data to be stored in JSON format>}
    Notes: will insert if the <key> is not in the database and update the document if it is.


#Websockets 

Not available for writing

#Arbiter Facing

###The data source catalog

    Method: GET
    URL: /cat
    Parameters: none
    Notes: will return the latest data source cataloge in Hypercat format. 
    
#Status

This is beta. Expect bugs but the API should be reasonably stable.

#Building running

    npm install && npm start

#Developing

Start the container manger in developer mode:

    DATABOX_DEV=1 npm start

Clone the repo and make your changes. To build a new databox image and push it to you local registery:

    npm run build && npm run deploy

Then restart the container manger to use you updated version. 

#Testing

    npm install --development 
    npm test
