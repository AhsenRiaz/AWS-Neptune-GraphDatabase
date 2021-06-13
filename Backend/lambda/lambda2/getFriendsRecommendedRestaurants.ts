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

const getFriendsRecommendedRestaurants = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try {

        const data = await g.V().
            has("Person", "name", "Muhammad Ahsen Riaz").
            out("friend").
            out("wrote").
            out("about").
            toList();

        let recommendRestaurants = Array();
        console.log("data>>>", data)

        for (const v of data) {
            let _properties = await g.V(v.id).properties().toList();
            console.log("Properties", _properties)

            let restaurants = _properties.reduce((acc, next) => {
                acc[next.label] = next.value
                return acc
            }, {});

            restaurants.id = v.id
            recommendRestaurants.push(restaurants)
            console.log("recommendedRestaurants", recommendRestaurants)
        }
        return recommendRestaurants

    }

    catch (err) {
        console.log("There is an error", err)
        return "There is an error " + err
    }

}

export default getFriendsRecommendedRestaurants