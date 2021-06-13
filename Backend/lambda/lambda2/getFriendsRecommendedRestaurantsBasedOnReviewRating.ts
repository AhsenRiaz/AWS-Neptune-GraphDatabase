import * as gremlin from "gremlin";
// const gremlin = require("gremlin")

declare global {
    interface ObjectConstructor {
      fromEntries(xs: [string|number|symbol, any][]): object
    }
  }

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER_ENDPOINT
const Order = gremlin.process.order;
const P = gremlin.process.P;
const Coloumn = gremlin.process.column;
const values = gremlin.process.column.values;
const __ = gremlin.process.statics;

const getFriendsRecommendedRestaurantsBasedOnReviewRating = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try {

        const data = await g.V().has("Person" , "name" , "Muhammad Ahsen Riaz").
        out("lives").in_("lives").where(__.outE("wrote")).out("wrote").out("about").
        where(__.out("within").has("City" , "name" , "Karachi")).
        where(__.in_("about")).group().by(__.identity()).by(__.in_("about").values("rating")).
        unfold().order().by(values , Order.desc).limit(3).
        project("name" , "address" , "review_rating").
        by(__.select(Coloumn.keys).values("name")).
        by(__.select(Coloumn.keys).values("address")).
        by(__.select(Coloumn.values)).toList()

        console.log("data>>>" , JSON.stringify(data))
        console.log("dataValue" , data)

       const listObj = data.map((m:any) => Object.fromEntries(m))
       console.log("ListObj" , listObj)
       return listObj
    }

    catch(err){
        console.log("There is an error", err)
        return "There is an error " + err
    }

}

export default getFriendsRecommendedRestaurantsBasedOnReviewRating