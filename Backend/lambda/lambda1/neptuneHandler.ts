// const gremlin = require("gremlin")
import * as gremlin from "gremlin"
import * as faker from "faker"
import { EventBridgeEvent, Context } from "aws-lambda"
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.WRITER_ENDPOINT



exports.handler = async (event: EventBridgeEvent<string, any>, context: Context) => {



    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try {

        console.log("appsync event", event.detail)
        console.log("appsync event detail type", event["detail-type"])
        // Add Person
        if (event["detail-type"] === "addPerson") {

            return await g.addV("Person").
                property("name", event.detail.name).
                property("city", event.detail.city).
                as("P").
                V().has("City" , "name" , "Karachi").
                as("K").
                addE("lives").from_("P").to("K").next()
        }

        else if(event["detail-type"] === "clearGraph"){
            await g.V().drop().next()
        }

        else if (event["detail-type"] === "deleteVertices") {
            return await g.V().hasLabel(event.detail.label).drop().next()

        }

        else if (event["detail-type"] === "addFriend") {


            const edge = await g.addV("Friend").
                property("name", event.detail.name).
                property("city", event.detail.city).
                as("X").V().
                has("Person", "name", "Muhammad Ahsen Riaz").
                as("Y").
                addE("friend").
                from_("Y").
                to("X").V().has("City", "name", "Karachi").as("C").addE("lives").from_("X").to("C").next()
            console.log("edge>>>>", JSON.stringify(edge))

        }

        else if (event["detail-type"] === "addFriendOfFriend") {

            const friendOfFriend = await g.addV("Friend").
                property("name", event.detail.name).
                as("X").
                V().
                has("Friend", "name", event.detail.friendName).
                as("Y").
                addE("friend").
                from_("Y").
                to("X").
                next()
            console.log("friendOfFriend", JSON.stringify(friendOfFriend))
        }

        else if (event["detail-type"] === "addRestaurant") {
            const restaurant = await g.addV("Restaurant").
                property("name", event.detail.name).
                property("restaurant_id", faker.datatype.number(3)).
                property("address", faker.address.streetAddress()).
                as("restaurant").V().has("City", "name", "Karachi").
                as("city").
                addE("within").
                from_("restaurant").to("city").
                next()

            const serve = await g.addV("Cuisine").property("name", event.detail.cuisine).
            as("csn").V().has("Restaurant", "name", event.detail.name).
            as("res").addE("serves").
            from_("res").to("csn").
            next()

            console.log("Restaurant>>>", JSON.stringify(restaurant))
            console.log("Serve>>>", JSON.stringify(serve))
        }

        else if (event["detail-type"] === "addReview") {
            const review = await g.addV("Review").property("rating", event.detail.rating).
                property("customerName", event.detail.nameOfCustomer).
                property("body", event.detail.body).
                property("created_by", faker.date.recent()).
                as("rev").
                V().has("Restaurant", "name", event.detail.restaurant_name).as("res").
                addE("about").from_("rev").
                to("res").
                V().has("Friend", "name", event.detail.nameOfCustomer).as("fnd").
                addE("wrote").
                from_("fnd").to("rev").
                next()

            console.log("Reviews>>", JSON.stringify(review));
        }

        else if(event["detail-type"] === "addReviewOfReviews"){
            const reviewOfReviews = await g.addV("Review_Rating").
            property("rating",event.detail.rating).
            property("review_date", faker.date.past()).
            as("rr").V().has("Friend" , "name" , event.detail.name).
            as("fnd").addE("assigned").from_("fnd").to("rr").V().
            has("Review" , "review_id" , event.detail.review_id).as("r").
            addE("about").from_("rr").to("r").next()

            console.log("ReviewOfReviews" , JSON.stringify(reviewOfReviews));
        }

        else if (event["detail-type"] === "addCity") {
            const city = await g.addV("City").property("name", event.detail.name).next()
            console.log("city>>>", JSON.stringify(city))
        }

        else if (event["detail-type"] === "addState") {
            const state = await g.addV("State").property("name", event.detail.name).next()
            console.log("state>>>", JSON.stringify(state))
        }

        else if (event["detail-type"] === "addCuisine") {
            const cuisine = await g.addV("Cuisine").property("name", event.detail.name).next()
            console.log("Cuisine>>>", JSON.stringify(cuisine))
        }
    }

    catch (err) {
        console.log("there is an error", err)
        return err
    }

}