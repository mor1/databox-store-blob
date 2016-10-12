# databox-store-blob

Databox Store for json data blobs. 

the datastore exposes a http based api on port 8080 withe following end points

    Method: POST
    URL: /data/
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>, vendor_id: <vendor ID>, data: <json blob to store>}
    Notes: The vendor_id and sensor_id must be valid and related entries in the databox directory in order for the data to be accepted
    
    Method: POST
    URL: /data/latest
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>
    Notes: will return the latest data based on the databox wide sensor id
    
    Method: POST
    URL: /data/since
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>, timestamp: <timestamp in ms>}
    Notes: will return the all data since the provided timestamp for the databox wide sensor_id
    
    Method: POST
    URL: /data/range
    Parameters: Raw JSON body containing elements as follows {sensor_id: <sensor ID>, start: <start timestamp>, end: <end timestamp>}
    Notes: will return the data added between start and end based on the databox wide sensor_id
    
#Status

This is work in progress. Expect bugs and api changes.

#Building running

    npm install && npm start

#Testing

	npm install --development 
	npm test
