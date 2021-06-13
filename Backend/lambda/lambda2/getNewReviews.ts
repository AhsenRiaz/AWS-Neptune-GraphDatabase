// import * as gremlin from "gremlin";
const gremlin = require("gremlin")


const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER_ENDPOINT
const Order = gremlin.process.order;
const P = gremlin.process.P;
const Coloumn = gremlin.process.column;
const values = gremlin.process.column.values;
const __ = gremlin.process.statics;




const getNewReviews = async (restaurant_name: String) => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try {
        console.log("Event>>>", restaurant_name)
        const data = await g.V().has("Restaurant", "name", restaurant_name).both("about").order().by("created_by").limit(2).toList()
        
        let newReviews = Array()
        for (const v of data){
            let _properties = await g.V(v.id).properties().toList()
        
            let reviews = _properties.reduce((acc , next) => {
                console.log("Reviews" , reviews)
                acc[next.label] = next.value
                return acc
            } , {})
            reviews.id = v.id
            newReviews.push(reviews)   
            console.log("NEW Reviews" , newReviews)
        }
        return newReviews

    }

    catch (err) {
        console.log("There is an error", err)
        return "There is an error " + err
    }

}

export default getNewReviews