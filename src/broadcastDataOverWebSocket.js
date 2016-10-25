

module.exports = function (app) {

    var connectionsBySensorId = {};
    var connectionsByKey = {};

    app.wss.on('connection', function connection(ws) {
    
        //TODO Macaroon check 
    
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            //TODO define msg format 
            try {
                var msg = JSON.parse(message);
                console.log(msg);
                //TODO Check For Macaroon  
                
                if('sensor_id' in msg) {
                    //TODO Use Macaroon to ensure app can access sensor id 

                    var sensor_id = msg.sensor_id;
                    if(!(msg.sensor_id in connectionsBySensorId)) {
                        connectionsBySensorId[sensor_id] = [];
                    } 
                    connectionsBySensorId[sensor_id].push(ws);
                    ws.send('Registered for messages for sensor_id:' + sensor_id);
                } else if ('key' in msg) {
                    //TODO Use Macaroon to ensure app can access data 
                    var key = msg.key;
                    if(!(msg.key in connectionsByKey)) {
                        connectionsByKey[key] = [];
                    } 
                    connectionsByKey[key].push(ws);
                } else {
                    ws.send('Missing sensor_id or key');
                }
            } catch (e) {
                ws.send('Invalid message format', e.toString());
            }
        });
        
        ws.send('ack');
    });

    return function broadcastDataOverWebSocket(id, data, streamType) {
        
        if(streamType == 'ts' && id in connectionsBySensorId) {
            connectionsBySensorId[id].map((val,ind,arr)=>{
                val.send(JSON.stringify(data));
            });
        }

        if(streamType == 'kv' && id in connectionsByKey) {
            connectionsByKey[id].map((val,ind,arr)=>{
                val.send(JSON.stringify(data));
            });
        }
    };
}