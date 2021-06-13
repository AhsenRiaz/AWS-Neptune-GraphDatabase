const gremlin = require("gremlin")
// import * as gremlin from "gremlin"

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER_ENDPOINT

const getFriends = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try {
        let data = await g.V().has("Person","name" ,"Muhammad Ahsen Riaz").out().toList();
        console.log("data>>>" , JSON.stringify(data))
        let friends = Array()
        for (const v of data){
            let _properties = await g.V(v.id).properties().toList()
            let friend = _properties.reduce((acc , next) => {
                acc[next.label] = next.value
                return acc
            } , {})
            friend.id = v.id
            friends.push(friend)   
        }
        return friends
        
    }

    catch(err){
        console.log("err" , err)
        return {
            err : "This is the" + err
        }
    }

}

export default getFriends