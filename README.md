# databox-store-blob

Databox Store for JSON data blobs. 

The datastore exposes an HTTP-based API on port 8080 and a WebSocket based API for live data.

#HTTP API

##Time series data (NOTE this may move to /ts after mozfest)
    Method: POST
    URL: /api/data/
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>, vendor_id: <vendor ID>, data: <json blob to store>}
    Notes: The vendor_id and sensor_id must be valid and related entries in the databox directory in order for the data to be accepted
    
    Method: POST
    URL: /api/data/latest
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>
    Notes: will return the latest data based on the databox wide sensor id
    
    Method: POST
    URL: /api/data/since
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>, timestamp: <timestamp in ms>}
    Notes: will return the all data since the provided timestamp for the databox wide sensor_id
    
    Method: POST
    URL: /api/data/range
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>, start: <start timestamp>, end: <end timestamp>}
    Notes: will return the data added between start and end based on the databox wide sensor_id

##Key value pairs

    Method: GET
    URL: /api/key/<key>
    Parameters: replace <key> with documant key 
    Notes: will return the data stored with that key. Returns an empty array \[\] if no data is stored

    Method: POST
    URL: /api/key/<key>
    Parameters: Raw JSON body containing elements as follows {data: <data to be stored in JSON fomat>}
    Notes: will insert if the <key> is not in the database and update the document if it is.


#Websockets 

Connect to a websocket client to port 8080. Send a message of the form 

     {sensor_id: [sendor data]} /for timeseries store
     
OR
     
     {key: [value data]} /for key value store
     
Data from that sensor will then be broadcast over the connection. This feature will develop and will support authentication and more in future.

#Status

This is work in progress. Expect bugs and API changes.

#Building running

    npm install && npm start

#Testing

    npm install --development 
    npm test
