import * as gremlin from "gremlin";
// const gremlin = require("gremlin")


const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER_ENDPOINT
const Order = gremlin.process.order;
const P = gremlin.process.P;
const Coloumn = gremlin.process.column;
const values = gremlin.process.column.values;
const __ = gremlin.process.statics;


const getHighestByRating = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try {
      const data = await g.V().
      has("Person" , "name" , "Muhammad Ahsen Riaz").
      out("lives").
      in_("within").
      where(__.inE("about")).
      group().
      by(__.identity()).
      by(__.in_('about').values('rating')).
      order().
      by(values , Order.desc).
      limit(2).
      unfold().
      project("name", "address", "rating_average", "cuisine").
      by(__.select(Coloumn.keys).values("name")).
      by(__.select(Coloumn.keys).values("address")).
      by(__.select(Coloumn.values)).
      by(__.select(Coloumn.keys).out("serves").values("name")).toList()


      const listObj = data.map((m:any) => Object.fromEntries(m))
      console.log("ListObj" , listObj)
      return listObj

   
    
    }

    catch (err) {

        console.log("There is an error", err)
        return "There is an error " + err
    }


}

export default getHighestByRating
